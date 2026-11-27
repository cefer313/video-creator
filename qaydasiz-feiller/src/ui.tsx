import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const C = {
  bg: '#f7f4ff',
  ink: '#25213b',
  mute: '#6d6890',
  purple: '#5b3fd6',
  orange: '#e57f24',
  green: '#2e9e5b',
  greenSoft: '#e3f4ea',
  orangeSoft: '#fdecdc',
  pink: '#e5484d',
  pinkSoft: '#fde4e4',
  white: '#ffffff',
};
export const FORM = [
  { label: '1-ci forma', sub: 'indi, hər gün', color: C.green, soft: C.greenSoft },
  { label: '2-ci forma', sub: 'keçmiş, dünən', color: C.orange, soft: C.orangeSoft },
  { label: '3-cü forma', sub: 'have / has ilə', color: C.pink, soft: C.pinkSoft },
];
export const FONT = 'Montserrat, Inter, sans-serif';
export const PRON_FONT = 'Inter, Montserrat, sans-serif';

/** Cue-dan sonra 0→1 yay (spring) animasiyası; cue yoxdursa 1. */
export const usePop = (cue: number | undefined, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (cue === undefined) return 1;
  return spring({ frame: frame - cue, fps, config: { damping, mass: 0.7 } });
};

export const useFade = (cue: number | undefined, len = 10) => {
  const frame = useCurrentFrame();
  if (cue === undefined) return 1;
  return interpolate(frame, [cue, cue + len], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
};

export const Pop: React.FC<{ at?: number; style?: React.CSSProperties; children: React.ReactNode; from?: number }> = ({
  at,
  style,
  children,
  from = 0.6,
}) => {
  const p = usePop(at);
  const frame = useCurrentFrame();
  const visible = at === undefined || frame >= at;
  return (
    <div
      style={{
        opacity: visible ? Math.min(1, p * 1.4) : 0,
        transform: `scale(${from + (1 - from) * p}) translateY(${(1 - p) * 30}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Chip: React.FC<{ color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({
  color,
  children,
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      background: color,
      color: '#fff',
      fontWeight: 700,
      fontSize: 30,
      padding: '10px 26px',
      borderRadius: 999,
      ...style,
    }}
  >
    {children}
  </div>
);

/** Fonda yavaş üzən rəngli dairələr. */
export const Backdrop: React.FC<{ tint?: string }> = ({ tint = C.purple }) => {
  const frame = useCurrentFrame();
  const blobs = [
    { x: 160, y: 180, r: 260, c: tint, s: 0.7 },
    { x: 1760, y: 920, r: 320, c: C.orange, s: 0.5 },
    { x: 1700, y: 140, r: 160, c: C.green, s: 0.9 },
    { x: 260, y: 960, r: 190, c: C.pink, s: 0.6 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden' }}>
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x - b.r + Math.sin(frame / (90 / b.s) + i) * 30,
            top: b.y - b.r + Math.cos(frame / (110 / b.s) + i * 2) * 30,
            width: b.r * 2,
            height: b.r * 2,
            borderRadius: '50%',
            background: b.c,
            opacity: 0.08,
          }}
        />
      ))}
    </div>
  );
};

export const Title: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  color = C.purple,
  size = 64,
  style,
}) => <div style={{ fontWeight: 800, fontSize: size, color, lineHeight: 1.1, ...style }}>{children}</div>;
