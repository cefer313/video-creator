// Yoxlama üçün kadrlar: hər səhnənin sonundan (və ya verilən kadrlardan) JPG çıxarır -> out/check/
// İstifadə: node scripts/stills.mjs [all|<növ,növ>] 
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const tl = JSON.parse(fs.readFileSync(path.join(root, 'src/timeline.json'), 'utf8'));
const browser = fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium_headless_shell-'))
  .map((d) => `/opt/pw-browsers/${d}/chrome-headless-shell-linux64/chrome-headless-shell`)[0];
const which = process.argv[2] || 'sample';
const out = path.join(root, 'out/check');
fs.mkdirSync(out, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts'), publicDir: path.join(root, 'public') });
const comp = await selectComposition({ serveUrl, id: 'QaydasizFeiller', browserExecutable: browser });
const seen = {};
const jobs = [];
tl.scenes.forEach((s, i) => {
  seen[s.type] = (seen[s.type] || 0) + 1;
  const take = which === 'all' || (which === 'sample' ? seen[s.type] <= 2 || [8, 14, 37, 40, 45, 49, 66].includes(s.data?.verb?.n) : which.split(',').includes(s.type));
  if (!take) return;
  const f = s.from + s.dur - 6;
  jobs.push([`${String(i).padStart(3, '0')}-${s.type}${s.data?.verb ? '-' + s.data.verb.f[0] : ''}.jpg`, f]);
});
for (const [name, frame] of jobs) {
  await renderStill({ composition: comp, serveUrl, frame, output: path.join(out, name), browserExecutable: browser,
    imageFormat: 'jpeg', jpegQuality: 80, scale: 0.5 });
  console.log(name);
}
