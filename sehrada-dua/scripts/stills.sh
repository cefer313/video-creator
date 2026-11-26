#!/usr/bin/env bash
# Hər mərhələdən yoxlama kadrı: out/stills/
set -e
cd "$(dirname "$0")/.."
mkdir -p out/stills
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
for s in ${@:-1 4 7 11 13 14.8 16.5 18.9 20.5 22 24 25.5 27 29 31 32.5 33.8}; do
  f=$(python3 -c "print(round($s*30))")
  npx remotion still src/index.ts SehradaDua out/stills/t$s.jpg --frame=$f --scale=0.5 --browser-executable="$B" --log=error
done
