# Qaydasız feillər — Irregular Verbs

Uşaqlar üçün səsli, izahlı video dərs: ingilis dilinin 66 qaydasız feili 5 qrupda. Hər feil kartında
üç forma ayrıca səslənir (ingiliscə), sonra tərcüməsi deyilir (azərbaycanca). Hər qrupdan sonra «mahnı kimi»
təkrar, sonda test.

- **Fayl:** `out/qaydasiz-feiller.mp4`
- **Format:** 1920×1080 (16:9), 30 fps, H.264 `yuv420p`, `+faststart`, AAC, səs −15 LUFS
- **Müddət:** ~12,6 dəq
- **Səs:** azərbaycanca — Meta MMS, ingiliscə — Piper (açıq modellər, kreditsiz). Bax `SOURCES.md`.

## Hissələr

1. Giriş · Feil nədir? (3 forma — nərdivan: go / went / gone) · Qaydalı və qaydasız feillər
2. 7 sehrli fənd · Qruplar bir baxışda
3. 1-ci qrup «Üçü də eyni» (8) → 2-ci «Gedib geri qayıdan» (3) → 3-cü «Əkiz qardaşlar» (28) →
   4-cü «Mahnı qrupu: i – a – u» (5) → 5-ci «Hamısı fərqli» (22). Hər qrupdan sonra mahnı kimi təkrar.
4. Test: «Düzgün formanı tap» (7 sual, 3 saniyə geri sayım) və «Hansı qrup?» (5 sual)
5. Son: «Afərin!»

Yadda saxlamaq üçün kartlarda vizual işarələr: 1-ci qrupda «=», 2-ci qrupda 1-ci və 3-cü formanı birləşdirən
«eyni» qövsü, 3-cü qrupda «əkiz» mötərizəsi və dəyişən sonluq (-ought / -aught, -t, -d), 4-cü qrupda dəyişən sait
(i → a → u), 5-ci qrupda -n / -en sonluğu rənglə seçilir.

## Fayllar

- `scripts/content.py` — bütün mətnlər: feillər, tələffüz, tərcümə, izahlar, test sualları (mətni burada dəyiş).
- `scripts/build.py` — səsləri yaradır (keşlə, `public/voice/`), `src/timeline.json` və `public/mix.wav` qurur.
- `src/scenes.tsx` — səhnələr, `src/Lesson.tsx` — montaj, `src/ui.tsx` — rənglər və animasiya köməkçiləri.
- `scripts/stills.mjs` — yoxlama kadrları (`out/check/`), `scripts/render_chunks.sh` — render.

## Yenidən render

```bash
npm install
# Python mühiti: torch, transformers, piper-tts, numpy
# Modellər: facebook/mms-tts-azj-script_latin -> ~/models/mms-tts-azj,
#           rhasspy/piper-voices en_US-lessac-medium -> ~/models/piper/en/en_US/lessac/medium/
python scripts/build.py   # səslər + src/timeline.json + public/mix.wav
npm run render            # out/qaydasiz-feiller.mp4
```

Bir səsi öz səsinlə əvəz etmək üçün `public/voice/` içindəki eyni adlı WAV faylını dəyiş və `python scripts/build.py`
işlət — vaxtlar yeni səsin uzunluğuna görə özü uyğunlaşır.
