// Ssenari: istifadəçinin "Dərs 3 — Rahib Buheyranın əhvalatı" mətnindən.
// Hər səhnə: fon (art), ekran mətni, (varsa) danışan, müddət (saniyə).
// Peyğəmbər (s) heç bir kadrda fiqur kimi çəkilmir — yalnız yumşaq nur (işıq) ilə işarə olunur.

export type Bg =
  | 'title'
  | 'caravan'
  | 'city'
  | 'cloud'
  | 'monastery'
  | 'feast'
  | 'tree'
  | 'bahira'
  | 'nur'
  | 'abutalib'
  | 'return'
  | 'end';

export type Scene = {
  bg: Bg;
  text: string;
  speaker?: string;
  sec: number;
};

export const FPS = 30;

export const SCENES: Scene[] = [
  { bg: 'title', text: '', sec: 5.5 },
  { bg: 'caravan', text: 'Qureyş qəbiləsi hər il Şama ticarət səfərinə gedərdi.', sec: 5.5 },
  {
    bg: 'caravan',
    text: 'Həzrət Məhəmmədin (s) on iki yaşı var idi. Əmisi Əbu Talib onu da özü ilə apardı.',
    sec: 7,
  },
  {
    bg: 'city',
    text: 'Karvan Şamın böyük ticarət şəhəri Bəsrədə dayandı. Yaxınlıqdakı kilsədə Buheyra adlı bir rahib yaşayırdı.',
    sec: 8,
  },
  {
    bg: 'monastery',
    text: 'Qureyş karvanı hər il buradan keçərdi. Amma Buheyra heç vaxt onlarla danışmamışdı.',
    sec: 7,
  },
  {
    bg: 'cloud',
    text: 'Bu dəfə o, qəribə bir şey gördü: karvanın üstündəki bulud onlarla birgə hərəkət edir, onlara kölgə salırdı.',
    sec: 8.5,
  },
  {
    bg: 'tree',
    text: 'Karvan yaxınlıqdakı ağacın yanında düşərgə saldı. Bulud yenə də onların üstündə idi.',
    sec: 7,
  },
  {
    bg: 'monastery',
    text: 'Buheyra tez kilsədən endi, yemək hazırlatdı və karvanı qonaqlığa dəvət etdi.',
    sec: 7,
  },
  {
    bg: 'feast',
    speaker: 'Qureyşlilər',
    text: '«Nəsə olub. Neçə dəfə buradan keçmişik, heç vaxt bizə qonaqlıq verməmisən.»',
    sec: 7,
  },
  {
    bg: 'feast',
    text: 'Buheyra hamını diqqətlə nəzərdən keçirdi. Kitablarda oxuduğu sonuncu peyğəmbərin əlamətlərini axtarırdı.',
    sec: 8,
  },
  { bg: 'bahira', speaker: 'Buheyra', text: '«Sizdən karvanda kimsə qalmayıb ki?»', sec: 5 },
  {
    bg: 'feast',
    speaker: 'Qureyşlilər',
    text: '«Hamı buradadır. Təkcə karvanın ən kiçiyi gəlməyib.»',
    sec: 6,
  },
  {
    bg: 'tree',
    text: 'Peyğəmbər (s) ağacın altında qalmışdı. Qureyşli bir kişi onu gətirib yanında əyləşdirdi.',
    sec: 7.5,
  },
  {
    bg: 'nur',
    text: 'Buheyra diqqətlə ona baxır, kitablarda oxuduğu əlamətləri yada salırdı.',
    sec: 7,
  },
  {
    bg: 'bahira',
    speaker: 'Buheyra',
    text: '«Ey oğlan, səni Lat və Uzzaya and verirəm, suallarıma cavab ver.»',
    sec: 7,
  },
  {
    bg: 'nur',
    speaker: 'Peyğəmbər (s)',
    text: '«Məni Lat və Uzzaya and vermə. Heç bir şey mənim yanımda onlar qədər nifrətli deyil.»',
    sec: 8,
  },
  { bg: 'bahira', speaker: 'Buheyra', text: '«Onda səni Allaha and verirəm, suallarıma cavab ver.»', sec: 6 },
  { bg: 'nur', speaker: 'Peyğəmbər (s)', text: '«Nə istəyirsən, soruş.»', sec: 4.5 },
  {
    bg: 'nur',
    text: 'Buheyra onun həyatı, yuxusu və ayıqlığı barədə soruşdu. Cavablar oxuduqları ilə üst-üstə düşdü.',
    sec: 8,
  },
  {
    bg: 'nur',
    text: 'Peyğəmbərlik nişanələrindən biri — iki çiyni arasındakı möhür izi idi. Rahib onu da gördü.',
    sec: 7.5,
  },
  { bg: 'bahira', speaker: 'Buheyra', text: '«Bu oğlan sənin nəyindir?»', sec: 4.5 },
  { bg: 'abutalib', speaker: 'Əbu Talib', text: '«Oğlumdur.»', sec: 3.5 },
  {
    bg: 'bahira',
    speaker: 'Buheyra',
    text: '«O, sənin oğlun deyil. Atası da dünyadan köçmüş olmalıdır.»',
    sec: 6.5,
  },
  { bg: 'abutalib', text: 'Əbu Talib atası Abdullahın dünyasını dəyişdiyini dedi.', sec: 5.5 },
  {
    bg: 'bahira',
    speaker: 'Buheyra',
    text: '«Düz deyirsən. Qardaşın oğlunu öz şəhərinə qaytar. Bu, Tövrat və İncildə vəd edilən peyğəmbərdir.»',
    sec: 9,
  },
  {
    bg: 'bahira',
    speaker: 'Buheyra',
    text: '«O, əbədi bir dinə malikdir. Onu düşmənlərdən gizlət və qoru. Bu uşaq böyük işlər görəcək.»',
    sec: 8.5,
  },
  {
    bg: 'return',
    text: 'Əbu Talib ticarət səfərini yarımçıq qoydu və Məkkəyə qayıtdı.',
    sec: 7,
  },
  { bg: 'end', text: '', sec: 6 },
];

// Diktor səsinə görə hesablanmış müddətlər (scripts/timing.py yaradır)
import timing from './timing.json';

export const hasVoice = (k: number) => timing.voice[k] ?? false;
export const sceneFrames = (k: number) => Math.round((timing.sec[k] ?? SCENES[k].sec) * FPS);
export const TOTAL_FRAMES = SCENES.reduce((a, _s, k) => a + sceneFrames(k), 0);
