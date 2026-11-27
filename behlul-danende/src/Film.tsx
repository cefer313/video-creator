import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { Char, Pose } from './chars';
import { Confetti, DizzyStars, DustCloud, Exclaim, IconCard, ScaleIcon, Sparkles } from './fx';
import { FLOOR_Y, Palace, SEAT_Y } from './palace';
import { LINES, Line, lineAt, talkOf } from './timeline';
import { Badge, Banner, CtaPill, Subtitle } from './ui';

const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp(t);
const ease = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
};
const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
const L = (id: string) => LINES.find((l) => l.id === id) as Line;
const blinkAt = (f: number, seed: number) => (f + seed) % 101 < 3;

type Cam = { x: number; y: number; z: number };
type Scene = {
  cam: Cam;
  shake?: number;
  blur?: number;
  dim?: number;
  signLit: number;
  throneGlow: number;
  behlul?: Pose;
  harun?: Pose;
  guards?: Pose[];
  world?: React.ReactNode; // personajların arxasında (dünya koordinatları)
  front?: React.ReactNode; // personajların önündə (dünya koordinatları)
  screen?: React.ReactNode; // ekran koordinatları
};

const B_X = 250;
const H_X = 820;
const CORNER_X = 210;
const HEAD = { stand: FLOOR_Y - 505, floor: FLOOR_Y + 110 - 505, harun: FLOOR_Y - 545, throne: SEAT_Y + 20 - 505 };
const close = (x: number, headY: number, z = 2.2): Cam => ({ x, y: headY + 150, z });

/** Bəhlul atla gəzəndə: sol əlində çubuq at. */
const horseArm = { armL: -20, elbL: -50, horse: true } as const;

const direct = (f: number): Scene => {
  const i = lineAt(f);
  const ln = LINES[i];
  const lf = f - ln.start;
  const vt = f - ln.voiceAt;
  const dur = ln.end - ln.start;
  const p = lf / dur;
  const talkB = ln.who === 'behlul' ? talkOf(ln, f) : 0;
  const talkH = ln.who === 'harun' ? talkOf(ln, f) : 0;
  const bB = blinkAt(f, 0);
  const bH = blinkAt(f, 47);
  const signOn = f >= L('l01').voiceAt + L('l01').words[1] ? 1 : 0.15;

  switch (ln.id) {
    case 'l00':
      return {
        cam: { x: 540, y: 1080, z: lerp(1.7, 1.95, ease(p)) },
        signLit: 0.15,
        throneGlow: 0.6 + 0.3 * Math.sin(f / 8),
        world: <Sparkles f={f} x={540} y={1060} w={460} h={420} n={12} />,
        screen: <Badge text="RƏVAYƏT" t={lf - 4} />,
      };
    case 'l01': {
      const walkEnd = dur * 0.62;
      const wp = clamp(lf / walkEnd);
      const walking = wp < 1;
      const ph = lf * 0.55;
      const litT = f - (ln.voiceAt + ln.words[1]);
      return {
        cam: { x: 540, y: 1010, z: lerp(1.0, 1.05, p) },
        signLit: signOn,
        throneGlow: 0.35,
        behlul: {
          x: lerp(-200, B_X, easeOut(wp) * 0.3 + wp * 0.7), y: FLOOR_Y, ...horseArm,
          armR: walking ? 35 + Math.sin(ph) * 18 : 20, elbR: walking ? 30 : 10,
          legs: walking ? 'walk' : 'stand', phase: ph, bob: walking ? -Math.abs(Math.sin(ph)) * 22 : 0,
          eyes: 'happy', mouth: walking ? 'grin' : 'smile', head: walking ? Math.sin(ph) * 3 : 0,
        },
        front: <Confetti t={litT} x={540} y={250} n={80} />,
      };
    }
    case 'l02': {
      const look = p < 0.33 ? -1 : p < 0.66 ? 1 : 1;
      return {
        cam: { x: 420, y: 1180, z: lerp(1.45, 1.52, p) },
        signLit: 1,
        throneGlow: 0.5 + 0.2 * Math.sin(f / 7),
        behlul: { x: B_X, y: FLOOR_Y, ...horseArm, armR: 12, eyes: p > 0.75 ? 'sly' : 'open', look, head: look * 6, mouth: p > 0.75 ? 'smirk' : 'neutral', blink: bB },
        world: p > 0.55 ? <Sparkles f={f} x={540} y={1100} w={380} h={360} n={8} seed={5} /> : null,
      };
    }
    case 'l03': {
      const rub = Math.sin(lf * 0.6) * 10;
      return {
        cam: close(B_X, HEAD.stand, 2.3),
        blur: 12,
        signLit: 1,
        throneGlow: 0.5,
        behlul: { x: B_X, y: FLOOR_Y, armL: 25, elbL: -112 + rub, armR: 25, elbR: -112 - rub, eyes: 'sly', look: 1, brow: 0.3, mouth: 'smirk', talk: talkB, head: 4, blink: bB },
      };
    }
    case 'l04': {
      const J = 20;
      const jp = clamp(lf / J);
      const landed = lf >= J;
      const x = lerp(B_X, 540, jp);
      const y = lerp(FLOOR_Y, SEAT_Y, jp) - Math.sin(jp * Math.PI) * 300;
      const lounge: Pose = { x: 540, y: SEAT_Y, legs: 'sit', armsBehind: true, armL: 150, elbL: 54, armR: 150, elbR: 54, eyes: 'happy', mouth: 'smile', lean: Math.sin(f / 16) * 2, head: 5 };
      return {
        cam: { x: 540, y: 1130, z: lerp(1.15, 1.3, p) },
        signLit: 1,
        throneGlow: landed ? 0.9 : 0.5,
        behlul: landed ? lounge : { x, y, armL: 140, armR: 140, elbL: -20, elbR: -20, eyes: 'happy', mouth: 'grin', legs: 'stand' },
        world: landed ? <Sparkles f={f} x={540} y={1000} w={520} h={420} n={14} seed={11} /> : null,
        front: <Confetti t={lf - J} x={540} y={900} n={40} spread={0.7} />,
      };
    }
    case 'l05': {
      const run = clamp(lf / 20);
      const ph = lf * 0.7;
      const g = (x0: number, x1: number, seed: number): Pose => ({
        x: lerp(x0, x1, easeOut(run)), y: FLOOR_Y, legs: run < 1 ? 'walk' : 'stand', phase: ph + seed, bob: run < 1 ? -Math.abs(Math.sin(ph)) * 14 : 0,
        armR: 14, elbR: 30, armL: run < 1 ? 30 + Math.sin(ph) * 20 : 40, elbL: 40, eyes: 'angry', mouth: 'frown', look: -1, s: 0.95, blink: blinkAt(f, seed * 13),
      });
      return {
        cam: { x: 610, y: 1160, z: 1.12 * (1 + 0.18 * clamp(1 - lf / 7)) },
        shake: lf < 10 ? 10 : 0,
        signLit: 1,
        throneGlow: 0.4,
        behlul: { x: 540, y: SEAT_Y, legs: 'sit', armL: 60, elbL: 50, armR: 60, elbR: 50, eyes: 'wide', look: 1, mouth: 'o', head: -4 },
        guards: [g(1300, 790, 0), g(1480, 960, 1.7)],
        front: (
          <>
            <Exclaim t={lf - 18} x={790} y={FLOOR_Y - 720} />
            <Exclaim t={lf - 22} x={960} y={FLOOR_Y - 720} />
          </>
        ),
      };
    }
    case 'l06': {
      const life = ln.vdur + 14;
      const inCloud = lf >= 2 && lf < 2 + life;
      const after = lf - (2 + life);
      const leave = clamp(after / 30);
      const gw = (x0: number, seed: number): Pose => ({
        x: lerp(x0, x0 + 520, leave), y: FLOOR_Y, legs: 'walk', phase: after * 0.6 + seed, s: 0.95, armR: 14, elbR: 30, armL: 30, elbL: 40, eyes: 'happy', mouth: 'smirk', look: 1,
      });
      return {
        cam: { x: 520, y: 1220, z: 1.12 },
        shake: inCloud ? 9 : 0,
        signLit: 1,
        throneGlow: 0.3,
        behlul: inCloud
          ? undefined
          : lf < 2
            ? { x: 540, y: SEAT_Y, legs: 'sit', armL: 60, elbL: 50, armR: 60, elbR: 50, eyes: 'wide', mouth: 'o' }
            : { x: CORNER_X, y: FLOOR_Y, legs: 'floor', armL: 15, elbL: -60, armR: 15, elbR: -60, eyes: 'closed', mouth: 'frown', head: Math.sin(f / 5) * 6 },
        guards: inCloud ? undefined : lf < 2 ? [gw(790, 0), gw(960, 1)].map((g) => ({ ...g, legs: 'stand' as const, eyes: 'angry' as const })) : [gw(780, 0), gw(980, 1.7)],
        front: (
          <>
            <DustCloud t={lf - 2} x={500} y={1300} life={life} />
            {after > 0 && <DizzyStars f={f} x={CORNER_X} y={HEAD.floor - 150} />}
          </>
        ),
      };
    }
    case 'l07': {
      const sob = Math.abs(Math.sin(lf * 0.35));
      return {
        cam: { x: 280, y: HEAD.floor + 170, z: lerp(1.8, 1.92, p) },
        dim: 0.3,
        signLit: 1,
        throneGlow: 0.2,
        behlul: { x: CORNER_X, y: FLOOR_Y, legs: 'floor', armL: 15, elbL: -60, armR: 15, elbR: -60, eyes: 'cry', mouth: 'cry', talk: 0.4 + sob * 0.6, tears: 1, phase: lf / 30, bob: -sob * 8, head: -3 },
      };
    }
    case 'l08': {
      const wp = clamp(lf / (dur * 0.75));
      const ph = lf * 0.32;
      return {
        cam: { x: 540, y: 1060, z: 1.0 },
        dim: 0.12,
        signLit: 1,
        throneGlow: 0.3,
        behlul: { x: CORNER_X, y: FLOOR_Y, legs: 'floor', armL: 15, elbL: -60, armR: 15, elbR: -60, eyes: 'cry', mouth: 'cry', talk: 0.5, tears: 0.9, phase: lf / 30, head: -3 },
        harun: {
          x: lerp(1350, H_X, easeOut(wp)), y: FLOOR_Y, legs: wp < 1 ? 'walk' : 'stand', phase: ph, bob: wp < 1 ? -Math.abs(Math.sin(ph)) * 8 : 0,
          armL: 18, armR: 18, elbL: -40, elbR: -40, eyes: 'open', look: -1, brow: 0.2, mouth: 'neutral', blink: bH,
        },
        world: wp >= 1 ? <Sparkles f={f} x={H_X} y={FLOOR_Y - 420} w={360} h={560} n={7} seed={21} /> : null,
      };
    }
    case 'l09':
      return {
        cam: close(H_X, HEAD.harun, 2.2),
        blur: 12,
        dim: 0.1,
        signLit: 1,
        throneGlow: 0.3,
        harun: { x: H_X, y: FLOOR_Y, armL: 14, elbL: -30, armR: 55 + Math.sin(lf / 9) * 6, elbR: 60, eyes: 'open', look: -1, brow: -0.4, mouth: 'neutral', talk: talkH, head: -4, blink: bH },
      };
    case 'l10':
      return {
        cam: close(CORNER_X + 30, HEAD.floor, 2.2),
        blur: 12,
        signLit: 1,
        throneGlow: 0.3,
        behlul: { x: CORNER_X, y: FLOOR_Y, legs: 'floor', armL: 15, elbL: -60, armR: lf < 12 ? lerp(15, 92, lf / 12) : 92, elbR: lf < 12 ? -60 : -4, finger: 'R', eyes: 'open', look: 1, brow: 0.35, mouth: 'neutral', talk: talkB, tears: lerp(0.5, 0.15, p), phase: lf / 30, blink: bB },
      };
    case 'l11':
      return {
        cam: { ...close(H_X, HEAD.harun, 2.55), z: 2.55 * (1 + 0.2 * clamp(1 - lf / 6)) },
        shake: lf < 6 ? 6 : 0,
        blur: 14,
        signLit: 1,
        throneGlow: 0.3,
        harun: { x: H_X, y: FLOOR_Y, armL: 14, elbL: -30, armR: 22, elbR: -118, eyes: 'wide', look: -1, mouth: 'o', talk: talkH, head: 6 },
      };
    case 'l12': {
      const up = clamp(lf / 10);
      return {
        cam: { x: 540, y: 1200, z: lerp(1.12, 1.2, p) },
        signLit: 1,
        throneGlow: 0.55 + 0.3 * Math.sin(f / 6),
        behlul: up < 1
          ? { x: B_X, y: FLOOR_Y + (1 - up) * 60, legs: 'stand', armL: 20, armR: 20, eyes: 'open', mouth: 'neutral' }
          : { x: B_X, y: FLOOR_Y, armL: 12, elbL: -20, armR: 78, elbR: -22, finger: 'R', eyes: 'open', look: 1, brow: 0.3, mouth: 'neutral', talk: talkB, head: 3, blink: bB },
        harun: { x: H_X, y: FLOOR_Y, armL: 18, armR: 18, elbL: -40, elbR: -40, eyes: 'open', look: -1, brow: -0.3, mouth: 'neutral', blink: bH },
        world: <Sparkles f={f} x={540} y={1080} w={360} h={380} n={9} seed={31} />,
      };
    }
    case 'l13': {
      const scaleT = vt - ln.words[9];
      return {
        cam: { x: lerp(330, 360, p), y: HEAD.stand + 160, z: lerp(2.0, 2.1, p) },
        blur: 12,
        dim: 0.1,
        signLit: 1,
        throneGlow: 0.4,
        behlul: { x: B_X, y: FLOOR_Y, armL: 12, elbL: -20, armR: scaleT > 0 ? 150 : 90, elbR: scaleT > 0 ? -30 : -6, finger: 'R', eyes: 'open', look: 1, brow: 0.45, mouth: 'neutral', talk: talkB, head: scaleT > 0 ? -4 : 2, blink: bB },
        front: (
          <g transform="translate(480,1000) scale(0.72) translate(-470,-870)">
            <ScaleIcon t={scaleT} x={470} y={870} f={f} />
          </g>
        ),
      };
    }
    case 'l14':
      return {
        cam: { ...close(H_X, HEAD.harun, 2.2), z: lerp(2.2, 2.5, ease(p)) },
        blur: 14,
        dim: 0.28,
        signLit: 1,
        throneGlow: 0.2,
        harun: { x: H_X, y: FLOOR_Y, armL: 14, elbL: -30, armR: 14, elbR: -30, eyes: 'sad', look: -0.5, mouth: 'frown', tears: lerp(0, 0.45, p * 2), phase: lf / 40, head: 6, blink: bH },
      };
    case 'l15': {
      const w = ln.words;
      const cr = clamp((vt - w[6]) / 26);
      return {
        cam: { x: 540, y: 1060, z: 1.0 },
        blur: 10,
        dim: 0.45,
        signLit: 1,
        throneGlow: 0.2,
        behlul: { x: 540, y: FLOOR_Y, ...horseArm, armR: 14, eyes: 'open', look: 0, mouth: 'smile', blink: bB, s: 0.92 },
        front: (
          <>
            <IconCard kind="throne" t={vt - w[0]} x={270} y={620} rot={-8} f={f} crumble={cr} />
            <IconCard kind="crown" t={vt - w[2]} x={810} y={560} rot={7} f={f} crumble={clamp(cr * 1.1 - 0.05)} />
            <IconCard kind="coins" t={vt - w[4]} x={560} y={830} rot={-4} f={f} crumble={clamp(cr * 1.15 - 0.1)} />
          </>
        ),
        screen: <Banner text="BƏHLULDAN DƏRS" t={lf - 6} top={150} />,
      };
    }
    default: {
      // l16 — son: CTA
      const wave = Math.sin(lf / 5) * 22;
      return {
        cam: { x: 540, y: 1080, z: 1.04 },
        blur: 6,
        dim: 0.2,
        signLit: 1,
        throneGlow: 0.4,
        behlul: { x: 540, y: FLOOR_Y, ...horseArm, armR: 150 + wave * 0.3, elbR: -10 + wave, eyes: 'happy', mouth: 'grin', head: Math.sin(lf / 10) * 4 },
        front: <Confetti t={lf - 2} x={540} y={700} n={70} />,
        screen: (
          <>
            <Banner text="BƏHLUL DANƏNDƏ · RƏVAYƏT" t={lf - 4} top={230} />
            <CtaPill t={lf - 12} top={360} />
          </>
        ),
      };
    }
  }
};

const World: React.FC<{ cam: Cam; shake: number; f: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ cam, shake, f, children, style }) => {
  const sx = shake ? Math.sin(f * 2.3) * shake : 0;
  const sy = shake ? Math.cos(f * 3.1) * shake : 0;
  return (
    <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${540 + sx}px,${960 + sy}px) scale(${cam.z}) translate(${-cam.x}px,${-cam.y}px)`, ...style }}>
      {children}
    </div>
  );
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  const sc = direct(f);
  const i = lineAt(f);
  const ln = LINES[i];
  const cutPunch = 1 + 0.045 * clamp(1 - (f - ln.start) / 5);
  const cam = { ...sc.cam, z: sc.cam.z * cutPunch };
  return (
    <AbsoluteFill style={{ background: '#2B1A52', overflow: 'hidden' }}>
      <World cam={cam} shake={sc.shake ?? 0} f={f} style={{ filter: sc.blur ? `blur(${sc.blur / cam.z}px)` : undefined }}>
        <Palace f={f} signLit={sc.signLit} throneGlow={sc.throneGlow} dim={sc.dim} />
      </World>
      <World cam={cam} shake={sc.shake ?? 0} f={f}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: 'absolute', overflow: 'visible' }}>
          {sc.world}
          {sc.guards?.map((g, k) => <Char key={k} kind="guard" pose={g} frame={f + k * 11} />)}
          {sc.harun && <Char kind="harun" pose={sc.harun} frame={f} />}
          {sc.behlul && <Char kind="behlul" pose={sc.behlul} frame={f} />}
          {sc.front}
        </svg>
      </World>
      {sc.screen}
      <Subtitle ln={ln} f={f} />
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
