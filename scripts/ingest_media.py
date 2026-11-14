#!/usr/bin/env python3
"""Adds one downloaded photo or clip to an episode: converts it to a render-safe file,
records where it came from in footage/manifest.json, and regenerates CREDITS.md.

Usage:
  python3 scripts/ingest_media.py episodes/<slug> --id ntsb-photo-03 --src /path/to/download.jpg \
      --source-url https://... --title "Switchboard terminal block" --author "NTSB" \
      --license "Public domain (US Government work)" [--license-url ...] \
      [--description "what is in the shot"] [--trim-in 12.5 --trim-out 31]

Videos become H.264 1080p MP4 with no audio (trimmed if asked). Images become JPEG, max 2400px.
Run with --list to print the manifest, or --remove <id> to drop an asset.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys

VIDEO_EXT = {".mp4", ".mov", ".m4v", ".webm", ".ogv", ".ogg", ".mkv", ".avi", ".mpg", ".mpeg", ".flv", ".wmv", ".3gp", ".ts"}
AUDIO_EXT = {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg_audio"}
IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".gif", ".bmp"}
OK_LICENSES = ("public domain", "pd", "cc0", "cc by", "cc-by", "cc by-sa", "cc-by-sa", "us government", "u.s. government", "pexels license", "pixabay content license")


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", path],
        capture_output=True, text=True, check=True,
    ).stdout
    j = json.loads(out)
    v = next((s for s in j.get("streams", []) if s.get("codec_type") == "video"), {})
    dur = j.get("format", {}).get("duration")
    return {"width": v.get("width"), "height": v.get("height"), "duration": float(dur) if dur not in (None, "N/A") else None}


def load(ep):
    p = os.path.join(ep, "footage", "manifest.json")
    if os.path.exists(p):
        return json.load(open(p))
    return {"assets": []}


def save(ep, m):
    os.makedirs(os.path.join(ep, "footage"), exist_ok=True)
    json.dump(m, open(os.path.join(ep, "footage", "manifest.json"), "w"), indent=2)
    write_credits(ep, m)


def write_credits(ep, m):
    lines = ["# Footage and image credits", "", "Every visual in this episode, where it came from, and the terms it is used under.", ""]
    visuals = [a for a in m["assets"] if a["type"] != "audio"]
    music = [a for a in m["assets"] if a["type"] == "audio"]
    for a in visuals + ([{"_heading": True}] if music else []) + music:
        if a.get("_heading"):
            lines += ["", "## Music", ""]
            continue
        lines.append(f"- **{a['id']}** ({a['type']}): {a.get('title') or a.get('description') or ''}")
        lines.append(f"  - Source: {a['source_url']}")
        lines.append(f"  - Author: {a.get('author') or 'unknown'}")
        lic = a["license"] + (f" ({a['license_url']})" if a.get("license_url") else "")
        lines.append(f"  - License: {lic}")
    lines.append("")
    open(os.path.join(ep, "CREDITS.md"), "w").write("\n".join(lines))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--id")
    ap.add_argument("--src")
    ap.add_argument("--source-url")
    ap.add_argument("--title", default="")
    ap.add_argument("--author", default="")
    ap.add_argument("--license")
    ap.add_argument("--license-url", default="")
    ap.add_argument("--description", default="")
    ap.add_argument("--trim-in", type=float)
    ap.add_argument("--trim-out", type=float)
    ap.add_argument("--focus", help="x,y in 0..1: where stills should drift toward")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--remove")
    a = ap.parse_args()

    ep = os.path.abspath(a.episode)
    m = load(ep)

    if a.list:
        for x in m["assets"]:
            d = f"{x['duration']:.1f}s" if x.get("duration") else ""
            print(f"{x['id']:28} {x['type']:5} {d:>7} {x.get('width')}x{x.get('height')}  {x['license'][:30]:30}  {x.get('description') or x.get('title')}")
        return
    if a.remove:
        keep = [x for x in m["assets"] if x["id"] != a.remove]
        gone = [x for x in m["assets"] if x["id"] == a.remove]
        for x in gone:
            p = os.path.join(ep, x["file"])
            if os.path.exists(p):
                os.remove(p)
        m["assets"] = keep
        save(ep, m)
        print(f"removed {a.remove}" if gone else f"no asset {a.remove}")
        return

    for req in ("id", "src", "source_url", "license"):
        if not getattr(a, req):
            sys.exit(f"--{req.replace('_', '-')} is required")
    if not any(k in a.license.lower() for k in OK_LICENSES):
        print(f"WARNING: license '{a.license}' is not public domain / CC0 / CC BY / CC BY-SA. Only keep it if you are sure it is free to reuse.", file=sys.stderr)

    ext = os.path.splitext(a.src)[1].lower()
    info = probe(a.src)
    is_audio = ext in AUDIO_EXT and not info.get("width")
    is_video = (not is_audio) and ext in VIDEO_EXT or (ext not in IMAGE_EXT and info.get("duration") and info["duration"] > 0.5)
    os.makedirs(os.path.join(ep, "footage"), exist_ok=True)

    if is_audio:
        os.makedirs(os.path.join(ep, "music"), exist_ok=True)
        rel = f"music/{a.id}.mp3"
        cmd = ["ffmpeg", "-y", "-v", "error", "-i", a.src, "-vn", "-c:a", "libmp3lame", "-b:a", "192k", os.path.join(ep, rel)]
    elif is_video:
        rel = f"footage/{a.id}.mp4"
        cmd = ["ffmpeg", "-y", "-v", "error"]
        if a.trim_in:
            cmd += ["-ss", str(a.trim_in)]
        cmd += ["-i", a.src]
        if a.trim_out:
            cmd += ["-t", str(a.trim_out - (a.trim_in or 0))]
        cmd += [
            "-an", "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease:force_divisible_by=2,fps=30,format=yuv420p",
            "-c:v", "libx264", "-preset", "medium", "-crf", "19", "-movflags", "+faststart", os.path.join(ep, rel),
        ]
    else:
        rel = f"footage/{a.id}.jpg"
        cmd = ["ffmpeg", "-y", "-v", "error", "-i", a.src, "-frames:v", "1",
               "-vf", "scale='min(2400,iw)':-2", "-q:v", "2", os.path.join(ep, rel)]
    subprocess.run(cmd, check=True)
    out = probe(os.path.join(ep, rel))

    entry = {
        "id": a.id,
        "file": rel,
        "type": "audio" if is_audio else "video" if is_video else "image",
        "width": out["width"],
        "height": out["height"],
        "source_url": a.source_url,
        "title": a.title,
        "author": a.author,
        "license": a.license,
        "license_url": a.license_url,
        "description": a.description,
    }
    if is_video or is_audio:
        entry["duration"] = round(out["duration"] or 0, 2)
        if a.trim_in or a.trim_out:
            entry["trimmed_from_source"] = [a.trim_in or 0, a.trim_out]
    if a.focus:
        x, y = (float(v) for v in a.focus.split(","))
        entry["focus"] = {"x": x, "y": y}
    if not is_audio and out["width"] and out["width"] < 1000:
        print(f"note: {a.id} is only {out['width']}px wide; it will look soft full screen. Prefer it on an evidence board.")

    m["assets"] = [x for x in m["assets"] if x["id"] != a.id] + [entry]
    save(ep, m)
    d = f", {entry['duration']}s" if is_video else ""
    print(f"added {a.id}: {rel} ({entry['width']}x{entry['height']}{d})")


if __name__ == "__main__":
    if not shutil.which("ffmpeg"):
        sys.exit("ffmpeg is not installed. Follow SETUP.md.")
    main()
