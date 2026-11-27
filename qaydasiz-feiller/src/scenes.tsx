import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Backdrop, C, Chip, FONT, FORM, Pop, PRON_FONT, Title, useFade, usePop } from './ui';

export type Cues = Record<string, number>;
type Group = { n: number; name: string; rule: string; color: string; soft: string };
type Verb = { n: number; g: number; f: string[]; pron: string; tr: string };
type P<D> = { data: D; cues: Cues; dur: number };

const ord = (n: number) => `${n}-${[1, 2, 5, 7, 8].includes(n) ? 'ci' : n === 3 || n === 4 ? 'cü' : n === 6 ? 'cı' : 'cu'}`;
export const groupLabel = (g: Group) => `${ord(g.n)} qrup`;

const Full: React.FC<{ children: React.ReactNode; tint?: string }> = ({ children, tint }) => (
  <AbsoluteFill style={{ fontFamily: FONT, color: C.ink }}>
    <Backdrop tint={tint} />
    {children}
  </AbsoluteFill>
);

const Center: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', ...style }}>
    {children}
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ Giriş */
const FLOAT = ['go', 'went', 'gone', 'see', 'saw', 'seen', 'eat', 'ate', 'swim', 'swam', 'cut', 'bought', 'fly', 'flew'];
export const Intro: React.FC<P<{}>> = ({ cues }) => {
  const frame = useCurrentFrame();
  const t = usePop(0, 12);
  return (
    <Full>
      {FLOAT.map((w, i) => {
        const x = (i * 263) % 1820 + 50;
        const y = 1120 - ((frame * (1.2 + (i % 4) * 0.35) + i * 170) % 1300);
        return (
          <div key={i} style={{ position: 'absolute', left: x, top: y, fontSize: 34 + (i % 3) * 10, fontWeight: 700,
            color: [C.green, C.orange, C.pink, C.purple][i % 4], opacity: 0.18 }}>
            {w}
          </div>
        );
      })}
      <Center>
        <div style={{ transform: `scale(${0.7 + 0.3 * t})`, opacity: t, textAlign: 'center' }}>
          <Title size={150}>Qaydasız feillər</Title>
          <div style={{ fontSize: 72, fontWeight: 800, color: C.orange, marginTop: 10 }}>Irregular Verbs</div>
        </div>
        <Pop at={cues.count} style={{ marginTop: 60, display: 'flex', gap: 24 }}>
          <Chip color={C.green} style={{ fontSize: 40 }}>66 feil</Chip>
          <Chip color={C.purple} style={{ fontSize: 40 }}>5 qrup</Chip>
          <Chip color={C.orange} style={{ fontSize: 40 }}>asan əzbərləmə</Chip>
        </Pop>
      </Center>
    </Full>
  );
};

/* ------------------------------------------------------------------ Feil nədir? */
const LADDER = [
  { w: 'go', en: 'I go to school.', az: 'Mən məktəbə gedirəm.' },
  { w: 'went', en: 'I went to school.', az: 'Mən məktəbə getdim.' },
  { w: 'gone', en: 'She has gone to school.', az: 'O, məktəbə gedib.' },
];
export const Ladder: React.FC<P<{}>> = ({ cues }) => {
  const frame = useCurrentFrame();
  const active = frame >= cues.s3 ? 2 : frame >= cues.s2 ? 1 : frame >= cues.s1 ? 0 : -1;
  return (
    <Full>
      <div style={{ position: 'absolute', left: 110, top: 70 }}>
        <Title>Feil nədir?</Title>
        <div style={{ fontSize: 36, marginTop: 16, color: C.mute, fontWeight: 600 }}>Feil — hərəkət bildirən sözdür</div>
        <div style={{ display: 'flex', gap: 18, marginTop: 24 }}>
          {['qaçmaq', 'yemək', 'oynamaq', 'getmək'].map((w, i) => (
            <Pop key={w} at={cues.what + 20 + i * 12}>
              <Chip color={[C.green, C.orange, C.purple, C.pink][i]}>{w}</Chip>
            </Pop>
          ))}
        </div>
      </div>
      <Pop at={cues.three} style={{ position: 'absolute', right: 110, top: 90 }}>
        <div style={{ fontSize: 40, fontWeight: 800, color: C.purple }}>Hər feilin 3 forması var</div>
      </Pop>
      {LADDER.map((s, i) => {
        const at = cues.three + 25 + i * 10;
        const on = active === i;
        const shown = frame >= at;
        const p = usePop(at);
        const f = FORM[i];
        const h = 400 + i * 95;
        return (
          <div key={i} style={{ position: 'absolute', left: 110 + i * 580, bottom: 90, width: 540, height: h,
            opacity: shown ? p : 0, transform: `translateY(${(1 - p) * 60}px)` }}>
            <div style={{ position: 'absolute', inset: 0, background: on ? f.color : f.soft, borderRadius: 28,
              border: `4px solid ${f.color}`, boxShadow: on ? '0 18px 40px rgba(0,0,0,0.18)' : 'none' }} />
            <div style={{ position: 'absolute', top: 22, left: 0, right: 0, textAlign: 'center', color: on ? '#fff' : f.color }}>
              <div style={{ fontSize: 34, fontWeight: 800 }}>{f.label}</div>
              <div style={{ fontSize: 26, fontWeight: 600, opacity: 0.9 }}>{f.sub}</div>
              <div style={{ fontSize: 96, fontWeight: 800, marginTop: 4 }}>{s.w}</div>
            </div>
            <Pop at={cues[`s${i + 1}en`]} style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center',
              color: on ? '#fff' : C.ink }}>
              <div style={{ fontSize: 34, fontWeight: 700 }}>{s.en}</div>
              <div style={{ fontSize: 28, fontWeight: 600, opacity: 0.85, marginTop: 6 }}>{s.az}</div>
            </Pop>
          </div>
        );
      })}
    </Full>
  );
};

/* ------------------------------------------------------------------ Qaydalı / qaydasız */
const Pair: React.FC<{ a: string; b: string; color: string; suffix?: boolean; at: number }> = ({ a, b, color, suffix, at }) => (
  <Pop at={at} style={{ fontSize: 50, fontWeight: 800, margin: '14px 0', display: 'flex', alignItems: 'center', gap: 22 }}>
    <span>{a}</span>
    <span style={{ color: C.mute, fontSize: 40 }}>→</span>
    {suffix ? (
      <span>
        {a}
        <span style={{ color, background: '#fff', borderRadius: 12, padding: '0 8px', border: `3px solid ${color}` }}>ed</span>
      </span>
    ) : (
      <span style={{ color }}>{b}</span>
    )}
  </Pop>
);
export const Regular: React.FC<P<{}>> = ({ cues }) => {
  const panel = (color: string, soft: string): React.CSSProperties => ({
    position: 'absolute', top: 130, width: 780, height: 560, background: soft, border: `5px solid ${color}`,
    borderRadius: 36, padding: '40px 50px', boxSizing: 'border-box',
  });
  return (
    <Full>
      <Pop at={cues.reg} style={{ ...panel(C.green, C.greenSoft), left: 140 }}>
        <Title color={C.green} size={56}>Qaydalı feillər</Title>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.mute, margin: '8px 0 30px' }}>«tərbiyəli» — sonuna -ed alır</div>
        <Pair a="play" b="played" color={C.green} suffix at={cues.regEn} />
        <Pair a="jump" b="jumped" color={C.green} suffix at={cues.regEn + 25} />
        <Pair a="watch" b="watched" color={C.green} suffix at={cues.regEn + 50} />
      </Pop>
      <Pop at={cues.irr} style={{ ...panel(C.pink, C.pinkSoft), right: 140 }}>
        <Title color={C.pink} size={56}>Qaydasız feillər</Title>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.mute, margin: '8px 0 30px' }}>«nadinc» — istədiyi kimi dəyişir</div>
        <Pair a="go" b="went" color={C.pink} at={cues.irrEn} />
        <Pair a="eat" b="ate" color={C.pink} at={cues.irrEn + 22} />
        <Pair a="see" b="saw" color={C.pink} at={cues.irrEn + 44} />
      </Pop>
      <Pop at={cues.calm} style={{ position: 'absolute', bottom: 90, left: 0, right: 0, textAlign: 'center' }}>
        <Chip color={C.purple} style={{ fontSize: 40, padding: '16px 40px' }}>Onları əzbərləmək lazımdır — fəndlərlə asan olacaq!</Chip>
      </Pop>
    </Full>
  );
};

/* ------------------------------------------------------------------ 7 fənd */
const TIP_COLORS = [C.green, C.orange, '#2f7fe0', '#9447d9', C.pink, C.green, C.orange];
export const Tips: React.FC<P<{ tips: string[][] }>> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  let active = -1;
  data.tips.forEach((_, i) => { if (frame >= cues[`tip${i}`]) active = i; });
  return (
    <Full>
      <Title style={{ position: 'absolute', left: 110, top: 60 }}>Necə asan əzbərləyək? 7 sehrli fənd</Title>
      <div style={{ position: 'absolute', left: 110, right: 110, top: 190, display: 'flex', flexWrap: 'wrap', gap: 28 }}>
        {data.tips.map(([h, s], i) => (
          <Pop key={i} at={cues[`tip${i}`]} style={{ width: i < 4 ? 400 : 547, height: 360 }}>
            <div style={{ height: '100%', background: '#fff', borderRadius: 28, overflow: 'hidden', display: 'flex', flexDirection: 'column',
              border: `4px solid ${active === i ? TIP_COLORS[i] : 'transparent'}`, boxShadow: '0 10px 30px rgba(60,40,120,0.10)' }}>
              <div style={{ background: TIP_COLORS[i], color: '#fff', fontSize: 64, fontWeight: 800, padding: '14px 28px' }}>{i + 1}</div>
              <div style={{ padding: '22px 28px' }}>
                <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.15 }}>{h}</div>
                <div style={{ fontSize: 27, fontWeight: 600, color: C.mute, marginTop: 14, lineHeight: 1.3 }}>{s}</div>
              </div>
            </div>
          </Pop>
        ))}
      </div>
    </Full>
  );
};

/* ------------------------------------------------------------------ Qruplar bir baxışda */
export const Overview: React.FC<P<{ groups: Group[]; counts: number[]; examples: string[] }>> = ({ data, cues }) => (
  <Full>
    <Title style={{ position: 'absolute', left: 140, top: 70 }}>Qruplar bir baxışda</Title>
    <Pop at={cues.ov} style={{ position: 'absolute', right: 140, top: 80 }}>
      <Chip color={C.purple} style={{ fontSize: 36 }}>66 feil = 5 qrup</Chip>
    </Pop>
    <div style={{ position: 'absolute', left: 140, right: 140, top: 210 }}>
      {data.groups.map((g, i) => (
        <Pop key={g.n} at={cues[`r${i + 1}`]} from={0.9} style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', background: g.soft, borderRadius: 24, height: 132,
            borderLeft: `16px solid ${g.color}`, padding: '0 36px', gap: 36 }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: g.color, color: '#fff', fontSize: 52, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{g.n}</div>
            <div style={{ width: 560 }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: g.color }}>{g.name}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C.mute }}>{g.rule}</div>
            </div>
            <div style={{ flex: 1, fontSize: 42, fontWeight: 800 }}>{data.examples[i]}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: g.color }}>{data.counts[i]} feil</div>
          </div>
        </Pop>
      ))}
    </div>
  </Full>
);

/* ------------------------------------------------------------------ Qrup girişi */
const GROUP_EX: Record<number, string> = {
  1: 'read – read – read  (rid – red – red)',
  2: 'come – came – come',
  3: 'bought · brought · thought · taught · caught · fought',
  4: 'sing – sang – sung · swim – swam – swum',
  5: 'eaten · taken · given · known',
};
const GROUP_NOTE: Record<number, string> = {
  1: 'Heç dəyişmirlər! Bir dəfə öyrəndin — üçünü də bildin.',
  2: '1-ci və 3-cü forma eynidir, yalnız ortadakı dəyişir.',
  3: '2-ci və 3-cü forma əkiz kimi eynidir. Ən böyük qrup!',
  4: 'Yalnız bir hərf dəyişir: i → a → u.',
  5: 'Üçü də fərqlidir. Çoxunun 3-cü forması -n / -en ilə bitir.',
};
export const GroupIntro: React.FC<P<{ group: Group; count: number; first: number; last: number }>> = ({ data, cues }) => {
  const g = data.group;
  const p = usePop(0, 11);
  return (
    <Full tint={g.color}>
      <AbsoluteFill style={{ background: g.color, clipPath: `circle(${p * 30}% at 50% 26%)`, opacity: 0.12 }} />
      <Center style={{ justifyContent: 'flex-start', paddingTop: 130 }}>
        <div style={{ width: 230, height: 230, borderRadius: '50%', background: g.color, color: '#fff', fontSize: 150, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${p})`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>{g.n}</div>
        <Pop at={cues.t} style={{ textAlign: 'center', marginTop: 36 }}>
          <div style={{ fontSize: 40, fontWeight: 700, color: C.mute }}>{groupLabel(g)} · {data.count} feil</div>
          <Title color={g.color} size={104} style={{ marginTop: 8 }}>«{g.name}»</Title>
        </Pop>
        <Pop at={cues.a} style={{ fontSize: 40, fontWeight: 700, marginTop: 34, textAlign: 'center', maxWidth: 1500 }}>
          {GROUP_NOTE[g.n]}
        </Pop>
        <Pop at={cues.ex} style={{ marginTop: 40 }}>
          <div style={{ background: '#fff', border: `5px solid ${g.color}`, borderRadius: 28, padding: '22px 48px', fontSize: 50,
            fontWeight: 800, color: g.color }}>{GROUP_EX[g.n]}</div>
        </Pop>
      </Center>
    </Full>
  );
};

/* ------------------------------------------------------------------ Feil kartı */
type Span = [number, number];
const marks = (v: Verb): (Span | null)[] => {
  const [a, b, c] = v.f;
  if (v.g === 4) {
    const i = [...a].findIndex((ch, k) => ch !== b[k] || ch !== c[k]);
    return [[i, i + 1], [i, i + 1], [i, i + 1]];
  }
  if (v.g === 5) {
    if (c.endsWith('en') && !a.endsWith('en')) return [null, null, [c.length - 2, c.length]];
    if (c.endsWith('n') && !a.endsWith('n')) return [null, null, [c.length - 1, c.length]];
    return [null, null, null];
  }
  if (v.g === 3) {
    const m = b.match(/[oa]ught$/);
    if (m) return [null, [m.index!, b.length], [m.index!, b.length]];
    const last = b[b.length - 1];
    if ('td'.includes(last) && a[a.length - 1] !== last) return [null, [b.length - 1, b.length], [b.length - 1, b.length]];
  }
  return [null, null, null];
};

const Word: React.FC<{ w: string; span: Span | null; color: string; size: number }> = ({ w, span, color, size }) => {
  if (!span) return <span style={{ fontSize: size }}>{w}</span>;
  return (
    <span style={{ fontSize: size }}>
      {w.slice(0, span[0])}
      <span style={{ color, textDecoration: 'underline', textDecorationThickness: 8, textUnderlineOffset: 12 }}>
        {w.slice(span[0], span[1])}
      </span>
      {w.slice(span[1])}
    </span>
  );
};

const BOX_W = 520;
const GAP = 80;
const X0 = (1920 - 3 * BOX_W - 2 * GAP) / 2;

export const VerbCard: React.FC<P<{ verb: Verb; group: Group; total: number }>> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  const { verb: v, group: g } = data;
  const pr = v.pron.split(' – ');
  const pron = pr.length === 3 ? pr : [v.pron, '', ''];
  const mk = marks(v);
  const enter = usePop(0, 16);
  const all = cues.f2 + 8;
  const rel = useFade(all, 12);
  const trP = usePop(cues.tr);
  const active = frame >= cues.tr ? -1 : frame >= cues.f2 ? 2 : frame >= cues.f1 ? 1 : frame >= cues.f0 ? 0 : -1;
  return (
    <Full tint={g.color}>
      <div style={{ position: 'absolute', left: X0, right: X0, top: 56, display: 'flex', justifyContent: 'space-between',
        alignItems: 'center' }}>
        <Chip color={g.color}>{groupLabel(g)} · {g.name}</Chip>
        <div style={{ fontSize: 34, fontWeight: 800, color: C.mute }}>
          <span style={{ color: g.color, fontSize: 48 }}>{v.n}</span> / {data.total}
        </div>
      </div>
      {/* Qruplara görə əlaqə işarələri */}
      {g.n === 1 &&
        [0, 1].map((k) => (
          <div key={k} style={{ position: 'absolute', top: 395, left: X0 + BOX_W * (k + 1) + GAP * k, width: GAP, textAlign: 'center',
            fontSize: 84, fontWeight: 800, color: g.color, opacity: rel }}>=</div>
        ))}
      {g.n === 2 && (
        <svg style={{ position: 'absolute', left: 0, top: 0, opacity: rel }} width={1920} height={260}>
          <path d={`M ${X0 + BOX_W / 2} 240 C ${X0 + BOX_W / 2} 150, ${1920 - X0 - BOX_W / 2} 150, ${1920 - X0 - BOX_W / 2} 240`}
            fill="none" stroke={g.color} strokeWidth={7} strokeDasharray="18 14" />
          <rect x={960 - 80} y={148} width={160} height={52} rx={26} fill={g.color} />
          <text x={960} y={184} textAnchor="middle" fontSize={32} fontWeight={800} fill="#fff" fontFamily="Montserrat">eyni</text>
        </svg>
      )}
      {g.n === 3 && (
        <svg style={{ position: 'absolute', left: 0, top: 0, opacity: rel }} width={1920} height={260}>
          <path d={`M ${X0 + BOX_W + GAP + 30} 240 L ${X0 + BOX_W + GAP + 30} 200 L ${1920 - X0 - 30} 200 L ${1920 - X0 - 30} 240`}
            fill="none" stroke={g.color} strokeWidth={7} />
          <rect x={X0 + BOX_W * 1.5 + GAP * 1.5 + BOX_W / 2 - 80} y={174} width={160} height={52} rx={26} fill={g.color} />
          <text x={X0 + BOX_W * 2 + GAP * 1.5} y={210} textAnchor="middle" fontSize={32} fontWeight={800} fill="#fff"
            fontFamily="Montserrat">əkiz</text>
        </svg>
      )}
      {[0, 1, 2].map((k) => {
        const f = FORM[k];
        const at = cues[`f${k}`];
        const shown = frame >= at;
        const wp = usePop(at, 11);
        const w = v.f[k];
        const size = Math.min(118, 470 / (w.length * 0.66));
        const on = active === k;
        return (
          <div key={k} style={{ position: 'absolute', left: X0 + k * (BOX_W + GAP), top: 250, width: BOX_W, height: 400,
            opacity: enter, transform: `translateY(${(1 - enter) * 50}px) scale(${on ? 1.04 : 1})` }}>
            <div style={{ position: 'absolute', inset: 0, background: '#fff', borderRadius: 32, border: `5px solid ${f.color}`,
              boxShadow: on ? `0 0 0 10px ${f.soft}, 0 20px 40px rgba(0,0,0,0.15)` : '0 10px 30px rgba(60,40,120,0.08)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 96, background: f.soft, borderRadius: '28px 28px 0 0',
              textAlign: 'center', paddingTop: 12, boxSizing: 'border-box' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: f.color }}>{f.label}</div>
              <div style={{ fontSize: 24, fontWeight: 600, color: C.mute }}>{f.sub}</div>
            </div>
            <div style={{ position: 'absolute', top: 120, left: 0, right: 0, height: 170, display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 800, opacity: shown ? 1 : 0, transform: `scale(${0.5 + 0.5 * wp})` }}>
              <Word w={w} span={mk[k]} color={g.color} size={size} />
            </div>
            <div style={{ position: 'absolute', bottom: 34, left: 0, right: 0, textAlign: 'center', fontFamily: PRON_FONT,
              fontSize: 36, fontWeight: 600, color: C.mute, opacity: shown ? 1 : 0 }}>
              [{pron[k]}]
            </div>
          </div>
        );
      })}
      {g.n === 4 && (
        <div style={{ position: 'absolute', top: 668, left: 0, right: 0, textAlign: 'center', fontSize: 34, fontWeight: 800,
          color: g.color, opacity: rel }}>i → a → u</div>
      )}
      {g.n === 5 && mk[2] && (
        <div style={{ position: 'absolute', top: 668, right: X0, width: BOX_W, textAlign: 'center', fontSize: 32, fontWeight: 800,
          color: g.color, opacity: rel }}>sonu: -{v.f[2].slice(mk[2][0])}</div>
      )}
      <div style={{ position: 'absolute', top: 735, left: 0, right: 0, display: 'flex', justifyContent: 'center',
        opacity: frame >= cues.tr ? 1 : 0, transform: `scale(${0.7 + 0.3 * trP})` }}>
        <div style={{ background: C.purple, color: '#fff', borderRadius: 30, padding: '20px 60px', display: 'flex', alignItems: 'baseline',
          gap: 26, boxShadow: '0 16px 40px rgba(91,63,214,0.3)' }}>
          <span style={{ fontSize: 34, fontWeight: 700, opacity: 0.8 }}>{v.f[0]} =</span>
          <span style={{ fontSize: 74, fontWeight: 800 }}>{v.tr}</span>
        </div>
      </div>
      {(v.pron.includes('θ') || v.f[0] === 'read') && (
        <div style={{ position: 'absolute', bottom: 70, left: 0, right: 0, textAlign: 'center', fontSize: 30, fontWeight: 600,
          color: C.mute, fontFamily: PRON_FONT }}>
          {v.f[0] === 'read'
            ? 'Diqqət: eyni yazılır, amma keçmişdə «red» oxunur'
            : 'θ — dilin ucu dişlər arasında, səssiz «s» kimi'}
        </div>
      )}
    </Full>
  );
};

/* ------------------------------------------------------------------ Təkrar (mahnı kimi) */
export const Review: React.FC<P<{ group: Group; verbs: Verb[] }>> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  const { group: g, verbs } = data;
  let active = -1;
  verbs.forEach((_, i) => { if (frame >= cues[`v${i}`]) active = i; });
  if (frame >= cues.end) active = -1;
  const cols = verbs.length > 8 ? 2 : 1;
  const rows = Math.ceil(verbs.length / cols);
  const rowH = Math.min(92, 820 / rows);
  const fs = Math.min(50, rowH * 0.56);
  const colW = cols === 1 ? 1100 : 820;
  return (
    <Full tint={g.color}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 44, textAlign: 'center' }}>
        <Title color={g.color} size={56}>Mahnı kimi təkrar: {groupLabel(g)}</Title>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.mute, marginTop: 6 }}>Sən də ucadan de!</div>
      </div>
      <div style={{ position: 'absolute', top: 190, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60 }}>
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} style={{ width: colW }}>
            {verbs.slice(c * rows, (c + 1) * rows).map((v, r) => {
              const i = c * rows + r;
              const on = i === active;
              const done = active > i || frame >= cues.end;
              return (
                <div key={v.n} style={{ height: rowH - 8, marginBottom: 8, borderRadius: rowH / 3, display: 'flex', alignItems: 'center',
                  padding: '0 30px', background: on ? g.color : done ? g.soft : 'rgba(255,255,255,0.75)', color: on ? '#fff' : C.ink,
                  transform: `scale(${on ? 1.03 : 1})`, fontSize: fs, fontWeight: 800, gap: 16 }}>
                  <span style={{ width: fs * 1.4, fontSize: fs * 0.6, opacity: 0.6 }}>{v.n}</span>
                  <span style={{ flex: 1 }}>{v.f.join('  –  ')}</span>
                  <span style={{ fontSize: fs * 0.55, fontWeight: 600, opacity: on ? 0.95 : 0.55 }}>{v.tr.split(' (')[0].split(',')[0]}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </Full>
  );
};

/* ------------------------------------------------------------------ Başlıq səhnəsi */
export const TitleCard: React.FC<P<{ title: string; sub: string; color: string }>> = ({ data }) => {
  const p = usePop(0, 11);
  return (
    <Full tint={data.color}>
      <Center>
        <div style={{ transform: `scale(${0.6 + 0.4 * p})`, opacity: p, textAlign: 'center' }}>
          <Title color={data.color} size={140}>{data.title}</Title>
          <div style={{ fontSize: 52, fontWeight: 700, color: C.mute, marginTop: 20 }}>{data.sub}</div>
        </div>
      </Center>
    </Full>
  );
};

/* ------------------------------------------------------------------ Geri sayım */
const Countdown: React.FC<{ from: number; reveal: number; color: string }> = ({ from, reveal, color }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame >= reveal) return null;
  const left = Math.ceil((reveal - frame) / 30);
  const frac = ((reveal - frame) % 30) / 30;
  return (
    <div style={{ position: 'absolute', right: 120, top: 90, width: 150, height: 150 }}>
      <svg width={150} height={150}>
        <circle cx={75} cy={75} r={64} fill="#fff" stroke="#e6e0f7" strokeWidth={12} />
        <circle cx={75} cy={75} r={64} fill="none" stroke={color} strokeWidth={12} strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 64 * (frac || 1)} 999`} transform="rotate(-90 75 75)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72,
        fontWeight: 800, color }}>{left}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ Test: düzgün formanı tap */
export const Quiz: React.FC<P<{ pre: string; opts: string[]; post: string; ans: number; i: number; n: number }>> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  const rev = frame >= cues.reveal;
  const rp = usePop(cues.reveal);
  const enter = usePop(0, 14);
  const fullP = useFade(cues.say, 10);
  return (
    <Full>
      <div style={{ position: 'absolute', left: 120, top: 90 }}>
        <Chip color={C.purple}>Sual {data.i + 1} / {data.n}</Chip>
        <div style={{ fontSize: 34, fontWeight: 700, color: C.mute, marginTop: 18 }}>Düzgün formanı tap</div>
      </div>
      <Countdown from={0} reveal={cues.reveal} color={C.purple} />
      <Center>
        <div style={{ opacity: enter, transform: `translateY(${(1 - enter) * 40}px)`, display: 'flex', alignItems: 'center',
          flexWrap: 'wrap', justifyContent: 'center', gap: 22, fontSize: 64, fontWeight: 800, maxWidth: 1700 }}>
          <span>{data.pre}</span>
          {data.opts.map((o, k) => {
            const good = k === data.ans;
            return (
              <span key={k} style={{ padding: '10px 32px', borderRadius: 24, border: `5px solid ${rev ? (good ? C.green : '#d8d2ea') : C.purple}`,
                background: rev && good ? C.green : '#fff', color: rev ? (good ? '#fff' : '#b8b2cc') : C.purple,
                textDecoration: rev && !good ? 'line-through' : 'none', transform: `scale(${rev && good ? 1 + 0.12 * rp : 1})` }}>
                {o}
              </span>
            );
          })}
          <span>{data.post}</span>
        </div>
        <div style={{ marginTop: 80, fontSize: 48, fontWeight: 700, color: C.green, opacity: fullP }}>
          ✓ {data.pre} {data.opts[data.ans]} {data.post}
        </div>
      </Center>
    </Full>
  );
};

/* ------------------------------------------------------------------ Test: hansı qrup? */
export const GroupQuiz: React.FC<P<{ verb: Verb; group: Group; i: number; n: number; groups?: Group[] }>> = ({ data, cues }) => {
  const frame = useCurrentFrame();
  const rev = frame >= cues.reveal;
  const rp = usePop(cues.reveal);
  const enter = usePop(0, 12);
  const formsP = useFade(cues.forms, 8);
  const G = [
    ['Üçü də eyni', '#2e9e5b'], ['Gedib geri qayıdan', '#e57f24'], ['Əkiz qardaşlar', '#2f7fe0'],
    ['i – a – u', '#9447d9'], ['Hamısı fərqli', '#e5484d'],
  ];
  return (
    <Full>
      <div style={{ position: 'absolute', left: 120, top: 90 }}>
        <Chip color={C.orange}>Hansı qrup? {data.i + 1} / {data.n}</Chip>
      </div>
      <Countdown from={cues.w} reveal={cues.reveal} color={C.orange} />
      <Center style={{ justifyContent: 'flex-start', paddingTop: 220 }}>
        <div style={{ fontSize: 170, fontWeight: 800, color: C.ink, transform: `scale(${0.6 + 0.4 * enter})` }}>{data.verb.f[0]}</div>
        <div style={{ fontSize: 54, fontWeight: 800, color: data.group.color, opacity: formsP, height: 70 }}>
          {data.verb.f.join(' – ')}
        </div>
      </Center>
      <div style={{ position: 'absolute', bottom: 120, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 26 }}>
        {G.map(([name, col], k) => {
          const good = k + 1 === data.group.n;
          return (
            <div key={k} style={{ width: 300, height: 190, borderRadius: 28, background: rev && good ? col : '#fff',
              border: `5px solid ${rev && !good ? '#e2dcef' : col}`, color: rev && good ? '#fff' : rev ? '#bdb7cf' : col,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              transform: `scale(${rev && good ? 1 + 0.1 * rp : 1})` }}>
              <div style={{ fontSize: 80, fontWeight: 800, lineHeight: 1 }}>{k + 1}</div>
              <div style={{ fontSize: 26, fontWeight: 700, marginTop: 10, textAlign: 'center' }}>{name}</div>
            </div>
          );
        })}
      </div>
    </Full>
  );
};

/* ------------------------------------------------------------------ Son */
export const Outro: React.FC<P<{}>> = ({ cues }) => {
  const frame = useCurrentFrame();
  const p = usePop(0, 9);
  return (
    <Full>
      {Array.from({ length: 18 }).map((_, i) => {
        const a = (i / 18) * Math.PI * 2 + frame / 120;
        const r = 1 + Math.sin(frame / 20 + i) * 0.04;
        return (
          <div key={i} style={{ position: 'absolute', left: 960 + Math.cos(a) * 900 * r - 20, top: 520 + Math.sin(a) * 470 * r - 26,
            fontSize: 44, color: [C.orange, C.green, C.pink, C.purple][i % 4], opacity: 0.6 * p }}>★</div>
        );
      })}
      <Center>
        <Title size={190} style={{ transform: `scale(${p})`, color: C.green }}>Afərin!</Title>
        <Pop at={cues.a} style={{ fontSize: 50, fontWeight: 800, marginTop: 40, color: C.purple }}>
          Sən artıq qaydasız feillərin ustasısan!
        </Pop>
        <Pop at={cues.b} style={{ fontSize: 40, fontWeight: 700, marginTop: 40, color: C.ink }}>
          Səhv etdiyin feilləri kartoçkaya yaz, sabah yenə təkrar et.
        </Pop>
        <Pop at={cues.c} style={{ marginTop: 50 }}>
          <Chip color={C.orange} style={{ fontSize: 44, padding: '18px 44px' }}>Hər gün 5 feil → 2–3 həftəyə hamısı!</Chip>
        </Pop>
      </Center>
    </Full>
  );
};

export const progress = (frame: number, total: number) => interpolate(frame, [0, total], [0, 1]);
