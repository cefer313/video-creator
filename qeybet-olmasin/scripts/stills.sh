#!/usr/bin/env bash
# Hazır videodan hər 2 saniyədən bir yoxlama kadrı çıxarır: out/stills/
set -e
cd "$(dirname "$0")/.."
mkdir -p out/stills
ffmpeg -nostdin -y -loglevel error -i out/qeybet-olmasin.mp4 -vf "fps=1/2,scale=270:-1,tile=8x4" out/stills/kontakt.jpg
echo "out/stills/kontakt.jpg"
