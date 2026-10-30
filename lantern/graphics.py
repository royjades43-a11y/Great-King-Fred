"""Motion graphics in glass: counts you can see, teaching diagrams and section markers.

Each graphic is prepared once per scene and drawn every frame over the lit window, so it
glows like the glass around it. Specs come from the director (scene["graphics"]).
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from .anim import clamp, ease_in_out, ease_out
from .art.glass import WHITE, GlassCanvas

COLORS = {"gold": (238, 190, 74), "ruby": (196, 44, 50), "sky": (70, 120, 200), "white": (236, 230, 214)}


def _halo(img, color=(255, 200, 110), strength=0.55, spread=0.12):
    a = img.getchannel("A")
    r = max(2, int(min(img.size) * spread))
    halo = a.filter(ImageFilter.MaxFilter(max(3, (r // 3) | 1))).filter(ImageFilter.GaussianBlur(r * 0.6))
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste(color + (255,), (0, 0), halo.point(lambda v: int(v * strength)))
    out.alpha_composite(img)
    return out


def _fade(img, a):
    if a >= 0.999:
        return img
    out = img.copy()
    out.putalpha(img.getchannel("A").point(lambda v: int(v * a)))
    return out


class Tally:
    """n small glass tiles that light up in a sweep: a number you can see ("a thousand men")."""

    def __init__(self, spec, W, H):
        self.s = spec
        n = spec["n"]
        x0, y0, x1, y1 = [v * d for v, d in zip(spec.get("rect", [0.14, 0.13, 0.86, 0.43]), (W, H, W, H))]
        aspect = (x1 - x0) / (y1 - y0)
        cols = max(1, int(round(math.sqrt(n * aspect))))
        rows = math.ceil(n / cols)
        cw, ch = (x1 - x0) / cols, (y1 - y0) / rows
        size = max(3, int(min(cw, ch) * 0.86))
        self.box = (int(x0), int(y0), int(x1), int(y1))
        w, h = self.box[2] - self.box[0], self.box[3] - self.box[1]
        rng = np.random.default_rng(spec.get("seed", 1))
        lit = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(lit)
        order = np.full((h, w), np.inf, np.float32)
        base = np.array(COLORS.get(spec.get("color", "gold")), np.float32)
        for i in range(n):
            r, c = divmod(i, cols)
            cx, cy = (c + 0.5) * cw, (r + 0.5) * ch
            col = tuple(int(v) for v in np.clip(base * rng.uniform(0.95, 1.3) + 25, 0, 255))
            pts = [(cx, cy - size / 2), (cx + size / 2, cy), (cx, cy + size / 2), (cx - size / 2, cy)]  # a diamond
            d.polygon(pts, fill=col + (255,), outline=(30, 27, 26, 255))
            # sweep left to right with a little ripple, like a crowd being counted
            k = c / max(1, cols - 1) * 0.85 + r / max(1, rows) * 0.1 + rng.uniform(0, 0.05)
            x_a, y_a = int(cx - size / 2), int(cy - size / 2)
            order[max(0, y_a):y_a + size + 1, max(0, x_a):x_a + size + 1] = np.minimum(
                order[max(0, y_a):y_a + size + 1, max(0, x_a):x_a + size + 1], k)
        # a dark glass plaque behind the tiles so a thousand small lights read at a glance
        plaque = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        pd = ImageDraw.Draw(plaque)
        pd.rounded_rectangle([0, 0, w - 1, h - 1], radius=int(min(w, h) * 0.06), fill=(18, 14, 14, 215),
                             outline=(206, 164, 72, 255), width=max(2, int(H * 0.004)))
        self.plaque = plaque
        self.lit = _halo(lit, strength=0.6, spread=0.02)
        self.order = order
        self.alpha = np.asarray(self.lit.getchannel("A")).astype(np.float32)

    def draw(self, img, t):
        s = self.s
        p = (t - s["start"]) / s.get("dur", 1.8)
        if p <= 0:
            return
        out_k = clamp((t - s["until"]) / 0.5)
        if out_k >= 1:
            return
        shown = self.order <= ease_in_out(p)
        a = (self.alpha * shown * (1 - out_k)).clip(0, 255).astype(np.uint8)
        img.alpha_composite(_fade(self.plaque, clamp(p * 4) * (1 - out_k)), self.box[:2])
        layer = self.lit.copy()
        layer.putalpha(Image.fromarray(a))
        img.alpha_composite(layer, self.box[:2])


class Timeline:
    """A lead bar across the window with nodes that light gold one after another."""

    def __init__(self, spec, W, H):
        self.s = spec
        x0, y, x1 = spec.get("line", [0.18, 0.2, 0.82])
        self.W, self.H = W, H
        self.p0, self.p1, self.y = x0 * W, x1 * W, y * H
        n = len(spec["times"])
        r = int(H * 0.028)
        self.nodes = []
        for i in range(n):
            g = GlassCanvas(r * 4, r * 4, seed=i)
            g.circle(0.5, 0.5, 0.42, (60, 50, 40))
            img_off, _ = g.finish(lead=0.08, crop=False)
            g2 = GlassCanvas(r * 4, r * 4, seed=i)
            g2.circle(0.5, 0.5, 0.42, (255, 214, 110))
            img_on, _ = g2.finish(lead=0.08, crop=False)
            self.nodes.append((img_off, _halo(img_on, strength=0.9, spread=0.35)))
        self.r = r

    def draw(self, img, t):
        s = self.s
        a = clamp((t - s["start"]) / 0.5) * (1 - clamp((t - s["until"]) / 0.5))
        if a <= 0:
            return
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        d = ImageDraw.Draw(layer)
        grow = ease_out((t - s["start"]) / 0.8)
        d.line([(self.p0, self.y), (self.p0 + (self.p1 - self.p0) * grow, self.y)], fill=(30, 27, 26, 255),
               width=max(4, int(self.H * 0.012)))
        d.line([(self.p0, self.y), (self.p0 + (self.p1 - self.p0) * grow, self.y)], fill=(170, 150, 110, 255),
               width=max(2, int(self.H * 0.004)))
        n = len(self.nodes)
        for i, ((off, on), tn) in enumerate(zip(self.nodes, s["times"])):
            x = self.p0 + (self.p1 - self.p0) * (i / max(1, n - 1))
            if x > self.p0 + (self.p1 - self.p0) * grow + 1:
                continue
            k = clamp((t - tn) / 0.3)
            pos = (int(x - off.width / 2), int(self.y - off.height / 2))
            layer.alpha_composite(off, pos)
            if k > 0:
                pop = 1 + 0.35 * (1 - k)
                im = on.resize((int(on.width * pop), int(on.height * pop)), Image.BILINEAR) if pop > 1.01 else on
                layer.alpha_composite(_fade(im, k), (int(x - im.width / 2), int(self.y - im.height / 2)))
        img.alpha_composite(_fade(layer, a))


def _icon(kind, size, lit):
    """Small round glass medallions for the three steps of reading a window."""
    g = GlassCanvas(size, size, seed={"eye": 1, "light": 2, "thread": 3}[kind])
    g.circle(0.5, 0.5, 0.48, (40, 34, 30))
    g.circle(0.5, 0.5, 0.42, (40, 60, 140) if lit else (34, 38, 60), tiles=5)
    ink = (255, 226, 140) if lit else (110, 100, 80)
    if kind == "eye":
        g.ellipse(0.5, 0.5, 0.28, 0.14, WHITE if lit else (120, 116, 106))
        g.circle(0.5, 0.5, 0.09, ink)
    elif kind == "light":
        g.circle(0.5, 0.5, 0.13, ink)
        for i in range(8):
            a = i / 8 * 2 * math.pi
            g.poly([(0.5 + math.cos(a - 0.15) * 0.17, 0.5 + math.sin(a - 0.15) * 0.17),
                    (0.5 + math.cos(a) * 0.33, 0.5 + math.sin(a) * 0.33),
                    (0.5 + math.cos(a + 0.15) * 0.17, 0.5 + math.sin(a + 0.15) * 0.17)], ink)
    else:
        g.band([(0.2, 0.7), (0.4, 0.45), (0.6, 0.55), (0.8, 0.3)], 0.06, ink)
        g.circle(0.8, 0.3, 0.07, ink)
    img, _ = g.finish(lead=0.05, crop=False)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    img.putalpha(mask)
    return _halo(img, strength=0.8, spread=0.25) if lit else img


class Progress:
    """Three medallions in the corner during the teaching half: Look closer, The light, The thread.
    Finished sections stay lit; the current one lights as the scene begins."""

    KINDS = ["eye", "light", "thread"]

    def __init__(self, spec, W, H):
        self.s = spec
        size = int(H * 0.085)
        self.size = size
        self.icons = [(_icon(k, size, False), _icon(k, size, True)) for k in self.KINDS[:spec.get("count", 3)]]
        self.x0 = W * 0.86 - (len(self.icons) - 1) * size * 1.15 / 2   # bottom right, clear of the arch
        self.y = H * 0.84

    def draw(self, img, t):
        s = self.s
        a = clamp((t - s.get("start", 0.4)) / 0.6) * (1 - clamp((t - s["until"]) / 0.5))
        if a <= 0:
            return
        layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
        for i, (off, on) in enumerate(self.icons):
            x = self.x0 + i * self.size * 1.15
            n = i + 1
            if n < s["active"]:
                k = 1.0
            elif n == s["active"]:
                k = clamp((t - s.get("start", 0.4) - 0.6) / 0.6)
            else:
                k = 0.0
            pos = (int(x - off.width / 2), int(self.y - off.height / 2))
            layer.alpha_composite(off, pos)
            if k > 0:
                pop = 1 + 0.3 * (1 - k) if n == s["active"] else 1.0
                im = on.resize((int(on.width * pop), int(on.height * pop)), Image.BILINEAR) if pop > 1.01 else on
                layer.alpha_composite(_fade(im, k), (int(x - im.width / 2), int(self.y - im.height / 2)))
        img.alpha_composite(_fade(layer, a))


KINDS = {"tally": Tally, "timeline": Timeline, "progress": Progress}


def prepare(spec, W, H):
    return KINDS[spec["kind"]](spec, W, H)

