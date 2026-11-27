import React from 'react';
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { World } from './three/World';
import { stageAt, type Mode } from './acting';
import { TL } from './timeline';
import { useFontsReady } from './useFonts';
import { easeInOut } from './anim';
import { Captions, EndCard, Explain, Grain, Hook, PhoneInsert, RewindFx, RightLabel, WrongStamp } from './ui';

const Canvas3D: React.FC<{ mode: Mode; f: number; fontsReady: boolean }> = ({ mode, f, fontsReady }) => {
  const stage = stageAt(mode, f);
  return (
    <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ fov: 36, position: [0, 1, 4] }}>
      <World stage={stage} frame={f} fontsReady={fontsReady} showSeedsOffer={mode === 'correct' && f > TL.events.endCard + 28} />
    </ThreeCanvas>
  );
};

/** Sadəcə 3D səhnə (yoxlama və izah hissəsinin fonu üçün donmuş kadr). */
export const Scene3D: React.FC = () => {
  const frame = useCurrentFrame();
  const fontsReady = useFontsReady();
  const mode: Mode = frame >= TL.parts.rewind[1] ? 'correct' : 'wrong';
  const f = mode === 'wrong' ? Math.min(frame, TL.parts.wrong[1] - 1) : frame;
  return (
    <AbsoluteFill style={{ backgroundColor: '#bcd7ee' }}>
      <Canvas3D mode={mode} f={f} fontsReady={fontsReady} />
    </AbsoluteFill>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const fontsReady = useFontsReady();
  const { wrong, explain, rewind } = TL.parts;
  let three: React.ReactNode = null;
  if (frame < wrong[1]) three = <Canvas3D key="w" mode="wrong" f={frame} fontsReady={fontsReady} />;
  else if (frame >= rewind[0] && frame < rewind[1]) {
    const t = (frame - rewind[0]) / (rewind[1] - rewind[0]);
    three = <Canvas3D key="r" mode="wrong" f={Math.round((wrong[1] - 1) * (1 - easeInOut(t)))} fontsReady={fontsReady} />;
  } else if (frame >= rewind[1]) three = <Canvas3D key="c" mode="correct" f={frame} fontsReady={fontsReady} />;
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b1016' }}>
      {three}
      {frame >= explain[0] && frame < rewind[0] ? <Img src={staticFile('freeze.jpg')} style={{ position: 'absolute', width: 1080, height: 1920 }} /> : null}
      {frame >= explain[0] && frame < rewind[0] ? null : <Grain f={frame} />}
      <Hook f={frame} />
      <Captions f={frame} />
      <PhoneInsert f={frame} />
      <WrongStamp f={frame} />
      <Explain f={frame} />
      <RewindFx f={frame} />
      <RightLabel f={frame} />
      <EndCard f={frame} />
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
