"""Original solo-piano score for the video, rendered from Salamander Grand Piano samples.

Each scene gets a whole number of bars, and its tempo is nudged (around 72 BPM) so that every
scene change lands exactly on a downbeat. Left hand: broken-chord eighths. Right hand: a sparse
melody on chord tones, deterministic (seeded), so every render is identical.

    python3 tools/music.py            -> .work/music.wav (48 kHz stereo, unmastered)
"""
import json, re, subprocess, sys
from pathlib import Path
import numpy as np
from scipy.signal import fftconvolve, butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
NM = ROOT / "node_modules/@audio-samples"
LAYERS = {6: NM / "piano-mp3-velocity6/audio", 8: NM / "piano-mp3-velocity8/audio", 10: NM / "piano-mp3-velocity10/audio"}
NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
SAMPLED = {0: "C", 3: "D#", 6: "F#", 9: "A"}  # Salamander keeps every minor third

def midi(name):  # "A3" -> 57
    m = re.match(r"([A-G]#?)(-?\d)", name)
    return NAMES.index(m[1]) + 12 * (int(m[2]) + 1)

_cache = {}
def sample(note, layer):
    """Nearest recorded key, repitched by resampling (at most +-1 semitone)."""
    best = min((n for n in range(21, 109) if n % 12 in SAMPLED), key=lambda n: abs(n - note))
    key = (best, layer)
    if key not in _cache:
        name = f"{SAMPLED[best % 12]}{best // 12 - 1}v{layer}.mp3"
        raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(LAYERS[layer] / name), "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"],
                             capture_output=True, check=True).stdout
        _cache[key] = np.frombuffer(raw, np.float32).reshape(-1, 2)
    x = _cache[key]
    ratio = 2 ** ((note - best) / 12)
    if ratio == 1:
        return x
    idx = np.arange(0, len(x) - 1, ratio)
    i0 = idx.astype(int); f = (idx - i0)[:, None]
    return x[i0] * (1 - f) + x[i0 + 1] * f

# chords as (root, quality) in A minor / C major; all progressions are stock functional harmony
CH = {"Am": [57, 60, 64], "F": [53, 57, 60], "C": [48, 52, 55], "G": [55, 59, 62], "Dm": [50, 53, 57],
      "E": [52, 56, 59], "Em": [52, 55, 59], "Fmaj7": [53, 57, 60, 64]}
PROG = {
    "hook":   ["Am", "Am", "F", "F", "C", "C", "G", "E"],
    "choice": ["Am", "F", "C", "G"],
    "flood":  ["Dm", "Am", "E", "Am"],
    "child":  ["Am", "Em", "F", "C", "Dm", "Am", "E", "E"],
    "layer":  ["F", "C", "Dm", "Am"],
    "miss":   ["Dm", "F", "E", "Am"],
    "try":    ["C", "G", "Am", "F"],
    "watch":  ["F", "C", "G", "Am", "F", "C", "G", "C"],
}
PROG.update({
    "forever": ["Am", "F", "C", "G"],
    "reverse": ["Dm", "Am", "E", "Am"],
    "inside":  ["F", "C", "Dm", "Am"],
    "twist":   ["Dm", "F", "E", "Am"],
    "end":     ["F", "C", "G", "Am", "F", "C", "G", "C"],
})
PROG.update({
    "origins":   ["Am", "Em", "F", "C", "Dm", "Am", "E", "E"],
    "lucy":      ["C", "G", "Am", "F"],
    "exposure":  ["F", "C", "G", "Am"],
    "money":     ["C", "G", "Am", "F"],
    "crack":     ["Dm", "Am", "E", "Am"],
    "wars":      ["Am", "F", "C", "G"],
    "answers":   ["F", "C", "Dm", "Am"],
    "nostalgia": ["Dm", "F", "E", "Am"],
    "timeline":  ["F", "C", "G", "Am"],
    "mirror":    ["F", "C", "G", "Am", "F", "C", "G", "C"],
})
DYN = {"origins": 0.8, "lucy": 0.85, "exposure": 0.8, "money": 0.85, "crack": 0.75, "wars": 0.85, "answers": 0.8, "nostalgia": 0.8,
       "timeline": 0.9, "mirror": 1.0, "forever": 0.8, "reverse": 0.8, "inside": 0.8, "twist": 0.85, "end": 1.0, "hook": 0.9, "choice": 0.8, "flood": 0.75, "child": 0.8, "layer": 0.75, "miss": 0.8, "try": 0.9, "watch": 1.0}

def scenes():
    html = (ROOT / "index.html").read_text()
    out = re.findall(r'data-composition-id="(\w+)" data-composition-src="[^"]+" data-start="([\d.]+)" data-duration="([\d.]+)"', html)
    return [(i, float(s), float(d)) for i, s, d in out]

def render():
    sc = scenes()
    total = sc[-1][1] + sc[-1][2] + 4.0
    out = np.zeros((int(total * SR), 2), np.float32)
    rng = np.random.default_rng(7)
    log = []

    def put(t, note, vel, length):
        layer = 6 if vel < 0.45 else 8 if vel < 0.75 else 10
        x = sample(note, layer)[: int((length + 0.6) * SR)].copy()
        n = len(x)
        rel = int(0.6 * SR)  # damper release
        env = np.ones(n, np.float32)
        if n > rel:
            env[-rel:] = np.linspace(1, 0, rel) ** 2
        pan = np.clip((note - 60) / 40, -0.35, 0.35)  # low left, high right, gently
        gains = np.array([1 - max(pan, 0), 1 + min(pan, 0)], np.float32)
        x = x * env[:, None] * gains * (0.35 + 0.65 * vel)
        i = int(t * SR)
        out[i : i + n] += x[: max(0, len(out) - i)]

    prev_mel = 76
    for k, (sid, start, dur) in enumerate(sc):
        bars = max(4, round(dur / (4 * 60 / 72)))
        if k == len(sc) - 1:
            bars = max(4, round((dur - 3.0) / (4 * 60 / 72)))  # leave the final chord ringing
        beat = (dur if k < len(sc) - 1 else dur - 3.0) / (bars * 4)
        log.append(f"{sid:7s} start {start:7.2f}s  {bars:2d} bars  {60 / beat:5.1f} BPM")
        prog = PROG.get(sid, ["Am", "F", "C", "G"])
        d = DYN.get(sid, 0.85)
        for b in range(bars):
            chord = CH[prog[b % len(prog)]]
            t0 = start + b * 4 * beat
            # left hand: root low, then broken chord in eighths  (1 + & 2 + 3 + & 4)
            bass = chord[0] - 12
            put(t0, bass, 0.42 * d, 4 * beat)
            pattern = [chord[0], chord[1], chord[2], chord[1] + 12 if len(chord) == 3 else chord[3], chord[2], chord[1]]
            for j, n in enumerate(pattern):
                put(t0 + (j + 1) * 0.5 * beat, n, (0.28 + 0.05 * (j == 0)) * d, 2 * beat)
            # right hand: a sparse melody on beat 1 (and sometimes 3), on chord tones near the last note
            if b % 2 == 0 or rng.random() < 0.35:
                tones = [n + 12 * o for n in chord for o in (1, 2)]
                tones = [n for n in tones if 69 <= n <= 84]
                mel = min(tones, key=lambda n: abs(n - prev_mel) + (0 if n != prev_mel else 3))
                put(t0, mel, 0.5 * d, 3 * beat)
                prev_mel = mel
                if rng.random() < 0.4:
                    step = [n for n in tones if n != mel]
                    put(t0 + 2 * beat, min(step, key=lambda n: abs(n - mel)), 0.4 * d, 2 * beat)
            # a soft downbeat bell at every scene change: low root + high octave
            if b == 0 and k > 0:
                put(t0, chord[0] + 24, 0.55 * d, 4 * beat)
    # final chord rings out
    end = sc[-1][1] + sc[-1][2] - 3.0
    for n in [45, 57, 60, 64, 69, 72]:
        put(end, n, 0.5, 4.0)

    # room: synthetic stereo plate, high-passed, ~2.4 s tail, 22% wet
    t = np.arange(int(2.4 * SR)) / SR
    noise = np.random.default_rng(3).standard_normal((len(t), 2)).astype(np.float32)
    ir = noise * np.exp(-t / 0.55)[:, None]
    ir = sosfilt(butter(2, [250, 7000], "bandpass", fs=SR, output="sos"), ir, axis=0)
    ir /= np.abs(ir).sum(axis=0).max() / 8
    wet = np.stack([fftconvolve(out[:, c], ir[:, c])[: len(out)] for c in range(2)], axis=1)
    mix = out * 0.78 + wet * 0.22
    mix = sosfilt(butter(2, 45, "highpass", fs=SR, output="sos"), mix, axis=0)
    mix /= np.abs(mix).max() / 0.8
    (ROOT / ".work").mkdir(exist_ok=True)
    import wave
    with wave.open(str(ROOT / ".work/music.wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype("<i2").tobytes())
    print("\n".join(log))
    print(f"music {len(mix) / SR:.1f}s -> .work/music.wav")

if __name__ == "__main__":
    render()
