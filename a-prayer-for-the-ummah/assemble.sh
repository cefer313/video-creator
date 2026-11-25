#!/usr/bin/env bash
# "A Prayer for the Ummah" — 30 san, 1920x1080, 24 fps montajı
set -euo pipefail
cd "$(dirname "$0")"
# Kliplər clips/ qovluğunda, səslər audio_src/ qovluğunda olmalıdır (bax SOURCES.md)
V=${VOICE:-audio_src/voiceB.mp3}

ffmpeg -v error -y \
  -i clips/c1.mp4 -i clips/c2.mp4 -i clips/c3.mp4 -i clips/c4.mp4 -i clips/c5.mp4 -i clips/c6.mp4 \
  -i audio_src/sfx_amb.mp3 -i audio_src/sfx_paper.mp3 -i audio_src/sfx_coins.mp3 -i audio_src/sfx_steps.mp3 -i audio_src/sfx_cloth.mp3 -i "$V" \
  -filter_complex "\
[0:v]trim=duration=4,setpts=PTS-STARTPTS,scale=1920:1080:flags=lanczos,fps=24,setsar=1[v1];\
[1:v]trim=duration=6,setpts=PTS-STARTPTS,scale=1920:1080:flags=lanczos,fps=24,setsar=1[v2];\
[2:v]trim=duration=4,setpts=PTS-STARTPTS,scale=1920:1080:flags=lanczos,fps=24,setsar=1[v3];\
[3:v]trim=duration=6,setpts=PTS-STARTPTS,scale=1920:1080:flags=lanczos,fps=24,setsar=1[v4];\
[4:v]trim=duration=4,setpts=PTS-STARTPTS,scale=1920:1080:flags=lanczos,fps=24,setsar=1[v5];\
[5:v]trim=duration=6,setpts=PTS-STARTPTS,fps=24,scale=w='trunc(1920*(1.08-0.08*t/6)/2)*2':h='trunc(1080*(1.08-0.08*t/6)/2)*2':eval=frame:flags=lanczos,crop=1920:1080,setsar=1[v6];\
[v1][v2][v3][v4][v5][v6]concat=n=6:v=1:a=0,fade=out:st=29.3:d=0.7,format=yuv420p[v];\
[6:a]aresample=48000,asplit=2[a0][a1];[a0][a1]acrossfade=d=1.5[ambl];\
[ambl]atrim=0:30,volume='if(lt(t,14),0.55,if(lt(t,20),0.55-(t-14)*0.065,0.16))':eval=frame[amb];\
[7:a]aresample=48000,adelay=6000|6000,volume=0.9[paper];\
[8:a]aresample=48000,adelay=8200|8200,volume=0.9[coins];\
[9:a]aresample=48000,adelay=10500|10500,volume=0.8[steps];\
[10:a]aresample=48000,adelay=20200|20200,volume=0.7[cloth];\
[11:a]aresample=48000,atempo=0.85,aecho=0.8:0.55:45|80:0.12|0.08,adelay=24050|24050,volume=1.6[voice];\
[amb][paper][coins][steps][cloth][voice]amix=inputs=6:normalize=0:duration=longest,atrim=0:30,afade=out:st=29.3:d=0.7,loudnorm=I=-16:TP=-1.5:LRA=11[a]" \
  -map "[v]" -map "[a]" -t 30 -r 24 \
  -c:v libx264 -profile:v high -crf 17 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart out/a-prayer-for-the-ummah.mp4

ffprobe -v error -show_entries format=duration -show_entries stream=codec_name,width,height,r_frame_rate -of default=nw=1 out/a-prayer-for-the-ummah.mp4
