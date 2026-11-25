// Ümumi rəsm hissələri: səma, qum təpələri, dəvə, karvan, bulud, ağac, kilsə, fiqurlar.
// Hamısı deterministikdir — yalnız `frame`-dən asılıdır.
import React from 'react';

export const W = 1080;
export const H = 1920;

// Sadə deterministik "təsadüfi" ədəd
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Sky: React.FC<{ top: string; mid: string; bottom: string; id: string }> = ({ top, mid, bottom, id }) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={top} />
        <stop offset="0.55" stopColor={mid} />
        <stop offset="1" stopColor={bottom} />
      </linearGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H + 500} fill={`url(#${id})`} />
  </>
);

export const Stars: React.FC<{ frame: number; n?: number; maxY?: number; opacity?: number }> = ({
  frame,
  n = 140,
  maxY = 1100,
  opacity = 1,
}) => (
  <g opacity={opacity}>
    {Array.from({ length: n }).map((_, i) => {
      const tw = 0.55 + 0.45 * Math.sin(frame * 0.08 + i * 1.7);
      return (
        <circle key={i} cx={rnd(i) * W} cy={rnd(i + 500) * maxY} r={0.8 + rnd(i + 900) * 2.2} fill="#fff8e6" opacity={tw * (0.4 + rnd(i + 77) * 0.6)} />
      );
    })}
  </g>
);

export const Glow: React.FC<{ cx: number; cy: number; r: number; color: string; id: string; opacity?: number }> = ({
  cx,
  cy,
  r,
  color,
  id,
  opacity = 1,
}) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity={1} />
        <stop offset="0.35" stopColor={color} stopOpacity={0.45} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} opacity={opacity} />
  </>
);

// Hamar qum təpəsi
export const dunePath = (baseY: number, amp: number, seed: number, shift = 0) => {
  const pts: string[] = [];
  const step = 30;
  for (let x = -60; x <= W + 60; x += step) {
    const xx = x + shift;
    const y =
      baseY -
      amp * (0.6 * Math.sin(xx * 0.0042 + seed) + 0.3 * Math.sin(xx * 0.0091 + seed * 2.3) + 0.1 * Math.sin(xx * 0.021 + seed * 5));
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M-60,${H + 500} L${pts.join(' L')} L${W + 60},${H + 500} Z`;
};

export const Dune: React.FC<{ baseY: number; amp: number; seed: number; shift?: number; fill: string }> = ({
  baseY,
  amp,
  seed,
  shift = 0,
  fill,
}) => <path d={dunePath(baseY, amp, seed, shift)} fill={fill} />;

// ---------- Dəvə (yandan, sağa baxır), lokal koordinat: ayaqlar y=0, uzunluq ~300 ----------
export const Camel: React.FC<{
  phase: number; // yeriş fazası (radian); hərəkətsiz üçün sabit
  walking?: boolean;
  color: string;
  rider?: 'man' | 'none' | 'nur';
  riderColor?: string;
  load?: boolean;
  frame?: number;
  sitting?: boolean;
}> = ({ phase, walking = true, color, rider = 'man', riderColor, load = false, frame = 0, sitting = false }) => {
  const bob = walking ? Math.sin(phase * 2) * 4 : 0;
  const sw = (o: number) => (walking ? Math.sin(phase + o) * 22 : 0);
  const leg = (x: number, o: number, key: string) => {
    const a = sw(o);
    return (
      <g key={key} transform={`translate(${x},-150) rotate(${a})`}>
        <path d="M-9,0 L9,0 L6,75 L8,148 L-4,150 L-6,78 Z" fill={color} />
      </g>
    );
  };
  if (sitting) {
    return (
      <g>
        <path
          d="M-120,-10 C-130,-60 -90,-95 -40,-100 C-20,-150 30,-150 50,-105 C80,-100 100,-80 105,-55 L120,-60 C130,-110 140,-170 160,-185 C175,-195 200,-190 205,-178 L190,-170 C175,-160 165,-120 155,-50 C150,-20 120,0 90,0 L-110,0 Z"
          fill={color}
        />
        {load && <path d="M-60,-120 L40,-120 L50,-90 L-70,-90 Z" fill="#7a3b22" opacity={0.9} />}
      </g>
    );
  }
  const rc = riderColor ?? color;
  return (
    <g transform={`translate(0,${bob})`}>
      {leg(-95, Math.PI, 'l1')}
      {leg(70, 0, 'l2')}
      <g opacity={0.95}>
        {/* bədən + hörgüc */}
        <path
          d="M-130,-150 C-150,-185 -120,-215 -80,-220 C-55,-290 25,-295 45,-225 C75,-222 100,-205 110,-180 L130,-200 C140,-250 150,-300 172,-318 C186,-330 214,-326 222,-312 L224,-300 L205,-296 C190,-285 180,-240 172,-185 C165,-150 140,-135 100,-135 L-110,-135 C-125,-135 -132,-140 -130,-150 Z"
          fill={color}
        />
        {/* quyruq */}
        <path d="M-128,-178 C-145,-170 -150,-150 -146,-130 L-140,-130 C-140,-150 -136,-165 -124,-170 Z" fill={color} />
      </g>
      {leg(-70, 0, 'l3')}
      {leg(95, Math.PI, 'l4')}
      {load && (
        <g>
          <path d="M-110,-215 L-40,-230 L-30,-170 L-105,-160 Z" fill="#7a3b22" />
          <path d="M-110,-215 L-40,-230" stroke="#c9974a" strokeWidth={5} />
        </g>
      )}
      {/* yəhər örtüyü */}
      <path d="M-50,-262 C-20,-275 20,-272 40,-258 L42,-235 L-52,-238 Z" fill="#8c2f2a" />
      <path d="M-52,-240 L42,-237" stroke="#e3b35c" strokeWidth={5} />
      {rider === 'man' && (
        <g transform="translate(-5,-262)" fill={rc}>
          {/* plaşlı adam (üzsüz siluet) */}
          <path d="M-34,0 C-30,-40 -28,-70 -18,-92 L18,-92 C28,-70 32,-40 38,0 Z" />
          <path d="M-24,0 L-40,40 L-22,42 L-10,5 Z" />
          <circle cx={0} cy={-110} r={20} />
          <path d="M-22,-112 C-22,-134 22,-134 22,-112 L24,-100 C10,-106 -10,-106 -24,-100 Z" />
          <path d="M-20,-104 C-30,-80 -34,-60 -32,-40 L-24,-40 C-24,-62 -18,-82 -12,-100 Z" />
        </g>
      )}
      {rider === 'nur' && (
        <g transform="translate(-5,-300)">
          <NurOrb frame={frame} r={62} id={`nurc${Math.round(phase * 100)}`} />
        </g>
      )}
    </g>
  );
};

// Nur: üzsüz, formasız yumşaq işıq kürəsi
export const NurOrb: React.FC<{ frame: number; r: number; id: string; opacity?: number }> = ({ frame, r, id, opacity = 1 }) => {
  const p = 1 + 0.06 * Math.sin(frame * 0.07);
  return (
    <g opacity={opacity}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor="#fffdf2" stopOpacity={1} />
          <stop offset="0.25" stopColor="#ffe9a8" stopOpacity={0.85} />
          <stop offset="0.6" stopColor="#ffc864" stopOpacity={0.3} />
          <stop offset="1" stopColor="#ffb040" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={0} cy={0} r={r * 2.4 * p} fill={`url(#${id})`} />
      <circle cx={0} cy={0} r={r * 0.9 * p} fill={`url(#${id})`} />
    </g>
  );
};

export const Caravan: React.FC<{
  frame: number;
  x: number; // birinci dəvənin x mövqeyi
  y: number;
  scale: number;
  dir?: 1 | -1;
  color: string;
  n?: number;
  nurIndex?: number; // Peyğəmbərin (s) dəvəsi — nur ilə
  walking?: boolean;
  speed?: number;
}> = ({ frame, x, y, scale, dir = 1, color, n = 5, nurIndex = 2, walking = true, speed = 0.16 }) => (
  <g transform={`translate(${x},${y}) scale(${scale * dir},${scale})`}>
    {Array.from({ length: n }).map((_, i) => (
      <g key={i} transform={`translate(${-i * 330},0)`}>
        <Camel
          phase={frame * speed + i * 1.3}
          walking={walking}
          color={color}
          rider={i === nurIndex ? 'nur' : i % 2 === 0 || i === 1 ? 'man' : 'none'}
          load={i !== nurIndex && i % 2 === 1}
          frame={frame}
        />
        {i < n - 1 && <path d={`M-140,-150 Q-180,-120 -${330 - 200},-300`} stroke={color} strokeWidth={3} fill="none" opacity={0.6} />}
      </g>
    ))}
  </g>
);

// Bulud (yumşaq, ağ)
export const Cloud: React.FC<{ x: number; y: number; s: number; id: string; color?: string; opacity?: number }> = ({
  x,
  y,
  s,
  id,
  color = '#fff7ea',
  opacity = 0.95,
}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor={color} />
      </linearGradient>
    </defs>
    <g fill={`url(#${id})`}>
      <ellipse cx={0} cy={20} rx={190} ry={55} />
      <circle cx={-90} cy={-5} r={70} />
      <circle cx={-10} cy={-45} r={95} />
      <circle cx={85} cy={-15} r={75} />
      <circle cx={150} cy={15} r={50} />
      <circle cx={-160} cy={20} r={45} />
    </g>
    <ellipse cx={0} cy={60} rx={170} ry={14} fill="#d9b88a" opacity={0.35} />
  </g>
);

// Böyük ağac (akasiya tipli)
export const Tree: React.FC<{ x: number; y: number; s: number; color: string; leaf: string; frame: number }> = ({
  x,
  y,
  s,
  color,
  leaf,
  frame,
}) => {
  const sway = Math.sin(frame * 0.03) * 1.2;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path
        d="M-30,0 C-25,-120 -20,-220 -60,-330 L-40,-335 C-10,-260 0,-230 5,-200 C20,-260 60,-310 110,-340 L120,-325 C70,-290 35,-230 28,-150 C26,-90 30,-40 36,0 Z"
        fill={color}
      />
      <path d="M-45,-300 C-110,-330 -170,-350 -220,-345 L-218,-332 C-160,-335 -110,-318 -52,-288 Z" fill={color} />
      <g transform={`rotate(${sway},0,-380)`} fill={leaf}>
        <ellipse cx={-180} cy={-380} rx={170} ry={55} />
        <ellipse cx={20} cy={-420} rx={230} ry={70} />
        <ellipse cx={200} cy={-370} rx={160} ry={50} />
        <ellipse cx={-60} cy={-470} rx={150} ry={45} />
        <ellipse cx={120} cy={-460} rx={130} ry={40} />
      </g>
    </g>
  );
};

// Rahib (kapüşonlu plaş), arxadan/yandan siluet, üz cizgisi yoxdur
export const Monk: React.FC<{ x: number; y: number; s: number; color: string; lift?: number }> = ({ x, y, s, color, lift = 0 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill={color}>
    <path d="M-80,0 C-75,-120 -70,-230 -50,-300 C-40,-330 40,-330 50,-300 C70,-230 75,-120 85,0 Z" />
    <path d="M-48,-300 C-60,-360 -40,-405 0,-410 C40,-405 60,-360 48,-300 C30,-312 -30,-312 -48,-300 Z" />
    {/* əl */}
    <path d={`M45,-240 C80,${-220 - lift} 100,${-190 - lift * 1.4} 110,${-170 - lift * 1.6} L95,${-160 - lift * 1.6} C80,-180 60,-200 40,-210 Z`} />
  </g>
);

// Oturan siluet (süfrə arxasında)
export const SeatedMan: React.FC<{ x: number; y: number; s: number; color: string; turban?: string }> = ({ x, y, s, color, turban }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-70,0 C-70,-70 -55,-130 -30,-150 L30,-150 C55,-130 70,-70 70,0 Z" fill={color} />
    <circle cx={0} cy={-175} r={30} fill={color} />
    <path d="M-32,-178 C-34,-212 34,-212 32,-178 C20,-186 -20,-186 -32,-178 Z" fill={turban ?? color} />
  </g>
);

// Kilsə / monastır (daş bina, zəng qülləsi)
export const Monastery: React.FC<{ x: number; y: number; s: number; wall: string; shade: string; lit: number; frame: number }> = ({
  x,
  y,
  s,
  wall,
  shade,
  lit,
  frame,
}) => {
  const fl = 0.85 + 0.15 * Math.sin(frame * 0.3) * Math.sin(frame * 0.17);
  const win = `rgba(255,${190 + 30 * fl},${100},${lit})`;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* əsas bina */}
      <rect x={-260} y={-300} width={420} height={300} fill={wall} />
      <rect x={60} y={-300} width={100} height={300} fill={shade} />
      <path d="M-280,-300 L-50,-390 L180,-300 Z" fill={shade} />
      {/* qüllə */}
      <rect x={-380} y={-560} width={150} height={560} fill={wall} />
      <rect x={-260} y={-560} width={30} height={560} fill={shade} />
      <path d="M-395,-560 L-305,-650 L-215,-560 Z" fill={shade} />
      <rect x={-309} y={-720} width={8} height={70} fill={shade} />
      <rect x={-330} y={-700} width={50} height={8} fill={shade} />
      {/* pəncərələr */}
      <path d="M-335,-470 L-335,-410 L-275,-410 L-275,-470 A30,30 0 0 0 -335,-470 Z" fill={win} />
      <path d="M-200,-200 L-200,-120 L-150,-120 L-150,-200 A25,25 0 0 0 -200,-200 Z" fill={win} />
      <path d="M-80,-200 L-80,-120 L-30,-120 L-30,-200 A25,25 0 0 0 -80,-200 Z" fill={win} />
      {/* qapı */}
      <path d="M20,0 L20,-120 A45,45 0 0 1 110,-120 L110,0 Z" fill="#3a2618" />
      {/* daş xətləri */}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={-380} x2={-230} y1={-60 * i - 30} y2={-60 * i - 30} stroke={shade} strokeWidth={3} opacity={0.4} />
      ))}
    </g>
  );
};

// Şəhər siluetləri (Bəsrə)
export const City: React.FC<{ y: number; color: string; s?: number }> = ({ y, color, s = 1 }) => (
  <g transform={`translate(0,${y}) scale(${s},${s})`} fill={color}>
    {Array.from({ length: 16 }).map((_, i) => {
      const w = 60 + rnd(i + 40) * 90;
      const h = 60 + rnd(i + 80) * 170;
      const x = i * 72 - 40;
      return (
        <g key={i}>
          <rect x={x} y={-h} width={w} height={h} />
          {rnd(i + 3) > 0.6 && <path d={`M${x},${-h} A${w / 2},${w / 2} 0 0 1 ${x + w},${-h} Z`} />}
          {rnd(i + 9) > 0.7 && <rect x={x + w / 2 - 10} y={-h - 90} width={20} height={90} />}
        </g>
      );
    })}
  </g>
);

// Yağ çırağı
export const Lamp: React.FC<{ x: number; y: number; s: number; frame: number; id: string }> = ({ x, y, s, frame, id }) => {
  const f = 1 + 0.12 * Math.sin(frame * 0.6) * Math.sin(frame * 0.23 + 1);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <Glow cx={0} cy={-40} r={260 * f} color="#ffb347" id={id} opacity={0.55} />
      <path d="M-60,0 C-60,-25 60,-25 70,-8 L95,-18 L80,2 C50,20 -40,20 -60,0 Z" fill="#8a5a2b" />
      <path d={`M68,-14 C62,${-40 * f} 75,${-62 * f} 80,${-70 * f} C88,${-50 * f} 90,-30 80,-14 Z`} fill="#ffd27a" />
      <path d={`M72,-14 C70,-30 76,${-46 * f} 79,${-50 * f} C83,-36 84,-24 78,-14 Z`} fill="#fff4d0" />
    </g>
  );
};
