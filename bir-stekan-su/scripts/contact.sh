#!/usr/bin/env bash
# Klipdən kadr cədvəli: contact.sh klip.mp4 çıxış.jpg [kadr sayı]
n=${3:-8}; d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$1")
ffmpeg -v error -y -i "$1" -vf "fps=$n/$d,scale=480:-1,tile=4x$(( (n+3)/4 ))" -frames:v 1 "$2"
