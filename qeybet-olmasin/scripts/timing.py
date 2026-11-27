#!/usr/bin/env python3
"""Səs fayllarının uzunluğuna görə filmin vaxt cədvəlini qurur -> src/timeline.json.
Replikaların başlanğıc/son kadrları, dodaq sinxronu üçün səs zərfi (hər kadra bir dəyər),
hadisələr (zəng, öskürək, donma, geri sarma, nömrə yığma) və tum yemə anları."""
import json, os, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30


def load(i):
    with wave.open(os.path.join(ROOT, 'public', 'voice', f'{i}.wav'), 'rb') as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    return x, sr


def envelope(x, sr):
    hop = sr // FPS
    n = int(np.ceil(len(x) / hop))
    rms = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2) + 1e-9) for k in range(n)])
    ref = np.percentile(rms, 92) + 1e-6
    v = np.clip(rms / ref, 0, 1.2) ** 0.8
    out, y = [], 0.0
    for a in v:
        y = y + (a - y) * (0.7 if a > y else 0.4)
        out.append(round(float(min(1, y)), 2))
    return out


def main():
    lines = json.load(open(os.path.join(ROOT, 'src', 'script.json'), encoding='utf8'))['lines']
    info = {}
    for ln in lines:
        x, sr = load(ln['id'])
        info[ln['id']] = dict(ln, dur=len(x) / sr, env=envelope(x, sr))
    place = {}

    def put(i, start):
        place[i] = start
        return start + info[i]['dur']

    # --- 1-2. Sual və yanlış adət
    e = put('t01', 0.25)
    e = put('t02', e + 0.16)
    e = put('k01', e + 0.18)
    e = put('t03', e + 0.16)
    e = put('k02', e + 0.22)
    e = put('t04', e + 0.18)
    ring = [e - 0.3, e + 0.95]
    e = put('t05', ring[1] + 0.12)
    cough = [e - 0.5, e + 0.45]
    freeze = cough[1] + 0.12
    # --- 3. Düzgün variant (izah)
    e = put('n01', freeze + 0.8)
    e = put('n02', e + 0.3)
    e = put('n03', e + 0.3)
    e = put('n04', e + 0.3)
    explain_end = e + 0.45
    rewind = [explain_end, explain_end + 1.0]
    # --- 4. Düz səhnə
    e = put('t06', rewind[1] + 0.3)
    e = put('k03', e - 0.12)
    dial = [e + 0.2, e + 1.25]
    e = put('t07', dial[1] + 0.05)
    end_card = e + 0.2
    # --- 5. Son
    e = put('n05', end_card + 0.4)
    total = e + 0.9

    f = lambda s: int(round(s * FPS))
    s = {i: place[i] for i in place}
    bites = [
        ('kenan', s['t02'] + 0.5), ('kenan', s['t02'] + 2.1), ('tural', s['k01'] - 0.05),
        ('kenan', s['t03'] + 0.6), ('kenan', s['t03'] + 2.2), ('kenan', s['t04'] + 0.9),
        ('kenan', cough[0] - 0.75), ('kenan', s['t06'] - 0.15),
    ]
    out = {
        'fps': FPS,
        'total': f(total),
        'parts': {
            'wrong': [0, f(freeze)], 'explain': [f(freeze), f(explain_end)],
            'rewind': [f(rewind[0]), f(rewind[1])], 'correct': [f(rewind[1]), f(end_card)],
            'end': [f(end_card), f(total)],
        },
        'events': {
            'ring': [f(ring[0]), f(ring[1])], 'cough': [f(cough[0]), f(cough[1])], 'freeze': f(freeze),
            'dial': [f(dial[0]), f(dial[1])], 'endCard': f(end_card),
        },
        'bites': [{'who': w, 'at': f(t)} for w, t in bites],
        'lines': [
            {k: info[i][k] for k in ('id', 'who', 'part', 'text')} | {
                'start': f(place[i]), 'end': f(place[i] + info[i]['dur']), 'startSec': round(place[i], 3),
                'env': info[i]['env']}
            for i in [ln['id'] for ln in lines]
        ],
    }
    json.dump(out, open(os.path.join(ROOT, 'src', 'timeline.json'), 'w', encoding='utf8'), ensure_ascii=False)
    print('cəmi', round(total, 2), 'san,', out['total'], 'kadr')
    for k, v in out['parts'].items():
        print(f'  {k:8s} {v[0] / FPS:6.2f} – {v[1] / FPS:6.2f} san')


if __name__ == '__main__':
    main()
