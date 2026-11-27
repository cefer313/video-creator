#!/usr/bin/env bash
# Videonu hissə-hissə render edir (kəsilsə, hazır hissələr qalır), sonra birləşdirib səsi əlavə edir və finalize edir.
set -e
cd "$(dirname "$0")/.."
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
TOTAL=$(node -e "console.log(require('./src/timeline.json').total)")
STEP=${STEP:-240}
mkdir -p out/chunks
[ -f public/freeze.jpg ] || bash scripts/freeze.sh
: > out/chunks/list.txt
for ((s=0; s<TOTAL; s+=STEP)); do
  e=$((s+STEP-1)); [ $e -ge $TOTAL ] && e=$((TOTAL-1))
  f=out/chunks/c$(printf %04d $s).mp4
  if [ ! -f "$f.done" ]; then
    echo "hissə $s-$e"
    npx remotion render src/index.ts Qeybet "$f" --frames=$s-$e --muted --codec=h264 --crf=16 --pixel-format=yuv420p \
      --gl=angle --concurrency=4 --browser-executable="$B" --log=error
    touch "$f.done"
  fi
  echo "file '$(basename "$f")'" >> out/chunks/list.txt
done
ffmpeg -nostdin -y -loglevel error -f concat -safe 0 -i out/chunks/list.txt -i public/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a aac -b:a 320k -shortest out/raw.mp4
bash scripts/finalize.sh
echo HAZIR
