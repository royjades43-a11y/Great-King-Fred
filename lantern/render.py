"""Render a Lantern Theatre scene file to video.

    python -m lantern.render demo/scene.json -o out/demo.mp4
    python -m lantern.render demo/scene.json --still 1:4.5 -o out/still.png   # scene 1 at 4.5s
    python -m lantern.render demo/scene.json --scale 0.5 -o out/preview.mp4  # fast draft
"""
import argparse
import json
import math
import os
import subprocess
import sys
import tempfile
from multiprocessing import Pool

import numpy as np
from PIL import Image

from . import audio
from .anim import ease_in, ease_in_out, ease_out, keyframes, point_along, smooth_noise
from .fx import draw_flame, draw_ink, duotone, paper_card
from .stage import Dust, Stage

DEFAULT_STYLE = {
    "shadow": "#141833",     # indigo shadows
    "mid": "#6b4a32",
    "highlight": "#f2dcb0",  # sepia highlights
    "grade": 0.85,           # how strongly layers are pushed into the duotone
    "ambient": 0.5,          # stage brightness outside the spotlight
    "flicker": 0.035,        # lantern brightness wobble
    "grain": 5.0,
    "dust": 60.0,
    "backdrop": "#0c0806",
}

TRANSITION_LEN = {"curtain": 1.3, "lantern": 0.35, "fade": 0.7, "none": 0.0}


def T(x, y):
    return np.array([[1, 0, x], [0, 1, y], [0, 0, 1]], np.float64)


def S(s):
    return np.array([[s, 0, 0], [0, s, 0], [0, 0, 1]], np.float64)


def R(deg, cx, cy):
    a = math.radians(deg)
    c, s = math.cos(a), math.sin(a)
    return T(cx, cy) @ np.array([[c, -s, 0], [s, c, 0], [0, 0, 1]]) @ T(-cx, -cy)


class Layer:
    def __init__(self, spec, base_dir, W, H, style):
        self.spec = spec
        img = Image.open(os.path.join(base_dir, spec["image"])).convert("RGBA")
        if "pos" in spec:  # a cut-out figure placed on stage
            w = spec.get("scale", 0.2) * W
            img = img.resize((max(1, int(w)), max(1, int(img.height * w / img.width))), Image.LANCZOS)
        else:  # a full backdrop, scaled to cover the stage
            s = max(W / img.width, H / img.height) * spec.get("scale", 1.0)
            img = img.resize((int(img.width * s), int(img.height * s)), Image.LANCZOS)
        grade = spec.get("grade", style["grade"])
        if grade:
            img = duotone(img, style["shadow"], style["mid"], style["highlight"], grade)
        self.iw, self.ih = img.size
        if spec.get("paper", "pos" in spec):
            self.card, self.pad = paper_card(img, edge_px=max(1, int(3 * W / 1280)),
                                             shadow_px=max(2, int(10 * W / 1280)))
        else:
            self.card, self.pad = img, 0
        self.depth = spec.get("depth", 1.0)
        self.W, self.H = W, H

    def offset(self, t, dur):
        """Stage-logic movement: slides on rails, drop-ins, exits and bobbing."""
        W, H, sp = self.W, self.H, self.spec
        dx, dy = keyframes(sp.get("slide"), t, (0.0, 0.0))
        dx, dy = dx * W, dy * H
        follow = sp.get("follow")  # travel along a path, e.g. a ship tracing an ink route
        if follow and "pos" in sp:
            prog = (t - follow.get("start", 0)) / max(1e-6, follow.get("end", dur) - follow.get("start", 0))
            fx, fy = point_along(follow["points"], ease_in_out(prog), (W, H))
            dx += (fx - sp["pos"][0]) * W
            dy += (fy - sp["pos"][1]) * H
        for key, inbound in (("enter", True), ("exit", False)):
            mv = sp.get(key)
            if not mv:
                continue
            at, d = mv.get("at", 0.0 if inbound else dur - 1.0), mv.get("dur", 1.0)
            u = (t - at) / d
            k = 1 - ease_out(u) if inbound else ease_in(u)
            if inbound and t < at:
                k = 1.0
            vec = {"top": (0, -1.1 * H), "bottom": (0, 1.1 * H), "left": (-1.1 * W, 0),
                   "right": (1.1 * W, 0)}[mv.get("from", mv.get("to", "top"))]
            dx += vec[0] * k
            dy += vec[1] * k
        bob = sp.get("bob")
        if bob:
            dy += bob.get("amp", 0.006) * H * math.sin(2 * math.pi * t / bob.get("period", 3.0))
        return dx, dy

    def angle(self, t):
        a = 0.0
        sway = self.spec.get("sway")
        if sway:
            a += sway.get("amp", 2.0) * math.sin(2 * math.pi * t / sway.get("period", 4.0) + sway.get("phase", 0))
            a += sway.get("amp", 2.0) * 0.3 * smooth_noise(t, sway.get("phase", 0), 2.0)
        bob = self.spec.get("bob")
        if bob:
            a += bob.get("roll", 1.5) * math.sin(2 * math.pi * t / bob.get("period", 3.0) + 0.9)
        return a

    def matrix(self, t, dur, cam):
        """Forward transform: card pixels -> screen pixels."""
        W, H, sp = self.W, self.H, self.spec
        if "pos" in sp:
            ax, ay = sp.get("anchor", (0.5, 1.0))
            tlx = sp["pos"][0] * W - ax * self.iw
            tly = sp["pos"][1] * H - ay * self.ih
        else:
            tlx, tly = (W - self.iw) / 2, (H - self.ih) / 2
        px, py = sp.get("pivot", (0.5, 1.0))
        dx, dy = self.offset(t, dur)
        local = T(dx, dy) @ R(self.angle(t), tlx + px * self.iw, tly + py * self.ih) @ T(tlx - self.pad, tly - self.pad)
        z, fx, fy = cam
        d = self.depth
        zl = 1 + (z - 1) * d
        cx = W / 2 + (fx * W - W / 2) * d
        cy = H / 2 + (fy * H - H / 2) * d
        return T(W / 2, H / 2) @ S(zl) @ T(-cx, -cy) @ local

    def render(self, t, dur, cam, lights):
        img = self.card
        fx = self.spec.get("fx", [])
        if fx:
            img = img.copy()
        M = self.matrix(t, dur, cam)
        k = self.W / 1280
        for i, e in enumerate(fx):
            x = self.pad + e.get("x", 0.5) * self.iw
            y = self.pad + e.get("y", 0.5) * self.ih
            if e["type"] == "flame":
                if t < e.get("from", -1):
                    continue
                size = e.get("size", 0.012) * self.W
                inten = draw_flame(img, x, y, size, t, seed=i + e.get("seed", 0))
                sx, sy, _ = M @ np.array([x, y - size * 0.6, 1.0])
                lights.append((sx, sy, e.get("glow", 0.06) * self.W, inten * e.get("light", 0.35)))
            elif e["type"] == "ink":
                pts = [(self.pad + p[0] * self.iw, self.pad + p[1] * self.ih) for p in e["points"]]
                prog = (t - e.get("start", 0)) / max(1e-6, e.get("end", dur) - e.get("start", 0))
                draw_ink(img, pts, ease_in_out(prog), e.get("color", "#7a1f1f"), e.get("width", 4) * k)
        ax, ay = self.spec.get("anchor", (0.5, 1.0))
        self.screen_pos = (M @ np.array([self.pad + ax * self.iw, self.pad + 0.5 * self.ih, 1.0]))[:2]
        inv = np.linalg.inv(M)
        return img.transform((self.W, self.H), Image.AFFINE, data=tuple(inv[:2].flatten()),
                             resample=Image.BICUBIC)


class Project:
    def __init__(self, path, scale=1.0):
        with open(path) as f:
            self.data = json.load(f)
        self.base = os.path.dirname(os.path.abspath(path))
        self.W = int(self.data.get("width", 1920) * scale) // 2 * 2
        self.H = int(self.data.get("height", 1080) * scale) // 2 * 2
        self.fps = self.data.get("fps", 24)
        self.style = {**DEFAULT_STYLE, **self.data.get("style", {})}
        self.stage = Stage(self.W, self.H, self.style)
        self.dust = Dust(self.W, self.H, count=int(140 * self.W / 1280))
        self.scenes = []
        for sc in self.data["scenes"]:
            layers = [Layer(l, self.base, self.W, self.H, self.style) for l in sc.get("layers", [])]
            ticket = None
            if sc.get("title"):
                ticket = self.stage.ticket(sc["title"]["text"], sc["title"].get("sub"))
            self.scenes.append((sc, layers, ticket))
        yy, xx = np.mgrid[0:self.H, 0:self.W]
        self.xx, self.yy = xx.astype(np.float32), yy.astype(np.float32)

    def timeline(self):
        frames = []
        for i, (sc, _, _) in enumerate(self.scenes):
            n = int(round(sc["duration"] * self.fps))
            frames += [(i, f / self.fps) for f in range(n)]
        return frames

    # ---------------------------------------------------------------- one frame
    def frame(self, si, t, seed):
        sc, layers, ticket = self.scenes[si]
        W, H, st = self.W, self.H, self.style
        dur = sc["duration"]

        cam_keys = sc.get("camera") or [[0, 1.0, 0.5, 0.5], [dur, 1.035, 0.5, 0.5]]
        z, fx, fy = keyframes(cam_keys, t)
        # never pan so far that a backdrop's edge slides into the opening
        ox, oy, _, _ = self.stage.opening
        z = max(z, 1.0)
        lim_x = 0.5 * (1 - 1 / z) + ox / W / z
        lim_y = 0.5 * (1 - 1 / z) + oy / H / z
        cam = (z, min(max(fx, 0.5 - lim_x), 0.5 + lim_x), min(max(fy, 0.5 - lim_y), 0.5 + lim_y))

        canvas = Image.new("RGBA", (W, H), tuple(int(st["backdrop"][i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        lights = []
        for layer in layers:
            canvas.alpha_composite(layer.render(t, dur, cam, lights))

        rgb = np.asarray(canvas.convert("RGB")).astype(np.float32)

        # --- lighting: dim stage, a warm lantern pool that follows the narration, flame glows
        amb = sc.get("ambient", st["ambient"])
        spot = keyframes(sc.get("spotlight"), t)
        track = sc.get("spotlight_follow")  # {"layer": i, "from": s, "to": s, "offset": [dx, dy]}
        if spot and track and track.get("from", 0) <= t <= track.get("to", dur):
            px, py = layers[track["layer"]].screen_pos
            ox, oy = track.get("offset", (0, 0))
            spot = (px / W + ox, py / H + oy) + tuple(spot[2:])
        cool = np.array([0.82, 0.88, 1.02], np.float32)
        warm = np.array([1.08, 0.99, 0.86], np.float32)
        if spot:
            sx, sy, sr = spot[0] * W, spot[1] * H, spot[2] * W
            # soft-edged pool with a slightly harder core, like a lens-focused lantern
            d2 = ((self.xx - sx) ** 2 + ((self.yy - sy) * 1.15) ** 2) / (sr * sr)
            pool = np.exp(-d2 * 1.6) * (spot[3] if len(spot) > 3 else 1.0)
            light = amb + (1 - amb) * pool
            tint = cool + (warm - cool) * np.clip(pool, 0, 1)[..., None]
        else:
            light = np.ones((H, W), np.float32)
            tint = np.ones(3, np.float32) * 0.5 * (cool + warm)
        for lx, ly, lr, li in lights:
            d2 = ((self.xx - lx) ** 2 + (self.yy - ly) ** 2) / (lr * lr)
            light = light + li * np.exp(-d2)
        flicker = 1 + st["flicker"] * smooth_noise(t + si * 17.0, 0.7, 6.0)
        rgb *= (light[..., None] * tint) * flicker
        self.dust.render(rgb, light, t + si * 31.0, st["dust"])

        img = Image.fromarray(rgb.clip(0, 255).astype(np.uint8), "RGB").convert("RGBA")

        # --- title ticket rises from behind the stage lip
        if ticket is not None:
            tt = sc["title"]
            at, hold = tt.get("at", 0.8), tt.get("hold", 3.0)
            rise = ease_out((t - at) / 0.9)
            fall = ease_in((t - at - 0.9 - hold) / 0.7)
            k = rise - fall
            if k > 0:
                y_hidden = self.stage.opening[3] + 10
                y_shown = self.stage.opening[3] - ticket.height - int(18 * W / 1280)
                tx = (W - ticket.width) // 2
                img.alpha_composite(ticket, (tx, int(y_hidden + (y_shown - y_hidden) * k)))

        # --- curtains
        closed = 0.0
        o, c = sc.get("open", "curtain"), sc.get("close", "curtain")
        if o == "curtain":
            closed = max(closed, 1 - ease_in_out(t / TRANSITION_LEN["curtain"]))
        if c == "curtain":
            closed = max(closed, ease_in_out((t - (dur - TRANSITION_LEN["curtain"])) / TRANSITION_LEN["curtain"]))
        self.stage.composite_curtains(img, closed)

        img.alpha_composite(self.stage.frame)
        out = np.asarray(img.convert("RGB")).astype(np.float32)
        out *= self.stage.vignette[..., None]
        out += self.stage.grain[seed % len(self.stage.grain)][..., None] * st["grain"]

        # --- lantern-slide flashes and fades
        flash, black = 0.0, 0.0
        if o == "lantern":
            flash = max(flash, 1 - ease_out(t / TRANSITION_LEN["lantern"]))
        if c == "lantern":
            flash = max(flash, ease_in((t - (dur - TRANSITION_LEN["lantern"])) / TRANSITION_LEN["lantern"]))
        if o == "fade":
            black = max(black, 1 - ease_in_out(t / TRANSITION_LEN["fade"]))
        if c == "fade":
            black = max(black, ease_in_out((t - (dur - TRANSITION_LEN["fade"])) / TRANSITION_LEN["fade"]))
        if flash:
            out += (np.array([250, 238, 210], np.float32) - out) * flash * 0.9
        if black:
            out *= 1 - black
        return out.clip(0, 255).astype(np.uint8)

    # ---------------------------------------------------------------- sound cues
    def cues(self):
        events, start = [], 0.0
        for sc, layers, _ in self.scenes:
            dur = sc["duration"]
            o, c = sc.get("open", "curtain"), sc.get("close", "curtain")
            if o == "curtain":
                events.append(("curtain", start, TRANSITION_LEN["curtain"]))
            if c == "curtain":
                events.append(("curtain", start + dur - TRANSITION_LEN["curtain"], TRANSITION_LEN["curtain"]))
            if o == "lantern":
                events.append(("clack", start, 0))
            if c == "lantern":
                events.append(("clack", start + dur - 0.05, 0))
            if sc.get("title"):
                events.append(("slide", start + sc["title"].get("at", 0.8), 0.9))
            for l in layers:
                if l.spec.get("enter"):
                    events.append(("slide", start + l.spec["enter"].get("at", 0), l.spec["enter"].get("dur", 1)))
            start += dur
        return events, start


_P = None


def _init(path, scale):
    global _P
    _P = Project(path, scale)


def _render(job):
    i, (si, t) = job
    return _P.frame(si, t, i).tobytes()


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("scene")
    ap.add_argument("-o", "--out", default="out/lantern.mp4")
    ap.add_argument("--scale", type=float, default=1.0, help="render size multiplier (0.5 for drafts)")
    ap.add_argument("--still", help="render one PNG: SCENE:SECONDS (scene index from 0)")
    ap.add_argument("--jobs", type=int, default=os.cpu_count())
    ap.add_argument("--no-audio", action="store_true")
    a = ap.parse_args(argv)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)

    if a.still:
        si, t = a.still.split(":")
        p = Project(a.scene, a.scale)
        Image.fromarray(p.frame(int(si), float(t), 0)).save(a.out)
        print(f"wrote {a.out}")
        return

    p = Project(a.scene, a.scale)
    frames = p.timeline()
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{p.W}x{p.H}", "-r", str(p.fps), "-i", "-"]
    wav = None
    if not a.no_audio:
        events, total = p.cues()
        wav = tempfile.NamedTemporaryFile(suffix=".wav", delete=False).name
        audio.render(wav, events, total, p.data.get("audio", {}), p.base)
        cmd += ["-i", wav, "-c:a", "aac", "-b:a", "192k"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", "-shortest", a.out]
    enc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(a.jobs, initializer=_init, initargs=(a.scene, a.scale)) as pool:
        for n, buf in enumerate(pool.imap(_render, enumerate(frames), chunksize=4)):
            enc.stdin.write(buf)
            if n % p.fps == 0:
                sys.stdout.write(f"\rframe {n}/{len(frames)}")
                sys.stdout.flush()
    enc.stdin.close()
    enc.wait()
    if wav:
        os.unlink(wav)
    print(f"\nwrote {a.out}")


if __name__ == "__main__":
    main()
