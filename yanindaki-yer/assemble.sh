#!/usr/bin/env bash
# «Yanındakı yer» — montaj (60 san, 1080×1920, 24 fps). Kliplər: clips/*.mp4 (bax SOURCES.md)
# Səslər: audio_src/ (dialoqlar ElevenLabs, qalanı synth_audio.py), altyazılar: make_subs.py
# Üz: nur.py (opencv-python-headless, scipy lazımdır)
set -euo pipefail
cd "$(dirname "$0")"
[ -f audio_src/music.wav ] || python3 synth_audio.py
[ -f subs/s1.png ] || python3 make_subs.py
mkdir -p out build

# 1) Video: hər klipdən kəsik (ad, başlanğıc, uzunluq) → 1080×1920, 24 fps
SEGS=(
 "c1 0 7.0"   "c2a 0.5 3.0" "c2b 0 2.3"  "c2c 0 2.7"
 "c3 0 8.0"   "c4a 0 5.0"   "c4b 0 5.0"
 "c5a 0 4.5"  "c5b 1.2 3.5" "c5c 0 2.0"
 "c6a 0 2.5"  "c6b 0 6.0"   "c7 0 8.0"
)
: > build/list.txt
for s in "${SEGS[@]}"; do
  read -r n ss d <<<"$s"
  pad=""; [ "$n" = c7 ] && pad=",tpad=stop_mode=clone:stop_duration=0.5" && d=8.5
  ffmpeg -v error -y -ss "$ss" -i "clips/$n.mp4" -t "$d" -an \
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=24,setsar=1$pad" \
    -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p "build/$n.mp4"
  echo "file '$n.mp4'" >> build/list.txt
done
# 1b) İmamın üzü: nur hər kadrda izlənib dəyirmi, tam örtüklü nurla örtülür (nur.py; X Y — ilk kadrda üzün yeri)
for s in "c1 556 870" "c2a 110 640" "c3 780 510" "c4b 300 230" "c5a 240 680" "c5b 230 660" "c7 550 880"; do
  read -r n x y <<<"$s"
  python3 nur.py "build/$n.mp4" "build/${n}_n.mp4" "$x" "$y" && mv "build/${n}_n.mp4" "build/$n.mp4"
done
ffmpeg -v error -y -f concat -safe 0 -i build/list.txt -c copy build/video_raw.mp4

# 2) Altyazılar + başlanğıc/son qaralma
ffmpeg -v error -y -i build/video_raw.mp4 \
  -loop 1 -i subs/title.png -loop 1 -i subs/s1.png -loop 1 -i subs/s2.png -loop 1 -i subs/s3.png \
  -loop 1 -i subs/s4.png -loop 1 -i subs/s5.png -filter_complex "\
[1]format=rgba,fade=in:st=0.6:d=0.8:alpha=1,fade=out:st=4.4:d=0.7:alpha=1[t];\
[2]format=rgba,fade=in:st=7.5:d=0.2:alpha=1,fade=out:st=9.5:d=0.3:alpha=1[a];\
[3]format=rgba,fade=in:st=12.9:d=0.2:alpha=1,fade=out:st=14.8:d=0.3:alpha=1[b];\
[4]format=rgba,fade=in:st=24.6:d=0.2:alpha=1,fade=out:st=26.9:d=0.3:alpha=1[c];\
[5]format=rgba,fade=in:st=37.6:d=0.15:alpha=1,fade=out:st=39.3:d=0.3:alpha=1[d];\
[6]format=rgba,fade=in:st=53.8:d=0.3:alpha=1,fade=out:st=57.6:d=0.5:alpha=1[e];\
[0][t]overlay=shortest=1[v1];[v1][a]overlay=shortest=1[v2];[v2][b]overlay=shortest=1[v3];\
[v3][c]overlay=shortest=1[v4];[v4][d]overlay=shortest=1[v5];[v5][e]overlay=shortest=1,\
fade=in:st=0:d=0.6,fade=out:st=58.3:d=1.7,format=yuv420p[v]" -map "[v]" -t 60 \
  -c:v libx264 -profile:v high -crf 18 -preset slow build/video.mp4

# 3) Səs: musiqi + mühit + effektlər + dialoqlar (vaxtlar saniyə ilə)
A=audio_src
ffmpeg -v error -y \
 -i $A/music.wav -i $A/ringback.wav -i $A/ringtone.wav -i $A/clock.wav -i $A/door.wav \
 -i $A/l0_tez.mp3 -i $A/l1_bagisla.mp3 -i $A/l2_qizim.mp3 -i $A/l3_baba.mp3 -i $A/l4_dua.mp3 \
 -filter_complex "\
[0]volume=0.6,afade=in:d=1.5[mus];\
[1]atrim=0:8,volume=0.9,adelay=15000|15000[rb];\
[2]atrim=0:9,afade=out:st=8.2:d=0.8,adelay=23000|23000[rt];\
[3]atrim=0:2.6,volume=1.2,adelay=35300|35300[clk];\
[4]volume=0.7,adelay=21250|21250[door];\
[5]aresample=48000,afftdn=nf=-45,volume=1.6,adelay=7600|7600[v0];\
[6]aresample=48000,afftdn=nf=-45,volume=1.3,adelay=13000|13000[v1];\
[7]aresample=48000,afftdn=nf=-45,volume=1.4,adelay=24800|24800[v2];\
[8]aresample=48000,afftdn=nf=-45,asetrate=60000,aresample=48000,atempo=0.85,volume=1.4,adelay=37700|37700[v3];\
[9]aresample=48000,afftdn=nf=-45,atempo=0.9,volume=1.2,aecho=0.8:0.6:60:0.15,adelay=54000|54000[v4];\
[mus][rb][rt][clk][door][v0][v1][v2][v3][v4]amix=inputs=10:normalize=0:duration=longest,\
atrim=0:60,afade=out:st=58.0:d=2,loudnorm=I=-15:TP=-1.5:LRA=11[a]" \
 -map "[a]" -ar 48000 -c:a aac -b:a 192k build/audio.m4a

# 4) Birləşdir
ffmpeg -v error -y -i build/video.mp4 -i build/audio.m4a -map 0:v -map 1:a -c copy -shortest -movflags +faststart out/yanindaki-yer.mp4
echo "Hazır: out/yanindaki-yer.mp4"
