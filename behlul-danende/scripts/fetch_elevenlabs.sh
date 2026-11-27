#!/usr/bin/env bash
# ElevenLabs səslərini (Higgsfield, audio/elevenlabs_files.txt) endirir -> public/voice/lNN.wav (48 kHz mono, sükut kəsilmiş).
set -e
cd "$(dirname "$0")/.."
B=https://d8j0ntlcm91z4.cloudfront.net/user_3HqnT53CLO0uoILUhrKkx9491ks
mkdir -p public/voice audio/el
while read -r id job file; do
  [ -f "audio/el/$file" ] || curl -sf -o "audio/el/$file" "$B/$file"
  ffmpeg -nostdin -v error -y -i "audio/el/$file" -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.08" -ar 48000 -ac 1 "public/voice/$id.wav"
  echo "$id $(ffprobe -v error -show_entries format=duration -of csv=p=0 public/voice/$id.wav)"
done < audio/elevenlabs_files.txt
