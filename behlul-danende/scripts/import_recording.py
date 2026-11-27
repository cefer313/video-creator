#!/usr/bin/env python3
"""Bir faylda yazılmış diktor səsini (hər cümlədən əvvəl nömrəsi deyilib) cümlələrə bölür -> public/voice/lNN.wav.
Kəsmə vaxtları: audio/recording_cuts.json (Whisper ilə tapılıb, əl ilə yoxlanıb).
Təmizləmə: mono, 80 Hz-dən aşağı kəsilir, yüngül küy azaltma, yumşaq kompressor, səviyyə bərabərləşdirmə.
İşə salmaq: python3 scripts/import_recording.py <yazı.m4a>"""
import json, os, subprocess, sys, tempfile, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1]
cuts = json.load(open(os.path.join(ROOT, 'audio/recording_cuts.json')))
os.makedirs(os.path.join(ROOT, 'public/voice'), exist_ok=True)
for k, (a, b) in enumerate(cuts):
    a = max(0, a - 0.08); b = b + 0.14
    with tempfile.TemporaryDirectory() as td:
        t = os.path.join(td, 't.wav')
        subprocess.run(['ffmpeg', '-nostdin', '-y', '-loglevel', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', src,
                        '-af', 'pan=mono|c0=0.5*c0+0.5*c1,highpass=f=80,afftdn=nf=-32,'
                               'acompressor=threshold=-24dB:ratio=2.5:attack=8:release=120:makeup=1,'
                               'afade=t=in:d=0.02', '-ar', '48000', '-ac', '1', t], check=True)
        with wave.open(t) as w:
            x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    loud = x[np.abs(x) > 0.02]
    rms = np.sqrt(np.mean(loud ** 2)) if len(loud) else 0.1
    x = x * (10 ** (-19 / 20) / max(rms, 1e-4))
    x = np.tanh(x * 1.2) / np.tanh(1.2)
    n = int(0.03 * 48000); x[-n:] *= np.linspace(1, 0, n)
    with wave.open(os.path.join(ROOT, f'public/voice/l{k:02d}.wav'), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())
    print(f'l{k:02d}', round(len(x) / 48000, 2), 'san')
