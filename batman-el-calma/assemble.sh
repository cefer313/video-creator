#!/usr/bin/env bash
# Montaj: klapa qədər orijinal video + klapdan sonra Batman geyimli AI hissəsi.
# İstifadə: ./assemble.sh <orijinal.MOV> <ai_hisse.mp4>
# AI hissəsinin linki SOURCES.md-dədir.
set -euo pipefail
SRC="$1"; AI="$2"
CUT=4.40   # klap anı (səs zirvəsi ~4.35 san)
cd "$(dirname "$0")"
mkdir -p out
ffmpeg -y -i "$SRC" -i "$AI" -filter_complex "
[0:v]trim=0:${CUT},setpts=PTS-STARTPTS,fps=30,scale=1080:1920:flags=lanczos,setsar=1[a];
[1:v]fps=30,scale=1080:1920:flags=lanczos,setsar=1,setpts=PTS-STARTPTS[b0];
[b0]trim=0:5.2,setpts=PTS-STARTPTS[b];
[a][b]concat=n=2:v=1:a=0,
 geq=lum='lum(X,Y)+255*0.9*max(0,1-abs(T-${CUT})/0.12)':cb='cb(X,Y)':cr='cr(X,Y)'[v];
[0:a]loudnorm=I=-15:TP=-1.5:LRA=11[aud]" \
 -map "[v]" -map "[aud]" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
 -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart out/batman-el-calma.mp4
