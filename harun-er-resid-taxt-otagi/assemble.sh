#!/usr/bin/env bash
# «Harun ər-Rəşidin taxt otağı» — AI klipini 1920×1080, 24 fps formatına salır. Klip: clips/flux.mp4 (bax SOURCES.md)
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
ffmpeg -v error -y -i clips/flux.mp4 -an \
  -vf "scale=1920:1080:flags=lanczos,fps=24,setsar=1" \
  -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -movflags +faststart \
  out/harun-er-resid-taxt-otagi.mp4
echo "Hazırdır: out/harun-er-resid-taxt-otagi.mp4"
