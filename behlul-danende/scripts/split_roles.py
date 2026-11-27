#!/usr/bin/env python3
"""Higgsfield voice_change nəticələrini (hər rol üçün bir fayl) yenidən cümlələrə bölür -> public/voice/lNN.wav.
Rol faylları belə qurulub: 0,5 san sükut, sonra rolun cümlələri, aralarında 1 san sükut (audio/role_offsets.json).
İşə salmaq: python3 scripts/split_roles.py <qovluq: vc_narr.wav vc_behlul.wav vc_harun.wav>"""
import json, os, sys, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = sys.argv[1]
offs = json.load(open(os.path.join(ROOT, 'audio/role_offsets.json')))
for role, items in offs.items():
    with wave.open(os.path.join(d, f'vc_{role}.wav')) as w:
        assert w.getframerate() == 48000
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    for lid, t, dur in items:
        a = int(t * 48000); b = int((t + dur + 0.12) * 48000)
        y = x[a:b].copy()
        loud = y[np.abs(y) > 0.02]
        rms = np.sqrt(np.mean(loud ** 2)) if len(loud) else 0.1
        y = y * (10 ** (-19 / 20) / max(rms, 1e-4))
        y = np.tanh(y * 1.2) / np.tanh(1.2)
        n = int(0.02 * 48000); y[:n] *= np.linspace(0, 1, n); y[-n:] *= np.linspace(1, 0, n)
        with wave.open(os.path.join(ROOT, f'public/voice/{lid}.wav'), 'wb') as o:
            o.setnchannels(1); o.setsampwidth(2); o.setframerate(48000)
            o.writeframes((np.clip(y, -1, 1) * 32767).astype('<i2').tobytes())
        print(lid, role, round(len(y) / 48000, 2))
