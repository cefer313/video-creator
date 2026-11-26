import React from 'react';

// Sadə siluet personaj (yan görünüş, sağa baxır). Bucaqlar dərəcə ilə: 0 = düz aşağı, müsbət = irəli (+x).
export type Pose = {
  hipY: number; // omba yerdən hündürlük
  lean: number; // gövdənin irəli əyilməsi (0 = dik)
  tilt: number; // başın əyilməsi (+ aşağı, − yuxarı)
  lTh: number; lSh: number; rTh: number; rSh: number; // bud və baldır (l = uzaq tərəf)
  lUp: number; lFo: number; rUp: number; rFo: number; // çiyin-dirsək və dirsək-əl
  cup: number; // 0..1 — ovuclar yuxarı (dua)
};

export const lerpPose = (a: Pose, b: Pose, k: number): Pose => {
  const o = {} as Pose;
  (Object.keys(a) as (keyof Pose)[]).forEach((key) => {
    o[key] = a[key] + (b[key] - a[key]) * k;
  });
  return o;
};

const STAND: Pose = { hipY: 160, lean: 0, tilt: 0, lTh: 0, lSh: 0, rTh: 0, rSh: 0, lUp: 4, lFo: 8, rUp: 4, rFo: 8, cup: 0 };

export const POSES = {
  stand: STAND,
  // diz üstə oturub dua: ovuclar yuxarı, sinə qarşısında
  dua: { hipY: 40, lean: -2, tilt: 10, lTh: 84, lSh: -84, rTh: 80, rSh: -86, lUp: 18, lFo: 104, rUp: 24, rFo: 108, cup: 1 },
  // diz üstə, əllər aşağı (yıxılma anı)
  kneel: { hipY: 40, lean: 24, tilt: 22, lTh: 80, lSh: -84, rTh: 76, rSh: -86, lUp: 10, lFo: 14, rUp: 14, rFo: 18, cup: 0 },
  // yağış altında: üz göyə, qollar açıq
  joy: { hipY: 160, lean: -6, tilt: -22, lTh: -4, lSh: -4, rTh: 6, rSh: 6, lUp: 145, lFo: 160, rUp: 128, rFo: 150, cup: 0 },
} satisfies Record<string, Pose>;

export const walkPose = (phase: number, amp: number, lean: number, tilt: number): Pose => {
  const s = Math.sin(phase);
  const sh = (p: number) => 34 * Math.max(0, Math.sin(p + 1.2)); // dizin bükülməsi
  return {
    hipY: 160 - 6 * amp * Math.abs(Math.cos(phase)),
    lean,
    tilt,
    lTh: 24 * amp * s,
    lSh: 24 * amp * s - amp * sh(phase),
    rTh: -24 * amp * s,
    rSh: -24 * amp * s - amp * sh(phase + Math.PI),
    lUp: -20 * amp * s + 4,
    lFo: -20 * amp * s + 18,
    rUp: 20 * amp * s + 4,
    rFo: 20 * amp * s + 18,
    cup: 0,
  };
};

const L = { th: 82, sh: 80, torso: 122, up: 62, fo: 58, neck: 30 };
const rad = (d: number) => (d * Math.PI) / 180;
const dirDown = (d: number) => [Math.sin(rad(d)), Math.cos(rad(d))] as const;

type P = [number, number];
const add = (p: P, len: number, ang: number): P => {
  const [dx, dy] = dirDown(ang);
  return [p[0] + dx * len, p[1] + dy * len];
};

export const Figure: React.FC<{
  pose: Pose;
  x: number;
  y: number; // yer xətti
  scale?: number;
  color?: string;
  far?: string;
  flip?: boolean;
}> = ({ pose, x, y, scale = 1, color = '#2a1a12', far = '#1c110c', flip }) => {
  const hip: P = [0, -pose.hipY];
  const lKnee = add(hip, L.th, pose.lTh);
  const lFoot = add(lKnee, L.sh, pose.lSh);
  const rKnee = add(hip, L.th, pose.rTh);
  const rFoot = add(rKnee, L.sh, pose.rSh);
  const neck: P = [hip[0] + Math.sin(rad(pose.lean)) * L.torso, hip[1] - Math.cos(rad(pose.lean)) * L.torso];
  const head: P = [
    neck[0] + Math.sin(rad(pose.lean + pose.tilt)) * L.neck,
    neck[1] - Math.cos(rad(pose.lean + pose.tilt)) * L.neck,
  ];
  const sh: P = [neck[0] - Math.sin(rad(pose.lean)) * 10, neck[1] + Math.cos(rad(pose.lean)) * 10];
  const lEl = add(sh, L.up, pose.lUp);
  const lHa = add(lEl, L.fo, pose.lFo);
  const rEl = add(sh, L.up, pose.rUp);
  const rHa = add(rEl, L.fo, pose.rFo);
  // ən aşağı nöqtə yerə toxunsun
  const low = Math.max(lFoot[1], rFoot[1], lKnee[1] + 8, rKnee[1] + 8);
  const line = (a: P, b: P, w: number, c: string) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={c} strokeWidth={w} strokeLinecap="round" />
  );
  const limb = (a: P, b: P, c: P, w: number, col: string) => (
    <polyline
      points={`${a[0]},${a[1]} ${b[0]},${b[1]} ${c[0]},${c[1]}`}
      fill="none"
      stroke={col}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
  const foot = (f: P, col: string) => <ellipse cx={f[0] + 9} cy={f[1] + 2} rx={17} ry={8} fill={col} />;
  const hand = (h: P, col: string, cup: number) =>
    cup > 0.5 ? (
      // ovuc yuxarı: kiçik "qab" forması
      <path d={`M ${h[0] - 6} ${h[1] - 4} Q ${h[0] + 9} ${h[1] + 12} ${h[0] + 24} ${h[1] - 6}`} stroke={col} strokeWidth={10} strokeLinecap="round" fill="none" />
    ) : (
      <circle cx={h[0]} cy={h[1]} r={9} fill={col} />
    );
  // paltar: ombadan dizlərə qədər
  const robe = `M ${sh[0] - 22} ${sh[1] + 4} L ${sh[0] + 24} ${sh[1] + 4} L ${hip[0] + 28} ${hip[1]} L ${rKnee[0] + 12} ${rKnee[1] + 6} L ${lKnee[0] - 12} ${lKnee[1] + 6} L ${hip[0] - 28} ${hip[1]} Z`;
  // baş örtüyü (arxaya düşən parça)
  const back = Math.sin(rad(pose.lean + pose.tilt));
  const wrap = `M ${head[0] - 6} ${head[1] - 26} Q ${head[0] - 40} ${head[1] - 10} ${neck[0] - 44 + back * 10} ${neck[1] + 34} L ${neck[0] - 14} ${neck[1] + 14} Z`;
  return (
    <g transform={`translate(${x} ${y - low * scale}) scale(${flip ? -scale : scale} ${scale})`}>
      {limb(sh, lEl, lHa, 18, far)}
      {hand(lHa, far, pose.cup)}
      {limb(hip, lKnee, lFoot, 25, far)}
      {foot(lFoot, far)}
      <path d={robe} fill={color} strokeLinejoin="round" stroke={color} strokeWidth={8} />
      {line(hip, neck, 46, color)}
      {limb(hip, rKnee, rFoot, 26, color)}
      {foot(rFoot, color)}
      <path d={wrap} fill={color} />
      <circle cx={head[0]} cy={head[1]} r={26} fill={color} />
      <ellipse cx={head[0] - 2} cy={head[1] - 14} rx={29} ry={14} fill={color} />
      {limb(sh, rEl, rHa, 19, color)}
      {hand(rHa, color, pose.cup)}
    </g>
  );
};

// Ailə üzvü: qadın (uzun paltar, örpək) və ya uşaq. Sola baxır.
export const FamilyMember: React.FC<{
  kind: 'woman' | 'girl' | 'boy';
  x: number;
  y: number;
  wave: number; // 0..1 qol qaldırma
  f: number;
  color: string;
}> = ({ kind, x, y, wave, f, color }) => {
  const s = kind === 'woman' ? 1.1 : kind === 'girl' ? 0.74 : 0.68;
  const H = 330;
  const headY = -H + 30;
  const swing = wave * (140 + 18 * Math.sin(f * 0.35));
  const up = 6 + swing;
  const sh: P = [0, headY + 62];
  const el = add(sh, 58, -up);
  const ha = add(el, 54, -(up + 12 * wave));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {kind !== 'boy' ? (
        // uzun paltar
        <path d={`M -26 ${headY + 52} L 26 ${headY + 52} L 62 -4 Q 0 6 -62 -4 Z`} fill={color} />
      ) : (
        <>
          <path d={`M -24 ${headY + 52} L 24 ${headY + 52} L 30 -120 L -30 -120 Z`} fill={color} />
          <line x1={-12} y1={-130} x2={-14} y2={-6} stroke={color} strokeWidth={24} strokeLinecap="round" />
          <line x1={12} y1={-130} x2={16} y2={-6} stroke={color} strokeWidth={24} strokeLinecap="round" />
        </>
      )}
      {/* arxa qol */}
      <line x1={10} y1={sh[1]} x2={18} y2={sh[1] + 110} stroke={color} strokeWidth={18} strokeLinecap="round" />
      <circle cx={0} cy={headY} r={28} fill={color} />
      {kind === 'woman' && <path d={`M -36 ${headY - 6} Q 0 ${headY - 52} 36 ${headY - 6} L 46 ${headY + 70} L -46 ${headY + 70} Z`} fill={color} />}
      {kind === 'girl' && <path d={`M -32 ${headY - 4} Q 0 ${headY - 46} 32 ${headY - 4} L 40 ${headY + 52} L -40 ${headY + 52} Z`} fill={color} />}
      <polyline
        points={`${sh[0]},${sh[1]} ${el[0]},${el[1]} ${ha[0]},${ha[1]}`}
        fill="none"
        stroke={color}
        strokeWidth={18}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={ha[0]} cy={ha[1]} r={9} fill={color} />
    </g>
  );
};
