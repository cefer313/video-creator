// Rejissura: hər kadr üçün iki personajın pozası, telefon, tum yemə və kamera.
// Bütün vaxtlar timeline.json-dakı replikalara bağlıdır, ona görə səs dəyişəndə hərəkət də uyğunlaşır.
import { earWorld, restPose, mouthWorld, shoulderInRoot, type Arm, type CharPose, type V3 } from './three/Character';
import type { ScreenState } from './three/textures';
import { L, TL, mouthEnv } from './timeline';
import { clamp, hash, lerp, pulse, ramp, smooth, wobble } from './anim';
import { getInputProps } from 'remotion';

const DBG = (typeof window !== 'undefined' ? getInputProps() : {}) as { cam?: Shot; ear?: V3; earT?: V3 };

export type Mode = 'wrong' | 'correct';
export type PhoneState = { visible: boolean; screen: ScreenState; pulse: number; buzz: number };
export type Shell = { p: V3; spin: number };
export type Shot = { pos: V3; target: V3; fov: number };
export type Stage = { tural: CharPose; kenan: CharPose; phone: PhoneState; seedL: boolean; shells: Shell[]; cam: Shot };

const TX = -0.42;
const KX = 0.42;

type Part = Omit<Partial<CharPose>, 'la' | 'ra'> & { la?: Arm; ra?: Arm };
const lv = (a: V3, b: V3, t: number): V3 => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const add3 = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

/** Pozanın göstərilən sahələrini w çəkisi ilə hədəfə yaxınlaşdırır. */
const blend = (p: CharPose, q: Part, w: number): CharPose => {
  if (w <= 0.0001) return p;
  const o: any = { ...p };
  for (const k of Object.keys(q) as (keyof Part)[]) {
    const a: any = (p as any)[k];
    const b: any = (q as any)[k];
    if (typeof b === 'number') o[k] = lerp(a, b, w);
    else if (b && b.t) o[k] = { t: lv(a.t, b.t, w), pole: lv(a.pole, b.pole, w), wrist: lv(a.wrist ?? [0, 0, 0], b.wrist ?? [0, 0, 0], w) };
  }
  return o;
};
const offs = (p: CharPose, q: Partial<Record<keyof CharPose, number>>): CharPose => {
  const o: any = { ...p };
  for (const k of Object.keys(q)) o[k] = (o[k] as number) + (q as any)[k];
  return o;
};

// ---------- göz qırpma, nəfəs, danışarkən baş hərəkəti ----------
const blinks = (seed: number) => {
  const out: number[] = [];
  let t = 18 + seed * 23;
  while (t < TL.total + 200) {
    out.push(t);
    t += 72 + Math.floor(hash(t * 0.37 + seed) * 70);
  }
  return out;
};
const BL = { tural: blinks(1), kenan: blinks(2) };
const blinkAt = (who: 'tural' | 'kenan', f: number) => {
  for (const b of BL[who]) {
    const d = f - b;
    if (d >= 0 && d < 6) return [0.25, 0.05, 0.05, 0.3, 0.65, 0.9][d];
  }
  return 1;
};
const life = (p: CharPose, who: 'tural' | 'kenan', f: number, talk: number): CharPose => {
  const s = who === 'tural' ? 1 : 2;
  const br = Math.sin((f / 105) * Math.PI * 2 + s) * 0.008;
  return offs(p, {
    lean: br,
    hp: talk * 0.05 * Math.sin(f * 0.55 + s) + wobble(f / 40, s) * 0.012,
    hy: wobble(f / 55, s + 4) * 0.025 + talk * 0.03 * Math.sin(f * 0.31),
    hr: wobble(f / 60, s + 7) * 0.015,
  });
};

// ---------- tum yemə ----------
const BITES = TL.bites;
const biteW = (who: 'tural' | 'kenan', f: number) => {
  let w = 0;
  for (const b of BITES) if (b.who === who) w = Math.max(w, pulse(f, b.at, 9, b.at + 15, 11));
  return w;
};
const chew = (who: 'tural' | 'kenan', f: number) => {
  let m = 0;
  for (const b of BITES) {
    if (b.who !== who) continue;
    const d = f - b.at;
    if (d >= 9 && d < 13) m = Math.max(m, 0.35);
    else if (d >= 16 && d < 40) m = Math.max(m, 0.12 * (0.5 + 0.5 * Math.sin(d * 1.3)));
  }
  return m;
};
const bite = (p: CharPose, who: 'tural' | 'kenan', f: number): CharPose => {
  const w = biteW(who, f);
  if (w <= 0) return p;
  const m = mouthWorld(p);
  const side = who === 'tural' ? -1 : 1; // Tural sağ əli, Kənan sol əli ilə (çöl tərəfdəki əl)
  const arm: Arm = { t: add3(m, [side * 0.025, -0.035, 0.035]), pole: [side * 0.7, -0.6, 0.1], wrist: [0.3, 0, 0] };
  return blend(p, side === -1 ? { ra: arm, hp: p.hp - 0.05 } : { la: arm, hp: p.hp - 0.05 }, w);
};
const shellsUpTo = (who: 'tural' | 'kenan', f: number, pose: (g: number) => CharPose, from: number, to: number): Shell[] => {
  const out: Shell[] = [];
  for (const b of BITES) {
    if (b.who !== who || b.at < from || b.at >= to) continue;
    const r = b.at + 17;
    if (f < r) continue;
    const m = mouthWorld(pose(r));
    const t = Math.min(1, (f - r) / 16);
    const dx = (hash(b.at) - 0.5) * 0.12;
    out.push({ p: [m[0] + dx * t, Math.max(0.007, m[1] + 0.02 - 1.2 * t * t), m[2] + 0.06 + 0.12 * t], spin: (f - r) * 0.5 });
  }
  return out;
};

// Telefon qulaqda: əl qulağın altında, telefon şaquli, başın yanında
const earArm = (head: CharPose): Arm => ({
  t: add3(earWorld(head, -1), (DBG.earT as V3) ?? [-0.03, -0.085, 0.0]),
  pole: [-0.9, -0.5, -0.1],
  wrist: (DBG.ear as V3) ?? [1.2, 0, 0],
});

// ---------- Tural ----------
const turalWrong = (f: number): CharPose => {
  let p = restPose(TX);
  p = blend(p, { hy: 0.42, eyeX: 0.5, smile: 0.2 }, 1);
  // 1) pıçıltı: Kənana tərəf əyilir, sol əli ağzının yanında
  const wh = pulse(f, 0, 8, L.t02.start + 30, 20);
  if (wh > 0) {
    const base = blend(p, { lean: 0.14, twist: 0.26, tilt: -0.1, hy: 0.5, hp: 0.07, hr: -0.1, browUp: 0.35, smile: 0.3, eyeX: 0.75, eyeY: -0.1 }, 1);
    const m = mouthWorld(base);
    p = blend(p, { ...base, la: { t: add3(m, [0.085, -0.02, 0.03]), pole: [0.5, -0.8, 0.2], wrist: [0, -0.9, 0.2] } }, wh);
  }
  // f 0..8: ətrafa baxır (eşidən yoxdur ki?)
  p = offs(p, { hy: -0.35 * pulse(f, -4, 4, 6, 6), eyeX: -0.9 * pulse(f, -4, 4, 6, 6) });
  // 2) "əla vermişəm" — istehza: qaşlar yuxarı, təbəssüm
  const ir = pulse(f, L.t02.start + 60, 10, L.t02.end - 2, 14);
  p = blend(p, { browUp: 0.9, smile: 0.6, hp: -0.06, lid: 0.85, lean: 0.1, twist: 0.2, hy: 0.45 }, ir);
  // sol əl kiçik jestlə ağızdan aralanır
  p = blend(p, { la: { t: [TX + 0.28, 0.9, 0.3], pole: [0.6, -0.6, -0.1], wrist: [-0.5, 0, 0.3] } }, pulse(f, L.t02.start + 40, 12, L.t02.end - 4, 12));
  // 3) Kənan etiraz edir: Tural əlini yelləyir, "boş ver" üzü
  p = blend(p, { browIn: -0.15, browUp: 0.15, smile: 0.15, hy: 0.5, eyeX: 0.7 }, pulse(f, L.k01.start, 6, L.k01.end + 4, 8));
  // 4) "Nə qeybət?" açıq ovuc; "Həqiqətdir!" — kəsik jest; "Mən bunu..." — əl sinədə
  const a0 = L.t03.start;
  const a3 = L.t03.end;
  const len = a3 - a0;
  const g1 = pulse(f, a0 - 4, 8, a0 + len * 0.3, 8);
  p = blend(p, { lean: 0.0, twist: 0.14, tilt: 0, hy: 0.38, hp: -0.04, browUp: 0.7, browIn: 0.1, smile: 0.1, la: { t: [TX + 0.33, 0.86, 0.34], pole: [0.6, -0.6, -0.2], wrist: [-0.7, 0, 0.5] } }, g1);
  const g2 = pulse(f, a0 + len * 0.3, 6, a0 + len * 0.52, 6);
  const chop = Math.sin((f - a0) * 0.6) * 0.04;
  p = blend(p, { lean: 0.02, twist: 0.14, hy: 0.38, browUp: -0.1, browIn: -0.45, smile: 0, hp: 0.04, la: { t: [TX + 0.26, 0.8 + chop, 0.38], pole: [0.6, -0.6, -0.2], wrist: [0, 0, 1.2] } }, g2);
  const g3 = pulse(f, a0 + len * 0.52, 8, a3 + 4, 10);
  p = blend(p, { lean: -0.02, twist: 0.08, hy: 0.25, hp: -0.12, lid: 0.8, smile: 0.5, browUp: 0.3, browIn: 0, ra: { t: [TX - 0.03, 0.93, 0.18], pole: [-0.6, -0.7, 0.2], wrist: [0, 0.9, 0] } }, g3);
  // 5) Kənan yaxınlaşır: yenə sirli əyilmə
  p = blend(p, { lean: 0.1, twist: 0.22, tilt: -0.06, hy: 0.45, browUp: 0.4, smile: 0.4, eyeX: 0.6 }, pulse(f, L.k02.start, 8, L.t04.start + 10, 10));
  // 6) telefonu çıxarır və baxır (t04)
  const ph = ramp(f, L.t04.start + 6, L.t04.start + 22) * (1 - ramp(f, L.t05.start - 6, L.t05.start + 10));
  const pocket = pulse(f, L.t04.start - 2, 8, L.t04.start + 10, 8);
  p = blend(p, { ra: { t: [TX - 0.2, 0.62, 0.12], pole: [-0.8, -0.5, -0.2], wrist: [0, 0, 0] } }, pocket);
  p = blend(p, { lean: 0.12, twist: 0.12, hy: 0.18, hp: 0.32, eyeY: -0.85, eyeX: 0.15, smile: 0.35, browUp: 0.2, ra: { t: [TX + 0.02, 0.88, 0.3], pole: [-0.8, -0.6, -0.1], wrist: [-0.9, 0.15, 0] } }, ph);
  // 7) zəng: diksinir, sonra məcburi təbəssüm
  const r0 = TL.events.ring[0];
  const st = pulse(f, r0, 3, r0 + 16, 8);
  p = blend(p, { lean: -0.05, lid: 1.25, browUp: 1.0, browIn: 0.35, smile: -0.4, hp: 0.22 }, st);
  const panic = pulse(f, r0 + 14, 5, r0 + 26, 6);
  p = blend(p, { hy: 0.55, eyeX: 0.9, eyeY: -0.1, hp: 0.05, browIn: 0.6, browUp: 0.8, smile: -0.5, lid: 1.15 }, panic);
  const fake = ramp(f, r0 + 26, r0 + 34);
  p = blend(p, { smile: 1, browUp: 0.75, browIn: 0.1, lid: 1.05, hy: 0.1, hp: 0.12 }, fake);
  // 8) telefon qulaqda, sol əl yellənir: "Samir! Qardaşım!"
  const ear = ramp(f, L.t05.start - 4, L.t05.start + 10);
  if (ear > 0) {
    const hd = blend(p, { lean: -0.03, twist: -0.05, tilt: 0.05, hy: -0.12, hp: -0.04, hr: 0.14, eyeY: 0.2, eyeX: -0.2 }, 1);
    p = blend(p, { ...hd, ra: earArm(hd) }, ear);
  }
  const wav = pulse(f, L.t05.start + 4, 8, L.t05.start + 60, 10);
  const wx = Math.sin((f - L.t05.start) * 0.55) * 0.07;
  p = blend(p, { la: { t: [TX + 0.34 + wx, 1.22, 0.22], pole: [0.8, -0.4, -0.3], wrist: [0, 0, 0.4 + wx * 4] } }, wav);
  // öskürəndə Kənana yan-yan baxır, təbəssümü saxlayır
  const side = ramp(f, TL.events.cough[0] - 6, TL.events.cough[0] + 4);
  p = blend(p, { hy: 0.15, eyeX: 0.95, browUp: 0.5, browIn: 0.35 }, side);
  return p;
};

const turalCorrect = (f: number, kenan: CharPose): CharPose => {
  let p = restPose(TX);
  p = blend(p, { hy: 0.42, eyeX: 0.5, smile: 0.2 }, 1);
  const c0 = TL.parts.correct[0];
  const wh = pulse(f, c0 - 10, 8, L.k03.start + 10, 14);
  if (wh > 0) {
    const base = blend(p, { lean: 0.14, twist: 0.26, tilt: -0.1, hy: 0.5, hp: 0.07, hr: -0.1, browUp: 0.35, smile: 0.3, eyeX: 0.75, eyeY: -0.1 }, 1);
    const m = mouthWorld(base);
    p = blend(p, { ...base, la: { t: add3(m, [0.085, -0.02, 0.03]), pole: [0.5, -0.8, 0.2], wrist: [0, -0.9, 0.2] } }, wh);
  }
  // Kənan dayandırır: dikəlir, ona baxır, sonra fikirləşir, başını tərpədir
  const k0 = L.k03.start;
  const k1 = L.k03.end;
  p = blend(p, { lean: 0.02, twist: 0.1, hy: 0.5, eyeX: 0.75, browUp: 0.25, smile: 0, lid: 1.05 }, ramp(f, k0 + 4, k0 + 16));
  const think = pulse(f, k0 + (k1 - k0) * 0.45, 14, k1 - 4, 12);
  p = blend(p, { hp: 0.28, hy: 0.15, eyeY: -0.7, eyeX: 0.1, browIn: 0.45, browUp: 0.15, smile: -0.1 }, think);
  const nod = pulse(f, k1 - 18, 6, k1 + 12, 8) * Math.sin((f - k1) * 0.5) * 0.12;
  p = offs(p, { hp: nod });
  p = blend(p, { smile: 0.45, hy: 0.45, eyeX: 0.7, browIn: 0.1 }, pulse(f, k1 - 6, 8, TL.events.dial[0] + 4, 6));
  // nömrə yığır, telefon qulaqda
  const d0 = TL.events.dial[0];
  const ph = ramp(f, d0 - 8, d0 + 6) * (1 - ramp(f, L.t07.start - 6, L.t07.start + 6));
  p = blend(p, { ra: { t: [TX - 0.2, 0.62, 0.12], pole: [-0.8, -0.5, -0.2] } }, pulse(f, d0 - 22, 8, d0 - 8, 6));
  p = blend(p, { lean: 0.1, hy: 0.15, hp: 0.3, eyeY: -0.85, smile: 0.25, ra: { t: [TX + 0.02, 0.88, 0.3], pole: [-0.8, -0.6, -0.1], wrist: [-0.9, 0.15, 0] } }, ph);
  const ear = ramp(f, L.t07.start - 8, L.t07.start + 6) * (1 - ramp(f, TL.events.endCard + 8, TL.events.endCard + 26));
  if (ear > 0) {
    const hd = blend(p, { lean: -0.02, tilt: 0.05, hy: -0.05, hp: -0.03, hr: 0.14, smile: 0.8, browUp: 0.35, browIn: 0.25, eyeY: 0.1 }, 1);
    p = blend(p, { ...hd, ra: earArm(hd) }, ear);
  }
  // son: Kənana dönür, gülümsəyir, tum götürür
  const e0 = TL.events.endCard;
  p = blend(p, { hy: 0.5, eyeX: 0.7, smile: 0.95, lid: 0.9, browUp: 0.3, lean: 0.06, twist: 0.12 }, ramp(f, e0 + 14, e0 + 30));
  p = blend(p, { la: { t: [kenan.x - 0.34, 0.82, 0.38], pole: [0.6, -0.7, -0.1], wrist: [-0.6, 0, 0] } }, pulse(f, e0 + 40, 12, e0 + 70, 12));
  return p;
};

// ---------- Kənan ----------
const kenanWrong = (f: number): CharPose => {
  let p = restPose(KX);
  p = blend(p, { hy: -0.38, eyeX: -0.55, smile: 0.1, tilt: 0.02 }, 1);
  // etiraz: "Ə, bu qeybətdir axı."
  const ob = pulse(f, L.k01.start - 4, 6, L.k01.end + 6, 10);
  p = blend(p, { hy: -0.45, hp: 0.04, browIn: -0.4, browUp: 0.15, smile: -0.25, lean: 0.06, ra: { t: [KX - 0.27, 0.86, 0.34], pole: [-0.6, -0.6, -0.15], wrist: [-0.6, 0, -0.5] } }, ob);
  // t03 əsnasında: əvvəl şübhə, sonra maraq
  const cur = ramp(f, L.t03.start + 40, L.t03.end);
  p = blend(p, { browUp: 0.45, lid: 1.1, smile: 0.2, lean: 0.08 }, cur);
  // k02: yaxınlaşır, göz-qaş edir
  const sl = ramp(f, L.k02.start - 6, L.k02.start + 22);
  const x = lerp(KX, 0.28, sl);
  p = { ...p, x, la: { ...p.la, t: [p.la.t[0] - KX + x, p.la.t[1], p.la.t[2]] }, ra: { ...p.ra, t: [p.ra.t[0] - KX + x, p.ra.t[1], p.ra.t[2]] } };
  const gq = ramp(f, L.k02.start, L.k02.start + 10) * (1 - ramp(f, L.t04.start + 20, L.t04.start + 40));
  const wig = Math.abs(Math.sin((f - L.k02.start) * 0.32));
  p = blend(p, { lean: 0.12, twist: -0.22, tilt: 0.12, hy: -0.5, hp: 0.02, browUp: 0.55 + 0.45 * wig, lid: 0.85, smile: 0.55, eyeX: -0.85 }, gq);
  // telefona baxır
  const wp = ramp(f, L.t04.start + 22, L.t04.start + 40) * (1 - ramp(f, TL.events.ring[0], TL.events.ring[0] + 6));
  p = blend(p, { lean: 0.16, twist: -0.25, tilt: 0.1, hy: -0.4, hp: 0.3, eyeY: -0.7, eyeX: -0.6, browUp: 0.3, smile: 0.4 }, wp);
  // zəng: diksinir
  const r0 = TL.events.ring[0];
  p = blend(p, { lean: -0.02, lid: 1.25, browUp: 1, smile: -0.3, hy: -0.35, hp: 0.18, eyeY: -0.4 }, pulse(f, r0 + 1, 4, L.t05.start, 8));
  // ikiüzlülüyə baxır: gözlər bərəlib
  const dis = ramp(f, L.t05.start, L.t05.start + 10) * (1 - ramp(f, TL.events.cough[0] - 2, TL.events.cough[0] + 4));
  p = blend(p, { lean: 0.02, twist: -0.1, tilt: 0.04, hy: -0.5, hp: -0.02, eyeX: -0.9, lid: 1.2, browUp: 0.75, browIn: 0.15, smile: -0.35 }, dis);
  // öskürək: tum boğazında qalır
  const c0 = TL.events.cough[0];
  const cw = ramp(f, c0, c0 + 4);
  const beat = Math.max(0, Math.sin((f - c0) * 0.75));
  if (cw > 0) {
    const cp = blend(p, { lean: 0.3 + beat * 0.06, twist: 0.05, hy: -0.15, hp: 0.25 + beat * 0.12, lid: 0.12, browIn: 0.65, browUp: 0.35, smile: -0.4 }, 1);
    const m = mouthWorld(cp);
    p = blend(p, { ...cp, la: { t: add3(m, [0.02, -0.02, 0.05]), pole: [0.8, -0.6, 0.1], wrist: [0.4, 0, 0] }, ra: { t: [x - 0.04, 0.9, 0.17], pole: [-0.6, -0.7, 0.2], wrist: [0, -0.9, 0] } }, cw);
  }
  return p;
};

const kenanCorrect = (f: number, tural: CharPose): CharPose => {
  let p = restPose(KX);
  p = blend(p, { hy: -0.38, eyeX: -0.55, smile: 0.1, tilt: 0.02 }, 1);
  const k0 = L.k03.start;
  // əlini Turalın çiyninə qoyur
  const sh = ramp(f, k0 - 8, k0 + 10) * (1 - ramp(f, L.t07.start + 30, L.t07.start + 50));
  const s = shoulderInRoot(tural, 1);
  p = blend(p, { lean: 0.1, tilt: 0.12, twist: -0.18, hy: -0.48, eyeX: -0.75, browIn: 0.3, browUp: 0.25, smile: 0.25, ra: { t: [s[0] + 0.02, s[1] + 0.045, s[2] + 0.03], pole: [-0.1, -0.9, 0.4], wrist: [0.9, 0, 0.3] } }, sh);
  // "Zəng edək ona" — gülümsəyir, başını tərpədir
  p = blend(p, { smile: 0.6, browIn: 0.1 }, ramp(f, L.k03.end - 40, L.k03.end - 20));
  const nod = pulse(f, L.t07.start, 8, L.t07.end, 10) * Math.sin((f - L.t07.start) * 0.35) * 0.06;
  p = offs(p, { hp: nod });
  p = blend(p, { smile: 0.85, lid: 0.92 }, ramp(f, L.t07.start + 20, L.t07.start + 40));
  // son: tumu Turala uzadır
  const e0 = TL.events.endCard;
  p = blend(p, { smile: 1, hy: -0.5, twist: -0.12, ra: { t: [TX + 0.42, 0.82, 0.4], pole: [-0.6, -0.7, -0.1], wrist: [-0.7, 0, 0] } }, pulse(f, e0 + 28, 14, e0 + 75, 14));
  return p;
};

// ---------- kamera ----------
const S = (pos: V3, target: V3, fov: number): Shot => ({ pos, target, fov });
const dolly = (f: number, a: number, b: number, s0: Shot, s1: Shot): Shot => {
  const t = smooth((f - a) / Math.max(1, b - a));
  return { pos: lv(s0.pos, s1.pos, t), target: lv(s0.target, s1.target, t), fov: lerp(s0.fov, s1.fov, t) };
};
/** Tək plan: personajın qarşısından, belindən yuxarı. */
const KEN = (d: number, dy = 0, x = 0.42) => S([x - 0.2, 1.16, d], [x, 1.14 + dy, 0], 30);
const TUR = (d: number, dy = 0, x = -0.42) => S([x + 0.2, 1.16, d], [x, 1.14 + dy, 0], 30);
const TWO = (z0: number, z1: number, f: number, a: number, b: number) =>
  dolly(f, a, b, S([0, 1.0, z0], [0, 0.93, 0], 36), S([0, 1.0, z1], [0, 0.93, 0], 36));

const camWrong = (f: number, tural: CharPose): Shot => {
  if (f < L.k01.start) return TWO(4.6, 4.1, f, 0, L.k01.start);
  if (DBG.cam) return DBG.cam;
  if (f < L.t03.start) return dolly(f, L.k01.start, L.t03.start, KEN(2.45), KEN(2.3));
  if (f < L.k02.start) return dolly(f, L.t03.start, L.k02.start, TUR(2.45), TUR(2.25));
  if (f < L.t04.start) return dolly(f, L.k02.start, L.t04.start, S([-0.07, 1.12, 3.3], [-0.07, 1.08, 0], 32), S([-0.07, 1.12, 3.05], [-0.07, 1.08, 0], 32));
  if (f < L.t05.start) return dolly(f, L.t04.start, L.t05.start, TUR(2.35, -0.05), TUR(2.1, -0.07));
  return dolly(f, L.t05.start, TL.events.freeze, S([0, 1.02, 3.9], [0, 0.95, 0], 36), S([0, 1.02, 3.55], [0, 0.97, 0], 36));
};
const camCorrect = (f: number): Shot => {
  if (DBG.cam) return DBG.cam;
  const c0 = TL.parts.correct[0];
  if (f < L.k03.start + 20) return TWO(4.6, 4.3, f, c0, L.k03.start + 20);
  if (f < L.k03.start + 95) return dolly(f, L.k03.start + 20, L.k03.start + 95, KEN(2.4, 0, 0.42), KEN(2.2, 0, 0.42));
  if (f < L.t07.start + 50) return dolly(f, L.k03.start + 95, L.t07.start + 50, TUR(2.4), TUR(2.15));
  if (f < TL.events.endCard) return TWO(3.4, 3.2, f, L.t07.start + 50, TL.events.endCard);
  return dolly(f, TL.events.endCard, TL.total, S([0, 1.05, 3.4], [0, 0.95, 0], 36), S([0.9, 2.9, 8.2], [0, 1.25, 0], 40));
};

const phoneOf = (mode: Mode, f: number): PhoneState => {
  const pz = (k: number) => 0.5 + 0.5 * Math.sin(f * k);
  if (mode === 'wrong') {
    const vis = f >= L.t04.start + 12;
    const r0 = TL.events.ring[0];
    if (f < r0) return { visible: vis, screen: 'chat', pulse: 0, buzz: 0 };
    if (f < L.t05.start) return { visible: true, screen: 'incoming', pulse: pz(0.9), buzz: f % 12 < 7 ? 1 : 0 };
    return { visible: true, screen: 'call', pulse: (f - L.t05.start) / 300, buzz: 0 };
  }
  const d0 = TL.events.dial[0];
  const vis = f >= d0 - 12 && f < TL.events.endCard + 24;
  if (f < L.t07.start) return { visible: vis, screen: 'calling', pulse: 0, buzz: 0 };
  return { visible: vis, screen: 'call', pulse: (f - L.t07.start) / 300, buzz: 0 };
};

const finish = (p: CharPose, who: 'tural' | 'kenan', f: number): CharPose => {
  const talk = mouthEnv(who, f);
  let q = life(p, who, f, talk);
  q = bite(q, who, f);
  const m = Math.max(talk * 0.85, chew(who, f), q.mouth);
  const coughing = who === 'kenan' && f >= TL.events.cough[0] && f < TL.events.cough[1] + 6 && f < TL.parts.wrong[1] + 1;
  const cm = coughing ? 0.25 + 0.5 * Math.max(0, Math.sin((f - TL.events.cough[0]) * 0.75)) : 0;
  return { ...q, mouth: Math.max(m, cm), lid: q.lid * blinkAt(who, f) };
};

/** Səhnənin tam vəziyyəti: mode = 'wrong' (yanlış adət) və ya 'correct' (düz variant və son). */
export const stageAt = (mode: Mode, f: number): Stage => {
  if (mode === 'wrong') {
    const tural = finish(turalWrong(f), 'tural', f);
    const kenan = finish(kenanWrong(f), 'kenan', f);
    const shells = [
      ...shellsUpTo('kenan', f, (g) => kenanWrong(g), 0, TL.parts.wrong[1]),
      ...shellsUpTo('tural', f, (g) => turalWrong(g), 0, TL.parts.wrong[1]),
    ];
    return { tural, kenan, phone: phoneOf(mode, f), seedL: true, shells, cam: camWrong(f, tural) };
  }
  const t0 = turalCorrect(f, restPose(KX));
  const kenan = finish(kenanCorrect(f, t0), 'kenan', f);
  const tural = finish(turalCorrect(f, kenan), 'tural', f);
  return {
    tural,
    kenan,
    phone: phoneOf(mode, f),
    seedL: true,
    shells: shellsUpTo('kenan', f, (g) => kenanCorrect(g, turalCorrect(g, restPose(KX))), TL.parts.rewind[0], TL.total),
    cam: camCorrect(f),
  };
};

export const clampF = (f: number) => clamp(f, 0, TL.total);
