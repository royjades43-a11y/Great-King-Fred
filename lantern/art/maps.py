"""Parchment maps of Britain drawn from real coordinates.

The `map` set returns, besides its layers, a `places` dict of frame positions so the
script can point the spotlight at `@chippenham` or draw an ink route between places.
"""
import math

import numpy as np
from PIL import Image, ImageDraw

from .base import noise, scene_set, to_img
from ..stage import load_font as font

# (lat, lon) coastline of England and Wales, clockwise from the Thames; the far north
# runs off the top of every view so it is only roughed in.
BRITAIN = [
    (51.50, 0.45), (51.45, 0.70), (51.38, 1.00), (51.38, 1.42), (51.22, 1.40), (51.12, 1.32), (51.07, 1.10),
    (50.91, 0.97), (50.85, 0.60), (50.74, 0.25), (50.82, -0.14), (50.80, -0.55), (50.72, -0.79),
    (50.79, -1.05), (50.84, -1.30), (50.75, -1.55), (50.72, -1.85), (50.60, -1.96), (50.63, -2.30),
    (50.52, -2.45), (50.70, -2.80), (50.72, -3.05), (50.62, -3.40), (50.45, -3.50), (50.22, -3.65),
    (50.32, -4.00), (50.36, -4.20), (50.33, -4.70), (50.15, -5.05), (49.96, -5.20), (50.10, -5.55),
    (50.07, -5.71), (50.20, -5.45), (50.40, -5.05), (50.55, -4.95), (50.80, -4.55), (51.00, -4.52),
    (51.08, -4.25), (51.21, -4.15), (51.23, -3.80), (51.21, -3.47), (51.20, -3.10), (51.33, -2.98),
    (51.48, -2.70), (51.62, -2.55), (51.75, -2.40), (51.85, -2.28), (51.72, -2.48), (51.60, -2.75),
    (51.53, -3.00), (51.45, -3.18), (51.40, -3.45), (51.48, -3.72), (51.60, -3.85), (51.60, -4.00),
    (51.55, -4.30), (51.70, -4.40), (51.65, -4.70), (51.67, -5.10), (51.73, -5.25), (51.88, -5.31),
    (52.00, -5.05), (52.10, -4.65), (52.25, -4.30), (52.42, -4.08), (52.55, -4.05), (52.72, -4.06),
    (52.85, -4.20), (52.80, -4.70), (52.95, -4.60), (53.10, -4.35), (53.20, -4.55), (53.42, -4.55),
    (53.30, -4.05), (53.32, -3.85), (53.33, -3.45), (53.25, -3.15), (53.40, -3.18), (53.45, -3.02),
    (53.65, -3.02), (53.75, -2.95), (53.85, -3.05), (54.00, -2.90), (54.15, -3.10), (54.50, -3.62),
    (55.00, -3.20), (56.50, -3.00), (56.50, -1.50), (55.00, -1.40), (54.55, -1.05), (54.12, -0.08),
    (53.75, 0.10), (53.58, 0.14), (53.50, 0.05), (53.40, 0.25), (53.15, 0.35), (52.95, 0.30),
    (52.80, 0.20), (52.95, 0.50), (52.97, 0.90), (52.93, 1.30), (52.75, 1.65), (52.60, 1.73),
    (52.47, 1.76), (52.25, 1.62), (52.08, 1.55), (51.95, 1.30), (51.80, 1.15), (51.70, 0.95),
    (51.55, 0.80),
]
WIGHT = [(50.77, -1.58), (50.73, -1.10), (50.66, -1.07), (50.58, -1.30), (50.67, -1.55)]
FRANCE = [(51.10, 2.60), (51.00, 1.90), (50.75, 1.60), (50.40, 1.57), (50.10, 1.45), (49.85, 0.60),
          (49.70, 0.20), (49.40, 0.10), (48.00, 0.0), (48.0, 5.0), (51.3, 5.0)]
IRELAND = [(54.5, -5.6), (53.7, -6.25), (53.35, -6.10), (52.95, -6.00), (52.60, -6.20), (52.25, -6.35),
           (52.15, -6.90), (51.95, -7.60), (51.60, -8.6), (51.0, -10.5), (55.5, -10.5)]

# The Danelaw frontier of the Alfred-Guthrum treaty: up the Thames and the Lea, to
# Bedford, up the Ouse to Watling Street and along it to the north-west.
DANELAW_LINE = [(51.50, 0.40), (51.51, -0.01), (51.88, -0.42), (52.13, -0.47), (52.06, -0.82),
                (52.37, -1.26), (52.62, -1.70), (52.70, -2.40), (53.20, -2.90)]
REGIONS = {
    "wessex": [(51.75, 1.6), (51.50, -0.1), (51.70, -1.2), (51.68, -1.95), (51.48, -2.62), (51.20, -3.2),
               (51.10, -4.25), (49.5, -4.25), (49.5, 1.6)],
    "danelaw": DANELAW_LINE + [(53.6, -3.2), (56.6, -3.2), (56.6, 2.5), (51.5, 2.5)],
}

PLACES = {
    "chippenham": (51.46, -2.12), "athelney": (51.06, -2.93), "edington": (51.28, -2.10),
    "winchester": (51.06, -1.31), "london": (51.51, -0.13), "wantage": (51.59, -1.43),
    "aller": (51.04, -2.86), "wedmore": (51.23, -2.81), "egberts_stone": (51.13, -2.25),
    "reading": (51.45, -0.97), "ashdown": (51.55, -1.30), "exeter": (50.72, -3.53),
    "wareham": (50.69, -2.11), "repton": (52.84, -1.55), "cambridge": (52.20, 0.12),
    "thetford": (52.41, 0.75), "gloucester": (51.86, -2.24), "bath": (51.38, -2.36),
    "york": (53.96, -1.08), "canterbury": (51.28, 1.08), "oxford": (51.75, -1.26),
    "sandwich": (51.27, 1.34), "hastings": (50.86, 0.58), "southampton": (50.90, -1.40),
}
LABELS = {"egberts_stone": "Egbert's Stone"}
LABEL_BELOW = {"aller", "bath"}  # labels that would collide with a neighbour's

VIEWS = {  # centre lat, centre lon, longitude span
    "england": (51.75, -1.9, 11.2),
    "heptarchy": (52.45, -1.6, 13.0),   # York to the Channel
    "wessex": (51.25, -2.0, 6.5),
}


class Projection:
    def __init__(self, W, H, view):
        lat0, lon0, span = VIEWS[view] if isinstance(view, str) else view
        self.W, self.H = W, H
        self.lon0, self.lat0, self.span = lon0, lat0, span
        self.k = math.cos(math.radians(lat0))
        self.lat_span = span * self.k * H / W

    def __call__(self, lat, lon):
        x = (lon - self.lon0) / self.span + 0.5
        y = 0.5 - (lat - self.lat0) / self.lat_span
        return x * self.W, y * self.H


def _poly(proj, pts):
    return [proj(la, lo) for la, lo in pts]


@scene_set("map")
def map_set(W, H, rng, view="england", places=(), regions=(), frontier=False, labels=True):
    proj = Projection(W, H, view)
    s = W / 1920
    paper = np.array([222, 208, 172], np.float32)
    arr = np.broadcast_to(paper, (H, W, 3)).copy()
    arr += noise(W, H, H / 10, int(rng.integers(1e6)))[..., None] * 60
    arr += noise(W, H, H / 90, int(rng.integers(1e6)))[..., None] * 18
    img = to_img(arr)
    d = ImageDraw.Draw(img)
    ink = (66, 46, 30, 255)
    grid = (160, 136, 98, 255)
    for lon in range(-12, 6):
        x, _ = proj(52, lon)
        d.line([(x, 0), (x, H)], fill=grid, width=max(1, int(s)))
    for lat in range(48, 57):
        _, y = proj(lat, 0)
        d.line([(0, y), (W, y)], fill=grid, width=max(1, int(s)))

    lands = [_poly(proj, BRITAIN), _poly(proj, WIGHT), _poly(proj, FRANCE), _poly(proj, IRELAND)]
    for k, w in enumerate((44, 32, 22, 12)):  # sea ripples hugging the coast
        for pts in lands:
            d.line(pts + [pts[0]], fill=(150, 126, 90, 70 + 25 * k), width=int(w * s), joint="curve")
            d.line(pts + [pts[0]], fill=(222, 208, 172, 255), width=int((w - 4) * s), joint="curve")
    for i, pts in enumerate(lands):
        d.polygon(pts, fill=(172, 150, 104, 255) if i < 2 else (164, 144, 102, 255))
    land_mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(land_mask).polygon(lands[0], fill=255)
    ImageDraw.Draw(land_mask).polygon(lands[1], fill=255)
    tints = {"wessex": (170, 60, 40, 70), "danelaw": (40, 46, 80, 70)}
    for name in regions:
        m = Image.new("L", (W, H), 0)
        ImageDraw.Draw(m).polygon(_poly(proj, REGIONS[name]), fill=255)
        m = Image.fromarray(np.minimum(np.asarray(m), np.asarray(land_mask)))
        tint = Image.new("RGBA", (W, H), tints[name][:3] + (0,))
        tint.putalpha(m.point(lambda v, a=tints[name][3]: int(v * a / 255)))
        img.alpha_composite(tint)
        d = ImageDraw.Draw(img)
    d = ImageDraw.Draw(img)
    for pts in lands:
        d.line(pts + [pts[0]], fill=ink, width=max(2, int(3 * s)), joint="curve")
    rng2 = np.random.default_rng(3)
    for _ in range(int(60 * (11.2 / proj.span))):  # little hill strokes inland
        la, lo = rng2.uniform(50.3, 53.6), rng2.uniform(-4.5, 1.5)
        x, y = proj(la, lo)
        if 0 <= x < W and 0 <= y < H and land_mask.getpixel((int(x), int(y))):
            d.arc([x - 14 * s, y - 8 * s, x + 14 * s, y + 8 * s], 200, 340, fill=(110, 86, 60, 255),
                  width=max(1, int(2 * s)))
    if frontier:
        pts = _poly(proj, DANELAW_LINE)
        for a, b in zip(pts, pts[1:]):  # dashed frontier
            L = math.dist(a, b)
            n = max(1, int(L / (18 * s)))
            for k in range(0, n, 2):
                p0 = (a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n)
                p1 = (a[0] + (b[0] - a[0]) * (k + 1) / n, a[1] + (b[1] - a[1]) * (k + 1) / n)
                d.line([p0, p1], fill=(130, 30, 30, 255), width=max(2, int(4 * s)))

    out_places = {}
    f_place = font("italic", int(30 * s * min(2.0, (11.2 / proj.span) ** 0.35)))
    for name in places:
        x, y = proj(*PLACES[name])
        out_places[name] = (x / W, y / H)
        if labels:
            r = 7 * s
            d.ellipse([x - r, y - r, x + r, y + r], fill=(120, 30, 30, 255), outline=ink, width=max(1, int(2 * s)))
            ty = y + 4 * s if name in LABEL_BELOW else y - 20 * s * f_place.size / (30 * s)
            d.text((x + 14 * s, ty), LABELS.get(name, name.title()), font=f_place, fill=ink)
    f_region = font("bold", int(46 * s * min(1.6, (11.2 / proj.span) ** 0.3)))
    region_anchor = {"wessex": (50.95, -2.2), "danelaw": (52.75, 0.2)}
    for name in regions:
        x, y = proj(*region_anchor[name])
        text = " ".join(name.upper())
        w = d.textlength(text, font=f_region)
        d.text((x - w / 2, y), text, font=f_region, fill=(90, 40, 30, 200) if name == "wessex" else (40, 40, 70, 210))
    for name in regions:
        x, y = proj(*region_anchor[name])
        out_places[name] = (x / W, (y + 25 * s) / H)
    # compass rose, bottom right
    cx, cy, R = W * 0.86, H * 0.74, 80 * s
    for a in range(0, 360, 45):
        L = R if a % 90 == 0 else R * 0.55
        t = math.radians(a)
        p = (cx + math.sin(t) * L, cy - math.cos(t) * L)
        s1 = (cx + math.sin(t + 0.25) * 12 * s, cy - math.cos(t + 0.25) * 12 * s)
        s2 = (cx + math.sin(t - 0.25) * 12 * s, cy - math.cos(t - 0.25) * 12 * s)
        d.polygon([p, s1, (cx, cy), s2], fill=ink if a % 90 == 0 else (120, 40, 34, 255))
    return {"layers": [{"key": "map", "image": img, "depth": 1.0, "paper": False, "grade": 0.45}],
            "ambient": 0.58, "weather": None, "places": out_places, "projection": proj}
