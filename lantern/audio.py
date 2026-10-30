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
    sfx = np.zeros(n)  # effects are mixed separately so they can step back under the narrator
    for ev in events:  # (kind, at, dur[, extra])
        kind, at, dur = ev[:3]
        extra = ev[3] if len(ev) > 3 else None
        if kind == "clack":
            _add(mix, _clack(rng), at)
        elif kind == "curtain":
            _add(mix, _swish(dur, rng), at)
        elif kind == "slide":
            _add(mix, _slide(dur, rng), at)
        else:
            sig = synth_sfx(kind, dur, extra, rng)
            if sig is not None:
                _add(sfx, sig * cfg.get("sfx", 1.0), at)
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
    if sfx.any():
        if speech.any():
            sfx *= 1 - cfg.get("sfx_duck", 0.45) * np.clip(env * 1.6, 0, 1)
        mix += sfx
    mix = np.tanh(mix * 1.2) / 1.2
    pcm = (mix.clip(-1, 1) * 32767).astype(np.int16)
    stereo = np.stack([pcm, pcm], 1)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(stereo.tobytes())


# ---------------------------------------------------------------------------- sound effects
# Everything is synthesised, so there is nothing to license. Each returns a mono signal.

def _t(dur):
    return np.arange(int(dur * SR)) / SR


def _env(n, attack, decay_rate):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(attack, 1e-3)) * np.exp(-t * decay_rate)


def _ping(f, dur=0.6, decay=9.0):
    t = _t(dur)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t)) * _env(len(t), 0.002, decay)


def sfx_assemble(dur, rng):       # glass shards tinkling into place
    out = np.zeros(int((dur + 0.8) * SR))
    for _ in range(18):
        at = rng.uniform(0, dur) ** 0.8 * dur ** 0.2
        p = _ping(rng.uniform(2200, 6000), 0.5, rng.uniform(10, 22)) * rng.uniform(0.15, 0.4)
        i = int(at * SR)
        out[i:i + len(p)] += p[: len(out) - i]
    return out * 0.35


def sfx_break(dur, rng, big=False):  # glass breaking: a crack, a burst, then shards falling
    n = int((2.2 if big else 1.4) * SR)
    out = np.zeros(n)
    burst = rng.normal(0, 1, int(0.35 * SR))
    burst = (burst - _lowpass(burst, 3)) * _env(len(burst), 0.001, 9)
    out[:len(burst)] += burst * 0.6
    out[:int(0.5 * SR)] += _boom(0.5, rng)[:int(0.5 * SR)] * (0.5 if big else 0.25)
    for _ in range(40 if big else 22):
        at = rng.uniform(0.02, n / SR - 0.4) ** 1.3
        p = _ping(rng.uniform(1800, 7000), 0.35, rng.uniform(14, 30)) * rng.uniform(0.1, 0.35)
        i = int(at * SR)
        out[i:i + len(p)] += p[: n - i]
    return out * (0.55 if big else 0.42)


def _boom(dur, rng):
    t = _t(dur)
    f = 40 + 30 * np.exp(-t * 6)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(len(t), 0.005, 4.5)
    rumble = _lowpass(rng.normal(0, 1, len(t)), 60) * 4 * _env(len(t), 0.01, 3.5)
    return body + rumble


def sfx_boom(dur, rng):
    return _boom(1.4, rng) * 0.45


def sfx_whoosh(dur, rng, length=0.45, gain=0.35):
    n = int(length * SR)
    noise = rng.normal(0, 1, n)
    env = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    lo, hi = _lowpass(noise, 30), _lowpass(noise, 6)
    sweep = np.linspace(0, 1, n)
    return (lo * (1 - sweep) + hi * sweep) * env * gain * 2


def sfx_strike(dur, rng):         # a lunge that lands
    w = sfx_whoosh(0, rng, 0.3, 0.3)
    hit = _boom(0.4, rng) * 0.35
    out = np.zeros(len(w) + len(hit))
    out[:len(w)] += w
    out[int(0.22 * SR):int(0.22 * SR) + len(hit)] += hit
    return out


def sfx_shimmer(dur, rng, length=1.4, gain=0.18, base=880):  # light catching gold glass
    t = _t(length)
    out = np.zeros(len(t))
    for k, ratio in enumerate((1, 1.5, 2, 2.5, 3)):
        out += np.sin(2 * np.pi * base * ratio * t + rng.uniform(0, 6)) * (0.8 ** k)
    return out * np.minimum(1, t / 0.25) * np.exp(-t * 2.2) * gain


def sfx_rise(dur, rng):           # an angel rising: a shimmer that climbs
    t = _t(2.6)
    f = 600 * (1 + t * 0.6)
    out = sum(np.sin(2 * np.pi * np.cumsum(f * r) / SR) * 0.7 ** i for i, r in enumerate((1, 1.5, 2)))
    return out * np.sin(np.pi * np.linspace(0, 1, len(t))) * 0.16


def sfx_swell(dur, rng, length=2.6, gain=0.2):  # light pouring through: a soft major chord swelling
    t = _t(length)
    out = np.zeros(len(t))
    for f in (220, 277.2, 329.6, 440, 554.4):
        for det in (-0.6, 0.6):
            out += np.sin(2 * np.pi * (f + det) * t)
    env = np.sin(np.pi * np.minimum(1, t / length)) ** 1.5
    return _lowpass(out, 3) * env * gain / 6


def sfx_descend(dur, rng):        # the glass going dark
    t = _t(2.0)
    f = 110 * np.exp(-t * 0.4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * np.linspace(0, 1, len(t))) * 0.25


def sfx_thud(dur, rng):
    t = _t(0.5)
    f = 70 + 60 * np.exp(-t * 20)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(len(t), 0.002, 9) +
            _lowpass(rng.normal(0, 1, len(t)), 20) * _env(len(t), 0.001, 25)) * 0.5


def sfx_growl(dur, rng):          # a lion's roar, roughly: a gliding saw through a noisy throat
    t = _t(1.3)
    f = 150 * np.exp(-t * 0.5)
    saw = 2 * ((np.cumsum(f) / SR) % 1) - 1
    rough = 1 + 0.6 * np.sin(2 * np.pi * 28 * t) * rng.uniform(0.8, 1.2)
    noise = _lowpass(rng.normal(0, 1, len(t)), 8)
    env = np.minimum(1, t / 0.12) * np.exp(-t * 1.4)
    return _lowpass(saw * rough + noise * 0.8, 5) * env * 0.5


def sfx_jeer(dur, rng):           # a crowd laughing and jeering
    n = int(2.0 * SR)
    out = np.zeros(n)
    for _ in range(60):
        L = int(rng.uniform(0.08, 0.18) * SR)
        at = int(rng.uniform(0, 1.8) * SR)
        f = rng.uniform(140, 320)
        tt = np.arange(L) / SR
        voice = np.sign(np.sin(2 * np.pi * f * tt)) * np.sin(np.pi * np.linspace(0, 1, L)) ** 2
        out[at:at + L] += _lowpass(voice + rng.normal(0, 0.4, L), 10)[: n - at] * rng.uniform(0.05, 0.12)
    return out * np.sin(np.pi * np.linspace(0, 1, n)) ** 0.5


def sfx_clink(dur, rng):          # a coin, or a link of chain
    return (_ping(rng.uniform(3000, 4200), 0.25, 26) + _ping(rng.uniform(5200, 6800), 0.25, 34) * 0.5) * 0.18


def sfx_clinks(dur, rng, count=5, gap=0.32):
    out = np.zeros(int((count * gap + 0.4) * SR))
    for i in range(count):
        for j in range(3):
            c = sfx_clink(0, rng)
            at = int((i * gap + j * 0.05) * SR)
            out[at:at + len(c)] += c[: len(out) - at]
    return out


def sfx_rattle(dur, rng):
    out = np.zeros(int(0.5 * SR))
    for j in range(6):
        c = sfx_clink(0, rng) * 0.7
        at = int(j * 0.06 * SR)
        out[at:at + len(c)] += c[: len(out) - at]
    return out


def sfx_tally(dur, rng):          # a thousand small lights: ticks rushing faster and higher
    out = np.zeros(int(2.4 * SR))
    tt = 0.0
    k = 0
    while tt < 2.0:
        p = _ping(1500 + 2500 * tt / 2.0, 0.08, 60) * 0.12
        i = int(tt * SR)
        out[i:i + len(p)] += p[: len(out) - i]
        tt += 0.09 * (1 - tt / 2.4) + 0.012
        k += 1
    return out


def sfx_chime(dur, rng, f=1046.5):  # a small bell
    t = _t(1.6)
    out = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.0 * t) + 0.25 * np.sin(2 * np.pi * f * 3.0 * t))
    return out * _env(len(t), 0.003, 3.2) * 0.16


def sfx_chimes(dur, rng, times=(0.0,)):
    scale = (784, 880, 988, 1175, 1319)
    out = np.zeros(int((times[-1] - times[0] + 1.8) * SR))
    for i, tt in enumerate(times):
        c = sfx_chime(0, rng, scale[i % len(scale)])
        at = int((tt - times[0]) * SR)
        out[at:at + len(c)] += c[: len(out) - at]
    return out


def sfx_paper(dur, rng):          # a parchment scroll unrolling
    n = int(0.6 * SR)
    noise = rng.normal(0, 1, n)
    crinkle = (noise - _lowpass(noise, 4)) * (rng.random(n) < 0.08)
    return _lowpass(crinkle, 2) * np.sin(np.pi * np.linspace(0, 1, n)) * 0.5


def sfx_tick(dur, rng):
    return _ping(2600, 0.05, 90) * 0.12


def sfx_grind(dur, rng):          # a millstone turning, for as long as it turns
    n = int(max(1.0, dur) * SR)
    t = np.arange(n) / SR
    rumble = _lowpass(rng.normal(0, 1, n), 40) * 3
    turn = 0.6 + 0.4 * np.sin(2 * np.pi * 0.3 * t)
    fade = np.minimum(1, t / 0.8) * np.minimum(1, (n / SR - t) / 0.8)
    return rumble * turn * fade * 0.18


def sfx_fire(dur, rng):           # an altar fire catching
    n = int(2.0 * SR)
    noise = _lowpass(rng.normal(0, 1, n), 12)
    crackle = (rng.random(n) < 0.004) * np.clip(rng.normal(0, 1, n), -2.5, 2.5)
    return (noise * 0.5 + crackle) * np.minimum(1, np.arange(n) / SR / 0.4) * 0.2


SFX = {
    "assemble": sfx_assemble, "break": sfx_break, "break_big": lambda d, r: sfx_break(d, r, big=True),
    "boom": sfx_boom, "whoosh": sfx_whoosh, "whoosh_small": lambda d, r: sfx_whoosh(d, r, 0.3, 0.18),
    "strike": sfx_strike, "shimmer": sfx_shimmer, "shimmer_long": lambda d, r: sfx_shimmer(d, r, 3.0, 0.14, 660),
    "sparkle": lambda d, r: sfx_shimmer(d, r, 0.9, 0.12, 1320), "rise": sfx_rise, "swell": sfx_swell,
    "swell_small": lambda d, r: sfx_swell(d, r, 1.6, 0.12), "descend": sfx_descend, "thud": sfx_thud,
    "roar": sfx_growl, "growl": sfx_growl, "jeer": sfx_jeer, "clink": sfx_clink, "rattle": sfx_rattle,
    "tally": sfx_tally, "chime": sfx_chime, "paper": sfx_paper, "tick": sfx_tick, "grind": sfx_grind,
    "fire": sfx_fire, "sting": lambda d, r: sfx_boom(d, r) * 0.8,
}


def synth_sfx(kind, dur, extra, rng):
    if kind == "clinks":
        return sfx_clinks(dur, rng, count=int(extra or 5))
    if kind == "chimes":
        return sfx_chimes(dur, rng, times=tuple(extra or (0.0,)))
    fn = SFX.get(kind)
    return fn(dur, rng) if fn else None
