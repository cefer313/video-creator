import React from 'react';
import { Composition } from 'remotion';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import { Film } from './Film';
import { FPS, TOTAL_FRAMES } from './story';

export const RemotionRoot: React.FC = () => (
  <Composition id="Buheyra" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
