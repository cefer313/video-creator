#!/usr/bin/env bash
# Remotion çıxışını son formata salır: H.264 yuv420p (BT.709), +faststart, səs -15 LUFS.
# Ölçü GitHub limitinə (≤50 MB) uyğun saxlanılır: əsas ~2 Mbit/s, telefon ~1 Mbit/s.
set -e
cd "$(dirname "$0")/.."
ffmpeg -nostdin -y -loglevel error -i out/raw.mp4 -c:v libx264 -preset slow -b:v 1800k -maxrate 2600k -bufsize 5200k \
  -profile:v high -level 4.0 -pix_fmt yuv420p -color_range tv -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -af loudnorm=I=-15:TP=-1.5:LRA=11 -c:a aac -b:a 160k -ar 48000 -movflags +faststart out/rahib-buheyra.mp4
echo "out/rahib-buheyra.mp4 hazırdır"
# Telefonlar üçün yüngül versiya (Main profil, level 4.0)
ffmpeg -nostdin -y -loglevel error -i out/rahib-buheyra.mp4 -c:v libx264 -preset slow -b:v 1000k -maxrate 1500k -bufsize 3000k \
  -profile:v main -level 4.0 -pix_fmt yuv420p -c:a aac -b:a 128k -ar 44100 -movflags +faststart out/rahib-buheyra-telefon.mp4
echo "out/rahib-buheyra-telefon.mp4 hazırdır"
rm -f out/raw.mp4
