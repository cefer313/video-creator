# Bəhlul və xəlifənin taxtı

Bəhlul Danəndə haqqında məşhur rəvayət, «Sehrbaz Anton» Reels-inin üslubunda: düz rəngli 2D, kontursuz personajlar,
qırmızı pərdəli tünd bənövşəyi səhnə, söz-söz yığılan iri altyazılar.
Bəhlul xəlifə Harun ər-Rəşidin boş taxtına oturur, keşikçilər onu döyüb salır. Bəhlul ağlayır və Haruna deyir:
«Mən özümə yox, sənə ağlayıram. Bircə an oturdum, bu qədər zərbə yedim; sən ömrün boyu bu taxtdasan…»

- **Fayl:** `out/behlul-danende.mp4`
- **Format:** 1080×1920 (9:16), 30 fps, H.264 `yuv420p`, `+faststart`, AAC, səs −15 LUFS
- **Müddət:** ~69,8 san
- **Görüntü:** bütövlükdə kodla çəkilib: personajlar, saray, effektlər Remotion-da SVG ilə qurulub. AI krediti xərclənməyib.
- **Səs:** ElevenLabs (`text2speech_v2`, Higgsfield vasitəsilə): rəvayətçi — Desmond, Bəhlul — Harrison, Harun — Gideon.
  `scripts/fetch_elevenlabs.sh` faylları `audio/elevenlabs_files.txt`-dən endirir. Xərc: ~3,3 kredit.
  Əvvəlki variantlar: Meta MMS (`scripts/make_voices.py`), istifadəçinin öz yazısı (`scripts/import_recording.py`, `scripts/split_roles.py`).
  Musiqi (hicaz məqamında ud-qaval, kədərli ney) və effektlər numpy ilə sintez olunub. İlk versiyada Meta MMS səsi idi (`scripts/make_voices.py` qalır).
- Ekranda «RƏVAYƏT» yazılıb: bu, xalq arasında məşhur rəvayətin bədii təqdimatıdır.

## Hissələr

1. Hook: boş, parlayan taxt — «Xəlifənin taxtında bircə an oturmaq istərdinmi?»
2. Bəhlul çubuq atla saraya gəlir, lövhə yanır, taxta tullanıb rahatca oturur.
3. Keşikçilər girir, cizgi filmi davası (toz buludu), Bəhlul yerə düşür.
4. Bəhlul ağlayır, Harun gəlir.
5. Dialoq: «Sənə ağlayıram», tərəzi — hesab günü, Harunun gözləri dolur.
6. Nəticə: taxt, vəzifə, var-dövlət kartları qum kimi tökülür; sonda maddi dəstək çağırışı və «Bizə dəstək ol» düyməsi (ödəniş məlumatı verilmədiyi üçün göstərilmir).

Vaxtlar diktor səsinin uzunluğuna görə avtomatik hesablanır (`src/timeline.json`).

## Fayllar

- `src/script.json` — ssenari: altyazı mətni (`*söz*` sarı, `_söz_` narıncı vurğu), danışan, fasilələr.
- `src/Film.tsx` — rejissura: hər sətir üçün kamera, pozalar, effektlər.
- `src/chars.tsx` — personajlar (Bəhlul, Harun, keşikçi): qollar, gözlər, qaşlar, ağız, göz yaşı, çubuq at.
- `src/palace.tsx` — taxt otağı; `src/fx.tsx` — konfetti, parıltı, dava buludu, tərəzi, kartlar; `src/ui.tsx` — altyazı, etiket, banner, CTA.
- `scripts/make_voices.py` — səslər (MMS), `scripts/timing.py` — vaxt cədvəli, dodaq zərfi, söz vaxtları → `src/timeline.json`,
  `scripts/make_audio.py` — musiqi, effektlər, miks → `public/mix.wav`, `scripts/stills.mjs` — yoxlama kadrları, `scripts/finalize.sh`.

## Öz səsinizlə əvəz etmək

Bütün cümlələr bir faylda (hər cümlədən əvvəl nömrəsi deyilib): kəsmə vaxtlarını `audio/recording_cuts.json`-a yazın və
`python3 scripts/import_recording.py <fayl.m4a>` işlədin. Və ya `public/voice/` qovluğuna `l00.wav` … `l16.wav` (48 kHz mono, sıra `src/script.json`-dakı kimi) qoyun və bu əmri işlədin:

```bash
npm run assets && npm run render
```

Vaxtlar, altyazılar və dodaq hərəkəti yeni səsə görə özü uyğunlaşır.

## Yenidən render

```bash
npm install
bash scripts/fetch_elevenlabs.sh   # ElevenLabs səsləri; və ya öz yazınız: python3 scripts/import_recording.py <yazı.m4a>; və ya MMS: MMS_DIR=~/models/mms-tts-azj python3 scripts/make_voices.py
npm run assets   # src/timeline.json + public/mix.wav
npm run render   # out/behlul-danende.mp4
```
