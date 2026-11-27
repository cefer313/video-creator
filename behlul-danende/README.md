# Bəhlul və xəlifənin taxtı

Bəhlul Danəndə haqqında məşhur rəvayət, «Sehrbaz Anton» Reels-inin üslubunda: düz rəngli 2D, kontursuz personajlar,
qırmızı pərdəli tünd bənövşəyi səhnə, söz-söz yığılan iri altyazılar.
Bəhlul xəlifə Harun ər-Rəşidin boş taxtına oturur, keşikçilər onu döyüb salır. Bəhlul ağlayır və Haruna deyir:
«Mən özümə yox, sənə ağlayıram. Bircə an oturdum, bu qədər zərbə yedim; sən ömrün boyu bu taxtdasan…»

- **Fayl:** `out/behlul-danende.mp4`
- **Format:** 1080×1920 (9:16), 30 fps, H.264 `yuv420p`, `+faststart`, AAC, səs −15 LUFS
- **Müddət:** ~62,8 san
- **Görüntü:** bütövlükdə kodla çəkilib: personajlar, saray, effektlər Remotion-da SVG ilə qurulub. AI krediti xərclənməyib.
- **Səs:** Meta MMS açıq səs modeli (`facebook/mms-tts-azj-script_latin`, lisenziya CC BY-NC 4.0). Model bir səslidir:
  rəvayətçi, Bəhlul və Harun tembr və sürətlə fərqləndirilib. Musiqi (hicaz məqamında ud-qaval, kədərli ney) və effektlər numpy ilə sintez olunub.
- Ekranda «RƏVAYƏT» yazılıb: bu, xalq arasında məşhur rəvayətin bədii təqdimatıdır.

## Hissələr

| Vaxt | Hissə |
|---|---|
| 0–3,5 san | Hook: boş, parlayan taxt — «Xəlifənin taxtında bircə an oturmaq istərdinmi?» |
| 3,5–18,5 san | Bəhlul çubuq atla saraya gəlir, lövhə yanır, taxta tullanıb rahatca oturur |
| 18,5–24,5 san | Keşikçilər girir, cizgi filmi davası (toz buludu), Bəhlul yerə düşür |
| 24,5–31 san | Bəhlul ağlayır, Harun gəlir |
| 31–52,4 san | Dialoq: «Sənə ağlayıram», tərəzi — hesab günü, Harunun gözləri dolur |
| 52,4–62,8 san | Nəticə: taxt, vəzifə, var-dövlət kartları qum kimi tökülür; «Bəyəndinsə, dostunla paylaş» |

## Fayllar

- `src/script.json` — ssenari: altyazı mətni (`*söz*` sarı, `_söz_` narıncı vurğu), danışan, fasilələr.
- `src/Film.tsx` — rejissura: hər sətir üçün kamera, pozalar, effektlər.
- `src/chars.tsx` — personajlar (Bəhlul, Harun, keşikçi): qollar, gözlər, qaşlar, ağız, göz yaşı, çubuq at.
- `src/palace.tsx` — taxt otağı; `src/fx.tsx` — konfetti, parıltı, dava buludu, tərəzi, kartlar; `src/ui.tsx` — altyazı, etiket, banner, CTA.
- `scripts/make_voices.py` — səslər (MMS), `scripts/timing.py` — vaxt cədvəli, dodaq zərfi, söz vaxtları → `src/timeline.json`,
  `scripts/make_audio.py` — musiqi, effektlər, miks → `public/mix.wav`, `scripts/stills.mjs` — yoxlama kadrları, `scripts/finalize.sh`.

## Öz səsinizlə əvəz etmək

`public/voice/` qovluğuna `l00.wav` … `l16.wav` (48 kHz mono, sıra `src/script.json`-dakı kimi) qoyun və bu əmri işlədin:

```bash
npm run assets && npm run render
```

Vaxtlar, altyazılar və dodaq hərəkəti yeni səsə görə özü uyğunlaşır.

## Yenidən render

```bash
npm install
MMS_DIR=~/models/mms-tts-azj python3 scripts/make_voices.py   # torch + transformers lazımdır
npm run assets   # src/timeline.json + public/mix.wav
npm run render   # out/behlul-danende.mp4
```
