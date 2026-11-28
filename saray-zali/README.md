# Saray zalı

İstifadəçinin məscid içində çəkdiyi video (IMG_8506.MOV, yavaş panorama) süni intellektlə istifadəçinin verdiyi
istinad şəklindəki saray zalına çevrilib (`reference.jpg`). Kamera hərəkəti orijinaldakı kimi qalıb, köhnə
interyerdən heç nə qalmayıb.

- **Fayl:** `out/saray-zali.mp4`
- **Müddət / format:** 13,7 san · 1920×1080 (16:9) · 24 fps · H.264 · səssiz
- **Dəyişənlər:** boz sütunlar → qızılı başlıqlı ağ mərmər sütunlar; ağ divarlar → oyma mərmər, göy-firuzəyi-qızılı kaşı
  panelləri; tavan → yaşıl-qızılı naxışlı günbəz və tağlı şəbəkə pəncərələr; mehrab → yaşıl-qızılı tağ, qızılı taxt və
  tac qoyulmuş qırmızı məxmər kətil; yaşıl xalça → ağ mərmər döşəmə və uzun qırmızı-göy fars xalçası; qızılı fənərlər,
  oyma taxta qapılar və şkaflar.
- **Model:** Seedance 2.5 (`video_edit`, 720p, Higgsfield), istinad şəkli ilə, ~105 kredit. Montajda 1080p-yə böyüdülüb.

## İkinci video: saray zalında oğlan

İstifadəçinin ikinci videosunda (IMG_8507.MOV) oğlan qapı önündə danışır. Oğlan olduğu kimi qalıb: üzü, paltarı,
hərəkətləri, səsi dəyişməyib. Arxa fon isə eyni saray zalına çevrilib: qızılı taxt, tac, kaşı panelləri, fars xalçası.

- **Fayl:** `out/saray-zali-oglan.mp4`
- **Müddət / format:** 7,3 san · 1080×1920 (9:16, Reels) · 30 fps · H.264 · −14 LUFS · oğlanın öz səsi
- **Model:** Seedance 2.5 (`video_edit`, 720p), istinad şəkli ilə, ~55 kredit. Model klipi ~4% sürətli verib —
  dodaqlar səslə tutuşsun deyə montajda orijinal uzunluğa qaytarılıb.

## Yenidən render
1. `SOURCES.md`-dəki əmrlərlə klipləri `clips/` qovluğuna endir (`seedance.mp4`, `oglan.mp4`);
   ikinci video üçün istifadəçinin orijinalı `clips/IMG_8507.MOV` (səs ondan götürülür).
2. `bash assemble.sh` — saray zalı; `bash assemble_oglan.sh` — saray zalında oğlan.
