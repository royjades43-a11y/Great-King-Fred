"""Procedural score: a recurring music-box motif (the channel's sonic signature) over
drones and drums, shaped by a mood per scene.

Moods: mystery, somber, tense, battle, triumph, wonder.
"""
import numpy as np

SR = 44100

# D dorian-ish material; the motif is the channel's signature and recurs every episode.
MOTIF = [62, 65, 69, 67, 65, 64, 62]          # D F A G F E D (MIDI)
MOODS = {
    #           root  chord(intervals)  box_every  box_oct  drum_bpm  pad_gain brightness
    "mystery": (38, (0, 7, 15), 2.6, 12, None, 0.55, 0.35),
    "somber": (38, (0, 3, 7), 3.4, 0, None, 0.6, 0.25),
    "tense": (38, (0, 1, 7), 3.0, 0, 64, 0.5, 0.3),
    "battle": (38, (0, 7, 12), 1.6, 0, 96, 0.6, 0.55),
    "triumph": (38, (0, 4, 7, 12), 1.4, 12, None, 0.6, 0.6),
    "wonder": (41, (0, 4, 7, 11), 1.9, 12, None, 0.5, 0.5),
    "psalm": (38, (0, 4, 7, 12, 16), 2.4, 12, None, 0.6, 0.4),   # open major chord, hymn-like
}


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def _lowpass(x, k):
    if k <= 1:
        return x
    c = np.cumsum(np.insert(x, 0, 0.0))
    y = (c[k:] - c[:-k]) / k
    return np.concatenate([y, np.full(k - 1, y[-1] if len(y) else 0.0)])


def pad(n, root, chord, brightness, rng):
    t = np.arange(n) / SR
    out = np.zeros(n)
    for iv in chord:
        f = hz(root + iv)
        for det in (-0.12, 0.0, 0.11):  # detuned saws, a soft string-like bed
            ph = rng.uniform(0, 1)
            saw = 2 * ((t * f * (1 + det / 100) + ph) % 1) - 1
            out += saw
    out = _lowpass(out, int(18 - 12 * brightness))
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t + rng.uniform(0, 6))
    return out * lfo / (len(chord) * 3)


def box_note(midi, length=2.2):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = hz(midi)
    tone = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) + 0.12 * np.sin(2 * np.pi * 4.2 * f * t)
    env = np.exp(-t * 2.6) * np.minimum(1, t / 0.003)
    return tone * env


def drum(length=0.5):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 46 + 50 * np.exp(-t * 25)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
    skin = np.random.default_rng(0).normal(0, 1, n) * np.exp(-t * 40) * 0.25
    return body + skin


def section(n, mood, rng, motif_at_start=True, motif=MOTIF):
    root, chord, every, octv, bpm, pad_gain, bright = MOODS[mood]
    out = pad(n, root, chord, bright, rng) * pad_gain
    # music box: the motif first, then wandering phrases drawn from it
    t, i = 0.6, 0
    notes = motif if motif_at_start else []
    while t < n / SR - 0.5:
        if i < len(notes):
            m = notes[i] + octv
            step = 0.42
        else:
            m = motif[int(rng.integers(0, len(motif)))] + octv + (12 if rng.random() < 0.15 else 0)
            step = every * rng.uniform(0.6, 1.3)
        s = int(t * SR)
        nb = box_note(m)
        e = min(n, s + len(nb))
        out[s:e] += nb[: e - s] * 0.22
        t += step
        i += 1
    if bpm:
        beat = 60 / bpm
        d = drum()
        k = 0
        while k * beat < n / SR:
            for off, g in ((0.0, 1.0), (0.22, 0.55)) if mood == "tense" else ((0.0, 1.0),):
                s = int((k * beat + off) * SR)
                e = min(n, s + len(d))
                if s < n:
                    out[s:e] += d[: e - s] * 0.5 * g
            k += 1
    return out


def score(duration, sections, seed=7, motif=None):
    """sections: [(start, end, mood)] in seconds -> mono float array, crossfaded."""
    rng = np.random.default_rng(seed)
    n = int(duration * SR) + SR
    out = np.zeros(n)
    fade = int(2.0 * SR)
    last_mood = None
    for start, end, mood in sections:
        s = max(0, int(start * SR) - fade // 2)
        e = min(n, int(end * SR) + fade // 2)
        if e <= s:
            continue
        part = section(e - s, mood, rng, motif_at_start=(mood != last_mood), motif=motif or MOTIF)
        env = np.ones(e - s)
        f = min(fade, (e - s) // 2)
        env[:f] = np.linspace(0, 1, f)
        env[-f:] = np.linspace(1, 0, f)
        out[s:e] += part * env
        last_mood = mood
    peak = np.max(np.abs(out)) or 1.0
    return (out / peak * 0.8).astype(np.float32)
