"""Aligner accuracy test with known ground truth.

Each sentence is synthesised separately with eSpeak (bundled with the phonemizer; robotic,
test-only), then joined with random reader-like pauses, so the true sentence times are known.

    python3 tests/test_align.py
"""
import ctypes
import os
import sys

import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from lantern.align import align  # noqa: E402
from lantern.voice import split_sentences, strip_cues  # noqa: E402

SR = 24000


class ESpeak:
    def __init__(self, voice=b"en-gb", rate=165):
        import espeakng_loader as el
        self.lib = ctypes.CDLL(el.get_library_path())
        data_parent = os.path.dirname(el.get_data_path())
        self.sr = self.lib.espeak_Initialize(2, 0, data_parent.encode(), 0)  # AUDIO_OUTPUT_SYNCHRONOUS
        self.buf = []
        CB = ctypes.CFUNCTYPE(ctypes.c_int, ctypes.POINTER(ctypes.c_short), ctypes.c_int, ctypes.c_void_p)

        def cb(wav, n, events):
            if n > 0:
                self.buf.append(np.ctypeslib.as_array(wav, shape=(n,)).copy())
            return 0
        self._cb = CB(cb)
        self.lib.espeak_SetSynthCallback(self._cb)
        self.lib.espeak_SetVoiceByName(voice)
        self.lib.espeak_SetParameter(1, rate, 0)  # espeakRATE

    def say(self, text):
        self.buf = []
        b = text.encode() + b"\0"
        self.lib.espeak_Synth(b, len(b), 0, 1, 0, 1, None, None)  # POS_CHARACTER, espeakCHARS_UTF8
        self.lib.espeak_Synchronize()
        a = np.concatenate(self.buf).astype(np.float32) / 32768 if self.buf else np.zeros(1, np.float32)
        idx = np.nonzero(np.abs(a) > 0.01)[0]  # trim espeak's own silence
        a = a[idx[0]:idx[-1] + 1] if len(idx) else a
        if self.sr != SR:
            x = np.linspace(0, len(a) - 1, int(len(a) * SR / self.sr))
            a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
        return a


def main():
    import yaml
    from kokoro_onnx.tokenizer import Tokenizer
    tok = Tokenizer()

    def tokens(t):
        return len(tok.tokenize(" ".join(tok.phonemize(t, "en-gb").split()))) if t.strip() else 0

    ep = yaml.safe_load(open(os.path.join(os.path.dirname(__file__), "..", "episodes",
                                          "01-the-king-in-the-marsh", "episode.yaml")))
    es = ESpeak()
    rng = np.random.default_rng(1)
    worst, errs = 0.0, []
    for sc in ep["scenes"]:
        sents = [strip_cues(s)[0] for s in split_sentences(" ".join(sc["narration"].split()))]
        sents = [s for s in sents if s]
        parts, truth, t = [np.zeros(int(0.6 * SR), np.float32)], [], 0.6
        for s in sents:
            # a dramatic reader: clauses with pauses inside the sentence too
            clauses = [c for c in s.replace("...", ",").split(",") if c.strip()]
            start = t
            for ci, c in enumerate(clauses):
                a = es.say(c)
                parts.append(a)
                t += len(a) / SR
                if ci < len(clauses) - 1:
                    p = rng.uniform(0.15, 0.55)
                    parts.append(np.zeros(int(p * SR), np.float32))
                    t += p
            truth.append((start, t))
            pause = rng.uniform(0.2, 0.9)
            parts.append(np.zeros(int(pause * SR), np.float32))
            t += pause
        audio = np.concatenate(parts) + rng.normal(0, 0.002, sum(map(len, parts))).astype(np.float32)
        al = align(audio, sents, tokens)
        for (ts, te), (s, e) in zip(truth, al.spans):
            errs.append(abs(ts - s))
            worst = max(worst, abs(ts - s), abs(te - e))
        print(f"{sc['id']:<16} {len(sents):2d} sentences, max start error "
              f"{max(abs(a[0] - b[0]) for a, b in zip(truth, al.spans)):.2f}s")
    print(f"\nmean start error {np.mean(errs):.3f}s, worst boundary error {worst:.2f}s")
    assert worst < 0.5, "aligner misplaced a sentence"


if __name__ == "__main__":
    main()
