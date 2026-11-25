import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  Easing,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { SCENES, sceneFrames, hasVoice, voiceDur, TOTAL_FRAMES, FPS, type Scene } from './story';
import { VIS, type Visual } from './visuals';

const XF = 15; // keçid (crossfade) kadrları
const VOICE_AT = XF + 8; // səs səhnə daxilində bu kadrda başlayır
const CLIP_SEC = 5;
const FONT = 'Montserrat, sans-serif';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = Easing.bezier(0.45, 0, 0.55, 1);

// ---------- deterministik toz hissəcikləri ----------
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const Dust: React.FC<{ f: number; seed: number }> = ({ f, seed }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      {Array.from({ length: 46 }).map((_, i) => {
        const j = i + seed * 100;
        const sp = 0.25 + rnd(j + 3) * 0.7;
        const x = (rnd(j) * 1180 + f * sp * 0.9 + Math.sin(f * 0.02 + j) * 30) % 1180 - 50;
        const y = (rnd(j + 7) * 1920 - f * sp * 0.6 + 1920 * 2) % 1920;
        const r = 1.2 + rnd(j + 11) * 3.2;
        const o = (0.25 + 0.5 * rnd(j + 13)) * (0.6 + 0.4 * Math.sin(f * 0.05 + j));
        return <circle key={i} cx={x} cy={y} r={r} fill="#ffe2a8" opacity={o} />;
      })}
    </svg>
  </AbsoluteFill>
);

// ---------- Nur: Peyğəmbərin (s) başı ətrafında yumşaq isti işıq (heç bir cizgi yox) ----------
const Nur: React.FC<{ v: NonNullable<Visual['nur']>; f: number }> = ({ v, f }) => {
  const [x, y, r] = v;
  const p = 1 + 0.06 * Math.sin(f * 0.06);
  const R = r * 1080 * p;
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: R * 2,
        height: R * 2,
        marginLeft: -R,
        marginTop: -R,
        borderRadius: '50%',
        background:
          'radial-gradient(circle, rgba(255,252,238,0.85) 0%, rgba(255,238,190,0.55) 22%, rgba(255,214,140,0.22) 48%, rgba(255,200,120,0) 70%)',
        mixBlendMode: 'screen',
      }}
    />
  );
};

// ---------- kadr (şəkil və ya klip) + kamera hərəkəti ----------
const Shot: React.FC<{ v: Visual; f: number; len: number }> = ({ v, f, len }) => {
  const t = interpolate(f, [0, len], [0, 1], { ...clamp, easing: ease });
  const [a, b] = v.kb;
  const s = a[0] + (b[0] - a[0]) * t;
  const cx = a[1] + (b[1] - a[1]) * t;
  const cy = a[2] + (b[2] - a[2]) * t;
  // mərkəzi (cx, cy) nöqtəsi ekranın ortasında qalsın, kənarlar görünməsin
  const tx = Math.max(Math.min((0.5 - cx) * s * 1080, ((s - 1) / 2) * 1080), (-(s - 1) / 2) * 1080);
  const ty = Math.max(Math.min((0.5 - cy) * s * 1920, ((s - 1) / 2) * 1920), (-(s - 1) / 2) * 1920);
  const clipFrames = Math.round(CLIP_SEC * FPS);
  const rate = v.clip ? Math.max(0.62, Math.min(1, clipFrames / len)) : 1;
  const clipEnd = Math.floor(clipFrames / rate) - 2;
  return (
    <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${s})` }}>
      {v.clip && f < clipEnd ? (
        <OffthreadVideo src={staticFile(`clips/${v.clip}.mp4`)} playbackRate={rate} muted style={{ width: 1080, height: 1920, objectFit: 'cover' }} />
      ) : (
        <Img
          src={staticFile(v.clip ? `clips/${v.clip}_last.png` : `img/${v.img}.png`)}
          style={{ width: 1080, height: 1920, objectFit: 'cover' }}
        />
      )}
      {v.nur && <Nur v={v.nur} f={f} />}
    </AbsoluteFill>
  );
};

// ---------- karaoke altyazı ----------
const Karaoke: React.FC<{ s: Scene; k: number; len: number }> = ({ s, k, len }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [XF - 4, XF + 8, len - 8, len + 2], [0, 1, 1, 0], clamp);
  const y = interpolate(f, [XF - 4, XF + 12], [24, 0], clamp);
  const words = s.text.split(' ');
  const vd = voiceDur(k) * FPS;
  const w = words.map((x) => x.length + 2);
  const tot = w.reduce((p, c) => p + c, 0);
  const el = vd > 0 ? (f - VOICE_AT) / vd : 1;
  let acc = 0;
  const bounds = w.map((x) => {
    const st = acc / tot;
    acc += x;
    return [st, acc / tot];
  });
  const len_ = s.text.length;
  const size = len_ > 100 ? 54 : len_ > 70 ? 60 : len_ > 40 ? 66 : 74;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 900,
          background: 'linear-gradient(to bottom, rgba(12,6,2,0) 0%, rgba(12,6,2,0.55) 40%, rgba(12,6,2,0.78) 100%)',
          opacity: a,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 60,
          bottom: 300,
          textAlign: 'center',
          opacity: a,
          transform: `translateY(${y}px)`,
        }}
      >
        {s.speaker && (
          <div
            style={{
              display: 'inline-block',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 38,
              color: '#2a1606',
              background: 'linear-gradient(90deg,#f7c75c,#f0a93a)',
              padding: '8px 26px',
              borderRadius: 40,
              marginBottom: 26,
              letterSpacing: 1,
            }}
          >
            {s.speaker}
          </div>
        )}
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, lineHeight: 1.3 }}>
          {words.map((wd, i) => {
            const [st, en] = bounds[i];
            const state = el >= en ? 'past' : el >= st ? 'now' : 'future';
            const pop = 1;
            return (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: '0.28em',
                  color: state === 'now' ? '#ffc93d' : '#fffaf0',
                  opacity: state === 'future' ? 0.62 : 1,
                  transform: `scale(${pop})`,
                  textShadow: '0 4px 16px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,0.9)',
                }}
              >
                {wd}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TitleText: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [12, 40], [0, 1], clamp);
  const out = interpolate(f, [len - 20, len], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 380, opacity: a * out }}>
      <AbsoluteFill style={{ background: 'linear-gradient(to bottom, rgba(5,5,20,0) 45%, rgba(5,5,20,0.75) 100%)' }} />
      <div style={{ position: 'relative', fontFamily: FONT, fontWeight: 600, fontSize: 36, color: '#f3c46b', letterSpacing: 7 }}>
        PEYĞƏMBƏRİN (S) UŞAQLIĞINDAN
      </div>
      <div
        style={{
          position: 'relative',
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 100,
          lineHeight: 1.08,
          color: '#fff8ea',
          textAlign: 'center',
          marginTop: 24,
          transform: `scale(${interpolate(f, [12, 70], [0.94, 1], clamp)})`,
          textShadow: '0 6px 30px rgba(0,0,0,0.8)',
        }}
      >
        Rahib Buheyranın
        <br />
        <span style={{ color: '#ffc93d' }}>əhvalatı</span>
      </div>
    </AbsoluteFill>
  );
};

const EndText: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [XF + 5, XF + 30], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 90, opacity: a, background: 'rgba(8,6,16,0.55)' }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 72, color: '#fff8ea', textAlign: 'center', lineHeight: 1.2, textShadow: '0 4px 20px #000' }}>
        «Bu uşaq böyük
        <br />
        <span style={{ color: '#ffc93d' }}>işlər görəcək.»</span>
      </div>
      <div style={{ width: 140, height: 4, background: '#f3c46b', margin: '50px 0' }} />
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 34, color: '#eadfca', textAlign: 'center', lineHeight: 1.5 }}>
        Mənbə: Dərs 3 — «Rahib Buheyranın əhvalatı»
        <br />
        Təsvirlər bədiidir. Peyğəmbərin (s) üzü göstərilmir.
      </div>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: Scene; k: number; len: number; first: boolean }> = ({ s, k, len, first }) => {
  const f = useCurrentFrame();
  const fadeIn = interpolate(f, [0, first ? 20 : XF], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: fadeIn, backgroundColor: '#000', overflow: 'hidden' }}>
      <Shot v={VIS[k]} f={f} len={len} />
      {/* isti rəng və vinyet */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)' }} />
      <Dust f={f} seed={k} />
      {s.bg === 'title' && <TitleText len={len} />}
      {s.bg === 'end' && <EndText />}
      {s.text && <Karaoke s={s} k={k} len={len} />}
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  let start = 0;
  const seqs = SCENES.map((s, k) => {
    const dur = sceneFrames(k);
    const from = k === 0 ? 0 : start - XF;
    const len = k === 0 ? dur : dur + XF;
    start += dur;
    return (
      <Sequence key={k} from={from} durationInFrames={len} layout="none">
        <SceneView s={s} k={k} len={len} first={k === 0} />
        {hasVoice(k) && (
          <Sequence from={k === 0 ? 40 : VOICE_AT} layout="none">
            <Audio src={staticFile(`voice/v${String(k).padStart(2, '0')}.mp3`)} />
          </Sequence>
        )}
      </Sequence>
    );
  });
  const endFade = interpolate(frame, [TOTAL_FRAMES - 24, TOTAL_FRAMES - 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill style={{ opacity: endFade }}>{seqs}</AbsoluteFill>
      <Audio src={staticFile('music.wav')} volume={0.28} />
    </AbsoluteFill>
  );
};
