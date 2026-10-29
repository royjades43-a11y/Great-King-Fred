"""The director: compiles an episode script into a timed, narrated Lantern Theatre film.

    python -m lantern.director episodes/01-the-king-in-the-marsh            # full build + render
    python -m lantern.director episodes/01-... --draft                     # half-size quick render
    python -m lantern.director episodes/01-... --no-render                 # voice, art, timing only
    python -m lantern.director episodes/01-... --stills                    # one still per scene

Narration cues (placed just before the word they land on):
    [spot:hall]  [spot:hall:wide]  [spot:hall:tight]  [spot:@chippenham]  [spot:all]
    [enter:danes]  [enter:danes:right]  [exit:danes]  [show:crown] (rises from below)
    [move:alfred:0.4]  [push:hall]  [ignite:hall]  [ink:flight]  [sail:ship:flight]
    [title:ACT I|The Fall of Wessex]  [pause:0.8]
"""
import argparse
import json
import os
import re
import shutil

import numpy as np
import yaml
from PIL import Image

from . import music
from .anim import keyframes
from .art import SETS
from .art.props import make_prop
from .render import TRANSITION_LEN, clamp_camera
from .align import RecordedVoice, find_recordings
from .voice import SR, VOICES, Narrator, SilentEstimator, split_sentences, strip_cues, write_wav

W, H = 1920, 1080
LEAD = 0.45          # breath after a scene opens before the narrator speaks
SENTENCE_GAP = 0.32
PARAGRAPH_GAP = 0.75
TAIL = 1.1           # hold after the last word before the scene closes
GAP_WARN = 7.0       # longest stretch without a visual event before the report complains
BREATH_GAP = 5.5     # longer gaps get an automatic spotlight swell
SPOT_TRAVEL = 0.8    # seconds the lantern takes to swing to a new target


class Cast:
    """A prop placed on stage, with everything needed to aim lights and cameras at it."""

    def __init__(self, key, spec, art_dir, scene_id, seed):
        self.key, self.spec = key, spec
        self.at = list(spec.get("at", [0.5, 0.85]))
        self.h = spec.get("height", 0.3)
        self.depth = spec.get("depth", 0.75 + 0.5 * max(0.0, self.at[1] - 0.6))
        img, self.meta = make_prop(spec["prop"], self.h * H * 1.3, seed=spec.get("seed", seed),
                                   **spec.get("params", {}))
        if spec.get("flip"):
            img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            self.meta = {k: (1 - x, y) for k, (x, y) in self.meta.items()}
        self.path = os.path.join(art_dir, f"{scene_id}_{key}.png")
        img.save(self.path)
        self.aspect = img.width / img.height
        self.w = self.aspect * self.h * H / W           # width as a fraction of frame width
        self.anchor = spec.get("anchor", [0.5, 1.0])
        self.hidden_until = None
        self.layer = None

    def point(self, name="center"):
        """Frame position of a meta point (or the image centre)."""
        mx, my = self.meta.get(name, (0.5, 0.5))
        x = self.at[0] + (mx - self.anchor[0]) * self.w
        y = self.at[1] + (my - self.anchor[1]) * self.h
        return x, y

    def radius(self):
        return min(0.36, max(0.08, 0.62 * max(self.w, self.h * H / W)))


def scene_items(sc):
    """Narration as [(spoken sentence, cues, paragraph index)]; cue-only lines have no text."""
    paragraphs = [p for p in re.split(r"\n\s*\n", (sc.get("narration") or "").strip()) if p.strip()]
    items = []
    for pi, para in enumerate(paragraphs):
        for sentence in split_sentences(" ".join(para.split())):
            spoken, cues = strip_cues(sentence)
            items.append((spoken, cues, pi))
    return items


def scene_id(sc, index):
    return sc.get("id", f"s{index:02d}")


def parse_cue_arg(arg):
    return [a.strip() for a in (arg or "").split(":")] if arg else []


def side_of(x):
    return "left" if x < 0.5 else "right"


class SceneBuild:
    def __init__(self, sc, index, build_dir, narrator):
        self.sc, self.index = sc, index
        self.id = scene_id(sc, index)
        self.build_dir = build_dir
        art_dir = os.path.join(build_dir, "art")
        os.makedirs(art_dir, exist_ok=True)

        # ---------------------------------------------------------------- set + cast
        set_spec = dict(sc.get("set", {"name": "void"}))
        set_name = set_spec.pop("name")
        self.set = SETS[set_name](W, H, np.random.default_rng(sc.get("seed", index + 1)), **set_spec)
        self.places = self.set.get("places", {})
        self.cast = {k: Cast(k, v, art_dir, self.id, seed=index * 100 + i)
                     for i, (k, v) in enumerate((sc.get("cast") or {}).items())}
        self.routes = {k: [self.places[p] if isinstance(p, str) else p for p in v]
                       for k, v in (sc.get("routes") or {}).items()}

        # ---------------------------------------------------------------- narration + cue timing
        self.open = sc.get("open", "lantern")
        self.close = sc.get("close", "lantern")
        self.voice_clips, self.cues, self.captions = [], [], []
        t = TRANSITION_LEN.get(self.open, 0) + LEAD
        items = scene_items(sc)
        last_end = t
        if isinstance(narrator, RecordedVoice):
            # one recorded clip per scene; sentence and cue times come from the aligner
            spoken_items = [it for it in items if it[0]]
            if spoken_items:
                clip, spans, cue_time = narrator.scene(self.id)
                self.voice_clips.append((t, clip))
                si = 0
                for spoken, cues, _ in items:
                    if not spoken:  # cue-only line: fires as the next sentence begins
                        at = t + spans[min(si, len(spans) - 1)][0]
                        self.cues += [(at, n, parse_cue_arg(a), "") for _, n, a in cues if n != "pause"]
                        continue
                    for off, name, arg in cues:
                        if name != "pause":  # the reader's own pauses stand
                            self.cues.append((t + cue_time(si, off), name, parse_cue_arg(arg), spoken))
                    self.captions.append((t + spans[si][0], t + spans[si][1], spoken))
                    si += 1
                last_end = t + len(clip) / SR
        else:
            prev_para = 0
            for spoken, cues, para in items:
                if para != prev_para:
                    t += PARAGRAPH_GAP - SENTENCE_GAP
                    prev_para = para
                extra = 0.0
                if spoken:
                    audio, at = narrator.sentence(spoken)
                    self.voice_clips.append((t, audio))
                    for off, name, arg in cues:
                        if name == "pause":
                            extra += float(arg or 0.8)
                        else:
                            self.cues.append((t + at(off), name, parse_cue_arg(arg), spoken))
                    self.captions.append((t, t + len(audio) / SR, spoken))
                    last_end = t + len(audio) / SR
                    t = last_end + SENTENCE_GAP + extra
                else:  # a line of cues only: they fire at the current moment
                    for off, name, arg in cues:
                        if name == "pause":
                            t += float(arg or 0.8)
                        else:
                            self.cues.append((t, name, parse_cue_arg(arg), ""))
        self.duration = round(last_end + sc.get("tail", TAIL) + TRANSITION_LEN.get(self.close, 0), 3)
        self.duration = max(self.duration, sc.get("min_duration", 0))
        self.cues.sort(key=lambda c: c[0])

    # ---------------------------------------------------------------- camera
    def camera_keys(self):
        dur = self.duration
        keys = [[0.0, 1.0, 0.5, 0.5]]
        drift = self.sc.get("push", 0.045)

        def base_zoom(t):
            return 1.0 + drift * t / dur

        for t, name, args, _ in self.cues:
            if name not in ("spot", "push"):
                continue
            target = self.target_of(name, args)
            if target is None:
                continue
            tx, ty = target[:2]
            if name == "push":
                z, k = 1.0 + max(0.1, drift + 0.06), 0.6
            else:
                z, k = base_zoom(t + 1.4), 0.3
            # hold the current framing until the cue, then settle on the new one
            prev = keyframes(keys, t)
            keys = [k for k in keys if k[0] < t]
            keys.append([t, *prev])
            keys.append([min(dur, t + (2.4 if name == "push" else 1.6)), z, 0.5 + (tx - 0.5) * k, 0.5 + (ty - 0.5) * k])
            keys.sort(key=lambda kk: kk[0])
        last = keys[-1]
        keys.append([dur, max(last[1], base_zoom(dur)) + 0.008, last[2], last[3]])
        return keys

    def to_screen(self, x, y, depth, t, cam_keys):
        z, fx, fy = clamp_camera(*keyframes(cam_keys, t), W, H)
        zl = 1 + (z - 1) * depth
        cx, cy = 0.5 + (fx - 0.5) * depth, 0.5 + (fy - 0.5) * depth
        return 0.5 + (x - cx) * zl, 0.5 + (y - cy) * zl

    def target_of(self, name, args):
        """(x, y, radius, depth) a cue points at, in pre-camera frame fractions."""
        if not args:
            return None
        key = args[0]
        if key == "all":
            return (0.5, 0.52, 0.62, 1.0)
        if key.startswith("@"):
            if key[1:] not in self.places:
                raise SystemExit(f"scene {self.id}: unknown place {key}; map shows {list(self.places)}")
            x, y = self.places[key[1:]]
            return (x, y, 0.1, 1.0)
        if key not in self.cast:
            raise SystemExit(f"scene {self.id}: cue [{name}:{key}] names no cast member")
        c = self.cast[key]
        x, y = c.point("center")
        return (x, y, c.radius(), c.depth)

    # ---------------------------------------------------------------- compile
    def compile(self):
        dur = self.duration
        sc = self.sc
        cam = self.camera_keys()
        layers = []
        for l in self.set["layers"]:
            path = os.path.join(self.build_dir, "art", f"{self.id}_set_{l['key']}.png")
            l["image"].save(path)
            spec = {"image": os.path.relpath(path, self.build_dir), "depth": l.get("depth", 1.0),
                    "paper": l.get("paper", False)}
            if "grade" in l:
                spec["grade"] = l["grade"]
            if l.get("drift"):
                spec["slide"] = [[0, 0, 0], [dur, l["drift"] * dur, 0]]
            layers.append((l["key"], spec))

        # cast layers, back to front by depth
        for c in sorted(self.cast.values(), key=lambda c: c.depth):
            spec = {"image": os.path.relpath(c.path, self.build_dir), "pos": c.at, "scale": c.w,
                    "anchor": c.anchor, "depth": c.depth, "paper": c.spec.get("paper", True),
                    "grade": c.spec.get("grade", 0.6)}
            for k in ("sway", "bob", "pivot"):
                if k in c.spec:
                    spec[k] = c.spec[k]
            fx = []
            for f in c.spec.get("fx", []):
                kind, _, where = f.partition("@")   # "smoke@smoke", "flame@flame1", or "flames"
                points = [where]
                if kind == "flames":
                    points = [k for k in c.meta if k.startswith("flame")]
                    kind = "flame"
                for p in points:
                    if p not in c.meta:
                        raise SystemExit(f"scene {self.id}: {c.key} has no point {p!r} (has {list(c.meta)})")
                    mx, my = c.meta[p]
                    e = {"type": kind, "x": mx, "y": my, "seed": len(fx)}
                    if kind == "flame":
                        e.update(size=c.spec.get("flame_size", 0.006 * c.h / 0.3), light=0.22)
                    if kind == "smoke":
                        e.update(size=c.spec.get("smoke_size", 0.02 * c.h / 0.3))
                    fx.append(e)
            if fx:
                spec["fx"] = fx
            c.layer = spec
            layers.append((c.key, spec))

        spot_keys, title = [], sc.get("title")
        spot_default = (0.5, 0.5, 0.55)
        first_spot = next((cue for cue in self.cues if cue[1] == "spot"), None)
        if first_spot and first_spot[0] < 2.5:  # open on the first subject
            tx, ty, r, d = self.target_of("spot", first_spot[2])
            sx, sy = self.to_screen(tx, ty, d, 0, cam)
            spot_default = (sx, sy, r)
        spot_keys.append([0.0, *spot_default])
        ink_fx = []
        events = [0.0]
        for i, (t, name, args, _) in enumerate(self.cues):
            nxt = next((c[0] for c in self.cues[i + 1:] if c[1] in ("spot", "ink", "sail")), dur)
            if name in ("spot", "push"):
                if name == "push" and len(args) < 1:
                    continue
                tx, ty, r, d = self.target_of(name, args)
                if name == "push":
                    events.append(t)
                    continue
                mod = args[1] if len(args) > 1 else ""
                r *= {"wide": 1.6, "tight": 0.62}.get(mod, 1.0)
                sx, sy = self.to_screen(tx, ty, d, t + 0.4, cam)
                prev = keyframes(spot_keys, t - SPOT_TRAVEL * 0.6)
                spot_keys.append([max(spot_keys[-1][0] + 0.01, t - SPOT_TRAVEL * 0.6), *prev[:3]])
                spot_keys.append([t + SPOT_TRAVEL * 0.4, sx, sy, r])
                events.append(t)
            elif name in ("enter", "exit", "show"):
                c = self.cast[args[0]]
                frm = args[1] if len(args) > 1 else ("bottom" if name == "show" else side_of(c.at[0]))
                if name == "exit":
                    c.layer["exit"] = {"to": frm, "at": t, "dur": 1.2}
                else:
                    c.layer["enter"] = {"from": frm, "at": t, "dur": 1.5 if name == "enter" else 1.2}
                events.append(t)
            elif name == "move":
                c = self.cast[args[0]]
                dx = float(args[1]) - c.at[0]
                keys = c.layer.setdefault("slide", [[0, 0, 0]])
                keys.append([t, keys[-1][1], 0])
                keys.append([t + 2.0, dx, 0])
                events.append(t)
            elif name == "ignite":
                c = self.cast[args[0]]
                for e in c.layer.get("fx", []):
                    if e["type"] == "flame":
                        e["from"] = t + 0.25 * e["seed"]
                events.append(t)
            elif name == "ink":
                pts = self.routes[args[0]]
                end = min(dur - 0.5, max(t + 2.5, nxt - 0.2))
                ink_fx.append({"type": "ink", "points": pts, "start": t, "end": end, "color": "#7a1f1f",
                               "width": 6})
                events.append(t)
            elif name == "sail":
                c = self.cast[args[0]]
                pts = self.routes[args[1]]
                c.layer["pos"] = list(pts[0])  # wait at the start of the route
                end = min(dur - 0.5, max(t + 2.5, nxt - 0.2))
                c.layer["follow"] = {"points": pts, "start": t, "end": end}
                c.layer["anchor"] = [0.5, 0.8]
                events.append(t)
            elif name == "title":
                text, _, sub = (":".join(args)).partition("|")
                title = {"text": text.strip(), "sub": sub.strip() or None, "at": t, "hold": 3.2}
                events.append(t)
        # breathing room: no stretch longer than BREATH_GAP without the lantern moving
        events = sorted(set(events + [dur]))
        breaths = []
        for a, b in zip(events, events[1:]):
            n = int((b - a) // BREATH_GAP)
            for k in range(1, n + 1):
                tm = a + (b - a) * k / (n + 1)
                cur = keyframes(spot_keys, tm)
                swell = 1.28 if len(breaths) % 2 == 0 else 0.82
                sx = cur[0] + (0.5 - cur[0]) * 0.12
                breaths.append((tm, [tm - 1.2, *cur[:3]], [tm + 1.4, sx, cur[1], min(0.9, cur[2] * swell)]))
        for tm, k0, k1 in breaths:
            spot_keys.append(k0)
            spot_keys.append(k1)
            events.append(tm)
        spot_keys.sort(key=lambda k: k[0])
        if ink_fx:
            map_layer = layers[0][1]
            map_layer.setdefault("fx", []).extend(ink_fx)
        # keep the lantern on a sailing ship
        follow = next(((i, c) for i, (k, c) in enumerate(layers) if "follow" in c), None)

        scene = {
            "name": self.id, "duration": dur, "open": self.open, "close": self.close,
            "ambient": sc.get("ambient", self.set.get("ambient", 0.45)),
            "camera": cam, "spotlight": spot_keys,
            "layers": [spec for _, spec in layers],
        }
        if follow:
            i, c = follow
            scene["spotlight_follow"] = {"layer": i, "from": c["follow"]["start"], "to": c["follow"]["end"] + 0.6,
                                         "offset": [0, -0.03]}
        weather = sc.get("weather", self.set.get("weather"))
        if weather:
            scene["weather"] = weather
        if title:
            scene["title"] = title
        events.append(dur)
        self.events = sorted(events)
        return scene


def build(ep_dir, render=True, draft=False, stills=False, jobs=None, silent_preview=False):
    with open(os.path.join(ep_dir, "episode.yaml")) as f:
        ep = yaml.safe_load(f)
    build_dir = os.path.join(ep_dir, "build")
    if os.path.exists(os.path.join(build_dir, "art")):
        shutil.rmtree(os.path.join(build_dir, "art"))
    os.makedirs(build_dir, exist_ok=True)
    v = ep.get("voice", {})
    voice_dir = os.path.join(ep_dir, "voice")
    lang = v.get("lang", "en-gb")
    if silent_preview:
        print("  SILENT LAYOUT PREVIEW: no voice, timings are estimates")
        narrator = SilentEstimator(v.get("name"), v.get("speed", 0.95), lang)
    elif find_recordings(voice_dir):
        print(f"  narration: recordings in {voice_dir}")
        narrator = RecordedVoice(voice_dir, [(scene_id(sc, i), [it[0] for it in scene_items(sc) if it[0]])
                                             for i, sc in enumerate(ep["scenes"])], lang)
    else:
        if not os.path.exists(VOICES):
            raise SystemExit(f"No narration: put recordings in {voice_dir}/ (one per scene, named by scene id, "
                             "or a single full.mp3) - see READ_ALONG.md from --export-script - or install "
                             "the Kokoro model with `python -m lantern.voice --fetch`.")
        narrator = Narrator(v.get("name", "bm_george"), v.get("speed", 0.95), lang,
                            cache_dir=os.path.join(ep_dir, ".voice-cache"), respell=v.get("respell"))

    scenes, start = [], 0.0
    scene_builds = []
    for i, sc in enumerate(ep["scenes"]):
        sb = SceneBuild(sc, i, build_dir, narrator)
        sb.start = start
        scenes.append(sb.compile())
        scene_builds.append(sb)
        start += sb.duration
        print(f"  scene {sb.id:<22} {sb.duration:6.1f}s  {len(sb.cues)} cues")
    total = start

    # ---------------------------------------------------------------- audio
    voice = np.zeros(int(total * SR) + SR, np.float32)
    for sb in scene_builds:
        for t, audio in sb.voice_clips:
            i = int((sb.start + t) * SR)
            voice[i:i + len(audio)] += audio[: len(voice) - i]
    write_wav(os.path.join(build_dir, "narration.wav"), voice)
    sections, mood = [], "mystery"
    for sb in scene_builds:
        mood = sb.sc.get("mood", mood)
        sections.append((sb.start, sb.start + sb.duration, mood))
    score = music.score(total, sections, seed=ep.get("seed", 7))
    write_wav(os.path.join(build_dir, "music.wav"), score, music.SR)

    project = {
        "width": W, "height": H, "fps": ep.get("fps", 24),
        "style": ep.get("style", {}),
        "audio": {"hum": 0.7, "tracks": [
            {"file": "narration.wav", "voice": True, "volume": 1.0},
            {"file": "music.wav", "duck": 0.65, "volume": ep.get("music_volume", 0.16)},
        ]},
        "scenes": scenes,
    }
    with open(os.path.join(build_dir, "scene.json"), "w") as f:
        json.dump(project, f, indent=1)
    write_report(ep, scene_builds, total, build_dir)

    if stills:
        from .render import Project
        p = Project(os.path.join(build_dir, "scene.json"), 0.5)
        for i, sb in enumerate(scene_builds):
            t = min(sb.duration - 0.5, max(sb.events[1] if len(sb.events) > 1 else 2, 2.5) + 1.5)
            Image.fromarray(p.frame(i, t, 0)).save(os.path.join(build_dir, f"still_{i:02d}_{sb.id}.png"))
        print("stills written to", build_dir)
    if render:
        from .render import main as render_main
        name = "episode_draft" if draft else "episode"
        out = os.path.join(build_dir, name + ("_SILENT_PREVIEW" if silent_preview else "") + ".mp4")
        args = [os.path.join(build_dir, "scene.json"), "-o", out]
        if draft:
            args += ["--scale", "0.5"]
        if jobs:
            args += ["--jobs", str(jobs)]
        render_main(args)
    return total


DELIVERY = {
    "mystery": "low and unhurried; let the last word of each line land",
    "somber": "slow and quiet; leave space after each sentence",
    "tense": "a touch quicker and clipped; lean on the verbs",
    "battle": "driving and stronger; short sentences hit hard",
    "wonder": "warmer, lifting; a hint of surprise",
    "triumph": "full voice but measured; savour the final line",
}


def export_script(ep_dir):
    """READ_ALONG.md: the narration with cues removed, for recording or pasting into a TTS site."""
    with open(os.path.join(ep_dir, "episode.yaml")) as f:
        ep = yaml.safe_load(f)
    out = [f"# {ep.get('title', 'Episode')} - read-along script", "",
           "Record **one file per scene**, named exactly as shown (`.mp3`, `.wav` or `.m4a`), "
           "and put them in this episode's `voice/` folder. Or record the whole thing as a single "
           "`voice/full.mp3`, leaving about two seconds of silence between scenes.", "",
           "Leave a natural pause between sentences; the visuals are timed to them. Don't read the "
           "scene headings.", ""]
    if ep.get("pronounce"):
        out += ["## Pronunciation", ""] + [f"- **{k}**: {v}" for k, v in ep["pronounce"].items()] + [""]
    mood = "mystery"
    words = 0
    for i, sc in enumerate(ep["scenes"]):
        mood = sc.get("mood", mood)
        sid = scene_id(sc, i)
        items = scene_items(sc)
        out += [f"## {i + 1}. `{sid}.mp3`", "", f"*Delivery: {DELIVERY.get(mood, '')}*", ""]
        para, line = 0, []
        for spoken, _, p in items:
            if not spoken:
                continue
            if p != para and line:
                out += [" ".join(line), ""]
                line = []
            para = p
            line.append(spoken)
            words += len(spoken.split())
        if line:
            out += [" ".join(line), ""]
    out.insert(2, f"About {words} words, roughly {words / 150:.1f} minutes at documentary pace.\n")
    path = os.path.join(ep_dir, "READ_ALONG.md")
    with open(path, "w") as f:
        f.write("\n".join(out))
    return path


def fmt(t):
    m, s = divmod(t, 60)
    return f"{int(m):02d}:{s:05.2f}"


def write_report(ep, builds, total, build_dir):
    """Timing sheet, captions and an engagement check, written next to the build."""
    lines = [f"# {ep.get('title', 'Episode')} - timing sheet", "", f"Runtime: **{fmt(total)}**", ""]
    srt, n = [], 1
    warnings = []
    for sb in builds:
        lines.append(f"## {sb.id}  ({fmt(sb.start)} - {fmt(sb.start + sb.duration)}, {sb.duration:.1f}s)")
        for t, name, args, spoken in sb.cues:
            lines.append(f"- `{fmt(sb.start + t)}` **[{name}:{':'.join(args)}]**  {spoken[:70]}")
        gaps = [(a, b) for a, b in zip(sb.events, sb.events[1:]) if b - a > GAP_WARN]
        for a, b in gaps:
            warnings.append(f"{sb.id}: {b - a:.1f}s with no visual change ({fmt(sb.start + a)}-{fmt(sb.start + b)})")
        for a, b, text in sb.captions:
            srt.append(f"{n}\n{srt_time(sb.start + a)} --> {srt_time(sb.start + b)}\n{text}\n")
            n += 1
        lines.append("")
    if builds and builds[0].events[1:2] and builds[0].events[1] > 4:
        warnings.insert(0, "hook: first visual change after 4s - viewers decide in the first seconds")
    lines += ["## Engagement check", ""] + ([f"- {w}" for w in warnings] or ["- no gaps over "
                                                                          f"{GAP_WARN:.0f}s"])
    with open(os.path.join(build_dir, "timing.md"), "w") as f:
        f.write("\n".join(lines) + "\n")
    with open(os.path.join(build_dir, "captions.srt"), "w") as f:
        f.write("\n".join(srt))
    for w in warnings:
        print("  !", w)


def srt_time(t):
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{int(s):02d},{int((s % 1) * 1000):03d}"


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("episode")
    ap.add_argument("--draft", action="store_true", help="render at half size")
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--stills", action="store_true", help="save one still per scene")
    ap.add_argument("--jobs", type=int)
    ap.add_argument("--export-script", action="store_true",
                    help="write READ_ALONG.md (narration to record) and stop")
    ap.add_argument("--silent-preview", action="store_true",
                    help="block out timing without the voice model (silent, estimated)")
    a = ap.parse_args(argv)
    if a.export_script:
        print("wrote", export_script(a.episode))
        return
    total = build(a.episode, render=not a.no_render, draft=a.draft, stills=a.stills, jobs=a.jobs,
                  silent_preview=a.silent_preview)
    print(f"runtime {fmt(total)}")


if __name__ == "__main__":
    main()

