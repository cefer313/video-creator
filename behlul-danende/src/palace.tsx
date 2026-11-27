import React from 'react';

/** Xəlifənin taxt otağı: tünd bənövşəyi fon, qırmızı pərdələr, qızılı taxt, isti qəhvəyi döşəmə. Dünya ölçüsü 1080×1920. */
export const SEAT_Y = 1370; // taxtda oturanın ayaq nöqtəsi (pose.y)
export const FLOOR_Y = 1640; // ayaq üstə duranların ayaq səviyyəsi

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const STARS = Array.from({ length: 46 }, (_, i) => ({ x: 300 + rnd(i) * 480, y: 330 + rnd(i + 99) * 820, r: 2 + rnd(i + 7) * 4, k: rnd(i + 3) }));

const Curtain: React.FC<{ x0: number; x1: number; flip?: boolean }> = ({ x0, x1 }) => {
  const n = Math.ceil((x1 - x0) / 46);
  return (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={x0 + i * 46} y={0} width={48} height={1500} fill={i % 2 ? '#A52232' : '#7C1827'} />
      ))}
      {Array.from({ length: n }, (_, i) => (
        <rect key={'h' + i} x={x0 + i * 46 + 30} y={0} width={8} height={1500} fill="#C13A3F" opacity={i % 2 ? 0.35 : 0} />
      ))}
    </g>
  );
};

const Lantern: React.FC<{ x: number; y: number; f: number; glow: number }> = ({ x, y, f, glow }) => {
  const sway = Math.sin(f / 30 + x) * 3;
  return (
    <g transform={`rotate(${sway},${x},0)`}>
      <line x1={x} y1={120} x2={x} y2={y - 40} stroke="#C9962E" strokeWidth={4} />
      <circle cx={x} cy={y + 30} r={150} fill="url(#lglow)" opacity={glow} />
      <path d={`M ${x - 34} ${y - 20} L ${x + 34} ${y - 20} L ${x + 26} ${y + 70} L ${x - 26} ${y + 70} Z`} fill="#FFD149" />
      <path d={`M ${x - 44} ${y - 20} Q ${x} ${y - 70} ${x + 44} ${y - 20} Z`} fill="#E4B94B" />
      <rect x={x - 30} y={y + 66} width={60} height={14} rx={6} fill="#C9962E" />
      <rect x={x - 6} y={y - 10} width={12} height={70} fill="#E4B94B" opacity={0.7} />
    </g>
  );
};

export const Sign: React.FC<{ lit: number; f: number }> = ({ lit, f }) => {
  const bulbs = Array.from({ length: 22 }, (_, i) => i);
  return (
    <g transform="translate(540,205)">
      <line x1={-200} y1={-90} x2={-170} y2={-50} stroke="#C9962E" strokeWidth={4} />
      <line x1={200} y1={-90} x2={170} y2={-50} stroke="#C9962E" strokeWidth={4} />
      <rect x={-250} y={-52} width={500} height={104} rx={18} fill="#2A1F12" stroke={lit > 0.5 ? '#FFD149' : '#6E5A30'} strokeWidth={8} />
      {bulbs.map((i) => {
        const top = i < 11;
        const bx = -225 + (i % 11) * 45;
        const by = top ? -52 : 52;
        const on = lit > 0.5 ? (Math.floor(f / 6) + i) % 3 !== 0 : false;
        return <circle key={i} cx={bx} cy={by} r={7} fill={on ? '#FFE9A0' : '#6E5A30'} />;
      })}
      <text x={0} y={16} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={46} letterSpacing={2}
        fill={lit > 0.5 ? '#FFD149' : '#6E5A30'} opacity={0.4 + 0.6 * lit}>
        BƏHLUL DANƏNDƏ
      </text>
    </g>
  );
};

export const Throne: React.FC<{ glow: number }> = ({ glow }) => (
  <g>
    <ellipse cx={540} cy={1150} rx={300} ry={300} fill="url(#tglow)" opacity={glow} />
    {/* pillə */}
    <rect x={250} y={1300} width={580} height={70} rx={10} fill="#7E5A38" />
    <rect x={250} y={1300} width={580} height={16} rx={8} fill="#9A7048" />
    <rect x={200} y={1366} width={680} height={70} rx={10} fill="#6B4A2E" />
    <rect x={200} y={1366} width={680} height={16} rx={8} fill="#86603C" />
    {/* söykənəcək */}
    <path d="M 360 1300 L 360 1060 Q 360 900 540 860 Q 720 900 720 1060 L 720 1300 Z" fill="#E4B94B" />
    <path d="M 610 880 Q 720 920 720 1060 L 720 1300 L 650 1300 L 650 1050 Q 650 940 610 880 Z" fill="#C9962E" />
    <path d="M 405 1260 L 405 1080 Q 405 950 540 920 Q 675 950 675 1080 L 675 1260 Z" fill="#A52232" />
    <path d="M 540 960 L 560 1000 L 540 1040 L 520 1000 Z" fill="#E4B94B" />
    <circle cx={540} cy={870} r={22} fill="#C13A2B" stroke="#FFD149" strokeWidth={6} />
    {[0, 1, 2, 3, 4].map((i) => (
      <circle key={i} cx={430 + i * 55} cy={1110} r={9} fill="#FFD149" opacity={0.85} />
    ))}
    {/* oturacaq + yastıq */}
    <rect x={330} y={1180} width={70} height={140} rx={26} fill="#E4B94B" />
    <rect x={680} y={1180} width={70} height={140} rx={26} fill="#C9962E" />
    <rect x={390} y={1210} width={300} height={70} rx={30} fill="#C13A2B" />
    <rect x={390} y={1210} width={300} height={22} rx={11} fill="#D9584A" />
    <rect x={380} y={1270} width={320} height={34} rx={10} fill="#E4B94B" />
  </g>
);

export const Palace: React.FC<{ f: number; signLit: number; throneGlow: number; dim?: number }> = ({ f, signLit, throneGlow, dim = 0 }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    <defs>
      <radialGradient id="lglow">
        <stop offset="0" stopColor="#FFD149" stopOpacity={0.55} />
        <stop offset="1" stopColor="#FFD149" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="tglow">
        <stop offset="0" stopColor="#FFE08A" stopOpacity={0.5} />
        <stop offset="1" stopColor="#FFE08A" stopOpacity={0} />
      </radialGradient>
      <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.55" stopColor="#0C0716" stopOpacity={0} />
        <stop offset="1" stopColor="#0C0716" stopOpacity={0.55} />
      </radialGradient>
    </defs>
    <rect x={-400} y={-400} width={1880} height={2800} fill="#2B1A52" />
    {/* pəncərə tağı */}
    <path d="M 270 1320 L 270 560 Q 270 300 540 260 Q 810 300 810 560 L 810 1320 Z" fill="#170F33" />
    {STARS.map((s, i) => (
      <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#FBF3E4" opacity={0.35 + 0.45 * Math.abs(Math.sin(f / 20 + s.k * 6))} />
    ))}
    <circle cx={690} cy={470} r={58} fill="#FFD149" />
    <circle cx={716} cy={452} r={52} fill="#170F33" />
    {/* spot konusu */}
    <path d="M 420 -50 L 660 -50 L 960 1480 L 120 1480 Z" fill="#FFFFFF" opacity={0.05} />
    <ellipse cx={540} cy={1180} rx={470} ry={420} fill="#4A356F" opacity={0.22} />
    {/* sütunlar */}
    {[150, 930].map((x) => (
      <g key={x}>
        <rect x={x - 55} y={330} width={110} height={1080} fill="#4A356F" />
        <rect x={x + 10} y={330} width={45} height={1080} fill="#3C2A58" />
        <rect x={x - 70} y={310} width={140} height={44} rx={8} fill="#E4B94B" />
        <rect x={x - 70} y={1380} width={140} height={44} rx={8} fill="#C9962E" />
      </g>
    ))}
    {/* döşəmə */}
    <rect x={-400} y={1420} width={1880} height={1000} fill="#523323" />
    {[1480, 1560, 1660, 1790, 1950, 2140].map((y) => (
      <rect key={y} x={-400} y={y} width={1880} height={6} fill="#442A1D" />
    ))}
    <path d="M 420 1420 L 660 1420 L 860 2300 L 220 2300 Z" fill="#8D1B29" />
    <path d="M 420 1420 L 660 1420 L 860 2300 L 220 2300 Z" fill="none" stroke="#E4B94B" strokeWidth={10} />
    <path d="M 450 1440 L 630 1440 L 800 2300 L 280 2300 Z" fill="none" stroke="#C9962E" strokeWidth={4} strokeDasharray="14 14" />
    <Throne glow={throneGlow} />
    <Curtain x0={-400} x1={110} />
    <Curtain x0={970} x1={1480} />
    {/* lambreken */}
    <path d={`M -400 0 L 1480 0 L 1480 110 ${Array.from({ length: 24 }, (_, i) => `Q ${1480 - i * 80 - 40} 180 ${1480 - (i + 1) * 80} 110`).join(' ')} Z`} fill="#8D1B29" />
    {Array.from({ length: 24 }, (_, i) => (
      <circle key={i} cx={1480 - i * 80 - 40} cy={152} r={10} fill="#E4B94B" />
    ))}
    <Lantern x={290} y={420} f={f} glow={0.9} />
    <Lantern x={790} y={420} f={f} glow={0.9} />
    <Sign lit={signLit} f={f} />
    <rect x={-400} y={-400} width={1880} height={2800} fill="url(#vig)" />
    {dim > 0 && <rect x={-400} y={-400} width={1880} height={2800} fill="#140A26" opacity={dim} />}
  </svg>
);
