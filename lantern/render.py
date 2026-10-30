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
from PIL import Image, ImageDraw, ImageFilter

from . import audio, graphics
from .anim import clamp, ease_in, ease_in_out, ease_out, keyframes, point_along, smooth_noise
from .fx import draw_flame, draw_ink, draw_smoke, duotone, paper_card
from .stage import Dust, Snow, Stage

DEFAULT_STYLE = {
    "shadow": "#1c2140",     # indigo shadows
    "mid": "#6b4a32",
    "highlight": "#f2dcb0",  # sepia highlights
    "grade": 0.85,           # how strongly layers are pushed into the duotone
    "ambient": 0.5,          # stage brightness outside the spotlight
    "flicker": 0.035,        # lantern brightness wobble
    "grain": 5.0,
    "dust": 60.0,
    "backdrop": "#0c0806",
}

TRANSITION_LEN = {"curtain": 1.3, "lantern": 0.35, "fade": 0.7, "glass": 1.6, "shatter": 1.8, "none": 0.0}


def clamp_camera(z, fx, fy, W=1920, H=1080):
    """Never pan so far that a backdrop's edge slides into the stage opening."""
    k = W / 1280.0
    ox, oy = int(58 * k), int(36 * k)  # matches Stage.opening
    z = max(z, 1.0)
    lim_x = 0.5 * (1 - 1 / z) + ox / W / z
    lim_y = 0.5 * (1 - 1 / z) + oy / H / z
    return z, min(max(fx, 0.5 - lim_x), 0.5 + lim_x), min(max(fy, 0.5 - lim_y), 0.5 + lim_y)


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
        # `hires` keeps extra resolution for layers the camera or a scale animation enlarges
        self.hr = hr = spec.get("hires", 1)
        if "pos" in spec:  # a cut-out figure placed on stage
            w = spec.get("scale", 0.2) * W
            lw, lh = max(1, int(w)), max(1, int(img.height * w / img.width))
        else:  # a full backdrop, scaled to cover the stage
            s = max(W / img.width, H / img.height) * spec.get("scale", 1.0)
            lw, lh = int(img.width * s), int(img.height * s)
        img = img.resize((int(lw * hr), int(lh * hr)), Image.LANCZOS)
        grade = spec.get("grade", style["grade"])
        if grade:
            img = duotone(img, style["shadow"], style["mid"], style["highlight"], grade)
        self.iw, self.ih = lw, lh
        if spec.get("paper", "pos" in spec):
            self.card, self.pad = paper_card(img, edge_px=max(1, int(3 * W / 1280)),
                                             shadow_px=max(2, int(10 * W / 1280)))
        else:
            self.card, self.pad = img, 0
        self.depth = spec.get("depth", 1.0)
        self.W, self.H = W, H
        self.pieces = self._shards(spec["shatter"]) if spec.get("shatter") else None

    def _shards(self, sh):
        """Cut the card into Voronoi shards that fall when the layer shatters."""
        rng = np.random.default_rng(sh.get("seed", 3))
        a = np.asarray(self.card.getchannel("A"))
        h, w = a.shape
        n = sh.get("pieces", 60)
        sx, sy = rng.uniform(0, w, n), rng.uniform(0, h, n)
        q = 4
        gy, gx = np.mgrid[0:h:q, 0:w:q].astype(np.float32)
        best = np.full(gx.shape, np.inf, np.float32)
        cell = np.zeros(gx.shape, np.int32)
        for i in range(n):
            d = (gx - sx[i]) ** 2 + (gy - sy[i]) ** 2
            c = d < best
            best[c], cell[c] = d[c], i
        cell = cell.repeat(q, 0).repeat(q, 1)[:h, :w]
        card = np.asarray(self.card)
        pieces = []
        for i in range(n):
            m = (cell == i) & (a > 0)
            if not m.any():
                continue
            ys, xs = np.nonzero(m)
            x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
            px = card[y0:y1, x0:x1].copy()
            px[..., 3] = np.where(m[y0:y1, x0:x1], px[..., 3], 0)
            # shards near the middle go first, the rest follow, like a roof giving way from the centre
            delay = abs((x0 + x1) / 2 / w - 0.5) * sh.get("spread", 1.6) + rng.uniform(0, 0.5)
            pieces.append((Image.fromarray(px, "RGBA"), x0, y0, rng.uniform(-0.12, 0.12) * self.W,
                           rng.uniform(-70, 70), delay))
        return pieces

    def _render_shatter(self, t, M):
        sh = self.spec["shatter"]
        out = Image.new("RGBA", (self.W, self.H), (0, 0, 0, 0))
        g = 0.9 * self.H  # slower than real gravity: the collapse is the moment, let it be seen
        fade = 1 - clamp((t - sh["at"] - sh.get("dur", 3.0) * 0.6) / (sh.get("dur", 3.0) * 0.4))
        for img, x0, y0, vx, spin, delay in self.pieces:
            tau = max(0.0, t - sh["at"] - delay)
            pw, ph = img.size
            Mp = M @ T(x0 + vx * tau, y0 + 0.5 * g * tau * tau) @ R(spin * tau, pw / 2, ph / 2)
            corners = Mp @ np.array([[0, pw, 0, pw], [0, 0, ph, ph], [1, 1, 1, 1]], np.float64)
            bx0, by0 = max(0, int(corners[0].min()) - 1), max(0, int(corners[1].min()) - 1)
            bx1, by1 = min(self.W, int(corners[0].max()) + 2), min(self.H, int(corners[1].max()) + 2)
            if bx1 <= bx0 or by1 <= by0:
                continue
            inv = np.linalg.inv(T(-bx0, -by0) @ Mp)
            piece = img.transform((bx1 - bx0, by1 - by0), Image.AFFINE, data=tuple(inv[:2].flatten()),
                                  resample=Image.BILINEAR)
            if fade < 1:
                piece.putalpha(piece.getchannel("A").point(lambda v: int(v * fade)))
            out.alpha_composite(piece, (bx0, by0))
        return out

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
        tilt = self.spec.get("angle_keys")  # [[t, degrees]]: bowing, recoiling, leaning in
        if tilt:
            a += keyframes(tilt, t)[0]
        if self.spec.get("spin"):  # continuous turning, e.g. a millstone (deg per second)
            sp = self.spec["spin"]
            a += sp["rate"] * max(0.0, t - sp.get("from", 0.0))
        fall = self.spec.get("fall")  # topple about the pivot, accelerating like a falling body
        if fall and t > fall["at"]:
            a += fall.get("angle", -88) * ease_in((t - fall["at"]) / fall.get("dur", 1.1))
        return a

    def _written(self, img, t, wr):
        lines = wr["lines"]
        lens = [max(1e-3, b[2] - b[0]) for b in lines]
        prog = clamp((t - wr["start"]) / max(1e-3, wr["end"] - wr["start"])) * sum(lens)
        a = np.asarray(img.getchannel("A")).astype(np.float32)
        keep = np.zeros_like(a)
        if wr.get("initial"):
            x0, y0, x1, y1 = (int(v * n) + self.pad for v, n in zip(wr["initial"], (self.iw, self.ih) * 2))
            keep[y0:y1, x0:x1] = 1
        for b, L in zip(lines, lens):
            if prog <= 0:
                break
            x0, y0, x1, y1 = (int(v * n) + self.pad for v, n in zip(b, (self.iw, self.ih) * 2))
            reveal = x0 + (x1 - x0) * min(1.0, prog / L)
            xs = np.arange(a.shape[1], dtype=np.float32)
            ramp = np.clip((reveal - xs) / (0.02 * self.W) + 0.5, 0, 1)  # soft ink edge
            keep[y0:y1, :] = np.maximum(keep[y0:y1, :], ramp[None, :] * ((xs >= x0 - 2) & (xs <= x1 + 2))[None, :])
            prog -= L
        out = img.copy()
        out.putalpha(Image.fromarray((a * keep).astype(np.uint8)))
        return out

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
        local = (T(dx, dy) @ R(self.angle(t), tlx + px * self.iw, tly + py * self.ih)
                 @ T(tlx, tly) @ S(1 / self.hr) @ T(-self.pad, -self.pad))
        sk = sp.get("scale_keys")  # [[t, k]]: grow or shrink about the anchor point
        if sk:
            k, = keyframes(sk, t)
            ax, ay = sp.get("anchor", (0.5, 1.0)) if "pos" in sp else (0.5, 0.5)
            cxs, cys = tlx + ax * self.iw + dx, tly + ay * self.ih + dy
            local = T(cxs, cys) @ S(k) @ T(-cxs, -cys) @ local
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
        iw, ih = self.iw * self.hr, self.ih * self.hr  # card pixels (hi-res layers are drawn larger)
        k *= self.hr
        for i, e in enumerate(fx):
            x = self.pad + e.get("x", 0.5) * iw
            y = self.pad + e.get("y", 0.5) * ih
            if e["type"] == "flame":
                if t < e.get("from", -1):
                    continue
                size = e.get("size", 0.012) * self.W * self.hr
                inten = draw_flame(img, x, y, size, t, seed=i + e.get("seed", 0))
                sx, sy, _ = M @ np.array([x, y - size * 0.6, 1.0])
                lights.append((sx, sy, e.get("glow", 0.06) * self.W, inten * e.get("light", 0.35)))
            elif e["type"] == "smoke":
                draw_smoke(img, x, y, e.get("size", 0.03) * self.W * self.hr, t, seed=i + e.get("seed", 0))
            elif e["type"] == "ink":
                pts = [(self.pad + p[0] * iw, self.pad + p[1] * ih) for p in e["points"]]
                prog = (t - e.get("start", 0)) / max(1e-6, e.get("end", dur) - e.get("start", 0))
                p = ease_in_out(prog)
                draw_ink(img, pts, p, e.get("color", "#7a1f1f"), e.get("width", 4) * k)
                if e.get("glow") and p > 0:  # a gold thread carries its own light along with it
                    nx, ny = point_along(pts, p)
                    glows = [((nx, ny), e["glow"])]
                    glows += [(point_along(pts, p * f), e["glow"] * 0.45) for f in (0.15, 0.4, 0.65, 0.88)]
                    for (qx, qy), li in glows:
                        sx, sy, _ = M @ np.array([qx, qy, 1.0])
                        lights.append((sx, sy, 0.06 * self.W, li))
        ax, ay = self.spec.get("anchor", (0.5, 1.0))
        self.screen_pos = (M @ np.array([self.pad + ax * self.iw, self.pad + 0.5 * self.ih, 1.0]))[:2]
        sh = self.spec.get("shatter")
        if sh and t >= sh["at"]:
            return self._render_shatter(t, M), (0, 0)
        wr = self.spec.get("write")  # scripture written out line by line, in time with the voice
        if wr:
            img = self._written(img, t, wr)
        # only transform the screen rectangle the card actually covers
        cw, ch = img.size
        corners = M @ np.array([[0, cw, 0, cw], [0, 0, ch, ch], [1, 1, 1, 1]], np.float64)
        x0 = max(0, int(math.floor(corners[0].min())) - 2)
        y0 = max(0, int(math.floor(corners[1].min())) - 2)
        x1 = min(self.W, int(math.ceil(corners[0].max())) + 2)
        y1 = min(self.H, int(math.ceil(corners[1].max())) + 2)
        if x1 <= x0 or y1 <= y0:
            return None, (0, 0)
        inv = np.linalg.inv(T(-x0, -y0) @ M)
        out = img.transform((x1 - x0, y1 - y0), Image.AFFINE, data=tuple(inv[:2].flatten()),
                            resample=Image.BILINEAR)
        op = self.spec.get("opacity")  # [[t, alpha]]: appear, vanish, swap between poses
        if op:
            a = keyframes(op, t)[0]
            if a <= 0.001:
                return None, (0, 0)
            if a < 0.999:
                out.putalpha(out.getchannel("A").point(lambda v: int(v * a)))
        return out, (x0, y0)


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
            sc["_labels"] = [(lb, self.stage.label(lb["text"])) for lb in sc.get("labels", [])]
            sc["_texts"] = [self._prepare_text(it) for it in sc.get("texts", [])]
            sc["_graphics"] = [graphics.prepare(g, self.W, self.H) for g in sc.get("graphics", [])]
            self.scenes.append((sc, layers, ticket))
        self.snow = Snow(self.W, self.H, count=int(260 * self.W / 1280))
        if self.style.get("rays"):  # soft diagonal sunbeams, wider than the frame so they can drift
            rr = np.random.default_rng(4)
            span = self.W * 2
            yy, xx = np.mgrid[0:self.H, 0:span].astype(np.float32)
            u = (xx + yy * 0.55) / (self.W * 0.11)
            beams = np.zeros_like(u)
            for _ in range(5):
                c, wdt = rr.uniform(0, span / (self.W * 0.11)), rr.uniform(0.15, 0.45)
                beams += np.exp(-((u - c) / wdt) ** 2) * rr.uniform(0.5, 1.0)
            self.rays = (beams * (1 - yy / self.H * 0.6)).astype(np.float32)
        # half-resolution pixel-centre grid for the lighting pass
        yy, xx = np.mgrid[0:(self.H + 1) // 2, 0:(self.W + 1) // 2]
        self.xx, self.yy = xx.astype(np.float32) * 2 + 0.5, yy.astype(np.float32) * 2 + 0.5

    def _prepare_text(self, it):
        """Pre-render on-screen words: leaded-glass lettering, or a speech scroll."""
        W, H = self.W, self.H
        if it["kind"] == "scroll":
            size = it.get("size", 0.05) * H
            rib, placed, wy = self.stage.banderole([w for w, _ in it["words"]], size)
            if rib.width > W * 0.86:  # long speeches: shrink the scroll to fit the window
                size *= W * 0.86 / rib.width
                rib, placed, wy = self.stage.banderole([w for w, _ in it["words"]], size)
            return {"it": it, "ribbon": rib, "words": [(im, x, wy, t) for (im, x), (_, t) in zip(placed, it["words"])]}
        from .art.glass import glass_word
        size = it.get("size", 0.085) * H
        ims = [glass_word(w.upper(), size, it.get("palette", "gold"), seed=i) for i, (w, _) in enumerate(it["words"])]
        gap = -size * 0.42  # glass words carry their own halo padding
        lines, cur, width = [], [], 0.0
        for im, (_, t) in zip(ims, it["words"]):  # wrap onto a second line if it would overrun the window
            if cur and width + gap + im.width > W * 0.84:
                lines.append((cur, width))
                cur, width = [], 0.0
            width += (gap if cur else 0) + im.width
            cur.append((im, t))
        lines.append((cur, width))
        placed, lh = [], ims[0].height * 0.72
        cx, cy = it.get("pos", [0.5, 0.27])
        y0 = cy * H - (len(lines) * lh) / 2 - ims[0].height * 0.14
        for li, (row, wdt) in enumerate(lines):
            x = cx * W - wdt / 2
            for im, t in row:
                placed.append((im, x, y0 + li * lh, t))
                x += im.width + gap
        return {"it": it, "words": placed}

    def _draw_texts(self, img, sc, t):
        W, H = self.W, self.H
        for pt in sc.get("_texts", []):
            it = pt["it"]
            end_k = clamp((t - it["until"]) / 0.45)
            if t < it["words"][0][1] - 0.3 or end_k >= 1:
                continue
            fade = 1 - end_k
            if it["kind"] == "scroll":
                rib = pt["ribbon"]
                t0 = it["words"][0][1] - 0.3
                u = ease_out((t - t0) / 0.45)  # the scroll unrolls from its middle
                if u <= 0:
                    continue
                vis = max(2, int(rib.width * u))
                piece = rib.crop(((rib.width - vis) // 2, 0, (rib.width + vis) // 2, rib.height))
                layer = Image.new("RGBA", rib.size, (0, 0, 0, 0))
                layer.alpha_composite(piece, ((rib.width - vis) // 2, 0))
                for im, x, wy, tw in pt["words"]:
                    a = clamp((t - tw + 0.05) / 0.22)
                    if a > 0 and u > 0.98:
                        w_im = im if a >= 1 else im.copy()
                        if a < 1:
                            w_im.putalpha(im.getchannel("A").point(lambda v, a=a: int(v * a)))
                        layer.alpha_composite(w_im, (int(x), int(wy)))
                if fade < 1:
                    layer.putalpha(layer.getchannel("A").point(lambda v: int(v * fade)))
                px, py = it["pos"]
                img.alpha_composite(layer, (int(px * W - rib.width / 2), int(py * H - rib.height / 2)))
                continue
            for im, x, y, tw in pt["words"]:
                k = clamp((t - tw + 0.04) / 0.35)
                if k <= 0:
                    continue
                e = ease_out(k)
                s_ = 1.28 - 0.28 * e  # each word lands with a small pop as it is spoken
                a = min(e, fade)
                w_im = im
                if s_ > 1.001:
                    w_im = im.resize((max(1, int(im.width * s_)), max(1, int(im.height * s_))), Image.BILINEAR)
                if a < 0.999:
                    w_im = w_im.copy()
                    w_im.putalpha(w_im.getchannel("A").point(lambda v, a=a: int(v * a)))
                dy = end_k * 0.03 * H
                img.alpha_composite(w_im, (int(x - (w_im.width - im.width) / 2),
                                           int(y - (w_im.height - im.height) / 2 + dy)))

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
        cam = clamp_camera(*keyframes(cam_keys, t), W, H)
        for qt, amp, qd in sc.get("quakes", []):  # impacts shake the whole window
            if qt <= t < qt + qd:
                k = amp * (1 - (t - qt) / qd)
                cam = (cam[0] + k * 0.25, cam[1] + k * math.sin(t * 71.0), cam[2] + k * math.sin(t * 53.0 + 1.3))

        canvas = Image.new("RGBA", (W, H), tuple(int(st["backdrop"][i:i + 2], 16) for i in (1, 3, 5)) + (255,))
        lights = []
        for layer in layers:
            piece, at = layer.render(t, dur, cam, lights)
            if piece is not None:
                canvas.alpha_composite(piece, at)

        rgb = np.asarray(canvas.convert("RGB")).astype(np.float32)

        # --- lighting: dim stage, a warm lantern pool that follows the narration, flame glows.
        # Light is smooth, so it is computed at half resolution and scaled up.
        amb = sc.get("ambient", st["ambient"])
        if sc.get("ambient_keys"):  # darkness falling, light returning
            amb = keyframes(sc["ambient_keys"], t)[0]
        spot = keyframes(sc.get("spotlight"), t)
        track = sc.get("spotlight_follow")  # {"layer": i, "from": s, "to": s, "offset": [dx, dy]}
        if spot and track and track.get("from", 0) <= t <= track.get("to", dur):
            px, py = layers[track["layer"]].screen_pos
            ox, oy = track.get("offset", (0, 0))
            spot = (px / W + ox, py / H + oy) + tuple(spot[2:])
        cool = np.array([0.82, 0.88, 1.02], np.float32)
        warm = np.array([1.08, 0.99, 0.86], np.float32)
        xx, yy = self.xx, self.yy
        if spot:
            sx, sy, sr = spot[0] * W, spot[1] * H, spot[2] * W
            # soft-edged pool with a slightly harder core, like a lens-focused lantern
            d2 = ((xx - sx) ** 2 + ((yy - sy) * 1.15) ** 2) / (sr * sr)
            pool = np.exp(-d2 * 1.6) * (spot[3] if len(spot) > 3 else 1.0)
            light = amb + (1 - amb) * pool
            warmth = np.clip(pool, 0, 1)
        else:
            light = np.ones(xx.shape, np.float32)
            warmth = np.full(xx.shape, 0.5, np.float32)
        for lx, ly, lr, li in lights:
            d2 = ((xx - lx) ** 2 + (yy - ly) ** 2) / (lr * lr)
            light = light + li * np.exp(-d2)
        light = light.repeat(2, 0).repeat(2, 1)[:H, :W]
        warmth = warmth.repeat(2, 0).repeat(2, 1)[:H, :W]
        tint = cool + (warm - cool) * warmth[..., None]
        flicker = 1 + st["flicker"] * smooth_noise(t + si * 17.0, 0.7, 6.0)
        if st.get("glass"):  # unlit glass is dull as well as dark
            lum = rgb.mean(axis=2, keepdims=True)
            sat = np.clip(light * 1.15, 0.55, 1.0)[..., None]
            rgb = lum + (rgb - lum) * sat
        rgb *= (light[..., None] * tint) * flicker
        if st.get("rays"):
            shift = int(t * W * 0.01) % self.rays.shape[1]
            rays = np.roll(self.rays, shift, axis=1)[:, :W]
            rgb += rays[..., None] * np.array([255, 236, 190], np.float32) * st["rays"] * np.clip(light, 0, 1.3)[..., None]
        if st.get("bloom"):  # light glows through the brightest glass
            hi = np.clip(rgb - 165, 0, None)
            small = Image.fromarray(hi.clip(0, 255).astype(np.uint8)).resize((W // 4, H // 4), Image.BILINEAR)
            glow = small.filter(ImageFilter.GaussianBlur(6 * W / 1920)).resize((W, H), Image.BILINEAR)
            rgb += np.asarray(glow).astype(np.float32) * st["bloom"]
        self.dust.render(rgb, light, t + si * 31.0, st["dust"])
        if sc.get("weather") == "snow":
            self.snow.render(rgb, light, t + si * 13.0)

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

        # --- motion graphics: counts, diagrams, section markers
        for g in sc.get("_graphics", []):
            g.draw(img, t)

        # --- words on the glass, in time with the voice
        self._draw_texts(img, sc, t)

        # --- gold labels pointing out details ("look closer")
        for lb, plaque in sc.get("_labels", []):
            a = clamp((t - lb["at"]) / 0.4) * (1 - clamp((t - lb["at"] - lb.get("hold", 4.0)) / 0.4))
            if a <= 0:
                continue
            x, y = lb["x"] * W, lb["y"] * H
            right = lb["x"] < 0.62
            k = W / 1280
            lx = x + (30 * k if right else -30 * k - plaque.width)
            ly = max(self.stage.opening[1] + 40 * k, y - 70 * k - plaque.height)
            over = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            d = ImageDraw.Draw(over)
            gold = (232, 197, 106, 255)
            ex = lx if right else lx + plaque.width
            d.line([(x, y), (ex, ly + plaque.height / 2)], fill=gold, width=max(1, int(2 * k)))
            r = 5 * k
            d.ellipse([x - r, y - r, x + r, y + r], fill=gold)
            over.alpha_composite(plaque, (int(lx), int(ly)))
            if a < 1:
                over.putalpha(over.getchannel("A").point(lambda v: int(v * a)))
            img.alpha_composite(over)

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
        if o == "glass" and t < TRANSITION_LEN["glass"]:
            self.stage.glass_assemble(out, ease_in_out(t / TRANSITION_LEN["glass"]))
        if c == "shatter" and t > dur - TRANSITION_LEN["shatter"]:  # the window breaks and falls away
            out = self.stage.shatter_out(out, (t - (dur - TRANSITION_LEN["shatter"])) / TRANSITION_LEN["shatter"])
        if c == "glass" and t > dur - TRANSITION_LEN["glass"]:
            self.stage.glass_assemble(out, 1 - ease_in_out((t - (dur - TRANSITION_LEN["glass"])) / TRANSITION_LEN["glass"]))
        for ft, col, fd in sc.get("flashes", []):  # a burst of coloured light in the glass
            if ft <= t < ft + fd:
                k = (1 - (t - ft) / fd) ** 1.5
                c = np.array([int(col[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
                hole = getattr(self.stage, "hole", None)  # only the glass flashes, not the stonework
                if hole is not None:
                    out[hole] += (c - out[hole]) * k * 0.75
                else:
                    out += (c - out) * k * 0.75
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
            if "sfx" in sc:  # the director scored this scene's effects itself
                for t, kind, length, extra in sc["sfx"]:
                    events.append((kind, start + t, length, extra))
                start += dur
                continue
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
