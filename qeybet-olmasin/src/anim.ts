// Kiçik riyazi köməkçilər: hamısı deterministikdir (kadr nömrəsindən asılıdır).
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (t: number) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
/** a..b aralığında 0→1 hamar keçid (kadrlarla). */
export const ramp = (f: number, a: number, b: number) => smooth((f - a) / Math.max(1, b - a));
/** Yuxarı qalxıb enən nəbz: a-da başlayır, ina qədər qalxır, out-dan b-yə qədər enir. */
export const pulse = (f: number, a: number, inLen: number, outStart: number, outLen: number) =>
  ramp(f, a, a + inLen) * (1 - ramp(f, outStart, outStart + outLen));

export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Hamar psevdo-küy (bir neçə sinusun cəmi). */
export const wobble = (t: number, seed: number) =>
  Math.sin(t * 1.13 + seed * 3.1) * 0.5 + Math.sin(t * 2.31 + seed * 7.7) * 0.3 + Math.sin(t * 0.47 + seed * 1.9) * 0.2;

/** Açar kadrlar arasında interpolyasiya: keys = [[kadr, dəyər], ...] */
export const track = (f: number, keys: [number, number][], ease = smooth) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) return lerp(v0, v1, ease((f - f0) / Math.max(1, f1 - f0)));
  }
  return keys[keys.length - 1][1];
};
