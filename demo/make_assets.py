"""Generate placeholder cut-paper artwork for the demo scene.

In real episodes you replace these with archival images / paintings split into layers
(background, middle, subject, foreground) as transparent PNGs.
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1920, 1080
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets")
rng = np.random.default_rng(42)


def save(img, name):
    img.save(os.path.join(OUT, name))
    print("  ", name)


def noise_img(w, h, scale, amp, seed):
    r = np.random.default_rng(seed)
    small = r.normal(0, 1, (max(2, h // scale), max(2, w // scale)))
    n = Image.fromarray(((small + 3) * 42).clip(0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    return (np.asarray(n).astype(np.float32) / 255 - 0.5) * amp


def ridge(xs, base, parts, seed):
    r = np.random.default_rng(seed)
    y = np.full_like(xs, base, dtype=np.float64)
    for amp, freq in parts:
        y += amp * np.sin(xs * freq + r.uniform(0, 6.28))
    return y


def silhouette(curve_y, color, w=W, h=H):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pts = [(0, h)] + [(x, curve_y[x]) for x in range(0, w, 4)] + [(w, curve_y[-1]), (w, h)]
    ImageDraw.Draw(img).polygon(pts, fill=color)
    return img


# --------------------------------------------------------------------------- scene 1: castle at night
def sky():
    ys = np.linspace(0, 1, H)[:, None, None]
    top, bot = np.array([18, 20, 34]), np.array([120, 112, 120])
    arr = np.broadcast_to(top + (bot - top) * ys ** 1.6, (H, W, 3)).astype(np.float32).copy()
    arr += noise_img(W, H, 160, 30, 1)[..., None]
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert("RGBA")
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    mx, my = int(W * 0.74), int(H * 0.22)
    ImageDraw.Draw(glow).ellipse([mx - 170, my - 170, mx + 170, my + 170], fill=(230, 225, 210, 90))
    img.alpha_composite(glow.filter(ImageFilter.GaussianBlur(60)))
    d = ImageDraw.Draw(img)
    d.ellipse([mx - 58, my - 58, mx + 58, my + 58], fill=(244, 238, 222, 255))
    d.ellipse([mx - 30, my - 34, mx + 5, my - 4], fill=(222, 214, 196, 255))
    d.ellipse([mx + 12, my + 10, mx + 34, my + 30], fill=(226, 218, 200, 255))
    for _ in range(260):
        x, y = rng.uniform(0, W), rng.uniform(0, H * 0.6)
        r = rng.choice([1, 1, 1.5, 2])
        b = int(rng.uniform(140, 255))
        d.ellipse([x - r, y - r, x + r, y + r], fill=(b, b, b, 255))
    clouds = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(clouds)
    for _ in range(14):
        cx, cy = rng.uniform(0, W), rng.uniform(H * 0.15, H * 0.5)
        cd.ellipse([cx - 260, cy - 26, cx + 260, cy + 26], fill=(70, 70, 86, 120))
    img.alpha_composite(clouds.filter(ImageFilter.GaussianBlur(18)))
    save(img, "sky.png")


def hills_far():
    xs = np.arange(W + 8, dtype=np.float64)
    save(silhouette(ridge(xs, H * 0.70, [(30, 0.004), (14, 0.011), (5, 0.04)], 2), (64, 62, 72, 255)), "hills_far.png")


def castle():
    w, h = 1000, 640
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    stone = (50, 46, 50, 255)

    def tower(x, top, tw, roof=True):
        d.rectangle([x, top, x + tw, h], fill=stone)
        if roof:
            d.polygon([(x - 14, top), (x + tw / 2, top - tw * 1.3), (x + tw + 14, top)], fill=(38, 34, 38, 255))
        else:
            for i in range(0, int(tw), 22):
                d.rectangle([x + i, top - 18, x + i + 12, top], fill=stone)

    d.rectangle([150, 300, 850, h], fill=stone)  # curtain wall
    for i in range(150, 850, 30):
        d.rectangle([i, 282, i + 16, 300], fill=stone)
    tower(90, 200, 120)
    tower(790, 210, 120)
    tower(400, 80, 200, roof=False)  # keep
    tower(250, 230, 90)
    tower(660, 240, 90)
    # gate
    d.rectangle([455, 470, 545, h], fill=(18, 14, 14, 255))
    d.pieslice([455, 425, 545, 515], 180, 360, fill=(18, 14, 14, 255))
    # lit windows (warm accent that survives the grade)
    for x, y in [(130, 300), (160, 360), (830, 300), (450, 180), (520, 180), (480, 260), (285, 320), (690, 330)]:
        d.rectangle([x, y, x + 16, y + 28], fill=(255, 176, 80, 255))
        d.pieslice([x, y - 8, x + 16, y + 8], 180, 360, fill=(255, 176, 80, 255))
    save(img, "castle.png")


def hills_near():
    xs = np.arange(W + 8, dtype=np.float64)
    y = ridge(xs, H * 0.86, [(16, 0.006), (6, 0.03)], 4)
    y -= 140 * np.exp(-((xs - W * 0.2) / 260) ** 2)  # knoll for the king
    img = silhouette(y, (24, 22, 24, 255))
    d = ImageDraw.Draw(img)
    for x in range(0, W, 7):  # grass tufts along the ridge
        top = y[x]
        hgt = rng.uniform(6, 20)
        d.line([(x, top + 2), (x + rng.uniform(-6, 6), top - hgt)], fill=(24, 22, 24, 255), width=2)
    save(img, "hills_near.png")


def king():
    w, h = 300, 620
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ink = (16, 14, 18, 255)
    d.polygon([(150, 140), (40, h), (260, h)], fill=ink)  # cloak
    d.polygon([(150, 150), (70, 300), (100, 310)], fill=ink)
    d.ellipse([118, 82, 182, 150], fill=ink)  # head
    d.polygon([(116, 92), (122, 48), (136, 74), (150, 38), (164, 74), (178, 48), (184, 92)], fill=(200, 160, 70, 255))
    d.rectangle([228, 120, 238, h - 10], fill=ink)  # staff
    d.ellipse([220, 100, 246, 126], fill=(200, 160, 70, 255))
    save(img, "king.png")


def banner():
    w, h = 220, 420
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle([14, 10, 22, h], fill=(30, 26, 26, 255))
    pts = [(22, 20)]
    for i in range(0, 181, 10):
        pts.append((22 + i, 20 + 8 * math.sin(i / 30)))
    pts += [(202, 100), (170, 120), (202, 140)]
    for i in range(180, -1, -10):
        pts.append((22 + i, 140 + 8 * math.sin(i / 30)))
    d.polygon(pts, fill=(150, 30, 34, 255))
    d.polygon([(90, 55), (110, 80), (90, 105), (70, 80)], fill=(220, 180, 90, 255))  # device
    save(img, "banner.png")


# --------------------------------------------------------------------------- scene 2: the map
def parchment():
    base = np.array([214, 196, 156], np.float32)
    arr = np.broadcast_to(base, (H, W, 3)).copy()
    arr += noise_img(W, H, 90, 60, 7)[..., None]
    arr += noise_img(W, H, 12, 18, 8)[..., None]
    yy, xx = np.mgrid[0:H, 0:W]
    edge = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    arr *= (1 - 0.45 * np.clip(edge - 0.6, 0, 1))[..., None]
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert("RGBA")
    d = ImageDraw.Draw(img)
    ink = (70, 48, 30, 255)
    for x in range(0, W, 160):
        d.line([(x, 0), (x, H)], fill=(150, 126, 90, 255), width=1)
    for y in range(0, H, 160):
        d.line([(0, y), (W, y)], fill=(150, 126, 90, 255), width=1)

    # an island, shaped vaguely like southern Britain
    r = np.random.default_rng(3)
    cx, cy = W * 0.46, H * 0.52
    pts = []
    ph = r.uniform(0, 6.28, 6)
    for i in range(240):
        a = 2 * math.pi * i / 240
        rad = 1 + 0.12 * math.sin(3 * a + ph[0]) + 0.07 * math.sin(7 * a + ph[1]) + 0.04 * math.sin(17 * a + ph[2])
        pts.append((cx + math.cos(a) * W * 0.27 * rad, cy + math.sin(a) * H * 0.26 * rad))
    for k, off in enumerate(range(26, 0, -6)):  # hatched sea halo
        d.line(pts + [pts[0]], fill=(120, 96, 64, 60 + k * 30), width=1)
        pts2 = [(cx + (x - cx) * (1 + off / 500), cy + (y - cy) * (1 + off / 400)) for x, y in pts]
        d.line(pts2 + [pts2[0]], fill=(120, 96, 64, 90), width=1)
    d.polygon(pts, fill=(196, 176, 130, 255))
    d.line(pts + [pts[0]], fill=ink, width=3)
    for _ in range(40):  # hills
        x, y = cx + r.uniform(-0.18, 0.18) * W, cy + r.uniform(-0.16, 0.16) * H
        d.arc([x - 16, y - 10, x + 16, y + 10], 200, 340, fill=ink, width=2)
    # compass rose
    rx, ry, R = W * 0.85, H * 0.78, 90
    for a in range(0, 360, 45):
        L = R if a % 90 == 0 else R * 0.55
        t = math.radians(a)
        p = (rx + math.sin(t) * L, ry - math.cos(t) * L)
        s1 = (rx + math.sin(t + 0.25) * 14, ry - math.cos(t + 0.25) * 14)
        s2 = (rx + math.sin(t - 0.25) * 14, ry - math.cos(t - 0.25) * 14)
        d.polygon([p, s1, (rx, ry), s2], fill=ink if a % 90 == 0 else (120, 40, 34, 255))
    d.ellipse([rx - R * 0.3, ry - R * 0.3, rx + R * 0.3, ry + R * 0.3], outline=ink, width=2)
    try:
        f = ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf", 64)
    except OSError:
        f = ImageFont.load_default(64)
    d.text((cx - 140, cy - 30), "W E S S E X", font=f, fill=(70, 48, 30, 220))
    f2 = f.font_variant(size=46)
    d.text((W * 0.755, H * 0.60), "Mare Britannicum", font=f2, fill=(90, 66, 44, 200))
    save(img, "parchment.png")


def ship():
    w, h = 260, 260
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    ink = (40, 26, 18, 255)
    d.polygon([(20, 190), (240, 190), (205, 240), (55, 240)], fill=ink)  # hull
    d.polygon([(240, 190), (258, 160), (250, 192)], fill=ink)  # prow
    d.rectangle([126, 30, 134, 192], fill=ink)
    d.polygon([(60, 50), (200, 50), (210, 170), (50, 170)], fill=(232, 218, 186, 255))  # sail
    for i in range(4):
        d.line([(70 + i * 40, 50), (66 + i * 42, 170)], fill=(150, 30, 34, 255), width=10)
    save(img, "ship.png")


# --------------------------------------------------------------------------- scene 3: the hall
def hall():
    arr = np.full((H, W, 3), 92, np.float32)
    arr += noise_img(W, H, 40, 40, 11)[..., None]
    img = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert("RGBA")
    d = ImageDraw.Draw(img)
    for row, y in enumerate(range(0, H, 70)):  # stone courses
        d.line([(0, y), (W, y)], fill=(54, 54, 56, 255), width=3)
        for x in range(-(row % 2) * 70, W, 140):
            d.line([(x, y), (x, y + 70)], fill=(54, 54, 56, 255), width=3)
    for wx in (W * 0.22, W * 0.78):  # tall arched windows with moonlight
        d.rectangle([wx - 90, H * 0.22, wx + 90, H * 0.66], fill=(150, 160, 190, 255))
        d.pieslice([wx - 90, H * 0.22 - 90, wx + 90, H * 0.22 + 90], 180, 360, fill=(150, 160, 190, 255))
        d.line([(wx, H * 0.14), (wx, H * 0.66)], fill=(30, 30, 34, 255), width=10)
        d.line([(wx - 90, H * 0.42), (wx + 90, H * 0.42)], fill=(30, 30, 34, 255), width=10)
    beams = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    bd = ImageDraw.Draw(beams)
    for wx, s in ((W * 0.22, 1), (W * 0.78, -1)):
        bd.polygon([(wx - 90, H * 0.25), (wx + 90, H * 0.25), (wx + 90 + s * 380, H), (wx - 90 + s * 260, H)],
                   fill=(190, 200, 225, 50))
    img.alpha_composite(beams.filter(ImageFilter.GaussianBlur(24)))
    d.rectangle([0, H * 0.86, W, H], fill=(46, 40, 38, 255))  # floor
    save(img, "hall.png")


def throne():
    w, h = 420, 620
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    wood = (60, 34, 22, 255)
    d.rectangle([80, 40, 340, 420], fill=wood)
    d.polygon([(80, 40), (210, -0 + 2), (340, 40)], fill=wood)
    d.rectangle([110, 70, 310, 400], fill=(130, 26, 30, 255))
    d.rectangle([40, 380, 380, 460], fill=wood)
    d.rectangle([60, 460, 100, h], fill=wood)
    d.rectangle([320, 460, 360, h], fill=wood)
    d.rectangle([0, 340, 60, 400], fill=wood)
    d.rectangle([360, 340, 420, 400], fill=wood)
    d.ellipse([190, 10, 230, 50], fill=(200, 160, 70, 255))
    save(img, "throne.png")


def candelabra():
    w, h = 200, 520
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    iron = (30, 26, 24, 255)
    d.rectangle([96, 80, 104, h - 30], fill=iron)
    d.polygon([(60, h), (140, h), (104, h - 40), (96, h - 40)], fill=iron)
    d.arc([30, 30, 170, 150], 0, 180, fill=iron, width=8)
    for x in (30, 100, 170):
        d.rectangle([x - 12, 54, x + 12, 96], fill=(234, 224, 196, 255))  # candles
        d.rectangle([x - 18, 92, x + 18, 100], fill=iron)
    save(img, "candelabra.png")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("generating demo artwork ->", OUT)
    for fn in (sky, hills_far, castle, hills_near, king, banner, parchment, ship, hall, throne, candelabra):
        fn()
