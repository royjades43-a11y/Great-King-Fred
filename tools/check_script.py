#!/usr/bin/env python3
"""Check a script's narration against the rules in prompts/script_writing_prompt.md.

Usage:
  python3 tools/check_script.py scripts/china_rise_script.md --minutes 12
"""

import argparse
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_prompts import parse  # noqa: E402

WPM = 140
MAX_SENTENCE_WORDS = 20
QUESTION_EVERY_SECONDS = 90
BANNED_WORDS = ["amazingly", "incredibly", "surprisingly"]
BANNED_OPENERS = ["welcome back", "in this video", "today we're going to"]
CLIFFHANGER = "But it wasn't over yet."
CTA_RE = re.compile(r"Which .+ should we cover next\? Drop it in the comments\.$")


def sentences(text):
    return [s for s in re.split(r"(?:(?<=[.!?])|(?<=[.!?][\"”]))\s+(?=[\"'“A-Z0-9])", text) if s.strip()]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("script", type=Path)
    ap.add_argument("--minutes", type=float, required=True, help="target length in minutes")
    args = ap.parse_args()

    scenes = parse(args.script.read_text(encoding="utf-8"), WPM)
    narration = " ".join(s["voiceover"] for s in scenes)
    problems = []

    target = round(WPM * args.minutes)
    words = len(narration.split())
    if abs(words - target) > target * 0.05:
        problems.append(f"word count {words}, target {target} (±5%)")

    for sentence in sentences(narration):
        n = len(sentence.split())
        if n > MAX_SENTENCE_WORDS:
            problems.append(f"{n}-word sentence: {sentence}")

    lower = narration.lower()
    for word in BANNED_WORDS:
        if word in lower:
            problems.append(f"banned word: {word}")
    for opener in BANNED_OPENERS:
        if lower.startswith(opener):
            problems.append(f"banned opener: {opener}")

    # Every 90-second window of narration needs at least one question.
    window = WPM * QUESTION_EVERY_SECONDS // 60
    tokens = narration.split()
    last_q = 0
    for i, tok in enumerate(tokens, 1):
        if tok.rstrip("\"'”").endswith("?"):
            last_q = i
        elif i - last_q >= window:
            problems.append(f"no question in the 90 s before word {i}: …{' '.join(tokens[i - 8:i])}")
            last_q = i

    if CLIFFHANGER not in narration:
        problems.append(f'missing cliffhanger "{CLIFFHANGER}"')
    if not CTA_RE.search(narration.strip()):
        problems.append('must end with "Which … should we cover next? Drop it in the comments."')

    print(f"{words} words (target {target}), {len(sentences(narration))} sentences, "
          f"{narration.count('?')} questions")
    for p in problems:
        print(f"  ✗ {p}")
    if problems:
        sys.exit(1)
    print("  ✓ all checks passed")


if __name__ == "__main__":
    main()
