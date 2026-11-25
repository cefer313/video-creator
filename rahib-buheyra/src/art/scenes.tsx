// Hər fon səhnəsi: tam 1080×1920 SVG illüstrasiya.
import React from 'react';
import { interpolate } from 'remotion';
import type { Bg } from '../story';
import {
  W,
  H,
  Sky,
  Stars,
  Glow,
  Dune,
  Caravan,
  Cloud,
  Tree,
  Monk,
  SeatedMan,
  Monastery,
  City,
  Lamp,
  NurOrb,
  Camel,
  rnd,
} from './parts';

type P = { f: number; dur: number; k: number }; // f: səhnə daxili kadr, k: səhnə nömrəsi (variasiya üçün)

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// oy: kadrı yuxarı sürüşdürür ki, əsas hərəkət altyazının üstündə qalsın
const Svg: React.FC<{ children: React.ReactNode; oy?: number }> = ({ children, oy = 330 }) => (
  <svg width={W} height={H} viewBox={`0 ${oy} ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
    {children}
  </svg>
);

const Mountains: React.FC<{ y: number; color: string; seed: number }> = ({ y, color, seed }) => {
  const pts: string[] = [];
  for (let x = -40; x <= W + 40; x += 40) {
    const h = 120 + 140 * Math.abs(Math.sin(x * 0.006 + seed)) + 60 * rnd(Math.floor(x / 40) + seed * 10);
    pts.push(`${x},${y - h}`);
  }
  return <path d={`M-40,${y} L${pts.join(' L')} L${W + 40},${y} Z`} fill={color} />;
};

const TitleBg: React.FC<P> = ({ f }) => (
  <Svg oy={0}>
    <Sky id="tsky" top="#070b1f" mid="#1b2147" bottom="#5a3d4a" />
    <Stars frame={f} n={180} maxY={1300} />
    {/* hilal */}
    <g transform="translate(800,330)">
      <Glow cx={0} cy={0} r={220} color="#ffeec2" id="moonglow" opacity={0.4} />
      <circle r={70} fill="#fff4d6" />
      <circle cx={28} cy={-14} r={62} fill="#0d1330" />
    </g>
    <Mountains y={1330} color="#2a2340" seed={1} />
    <Dune baseY={1420} amp={70} seed={2} fill="#3b2a3a" />
    <g transform="translate(0,0)">
      <Monastery x={880} y={1400} s={0.32} wall="#4a3646" shade="#33253a" lit={0.9} frame={f} />
    </g>
    <Caravan frame={f} x={interpolate(f, [0, 165], [430, 520])} y={1500} scale={0.36} color="#1c1426" n={5} />
    <Dune baseY={1640} amp={90} seed={5} fill="#24192a" />
  </Svg>
);

const CaravanBg: React.FC<P> = ({ f, k }) => {
  const shift = f * 2.2;
  const morning = k % 2 === 1;
  return (
    <Svg>
      <Sky
        id={`csky${k}`}
        top={morning ? '#f6c98b' : '#e9a86a'}
        mid={morning ? '#f7dcae' : '#f3c58c'}
        bottom="#f1d6a7"
      />
      <Glow cx={morning ? 300 : 760} cy={620} r={420} color="#fff1c9" id={`sun${k}`} opacity={0.9} />
      <circle cx={morning ? 300 : 760} cy={620} r={85} fill="#fff6dc" />
      <Mountains y={1050} color="#d8a77a" seed={3 + k} />
      <Dune baseY={1120} amp={60} seed={1.2} shift={shift * 0.3} fill="#e2b47d" />
      <Dune baseY={1260} amp={80} seed={2.7} shift={shift * 0.6} fill="#d79d63" />
      <ellipse cx={540} cy={1370} rx={700} ry={30} fill="#b97b47" opacity={0.25} />
      <Caravan frame={f} x={880} y={1360} scale={0.62} color="#4a2a1a" n={5} nurIndex={2} />
      <Dune baseY={1600} amp={70} seed={4.1} shift={shift * 1.4} fill="#c98a52" />
      <Dune baseY={1820} amp={60} seed={6.3} shift={shift * 2} fill="#b47440" />
    </Svg>
  );
};

const CityBg: React.FC<P> = ({ f }) => (
  <Svg>
    <Sky id="citysky" top="#f0b27a" mid="#f6d2a0" bottom="#f2dcb4" />
    <Glow cx={250} cy={700} r={380} color="#fff1c9" id="citysun" opacity={0.8} />
    <circle cx={250} cy={700} r={75} fill="#fff6dc" />
    <City y={1160} color="#c38e66" s={1} />
    <Dune baseY={1200} amp={30} seed={1} fill="#dcae78" />
    <Monastery x={830} y={1230} s={0.55} wall="#e6c79b" shade="#b98e64" lit={0.3} frame={f} />
    <Dune baseY={1330} amp={40} seed={2} fill="#d49c63" />
    <Caravan frame={f} x={interpolate(f, [0, 240], [420, 640], clamp)} y={1480} scale={0.45} color="#4a2a1a" n={5} walking={f < 240} />
    <Dune baseY={1760} amp={60} seed={3.3} fill="#bf8048" />
  </Svg>
);

const MonasteryBg: React.FC<P> = ({ f, k, dur }) => {
  const descend = k === 7; // ikinci dəfə: rahib enir
  const mx = descend ? interpolate(f, [0, dur], [300, 520], clamp) : 300;
  return (
    <Svg>
      <Sky id={`msky${k}`} top="#8fb6d8" mid="#e9d3ad" bottom="#f1d6a7" />
      <Mountains y={1100} color="#cfa47c" seed={7} />
      <Dune baseY={1160} amp={40} seed={1.5} fill="#ddb07a" />
      <Monastery x={640} y={1420} s={1.15} wall="#ead0a6" shade="#c19a6c" lit={0.4} frame={f} />
      <Dune baseY={1500} amp={30} seed={2.5} fill="#cf9b62" />
      {descend ? (
        <>
          <Monk x={mx} y={1620} s={0.75} color="#2f2230" lift={0} />
        </>
      ) : (
        // pəncərədən baxan rahib (qüllənin pəncərəsində qaranlıq siluet)
        <g transform="translate(640,1420) scale(1.15)">
          <path d="M-330,-410 C-330,-440 -280,-440 -280,-410 Z" fill="#2f2230" opacity={0.9} />
          <rect x={-326} y={-412} width={42} height={2} fill="#2f2230" />
        </g>
      )}
      <Dune baseY={1800} amp={50} seed={4.4} fill="#b97a45" />
    </Svg>
  );
};

const CloudBg: React.FC<P> = ({ f, dur }) => {
  const cx = interpolate(f, [0, dur], [320, 760]);
  const shift = f * 2;
  return (
    <Svg>
      <Sky id="clsky" top="#79a9d6" mid="#cfe0e8" bottom="#f1dcb2" />
      <Glow cx={980} cy={260} r={380} color="#fff4d4" id="clsun" opacity={0.9} />
      <Mountains y={1060} color="#cfa47c" seed={9} />
      <Dune baseY={1130} amp={50} seed={3.2} shift={shift * 0.3} fill="#e2b47d" />
      {/* buludun kölgəsi */}
      <ellipse cx={cx} cy={1390} rx={330} ry={46} fill="#7a4a26" opacity={0.28} />
      <Caravan frame={f} x={cx + 300} y={1400} scale={0.55} color="#4a2a1a" n={4} nurIndex={2} />
      <Cloud x={cx} y={760 + Math.sin(f * 0.05) * 8} s={1.05} id="cl1" />
      {/* uzaqda başqa buludlar yoxdur — yalnız bu bulud */}
      <Dune baseY={1640} amp={70} seed={5.1} shift={shift * 1.3} fill="#c98a52" />
      <Dune baseY={1850} amp={50} seed={7.2} shift={shift * 2} fill="#b47440" />
      {/* uzaqdan baxan rahib — sol kənarda qayanın üstündə */}
      <Monk x={110} y={1700} s={0.45} color="#2f2230" />
    </Svg>
  );
};

const TreeBg: React.FC<P> = ({ f, k }) => {
  const second = k === 12; // ikinci dəfə — kişi nur'u gətirir
  return (
    <Svg>
      <Sky id={`trsky${k}`} top={second ? '#e59a64' : '#86b2d8'} mid={second ? '#f4c58e' : '#d9e3e0'} bottom="#f1d6a7" />
      <Mountains y={1080} color="#cfa47c" seed={11} />
      <Dune baseY={1150} amp={40} seed={1.9} fill="#ddb07a" />
      <Cloud x={560} y={560 + Math.sin(f * 0.05) * 6} s={0.95} id={`trc${k}`} />
      <ellipse cx={560} cy={1440} rx={420} ry={50} fill="#7a4a26" opacity={0.25} />
      <Tree x={560} y={1450} s={1.25} color="#5a3a22" leaf="#5f7a3a" frame={f} />
      <g transform="translate(230,1500) scale(0.55)">
        <Camel phase={0} walking={false} sitting color="#4a2a1a" load />
      </g>
      <g transform="translate(900,1520) scale(-0.55,0.55)">
        <Camel phase={0} walking={false} sitting color="#4a2a1a" />
      </g>
      {second ? (
        <g transform={`translate(${interpolate(f, [0, 200], [560, 300], clamp)},1400)`}>
          <NurOrb frame={f} r={55} id="trnur" />
        </g>
      ) : (
        <g transform="translate(560,1400)">
          <NurOrb frame={f} r={55} id="trnur" />
        </g>
      )}
      {/* nəzarətçi / gətirən kişi */}
      <g transform={`translate(${second ? interpolate(f, [0, 200], [700, 430], clamp) : 760},1560) scale(0.6)`}>
        {/* ayaq üstə duran, əmmaməli kişi (arxadan siluet) */}
        <path d="M-62,170 C-58,60 -50,-40 -32,-90 L32,-90 C50,-40 58,60 62,170 Z" fill="#3b2418" />
        <circle cx={0} cy={-115} r={30} fill="#3b2418" />
        <ellipse cx={0} cy={-132} rx={36} ry={20} fill="#e0d2b0" />
      </g>
      <Dune baseY={1820} amp={40} seed={3.6} fill="#c08a55" />
    </Svg>
  );
};

const Interior: React.FC<{ f: number; id: string; warm?: number }> = ({ f, id, warm = 1 }) => (
  <>
    <Sky id={id} top="#1f140e" mid="#3a2618" bottom="#2a1b12" />
    {/* tağlar */}
    {[-1, 0, 1].map((i) => (
      <g key={i} transform={`translate(${540 + i * 360},0)`}>
        <path d="M-130,1150 L-130,520 A130,130 0 0 1 130,520 L130,1150 Z" fill="#120b07" opacity={0.75} />
        <path d="M-110,1150 L-110,530 A110,110 0 0 1 110,530 L110,1150 Z" fill="#0e1630" />
        <Stars frame={f + i * 40} n={14} maxY={1100} opacity={0.6} />
      </g>
    ))}
    <rect x={0} y={1150} width={W} height={H} fill="#4a3020" />
    <Glow cx={540} cy={900} r={700} color="#ffb366" id={`${id}g`} opacity={0.35 * warm} />
  </>
);

const FeastBg: React.FC<P> = ({ f, k }) => (
  <Svg>
    <Interior f={f} id={`fe${k}`} />
    {/* qonaqlar */}
    {[140, 300, 460, 620, 780, 940].map((x, i) => (
      <SeatedMan key={i} x={x} y={1330} s={0.95} color={['#2b1a12', '#331f15', '#2e1c13'][i % 3]} turban={['#d9c6a0', '#a8553a', '#e8dcc0'][i % 3]} />
    ))}
    {/* süfrə */}
    <rect x={40} y={1300} width={1000} height={120} rx={14} fill="#6b4226" />
    <rect x={40} y={1300} width={1000} height={20} fill="#8a5a33" />
    {[120, 300, 500, 700, 900].map((x, i) => (
      <g key={i} transform={`translate(${x},1300)`}>
        <ellipse cx={0} cy={-6} rx={70} ry={16} fill="#c9a26a" />
        <ellipse cx={0} cy={-14} rx={52} ry={12} fill="#e0b97a" />
        {[0, 1, 2, 3, 4].map((j) => (
          <circle key={j} cx={-24 + j * 12} cy={-22} r={7} fill="#5a2a1a" />
        ))}
      </g>
    ))}
    <Lamp x={540} y={1290} s={0.9} frame={f} id={`fl${k}`} />
    {/* Buheyra kənarda dayanıb (arxadan/yandan siluet) */}
    <Monk x={k === 9 ? interpolate(f, [0, 240], [80, 980], clamp) : 990} y={1700} s={0.8} color="#140d0a" />
  </Svg>
);

const BahiraBg: React.FC<P> = ({ f, k }) => (
  <Svg>
    <Interior f={f} id={`bh${k}`} />
    <Lamp x={820} y={1350} s={1.1} frame={f} id={`bl${k}`} />
    {/* nur sağ tərəfdə, uzaqda */}
    <g transform="translate(800,1150)">
      <NurOrb frame={f} r={70} id={`bhn${k}`} opacity={0.9} />
    </g>
    {/* rahib arxadan, ön planda */}
    <Monk x={330} y={2160} s={2.3 + f * 0.0004} color="#0f0907" lift={10 + 6 * Math.sin(f * 0.05)} />
  </Svg>
);

const NurBg: React.FC<P> = ({ f, k }) => (
  <Svg>
    <Interior f={f} id={`nb${k}`} warm={1.4} />
    <Lamp x={200} y={1400} s={0.9} frame={f} id={`nl${k}`} />
    <g transform="translate(540,1000)">
      <NurOrb frame={f} r={150} id={`nbn${k}`} />
    </g>
    {/* nurdan yayılan şüalar */}
    <g opacity={0.18} transform={`translate(540,1000) rotate(${f * 0.1})`}>
      {Array.from({ length: 16 }).map((_, i) => (
        <path key={i} d="M-14,0 L14,0 L4,-900 L-4,-900 Z" fill="#ffe7a8" transform={`rotate(${i * 22.5})`} />
      ))}
    </g>
  </Svg>
);

const AbuTalibBg: React.FC<P> = ({ f, k }) => (
  <Svg>
    <Interior f={f} id={`at${k}`} />
    <Lamp x={260} y={1350} s={1.1} frame={f} id={`al${k}`} />
    <g transform="translate(760,1120)">
      <NurOrb frame={f} r={60} id={`atn${k}`} opacity={0.85} />
    </g>
    {/* Əbu Talib — arxadan, ön planda, əmmaməli siluet */}
    <g transform={`translate(500,2160) scale(${2.2 + f * 0.0004})`}>
      <path d="M-160,0 C-150,-150 -120,-260 -70,-300 L70,-300 C120,-260 150,-150 160,0 Z" fill="#120a06" />
      <circle cx={0} cy={-345} r={58} fill="#120a06" />
      <ellipse cx={0} cy={-378} rx={74} ry={44} fill="#d8c7a2" />
      <path d="M-72,-372 C-30,-392 30,-400 72,-388" stroke="#b7a37c" strokeWidth={6} fill="none" />
      <path d="M-70,-360 C-30,-378 30,-384 70,-372" stroke="#b7a37c" strokeWidth={5} fill="none" />
      <path d="M-60,-396 C-20,-414 25,-416 58,-404" stroke="#b7a37c" strokeWidth={5} fill="none" />
    </g>
  </Svg>
);

const ReturnBg: React.FC<P> = ({ f, dur }) => (
  <Svg>
    <Sky id="rsky" top="#3b2a55" mid="#d9785a" bottom="#f2b27a" />
    <Glow cx={540} cy={1060} r={520} color="#ffcf8a" id="rsun" opacity={0.85} />
    <circle cx={540} cy={1060 + f * 0.25} r={110} fill="#ffe1a8" />
    <Mountains y={1140} color="#6a3a45" seed={13} />
    <Dune baseY={1220} amp={40} seed={2.2} fill="#8a4a3e" />
    <Caravan
      frame={f}
      dir={-1}
      x={interpolate(f, [0, dur], [260, 120])}
      y={1440}
      scale={0.5}
      color="#2a1520"
      n={4}
      nurIndex={1}
    />
    <Dune baseY={1700} amp={60} seed={4.6} fill="#5a2c30" />
    <Dune baseY={1880} amp={40} seed={6.6} fill="#3c1e24" />
  </Svg>
);

const EndBg: React.FC<P> = ({ f }) => (
  <Svg oy={0}>
    <Sky id="esky" top="#070b1f" mid="#141a3a" bottom="#2a2040" />
    <Stars frame={f} n={200} maxY={1900} />
    <g transform="translate(540,760)">
      <NurOrb frame={f} r={90} id="endnur" opacity={0.6} />
    </g>
  </Svg>
);

export const Background: React.FC<{ bg: Bg } & P> = ({ bg, ...p }) => {
  switch (bg) {
    case 'title':
      return <TitleBg {...p} />;
    case 'caravan':
      return <CaravanBg {...p} />;
    case 'city':
      return <CityBg {...p} />;
    case 'monastery':
      return <MonasteryBg {...p} />;
    case 'cloud':
      return <CloudBg {...p} />;
    case 'tree':
      return <TreeBg {...p} />;
    case 'feast':
      return <FeastBg {...p} />;
    case 'bahira':
      return <BahiraBg {...p} />;
    case 'nur':
      return <NurBg {...p} />;
    case 'abutalib':
      return <AbuTalibBg {...p} />;
    case 'return':
      return <ReturnBg {...p} />;
    case 'end':
      return <EndBg {...p} />;
  }
};
