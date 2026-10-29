"""Synthesised stage foley (projector hum, curtain swish, paper slides, lantern clacks)
mixed with any narration / music tracks listed in the scene file."""
import os
import subprocess
import wave

import numpy as np

SR = 44100


def _lowpass(x, k):
    """Moving-average low-pass; larger k = darker sound."""
    if k <= 1:
        return x
    c = np.cumsum(np.insert(x, 0, 0.0))
    y = (c[k:] - c[:-k]) / k
    return np.concatenate([y, np.zeros(k - 1)])


def _hum(n, rng):
    t = np.arange(n) / SR
    wob = 1 + 0.15 * np.sin(2 * np.pi * 0.23 * t)
    tone = np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 100 * t) + 0.2 * np.sin(2 * np.pi * 150 * t)
    fan = _lowpass(rng.normal(0, 1, n), 40)
    return 0.010 * tone * wob + 0.05 * fan


def _clack(rng):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    click = rng.normal(0, 1, n) * np.exp(-t * 90)
    thump = np.sin(2 * np.pi * 110 * t) * np.exp(-t * 30)
    return 0.35 * (click - _lowpass(click, 6)) + 0.25 * thump


def _swish(dur, rng, amp=0.16):
    n = int(dur * SR)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    return amp * _lowpass(rng.normal(0, 1, n), 14) * env * 3


def _slide(dur, rng):
    n = int(max(0.3, dur * 0.6) * SR)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    noise = rng.normal(0, 1, n)
    return 0.05 * (noise - _lowpass(noise, 8)) * env


def _load(path):
    """Decode any audio file to mono float via ffmpeg."""
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-f", "s16le", "-ac", "1",
                          "-ar", str(SR), "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def _add(mix, sig, at):
    i = int(at * SR)
    if i >= len(mix):
        return
    sig = sig[: len(mix) - i]
    mix[i: i + len(sig)] += sig


def render(path, events, total, cfg, base_dir):
    rng = np.random.default_rng(5)
    n = int(total * SR) + SR
    mix = _hum(n, rng) * cfg.get("hum", 1.0)
    for kind, at, dur in events:
        if kind == "clack":
            _add(mix, _clack(rng), at)
        elif kind == "curtain":
            _add(mix, _swish(dur, rng), at)
        elif kind == "slide":
            _add(mix, _slide(dur, rng), at)
    tracks = [(tr, _load(os.path.join(base_dir, tr["file"])) * tr.get("volume", 1.0))
              for tr in cfg.get("tracks", [])]
    # speech envelope from voice tracks, so music can dip under the narrator
    speech = np.zeros(n, np.float32)
    for tr, sig in tracks:
        if tr.get("voice"):
            _add(speech, np.abs(sig), tr.get("at", 0.0))
    if speech.any():
        env = _lowpass(_lowpass(np.minimum(speech * 8, 1.0), int(0.25 * SR)), int(0.4 * SR))
    for tr, sig in tracks:
        if tr.get("duck") and speech.any():
            i = int(tr.get("at", 0.0) * SR)
            seg = env[i:i + len(sig)]
            sig = sig[:len(seg)] * (1 - tr["duck"] * np.clip(seg * 1.6, 0, 1))
        _add(mix, sig, tr.get("at", 0.0))
    mix = np.tanh(mix * 1.2) / 1.2
    pcm = (mix.clip(-1, 1) * 32767).astype(np.int16)
    stereo = np.stack([pcm, pcm], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())
