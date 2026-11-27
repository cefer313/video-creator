import { useEffect, useState } from 'react';
import { continueRender, delayRender } from 'remotion';

/** Kanvas teksturalarında (telefon ekranı) Montserrat şriftindən istifadə etmək üçün yüklənməsini gözləyir. */
export const useFontsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('Montserrat şrifti'));
  useEffect(() => {
    Promise.all(['600 22px Montserrat', '700 26px Montserrat', '800 40px Montserrat'].map((f) => document.fonts.load(f)))
      .catch(() => null)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  return ready;
};
