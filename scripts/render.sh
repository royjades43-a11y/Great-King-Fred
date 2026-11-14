#!/usr/bin/env bash
# Build the timeline, render 1080p, run QA.
# Usage: scripts/render.sh episodes/<slug> [--estimate] [--preview]
#   --estimate  no voiceover yet: silent render with estimated timings
#   --preview   fast low-quality 540p render of the first 60 seconds
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EP="$(cd "$1" && pwd)"; shift
SLUG="$(basename "$EP")"
TL_ARGS=(); PREVIEW=0
for a in "$@"; do
  case "$a" in
    --estimate) TL_ARGS+=(--estimate) ;;
    --preview) PREVIEW=1 ;;
  esac
done

node "$ROOT/scripts/build_timeline.mjs" "$EP" "${TL_ARGS[@]}"
mkdir -p "$EP/out"
cd "$ROOT/studio"
BROWSER=()
# Optional: use an already-installed Chrome/Chromium instead of letting Remotion download one.
[ -n "${EFS_BROWSER:-}" ] && BROWSER=(--browser-executable="$EFS_BROWSER")
if [ "$PREVIEW" = 1 ]; then
  OUT="$EP/out/$SLUG-preview.mp4"
  npx remotion render src/index.ts Documentary "$OUT" --props="$EP/build/props.json" --public-dir="$EP" "${BROWSER[@]}" \
    --scale=0.5 --frames=0-1799 --crf=28 --log=error
else
  OUT="$EP/out/$SLUG.mp4"
  npx remotion render src/index.ts Documentary "$OUT" --props="$EP/build/props.json" --public-dir="$EP" "${BROWSER[@]}" --log=error
fi
# Master the mix to YouTube's playback target: -14 LUFS integrated, -1 dBTP true peak.
if [ "$PREVIEW" = 0 ] && ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$OUT" | grep -q .; then
  ffmpeg -v error -y -i "$OUT" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000 -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$OUT.tmp.mp4" && mv "$OUT.tmp.mp4" "$OUT"
  echo "audio mastered to -14 LUFS"
fi
echo "rendered: $OUT"
python3 "$ROOT/scripts/check_frames.py" "$EP" "$OUT"
