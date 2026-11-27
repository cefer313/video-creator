import data from './timeline.json';

export type Line = {
  id: string;
  who: 'narr' | 'behlul' | 'harun';
  text: string;
  start: number;
  voiceAt: number;
  vdur: number;
  end: number;
  env: number[];
  words: number[];
};

export const FPS: number = data.fps;
export const TOTAL: number = data.total;
export const LINES: Line[] = data.lines as Line[];

export const lineAt = (f: number) => {
  for (let i = LINES.length - 1; i >= 0; i--) if (f >= LINES[i].start) return i;
  return 0;
};

/** Danışanın dodaq açıqlığı (0..1) bu kadrda. */
export const talkOf = (ln: Line, f: number) => {
  const k = f - ln.voiceAt;
  if (k < 0 || k >= ln.env.length) return 0;
  const v = ln.env[k];
  return v < 0.12 ? 0 : Math.min(1, v * 1.1);
};
