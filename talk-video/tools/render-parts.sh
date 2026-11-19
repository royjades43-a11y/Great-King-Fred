#!/bin/bash
# Usage: python3 tools/mkparts.py && tools/render-parts.sh, then concat .work/parts/part-*.mp4 + assets/soundtrack.m4a (see VOICEOVER.md).
# Render each part-*.html at 4K (1 worker, streaming), 4 at a time; skip finished parts.
cd "$(dirname "$0")/.."
P=$(pwd)
one() { f=$1; n=${f%.html}; out=.work/parts/$n.mp4
  [ -s "$out" ] && { echo "skip $n"; return; }
  npx hyperframes render -c $f -w 1 --resolution 4k --crf 12 -o $P/.work/parts/$n.tmp.mp4 $P > .work/parts/$n.log 2>&1 \
    && mv .work/parts/$n.tmp.mp4 $out && echo "done $n $(date +%T)" || echo "FAIL $n"; }
export -f one; export P
ls part-*.html | xargs -P 4 -I{} bash -c 'one {}'
