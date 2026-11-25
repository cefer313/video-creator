#!/usr/bin/env python3
"""Diktor səslərinin uzunluğuna görə səhnə müddətlərini hesablayır -> src/timing.json.
Səs səhnə başlayandan 0,77 san sonra başlayır; səhnə səs bitəndən ~1,3 san sonra bitir."""
import json, os, re, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
story = open(os.path.join(ROOT, 'src/story.ts'), encoding='utf8').read()
base = [float(x) for x in re.findall(r'sec:\s*([0-9.]+)', story)]
out = []
vd = []
for k, b in enumerate(base):
    p = os.path.join(ROOT, f'public/voice/v{k:02d}.mp3')
    if os.path.exists(p) and k > 0:
        d = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p]))
        out.append(round(max(3.5, d + 2.1), 2))
        vd.append(round(d, 3))
    else:
        out.append(b)
        vd.append(0)
json.dump({'sec': out, 'vdur': vd, 'voice': [os.path.exists(os.path.join(ROOT, f'public/voice/v{k:02d}.mp3')) for k in range(len(base))]},
          open(os.path.join(ROOT, 'src/timing.json'), 'w'))
print('cəmi', round(sum(out), 2), 'san')
