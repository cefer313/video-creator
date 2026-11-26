# Səs hadisələri (filmdə saniyə). Format: (növ, vaxt, ...parametrlər)
# step: (g, pan) · tap: (g, pan, f0) · thud: (g, pan) · pour: (dur, g, pan, f_start, f_end) · drip: (g, pan) · spill: (g, pan)
EVENTS = [
    # 1) Su masasında (0–5): barmaq stəkanı düzəldir, uzaqda kiçik tökmə, sonra birinci stəkan dolur
    ('tap', 0.55, 0.35, -0.5, 2500),
    ('pour', 0.35, 1.0, 0.25, 0.7, 700, 1000),
    ('tap', 1.45, 0.25, 0.6, 2300),
    ('pour', 3.95, 1.25, 0.9, 0.45, 380, 1150),
    # izdiham addımları (fonda)
    ('step', 0.9, 0.18, -0.8), ('step', 1.5, 0.15, -0.7), ('step', 2.6, 0.16, 0.8), ('step', 3.2, 0.14, 0.7),
    # 2) Verən əl (5–11): hər ötürmədə zəif şüşə toxunuşu, gələn-gedən addımlar
    ('tap', 5.62, 0.3, -0.1, 2350), ('step', 6.3, 0.25, -0.6), ('step', 6.75, 0.22, -0.7),
    ('tap', 7.62, 0.3, -0.1, 2350), ('step', 8.4, 0.25, -0.5), ('step', 8.9, 0.22, -0.6),
    ('tap', 9.55, 0.3, -0.1, 2350), ('step', 10.0, 0.35, -0.5), ('step', 10.35, 0.32, -0.7), ('step', 10.7, 0.28, -0.85),
    # 3) Oğlan geri baxır (11–17): sürahi yerə qoyulur, ata-oğul addımları, sonuncu damla, oğlan dayanır
    ('thud', 11.15, 0.45, 0.6),
    ('step', 11.05, 0.8, -0.3), ('step', 11.4, 0.6, -0.15), ('step', 11.55, 0.8, -0.35), ('step', 11.8, 0.6, -0.15),
    ('step', 12.05, 0.8, -0.35), ('step', 12.2, 0.6, -0.15), ('step', 12.55, 0.75, -0.35), ('step', 12.6, 0.5, -0.15),
    ('drip', 12.75, 0.9, 0.55),
    ('step', 13.05, 0.7, -0.35),           # atanın daha yarım addımı
    ('step', 13.35, 0.35, -0.15),          # oğlanın ayaqları dayanır
    # 4) Onun üçün bir stəkan (17–24): oğlan tökür, sürahini qoyur, iki kiçik addım, su barmağına daşır
    ('pour', 17.05, 2.15, 1.0, 0.05, 420, 1500),
    ('thud', 19.75, 0.35, 0.1),
    ('step', 21.05, 0.7, -0.1), ('step', 21.4, 0.55, 0.0), ('step', 21.8, 0.7, 0.05),
    ('step', 22.2, 0.55, 0.1), ('step', 22.65, 0.6, 0.15),
    ('spill', 22.35, 0.8, 0.1),
    ('step', 23.05, 0.4, 0.2),             # yavaşlayır, dayanır
    # 5) Alan əl (24–30): şüşə toxunuşu YOXDUR — stəkan onların əllərində qalır
]
