"""Image treatments: duotone grade, cut-paper cards, flames and ink lines."""
import math

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from .anim import clamp, smooth_noise


def hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def duotone(img, shadow, mid, highlight, amount=1.0):
    """Map luminance onto a shadow -> mid -> highlight ramp, mixed with the original."""
    rgba = np.asarray(img.convert("RGBA")).astype(np.float32)
    rgb, alpha = rgba[..., :3], rgba[..., 3:]
    lum = (rgb @ np.array([0.299, 0.587, 0.114], np.float32)) / 255.0
    s, m, h = (np.array(hex_rgb(c), np.float32) for c in (shadow, mid, highlight))
    lo = np.clip(lum * 2, 0, 1)[..., None]
    hi = np.clip(lum * 2 - 1, 0, 1)[..., None]
    toned = np.where(lum[..., None] < 0.5, s + (m - s) * lo, m + (h - m) * hi)
    out = rgb + (toned - rgb) * amount
    return Image.fromarray(np.concatenate([out, alpha], -1).clip(0, 255).astype(np.uint8), "RGBA")


def paper_card(img, edge_px=3, edge_color="#efe2c4", shadow_px=10, shadow_offset=(6, 8)):
    """Give a transparent cut-out a white cut edge and a soft drop shadow, like card on a stage.

    The result is padded so the shadow is never clipped; returns (card, pad).
    """
    pad = shadow_px * 2 + max(abs(shadow_offset[0]), abs(shadow_offset[1])) + edge_px
    w, h = img.size
    base = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    alpha = Image.new("L", base.size, 0)
    alpha.paste(img.getchannel("A"), (pad, pad))

    edge = alpha.filter(ImageFilter.MaxFilter(edge_px * 2 + 1)) if edge_px else alpha
    shadow = Image.new("L", base.size, 0)
    shadow.paste(edge, shadow_offset)
    shadow = shadow.filter(ImageFilter.GaussianBlur(shadow_px)).point(lambda v: int(v * 0.6))

    base.paste((10, 6, 4, 255), (0, 0), shadow)
    base.paste(hex_rgb(edge_color) + (255,), (0, 0), edge)
    base.alpha_composite(img, (pad, pad))
    return base, pad


def draw_flame(layer, x, y, size, t, seed=0.0):
    """Paint a flickering candle/torch flame onto an RGBA image at pixel (x, y) (flame base)."""
    flick = smooth_noise(t, seed, speed=9.0)
    sway = smooth_noise(t, seed + 3.3, speed=5.0)
    hgt = size * (1.0 + 0.18 * flick)
    wid = size * 0.42
    tip = (x + sway * size * 0.18, y - hgt)

    pad = int(size * 2.5)
    patch = Image.new("RGBA", (pad * 2, pad * 2), (0, 0, 0, 0))
    ox, oy = x - pad, y - pad
    d = ImageDraw.Draw(patch)

    def shape(scale):
        pts = []
        for i in range(24):
            a = math.pi * 2 * i / 24
            # teardrop: round bottom, pointed top
            px = math.sin(a) * wid * scale
            py = math.cos(a) * wid * scale
            if py < 0:  # upper half stretches toward the tip
                k = -py / (wid * scale)
                px *= (1 - k) ** 0.8
                py = -k * hgt * scale
                px += (tip[0] - x) * k
            pts.append((x + px - ox, y + py - wid * 0.3 * scale - oy))
        return pts

    glow = Image.new("RGBA", patch.size, (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse(
        [pad - size * 1.4, pad - hgt * 0.6 - size * 1.2, pad + size * 1.4, pad - hgt * 0.6 + size * 1.2],
        fill=(255, 150, 60, int(70 + 25 * flick)),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(size * 0.6))
    patch.alpha_composite(glow)
    d.polygon(shape(1.0), fill=(255, 120, 30, 230))
    d.polygon(shape(0.7), fill=(255, 190, 80, 245))
    d.polygon(shape(0.4), fill=(255, 245, 210, 255))
    patch = patch.filter(ImageFilter.GaussianBlur(max(0.6, size * 0.04)))
    layer.alpha_composite(patch, (int(ox), int(oy)))
    return 0.75 + 0.25 * flick  # light intensity for the scene's lighting pass


def draw_ink(layer, points, progress, color, width):
    """Draw a polyline revealed up to `progress` (0..1) of its length, with a glowing nib."""
    progress = clamp(progress)
    if progress <= 0 or len(points) < 2:
        return
    seg = [math.dist(a, b) for a, b in zip(points, points[1:])]
    total = sum(seg) or 1.0
    remaining = total * progress
    drawn = [points[0]]
    for (a, b), L in zip(zip(points, points[1:]), seg):
        if remaining >= L:
            drawn.append(b)
            remaining -= L
        else:
            u = remaining / L if L else 0
            drawn.append((a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u))
            break
    d = ImageDraw.Draw(layer)
    rgb = hex_rgb(color)
    d.line(drawn, fill=rgb + (235,), width=int(width), joint="curve")
    r = width * 0.6
    for p in drawn:
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill=rgb + (235,))
    if progress < 1:
        nx, ny = drawn[-1]
        g = width * 2.2
        d.ellipse([nx - g, ny - g, nx + g, ny + g], fill=(255, 220, 150, 120))


def draw_smoke(layer, x, y, size, t, seed=0.0, puffs=7, life=5.0):
    """Soft puffs rising and spreading from (x, y): chimneys, burning thatch, campfires."""
    pw, ph = int(size * 9), int(size * 12)
    patch = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    d = ImageDraw.Draw(patch)
    bx, by = pw / 2, ph - size * 0.8
    for i in range(puffs):
        age = (t / life + i / puffs + seed * 0.37) % 1.0
        drift = math.sin(age * 3 + seed + i) * size * 0.8 + age * size * 2.2
        cx, cy = bx + drift, by - age * size * 9.5
        r = size * (0.35 + age * 1.5)
        a = int(85 * math.sin(math.pi * age) ** 1.2)
        g = int(105 + 40 * age)
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(g, g - 4, g - 8, a))
    patch = patch.filter(ImageFilter.GaussianBlur(size * 0.35))
    layer.alpha_composite(patch, (int(x - bx), int(y - by)))
