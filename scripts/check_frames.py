#!/usr/bin/env python3
"""Quality check for a rendered episode. Pulls a frame from the middle of every scene and
from every scene boundary, tiles them into contact sheets, and runs ffmpeg's black-frame and
frozen-frame detectors. Writes build/qa/report.md; look at the contact sheet PNGs.

Usage: python3 scripts/check_frames.py episodes/<slug> [video.mp4]
"""
import json
import os
import re
import shutil
import subprocess
import sys


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def main():
    ep = os.path.abspath(sys.argv[1])
    slug = os.path.basename(ep)
    video = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ep, "out", f"{slug}.mp4")
    props = json.load(open(os.path.join(ep, "build", "props.json")))
    qa = os.path.join(ep, "build", "qa")
    shutil.rmtree(qa, ignore_errors=True)
    os.makedirs(os.path.join(qa, "frames"))

    samples = []
    for i, s in enumerate(props["scenes"]):
        mid = (s["start"] + s["end"]) / 2
        samples.append((mid, f"s{i+1:02d}-{s['kind']}-mid"))
        if i:
            samples.append((s["start"] + 0.6, f"s{i+1:02d}-{s['kind']}-cut"))
    for t, name in samples:
        run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.2f}", "-i", video, "-frames:v", "1",
             "-vf", "scale=480:-2", os.path.join(qa, "frames", f"{name}.jpg")])

    frames = sorted(os.listdir(os.path.join(qa, "frames")))
    sheets = []
    per = 20
    for k in range(0, len(frames), per):
        sheet = os.path.join(qa, f"contact-{k // per + 1:02d}.png")
        listfile = os.path.join(qa, "list.txt")
        with open(listfile, "w") as f:
            for fr in frames[k:k + per]:
                f.write(f"file '{os.path.join(qa, 'frames', fr)}'\n")
        n = len(frames[k:k + per])
        rows = (n + 4) // 5
        run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", listfile,
             "-vf", f"scale=480:270:force_original_aspect_ratio=decrease,pad=480:270:(ow-iw)/2:(oh-ih)/2,tile=5x{rows}:padding=6:margin=6",
             "-frames:v", "1", sheet])
        sheets.append(sheet)
        os.remove(listfile)

    det = run(["ffmpeg", "-v", "info", "-i", video, "-vf", "blackdetect=d=0.4:pix_th=0.06,freezedetect=n=0.002:d=4", "-an", "-f", "null", "-"]).stderr
    blacks = re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", det)
    freezes = re.findall(r"freeze_start: ([\d.]+)", det)
    vprobe = json.loads(run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,r_frame_rate:format=duration", "-of", "json", video]).stdout)
    v = next(s for s in vprobe["streams"] if s["codec_type"] == "video")
    has_audio = any(s["codec_type"] == "audio" for s in vprobe["streams"])

    lines = [f"# QA report: {slug}", "",
             f"- File: {video}",
             f"- Resolution: {v['width']}x{v['height']} @ {v['r_frame_rate']}",
             f"- Duration: {float(vprobe['format']['duration']):.1f}s (timeline {props['duration']:.1f}s)",
             f"- Audio track: {'yes' if has_audio else 'NO'}",
             f"- Scenes: {len(props['scenes'])}", ""]
    lines.append("## Black frames")
    lines += [f"- {float(a):.1f}s to {float(b):.1f}s" for a, b in blacks] or ["- none"]
    lines.append("")
    lines.append("## Frozen picture (4s or longer)")
    lines += [f"- starts at {float(a):.1f}s" for a in freezes] or ["- none"]
    lines.append("")
    lines.append("## Contact sheets (open and look at every one)")
    lines += [f"- {s}" for s in sheets]
    lines.append("")
    open(os.path.join(qa, "report.md"), "w").write("\n".join(lines))
    print("\n".join(lines))


if __name__ == "__main__":
    main()
