"""«Qaydasız feillər» videosunun məzmunu: feillər, qruplar, izah mətnləri, test sualları.
Ekran mətni ilə səsləndirmə mətni ayrıdır: `az(...)` Meta MMS ilə (azərbaycanca), `en(...)` Piper ilə (ingiliscə)."""

# Qruplar: ad, ləqəb, qayda, rəng
GROUPS = [
    {'n': 1, 'name': 'Üçü də eyni', 'rule': 'cut – cut – cut', 'color': '#2e9e5b', 'soft': '#e3f4ea'},
    {'n': 2, 'name': 'Gedib geri qayıdan', 'rule': '1-ci = 3-cü', 'color': '#e57f24', 'soft': '#fdecdc'},
    {'n': 3, 'name': 'Əkiz qardaşlar', 'rule': '2-ci = 3-cü', 'color': '#2f7fe0', 'soft': '#e2edfb'},
    {'n': 4, 'name': 'Mahnı qrupu: i – a – u', 'rule': 'i → a → u', 'color': '#9447d9', 'soft': '#f0e5fa'},
    {'n': 5, 'name': 'Hamısı fərqli', 'rule': 'üçü də fərqli', 'color': '#e5484d', 'soft': '#fde4e4'},
]

# (qrup, 1-ci, 2-ci, 3-cü, tələffüz, tərcümə (ekran), tərcümə (səs), ingiliscə deyiliş üçün dəyişikliklər)
V = [
    (1, 'cut', 'cut', 'cut', 'kat – kat – kat', 'kəsmək', 'kəsmək'),
    (1, 'put', 'put', 'put', 'put – put – put', 'qoymaq', 'qoymaq'),
    (1, 'let', 'let', 'let', 'let – let – let', 'icazə vermək', 'icazə vermək'),
    (1, 'hit', 'hit', 'hit', 'hit – hit – hit', 'vurmaq', 'vurmaq'),
    (1, 'shut', 'shut', 'shut', 'şat – şat – şat', 'bağlamaq (qapını)', 'bağlamaq'),
    (1, 'cost', 'cost', 'cost', 'kost – kost – kost', 'qiyməti olmaq', 'qiyməti olmaq'),
    (1, 'hurt', 'hurt', 'hurt', 'hərt – hərt – hərt', 'ağrıtmaq, incitmək', 'ağrıtmaq, incitmək'),
    (1, 'read', 'read', 'read', 'rid – red – red', 'oxumaq (kitab)', 'oxumaq'),
    (2, 'come', 'came', 'come', 'kam – keym – kam', 'gəlmək', 'gəlmək'),
    (2, 'become', 'became', 'become', 'bikam – bikeym – bikam', 'olmaq (çevrilmək)', 'olmaq, çevrilmək'),
    (2, 'run', 'ran', 'run', 'ran – ren – ran', 'qaçmaq', 'qaçmaq'),
    (3, 'buy', 'bought', 'bought', 'bay – bot – bot', 'almaq (satın)', 'satın almaq'),
    (3, 'bring', 'brought', 'brought', 'brinq – brot – brot', 'gətirmək', 'gətirmək'),
    (3, 'think', 'thought', 'thought', 'θinq – θot – θot', 'düşünmək', 'düşünmək'),
    (3, 'teach', 'taught', 'taught', 'tiç – tot – tot', 'öyrətmək', 'öyrətmək'),
    (3, 'catch', 'caught', 'caught', 'keç – kot – kot', 'tutmaq', 'tutmaq'),
    (3, 'fight', 'fought', 'fought', 'fayt – fot – fot', 'döyüşmək, dalaşmaq', 'döyüşmək'),
    (3, 'sleep', 'slept', 'slept', 'slip – slept – slept', 'yatmaq', 'yatmaq'),
    (3, 'keep', 'kept', 'kept', 'kip – kept – kept', 'saxlamaq', 'saxlamaq'),
    (3, 'feel', 'felt', 'felt', 'fil – felt – felt', 'hiss etmək', 'hiss etmək'),
    (3, 'meet', 'met', 'met', 'mit – met – met', 'görüşmək, tanış olmaq', 'görüşmək'),
    (3, 'leave', 'left', 'left', 'liv – left – left', 'getmək, tərk etmək', 'tərk etmək'),
    (3, 'send', 'sent', 'sent', 'send – sent – sent', 'göndərmək', 'göndərmək'),
    (3, 'spend', 'spent', 'spent', 'spend – spent – spent', 'xərcləmək (pul, vaxt)', 'xərcləmək'),
    (3, 'build', 'built', 'built', 'bild – bilt – bilt', 'tikmək', 'tikmək'),
    (3, 'have', 'had', 'had', 'hev – hed – hed', 'sahib olmaq, var olmaq', 'sahib olmaq'),
    (3, 'make', 'made', 'made', 'meyk – meyd – meyd', 'düzəltmək, etmək', 'düzəltmək'),
    (3, 'say', 'said', 'said', 'sey – sed – sed', 'demək', 'demək'),
    (3, 'pay', 'paid', 'paid', 'pey – peyd – peyd', 'ödəmək', 'ödəmək'),
    (3, 'tell', 'told', 'told', 'tel – tould – tould', 'danışmaq, söyləmək', 'danışmaq, söyləmək'),
    (3, 'sell', 'sold', 'sold', 'sel – sould – sould', 'satmaq', 'satmaq'),
    (3, 'hear', 'heard', 'heard', 'hir – hərd – hərd', 'eşitmək', 'eşitmək'),
    (3, 'find', 'found', 'found', 'faynd – faund – faund', 'tapmaq', 'tapmaq'),
    (3, 'sit', 'sat', 'sat', 'sit – set – set', 'oturmaq', 'oturmaq'),
    (3, 'stand', 'stood', 'stood', 'stend – stud – stud', 'durmaq (ayaq üstə)', 'ayaq üstə durmaq'),
    (3, 'understand', 'understood', 'understood', 'andərstend – andərstud – andərstud', 'başa düşmək', 'başa düşmək'),
    (3, 'lose', 'lost', 'lost', 'luz – lost – lost', 'itirmək', 'itirmək'),
    (3, 'win', 'won', 'won', 'win – wan – wan', 'qalib gəlmək, udmaq', 'qalib gəlmək'),
    (3, 'get', 'got', 'got', 'qet – qat – qat', 'almaq, əldə etmək', 'əldə etmək'),
    (4, 'begin', 'began', 'begun', 'biqin – biqen – biqan', 'başlamaq', 'başlamaq'),
    (4, 'drink', 'drank', 'drunk', 'drink – drenk – drank', 'içmək', 'içmək'),
    (4, 'sing', 'sang', 'sung', 'sinq – senq – sanq', 'mahnı oxumaq', 'mahnı oxumaq'),
    (4, 'swim', 'swam', 'swum', 'swim – swem – swam', 'üzmək', 'üzmək'),
    (4, 'ring', 'rang', 'rung', 'rinq – renq – ranq', 'zəng çalmaq', 'zəng çalmaq'),
    (5, 'be', 'was / were', 'been', 'bi – waz / wər – bin', 'olmaq', 'olmaq'),
    (5, 'do', 'did', 'done', 'du – did – dan', 'etmək', 'etmək'),
    (5, 'go', 'went', 'gone', 'qou – went – qon', 'getmək', 'getmək'),
    (5, 'see', 'saw', 'seen', 'si – so – sin', 'görmək', 'görmək'),
    (5, 'eat', 'ate', 'eaten', 'it – eyt – itən', 'yemək', 'yemək'),
    (5, 'take', 'took', 'taken', 'teyk – tuk – teykən', 'götürmək, almaq', 'götürmək'),
    (5, 'give', 'gave', 'given', 'qiv – qeyv – qivən', 'vermək', 'vermək'),
    (5, 'write', 'wrote', 'written', 'rayt – rout – ritən', 'yazmaq', 'yazmaq'),
    (5, 'speak', 'spoke', 'spoken', 'spik – spouk – spoukən', 'danışmaq', 'danışmaq'),
    (5, 'break', 'broke', 'broken', 'breyk – brouk – broukən', 'sındırmaq', 'sındırmaq'),
    (5, 'wake', 'woke', 'woken', 'weyk – wouk – woukən', 'oyanmaq', 'oyanmaq'),
    (5, 'choose', 'chose', 'chosen', 'çuz – çouz – çouzən', 'seçmək', 'seçmək'),
    (5, 'drive', 'drove', 'driven', 'drayv – drouv – drivən', '(maşın) sürmək', 'maşın sürmək'),
    (5, 'ride', 'rode', 'ridden', 'rayd – roud – ridən', 'minmək (velosiped, at)', 'minmək'),
    (5, 'know', 'knew', 'known', 'nou – nu – noun', 'bilmək', 'bilmək'),
    (5, 'grow', 'grew', 'grown', 'qrou – qru – qroun', 'böyümək', 'böyümək'),
    (5, 'throw', 'threw', 'thrown', 'θrou – θru – θroun', 'atmaq', 'atmaq'),
    (5, 'fly', 'flew', 'flown', 'flay – flu – floun', 'uçmaq', 'uçmaq'),
    (5, 'draw', 'drew', 'drawn', 'dro – dru – dron', '(şəkil) çəkmək', 'şəkil çəkmək'),
    (5, 'wear', 'wore', 'worn', 'wer – wor – worn', 'geyinmək', 'geyinmək'),
    (5, 'fall', 'fell', 'fallen', 'fol – fel – folən', 'yıxılmaq, düşmək', 'yıxılmaq, düşmək'),
    (5, 'forget', 'forgot', 'forgotten', 'fərqet – fərqat – fərqatən', 'unutmaq', 'unutmaq'),
]

# İngiliscə deyilişi yazılışdan fərqli olan formalar (Piper üçün)
SAY = {('read', 2): 'red', ('read', 3): 'red', ('be', 2): 'was, were'}

VERBS = []
for i, (g, a, b, c, pron, tr, trs) in enumerate(V):
    VERBS.append({'n': i + 1, 'g': g, 'f': [a, b, c], 'pron': pron, 'tr': tr, 'trTts': trs,
                  'say': [SAY.get((a, k + 1), w) for k, w in enumerate([a, b, c])]})

# Feil nədir? / Qaydalı və qaydasız / Fəndlər / Qruplar / Test / Son — izah mətnləri.
# Hər səhnə addımlardan ibarətdir: (cue adı, dil, mətn, sonrakı fasilə san)
INTRO = [
    ('hello', 'az', 'Salam, balaca dostum! Bu gün ingilis dilinin qaydasız feillərini öyrənəcəyik.', 0.35),
    ('count', 'az', 'Altmış altı feil, beş qrup. Hazırsan? Başlayaq!', 0.6),
]

LADDER = [
    ('what', 'az', 'Feil hərəkət bildirən sözdür: qaçmaq, yemək, oynamaq, getmək.', 0.3),
    ('three', 'az', 'İngilis dilində hər feilin üç forması var. Bunları üç pilləli nərdivan kimi düşün.', 0.5),
    ('s1', 'az', 'Birinci forma — indi, hər gün.', 0.25),
    ('s1en', 'en', 'I go to school.', 0.25),
    ('s1az', 'az', 'Mən məktəbə gedirəm.', 0.55),
    ('s2', 'az', 'İkinci forma — keçmiş, dünən.', 0.25),
    ('s2en', 'en', 'I went to school.', 0.25),
    ('s2az', 'az', 'Mən məktəbə getdim.', 0.55),
    ('s3', 'az', 'Üçüncü forma — hev və hez sözləri ilə işlənir.', 0.25),
    ('s3en', 'en', 'She has gone to school.', 0.25),
    ('s3az', 'az', 'O, məktəbə gedib.', 0.8),
]

REGULAR = [
    ('reg', 'az', 'Qaydalı feillər tərbiyəli feillərdir. Keçmişdə sadəcə sonuna e di alırlar.', 0.25),
    ('regEn', 'en', 'play, played. jump, jumped. watch, watched.', 0.6),
    ('irr', 'az', 'Qaydasız feillər isə nadinc feillərdir. Onlar e di almırlar, istədikləri kimi dəyişirlər.', 0.25),
    ('irrEn', 'en', 'go, went. eat, ate. see, saw.', 0.5),
    ('calm', 'az', 'Ona görə də onları əzbərləmək lazımdır. Narahat olma — fəndlərlə çox asan olacaq!', 0.7),
]

TIPS = [
    ('Qruplarla öyrən', 'Oxşar feillər birlikdə tez yadda qalır.',
     'Yadda saxlamaq üçün yeddi sehrli fənd. Bir: qruplarla öyrən.'),
    ('Hər gün 5 feil', 'Dünənkiləri bir dəfə təkrar et.', 'İki: hər gün beş yeni feil götür.'),
    ('Mahnı kimi oxu', '«go – went – gone!» — ritmlə, əl çalaraq.', 'Üç: mahnı kimi, ritmlə oxu.'),
    ('Bağla və yoxla', '2-ci və 3-cü sütunu kağızla ört, de, yoxla.', 'Dörd: cədvəli örtüb özünü yoxla.'),
    ('Kartoçka düzəlt', 'Bir üzünə go, o biri üzünə went – gone.', 'Beş: kartoçka düzəlt.'),
    ('Özün haqqında cümlə qur', '«Yesterday I ate a cake.»', 'Altı: hər feillə öz həyatından cümlə qur.'),
    ('Şəklini təsəvvür et', 'swim – swam – swum deyəndə üzmə hərəkəti et.',
     'Yeddi: hərəkəti gözünün önünə gətir və göstər.'),
]

OVERVIEW = [
    ('ov', 'az', 'Altmış altı feili beş qrupa böldük.', 0.3),
    ('r1', 'az', 'Üçü də eyni — səkkiz feil.', 0.25),
    ('r2', 'az', 'Birinci və üçüncü eyni — üç feil.', 0.25),
    ('r3', 'az', 'İkinci və üçüncü eyni — iyirmi səkkiz feil.', 0.25),
    ('r4', 'az', 'İ, a, u — beş feil.', 0.25),
    ('r5', 'az', 'Hamısı fərqli — iyirmi iki feil. Ən asandan başlayırıq!', 0.7),
]

GROUP_INTRO = {
    1: [
        ('t', 'az', 'Birinci qrup: üçü də eyni.', 0.3),
        ('a', 'az', 'Bu feillər ən asanıdır — heç dəyişmirlər! Bir dəfə öyrəndin, üç formanı da bildin.', 0.3),
        ('b', 'az', 'Diqqət: rid eyni yazılır, amma keçmişdə red oxunur.', 0.25),
        ('ex', 'en', 'read, red, red.', 0.7),
    ],
    2: [
        ('t', 'az', 'İkinci qrup: gedib geri qayıdan.', 0.3),
        ('a', 'az', 'Bunlarda birinci və üçüncü forma eynidir, yalnız ortadakı dəyişir.', 0.25),
        ('ex', 'en', 'come, came, come.', 0.3),
        ('b', 'az', 'Sanki feil gedib yenə evinə qayıdır.', 0.7),
    ],
    3: [
        ('t', 'az', 'Üçüncü qrup: əkiz qardaşlar.', 0.3),
        ('a', 'az', 'Bunlarda ikinci və üçüncü forma əkiz kimi eynidir. Ən böyük qrup budur — iyirmi səkkiz feil!', 0.3),
        ('b', 'az', 'Əvvəl ot səsi ilə bitən kiçik ailə:', 0.25),
        ('ex', 'en', 'bought, brought, thought, taught, caught, fought.', 0.7),
    ],
    4: [
        ('t', 'az', 'Dördüncü qrup: mahnı qrupu.', 0.3),
        ('a', 'az', 'Bu feillərdə yalnız bir hərf dəyişir: i, a, u. Mahnı kimi oxu!', 0.25),
        ('ex', 'en', 'sing, sang, sung. swim, swam, swum!', 0.7),
    ],
    5: [
        ('t', 'az', 'Beşinci qrup: hamısı fərqli — ən nadinclər!', 0.3),
        ('a', 'az', 'Bunlarda üç forma da fərqlidir. Amma çoxunun üçüncü forması en ilə bitir:', 0.25),
        ('ex', 'en', 'eaten, taken, given, known.', 0.3),
        ('b', 'az', 'Bunları hər gün üç-dörd dənə öyrən.', 0.7),
    ],
}

REVIEW_INTRO = ('az', 'İndi birlikdə, mahnı kimi təkrar edək! Sən də ucadan de.')

QUIZ_INTRO = [
    ('a', 'az', 'Afərin! İndi özünü yoxla.', 0.25),
    ('b', 'az', 'Düzgün formanı tap. Cavab gəlməmiş ucadan de!', 0.6),
]

# (cümlənin əvvəli, variantlar, sonu, düzgün variantın indeksi, ingiliscə tam cümlə)
QUIZ = [
    ('Yesterday I', ['go', 'went', 'gone'], 'to school.', 1, 'Yesterday I went to school.'),
    ('My mother', ['make', 'made', 'maked'], 'a cake.', 1, 'My mother made a cake.'),
    ('I have', ['eat', 'ate', 'eaten'], 'an apple.', 2, 'I have eaten an apple.'),
    ('Tom', ['drinked', 'drank', 'drunk'], 'milk in the morning.', 1, 'Tom drank milk in the morning.'),
    ('She has', ['write', 'wrote', 'written'], 'a letter.', 2, 'She has written a letter.'),
    ('Last week we', ['sing', 'sang', 'sung'], 'a song.', 1, 'Last week we sang a song.'),
    ('I have', ['lose', 'lost', 'losed'], 'my ball.', 1, 'I have lost my ball.'),
]

GROUP_QUIZ_INTRO = ('az', 'İndi de: bu feil hansı qrupdandır?')
GROUP_QUIZ = [('put', 1), ('think', 3), ('sing', 4), ('run', 2), ('take', 5)]

OUTRO = [
    ('a', 'az', 'Afərin! Hamısını düz tapdınsa, sən artıq qaydasız feillərin ustasısan!', 0.3),
    ('b', 'az', 'Səhv etdiyin feilləri kartoçkaya yaz və sabah yenə təkrar et.', 0.3),
    ('c', 'az', 'Hər gün beş feil — və iki-üç həftəyə hamısını biləcəksən!', 1.6),
]
