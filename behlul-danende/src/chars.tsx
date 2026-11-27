import React from 'react';

/**
 * Düz rəngli (flat) 2D personajlar — kontursuz, tək sərt kölgə, çəhrayı yanaqlar.
 * Koordinatlar: (0,0) — ayaqların ortası, yuxarı mənfi y. Boy ~630.
 * Qol bucaqları dərəcə ilə: 0 = aşağı sallanıb, 90 = yana üfüqi, 180 = yuxarı; mənfi = bədənə doğru.
 */
export type Kind = 'behlul' | 'harun' | 'guard';
export type Eyes = 'open' | 'happy' | 'closed' | 'wide' | 'sad' | 'angry' | 'sly' | 'cry';
export type Mouth = 'smile' | 'grin' | 'frown' | 'o' | 'neutral' | 'cry' | 'smirk';
export type Pose = {
  x: number;
  y: number;
  s?: number;
  armL?: number;
  armR?: number;
  elbL?: number;
  elbR?: number;
  armsBehind?: boolean;
  lean?: number;
  head?: number;
  legs?: 'stand' | 'walk' | 'sit' | 'floor';
  phase?: number;
  eyes?: Eyes;
  look?: number;
  brow?: number;
  mouth?: Mouth;
  talk?: number;
  tears?: number;
  blink?: boolean;
  bob?: number;
  horse?: boolean;
  finger?: 'L' | 'R';
  opacity?: number;
};

type Pal = {
  skin: string; skinD: string; hair: string; hairD: string; robe: string; robeD: string; sleeve: string;
  pants: string; shoe: string; cap: string; capD: string; belt: string;
};
const PAL: Record<Kind, Pal> = {
  behlul: { skin: '#EDB08C', skinD: '#D9916C', hair: '#4A3020', hairD: '#3A2418', robe: '#A67C52', robeD: '#8C6440', sleeve: '#9A7149',
    pants: '#6B5A45', shoe: '#5A3A23', cap: '#EFE6D2', capD: '#D8CDB4', belt: '#D8B46A' },
  harun: { skin: '#F3B499', skinD: '#E09A7E', hair: '#1E1B2E', hairD: '#141220', robe: '#1E1B2E', robeD: '#2A2640', sleeve: '#26223A',
    pants: '#1E1B2E', shoe: '#A52232', cap: '#F4F1EA', capD: '#DCD6C8', belt: '#E4B94B' },
  guard: { skin: '#E0A07A', skinD: '#C98762', hair: '#1E1B2E', hairD: '#141220', robe: '#A52232', robeD: '#7C1827', sleeve: '#952030',
    pants: '#2A2B4B', shoe: '#3A2418', cap: '#8A8FA0', capD: '#6C7182', belt: '#5A3A23' },
};

const UA = 115; // çiyin-dirsək
const FA = 105; // dirsək-əl
const SH_Y = -365;
const SH_X = 82;

const rad = (d: number) => (d * Math.PI) / 180;
/** Əlin bədən koordinatlarında yeri (dirsək bucağı ilə). */
export const handPos = (side: number, a: number, elb: number) => {
  const ex = side * SH_X + side * Math.sin(rad(a)) * UA;
  const ey = SH_Y + Math.cos(rad(a)) * UA;
  const t = a + elb;
  return { x: ex + side * Math.sin(rad(t)) * FA, y: ey + Math.cos(rad(t)) * FA };
};

const Arm: React.FC<{ side: number; a: number; elb: number; p: Pal; finger?: boolean; kind: Kind }> = ({ side, a, elb, p, finger, kind }) => {
  const w1 = kind === 'harun' ? 56 : 46;
  return (
    <g transform={`translate(${side * SH_X},${SH_Y}) rotate(${-side * a})`}>
      <rect x={-w1 / 2} y={-12} width={w1} height={UA + 22} rx={w1 / 2} fill={p.sleeve} />
      <g transform={`translate(0,${UA}) rotate(${-side * elb})`}>
        <rect x={-w1 / 2 + 3} y={-14} width={w1 - 6} height={FA + 6} rx={(w1 - 6) / 2} fill={p.sleeve} />
        {kind === 'harun' && <rect x={-w1 / 2 + 3} y={FA - 24} width={w1 - 6} height={12} rx={5} fill="#E4B94B" />}
        <circle cx={0} cy={FA + 4} r={25} fill={p.skin} />
        {finger && <rect x={-7} y={FA + 10} width={14} height={40} rx={7} fill={p.skin} />}
      </g>
    </g>
  );
};

const Legs: React.FC<{ p: Pal; legs: Pose['legs']; phase: number; kind: Kind }> = ({ p, legs, phase, kind }) => {
  if (legs === 'floor') {
    return (
      <g>
        <ellipse cx={-48} cy={-70} rx={44} ry={62} fill={p.pants} transform="rotate(-12,-48,-70)" />
        <ellipse cx={48} cy={-70} rx={44} ry={62} fill={p.pants} transform="rotate(12,48,-70)" />
        <ellipse cx={-62} cy={-6} rx={40} ry={16} fill={p.shoe} />
        <ellipse cx={62} cy={-6} rx={40} ry={16} fill={p.shoe} />
      </g>
    );
  }
  const sw = legs === 'walk' ? Math.sin(phase) * 24 : 0;
  const leg = (side: number, r: number) => (
    <g transform={`rotate(${r},${side * 30},-150)`} key={side}>
      <rect x={side * 30 - 22} y={-160} width={44} height={150} rx={20} fill={p.pants} />
      {kind === 'guard' && <rect x={side * 30 - 24} y={-70} width={48} height={60} rx={14} fill={p.shoe} />}
      <ellipse cx={side * 30 + side * 8} cy={-8} rx={36} ry={15} fill={p.shoe} />
    </g>
  );
  return (
    <g>
      {legs === 'sit' && (
        <>
          <ellipse cx={-34} cy={-150} rx={36} ry={30} fill={p.robeD} />
          <ellipse cx={34} cy={-150} rx={36} ry={30} fill={p.robeD} />
        </>
      )}
      {leg(-1, sw)}
      {leg(1, -sw)}
    </g>
  );
};

const Torso: React.FC<{ p: Pal; kind: Kind }> = ({ p, kind }) => {
  const hem = kind === 'harun' ? -40 : kind === 'guard' ? -120 : -95;
  const hw = kind === 'harun' ? 150 : kind === 'guard' ? 112 : 128;
  const d = `M ${-SH_X - 14} ${SH_Y - 10} Q 0 ${SH_Y - 40} ${SH_X + 14} ${SH_Y - 10} L ${hw} ${hem} Q 0 ${hem + 18} ${-hw} ${hem} Z`;
  return (
    <g>
      <path d={d} fill={p.robe} />
      {/* bir tərəfli sərt kölgə */}
      <path d={`M 30 ${SH_Y - 22} Q 70 ${SH_Y - 16} ${SH_X + 14} ${SH_Y - 10} L ${hw} ${hem} Q 80 ${hem + 12} 40 ${hem + 14} Z`} fill={p.robeD} opacity={0.55} />
      {kind === 'behlul' && (
        <g>
          <rect x={-70} y={-200} width={46} height={42} rx={6} fill="#6F8F5A" transform="rotate(-8,-47,-179)" />
          <rect x={40} y={-150} width={40} height={36} rx={6} fill="#4E6B9A" transform="rotate(10,60,-132)" />
          <rect x={-30} y={-330} width={30} height={28} rx={5} fill="#C99A62" transform="rotate(6,-15,-316)" />
          <g stroke="#5A3A23" strokeWidth={3} strokeLinecap="round" opacity={0.7}>
            <line x1={-66} y1={-205} x2={-62} y2={-195} /><line x1={-30} y1={-205} x2={-26} y2={-196} />
            <line x1={46} y1={-155} x2={50} y2={-146} /><line x1={74} y1={-150} x2={78} y2={-141} />
          </g>
          <rect x={-118} y={-252} width={236} height={22} rx={10} fill={p.belt} />
          <path d="M 18 -232 q 6 40 -4 70 M 30 -232 q 10 36 6 62" stroke={p.belt} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d={`M -14 ${SH_Y - 28} L 0 -250 L 14 ${SH_Y - 28} Z`} fill={p.robeD} />
        </g>
      )}
      {kind === 'harun' && (
        <g>
          <path d={`M -34 ${SH_Y - 26} L -46 ${hem + 6} L 46 ${hem + 6} L 34 ${SH_Y - 26} Z`} fill="#A52232" />
          <path d={`M -34 ${SH_Y - 26} L -46 ${hem + 6}`} stroke="#E4B94B" strokeWidth={10} />
          <path d={`M 34 ${SH_Y - 26} L 46 ${hem + 6}`} stroke="#E4B94B" strokeWidth={10} />
          <path d={`M ${-hw + 6} ${hem - 4} Q 0 ${hem + 14} ${hw - 6} ${hem - 4}`} stroke="#E4B94B" strokeWidth={12} fill="none" />
          <rect x={-128} y={-250} width={256} height={30} rx={12} fill="#E4B94B" />
          <circle cx={0} cy={-235} r={18} fill="#C13A2B" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={0} cy={-300 + i * 50 + (i > 0 ? 40 : 0)} r={7} fill="#E4B94B" />
          ))}
        </g>
      )}
      {kind === 'guard' && (
        <g>
          <rect x={-112} y={-236} width={224} height={26} rx={8} fill={p.belt} />
          <rect x={-16} y={-236} width={32} height={26} rx={4} fill="#E4B94B" />
          <path d={`M -70 ${SH_Y - 14} L 0 -300 L 70 ${SH_Y - 14}`} stroke="#7C1827" strokeWidth={14} fill="none" />
        </g>
      )}
    </g>
  );
};

const EyesC: React.FC<{ e: Eyes; look: number; blink: boolean; brow: number; kind: Kind; p: Pal }> = ({ e, look, blink, brow, p }) => {
  const ink = '#1E1B2E';
  const one = (side: number) => {
    const cx = side * 40;
    const cy = -130;
    let el: React.ReactNode;
    const mode = blink && (e === 'open' || e === 'wide' || e === 'sad' || e === 'angry' || e === 'sly') ? 'closed' : e;
    if (mode === 'happy') el = <path d={`M ${cx - 16} ${cy + 6} Q ${cx} ${cy - 16} ${cx + 16} ${cy + 6}`} stroke={ink} strokeWidth={8} fill="none" strokeLinecap="round" />;
    else if (mode === 'closed') el = <path d={`M ${cx - 15} ${cy} Q ${cx} ${cy + 10} ${cx + 15} ${cy}`} stroke={ink} strokeWidth={7} fill="none" strokeLinecap="round" />;
    else if (mode === 'cry')
      el = <path d={`M ${cx - side * 16} ${cy - 10} L ${cx + side * 12} ${cy} L ${cx - side * 16} ${cy + 10}`} stroke={ink} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    else if (mode === 'wide')
      el = (
        <g>
          <circle cx={cx} cy={cy} r={24} fill="#FBF6EE" />
          <circle cx={cx + look * 7} cy={cy + 2} r={11} fill={ink} />
          <circle cx={cx + look * 7 + 4} cy={cy - 3} r={4} fill="#fff" />
        </g>
      );
    else
      el = (
        <g>
          <ellipse cx={cx + look * 9} cy={cy} rx={13} ry={mode === 'sly' || mode === 'angry' ? 10 : 17} fill={ink} />
          <circle cx={cx + look * 9 + 4} cy={cy - 6} r={4.5} fill="#fff" />
          {(mode === 'sly' || mode === 'angry') && <rect x={cx - 20} y={cy - 26} width={40} height={18} fill={p.skin} />}
        </g>
      );
    const br = mode === 'sad' || mode === 'cry' ? -1 : mode === 'angry' ? 1 : brow;
    return (
      <g key={side}>
        {el}
        <rect x={cx - 24} y={cy - 46} width={48} height={13} rx={6.5} fill={p.hair} transform={`rotate(${-side * br * 16},${cx},${cy - 40})`} />
      </g>
    );
  };
  return (
    <g>
      {one(-1)}
      {one(1)}
    </g>
  );
};

const MouthC: React.FC<{ m: Mouth; talk: number }> = ({ m, talk }) => {
  const y = -62;
  const ink = '#6D2831';
  if (talk > 0.06 || m === 'cry' || m === 'o') {
    const op = m === 'cry' ? Math.max(0.7, talk) : m === 'o' ? Math.max(0.55, talk) : talk;
    const rx = m === 'o' ? 14 : m === 'cry' ? 30 : 22;
    const ry = 5 + 20 * op;
    return (
      <g>
        <ellipse cx={0} cy={y + ry * 0.4} rx={rx} ry={ry} fill={ink} />
        {op > 0.35 && <ellipse cx={0} cy={y + ry * 1.0} rx={rx * 0.55} ry={ry * 0.35} fill="#E8707E" />}
        {m !== 'o' && op > 0.25 && <rect x={-rx * 0.6} y={y + ry * 0.4 - ry + 1} width={rx * 1.2} height={6} rx={3} fill="#FBF6EE" />}
      </g>
    );
  }
  if (m === 'grin')
    return (
      <g>
        <path d={`M -30 ${y - 8} Q 0 ${y - 4} 30 ${y - 8} Q 26 ${y + 26} 0 ${y + 28} Q -26 ${y + 26} -30 ${y - 8} Z`} fill={ink} />
        <path d={`M -26 ${y - 6} Q 0 ${y - 2} 26 ${y - 6} L 24 ${y + 2} Q 0 ${y + 6} -24 ${y + 2} Z`} fill="#FBF6EE" />
      </g>
    );
  if (m === 'smile') return <path d={`M -24 ${y - 4} Q 0 ${y + 20} 24 ${y - 4}`} stroke={ink} strokeWidth={8} fill="none" strokeLinecap="round" />;
  if (m === 'smirk') return <path d={`M -20 ${y + 4} Q 6 ${y + 10} 26 ${y - 8}`} stroke={ink} strokeWidth={8} fill="none" strokeLinecap="round" />;
  if (m === 'frown') return <path d={`M -22 ${y + 10} Q 0 ${y - 8} 22 ${y + 10}`} stroke={ink} strokeWidth={8} fill="none" strokeLinecap="round" />;
  return <rect x={-18} y={y - 2} width={36} height={8} rx={4} fill={ink} />;
};

const Tears: React.FC<{ v: number; phase: number }> = ({ v, phase }) => {
  if (v <= 0.01) return null;
  const drops = [0, 1, 2];
  return (
    <g opacity={Math.min(1, v * 1.5)}>
      {[-1, 1].map((side) => (
        <g key={side}>
          <path d={`M ${side * 40 - 8} -112 L ${side * 40 + 8} -112 L ${side * 46 + 10} ${-112 + 90 * v} L ${side * 46 - 10} ${-112 + 90 * v} Z`} fill="#7EC8F0" opacity={0.85} />
          {v > 0.5 &&
            drops.map((d) => {
              const k = (phase * 0.9 + d / 3) % 1;
              return <ellipse key={d} cx={side * (60 + k * 50)} cy={-120 + k * k * 160} rx={7} ry={10} fill="#7EC8F0" opacity={1 - k} />;
            })}
        </g>
      ))}
    </g>
  );
};

const HeadC: React.FC<{ kind: Kind; p: Pal; pose: Pose; phase: number }> = ({ kind, p, pose, phase }) => {
  const e = pose.eyes ?? 'open';
  return (
    <g>
      {/* qulaqlar */}
      <ellipse cx={-104} cy={-118} rx={18} ry={26} fill={p.skinD} />
      <ellipse cx={104} cy={-118} rx={18} ry={26} fill={p.skinD} />
      {/* baş */}
      <ellipse cx={0} cy={-120} rx={108} ry={120} fill={p.skin} />
      <path d="M 40 -230 Q 108 -200 106 -110 Q 100 -40 60 -12 Q 96 -70 90 -130 Q 84 -190 40 -230 Z" fill={p.skinD} opacity={0.35} />
      {/* yanaqlar */}
      <ellipse cx={-64} cy={-92} rx={18} ry={11} fill="#EE9C8C" opacity={0.75} />
      <ellipse cx={64} cy={-92} rx={18} ry={11} fill="#EE9C8C" opacity={0.75} />
      {/* saqqal */}
      {kind === 'behlul' && <path d="M -98 -140 Q -104 -40 -50 10 Q -18 50 0 78 Q 18 50 50 10 Q 104 -40 98 -140 Q 80 -60 40 -54 Q 0 -44 -40 -54 Q -80 -60 -98 -140 Z" fill={p.hair} />}
      {kind === 'harun' && <path d="M -100 -140 Q -110 -20 -40 22 Q 0 44 40 22 Q 110 -20 100 -140 Q 84 -64 40 -56 Q 0 -48 -40 -56 Q -84 -64 -100 -140 Z" fill={p.hair} />}
      {kind === 'behlul' && <path d="M -20 30 Q 0 60 0 78 Q 8 50 20 30 Z" fill={p.hairD} />}
      {/* bığ */}
      {kind === 'guard' ? (
        <path d="M 0 -78 Q -40 -92 -70 -70 Q -82 -60 -74 -50 Q -60 -66 -30 -62 Q -10 -60 0 -66 Q 10 -60 30 -62 Q 60 -66 74 -50 Q 82 -60 70 -70 Q 40 -92 0 -78 Z" fill={p.hair} />
      ) : (
        <path d="M -44 -70 Q -20 -86 0 -76 Q 20 -86 44 -70 Q 24 -66 0 -70 Q -24 -66 -44 -70 Z" fill={p.hairD} />
      )}
      <MouthC m={pose.mouth ?? 'neutral'} talk={pose.talk ?? 0} />
      {/* burun */}
      <ellipse cx={0} cy={-98} rx={16} ry={13} fill={p.skinD} />
      <EyesC e={e} look={pose.look ?? 0} blink={!!pose.blink} brow={pose.brow ?? 0} kind={kind} p={p} />
      <Tears v={pose.tears ?? 0} phase={phase} />
      {/* baş geyimi */}
      {kind === 'behlul' && (
        <g transform="rotate(-8,0,-220)">
          <path d="M -70 -246 Q -60 -300 0 -304 Q 60 -300 70 -246 Z" fill={p.capD} />
          <ellipse cx={0} cy={-226} rx={104} ry={42} fill={p.cap} />
          <path d="M -96 -222 Q 0 -196 96 -238" stroke={p.capD} strokeWidth={9} fill="none" strokeLinecap="round" />
          <path d="M -80 -244 Q 0 -222 86 -258" stroke={p.capD} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M 86 -222 Q 120 -210 112 -176 Q 104 -196 84 -200 Z" fill={p.cap} />
        </g>
      )}
      {kind === 'harun' && (
        <g>
          <ellipse cx={0} cy={-262} rx={118} ry={88} fill={p.cap} />
          <path d="M -112 -238 Q 0 -206 112 -260 M -104 -286 Q 0 -246 110 -306 M -70 -326 Q 10 -296 80 -334" stroke={p.capD} strokeWidth={10} fill="none" strokeLinecap="round" />
          <ellipse cx={0} cy={-206} rx={112} ry={22} fill={p.capD} />
          <circle cx={0} cy={-280} r={26} fill="#E4B94B" />
          <circle cx={0} cy={-280} r={15} fill="#C13A2B" />
          <path d="M 6 -300 Q 30 -380 70 -400 Q 44 -360 22 -298 Z" fill="#F7F2E6" />
          <path d="M 12 -300 Q 34 -360 70 -400" stroke="#E4B94B" strokeWidth={4} fill="none" />
        </g>
      )}
      {kind === 'guard' && (
        <g>
          <path d="M -112 -190 Q -100 -300 0 -340 Q 100 -300 112 -190 Z" fill={p.cap} />
          <path d="M 20 -330 Q 96 -290 112 -190 L 70 -190 Q 64 -270 20 -330 Z" fill={p.capD} />
          <rect x={-118} y={-206} width={236} height={30} rx={12} fill={p.capD} />
          <circle cx={0} cy={-344} r={12} fill="#E4B94B" />
          <rect x={-9} y={-190} width={18} height={70} rx={8} fill={p.capD} />
        </g>
      )}
    </g>
  );
};

/** Taxta at — Bəhlulun çubuq atı. Əlin içindən keçir. */
const Horse: React.FC<{ hx: number; hy: number }> = ({ hx, hy }) => {
  const dx = 0.36;
  const dy = -0.93;
  const top = { x: hx + dx * 170, y: hy + dy * 170 };
  const bot = { x: hx - dx * 230, y: hy - dy * 230 };
  return (
    <g>
      <line x1={bot.x} y1={bot.y} x2={top.x} y2={top.y} stroke="#8B5A2B" strokeWidth={16} strokeLinecap="round" />
      <g transform={`translate(${top.x},${top.y}) rotate(-20)`}>
        <path d="M -20 30 Q -30 -40 10 -60 Q 60 -70 86 -30 Q 96 -10 80 0 Q 60 6 40 -10 Q 30 20 26 40 Z" fill="#D6B07A" />
        <path d="M -24 20 Q -40 -30 -6 -60 Q 2 -40 -8 -10 Z" fill="#5A3A23" />
        <circle cx={40} cy={-36} r={7} fill="#1E1B2E" />
        <ellipse cx={30} cy={-64} rx={9} ry={16} fill="#D6B07A" transform="rotate(20,30,-64)" />
        <path d="M 40 -6 L 60 30" stroke="#C13A2B" strokeWidth={6} strokeLinecap="round" />
      </g>
    </g>
  );
};

export const Char: React.FC<{ kind: Kind; pose: Pose; frame: number }> = ({ kind, pose, frame }) => {
  const p = PAL[kind];
  const s = (pose.s ?? 1) * (kind === 'harun' ? 1.08 : 1);
  const legs = pose.legs ?? 'stand';
  const drop = legs === 'sit' ? 20 : legs === 'floor' ? 110 : 0;
  const phase = pose.phase ?? 0;
  const breathe = Math.sin(frame / 14) * 3;
  const aL = pose.armL ?? 8;
  const aR = pose.armR ?? 8;
  const eL = pose.elbL ?? 0;
  const eR = pose.elbR ?? 0;
  const arms = (
    <>
      <Arm side={-1} a={aL} elb={eL} p={p} kind={kind} finger={pose.finger === 'L'} />
      <Arm side={1} a={aR} elb={eR} p={p} kind={kind} finger={pose.finger === 'R'} />
    </>
  );
  const hR = handPos(1, aR, eR);
  const hL = handPos(-1, aL, eL);
  return (
    <g transform={`translate(${pose.x},${pose.y + (pose.bob ?? 0)}) scale(${s})`} opacity={pose.opacity ?? 1}>
      <ellipse cx={0} cy={-2} rx={150} ry={22} fill="#120A1E" opacity={0.28} />
      <g transform={`translate(0,${drop})`}>
        <Legs p={p} legs={legs} phase={phase} kind={kind} />
        <g transform={`rotate(${pose.lean ?? 0},0,-140) translate(0,${breathe * 0.3})`}>
          {pose.armsBehind && arms}
          {kind === 'guard' && <line x1={hR.x} y1={hR.y + 160} x2={hR.x} y2={hR.y - 420} stroke="#8B5A2B" strokeWidth={14} strokeLinecap="round" />}
          {kind === 'guard' && <path d={`M ${hR.x - 16} ${hR.y - 410} L ${hR.x} ${hR.y - 480} L ${hR.x + 16} ${hR.y - 410} Z`} fill="#C9CED8" />}
          <Torso p={p} kind={kind} />
          <g transform={`translate(0,${-385 + breathe * 0.4}) rotate(${pose.head ?? 0},0,0)`}>
            <g transform="translate(0,0)">
              <HeadC kind={kind} p={p} pose={pose} phase={phase} />
            </g>
          </g>
          {!pose.armsBehind && arms}
          {kind === 'behlul' && pose.horse && <Horse hx={pose.armL !== undefined && pose.horse ? hL.x : hL.x} hy={hL.y} />}
          {kind === 'behlul' && pose.horse && (
            <g transform={`translate(${hL.x},${hL.y})`}>
              <circle r={25} fill={p.skin} />
            </g>
          )}
        </g>
      </g>
    </g>
  );
};
