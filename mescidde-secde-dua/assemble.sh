#!/usr/bin/env bash
# Məsciddə səcdə — montaj (12,5 san, 1920×1080). Klip: clips/kling.mp4 (bax SOURCES.md)
set -euo pipefail
cd "$(dirname "$0")"
ffmpeg -v error -y -i clips/kling.mp4 -loop 1 -t 12.5 -i caption.png -i audio_src/dua.mp3 -i audio_src/ambient.wav -filter_complex "\
[0:v]scale=1920:1080:flags=lanczos,fps=30,tpad=stop_mode=clone:stop_duration=2.5,format=yuv420p[v0];\
[1:v]format=rgba,fade=in:st=6.1:d=0.8:alpha=1[cap];\
[v0][cap]overlay=0:0:shortest=1,fade=out:st=11.3:d=1.2[v];\
[2:a]adelay=6300|6300,aresample=48000[voice];\
[3:a]volume=0.35,atrim=0:12.5[amb];\
[amb][voice]amix=inputs=2:normalize=0,afade=out:st=11.2:d=1.3,loudnorm=I=-16:TP=-1.5[a]" -map "[v]" -map "[a]" -t 12.5 -c:v libx264 -profile:v high -crf 18 -preset slow -c:a aac -b:a 192k -movflags +faststart out/mescidde-secde-dua.mp4
