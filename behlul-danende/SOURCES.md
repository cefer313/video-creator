# Mənbələr

- **Görüntü:** heç bir AI klipi və ya şəkli istifadə olunmayıb — hamısı `src/` içində kodla (SVG) çəkilib.
- **Səslər (hazırkı):** ElevenLabs `text2speech_v2` (Higgsfield, 2026-11-27): rəvayətçi — Desmond, Bəhlul — Harrison, Harun — Gideon.
  Job ID-lər və fayl adları: `audio/elevenlabs_files.txt`; baza: https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/
- **Əvvəlki səs variantları:** istifadəçinin öz səsi — bir faylda yazılmış 17 cümlə (2026-11-27, ~2 dəq; fayl repoda saxlanılmır, istifadəçidədir).
  Kəsmə vaxtları `audio/recording_cuts.json`-dadır (Whisper ilə tapılıb, enerji qrafiki ilə yoxlanıb).
  Tembr Higgsfield `voice_change` ilə dəyişdirilib (2026-11-27, 10 kredit): rəvayətçi — Desmond, Bəhlul — Harrison, Harun — Gideon.
  Job ID-lər: rəvayətçi `4b569294-612f-4f71-aa54-f693f16e8555`, Bəhlul `f24dcda7-7989-4dc1-9426-4c6fb3900218`, Harun `d16d2df4-5d6f-494b-9258-c346e1ecc8c2`.
  Linklər: https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261127_194041_4b569294-612f-4f71-aa54-f693f16e8555.mp4 ,
  …/hf_20261127_194043_f24dcda7-7989-4dc1-9426-4c6fb3900218.mp4 , …/hf_20261127_194045_d16d2df4-5d6f-494b-9258-c346e1ecc8c2.mp4
  İlk versiyada Meta MMS səsi idi (`facebook/mms-tts-azj-script_latin`, CC BY-NC 4.0; `scripts/make_voices.py`).
- **Musiqi və effektlər:** numpy sintezi, `scripts/make_audio.py`.
- **Şrift:** Montserrat (`@fontsource/montserrat`, SIL OFL).
- **Hekayə:** Bəhlul Danəndə və Harun ər-Rəşidin taxtı haqqında xalq arasında məşhur rəvayət (bədii təqdimat).
