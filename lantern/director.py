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
import math
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
CAST_DEFAULTS = {}   # defaults for every cast member (series/episode: cast_defaults)
CHARACTERS = {}      # recurring characters from the series cast.yaml, used as `character: name`
SERIES = {"dir": "."}  # folder of the series the episode belongs to
SERIES_KEYS = ("style", "voice", "motif", "music_volume", "cast_defaults", "pronounce", "fps", "pace")
PACE = {}            # series pacing: {breath_gap, gap_warn} - how often something must move


class Cast:
    """A prop placed on stage, with everything needed to aim lights and cameras at it."""

    def __init__(self, key, spec, art_dir, scene_id, seed, hires=1.0):
        if "character" in spec:
            name = spec["character"]
            if name not in CHARACTERS:
                raise SystemExit(f"scene {scene_id}: unknown character {name!r}; series cast has "
                                 f"{sorted(CHARACTERS)}")
            base = CHARACTERS[name]
            spec = {**base, **spec, "params": {**base.get("params", {}), **spec.get("params", {})}}
        spec = {**CAST_DEFAULTS, **spec}
        self.key, self.spec = key, spec
        self.at = list(spec.get("at", [0.5, 0.85]))
        self.h = spec.get("height", 0.3)
        self.depth = spec.get("depth", 0.75 + 0.5 * max(0.0, self.at[1] - 0.6))
        params = {k: v.replace("{series}", SERIES["dir"]) if isinstance(v, str) else v
                  for k, v in spec.get("params", {}).items()}
        self.hires = hires  # scenes with close-ups keep their figures sharp
        img, self.meta = make_prop(spec["prop"], self.h * H * max(1.3, hires), seed=spec.get("seed", seed), **params)
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

    def face_spec(self):
        """Where the painted face goes, for figures that have one."""
        if "face" not in self.meta or self.spec.get("face") is False:
            return None
        (fx, fy), (rx, ry) = self.meta["face"], self.meta["face_r"]
        r = math.hypot((rx - fx) * self.aspect, ry - fy)
        params = self.spec.get("params", {})
        return {"x": fx, "y": fy, "r": r, "expr": [[0.0, self.spec.get("expr", "calm")]],
                "facing": self.spec.get("facing", 0.0), "rot": 90.0 if params.get("pose") == "sleep" else 0.0,
                "blind": bool(params.get("blind")), "seed": sum(map(ord, self.key)) % 97,
                "blink": params.get("pose") != "sleep"}

    def point(self, name="center"):
        """Frame position of a meta point (or the image centre)."""
        mx, my = self.meta.get(name, (0.5, 0.5))
        x = self.at[0] + (mx - self.anchor[0]) * self.w
        y = self.at[1] + (my - self.anchor[1]) * self.h
        return x, y

    def radius(self):
        return min(0.36, max(0.08, 0.62 * max(self.w, self.h * H / W)))


# ------------------------------------------------------------------ actions
# Small pieces of acting, each a cue: they add keyframes to a cast member's layer (or to the
# scene) so figures can react to what the narrator says.

# the sound each kind of cue makes (None: silent - the spotlight and small gestures stay quiet)
SFX_FOR = {"quake": "boom", "shatter": "break", "lunge": "strike", "recoil": "whoosh_small", "enter": "whoosh",
           "exit": "whoosh", "show": "whoosh_small", "swap": "whoosh_small", "appear": "sparkle",
           "vanish": "whoosh_small", "fall": "thud", "laugh": "jeer", "ascend": "rise", "dark": "descend",
           "light": "swell_small", "flood": "swell", "label": "tick", "scroll": "paper", "say": "chime",
           "tally": "tally", "title": "chime", "settle": "shimmer_long", "ignite": "fire", "flash": "shimmer",
           "ink": "shimmer_long", "spin": "grind", "cascade": "clinks", "timeline": "chimes", "sail": "whoosh"}

FLASH_COLORS = {"red": "#ff3a24", "white": "#fff4d8", "gold": "#ffd27a", "blue": "#9ec8ff"}


def _slide_at(layer, t):
    keys = layer.get("slide")
    return keyframes(keys, t) if keys else (0.0, 0.0)


def _add_slide(layer, pts):
    keys = layer.setdefault("slide", [[0.0, 0.0, 0.0]])
    keys += [list(p) for p in pts]
    keys.sort(key=lambda k: k[0])


def _opacity(c, t, val, dur):
    keys = c.layer.setdefault("opacity", [[0.0, 1.0]])
    cur = keyframes(keys, t)[0]
    keys += [[t, cur], [t + dur, val]]
    keys.sort(key=lambda k: k[0])


def _tilt(c, pts):
    keys = c.layer.setdefault("angle_keys", [[0.0, 0.0]])
    keys += [list(p) for p in pts]
    keys.sort(key=lambda k: k[0])


def _toward_centre(c):
    return 1.0 if c.at[0] < 0.5 else -1.0


def act_swap(sb, t, args, fx):          # [swap:a:b] a gives way to b (a pose change)
    a, b = sb.cast[args[0]], sb.cast[args[1]]
    b.layer.setdefault("opacity", [[0.0, 0.0]])
    _opacity(a, t, 0.0, 0.3)
    _opacity(b, t, 1.0, 0.3)


def act_appear(sb, t, args, fx):        # [appear:x] fades in
    c = sb.cast[args[0]]
    c.layer.setdefault("opacity", [[0.0, 0.0]])
    _opacity(c, t, 1.0, 0.8)


def act_vanish(sb, t, args, fx):        # [vanish:x] fades out
    _opacity(sb.cast[args[0]], t, 0.0, 0.8)


def act_shake(sb, t, args, fx):         # [shake:x] trembles - straining, struck, terrified
    c = sb.cast[args[0]]
    a = float(args[1]) if len(args) > 1 else 0.008
    bx, by = _slide_at(c.layer, t)
    _add_slide(c.layer, [[t, bx, by], [t + 0.07, bx + a, by], [t + 0.14, bx - a, by], [t + 0.21, bx + a * 0.7, by],
                         [t + 0.28, bx - a * 0.5, by], [t + 0.42, bx, by]])


def act_lunge(sb, t, args, fx):         # [lunge:x] strikes forward and back
    c = sb.cast[args[0]]
    d = (0.06 if len(args) < 2 else float(args[1])) * _toward_centre(c)
    bx, by = _slide_at(c.layer, t)
    _add_slide(c.layer, [[t, bx, by], [t + 0.22, bx + d, by - 0.01], [t + 0.75, bx, by]])
    _tilt(c, [[t, 0], [t + 0.22, 7 * (1 if d > 0 else -1)], [t + 0.75, 0]])


def act_recoil(sb, t, args, fx):        # [recoil:x] flinches back
    c = sb.cast[args[0]]
    d = -0.035 * _toward_centre(c)
    bx, by = _slide_at(c.layer, t)
    _add_slide(c.layer, [[t, bx, by], [t + 0.18, bx + d, by], [t + 0.9, bx + d * 0.4, by]])
    _tilt(c, [[t, 0], [t + 0.18, -8 * (1 if d > 0 else -1)], [t + 0.9, 0]])


def act_hop(sb, t, args, fx):           # [hop:x] a jump - or [laugh:x], three quick ones
    c = sb.cast[args[0]]
    bx, by = _slide_at(c.layer, t)
    _add_slide(c.layer, [[t, bx, by], [t + 0.15, bx, by - 0.025], [t + 0.32, bx, by]])


def act_laugh(sb, t, args, fx):
    c = sb.cast[args[0]]
    bx, by = _slide_at(c.layer, t)
    pts = []
    for k in range(4):
        pts += [[t + k * 0.32, bx, by], [t + k * 0.32 + 0.14, bx, by - 0.012]]
    _add_slide(c.layer, pts + [[t + 1.3, bx, by]])


def act_tilt(sb, t, args, fx):          # [tilt:x:-12] leans (bowing in prayer, slumping)
    c = sb.cast[args[0]]
    deg = float(args[1]) if len(args) > 1 else 10
    cur = keyframes(c.layer.get("angle_keys", [[0.0, 0.0]]), t)[0]
    _tilt(c, [[t, cur], [t + 0.8, deg]])


def act_ascend(sb, t, args, fx):        # [ascend:x] rises up and away (the angel in the flame)
    c = sb.cast[args[0]]
    bx, by = _slide_at(c.layer, t)
    _add_slide(c.layer, [[t, bx, by], [t + 2.6, bx, by - 0.5]])
    _opacity(c, t + 1.2, 0.0, 1.4)


def act_spin(sb, t, args, fx):          # [spin:x:40] starts turning, degrees per second
    c = sb.cast[args[0]]
    c.layer["spin"] = {"rate": float(args[1]) if len(args) > 1 else 40.0, "from": t}


def act_quake(sb, t, args, fx):         # [quake] the camera shakes on an impact
    fx["quakes"].append([t, float(args[0]) if args else 0.012, 0.9])


def act_flash(sb, t, args, fx):         # [flash:red] a burst of coloured light
    col = args[0] if args else "white"
    fx["flashes"].append([t, FLASH_COLORS.get(col, col), 0.7])


def act_dark(sb, t, args, fx):          # [dark] the glass goes dark; [light] brings it back
    cur = keyframes(fx["ambient_keys"], t)[0]
    fx["ambient_keys"] += [[t, cur], [t + 1.4, float(args[0]) if args else 0.16]]


def act_light(sb, t, args, fx):
    cur = keyframes(fx["ambient_keys"], t)[0]
    fx["ambient_keys"] += [[t, cur], [t + 1.6, fx["base_ambient"]]]


def act_cascade(sb, t, args, fx):       # [cascade:a,b,c] appear one after another - piles multiplying
    for i, key in enumerate(args[0].split(",")):
        c = sb.cast[key.strip()]
        c.layer.setdefault("opacity", [[0.0, 0.0]])
        _opacity(c, t + i * 0.32, 1.0, 0.25)
        bx, by = _slide_at(c.layer, t)
        _add_slide(c.layer, [[t + i * 0.32, bx, by - 0.03], [t + i * 0.32 + 0.3, bx, by]])


def act_tally(sb, t, args, fx):         # [tally:1000] that many glass tiles light up in a sweep
    n = int(args[0])
    rect = [float(v) for v in args[1].split(",")] if len(args) > 1 else [0.14, 0.13, 0.86, 0.43]
    fx["graphics"].append({"kind": "tally", "n": n, "rect": rect, "start": t, "dur": 2.0, "until": t + 4.2,
                           "color": args[2] if len(args) > 2 else "gold"})


def act_timeline(sb, t, args, fx):      # [timeline:4] a bar whose nodes light gold one by one
    n = int(args[0]) if args else 4
    fx["graphics"].append({"kind": "timeline", "times": [t + 0.6 + i * 0.55 for i in range(n)], "start": t,
                           "until": t + 6.5, "line": [0.2, 0.22, 0.8]})


ACTIONS = {"cascade": act_cascade, "tally": act_tally, "timeline": act_timeline, "swap": act_swap, "appear": act_appear, "vanish": act_vanish, "shake": act_shake,
           "lunge": act_lunge, "recoil": act_recoil, "hop": act_hop, "laugh": act_laugh, "tilt": act_tilt,
           "ascend": act_ascend, "spin": act_spin, "quake": act_quake, "flash": act_flash, "dark": act_dark,
           "light": act_light}


def match_words(spoken, off, words):
    """Character offsets of `words` where they occur in the spoken sentence (at or after `off`, else
    anywhere), comparing letters only. None if the phrase isn't in the narration."""
    def norm(w):
        return re.sub(r"[^a-z0-9]", "", w.lower())
    toks = [(m.start(), norm(m.group())) for m in re.finditer(r"\S+", spoken)]
    want = [norm(w) for w in words]
    for start_at in (off, 0):
        cand = [i for i, (o, _) in enumerate(toks) if o >= start_at - 1]
        for k in cand:
            if k + len(want) <= len(toks) and all(toks[k + i][1] == want[i] for i in range(len(want))):
                return [toks[k + i][0] for i in range(len(want))]
    return None


def match_prefix_at_end(spoken, off, words):
    """Offsets of the longest start of `words` that ends the sentence (after `off`), for phrases that
    continue into the next sentence."""
    def norm(w):
        return re.sub(r"[^a-z0-9]", "", w.lower())
    toks = [(m.start(), norm(m.group())) for m in re.finditer(r"\S+", spoken) if m.start() >= off - 1]
    want = [norm(w) for w in words]
    for n in range(min(len(want) - 1, len(toks)), 0, -1):
        tail = toks[-n:]
        if all(tail[i][1] == want[i] for i in range(n)):
            return [o for o, _ in tail]
    return None


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
        self.has_cuts = "[cut:" in (sc.get("narration") or "")
        set_spec = dict(sc.get("set", {"name": "void"}))
        set_name = set_spec.pop("name")
        if set_name == "great_window":  # the series' rose window, with every finished pane in it
            set_spec.setdefault("panes_dir", os.path.join(SERIES["dir"], "panes"))
        if self.has_cuts and set_name != "great_window":  # close-ups need a sharper window
            self.set = SETS[set_name](W * 2, H * 2, np.random.default_rng(sc.get("seed", index + 1)), **set_spec)
            for l in self.set["layers"]:
                l["hires"] = 2
        else:
            self.set = SETS[set_name](W, H, np.random.default_rng(sc.get("seed", index + 1)), **set_spec)
        self.places = self.set.get("places", {})
        self.cast = {k: Cast(k, v, art_dir, self.id, seed=index * 100 + i, hires=2.6 if self.has_cuts else 1.0)
                     for i, (k, v) in enumerate((sc.get("cast") or {}).items())}
        self.routes = {k: [self.route_point(p) for p in v] for k, v in (sc.get("routes") or {}).items()}

        # ---------------------------------------------------------------- narration + cue timing
        self.open = sc.get("open", "lantern")
        self.close = sc.get("close", "lantern")
        self.voice_clips, self.cues, self.captions, self.texts = [], [], [], []
        self._pending = None
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
                    self._continue_pending(spoken, lambda o, si=si: t + cue_time(si, o), t + spans[si][1])
                    for off, name, arg in cues:
                        if name in ("say", "scroll"):
                            self._text_cue(name, arg, spoken, off, lambda o, si=si: t + cue_time(si, o),
                                           t + spans[si][1])
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
                    self._continue_pending(spoken, lambda o, t=t, at=at: t + at(o), t + len(audio) / SR)
                    for off, name, arg in cues:
                        if name in ("say", "scroll"):
                            self._text_cue(name, arg, spoken, off, lambda o, t=t, at=at: t + at(o),
                                           t + len(audio) / SR)
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

    def _text_cue(self, name, arg, spoken, off, time_of, sentence_end):
        """[say:phrase|opts] glass words / [scroll:who|words] a speech scroll, each word timed to the voice."""
        parts = [p.strip() for p in (arg or "").split("|")]
        if name == "scroll":
            who, phrase, opts = parts[0], parts[1] if len(parts) > 1 else "", parts[2:]
        else:
            who, phrase, opts = None, parts[0], parts[1:]
        words = phrase.split()
        item = {"kind": name, "who": who, "words": [], "opts": opts, "sentence_end": sentence_end}
        self.texts.append(item)
        offsets = match_words(spoken, off, words)
        if offsets:
            item["words"] = list(zip(words, [time_of(o) for o in offsets]))
            return
        head = match_prefix_at_end(spoken, off, words)
        if head:  # the phrase runs on into the next sentence
            item["words"] = list(zip(words, [time_of(o) for o in head]))
            self._pending = (item, words[len(head):])
            return
        t0 = time_of(off)  # not a quotation of the narration: reveal at the cue, a beat apart
        item["words"] = list(zip(words, [t0 + i * 0.28 for i in range(len(words))]))

    def _continue_pending(self, spoken, time_of, sentence_end):
        """Carry a phrase that crossed a sentence break on into this sentence."""
        if not getattr(self, "_pending", None):
            return
        item, rest = self._pending
        offsets = match_words(spoken, 0, rest)
        if offsets and offsets[0] < 3:
            item["words"] += list(zip(rest, [time_of(o) for o in offsets]))
            item["sentence_end"] = sentence_end
        else:
            t0 = item["words"][-1][1] if item["words"] else 0.0
            item["words"] += [(w, t0 + (i + 1) * 0.28) for i, w in enumerate(rest)]
        self._pending = None

    def sound_effects(self, dur, scene_fx):
        """A sound for every visual event: [t, kind, length, extra]. [sfx:name] adds one by hand."""
        out = []
        if self.open == "glass":
            out.append([0.0, "assemble", TRANSITION_LEN["glass"], None])
        if self.close == "shatter":
            out.append([dur - TRANSITION_LEN["shatter"], "break_big", 0, None])
        for t, name, args, _ in self.cues:
            kind, extra, length = SFX_FOR.get(name), None, 0
            if name == "sfx" and args:
                kind = args[0]
            elif name == "flash" and args and args[0] == "red":
                kind = "sting"
            elif name == "ink" and not (len(args) > 1 and args[1] == "gold"):
                kind = None
            elif name == "cascade":
                extra = len(args[0].split(","))
            elif name == "timeline":
                extra = [0.6 + i * 0.55 for i in range(int(args[0]) if args else 4)]
            elif name == "spin":
                length = dur - t
            if kind:
                out.append([round(t, 3), kind, length, extra])
        for g in scene_fx["graphics"]:
            if g["kind"] == "progress":
                out.append([g.get("start", 0.4) + 0.6, "chime", 0, None])
        return out

    def compile_texts(self, cam, dur):
        out = []
        items = sorted(self.texts, key=lambda it: it["words"][0][1])
        for i, it in enumerate(items):
            first, last = it["words"][0][1], it["words"][-1][1]
            until = max(last + 1.0, it["sentence_end"] + 1.2)
            later = [o["words"][0][1] for o in items[i + 1:] if o["kind"] == it["kind"]]
            if later:
                until = min(until, later[0] - 0.15)
            until = min(until, dur - 0.6)
            spec = {"kind": "glass" if it["kind"] == "say" else "scroll", "words": it["words"], "until": until}
            if it["kind"] == "scroll":
                c = self.cast[it["who"]]
                hx, hy = c.point("head")
                sx, sy = self.to_screen(hx, hy, c.depth, first, cam)
                spec["pos"] = [min(0.74, max(0.26, sx)), min(0.82, max(0.16, sy - 0.11))]
            else:
                pos = {"top": 0.27, "center": 0.46, "middle": 0.46, "bottom": 0.8}  # clear of the arch
                spec["pos"] = [0.5, next((pos[o] for o in it["opts"] if o in pos), 0.27)]
                pal = next((o for o in it["opts"] if o in ("gold", "ruby", "sky", "white")), None)
                if pal:
                    spec["palette"] = pal
            out.append(spec)
        return out

    def route_point(self, p):
        """A route waypoint: [x, y], a map place name, or a cast point like 'david.hand'."""
        if not isinstance(p, str):
            return list(p)
        if "." in p:
            who, point = p.split(".", 1)
            return list(self.cast[who].point(point))
        return list(self.places[p.lstrip("@")])

    # ---------------------------------------------------------------- camera
    def camera_keys(self):
        dur = self.duration
        keys = [[0.0, 1.0, 0.5, 0.5]]
        drift = self.sc.get("push", 0.045)

        def base_zoom(t):
            return 1.0 + drift * t / dur

        in_shot = False  # after a cut to a framed shot, spotlight moves don't reframe the camera
        for t, name, args, _ in self.cues:
            if name == "cut":
                prev = keyframes(keys, t)
                keys = [k for k in keys if k[0] < t]
                z, fx, fy = self.shot(args)
                keys += [[max(0.0, t - 0.001), *prev], [t, z, fx, fy], [t + 3.2, z * 1.03, fx, fy]]
                in_shot = z > 1.01
                continue
            if name not in ("spot", "push") or in_shot:
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

    def shot(self, args):
        """Camera framing for [cut:x:close|medium], [cut:a:two:b] or [cut:all] -> (zoom, focus x, focus y)."""
        if not args or args[0] in ("all", "wide"):
            return 1.0, 0.5, 0.5
        c = self.cast[args[0]]
        kind = args[1] if len(args) > 1 else "medium"
        d = c.depth

        def focus(x, y):  # the focus that puts (x, y) at the centre of the frame for this depth
            return 0.5 + (x - 0.5) / d, 0.5 + (y - 0.5) / d
        if kind == "two" and len(args) > 2:
            o = self.cast[args[2]]
            (ax, ay), (bx, by) = c.point("center"), o.point("center")
            span = abs(ax - bx) + (c.w + o.w) / 2
            return min(2.0, max(1.0, 0.8 / max(span, 0.1))), *focus((ax + bx) / 2, (ay + by) / 2 - 0.04)
        if kind == "close":  # head and shoulders
            hx, hy = c.point("face") if "face" in c.meta else c.point("head") if "head" in c.meta else c.point()
            return min(4.2, max(2.0, 0.55 / (c.h * 0.3))), *focus(hx, hy + c.h * 0.07)
        # medium: from the waist up
        return min(2.8, max(1.4, 0.62 / (c.h * 0.6))), *focus(c.at[0], c.at[1] - c.h * 0.68)

    def zoom_at(self, t, depth, cam_keys):
        z = clamp_camera(*keyframes(cam_keys, t), W, H)[0]
        return 1 + (z - 1) * depth

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
        key, _, point = key.partition(".")
        if key not in self.cast:
            raise SystemExit(f"scene {self.id}: cue [{name}:{key}] names no cast member")
        c = self.cast[key]
        x, y = c.point(point or "center")
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
            if l.get("hires"):
                spec["hires"] = l["hires"]
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
            if c.hires > 1:
                spec["hires"] = c.hires
            face = c.face_spec()
            if face:
                spec["face"] = face
            if c.spec.get("hidden"):  # waits off the glass until [appear:x] or [swap:other:x]
                spec["opacity"] = [[0.0, 0.0]]
            for k in ("spin", "hires"):
                if k in c.spec:
                    spec[k] = c.spec[k]
            c.layer = spec
            layers.append((c.key, spec))

        spot_keys, title = [], sc.get("title")
        spot_default = (0.5, 0.5, 0.55, 1.0)  # x, y, radius, intensity
        first_spot = next((cue for cue in self.cues if cue[1] == "spot"), None)
        if first_spot and first_spot[0] < 2.5:  # open on the first subject
            tx, ty, r, d = self.target_of("spot", first_spot[2])
            sx, sy = self.to_screen(tx, ty, d, 0, cam)
            spot_default = (sx, sy, r, 1.0)
        spot_keys.append([0.0, *spot_default])
        ink_fx = []
        events = [0.0]
        labels = []
        base_amb = sc.get("ambient", self.set.get("ambient", 0.45))
        scene_fx = {"quakes": [], "flashes": [], "ambient_keys": [[0.0, base_amb]], "base_ambient": base_amb,
                    "graphics": []}
        if sc.get("progress"):  # which step of reading the window this scene is (1-3)
            scene_fx["graphics"].append({"kind": "progress", "active": sc["progress"], "count": 3, "start": 0.4,
                                         "until": dur - 0.3})
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
                r = min(0.95, r * self.zoom_at(t + 0.4, d, cam))  # a close shot needs a wider pool
                sx, sy = self.to_screen(tx, ty, d, t + 0.4, cam)
                prev = keyframes(spot_keys, t - SPOT_TRAVEL * 0.6)
                spot_keys.append([max(spot_keys[-1][0] + 0.01, t - SPOT_TRAVEL * 0.6), *prev[:4]])
                spot_keys.append([t + SPOT_TRAVEL * 0.4, sx, sy, r, 1.0])
                events.append(t)
            elif name == "cut":  # the light snaps with the camera
                prev = keyframes(spot_keys, t - 0.002)
                if not args or args[0] in ("all", "wide"):
                    new_key = [t, 0.5, 0.5, 0.62, 1.0]
                else:
                    c = self.cast[args[0]]
                    tx, ty = c.point("face") if (len(args) > 1 and args[1] == "close" and "face" in c.meta) \
                        else c.point("center")
                    sx, sy = self.to_screen(tx, ty, c.depth, t + 0.01, cam)
                    new_key = [t, sx, sy, min(0.95, c.radius() * self.zoom_at(t + 0.01, c.depth, cam)), 1.0]
                spot_keys.append([max(spot_keys[-1][0] + 0.001, t - 0.002), *prev[:4]])
                spot_keys.append(new_key)
                events.append(t)
            elif name == "face":
                c = self.cast[args[0]]
                if c.layer.get("face"):
                    c.layer["face"]["expr"].append([t, args[1] if len(args) > 1 else "calm"])
                events.append(t)
            elif name == "flood":  # light pours through the whole window from behind
                prev = keyframes(spot_keys, t - 0.6)
                spot_keys.append([max(spot_keys[-1][0] + 0.01, t - 0.6), *prev[:4]])
                spot_keys.append([t + 1.6, 0.5, 0.45, 1.6, float(args[0]) if args else 1.35])
                events.append(t)
            elif name == "label":
                target, _, text = (":".join(args)).partition("|")
                text = re.sub(r":(?=\S)", ": ", text)  # cue parsing strips the space after a colon
                tx, ty, _, d = self.target_of("label", [target])
                sx, sy = self.to_screen(tx, ty, d, t + 0.5, cam)
                if labels:
                    labels[-1]["hold"] = min(labels[-1]["hold"], max(1.0, t - labels[-1]["at"] - 0.2))
                labels.append({"text": text.strip(), "x": sx, "y": sy, "at": t, "hold": 4.5})
                events.append(t)
            elif name == "shatter":
                c = self.cast[args[0]]
                c.layer["shatter"] = {"at": t, "dur": 3.4, "pieces": 80}
                events.append(t)
            elif name == "settle":  # a pane flies into its slot in the Great Window
                c = self.cast[args[0]]
                place = args[1].lstrip("@")
                px, py = self.places[place]
                slot = self.set.get("slot_sizes", {}).get(place, 0.1)
                c.layer["scale_keys"] = [[0, 1.0], [t, 1.0], [t + 3.4, slot / c.h]]
                c.layer["slide"] = [[0, 0, 0], [t, 0, 0], [t + 3.4, px - c.at[0], py - c.at[1]]]
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
            elif name == "fall":
                c = self.cast[args[0]]
                way = args[1] if len(args) > 1 else ("left" if c.at[0] > 0.5 else "right")
                c.layer["fall"] = {"at": t, "dur": 1.1, "angle": -86 if way == "left" else 86}
                events.append(t)
            elif name == "write":
                c = self.cast[args[0]]
                nxt_any = next((cc[0] for cc in self.cues[i + 1:] if cc[1] != "write"), dur - 1.5)
                c.layer["write"] = {"start": t, "end": max(t + 1.5, nxt_any - 0.4),
                                    "lines": c.meta["lines"], "initial": c.meta.get("initial")}
                events.append(t)
            elif name in ("say", "scroll"):
                events.append(t)
            elif name in ACTIONS:
                ACTIONS[name](self, t, args, scene_fx)
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
                gold = len(args) > 1 and args[1] == "gold"  # the gold thread between stories
                ink_fx.append({"type": "ink", "points": pts, "start": t, "end": end,
                               "color": "#ffe08a" if gold else "#7a1f1f", "width": 10 if gold else 6})
                if gold:
                    ink_fx[-1]["glow"] = 0.9
                events.append(t)
            elif name == "sail":
                c = self.cast[args[0]]
                pts = self.routes[args[1]]
                c.layer["pos"] = list(pts[0])  # wait at the start of the route
                end = min(dur - 0.5, max(t + 0.9, nxt - 0.15))
                c.layer["follow"] = {"points": pts, "start": t, "end": end}
                c.layer["anchor"] = [0.5, 0.8]
                events.append(t)
            elif name == "title":
                text, _, sub = (":".join(args)).partition("|")
                title = {"text": text.strip(), "sub": sub.strip() or None, "at": t, "hold": 3.2}
                events.append(t)
        # breathing room: no stretch longer than BREATH_GAP without the lantern moving
        events = sorted(set(events + [dur]))
        # continuous actions keep the screen moving for their whole length, not just their start
        busy = []
        for spec in (spec for _, spec in layers):
            if spec.get("write"):
                busy.append((spec["write"]["start"], spec["write"]["end"]))
            if spec.get("follow"):
                busy.append((spec["follow"]["start"], spec["follow"]["end"]))
            if spec.get("spin"):
                busy.append((spec["spin"]["from"], dur))
            if spec.get("shatter"):
                busy.append((spec["shatter"]["at"], spec["shatter"]["at"] + spec["shatter"].get("dur", 3.4)))
            for k in ("scale_keys", "slide"):
                keys = spec.get(k) or []
                for a_, b_ in zip(keys, keys[1:]):
                    if b_[0] - a_[0] > 1.0 and a_[1:] != b_[1:]:
                        busy.append((a_[0], b_[0]))
        for e in ink_fx:
            busy.append((e["start"], e["end"]))
        for gph in scene_fx["graphics"]:
            if gph["kind"] != "progress":
                busy.append((gph["start"], gph["start"] + gph.get("dur", 3.0)))
        busy.append((0.0, TRANSITION_LEN.get(self.open, 0) + LEAD))           # the window assembling
        busy.append((dur - TRANSITION_LEN.get(self.close, 0) - sc.get("tail", TAIL), dur))  # and closing
        filled = [a_ + k * 1.5 for a_, b_ in busy for k in range(int((b_ - a_) / 1.5) + 1)]
        self.cue_events = sorted(set(events + [x for x in filled if x < dur]))
        breaths = []
        for a, b in zip(events, events[1:]):
            n = int((b - a) // PACE.get("breath_gap", BREATH_GAP))
            for k in range(1, n + 1):
                tm = a + (b - a) * k / (n + 1)
                cur = keyframes(spot_keys, tm)
                swell = 1.28 if len(breaths) % 2 == 0 else 0.82
                sx = cur[0] + (0.5 - cur[0]) * 0.12
                breaths.append((tm, [tm - 1.2, *cur[:4]], [tm + 1.4, sx, cur[1], min(0.9, cur[2] * swell), cur[3]]))
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
        if labels:
            scene["labels"] = labels
        if self.texts:
            scene["texts"] = self.compile_texts(cam, dur)
        focus = [[g["start"], g["until"]] for g in scene_fx["graphics"] if g["kind"] in ("tally", "timeline")]
        focus += [[tx["words"][0][1] - 0.1, tx["until"]] for tx in scene.get("texts", [])
                  if tx["kind"] == "glass" and tx["pos"][1] > 0.4 and tx["pos"][1] < 0.6]
        if focus:
            scene["focus"] = focus
        for k in ("quakes", "flashes", "graphics"):
            if scene_fx[k]:
                scene[k] = scene_fx[k]
        scene["sfx"] = self.sound_effects(dur, scene_fx)
        if len(scene_fx["ambient_keys"]) > 1:
            scene["ambient_keys"] = scene_fx["ambient_keys"]
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


def _merge(base, over):
    """Deep-merge dicts: `over` wins, nested dicts merge key by key."""
    out = dict(base)
    for k, v in over.items():
        out[k] = _merge(out[k], v) if isinstance(v, dict) and isinstance(out.get(k), dict) else v
    return out


def _overrides(base, over, prefix=""):
    """Settings the episode changes (not merely adds) relative to the series."""
    out = []
    for k, v in over.items():
        if k not in base:
            continue
        if isinstance(v, dict) and isinstance(base[k], dict):
            out += _overrides(base[k], v, f"{prefix}{k}.")
        elif v != base[k]:
            out.append(prefix + k)
    return out


def load_episode(ep_dir):
    """episode.yaml merged over the series it belongs to (series.yaml + cast.yaml one folder up).

    The series fixes the look and sound - frame, glass, voice, motif, colours - so episodes
    can't drift apart. An episode may still override a series setting, but the build says so.
    """
    with open(os.path.join(ep_dir, "episode.yaml")) as f:
        ep = yaml.safe_load(f)
    series_dir = os.path.dirname(os.path.abspath(ep_dir))
    series_path = os.path.join(series_dir, "series.yaml")
    if not os.path.exists(series_path):
        return ep
    with open(series_path) as f:
        series = yaml.safe_load(f) or {}
    shared = {k: series[k] for k in SERIES_KEYS if k in series}
    for path in _overrides(shared, ep):
        print(f"  note: {os.path.basename(ep_dir)} overrides the series setting {path}")
    ep = _merge(shared, ep)
    cast_path = os.path.join(series_dir, "cast.yaml")
    if os.path.exists(cast_path):
        with open(cast_path) as f:
            ep["_characters"] = yaml.safe_load(f) or {}
    ep["_series"] = series.get("title")
    ep["_series_dir"] = series_dir
    return ep


def build(ep_dir, render=True, draft=False, stills=False, jobs=None, silent_preview=False):
    ep = load_episode(ep_dir)
    build_dir = os.path.join(ep_dir, "build")
    if os.path.exists(os.path.join(build_dir, "art")):
        shutil.rmtree(os.path.join(build_dir, "art"))
    os.makedirs(build_dir, exist_ok=True)
    CAST_DEFAULTS.clear()
    CAST_DEFAULTS.update(ep.get("cast_defaults", {}))
    PACE.clear()
    PACE.update(ep.get("pace", {}))
    CHARACTERS.clear()
    CHARACTERS.update(ep.get("_characters", {}))
    SERIES["dir"] = ep.get("_series_dir", os.path.dirname(os.path.abspath(ep_dir)))
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
        pane = ep.get("pane")
        if pane and pane.get("scene") == sb.id:  # this story's medallion for the Great Window
            save_pane(sb, pane, build_dir)
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
    score = music.score(total, sections, seed=ep.get("seed", 7), motif=ep.get("motif"))
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
        loudnorm(out)
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
    ep = load_episode(ep_dir)
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


def loudnorm(path, lufs=-14):
    """Bring the mix to YouTube's loudness target (re-encodes audio only)."""
    import subprocess
    tmp = path + ".norm.mp4"
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", path, "-c:v", "copy", "-af",
                    f"loudnorm=I={lufs}:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
                    "-movflags", "+faststart", tmp], check=True)
    os.replace(tmp, path)


def snapshot(sb):
    """The scene's set and cast composed at rest, unlit - the picture a pane is cut from."""
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    for l in sb.set["layers"]:
        im = l["image"]
        if im.size != (W, H):
            im = im.resize((W, H), Image.LANCZOS)
        canvas.alpha_composite(im)
    for c in sorted(sb.cast.values(), key=lambda c: c.depth):
        im = Image.open(c.path).convert("RGBA")
        w = max(1, int(c.w * W))
        im = im.resize((w, max(1, int(im.height * w / im.width))), Image.LANCZOS)
        ax, ay = c.anchor
        canvas.alpha_composite(im, (int(c.at[0] * W - ax * im.width), int(c.at[1] * H - ay * im.height)))
    return canvas


def save_pane(sb, pane, build_dir):
    from .art.glass_stories import make_pane
    img = make_pane(snapshot(sb), pane.get("center", [0.5, 0.5]), pane.get("radius", 0.45))
    panes_dir = os.path.join(SERIES["dir"], "panes")
    os.makedirs(panes_dir, exist_ok=True)
    path = os.path.join(panes_dir, f"{pane['number']}.png")
    img.save(path)
    img.save(os.path.join(build_dir, "pane.png"))
    print(f"  pane {pane['number']} saved for the Great Window")


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
        warn = PACE.get("gap_warn", GAP_WARN)
        gaps = [(a, b) for a, b in zip(sb.cue_events, sb.cue_events[1:]) if b - a > warn]
        for a, b in gaps:
            warnings.append(f"{sb.id}: {b - a:.1f}s with no scripted action ({fmt(sb.start + a)}-{fmt(sb.start + b)})")
        for a, b, text in sb.captions:
            srt.append(f"{n}\n{srt_time(sb.start + a)} --> {srt_time(sb.start + b)}\n{text}\n")
            n += 1
        lines.append("")
    # on-screen words are seasoning: flag episodes and scenes that use too many
    per_min = PACE.get("max_texts_per_minute", 1.0)
    n_texts = sum(len(sb.texts) for sb in builds)
    if n_texts > per_min * total / 60 + 0.5:
        warnings.append(f"text: {n_texts} on-screen text moments in {fmt(total)} - keep to about "
                        f"{per_min:g} a minute, for the lines that matter most")
    for sb in builds:
        if len(sb.texts) > PACE.get("max_texts_per_scene", 1):
            warnings.append(f"text: {sb.id} has {len(sb.texts)} text moments - one per scene at most")
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

