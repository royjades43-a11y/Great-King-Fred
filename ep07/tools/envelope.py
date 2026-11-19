# Voice loudness envelope for lip-sync: python3 tools/envelope.py assets/audio/voiceover.mp3 tools/env.json
import json, subprocess, sys
import numpy as np
src, out = sys.argv[1], sys.argv[2]
FPS, SR = 20, 16000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
a = np.frombuffer(raw, dtype=np.float32)
hop = SR // FPS
n = len(a) // hop
rms = np.sqrt(np.mean(a[: n * hop].reshape(n, hop) ** 2, axis=1))
lo, hi = np.percentile(rms, 20), np.percentile(rms, 97)
v = np.clip((rms - lo) / max(hi - lo, 1e-6), 0, 1)
v = np.round(v / 0.25) * 0.25  # 5 mouth shapes: closed .. wide
json.dump({"fps": FPS, "v": [float(x) for x in v]}, open(out, "w"))
print(n, "frames", float(v.mean()))
