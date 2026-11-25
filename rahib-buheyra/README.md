# Rahib Buheyranın əhvalatı

Həzrət Məhəmmədin (s) on iki yaşında Əbu Talib ilə Şam səfəri və rahib Buheyra ilə görüşü.
Mətn istifadəçinin «Dərs 3» sənədindən götürülüb (bəzi cümlələr qısaldılıb).

- Fayl: `out/rahib-buheyra.mp4`
- Format: 1080×1920 (9:16), 30 fps, H.264 `yuv420p`, `+faststart`, AAC, səs −15 LUFS
- Müddət: ~3 dəq 15 san, 28 səhnə (müddətlər diktor səsinə görə — `scripts/timing.py` → `src/timing.json`)
- Görüntü: 22 AI rəsm kadrı (`gpt_image_2_6`) + 5 hərəkətli Kling 3.0 Pro klipi, Remotion-da kamera
  hərəkəti, toz, işıq və karaoke altyazı ilə yığılıb. Səs: rollara görə ElevenLabs diktorları. Bax `SOURCES.md`.
- Xərc: ~86 Higgsfield krediti (səslər ~8, kadrlar ~29, klipler ~44, səs çevirmə 6).
- Buheyra və Əbu Talib: istifadəçinin öz səsi, `voice_change` ilə tembri dəyişdirilib.
- Peyğəmbər (s) yalnız düz arxadan göstərilir, üzü heç bir kadrda görünmür; başının ətrafında yumşaq nur var.

## Fayllar

- `src/story.ts` — ssenari: səhnələr, mətnlər, danışanlar, müddətlər (mətni burada dəyiş).
- `src/visuals.ts` — hər səhnənin kadrı/klipi, kamera hərəkəti və nurun yeri.
- `src/Film.tsx` — montaj: keçidlər, kamera hərəkəti, toz, karaoke altyazı, başlıq və son kadr.
- `scripts/make_music.py` — fon musiqisi (numpy sintezi: Hicaz məqamında dron + ud + külək).
- `scripts/finalize.sh` — son kodlaşdırma; `scripts/stills.sh` — hər səhnədən yoxlama kadrı.

## Yenidən render

```bash
npm install
# public/voice, public/img, public/clips fayllarını SOURCES.md-dəki linklərdən endir
npm run assets   # src/timing.json + public/music.wav
npm run render   # out/rahib-buheyra.mp4
```
