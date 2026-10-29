"""Directed voiceover: reads a voice-direction script (see scripts/05-always-late-voice-direction.md)
and turns its marks into delivery for the free Kokoro voice.

    python3 voice/directed.py scripts/05-always-late-voice-direction.md -o out.wav --words est.json

Marks it understands (the rest of the file, headings and notes, is ignored):
  (brisk) (slower) (land it) (lean in) (warm) (smile) (light) (character)
        pace for the rest of the line (a new line goes back to the base pace)
  |     a short beat: becomes a comma-length pause inside the same take, so the intonation keeps flowing
  ||    a long beat: ends the take, then real silence (longer after "(land it)")
  **word**  ↘ ↗   guidance for human readers; stripped here
Only the lines under the "## 1 · …" section headings are read. "**Direction:**" notes are skipped.
"""
import argparse, json, re, subprocess, sys, wave
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from voiceover import KOKORO_MODEL, KOKORO_VOICES, SR, CHAIN

BASE = 0.92
PACE = {"brisk": 0.99, "light": 0.98, "slower": 0.85, "land it": 0.82, "lean in": 0.89,
        "warm": 0.88, "smile": 0.92, "character": 0.94}
BEAT, LONG_BEAT, LAND_BEAT, PARA_BEAT = 0.12, 0.5, 0.72, 0.8


def read_lines(path):
    """-> list of paragraphs, each a list of script lines (strings with marks)."""
    paras, cur, reading, note = [], [], False, False
    for raw in Path(path).read_text().splitlines():
        line = raw.strip()
        if re.match(r"## \d+ ·", line):
            reading, note = True, False
            if cur: paras.append(cur); cur = []
            continue
        if line.startswith("## ") or line.startswith("---"):
            if cur: paras.append(cur); cur = []
            reading = False
            continue
        if not line:
            note = False
            if cur: paras.append(cur); cur = []
            continue
        if line.startswith("**Direction"):
            note = True  # a direction note, which may wrap onto the next lines
        if not reading or note or line.startswith("```"):
            continue
        cur.append(line)
    if cur: paras.append(cur)
    return paras


def chunks(paras):
    """-> list of (text, speed, silence_after). A chunk is one Kokoro take: consecutive lines at the same
    pace with no long beat between them are read in one take, so the intonation flows across sentences."""
    out = []
    text, speed, landing = "", BASE, False

    def flush(gap):
        nonlocal text
        if text.strip():
            out.append([text, speed, gap])
        text = ""

    for p in paras:
        for line in p:
            line_speed, line_landing = BASE, False
            for j, tok in enumerate(re.split(r"(\([a-z ]+\)|\|\||\|)", line)):
                if not tok or not tok.strip():
                    text += tok
                    continue
                m = re.fullmatch(r"\(([a-z ]+)\)", tok)
                if m and m[1] in PACE:
                    line_speed, line_landing = PACE[m[1]], m[1] == "land it"
                    if line_speed != speed or line_landing or landing:
                        flush(0.22)
                    speed, landing = line_speed, line_landing
                elif tok == "||":
                    flush(LAND_BEAT if landing else LONG_BEAT)
                elif tok == "|":
                    t = text.rstrip()
                    text = t + ("" if re.search(r"[,.;:?!…\"”]$", t) else ",") + " "
                else:
                    if not text.strip() and line_speed != speed:
                        speed, landing = line_speed, line_landing
                    elif text.strip() and line_speed != speed:
                        flush(0.22); speed, landing = line_speed, line_landing
                    text += tok
            text += " "
        flush(PARA_BEAT)
    clean = []
    for t, sp, gap in out:
        t = re.sub(r"\*\*|[↘↗]", "", t)
        t = re.sub(r"\s+", " ", t).strip().rstrip(",").strip()
        if t:
            clean.append((t, sp, gap))
    return clean


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("-o", "--out", default="voiceover.wav")
    ap.add_argument("--voice", default="am_puck:0.6,am_fenrir:0.4")
    ap.add_argument("--words", default=None)
    ap.add_argument("--print", action="store_true", help="only print the takes")
    a = ap.parse_args()
    takes = chunks(read_lines(a.script))
    if a.print:
        for t, s, g in takes: print(f"{s:.2f} +{g:.2f}s  {t}")
        return

    from kokoro_onnx import Kokoro
    k = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
    parts = [p.split(":") for p in a.voice.split(",")]
    tot = sum(float(w) for _, w in parts)
    style = sum(k.get_voice_style(n.strip()) * (float(w) / tot) for n, w in parts)

    out, words, t = [np.zeros(int(0.4 * SR), np.float32)], [], 0.4
    for i, (text, speed, gap) in enumerate(takes):
        audio, sr = k.create(text, voice=style, speed=speed, lang="en-us", sentence_pause=0.45, clause_pause=0.16)
        audio = audio.astype(np.float32)
        dur = len(audio) / SR
        toks = text.split()
        wts = [len(re.sub(r"\W", "", w)) + 2 for w in toks]
        acc = 0
        for w, wt in zip(toks, wts):
            words.append({"text": w, "start": round(t + dur * acc / sum(wts), 3), "end": round(t + dur * (acc + wt) / sum(wts), 3),
                          "take": i, "take_start": round(t, 3), "take_end": round(t + dur, 3)})
            acc += wt
        out += [audio, np.zeros(int(gap * SR), np.float32)]
        t += dur + gap
        print(f"\r{i + 1}/{len(takes)} takes", end="", file=sys.stderr)
    print(file=sys.stderr)
    audio = np.concatenate(out)
    raw = Path(a.out).with_suffix(".raw.wav")
    with wave.open(str(raw), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", CHAIN, "-ar", "48000", "-ac", "2", a.out], check=True)
    raw.unlink()
    if a.words:
        Path(a.words).write_text(json.dumps({"source": "kokoro directed", "words": words}, indent=0))
    print(f"{a.out}: {t:.1f}s, {len(takes)} takes (directed)")


if __name__ == "__main__":
    main()
