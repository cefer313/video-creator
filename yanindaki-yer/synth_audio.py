#!/usr/bin/env python3
"""«Yanındakı yer» üçün sintez səslər: musiqi (sakit dron + pianoya bənzər notlar),
telefon siqnalı, telefon zəngi, divar saatı, qapı. Xışıltı olmasın deyə küy (noise) əsaslı səs yoxdur. Lisenziyasız, numpy ilə."""
import numpy as np, wave, os
SR = 48000
rng = np.random.default_rng(7)
os.makedirs('audio_src', exist_ok=True)

def save(name, x):
    x = np.clip(x, -1, 1)
    st = np.stack([x, x], 1) if x.ndim == 1 else x
    with wave.open(f'audio_src/{name}', 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())

def lowpass(x, a):
    y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x):
        s += a * (v - s); y[i] = s
    return y

def lp_fast(x, n):  # sürüşən orta
    k = np.ones(n) / n
    return np.convolve(x, k, 'same')

T = 60.0
t = np.arange(int(T * SR)) / SR

# --- Musiqi: D minor/F major sakit akkordlar, yumşaq pad + nadir notlar
def pad(freqs, dur, amp):
    tt = np.arange(int(dur * SR)) / SR
    y = sum(np.sin(2*np.pi*f*tt + np.sin(2*np.pi*0.2*tt)*0.3) * (0.5 if i else 1) for i, f in enumerate(freqs))
    env = np.minimum(1, tt/2.0) * np.minimum(1, (dur-tt)/2.0)
    return y * env * amp
def note(f, dur, amp):
    tt = np.arange(int(dur * SR)) / SR
    y = (np.sin(2*np.pi*f*tt) + 0.3*np.sin(4*np.pi*f*tt) + 0.1*np.sin(6*np.pi*f*tt))
    return y * np.exp(-tt*2.2) * np.minimum(1, tt*200) * amp
mus = np.zeros_like(t)
chords = [(146.83, 220.0, 293.66), (116.54, 174.61, 233.08), (130.81, 196.0, 261.63), (110.0, 164.81, 220.0)]
for k in range(8):
    st = k * 7.5; seg = pad(chords[k % 4], 8.5, 0.05)
    i = int(st*SR); n = min(len(seg), len(mus)-i); mus[i:i+n] += seg[:n]
mel = [(1.0, 587.33), (4.0, 523.25), (8.5, 440.0), (15.5, 466.16), (19.0, 440.0), (24.0, 392.0), (27.5, 440.0),
       (33.5, 349.23), (37.0, 392.0), (40.5, 440.0), (44.0, 523.25), (47.0, 587.33), (52.5, 440.0), (55.0, 587.33)]
for st, f in mel:
    seg = note(f, 3.0, 0.07); i = int(st*SR); n = min(len(seg), len(mus)-i); mus[i:i+n] += seg[:n]
# sadə reverb
rev = np.zeros_like(mus)
for d, g in [(0.05, .4), (0.11, .3), (0.23, .2), (0.37, .12)]:
    k = int(d*SR); rev[k:] += mus[:-k]*g
save('music.wav', (mus + rev) * 0.9)

# --- Telefon gözləmə siqnalı (uzun «tuuut»): 425 Hz, 1 s səs / 4 s sükut
def ringback(dur, amp):
    n = int(dur*SR); tt = np.arange(n)/SR
    gate = ((tt % 4.0) < 1.0).astype(float)
    gate = lp_fast(gate, 200)
    return np.sin(2*np.pi*425*tt) * gate * amp
save('ringback.wav', ringback(12, 0.25))
# --- Telefonun zəngi (melodik), otaqda
def ringtone(dur, amp):
    n = int(dur*SR); tt = np.arange(n)/SR
    seq = [880, 1046.5, 1318.5, 1046.5]
    f = np.array([seq[int(x*8) % 4] for x in tt])
    ph = 2*np.pi*np.cumsum(f)/SR
    gate = ((tt % 2.5) < 1.2).astype(float)
    return np.sin(ph) * lp_fast(gate, 100) * amp
save('ringtone.wav', ringtone(10, 0.12))

# --- Divar saatı
n = int(6*SR); clk = np.zeros(n)
for k in range(6):
    L = int(0.02*SR); i = int((k+0.3)*SR)
    clk[i:i+L] += np.sin(2*np.pi*2500*np.arange(L)/SR) * np.exp(-np.arange(L)/SR*300) * (0.35 if k % 2 else 0.25)
save('clock.wav', clk)

# --- Qapı bağlanması: küysüz, yumşaq alçaq tonlu zərbə
L = int(0.6*SR); tt = np.arange(L)/SR
door = (np.sin(2*np.pi*70*tt) + 0.5*np.sin(2*np.pi*140*tt)) * np.exp(-tt*14) * np.minimum(1, tt*400)
save('door.wav', door * 0.6)
print('ok')
