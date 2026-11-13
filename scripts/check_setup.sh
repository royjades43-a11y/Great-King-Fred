#!/usr/bin/env bash
# Reports what Engineering Failure Studio needs and what is missing. Changes nothing.
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
missing=0
ok()   { printf '  [ok]      %s\n' "$1"; }
miss() { printf '  [MISSING] %s  -> %s\n' "$1" "$2"; missing=$((missing+1)); }

echo "Engineering Failure Studio: setup check"
if command -v node >/dev/null; then
  v=$(node -p 'process.versions.node.split(".")[0]')
  if [ "$v" -ge 18 ]; then ok "node $(node -v)"; else miss "node >= 18 (found $(node -v))" "install Node.js LTS"; fi
else miss "node" "install Node.js LTS"; fi
command -v ffmpeg  >/dev/null && ok "ffmpeg"  || miss "ffmpeg"  "install ffmpeg"
command -v ffprobe >/dev/null && ok "ffprobe" || miss "ffprobe" "comes with ffmpeg"
command -v python3 >/dev/null && ok "python3 $(python3 -c 'import sys;print(".".join(map(str,sys.version_info[:3])))')" || miss "python3" "install Python 3.10-3.12"
if [ -x "$ROOT/.venv/bin/python" ]; then
  ok ".venv"
  if "$ROOT/.venv/bin/python" -c 'import faster_whisper' 2>/dev/null; then ok "faster-whisper (word timing)"
  elif "$ROOT/.venv/bin/python" -c 'import whisper' 2>/dev/null; then ok "openai-whisper (word timing)"
  else miss "word timing (faster-whisper)" ".venv/bin/pip install faster-whisper"; fi
  "$ROOT/.venv/bin/python" -m yt_dlp --version >/dev/null 2>&1 && ok "yt-dlp (footage downloads)" || miss "yt-dlp" ".venv/bin/pip install yt-dlp"
else
  miss ".venv (Python tools)" "python3 -m venv .venv"
fi
[ -d "$ROOT/studio/node_modules/remotion" ] && ok "renderer (studio/node_modules)" || miss "renderer packages" "cd studio && npm install"

echo
if [ "$missing" -eq 0 ]; then echo "You're set up."; else echo "$missing item(s) missing."; exit 1; fi
