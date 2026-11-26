import React from 'react';
import { Composition } from 'remotion';
import { Film } from './Film';
import { FPS, TOTAL } from './shots';

export const Root: React.FC = () => (
  <Composition id="BirStekanSu" component={Film} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
);
