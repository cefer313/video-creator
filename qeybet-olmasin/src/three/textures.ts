// Brauzerdə kodla çəkilən teksturalar (deterministik): səki daşları, çinar qabığı, bina fasadı, telefon ekranı.
import * as THREE from 'three';
import { hash } from '../anim';

const tex = (c: HTMLCanvasElement, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.anisotropy = 8;
  return t;
};
const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
};

export const pavingTexture = () => {
  const [c, g] = canvas(1024, 1024);
  g.fillStyle = '#8f8576';
  g.fillRect(0, 0, 1024, 1024);
  const n = 8;
  const s = 1024 / n;
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const k = hash(i * 31 + j * 7);
      const l = 66 + k * 9;
      g.fillStyle = `hsl(${32 + k * 8}, ${14 + k * 6}%, ${l}%)`;
      g.fillRect(i * s + 4, j * s + 4, s - 8, s - 8);
      for (let d = 0; d < 26; d++) {
        const r = hash(i * 97 + j * 13 + d);
        g.fillStyle = `rgba(${r > 0.5 ? 255 : 60},${r > 0.5 ? 250 : 50},${r > 0.5 ? 240 : 40},0.05)`;
        g.beginPath();
        g.arc(i * s + hash(d * 3 + i) * s, j * s + hash(d * 5 + j) * s, 3 + r * 14, 0, Math.PI * 2);
        g.fill();
      }
    }
  return tex(c, 14, 14);
};

export const barkTexture = () => {
  const [c, g] = canvas(512, 1024);
  g.fillStyle = '#b9b095';
  g.fillRect(0, 0, 512, 1024);
  const cols = ['#8f8c74', '#d9d3bd', '#77775f', '#c6bd9c', '#a39d80'];
  for (let i = 0; i < 160; i++) {
    g.fillStyle = cols[i % cols.length];
    g.globalAlpha = 0.75;
    g.beginPath();
    g.ellipse(hash(i * 1.7) * 512, hash(i * 2.9) * 1024, 18 + hash(i * 4.1) * 46, 28 + hash(i * 5.3) * 70, hash(i) * 3, 0, Math.PI * 2);
    g.fill();
  }
  g.globalAlpha = 1;
  return tex(c, 1, 1);
};

/** Beşmərtəbəli binanın fasadı: pəncərə şəbəkəsi (sütun = 2,2 m, mərtəbə = 2,6 m). */
export const facadeTexture = (cols: number, rows: number) => {
  const W = cols * 176;
  const H = rows * 208;
  const [c, g] = canvas(W, H);
  g.fillStyle = '#e4d2b0';
  g.fillRect(0, 0, W, H);
  for (let i = 0; i < 900; i++) {
    g.fillStyle = hash(i) > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(120,90,50,0.05)';
    g.fillRect(hash(i * 1.3) * W, hash(i * 2.7) * H, 6 + hash(i * 3.1) * 30, 4 + hash(i * 4.3) * 18);
  }
  for (let r = 0; r < rows; r++) {
    g.fillStyle = 'rgba(150,120,85,0.35)';
    g.fillRect(0, r * 208 + 200, W, 8);
    for (let k = 0; k < cols; k++) {
      const x = k * 176 + 44;
      const y = r * 208 + 52;
      const w = 88;
      const h = 112;
      g.fillStyle = '#f4efe6';
      g.fillRect(x - 7, y - 7, w + 14, h + 14);
      const grd = g.createLinearGradient(x, y, x + w, y + h);
      const lit = hash(r * 17 + k * 5);
      grd.addColorStop(0, lit > 0.8 ? '#f3d9a2' : '#9db8d2');
      grd.addColorStop(1, lit > 0.8 ? '#c99c5c' : '#3e5068');
      g.fillStyle = grd;
      g.fillRect(x, y, w, h);
      if (hash(k * 3 + r * 11) > 0.55) {
        g.fillStyle = ['#e8c9c2', '#d8e3c9', '#f1e2b9', '#c9d6e6'][(k + r) % 4];
        g.fillRect(x, y, w * 0.32, h);
        g.fillRect(x + w * 0.68, y, w * 0.32, h);
      }
      g.fillStyle = '#f4efe6';
      g.fillRect(x + w / 2 - 3, y, 6, h);
      g.fillRect(x, y + h * 0.33, w, 5);
    }
  }
  return tex(c, 1, 1);
};

export type ScreenState = 'off' | 'chat' | 'incoming' | 'calling' | 'call';
export const phoneTexture = (state: ScreenState, pulse: number) => {
  const [c, g] = canvas(256, 540);
  const bg = g.createLinearGradient(0, 0, 0, 540);
  bg.addColorStop(0, state === 'off' ? '#05070a' : '#1d3b4f');
  bg.addColorStop(1, state === 'off' ? '#05070a' : '#0d1620');
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 540);
  if (state === 'off') return tex(c);
  g.textAlign = 'center';
  g.fillStyle = '#ffffff';
  if (state === 'chat') {
    g.font = '700 26px Montserrat';
    g.fillText('Samir', 128, 50);
    const bubble = (y: number, w: number, me: boolean) => {
      g.fillStyle = me ? '#2f8f6a' : '#3a4a5a';
      g.beginPath();
      g.roundRect(me ? 236 - w : 20, y, w, 52, 16);
      g.fill();
    };
    bubble(90, 150, false);
    bubble(160, 120, true);
    bubble(232, 190, false);
    g.fillStyle = '#ffffff';
    g.beginPath();
    g.arc(46, 258, 10, 0, Math.PI * 2);
    g.fill();
    for (let i = 0; i < 14; i++) g.fillRect(66 + i * 9, 258 - (6 + 14 * hash(i)), 4, 2 * (6 + 14 * hash(i)));
    return tex(c);
  }
  g.font = '600 22px Montserrat';
  g.fillStyle = '#b9d4e6';
  g.fillText(state === 'incoming' ? 'zəng edir...' : state === 'calling' ? 'zəng edilir...' : '00:0' + Math.floor(pulse * 9), 128, 200);
  g.fillStyle = '#ffffff';
  g.font = '800 40px Montserrat';
  g.fillText('Samir', 128, 160);
  g.fillStyle = '#5b7f99';
  g.beginPath();
  g.arc(128, 80, 40 + (state === 'incoming' ? 6 * pulse : 0), 0, Math.PI * 2);
  g.fill();
  g.fillStyle = '#ffffff';
  g.font = '800 42px Montserrat';
  g.fillText('S', 128, 95);
  if (state === 'incoming') {
    g.fillStyle = '#e0473c';
    g.beginPath();
    g.arc(64, 450, 30, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = '#2fbf5b';
    g.beginPath();
    g.arc(192, 450, 30 + 5 * pulse, 0, Math.PI * 2);
    g.fill();
  } else {
    g.fillStyle = '#e0473c';
    g.beginPath();
    g.arc(128, 450, 30, 0, Math.PI * 2);
    g.fill();
  }
  return tex(c);
};
