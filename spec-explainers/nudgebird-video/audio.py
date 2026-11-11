"""Synthesized soundtrack + SFX for the Nudgebird explainer (no external samples).
Usage: python3 audio.py out.wav
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
DUR = 90.0
N = int(SR * DUR)
music = np.zeros((N, 2))
sfx = np.zeros((N, 2))
rng = np.random.default_rng(1)


def t_arr(d):
    return np.arange(int(SR * d)) / SR


def env(n, a=0.005, r=0.1, curve=4.0):
    e = np.ones(n)
    na = max(1, int(a * SR)); nr = max(1, min(n - na, int(r * SR)))
    e[:na] = np.linspace(0, 1, na)
    tail = np.linspace(1, 0, n - na) ** curve if r > 0 else 1
    e[na:] = tail
    return e


def lp(x, f, order=2):
    return sosfilt(butter(order, f, 'low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, 'high', fs=SR, output='sos'), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'band', fs=SR, output='sos'), x)


def add(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N: return
    sig = sig[: N - i]
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        buf[i:i + len(sig), 0] += sig * gain * l * 1.414
        buf[i:i + len(sig), 1] += sig * gain * r * 1.414
    else:
        buf[i:i + len(sig)] += sig * gain


def mtof(m):
    return 440.0 * 2 ** ((m - 69) / 12)


# ---------------- instruments ----------------
def kick(gain=1.0):
    t = t_arr(0.4)
    f = 45 + 110 * np.exp(-t * 35)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t * 9) * gain


def clap():
    t = t_arr(0.25)
    n = rng.standard_normal(len(t))
    e = np.exp(-t * 22)
    for d in (0.0, 0.012, 0.024):
        e += np.where(t > d, np.exp(-(t - d) * 60), 0) * 0.5
    return bp(n * e, 900, 4000) * 0.6


def hat(open_=False):
    t = t_arr(0.18 if open_ else 0.06)
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (18 if open_ else 70)) * 0.25


def pluck(freq, dur=0.35, bright=1.0):
    t = t_arr(dur)
    s = sum(np.sin(2 * np.pi * freq * k * t) / k ** 1.4 for k in range(1, 6))
    s = s * np.exp(-t * (9 / bright))
    return lp(s, 3500) * 0.35


def pad(freqs, dur, a=0.8, r=1.0):
    t = t_arr(dur)
    s = np.zeros(len(t))
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            s += np.sin(2 * np.pi * f * (1 + det / 100) * t + rng.random() * 6)
    s = lp(s / (len(freqs) * 3), 1800)
    return s * env(len(t), a, r, 1.5)


def bass(freq, dur):
    t = t_arr(dur)
    s = np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)
    return lp(s, 600) * env(len(t), 0.005, dur * 0.9, 2) * 0.5


# ---------------- SFX ----------------
def whoosh(d=1.0, f0=300, f1=3000, gain=1.0):
    t = t_arr(d)
    n = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    seg = 512
    for i in range(0, len(t), seg):
        k = i / len(t)
        fc = f0 * (f1 / f0) ** k
        out[i:i + seg] = bp(n[i:i + seg] if i == 0 else n[max(0, i - 256):i + seg], fc * 0.6, min(fc * 1.6, 18000))[-len(n[i:i + seg]):]
    e = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    return out * e * gain * 0.8


def blip(f=900, d=0.12, up=1.6, gain=0.4):
    t = t_arr(d)
    f_ = f * (1 + (up - 1) * (t / d))
    return np.sin(2 * np.pi * np.cumsum(f_) / SR) * np.exp(-t * 30) * gain


def chime(base=880, d=1.6, gain=0.35):
    t = t_arr(d)
    s = sum(np.sin(2 * np.pi * base * r * t) * np.exp(-t * (3 + i)) / (i + 1) for i, r in enumerate([1, 1.5, 2, 3]))
    return s * gain * env(len(t), 0.003, d, 1)


def thud(gain=1.0):
    t = t_arr(0.5)
    s = np.sin(2 * np.pi * np.cumsum(70 + 80 * np.exp(-t * 25)) / SR) * np.exp(-t * 7)
    n = lp(rng.standard_normal(len(t)), 1500) * np.exp(-t * 30) * 0.5
    return (s + n) * gain


def click(gain=0.3):
    t = t_arr(0.03)
    return hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 200) * gain


def gulp():
    t = t_arr(0.6)
    f = 380 * np.exp(-t * 4) + 70
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), 0.01, 0.5, 2)
    return lp(s, 1200) * 0.9


def sputter(d=1.6):
    t = t_arr(d)
    n = lp(rng.standard_normal(len(t)), 900)
    rate = 18 - 10 * t / d
    gate = (np.sin(2 * np.pi * np.cumsum(rate) / SR) > 0.2).astype(float)
    gate = lp(gate, 60)
    eng = np.sin(2 * np.pi * np.cumsum(110 - 50 * t / d) / SR)
    return (n * 0.6 + eng * 0.4) * gate * (1 - t / d) ** 1.2 * 0.8


def rumble(d=3.0, gain=0.5):
    t = t_arr(d)
    return lp(rng.standard_normal(len(t)), 120) * env(len(t), 0.6, 1.5, 1.5) * gain * 3


def warble(d=2.5):
    t = t_arr(d)
    f = 600 + 400 * np.sin(2 * np.pi * 6 * t) - 300 * t / d
    s = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR))
    return lp(s, 2500) * 0.12 * env(len(t), 0.05, 0.3, 1)


def rustle(d=0.7):
    t = t_arr(d)
    n = bp(rng.standard_normal(len(t)), 2000, 8000)
    am = (np.sin(2 * np.pi * 22 * t) > 0).astype(float)
    return n * lp(am, 200) * np.sin(np.pi * t / d) * 0.35


def zipper(d=1.7):
    t = t_arr(d)
    out = np.zeros(len(t))
    k = 0.0
    while k < d - 0.02:
        add_i = int(k * SR)
        c = click(0.25)
        out[add_i:add_i + len(c)] += c[: len(out) - add_i]
        k += 0.035
    return out


# ================= MUSIC =================
# Part A: soft pulse 0–20 (A minor), thinning as the plane stalls
bpmA = 100; beatA = 60 / bpmA
padA = pad([mtof(57), mtof(60), mtof(64)], 20.0, a=2.5, r=4.0)
add(music, padA, 0.0, 0.35)
b = 0.0
while b < 20:
    g = 0.55 if b < 12 else 0.55 * max(0, 1 - (b - 12) / 6)
    add(music, kick(g), b, 0.8)
    if b > 5 and b < 12:
        add(music, pluck(mtof([69, 72, 76, 72][int(b / beatA) % 4]), 0.4), b + beatA / 2, 0.45, pan=0.3)
    b += beatA
# Part B: tension hum 20–35
tB = t_arr(15.5)
hum = (np.sin(2 * np.pi * 55 * tB) + 0.6 * np.sin(2 * np.pi * 55.7 * tB) + 0.3 * np.sin(2 * np.pi * 82.4 * tB)) * env(len(tB), 2.0, 0.4, 1)
hum *= 0.6 + 0.4 * np.linspace(0, 1, len(tB))
add(music, hum * 0.22, 19.6)

# Part C: upbeat 120 bpm from the reveal (36.5) to the end
bpm = 120; beat = 60 / bpm; bar = beat * 4
prog_ = [(48, [60, 64, 67]), (43, [59, 62, 67]), (45, [57, 60, 64]), (41, [57, 60, 65])]  # C G Am F
start = 36.5
arp_pat = [0, 1, 2, 1, 0, 2, 1, 2]
b = start
while b < 88.0:
    i_beat = int(round((b - start) / beat))
    bar_i = i_beat // 4
    root, chord = prog_[bar_i % 4]
    in_rewind = 42.0 <= b < 44.5
    pre_tap = 44.5 <= b < 47.2
    breakdown = 72.0 <= b < 80.0
    drums = not in_rewind and not breakdown
    lvl = 0.5 if pre_tap else 1.0
    if drums:
        add(music, kick(0.9 * lvl), b, 0.8)
        if i_beat % 2 == 1 and not pre_tap:
            add(music, clap(), b, 0.5)
        add(music, hat(), b + beat / 2, 0.6 * lvl, pan=0.25)
        add(music, hat(), b, 0.3 * lvl, pan=-0.25)
    if not in_rewind:
        add(music, bass(mtof(root - 12 + 12), beat * 0.9), b, 0.55 * lvl)
        for k in range(2):
            n_ = chord[arp_pat[(i_beat * 2 + k) % 8]] + 12
            add(music, pluck(mtof(n_), 0.3, bright=1.3), b + k * beat / 2, 0.32 * (0.8 if breakdown else 1) * lvl, pan=(-0.35 if k else 0.35))
    if i_beat % 4 == 0 and not in_rewind:
        add(music, pad([mtof(n) for n in chord], bar + 0.4, a=0.3, r=0.6), b, 0.18 if not breakdown else 0.28)
    b += beat
# final ring-out chord
add(music, pad([mtof(48), mtof(60), mtof(64), mtof(67), mtof(72)], 3.0, a=0.02, r=2.5), 88.0, 0.35)
add(music, chime(523.25, 2.5, 0.25), 88.0)
# tape-stop into rewind
add(music, warble(2.5), 42.0, 1.0)

# ================= SFX =================
add(sfx, whoosh(1.4, 200, 4000, 1.2), 0.25)
add(sfx, whoosh(0.7, 400, 9000, 1.0), 4.4)
add(sfx, chime(1046, 0.8, 0.12), 4.85)
for at, p in [(6.0, -0.5), (7.1, 0.3), (8.2, 0.6), (9.3, -0.2), (10.2, 0.4)]:
    add(sfx, blip(820, 0.1, 1.8, 0.35), at, pan=p)
add(sfx, sputter(1.8), 12.4, 0.8)
add(sfx, rumble(4.0, 0.35), 19.8)
add(sfx, blip(500, 0.12, 1.5, 0.3), 23.9)
for k in range(4):
    add(sfx, click(0.4), 24.0 + k * 0.14)
add(sfx, thud(0.9), 24.5, pan=-0.4)
add(sfx, blip(500, 0.12, 1.5, 0.3), 25.3, pan=0.4)
add(sfx, thud(0.9), 26.0, pan=0.4)
add(sfx, blip(300, 0.2, 0.6, 0.35), 26.9, pan=0.4)
add(sfx, thud(1.2), 27.6)
add(sfx, gulp(), 30.95, 1.2)
add(sfx, rumble(1.2, 0.6), 31.0)
add(sfx, whoosh(0.5, 800, 12000, 1.3), 35.2)
add(sfx, whoosh(0.6, 2000, 300, 0.7), 35.9)
add(sfx, thud(0.6), 36.5)
add(sfx, rustle(0.7), 37.3)
add(sfx, chime(880, 1.8, 0.3), 38.7)
add(sfx, whoosh(0.8, 500, 5000, 1.0), 46.4)
add(sfx, chime(1318, 1.0, 0.35), 47.2)
add(sfx, blip(1200, 0.08, 2.0, 0.3), 47.2)
add(sfx, whoosh(1.2, 300, 6000, 0.9), 47.4)
for i in range(5):
    add(sfx, blip(700 + i * 120, 0.08, 1.5, 0.22), 49.4 + i * 0.15, pan=-0.6 + i * 0.3)
for at in (52.0, 55.3, 58.6):
    add(sfx, whoosh(0.5, 400, 3000, 0.6), at)
for i in range(3):
    add(sfx, blip(900 + i * 150, 0.08, 1.4, 0.25), 53.4 + i * 0.35)
tS = t_arr(1.8)
add(sfx, np.sin(2 * np.pi * (600 + 500 * tS / 1.8) * tS) * np.sin(np.pi * tS / 1.8) * 0.06, 55.8)
add(sfx, blip(660, 0.25, 1.0, 0.3), 56.8)
add(sfx, blip(990, 0.25, 1.0, 0.2), 56.95)
add(sfx, blip(700, 0.1, 1.6, 0.35), 59.1, pan=0.4)
add(sfx, click(0.6), 60.5, pan=0.4)
add(sfx, whoosh(1.2, 300, 7000, 1.0), 60.7, pan=0.5)
add(sfx, zipper(1.7), 64.3, 0.8)
add(sfx, chime(1046, 1.4, 0.3), 66.0)
for k in range(16):
    add(sfx, click(0.18), 66.9 + k * 0.1, pan=-0.3)
    add(sfx, click(0.18), 67.4 + k * 0.1, pan=0.3)
add(sfx, blip(600, 0.12, 1.5, 0.3), 66.9)
add(sfx, blip(700, 0.12, 1.5, 0.3), 67.4)
for i in range(4):
    add(sfx, blip(880 + i * 110, 0.1, 1.3, 0.22), 72.8 + i * 0.8, pan=0.3)
add(sfx, whoosh(0.9, 400, 4000, 0.7), 74.4, pan=0.5)
add(sfx, thud(0.35), 75.4, pan=0.3)
add(sfx, blip(990, 0.1, 1.5, 0.3), 76.8, pan=0.3)
add(sfx, whoosh(1.0, 300, 5000, 0.9), 80.0, pan=-0.5)
for i in range(6):
    add(sfx, whoosh(0.6, 600, 6000, 0.25), 80.9 + i * 0.2, pan=(-1) ** i * 0.6)
add(sfx, chime(784, 2.0, 0.32), 83.6)
add(sfx, blip(800, 0.1, 1.6, 0.3), 86.2)
add(sfx, chime(2093, 0.6, 0.15), 88.15)

# ================= MIX =================
mix = music * 0.6 + sfx * 0.75
fade = np.ones(N); nf = int(1.2 * SR); fade[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= fade[:, None]
mix = np.tanh(mix * 1.3) / np.tanh(1.3)  # soft limiter
mix *= 0.89 / max(1e-6, np.abs(mix).max())
wavfile.write(sys.argv[1], SR, (mix * 32767).astype(np.int16))
print('wrote', sys.argv[1])
