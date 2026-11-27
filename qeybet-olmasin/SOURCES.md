# Mənbələr

- **AI klipləri və şəkillər:** yoxdur. Bütün görüntü kodla qurulub (`src/three/`).
- **Səs modeli:** Meta MMS-TTS, Azərbaycan dili (latın əlifbası) —
  https://huggingface.co/facebook/mms-tts-azj-script_latin — lisenziya **CC BY-NC 4.0**: yalnız qeyri-kommersiya
  istifadəsi, müəllif göstərilməlidir (V. Pratap və b., «Scaling Speech Technology to 1,000+ Languages», Meta AI, 2023).
  Model və yaradılan səs faylları repoya əlavə olunmur; `scripts/make_voices.py` onları yenidən yaradır (sabit toxumla).
- **Musiqi və səs effektləri:** `scripts/make_audio.py` — numpy sintezi, xarici fayl yoxdur.
- **Şrift:** Montserrat (`@fontsource/montserrat`, SIL Open Font License).
- **Dini mənbələr (ekranda və açıqlamada):**
  - Qurani-Kərim, Hücurat surəsi, 12-ci ayə (ekranda mənası verilib).
  - Ayətullah əl-üzma Seyid Əli Sistani, «Geniş izahlı şəriət məsələləri», I cild, «Qeybət» bölməsi,
    məsələ 2264, 2266, 2269, 2270, 2271 (səh. 507–508). Tərcümə: Bəxtiyar Hüseynov. «Zərdabi LTD» MMC, Bakı, 2018.
    Mətn `cefer313/web-program` reposundakı «Şəriət məsələləri» oxuyucusundan yoxlanılıb.
