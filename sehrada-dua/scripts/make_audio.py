#!/usr/bin/env python3
"""Səs hazırlığı (numpy sintezi — lisenziya problemi yoxdur).

1) public/voice.m4a (istifadəçinin öz səsi) -> public/voice_clean.wav: küy azaldılır, səviyyə bərabərləşdirilir.
2) public/music.wav — fon: külək (səhra), ürək döyüntüsü (susuzluq), yumşaq dron, ildırım + yağış (dua qəbul olunur),
   isti akkordlar və ud tipli simli (ailəyə qovuşma). Vaxtlar src/timeline.ts ilə eynidir.
"""
import os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
P = lambda *a: os.path.join(ROOT, *a)
SR = 48000
SECS = 35.0
N = int(SECS * SR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)

# ---------- 1) diktor səsi ----------
subprocess.run([
    'ffmpeg', '-y', '-loglevel', 'error', '-i', P('public/voice.m4a'),
    '-af', 'highpass=f=80,afftdn=nf=-30,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=180,loudnorm=I=-16:TP=-1.5:LRA=9',
    '-ar', '48000', '-ac', '2', P('public/voice_clean.wav')], check=True)

# ---------- köməkçilər ----------
def env(points):
    """[(saniyə, dəyər), ...] -> hamar zərf."""
    xs, ys = zip(*points)
    return np.interp(t, xs, ys)

def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)

def band_noise(lo, hi, seed):
    r = np.random.default_rng(seed)
    x = r.normal(0, 1, N)
    s = np.fft.rfft(x)
    f = np.fft.rfftfreq(N, 1 / SR)
    s *= ((f > lo) & (f < hi)) * 1.0
    y = np.fft.irfft(s, N)
    return y / (np.abs(y).max() + 1e-9)

def pad(midis, amp=1.0):
    y = np.zeros(N)
    for m in midis:
        f = hz(m)
        for h, ha in [(1, 1), (2, 0.3), (3, 0.12)]:
            for det in (-0.12, 0.12):
                y += ha * np.sin(2 * np.pi * f * h * (1 + det / 1200 * 12) * t + rng.uniform(0, 6))
    return y / (np.abs(y).max() + 1e-9) * amp

def pluck(freq, dur=2.4):
    n = int(dur * SR); p = int(SR / freq)
    buf = rng.uniform(-1, 1, p); out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * np.minimum(1, np.arange(n) / (0.004 * SR))

def place(dst, src, at, amp):
    s = int(at * SR); e = min(N, s + len(src))
    if s < N:
        dst[s:e] += src[: e - s] * amp

# ---------- 2) fon ----------
# külək: səhrada güclü, yağışda yox olur
wind = band_noise(150, 900, 1) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.09 * t)) * env(
    [(0, 0), (1.2, 0.20), (8, 0.22), (14, 0.16), (16, 0.07), (19, 0.03), (21, 0), (35, 0)])

# dron: Hicaz (Re) — gərgin, susuzluqda qaralır
drone = pad([38, 45, 50, 51], 1) * env([(0, 0), (2, 0.10), (12, 0.13), (15.5, 0.10), (18.5, 0.05), (20, 0), (35, 0)])

# ürək döyüntüsü (susuzluq): 8.4 - 15.5 san, yavaşlayan
heart = np.zeros(N)
thump = np.sin(2 * np.pi * 55 * np.arange(int(0.18 * SR)) / SR) * np.exp(-np.arange(int(0.18 * SR)) / (0.04 * SR))
x = 8.5
while x < 15.3:
    place(heart, thump, x, 1.0)
    place(heart, thump, x + 0.24, 0.6)
    x += 1.05 + (x - 8.5) * 0.05
heart *= 0.35 * env([(8, 0), (9, 1), (14.5, 0.8), (15.5, 0)])

# dua anı: yumşaq yüksək ton (Re major) — 15.7-18.9
prayer = pad([62, 66, 69, 74], 1) * env([(15.4, 0), (16.6, 0.07), (18.7, 0.09), (19.5, 0.05), (21, 0)])

# ildırım (uzaq gurultu) 18.8 san-də
thunder = band_noise(25, 160, 3)
thunder *= env([(18.6, 0), (18.9, 0.55), (19.6, 0.35), (21.5, 0.08), (23, 0), (35, 0)])

# yağış: 19.2-dən güclənir, 27-dən sonra azalır
rain = (band_noise(1500, 9000, 4) * 0.7 + band_noise(300, 1500, 5) * 0.3)
drops = np.zeros(N)
for _ in range(900):
    at = rng.uniform(19, 31)
    d = np.exp(-np.arange(int(0.02 * SR)) / (0.003 * SR)) * rng.normal(0, 1, int(0.02 * SR))
    place(drops, d, at, rng.uniform(0.2, 0.6))
rain = (rain * 0.8 + drops * 0.4) * env([(19, 0), (20.5, 0.16), (25, 0.18), (27.5, 0.09), (31, 0.02), (32, 0), (35, 0)])

# isti akkordlar: xilas və ailə (D - G - D - A - D)
warm = np.zeros(N)
for (a, b, ch) in [(21.4, 25.2, [50, 57, 62, 66]), (25.0, 28.0, [43, 55, 59, 62]), (27.8, 30.6, [50, 57, 62, 66]),
                   (30.4, 32.6, [45, 57, 61, 64]), (32.4, 35.0, [50, 57, 62, 66, 69])]:
    seg = pad(ch, 1)
    e = np.clip(np.minimum((t - a) / 1.2, (b - t) / 1.0), 0, 1)
    warm += seg * e
warm *= env([(21, 0.05), (24, 0.10), (28, 0.12), (33, 0.12), (35, 0)])

# ud tipli simli — ailə səhnəsində bir neçə yumşaq not (Re major pentatonik)
mel = np.zeros(N)
notes = [(28.2, 74), (28.8, 76), (29.4, 78), (30.6, 81), (31.4, 78), (32.2, 76), (33.0, 74)]
for at, m in notes:
    place(mel, pluck(hz(m)), at, 0.55)
mel *= 0.22

mix = wind + drone + heart + prayer + thunder + rain + warm + mel

# reverb
L = int(2.5 * SR)
ir = rng.normal(0, 1, L) * np.exp(-np.arange(L) / (0.8 * SR)); ir[0] = 0
ir /= np.sqrt((ir ** 2).sum())
size = 1 << int(np.ceil(np.log2(N + L)))
wet = np.fft.irfft(np.fft.rfft(mix, size) * np.fft.rfft(ir, size), size)[:N]
out = 0.8 * mix + 0.35 * wet
out *= env([(0, 0), (0.8, 1), (33.5, 1), (35, 0)])
st = np.stack([out, np.roll(out, int(0.011 * SR))], 1)
st /= np.abs(st).max() * 1.1
raw = P('public/music_raw.wav')
with wave.open(raw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
# fon səsdən ~10 dB aşağı
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-27:TP=-3:LRA=14', '-ar', '48000',
                P('public/music.wav')], check=True)
os.remove(raw)
print('voice_clean.wav + music.wav hazırdır')
