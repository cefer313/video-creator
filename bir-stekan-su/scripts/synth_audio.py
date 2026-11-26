#!/usr/bin/env python3
"""«Bir stəkan su» — bütün səs zolağı numpy ilə sintez olunur (lisenziya problemi yoxdur).
Çıxış: public/audio/soundtrack.wav (48 kHz, stereo, 30.0 san).
Hadisə vaxtları saniyə ilə aşağıdakı EVENTS bölməsindədir (kadr = san × 24)."""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR = 48000
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def add(sig, t, gain=1.0, pan=0.0):
    """pan: -1 sol … +1 sağ (bərabər güc)."""
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    a = (pan + 1) * np.pi / 4
    L[i:i + len(sig)] += sig * np.cos(a)
    R[i:i + len(sig)] += sig * np.sin(a)


def env(n, att, rel):
    e = np.ones(n)
    a, r = int(att * SR), int(rel * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if r: e[-r:] *= np.linspace(1, 0, r)
    return e


# ---------- səs mənbələri ----------
def footstep(soft=1.0, bright=1.0):
    """Səndəl daş üzərində: qısa zərbə + sürtünmə."""
    n = int(0.16 * SR)
    t = np.arange(n) / SR
    thump = np.sin(2 * np.pi * 95 * t) * np.exp(-t * 45) * 0.5
    nz = rng.standard_normal(n)
    scuff = bp(nz, 900, 4500 * bright) * np.exp(-t * 28) * 0.35
    click = hp(nz, 2500) * np.exp(-t * 180) * 0.25
    return (thump + scuff + click) * soft


def glass_tap(f0=2350, dur=0.6):
    """Şüşə stəkan: qeyri-harmonik obertonlar, sürətli sönmə."""
    t = np.arange(int(dur * SR)) / SR
    s = np.zeros_like(t)
    for k, (m, a, d) in enumerate([(1, 1, 7), (2.32, .5, 11), (4.25, .3, 16), (6.8, .15, 24)]):
        s += a * np.sin(2 * np.pi * f0 * m * t + k) * np.exp(-t * d)
    s += hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 300) * 0.4
    return s * 0.35


def clay_thud():
    t = np.arange(int(0.35 * SR)) / SR
    s = np.sin(2 * np.pi * 140 * t) * np.exp(-t * 25) + 0.5 * np.sin(2 * np.pi * 310 * t) * np.exp(-t * 40)
    s += bp(rng.standard_normal(len(t)), 300, 2000) * np.exp(-t * 50) * 0.5
    return s * 0.5


def pour(dur, f_start=420, f_end=1100, intensity=1.0, tail=0.25):
    """Su tökülməsi: süzülən küy + yüksələn rezonanslı qabarcıqlar (stəkan doldukca ton qalxır)."""
    n = int((dur + tail) * SR)
    t = np.arange(n) / SR
    prog = np.clip(t / dur, 0, 1)
    nz = rng.standard_normal(n)
    stream = bp(nz, 500, 6000) * 0.18
    stream *= (0.75 + 0.25 * np.sin(2 * np.pi * 7.3 * t + 2 * np.sin(2 * np.pi * 1.7 * t)))
    s = stream.copy()
    nb = int(dur * 55)
    for _ in range(nb):
        t0 = rng.uniform(0, dur)
        p = t0 / dur
        f = (f_start + (f_end - f_start) * p ** 1.3) * rng.uniform(0.85, 1.2)
        bl = int(0.03 * SR)
        tb = np.arange(bl) / SR
        b = np.sin(2 * np.pi * (f * tb + f * 1.8 * tb ** 2 / 0.06)) * np.exp(-tb * 120) * rng.uniform(.15, .45)
        i = int(t0 * SR)
        s[i:i + bl] += b[: max(0, min(bl, n - i))]
    e = env(n, 0.05, tail + 0.05)
    e[int(dur * SR):] *= np.exp(-np.arange(n - int(dur * SR)) / SR * 18)
    return s * e * intensity


def drip():
    """Tək damla boş stəkana: qısa 'plip' + zəif şüşə cingiltisi."""
    t = np.arange(int(0.5 * SR)) / SR
    f = 900 + 1600 * (1 - np.exp(-t * 60))
    plip = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 55) * 0.6
    return plip + glass_tap(2600, 0.5) * 0.35


def bird(kind):
    """Uzaq quş cəh-cəhi: tezlik modulyasiyalı qısa notlar."""
    notes = []
    k = rng.integers(2, 5)
    base = rng.uniform(2800, 4200)
    for j in range(k):
        dn = rng.uniform(0.05, 0.12)
        t = np.arange(int(dn * SR)) / SR
        sweep = base * (1 + (0.25 if kind else -0.2) * t / dn) + 300 * np.sin(2 * np.pi * 38 * t)
        ph = 2 * np.pi * np.cumsum(sweep) / SR
        notes.append(np.sin(ph) * np.sin(np.pi * t / dn) ** 2)
        notes.append(np.zeros(int(rng.uniform(0.03, 0.09) * SR)))
    return lp(np.concatenate(notes), 6000) * 0.05


def crowd_bed(n):
    """İzdiham uğultusu (sözsüz): bir neçə 'səs' formant küyü, yavaş amplituda dalğalanması."""
    out = np.zeros(n)
    t = np.arange(n) / SR
    for v in range(7):
        f = rng.uniform(300, 900)
        x = bp(rng.standard_normal(n), f * 0.7, f * 1.6)
        am = np.clip(np.sin(2 * np.pi * rng.uniform(0.25, 0.6) * t + rng.uniform(0, 6)) * 1.4, 0, 1) ** 2
        out += x * am
    return out * 0.05


# ---------- fon ----------
t = np.arange(N) / SR
air = lp(rng.standard_normal(N), 380) * 0.05 + bp(rng.standard_normal(N), 1500, 5000) * 0.004
air *= 0.85 + 0.15 * np.sin(2 * np.pi * 0.07 * t)
add(air, 0, 1.0, -0.2)
add(lp(rng.standard_normal(N), 380) * 0.05, 0, 1.0, 0.3)

# İzdiham: 0–11 san aydın, kadr 264-dən (11 san) uzaqlaşır və ~15.5 san-da itir.
cb = crowd_bed(N)
gain = np.ones(N) * 1.0
i11, i16 = int(11.0 * SR), int(15.5 * SR)
gain[i11:i16] = np.linspace(1, 0, i16 - i11) ** 1.6
gain[i16:] = 0
far = lp(cb, 900)  # uzaqlaşdıqca yüksək tezliklər itir
mix = np.where(np.arange(N) < i11, cb, cb * gain + far * gain * 0.6)
mix[:i11] *= np.clip(t[:i11] / 1.2, 0, 1)
add(mix * gain, 0, 1.0, -0.35)
add(lp(mix, 1200) * gain * 0.7, 0, 1.0, 0.4)

# Quşlar — bütün film boyu, seyrək
for tb in np.arange(0.6, 29.5, 1.7):
    tt = tb + rng.uniform(-0.5, 0.5)
    g = 0.7 if tt < 27.8 else 0.5
    add(bird(rng.integers(0, 2)), tt, g, rng.uniform(-0.9, 0.9))

# ---------- EVENTS (san) ----------
E = {}
exec(open(os.path.join(os.path.dirname(__file__), 'events.py')).read(), E)
for kind, tt, *a in E['EVENTS']:
    if kind == 'step':
        g, pan = (a + [1.0, 0.0])[:2]
        add(footstep(), tt, g, pan)
    elif kind == 'tap':
        g, pan, f0 = (a + [1.0, 0.0, 2350])[:3]
        add(glass_tap(f0), tt, g, pan)
    elif kind == 'thud':
        g, pan = (a + [1.0, 0.0])[:2]
        add(clay_thud(), tt, g, pan)
    elif kind == 'pour':
        dur, g, pan, f0, f1 = (a + [1.0, 0.0, 420, 1100])[:5]
        add(pour(dur, f0, f1), tt, g, pan)
    elif kind == 'drip':
        g, pan = (a + [1.0, 0.0])[:2]
        add(drip(), tt, g, pan)
    elif kind == 'spill':
        g, pan = (a + [1.0, 0.0])[:2]
        add(pour(0.12, 1400, 1800, 0.7, 0.08), tt, g, pan)

# Son: yumşaq sönmə (son 1 san)
st = np.stack([L, R], 1)
fo = int(1.0 * SR)
st[-fo:] *= np.linspace(1, 0, fo)[:, None] ** 1.5
# Səviyyə: təxminən −16 LUFS-ə yaxın (sonra ffmpeg loudnorm ilə dəqiqləşdirilir)
st = st / (np.max(np.abs(st)) + 1e-9) * 0.7
os.makedirs('public/audio', exist_ok=True)
with wave.open('public/audio/soundtrack_raw.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype('<i2').tobytes())
os.system('ffmpeg -v error -y -i public/audio/soundtrack_raw.wav -af loudnorm=I=-18:TP=-2:LRA=14 -ar 48000 '
          'public/audio/soundtrack.wav && rm public/audio/soundtrack_raw.wav')
print('public/audio/soundtrack.wav')
