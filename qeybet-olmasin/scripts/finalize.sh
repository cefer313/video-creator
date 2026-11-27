#!/usr/bin/env bash
# Remotion çıxışını son formata salır: H.264 yuv420p (BT.709), +faststart, səs -15 LUFS.
set -e
cd "$(dirname "$0")/.."
ffmpeg -nostdin -y -loglevel error -i out/raw.mp4 -c:v libx264 -preset slow -b:v 3000k -maxrate 4500k -bufsize 9000k \
  -profile:v high -level 4.1 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af loudnorm=I=-15:TP=-1.5:LRA=11 -c:a aac -b:a 160k -ar 48000 -movflags +faststart out/qeybet-olmasin.mp4
rm -f out/raw.mp4
echo "out/qeybet-olmasin.mp4 hazırdır"
