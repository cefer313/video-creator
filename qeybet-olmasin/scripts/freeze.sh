#!/usr/bin/env bash
# İzah hissəsinin fonu: yanlış səhnənin son kadrı (yalnız 3D, yazısız) -> public/freeze.jpg
set -e
cd "$(dirname "$0")/.."
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
F=$(node -e "console.log(require('./src/timeline.json').events.freeze - 1)")
npx remotion still src/index.ts Freeze public/freeze.jpg --frame=$F --gl=angle --jpeg-quality=92 --browser-executable="$B" --log=error
