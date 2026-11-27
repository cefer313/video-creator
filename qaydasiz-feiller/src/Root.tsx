import React from 'react';
import { Composition } from 'remotion';
import '@fontsource/montserrat/latin-600.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-800.css';
import '@fontsource/montserrat/latin-ext-600.css';
import '@fontsource/montserrat/latin-ext-700.css';
import '@fontsource/montserrat/latin-ext-800.css';
import '@fontsource/inter/greek-600.css';
import '@fontsource/inter/latin-600.css';
import '@fontsource/inter/latin-ext-600.css';
import { Lesson } from './Lesson';
import tl from './timeline.json';

export const RemotionRoot: React.FC = () => (
  <Composition id="QaydasizFeiller" component={Lesson} durationInFrames={tl.total} fps={tl.fps} width={1920} height={1080} />
);
