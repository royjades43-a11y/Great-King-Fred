"""Narration with Kokoro (local, open-weights TTS) and word-accurate cue timing.

    python -m lantern.voice --fetch          # one-time model download from Hugging Face
    python -m lantern.voice --say "Twelfth Night, in the year 878." -o out/test.wav

Each sentence is synthesised on its own (cached by content), so the exact start and end
of every sentence is known. Cue markers inside a sentence are timed from the model's
per-phoneme durations when it reports them, otherwise by phoneme count.
"""
import argparse
import hashlib
import os
import re
import subprocess
import sys
import wave

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(ROOT, "models", "kokoro")
MODEL = os.path.join(MODEL_DIR, "model.onnx")
VOICES = os.path.join(MODEL_DIR, "voices.npz")
HF = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main"
FETCH_VOICES = ["bm_george", "bm_lewis", "bm_fable", "bm_daniel", "bf_emma", "bf_isabella",
                "am_onyx", "am_michael", "am_fenrir", "af_heart", "af_bella"]
SR = 24000


def fetch():
    """Download the official ONNX export of Kokoro-82M and pack the voices for kokoro-onnx."""
    os.makedirs(os.path.join(MODEL_DIR, "voices"), exist_ok=True)

    def get(url, dest):
        if os.path.exists(dest):
            return
        print("downloading", url)
        subprocess.run(["curl", "-fL", "--retry", "3", "-o", dest + ".part", url], check=True)
        os.replace(dest + ".part", dest)

    get(f"{HF}/onnx/model.onnx", MODEL)
    voices = {}
    for v in FETCH_VOICES:
        path = os.path.join(MODEL_DIR, "voices", f"{v}.bin")
        get(f"{HF}/voices/{v}.bin", path)
        voices[v] = np.fromfile(path, dtype=np.float32).reshape(-1, 1, 256)
    np.savez(VOICES, **voices)
    print("voices:", ", ".join(voices))


NPM_MODEL_SHA256 = "fbae9257e1e05ffc727e951ef9b9c98418e6d79f1c9b6b13bd59f5c9028a1478"


def fetch_npm():
    """Fallback when huggingface.co is unreachable: the same q8 model re-uploaded to npm as
    `kokoro-q8-shards` (unofficial redistribution) plus the voice files shipped in `kokoro-js`.
    `npm pack` only downloads archives; no package code runs. The joined model must match
    the published checksum, and is a plain ONNX graph (no custom operators or code)."""
    import glob
    import hashlib as hl
    import tarfile
    import tempfile
    os.makedirs(os.path.join(MODEL_DIR, "voices"), exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["npm", "pack", "kokoro-q8-shards@1.0.0", "kokoro-js@1.2.1", "--ignore-scripts"],
                       cwd=tmp, check=True, capture_output=True)
        for tgz in glob.glob(os.path.join(tmp, "*.tgz")):
            with tarfile.open(tgz) as tf:
                tf.extractall(os.path.join(tmp, os.path.basename(tgz)[:-4]), filter="data")
        shards = sorted(glob.glob(os.path.join(tmp, "kokoro-q8-shards-1.0.0", "package", "kokoro-q8.part*.bin")))
        h = hl.sha256()
        with open(MODEL + ".part", "wb") as out:
            for p in shards:
                data = open(p, "rb").read()
                h.update(data)
                out.write(data)
        if h.hexdigest() != NPM_MODEL_SHA256:
            os.remove(MODEL + ".part")
            raise SystemExit("model checksum mismatch - refusing to use it")
        os.replace(MODEL + ".part", MODEL)
        voices = {}
        for p in glob.glob(os.path.join(tmp, "kokoro-js-1.2.1", "package", "voices", "*.bin")):
            name = os.path.basename(p)[:-4]
            voices[name] = np.fromfile(p, dtype=np.float32).reshape(-1, 1, 256)
        np.savez(VOICES, **voices)
    print(f"model ok (sha256 verified), {len(voices)} voices")


SENTENCE = re.compile(r"(?<=[.!?…])[\"')\]]?\s+(?=[\"'(\[A-Z0-9])")
CUE = re.compile(r"\[(\w+)(?::([^\]]*))?\]")


def split_sentences(paragraph):
    """Split on sentence ends, keeping cue markers attached to the words they precede."""
    parts = SENTENCE.split(paragraph.strip())
    return [p.strip() for p in parts if p.strip()]


def strip_cues(text):
    """Return (spoken text, [(char offset in spoken text, cue name, cue arg)])."""
    cues, out, last = [], [], 0
    for m in CUE.finditer(text):
        out.append(text[last:m.start()])
        spoken_so_far = re.sub(r"\s+", " ", "".join(out)).lstrip()
        cues.append((len(spoken_so_far), m.group(1), m.group(2)))
        last = m.end()
    out.append(text[last:])
    spoken = re.sub(r"\s+", " ", "".join(out)).strip()
    return spoken, cues


class Narrator:
    def __init__(self, voice="bm_george", speed=0.95, lang="en-gb", cache_dir=None, respell=None):
        self.respell = [(re.compile(rf"\b{re.escape(k)}\b"), v) for k, v in (respell or {}).items()]
        if not (os.path.exists(MODEL) and os.path.exists(VOICES)):
            raise SystemExit("Kokoro model not found - run `python -m lantern.voice --fetch` "
                             "(needs huggingface.co reachable).")
        from kokoro_onnx import Kokoro
        self.tts = Kokoro(MODEL, VOICES)
        self.voice, self.speed, self.lang = voice, speed, lang
        self.cache_dir = cache_dir

    def _tokens(self, text):
        if not text.strip():
            return 0
        ph = self.tts.tokenizer.phonemize(text, self.lang)
        return len(self.tts.tokenizer.tokenize(" ".join(ph.split())))

    def say_as(self, text):
        """The text as the voice should read it (respelled names); captions keep the original."""
        for pat, rep in self.respell:
            text = pat.sub(rep, text)
        return text

    def sentence(self, text):
        """Synthesise one sentence -> (audio float32 @24k, [(char offset, seconds)] lookup fn)."""
        original, text = text, self.say_as(text)
        key = hashlib.sha1(f"{self.voice}|{self.speed}|{self.lang}|{text}".encode()).hexdigest()[:16]
        cache = os.path.join(self.cache_dir, f"{key}.npz") if self.cache_dir else None
        if cache and os.path.exists(cache):
            z = np.load(cache)
            audio, starts = z["audio"], z["starts"]
        else:
            audio, _, spoken = self.tts.create_timed(text, self.voice, self.speed, self.lang)
            starts = np.array([t.start for t in spoken], np.float32)
            if cache:
                os.makedirs(self.cache_dir, exist_ok=True)
                np.savez(cache, audio=audio, starts=starts)
        total = max(1, self._tokens(text))
        dur = len(audio) / SR

        def at(char_offset):
            """Seconds into this sentence when the word at `char_offset` begins."""
            n = self._tokens(self.say_as(original[:char_offset]))
            if len(starts):
                return float(starts[min(n, len(starts) - 1)])
            return dur * n / total

        return audio.astype(np.float32), at


class SilentEstimator:
    """Layout preview only: silent clips whose length is estimated from phoneme counts.

    Lets the director block scenes before the voice model is installed. Never used for a
    real episode - the director labels anything built this way as a silent preview.
    """
    SECONDS_PER_TOKEN = 0.072  # measured average for Kokoro British voices at speed 1.0

    def __init__(self, voice="bm_george", speed=0.95, lang="en-gb", cache_dir=None):
        from kokoro_onnx.tokenizer import Tokenizer
        self.tok, self.speed, self.lang = Tokenizer(), speed, lang

    def _tokens(self, text):
        if not text.strip():
            return 0
        return len(self.tok.tokenize(" ".join(self.tok.phonemize(text, self.lang).split())))

    def sentence(self, text):
        total = max(1, self._tokens(text))
        dur = total * self.SECONDS_PER_TOKEN / self.speed
        return np.zeros(int(dur * SR), np.float32), lambda off: dur * self._tokens(text[:off]) / total


def write_wav(path, audio, sr=SR):
    pcm = (np.clip(audio, -1, 1) * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(pcm.tobytes())


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument("--fetch", action="store_true", help="download Kokoro from huggingface.co")
    ap.add_argument("--fetch-npm", action="store_true",
                    help="download the unofficial npm copy of Kokoro (checksum-verified) instead")
    ap.add_argument("--say")
    ap.add_argument("--voice", default="bm_george")
    ap.add_argument("--speed", type=float, default=0.95)
    ap.add_argument("-o", "--out", default="out/say.wav")
    a = ap.parse_args(argv)
    if a.fetch:
        fetch()
    if a.fetch_npm:
        fetch_npm()
    if a.say:
        n = Narrator(a.voice, a.speed)
        audio, _ = n.sentence(a.say)
        os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
        write_wav(a.out, audio)
        print(f"wrote {a.out} ({len(audio) / SR:.2f}s)")
    if not (a.fetch or a.fetch_npm or a.say):
        ap.print_help(sys.stderr)


if __name__ == "__main__":
    main()
