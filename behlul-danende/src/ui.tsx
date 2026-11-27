import React from 'react';
import { FPS, Line } from './timeline';

export const FONT = 'Montserrat, sans-serif';
const INK = '#1E1A2D';
const OUTLINE = [
  `0 0 3px ${INK}`,
  `5px 0 0 ${INK}`, `-5px 0 0 ${INK}`, `0 5px 0 ${INK}`, `0 -5px 0 ${INK}`,
  `4px 4px 0 ${INK}`, `-4px -4px 0 ${INK}`, `4px -4px 0 ${INK}`, `-4px 4px 0 ${INK}`,
  `6px 8px 0 ${INK}`,
].join(', ');

type W = { t: string; c: 'w' | 'y' | 'o'; i: number };

/** *söz* -> sarı, _söz_ -> narıncı. Dialoq üçün «» və tire əlavə olunur. */
const parse = (ln: Line): W[] => {
  const raw = ln.text.split(' ');
  let mode: 'w' | 'y' | 'o' = 'w';
  const out: W[] = raw.map((w0, i) => {
    let w = w0;
    let c: 'w' | 'y' | 'o' = mode;
    if (w.startsWith('*')) { c = 'y'; mode = 'y'; w = w.slice(1); }
    if (w.startsWith('_')) { c = 'o'; mode = 'o'; w = w.slice(1); }
    if (w.endsWith('*') || w.endsWith('_')) { w = w.slice(0, -1); mode = 'w'; }
    else if (/[*_][.,!?]+$/.test(w)) { w = w.replace(/[*_]/, ''); mode = 'w'; }
    return { t: w, c, i };
  });
  if (ln.who !== 'narr') {
    out[0].t = '— «' + out[0].t;
    out[out.length - 1].t = out[out.length - 1].t + '»';
  }
  return out;
};

/** Sözləri ən çox 2 sətirlik səhifələrə bölür (sətirdə ~18 simvol). */
const paginate = (ws: W[]) => {
  const pages: W[][][] = [];
  let page: W[][] = [];
  let line: W[] = [];
  let len = 0;
  for (const w of ws) {
    const add = (len ? 1 : 0) + w.t.length;
    if (len + add > 18 && line.length) {
      page.push(line);
      line = [];
      len = 0;
      if (page.length === 2) { pages.push(page); page = []; }
    }
    line.push(w);
    len += (len ? 1 : 0) + w.t.length;
  }
  if (line.length) page.push(line);
  if (page.length) pages.push(page);
  return pages;
};

const COL = { w: '#FFFFFF', y: '#FFD34A', o: '#FF8C5A' };

export const Subtitle: React.FC<{ ln: Line; f: number }> = ({ ln, f }) => {
  const ws = parse(ln);
  const pages = paginate(ws);
  const rel = f - ln.voiceAt;
  const started = ln.words.map((s) => rel >= s);
  let cur = 0;
  ws.forEach((w, i) => { if (started[i]) cur = i; });
  const pi = Math.max(0, pages.findIndex((pg) => pg.some((l) => l.some((w) => w.i === cur))));
  if (rel < 0) return null;
  const page = pages[pi];
  return (
    <div style={{ position: 'absolute', left: 40, right: 40, top: 1410, height: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {page.map((l, li) => (
        <div key={li} style={{ display: 'flex', gap: 22, justifyContent: 'center', lineHeight: 1.08 }}>
          {l.map((w) => {
            const t0 = rel - ln.words[w.i];
            if (t0 < 0) return <span key={w.i} style={{ visibility: 'hidden', fontFamily: FONT, fontWeight: 900, fontSize: 78 }}>{w.t}</span>;
            const sc = t0 < 3 ? 0.6 + (t0 / 3) * 0.5 : t0 < 6 ? 1.1 - ((t0 - 3) / 3) * 0.1 : 1;
            return (
              <span key={w.i} style={{ display: 'inline-block', fontFamily: FONT, fontWeight: 900, fontSize: 78, color: COL[w.c], textShadow: OUTLINE, transform: `scale(${sc})` }}>
                {w.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const popS = (t: number) => (t <= 0 ? 0 : t < 6 ? (t / 6) * 1.1 : t < 10 ? 1.1 - ((t - 6) / 4) * 0.1 : 1);

/** «MONTAJ» tipli üst etiket. */
export const Badge: React.FC<{ text: string; t: number }> = ({ text, t }) => (
  <div style={{ position: 'absolute', top: 90, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
    <div style={{ transform: `scale(${popS(t)})`, background: '#252124', borderRadius: 26, padding: '14px 52px', fontFamily: FONT, fontWeight: 900, fontSize: 70, color: '#62D2B9', letterSpacing: 2 }}>
      {text}
    </div>
  </div>
);

/** Sarı əyik banner. */
export const Banner: React.FC<{ text: string; t: number; top?: number }> = ({ text, t, top = 210 }) => (
  <div style={{ position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
    <div style={{ transform: `rotate(-3deg) scale(${popS(t)})`, background: '#FFD149', border: `7px solid ${INK}`, borderRadius: 60, padding: '12px 44px', fontFamily: FONT, fontWeight: 900, fontSize: 44, color: INK, letterSpacing: 1 }}>
      {text}
    </div>
  </div>
);

/** Ağ CTA düyməsi: paylaşma ikonu + iki sətir. */
export const CtaPill: React.FC<{ t: number; top?: number }> = ({ t, top = 340 }) => (
  <div style={{ position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
    <div style={{ transform: `scale(${popS(t)})`, background: '#FFFFFF', border: `7px solid ${INK}`, borderRadius: 80, padding: '20px 54px 20px 22px', display: 'flex', alignItems: 'center', gap: 26, boxShadow: `0 10px 0 ${INK}` }}>
      <svg width={96} height={96} viewBox="0 0 96 96">
        <circle cx={48} cy={48} r={48} fill="#2AA3E0" />
        <circle cx={32} cy={50} r={9} fill="#fff" />
        <circle cx={64} cy={32} r={9} fill="#fff" />
        <circle cx={64} cy={68} r={9} fill="#fff" />
        <line x1={32} y1={50} x2={64} y2={32} stroke="#fff" strokeWidth={6} />
        <line x1={32} y1={50} x2={64} y2={68} stroke="#fff" strokeWidth={6} />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 46, color: INK, lineHeight: 1.1 }}>Bəyəndinsə</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, color: '#FF8C5A', lineHeight: 1.15 }}>dostunla paylaş</div>
      </div>
    </div>
  </div>
);

export const secToFrames = (s: number) => Math.round(s * FPS);
