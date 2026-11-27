import React from 'react';
import { Composition } from 'remotion';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import { Film, Scene3D } from './Film';
import { FPS, TL } from './timeline';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Qeybet" component={Film} durationInFrames={TL.total} fps={FPS} width={1080} height={1920} />
    {/* İzah hissəsinin fonu üçün donmuş kadr (yalnız 3D, yazısız): public/freeze.jpg */}
    <Composition id="Freeze" component={Scene3D} durationInFrames={TL.total} fps={FPS} width={1080} height={1920} />
  </>
);
