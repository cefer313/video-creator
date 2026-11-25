#!/usr/bin/env python3
"""Fon musiqisi sintezi (numpy) — lisenziya problemi yoxdur.
Hicaz məqamında (Re) yumşaq dron + ud tipli simli (Karplus-Strong) melodiya + külək.
Müddət src/story.ts-dən oxunur. Çıxış: public/music.wav (-16 LUFS, ffmpeg loudnorm)."""
import re, subprocess, wave, os
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
story = open(os.path.join(ROOT, 'src/story.ts'), encoding='utf8').read()
secs = sum(round(float(x) * 30) for x in re.findall(r'sec:\s*([0-9.]+)', story)) / 30
SR = 48000
N = int(secs * SR) + SR
t = np.arange(N) / SR
rng = np.random.default_rng(7)

def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)

# --- dron (D2, A2, D3) yavaş nəfəs alan ---
drone = np.zeros(N)
for m, a in [(38, 0.5), (45, 0.32), (50, 0.22)]:
    f = hz(m)
    for h, ha in [(1, 1), (2, 0.35), (3, 0.15), (4, 0.06)]:
        drone += a * ha * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6)) * (0.8 + 0.2 * np.sin(2 * np.pi * (0.05 + 0.01 * h) * t))
drone *= 0.18

# --- ud (Karplus-Strong) ---
def pluck(freq, dur, amp):
    n = int(dur * SR)
    p = int(SR / freq)
    buf = rng.uniform(-1, 1, p)
    out = np.zeros(n)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    env = np.minimum(1, np.arange(n) / (0.004 * SR))
    return out * env * amp

# Hicaz: D Eb F# G A Bb C D
scale = [62, 63, 66, 67, 69, 70, 72, 74]
phrases = [
    [0, 1, 2, 1, 0], [2, 3, 4, 3, 2, 1], [4, 5, 4, 3, 2], [3, 2, 1, 0],
    [4, 6, 5, 4, 3], [7, 6, 5, 4], [2, 3, 2, 1, 0], [1, 2, 3, 4, 3],
]
mel = np.zeros(N)
cache = {}
pos = 2.0
pi = 0
beat = 0.62
while pos < secs - 6:
    ph = phrases[pi % len(phrases)]
    for j, d in enumerate(ph):
        m = scale[d] - (12 if pi % 3 == 2 else 0)
        key = m
        if key not in cache:
            cache[key] = pluck(hz(m), 2.2, 1.0)
        s = cache[key] * (0.55 if j else 0.7)
        st = int((pos + rng.uniform(-0.02, 0.02)) * SR)
        e = min(N, st + len(s))
        mel[st:e] += s[: e - st]
        # ud tremolo hissi — bəzi notlarda təkrar vuruş
        if j == len(ph) - 1:
            for r in range(1, 4):
                st2 = st + int(r * 0.11 * SR)
                e2 = min(N, st2 + len(s))
                mel[st2:e2] += s[: e2 - st2] * 0.3
        pos += beat * (2 if j == len(ph) - 1 else 1)
    pos += beat * 3 + (beat * 2 if pi % 2 else 0)
    pi += 1
mel *= 0.32

# --- külək ---
wind = rng.normal(0, 1, N)
spec = np.fft.rfft(wind)
fr = np.fft.rfftfreq(N, 1 / SR)
spec *= np.exp(-((fr - 400) / 350) ** 2) + 0.2 * np.exp(-((fr - 1200) / 600) ** 2)
wind = np.fft.irfft(spec, N)
wind /= np.abs(wind).max()
wind *= 0.05 * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t) * np.sin(2 * np.pi * 0.023 * t + 1))

mix = drone + mel + wind

# --- reverb (eksponensial səs-küy IR) ---
L = int(2.8 * SR)
ir = rng.normal(0, 1, L) * np.exp(-np.arange(L) / (0.9 * SR))
ir[0] = 0
ir /= np.sqrt((ir ** 2).sum())
size = 1 << int(np.ceil(np.log2(N + L)))
wet = np.fft.irfft(np.fft.rfft(mix, size) * np.fft.rfft(ir, size), size)[:N]
out = 0.75 * mix + 0.45 * wet

# giriş/çıxış
fade = np.ones(N)
fi = int(2 * SR); fo = int(4 * SR)
fade[:fi] = np.linspace(0, 1, fi)
end = int(secs * SR)
fade[end - fo:end] = np.linspace(1, 0, fo)
fade[end:] = 0
out = out * fade
out = out[:end]
st = np.stack([out, np.roll(out, int(0.012 * SR))], 1)
st /= np.abs(st).max() * 1.1
raw = os.path.join(ROOT, 'public/music_raw.wav')
with wave.open(raw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11', '-ar', '48000',
                os.path.join(ROOT, 'public/music.wav')], check=True)
os.remove(raw)
print(f'music.wav: {secs:.2f} s')
