#!/usr/bin/env python3
"""Replikaları Meta MMS (facebook/mms-tts-azj-script_latin, lisenziya CC-BY-NC 4.0) modeli ilə səsləndirir.
Model bir səslidir: personajlar sürət və tembrlə (ffmpeg rubberband: pitch + formant) fərqləndirilir.
Giriş: src/script.json. Çıxış: public/voice/<id>.wav (48 kHz mono).
İşə salmaq: MMS_DIR=<model qovluğu> <torch+transformers olan python> scripts/make_voices.py
Model: https://huggingface.co/facebook/mms-tts-azj-script_latin"""
import json, os, re, subprocess, sys, tempfile, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MMS_DIR = os.environ.get('MMS_DIR', os.path.expanduser('~/models/mms-tts-azj'))
OUT = os.path.join(ROOT, 'public', 'voice')

# Personajlar: model sürəti, əlavə temp (ton dəyişmədən), səs tonu (pitch nisbəti; formant da onunla sürüşür), həcm
VOICE = {
    'narr':   {'rate': 1.22, 'tempo': 1.04, 'pitch': 0.84, 'gain_db': 0.0},
    'behlul': {'rate': 1.30, 'tempo': 1.06, 'pitch': 1.06, 'gain_db': 0.0},
    'harun':  {'rate': 1.14, 'tempo': 1.00, 'pitch': 0.76, 'gain_db': 0.5},
}
_OLD = {
    'tural':    {'rate': 1.34, 'tempo': 1.06, 'pitch': 1.10, 'gain_db': 0.0},
    'kenan':    {'rate': 1.26, 'tempo': 1.05, 'pitch': 0.97, 'gain_db': 0.0},
    'narrator': {'rate': 1.30, 'tempo': 1.08, 'pitch': 0.83, 'gain_db': 0.0},
}
PAUSE = {',': 0.12, '—': 0.18, ':': 0.20, '.': 0.24, '!': 0.24, '?': 0.24, '…': 0.30}


def az_lower(s: str) -> str:
    return s.replace('I', 'ı').replace('İ', 'i').lower()


def chunks(text: str):
    """Mətni durğu işarələrinə görə parçalara bölür: [(parça, sonrakı fasilə san)]."""
    t = text.replace('...', '…').replace('?..', '?')
    t = re.sub(r'[“”«»"]', '', t)
    parts = re.split(r'([,—:.!?…])', t)
    out = []
    for i in range(0, len(parts), 2):
        seg = parts[i].strip()
        p = parts[i + 1] if i + 1 < len(parts) else ''
        if seg:
            out.append([seg, PAUSE.get(p, 0.0)])
        elif out and p:
            out[-1][1] = max(out[-1][1], PAUSE.get(p, 0.0))
    if out:
        out[-1][1] = 0.0
    return out


def write_wav(path, x, sr):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((x * 32767).astype('<i2').tobytes())


def read_wav(path):
    with wave.open(path, 'rb') as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768
    return x, sr


def trim(x, sr, thr=0.012):
    env = np.convolve(np.abs(x), np.ones(int(sr * 0.01)) / int(sr * 0.01), 'same')
    idx = np.where(env > thr)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(sr * 0.02)); b = min(len(x), idx[-1] + int(sr * 0.06))
    return x[a:b]


def main():
    import torch
    from transformers import VitsModel, VitsTokenizer
    torch.set_num_threads(4)
    model = VitsModel.from_pretrained(MMS_DIR).eval()
    tok = VitsTokenizer.from_pretrained(MMS_DIR)
    model.noise_scale = 0.55
    model.noise_scale_duration = 0.7
    sr = model.config.sampling_rate
    os.makedirs(OUT, exist_ok=True)
    lines = json.load(open(os.path.join(ROOT, 'src', 'script.json'), encoding='utf8'))['lines']
    only = set(sys.argv[1:])
    for n, ln in enumerate(lines):
        if only and ln['id'] not in only:
            continue
        v = VOICE[ln['who']]
        model.speaking_rate = v['rate']
        pieces = []
        for k, (seg, pause) in enumerate(chunks(re.sub(r'[*_]', '', ln.get('tts', ln['text'])))):
            torch.manual_seed(1000 + n * 10 + k)
            ids = tok(az_lower(seg), return_tensors='pt')
            with torch.no_grad():
                wav = model(**ids).waveform[0].numpy().astype(np.float32)
            pieces.append(trim(wav, sr))
            if pause:
                pieces.append(np.zeros(int(sr * pause), np.float32))
        raw = np.concatenate(pieces)
        with tempfile.TemporaryDirectory() as td:
            a = os.path.join(td, 'a.wav'); b = os.path.join(td, 'b.wav')
            write_wav(a, raw / max(1e-6, np.abs(raw).max()) * 0.9, sr)
            subprocess.run(['ffmpeg', '-nostdin', '-y', '-loglevel', 'error', '-i', a, '-af',
                            f"aresample=48000,rubberband=tempo={v['tempo']}:pitch={v['pitch']}:pitchq=quality,"
                            "highpass=f=70,equalizer=f=3200:t=q:w=1.2:g=2",
                            '-ar', '48000', '-ac', '1', b], check=True)
            x, sr2 = read_wav(b)
        x = trim(x, sr2)
        rms = np.sqrt(np.mean(x[np.abs(x) > 0.01] ** 2)) if np.any(np.abs(x) > 0.01) else 0.1
        x = x * (10 ** ((-19 + v['gain_db']) / 20) / max(rms, 1e-4))
        x = np.tanh(x * 1.2) / np.tanh(1.2)
        write_wav(os.path.join(OUT, f"{ln['id']}.wav"), x, sr2)
        print(ln['id'], ln['who'], f'{len(x) / sr2:.2f} san')


if __name__ == '__main__':
    main()
