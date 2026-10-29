"""Shared drawing helpers for the code-drawn cut-paper art.

Everything is drawn in flat shapes at 2x and downsampled for clean edges. Colours are
chosen by *value* first: the renderer's duotone grade maps darks to indigo and lights to
sepia, so only the accents (gold, blood red, fire) need real hue.
"""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

INK = (22, 18, 22, 255)        # silhouettes
DARK = (40, 34, 36, 255)
STONE = (92, 88, 90, 255)
WOOD = (70, 46, 30, 255)
THATCH = (120, 98, 60, 255)
CLOTH = (150, 140, 120, 255)
PAPER = (226, 214, 184, 255)
GOLD = (206, 164, 72, 255)
RED = (150, 32, 34, 255)
BLUE = (52, 70, 110, 255)
FIRE = (255, 150, 50, 255)
SNOW = (214, 216, 222, 255)

PROPS, SETS = {}, {}


def prop(name):
    def reg(fn):
        PROPS[name] = fn
        return fn
    return reg


def scene_set(name):
    def reg(fn):
        SETS[name] = fn
        return fn
    return reg


class Canvas:
    """Supersampled RGBA canvas with drawing in *unit* coordinates (fractions of height)."""

    def __init__(self, w, h, ss=2, bg=(0, 0, 0, 0)):
        self.w, self.h, self.ss = int(w), int(h), ss
        self.img = Image.new("RGBA", (self.w * ss, self.h * ss), bg)
        self.d = ImageDraw.Draw(self.img)
        self.s = self.h * ss  # unit -> pixels

    def p(self, x, y):
        return (x * self.s, y * self.s)

    def pts(self, pts):
        return [self.p(x, y) for x, y in pts]

    def poly(self, pts, fill):
        self.d.polygon(self.pts(pts), fill=fill)

    def rect(self, x0, y0, x1, y1, fill):
        self.d.rectangle([x0 * self.s, y0 * self.s, x1 * self.s, y1 * self.s], fill=fill)

    def ellipse(self, cx, cy, rx, ry, fill, outline=None, width=0):
        self.d.ellipse([(cx - rx) * self.s, (cy - ry) * self.s, (cx + rx) * self.s, (cy + ry) * self.s],
                       fill=fill, outline=outline, width=int(width * self.s))

    def circle(self, cx, cy, r, fill, outline=None, width=0):
        self.ellipse(cx, cy, r, r, fill, outline, width)

    def line(self, pts, fill, width):
        self.d.line(self.pts(pts), fill=fill, width=max(1, int(width * self.s)), joint="curve")

    def pie(self, cx, cy, r, a0, a1, fill):
        self.d.pieslice([(cx - r) * self.s, (cy - r) * self.s, (cx + r) * self.s, (cy + r) * self.s],
                        a0, a1, fill=fill)

    def paste(self, img, x, y):
        """Composite another canvas image (already at final size) at unit position."""
        big = img.resize((img.width * self.ss, img.height * self.ss), Image.LANCZOS)
        self.img.alpha_composite(big, (int(x * self.s), int(y * self.s)))

    def done(self):
        return self.img.resize((self.w, self.h), Image.LANCZOS)


def noise(w, h, scale, seed):
    """Smooth value noise in [-0.5, 0.5]."""
    r = np.random.default_rng(seed)
    small = r.normal(0, 1, (max(2, int(h / scale)), max(2, int(w / scale))))
    n = Image.fromarray(((small + 3) * 42).clip(0, 255).astype(np.uint8)).resize((int(w), int(h)), Image.BICUBIC)
    return np.asarray(n).astype(np.float32) / 255 - 0.5


def ridge(n, base, parts, seed):
    """A 1-D skyline: base height plus a few sine octaves."""
    r = np.random.default_rng(seed)
    xs = np.arange(n, dtype=np.float64)
    y = np.full(n, base, dtype=np.float64)
    for amp, freq in parts:
        y += amp * np.sin(xs * freq + r.uniform(0, 6.28))
    return y


def silhouette(w, h, ys, fill):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pts = [(0, h)] + [(x, ys[x]) for x in range(0, w, 3)] + [(w - 1, ys[w - 1]), (w, h)]
    ImageDraw.Draw(img).polygon(pts, fill=fill)
    return img


def gradient(w, h, top, bottom, gamma=1.0):
    ys = np.linspace(0, 1, h)[:, None, None] ** gamma
    top, bottom = np.array(top[:3], np.float32), np.array(bottom[:3], np.float32)
    arr = np.broadcast_to(top + (bottom - top) * ys, (h, w, 3)).copy()
    return arr


def to_img(arr):
    return Image.fromarray(np.asarray(arr).clip(0, 255).astype(np.uint8)).convert("RGBA")


def soft(img, radius):
    return img.filter(ImageFilter.GaussianBlur(radius))


def lerp_col(a, b, t):
    return tuple(int(x + (y - x) * t) for x, y in zip(a, b))


def trim(img, pad=2):
    """Crop transparent margins so anchors sit on the drawn shape."""
    box = img.getchannel("A").getbbox()
    if not box:
        return img
    x0, y0, x1, y1 = box
    return img.crop((max(0, x0 - pad), max(0, y0 - pad), min(img.width, x1 + pad), min(img.height, y1 + pad)))


def jitter(rng, v, amt):
    return v + rng.uniform(-amt, amt)


def deg(a):
    return math.radians(a)
