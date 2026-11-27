#!/usr/bin/env python3
"""Səsləri yaradır (keşlə), vaxt cədvəlini (src/timeline.json) qurur və səs miksini (public/mix.wav) yığır.

Səslər:
  - azərbaycanca: Meta MMS (facebook/mms-tts-azj-script_latin, CC BY-NC 4.0), MMS_DIR qovluğunda;
  - ingiliscə: Piper (rhasspy/piper-voices, en_US-lessac-medium), PIPER_VOICE faylı.
Musiqi və səs effektləri numpy ilə sintez olunur.

İşə salmaq: MMS_DIR=~/models/mms-tts-azj PIPER_VOICE=~/models/piper/.../en_US-lessac-medium.onnx \
            <torch+transformers+piper-tts olan python> scripts/build.py
Hazır səsi öz səsinlə əvəz etmək: public/voice/ içindəki eyni adlı WAV faylını dəyiş və skripti yenidən işlət."""
import hashlib, json, os, re, subprocess, sys, tempfile, wave
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import content as C

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VOICE_DIR = os.path.join(ROOT, 'public', 'voice')
MMS_DIR = os.path.expanduser(os.environ.get('MMS_DIR', '~/models/mms-tts-azj'))
PIPER_VOICE = os.path.expanduser(os.environ.get(
    'PIPER_VOICE', '~/models/piper/en/en_US/lessac/medium/en_US-lessac-medium.onnx'))
FPS = 30
SR = 48000

# ---------------------------------------------------------------- wav köməkçiləri

def write_wav(path, x, sr=SR, ch=1):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((x * 32767).astype('<i2').tobytes())


def read_wav(path):
    with wave.open(path, 'rb') as w:
        sr = w.getframerate(); ch = w.getnchannels()
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(1)
    return x, sr


def trim(x, sr, thr=0.012):
    n = max(1, int(sr * 0.01))
    env = np.convolve(np.abs(x), np.ones(n) / n, 'same')
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    return x[max(0, idx[0] - int(sr * 0.02)): min(len(x), idx[-1] + int(sr * 0.06))]


def post(raw, sr, out, af=''):
    """48 kHz-ə çevir, yüngül EQ, səviyyəni bərabərləşdir."""
    with tempfile.TemporaryDirectory() as td:
        a = os.path.join(td, 'a.wav'); b = os.path.join(td, 'b.wav')
        write_wav(a, raw / max(1e-6, np.abs(raw).max()) * 0.9, sr)
        chain = 'aresample=48000,highpass=f=70,equalizer=f=3000:t=q:w=1.2:g=2'
        if af:
            chain += ',' + af
        subprocess.run(['ffmpeg', '-nostdin', '-y', '-loglevel', 'error', '-i', a, '-af', chain,
                        '-ar', str(SR), '-ac', '1', b], check=True)
        x, _ = read_wav(b)
    x = trim(x, SR)
    loud = np.abs(x) > 0.01
    rms = np.sqrt(np.mean(x[loud] ** 2)) if np.any(loud) else 0.1
    x = x * (10 ** (-19 / 20) / max(rms, 1e-4))
    x = np.tanh(x * 1.2) / np.tanh(1.2)
    write_wav(out, x)

# ---------------------------------------------------------------- səs klipləri

AZ_PAUSE = {',': 0.13, '—': 0.2, ':': 0.22, '.': 0.3, '!': 0.3, '?': 0.3}


def az_lower(s):
    return s.replace('I', 'ı').replace('İ', 'i').lower()


def az_chunks(text):
    t = re.sub(r'[“”«»"()]', '', text)
    parts = re.split(r'([,—:.!?])', t)
    out = []
    for i in range(0, len(parts), 2):
        seg = parts[i].strip(' -')
        p = parts[i + 1] if i + 1 < len(parts) else ''
        if seg:
            out.append([seg, AZ_PAUSE.get(p, 0.0)])
        elif out and p:
            out[-1][1] = max(out[-1][1], AZ_PAUSE.get(p, 0.0))
    if out:
        out[-1][1] = 0.0
    return out


NEED = {}  # ad -> (dil, mətn)


def clip(lang, text):
    """Klipin adını qaytarır (public/voice/<ad>.wav); yaradılacaqlar siyahısına əlavə edir."""
    h = hashlib.md5(f'{lang}|{text}'.encode()).hexdigest()[:10]
    slug = re.sub(r'[^a-z0-9]+', '-', az_lower(text).translate(str.maketrans('əğıöüşç', 'egiousc')))[:24].strip('-')
    name = f'{lang}-{slug}-{h}'
    NEED[name] = (lang, text)
    return name


def synth_all():
    os.makedirs(VOICE_DIR, exist_ok=True)
    todo = {k: v for k, v in NEED.items() if not os.path.exists(os.path.join(VOICE_DIR, k + '.wav'))}
    az = {k: t for k, (l, t) in todo.items() if l == 'az'}
    en = {k: t for k, (l, t) in todo.items() if l == 'en'}
    if az:
        import torch
        from transformers import VitsModel, VitsTokenizer
        torch.set_num_threads(4)
        model = VitsModel.from_pretrained(MMS_DIR).eval()
        tok = VitsTokenizer.from_pretrained(MMS_DIR)
        model.noise_scale = 0.5
        model.noise_scale_duration = 0.65
        model.speaking_rate = 1.08
        sr = model.config.sampling_rate
        for n, (name, text) in enumerate(sorted(az.items())):
            pieces = []
            for k, (seg, pause) in enumerate(az_chunks(text)):
                torch.manual_seed(7 + k)
                ids = tok(az_lower(seg), return_tensors='pt')
                with torch.no_grad():
                    w = model(**ids).waveform[0].numpy().astype(np.float32)
                pieces.append(trim(w, sr))
                if pause:
                    pieces.append(np.zeros(int(sr * pause), np.float32))
            post(np.concatenate(pieces), sr, os.path.join(VOICE_DIR, name + '.wav'))
            print('az', f'{n + 1}/{len(az)}', text[:50])
    if en:
        from piper import PiperVoice, SynthesisConfig
        voice = PiperVoice.load(PIPER_VOICE)
        for n, (name, text) in enumerate(sorted(en.items())):
            single = len(text.split()) <= 2
            cfg = SynthesisConfig(length_scale=1.18 if single else 1.06, noise_scale=0.6, noise_w_scale=0.7)
            with tempfile.TemporaryDirectory() as td:
                p = os.path.join(td, 'e.wav')
                with wave.open(p, 'wb') as w:
                    voice.synthesize_wav(text if text[-1] in '.!?' else text + '.', w, syn_config=cfg)
                x, sr = read_wav(p)
            post(x, sr, os.path.join(VOICE_DIR, name + '.wav'))
            print('en', f'{n + 1}/{len(en)}', text)


DUR = {}


def dur(name):
    if name not in DUR:
        with wave.open(os.path.join(VOICE_DIR, name + '.wav'), 'rb') as w:
            DUR[name] = w.getnframes() / w.getframerate()
    return DUR[name]

# ---------------------------------------------------------------- səhnələr


class Scene:
    def __init__(self, typ, data=None, lead=0.5):
        self.typ, self.data = typ, data or {}
        self.t = lead
        self.cues, self.audio, self.sfx = {}, [], []

    def say(self, cue, name, gap=0.3):
        if cue:
            self.cues[cue] = self.t
        self.audio.append((self.t, name))
        self.t += dur(name) + gap

    def mark(self, cue):
        self.cues[cue] = self.t

    def wait(self, s):
        self.t += s

    def fx(self, name, at=None):
        self.sfx.append((self.t if at is None else at, name))


def steps(scene, items):
    for cue, lang, text, gap in items:
        scene.say(cue, clip(lang, text), gap)


def plan(dry):
    """dry=True: yalnız lazım olan klipləri toplayır. dry=False: səhnələri qurur."""
    if dry:
        global dur
        real = dur
        dur = lambda name: 1.0  # noqa: E731
    S = []

    s = Scene('intro', lead=1.2); steps(s, C.INTRO); s.wait(0.4); S.append(s)
    s = Scene('ladder'); steps(s, C.LADDER); S.append(s)
    s = Scene('regular'); steps(s, C.REGULAR); S.append(s)
    s = Scene('tips', {'tips': [[a, b] for a, b, _ in C.TIPS]})
    for i, (_, _, say) in enumerate(C.TIPS):
        s.say(f'tip{i}', clip('az', say), 0.45)
    s.wait(0.6); S.append(s)
    s = Scene('overview', {'groups': C.GROUPS, 'counts': [sum(v['g'] == g['n'] for v in C.VERBS) for g in C.GROUPS],
                           'examples': [' – '.join(next(v for v in C.VERBS if v['g'] == g['n'])['f']) for g in C.GROUPS]})
    steps(s, C.OVERVIEW); S.append(s)

    total = len(C.VERBS)
    for g in C.GROUPS:
        vs = [v for v in C.VERBS if v['g'] == g['n']]
        s = Scene('group', {'group': g, 'count': len(vs), 'first': vs[0]['n'], 'last': vs[-1]['n']}, lead=0.9)
        s.fx('whoosh', 0.2)
        steps(s, C.GROUP_INTRO[g['n']]); S.append(s)
        for v in vs:
            s = Scene('verb', {'verb': v, 'group': g, 'total': total}, lead=0.45)
            s.fx('pop', 0.05)
            for k in range(3):
                s.say(f'f{k}', clip('en', v['say'][k]), 0.32 if k < 2 else 0.5)
            s.say('tr', clip('az', v['trTts']), 0.75)
            S.append(s)
        s = Scene('review', {'group': g, 'verbs': vs}, lead=0.5)
        s.say('intro', clip('az', C.REVIEW_INTRO[1]), 0.5)
        for i, v in enumerate(vs):
            s.mark(f'v{i}')
            for k in range(3):
                s.say(None, clip('en', v['say'][k]), 0.1 if k < 2 else 0.42)
        s.mark('end'); s.wait(0.6); S.append(s)

    s = Scene('title', {'title': 'Özünü yoxla!', 'sub': 'Düzgün formanı tap', 'color': '#5b3fd6'}, lead=0.6)
    s.fx('whoosh', 0.1); steps(s, C.QUIZ_INTRO); S.append(s)
    for i, (pre, opts, post_, ans, full) in enumerate(C.QUIZ):
        s = Scene('quiz', {'pre': pre, 'opts': opts, 'post': post_, 'ans': ans, 'i': i, 'n': len(C.QUIZ)}, lead=0.7)
        s.fx('pop', 0.05)
        for k in range(3):
            s.fx('tick', s.t + k)
        s.wait(3.0); s.mark('reveal'); s.fx('ding'); s.wait(0.35)
        s.say('say', clip('en', full), 0.9)
        S.append(s)
    s = Scene('title', {'title': 'Hansı qrup?', 'sub': 'Qrupun nömrəsini de (1–5)', 'color': '#e57f24'}, lead=0.6)
    s.fx('whoosh', 0.1); s.say('a', clip('az', C.GROUP_QUIZ_INTRO[1]), 0.7); S.append(s)
    for i, (w, gn) in enumerate(C.GROUP_QUIZ):
        v = next(x for x in C.VERBS if x['f'][0] == w)
        g = C.GROUPS[gn - 1]
        s = Scene('gquiz', {'verb': v, 'group': g, 'i': i, 'n': len(C.GROUP_QUIZ)}, lead=0.5)
        s.fx('pop', 0.05)
        s.say('w', clip('en', w), 0.4)
        for k in range(3):
            s.fx('tick', s.t + k)
        s.wait(3.0); s.mark('reveal'); s.fx('ding'); s.wait(0.3)
        s.say('g', clip('az', C.GROUP_INTRO[gn][0][2]), 0.3)
        s.say('forms', clip('en', ', '.join(v['say']) + '.'), 0.9)
        S.append(s)
    s = Scene('outro', lead=0.8); s.fx('ding', 0.4); steps(s, C.OUTRO); S.append(s)

    if dry:
        dur = real
    return S


def build():
    plan(dry=True)
    synth_all()
    scenes = plan(dry=False)
    out, f0 = [], 0
    audio, sfx = [], []
    for s in scenes:
        n = int(round(s.t * FPS))
        out.append({'type': s.typ, 'from': f0, 'dur': n, 'data': s.data,
                    'cues': {k: int(round(v * FPS)) for k, v in s.cues.items()}})
        audio += [(f0 / FPS + t, nm) for t, nm in s.audio]
        sfx += [(f0 / FPS + t, nm) for t, nm in s.sfx]
        f0 += n
    tl = {'fps': FPS, 'total': f0, 'scenes': out}
    json.dump(tl, open(os.path.join(ROOT, 'src', 'timeline.json'), 'w', encoding='utf8'), ensure_ascii=False)
    print(f'səhnə: {len(out)}, müddət: {f0 / FPS:.1f} san ({f0 / FPS / 60:.1f} dəq), klip: {len(NEED)}')
    mix(f0 / FPS, audio, sfx, out)

# ---------------------------------------------------------------- miks


def tone(f, d, sr=SR):
    t = np.arange(int(d * sr)) / sr
    return t, np.sin(2 * np.pi * f * t)


def sfx_bank():
    r = np.random.default_rng(3)
    b = {}
    t, _ = tone(0, 0.12)
    f = 520 + 900 * (t / 0.12)
    b['pop'] = 0.35 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)
    t, _ = tone(0, 0.05)
    b['tick'] = 0.4 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90)
    t, _ = tone(0, 1.6)
    b['ding'] = 0.3 * sum(a * np.sin(2 * np.pi * 1046.5 * m * t) * np.exp(-t * (2.5 + m))
                          for m, a in [(1, 1), (2, .45), (3, .2), (4.2, .1)])
    n = r.standard_normal(int(0.7 * SR))
    t = np.arange(len(n)) / SR
    env = np.sin(np.pi * t / 0.7) ** 2
    # oturan filtr: kəsmə tezliyi zamanla yüksəlir
    y = np.zeros_like(n); a = 0.0
    for i in range(len(n)):
        k = 0.02 + 0.25 * (t[i] / 0.7)
        a += k * (n[i] - a); y[i] = a
    b['whoosh'] = 0.5 * y * env / max(1e-6, np.abs(y).max())
    return b


def music(total):
    """Yumşaq fon musiqisi: C – G – Am – F akkordları, pad + arpeccio, 92 BPM."""
    bpm = 92; beat = 60 / bpm; bar = 4 * beat
    chords = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]
    n = int(total * SR) + SR
    y = np.zeros(n, np.float32)
    hz = lambda m: 440 * 2 ** ((m - 69) / 12)  # noqa: E731
    bars = int(total / bar) + 2
    for bi in range(bars):
        ch = chords[bi % 4]
        s0 = int(bi * bar * SR)
        t = np.arange(int(bar * SR)) / SR
        env = np.minimum(1, t / 0.4) * np.minimum(1, (bar - t) / 0.5)
        pad = sum(np.sin(2 * np.pi * hz(m - 12) * t) + 0.3 * np.sin(2 * np.pi * hz(m) * 2 * t) for m in ch)
        seg = 0.035 * pad * env
        bass = 0.06 * np.sin(2 * np.pi * hz(ch[0] - 24) * t) * np.exp(-((t % (2 * beat)) * 1.5))
        seg += bass
        for k in range(8):
            m = ch[[0, 1, 2, 1, 0, 2, 1, 2][k]] + 12
            st = int(k * beat / 2 * SR)
            tt = np.arange(int(beat * 0.9 * SR)) / SR
            pl = 0.05 * (np.sin(2 * np.pi * hz(m) * tt) + 0.25 * np.sin(4 * np.pi * hz(m) * tt)) * np.exp(-tt * 6)
            e = min(len(seg), st + len(pl)); seg[st:e] += pl[:e - st]
        if s0 >= n:
            break
        e = min(n, s0 + len(seg)); y[s0:e] += seg[:e - s0]
    return y[:int(total * SR)]


def mix(total, audio, sfx, scenes):
    n = int(total * SR) + 1
    voice = np.zeros(n, np.float32)
    for t, nm in audio:
        x, _ = read_wav(os.path.join(VOICE_DIR, nm + '.wav'))
        s = int(t * SR); e = min(n, s + len(x)); voice[s:e] += x[:e - s]
    fx = np.zeros(n, np.float32)
    bank = sfx_bank()
    for t, nm in sfx:
        x = bank[nm]; s = int(t * SR); e = min(n, s + len(x)); fx[s:e] += x[:e - s]
    mus = music(total)[:n]
    if len(mus) < n:
        mus = np.pad(mus, (0, n - len(mus)))
    # danışanda musiqini azalt (ducking)
    win = int(0.25 * SR)
    env = np.convolve((np.abs(voice) > 0.02).astype(np.float32), np.ones(win) / win, 'same')
    duck = 1 - 0.55 * np.clip(env * 3, 0, 1)
    # girişdə və sonda musiqi bir az ucadan, son 2 san sönür
    fade = np.ones(n, np.float32)
    k = int(2.0 * SR); fade[-k:] = np.linspace(1, 0, k)
    out = voice + 0.55 * fx + 0.8 * mus * duck * fade
    out = out / max(1.0, np.abs(out).max() / 0.95)
    stereo = np.stack([out, out], 1).reshape(-1)
    write_wav(os.path.join(ROOT, 'public', 'mix.wav'), stereo, SR, 2)
    print('public/mix.wav hazırdır')


if __name__ == '__main__':
    build()
