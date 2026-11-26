import React from 'react';
import { AbsoluteFill, Audio, interpolate, Easing, staticFile, useCurrentFrame } from 'remotion';
import { FPS, SENTENCES, T } from './timeline';
import { Figure, FamilyMember, POSES, lerpPose, walkPose, type Pose } from './Figure';

const W = 1080;
const H = 1920;
const GROUND = 1300; // yer xətti
const HERO_X = 430;
const FONT = 'Montserrat, sans-serif';
const cl = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.bezier(0.45, 0, 0.55, 1);
const iv = (t: number, x: number[], y: number[]) => interpolate(t, x, y, { ...cl, easing: ease });

const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------- rəng keçidləri ----------
const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a: string, b: string, k: number) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`;
};
const colorAt = (t: number, keys: [number, string][]) => {
  if (t <= keys[0][0]) return mixC(keys[0][1], keys[0][1], 0);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const k = ease((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
      return mixC(keys[i - 1][1], keys[i][1], k);
    }
  }
  return mixC(keys[keys.length - 1][1], keys[keys.length - 1][1], 0);
};

const SKY_TOP: [number, string][] = [
  [0, '#f2b35c'], [8, '#f2a447'], [13, '#f59a3a'], [16.5, '#c77a43'], [18.8, '#7c6f6c'], [20.5, '#4d5766'],
  [23.5, '#566a80'], [26.5, '#86a4c2'], [29, '#e9925a'], [35, '#d8714f'],
];
const SKY_BOT: [number, string][] = [
  [0, '#fde9bd'], [8, '#ffe8b4'], [13, '#fff3d6'], [16.5, '#f0c38c'], [18.8, '#b6a894'], [20.5, '#8f989c'],
  [23.5, '#a9b2b0'], [26.5, '#e3dcc5'], [29, '#ffd39a'], [35, '#ffc58a'],
];
const FAR: [number, string][] = [[0, '#e7b77a'], [13, '#f0c995'], [18.8, '#a78a6c'], [21, '#7f6d5d'], [26, '#a99375'], [29, '#c98f63'], [35, '#b87856']];
const MID: [number, string][] = [[0, '#dca15f'], [13, '#e8b878'], [18.8, '#93724f'], [21, '#6e5a46'], [26, '#97805e'], [29, '#b97a4c'], [35, '#a66541']];
const NEAR: [number, string][] = [[0, '#cf8f4c'], [13, '#d9a565'], [18.8, '#80603f'], [21, '#5d4a36'], [26, '#7d6a4a'], [29, '#9c6239'], [35, '#8c5232']];

// ---------- dünlər ----------
const dunePath = (base: number, amp: number, len: number, seed: number, offset: number) => {
  const pts: string[] = [];
  const step = 60;
  for (let x = -120; x <= W + 120; x += step) {
    const wx = x + offset;
    const y =
      base -
      amp * (0.55 + 0.45 * Math.sin(wx / len + seed)) -
      amp * 0.35 * Math.sin(wx / (len * 0.43) + seed * 2.1);
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M -120 ${H} L ${pts.join(' L ')} L ${W + 120} ${H} Z`;
};

// ---------- səhnənin sürüşməsi (personaj yeriyəndə fon arxaya axır) ----------
const speedAt = (t: number) =>
  iv(t, [0, 7.5, 13.8, 14.4], [72, 70, 22, 0]) + (t > 27 ? iv(t, [27.6, 28.6, 30.2, 31.4], [0, 78, 78, 0]) : 0);
const SCROLL: number[] = (() => {
  const a: number[] = [0];
  for (let i = 1; i <= 35 * FPS + 2; i++) a.push(a[i - 1] + speedAt(i / FPS) / FPS);
  return a;
})();
const SCROLL_END = SCROLL[SCROLL.length - 1];
const HOUSE_SCREEN_X = 900; // son vəziyyətdə evin ekrandakı yeri

// ---------- personajın pozası ----------
const poseAt = (t: number, f: number): Pose => {
  const walkAmp = (k: number) => k;
  if (t < T.kneel) {
    const tired = iv(t, [T.thirst, 13.6], [0, 1]);
    const phase = SCROLL[Math.min(f, SCROLL.length - 1)] / 26 + (t > 13.8 ? 0 : 0);
    const wp = walkPose(phase, walkAmp(1 - 0.45 * tired), 4 + 18 * tired, 2 + 20 * tired);
    // sonda dayanır
    const stop = iv(t, [13.9, 14.6], [0, 1]);
    return lerpPose(wp, POSES.kneel, stop);
  }
  if (t < T.dua + 0.9) return lerpPose(POSES.kneel, POSES.dua, iv(t, [T.dua, T.dua + 0.9], [0, 1]));
  if (t < T.saved) {
    // yağış gələndə başını göyə qaldırır
    const up = iv(t, [T.rain, T.rain + 1.2], [0, 1]);
    return { ...POSES.dua, tilt: 10 - 32 * up };
  }
  if (t < T.green + 1.6) {
    const k = iv(t, [T.saved, T.saved + 1.3], [0, 1]);
    const mid = lerpPose(POSES.dua, POSES.stand, k);
    return lerpPose(mid, POSES.joy, iv(t, [T.saved + 0.9, T.saved + 2.0], [0, 1]));
  }
  if (t < T.home) return lerpPose(POSES.joy, POSES.stand, iv(t, [T.green + 1.6, T.home - 0.3], [0, 1]));
  // evə doğru yeriyir
  const moving = iv(t, [T.home, T.home + 0.6], [0, 1]) * (t < 33.4 ? 1 : iv(t, [33.4, 33.9], [1, 0]));
  const phase = SCROLL[Math.min(f, SCROLL.length - 1)] / 26 + (t - T.home) * 1.4;
  return lerpPose(POSES.stand, walkPose(phase, 1, 3, 0), moving);
};

// ---------- hissəciklər ----------
const Dust: React.FC<{ f: number; o: number }> = ({ f, o }) => (
  <g opacity={o}>
    {Array.from({ length: 40 }).map((_, i) => {
      const sp = 0.6 + rnd(i + 3) * 1.4;
      const x = ((rnd(i) * 1300 - f * sp * 2.2) % 1300 + 1300) % 1300 - 100;
      const y = 700 + rnd(i + 7) * 900 + Math.sin(f * 0.04 + i) * 30;
      return <circle key={i} cx={x} cy={y} r={1.5 + rnd(i + 11) * 3} fill="#fff0cc" opacity={0.25 + 0.5 * rnd(i + 13)} />;
    })}
  </g>
);

const Rain: React.FC<{ f: number; o: number }> = ({ f, o }) =>
  o <= 0.01 ? null : (
    <g opacity={o}>
      {Array.from({ length: 190 }).map((_, i) => {
        const sp = 38 + rnd(i + 5) * 26;
        const x = rnd(i) * 1300 - 120;
        const y = ((rnd(i + 9) * 2100 + f * sp) % 2100) - 120;
        const l = 46 + rnd(i + 2) * 40;
        return (
          <line key={i} x1={x} y1={y} x2={x - l * 0.22} y2={y + l} stroke="#e4eef7" strokeWidth={2 + rnd(i + 4) * 2} strokeLinecap="round" opacity={0.35 + rnd(i + 8) * 0.5} />
        );
      })}
      {Array.from({ length: 40 }).map((_, i) => {
        const cyc = 14 + Math.floor(rnd(i + 30) * 10);
        const ph = (f + Math.floor(rnd(i + 31) * cyc)) % cyc;
        const k = ph / cyc;
        const n = Math.floor((f + Math.floor(rnd(i + 31) * cyc)) / cyc);
        const x = rnd(i * 7 + n) * W;
        const y = GROUND + 20 + rnd(i * 3 + n) * 560;
        return <ellipse key={`s${i}`} cx={x} cy={y} rx={6 + k * 26} ry={2 + k * 7} fill="none" stroke="#e8f1f8" strokeWidth={2.5} opacity={(1 - k) * 0.7} />;
      })}
    </g>
  );

const Clouds: React.FC<{ t: number; f: number }> = ({ t, f }) => {
  const come = iv(t, [T.clouds - 0.3, T.rain + 0.8], [0, 1]);
  const go = iv(t, [T.green, T.home + 0.6], [0, 1]);
  const o = come * (1 - go);
  if (o <= 0.01) return null;
  const drift = f * 0.4;
  const cloud = (cx: number, cy: number, s: number, fill: string, key: string) => (
    <g key={key} transform={`translate(${cx} ${cy}) scale(${s})`}>
      {[[-160, 20, 120], [-60, -40, 150], [70, -20, 140], [180, 30, 110], [0, 50, 160]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={fill} />
      ))}
    </g>
  );
  const darkness = iv(t, [T.clouds, T.rain + 1, T.saved, T.green + 1.5], [0.0, 1, 1, 0.2]);
  const c1 = mixC('#e8e2da', '#5c6370', darkness);
  const c2 = mixC('#f4efe8', '#727a86', darkness);
  const c3 = mixC('#ffffff', '#8a929c', darkness);
  return (
    <g opacity={o}>
      {cloud(-200 + come * 420 + drift + go * 500, 160, 1.5, c1, 'a')}
      {cloud(1280 - come * 520 - drift * 0.6 - go * 600, 120, 1.7, c1, 'b')}
      {cloud(-150 + come * 760 + drift * 0.8 + go * 700, 420, 1.2, c2, 'c')}
      {cloud(1250 - come * 330 - drift - go * 600, 520, 1.3, c2, 'd')}
      {cloud(520 + drift * 0.3 + go * 400, -60 + come * 230, 1.6, c3, 'e')}
      {cloud(160 - drift * 0.2 - go * 400, 640 * come, 0.9, c3, 'f')}
    </g>
  );
};

// ---------- çatlamış torpaq (susuzluq) ----------
const CRACKS = Array.from({ length: 26 }).map((_, i) => {
  let x = rnd(i * 5) * W;
  let y = GROUND + 30 + rnd(i * 5 + 1) * 580;
  const pts = [`${x.toFixed(0)},${y.toFixed(0)}`];
  for (let j = 0; j < 5; j++) {
    x += (rnd(i * 31 + j) - 0.5) * 150;
    y += (rnd(i * 17 + j) - 0.3) * 60;
    pts.push(`${x.toFixed(0)},${y.toFixed(0)}`);
  }
  return pts.join(' ');
});

// ---------- ot və çiçəklər ----------
const TUFTS = Array.from({ length: 46 }).map((_, i) => ({
  x: rnd(i + 100) * (W + 200) - 100,
  y: GROUND + 10 + Math.pow(rnd(i + 200), 1.4) * 600,
  s: 0.6 + rnd(i + 300) * 0.9,
  flower: rnd(i + 400) > 0.72,
  d: rnd(i + 500) * 1.6,
}));

const Grass: React.FC<{ t: number; f: number; scroll: number }> = ({ t, f, scroll }) => {
  const g0 = iv(t, [T.green - 0.4, T.green + 2.5], [0, 1]);
  if (g0 <= 0.01) return null;
  return (
    <g>
      {TUFTS.map((u, i) => {
        const g = iv(t, [T.green - 0.4 + u.d, T.green + 1.4 + u.d], [0, 1]);
        if (g <= 0) return null;
        const x = ((u.x - (scroll - SCROLL[Math.round(T.green * FPS)])) % (W + 200) + W + 200) % (W + 200) - 100;
        const sway = Math.sin(f * 0.08 + i) * 4;
        const sc = u.s * g * (0.6 + (u.y - GROUND) / 900);
        return (
          <g key={i} transform={`translate(${x} ${u.y}) scale(${sc})`}>
            {[-26, -12, 0, 12, 26].map((a, j) => (
              <path key={j} d={`M ${j * 4 - 8} 0 Q ${a * 0.6 + sway} -30 ${a + sway * 1.5} ${-50 - (j % 2) * 18}`} stroke={j % 2 ? '#5f9a3a' : '#79b447'} strokeWidth={7} fill="none" strokeLinecap="round" />
            ))}
            {u.flower && (
              <g transform={`translate(${6 + sway} -62)`}>
                {[0, 72, 144, 216, 288].map((a) => (
                  <ellipse key={a} cx={Math.cos((a * Math.PI) / 180) * 9} cy={Math.sin((a * Math.PI) / 180) * 9} rx={7} ry={5} fill={i % 2 ? '#fff4d8' : '#ffd25c'} transform={`rotate(${a} ${Math.cos((a * Math.PI) / 180) * 9} ${Math.sin((a * Math.PI) / 180) * 9})`} />
                ))}
                <circle r={5} fill="#e9932c" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
};

// ---------- ev və palma ----------
const House: React.FC<{ x: number; t: number; color: string }> = ({ x, t, color }) => {
  const glow = iv(t, [T.home, T.meet], [0.3, 1]);
  return (
    <g transform={`translate(${x} ${GROUND + 6})`}>
      {/* palma */}
      <path d="M 210 0 Q 196 -160 232 -330" stroke={color} strokeWidth={20} fill="none" strokeLinecap="round" />
      {[-150, -110, -60, -10, 30, 80, 130].map((a, i) => (
        <path key={i} d={`M 232 -330 q ${Math.cos((a * Math.PI) / 180) * 70} ${Math.sin((a * Math.PI) / 180) * 50 - 30} ${Math.cos((a * Math.PI) / 180) * 150} ${Math.sin((a * Math.PI) / 180) * 90 + 30}`} stroke={color} strokeWidth={14} fill="none" strokeLinecap="round" />
      ))}
      {/* ev */}
      <rect x={-20} y={-200} width={240} height={200} fill={color} />
      <rect x={-34} y={-214} width={268} height={22} fill={color} />
      <rect x={60} y={-112} width={56} height={112} rx={26} fill="#ffb760" opacity={glow} />
      <rect x={146} y={-150} width={40} height={40} rx={6} fill="#ffc777" opacity={glow * 0.9} />
      <rect x={-2} y={-150} width={40} height={40} rx={6} fill="#ffc777" opacity={glow * 0.9} />
    </g>
  );
};

// ---------- altyazı ----------
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const idx = SENTENCES.findIndex((s, i) => {
    const start = s.phrases[0].from - 0.3;
    const next = SENTENCES[i + 1];
    const end = next ? next.phrases[0].from - 0.3 : 34.4;
    return t >= start && t < end;
  });
  if (idx < 0) return null;
  const s = SENTENCES[idx];
  const start = s.phrases[0].from - 0.3;
  const next = SENTENCES[idx + 1];
  const end = next ? next.phrases[0].from - 0.3 : 34.4;
  const o = Math.min(iv(t, [start, start + 0.3], [0, 1]), iv(t, [end - 0.3, end], [1, 0]));
  const y = iv(t, [start, start + 0.45], [30, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 1430,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 82,
        lineHeight: 1.17,
        color: 'white',
        opacity: o,
        transform: `translateY(${y}px)`,
        textShadow: '0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)',
      }}
    >
      {s.phrases.map((p, pi) => {
        const words = p.text.split(' ');
        const total = p.text.length;
        let acc = 0;
        return (
          <span key={pi}>
            {words.map((w, wi) => {
              const at = p.from + ((p.to - p.from) * acc) / total - 0.08;
              acc += w.length + 1;
              const lit = iv(t, [at, at + 0.18], [0, 1]);
              return (
                <span
                  key={wi}
                  style={{
                    opacity: 0.32 + 0.68 * lit,
                    color: lit > 0.5 ? '#fff6e0' : 'white',
                    textShadow:
                      lit > 0.5
                        ? '0 0 26px rgba(255,190,90,0.55), 0 4px 18px rgba(0,0,0,0.55), 0 2px 4px rgba(0,0,0,0.6)'
                        : undefined,
                  }}
                >
                  {w}{' '}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};

// ---------- əsas kompozisiya ----------
export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const scroll = SCROLL[Math.min(f, SCROLL.length - 1)];

  const heat = iv(t, [0, 3, T.thirst, 13, T.dua + 1, T.clouds + 0.5], [0.35, 0.5, 0.6, 1, 0.5, 0]);
  const sunOn = iv(t, [T.clouds, T.rain + 0.4], [1, 0]) + iv(t, [26.2, 29.2], [0, 1]);
  const sunPhaseLow = t > 24;
  const sunX = sunPhaseLow ? 850 : 770;
  const sunY = sunPhaseLow ? iv(t, [26, 31, 35], [1050, 1000, 1030]) : iv(t, [0, 13], [400, 360]);
  const sunR = sunPhaseLow ? 130 : iv(t, [0, 13], [110, 150]);
  const rain = iv(t, [T.rain - 0.6, T.rain + 1, 26.6, 28.6], [0, 1, 0.8, 0]);
  const wet = iv(t, [T.rain, T.rain + 2.5, 27, 31], [0, 1, 0.8, 0.4]);
  const cracks = iv(t, [T.thirst + 0.8, 13.8], [0, 1]) * (1 - iv(t, [T.rain + 0.5, T.green], [0, 1]));
  const rays = iv(t, [T.dua + 0.6, 17.6, T.rain - 0.3, T.rain + 0.6], [0, 1, 1, 0]);
  const flash = Math.max(iv(t, [18.82, 18.86, 18.98], [0, 1, 0]), 0.6 * iv(t, [19.12, 19.16, 19.3], [0, 1, 0]));
  const puddle = iv(t, [T.rain + 1, T.saved + 1.5], [0, 1]) * (1 - iv(t, [28, 32], [0, 0.6]));

  // kamera: susuzluqda yaxınlaşır, duada daha da yaxın, yağışda geri çəkilir
  const zoom = iv(t, [0, 8, 14.4, 17.5, 20.5, 23, 27.5, 31, 35], [1.0, 1.04, 1.12, 1.2, 1.1, 1.06, 1.0, 1.0, 1.03]);
  const camX = t < 28 ? HERO_X + 40 : iv(t, [28, 31.5], [HERO_X + 40, 640]);
  const camY = iv(t, [0, 14.4, 17.5, 23, 27.5], [1150, 1170, 1150, 1150, 1120]);

  const pose = poseAt(t, f);
  const heroX = HERO_X + iv(t, [31.4, 33.4], [0, 110]);
  const silhouette = colorAt(t, [[0, '#3a2416'], [18.8, '#2a2522'], [26, '#2c2a26'], [29, '#2a160f'], [35, '#240f0a']]);
  const houseX = HOUSE_SCREEN_X + (SCROLL_END - scroll);
  const famO = iv(t, [T.home, T.home + 0.8], [0, 1]);
  const wave = iv(t, [30.6, 31.4], [0, 1]) * (1 - iv(t, [33.6, 34.4], [0, 1]));

  const fadeIn = iv(t, [0, 0.6], [1, 0]);
  const fadeOut = iv(t, [34.2, 35], [0, 1]);
  const titleO = Math.min(iv(t, [0.2, 0.7], [0, 1]), iv(t, [1.35, 1.75], [1, 0]));

  return (
    <AbsoluteFill style={{ backgroundColor: '#1a120c' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={colorAt(t, SKY_TOP)} />
            <stop offset="1" stopColor={colorAt(t, SKY_BOT)} />
          </linearGradient>
          <radialGradient id="sun">
            <stop offset="0" stopColor="#fffdf2" />
            <stop offset="0.45" stopColor={sunPhaseLow ? '#ffd08a' : '#fff4cf'} />
            <stop offset="1" stopColor={sunPhaseLow ? '#ff9a50' : '#ffe08a'} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glare">
            <stop offset="0" stopColor="#fffbe8" stopOpacity="0.9" />
            <stop offset="1" stopColor="#fffbe8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ray" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff6dc" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="0.35" stopColor="#000" stopOpacity="0.35" />
            <stop offset="1" stopColor="#000" stopOpacity="0.62" />
          </linearGradient>
          <filter id="heat" x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency={`0.006 ${0.045 + 0.004 * Math.sin(f * 0.3)}`} numOctaves={2} seed={Math.floor(f / 2) % 50} />
            <feDisplacementMap in="SourceGraphic" scale={heat * 16} />
          </filter>
        </defs>

        <g transform={`translate(${W / 2} ${H * 0.6}) scale(${zoom}) translate(${-camX} ${-camY})`}>
          <rect x={-400} y={-400} width={W + 800} height={H + 800} fill="url(#sky)" />

          {/* günəş */}
          <g opacity={Math.min(1, sunOn)}>
            <circle cx={sunX} cy={sunY} r={sunR * (3.2 + 0.6 * heat)} fill="url(#glare)" opacity={0.55 + 0.35 * heat} />
            <circle cx={sunX} cy={sunY} r={sunR * (1 + 0.03 * Math.sin(f * 0.12))} fill="url(#sun)" />
            <circle cx={sunX} cy={sunY} r={sunR * 0.55} fill="#fffdf4" />
          </g>

          <Clouds t={t} f={f} />

          {/* işıq şüaları (dua anı) */}
          {rays > 0.01 && (
            <g opacity={rays * (0.75 + 0.25 * Math.sin(f * 0.07))}>
              {[-260, -150, -50, 40, 140].map((d, i) => (
                <polygon key={i} points={`${HERO_X + d * 2.2 - 40},-300 ${HERO_X + d * 2.2 + 50},-300 ${HERO_X + d * 0.35 + 30},${GROUND} ${HERO_X + d * 0.35 - 10},${GROUND}`} fill="url(#ray)" />
              ))}
            </g>
          )}

          {/* dünlər */}
          <g filter={heat > 0.05 ? 'url(#heat)' : undefined}>
            <path d={dunePath(1150, 110, 260, 1.3, scroll * 0.2)} fill={colorAt(t, FAR)} />
            <path d={dunePath(1235, 90, 200, 4.1, scroll * 0.5)} fill={colorAt(t, MID)} />
          </g>
          {famO > 0 && <House x={houseX} t={t} color={silhouette} />}
          <path d={dunePath(GROUND + 30, 26, 300, 2.2, scroll)} fill={colorAt(t, NEAR)} />
          <rect x={-400} y={GROUND + 20} width={W + 800} height={H} fill={colorAt(t, NEAR)} />
          {/* nəm torpaq */}
          <rect x={-400} y={GROUND - 10} width={W + 800} height={H} fill="#2b2a2e" opacity={wet * 0.22} />

          {/* çatlar */}
          {cracks > 0.01 && (
            <g opacity={cracks * 0.55}>
              {CRACKS.map((p, i) => (
                <polyline key={i} points={p} fill="none" stroke="#7a4a24" strokeWidth={3} strokeLinejoin="round" strokeDasharray="900" strokeDashoffset={900 * (1 - cracks)} />
              ))}
            </g>
          )}

          {/* gölməçələr */}
          {puddle > 0.01 && (
            <g opacity={puddle}>
              {[[220, 1420, 160], [700, 1520, 200], [460, 1700, 240], [900, 1380, 110]].map(([x, y, r], i) => (
                <ellipse key={i} cx={x - (scroll - SCROLL[Math.round(T.saved * FPS)])} cy={y} rx={r * puddle} ry={r * 0.18 * puddle} fill={colorAt(t, SKY_TOP)} stroke="#d7e3ea" strokeOpacity={0.4} strokeWidth={3} />
              ))}
            </g>
          )}

          <Grass t={t} f={f} scroll={scroll} />

          {/* ailə */}
          {famO > 0 && (
            <g opacity={famO}>
              <FamilyMember kind="woman" x={houseX - 150} y={GROUND + 8} wave={wave * 0.3} f={f} color={silhouette} />
              <FamilyMember kind="girl" x={houseX - 240} y={GROUND + 12} wave={wave} f={f + 7} color={silhouette} />
              <FamilyMember kind="boy" x={houseX - 70} y={GROUND + 10} wave={wave * 0.8} f={f + 3} color={silhouette} />
            </g>
          )}

          {/* qəhrəman */}
          <ellipse cx={heroX + 10} cy={GROUND + 4} rx={pose.hipY < 100 ? 140 : 95} ry={14} fill="#000" opacity={0.18} />
          <Figure pose={pose} x={heroX} y={GROUND + 6} scale={1.22} color={silhouette} far={mixC('#1c110c', '#1c110c', 0)} />

          <Dust f={f} o={iv(t, [0, 1, 14, 16], [0.5, 0.9, 0.7, 0])} />
          <Rain f={f} o={rain} />
        </g>

        {/* isti hava: ağımtıl parıltı */}
        <rect width={W} height={H} fill="#fff4d6" opacity={heat * 0.12} />
        {/* altyazı üçün aşağıda tündləşmə */}
        <rect y={1180} width={W} height={H - 1180} fill="url(#shade)" />
        <rect width={W} height={H} fill="#ffffff" opacity={flash * 0.45} />
      </svg>

      {/* başlıq */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 1500,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 110,
          letterSpacing: 4,
          color: '#fff6e0',
          opacity: titleO,
          textShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        SƏHRADA DUA
      </div>

      <Captions t={t} />

      <AbsoluteFill style={{ backgroundColor: '#000', opacity: Math.max(fadeIn, fadeOut) }} />

      <Audio src={staticFile('voice_clean.wav')} />
      <Audio src={staticFile('music.wav')} />
    </AbsoluteFill>
  );
};
