"""Stained glass: shapes cut into shards, joined by lead came.

A GlassCanvas works in unit coordinates (fractions of its height) like Canvas, but every
filled shape becomes a *piece*: it can be cut into shards by a few random straight cuts,
each shard gets its own slightly different glass colour and streaky texture, and every
boundary between pieces (and the outer edge) becomes a dark lead line when finished.
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from .base import prop, scene_set

LEAD = (30, 27, 26)

# glass palette - deep, saturated, slightly uneven like real cathedral glass
SKY = (52, 96, 170)
SKY_PALE = (110, 150, 200)
GOLD = (222, 168, 54)
AMBER = (196, 120, 40)
RUBY = (168, 34, 40)
EMERALD = (46, 128, 74)
OLIVE = (110, 128, 52)
OCHRE = (190, 150, 84)
SAND = (214, 188, 128)
SKIN = (226, 170, 120)
HAIR = (78, 46, 30)
BRONZE = (176, 120, 52)
IRON = (120, 124, 134)
WOOD = (120, 74, 38)
WHITE = (236, 230, 214)
VIOLET = (98, 62, 140)
WATER = (60, 120, 180)
STONE = (128, 130, 140)


class GlassCanvas:
    def __init__(self, w, h, seed=0):
        self.w, self.h = int(w), int(h)
        self.s = self.h
        self.label = np.zeros((self.h, self.w), np.int32)
        self.rgb = np.zeros((self.h, self.w, 3), np.float32)
        self.next = 1
        self.rng = np.random.default_rng(seed)
        yy, xx = np.mgrid[0:self.h, 0:self.w]
        self.xx, self.yy = xx.astype(np.float32), yy.astype(np.float32)
        r = np.random.default_rng(seed + 991)
        small = r.normal(0, 1, (max(2, self.h // 40), max(2, self.w // 40)))
        n = Image.fromarray(((small + 3) * 42).clip(0, 255).astype(np.uint8)).resize((self.w, self.h), Image.BICUBIC)
        self.tex = np.asarray(n).astype(np.float32) / 255 - 0.5  # shared low-frequency glass mottling

    def P(self, x, y):
        return (x * self.s, y * self.s)

    def _mask(self, draw_fn):
        m = Image.new("L", (self.w, self.h), 0)
        draw_fn(ImageDraw.Draw(m))
        return np.asarray(m) > 127

    def _tiles(self, mask, n, x0, x1, y0, y1):
        """Voronoi shards: n irregular cells over the piece, computed at half resolution."""
        q = 2
        sx = self.rng.uniform(x0, x1 + 1, n)
        sy = self.rng.uniform(y0, y1 + 1, n)
        gy, gx = np.mgrid[0:self.h:q, 0:self.w:q].astype(np.float32)
        best = np.full(gx.shape, np.inf, np.float32)
        code = np.zeros(gx.shape, np.int32)
        for i in range(n):
            d = (gx - sx[i]) ** 2 + (gy - sy[i]) ** 2
            closer = d < best
            best[closer] = d[closer]
            code[closer] = i
        code = code.repeat(q, 0).repeat(q, 1)[:self.h, :self.w]
        return code, int(np.ceil(np.log2(max(2, n))))

    def _fill(self, mask, color, cuts, jitter, streak, tiles=0):
        if not mask.any():
            return
        ys, xs = np.nonzero(mask)
        x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
        if tiles:
            code, bits = self._tiles(mask, tiles, x0, x1, y0, y1)
            cuts = bits  # label space needed
        else:
            code = np.zeros(mask.shape, np.int32)
        for i in range(0 if tiles else cuts):  # random straight cuts across the piece
            px, py = self.rng.uniform(x0, x1 + 1), self.rng.uniform(y0, y1 + 1)
            a = self.rng.uniform(0, math.pi)
            side = ((self.xx - px) * math.sin(a) - (self.yy - py) * math.cos(a)) > 0
            code |= side.astype(np.int32) << i
        base = self.next
        self.label[mask] = base + code[mask]
        self.next += 2 ** cuts
        col = np.array(color, np.float32)
        for c in np.unique(code[mask]):
            sel = mask & (code == c)
            k = 1 + self.rng.uniform(-jitter, jitter)
            hue_shift = self.rng.uniform(-jitter, jitter) * np.array([18, 8, -14], np.float32)
            self.rgb[sel] = np.clip(col * k + hue_shift, 0, 255)
        # mottling and faint streaks, as in hand-blown glass
        ang = self.rng.uniform(0, math.pi)
        st = np.sin((self.xx * math.cos(ang) + self.yy * math.sin(ang)) / (self.h * 0.012)) * streak
        self.rgb[mask] *= (1 + self.tex[mask] * 0.35 + st[mask] * 0.04)[:, None]

    # ------------------------------------------------------------------ shapes
    def poly(self, pts, color, cuts=0, jitter=0.08, streak=1.0, tiles=0):
        pp = [self.P(x, y) for x, y in pts]
        self._fill(self._mask(lambda d: d.polygon(pp, fill=255)), color, cuts, jitter, streak, tiles)

    def ellipse(self, cx, cy, rx, ry, color, cuts=0, jitter=0.08, tiles=0):
        box = [(cx - rx) * self.s, (cy - ry) * self.s, (cx + rx) * self.s, (cy + ry) * self.s]
        self._fill(self._mask(lambda d: d.ellipse(box, fill=255)), color, cuts, jitter, 1.0, tiles)

    def circle(self, cx, cy, r, color, cuts=0, jitter=0.08, tiles=0):
        self.ellipse(cx, cy, r, r, color, cuts, jitter, tiles)

    def band(self, pts, width, color, cuts=0):
        """A thick polyline as one piece: spears, staffs, sling cords."""
        pp = [self.P(x, y) for x, y in pts]
        w = max(2, int(width * self.s))
        self._fill(self._mask(lambda d: d.line(pp, fill=255, width=w, joint="curve")), color, cuts, 0.05, 0.5)

    def wave_band(self, y_top, y_bot, amp, freq, color, cuts=0, phase=0.0, x0=0.0, x1=None, tiles=0):
        x1 = self.w / self.s if x1 is None else x1
        n = 80
        top = [(x0 + (x1 - x0) * i / n, y_top + amp * math.sin(i / n * freq * 6.28 + phase)) for i in range(n + 1)]
        bot = [(x0 + (x1 - x0) * i / n, y_bot + amp * math.sin(i / n * freq * 6.28 + phase + 1.3))
               for i in range(n, -1, -1)]
        self.poly(top + bot, color, cuts, tiles=tiles)

    def mask_piece(self, mask, color, jitter=0.08, tiles=0, cuts=0):
        """Fill an arbitrary boolean mask (e.g. rendered lettering) as glass."""
        self._fill(np.asarray(mask, bool), color, cuts, jitter, 1.0, tiles)

    # ------------------------------------------------------------------ finish
    def finish(self, lead=0.006, meta=None, crop=True):
        lab = self.label
        edge = np.zeros(lab.shape, bool)
        edge[:, 1:] |= lab[:, 1:] != lab[:, :-1]
        edge[1:, :] |= lab[1:, :] != lab[:-1, :]
        px = max(3, int(lead * self.s)) | 1
        leads = np.asarray(Image.fromarray(edge.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(px))) > 0
        solid = np.asarray(Image.fromarray((lab > 0).astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(px))) > 0
        rgb = self.rgb.copy()
        rgb[leads] = LEAD
        alpha = (solid * 255).astype(np.uint8)
        img = Image.fromarray(np.dstack([rgb.clip(0, 255).astype(np.uint8), alpha]), "RGBA")
        out = {}
        box = (0, 0, self.w, self.h)
        if crop:
            box = img.getchannel("A").getbbox() or box
            img = img.crop(box)
        bx0, by0, bx1, by1 = box
        for k, (ux, uy) in (meta or {}).items():
            out[k] = ((ux * self.s - bx0) / max(1, bx1 - bx0), (uy * self.s - by0) / max(1, by1 - by0))
        return img, out


# ============================================================================ figures
def _figure(g, cx, robe, robe2=None, skin=SKIN, hair=HAIR, scale=1.0, short=False, beard=False):
    """A standing figure in glass, feet at y=1.0, ~1.0 tall. Returns key points."""
    s = scale

    def P(x, y):
        return (cx + x * s, 1.0 - s + y * s)

    # legs (when the tunic is short) then robe
    if short:
        g.poly([P(-0.075, 0.7), P(-0.01, 0.7), P(-0.02, 0.97), P(-0.085, 0.97)], skin)
        g.poly([P(0.01, 0.7), P(0.075, 0.7), P(0.085, 0.97), P(0.02, 0.97)], skin)
        g.poly([P(-0.11, 0.95), P(-0.015, 0.95), P(-0.015, 1.0), P(-0.12, 1.0)], WOOD)
        g.poly([P(0.015, 0.95), P(0.11, 0.95), P(0.12, 1.0), P(0.015, 1.0)], WOOD)
        hem = 0.74
    else:
        hem = 1.0
    g.poly([P(-0.12, 0.22), P(0.12, 0.22), P(0.17, hem), P(-0.17, hem)], robe, cuts=3)
    if robe2:  # a sash / mantle across the body
        g.poly([P(-0.12, 0.24), P(-0.02, 0.22), P(0.14, 0.55), P(0.06, 0.6)], robe2, cuts=1)
    g.poly([P(-0.11, 0.48), P(0.11, 0.48), P(0.11, 0.52), P(-0.11, 0.52)], WOOD)  # belt
    g.poly([P(-0.03, 0.16), P(0.03, 0.16), P(0.035, 0.23), P(-0.035, 0.23)], skin)
    hx, hy = P(0, 0.11)
    if beard:
        g.poly([P(-0.06, 0.12), P(0.06, 0.12), P(0.04, 0.22), P(0.0, 0.25), P(-0.04, 0.22)], hair)
    g.circle(hx, hy, 0.062 * s, skin)
    return {"head": (hx, hy), "P": P}


@prop("glass_david")
def glass_david(h, rng, pose="sling"):
    g = GlassCanvas(h * 0.75, h, seed=int(rng.integers(1e6)))
    f = _figure(g, 0.33, robe=(176, 64, 40), robe2=None, short=True)
    P = f["P"]
    g.circle(*P(0.0, 0.085), 0.07, HAIR, cuts=2)               # curly hair
    for dx in (-0.05, 0.0, 0.05):
        g.circle(*P(dx, 0.05), 0.03, HAIR)
    g.circle(*P(0, 0.12), 0.05, SKIN)                           # face over hair
    g.poly([P(-0.11, 0.23), P(-0.14, 0.25), P(-0.16, 0.5), P(-0.12, 0.5)], SKIN)  # left arm down
    if pose == "sling":
        g.poly([P(0.1, 0.23), P(0.14, 0.22), P(0.26, 0.02), P(0.22, 0.0)], SKIN)  # right arm raised
        g.band([P(0.24, 0.0), P(0.36, -0.12), P(0.42, -0.04)], 0.008, (210, 190, 150))  # sling cords
        g.circle(*P(0.42, -0.04), 0.022, WOOD)                # pouch
        hand = P(0.42, -0.04)
    else:  # carrying a staff
        g.poly([P(0.1, 0.23), P(0.14, 0.24), P(0.18, 0.45), P(0.14, 0.46)], SKIN)
        g.band([P(0.17, 0.98), P(0.2, 0.05)], 0.016, WOOD)
        g.band([P(0.2, 0.05), P(0.24, -0.01), P(0.27, 0.04)], 0.016, WOOD)
        hand = P(0.17, 0.45)
    face = P(0, 0.12)
    return g.finish(meta={"center": P(0, 0.45), "head": f["head"], "hand": hand, "face": face,
                          "face_r": (face[0] + 0.05, face[1])})


@prop("glass_goliath")
def glass_goliath(h, rng):
    """The champion of Gath: bronze helmet, coat of scale armour, a spear like a weaver's beam."""
    g = GlassCanvas(h * 0.72, h, seed=int(rng.integers(1e6)))
    cx = 0.38
    f = _figure(g, cx, robe=(120, 70, 40), short=True, beard=True)
    P = f["P"]
    for side in (-1, 1):  # bronze greaves
        g.poly([P(side * 0.02, 0.76), P(side * 0.08, 0.76), P(side * 0.085, 0.95), P(side * 0.02, 0.95)], BRONZE)
    g.poly([P(-0.14, 0.2), P(0.14, 0.2), P(0.13, 0.6), P(-0.13, 0.6)], GOLD, cuts=6)  # scale armour
    g.poly([P(-0.13, 0.58), P(0.13, 0.58), P(0.16, 0.74), P(-0.16, 0.74)], (140, 60, 36), cuts=3)  # kilt
    g.poly([P(-0.12, 0.21), P(-0.18, 0.24), P(-0.2, 0.52), P(-0.14, 0.52)], SKIN)
    g.poly([P(0.12, 0.21), P(0.18, 0.24), P(0.22, 0.42), P(0.17, 0.44)], SKIN)
    g.poly([P(-0.07, 0.1), P(-0.06, 0.02), P(0.0, -0.01), P(0.06, 0.02), P(0.07, 0.1)], BRONZE)  # helmet
    g.poly([P(-0.01, -0.01), P(0.01, -0.01), P(0.03, -0.09), P(-0.03, -0.09)], RUBY)  # crest
    g.band([P(0.21, 0.98), P(0.24, -0.06)], 0.026, WOOD)                               # spear shaft
    g.poly([P(0.235, -0.06), P(0.26, -0.06), P(0.25, -0.16)], IRON)
    g.circle(*P(-0.2, 0.45), 0.13, BRONZE, cuts=3)                                     # shield
    g.circle(*P(-0.2, 0.45), 0.035, GOLD)
    hx, hy = f["head"]
    return g.finish(meta={"center": P(0, 0.4), "head": f["head"], "forehead": P(0, 0.07), "face": (hx, hy + 0.012),
                          "face_r": (hx + 0.05, hy + 0.012)})


@prop("glass_army")
def glass_army(h, rng, side="israel", count=6):
    """A rank of soldiers behind their shields. Philistines wear feathered headdresses."""
    width = 0.24 * count + 0.3
    g = GlassCanvas(h * width, h, seed=int(rng.integers(1e6)))
    tunic = {"israel": (64, 90, 150), "philistine": (150, 52, 40)}[side]
    shield = {"israel": (90, 70, 40), "philistine": BRONZE}[side]
    for i in range(count):
        cx = 0.2 + i * 0.24
        sc = rng.uniform(0.92, 1.0)
        _figure(g, cx, robe=tunic, short=True, scale=sc)

        def P(x, y, cx=cx, sc=sc):
            return (cx + x * sc, 1.0 - sc + y * sc)
        if side == "philistine":
            for k in range(5):  # feathered crown
                a = -0.5 + k * 0.25
                g.poly([P(-0.01 + a * 0.08, 0.07), P(0.01 + a * 0.08, 0.07), P(a * 0.2, -0.06)], WHITE)
        else:
            g.poly([P(-0.065, 0.1), P(0.0, 0.03), P(0.065, 0.1)], IRON)
        g.band([P(0.16, 0.95), P(0.18, -0.08)], 0.012, WOOD)
        g.poly([P(0.17, -0.08), P(0.19, -0.08), P(0.18, -0.14)], IRON)
        g.ellipse(*P(-0.02, 0.48), 0.11 * sc, 0.16 * sc, shield, cuts=1)
    return g.finish(meta={"center": (width / 2, 0.5)})


@prop("glass_stones")
def glass_stones(h, rng):
    g = GlassCanvas(h * 2.2, h, seed=int(rng.integers(1e6)))
    for i in range(5):
        x = 0.25 + i * 0.42
        g.ellipse(x, 0.6 + rng.uniform(-0.05, 0.05), 0.18, 0.13, (150 + i * 8, 150 + i * 5, 168), jitter=0.12)
    return g.finish(lead=0.04, meta={"center": (1.1, 0.6)})


@prop("glass_stone")
def glass_stone(h, rng):
    g = GlassCanvas(h * 1.3, h, seed=int(rng.integers(1e6)))
    g.ellipse(0.65, 0.5, 0.45, 0.35, (170, 170, 186))
    return g.finish(lead=0.12, meta={"center": (0.65, 0.5)})


@prop("glass_sheep")
def glass_sheep(h, rng):
    g = GlassCanvas(h * 1.5, h, seed=int(rng.integers(1e6)))
    for x in (0.4, 1.05):
        g.band([(x, 0.7), (x, 1.0)], 0.07, HAIR)
    g.ellipse(0.72, 0.52, 0.55, 0.3, WHITE, cuts=3)
    g.ellipse(1.28, 0.42, 0.14, 0.12, (60, 50, 46))
    return g.finish(lead=0.04, meta={"center": (0.75, 0.5)})


@prop("verse")
def verse(h, rng, text="", ref="", width=1.6):
    """Scripture written on parchment in a bookhand, with a gold illuminated initial.
    meta['lines'] lists each line's box so the renderer can write it out word by word."""
    from ..stage import load_font
    W_, H_ = int(h * width), int(h)
    img = Image.new("RGBA", (W_, H_), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    size = int(H_ * 0.1)
    f = load_font("italic", size)
    fr = load_font("bold", int(size * 0.8))
    words, lines, cur = text.split(), [], ""
    initial_w = int(size * 2.1)
    for w in words:
        test = (cur + " " + w).strip()
        limit = W_ * 0.86 - (initial_w if len(lines) < 2 else 0)
        if d.textlength(test, font=f) > limit and cur:
            lines.append(cur)
            cur = w
        else:
            cur = test
    lines.append(cur)
    # illuminated initial
    first, lines[0] = lines[0][0], lines[0][1:]
    bx, by = int(W_ * 0.07), int(H_ * 0.08)
    d.rectangle([bx, by, bx + initial_w - 12, by + int(size * 2.2)], fill=(150, 30, 36, 255))
    d.rectangle([bx + 5, by + 5, bx + initial_w - 17, by + int(size * 2.2) - 5], outline=(222, 168, 54, 255), width=3)
    fi = load_font("bold", int(size * 1.9))
    tw = d.textlength(first, font=fi)
    d.text((bx + (initial_w - 12 - tw) / 2, by + size * 0.05), first, font=fi, fill=(240, 200, 90, 255))
    boxes, y = [], by
    for i, line in enumerate(lines):
        x = bx + (initial_w if i < 2 else 0)
        d.text((x, y), line, font=f, fill=(48, 30, 24, 255))
        lw = d.textlength(line, font=f)
        boxes.append([x / W_, y / H_, (x + lw) / W_, (y + size * 1.3) / H_])
        y += int(size * 1.32)
    d.text((W_ * 0.93 - d.textlength(ref, font=fr), y + size * 0.4), ref, font=fr, fill=(150, 30, 36, 255))
    boxes.append([(W_ * 0.93 - d.textlength(ref, font=fr)) / W_, (y + size * 0.4) / H_, 0.93, (y + size * 1.6) / H_])
    # the illuminated initial is shown from the start: mark it in meta
    return img, {"center": (0.5, 0.45), "lines": boxes, "initial": [bx / W_, by / H_, (bx + initial_w) / W_,
                                                                      (by + size * 2.2) / H_]}


# ============================================================================ sets
def _sky(g, w, horizon, sun=True):
    g.poly([(0, 0), (w, 0), (w, horizon), (0, horizon)], SKY, jitter=0.12, tiles=46)
    if sun:
        g.circle(w * 0.5, 0.2, 0.08, GOLD, cuts=2)
        for k in range(12):
            a = k / 12 * 6.283
            r0, r1 = 0.1, 0.17
            pts = [(w * 0.5 + math.cos(a - 0.08) * r0, 0.2 + math.sin(a - 0.08) * r0),
                   (w * 0.5 + math.cos(a) * r1, 0.2 + math.sin(a) * r1),
                   (w * 0.5 + math.cos(a + 0.08) * r0, 0.2 + math.sin(a + 0.08) * r0)]
            g.poly(pts, (240, 200, 90))
    for cx, cy in ((w * 0.18, 0.14), (w * 0.8, 0.22)):
        g.ellipse(cx, cy, 0.16, 0.045, WHITE, cuts=2)


@scene_set("glass_valley")
def glass_valley(W, H, rng):
    """The Valley of Elah: two hills facing each other across a dry valley floor."""
    g = GlassCanvas(W, H, seed=int(rng.integers(1e6)))
    w = W / H
    _sky(g, w, 0.62)
    g.poly([(0, 0.62), (w * 0.15, 0.5), (w * 0.38, 0.62)], (90, 110, 140), cuts=1)   # far ridges
    g.poly([(w * 0.6, 0.62), (w * 0.82, 0.48), (w, 0.6)], (90, 110, 140), cuts=1)
    g.poly([(0, 0.62), (w, 0.62), (w, 1.0), (0, 1.0)], OCHRE, tiles=10)
    g.poly([(0, 0.56), (w * 0.12, 0.5), (w * 0.3, 0.57), (w * 0.4, 0.76), (0, 0.8)], OLIVE, tiles=7)
    g.poly([(w * 0.6, 0.76), (w * 0.7, 0.57), (w * 0.88, 0.5), (w, 0.54), (w, 0.8)], OLIVE, tiles=7)
    g.poly([(0, 0.8), (w * 0.4, 0.76), (w * 0.5, 0.8), (w * 0.6, 0.76), (w, 0.8), (w, 1.0), (0, 1.0)],
           OCHRE, tiles=14)
    g.wave_band(0.84, 0.88, 0.006, 3, SAND, x0=w * 0.3, x1=w * 0.7)   # the dry stream bed
    for x, y in ((0.06, 0.66), (0.92, 0.65)):
        g.ellipse(w * x, y, 0.035, 0.05, EMERALD, cuts=1)           # olive trees
        g.band([(w * x, y + 0.04), (w * x, y + 0.1)], 0.01, WOOD)
    img, _ = g.finish(lead=0.0045, crop=False)
    return {"layers": [{"key": "window", "image": img, "depth": 0.6, "paper": False, "grade": 0}],
            "ambient": 0.6, "weather": None}


@scene_set("glass_brook")
def glass_brook(W, H, rng):
    g = GlassCanvas(W, H, seed=int(rng.integers(1e6)))
    w = W / H
    _sky(g, w, 0.5, sun=False)
    g.poly([(0, 0.5), (w * 0.25, 0.4), (w * 0.55, 0.5), (w * 0.8, 0.42), (w, 0.48), (w, 0.62), (0, 0.62)],
           OLIVE, tiles=8)
    g.poly([(0, 0.6), (w, 0.6), (w, 1.0), (0, 1.0)], OCHRE, tiles=14)
    for i, (y0, y1) in enumerate(((0.7, 0.76), (0.76, 0.82), (0.82, 0.88))):
        g.wave_band(y0, y1, 0.012, 4, (WATER[0] + i * 12, WATER[1] + i * 10, WATER[2]), phase=i, tiles=6)
    for x in np.linspace(0.05, w - 0.05, 9):
        g.poly([(x, 0.7), (x + 0.012, 0.56), (x + 0.03, 0.7)], EMERALD)          # reeds
    img, _ = g.finish(lead=0.0045, crop=False)
    return {"layers": [{"key": "window", "image": img, "depth": 0.6, "paper": False, "grade": 0}],
            "ambient": 0.6, "weather": None}


@scene_set("scroll")
def scroll_set(W, H, rng):
    """A parchment scroll held open, for scripture."""
    img = Image.new("RGBA", (W, H), (34, 26, 24, 255))
    arr = np.asarray(img).astype(np.float32)
    small = rng.normal(0, 1, (H // 30, W // 30))
    n = np.asarray(Image.fromarray(((small + 3) * 42).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC))
    n = n.astype(np.float32) / 255 - 0.5
    x0, x1, y0, y1 = int(W * 0.12), int(W * 0.88), int(H * 0.16), int(H * 0.84)
    paper = np.array([226, 206, 160], np.float32)
    arr[y0:y1, x0:x1, :3] = paper * (1 + n[y0:y1, x0:x1, None] * 0.25)
    yy = np.arange(y0, y1)[:, None]
    shade = 1 - 0.18 * (np.abs((yy - (y0 + y1) / 2) / ((y1 - y0) / 2)) ** 4)
    arr[y0:y1, x0:x1, :3] *= shade[..., None]
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGBA")
    d = ImageDraw.Draw(img)
    for x in (x0, x1):  # wooden rollers
        d.rounded_rectangle([x - W * 0.025, y0 - H * 0.07, x + W * 0.025, y1 + H * 0.07], radius=int(W * 0.02),
                            fill=(110, 64, 34, 255))
        for y in (y0 - H * 0.09, y1 + H * 0.05):
            d.ellipse([x - W * 0.018, y, x + W * 0.018, y + H * 0.04], fill=(206, 158, 60, 255))
    return {"layers": [{"key": "scroll", "image": img, "depth": 0.6, "paper": False, "grade": 0}],
            "ambient": 0.5, "weather": None}


WORD_PALETTES = {"gold": (236, 186, 70), "ruby": (196, 44, 50), "sky": (70, 120, 200), "white": (240, 232, 210)}


def glass_word(text, height, palette="gold", seed=0):
    """A word made of leaded glass: the letters are cut into shards, outlined in lead, and given a warm
    glow so they read over any scene."""
    from ..stage import load_font
    f = load_font("bold", int(height * 1.32))
    pad = int(height * 0.35)
    l, t_, r, b = f.getbbox(text)
    w, h = r - l + pad * 2, b - t_ + pad * 2
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).text((pad - l, pad - t_), text, font=f, fill=255)
    mask = np.asarray(m) > 127
    g = GlassCanvas(w, h, seed=seed)
    g.mask_piece(mask, WORD_PALETTES.get(palette, palette), jitter=0.14, tiles=max(3, len(text) * 2))
    img, _ = g.finish(lead=max(0.02, 3.0 / h), crop=False)
    # dark outer lead line, then a soft warm halo behind, so the word holds up on bright glass too
    a = img.getchannel("A")
    outline = a.filter(ImageFilter.MaxFilter(max(3, int(height * 0.07)) | 1))
    halo = a.filter(ImageFilter.MaxFilter(max(3, int(height * 0.12)) | 1)).filter(
        ImageFilter.GaussianBlur(height * 0.18))
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.paste((255, 200, 110, 255), (0, 0), halo.point(lambda v: int(v * 0.55)))
    out.paste((30, 27, 26, 255), (0, 0), outline)
    out.alpha_composite(img)
    return out
