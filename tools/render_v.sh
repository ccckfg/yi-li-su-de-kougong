#!/usr/bin/env bash
# Full render of the film: bundle -> 4 chunks (concurrency 3, muted) -> audio -> concat/mux -> finish -> phone preview.
# usage: bash tools/render_v.sh <version>
set -e
V=$1
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/film"
npx remotion bundle --out-dir build > /dev/null
for r in "1:0-1048" "2:1049-2097" "3:2098-3146" "4:3147-4195"; do
  n=${r%%:*}; f=${r#*:}
  t0=$(date +%s)
  npx remotion render build Film out/chunks/c$n.mp4 --frames=$f --concurrency=3 --muted --log=error
  echo "chunk $n done in $(( $(date +%s) - t0 ))s"
done
npx remotion render build Film out/mix_v$V.wav --codec=wav --concurrency=3 --log=error
echo "audio done"
ffmpeg -y -loglevel error -f concat -safe 0 -i out/concat.txt -c copy out/film_v${V}_video.mp4
ffmpeg -y -loglevel error -i out/film_v${V}_video.mp4 -i out/mix_v$V.wav -c:v copy -c:a pcm_s16le out/film_v${V}_raw.mov
python ../tools/finish.py out/film_v${V}_raw.mov "../renders/口供_v${V}_母版1080p.mp4" --crf 18 > /dev/null 2>&1
ffmpeg -y -loglevel error -i "../renders/口供_v${V}_母版1080p.mp4" -vf scale=-2:720:flags=lanczos -c:v libx264 -preset slow -crf 29 -c:a aac -b:a 128k -movflags +faststart "../renders/口供_v${V}_手机预览.mp4"
ls -la "../renders/口供_v${V}_母版1080p.mp4" "../renders/口供_v${V}_手机预览.mp4"
echo "RENDER DONE v$V"
