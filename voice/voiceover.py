"""Free AI voiceover from a script file, studio-processed and ready for the video pipeline.

Two engines:
  kokoro  (default) Kokoro-82M, runs offline on this machine, free, no account.
          Male voices can be blended, e.g. "am_michael:0.6,am_fenrir:0.4".
  gemini  Google's Gemini text-to-speech (the same voices as AI Studio). Free tier with an API key
          from https://aistudio.google.com/apikey, set as GEMINI_API_KEY.

    python3 voice/voiceover.py scripts/02-people-who-dont-get-tattoos.md -o out.wav
    python3 voice/voiceover.py SCRIPT --voice "am_michael:0.6,am_fenrir:0.4" --speed 0.96
    GEMINI_API_KEY=... python3 voice/voiceover.py SCRIPT --engine gemini --voice Charon

The script file can be the markdown we write: headings, *[visual notes]*, tables and fenced blocks
are skipped; blank lines become paragraph pauses. Each sentence is voiced on its own so the pacing
stays controlled: a short pause between sentences, a longer one between paragraphs and sections.
"""
import argparse, base64, json, os, re, subprocess, sys, urllib.request, wave
from pathlib import Path
import numpy as np

SR = 24000
KOKORO_MODEL = Path.home() / ".cache/hyperframes/tts/models/kokoro-v1.0.onnx"
KOKORO_VOICES = Path.home() / ".cache/hyperframes/tts/voices/voices-v1.0.bin"

# pauses (seconds) after a sentence, by how it ends / what follows
PAUSE = {"sentence": 0.32, "question": 0.42, "ellipsis": 0.5, "paragraph": 0.75, "section": 1.2}


def read_script(path):
    """-> list of paragraphs; each paragraph is (kind, [sentences]); kind is 'p' or 'section'."""
    text = Path(path).read_text()
    if path.endswith(".md"):
        text = re.sub(r"```.*?```", "", text, flags=re.S)
        body = []
        started = not re.search(r"^## ", text, flags=re.M)
        for line in text.splitlines():
            s = line.strip()
            if s.startswith("## "):
                if re.match(r"## (Facts|Sources|Notes)", s):
                    break  # reference material at the end of the file is not read out
                started = True
                body.append("§")
                continue
            if not started or s.startswith(("#", "|", "**", "---", "Lines in")):
                continue
            cleaned = re.sub(r"\*\[.*?\]\*", "", s).strip()
            if s and not cleaned:
                continue  # a visual-note line: not a paragraph break
            body.append(cleaned)
        text = "\n".join(body)
    paras = []
    for block in re.split(r"\n\s*\n|§", text):
        block = " ".join(block.split())
        if block:
            sents = re.findall(r"[^.!?…]+(?:[.!?…]+[\"”’]?|$)", block)
            paras.append([s.strip() for s in sents if s.strip()])
    return paras


def pause_after(sentence, last_in_para):
    if last_in_para:
        return PAUSE["paragraph"]
    if sentence.endswith(("…", "...")):
        return PAUSE["ellipsis"]
    if sentence.endswith("?"):
        return PAUSE["question"]
    return PAUSE["sentence"]


# ---------- engines ----------
def kokoro_engine(voice, speed):
    from kokoro_onnx import Kokoro
    k = Kokoro(str(KOKORO_MODEL), str(KOKORO_VOICES))
    if ":" in voice or "," in voice:
        parts = [p.split(":") for p in voice.split(",")]
        total = sum(float(w) for _, w in parts)
        style = sum(k.get_voice_style(n.strip()) * (float(w) / total) for n, w in parts)
    else:
        style = voice
    lang = "en-gb" if voice.startswith("bm_") else "en-us"

    def say(text):
        # a whole paragraph in one continuous take: intonation carries across sentences instead of
        # resetting every full stop, with short natural pauses at sentence and clause boundaries
        audio, sr = k.create(text, voice=style, speed=speed, lang=lang,
                             sentence_pause=0.3, clause_pause=0.12)
        assert sr == SR
        return audio.astype(np.float32)
    return say


def gemini_engine(voice, speed, style_prompt):
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY is not set: get a free key at https://aistudio.google.com/apikey")
    model = os.environ.get("GEMINI_TTS_MODEL", "gemini-2.5-flash-preview-tts")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

    def say(sentence):
        body = {
            "contents": [{"parts": [{"text": f"{style_prompt}: {sentence}"}]}],
            "generationConfig": {
                "responseModalities": ["AUDIO"],
                "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voice}}},
            },
        }
        req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", "x-goog-api-key": key})
        with urllib.request.urlopen(req, timeout=120) as r:
            data = json.load(r)
        pcm = base64.b64decode(data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
        audio = np.frombuffer(pcm, "<i2").astype(np.float32) / 32768  # 24 kHz mono 16-bit
        if speed != 1.0:  # tempo change without pitch change
            audio = ffmpeg_tempo(audio, speed)
        return trim_silence(audio)
    return say


def ffmpeg_tempo(audio, speed):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-f", "f32le", "-ar", str(SR), "-ac", "1", "-i", "-",
                          "-af", f"atempo={speed}", "-f", "f32le", "-"], input=audio.tobytes(), capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def trim_silence(audio, thresh=0.01):
    idx = np.where(np.abs(audio) > thresh)[0]
    return audio[max(0, idx[0] - 240): idx[-1] + 2400] if len(idx) else audio


# ---------- studio chain ----------
# Warm, close, broadcast-style male voice: clean lows, a touch of chest, presence, de-essed,
# gently compressed, normalised to -16 LUFS (the video mix brings the whole film to -14).
CHAIN = ("highpass=f=75,"
         "equalizer=f=120:t=q:w=1:g=1.5,"      # a little chest
         "equalizer=f=320:t=q:w=1.2:g=-2.5,"   # less boxiness
         "equalizer=f=3500:t=q:w=1.4:g=2,"     # presence / intelligibility
         "equalizer=f=10000:t=q:w=1:g=1.5,"    # air
         "deesser=i=0.4,"
         "acompressor=threshold=-20dB:ratio=3:attack=6:release=150:makeup=2,"
         "loudnorm=I=-16:TP=-1.5:LRA=7")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("script")
    ap.add_argument("-o", "--out", default="voiceover.wav")
    ap.add_argument("--engine", choices=["kokoro", "gemini"], default="kokoro")
    ap.add_argument("--voice", default=None, help="kokoro: am_michael, or a blend 'am_michael:0.6,am_fenrir:0.4'; gemini: Charon, Orus, Fenrir, Puck…")
    ap.add_argument("--speed", type=float, default=None)
    ap.add_argument("--style", default="Read this like a calm, warm, engaging storyteller explaining psychology to a friend",
                    help="gemini only: how to say it")
    ap.add_argument("--words", default=None, help="also write word timestamps (estimated within each take; refine with the video pipeline's aligner)")
    ap.add_argument("--flow", choices=["paragraph", "sentence"], default="paragraph",
                    help="paragraph (default): one take per paragraph, natural flow; sentence: one take per sentence, exact sentence timing")
    a = ap.parse_args()

    if a.engine == "kokoro":
        say = kokoro_engine(a.voice or "am_michael:0.6,am_fenrir:0.4", a.speed or (1.0 if a.flow == "paragraph" else 0.96))
    else:
        say = gemini_engine(a.voice or "Charon", a.speed or 1.0, a.style)

    paras = read_script(a.script)
    out, words, t = [np.zeros(int(0.4 * SR), np.float32)], [], 0.4
    if a.flow == "paragraph":
        # one take per paragraph; paragraph gaps vary a little (seeded) so the rhythm doesn't feel metered
        rng = np.random.default_rng(11)
        takes = [[" ".join(p)] for p in paras]
    else:
        takes = paras
    paras = takes
    n = sum(len(p) for p in paras)
    done = 0
    for p in paras:
        for i, s in enumerate(p):
            audio = say(s)
            dur = len(audio) / SR
            # words inside a sentence: spread by letter count (the video pipeline re-times from the audio anyway)
            toks = s.split()
            wts = [len(re.sub(r"\W", "", w)) + 2 for w in toks]
            acc = 0
            for w, wt in zip(toks, wts):
                words.append({"text": w, "start": round(t + dur * acc / sum(wts), 3), "end": round(t + dur * (acc + wt) / sum(wts), 3),
                              "take": done, "take_start": round(t, 3), "take_end": round(t + dur, 3)})
                acc += wt
            gap = pause_after(s, i == len(p) - 1) if a.flow == "sentence" else float(rng.uniform(0.55, 0.9))
            out += [audio, np.zeros(int(gap * SR), np.float32)]
            t += dur + gap
            done += 1
            print(f"\r{done}/{n} takes", end="", file=sys.stderr)
    print(file=sys.stderr)
    audio = np.concatenate(out)

    raw = Path(a.out).with_suffix(".raw.wav")
    with wave.open(str(raw), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(audio, -1, 1) * 32767).astype("<i2").tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", CHAIN, "-ar", "48000", "-ac", "2", a.out], check=True)
    raw.unlink()
    if a.words:
        Path(a.words).write_text(json.dumps({"source": f"{a.engine} tts", "words": words}, indent=0))
    print(f"{a.out}: {t:.1f}s, {n} takes ({a.flow}), engine {a.engine}")


if __name__ == "__main__":
    main()
