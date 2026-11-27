import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import tl from './timeline.json';
import * as S from './scenes';
import { C } from './ui';

const MAP: Record<string, React.FC<any>> = {
  intro: S.Intro,
  ladder: S.Ladder,
  regular: S.Regular,
  tips: S.Tips,
  overview: S.Overview,
  group: S.GroupIntro,
  verb: S.VerbCard,
  review: S.Review,
  title: S.TitleCard,
  quiz: S.Quiz,
  gquiz: S.GroupQuiz,
  outro: S.Outro,
};

const Progress: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div style={{ position: 'absolute', left: 0, bottom: 0, height: 8, width: `${(frame / tl.total) * 100}%`,
      background: `linear-gradient(90deg, ${C.green}, ${C.orange}, ${C.pink}, ${C.purple})` }} />
  );
};

export const Lesson: React.FC = () => (
  <AbsoluteFill style={{ background: C.bg }}>
    {tl.scenes.map((s, i) => {
      const Comp = MAP[s.type];
      return (
        <Sequence key={i} from={s.from} durationInFrames={s.dur} name={`${s.type} ${i}`}>
          <Comp data={s.data} cues={s.cues} dur={s.dur} />
        </Sequence>
      );
    })}
    <Progress />
    <Audio src={staticFile('mix.wav')} />
  </AbsoluteFill>
);
