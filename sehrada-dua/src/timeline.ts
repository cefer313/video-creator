// Vaxtlar istifadəçinin səs yazısındakı pauzalardan ölçülüb (ffmpeg silencedetect, saniyə).
// Mətni dəyişmək üçün yalnız `text` sahələrini dəyiş; vaxtlar səsə bağlıdır.

export const FPS = 30;
export const DURATION_SEC = 35;
export const TOTAL_FRAMES = DURATION_SEC * FPS;

export type Phrase = { text: string; from: number; to: number };
export type Sentence = { phrases: Phrase[] };

export const SENTENCES: Sentence[] = [
  {
    phrases: [
      { text: 'Səhranın ortasında, qızmar günəşin altında', from: 1.79, to: 5.15 },
      { text: 'hərəkət edirdim.', from: 6.22, to: 6.97 },
    ],
  },
  {
    phrases: [
      { text: 'Susuzluqdan həlak', from: 8.48, to: 9.93 },
      { text: 'olmaq üzrə idim.', from: 12.1, to: 13.24 },
    ],
  },
  { phrases: [{ text: 'Allaha dua elədim.', from: 15.72, to: 17.89 }] },
  {
    phrases: [
      { text: 'Allah mənə bulud', from: 18.88, to: 20.76 },
      { text: 'və yağış göndərdi.', from: 21.41, to: 22.27 },
    ],
  },
  {
    phrases: [
      { text: 'Mən sirab oldum', from: 23.09, to: 24.33 },
      { text: 'və xilas oldum.', from: 25.09, to: 26.74 },
    ],
  },
  {
    phrases: [
      { text: 'Beləliklə', from: 27.87, to: 29.17 },
      { text: 'ailəmə qovuşdum.', from: 30.43, to: 33.14 },
    ],
  },
];

// Hekayənin mərhələləri (saniyə) — görüntü bu nöqtələr arasında hamar dəyişir.
export const T = {
  walk: 0, // səhrada yeriyir
  thirst: 8.2, // susuzluq, yavaşlayır, yıxılır
  kneel: 14.6, // diz çökür
  dua: 15.5, // dua (ovuclar yuxarı)
  clouds: 18.6, // buludlar gəlir
  rain: 20.0, // yağış
  saved: 22.9, // sirab olur, ayağa qalxır
  green: 24.5, // ot göyərir
  home: 27.6, // ailəyə doğru gedir
  meet: 31.2, // ailəsinə çatır
  end: 35,
};
