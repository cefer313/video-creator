# Mənbələr — A Prayer for the Ummah

Kliplər (`clips/`) repoya əlavə olunmayıb. Yenidən yığmaq üçün endirin:

```bash
mkdir -p clips && cd clips
B=https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks
curl -o c1.mp4 $B/hf_20261124_234040_a7a31b2e-83d8-4c9b-8e5e-81fe14da2c0d.mp4   # Shot 1 — bazar
curl -o c2.mp4 $B/hf_20261124_234155_50e68250-9b42-4c60-8e90-13b556717f39.mp4   # Shot 2 — aldatma
curl -o c3.mp4 $B/hf_20261124_234155_a4bcd93b-cd7a-4c53-a8f3-4a70b3f3fee1.mp4   # Shot 3 — alıcı gedir
curl -o c4.mp4 $B/hf_20261124_234155_5d226519-3a3d-4b0f-8634-4f1d5d8d4528.mp4   # Shot 4 — şahid (arxadan)
curl -o c5.mp4 $B/hf_20261124_234700_bb0fb7b1-19ae-434c-946d-5bd0211f9f7a.mp4   # Shot 5 — əllər duaya qalxır
curl -o c6.mp4 $B/hf_20261124_234631_c90cda03-8b9d-46ff-866f-40312afb8ead.mp4   # Shot 6 — dua
cd .. && bash assemble.sh
```

- Kadrlar: GPT Image 2.6 (əsas kadr job `ea049588-5854-4baf-9f8c-ce30cd481f06`), video: Kling 3.0 Pro.
- Dua səsi: ElevenLabs "Desmond" (`audio_src/voiceB.mp3`); alternativ "Harrison" (`voiceA.mp3`, `VOICE=audio_src/voiceA.mp3 bash assemble.sh`).
- Səs effektləri: Mirelo SFX (`audio_src/sfx_*.mp3`).
