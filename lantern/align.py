"""Time a script against a human (or any TTS) voiceover, with no speech model.

The recording is split into speech and silence. Sentence boundaries are then chosen among
the silences by dynamic programming, so that each sentence's spoken length matches its
phoneme count as closely as possible (long pauses are preferred as boundaries). Inside a
sentence a cue is placed by phoneme count along the *speech* time only, so a reader's
mid-sentence pauses don't push cues early.
"""
import math
import subprocess

import numpy as np

SR = 24000
FRAME = 0.01          # analysis hop, seconds
MIN_GAP = 0.16        # shortest silence that can separate sentences


def load_audio(path, sr=SR):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1",
                          "-ar", str(sr), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def speech_mask(audio, sr=SR):
    """Per-frame speech/silence decision from short-term energy with hysteresis."""
    hop = int(FRAME * sr)
    n = len(audio) // hop
    frames = audio[: n * hop].reshape(n, hop)
    db = 10 * np.log10(np.mean(frames ** 2, axis=1) + 1e-10)
    loud = np.percentile(db, 95)
    floor = np.percentile(db, 10)
    thresh = max(floor + 10, loud - 32)
    on = db > thresh
    # bridge tiny dropouts inside words, drop tiny clicks
    k = int(0.06 / FRAME)
    for i in range(1, n - 1):
        if not on[i] and on[max(0, i - k):i].any() and on[i + 1:i + 1 + k].any():
            on[i] = True
    return on


def gaps_of(on):
    """Silences as (start_s, end_s) between speech."""
    gaps, i, n = [], 0, len(on)
    while i < n:
        if not on[i]:
            j = i
            while j < n and not on[j]:
                j += 1
            gaps.append((i * FRAME, j * FRAME))
            i = j
        else:
            i += 1
    return gaps


class Aligned:
    """Sentence spans in a recording, and a word-time lookup inside each sentence."""

    def __init__(self, audio, spans, on, token_fn, sentences):
        self.audio, self.spans, self.on = audio, spans, on
        self.token_fn, self.sentences = token_fn, sentences

    def cue_time(self, i, char_offset):
        """Seconds into the recording where sentence i reaches `char_offset`."""
        s, e = self.spans[i]
        text = self.sentences[i]
        total = max(1, self.token_fn(text))
        frac = self.token_fn(text[:char_offset]) / total
        a, b = int(s / FRAME), int(e / FRAME)
        seg = self.on[a:b]
        if not seg.any():
            return s + (e - s) * frac
        cum = np.cumsum(seg)
        target = frac * cum[-1]
        idx = int(np.searchsorted(cum, max(1, target)))
        return s + min(idx, len(seg) - 1) * FRAME


def align(audio, sentences, token_fn, sr=SR):
    """Find each sentence's (start, end) in `audio`. Returns an Aligned."""
    on = speech_mask(audio, sr)
    if not on.any():
        raise ValueError("recording appears to be silent")
    first = np.argmax(on) * FRAME
    last = (len(on) - np.argmax(on[::-1])) * FRAME
    gaps = [(a, b) for a, b in gaps_of(on) if a > first and b < last and b - a >= MIN_GAP]
    tokens = [max(1, token_fn(s)) for s in sentences]
    n = len(sentences)
    if n == 1:
        return Aligned(audio, [(first, last)], on, token_fn, sentences)

    # candidate boundaries: middle of each gap; 0 = recording start, -1 = end
    cuts = [(first, first, 0.0)] + [((a + b) / 2, a, b - a) for a, b in gaps] + [(last, last, 0.0)]
    speech_cum = np.concatenate([[0], np.cumsum(on)]) * FRAME

    def speech_between(t0, t1):
        return speech_cum[int(t1 / FRAME)] - speech_cum[int(t0 / FRAME)]

    rate = speech_between(first, last) / sum(tokens)
    m = len(cuts)
    INF = float("inf")
    # cost[i][j]: best cost placing the first i sentences, with sentence i ending at cut j
    cost = np.full((n + 1, m), INF)
    back = np.zeros((n + 1, m), int)
    cost[0][0] = 0.0
    for i in range(1, n + 1):
        exp = tokens[i - 1] * rate
        lo = i if i < n else m - 1
        hi = m - (n - i) if i < n else m
        for j in range(lo, hi):
            if i == n and j != m - 1:
                continue
            best, arg = INF, 0
            for k in range(i - 1, j):
                if cost[i - 1][k] == INF:
                    continue
                dur = speech_between(cuts[k][0], cuts[j][0])
                if dur <= 0:
                    continue
                c = math.log(dur / exp) ** 2
                if i < n:
                    c -= 0.35 * min(cuts[j][2], 1.2)  # prefer clear pauses as sentence ends
                total = cost[i - 1][k] + c
                if total < best:
                    best, arg = total, k
            cost[i][j], back[i][j] = best, arg
    # walk back
    ends, j = [], m - 1
    for i in range(n, 0, -1):
        ends.append(j)
        j = back[i][j]
    ends = ends[::-1]
    spans, prev = [], 0
    for j in ends:
        start = cuts[prev][0] if prev == 0 else cuts[prev][1] + cuts[prev][2]  # gap end
        end = cuts[j][1] if j != m - 1 else last                                 # gap start
        spans.append((start, end))
        prev = j
    return Aligned(audio, spans, on, token_fn, sentences)


AUDIO_EXT = (".wav", ".mp3", ".m4a", ".aac", ".ogg", ".opus", ".flac", ".webm")
WHOLE_NAMES = ("full", "narration", "episode", "voiceover")


def find_recordings(voice_dir):
    """{stem: path} for every audio file in an episode's voice/ folder."""
    import os
    if not os.path.isdir(voice_dir):
        return {}
    return {os.path.splitext(f)[0]: os.path.join(voice_dir, f) for f in sorted(os.listdir(voice_dir))
            if f.lower().endswith(AUDIO_EXT)}


class RecordedVoice:
    """Narration from uploaded audio: one file per scene (voice/<scene id>.mp3) or one file for
    the whole episode (voice/full.mp3), split into scenes at the sentence boundaries."""

    def __init__(self, voice_dir, scene_sentences, lang="en-gb"):
        from kokoro_onnx.tokenizer import Tokenizer
        tok = Tokenizer()

        def tokens(text):
            text = text.strip()
            if not text:
                return 0
            return len(tok.tokenize(" ".join(tok.phonemize(text, lang).split())))

        self.tokens = tokens
        files = find_recordings(voice_dir)
        self.scenes = {}
        whole = next((files[n] for n in WHOLE_NAMES if n in files), None)
        if whole:
            ids = [sid for sid, sents in scene_sentences if sents]
            allsents = [s for _, sents in scene_sentences for s in sents]
            audio = load_audio(whole)
            al = align(audio, allsents, tokens)
            i = 0
            for sid, sents in scene_sentences:
                if sents:
                    self.scenes[sid] = (al, i, len(sents))
                    i += len(sents)
            self.source = {sid: whole for sid in ids}
        else:
            self.source = {}
            for sid, sents in scene_sentences:
                if not sents:
                    continue
                if sid not in files:
                    raise SystemExit(f"no recording for scene '{sid}': expected voice/{sid}.mp3 (or .wav, .m4a...)"
                                     f" - found {sorted(files) or 'nothing'}")
                al = align(load_audio(files[sid]), sents, tokens)
                self.scenes[sid] = (al, 0, len(sents))
                self.source[sid] = files[sid]

    def scene(self, sid):
        """-> (audio clip, [(start, end)] per sentence, cue_time(i, offset)) relative to the clip."""
        al, first, n = self.scenes[sid]
        spans = al.spans[first:first + n]
        t0 = max(0.0, spans[0][0] - 0.05)
        t1 = min(len(al.audio) / SR, spans[-1][1] + 0.12)
        clip = al.audio[int(t0 * SR):int(t1 * SR)]
        rel = [(s - t0, e - t0) for s, e in spans]

        def cue_time(i, off):
            return al.cue_time(first + i, off) - t0
        return clip, rel, cue_time
