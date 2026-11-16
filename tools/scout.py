#!/usr/bin/env python3
"""B-roll scout: preview Commons clips before pinning them in a script.

    python tools/scout.py --query "Boeing 747 takeoff"            # search, sheet per hit
    python tools/scout.py --file "Air-to-air contrails.webm"      # one specific clip

For each clip it writes scout/<name>.jpg: a strip of frames with timestamps,
so you can pick the exact moment and pin it in the episode YAML:

    footage: {file: "Air-to-air contrails.webm", start: 12}
"""
from __future__ import annotations

import argparse
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from pipeline import footage  # noqa: E402

FONT = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"


def sheet(asset: dict, out_dir: Path, frames: int = 6) -> Path:
    path = Path(asset["path"])
    out = out_dir / (re.sub(r"[^A-Za-z0-9]+", "_", asset["title"])[:80] + ".jpg")
    if asset["kind"] == "image":
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-vf", "scale=-2:360",
                        "-frames:v", "1", str(out)], check=True)
        return out
    dur = asset.get("duration") or 10
    tiles = []
    for k in range(frames):
        t = dur * (k + 0.5) / frames
        tile = out_dir / f".tile{k}.jpg"
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", str(path), "-frames:v", "1",
                        "-vf", f"scale=-2:240,drawtext=fontfile={FONT}:text='{t:.0f}s':x=8:y=8:"
                               "fontsize=28:fontcolor=white:box=1:boxcolor=black@0.6", str(tile)], check=True)
        tiles.append(tile)
    inputs = sum((["-i", str(t)] for t in tiles), [])
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex",
                    "".join(f"[{i}]" for i in range(len(tiles))) + f"hstack={len(tiles)}", str(out)], check=True)
    for t in tiles:
        t.unlink()
    return out


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--query")
    ap.add_argument("--file", action="append", default=[])
    ap.add_argument("--kind", default="video", choices=["video", "image"])
    ap.add_argument("--max", type=int, default=6)
    ap.add_argument("--out", type=Path, default=Path("scout"))
    args = ap.parse_args()
    args.out.mkdir(exist_ok=True)
    work = Path("work/_scout")
    items = [footage.lookup_file(f) for f in args.file]
    if args.query:
        items += footage.search(args.query, args.kind)[: args.max]
    for a in items:
        try:
            a["path"] = str(footage.download(a, work / "assets"))
        except Exception as e:  # noqa: BLE001
            print(f"! {a['title']}: {e}")
            continue
        out = sheet(a, args.out)
        dur = f"{a['duration']:.0f}s" if a.get("duration") else "still"
        print(f"{out}  |  {a['title']}  |  {dur}  |  {a['licence']}")


if __name__ == "__main__":
    main()
