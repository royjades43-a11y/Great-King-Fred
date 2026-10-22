"""Final soundtrack: voiceover + piano bed + a few sound effects, mixed and mastered for YouTube.

    python3 tools/music.py && python3 tools/mix.py   -> assets/soundtrack.m4a  (-14 LUFS, -1.5 dBTP: headroom for YouTube's AAC/Opus encode)

Mix rules:
- the voice leads: cleaned (high-pass, gentle compression, de-ess), always on top
- the piano bed sits ~17 dB under the voice, EQ'd out of the voice's 2-4 kHz range, and ducks
  ~5 dB more while someone is speaking (sidechain from the voice), rising in the pauses
- sound effects are few and quiet: chapter cards, slammed hero words, stamps, strike-throughs,
  a handful of icons. Each one's peak lands one frame after its picture; repeats rotate takes,
  pitch and gain so no two hits are identical
"""
import json, re, subprocess, wave
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
SFX_DIR = ROOT / "assets/sfx"
DB = lambda db: 10 ** (db / 20)

def load(path, filters=None):
    cmd = ["ffmpeg", "-v", "error", "-i", str(path)]
    if filters:
        cmd += ["-af", filters]
    cmd += ["-f", "f32le", "-ac", "2", "-ar", str(SR), "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()

def rms_db(x):
    return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)

theme = json.loads((ROOT / "theme.json").read_text())
script = json.loads((ROOT / "script/script.json").read_text())

# ---------- voice ----------
vo = load(ROOT / "assets/voiceover.mp3",
          "highpass=f=80,deesser=i=0.35,acompressor=threshold=-22dB:ratio=2.5:attack=8:release=180:makeup=2")
n = len(vo) + int(3 * SR)
vo = np.pad(vo, ((0, n - len(vo)), (0, 0)))

# ---------- piano bed ----------
music = load(ROOT / ".work/music.wav",
             "highpass=f=70,equalizer=f=2800:t=q:w=1.2:g=-4,equalizer=f=300:t=q:w=1:g=-2")
music = np.pad(music, ((0, max(0, n - len(music))), (0, 0)))[:n]
voice_level = rms_db(vo[np.abs(vo).max(axis=1) > 0.02])
music *= DB(voice_level - 17 - rms_db(music))

# sidechain: voice envelope (fast attack, slow release) -> up to 5 dB of ducking
hop = 480
env = np.sqrt(np.mean(vo[: n // hop * hop].reshape(-1, hop, 2) ** 2, axis=(1, 2)))
talking = (20 * np.log10(env + 1e-9) > voice_level - 18).astype(float)
smooth = np.zeros_like(talking)
for i in range(1, len(talking)):
    a = 0.35 if talking[i] > smooth[i - 1] else 0.03  # ~30 ms attack, ~330 ms release at 10 ms hops
    smooth[i] = smooth[i - 1] + a * (talking[i] - smooth[i - 1])
duck = np.repeat(DB(-5 * smooth), hop)
duck = np.pad(duck, (0, n - len(duck)), constant_values=1.0)
# intro/outro: the bed comes up a little where nobody speaks
music *= duck[:, None]

# ---------- sound effects ----------
cues = {}
for line in (ROOT / "timing/cues.txt").read_text().splitlines():
    m = re.match(r"(\w+)\s+(\S+)\s+\w+\s+cue.*?in\s+([\d.]+)s", line)
    if m:
        cues[(m[1], m[2])] = float(m[3])

def peak_offset(x):
    return int(np.argmax(np.abs(x).max(axis=1)))

bank = {name: load(SFX_DIR / f"{name}.mp3") for name in
        ["whoosh-cinematic", "whoosh-short", "whoosh", "impact-bass-1", "impact-bass-2", "click", "click-soft", "pop", "chime"]}

last_hit = [-9.0]
def place(name, t_visual, gain_db, pitch=0.0):
    if t_visual - last_hit[0] < 0.4:  # two hits this close read as clutter: keep the first
        return
    last_hit[0] = t_visual
    x = bank[name]
    if pitch:
        r = 2 ** (pitch / 12)
        idx = np.arange(0, len(x) - 1, r); i0 = idx.astype(int); f = (idx - i0)[:, None]
        x = x[i0] * (1 - f) + x[i0 + 1] * f
    x = x * DB(voice_level - rms_db(x[np.abs(x).max(axis=1) > 0.01]) + gain_db)
    start = int((t_visual + 1 / 30) * SR) - peak_offset(x)  # peak one frame after the picture
    start = max(0, start)
    end = min(n, start + len(x))
    sfx[start:end] += x[: end - start]
    placed.append(f"{t_visual:7.2f}s  {name:17s} {gain_db:+.0f} dB  pitch {pitch:+.1f}")

sfx = np.zeros((n, 2), np.float32)
placed = []
rot = {"impact": 0, "whoosh": 0, "pop": 0}
SOFT_ICONS = {"question", "alarm", "pause", "thumbsUp", "shield"}
for s in script["scenes"]:
    for el in s["elements"]:
        t = cues.get((s["id"], el["id"]))
        if t is None:
            continue
        kind, frm = el["t"], el.get("from")
        if kind == "chapter":
            place("whoosh-cinematic", t + 0.3, -16, pitch=[0, -1, 1, -0.5][rot["whoosh"] % 4]); rot["whoosh"] += 1
        elif kind == "text" and el.get("hero") and frm == "slam":
            name = ["impact-bass-1", "impact-bass-2"][rot["impact"] % 2]
            place(name, t + 0.12, -19 + (rot["impact"] % 3) * -1.5, pitch=[0, -1, 0.5][rot["impact"] % 3]); rot["impact"] += 1
        elif kind == "stamp":
            place("click", t + 0.12, -12)
        elif kind == "strike":
            place("whoosh-short", t + 0.18, -24, pitch=2 + (rot["whoosh"] % 2)); rot["whoosh"] += 1
        elif kind == "card":
            place("click-soft", t + 0.3, -16)
        elif kind == "icon" and el["name"] in SOFT_ICONS:
            place("pop", t + 0.15, -20 + (rot["pop"] % 2) * -2, pitch=[0, 1, -1][rot["pop"] % 3]); rot["pop"] += 1
        elif kind == "text" and el["id"] == "e_t7":  # "the real why" end card
            place("chime", t + 0.2, -16)

# ---------- master ----------
mix = vo + music + sfx
tmp = ROOT / ".work/premaster.wav"
with wave.open(str(tmp), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix / max(1.0, np.abs(mix).max() / 0.89), -1, 1) * 32767).astype("<i2").tobytes())

chain = "alimiter=limit=0.84:attack=5:release=60:level=disabled"
meas = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(tmp), "-af", f"{chain},loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"],
                      capture_output=True, text=True).stderr
j = json.loads(meas[meas.rindex("{"): meas.rindex("}") + 1])
ln = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:"
      f"measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", f"{chain},{ln},aresample=48000",
                "-c:a", "pcm_s24le", str(ROOT / ".work/soundtrack.wav")], check=True)
# project copy (small, used by the HyperFrames preview/render); the 24-bit WAV is for the final mux
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(ROOT / ".work/soundtrack.wav"), "-c:a", "aac", "-b:a", "320k",
                str(ROOT / "assets/soundtrack.m4a")], check=True)
(ROOT / "timing/sfx.txt").write_text("\n".join(placed) + "\n")
print(f"{len(placed)} sound effects -> timing/sfx.txt; voice {voice_level:.1f} dBFS RMS; -> .work/soundtrack.wav + assets/soundtrack.m4a")
