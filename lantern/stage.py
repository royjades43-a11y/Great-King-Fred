"""The fixed stage furniture: proscenium arch, curtains, title tickets, dust and film grain."""
import math
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
        self.kind = style.get("frame", "proscenium")
        if self.kind == "window":
            side, top, bottom = int(64 * k), int(26 * k), int(60 * k)
        else:
            side, top, bottom = int(58 * k), int(36 * k), int(74 * k)
        self.opening = (side, top, width - side, height - bottom)
        self.frame = self._window() if self.kind == "window" else self._proscenium()
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

    # ------------------------------------------------------------------ gothic window
    def arch_top(self, x):
        """Top edge of the pointed-arch opening at pixel column x."""
        x0, y0, x1, y1 = self.opening
        cx, hw = (x0 + x1) / 2, (x1 - x0) / 2
        u = np.clip(np.abs(x - cx) / hw, 0, 1)
        return y0 + (y1 - y0) * 0.2 * (1 - np.sqrt(1 - u))

    def _window_mask(self):
        W, H = self.W, self.H
        x0, y0, x1, y1 = self.opening
        xs = np.arange(W)
        top = self.arch_top(xs)
        yy = np.arange(H)[:, None]
        m = (yy >= top[None, :]) & (yy <= y1) & (xs[None, :] >= x0) & (xs[None, :] <= x1)
        return Image.fromarray((m * 255).astype(np.uint8))

    def _window(self):
        """Carved stone around a pointed-arch window, the glass seen from inside the church."""
        W, H, k = self.W, self.H, self.k
        rng = np.random.default_rng(5)
        stone = np.array(hex_rgb(self.style.get("stone", "#5c544c")), np.float32)
        small = rng.normal(0, 1, (H // 12, W // 12))
        n = Image.fromarray(((small + 3) * 42).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
        n = np.asarray(n).astype(np.float32) / 255 - 0.5
        arr = stone[None, None, :] * (1 + n[..., None] * 0.3)
        img = Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGB").convert("RGBA")
        d = ImageDraw.Draw(img)
        course = int(48 * k)
        joint = (40, 36, 32, 255)
        for r_, y in enumerate(range(0, H, course)):  # ashlar courses
            d.line([(0, y), (W, y)], fill=joint, width=max(1, int(2 * k)))
            for x in range(-(r_ % 2) * course, W, course * 2):
                d.line([(x, y), (x, y + course)], fill=joint, width=max(1, int(2 * k)))
        hole = self._window_mask()
        # deep splayed reveal: darkening toward the glass
        reveal = hole.filter(ImageFilter.MaxFilter(int(31 * k) | 1)).filter(ImageFilter.GaussianBlur(10 * k))
        img = Image.composite(Image.new("RGBA", (W, H), (14, 12, 12, 255)), img, reveal.point(lambda v: int(v * 0.8)))
        # moulding: a pale stone roll around the opening
        ring = hole.filter(ImageFilter.MaxFilter(int(13 * k) | 1))
        ring = Image.fromarray(np.where(np.asarray(hole) > 0, 0, np.asarray(ring)).astype(np.uint8))
        img.paste((150, 138, 118, 255), (0, 0), ring)
        x0, _, x1, y1 = self.opening
        d = ImageDraw.Draw(img)
        d.rectangle([x0 - 24 * k, y1 + 6 * k, x1 + 24 * k, y1 + 22 * k], fill=(120, 110, 96, 255))  # sill
        d.line([x0 - 24 * k, y1 + 6 * k, x1 + 24 * k, y1 + 6 * k], fill=(170, 158, 136, 255), width=max(1, int(2 * k)))
        img.putalpha(Image.eval(hole, lambda v: 255 - v))
        self.hole = np.asarray(hole) > 127
        self.glass_cells = self._cells()
        return img

    def _cells(self, n=110, q=4):
        """A shard map of the opening, for the glazier's assembling transition."""
        W, H = self.W, self.H
        rng = np.random.default_rng(31)
        sx, sy = rng.uniform(0, W, n), rng.uniform(0, H, n)
        gy, gx = np.mgrid[0:H:q, 0:W:q].astype(np.float32)
        best = np.full(gx.shape, np.inf, np.float32)
        cell = np.zeros(gx.shape, np.int32)
        for i in range(n):
            dd = (gx - sx[i]) ** 2 + (gy - sy[i]) ** 2
            c = dd < best
            best[c], cell[c] = dd[c], i
        cell = cell.repeat(q, 0).repeat(q, 1)[:H, :W]
        order = np.argsort(np.argsort(-sy + rng.normal(0, H * 0.12, n)))  # bottom-up, loosely
        edge = np.zeros((H, W), bool)
        edge[:, 1:] |= cell[:, 1:] != cell[:, :-1]
        edge[1:, :] |= cell[1:, :] != cell[:-1, :]
        edge = np.asarray(Image.fromarray(edge.astype(np.uint8) * 255).filter(
            ImageFilter.MaxFilter(max(3, int(3 * self.k)) | 1))) > 0
        return order[cell].astype(np.float32) / n, edge

    def glass_assemble(self, out, f):
        """Show only the shards placed so far (f: 0 -> 1), with leading between all shards."""
        rank, edge = self.glass_cells
        hole = self.hole
        shown = rank < f
        fresh = (rank < f) & (rank > f - 0.06) & hole  # a shard just set in place catches the light
        out[~shown & hole] = (16, 12, 10)
        out[fresh] = out[fresh] * 1.35 + 20
        a = max(0.0, 1 - f) ** 0.5
        e = edge & hole
        out[e] = out[e] * (1 - a) + np.array([30, 27, 26], np.float32) * a

    def shatter_out(self, out, k):
        """The whole window cracks into its shards, which drop away into the dark (k: 0 -> 1)."""
        if not hasattr(self, "_shards"):
            rank, _ = self.glass_cells
            cells = np.round(rank * 110).astype(np.int32)
            self._shards = []
            rng = np.random.default_rng(8)
            for c in np.unique(cells):
                ys, xs = np.nonzero(cells == c)
                if not len(xs):
                    continue
                x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
                m = (cells[y0:y1, x0:x1] == c) & self.hole[y0:y1, x0:x1]
                self._shards.append((x0, y0, m, rng.uniform(0, 0.35) + (1 - y0 / self.H) * 0.15,
                                     rng.uniform(-0.05, 0.05) * self.W))
        src = out.copy()
        res = out.copy()
        res[self.hole] = (14, 10, 9)
        _, edge = self.glass_cells
        crack = edge & self.hole
        res_src = src.copy()
        res_src[crack] = (30, 27, 26)  # the leading shows first, then the pieces go
        g = 2.2 * self.H
        for x0, y0, m, delay, vx in self._shards:
            tau = max(0.0, k * 1.8 - 0.25 - delay)
            dy, dx = int(0.5 * g * tau * tau), int(vx * tau)
            ny0, nx0 = y0 + dy, x0 + dx
            h, w = m.shape
            if ny0 >= self.H or nx0 >= self.W or nx0 + w <= 0:
                continue
            ys0, xs0 = max(0, -ny0), max(0, -nx0)
            ys1, xs1 = min(h, self.H - ny0), min(w, self.W - nx0)
            mm = m[ys0:ys1, xs0:xs1] & self.hole[ny0 + ys0:ny0 + ys1, nx0 + xs0:nx0 + xs1]  # stays in the window
            piece = res_src[y0 + ys0:y0 + ys1, x0 + xs0:x0 + xs1]
            dst = res[ny0 + ys0:ny0 + ys1, nx0 + xs0:nx0 + xs1]
            dst[mm] = piece[mm]
        return res

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
        for cx in ((0, w) if self.style.get("ticket_perforate", True) else ()):  # perforated ends
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

    def label(self, text):
        """A small gold-on-dark plaque for pointing out details in the glass."""
        k = self.k
        f = load_font("italic", int(22 * k), self.style.get("font_italic"))
        tw = f.getbbox(text)[2]
        w, h = int(tw + 34 * k), int(40 * k)
        img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(img)
        gold = hex_rgb(self.style.get("ticket_ink", "#e8c56a"))
        d.rounded_rectangle([0, 0, w - 1, h - 1], radius=int(6 * k), fill=(26, 20, 16, 235),
                            outline=gold + (255,), width=max(1, int(2 * k)))
        d.text((17 * k, (h - f.getbbox(text)[3]) / 2 - 2 * k), text, font=f, fill=gold + (255,))
        return img

    def banderole(self, words, size):
        """A medieval speech scroll: a parchment ribbon with forked ends, and the words in ink.
        Returns (ribbon image, [(word image, x offset)])."""
        f = load_font("italic", int(size), self.style.get("font_italic"))
        space = f.getlength(" ")
        imgs, x = [], 0.0
        for w in words:
            l, t_, r, b = f.getbbox(w)
            im = Image.new("RGBA", (int(r - l + 4), int(size * 1.4)), (0, 0, 0, 0))
            ImageDraw.Draw(im).text((2 - l, size * 0.12), w, font=f, fill=(48, 26, 18, 255))
            imgs.append((im, x))
            x += r - l + space
        body_w, h = int(x - space + size * 1.6), int(size * 1.9)
        end = int(h * 0.7)
        W_ = body_w + end * 2
        rib = Image.new("RGBA", (W_, h + 20), (0, 0, 0, 0))
        d = ImageDraw.Draw(rib)
        wave = lambda u: math.sin(u * math.pi * 2) * h * 0.07  # noqa: E731
        top = [(end + u * body_w, 8 + wave(u)) for u in np.linspace(0, 1, 40)]
        bot = [(end + u * body_w, 8 + h + wave(u + 0.15)) for u in np.linspace(1, 0, 40)]
        for side in (-1, 1):  # the folded, forked tails behind the ribbon
            x0 = end if side < 0 else end + body_w
            tail = [(x0, 8 + h * 0.15), (x0 + side * end, 8 + h * 0.1), (x0 + side * end * 0.55, 8 + h * 0.55),
                    (x0 + side * end, 8 + h * 1.0), (x0, 8 + h * 0.85)]
            d.polygon(tail, fill=(196, 176, 130, 255), outline=(60, 40, 28, 255))
        d.polygon(top + bot, fill=(236, 220, 178, 255), outline=(60, 40, 28, 255))
        d.line(top, fill=(60, 40, 28, 255), width=max(2, int(size * 0.06)))
        d.line(bot, fill=(60, 40, 28, 255), width=max(2, int(size * 0.06)))
        placed = [(im, end + size * 0.8 + x_) for im, x_ in imgs]
        return rib, placed, 8 + (h - size * 1.4) / 2

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
