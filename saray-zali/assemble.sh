#!/usr/bin/env bash
# «Saray zalı» — AI klipini 1920×1080, 24 fps formatına salır. Klip: clips/seedance.mp4 (bax SOURCES.md)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
ffmpeg -v error -y -i clips/seedance.mp4 -an \
  -vf "scale=1920:1080:flags=lanczos,fps=24,setsar=1" \
  -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -movflags +faststart \
  out/saray-zali.mp4
echo "Hazırdır: out/saray-zali.mp4"
