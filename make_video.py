#!/usr/bin/env python3
"""Throttle & Track — script → finished Short in one command.

    python make_video.py episodes/ep001_why_35000_feet.yaml            # real voice (needs ELEVENLABS_API_KEY)
    python make_video.py episodes/ep001_why_35000_feet.yaml --draft    # free preview: silent, estimated timing
    python make_video.py episodes/*.yaml --music music/bed.mp3

Output: out/<episode_id>/{video.mp4, thumbnail.jpg, description.txt, credits.json}
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).parent))
from pipeline import edit, footage, voice  # noqa: E402


def build(ep_path: Path, draft: bool, music: Path | None, preset: str) -> Path:
    ep = yaml.safe_load(ep_path.read_text())
    size = edit.FORMATS[ep.get("format", "short")]
    work = Path("work") / ep["id"]
    out_dir = Path("out") / ep["id"]
    work.mkdir(parents=True, exist_ok=True)
    out_dir.mkdir(parents=True, exist_ok=True)
    segments = ep["segments"]

    print(f"▶ {ep['title']}")
    print("1/4 footage (Wikimedia Commons, CC-licensed only)")
    assets = footage.fetch_for_segments(segments, work, ep.get("broll_filters"), ep.get("chart_background"))

    real_voice = bool(os.environ.get("ELEVENLABS_API_KEY")) and not draft
    print(f"2/4 voiceover ({'ElevenLabs' if real_voice else 'DRAFT: silent placeholder'})")
    (work / "voice").mkdir(exist_ok=True)
    for i, seg in enumerate(segments):
        meta = voice.synth_segment(seg["say"], ep["voice"], work / "voice" / f"vo_{i:02d}.wav",
                                   draft=not real_voice)
        seg.update(duration=meta["duration"], words=meta["words"], voice_path=meta["path"])

    print("3/4 edit")
    video = out_dir / "video.mp4"
    total = edit.assemble(segments, assets, size, work, video, music, preset)

    print("4/4 packaging")
    edit.thumbnail(work / "picture.mp4", segments[0].get("punch", ep["title"]), size,
                   out_dir / "thumbnail.jpg")
    edit.write_description(ep, assets, out_dir / "description.txt", synthetic_voice=True)
    print(f"✔ {video}  ({total:.1f}s)\n")
    return video


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("episodes", nargs="+", type=Path)
    ap.add_argument("--draft", action="store_true", help="skip ElevenLabs; silent audio with estimated timing")
    ap.add_argument("--music", type=Path, help="royalty-free/CC music bed, auto-ducked under narration")
    ap.add_argument("--preset", default="veryfast", help="x264 preset (use 'slow' for final uploads)")
    args = ap.parse_args()
    for ep in args.episodes:
        build(ep, args.draft, args.music, args.preset)


if __name__ == "__main__":
    main()
