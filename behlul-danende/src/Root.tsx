import React from 'react';
import { Composition } from 'remotion';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import { Film } from './Film';
import { FPS, TOTAL } from './timeline';

export const RemotionRoot: React.FC = () => (
  <Composition id="Behlul" component={Film} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
);
