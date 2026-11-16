"""ElevenLabs voiceover with word-level timings for kinetic captions.

Uses the `/with-timestamps` endpoint, which returns per-character timing; we
fold that into per-word timing. Without ELEVENLABS_API_KEY (or with --draft)
it produces silent placeholder audio with estimated timings so the edit can
be previewed for free.
"""
from __future__ import annotations

import base64
import json
import os
import re
import subprocess
from pathlib import Path

import requests

TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps"
WORDS_PER_SEC = 2.8  # draft-mode pacing estimate
TAIL = 0.25          # breathing room after each line


def _words_from_alignment(al: dict) -> list[dict]:
    chars = al["characters"]
    starts = al["character_start_times_seconds"]
    ends = al["character_end_times_seconds"]
    words, cur, s, e = [], "", None, None
    for ch, a, b in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                words.append({"word": cur, "start": s, "end": e})
            cur, s = "", None
            continue
        if s is None:
            s = a
        cur, e = cur + ch, b
    if cur:
        words.append({"word": cur, "start": s, "end": e})
    return words


def _estimate_words(text: str) -> list[dict]:
    t, out = 0.15, []
    for w in text.split():
        d = max(0.18, len(re.sub(r"\W", "", w)) * 0.055 + 0.12) * (2.8 / WORDS_PER_SEC)
        out.append({"word": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d + (0.25 if re.search(r"[.?!…]$", w) else 0.08 if w.endswith(",") else 0.03)
    return out


def _duration(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(path)], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def synth_segment(text: str, voice: dict, out: Path, draft: bool) -> dict:
    """Write out (wav) and return {"path", "duration", "words"}."""
    key = os.environ.get("ELEVENLABS_API_KEY")
    draft = draft or not key
    meta_path = out.with_suffix(".json")
    if meta_path.exists() and out.exists():
        meta = json.loads(meta_path.read_text())
        if meta.get("text") == text and meta.get("draft") == draft:
            return meta

    if not draft:
        r = requests.post(
            TTS_URL.format(voice_id=voice["voice_id"]),
            params={"output_format": "mp3_44100_128"},
            headers={"xi-api-key": key, "Content-Type": "application/json"},
            json={
                "text": text,
                "model_id": voice.get("model_id", "eleven_multilingual_v2"),
                "voice_settings": {
                    "stability": voice.get("stability", 0.4),
                    "similarity_boost": voice.get("similarity_boost", 0.75),
                    "style": voice.get("style", 0.5),
                    "use_speaker_boost": True,
                },
            },
            timeout=120,
        )
        r.raise_for_status()
        data = r.json()
        mp3 = out.with_suffix(".mp3")
        mp3.write_bytes(base64.b64decode(data["audio_base64"]))
        words = _words_from_alignment(data["alignment"])
        dur = _duration(mp3) + TAIL
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-af", f"apad=pad_dur={TAIL}",
                        "-ar", "48000", "-ac", "2", str(out)], check=True)
    else:
        words = _estimate_words(text)
        dur = words[-1]["end"] + TAIL + 0.15
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "lavfi", "-i",
                        "anullsrc=r=48000:cl=stereo", "-t", f"{dur:.3f}", str(out)], check=True)

    meta = {"text": text, "draft": draft, "path": str(out),
            "duration": round(dur, 3), "words": words}
    meta_path.write_text(json.dumps(meta, indent=2))
    return meta
