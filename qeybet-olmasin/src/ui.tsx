// Ekran qrafikası (2D): sual, altyazılar, zəng ekranı, "yanlış" işarəsi, izah kartları, ayə, mənbə, geri sarma, son kart.
import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile } from 'remotion';
import { L, TL, type Line } from './timeline';
import { clamp, easeOut, ramp } from './anim';

const FONT = 'Montserrat, sans-serif';
const C = { yellow: '#ffd23f', red: '#e5484d', green: '#2eb872', dark: '#11161d', white: '#ffffff', tural: '#e9742b', kenan: '#1f8a87' };
const FPS = TL.fps;
const sp = (f: number, at: number, damping = 13) => spring({ frame: f - at, fps: FPS, config: { damping, mass: 0.6 } });

const STROKE = '0 0 2px #000, 0 3px 0 #000, 0 -2px 0 #000, 3px 0 0 #000, -3px 0 0 #000, 2px 2px 0 #000, -2px 2px 0 #000, 2px -2px 0 #000, -2px -2px 0 #000, 0 8px 24px rgba(0,0,0,0.45)';

// ---------- 1. Sual ----------
export const Hook: React.FC<{ f: number }> = ({ f }) => {
  if (f > 96) return null;
  const s = sp(f, 0, 11);
  const out = 1 - ramp(f, 84, 96);
  return (
    <AbsoluteFill style={{ alignItems: 'center', top: 210, opacity: out }}>
      <div
        style={{
          transform: `scale(${0.6 + 0.4 * s}) rotate(-2deg)`,
          background: C.white,
          borderRadius: 34,
          padding: '34px 44px 38px',
          width: 900,
          boxShadow: '0 18px 50px rgba(0,0,0,0.35)',
          textAlign: 'center',
          fontFamily: FONT,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 62, color: C.dark, lineHeight: 1.15 }}>“Qeybət olmasın, amma...”</div>
        <div style={{ fontWeight: 800, fontSize: 66, color: C.dark, lineHeight: 1.2, marginTop: 14 }}>
          desən, <span style={{ background: C.yellow, padding: '0 14px', borderRadius: 12 }}>qeybət olmur?</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- 2. Altyazılar (söz-söz işıqlanır) ----------
const words = (l: Line) => {
  const ws = l.text.split(/\s+/);
  const weight = (w: string) => w.replace(/[^\p{L}\p{N}]/gu, '').length + (/[.!?…]$/.test(w) ? 5 : /[,—:]$/.test(w) ? 3 : 0) + 1;
  const tot = ws.reduce((a, w) => a + weight(w), 0);
  let acc = 0;
  return ws.map((w) => {
    const t0 = acc / tot;
    acc += weight(w);
    return { w, t0 };
  });
};
export const Captions: React.FC<{ f: number }> = ({ f }) => {
  const act = TL.lines.filter((x) => x.part !== 'explain' && x.part !== 'end' && f >= x.start - 2 && f < x.end + 8);
  const l = act.length ? act.reduce((a, b) => (b.start > a.start ? b : a)) : null;
  if (!l) return null;
  const prog = (f - l.start) / Math.max(1, l.end - l.start);
  const a = ramp(f, l.start - 2, l.start + 4) * (1 - ramp(f, l.end + 2, l.end + 8));
  const who = l.who === 'tural' ? 'TURAL' : 'KƏNAN';
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-start', alignItems: 'center', top: 1290, opacity: a }}>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 3,
          color: C.white,
          background: l.who === 'tural' ? C.tural : C.kenan,
          padding: '8px 20px',
          borderRadius: 999,
          marginBottom: 14,
          boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
        }}
      >
        {who}
      </div>
      <div style={{ width: 880, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 54, lineHeight: 1.22, color: C.white, textShadow: STROKE }}>
        {words(l).map(({ w, t0 }, i) => (
          <span key={i} style={{ opacity: prog >= t0 - 0.02 ? 1 : 0.5, color: prog >= t0 - 0.02 && prog < t0 + 0.12 ? C.yellow : C.white }}>
            {w}{' '}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ---------- zəng ekranı (yaxın plan əvəzinə) ----------
export const PhoneInsert: React.FC<{ f: number }> = ({ f }) => {
  const a0 = TL.events.ring[0] + 12;
  const a1 = L.t05.start - 2;
  if (f < a0 - 2 || f > a1 + 6) return null;
  const s = sp(f, a0, 12);
  const out = 1 - ramp(f, a1, a1 + 6);
  const jit = (f % 12 < 7 ? 1 : 0) * Math.sin(f * 2.7) * 9;
  const ring = ((f - a0) % 18) / 18;
  return (
    <AbsoluteFill style={{ background: `rgba(8,12,18,${0.45 * out})`, alignItems: 'center', justifyContent: 'center', opacity: out }}>
      <div style={{ position: 'relative', transform: `translateX(${jit}px) scale(${0.7 + 0.3 * s}) rotate(${jit * 0.25}deg)` }}>
        {[0, 1].map((k) => (
          <div
            key={k}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 560,
              height: 1040,
              marginLeft: -280,
              marginTop: -520,
              borderRadius: 90,
              border: `6px solid rgba(255,255,255,${0.5 * (1 - ((ring + k * 0.5) % 1))})`,
              transform: `scale(${1 + 0.25 * ((ring + k * 0.5) % 1)})`,
            }}
          />
        ))}
        <div style={{ width: 520, height: 1000, borderRadius: 78, background: '#0c0f13', padding: 18, boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: 62,
              background: 'linear-gradient(180deg,#24465d 0%,#0e1822 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontFamily: FONT,
              color: C.white,
            }}
          >
            <div style={{ marginTop: 150, width: 190, height: 190, borderRadius: 999, background: '#5b7f99', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, fontWeight: 800 }}>
              S
            </div>
            <div style={{ marginTop: 40, fontSize: 78, fontWeight: 800 }}>Samir</div>
            <div style={{ marginTop: 10, fontSize: 38, fontWeight: 600, color: '#b9d4e6' }}>zəng edir...</div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 150, marginBottom: 120 }}>
              <div style={{ width: 120, height: 120, borderRadius: 999, background: '#e0473c' }} />
              <div style={{ width: 120, height: 120, borderRadius: 999, background: '#2fbf5b', transform: `scale(${1 + 0.08 * Math.sin(f * 0.8)})` }} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- SVG ikonlar ----------
const Icon: React.FC<{ name: 'x' | 'check' | 'mic' | 'chat' | 'eye' | 'shield' | 'return' | 'bookmark' | 'send'; size: number; color: string }> = ({ name, size, color }) => {
  const p = { fill: 'none', stroke: color, strokeWidth: 9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const shapes: Record<string, React.ReactNode> = {
    x: (
      <>
        <path d="M22 22 L78 78" {...p} strokeWidth={16} />
        <path d="M78 22 L22 78" {...p} strokeWidth={16} />
      </>
    ),
    check: <path d="M18 54 L40 76 L82 26" {...p} strokeWidth={14} />,
    mic: (
      <>
        <rect x="36" y="12" width="28" height="48" rx="14" {...p} />
        <path d="M22 46 Q22 74 50 74 Q78 74 78 46 M50 74 L50 90 M34 90 L66 90" {...p} />
      </>
    ),
    chat: (
      <>
        <path d="M14 20 H86 V66 H44 L24 84 V66 H14 Z" {...p} />
        <path d="M30 38 H70 M30 52 H58" {...p} />
      </>
    ),
    eye: (
      <>
        <path d="M8 50 Q50 12 92 50 Q50 88 8 50 Z" {...p} />
        <circle cx="50" cy="50" r="13" {...p} />
        <path d="M30 18 L36 28 M50 10 L50 22 M70 18 L64 28" {...p} strokeWidth={7} />
      </>
    ),
    shield: (
      <>
        <path d="M50 10 L84 22 V48 Q84 76 50 90 Q16 76 16 48 V22 Z" {...p} />
        <path d="M34 50 L46 62 L68 38" {...p} />
      </>
    ),
    return: (
      <>
        <path d="M74 30 A30 30 0 1 0 80 56" {...p} />
        <path d="M76 12 L76 32 L56 32" {...p} />
      </>
    ),
    bookmark: <path d="M28 12 H72 V88 L50 70 L28 88 Z" {...p} />,
    send: <path d="M12 46 L88 14 L66 88 L48 58 Z M48 58 L88 14" {...p} />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {shapes[name]}
    </svg>
  );
};

// ---------- 3. Donma + "yanlış" ----------
export const WrongStamp: React.FC<{ f: number }> = ({ f }) => {
  const z = TL.events.freeze;
  if (f < z || f > z + 40) return null;
  const s = sp(f, z + 2, 9);
  const flash = 1 - ramp(f, z, z + 5);
  const out = 1 - ramp(f, z + 30, z + 40);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <AbsoluteFill style={{ background: `rgba(255,255,255,${0.75 * flash})` }} />
      <AbsoluteFill style={{ background: 'rgba(120,0,0,0.18)' }} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ transform: `scale(${s}) rotate(${(1 - s) * -30}deg)`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ width: 300, height: 300, borderRadius: 999, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.45)' }}>
            <Icon name="x" size={220} color={C.white} />
          </div>
          <div style={{ marginTop: 30, fontFamily: FONT, fontWeight: 800, fontSize: 64, color: C.white, textShadow: STROKE, letterSpacing: 2 }}>YANLIŞ ADƏT</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- 3. İzah ----------
const Card: React.FC<{ children: React.ReactNode; a: number; style?: React.CSSProperties }> = ({ children, a, style }) => (
  <div
    style={{
      opacity: a,
      transform: `translateY(${(1 - a) * 40}px)`,
      background: 'rgba(255,255,255,0.96)',
      color: C.dark,
      borderRadius: 34,
      padding: '34px 40px',
      width: 860,
      fontFamily: FONT,
      boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
      ...style,
    }}
  >
    {children}
  </div>
);
const at = (l: Line, frac: number) => l.start + Math.round((l.end - l.start) * frac);

export const Explain: React.FC<{ f: number }> = ({ f }) => {
  const [x0, x1] = TL.parts.explain;
  if (f < x0 || f >= x1 + 2) return null;
  const inA = ramp(f, x0 + 18, x0 + 30);
  const outA = 1 - ramp(f, x1 - 6, x1 + 2);
  const n01 = L.n01;
  const n02 = L.n02;
  const n03 = L.n03;
  const n04 = L.n04;
  const show = (l: Line, next?: Line) => ramp(f, l.start - 8, l.start + 4) * (next ? 1 - ramp(f, next.start - 10, next.start - 2) : 1);
  const z = (f - x0) / (x1 - x0);
  const chips = ['“Qeybət olmasın”', '“Həqiqətdir”', '“Üzünə də deyərəm”'];
  const tiles: [Parameters<typeof Icon>[0]['name'], string][] = [
    ['mic', 'Səsli mesaj'],
    ['chat', 'Yazışma'],
    ['eye', 'Göz-qaş işarəsi'],
  ];
  return (
    <AbsoluteFill style={{ opacity: outA }}>
      <AbsoluteFill style={{ opacity: inA }}>
        <Img src={staticFile('freeze.jpg')} style={{ width: 1080, height: 1920, transform: `scale(${1.06 + 0.06 * z})`, filter: 'blur(14px) saturate(0.7)' }} />
        <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(9,14,20,0.78) 0%, rgba(9,14,20,0.62) 50%, rgba(9,14,20,0.82) 100%)' }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', opacity: inA }}>
        {/* başlıq */}
        <div style={{ marginTop: 200, display: 'flex', alignItems: 'center', gap: 14, background: C.green, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 36, letterSpacing: 2, padding: '12px 30px 12px 18px', borderRadius: 999 }}>
          <Icon name="check" size={44} color={C.white} />
          DÜZGÜN VARİANT
        </div>
        {/* ayə */}
        <div style={{ marginTop: 34, width: 860, textAlign: 'center', fontFamily: FONT, color: C.white }}>
          <div style={{ fontWeight: 700, fontSize: 38, lineHeight: 1.35 }}>
            «...Bir-birinizin qeybətini etməyin. Sizdən biriniz ölmüş qardaşının ətini yeməyi sevərmi?»
          </div>
          <div style={{ marginTop: 12, fontWeight: 600, fontSize: 28, color: C.yellow }}>Hücurat surəsi, 12-ci ayə (mənası)</div>
        </div>
        {/* kartlar */}
        <div style={{ position: 'absolute', top: 640, width: 1080, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {show(n01, n02) > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: show(n01, n02) }}>
              <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 150, color: C.yellow, textShadow: STROKE, transform: `scale(${sp(f, n01.start, 9)})`, lineHeight: 1 }}>OLUR.</div>
              <Card a={ramp(f, at(n01, 0.12), at(n01, 0.12) + 8)} style={{ marginTop: 34 }}>
                <div style={{ fontWeight: 700, fontSize: 48, lineHeight: 1.3, textAlign: 'center' }}>
                  <b style={{ fontWeight: 800 }}>Qeybət</b> — mömin insanın <b style={{ fontWeight: 800 }}>gizli eybini</b> onun olmadığı yerdə danışmaqdır.
                </div>
                <div style={{ marginTop: 24, textAlign: 'center', opacity: ramp(f, at(n01, 0.8), at(n01, 0.8) + 6) }}>
                  <span style={{ fontWeight: 800, fontSize: 56, background: C.yellow, padding: '4px 20px', borderRadius: 14 }}>Doğru olsa belə.</span>
                </div>
              </Card>
            </div>
          ) : null}
          {show(n02, n03) > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: show(n02, n03) }}>
              {chips.map((c, i) => {
                const a = ramp(f, at(n02, 0.02 + i * 0.12), at(n02, 0.02 + i * 0.12) + 6);
                const strike = ramp(f, at(n02, 0.5 + i * 0.05), at(n02, 0.5 + i * 0.05) + 8);
                return (
                  <div key={c} style={{ position: 'relative', opacity: a, transform: `scale(${0.85 + 0.15 * a})`, background: 'rgba(255,255,255,0.95)', borderRadius: 999, padding: '18px 44px', fontFamily: FONT, fontWeight: 800, fontSize: 52, color: C.dark }}>
                    {c}
                    <div style={{ position: 'absolute', left: 24, right: 24, top: '50%', height: 10, marginTop: -5, background: C.red, borderRadius: 6, transformOrigin: 'left', transform: `scaleX(${strike}) rotate(-4deg)` }} />
                  </div>
                );
              })}
              <Card a={ramp(f, at(n02, 0.62), at(n02, 0.62) + 8)} style={{ marginTop: 18, textAlign: 'center' }}>
                <div style={{ fontWeight: 700, fontSize: 38, lineHeight: 1.3 }}>Ayətullah Sistaninin fətvasında bu üç bəhanə tək-tək sadalanıb:</div>
                <div style={{ marginTop: 14, fontWeight: 800, fontSize: 52, color: C.red }}>heç biri qeybəti caiz etmir.</div>
              </Card>
            </div>
          ) : null}
          {show(n03, n04) > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: show(n03, n04) }}>
              <div style={{ display: 'flex', gap: 26 }}>
                {tiles.map(([ic, label], i) => {
                  const a = sp(f, at(n03, 0.05 + i * 0.16), 11);
                  return (
                    <div key={label} style={{ width: 270, height: 300, borderRadius: 34, background: 'rgba(255,255,255,0.96)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `scale(${a})`, opacity: clamp(a * 2) }}>
                      <Icon name={ic} size={130} color={C.dark} />
                      <div style={{ marginTop: 18, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: C.dark, textAlign: 'center', lineHeight: 1.15, padding: '0 10px' }}>{label}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: 40, width: 860, textAlign: 'center', fontFamily: FONT, fontWeight: 800, fontSize: 54, color: C.white, textShadow: STROKE, opacity: ramp(f, at(n03, 0.62), at(n03, 0.62) + 8) }}>
                Bunlarla çatdırmaq da <span style={{ color: C.yellow }}>qeybətdir.</span>
              </div>
            </div>
          ) : null}
          {show(n04) > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: show(n04) }}>
              {([
                ['shield', 'Eşitdinsə', 'dostunu müdafiə et.', 0.0],
                ['return', 'Etmisənsə', 'tövbə et, onun üçün istiğfar et.', 0.42],
              ] as const).map(([ic, h, t, fr]) => (
                <Card key={h} a={ramp(f, at(n04, fr), at(n04, fr) + 8)} style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
                  <div style={{ flex: 'none', width: 150, height: 150, borderRadius: 999, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={ic} size={100} color={C.white} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 52, color: C.green }}>{h}</div>
                    <div style={{ fontWeight: 800, fontSize: 46, lineHeight: 1.2, marginTop: 6 }}>{t}</div>
                  </div>
                </Card>
              ))}
            </div>
          ) : null}
        </div>
        {/* mənbə */}
        <div style={{ position: 'absolute', top: 1450, width: 860, textAlign: 'center', fontFamily: FONT, fontWeight: 600, fontSize: 29, lineHeight: 1.35, color: 'rgba(255,255,255,0.9)' }}>
          Mənbə: Ayətullah Sistani, «Geniş izahlı şəriət məsələləri», I cild, məsələ 2264, 2266, 2269–2271
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- geri sarma ----------
export const RewindFx: React.FC<{ f: number }> = ({ f }) => {
  const [r0, r1] = TL.parts.rewind;
  if (f < r0 || f >= r1 + 4) return null;
  const band = ((f - r0) * 97) % 1920;
  const a = 1 - ramp(f, r1, r1 + 4);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <AbsoluteFill style={{ background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 2px, transparent 2px, transparent 6px)' }} />
      <AbsoluteFill style={{ background: 'rgba(40,60,120,0.12)', mixBlendMode: 'screen' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: band, height: 70, background: 'rgba(255,255,255,0.22)', filter: 'blur(6px)' }} />
      <div style={{ position: 'absolute', left: 70, top: 220, fontFamily: FONT, fontWeight: 800, fontSize: 92, color: C.white, textShadow: STROKE, opacity: f % 10 < 6 ? 1 : 0.35 }}>◀◀</div>
      <div style={{ position: 'absolute', left: 70, top: 330, fontFamily: FONT, fontWeight: 800, fontSize: 44, color: C.white, textShadow: STROKE, letterSpacing: 3 }}>GERİ</div>
    </AbsoluteFill>
  );
};

// ---------- 4. Düz variantın başlığı ----------
export const RightLabel: React.FC<{ f: number }> = ({ f }) => {
  const c0 = TL.parts.correct[0];
  if (f < c0 || f > c0 + 70) return null;
  const s = sp(f, c0 + 2, 12);
  const out = 1 - ramp(f, c0 + 58, c0 + 70);
  return (
    <AbsoluteFill style={{ alignItems: 'center', top: 220, opacity: out }}>
      <div style={{ transform: `scale(${s})`, display: 'flex', alignItems: 'center', gap: 14, background: C.green, color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 46, letterSpacing: 2, padding: '16px 38px 16px 22px', borderRadius: 999, boxShadow: '0 14px 36px rgba(0,0,0,0.3)' }}>
        <Icon name="check" size={56} color={C.white} />
        BELƏ OLMALIDIR
      </div>
    </AbsoluteFill>
  );
};

// ---------- 5. Son ----------
export const EndCard: React.FC<{ f: number }> = ({ f }) => {
  const e0 = TL.events.endCard;
  if (f < e0) return null;
  const s1 = sp(f, e0 + 4, 12);
  const s2 = sp(f, e0 + 12, 12);
  const s3 = sp(f, L.n05.start - 4, 11);
  const bob = Math.sin((f - e0) * 0.25) * 6;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(9,14,20,0.55) 0%, rgba(9,14,20,0) 42%, rgba(9,14,20,0) 70%, rgba(9,14,20,0.35) 100%)', opacity: ramp(f, e0, e0 + 10) }} />
      <AbsoluteFill style={{ alignItems: 'center', top: 250 }}>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 104, color: C.white, textShadow: STROKE, transform: `scale(${s1})`, lineHeight: 1.1 }}>Söhbəti dəyiş,</div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 104, color: C.yellow, textShadow: STROKE, transform: `scale(${s2})`, lineHeight: 1.1, marginTop: 6 }}>baxışını dəyiş.</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', top: 1330 }}>
        <div style={{ transform: `scale(${s3}) translateY(${bob}px)`, display: 'flex', alignItems: 'center', gap: 22, background: C.white, color: C.dark, fontFamily: FONT, fontWeight: 800, fontSize: 54, padding: '22px 44px', borderRadius: 999, boxShadow: '0 16px 40px rgba(0,0,0,0.35)' }}>
          <Icon name="bookmark" size={64} color={C.dark} />
          Save et və paylaş
          <Icon name="send" size={64} color={C.dark} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,${0.22 + 0.01 * Math.sin(f)}) 100%)` }} />
);

export { easeOut, interpolate };
