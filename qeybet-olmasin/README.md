# Qeybət olmasın, amma...

«Baxışını dəyiş» səhifəsi üçün Reels. İki gənc oğlan skamyada tum çırtlaya-çırtlaya qeybət edir:
«Qeybət olmasın, amma...», «Həqiqətdir!», «Mən bunu onun üzünə də deyərəm». Samir zəng edəndə Tural
«Qardaşım!» deyir. Kadr donur, danışan düzgün variantı ayə və fətva ilə izah edir. Sonra səhnə geri
sarılır və düz davranış göstərilir: Kənan dostunu dayandırır, onlar Samirə zəng edib kömək təklif edirlər.

- **Fayl:** `out/qeybet-olmasin.mp4`
- **Format:** 1080×1920 (9:16), 30 fps, H.264 `yuv420p`, `+faststart`, AAC, səs −15 LUFS
- **Müddət:** ~63,6 san
- **Görüntü:** bütövlükdə kodla qurulmuş 3D: Remotion + `@remotion/three` (Three.js). Personajlar, həyət,
  skamya, çinar, bina, işıq və kölgə hamısı kodla qurulub. AI krediti xərclənməyib.
- **Səs:** Meta MMS açıq səs modeli (`facebook/mms-tts-azj-script_latin`, lisenziya CC BY-NC 4.0). Model bir səslidir,
  Tural, Kənan və danışan tembr və sürətlə fərqləndirilib. Musiqi və effektlər numpy ilə sintez olunub.
- **Ekrandakı mənbələr:** Hücurat surəsi, 12-ci ayə (mənası); Ayətullah Sistani, «Geniş izahlı şəriət məsələləri»,
  I cild, məsələ 2264, 2266, 2269–2271.

## Hissələr

| Vaxt | Hissə |
|---|---|
| 0–21 san | Sual (ilk 3 san) + yanlış adət: səhnəcik, zəng, öskürək, donma və «Yanlış adət» |
| 21–47,5 san | Düzgün variant: «Olur», tərif, üç bəhanə, səsli mesaj/yazışma/göz-qaş, «Eşitdinsə / Etmisənsə» |
| 47,5–48,5 san | Geri sarma |
| 48,5–60,2 san | Düz davranış: «Samir burda yoxdur ki, özünü müdafiə etsin» |
| 60,2–63,6 san | Son: «Söhbəti dəyiş, baxışını dəyiş.» + «Save et və paylaş» |

## Fayllar

- `src/script.json` — ssenari: altyazı mətni və səsləndirmə üçün yazılış (mətni burada dəyiş).
- `src/timeline.json` — vaxt cədvəli və dodaq hərəkəti üçün səs zərfi (`scripts/timing.py` yaradır).
- `src/acting.ts` — rejissura: pozalar, jestlər, telefon, tum yemə, kamera kadrları.
- `src/three/Character.tsx` — personaj (IK qollar, göz, qaş, ağız), `Courtyard.tsx` — həyət, `World.tsx` — işıq və kamera, `textures.ts`.
- `src/ui.tsx` — ekran yazıları, `src/Film.tsx` — montaj.
- `scripts/make_voices.py` — səslər (MMS), `scripts/make_audio.py` — musiqi, effektlər, miks,
  `scripts/freeze.sh`, `scripts/finalize.sh`, `scripts/stills.sh`.

## Öz səsinizlə əvəz etmək

Səsləri siz və ya aktyorlar yazıb əvəz edə bilərsiniz. `public/voice/` qovluğuna replikaların adları ilə WAV faylları qoyun:
`t01`–`t07` Tural, `k01`–`k03` Kənan, `n01`–`n05` danışan (sıra `src/script.json`-dakı kimidir). Sonra bu əmrləri işlədin:

```bash
npm run assets && npm run render
```

Vaxtlar, altyazılar və dodaq hərəkəti yeni səsə görə özü uyğunlaşır.

## Yenidən render

```bash
npm install
# səslər (torch + transformers olan Python, MMS modeli MMS_DIR qovluğunda):
MMS_DIR=~/models/mms-tts-azj python3 scripts/make_voices.py
npm run assets   # src/timeline.json + public/mix.wav
npm run render   # public/freeze.jpg -> out/qeybet-olmasin.mp4
```
