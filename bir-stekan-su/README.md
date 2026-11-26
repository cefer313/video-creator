# Bir stəkan su

30 saniyəlik 3D animasiya qısametrajlı film (1920×1080, 24 fps, 720 kadr, H.264 + stereo AAC). Dialoq, diktor və ekran mətni yoxdur.

Gün batımı, məscid həyəti. İmam Mehdi (ə.f.) keçənlərə su verir. Yeddi yaşlı bir oğlan hamının gözündən qaçan şeyi görür:
hamıya su verən adam tək qalıb. Oğlan geri qayıdır və ona bir stəkan su süzür.
Səhnə bədii təsəvvürdür, tarixi rəvayət kimi təqdim edilmir. İmamın üzü heç bir kadrda görünmür
(yalnız arxadan/kəsik kadrda əllər; geniş planda arxadan, başı nurla örtülü).

- Hazır film: `out/bir-stekan-su.mp4`

## Kadr cədvəli (`src/shots.ts`)
| Kadr | Hissə | Klip(lər) |
|---|---|---|
| 0–119 | Su masasında: oğlan stəkanı düzəldir, İmamın əli sürahini əyir | `a` |
| 120–263 | Verən əl: eyni kameradan üç ötürmə (yaşlı kişi, ata və qızı, gənc) | `b1`, `b2`, `b3` (hər biri 2 san) |
| 264–407 | İlk geniş plan: İmam tək qalır, damla düşür, oğlan geri baxır | `c` |
| 408–575 | Onun üçün bir stəkan: oğlan su süzür, stəkanla iki addım | `d1` (4 san), `d2` (3 san) |
| 576–719 | Alan əl: eyni ötürmə kamerası, stəkan soldan sağa; son yaxın plan | `e1` (3 san), `e2` (3 san) |

## Necə qurulub
- Kadrlar: GPT Image 2.6 (bir əsas istinad kadrına əsasən), video: Kling 3.0 Pro. Linklər və job ID-ləri — `SOURCES.md`.
- Montaj və render: Remotion (`src/`). Səs: `scripts/synth_audio.py` (numpy sintezi), hadisə vaxtları `scripts/events.py`.
  Son ötürmədə şüşə səsi qəsdən yoxdur — stəkan onların əllərində qalır.

## Yenidən render
```bash
npm install
# klipləri SOURCES.md-dəki əmrlərlə public/clips/-ə endir
npm run render
```
