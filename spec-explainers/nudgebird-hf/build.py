"""Generates the HyperFrames project files for the Nudgebird explainer.
Edit the tables below (scenes, voiceover lines, sound effects) and re-run:  python3 build.py
"""
import json, html, math, os

FPS = 30
ROOT_DUR = 90

# ---- scenes: (id, film start, duration). Each one draws the shared canvas engine for its window.
SCENES = [
    ("intro", 0, 5), ("office", 5, 30), ("reveal", 35, 7), ("rewind", 42, 10),
    ("steps", 52, 10), ("healthy", 62, 10), ("relax", 72, 8), ("outro", 80, 10),
]

# ---- voiceover: (id, start, clip seconds, line). *word* = highlighted in captions.
# Lines are cut from assets/voice/source/vo-full-josh.mp3 (ElevenLabs, "Josh"); clip seconds = file length.
VO = [
    ("vo-01", 0.75, 3.09, "Every day, your team sends *hundreds* of these."),
    ("vo-02", 5.45, 4.32, "Requests. Approvals. Little “can you take a look at this?”s."),
    ("vo-03", 12.95, 3.27, "And somewhere in there… one of them *stalls.*"),
    ("vo-04", 19.95, 3.23, "No one dropped it on purpose. It just… *slipped.*"),
    ("vo-05", 23.2, 5.8, "Three days later, it’s a *missed* deadline, an *angry* customer… and a very *awkward* meeting."),
    ("vo-06", 37.85, 1.39, "Meet *Nudgebird.*"),
    ("vo-07", 42.55, 2.99, "Nudgebird watches the work flowing through your tools…"),
    ("vo-08", 46.85, 2.88, "…and catches the moment something starts to *stall.*"),
    ("vo-09", 52.25, 2.15, "*Connect* your tools in two minutes."),
    ("vo-10", 55.35, 3.27, "It learns what normal looks like, and *flags* what isn’t."),
    ("vo-11", 58.65, 4.85, "Then it *nudges* exactly the right person. No nagging. No blame."),
    ("vo-12", 63.55, 1.56, "Loops close *faster.*"),
    ("vo-13", 66.55, 2.52, "And nobody spends their week *chasing people.*"),
    ("vo-14", 72.55, 4.81, "So you can stop babysitting tasks, and get back to the work that actually *matters.*"),
    ("vo-15", 83.35, 2.82, "Nudgebird. Nothing falls through the *cracks.*"),
]
CAPTION_SKIP = {"vo-15"}  # the end card already prints the tagline

# ---- sound effects: (file, visual hit time, gain dB offset). Placed so the file's peak lands 1 frame after the picture.
PEAK = {"chime": .418, "click": .073, "error": .745, "glitch-3": 1.823, "impact-bass-1": .073, "impact-bass-2": 1.986,
        "key-press": .076, "notification": .229, "ping": .324, "pop": .12, "riser": 3.472, "sparkle": .027,
        "whoosh-cinematic": 2.503, "whoosh-short": .162, "whoosh": .162}
LUFS = {"chime": -28, "click": -25.4, "error": -29.3, "glitch-3": -22.3, "impact-bass-1": -6.5, "impact-bass-2": -4.5,
        "key-press": -36.3, "notification": -19.2, "ping": -25.4, "pop": -21.2, "riser": -6.6, "sparkle": -11.1,
        "whoosh-cinematic": -14, "whoosh-short": -15.2, "whoosh": -15.2}
FILE_DUR = {"chime": 2.54, "click": .37, "error": 1.62, "glitch-3": 3.1, "impact-bass-1": 2.12, "impact-bass-2": 2.59,
            "key-press": .43, "notification": 2.46, "ping": 1.32, "pop": .72, "riser": 10.03, "sparkle": 1.8,
            "whoosh-cinematic": 5.54, "whoosh-short": .57, "whoosh": .57}
SFX = [
    ("whoosh-cinematic", 1.4, -20), ("whoosh-short", 4.85, -20),
    ("pop", 6.0, -24), ("pop", 7.1, -26), ("pop", 8.2, -24), ("pop", 9.3, -27), ("pop", 10.2, -25),
    ("glitch-3", 12.6, -30),
    ("key-press", 24.0, -24), ("impact-bass-1", 24.5, -20), ("impact-bass-1", 26.0, -21), ("error", 26.9, -26),
    ("impact-bass-2", 27.6, -18), ("impact-bass-1", 31.0, -17),
    ("whoosh", 35.35, -18), ("impact-bass-1", 36.5, -24), ("sparkle", 38.7, -22),
    ("glitch-3", 42.6, -26), ("whoosh-short", 46.9, -20), ("ping", 47.2, -20), ("whoosh", 47.6, -22),
    ("whoosh-short", 49.3, -23),
    ("whoosh", 52.2, -24), ("ping", 53.4, -26), ("ping", 54.1, -28), ("whoosh-short", 55.5, -24),
    ("ping", 56.8, -22), ("whoosh", 58.8, -24), ("notification", 59.2, -24), ("click", 60.5, -20), ("whoosh-short", 61.0, -22),
    ("sparkle", 66.0, -22), ("pop", 66.95, -22), ("pop", 67.45, -23),
    ("click", 72.85, -28), ("click", 73.65, -28), ("click", 74.45, -28), ("click", 75.25, -28),
    ("whoosh-short", 74.9, -24), ("pop", 76.85, -24),
    ("whoosh-cinematic", 80.6, -22), ("riser", 83.6, -24), ("impact-bass-2", 83.65, -19), ("sparkle", 88.2, -22),
]


def scene_html(sid, start, dur):
    return f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; background: #0A1430; overflow: hidden; }}
    #root .nb-canvas {{ position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }}
  </style>
  <div id="root" data-composition-id="{sid}" data-width="1920" data-height="1080">
    <canvas id="{sid}-canvas" class="nb-canvas" width="1920" height="1080"></canvas>
  </div>
  <script src="assets/lib/nudgebird.js"></script>
  <script>
    (function () {{
      // Film time {start}s–{start + dur}s. The canvas engine draws any film time; this scene owns this window.
      const FILM_START = {start}, DUR = {dur};
      const nb = NB.create(document.getElementById("{sid}-canvas"));
      const clock = {{ t: FILM_START }};
      const tl = gsap.timeline({{ paused: true }});
      tl.fromTo(clock, {{ t: FILM_START }}, {{
        t: FILM_START + DUR, duration: DUR, ease: "none",
        onUpdate: () => nb.draw(Math.min(clock.t, FILM_START + DUR - 0.001)),
      }}, 0);
      nb.draw(FILM_START);
      window.__timelines["{sid}"] = tl;
    }})();
  </script>
</template>
"""


def caption_words(line):
    out = []
    for w in line.split(" "):
        hi = "*" in w
        out.append(f'<span class="w{" hi" if hi else ""}">{html.escape(w.replace("*", ""))}</span>')
    return " ".join(out)


def captions_html():
    groups, tweens = [], []
    for i, (vid, start, clip, line) in enumerate(VO):
        if vid in CAPTION_SKIP:
            continue
        nxt = VO[i + 1][1] if i + 1 < len(VO) else ROOT_DUR
        mx = round(min(clip + 0.8, nxt - start - 0.1), 2)
        cid = vid.replace("vo", "cap")
        groups.append(
            f'    <div id="{cid}" class="clip cap" data-start="{start}" data-duration="{mx}">'
            f'<div class="cap-box" id="{cid}-box">{caption_words(line)}</div></div>')
        tweens.append(
            f'      tl.fromTo("#{cid}-box .w", {{ opacity: 0, y: 22 }}, {{ opacity: 1, y: 0, duration: 0.28, stagger: 0.075, ease: "back.out(1.7)" }}, {start});\n'
            f'      tl.fromTo("#{cid}-box", {{ opacity: 1 }}, {{ opacity: 0, duration: 0.25, ease: "power1.in" }}, {round(start + mx - 0.3, 3)});')
    return f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    #root .cap {{ position: absolute; left: 0; right: 0; bottom: 48px; display: flex; justify-content: center; }}
    #root .cap-box {{
      max-width: 1500px; padding: 14px 30px; border-radius: 40px; background: rgba(4, 8, 20, 0.45);
      font-family: "Inter", sans-serif; font-weight: 700; font-size: 44px; line-height: 1.25; color: #F4F1EA; text-align: center;
    }}
    #root .w {{ display: inline-block; }}
    #root .hi {{ color: #22E3C8; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1920" data-height="1080">
{chr(10).join(groups)}
  </div>
  <script>
    (function () {{
      const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tweens)}
      window.__timelines["captions"] = tl;
    }})();
  </script>
</template>
"""


def index_html():
    hosts = []
    for i, (sid, start, dur) in enumerate(SCENES):
        hosts.append(
            f'      <div id="{sid}" data-composition-id="{sid}" data-composition-src="compositions/{sid}.html" '
            f'data-start="{start}" data-duration="{dur}" data-track-index="1" data-track-kind="graphics" '
            f'data-width="1920" data-height="1080" style="z-index: 1"></div>')
    hosts.append(
        f'      <div id="captions" data-composition-id="captions" data-composition-src="compositions/captions.html" '
        f'data-start="0" data-duration="{ROOT_DUR}" data-track-index="2" data-track-kind="captions" '
        f'data-width="1920" data-height="1080" style="z-index: 5"></div>')
    audio = []
    for vid, start, mx, line in VO:
        audio.append(f'      <!-- {html.escape(line.replace("*", ""))} -->')
        audio.append(f'      <audio id="{vid}" class="clip" src="assets/voice/{vid}.mp3" data-start="{start}" '
                     f'data-duration="{mx}" data-track-index="3" data-volume="1"></audio>')
    lanes = []  # end time per SFX track, so clips on one track never overlap
    for n, (f, hit, target) in enumerate(SFX, 1):
        start = round(max(0.0, hit + 1 / FPS - PEAK[f]), 3)
        vol = round(min(3.98, 10 ** ((target - LUFS[f]) / 20)), 3)
        d, fade = FILE_DUR[f] - 0.02, ""
        if f == "riser":
            d, fade = PEAK[f] + 0.6, ' data-fade-out="0.5"'
        elif f == "whoosh-cinematic":
            d, fade = 3.4, ' data-fade-out="0.6"'
        lane = next((i for i, e in enumerate(lanes) if e <= start), None)
        if lane is None:
            lanes.append(0); lane = len(lanes) - 1
        lanes[lane] = start + d
        audio.append(f'      <audio id="sfx-{n:02d}" class="clip" src="assets/sfx/{f}.mp3" data-start="{start}" data-duration="{d:.2f}"{fade} '
                     f'data-track-index="{4 + lane}" data-volume="{vol}"></audio>')
    return f"""<!doctype html>
<html lang="en" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Nudgebird explainer</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <style>
      * {{ margin: 0; padding: 0; box-sizing: border-box; }}
      html, body {{ margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0A1430; }}
      #bg {{ position: absolute; inset: 0; background: #0A1430; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="{ROOT_DUR}" data-width="1920" data-height="1080">
      <div id="bg"></div>
{chr(10).join(hosts)}
{chr(10).join(audio)}
    </div>
    <script>
      window.__timelines["main"] = gsap.timeline({{ paused: true }});
    </script>
  </body>
</html>
"""


here = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(here, "compositions"), exist_ok=True)
for sid, start, dur in SCENES:
    open(os.path.join(here, "compositions", f"{sid}.html"), "w").write(scene_html(sid, start, dur))
open(os.path.join(here, "compositions", "captions.html"), "w").write(captions_html())
open(os.path.join(here, "index.html"), "w").write(index_html())
json.dump([{"id": v, "start": s, "clip_seconds": m, "line": l.replace("*", "")} for v, s, m, l in VO],
          open(os.path.join(here, "voiceover-lines.json"), "w"), indent=2, ensure_ascii=False)
print("built", len(SCENES), "scenes,", len(VO), "VO slots,", len(SFX), "sfx")
