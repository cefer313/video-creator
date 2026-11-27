#!/usr/bin/env python3
"""Filmin bütün səsi -> public/mix.wav (48 kHz stereo).
Replikalar (public/voice/*.wav) timeline.json-dakı vaxtlarda yerləşdirilir; musiqi və səs effektləri numpy ilə sintez olunur
(heç bir xarici səs faylı yoxdur, lisenziya problemi yoxdur). Musiqi danışıq zamanı avtomatik alçalır."""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
TLJ = json.load(open(os.path.join(ROOT, 'src', 'timeline.json'), encoding='utf8'))
FPS = TLJ['fps']
TOTAL = TLJ['total'] / FPS + 0.2
N = int(TOTAL * SR)
rng = np.random.default_rng(7)
L = {l['id']: l for l in TLJ['lines']}
EV = TLJ['events']
P = TLJ['parts']
sec = lambda fr: fr / FPS


def read(path):
    with wave.open(path, 'rb') as w:
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
        if w.getnchannels() == 2:
            x = x.reshape(-1, 2).mean(1)
    return x


def put(buf, x, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= len(buf):
        return
    x = x[: len(buf) - i]
    lg = gain * np.cos((pan + 1) * np.pi / 4)
    rg = gain * np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * lg
    buf[i:i + len(x), 1] += x * rg


def env_ad(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(d, 1e-4))


def bandnoise(n, lo, hi):
    x = rng.standard_normal(n)
    X = np.fft.rfft(x)
    fr = np.fft.rfftfreq(n, 1 / SR)
    X[(fr < lo) | (fr > hi)] = 0
    y = np.fft.irfft(X, n)
    return y / (np.abs(y).max() + 1e-9)


def note(f, dur, kind='pluck'):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = np.zeros(n)
    if kind == 'pluck':
        for h in range(1, 7):
            y += (1 / h ** 1.3) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (6 + 5 * h))
        y *= np.minimum(1, t / 0.003)
    elif kind == 'bass':
        for h in range(1, 5):
            y += (1 / h ** 1.6) * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (5 + 3 * h))
        y *= np.minimum(1, t / 0.004)
    elif kind == 'bell':
        for h, a in ((1, 1), (2.76, 0.4), (5.4, 0.2), (8.9, 0.1)):
            y += a * np.sin(2 * np.pi * f * h * t) * np.exp(-t * (2.5 + h))
        y *= np.minimum(1, t / 0.002)
    elif kind == 'pad':
        for d in (-0.35, 0.0, 0.4):
            for h in range(1, 6):
                y += (0.55 / h ** 1.8) * np.sin(2 * np.pi * (f + d) * h * t + h)
        att, rel = 0.7, 1.1
        e = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (dur - t) / rel))
        y *= e * 0.33
    return y


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def nm(s):
    name, octv = s[:-1], int(s[-1])
    return mtof(12 * (octv + 1) + NOTE[name])


def reverb(x, secs=1.6, wet=0.22):
    n = int(secs * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 4.0)
    ir[0] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    out = np.zeros_like(x)
    m = len(x[:, 0]) + n
    size = 1 << int(np.ceil(np.log2(m)))
    IR = np.fft.rfft(ir, size)
    for c in range(2):
        y = np.fft.irfft(np.fft.rfft(x[:, c], size) * IR, size)[: len(x)]
        out[:, c] = x[:, c] + wet * y
    return out


voice = np.zeros((N, 2))
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))

# ---------- replikalar ----------
PAN = {'tural': -0.18, 'kenan': 0.18, 'narrator': 0.0}
for l in TLJ['lines']:
    x = read(os.path.join(ROOT, 'public', 'voice', f"{l['id']}.wav"))
    put(voice, x, l['startSec'], 1.0, PAN[l['who']])

# ---------- musiqi A: "gizli" pizzicato (yanlış adət) ----------
z = sec(EV['freeze'])
beat = 60 / 112
bars = [('D2', ['D4', None, 'F4', None, 'A4', None, 'G4', 'F4']),
        ('D2', ['E4', None, 'G4', None, 'A4', None, None, None]),
        ('Bb1', ['D4', None, 'F4', None, 'Bb4', None, 'A4', 'G4']),
        ('A1', ['A4', None, 'C#5', None, 'E5', None, None, None])]
t = 0.0
k = 0
while t < z - 0.05:
    bass, mel = bars[k % 4]
    for b in range(4):
        tb = t + b * beat
        if tb < z:
            put(music, note(nm(bass) * (1.5 if b % 2 else 1), 0.5, 'bass'), tb, 0.30, -0.1)
            put(music, note(1800, 0.05, 'pluck') * 0.5, tb + beat / 2, 0.035, 0.3)
    for e, m in enumerate(mel):
        te = t + e * beat / 2
        if m and te < z - 0.02:
            put(music, note(nm(m), 0.35, 'pluck'), te, 0.15, 0.15)
    t += 4 * beat
    k += 1

# ---------- musiqi B: sakit fon (izah) ----------
x0, x1 = sec(P['explain'][0]) + 0.5, sec(P['rewind'][0])
chords = [['D3', 'F3', 'A3'], ['Bb2', 'D3', 'F3'], ['F3', 'A3', 'C4'], ['C3', 'E3', 'G3']]
cd = 3.3
i = 0
t = x0
while t < x1:
    d = min(cd + 1.2, x1 - t + 0.6)
    for m in chords[i % 4]:
        put(music, note(nm(m), d, 'pad'), t, 0.22, 0)
    for j, m in enumerate(chords[i % 4] * 2):
        tj = t + 0.4 + j * 0.41
        if tj < x1 - 0.3:
            put(music, note(nm(m) * 2, 0.9, 'pluck'), tj, 0.05, (-0.3 if j % 2 else 0.3))
    t += cd
    i += 1

# ---------- musiqi C: isti, ümidli (düz variant və son) ----------
c0 = sec(P['correct'][0]) + 0.2
end = TOTAL - 0.2
beat = 60 / 100
prog = [('F2', ['F3', 'A3', 'C4']), ('C2', ['C3', 'E3', 'G3']), ('D2', ['D3', 'F3', 'A3']), ('Bb1', ['Bb2', 'D3', 'F3'])]
t = c0
k = 0
ec = sec(EV['endCard'])
while t < end - 0.6:
    bass, ch = prog[k % 4]
    for b in (0, 2):
        put(music, note(nm(bass), 0.7, 'bass'), t + b * beat, 0.26, -0.1)
    for m in ch:
        put(music, note(nm(m), 4 * beat + 0.8, 'pad'), t, 0.16, 0)
    arp = [ch[0], ch[1], ch[2], ch[1]] * 2
    for e, m in enumerate(arp):
        te = t + e * beat / 2
        g = 0.07 if te < ec else 0.11
        put(music, note(nm(m) * 2, 0.5, 'pluck'), te, g, 0.2 if e % 2 else -0.2)
    t += 4 * beat
    k += 1
for m in ['F3', 'A3', 'C4', 'F4']:
    put(music, note(nm(m), 2.2, 'pad'), end - 2.0, 0.2, 0)

# ---------- səs effektləri ----------
def crack():
    n = int(0.05 * SR)
    a = bandnoise(n, 2500, 7000) * env_ad(n, 0.001, 0.006)
    b = np.roll(bandnoise(n, 1800, 5000) * env_ad(n, 0.001, 0.005), int(0.028 * SR)) * 0.6
    return a + b

for b in TLJ['bites']:
    put(sfx, crack(), sec(b['at'] + 10), 0.32, -0.2 if b['who'] == 'tural' else 0.2)

# telefon: vibrasiya + zəng melodiyası
r0, r1 = sec(EV['ring'][0]), sec(L['t05']['start']) - 0.05
n = int((r1 - r0) * SR)
tt = np.arange(n) / SR
gate = ((np.floor(tt * FPS) % 12) < 7).astype(float)
buzz = np.sign(np.sin(2 * np.pi * 165 * tt)) * 0.5 + np.sin(2 * np.pi * 330 * tt) * 0.3
put(sfx, buzz * gate * 0.5, r0, 0.18, -0.15)
for j, m in enumerate(['E5', 'G5', 'B5', 'E6', 'B5', 'G5', 'E5', 'G5', 'B5', 'E6']):
    tj = r0 + 0.05 + j * 0.125
    if tj < r1 - 0.05:
        put(sfx, note(nm(m), 0.3, 'bell'), tj, 0.14, -0.15)
put(sfx, bandnoise(int(0.03 * SR), 1500, 6000) * env_ad(int(0.03 * SR), 0.001, 0.008), r1, 0.25, -0.15)

# öskürək
def cough_burst():
    n = int(0.26 * SR)
    tt = np.arange(n) / SR
    noise = bandnoise(n, 350, 3200)
    voiced = np.sign(np.sin(2 * np.pi * 170 * tt + 3 * np.sin(2 * np.pi * 9 * tt))) * 0.35
    vb = np.fft.irfft(np.fft.rfft(voiced) * (np.fft.rfftfreq(n, 1 / SR) < 1800), n)
    return (noise * 0.8 + vb) * env_ad(n, 0.008, 0.07)

cg0 = EV['cough'][0]
for k in range(4):
    put(sfx, cough_burst(), sec(cg0 + 2 + 8.4 * k), 0.42 * (1 - 0.12 * k), 0.22)

# donma: plastinka cızıltısı + zərbə
fz = sec(EV['freeze'])
n = int(0.45 * SR)
tt = np.arange(n) / SR
sweep = np.sin(2 * np.pi * np.cumsum(900 * np.exp(-tt * 7) + 120) / SR)
scr = (bandnoise(n, 600, 4000) * 0.6 + sweep * 0.5) * env_ad(n, 0.004, 0.16)
put(sfx, scr, fz - 0.05, 0.55, 0)
n = int(0.7 * SR)
tt = np.arange(n) / SR
boom = np.sin(2 * np.pi * (55 + 40 * np.exp(-tt * 18)) * tt) * env_ad(n, 0.003, 0.22)
put(sfx, boom, fz + 0.07, 0.6, 0)

# izah kartlarının çıxışı: yumşaq "pop" və "svuş"
def pop():
    n = int(0.09 * SR)
    tt = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(620 * np.exp(-tt * 25) + 240) / SR) * env_ad(n, 0.002, 0.03)

def swish(d=0.22):
    n = int(d * SR)
    tt = np.arange(n) / SR
    return bandnoise(n, 1500, 9000) * np.sin(np.pi * tt / d) ** 2

def at(lid, fr):
    l = L[lid]
    return sec(l['start'] + round((l['end'] - l['start']) * fr))

pops = [sec(L['n01']['start']), at('n01', 0.12), at('n01', 0.8)] + [at('n02', 0.02 + i * 0.12) for i in range(3)] + \
       [at('n02', 0.62)] + [at('n03', 0.05 + i * 0.16) for i in range(3)] + [at('n03', 0.62), at('n04', 0.0), at('n04', 0.42)]
for p in pops:
    put(sfx, pop(), p, 0.22, 0)
for i in range(3):
    put(sfx, swish(0.18), at('n02', 0.5 + i * 0.05), 0.12, (i - 1) * 0.3)
put(sfx, swish(0.3), sec(EV['ring'][0] + 12), 0.1, 0)

# geri sarma: lent səsi
q0, q1 = sec(P['rewind'][0]), sec(P['rewind'][1])
n = int((q1 - q0) * SR)
tt = np.arange(n) / SR
fq = 220 + 1500 * (tt / tt[-1]) ** 0.7 + 60 * np.sin(2 * np.pi * 13 * tt)
tape = (np.sin(2 * np.pi * np.cumsum(fq) / SR) * 0.35 + bandnoise(n, 800, 6000) * 0.25) * np.minimum(1, tt / 0.05) * np.minimum(1, (tt[-1] - tt) / 0.05 + 0.01)
put(sfx, tape, q0, 0.35, 0)
put(sfx, note(90, 0.25, 'bass'), q1, 0.5, 0)

# "Belə olmalıdır" və son kart: zınqırov
for t0, ms in ((sec(P['correct'][0]) + 0.1, ['C6', 'E6']), (sec(EV['endCard']) + 0.1, ['F5', 'A5', 'C6'])):
    for j, m in enumerate(ms):
        put(sfx, note(nm(m), 1.2, 'bell'), t0 + j * 0.07, 0.12, 0)

# nömrə yığma: iki toxunuş + gözləmə siqnalı (425 Hz)
d0, d1 = sec(EV['dial'][0]), sec(L['t07']['start'])
for k in range(2):
    put(sfx, bandnoise(int(0.02 * SR), 2000, 6000) * env_ad(int(0.02 * SR), 0.001, 0.005), d0 + 0.12 + k * 0.16, 0.2, -0.15)
n = int(max(0.1, min(0.8, d1 - d0 - 0.55)) * SR)
tt = np.arange(n) / SR
put(sfx, np.sin(2 * np.pi * 425 * tt) * np.minimum(1, tt / 0.01) * np.minimum(1, (tt[-1] - tt) / 0.01), d0 + 0.5, 0.08, -0.15)

# ---------- miks ----------
vad = np.abs(voice).sum(1)
k = int(0.03 * SR)
vad = np.convolve(vad, np.ones(k) / k, 'same')
vad = np.clip(vad / 0.05, 0, 1)
sm = np.zeros_like(vad)
a_up, a_dn = 1 - np.exp(-1 / (0.05 * SR)), 1 - np.exp(-1 / (0.35 * SR))
y = 0.0
step = 48
for i in range(0, len(vad), step):
    v = vad[i]
    y += (v - y) * (1 - (1 - (a_up if v > y else a_dn)) ** step)
    sm[i:i + step] = y
duck = 1 - 0.62 * sm
music *= duck[:, None]
music = reverb(music, 1.8, 0.3)
voice_sk = reverb(voice, 0.35, 0.04)
mix = voice_sk + music * 0.9 + sfx
peak = np.abs(mix).max()
mix = np.tanh(mix / peak * 1.15) / np.tanh(1.15) * 0.89
with wave.open(os.path.join(ROOT, 'public', 'mix.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
print('public/mix.wav', round(len(mix) / SR, 2), 'san')
