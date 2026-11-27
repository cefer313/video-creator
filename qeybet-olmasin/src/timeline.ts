// Vaxt cədvəli: scripts/timing.py səs fayllarının uzunluğuna görə src/timeline.json-u yaradır.
import T from './timeline.json';

export type Who = 'tural' | 'kenan' | 'narrator';
export type Line = {
  id: string;
  who: Who;
  part: 'wrong' | 'explain' | 'correct' | 'end';
  text: string;
  start: number;
  end: number;
  startSec: number;
  env: number[];
};
type Timeline = {
  fps: number;
  total: number;
  parts: Record<'wrong' | 'explain' | 'rewind' | 'correct' | 'end', [number, number]>;
  events: { ring: [number, number]; cough: [number, number]; freeze: number; dial: [number, number]; endCard: number };
  bites: { who: 'tural' | 'kenan'; at: number }[];
  lines: Line[];
};

export const TL = T as unknown as Timeline;
export const FPS = TL.fps;
export const L: Record<string, Line> = Object.fromEntries(TL.lines.map((l) => [l.id, l]));

/** Personajın bu kadrdakı ağız açıqlığı (0..1) — səs zərfindən, 1 kadr qabaqcadan. */
export const mouthEnv = (who: Who, f: number): number => {
  for (const l of TL.lines) {
    if (l.who !== who) continue;
    const k = f - l.start + 1;
    if (k >= 0 && k < l.env.length) return l.env[k];
  }
  return 0;
};

/** Bu kadrda danışan replika (yoxdursa null). */
export const lineAt = (f: number, part?: string): Line | null => {
  for (const l of TL.lines) {
    if (part && l.part !== part) continue;
    if (f >= l.start && f < l.end + 6) return l;
  }
  return null;
};
