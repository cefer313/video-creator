# Mənbələr

| Nə | Model | Job / media ID | Link |
|---|---|---|---|
| İstifadəçinin məscid videosu (IMG_8506.MOV → MP4, səssiz) | — | media `6976b37d-50b6-446f-b06f-9ff736ae780e` | Higgsfield-ə yüklənib |
| İstinad şəkli (saray zalı, `reference.jpg`) | — | media `d705ba55-e8f9-4176-8323-b0ee64e83b18` | Higgsfield-ə yüklənib |
| Saray zalına çevrilmiş klip | Seedance 2.5 (`seedance_2_5`, `mode: video_edit`, 720p, səssiz) | job `3da014a9-fe2a-4d96-be0c-5d27446f07b3` | https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261128_072218_3da014a9-fe2a-4d96-be0c-5d27446f07b3.mp4 |
| İstifadəçinin ikinci videosu (IMG_8507.MOV → MP4, səssiz; səs montajda orijinaldan) | — | media `2aa0f517-c9af-4199-a1e8-9eef15f42c02` | Higgsfield-ə yüklənib |
| Saray zalında oğlan | Seedance 2.5 (`seedance_2_5`, `mode: video_edit`, 720p, səssiz) | job `3582c64b-586e-4f2a-b5e6-9fa35e7705d4` | https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261128_074420_3582c64b-586e-4f2a-b5e6-9fa35e7705d4.mp4 |

Endirmək ("iphone" mühiti lazımdır):

```bash
mkdir -p clips && curl -o clips/seedance.mp4 'https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261128_072218_3da014a9-fe2a-4d96-be0c-5d27446f07b3.mp4'
curl -o clips/oglan.mp4 'https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks/hf_20261128_074420_3582c64b-586e-4f2a-b5e6-9fa35e7705d4.mp4'
```

## Prompt

Completely transform the interior in the reference video into the opulent palace hall shown in the reference image,
keeping the exact same camera movement, path, timing and perspective of the original video. Replace every surface:
white veined marble columns with gold Corinthian capitals and turquoise bands, white marble walls with carved lattice,
blue-turquoise-gold Persian mosaic tile panels, a domed ceiling with green and gold arabesque tiles and pointed-arch
lattice windows, carved wooden doors, golden hanging lanterns, golden floor lanterns and golden vases on carved wooden
cabinets, polished white marble floor with a long red-and-blue Persian carpet. The central niche becomes the
green-and-gold arabesque arch with the ornate golden throne with green velvet and the small red velvet stool with a
golden crown beside it, exactly as in the reference image. Warm, bright, rich colors, photorealistic, sharp detail.
Nothing of the original plain interior remains: no plain white walls, no grey columns, no green carpet, no air
conditioners, speakers, bookshelves or wall clocks. No people. Smooth, stable, consistent architecture across all frames.

## Prompt (saray zalında oğlan)

Replace only the background and surroundings of the reference video with the opulent palace hall from the reference
image. Keep the young man exactly as he is: the same face, beard, hair, identity, striped olive-green sweater, dark jeans,
the same walking, hand gestures, lip movements and timing, the same camera framing. Everything behind and around him
becomes the palace hall from the reference image: behind him the green-and-gold arabesque arch niche with the ornate
golden throne upholstered in green velvet and the red velvet stool with a golden crown, flanked by blue-turquoise-gold
mosaic tile panels, white veined marble columns with gold capitals, golden hanging lanterns, golden floor lanterns,
carved lattice windows above, polished white marble floor with a red-and-blue Persian carpet under his feet. Remove the
wooden door, the wall picture, the dark table, the glass bowl, the purple curtain and the old rug. Warm bright palace
lighting that falls naturally on the man, realistic shadows, photorealistic, stable consistent architecture across all frames.
