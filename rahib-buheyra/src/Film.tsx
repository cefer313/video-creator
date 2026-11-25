import React from 'react';
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { Background } from './art/scenes';
import { SCENES, sceneFrames, TOTAL_FRAMES, type Scene } from './story';

const XF = 15; // keçid (crossfade) kadrları
const FONT = 'Montserrat, sans-serif';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

const Caption: React.FC<{ s: Scene; dur: number }> = ({ s, dur }) => {
  const f = useCurrentFrame();
  const a = interpolate(f, [XF, XF + 14, dur - 6, dur + 4], [0, 1, 1, 0], clamp);
  const y = interpolate(f, [XF, XF + 18], [30, 0], clamp);
  const len = s.text.length;
  const size = len > 95 ? 54 : len > 60 ? 60 : 68;
  return (
    <AbsoluteFill style={{ justifyContent: 'flex-end' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 820,
          background: 'linear-gradient(to bottom, rgba(10,6,4,0) 0%, rgba(10,6,4,0.72) 45%, rgba(10,6,4,0.85) 100%)',
          opacity: Math.min(1, a * 1.2),
        }}
      />
      <div style={{ position: 'relative', padding: '0 70px 210px', opacity: a, transform: `translateY(${y}px)` }}>
        {s.speaker && (
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: 44,
              color: '#f3c46b',
              letterSpacing: 1,
              marginBottom: 22,
              textShadow: '0 3px 12px rgba(0,0,0,0.8)',
            }}
          >
            {s.speaker}
          </div>
        )}
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: size,
            lineHeight: 1.28,
            color: '#fffaf0',
            textShadow: '0 4px 18px rgba(0,0,0,0.85)',
          }}
        >
          {s.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const TitleText: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [10, 40], [0, 1], clamp);
  const b = interpolate(f, [35, 65], [0, 1], clamp);
  const out = interpolate(f, [150, 170], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', paddingTop: 640, opacity: out }}>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 40, color: '#f3c46b', letterSpacing: 8, opacity: a }}>
        PEYĞƏMBƏRİN (S) UŞAQLIĞINDAN
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 104,
          lineHeight: 1.08,
          color: '#fff8ea',
          textAlign: 'center',
          marginTop: 30,
          opacity: a,
          transform: `scale(${interpolate(f, [10, 60], [0.94, 1], clamp)})`,
          textShadow: '0 6px 30px rgba(0,0,0,0.7)',
        }}
      >
        Rahib
        <br />
        Buheyranın
        <br />
        əhvalatı
      </div>
      <div style={{ width: 160, height: 4, background: '#f3c46b', marginTop: 40, opacity: b }} />
    </AbsoluteFill>
  );
};

const EndText: React.FC = () => {
  const f = useCurrentFrame();
  const a = interpolate(f, [XF + 5, XF + 30], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', padding: 90, opacity: a }}>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 70, color: '#fff8ea', textAlign: 'center', lineHeight: 1.2 }}>
        «Bu uşaq böyük işlər görəcək.»
      </div>
      <div style={{ width: 140, height: 4, background: '#f3c46b', margin: '50px 0' }} />
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 36, color: '#e8dcc6', textAlign: 'center', lineHeight: 1.45 }}>
        Mənbə: Dərs 3 — «Rahib Buheyranın əhvalatı»
        <br />
        Təsvirlər bədiidir. Peyğəmbər (s) nur ilə işarə olunub.
      </div>
    </AbsoluteFill>
  );
};

const SceneView: React.FC<{ s: Scene; k: number; dur: number; first: boolean }> = ({ s, k, dur, first }) => {
  const f = useCurrentFrame();
  const fadeIn = first ? interpolate(f, [0, 20], [0, 1], clamp) : interpolate(f, [0, XF], [0, 1], clamp);
  const zoom = interpolate(f, [0, dur + XF], [1, 1.06]);
  return (
    <AbsoluteFill style={{ opacity: fadeIn, backgroundColor: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <Background bg={s.bg} f={f} dur={dur} k={k} />
      </AbsoluteFill>
      {s.bg === 'title' && <TitleText />}
      {s.bg === 'end' && <EndText />}
      {s.text && <Caption s={s} dur={dur} />}
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  let start = 0;
  const seqs = SCENES.map((s, k) => {
    const dur = sceneFrames(s);
    const from = k === 0 ? 0 : start - XF;
    const len = k === 0 ? dur : dur + XF;
    start += dur;
    return (
      <Sequence key={k} from={from} durationInFrames={len} layout="none">
        <SceneView s={s} k={k} dur={len} first={k === 0} />
      </Sequence>
    );
  });
  const endFade = interpolate(frame, [TOTAL_FRAMES - 24, TOTAL_FRAMES - 1], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      <AbsoluteFill style={{ opacity: endFade }}>{seqs}</AbsoluteFill>
      <Audio src={staticFile('music.wav')} />
    </AbsoluteFill>
  );
};
