#!/usr/bin/env bash
# Videonu hissə-hissə render edir (kəsilsə, hazır hissələr qalır), birləşdirir, səsi əlavə edib son formata salır.
set -e
cd "$(dirname "$0")/.."
B=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell | head -1)
TOTAL=$(node -e "console.log(require('./src/timeline.json').total)")
STEP=${STEP:-1800}
mkdir -p out/chunks
: > out/chunks/list.txt
for ((s=0; s<TOTAL; s+=STEP)); do
  e=$((s+STEP-1)); [ $e -ge $TOTAL ] && e=$((TOTAL-1))
  f=out/chunks/c$(printf %05d $s).mp4
  if [ ! -f "$f.done" ]; then
    echo "hissə $s-$e / $TOTAL"
    npx remotion render src/index.ts QaydasizFeiller "$f" --frames=$s-$e --muted --codec=h264 --crf=18 \
      --pixel-format=yuv420p --concurrency=${CONC:-4} --browser-executable="$B" --log=error
    touch "$f.done"
  fi
  echo "file '$(basename "$f")'" >> out/chunks/list.txt
done
ffmpeg -nostdin -y -loglevel error -f concat -safe 0 -i out/chunks/list.txt -i public/mix.wav -map 0:v -map 1:a \
  -c:v copy -c:a pcm_s16le -shortest out/raw.mkv
# Son format: H.264 yuv420p, +faststart, səs -15 LUFS. Qrafika sadə olduğu üçün CRF ilə kiçik fayl alınır.
ffmpeg -nostdin -y -loglevel error -i out/raw.mkv -c:v libx264 -preset slow -crf 24 -tune animation -maxrate 2500k -bufsize 5000k \
  -profile:v high -pix_fmt yuv420p -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af loudnorm=I=-15:TP=-1.5:LRA=11 -c:a aac -b:a 128k -ar 48000 -movflags +faststart out/qaydasiz-feiller.mp4
rm -f out/raw.mkv
echo "HAZIR: out/qaydasiz-feiller.mp4"
