"""The fixed stage furniture: proscenium arch, curtains, title tickets, dust and film grain."""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from .fx import hex_rgb

FONT_CANDIDATES = {
    "bold": [
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
        "C:/Windows/Fonts/georgiab.ttf",
    ],
    "italic": [
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf",
        "/Library/Fonts/Georgia Italic.ttf",
        "C:/Windows/Fonts/georgiai.ttf",
    ],
}


def load_font(kind, size, override=None):
    for path in ([override] if override else []) + FONT_CANDIDATES[kind]:
        if path and os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default(size)


class Stage:
    def __init__(self, width, height, style):
        self.W, self.H = width, height
        self.style = style
        k = width / 1280.0
        self.k = k
        side, top, bottom = int(58 * k), int(36 * k), int(74 * k)
        self.opening = (side, top, width - side, height - bottom)
        self.frame = self._proscenium()
        self.curtain_l, self.curtain_r = self._curtains()
        self.vignette = self._vignette()
        # soft, clumpy grain (generated at half size) reads like film and compresses far better
        rng = np.random.default_rng(7)
        self.grain = []
        for _ in range(6):
            g = rng.normal(0, 1, (height // 2, width // 2))
            g = Image.fromarray(((g + 4) * 32).clip(0, 255).astype(np.uint8)).resize((width, height), Image.BILINEAR)
            self.grain.append((np.asarray(g).astype(np.float32) / 32 - 4))

    # ------------------------------------------------------------------ proscenium
    def _opening_mask(self, size, box, radius):
        m = Image.new("L", size, 0)
        ImageDraw.Draw(m).rounded_rectangle(box, radius=radius, fill=255,
                                            corners=(True, True, False, False))
        return m

    def _proscenium(self):
        W, H, k = self.W, self.H, self.k
        x0, y0, x1, y1 = self.opening
        rng = np.random.default_rng(3)

        # wood with vertical grain
        wood = np.array(hex_rgb(self.style.get("wood", "#3b2316")), np.float32)
        grain = rng.normal(0, 1, (1, W)).repeat(H, 0)
        grain = np.asarray(Image.fromarray(((grain + 3) * 40).clip(0, 255).astype(np.uint8))
                           .filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 120 - 1
        rows = rng.normal(0, 0.25, (H, 1))
        shade = 1 + 0.18 * grain + 0.05 * rows
        rgb = (wood[None, None, :] * shade[..., None]).clip(0, 255).astype(np.uint8)
        frame = Image.fromarray(rgb, "RGB").convert("RGBA")

        radius = int(90 * k)
        hole = self._opening_mask((W, H), self.opening, radius)
        # bevel: darken wood toward the opening
        bevel = hole.filter(ImageFilter.MaxFilter(int(9 * k) | 1)).filter(ImageFilter.GaussianBlur(14 * k))
        dark = Image.new("RGBA", (W, H), (8, 4, 2, 255))
        frame = Image.composite(dark, frame, bevel.point(lambda v: int(v * 0.75)))

        # stage lip (darker plank) under the opening, with footlights
        d = ImageDraw.Draw(frame)
        lip_top = y1 + int(6 * k)
        d.rectangle([0, lip_top, W, H], fill=(28, 16, 10, 255))
        d.line([0, lip_top, W, lip_top], fill=(120, 84, 40, 255), width=max(1, int(2 * k)))

        # cut the opening and add gold trim around it
        alpha = Image.eval(hole, lambda v: 255 - v)
        frame.putalpha(alpha)
        trim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        td = ImageDraw.Draw(trim)
        gold = hex_rgb(self.style.get("gold", "#c9a25a"))
        g = int(7 * k)
        td.rounded_rectangle([x0 - g, y0 - g, x1 + g, y1 + g], radius=radius + g,
                             outline=gold + (255,), width=max(2, int(4 * k)),
                             corners=(True, True, False, False))
        td.rounded_rectangle([x0 - g * 2.2, y0 - g * 2.2, x1 + g * 2.2, y1 + g * 2.2],
                             radius=radius + g * 2, outline=(90, 64, 30, 255), width=max(1, int(1.5 * k)),
                             corners=(True, True, False, False))
        frame.alpha_composite(trim)

        # valance: scalloped drape hanging inside the top of the opening
        frame.alpha_composite(self._valance(hole))

        # footlights
        lights = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ld = ImageDraw.Draw(lights)
        n = 9
        ly = lip_top + int(16 * k)
        for i in range(n):
            lx = x0 + (x1 - x0) * (i + 0.5) / n
            r = 18 * k
            ld.ellipse([lx - r, ly - r * 0.6, lx + r, ly + r * 0.6], fill=(255, 190, 110, 90))
        lights = lights.filter(ImageFilter.GaussianBlur(9 * k))
        ld = ImageDraw.Draw(lights)
        for i in range(n):
            lx = x0 + (x1 - x0) * (i + 0.5) / n
            ld.chord([lx - 13 * k, ly - 8 * k, lx + 13 * k, ly + 8 * k], 180, 360, fill=(60, 40, 24, 255))
            ld.ellipse([lx - 4 * k, ly - 5 * k, lx + 4 * k, ly + 1 * k], fill=(255, 226, 170, 255))
        frame.alpha_composite(lights)
        return frame

    def _valance(self, hole):
        W, H, k = self.W, self.H, self.k
        x0, y0, x1, _ = self.opening
        vh = int(46 * k)
        scallops = 7
        sw = (x1 - x0) / scallops
        mask = Image.new("L", (W, H), 0)
        md = ImageDraw.Draw(mask)
        md.rectangle([x0 - 20, 0, x1 + 20, y0 + vh * 0.55], fill=255)
        for i in range(scallops):
            sx = x0 + i * sw
            md.ellipse([sx, y0 + vh * 0.1, sx + sw, y0 + vh], fill=255)
        mask = Image.fromarray(np.minimum(np.asarray(mask), np.asarray(hole)))

        red = np.array(hex_rgb(self.style.get("velvet", "#6e1a1e")), np.float32)
        xs = np.arange(W, dtype=np.float32)
        folds = 0.72 + 0.28 * np.cos((xs - x0) / sw * np.pi * 2)
        ys = np.arange(H, dtype=np.float32)[:, None]
        vert = 0.85 + 0.15 * np.clip((ys - y0) / vh, 0, 1)
        col = (red[None, None, :] * (folds[None, :, None] * vert[..., None])).clip(0, 255).astype(np.uint8)
        drape = Image.fromarray(col, "RGB").convert("RGBA")
        drape.putalpha(mask)
        # gold fringe along the scalloped edge
        edge = mask.filter(ImageFilter.MaxFilter(5)).point(lambda v: 255 if v else 0)
        edge = Image.fromarray(np.where(np.asarray(mask) > 0, 0, np.asarray(edge)).astype(np.uint8))
        fringe = Image.new("RGBA", (W, H), hex_rgb(self.style.get("gold", "#c9a25a")) + (255,))
        fringe.putalpha(Image.fromarray(np.minimum(np.asarray(edge), np.asarray(hole))))
        drape.alpha_composite(fringe)
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sm = mask.filter(ImageFilter.GaussianBlur(10 * k)).point(lambda v: int(v * 0.6))
        shadow.putalpha(Image.fromarray(np.minimum(np.asarray(sm), np.asarray(hole))))
        out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        out.alpha_composite(shadow, (0, int(8 * k)))
        out.alpha_composite(drape)
        return out

    # ------------------------------------------------------------------ curtains
    def _curtains(self):
        x0, y0, x1, y1 = self.opening
        cw = int((x1 - x0) / 2 + 40 * self.k)
        ch = y1 - y0 + int(20 * self.k)
        red = np.array(hex_rgb(self.style.get("velvet", "#6e1a1e")), np.float32)
        xs = np.arange(cw, dtype=np.float32)
        folds = 0.62 + 0.38 * (0.5 + 0.5 * np.cos(xs / (34 * self.k) * np.pi * 2)) ** 1.5
        ys = np.arange(ch, dtype=np.float32)[:, None]
        vert = 1.0 - 0.25 * (ys / ch)
        col = red[None, None, :] * (folds[None, :, None] * vert[..., None])
        left = Image.fromarray(col.clip(0, 255).astype(np.uint8), "RGB").convert("RGBA")
        # dark leading edge so the two halves read as separate drapes
        d = ImageDraw.Draw(left)
        d.rectangle([cw - 6 * self.k, 0, cw, ch], fill=(30, 6, 8, 255))
        right = left.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        return left, right

    def composite_curtains(self, img, closed):
        """closed: 0 = fully open, 1 = fully shut."""
        if closed <= 0.001:
            return
        x0, y0, x1, _ = self.opening
        cw = self.curtain_l.width
        half = (x1 - x0) / 2
        ov = 20 * self.k  # the halves overlap at centre stage when shut
        l_open, l_shut = x0 - cw - 10 * self.k, x0 + half + ov - cw
        r_open, r_shut = x1 + 10 * self.k, x0 + half - ov
        lx = int(l_open + (l_shut - l_open) * closed)
        rx = int(r_open + (r_shut - r_open) * closed)
        img.alpha_composite(self.curtain_l, (lx, y0 - int(10 * self.k)))
        img.alpha_composite(self.curtain_r, (rx, y0 - int(10 * self.k)))

    # ------------------------------------------------------------------ titles
    def ticket(self, text, sub=None):
        """A theatre-ticket title card: cream stock, double rule, perforated ends."""
        k = self.k
        f_main = load_font("bold", int(46 * k), self.style.get("font_bold"))
        f_sub = load_font("italic", int(26 * k), self.style.get("font_italic"))
        tw = f_main.getbbox(text)[2]
        sw = f_sub.getbbox(sub)[2] if sub else 0
        w = int(max(tw, sw) + 120 * k)
        h = int((128 if sub else 92) * k)
        card = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(card)
        paper = hex_rgb(self.style.get("ticket", "#efe0bd"))
        ink = hex_rgb(self.style.get("ticket_ink", "#3a1d14"))
        accent = hex_rgb(self.style.get("accent", "#7a1f1f"))
        d.rectangle([0, 0, w, h], fill=paper + (255,))
        r = 11 * k
        for cx in (0, w):  # perforated notches on both ends
            for i in range(3):
                cy = h * (i + 1) / 4
                d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(0, 0, 0, 0))
        m = 10 * k
        d.rectangle([m + r, m, w - m - r, h - m], outline=accent + (255,), width=max(1, int(2 * k)))
        d.rectangle([m + r + 5 * k, m + 5 * k, w - m - r - 5 * k, h - m - 5 * k],
                    outline=ink + (160,), width=1)
        ty = int(20 * k) if sub else int((h - 46 * k) / 2 - 4 * k)
        d.text(((w - tw) / 2, ty), text, font=f_main, fill=ink + (255,))
        if sub:
            d.text(((w - sw) / 2, ty + 58 * k), sub, font=f_sub, fill=accent + (255,))
        # paper speckle
        a = np.asarray(card).astype(np.float32)
        noise = np.random.default_rng(1).normal(0, 7, a.shape[:2])[..., None]
        a[..., :3] = (a[..., :3] + noise).clip(0, 255)
        card = Image.fromarray(a.astype(np.uint8), "RGBA")
        shadow = Image.new("RGBA", (w + 40, h + 40), (0, 0, 0, 0))
        sm = Image.new("L", shadow.size, 0)
        sm.paste(card.getchannel("A").point(lambda v: int(v * 0.55)), (20, 26))
        shadow.putalpha(sm.filter(ImageFilter.GaussianBlur(8)))
        shadow.alpha_composite(card, (20, 20))
        return shadow

    # ------------------------------------------------------------------ lens / film
    def _vignette(self):
        W, H = self.W, self.H
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        d = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        return (1 - 0.35 * np.clip(d - 0.45, 0, 1) ** 1.4).astype(np.float32)


class Dust:
    """Motes drifting through the lantern beam; brightness follows the light."""

    def __init__(self, width, height, count=140, seed=11):
        rng = np.random.default_rng(seed)
        self.W, self.H = width, height
        self.x0 = rng.uniform(0, width, count)
        self.y0 = rng.uniform(0, height, count)
        self.vx = rng.uniform(-6, 10, count)
        self.vy = rng.uniform(-14, -3, count)
        self.ph = rng.uniform(0, 6.28, count)
        self.b = rng.uniform(0.25, 1.0, count)
        self.sz = rng.choice([1, 1, 1, 2], count)

    def render(self, frame, light, t, strength=60.0):
        x = (self.x0 + self.vx * t + 6 * np.sin(t * 0.7 + self.ph)) % self.W
        y = (self.y0 + self.vy * t + 4 * np.cos(t * 0.5 + self.ph)) % self.H
        xi, yi = x.astype(int), y.astype(int)
        lit = np.clip(light[yi, xi] - 0.5, 0, None) * 2
        val = (self.b * lit * strength)[:, None] * np.array([1.0, 0.92, 0.78])
        for s in (1, 2):
            sel = self.sz >= s
            for dx in range(s):
                for dy in range(s):
                    xs = np.clip(xi[sel] + dx, 0, self.W - 1)
                    ys = np.clip(yi[sel] + dy, 0, self.H - 1)
                    np.add.at(frame, (ys, xs), val[sel] / s)


class Snow:
    """Flakes falling past the flats; lit by the same lantern as everything else."""

    def __init__(self, width, height, count=260, seed=19):
        rng = np.random.default_rng(seed)
        k = width / 1280
        self.W, self.H = width, height
        self.x0 = rng.uniform(0, width, count)
        self.y0 = rng.uniform(0, height, count)
        self.vy = rng.uniform(28, 80, count) * k
        self.sw = rng.uniform(4, 14, count) * k
        self.ph = rng.uniform(0, 6.28, count)
        self.sz = rng.choice([1, 2, 2, 3], count) * max(1, round(k))
        self.b = rng.uniform(110, 200, count)

    def render(self, frame, light, t):
        x = (self.x0 + self.sw * np.sin(t * 0.9 + self.ph) + t * 6) % self.W
        y = (self.y0 + self.vy * t) % self.H
        xi, yi = x.astype(int), y.astype(int)
        val = (self.b * (0.45 + 0.55 * np.clip(light[yi, xi], 0, 1.5)))[:, None] * np.array([0.92, 0.95, 1.0])
        for s in np.unique(self.sz):
            sel = self.sz == s
            for dx in range(s):
                for dy in range(s):
                    xs = np.clip(xi[sel] + dx, 0, self.W - 1)
                    ys = np.clip(yi[sel] + dy, 0, self.H - 1)
                    frame[ys, xs] = frame[ys, xs] * 0.35 + val[sel] * 0.65
