# Mənbələr — «Bir stəkan su»

AI klipləri repoda saxlanmır. Yenidən render üçün endir ("iphone" mühiti lazımdır) və `public/clips/`-ə qoy:

```bash
mkdir -p public/clips && cd public/clips
curl -o a.mp4  https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214420_7a829812-62c6-49ac-ab61-4a0b1e712ad5.mp4
curl -o b1.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214421_70a326ab-783a-4b17-8a51-aa58c63839ce.mp4
curl -o b2.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214501_b4301a69-0ff7-407d-96d6-7bebbbe38253.mp4
curl -o b3.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214501_9d5631a3-fb8c-459a-a2bc-e1a162609871.mp4
curl -o c.mp4  https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214501_47748015-a933-4323-9c53-a06c94478e7c.mp4
curl -o d1.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214420_4316182d-bddc-48e7-b0a5-435150c767b2.mp4
curl -o d2.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214420_c46a6877-307b-449b-a9f2-922b3ae5a6fd.mp4
curl -o e1.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214910_99e69fcb-4c1d-4925-9d22-9701c67c4d1d.mp4
curl -o e2.mp4 https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261126_214420_2b49cd78-ca6d-4839-8fcb-babbad3855b5.mp4
```

## Kadrlar (GPT Image 2.6, keyfiyyət high, 16:9) — JPG nüsxələri `frames/`-dadır
| Fayl | Job ID | Nə üçün |
|---|---|---|
| ref.jpg | 9073ace9-9865-4145-a9a8-b93da79f9c0a | Əsas istinad kadrı (həyət, masa, oğlan, ata, İmam arxadan) |
| a.jpg | dcddde2b-caec-4d7b-9b47-82bebe71bb1b | 1-ci hissənin ilk kadrı |
| b1.jpg | 1f9bf94f-b2ed-41de-9fbf-43a0f8f7a4f0 | Ötürmə kamerası — yaşlı kişi |
| b2.jpg | 42f9de65-bb5f-4196-aa7b-cbcd9266bfdc | Eyni kamera — ata və qızı |
| b3.jpg | c2810c44-4f22-4889-93f1-56bae72ed001 | Eyni kamera — gənc |
| c.jpg / c_end.png | 0b755583-0a50-4552-a9f6-d15c61866b15 / 9d94ea76-38c7-467b-888b-5b19f157151e | Geniş plan, başlanğıc və son |
| d1.jpg | 647c9e40-d81e-4df1-880d-1086231dbd00 | Oğlanın əlləri, tökmə |
| d2.jpg | b955bfca-cf2b-4bc0-acd2-df5e85fbec81 | Oğlan stəkanla gedir |
| e1.jpg / e1_end.png | f10d5092-0a52-4e58-8f50-3669aa868867 / 18ca1374-dad1-431a-8791-54f90adf7d09 | Eyni ötürmə kamerası — oğlan verir, İmam alır |
| e2.jpg | 13639d28-1738-4990-ae86-0accc38aa927 | Son yaxın plan: əllər və stəkan |

## Video
Kling 3.0 Pro (`kling3_0`, mode pro, sound off, 16:9), başlanğıc kadr ilə; `c` və `e1` həm də son kadr ilə, `e2` start = end.
İlk `e1` variantı (job a64e23b3-3a8f-4afa-91db-ff8e88b62c86) rədd edildi: kadrın yuxarısında saqqal göründü, su qəhvəyiləşdi.

## Səs
Bütün səs zolağı `scripts/synth_audio.py` ilə numpy-da sintez olunur (hadisə vaxtları `scripts/events.py`): daş üzərində addımlar,
su tökülməsi, damla, şüşə toxunuşları, uzaq quşlar, uzaqlaşan izdiham uğultusu. Lisenziya problemi yoxdur.
