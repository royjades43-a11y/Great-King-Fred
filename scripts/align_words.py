#!/usr/bin/env python3
"""Times every word of the voiceover -> episodes/<slug>/build/words.json

Usage: .venv/bin/python scripts/align_words.py episodes/<slug> [--model small.en]

Uses faster-whisper if installed, otherwise openai-whisper. The script text is passed
as a prompt so names and jargon from the episode are recognised. Exact spelling does
not matter: build_timeline.mjs aligns these timings back onto script.json.
"""
import argparse
import json
import os
import sys


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("episode")
    ap.add_argument("--model", default=os.environ.get("EFS_WHISPER_MODEL", "small.en"))
    ap.add_argument("--audio", default=None, help="defaults to script.json 'audio' or audio/voiceover.mp3")
    a = ap.parse_args()

    ep = os.path.abspath(a.episode)
    script = json.load(open(os.path.join(ep, "script.json")))
    audio = os.path.join(ep, a.audio or script.get("audio", "audio/voiceover.mp3"))
    if not os.path.exists(audio):
        sys.exit(f"voiceover not found: {audio}")

    text = " ".join(b.get("narration", "") for b in script.get("beats", []))
    prompt = (script.get("title", "") + ". " + text)[:800]

    words = []
    engine = None
    try:
        from faster_whisper import WhisperModel  # type: ignore

        engine = f"faster-whisper/{a.model}"
        model = WhisperModel(a.model, device="cpu", compute_type="int8")
        segments, _ = model.transcribe(audio, word_timestamps=True, initial_prompt=prompt, vad_filter=False, beam_size=5)
        for seg in segments:
            for w in seg.words or []:
                words.append({"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)})
            print(f"  {seg.end:7.1f}s  {seg.text.strip()[:70]}", flush=True)
    except ImportError:
        try:
            import whisper  # type: ignore
        except ImportError:
            sys.exit("No speech timing engine. Install one: .venv/bin/pip install faster-whisper  (or openai-whisper)")
        engine = f"openai-whisper/{a.model}"
        model = whisper.load_model(a.model)
        result = model.transcribe(audio, word_timestamps=True, initial_prompt=prompt)
        for seg in result["segments"]:
            for w in seg.get("words", []):
                words.append({"word": w["word"].strip(), "start": round(w["start"], 3), "end": round(w["end"], 3)})

    os.makedirs(os.path.join(ep, "build"), exist_ok=True)
    out = os.path.join(ep, "build", "words.json")
    json.dump({"engine": engine, "audio": os.path.relpath(audio, ep), "words": words}, open(out, "w"), indent=1)
    print(f"timed {len(words)} words with {engine} -> {os.path.relpath(out)}")


if __name__ == "__main__":
    main()
