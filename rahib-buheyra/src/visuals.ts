// Hər səhnənin görüntüsü: AI rəsm kadrı (public/img) və ya Kling klipi (public/clips).
// kb: kamera hərəkəti [miqyas, mərkəz x, mərkəz y] başlanğıc → son (x, y: 0..1).
// nur: Peyğəmbərin (s) arxadan göründüyü kadrlarda başının üstündəki yumşaq işığın yeri (0..1).
export type Visual = {
  img: string;
  clip?: string;
  kb: [[number, number, number], [number, number, number]];
  nur?: [number, number, number]; // x, y, radius (kadr eninin payı)
};

const IN: Visual['kb'] = [[1.05, 0.5, 0.45], [1.16, 0.5, 0.42]];
const OUT: Visual['kb'] = [[1.18, 0.5, 0.4], [1.05, 0.5, 0.45]];

export const VIS: Visual[] = [
  { img: 'i00', clip: 'k00', kb: [[1.0, 0.5, 0.5], [1.06, 0.5, 0.45]] }, // 0 başlıq
  { img: 'i01', clip: 'k01', kb: [[1.0, 0.5, 0.5], [1.05, 0.5, 0.5]] }, // 1 karvan
  { img: 'i02', kb: [[1.08, 0.45, 0.35], [1.22, 0.38, 0.3]], nur: [0.29, 0.19, 0.16] }, // 2 Əbu Talib və oğlan
  { img: 'i03', kb: [[1.15, 0.6, 0.35], [1.05, 0.5, 0.45]] }, // 3 Bəsrə
  { img: 'i04', clip: 'k04', kb: [[1.0, 0.5, 0.5], [1.05, 0.48, 0.4]] }, // 4 rahib pəncərədə
  { img: 'i05', clip: 'k05', kb: [[1.0, 0.5, 0.5], [1.05, 0.5, 0.45]] }, // 5 bulud
  { img: 'i06', kb: IN }, // 6 ağac, düşərgə
  { img: 'i07', kb: [[1.06, 0.5, 0.4], [1.18, 0.4, 0.32]] }, // 7 qonaqlıq hazırlığı
  { img: 'i08', kb: [[1.18, 0.4, 0.35], [1.06, 0.5, 0.4]] }, // 8 süfrə
  { img: 'i09', kb: [[1.05, 0.5, 0.4], [1.2, 0.45, 0.3]] }, // 9 rahib baxır
  { img: 'i10', kb: [[1.05, 0.5, 0.35], [1.15, 0.45, 0.3]] }, // 10 sual
  { img: 'i11', kb: [[1.05, 0.55, 0.35], [1.15, 0.6, 0.3]] }, // 11 cavab
  { img: 'i12', kb: [[1.15, 0.5, 0.35], [1.05, 0.5, 0.4]], nur: [0.35, 0.385, 0.14] }, // 12 ağacın altında
  { img: 'i13', kb: [[1.05, 0.5, 0.35], [1.18, 0.55, 0.3]], nur: [0.26, 0.27, 0.16] }, // 13 rahib baxır
  { img: 'i10', kb: [[1.22, 0.45, 0.28], [1.1, 0.5, 0.33]] }, // 14 Lat və Uzza
  { img: 'i15', kb: [[1.05, 0.45, 0.35], [1.18, 0.38, 0.3]], nur: [0.35, 0.26, 0.17] }, // 15 Peyğəmbərin cavabı
  { img: 'i13', kb: [[1.25, 0.68, 0.3], [1.12, 0.6, 0.32]], nur: [0.26, 0.27, 0.16] }, // 16 Allaha and
  { img: 'i15', kb: [[1.25, 0.36, 0.28], [1.1, 0.4, 0.32]], nur: [0.35, 0.26, 0.17] }, // 17 soruş
  { img: 'i18', kb: IN }, // 18 suallar
  { img: 'i19', kb: [[1.05, 0.5, 0.35], [1.2, 0.5, 0.3]] }, // 19 möhür
  { img: 'i20', kb: [[1.05, 0.5, 0.35], [1.16, 0.6, 0.3]] }, // 20 Bu oğlan sənin nəyindir
  { img: 'i21', kb: [[1.05, 0.5, 0.3], [1.15, 0.45, 0.25]] }, // 21 Oğlumdur
  { img: 'i20', kb: [[1.25, 0.7, 0.28], [1.12, 0.65, 0.3]] }, // 22 oğlun deyil
  { img: 'i21', kb: [[1.22, 0.45, 0.25], [1.1, 0.5, 0.3]] }, // 23 Abdullah
  { img: 'i24', kb: [[1.05, 0.5, 0.35], [1.16, 0.6, 0.3]] }, // 24 qaytar
  { img: 'i24', kb: [[1.25, 0.62, 0.25], [1.12, 0.55, 0.3]] }, // 25 qoru
  { img: 'i26', clip: 'k26', kb: [[1.0, 0.5, 0.5], [1.06, 0.5, 0.45]] }, // 26 qayıdış
  { img: 'i00', kb: OUT }, // 27 son
];
