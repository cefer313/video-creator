// Hər sətrin ortasından (və verilən əlavə kadrlardan) yoxlama kadrı: out/stills/<kadr>.jpg
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const tl = JSON.parse(fs.readFileSync(path.join(root, 'src/timeline.json'), 'utf8'));
let frames = process.argv.slice(2).map(Number);
if (!frames.length) frames = tl.lines.map((l) => Math.round((l.voiceAt + l.end) / 2));
const browser = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell-'))[0];
const exe = `/opt/pw-browsers/${browser}/chrome-headless-shell-linux64/chrome-headless-shell`;
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const comp = await selectComposition({ serveUrl, id: 'Behlul', browserExecutable: exe });
fs.mkdirSync(path.join(root, 'out/stills'), { recursive: true });
for (const fr of frames) {
  await renderStill({ serveUrl, composition: comp, frame: fr, output: path.join(root, `out/stills/${String(fr).padStart(4, '0')}.jpg`), imageFormat: 'jpeg', browserExecutable: exe, scale: 0.5 });
  console.log('kadr', fr);
}
