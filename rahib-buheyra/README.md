# Rahib Buheyranın əhvalatı

Həzrət Məhəmmədin (s) on iki yaşında Əbu Talib ilə Şam səfəri və rahib Buheyra ilə görüşü.
Mətn istifadəçinin «Dərs 3» sənədindən götürülüb (bəzi cümlələr qısaldılıb).

- Fayl: `out/rahib-buheyra.mp4`
- Format: 1080×1920 (9:16), 30 fps, H.264 `yuv420p`, `+faststart`, AAC, səs −15 LUFS
- Müddət: ~3 dəq 6 san, 28 səhnə (müddətlər diktor səsinə görə — `scripts/timing.py` → `src/timing.json`)
- Görüntü tam **Remotion** ilə çəkilib (AI klipi yoxdur). Səs: rollara görə ElevenLabs diktorları (~8 kredit),
  bax `SOURCES.md`. İri altyazılar da var.
- Peyğəmbər (s) heç bir kadrda fiqur kimi çəkilmir — yalnız formasız yumşaq nur (işıq) ilə işarə olunur.
  Digər personajlar üzsüz siluetlərdir.

## Fayllar

- `src/story.ts` — ssenari: səhnələr, mətnlər, danışanlar, müddətlər (mətni burada dəyiş).
- `src/art/parts.tsx` — rəsm hissələri (səma, qum, dəvə, karvan, bulud, ağac, kilsə, rahib, çıraq, nur).
- `src/art/scenes.tsx` — səhnə fonları.
- `src/Film.tsx` — montaj: keçidlər, yavaş zoom, altyazılar, başlıq və son kadr.
- `scripts/make_music.py` — fon musiqisi (numpy sintezi: Hicaz məqamında dron + ud + külək).
- `scripts/finalize.sh` — son kodlaşdırma; `scripts/stills.sh` — hər səhnədən yoxlama kadrı.

## Yenidən render

```bash
npm install
# public/voice/vNN.mp3 səslərini SOURCES.md-dəki linklərdən endir
npm run assets   # src/timing.json + public/music.wav
npm run render   # out/rahib-buheyra.mp4
```
