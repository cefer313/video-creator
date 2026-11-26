// «Bir stəkan su» — kadr cədvəli (24 fps, cəmi 720 kadr).
// Hər hissə bir və ya bir neçə klipdən ibarətdir; `from` — klipin içində başlanğıc (kadr).
export const FPS = 24;
export const TOTAL = 720;

export type Cut = {
  clip: string; // public/clips/<clip>.mp4
  at: number; // filmdə başlanğıc kadr
  len: number; // uzunluq (kadr)
  from: number; // klipin içində başlanğıc kadr
  rate?: number; // oynatma sürəti
  push?: [number, number]; // kamera yaxınlaşması (miqyas: əvvəl → son)
};

// Hissələr: 0, 120, 264, 408, 576
export const CUTS: Cut[] = [
  // 1) Su masasında (0–119)
  { clip: 'a', at: 0, len: 120, from: 1 },
  // 2) Verən əl — eyni kamera mövqeyindən üç uyğun kəsik (120–263)
  { clip: 'b1', at: 120, len: 48, from: 6 },
  { clip: 'b2', at: 168, len: 48, from: 6 },
  { clip: 'b3', at: 216, len: 48, from: 6 },
  // 3) Oğlan geri baxır — ilk geniş plan (264–407)
  { clip: 'c', at: 264, len: 144, from: 0 },
  // 4) Onun üçün bir stəkan (408–575)
  { clip: 'd1', at: 408, len: 96, from: 0 },
  { clip: 'd2', at: 504, len: 72, from: 0 },
  // 5) Alan əl (576–719): ötürmə (3 san), sonra son yaxın plan (3 san)
  { clip: 'e1', at: 576, len: 72, from: 0 },
  { clip: 'e2', at: 648, len: 72, from: 0, push: [1.0, 1.04] },
];
