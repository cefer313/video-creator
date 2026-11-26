# Səhrada dua

İstifadəçinin öz səs yazısı əsasında Reels: səhrada susuzluqdan həlak olmaq üzrə olan insan dua edir,
bulud və yağış gəlir, xilas olub ailəsinə qovuşur. Bədii təsəvvür səhnəsidir.

- Fayl: `out/sehrada-dua.mp4`
- Format: 1080×1920 (9:16), 30 fps, H.264 `yuv420p`, `+faststart`, AAC, səs −15 LUFS
- Müddət: 35 san
- Görüntü: yalnız qrafika (SVG siluetlər, dünlər, günəş, buludlar, yağış, ot) və karaoke altyazı. AI krediti xərclənməyib.
- Səs: `public/voice.m4a` — istifadəçinin öz yazısı (küyü azaldılıb, səviyyəsi bərabərləşdirilib). Fon musiqisi və effektlər numpy ilə sintez olunub.

## Fayllar

- `src/timeline.ts` — mətn və vaxtlar (səsdəki pauzalardan ölçülüb), hekayə mərhələləri.
- `src/Film.tsx` — səhnə: səma rəngləri, günəş, isti hava, çatlar, buludlar, yağış, ot, ev, ailə, altyazı.
- `src/Figure.tsx` — siluet personaj və pozalar (yeriş, diz çökmə, dua — ovuclar yuxarı, sinə qarşısında).
- `scripts/make_audio.py` — səsin təmizlənməsi + fon (külək, ürək döyüntüsü, ildırım, yağış, akkordlar).
- `scripts/finalize.sh` — son kodlaşdırma; `scripts/stills.sh` — yoxlama kadrları.

## Yenidən render

```bash
npm ci
npm run assets   # public/voice_clean.wav + public/music.wav
npm run render   # out/sehrada-dua.mp4
```
