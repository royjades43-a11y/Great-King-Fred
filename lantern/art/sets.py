"""Backdrop sets. Each returns {"layers": [...], "ambient": float, "weather": str|None}.

A layer is {"key", "image", "depth", "paper", "grade", "drift"?}; `drift` is a slow sideways
movement (fraction of frame width per second) the director turns into rail slides.
"""
import numpy as np
from PIL import Image, ImageDraw

from .base import gradient, noise, ridge, scene_set, silhouette, soft, to_img
from .props import make_prop

SKIES = {
    #        top              horizon          ambient
    "night": ((14, 16, 30), (96, 92, 108), 0.52),
    "dusk": ((40, 34, 60), (210, 140, 90), 0.58),
    "dawn": ((70, 80, 110), (232, 190, 140), 0.62),
    "day": ((120, 140, 160), (220, 214, 196), 0.7),
    "storm": ((30, 32, 40), (90, 90, 96), 0.5),
}


def sky(W, H, time, rng, horizon=0.7):
    top, bottom, _ = SKIES[time]
    arr = gradient(W, H, top, bottom, gamma=1.5)
    arr += noise(W, H, H / 6, int(rng.integers(1e6)))[..., None] * 34
    img = to_img(arr)
    d = ImageDraw.Draw(img)
    if time in ("night", "storm"):
        for _ in range(int(0.00013 * W * H) if time == "night" else 0):
            x, y = rng.uniform(0, W), rng.uniform(0, H * horizon * 0.85)
            r = rng.choice([0.7, 1, 1, 1.6]) * W / 1920
            b = int(rng.uniform(130, 255))
            d.ellipse([x - r, y - r, x + r, y + r], fill=(b, b, b, 255))
    body = {"night": (0.76, 0.2, (244, 238, 222)), "dusk": (0.3, horizon * 0.86, (255, 200, 140)),
            "dawn": (0.68, horizon * 0.8, (255, 226, 180)), "day": (0.2, 0.18, (255, 246, 220))}.get(time)
    if body:
        bx, by, col = body[0] * W, body[1] * H, body[2]
        R = H * (0.055 if time == "night" else 0.075)
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(glow).ellipse([bx - R * 3, by - R * 3, bx + R * 3, by + R * 3], fill=col + (70,))
        img.alpha_composite(soft(glow, R * 1.2))
        d = ImageDraw.Draw(img)
        d.ellipse([bx - R, by - R, bx + R, by + R], fill=col + (255,))
        if time == "night":
            for ox, oy, rr in ((-0.3, -0.25, 0.3), (0.25, 0.2, 0.2)):
                d.ellipse([bx + ox * R - rr * R, by + oy * R - rr * R, bx + ox * R + rr * R, by + oy * R + rr * R],
                          fill=(222, 214, 196, 255))
    clouds = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(clouds)
    shade = {"night": (64, 64, 80, 110), "storm": (40, 40, 48, 200), "dusk": (120, 70, 80, 120),
             "dawn": (240, 200, 170, 90), "day": (240, 236, 226, 120)}[time]
    for _ in range(18 if time == "storm" else 10):
        cx, cy = rng.uniform(0, W), rng.uniform(H * 0.08, H * horizon * 0.75)
        w = rng.uniform(0.08, 0.2) * W
        cd.ellipse([cx - w, cy - H * 0.022, cx + w, cy + H * 0.022], fill=shade)
    img.alpha_composite(soft(clouds, H * 0.016))
    return img


def hills(W, H, base, parts, color, seed, snow=False):
    ys = ridge(W + 4, base * H, [(a * H, f / W * 1920) for a, f in parts], seed)
    img = silhouette(W, H, ys, color)
    if snow:  # snow-covered ground: pale, with a brighter crest along the skyline
        a = np.asarray(img).astype(np.float32)
        yy = np.arange(H)[:, None]
        crest = np.clip(1 - (yy - ys[None, :W]) / (H * 0.03), 0, 1)
        ground = np.array([150, 154, 166], np.float32) * (0.75 + 0.25 * crest[..., None])
        mask = a[..., 3:] > 0
        a[..., :3] = np.where(mask, ground * (0.55 + 0.45 * (np.mean(color[:3]) / 70)), a[..., :3])
        img = Image.fromarray(a.clip(0, 255).astype(np.uint8), "RGBA")
    return img, ys


def tree_line(W, H, ys, rng, count, height, color_scale=1.0):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for _ in range(count):
        x = int(rng.uniform(0, W))
        t, _ = make_prop("tree", height * rng.uniform(0.7, 1.2), seed=int(rng.integers(1e6)))
        img.alpha_composite(t, (x - t.width // 2, int(ys[min(x, W - 1)] - t.height + height * 0.05)))
    return img


@scene_set("hills")
def hills_set(W, H, rng, time="night", snow=False, trees=True):
    layers = [{"key": "sky", "image": sky(W, H, time, rng), "depth": 0.25, "paper": False, "grade": 0.75}]
    far, fys = hills(W, H, 0.66, [(0.03, 0.004), (0.012, 0.011)], (70, 70, 80, 255), int(rng.integers(1e6)), snow)
    if trees:
        far.alpha_composite(tree_line(W, H, fys, rng, 14, H * 0.08))
    layers.append({"key": "far", "image": far, "depth": 0.5, "paper": True})
    near, _ = hills(W, H, 0.84, [(0.018, 0.006), (0.006, 0.03)], (30, 28, 30, 255), int(rng.integers(1e6)), snow)
    layers.append({"key": "near", "image": near, "depth": 1.0, "paper": True})
    return {"layers": layers, "ambient": SKIES[time][2], "weather": "snow" if snow else None}


@scene_set("marsh")
def marsh_set(W, H, rng, time="dusk", mist=True):
    layers = [{"key": "sky", "image": sky(W, H, time, rng, horizon=0.62), "depth": 0.25, "paper": False,
               "grade": 0.75}]
    # low distant land with a lone hill (Athelney rising out of the levels)
    ys = ridge(W + 4, 0.6 * H, [(0.006 * H, 0.004 / W * 1920)], int(rng.integers(1e6)))
    ys -= 0.07 * H * np.exp(-((np.arange(W + 4) - W * 0.62) / (W * 0.08)) ** 2)
    land = silhouette(W, H, ys, (60, 62, 66, 255))
    land.alpha_composite(tree_line(W, H, ys, rng, 10, H * 0.05))
    layers.append({"key": "far", "image": land, "depth": 0.45, "paper": True})
    # water: reflective bands
    top, bottom, _ = SKIES[time]
    water = gradient(W, int(H * 0.42), bottom, (20, 22, 30), gamma=0.7)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    wimg = to_img(water)
    d = ImageDraw.Draw(wimg)
    for _ in range(140):
        y = rng.uniform(0, H * 0.42) ** 1.0
        x = rng.uniform(0, W)
        w = rng.uniform(0.01, 0.06) * W
        b = int(150 + 80 * (1 - y / (H * 0.42)))
        d.line([(x, y), (x + w, y)], fill=(b, b - 10, b - 30, 120), width=max(1, int(H / 900)))
    img.paste(wimg, (0, int(H * 0.6)))
    layers.append({"key": "water", "image": img, "depth": 0.7, "paper": False})
    if mist:
        m = Image.new("RGBA", (int(W * 1.6), H), (0, 0, 0, 0))
        md = ImageDraw.Draw(m)
        for _ in range(12):
            cx, cy = rng.uniform(0, W * 1.6), rng.uniform(0.55, 0.8) * H
            md.ellipse([cx - W * 0.25, cy - H * 0.025, cx + W * 0.25, cy + H * 0.025], fill=(220, 220, 228, 60))
        layers.append({"key": "mist", "image": soft(m, H * 0.02), "depth": 0.8, "paper": False, "grade": 0.3,
                       "drift": 0.004})
    r, _ = make_prop("reeds", H * 0.36, seed=int(rng.integers(1e6)), count=70, width=W / (H * 0.36))
    front = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    front.alpha_composite(r, (0, H - r.height + int(H * 0.04)))
    layers.append({"key": "reeds", "image": front, "depth": 1.15, "paper": False, "grade": 0.6})
    return {"layers": layers, "ambient": SKIES[time][2] - 0.04, "weather": None}


@scene_set("coast")
def coast_set(W, H, rng, time="dawn"):
    layers = [{"key": "sky", "image": sky(W, H, time, rng, horizon=0.58), "depth": 0.25, "paper": False,
               "grade": 0.75}]
    top, bottom, _ = SKIES[time]
    sea = to_img(gradient(W, int(H * 0.45), bottom, (24, 30, 44), gamma=0.6))
    d = ImageDraw.Draw(sea)
    for i in range(60):
        y = (i / 60) ** 1.6 * H * 0.45
        x = rng.uniform(-0.1, 1) * W
        d.arc([x, y, x + W * 0.05, y + H * 0.02], 200, 340, fill=(200, 200, 210, 120), width=max(1, int(H / 700)))
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    img.paste(sea, (0, int(H * 0.56)))
    layers.append({"key": "sea", "image": img, "depth": 0.6, "paper": False})
    cliff = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(cliff).polygon([(0, H * 0.48), (W * 0.12, H * 0.5), (W * 0.2, H * 0.62), (W * 0.24, H),
                                   (0, H)], fill=(60, 58, 60, 255))
    layers.append({"key": "cliff", "image": cliff, "depth": 0.9, "paper": True})
    waves = Image.new("RGBA", (int(W * 1.4), H), (0, 0, 0, 0))
    wd = ImageDraw.Draw(waves)
    for k in range(int(W * 1.4 / (W * 0.06)) + 1):
        x = k * W * 0.06
        wd.pieslice([x, H * 0.86, x + W * 0.08, H * 0.96], 180, 360, fill=(36, 44, 60, 255))
    wd.rectangle([0, H * 0.91, W * 1.4, H], fill=(36, 44, 60, 255))
    layers.append({"key": "waves", "image": waves, "depth": 1.1, "paper": True, "drift": -0.006})
    return {"layers": layers, "ambient": SKIES[time][2], "weather": None}


@scene_set("hall")
def hall_set(W, H, rng, time="night"):
    arr = np.full((H, W, 3), 92, np.float32) + noise(W, H, H / 25, int(rng.integers(1e6)))[..., None] * 40
    img = to_img(arr)
    d = ImageDraw.Draw(img)
    course = H / 15
    for row in range(16):  # timber-and-stone wall courses
        y = row * course
        d.line([(0, y), (W, y)], fill=(54, 54, 56, 255), width=max(2, int(H / 360)))
        for x in np.arange(-(row % 2) * course, W, course * 2):
            d.line([(x, y), (x, y + course)], fill=(54, 54, 56, 255), width=max(2, int(H / 360)))
    for wx in (W * 0.2, W * 0.8):
        d.rectangle([wx - W * 0.045, H * 0.22, wx + W * 0.045, H * 0.6], fill=(140, 150, 180, 255))
        d.pieslice([wx - W * 0.045, H * 0.22 - W * 0.045, wx + W * 0.045, H * 0.22 + W * 0.045], 180, 360,
                   fill=(140, 150, 180, 255))
        d.line([(wx, H * 0.15), (wx, H * 0.6)], fill=(30, 30, 34, 255), width=int(W / 200))
    for x in np.linspace(0, W, 7):  # roof posts
        d.rectangle([x - W * 0.012, 0, x + W * 0.012, H], fill=(56, 38, 26, 255))
    d.rectangle([0, H * 0.86, W, H], fill=(46, 40, 38, 255))
    return {"layers": [{"key": "wall", "image": img, "depth": 0.6, "paper": False}], "ambient": 0.46,
            "weather": None}


@scene_set("hut_interior")
def hut_interior(W, H, rng):
    arr = np.full((H, W, 3), 78, np.float32) + noise(W, H, H / 30, int(rng.integers(1e6)))[..., None] * 30
    img = to_img(arr)
    d = ImageDraw.Draw(img)
    step = H / 22
    for i in range(int(H / step)):  # woven wattle
        y = i * step
        for x in np.arange(0, W, step * 2):
            off = step * 0.5 if i % 2 else 0
            d.arc([x + off, y, x + off + step * 2, y + step], 180, 360, fill=(58, 44, 30, 255),
                  width=max(2, int(H / 300)))
    for x in (W * 0.15, W * 0.85):
        d.rectangle([x - W * 0.015, 0, x + W * 0.015, H], fill=(48, 34, 22, 255))
    d.rectangle([0, H * 0.84, W, H], fill=(40, 34, 28, 255))
    return {"layers": [{"key": "wall", "image": img, "depth": 0.6, "paper": False}], "ambient": 0.46,
            "weather": None}


@scene_set("void")
def void_set(W, H, rng, tone="dark"):
    """An empty stage: a plain cloth backdrop for icons, objects and dramatic beats."""
    base = {"dark": (30, 28, 34), "parchment": (200, 184, 150), "blood": (70, 20, 22)}[tone]
    arr = np.broadcast_to(np.array(base, np.float32), (H, W, 3)).copy()
    arr += noise(W, H, H / 5, int(rng.integers(1e6)))[..., None] * 40
    yy, xx = np.mgrid[0:H, 0:W]
    v = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    arr *= (1 - 0.35 * np.clip(v - 0.4, 0, 1))[..., None]
    for x in np.linspace(0, W, 24):  # cloth folds
        arr[:, int(x):int(x) + max(2, W // 300)] *= 0.92
    return {"layers": [{"key": "cloth", "image": to_img(arr), "depth": 0.5, "paper": False,
                        "grade": 0.5 if tone == "parchment" else 0.85}],
            "ambient": 0.46, "weather": None}

