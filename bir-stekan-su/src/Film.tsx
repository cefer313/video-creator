import React from 'react';
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from 'remotion';
import { Cut, CUTS, TOTAL } from './shots';

const Shot: React.FC<{ cut: Cut }> = ({ cut }) => {
  const f = useCurrentFrame();
  const s = cut.push ? interpolate(f, [0, cut.len], cut.push, { extrapolateRight: 'clamp' }) : 1;
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <OffthreadVideo
        src={staticFile(`clips/${cut.clip}.mp4`)}
        startFrom={cut.from}
        playbackRate={cut.rate ?? 1}
        muted
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${s})` }}
      />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const f = useCurrentFrame();
  // Yumşaq açılış və son: ilk 10 kadr qaranlıqdan, son 14 kadr qaranlığa.
  const fade = Math.min(
    interpolate(f, [0, 10], [0, 1], { extrapolateRight: 'clamp' }),
    interpolate(f, [TOTAL - 14, TOTAL - 1], [1, 0], { extrapolateLeft: 'clamp' }),
  );
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {CUTS.map((c) => (
        <Sequence key={c.clip + c.at} from={c.at} durationInFrames={c.len}>
          <Shot cut={c} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: 1 - fade }} />
      <Audio src={staticFile('audio/soundtrack.wav')} />
    </AbsoluteFill>
  );
};
