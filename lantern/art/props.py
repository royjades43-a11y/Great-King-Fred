"""Cut-paper props: people, warbands, ships, buildings, nature and objects.

Every prop is `fn(h, rng, **params) -> (image, meta)` where `h` is the pixel height to draw
at and `meta` maps names (e.g. "smoke", "flame1", "head") to (x, y) fractions of the
returned image, so the director can hang effects and spotlights on them.
"""
import math

import numpy as np

from .base import (BLUE, DARK, FIRE, GOLD, INK, PAPER, RED, STONE, THATCH, WOOD, Canvas,
                   PROPS, lerp_col, prop)


def finish(cv, meta=None):
    """Downsample, crop to the drawn shape, and convert unit-space meta points to fractions."""
    img = cv.done()
    box = img.getchannel("A").getbbox() or (0, 0, img.width, img.height)
    x0, y0, x1, y1 = box
    img = img.crop(box)
    out = {}
    for k, (ux, uy) in (meta or {}).items():
        px, py = ux * cv.h, uy * cv.h
        out[k] = ((px - x0) / max(1, x1 - x0), (py - y0) / max(1, y1 - y0))
    return img, out


# ----------------------------------------------------------------------------- people
SHIELDS = {
    "dane": [(RED, PAPER), (PAPER, INK), (RED, INK), ((180, 150, 90, 255), RED)],
    "saxon": [(BLUE, GOLD), (PAPER, BLUE), (GOLD, RED), (BLUE, PAPER)],
}


def _shield(cv, cx, cy, r, colors, pattern=0):
    a, b = colors
    cv.circle(cx, cy, r, a)
    if pattern % 3 == 0:  # quarters
        cv.pie(cx, cy, r, 0, 90, b)
        cv.pie(cx, cy, r, 180, 270, b)
    elif pattern % 3 == 1:  # spiral-ish bands
        for i in range(4):
            cv.pie(cx, cy, r, i * 90 + 20, i * 90 + 50, b)
    else:  # ring
        cv.circle(cx, cy, r * 0.7, b)
        cv.circle(cx, cy, r * 0.5, a)
    cv.circle(cx, cy, r, None, outline=INK, width=r * 0.09)
    cv.circle(cx, cy, r * 0.22, (120, 120, 126, 255), outline=INK, width=r * 0.05)


def _spear(cv, x0, y0, x1, y1, w=0.012):
    cv.line([(x0, y0), (x1, y1)], WOOD, w)
    dx, dy = x1 - x0, y1 - y0
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    tip = (x1 + ux * 0.09, y1 + uy * 0.09)
    side = (-uy * 0.022, ux * 0.022)
    mid = (x1 + ux * 0.03, y1 + uy * 0.03)
    cv.poly([(x1, y1), (mid[0] + side[0], mid[1] + side[1]), tip, (mid[0] - side[0], mid[1] - side[1])],
            (150, 150, 156, 255))


def person(cv, cx, rng, kind="warrior", side="saxon", hold="spear", crown=False, hood=False,
           robe=False, cloak=False, shield=None, lean=0.0, scale=1.0, color=INK):
    """Draw one standing figure, feet at y=1.0, roughly 1.0 tall (unit = canvas height)."""
    s = scale
    top = 1.0 - s

    def Y(y):
        return top + y * s

    def P(x, y):  # figure space -> canvas units; `lean` tilts the figure about its feet
        return (cx + x * s + lean * (1 - y) * s, Y(y))

    body = color
    if cloak or robe or kind in ("king", "woman", "monk"):
        hem = 1.0 if (robe or kind in ("woman", "monk")) else 0.86
        flare = 0.2 if cloak else 0.15
        cv.poly([P(-0.1, 0.2), P(0.1, 0.2), P(flare, hem), P(-flare, hem)], body)
    # torso / tunic
    cv.poly([P(-0.105, 0.21), P(0.105, 0.21), P(0.095, 0.5), P(0.13, 0.76), P(-0.13, 0.76), P(-0.095, 0.5)], body)
    if not (robe or kind in ("woman", "monk")):
        # legs
        cv.poly([P(-0.075, 0.74), P(-0.01, 0.74), P(-0.025, 0.985), P(-0.09, 0.985)], body)
        cv.poly([P(0.01, 0.74), P(0.075, 0.74), P(0.09, 0.985), P(0.025, 0.985)], body)
        cv.poly([P(-0.1, 0.97), P(-0.02, 0.97), P(-0.02, 1.0), P(-0.11, 1.0)], body)
        cv.poly([P(0.02, 0.97), P(0.1, 0.97), P(0.11, 1.0), P(0.02, 1.0)], body)
    if kind == "warrior":  # belt
        cv.poly([P(-0.1, 0.49), P(0.1, 0.49), P(0.1, 0.52), P(-0.1, 0.52)], (60, 50, 44, 255))
    # neck + head
    cv.poly([P(-0.03, 0.17), P(0.03, 0.17), P(0.035, 0.22), P(-0.035, 0.22)], body)
    hx, hy = P(0, 0.115)
    cv.circle(hx, hy, 0.062 * s, body)
    # arms
    if hold in ("spear", "staff", "axe", "torch"):
        cv.poly([P(0.09, 0.22), P(0.125, 0.23), P(0.2, 0.42), P(0.17, 0.45)], body)
        cv.circle(*P(0.19, 0.44), 0.025 * s, body)
    else:
        cv.poly([P(0.095, 0.22), P(0.125, 0.24), P(0.13, 0.55), P(0.1, 0.55)], body)
    cv.poly([P(-0.095, 0.22), P(-0.125, 0.24), P(-0.13, 0.55), P(-0.1, 0.55)], body)

    meta = {"head": (hx, hy), "hand": P(0.19, 0.44)}
    # headgear
    if hood:
        cv.poly([P(-0.085, 0.2), P(-0.08, 0.08), P(-0.02, 0.03), P(0.06, 0.035), P(0.085, 0.1), P(0.08, 0.2)], body)
    if crown:
        cv.poly([P(-0.065, 0.085), P(-0.07, 0.02), P(-0.04, 0.05), P(-0.02, 0.0), P(0.0, 0.045), P(0.02, 0.0),
                 P(0.04, 0.05), P(0.07, 0.02), P(0.065, 0.085)], GOLD)
    if kind == "warrior":
        if side == "dane":  # conical helmet with nasal
            cv.poly([P(-0.07, 0.11), P(0.0, 0.025), P(0.07, 0.11)], (110, 110, 118, 255))
            cv.poly([P(-0.008, 0.1), P(0.008, 0.1), P(0.006, 0.155), P(-0.006, 0.155)], (110, 110, 118, 255))
        else:  # rounded cap
            cv.pie(hx, hy + 0.005 * s, 0.07 * s, 180, 360, (110, 110, 118, 255))
    if kind == "woman":
        cv.poly([P(-0.08, 0.2), P(-0.075, 0.07), P(0.0, 0.035), P(0.075, 0.07), P(0.08, 0.2), P(0.0, 0.17)],
                (130, 122, 108, 255))
    # held items
    if hold == "spear":
        a, b = P(0.19, 0.9), P(0.24, -0.08)
        _spear(cv, a[0], a[1], b[0], b[1], 0.012 * s)
    elif hold == "staff":
        a, b = P(0.19, 0.99), P(0.2, 0.08)
        cv.line([a, b], WOOD, 0.014 * s)
        if crown:
            cv.circle(b[0], b[1], 0.022 * s, GOLD)
    elif hold == "axe":
        a, b = P(0.15, 0.6), P(0.24, 0.12)
        cv.line([a, b], WOOD, 0.014 * s)
        cv.poly([b, (b[0] + 0.07 * s, b[1] - 0.03 * s), (b[0] + 0.08 * s, b[1] + 0.07 * s),
                 (b[0] + 0.005 * s, b[1] + 0.05 * s)], (150, 150, 156, 255))
    elif hold == "torch":
        a, b = P(0.18, 0.55), P(0.22, 0.18)
        cv.line([a, b], WOOD, 0.016 * s)
        meta["flame"] = b
    if shield:
        sx, sy = P(-0.05, 0.47)
        _shield(cv, sx, sy, 0.15 * s, shield, int(rng.integers(0, 3)))
    if kind == "monk":
        cv.poly([P(-0.01, 0.28), P(0.01, 0.28), P(0.01, 0.42), P(-0.01, 0.42)], GOLD)
        cv.poly([P(-0.035, 0.31), P(0.035, 0.31), P(0.035, 0.33), P(-0.035, 0.33)], GOLD)
    return meta


@prop("king")
def king(h, rng, hooded=False, hold="staff"):
    cv = Canvas(h * 0.62, h)
    m = person(cv, 0.28, rng, kind="king", crown=not hooded, hood=hooded, cloak=True, robe=not hooded,
               hold=hold)
    return finish(cv, m)


@prop("warrior")
def warrior(h, rng, side="dane", hold="spear", shield=True):
    cv = Canvas(h * 0.62, h)
    sh = SHIELDS[side][int(rng.integers(0, 4))] if shield else None
    m = person(cv, 0.3, rng, side=side, hold=hold, shield=sh, lean=rng.uniform(-0.03, 0.03))
    return finish(cv, m)


@prop("woman")
def woman(h, rng, hold=None):
    cv = Canvas(h * 0.55, h)
    m = person(cv, 0.27, rng, kind="woman", hold=hold or "none")
    return finish(cv, m)


@prop("monk")
def monk(h, rng):
    cv = Canvas(h * 0.55, h)
    m = person(cv, 0.27, rng, kind="monk", hood=True, hold="none")
    return finish(cv, m)


@prop("warband")
def warband(h, rng, side="dane", count=7, rows=2, torches=0, banner=False):
    """A crowd of warriors in staggered rows; back rows are smaller and darker."""
    width = 0.32 * count / rows + 0.6
    cv = Canvas(h * width, h)
    meta = {}
    per_row = math.ceil(count / rows)
    torch_left = torches
    n = 0
    for r in range(rows - 1, -1, -1):
        sc = 1.0 - r * 0.14
        shade = lerp_col(INK, (70, 66, 72, 255), r * 0.45)
        for i in range(per_row):
            if n >= count:
                break
            cx = 0.3 + (i + (0.5 if r % 2 else 0)) * 0.32 + rng.uniform(-0.04, 0.04)
            hold = "torch" if torch_left > 0 and r == rows - 1 and i % 2 == 1 else \
                ["spear", "spear", "axe"][int(rng.integers(0, 3))]
            if hold == "torch":
                torch_left -= 1
            sh = SHIELDS[side][int(rng.integers(0, 4))] if hold != "torch" else None
            m = person(cv, cx, rng, side=side, hold=hold, shield=sh, scale=sc * rng.uniform(0.94, 1.0),
                       lean=rng.uniform(-0.04, 0.04), color=shade)
            if "flame" in m:
                meta[f"flame{len([k for k in meta if k.startswith('flame')]) + 1}"] = m["flame"]
            n += 1
    if banner:
        x = 0.3 + 0.32 * (per_row // 2)
        cv.line([(x, 1.0), (x, -0.05)], WOOD, 0.014)
        cv.poly([(x, -0.03), (x + 0.32, 0.0), (x + 0.26, 0.08), (x + 0.32, 0.16), (x, 0.17)],
                RED if side == "dane" else BLUE)
    meta["center"] = (width / 2, 0.45)
    return finish(cv, meta)


@prop("shieldwall")
def shieldwall(h, rng, side="saxon", count=8):
    """Front rank of overlapping shields with spears bristling over the top."""
    width = 0.27 * count + 0.4
    cv = Canvas(h * width, h)
    for i in range(count):  # men behind
        cx = 0.3 + i * 0.27
        person(cv, cx, rng, side=side, hold="spear", scale=0.98, color=INK, lean=rng.uniform(-0.02, 0.02))
    for i in range(count):  # the wall itself
        cx = 0.25 + i * 0.27
        _shield(cv, cx, 0.52, 0.17, SHIELDS[side][i % 4], i)
    return finish(cv, {"center": (width / 2, 0.5)})


# ----------------------------------------------------------------------------- ships
@prop("longship")
def longship(h, rng, sail=True, shields=True, oars=True):
    cv = Canvas(h * 2.5, h)
    hull = []
    for i in range(41):  # sheer line: sweeping up to prow and stern
        u = i / 40
        x = 0.15 + u * 2.2
        y = 0.72 - 0.22 * (abs(u - 0.5) * 2) ** 3.2
        hull.append((x, y))
    bottom = [(2.25, 0.8), (2.0, 0.9), (0.5, 0.9), (0.25, 0.8)]
    if oars:
        for i in range(11):
            x = 0.6 + i * 0.12
            cv.line([(x, 0.72), (x - 0.18, 1.0)], WOOD, 0.012)
    if sail:
        cv.line([(1.25, 0.72), (1.25, 0.02)], WOOD, 0.025)
        cv.line([(0.85, 0.08), (1.65, 0.08)], WOOD, 0.018)
        sail_pts = [(0.87, 0.08), (1.63, 0.08), (1.6, 0.52), (1.25, 0.56), (0.9, 0.52)]
        cv.poly(sail_pts, PAPER)
        for k in range(4):  # stripes
            x0, x1 = 0.87 + k * 0.19 + 0.05, 0.87 + k * 0.19 + 0.13
            cv.poly([(x0, 0.08), (x1, 0.08), (x1 - 0.005, 0.54), (x0 + 0.005, 0.54)], RED)
        cv.line([(0.9, 0.52), (0.55, 0.7)], (90, 80, 70, 255), 0.006)
        cv.line([(1.6, 0.52), (1.95, 0.7)], (90, 80, 70, 255), 0.006)
    cv.poly(hull + bottom, DARK)
    cv.line(hull, (110, 84, 56, 255), 0.02)
    # dragon prow and curled stern
    cv.poly([(2.33, 0.52), (2.38, 0.34), (2.47, 0.3), (2.5, 0.35), (2.43, 0.37), (2.4, 0.5), (2.3, 0.62)], DARK)
    cv.circle(2.46, 0.32, 0.012, FIRE)
    cv.poly([(0.17, 0.52), (0.1, 0.4), (0.14, 0.33), (0.2, 0.36), (0.16, 0.42), (0.24, 0.58)], DARK)
    if shields:
        for i in range(13):
            x = 0.48 + i * 0.12
            _shield(cv, x, 0.71, 0.05, SHIELDS["dane"][i % 4], i)
    return finish(cv, {"prow": (2.46, 0.32), "center": (1.25, 0.5)})


# ----------------------------------------------------------------------------- buildings
@prop("longhall")
def longhall(h, rng, lit=True, burning=False):
    cv = Canvas(h * 2.1, h)
    cv.rect(0.18, 0.55, 1.92, 1.0, WOOD)
    for i in range(30):
        x = 0.2 + i * 0.058
        cv.line([(x, 0.56), (x, 1.0)], (52, 34, 22, 255), 0.006)
    roof = [(0.04, 0.62), (0.52, 0.13), (1.05, 0.165), (1.58, 0.13), (2.06, 0.62)]
    cv.poly(roof, THATCH)
    for i in range(1, 9):  # thatch courses
        u = i / 9
        cv.line([(0.04 + 0.48 * u, 0.62 - 0.49 * u), (2.06 - 0.48 * u, 0.62 - 0.49 * u)],
                (96, 78, 48, 255), 0.006)
    for x, d in ((0.52, -1), (1.58, 1)):  # crossed gable finials
        cv.line([(x, 0.13), (x + d * 0.08, 0.02)], WOOD, 0.02)
        cv.line([(x, 0.13), (x - d * 0.04, 0.03)], WOOD, 0.02)
    cv.rect(0.98, 0.7, 1.12, 1.0, INK)
    cv.rect(0.96, 0.68, 1.14, 0.71, WOOD)
    meta = {"smoke": (1.05, 0.16), "door": (1.05, 0.85), "center": (1.05, 0.55)}
    if lit:
        for i, x in enumerate((0.45, 0.7, 1.4, 1.65)):
            cv.rect(x, 0.74, x + 0.06, 0.82, FIRE)
    if burning:
        for i, x in enumerate((0.4, 0.9, 1.3, 1.75)):
            meta[f"flame{i + 1}"] = (x, 0.3 + 0.12 * abs(x - 1.05))
    return finish(cv, meta)


@prop("hut")
def hut(h, rng, lit=True):
    cv = Canvas(h * 1.25, h)
    cv.ellipse(0.62, 0.98, 0.5, 0.04, DARK)
    cv.rect(0.2, 0.55, 1.05, 0.98, (96, 72, 46, 255))
    for i in range(12):  # wattle weave
        y = 0.58 + i * 0.034
        cv.line([(0.2, y), (1.05, y + (0.01 if i % 2 else -0.01))], (70, 52, 34, 255), 0.007)
    cv.poly([(0.08, 0.6), (0.62, 0.04), (1.17, 0.6)], THATCH)
    for i in range(1, 6):
        u = i / 6
        cv.line([(0.62 - 0.54 * u, 0.04 + 0.56 * u), (0.62 + 0.55 * u, 0.04 + 0.56 * u)],
                (96, 78, 48, 255), 0.006)
    cv.rect(0.52, 0.7, 0.7, 0.98, INK)
    if lit:
        cv.rect(0.54, 0.73, 0.68, 0.98, (200, 110, 40, 255))
    return finish(cv, {"smoke": (0.62, 0.06), "door": (0.61, 0.85), "center": (0.62, 0.55)})


@prop("church")
def church(h, rng):
    cv = Canvas(h * 1.6, h)
    cv.rect(0.1, 0.28, 0.5, 1.0, STONE)          # west tower
    cv.poly([(0.06, 0.3), (0.3, 0.12), (0.54, 0.3)], DARK)
    cv.rect(0.29, 0.0, 0.31, 0.14, WOOD)
    cv.rect(0.24, 0.04, 0.36, 0.06, WOOD)
    cv.rect(0.5, 0.52, 1.5, 1.0, STONE)          # nave
    cv.poly([(0.46, 0.54), (1.0, 0.36), (1.54, 0.54)], DARK)
    for x in (0.7, 1.0, 1.3):
        cv.rect(x - 0.03, 0.66, x + 0.03, 0.8, INK)
        cv.pie(x, 0.66, 0.03, 180, 360, INK)
    cv.rect(0.24, 0.8, 0.36, 1.0, INK)
    cv.pie(0.3, 0.8, 0.06, 180, 360, INK)
    return finish(cv, {"center": (0.8, 0.6), "door": (0.3, 0.9)})


@prop("burh")
def burh(h, rng):
    """A fortified hill town: earth bank, timber palisade, roofs and a church inside."""
    cv = Canvas(h * 2.6, h)
    cv.poly([(0.0, 1.0), (0.35, 0.62), (2.25, 0.62), (2.6, 1.0)], (60, 66, 52, 255))
    for i, x in enumerate([0.55, 0.85, 1.15, 1.55, 1.85]):
        w = 0.22 + 0.05 * (i % 2)
        cv.rect(x, 0.42, x + w, 0.62, WOOD)
        cv.poly([(x - 0.03, 0.44), (x + w / 2, 0.24), (x + w + 0.03, 0.44)], THATCH)
    cv.rect(1.3, 0.3, 1.42, 0.62, STONE)
    cv.poly([(1.27, 0.32), (1.36, 0.18), (1.45, 0.32)], DARK)
    for i in range(64):  # palisade stakes
        x = 0.3 + i * 0.032
        top = 0.5 + 0.02 * math.sin(i * 1.7)
        cv.poly([(x, 0.66), (x, top + 0.02), (x + 0.013, top - 0.01), (x + 0.026, top + 0.02), (x + 0.026, 0.66)],
                (78, 54, 34, 255))
    cv.rect(1.2, 0.5, 1.42, 0.66, INK)  # gate
    return finish(cv, {"center": (1.3, 0.5), "gate": (1.31, 0.6)})


# ----------------------------------------------------------------------------- nature
@prop("tree")
def tree(h, rng, leaves=False):
    cv = Canvas(h * 0.9, h)

    def branch(x, y, ang, length, width, depth):
        x2 = x + math.cos(ang) * length
        y2 = y - math.sin(ang) * length
        cv.line([(x, y), (x2, y2)], INK, width)
        if depth == 0:
            if leaves:
                cv.circle(x2, y2, 0.05, (40, 48, 40, 255))
            return
        for d in (-1, 1):
            branch(x2, y2, ang + d * rng.uniform(0.25, 0.6), length * rng.uniform(0.62, 0.78),
                   width * 0.68, depth - 1)
        if rng.random() < 0.4:
            branch(x2, y2, ang + rng.uniform(-0.15, 0.15), length * 0.7, width * 0.65, depth - 1)

    branch(0.45, 1.0, math.pi / 2 + rng.uniform(-0.08, 0.08), 0.3, 0.05, 6)
    return finish(cv, {"center": (0.45, 0.45)})


@prop("reeds")
def reeds(h, rng, count=40, width=3.0):
    cv = Canvas(h * width, h)
    for i in range(count):
        x = rng.uniform(0.05, width - 0.05)
        top = rng.uniform(0.05, 0.5)
        bend = rng.uniform(-0.15, 0.15)
        pts = [(x + bend * (1 - (y - top) / (1 - top)) ** 2, y) for y in [top + (1 - top) * k / 8 for k in range(9)]]
        cv.line(pts, INK, rng.uniform(0.008, 0.016))
        if rng.random() < 0.35:  # bulrush head
            cv.ellipse(pts[1][0], pts[1][1], 0.012, 0.045, (60, 40, 28, 255))
    return finish(cv, {})


@prop("standing_stone")
def standing_stone(h, rng):
    cv = Canvas(h * 0.6, h)
    cv.poly([(0.1, 1.0), (0.08, 0.5), (0.16, 0.12), (0.3, 0.02), (0.42, 0.1), (0.5, 0.55), (0.52, 1.0)], STONE)
    for _ in range(14):
        cv.circle(rng.uniform(0.15, 0.45), rng.uniform(0.15, 0.9), rng.uniform(0.01, 0.03), (120, 124, 100, 255))
    return finish(cv, {"center": (0.3, 0.45)})


# ----------------------------------------------------------------------------- objects
@prop("hearth")
def hearth(h, rng, cakes=3, burnt=False):
    """A fire pit with an iron griddle of flat loaves - for the cakes."""
    cv = Canvas(h * 1.8, h)
    for i in range(12):  # ring of stones
        a = i / 12 * math.pi * 2
        cv.ellipse(0.9 + math.cos(a) * 0.62, 0.86 + math.sin(a) * 0.1, 0.1, 0.05, STONE)
    cv.line([(0.45, 0.95), (0.55, 0.42)], INK, 0.025)
    cv.line([(1.35, 0.95), (1.25, 0.42)], INK, 0.025)
    cv.ellipse(0.9, 0.42, 0.52, 0.07, INK)  # griddle
    col = (40, 26, 18, 255) if burnt else (184, 140, 82, 255)
    for i in range(cakes):
        x = 0.9 + (i - (cakes - 1) / 2) * 0.3
        cv.ellipse(x, 0.36, 0.13, 0.045, col)
        cv.ellipse(x, 0.345, 0.11, 0.03, lerp_col(col, (255, 255, 255, 255), 0.12))
    meta = {"center": (0.9, 0.4), "smoke": (0.9, 0.3)}
    for i, x in enumerate((0.7, 0.9, 1.1)):
        meta[f"flame{i + 1}"] = (x, 0.82)
    return finish(cv, meta)


@prop("crown")
def crown(h, rng):
    cv = Canvas(h * 1.4, h)
    pts = [(0.1, 0.9), (0.1, 0.35), (0.35, 0.6), (0.7, 0.1), (1.05, 0.6), (1.3, 0.35), (1.3, 0.9)]
    cv.poly(pts, GOLD)
    cv.rect(0.1, 0.78, 1.3, 0.9, (170, 128, 50, 255))
    for x, c in ((0.4, RED), (0.7, BLUE), (1.0, RED)):
        cv.circle(x, 0.84, 0.045, c)
    for x, y in ((0.1, 0.35), (0.7, 0.1), (1.3, 0.35)):
        cv.circle(x, y, 0.05, GOLD)
    return finish(cv, {"center": (0.7, 0.6)})


@prop("cross")
def cross(h, rng):
    cv = Canvas(h * 0.6, h)
    cv.rect(0.26, 0.0, 0.34, 1.0, GOLD)
    cv.rect(0.08, 0.2, 0.52, 0.28, GOLD)
    cv.circle(0.3, 0.24, 0.1, None, outline=GOLD, width=0.03)
    return finish(cv, {"center": (0.3, 0.3)})


@prop("font")
def font(h, rng):
    """A stone baptismal font."""
    cv = Canvas(h * 1.0, h)
    cv.rect(0.38, 0.45, 0.62, 0.9, STONE)
    cv.rect(0.25, 0.88, 0.75, 1.0, STONE)
    cv.poly([(0.1, 0.18), (0.9, 0.18), (0.78, 0.48), (0.22, 0.48)], STONE)
    cv.ellipse(0.5, 0.18, 0.4, 0.06, (150, 160, 180, 255))
    for x in (0.3, 0.5, 0.7):
        cv.circle(x, 0.33, 0.05, None, outline=DARK, width=0.01)
    return finish(cv, {"center": (0.5, 0.3)})


@prop("book")
def book(h, rng):
    """An open manuscript with a red initial and ruled lines of script."""
    cv = Canvas(h * 1.5, h)
    cv.poly([(0.05, 0.12), (0.74, 0.05), (0.76, 0.95), (0.06, 0.98)], PAPER)
    cv.poly([(0.76, 0.05), (1.45, 0.12), (1.44, 0.98), (0.74, 0.95)], lerp_col(PAPER, (0, 0, 0, 255), 0.06))
    cv.line([(0.75, 0.05), (0.75, 0.96)], (150, 130, 100, 255), 0.01)
    cv.rect(0.14, 0.18, 0.3, 0.36, RED)
    cv.rect(0.17, 0.21, 0.27, 0.33, GOLD)
    for page, x0 in ((0, 0.14), (1, 0.86)):
        for i in range(14):
            y = 0.2 + i * 0.052
            start = 0.34 if (page == 0 and y < 0.38) else x0
            n = int(rng.integers(4, 9))
            x = start
            for _ in range(n):
                w = rng.uniform(0.03, 0.08)
                if x + w > x0 + 0.52:
                    break
                cv.rect(x, y, x + w, y + 0.012, (60, 44, 34, 255))
                x += w + 0.018
    return finish(cv, {"center": (0.75, 0.5)})


@prop("sword")
def sword(h, rng):
    cv = Canvas(h * 0.35, h)
    cv.poly([(0.16, 0.25), (0.19, 0.25), (0.19, 0.92), (0.175, 0.99), (0.16, 0.92)], (170, 172, 180, 255))
    cv.rect(0.05, 0.22, 0.3, 0.26, GOLD)
    cv.rect(0.155, 0.06, 0.195, 0.22, (60, 40, 30, 255))
    cv.ellipse(0.175, 0.05, 0.05, 0.035, GOLD)
    return finish(cv, {"center": (0.175, 0.5)})


@prop("campfire")
def campfire(h, rng):
    cv = Canvas(h * 1.6, h)
    for i in range(5):
        a = i / 5 * math.pi
        cv.line([(0.8 - math.cos(a) * 0.6, 0.98), (0.8 + math.cos(a) * 0.15, 0.7)], WOOD, 0.06)
    for i in range(9):
        a = i / 9 * math.pi * 2
        cv.ellipse(0.8 + math.cos(a) * 0.65, 0.95 + math.sin(a) * 0.04, 0.1, 0.05, STONE)
    return finish(cv, {"flame1": (0.7, 0.8), "flame2": (0.9, 0.78), "flame3": (0.8, 0.74), "smoke": (0.8, 0.5),
                       "center": (0.8, 0.7)})


def make_prop(name, h, seed=0, **params):
    if name not in PROPS:
        raise KeyError(f"unknown prop {name!r}; known: {', '.join(sorted(PROPS))}")
    return PROPS[name](int(h), np.random.default_rng(seed), **params)
