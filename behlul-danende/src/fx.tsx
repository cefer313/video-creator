import React from 'react';

/** Effektlər: konfetti, parıltı, dava toz buludu, başın üstündə ulduzlar, nida, tərəzi, uçan kartlar. Hamısı dünya koordinatlarında (SVG). */
const rnd = (i: number) => {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};
const CONF_COL = ['#FFD149', '#C13A2B', '#62D2B9', '#FBF3E4', '#FF8C5A', '#7EC8F0'];

/** Konfetti: t — partlayışdan bəri kadr. */
export const Confetti: React.FC<{ t: number; x: number; y: number; n?: number; spread?: number }> = ({ t, x, y, n = 70, spread = 1 }) => {
  if (t < 0 || t > 120) return null;
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const ang = -Math.PI / 2 + (rnd(i) - 0.5) * 2.6;
        const sp = (9 + rnd(i + 5) * 14) * spread;
        const px = x + Math.cos(ang) * sp * t;
        const py = y + Math.sin(ang) * sp * t + 0.45 * t * t * 0.5 + t * 1.5;
        const rot = t * (8 + rnd(i + 2) * 14) * (i % 2 ? 1 : -1);
        const o = t > 90 ? (120 - t) / 30 : 1;
        return <rect key={i} x={px - 7} y={py - 4} width={14} height={8} fill={CONF_COL[i % CONF_COL.length]} transform={`rotate(${rot},${px},${py})`} opacity={o} />;
      })}
    </g>
  );
};

const Star4: React.FC<{ x: number; y: number; r: number; c?: string; o?: number }> = ({ x, y, r, c = '#FFE9A0', o = 1 }) => (
  <path d={`M ${x} ${y - r} Q ${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y} Q ${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r} Q ${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y} Q ${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r} Z`} fill={c} opacity={o} />
);

/** Parıltılar: dövri yanıb-sönən dörd ucu ulduzlar. */
export const Sparkles: React.FC<{ f: number; x: number; y: number; w: number; h: number; n?: number; seed?: number }> = ({ f, x, y, w, h, n = 10, seed = 0 }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const per = 40 + rnd(i + seed) * 30;
      const ph = ((f + rnd(i + seed + 9) * per) % per) / per;
      const s = Math.sin(ph * Math.PI);
      return <Star4 key={i} x={x + (rnd(i + seed + 3) - 0.5) * w} y={y + (rnd(i + seed + 4) - 0.5) * h} r={6 + 18 * s} o={s} />;
    })}
  </g>
);

/** Cizgi filmi davası: yumru toz buludu, içindən əl-ayaq, nizə və ulduzlar çıxır. */
export const DustCloud: React.FC<{ t: number; x: number; y: number; life: number }> = ({ t, x, y, life }) => {
  if (t < 0 || t > life) return null;
  const grow = Math.min(1, t / 6) * (t > life - 8 ? (life - t) / 8 : 1);
  const puffs = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 13) * Math.PI * 2 + t * 0.07;
    const rr = 150 + Math.sin(t * 0.9 + i * 2) * 26;
    return { x: x + Math.cos(a) * rr * 1.2, y: y + Math.sin(a) * rr * 0.8, r: 90 + Math.sin(t * 1.3 + i) * 18 };
  });
  const limbs = [0, 1, 2, 3, 4];
  return (
    <g transform={`translate(${x},${y}) scale(${grow}) translate(${-x},${-y})`}>
      {limbs.map((i) => {
        const a = ((Math.floor(t / 5) * 1.7 + i * 1.3) % 6.28);
        const lx = x + Math.cos(a) * 230;
        const ly = y + Math.sin(a) * 170;
        const kind = i % 3;
        return (
          <g key={i} transform={`rotate(${(a * 180) / Math.PI + 90},${lx},${ly})`}>
            {kind === 0 && <rect x={lx - 22} y={ly - 70} width={44} height={110} rx={22} fill="#A52232" />}
            {kind === 0 && <circle cx={lx} cy={ly - 70} r={26} fill="#E0A07A" />}
            {kind === 1 && <rect x={lx - 20} y={ly - 80} width={40} height={120} rx={20} fill="#6B5A45" />}
            {kind === 1 && <ellipse cx={lx} cy={ly - 84} rx={34} ry={16} fill="#5A3A23" />}
            {kind === 2 && <line x1={lx} y1={ly + 60} x2={lx} y2={ly - 140} stroke="#8B5A2B" strokeWidth={14} strokeLinecap="round" />}
          </g>
        );
      })}
      {puffs.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={i % 2 ? '#E8DCC4' : '#D8CBB0'} />
      ))}
      <ellipse cx={x} cy={y} rx={200} ry={150} fill="#E8DCC4" />
      {[0, 1, 2].map((i) => {
        const a = t * 0.25 + i * 2.1;
        return <Star4 key={i} x={x + Math.cos(a) * 120} y={y + Math.sin(a) * 80} r={30} c="#FFD149" />;
      })}
      {[0, 1].map((i) => (
        <path key={i} d={`M ${x - 60 + i * 90} ${y - 40} q 20 -30 40 0 q 20 30 40 0`} stroke="#B9A88A" strokeWidth={10} fill="none" strokeLinecap="round" />
      ))}
    </g>
  );
};

/** Başın ətrafında fırlanan ulduzlar (başı gicəllənib). */
export const DizzyStars: React.FC<{ f: number; x: number; y: number; o?: number }> = ({ f, x, y, o = 1 }) => (
  <g opacity={o}>
    <ellipse cx={x} cy={y} rx={130} ry={34} fill="none" stroke="#FFD149" strokeWidth={4} opacity={0.4} />
    {[0, 1, 2].map((i) => {
      const a = f * 0.12 + (i * Math.PI * 2) / 3;
      return <Star4 key={i} x={x + Math.cos(a) * 130} y={y + Math.sin(a) * 34} r={24} c="#FFD149" />;
    })}
  </g>
);

/** Nida işarəsi (keşikçilərin üstündə). */
export const Exclaim: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => {
  if (t < 0) return null;
  const s = t < 6 ? (t / 6) * 1.2 : t < 10 ? 1.2 - (t - 6) * 0.05 : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${s}) rotate(${Math.sin(t / 3) * 6})`}>
      <rect x={-16} y={-110} width={32} height={78} rx={14} fill="#FFD149" stroke="#1E1A2D" strokeWidth={6} />
      <circle cx={0} cy={-8} r={18} fill="#FFD149" stroke="#1E1A2D" strokeWidth={6} />
    </g>
  );
};

const pop = (t: number) => (t <= 0 ? 0 : t < 6 ? (t / 6) * 1.12 : t < 10 ? 1.12 - ((t - 6) / 4) * 0.12 : 1);

/** Ədalət tərəzisi («hesab günü»). */
export const ScaleIcon: React.FC<{ t: number; x: number; y: number; f: number }> = ({ t, x, y, f }) => {
  if (t < 0) return null;
  const tilt = Math.sin(f / 12) * 6;
  return (
    <g transform={`translate(${x},${y}) scale(${pop(t)})`}>
      <circle r={150} fill="#FFD149" opacity={0.18} />
      <rect x={-10} y={-110} width={20} height={200} rx={8} fill="#E4B94B" />
      <rect x={-70} y={86} width={140} height={22} rx={10} fill="#C9962E" />
      <g transform={`rotate(${tilt})`}>
        <rect x={-130} y={-104} width={260} height={16} rx={8} fill="#E4B94B" />
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 118},-96) rotate(${-tilt})`}>
            <line x1={0} y1={0} x2={-40} y2={80} stroke="#C9962E" strokeWidth={5} />
            <line x1={0} y1={0} x2={40} y2={80} stroke="#C9962E" strokeWidth={5} />
            <path d="M -56 80 L 56 80 Q 40 120 0 120 Q -40 120 -56 80 Z" fill="#E4B94B" />
          </g>
        ))}
      </g>
      <circle cy={-112} r={16} fill="#C13A2B" />
    </g>
  );
};

/** Ağ kart, içində ikon: taxt / sarıq-tac / qızıl sikkələr. */
export const IconCard: React.FC<{ kind: 'throne' | 'crown' | 'coins'; t: number; x: number; y: number; rot: number; f: number; crumble: number }> = ({ kind, t, x, y, rot, f, crumble }) => {
  if (t < 0) return null;
  const fl = Math.sin(f / 18 + x) * 10;
  const o = 1 - crumble;
  const fall = crumble * crumble * 260;
  return (
    <g>
      <g transform={`translate(${x},${y + fl + fall}) rotate(${rot + crumble * 25}) scale(${1.35 * pop(t) * (1 - crumble * 0.3)})`} opacity={o}>
        <rect x={-118} y={-118} width={236} height={236} rx={30} fill="#1E1A2D" />
        <rect x={-108} y={-108} width={216} height={216} rx={24} fill="#FBF3E4" />
        {kind === 'throne' && (
          <g>
            <path d="M -50 60 L -50 -20 Q -50 -70 0 -80 Q 50 -70 50 -20 L 50 60 Z" fill="#E4B94B" />
            <path d="M -32 40 L -32 -14 Q -32 -50 0 -58 Q 32 -50 32 -14 L 32 40 Z" fill="#A52232" />
            <rect x={-64} y={30} width={128} height={30} rx={12} fill="#C13A2B" />
            <rect x={-70} y={58} width={140} height={16} rx={6} fill="#C9962E" />
          </g>
        )}
        {kind === 'crown' && (
          <g>
            <ellipse cx={0} cy={0} rx={74} ry={56} fill="#F4F1EA" stroke="#DCD6C8" strokeWidth={6} />
            <ellipse cx={0} cy={44} rx={70} ry={14} fill="#DCD6C8" />
            <circle cx={0} cy={-6} r={20} fill="#E4B94B" />
            <circle cx={0} cy={-6} r={11} fill="#C13A2B" />
            <path d="M 4 -24 Q 20 -70 50 -84 Q 30 -56 16 -22 Z" fill="#E4B94B" />
          </g>
        )}
        {kind === 'coins' && (
          <g>
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <ellipse cx={-20} cy={60 - i * 22} rx={46} ry={16} fill="#C9962E" />
                <ellipse cx={-20} cy={54 - i * 22} rx={46} ry={16} fill="#FFD149" />
              </g>
            ))}
            <circle cx={46} cy={10} r={40} fill="#E4B94B" />
            <circle cx={46} cy={10} r={28} fill="#FFD149" />
            <rect x={40} y={-6} width={12} height={32} rx={4} fill="#E4B94B" />
          </g>
        )}
      </g>
      {crumble > 0 &&
        Array.from({ length: 22 }, (_, i) => {
          const px = x + (rnd(i + x) - 0.5) * 220;
          const py = y + (rnd(i + y) - 0.5) * 200 + crumble * (200 + rnd(i) * 260);
          return <rect key={i} x={px} y={py} width={10} height={10} fill={i % 2 ? '#E4B94B' : '#D8CBB0'} opacity={Math.max(0, 1 - crumble * 1.1)} />;
        })}
    </g>
  );
};
