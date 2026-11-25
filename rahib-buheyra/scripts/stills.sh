#!/usr/bin/env bash
# Hər səhnənin ortasından bir kadr çıxarır (yoxlama üçün): out/stills/
set -e
cd "$(dirname "$0")/.."
mkdir -p out/stills
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
FR=$(node -e "
const s=require('fs').readFileSync('src/story.ts','utf8');const a=[...s.matchAll(/sec:\s*([0-9.]+)/g)].map(m=>Math.round(+m[1]*30));
let t=0,o=[];for(const d of a){o.push(t+Math.round(d*0.6));t+=d}console.log(o.join(' '))")
i=0
for f in $FR; do
  npx remotion still src/index.ts Buheyra out/stills/s$(printf %02d $i).jpg --frame=$f --scale=0.4 --browser-executable="$B" --log=error
  i=$((i+1))
done
