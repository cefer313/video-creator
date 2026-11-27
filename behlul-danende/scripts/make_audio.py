#!/usr/bin/env python3
"""Musiqi, səs effektləri və diktor səslərini bir faylda qarışdırır -> public/mix.wav (48 kHz stereo).
Hər şey numpy ilə sintez olunur (lisenziya problemi yoxdur). Vaxtlar src/timeline.json-dan götürülür,
effektlərin yerləri src/Film.tsx-dakı səhnə qaydalarına uyğundur."""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
FPS = 30
rng = np.random.default_rng(7)
TL = json.load(open(os.path.join(ROOT, 'src/timeline.json'), encoding='utf8'))
N = int((TL['total'] / FPS + 0.5) * SR)
L = {l['id']: l for l in TL['lines']}


def sec(fr):
    return fr / FPS


def read_wav(p):
    with wave.open(p, 'rb') as w:
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
        sr = w.getframerate()
    assert sr == SR, sr
    return x


def add(buf, x, t, g=1.0):
    i = int(t * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    a = max(0, -i)
    j = min(len(buf), i + len(x))
    buf[max(0, i):j] += x[a:a + j - max(0, i)] * g


def env_ad(n, a=0.005, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


# ---------- səs effektləri ----------
def pluck(freq, dur=0.6, bright=0.5):
    """Karplus-Strong simi (ud/saz kimi)."""
    n = int(dur * SR)
    p = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, p).astype(np.float32)
    out = np.zeros(n, np.float32)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = (buf[i % p] * bright + buf[(i + 1) % p] * (1 - bright)) * 0.996
    return out * np.minimum(1, np.arange(n) / (0.002 * SR))


def drum(kind):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    if kind == 'dum':
        f = 70 + 60 * np.exp(-t * 30)
        return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)).astype(np.float32)
    x = rng.uniform(-1, 1, n) * np.exp(-t * 40)
    return (np.convolve(x, np.ones(6) / 6, 'same') * 0.6 + np.sin(2 * np.pi * 420 * t) * np.exp(-t * 30) * 0.4).astype(np.float32)


def woodblock(f=900):
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * np.exp(-t * 60) + np.sin(2 * np.pi * f * 1.6 * t) * np.exp(-t * 80) * 0.4).astype(np.float32)


def whoosh(d=0.35, up=True):
    n = int(d * SR)
    x = rng.normal(0, 1, n).astype(np.float32)
    t = np.linspace(0, 1, n)
    e = np.sin(np.pi * t) ** 2
    k = 40
    y = np.convolve(x, np.ones(k) / k, 'same') * e
    return (y / (np.abs(y).max() + 1e-6)).astype(np.float32)


def pop(f=520):
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    fr = f + 900 * np.exp(-t * 40)
    return (np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.exp(-t * 28)).astype(np.float32)


def chime(base=1318):
    n = int(1.4 * SR)
    t = np.arange(n) / SR
    y = np.zeros(n, np.float32)
    for k, fm in enumerate([1, 1.5, 2, 2.5, 3]):
        st = int(k * 0.06 * SR)
        tt = t[: n - st]
        y[st:] += np.sin(2 * np.pi * base * fm * tt) * np.exp(-tt * 3.5) * (0.6 / (k + 1))
    return y


def thud():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    f = 55 + 90 * np.exp(-t * 25)
    y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12)
    y += rng.normal(0, 1, n) * np.exp(-t * 50) * 0.3
    return y.astype(np.float32)


def bonk():
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    f = 300 * np.exp(-t * 6)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14)).astype(np.float32)


def boing():
    n = int(0.6 * SR)
    t = np.arange(n) / SR
    f = 180 + 260 * t / 0.6 + 40 * np.sin(2 * np.pi * 14 * t)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 4)).astype(np.float32)


def sand(d=1.0):
    n = int(d * SR)
    x = rng.normal(0, 1, n).astype(np.float32)
    x = x - np.convolve(x, np.ones(8) / 8, 'same')
    t = np.linspace(0, 1, n)
    return x * np.sin(np.pi * t) ** 1.5


def stinger():
    """Keşikçilər girəndə «dan-dan!» akkordu."""
    y = np.zeros(int(1.0 * SR), np.float32)
    for f in [110, 164.8, 220, 233.1]:
        p = pluck(f, 1.0, 0.3)
        y[: len(p)] += p
    return y


# ---------- musiqi ----------
HIJAZ = [146.83, 155.56, 185.0, 196.0, 220.0, 233.08, 261.63, 293.66]  # D hicaz


def music_playful(t0, t1):
    """Oynaq hissə: ud kimi simli arpejio + qavalda dum-tek, 104 bpm."""
    y = np.zeros(int((t1 - t0) * SR) + SR, np.float32)
    beat = 60 / 104
    pat = [0, 2, 4, 3, 2, 4, 5, 4, 3, 1, 2, 0, 2, 4, 6, 4]
    k = 0
    t = 0.0
    while t < t1 - t0:
        f = HIJAZ[pat[k % len(pat)]] * (2 if k % 8 == 6 else 1)
        add(y, pluck(f, 0.5, 0.55) * 0.55, t)
        if k % 4 == 0:
            add(y, drum('dum') * 0.7, t)
        if k % 4 == 2:
            add(y, drum('tek') * 0.45, t)
        if k % 4 == 3:
            add(y, drum('tek') * 0.3, t)
        k += 1
        t += beat / 2
    return y


def music_sad(t0, t1):
    """Kədərli hissə: ney kimi yumşaq tonlar və dron."""
    n = int((t1 - t0) * SR)
    t = np.arange(n) / SR
    y = (np.sin(2 * np.pi * 73.4 * t) * 0.35 + np.sin(2 * np.pi * 110 * t) * 0.2) * np.minimum(1, t / 2)
    mel = [4, 3, 2, 1, 2, 3, 1, 0]
    step = 2.2
    for k, m in enumerate(mel * 4):
        st = k * step
        if st > t1 - t0:
            break
        nn = int(step * 1.2 * SR)
        tt = np.arange(nn) / SR
        f = HIJAZ[m] * 2
        vib = 1 + 0.006 * np.sin(2 * np.pi * 5 * tt)
        tone = np.sin(2 * np.pi * np.cumsum(f * vib) / SR) + 0.25 * np.sin(4 * np.pi * np.cumsum(f * vib) / SR)
        tone += rng.normal(0, 0.05, nn)
        e = np.minimum(1, tt / 0.35) * np.minimum(1, (step * 1.2 - tt) / 0.5)
        add(y, (tone * e * 0.28).astype(np.float32), st)
    return y.astype(np.float32)


def music_warm(t0, t1):
    n = int((t1 - t0) * SR)
    t = np.arange(n) / SR
    y = np.zeros(n, np.float32)
    for f in [146.83, 220.0, 293.66]:
        y += (np.sin(2 * np.pi * f * t) * 0.15).astype(np.float32)
    y *= np.minimum(1, t / 1.5)
    beat = 60 / 90
    seq = [2, 4, 7, 4, 3, 4, 7, 6]
    k = 0
    while k * beat < t1 - t0:
        add(y, pluck(HIJAZ[seq[k % 8]] * 2, 0.8, 0.5) * 0.4, k * beat)
        k += 1
    return y


def main():
    voice = np.zeros(N, np.float32)
    for l in TL['lines']:
        add(voice, read_wav(os.path.join(ROOT, 'public/voice', l['id'] + '.wav')), sec(l['voiceAt']))

    # musiqi hissələri
    mus = np.zeros(N, np.float32)
    tA, tB, tC = 0, sec(L['l07']['start']), sec(L['l15']['start'])
    a = music_playful(tA, tB + 0.6)
    a[-int(0.6 * SR):] *= np.linspace(1, 0, int(0.6 * SR))
    add(mus, a, tA)
    add(mus, music_sad(tB, tC + 0.8), tB)
    add(mus, music_warm(tC, N / SR), tC)
    mus *= 0.25

    # diktor danışanda musiqini endir
    venv = np.convolve(np.abs(voice), np.ones(SR // 10) / (SR // 10), 'same')
    duck = 1 - 0.55 * np.clip(venv / 0.02, 0, 1)
    duck = np.convolve(duck, np.ones(SR // 8) / (SR // 8), 'same')
    mus *= duck

    sfx = np.zeros(N, np.float32)
    # hər kəsikdə yüngül vıyıltı
    for l in TL['lines'][1:]:
        add(sfx, whoosh(0.3) * 0.12, sec(l['start']) - 0.12)
    # l00: parıltı
    add(sfx, chime(1568) * 0.25, 0.2)
    # l01: çubuq atın taqqıltısı, lövhə yanır
    l = L['l01']
    dur = l['end'] - l['start']
    for fr in range(0, int(dur * 0.62), 6):
        add(sfx, woodblock(820 if (fr // 6) % 2 else 1040) * 0.35, sec(l['start'] + fr))
    lit = sec(l['voiceAt'] + l['words'][1])
    add(sfx, chime(1318) * 0.4, lit)
    add(sfx, pop(420) * 0.4, lit)
    # l04: tullanma və taxta düşmə
    l = L['l04']
    add(sfx, boing() * 0.35, sec(l['start']))
    add(sfx, thud() * 0.4, sec(l['start'] + 20))
    add(sfx, chime(1760) * 0.2, sec(l['start'] + 22))
    # l05: dramatik akkord, ayaq səsləri, nidalar
    l = L['l05']
    add(sfx, stinger() * 0.45, sec(l['start']))
    for fr in range(0, 20, 5):
        add(sfx, thud() * 0.15, sec(l['start'] + fr))
    add(sfx, pop(700) * 0.35, sec(l['start'] + 18))
    add(sfx, pop(800) * 0.35, sec(l['start'] + 22))
    # l06: dava buludu
    l = L['l06']
    life = l['vdur'] + 14
    fr = 2
    k = 0
    while fr < 2 + life:
        add(sfx, (bonk() if k % 3 else thud()) * (0.3 if k % 3 else 0.45), sec(l['start'] + fr))
        fr += 4 + (k * 7) % 5
        k += 1
    add(sfx, thud() * 0.55, sec(l['start'] + 2 + life))
    add(sfx, chime(2093) * 0.18, sec(l['start'] + 2 + life + 4))
    # l08: Harunun ayaq səsləri
    l = L['l08']
    for fr in range(0, int((l['end'] - l['start']) * 0.75), 10):
        add(sfx, thud() * 0.1, sec(l['start'] + fr))
    add(sfx, chime(1175) * 0.2, sec(l['start'] + int((l['end'] - l['start']) * 0.75)))
    # l11: vurğu
    add(sfx, whoosh(0.25) * 0.3, sec(L['l11']['start']) - 0.05)
    # l13: tərəzi
    l = L['l13']
    add(sfx, pop(600) * 0.35, sec(l['voiceAt'] + l['words'][9]))
    add(sfx, chime(988) * 0.25, sec(l['voiceAt'] + l['words'][9]))
    # l15: kartlar çıxır, sonra qum kimi tökülür
    l = L['l15']
    for wi in (0, 2, 4):
        add(sfx, pop(520 + wi * 60) * 0.35, sec(l['voiceAt'] + l['words'][wi]))
    add(sfx, sand(1.2) * 0.25, sec(l['voiceAt'] + l['words'][6]))
    # l16: son
    l = L['l16']
    add(sfx, pop(480) * 0.4, sec(l['start'] + 4))
    add(sfx, pop(640) * 0.4, sec(l['start'] + 12))
    add(sfx, chime(1318) * 0.3, sec(l['start'] + 2))

    mix = voice * 1.0 + mus + sfx * 0.9
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    st = np.stack([mix, mix], 1)
    st = np.clip(st, -1, 1)
    with wave.open(os.path.join(ROOT, 'public/mix.wav'), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype('<i2').tobytes())
    print('public/mix.wav', round(N / SR, 2), 'san')


if __name__ == '__main__':
    main()
