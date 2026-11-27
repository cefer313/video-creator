# Video Creator — Claude üçün təlimat

Bu repozitoriya istifadəçinin videoları üçündür: reklam və Reels videoları, təqdimatlar, animasiya filmləri,
dini mövzulu qısa səhnələr. Dil dərslikləri (`ingilis_dili`, `fars-dili`, `-r-b-dili`) və saytlar/tətbiqlər
(`web-program`) burada deyil.
Bu fayldakı qaydalara hər söhbətdə əməl et.

## Ünsiyyət

- Həmişə **Azərbaycan dilində** cavab ver. Sadə, aydın izah et; texniki terminləri lazım olanda qısaca aç.
- Bilmədiyin və ya yoxlaya bilmədiyin şeyi açıq de (məs. səsin tələffüzünü qulaqla yoxlaya bilməmək). Uydurma.
- Higgsfield krediti xərclənən işlərdə sonda təxmini xərci de. Böyük xərcdən (~150 kreditdən çox) əvvəl təxmini qiyməti de.

## Git qaydaları

- Bu repozitoriyada dəyişiklikləri **birbaşa `main` budağına** yaz və göndər.
- Hər yeni video əlavə olunanda kök `README.md`-dəki cədvəli yenilə.
- Böyük ara fayllar (AI klipləri, xam səslər, `node_modules`) repoya əlavə olunmur — `.gitignore` + layihədə `SOURCES.md` (klip linkləri). Hazır son video (MP4) repoya əlavə olunur.

## Qovluq quruluşu

- Hər video öz qovluğunda: `<video-adi>/` (kiçik hərf, tire ilə, latın hərfləri). İçində:
  - `out/<ad>.mp4` — hazır video,
  - mənbə: Remotion layihəsi və ya montaj skripti (`assemble.sh`), səs yaradan skriptlər,
  - `SOURCES.md` — istifadə olunan AI kliplərinin/şəkillərin linkləri və job ID-ləri,
  - qısa `README.md` — nədir, müddət, format, necə yenidən render olunur.

## Ümumi video qaydaları

- Ekran mətnləri **Azərbaycan dilində**. Şrift Azərbaycan hərflərini, xüsusilə böyük **Ə**-ni dəstəkləməlidir: **Montserrat**, **Inter** uyğundur (Manrope böyük Ə-ni dəstəkləmir). Şriftlər `@fontsource` paketlərindən — render internet tələb etməsin.
- Reklamlarda **sübutsuz iddialar yazma**: satış/izləyici zəmanəti, "ən çox seçilən", "yerlər məhduddur", uydurma endirim, uydurma əlaqə məlumatı olmaz. Əlaqə məlumatı verilməyibsə, göstərilmir (konfiqurasiyada boş saxlanılır).
- Formatlar:
  - Reels/Instagram/WhatsApp: 1080×1920 (9:16), H.264, `yuv420p`, `+faststart`, səs −14…−16 LUFS; səssiz izləyənlər üçün iri altyazılar.
  - Kino/YouTube: 1920×1080 (16:9), 24 və ya 30 fps.
- Təhvildən əvvəl **hər səhnədən kadr çıxarıb bax**: mətn daşması, səhv hərəkət, personajın uyğunluğu, əllər, üzün gizliliyi (lazım olan yerdə). Problemli kadrı yenidən yarat.
- Musiqi: lisenziya problemi olmasın deyə ya sintez et (numpy), ya da istifadəçidən fayl istə. Səs effektləri: Mirelo SFX (Higgsfield) və ya sintez.

## Süni intellektlə video (Higgsfield)

- Personaj ardıcıllığı: əvvəl bir **əsas portret/kadr** (`gpt_image_2_6`, keyfiyyət `high`), sonra bütün səhnə kadrları ona istinadla.
- Video: **Kling 3.0 Pro** (`kling3_0`, `mode: pro`, `sound: off`), başlanğıc kadr ilə; hərəkət dəqiq olmalıdırsa **son kadrı da ver** (start + end). Tam hərəkətsiz səhnə üçün start = end, kamera hərəkəti montajda.
- İstifadəçinin şəkli varsa: `media_upload` → `curl PUT` (başlıqlar: `Content-Type`, `If-None-Match: *`) → `media_confirm`.
- Səs (diktor): ElevenLabs (`text2speech_v2`, variant `elevenlabs`).
  - Azərbaycanca qadın: **"Elena"**. Yetkin kişi: **"Desmond"** (alternativ "Harrison"). Gənc oğlan: **"Ian"**.
  - Rəqəmləri sözlə yaz ("dörd yüz manat"), "AZN" əvəzinə "manat". Reels üçün səsi lazım olsa ~15% sürətləndir (`atempo`).
- Montaj: Remotion (mətn/qrafika olan videolar) və ya ffmpeg (sadə birləşdirmə). Vaxtlar diktorun səs uzunluğuna görə hesablanır.

## Dini mövzulu səhnələr

- Hörmətlə və dəqiq göstər:
  - məsciddə ayaqqabısız;
  - səcdə: alın, burun, ovuclar, dizlər, ayaq barmaqları yerdə; dirsəklər yerdən yuxarı;
  - dua: ovuclar yuxarı, sinə qarşısında (təkbir duruşu ilə qarışdırma).
- Müqəddəs şəxslər (məs. İmam Mehdi) göstəriləndə **üz heç bir kadrda görünmür**: yalnız düz arxadan və ya əllərin yaxın planı; profil, əks, kölgə, parlayan üz də olmaz. Hər kadrı yoxla.
  - İstisna: istifadəçi özü nurlu üzlü istinad şəkli verib onu istəyəndə (məs. `yanindaki-yer/`) üz tam isti nurla örtülür,
    heç bir cizgi (göz, burun, ağız, saqqal) görünmür; yan/arxa rakurs olar, düz qabaqdan yaxın plan olmaz. Hər kadrı yenə yoxla.
- Bədii təsəvvür səhnələri tarixi rəvayət kimi təqdim edilmir.

## Mühit

- Higgsfield fayllarını endirmək/yükləmək üçün "iphone" bulud mühiti lazımdır (orada `d8j0ntlcm91z4.cloudfront.net`, `upload.higgsfield.ai` açıqdır).
  Higgsfield işi lazım olanda sessiyanı **özün dərhal "iphone" mühitinə keçir** (`switch_environment`, `network_only`) — istifadəçidən əvvəlcədən soruşma, söhbətdə icazə istəmə.
- Render üçün Chromium: `/opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell`.

## Mövcud videolar

Siyahı kök `README.md`-dədir. Qeydlər:
- `kufa-night/`, `unknown-benefactor/` — AI klipləri `cefer313/iphone` repozitoriyasında, `claude/confident-cray-07o93z` budağında qalır (bax `SOURCES.md`). O budaq silinməməlidir.
- `video-teqdimat/` — bir Remotion layihəsində iki kompozisiya: `Teqdimat` (xidmət təqdimatı) və `MuhasibReels`. Mətnlər: `src/config.ts`, `src/reels/content.ts`.
- `a-prayer-for-the-ummah/`, `mescidde-secde-dua/`, `yanindaki-yer/` — ffmpeg montajı (`assemble.sh`), klip linkləri `SOURCES.md`-də.
- `qeybet-olmasin/` — kreditsiz 3D: Remotion + `@remotion/three` (personajlar kodla), səslər Meta MMS (`facebook/mms-tts-azj-script_latin`, CC BY-NC 4.0; "iphone" mühitində `huggingface.co` və `us.aws.cdn.hf.co` açıqdır, torch PyPI-dən), musiqi/effektlər numpy. Öz səsi üçün: `public/voice/<id>.wav` + `npm run assets && npm run render`.
- `iphone` repozitoriyasının köhnə budaqlarında hələ qalanlar: `claude/affectionate-mendel-jg05c6` (stresli mühasib videosu), `claude/lucid-euler-usi4ww` (mühasib promo videosu; orada gündəlik və üzlüklər də var).

## Yeni qaydalar

İstifadəçi yeni qayda və ya üstünlük deyəndə (məs. "bundan sonra belə et"):
1. Onu bu fayla, uyğun bölməyə əlavə et (uyğun bölmə yoxdursa, aşağıdakı siyahıya).
2. Dəyişikliyi dərhal `main`-ə göndər.
3. İstifadəçiyə qısaca hansı qaydanı yadda saxladığını de.

### Əlavə olunmuş qaydalar (tarixlə)

- 2026-11-25 — Bu fayl yaradıldı; qaydalar əvvəlki video işlərindən toplandı.
- 2026-11-25 — Bütün videolar və video layihələri `iphone`-dan köçürüldü.
- 2026-11-25 — Müqəddəs şəxsin üzü üçün istisna: istifadəçinin öz nurlu istinad şəkli olanda nurla tam örtülmüş üz olar («Yanındakı yer»).
- 2026-11-26 — Higgsfield işində "iphone" mühitinə həmişə soruşmadan keçmək.
