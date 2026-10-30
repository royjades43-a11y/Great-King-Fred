"""Channel branding in the same stained glass as the videos.

    python -m lantern.brand avatar  -o brand/avatar.png       # 800x800 profile picture
    python -m lantern.brand banner  -o brand/banner.png       # 2560x1440 channel banner
    python -m lantern.brand thumb episodes/bible/14-samson --at 268.3 --text "HE DIDN'T|KNOW" --number 14 \
        -o brand/thumb_samson.png                              # 1280x720 thumbnail from a moment in the episode
"""
import argparse
import math
import os
import subprocess

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from .art.glass import AMBER, EMERALD, GOLD, RUBY, SKY, WHITE, WOOD, GlassCanvas
from .art.glass_stories import TEAL, VIOLET
from .stage import load_font

NAME = "THE GREAT WINDOW"
TAGLINE = "Every Bible story is one pane of a single window"
GOLD_TEXT = (242, 207, 110)
INK = (24, 18, 16)


def glow(img, threshold=170, radius=0.02, amount=0.8):
    """Light bleeding through the brightest glass (the same bloom the videos use)."""
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    hi = np.clip(a - threshold, 0, None)
    r = max(2, int(radius * img.width))
    g = Image.fromarray(hi.clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    out = np.clip(a + np.asarray(g).astype(np.float32) * amount, 0, 255).astype(np.uint8)
    res = Image.fromarray(out)
    if img.mode == "RGBA":
        res.putalpha(img.getchannel("A"))
    return res


def stone(w, h, seed=5):
    rng = np.random.default_rng(seed)
    small = rng.normal(0, 1, (max(2, h // 14), max(2, w // 14)))
    n = Image.fromarray(((small + 3) * 42).clip(0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    n = np.asarray(n).astype(np.float32) / 255 - 0.5
    base = np.array([66, 60, 54], np.float32)
    img = Image.fromarray((base[None, None] * (1 + n[..., None] * 0.35)).clip(0, 255).astype(np.uint8))
    d = ImageDraw.Draw(img)
    course = max(24, h // 14)
    for r, y in enumerate(range(0, h, course)):
        d.line([(0, y), (w, y)], fill=(38, 34, 30), width=2)
        for x in range(-(r % 2) * course, w, course * 2):
            d.line([(x, y), (x, y + course)], fill=(38, 34, 30), width=2)
    return img.convert("RGBA")


def rose(size, seed=3, centre_lit=True):
    """The channel mark: a rose window whose centre is lit - the light every story points to."""
    g = GlassCanvas(size, size, seed=seed)
    c = 0.5
    g.circle(c, c, 0.5, (40, 34, 30))
    g.circle(c, c, 0.47, (30, 44, 110), jitter=0.12, tiles=14)
    jewels = [RUBY, EMERALD, SKY, GOLD, VIOLET, TEAL, AMBER, (52, 70, 140)]
    for i in range(8):  # eight petals
        a = -math.pi / 2 + i / 8 * 2 * math.pi
        g.circle(c + math.cos(a) * 0.3, c + math.sin(a) * 0.3, 0.13, jewels[i], cuts=2)
    for i in range(8):  # small lights between them
        a = -math.pi / 2 + (i + 0.5) / 8 * 2 * math.pi
        g.circle(c + math.cos(a) * 0.38, c + math.sin(a) * 0.38, 0.045, WHITE)
    g.circle(c, c, 0.17, (60, 48, 30))
    g.circle(c, c, 0.155, (240, 196, 90) if centre_lit else (96, 80, 40))
    if centre_lit:  # a cross of light at the centre: the light every story points to
        g.poly([(c - 0.028, c - 0.12), (c + 0.028, c - 0.12), (c + 0.028, c + 0.12), (c - 0.028, c + 0.12)],
               (255, 250, 228))
        g.poly([(c - 0.09, c - 0.05), (c + 0.09, c - 0.05), (c + 0.09, c + 0.006), (c - 0.09, c + 0.006)],
               (255, 250, 228))
    img, _ = g.finish(lead=0.012, crop=False)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    img.putalpha(mask)
    return img


def avatar(path, size=800):
    big = 1600
    bg = stone(big, big)
    r = rose(int(big * 0.9))
    bg.alpha_composite(r, ((big - r.width) // 2, (big - r.height) // 2))
    img = glow(bg, 160, 0.03, 0.9).resize((size, size), Image.LANCZOS)
    img.save(path)
    return path


def symbol(kind, size, seed):
    """A small glass emblem for a lancet: ark, tablets, star, crown, fish, dove."""
    g = GlassCanvas(size, size, seed=seed)
    g.circle(0.5, 0.5, 0.48, (26, 34, 80), tiles=6)
    if kind == "ark":
        g.poly([(0.15, 0.55), (0.85, 0.55), (0.75, 0.72), (0.25, 0.72)], WOOD, cuts=2)
        g.poly([(0.3, 0.55), (0.3, 0.38), (0.7, 0.38), (0.7, 0.55)], AMBER)
        g.poly([(0.25, 0.4), (0.5, 0.26), (0.75, 0.4)], RUBY)
        g.wave_band(0.74, 0.86, 0.02, 2, SKY, x0=0.08, x1=0.92)
    elif kind == "tablets":
        for x in (0.3, 0.52):
            g.poly([(x, 0.78), (x, 0.36), (x + 0.09, 0.26), (x + 0.18, 0.36), (x + 0.18, 0.78)], (200, 200, 210))
    elif kind == "star":
        pts = []
        for i in range(16):
            a = -math.pi / 2 + i / 16 * 2 * math.pi
            r = 0.36 if i % 2 == 0 else 0.15
            pts.append((0.5 + math.cos(a) * r, 0.5 + math.sin(a) * r))
        g.poly(pts, GOLD, cuts=3)
    elif kind == "crown":
        g.poly([(0.22, 0.68), (0.22, 0.4), (0.36, 0.52), (0.5, 0.32), (0.64, 0.52), (0.78, 0.4), (0.78, 0.68)],
               GOLD, cuts=2)
        g.circle(0.5, 0.6, 0.04, RUBY)
    elif kind == "fish":
        g.poly([(0.18, 0.5), (0.4, 0.36), (0.66, 0.4), (0.8, 0.5), (0.66, 0.6), (0.4, 0.64)], SKY, cuts=2)
        g.poly([(0.78, 0.5), (0.92, 0.38), (0.92, 0.62)], SKY)
    elif kind == "dove":
        g.poly([(0.2, 0.55), (0.45, 0.48), (0.7, 0.3), (0.62, 0.5), (0.82, 0.52), (0.6, 0.62), (0.3, 0.62)], WHITE,
               cuts=2)
    img, _ = g.finish(lead=0.03, crop=False)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    img.putalpha(mask)
    return img


def lancet(w, h, medallion, seed):
    """A tall pointed window filled with glass, with a medallion in the middle."""
    g = GlassCanvas(w, h, seed=seed)
    aw = w / h
    pts = [(0, 1), (0, 0.32)]
    for i in range(21):  # pointed arch
        u = i / 20
        x = aw * u
        y = 0.02 + 0.3 * (1 - math.sqrt(1 - abs(2 * u - 1)))
        pts.append((x, y))
    pts += [(aw, 0.32), (aw, 1)]
    g.poly(pts, (40, 52, 120), jitter=0.12, tiles=10)
    img, _ = g.finish(lead=0.012, crop=False)
    mask = Image.new("L", img.size, 0)
    ImageDraw.Draw(mask).polygon([(x * h, y * h) for x, y in pts], fill=255)
    img.putalpha(mask)
    m = medallion.resize((int(w * 0.86), int(w * 0.86)), Image.LANCZOS)
    img.alpha_composite(m, ((w - m.width) // 2, int(h * 0.5 - m.height / 2)))
    d = ImageDraw.Draw(img)
    d.polygon([(x * h, y * h) for x, y in pts], outline=(150, 138, 118, 255), width=max(3, w // 30))
    return img


def banner(path, panes_dir="episodes/bible/panes"):
    W, H = 2560, 1440
    img = stone(W, H)
    shade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shade).rectangle([0, 470, W, 970], fill=(10, 8, 8, 120))
    img.alpha_composite(shade.filter(ImageFilter.GaussianBlur(60)))
    # seven lancets across the safe area (1546x423, centred), the rose in the middle
    meds = []
    order = ["ark", "tablets", "17", "rose", "14", "star", "fish"]
    for i, k in enumerate(order):
        if k == "rose":
            meds.append(rose(600, seed=9))
        elif k.isdigit() and os.path.exists(os.path.join(panes_dir, f"{k}.png")):
            meds.append(Image.open(os.path.join(panes_dir, f"{k}.png")).convert("RGBA"))
        else:
            meds.append(symbol(k if not k.isdigit() else "crown", 500, seed=i))
    # everything sits inside YouTube's safe area (1546x423 in the middle), which every device shows
    sx0, sy0 = (W - 1546) // 2, (H - 423) // 2
    lw, lh, gap = 104, 300, 20
    x = sx0 + 24
    for i, m in enumerate(meds):
        big = i == 3
        w_, h_ = (int(lw * 1.4), int(lh * 1.1)) if big else (lw, lh)
        lan = lancet(w_, h_, m, seed=20 + i)
        img.alpha_composite(lan, (x, sy0 + (423 - h_) // 2 + (0 if big else 10)))
        x += w_ + gap
    f_name = load_font("bold", 84)
    f_tag = load_font("italic", 36)
    tx = x + 40
    d = ImageDraw.Draw(img)
    for line_i, word in enumerate(("THE GREAT", "WINDOW")):
        y = sy0 + 70 + line_i * 94
        d.text((tx + 3, y + 4), word, font=f_name, fill=(0, 0, 0, 200))
        d.text((tx, y), word, font=f_name, fill=GOLD_TEXT + (255,))
    d.line([(tx, sy0 + 272), (tx + 470, sy0 + 272)], fill=GOLD_TEXT + (255,), width=3)
    for j, line in enumerate(("Every Bible story is one pane", "of a single window.")):
        d.text((tx, sy0 + 288 + j * 44), line, font=f_tag, fill=(232, 222, 200, 255))
    assert tx + 480 <= sx0 + 1546, "banner text runs out of the safe area"
    out = glow(img, 175, 0.012, 0.7)
    out.convert("RGB").save(path, quality=95)
    return path


def frame_at(video, t, out_size=(1280, 720)):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-ss", str(t), "-i", video, "-frames:v", "1",
                          "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, check=True).stdout
    import io
    return Image.open(io.BytesIO(raw)).convert("RGBA").resize(out_size, Image.LANCZOS)


def number_roundel(n, size=150):
    """The story's number in a small glowing glass medallion: viewers learn to collect them."""
    r = rose(size * 2, seed=n, centre_lit=True)
    d = ImageDraw.Draw(r)
    f = load_font("bold", int(size * 0.62))
    text = str(n)
    tw = d.textlength(text, font=f)
    cx, cy = size, size
    d.ellipse([cx - size * 0.42, cy - size * 0.42, cx + size * 0.42, cy + size * 0.42], fill=(26, 20, 16, 235),
              outline=GOLD_TEXT + (255,), width=6)
    d.text((cx - tw / 2, cy - size * 0.4), text, font=f, fill=GOLD_TEXT + (255,))
    return r.resize((size, size), Image.LANCZOS)


def thumbnail(video, t, text, path, number=None, shift=0.12, zoom=1.12, focus=None):
    """Big frozen moment on the right, two to three huge gold words on the left, story number roundel.
    `focus` (x, y in the frame) with `zoom` pushes in on the subject and places it right of centre."""
    W, H = 1280, 720
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    if focus:
        fr = frame_at(video, t, (1920, 1080))
        cw, ch = 1920 / zoom, 1080 / zoom
        x0 = min(max(focus[0] * 1920 - cw * 0.64, 0), 1920 - cw)   # subject sits at 64% across
        y0 = min(max(focus[1] * 1080 - ch * 0.5, 0), 1080 - ch)
        canvas.alpha_composite(fr.crop((int(x0), int(y0), int(x0 + cw), int(y0 + ch))).resize((W, H), Image.LANCZOS))
    else:
        fr = frame_at(video, t, (int(W * zoom), int(H * zoom)))
        ox = int(-(fr.width - W) / 2 + W * shift)
        canvas.alpha_composite(fr, (ox, -(fr.height - H) // 2))
    a = np.asarray(canvas).astype(np.float32)
    xs = np.linspace(0, 1, W)[None, :, None]
    a[..., :3] *= np.clip(0.25 + xs * 1.4, 0.25, 1.0)          # darken the left for the words
    a[..., :3] = np.clip((a[..., :3] - 128) * 1.15 + 128 + 6, 0, 255)  # a touch more contrast
    canvas = Image.fromarray(a.astype(np.uint8), "RGBA")
    d = ImageDraw.Draw(canvas)
    lines = text.split("|")
    size = 150 if max(len(l) for l in lines) <= 8 else 118
    f = load_font("bold", size)
    y = H / 2 - len(lines) * size * 0.56
    for line in lines:
        for dx, dy in ((-5, 0), (5, 0), (0, -5), (0, 5), (-4, -4), (4, 4), (-4, 4), (4, -4)):
            d.text((60 + dx, y + dy), line, font=f, fill=INK + (255,))
        d.text((60, y), line, font=f, fill=GOLD_TEXT + (255,))
        y += size * 1.08
    if number is not None:
        canvas.alpha_composite(number_roundel(number, 132), (W - 132 - 34, 30))
    glow(canvas, 200, 0.01, 0.5).convert("RGB").save(path, quality=95)
    return path


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("what", choices=["avatar", "banner", "thumb"])
    ap.add_argument("episode", nargs="?")
    ap.add_argument("--at", type=float, help="moment in the episode (seconds)")
    ap.add_argument("--text", default="", help="thumbnail words; | breaks the line")
    ap.add_argument("--number", type=int)
    ap.add_argument("--shift", type=float, default=0.12)
    ap.add_argument("--zoom", type=float, default=1.12)
    ap.add_argument("--focus", help="x,y of the subject in the frame (0-1), to push in on it")
    ap.add_argument("-o", "--out", required=True)
    a = ap.parse_args(argv)
    os.makedirs(os.path.dirname(os.path.abspath(a.out)), exist_ok=True)
    if a.what == "avatar":
        avatar(a.out)
    elif a.what == "banner":
        banner(a.out)
    else:
        video = os.path.join(a.episode, "build", "episode.mp4")
        focus = [float(v) for v in a.focus.split(",")] if a.focus else None
        thumbnail(video, a.at, a.text, a.out, a.number, a.shift, a.zoom, focus)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
