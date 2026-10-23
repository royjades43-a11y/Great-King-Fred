#!/usr/bin/env python3
"""Extract scenes and generation prompts from a production script.

Reads a script in the format used by scripts/china_rise_script.md and writes:
  prompts/<name>_scene_prompts.json  - full scene data for automation
  prompts/<name>_scene_prompts.csv   - one row per prompt for batch tools

Usage:
  python3 tools/build_prompts.py                       # default script
  python3 tools/build_prompts.py scripts/other.md      # another script
  python3 tools/build_prompts.py --retime              # also rewrite timestamps
  python3 tools/build_prompts.py --wpm 150             # narration speed

Scene times come from word count. If the script has "## [m:ss–m:ss]" section
headers, scenes are fitted inside their section's range instead.
"""

import argparse
import csv
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SCRIPT = ROOT / "scripts" / "china_rise_script.md"

SCENE_RE = re.compile(r"^### Scene (\d+) — (.+)$", re.M)
TIMESTAMP_RE = re.compile(r"^\*\*Timestamp:\*\* .*$", re.M)
VOICEOVER_RE = re.compile(r"\*\*Voiceover:\*\*\s*\n((?:>.*\n?)+)")
VISUAL_RE = re.compile(r"^\*\*Visual:\*\* (.+)$", re.M)
SECTION_RE = re.compile(r"^## \[(\d+):(\d\d)[–-](\d+):(\d\d)\]", re.M)
PROMPT_RE = re.compile(r"^\*\*(Image prompt|Motion prompt)(?: \(([^)]+)\))?:\*\*\s*\n```\n(.*?)\n```", re.M | re.S)

MIN_SCENE_SECONDS = 4


def fmt(seconds):
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def parse(text, wpm):
    matches = list(SCENE_RE.finditer(text))
    scenes = []
    clock = 0
    for i, m in enumerate(matches):
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        body = text[m.end():end]

        vo_match = VOICEOVER_RE.search(body)
        voiceover = ""
        if vo_match:
            lines = [ln.lstrip(">").strip() for ln in vo_match.group(1).splitlines()]
            voiceover = " ".join(ln for ln in lines if ln)
        words = len(voiceover.split())
        seconds = max(MIN_SCENE_SECONDS, round(words / wpm * 60))

        visual = VISUAL_RE.search(body)
        prompts = [
            {"type": kind.split()[0].lower(), "shot": shot[0] if shot else "A",
             "label": re.sub(r"^[A-Z](?:-shot)?[,:]\s*", "", shot), "prompt": prompt.strip()}
            for kind, shot, prompt in PROMPT_RE.findall(body)
        ]

        scenes.append({
            "scene": int(m.group(1)),
            "title": m.group(2).strip(),
            "start": fmt(clock),
            "end": fmt(clock + seconds),
            "duration_seconds": seconds,
            "word_count": words,
            "voiceover": voiceover,
            "visual": visual.group(1).strip() if visual else "",
            "prompts": prompts,
            "_pos": m.start(),
        })
        clock += seconds
    fit_sections(text, scenes)
    for scene in scenes:
        del scene["_pos"]
    return scenes


def fit_sections(text, scenes):
    """Stretch scene times to fill "## [m:ss–m:ss]" section headers, split by word count."""
    sections = list(SECTION_RE.finditer(text))
    for i, sec in enumerate(sections):
        stop = sections[i + 1].start() if i + 1 < len(sections) else len(text)
        group = [s for s in scenes if sec.start() < s["_pos"] < stop]
        if not group:
            continue
        a, b = int(sec[1]) * 60 + int(sec[2]), int(sec[3]) * 60 + int(sec[4])
        total_words = sum(s["word_count"] for s in group) or len(group)
        words_so_far = 0
        for s in group:
            start = a + round((b - a) * words_so_far / total_words)
            words_so_far += s["word_count"] or 1
            end = a + round((b - a) * words_so_far / total_words)
            s.update(start=fmt(start), end=fmt(end), duration_seconds=end - start)


def retime(text, scenes):
    """Rewrite each scene's **Timestamp:** line with the computed times."""
    out, last = [], 0
    for scene, m in zip(scenes, SCENE_RE.finditer(text)):
        ts = TIMESTAMP_RE.search(text, m.end())
        if not ts:
            continue
        out.append(text[last:ts.start()])
        out.append(f"**Timestamp:** {scene['start']} – {scene['end']}")
        last = ts.end()
    out.append(text[last:])
    return "".join(out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("script", nargs="?", type=Path, default=DEFAULT_SCRIPT)
    ap.add_argument("--wpm", type=int, default=140, help="narration words per minute (default 140)")
    ap.add_argument("--retime", action="store_true", help="rewrite timestamps in the script file")
    args = ap.parse_args()

    text = args.script.read_text(encoding="utf-8")
    scenes = parse(text, args.wpm)
    if not scenes:
        sys.exit(f"No scenes found in {args.script}")

    if args.retime:
        args.script.write_text(retime(text, scenes), encoding="utf-8")

    name = args.script.stem.removesuffix("_script")
    out_dir = ROOT / "prompts"
    out_dir.mkdir(exist_ok=True)

    json_path = out_dir / f"{name}_scene_prompts.json"
    json_path.write_text(json.dumps({"source": str(args.script.relative_to(ROOT)), "wpm": args.wpm,
                                     "scenes": scenes}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    csv_path = out_dir / f"{name}_scene_prompts.csv"
    with csv_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["scene", "title", "start", "end", "type", "shot", "label", "filename", "prompt"])
        for s in scenes:
            for p in s["prompts"]:
                filename = f"s{s['scene']:02d}_{p['type']}_{p['shot'].lower()}"
                w.writerow([s["scene"], s["title"], s["start"], s["end"], p["type"], p["shot"], p["label"],
                            filename, p["prompt"]])

    total = sum(s["duration_seconds"] for s in scenes)
    n_prompts = sum(len(s["prompts"]) for s in scenes)
    print(f"{len(scenes)} scenes, {n_prompts} prompts, runtime ≈ {fmt(total)} at {args.wpm} wpm")
    print(f"wrote {json_path.relative_to(ROOT)}")
    print(f"wrote {csv_path.relative_to(ROOT)}")
    if args.retime:
        print(f"retimed {args.script.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
