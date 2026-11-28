#!/usr/bin/env bash
# «Saray zalında oğlan» — AI klipini orijinal tempə qaytarır (Seedance klipi ~4% sürətli çıxıb),
# 1080×1920 Reels formatına salır və oğlanın öz səsini (orijinal videodan) qoyur.
# Lazımdır: clips/oglan.mp4 (bax SOURCES.md) və clips/IMG_8507.MOV (istifadəçinin orijinal videosu).
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p out
SRC=clips/IMG_8507.MOV
AI=clips/oglan.mp4
SD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$SRC")
AD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$AI")
K=$(python3 -c "print($SD/$AD)")
ffmpeg -v error -y -i "$AI" -i "$SRC" \
  -filter_complex "[0:v]setpts=PTS*${K},scale=1080:1920:flags=lanczos,fps=30,setsar=1[v];[1:a]loudnorm=I=-15:TP=-1.5:LRA=11,aresample=48000[a]" \
  -map "[v]" -map "[a]" -t "$SD" \
  -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart \
  out/saray-zali-oglan.mp4
echo "Hazırdır: out/saray-zali-oglan.mp4"
