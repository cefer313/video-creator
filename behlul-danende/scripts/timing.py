#!/usr/bin/env python3
"""Səslərin uzunluğuna görə vaxt cədvəlini qurur -> src/timeline.json.
Hər sətir üçün: başlanğıc kadrı, səsin başladığı kadr, səs uzunluğu, dodaq üçün zərf (hər kadra 0..1)
və altyazı sözlərinin başlama kadrları (danışılan hissələrə simvol sayına görə paylanır, sükutlar atlanır)."""
import json, os, re, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30


def read_wav(p):
    with wave.open(p, 'rb') as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    return x, sr


def main():
    lines = json.load(open(os.path.join(ROOT, 'src/script.json'), encoding='utf8'))['lines']
    t = 0.0
    out = []
    for ln in lines:
        x, sr = read_wav(os.path.join(ROOT, 'public/voice', ln['id'] + '.wav'))
        dur = len(x) / sr
        hop = sr // FPS
        n = int(np.ceil(len(x) / hop))
        env = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-9) for i in range(n)])
        envn = np.clip(env / (np.percentile(env, 92) + 1e-6), 0, 1)
        # sözlərin vaxtı: danışılan kadrlar üzrə kumulyativ paylama
        voiced = (envn > 0.12).astype(float)
        cum = np.cumsum(voiced)
        total_v = max(cum[-1], 1)
        words = re.sub(r'[*_]', '', ln['text']).split()
        wl = np.array([len(w) + 1.5 for w in words])
        frac = np.concatenate([[0], np.cumsum(wl)[:-1]]) / wl.sum()
        wstart = []
        for f in frac:
            k = int(np.searchsorted(cum, f * total_v + 0.5))
            wstart.append(int(min(k, n - 1)))
        start = t
        voice_at = t + ln.get('pre', 0.2)
        end = voice_at + dur + ln.get('post', 0.3)
        out.append({
            'id': ln['id'], 'who': ln['who'], 'text': ln['text'],
            'start': round(start * FPS), 'voiceAt': round(voice_at * FPS), 'vdur': round(dur * FPS),
            'end': round(end * FPS),
            'env': [round(float(v), 2) for v in envn],
            'words': wstart,
        })
        t = end
    total = round(t * FPS)
    json.dump({'fps': FPS, 'total': total, 'lines': out}, open(os.path.join(ROOT, 'src/timeline.json'), 'w', encoding='utf8'),
              ensure_ascii=False)
    print('cəmi', round(t, 2), 'san,', total, 'kadr')


if __name__ == '__main__':
    main()
