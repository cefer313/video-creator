# Mənbələr — «Yanındakı yer»

Kliplər repoda saxlanmır. Yenidən render üçün endir ("iphone" mühiti lazımdır):

```bash
mkdir -p clips
curl -o clips/c1.mp4  https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092129_affc4e96-3692-454b-a74a-6cf7214f98a9.mp4
curl -o clips/c2a.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092128_40e35b51-01e8-4d52-af86-179e314d91c0.mp4
curl -o clips/c2b.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092128_74c8f5e7-d18d-4b91-8a04-6d5936303593.mp4
curl -o clips/c2c.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092128_8b4963eb-1ea9-4ff5-ad74-c2be0c53cc40.mp4
curl -o clips/c3.mp4  https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092127_4c44057d-36cc-4724-bb78-d5d27b9f6f67.mp4
curl -o clips/c4a.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092215_a6a8aab9-3f62-4bca-817b-4c85b964c45d.mp4
curl -o clips/c4b.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092214_7f686384-9db1-46a7-bb03-72bad1fdeff9.mp4
curl -o clips/c5a.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092214_03c7ca8f-bafb-4557-97ae-616ec4ef73a5.mp4
curl -o clips/c5b.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092216_97b77deb-9fc0-4786-98af-4a4e4fa156cc.mp4
curl -o clips/c5c.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092132_e781d71f-c335-46e0-8abf-81301ddb89d3.mp4
curl -o clips/c6a.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092128_593aab64-fc69-4e7e-9360-d1ac2f0ee374.mp4
curl -o clips/c6b.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092341_b8716986-b469-44ed-b5d8-23a51766de98.mp4
curl -o clips/c7.mp4  https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261125_092128_2fab5c15-694d-4887-9eb5-14f6df4505df.mp4
bash assemble.sh
```

## Şəkillər (GPT Image 2.6, keyfiyyət high, 9:16)
- İstifadəçinin istinad şəkli: Higgsfield media `08cef6f6-50dc-4c6d-a9be-0dc8071a89a3`.
- Əsas kadr (3D, nurlu üz): job `15bac548-81a9-477f-a5ed-e4ca923d11a9`.
- Səhnə kadrları (job ID): f1 `0a37021c`, f2a `d3fee101`, f2b `b65a7f5c`, f2c `71d6ed17`, f3 `81fd1f39`,
  f4a `706248a5`, f4b `17ed1279`, f5a `cc803295`, f5b `51e3945c`, f5c `99fd94fc`, f6a `7a6bed40`,
  f6b `c42f4386`, f7 `2a770e2f`, f7 son kadr `27ad4d5f`. Kadrların JPG nüsxələri `frames/`-dadır.

## Video
Kling 3.0 Pro (`kling3_0`, mode pro, sound off, 9:16), başlanğıc kadr ilə; c5a və c7 həm də son kadr ilə.

## Səs
- Dialoqlar ElevenLabs (`text2speech_v2`): sürücü "Desmond", ana və qız "Elena" ("Baba!" səsi incəldilib),
  İmamın duası "Harrison". Fayllar `audio_src/l*.mp3`.
- Musiqi, izdiham, küçə, telefon siqnalı, saat, qapı, araba: `synth_audio.py` ilə sintez (lisenziya problemi yoxdur).
