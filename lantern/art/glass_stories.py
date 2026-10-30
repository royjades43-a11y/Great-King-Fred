"""Stained-glass figures and sets for individual Bible stories, plus the Great Window.

Everything uses the shared glass palette from glass.py so every story belongs to the same
church.
"""
import math
import os

import numpy as np
from PIL import Image, ImageDraw

from .base import prop, scene_set
from .glass import (AMBER, BRONZE, EMERALD, GOLD, HAIR, IRON, OCHRE, OLIVE, RUBY, SKIN, STONE, VIOLET, WHITE,
                    WOOD, GlassCanvas, _figure, _sky)

LEATHER = (150, 96, 52)
TEAL = (40, 120, 120)
NIGHT = (34, 40, 96)
TERRACOTTA = (176, 92, 56)


# ============================================================================ people
@prop("glass_samson")
def glass_samson(h, rng, pose="stand", hair="long", blind=False, bound=None):
    """Samson: broad, bearded, seven locks of hair (Judges 16:13, 19) unless shorn."""
    lying = pose == "sleep"
    top = 0.22 if pose in ("jawbone", "lift") else 0.0  # headroom for raised arms
    kk = 1 / (1 + top)
    g = GlassCanvas(h * (1.2 if pose == "push" else 0.8), h, seed=int(rng.integers(1e6)))
    cx = 0.6 if pose == "push" else 0.4
    b = 1.25  # broad shoulders

    def P(x, y):
        return (cx + x * b * kk, (y + top) * kk)

    if hair == "long":  # seven locks hanging behind the shoulders
        for i in range(7):
            x = -0.09 + i * 0.03
            g.band([P(x, 0.08), P(x * 1.3, 0.3), P(x * 1.15, 0.46)], 0.022, HAIR)
    # legs
    g.poly([P(-0.07, 0.7), P(-0.01, 0.7), P(-0.02, 0.97), P(-0.08, 0.97)], SKIN)
    g.poly([P(0.01, 0.7), P(0.07, 0.7), P(0.08, 0.97), P(0.02, 0.97)], SKIN)
    g.poly([P(-0.1, 0.95), P(-0.015, 0.95), P(-0.015, 1.0), P(-0.11, 1.0)], WOOD)
    g.poly([P(0.015, 0.95), P(0.1, 0.95), P(0.11, 1.0), P(0.015, 1.0)], WOOD)
    if pose == "chained":  # bronze fetters (16:21)
        g.band([P(-0.06, 0.92), P(0.06, 0.92)], 0.012, IRON)
    # tunic of leather, one shoulder bare
    g.poly([P(-0.12, 0.22), P(0.1, 0.2), P(0.13, 0.74), P(-0.14, 0.74)], LEATHER, cuts=3)
    g.poly([P(-0.12, 0.47), P(0.12, 0.47), P(0.12, 0.51), P(-0.12, 0.51)], (90, 56, 30))
    g.poly([P(0.02, 0.2), P(0.12, 0.2), P(0.12, 0.34)], SKIN)  # bare shoulder
    # arms by pose
    arms = {
        "stand": [[P(-0.12, 0.22), P(-0.16, 0.24), P(-0.17, 0.52), P(-0.13, 0.52)],
                  [P(0.12, 0.21), P(0.16, 0.23), P(0.17, 0.52), P(0.13, 0.52)]],
        "lift": [[P(-0.12, 0.22), P(-0.16, 0.22), P(-0.2, 0.02), P(-0.16, 0.0)],
                 [P(0.12, 0.21), P(0.16, 0.21), P(0.2, 0.02), P(0.16, 0.0)]],
        "push": [[P(-0.12, 0.22), P(-0.12, 0.28), P(-0.4, 0.3), P(-0.4, 0.24)],
                 [P(0.12, 0.21), P(0.12, 0.27), P(0.4, 0.29), P(0.4, 0.23)]],
        "chained": [[P(-0.12, 0.22), P(-0.16, 0.24), P(-0.04, 0.5), P(0.0, 0.47)],
                    [P(0.12, 0.21), P(0.16, 0.23), P(0.04, 0.5), P(0.0, 0.47)]],
        "sleep": [[P(-0.12, 0.22), P(-0.16, 0.24), P(-0.17, 0.52), P(-0.13, 0.52)],
                  [P(0.12, 0.21), P(0.16, 0.23), P(0.17, 0.52), P(0.13, 0.52)]],
        "jawbone": [[P(-0.12, 0.22), P(-0.16, 0.24), P(-0.2, 0.5), P(-0.15, 0.5)],
                    [P(0.12, 0.21), P(0.16, 0.21), P(0.26, 0.0), P(0.22, -0.02)]],
    }[pose]
    for a in arms:
        g.poly(a, SKIN)
    if pose == "jawbone":  # the jawbone of an ass, raised (15:15)
        g.poly([P(0.2, -0.02), P(0.27, -0.12), P(0.36, -0.15), P(0.34, -0.1), P(0.28, -0.07), P(0.25, 0.01)],
               (236, 226, 200), cuts=1)
        for j in range(4):  # teeth
            g.poly([P(0.28 + j * 0.02, -0.12 + j * 0.004), P(0.29 + j * 0.02, -0.17), P(0.3 + j * 0.02, -0.12)],
                   (236, 226, 200))
    if bound:  # bowstrings (green withs) or new ropes wound round him (16:7-12)
        col = {"withs": (96, 150, 70), "ropes": (196, 168, 112)}[bound]
        for y, tilt in ((0.27, 0.03), (0.36, -0.03), (0.45, 0.02), (0.6, -0.02), (0.82, 0.02)):
            g.band([P(-0.2, y + tilt), P(0.0, y - tilt * 0.5), P(0.2, y - tilt)], 0.016, col)
    if pose == "chained":
        g.band([P(-0.03, 0.49), P(0.03, 0.49)], 0.014, IRON)
        g.band([P(0.0, 0.5), P(0.02, 0.62), P(0.0, 0.75)], 0.008, IRON)
    # head
    g.poly([P(-0.03, 0.15), P(0.03, 0.15), P(0.035, 0.22), P(-0.035, 0.22)], SKIN)
    g.poly([P(-0.055, 0.11), P(0.055, 0.11), P(0.04, 0.2), P(0.0, 0.215), P(-0.04, 0.2)], HAIR)  # beard
    g.circle(*P(0, 0.1), 0.06, SKIN)
    g.poly([P(-0.06, 0.09), P(-0.05, 0.04), P(0.0, 0.025), P(0.05, 0.04), P(0.06, 0.09), P(0.0, 0.06)],
           HAIR)  # hairline
    if blind:  # his eyes were put out (16:21): a dark band across them
        g.poly([P(-0.062, 0.08), P(0.062, 0.08), P(0.062, 0.11), P(-0.062, 0.11)], (70, 30, 30))
    face = P(0, 0.1)
    meta = {"center": P(0, 0.42), "head": P(0, 0.1), "hair": P(0, 0.3), "eyes": P(0, 0.095), "face": face,
            "face_r": (face[0] + 0.06 * kk, face[1])}
    if pose == "push":
        meta.update(left_hand=P(-0.4, 0.27), right_hand=P(0.4, 0.26))
    img, m = g.finish(meta=meta)
    if lying:  # asleep: lay him down, head to the left
        img = img.rotate(90, expand=True)
        m = {k: (y, 1 - x) for k, (x, y) in m.items()}
    return img, m


@prop("glass_woman")
def glass_woman(h, rng, robe="violet", mantle="teal", jewels=False, veil="white"):
    cols = {"violet": VIOLET, "teal": TEAL, "blue": (52, 70, 140), "ruby": RUBY, "white": WHITE,
            "gold": GOLD, "emerald": EMERALD}
    g = GlassCanvas(h * 0.6, h, seed=int(rng.integers(1e6)))
    f = _figure(g, 0.3, robe=cols[robe], robe2=cols[mantle])
    P = f["P"]
    g.poly([P(-0.12, 0.22), P(-0.15, 0.24), P(-0.16, 0.5), P(-0.12, 0.5)], cols[robe])
    g.poly([P(0.12, 0.22), P(0.15, 0.24), P(0.16, 0.5), P(0.12, 0.5)], cols[robe])
    g.circle(*P(-0.14, 0.51), 0.022, SKIN)
    g.circle(*P(0.14, 0.51), 0.022, SKIN)
    g.poly([P(-0.08, 0.2), P(-0.075, 0.06), P(0.0, 0.02), P(0.075, 0.06), P(0.08, 0.2), P(0.05, 0.12),
            P(-0.05, 0.12)], cols[veil])
    g.circle(*P(0, 0.11), 0.05, SKIN)
    if jewels:
        for i in range(5):
            g.circle(*P(-0.04 + i * 0.02, 0.2), 0.009, GOLD)
        g.circle(*P(-0.052, 0.13), 0.01, GOLD)
    face = P(0, 0.11)
    return g.finish(meta={"center": P(0, 0.42), "head": face, "face": face, "face_r": (face[0] + 0.05, face[1])})


@prop("glass_philistine")
def glass_philistine(h, rng, weapon="sword", face="left"):
    """A Philistine soldier: feathered headdress, bronze, and a sword, spear or a glowing iron."""
    g = GlassCanvas(h * 0.7, h, seed=int(rng.integers(1e6)))
    f = _figure(g, 0.36, robe=(150, 52, 40), short=True, scale=0.82)  # room above for a raised blade
    P = f["P"]
    for k in range(5):
        a = -0.5 + k * 0.25
        g.poly([P(-0.01 + a * 0.08, 0.07), P(0.01 + a * 0.08, 0.07), P(a * 0.2, -0.06)], WHITE)
    g.poly([P(-0.12, 0.24), P(0.12, 0.24), P(0.11, 0.42), P(-0.11, 0.42)], BRONZE, cuts=2)  # breastplate
    g.poly([P(-0.12, 0.22), P(-0.16, 0.24), P(-0.17, 0.5), P(-0.13, 0.5)], SKIN)
    g.poly([P(0.12, 0.22), P(0.16, 0.21), P(0.27, 0.12), P(0.25, 0.08)], SKIN)  # weapon arm forward-up
    face = P(0, 0.11)
    meta = {"center": P(0, 0.45), "head": face, "face": face, "face_r": (face[0] + 0.062 * 0.82, face[1])}
    if weapon == "sword":
        g.poly([P(0.25, 0.1), P(0.28, 0.08), P(0.42, -0.12), P(0.4, -0.13)], (196, 200, 210))
        g.band([P(0.22, 0.12), P(0.3, 0.06)], 0.014, GOLD)
    elif weapon == "spear":
        g.band([P(0.26, 0.96), P(0.3, -0.12)], 0.012, WOOD)
        g.poly([P(0.29, -0.12), P(0.31, -0.12), P(0.3, -0.19)], IRON)
    elif weapon == "razor":
        g.poly([P(0.25, 0.1), P(0.27, 0.08), P(0.33, 0.02), P(0.31, 0.0)], (210, 214, 224))
    elif weapon == "iron":  # an iron heated in the fire
        g.band([P(0.26, 0.1), P(0.44, -0.06)], 0.014, IRON)
        g.circle(*P(0.45, -0.07), 0.018, (255, 140, 40))
        meta["tip"] = P(0.45, -0.07)
    img, m = g.finish(meta=meta)
    if face == "right":
        img = img.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        m = {k: (1 - x, y) for k, (x, y) in m.items()}
    return img, m


@prop("glass_fallen")
def glass_fallen(h, rng, count=5):
    """Philistines struck down (15:15): bodies lying where they fell, shields and spears scattered."""
    w = 2.4
    g = GlassCanvas(h * w, h, seed=int(rng.integers(1e6)))
    for i in range(count):
        x = 0.15 + i * (w - 0.3) / max(1, count - 1)
        y = 0.75 + (i % 2) * 0.12
        d = 1 if i % 2 else -1
        g.poly([(x - 0.22 * d, y - 0.05), (x + 0.18 * d, y - 0.07), (x + 0.2 * d, y + 0.05), (x - 0.22 * d, y + 0.06)],
               (150, 52, 40), cuts=1)                                            # body lying down
        g.circle(x + 0.26 * d, y - 0.01, 0.055, SKIN)
        for k in range(3):
            g.poly([(x + (0.3 + k * 0.03) * d, y - 0.03), (x + (0.3 + k * 0.03) * d, y + 0.01),
                    (x + (0.42 + k * 0.03) * d, y - 0.06 + k * 0.03)], WHITE)      # fallen headdress
        g.poly([(x - 0.24 * d, y - 0.02), (x - 0.45 * d, y + 0.02), (x - 0.45 * d, y + 0.07), (x - 0.24 * d, y + 0.05)],
               SKIN)                                                             # legs
        g.ellipse(x + 0.02 * d, y - 0.2, 0.12, 0.09, BRONZE, cuts=1)             # dropped shield
        g.band([(x - 0.3, y + 0.18), (x + 0.32, y - 0.32)], 0.012, WOOD)         # broken spear
    return g.finish(meta={"center": (w / 2, 0.7)})


@prop("glass_boy")
def glass_boy(h, rng):
    """The lad who led blind Samson by the hand (16:26)."""
    g = GlassCanvas(h * 0.55, h, seed=int(rng.integers(1e6)))
    f = _figure(g, 0.27, robe=(200, 170, 90), short=True)
    P = f["P"]
    g.poly([P(-0.12, 0.22), P(-0.16, 0.24), P(-0.24, 0.42), P(-0.2, 0.45)], SKIN)  # hand held out behind
    g.poly([P(0.12, 0.22), P(0.16, 0.24), P(0.17, 0.5), P(0.13, 0.5)], SKIN)
    g.circle(*P(0, 0.08), 0.065, HAIR)
    g.circle(*P(0, 0.12), 0.05, SKIN)
    face = P(0, 0.12)
    return g.finish(meta={"center": P(0, 0.45), "hand": P(-0.22, 0.44), "head": face, "face": face,
                          "face_r": (face[0] + 0.05, face[1])})


@prop("glass_altar")
def glass_altar(h, rng):
    """A rock altar with an offering on the fire (13:19-20)."""
    g = GlassCanvas(h * 1.3, h, seed=int(rng.integers(1e6)))
    g.poly([(0.15, 0.45), (1.15, 0.45), (1.1, 1.0), (0.2, 1.0)], STONE, cuts=4)
    g.poly([(0.1, 0.4), (1.2, 0.4), (1.2, 0.47), (0.1, 0.47)], (150, 150, 160))
    return g.finish(meta={"center": (0.65, 0.6), "flame1": (0.45, 0.4), "flame2": (0.65, 0.38),
                          "flame3": (0.85, 0.4), "smoke": (0.65, 0.3)})


@prop("glass_crowd")
def glass_crowd(h, rng, count=12, width=1.95):
    """Philistine men and women on the temple roof (16:27)."""
    g = GlassCanvas(h * width * 5, h * 5, seed=int(rng.integers(1e6)))  # drawn in the temple's units
    for i in range(count):
        x = 0.12 + i * (width - 0.24) / (count - 1)
        c = [RUBY, (52, 70, 140), GOLD, EMERALD, VIOLET, TEAL][i % 6]
        g.poly([(x - 0.035, 0.2), (x + 0.035, 0.2), (x + 0.03, 0.08), (x - 0.03, 0.08)], c)
        g.circle(x, 0.055, 0.025, SKIN)
        g.band([(x - 0.03, 0.1), (x - 0.06, 0.03)], 0.012, SKIN)   # arms raised, jeering
        g.band([(x + 0.03, 0.1), (x + 0.06, 0.03)], 0.012, SKIN)
    return g.finish(meta={"center": (width / 2, 0.12)})


@prop("glass_grindstone")
def glass_grindstone(h, rng):
    """The upper millstone, seen from above, so it can turn."""
    g = GlassCanvas(h, h, seed=int(rng.integers(1e6)))
    g.circle(0.5, 0.5, 0.48, (150, 150, 160), cuts=0)
    for k in range(8):
        a = k / 8 * 2 * math.pi
        g.band([(0.5 + math.cos(a) * 0.1, 0.5 + math.sin(a) * 0.1), (0.5 + math.cos(a) * 0.46,
                0.5 + math.sin(a) * 0.46)], 0.012, (110, 110, 120))
    g.circle(0.5, 0.5, 0.09, (70, 70, 80))
    g.band([(0.5, 0.5), (0.96, 0.5)], 0.06, WOOD)  # the handle he pushes round
    return g.finish(lead=0.012, meta={"center": (0.5, 0.5)})


@prop("glass_angel")
def glass_angel(h, rng):
    g = GlassCanvas(h * 0.95, h, seed=int(rng.integers(1e6)))
    cx = 0.47
    for side in (-1, 1):  # wings
        pts = [(cx + side * 0.06, 0.22), (cx + side * 0.42, 0.02), (cx + side * 0.4, 0.2),
               (cx + side * 0.36, 0.38), (cx + side * 0.28, 0.55), (cx + side * 0.1, 0.5)]
        g.poly(pts, (236, 214, 150), cuts=4)
    g.circle(cx, 0.11, 0.09, GOLD, cuts=2)  # halo
    f = _figure(g, cx, robe=WHITE, robe2=GOLD)
    P = f["P"]
    g.poly([P(0.12, 0.22), P(0.16, 0.21), P(0.24, 0.02), P(0.2, 0.0)], WHITE)  # hand raised
    g.circle(*P(0.22, 0.0), 0.022, SKIN)
    g.poly([P(-0.06, 0.1), P(-0.05, 0.04), P(0.0, 0.02), P(0.05, 0.04), P(0.06, 0.1)], (214, 170, 80))
    face = P(0, 0.11)
    return g.finish(meta={"center": P(0, 0.4), "head": face, "face": face, "face_r": (face[0] + 0.062, face[1])})


# ============================================================================ animals and things
@prop("glass_lion")
def glass_lion(h, rng):
    g = GlassCanvas(h * 1.9, h, seed=int(rng.integers(1e6)))
    g.band([(1.45, 0.55), (1.7, 0.45), (1.78, 0.3)], 0.03, AMBER)  # tail
    g.circle(1.79, 0.28, 0.05, (120, 70, 30))
    for x in (0.55, 0.75, 1.2, 1.38):  # legs
        g.poly([(x - 0.05, 0.6), (x + 0.05, 0.6), (x + 0.045, 0.97), (x - 0.06, 0.97)], AMBER)
        g.ellipse(x, 0.97, 0.07, 0.03, (184, 120, 50))
    g.ellipse(0.98, 0.55, 0.52, 0.2, AMBER, cuts=3)  # body
    g.circle(0.45, 0.4, 0.3, (150, 80, 34), cuts=6)  # mane
    g.circle(0.4, 0.42, 0.17, (210, 150, 70))  # face
    g.poly([(0.24, 0.48), (0.38, 0.5), (0.24, 0.6)], RUBY)  # roaring mouth
    g.circle(0.38, 0.36, 0.022, (40, 30, 20))
    return g.finish(meta={"center": (0.9, 0.5), "head": (0.4, 0.42)})


@prop("glass_gates")
def glass_gates(h, rng):
    """The doors of the gate of Gaza, with the two posts and the bar (16:3)."""
    g = GlassCanvas(h * 1.35, h, seed=int(rng.integers(1e6)))
    g.poly([(0.05, 0.0), (0.16, 0.0), (0.16, 1.0), (0.05, 1.0)], WOOD, cuts=1)
    g.poly([(1.19, 0.0), (1.3, 0.0), (1.3, 1.0), (1.19, 1.0)], WOOD, cuts=1)
    for i in range(10):
        x = 0.17 + i * 0.102
        g.poly([(x, 0.08), (x + 0.1, 0.08), (x + 0.1, 0.96), (x, 0.96)], (134 + (i % 2) * 12, 86, 44))
    for y in (0.22, 0.5, 0.78):
        g.poly([(0.16, y), (1.19, y), (1.19, y + 0.05), (0.16, y + 0.05)], IRON)
    g.poly([(0.0, 0.42), (1.35, 0.42), (1.35, 0.5), (0.0, 0.5)], (96, 58, 30))  # the bar
    return g.finish(meta={"center": (0.67, 0.5)})


@prop("glass_temple")
def glass_temple(h, rng, crowd=12):
    """The house of Dagon: two middle pillars the roof rests on, lords and people on the roof (16:26-27)."""
    w = 1.95
    g = GlassCanvas(h * w, h, seed=int(rng.integers(1e6)))
    col = (186, 172, 148)
    for i in range(crowd):  # the crowd on the roof
        x = 0.12 + i * (w - 0.24) / (crowd - 1)
        c = [RUBY, (52, 70, 140), GOLD, EMERALD, VIOLET, TEAL][i % 6]
        g.poly([(x - 0.035, 0.2), (x + 0.035, 0.2), (x + 0.03, 0.08), (x - 0.03, 0.08)], c)
        g.circle(x, 0.055, 0.025, SKIN)
    g.poly([(0.0, 0.2), (w, 0.2), (w, 0.3), (0.0, 0.3)], col, cuts=4)          # the roof beam
    g.poly([(0.0, 0.3), (w, 0.3), (w, 0.33), (0.0, 0.33)], GOLD)
    for x in (0.12, w - 0.12):                                                   # outer pillars
        g.poly([(x - 0.06, 0.33), (x + 0.06, 0.33), (x + 0.06, 0.97), (x - 0.06, 0.97)], col, cuts=3)
    for x in (w / 2 - 0.32, w / 2 + 0.32):                                       # the two middle pillars
        g.poly([(x - 0.08, 0.38), (x + 0.08, 0.38), (x + 0.08, 0.97), (x - 0.08, 0.97)], col, cuts=4)
        g.poly([(x - 0.11, 0.33), (x + 0.11, 0.33), (x + 0.08, 0.38), (x - 0.08, 0.38)], GOLD)
    g.poly([(0.0, 0.97), (w, 0.97), (w, 1.0), (0.0, 1.0)], col)
    return g.finish(meta={"center": (w / 2, 0.5), "roof": (w / 2, 0.12), "left_pillar": (w / 2 - 0.32, 0.6),
                          "right_pillar": (w / 2 + 0.32, 0.6)})


@prop("glass_mill")
def glass_mill(h, rng):
    """The prison mill Samson was set to grind at (16:21)."""
    g = GlassCanvas(h * 1.6, h, seed=int(rng.integers(1e6)))
    g.poly([(0.3, 0.75), (1.3, 0.75), (1.25, 1.0), (0.35, 1.0)], STONE, cuts=2)
    g.ellipse(0.8, 0.62, 0.5, 0.14, (150, 150, 160), cuts=3)
    g.ellipse(0.8, 0.6, 0.12, 0.04, (90, 90, 100))
    g.band([(0.8, 0.55), (0.8, 0.3), (0.05, 0.36)], 0.05, WOOD)
    return g.finish(meta={"center": (0.8, 0.6), "beam": (0.1, 0.36)})


@prop("glass_locks")
def glass_locks(h, rng):
    """Seven locks of hair, for the moment they are shaved off."""
    g = GlassCanvas(h * 0.8, h, seed=int(rng.integers(1e6)))
    for i in range(7):
        x = 0.1 + i * 0.1
        g.band([(x, 0.05), (x + 0.04, 0.5), (x - 0.02, 0.95)], 0.05, HAIR)
    return g.finish(lead=0.03, meta={"center": (0.4, 0.5)})


@prop("glass_silver")
def glass_silver(h, rng):
    """Eleven hundred pieces of silver from each lord (16:5)."""
    g = GlassCanvas(h * 1.6, h, seed=int(rng.integers(1e6)))
    for row in range(4):
        n = 7 - row
        for i in range(n):
            x = 0.8 + (i - (n - 1) / 2) * 0.2
            g.ellipse(x, 0.85 - row * 0.2, 0.11, 0.07, (196, 200, 210), jitter=0.1)
    return g.finish(lead=0.03, meta={"center": (0.8, 0.6)})


@prop("glass_vow")
def glass_vow(h, rng, vow="wine"):
    """One of the three Nazarite vows (Numbers 6) as a round glass medallion: the vine, the dead, the razor."""
    g = GlassCanvas(h, h, seed=int(rng.integers(1e6)))
    g.circle(0.5, 0.5, 0.49, (40, 34, 30))
    g.circle(0.5, 0.5, 0.45, GOLD)
    g.circle(0.5, 0.5, 0.4, (36, 52, 120), tiles=6)
    if vow == "wine":  # a cluster of grapes and a leaf
        g.poly([(0.5, 0.2), (0.7, 0.28), (0.56, 0.36)], EMERALD)
        for (x, y) in ((0.42, 0.38), (0.54, 0.38), (0.48, 0.48), (0.6, 0.48), (0.42, 0.5), (0.54, 0.58),
                       (0.46, 0.66)):
            g.circle(x, y, 0.07, VIOLET)
    elif vow == "dead":  # a skull, as old windows show death
        g.ellipse(0.5, 0.45, 0.2, 0.19, (226, 218, 196))
        g.poly([(0.38, 0.55), (0.62, 0.55), (0.58, 0.72), (0.42, 0.72)], (226, 218, 196))
        g.circle(0.42, 0.46, 0.055, (30, 27, 26))
        g.circle(0.58, 0.46, 0.055, (30, 27, 26))
    else:  # a razor
        g.poly([(0.26, 0.6), (0.62, 0.36), (0.7, 0.44), (0.34, 0.68)], (210, 214, 224), cuts=1)
        g.poly([(0.62, 0.36), (0.78, 0.26), (0.82, 0.32), (0.7, 0.44)], WOOD)
    return g.finish(lead=0.03, meta={"center": (0.5, 0.5)})


@prop("pane_image")
def pane_image(h, rng, path=""):
    """A finished story pane (a circular medallion image made by a previous build)."""
    img = Image.open(path).convert("RGBA")
    s = h / img.height
    img = img.resize((max(1, int(img.width * s)), max(1, int(img.height * s))), Image.LANCZOS)
    return img, {"center": (0.5, 0.5)}


# ============================================================================ sets
def _finish_set(g, ambient=0.6, **extra):
    img, _ = g.finish(lead=0.0045, crop=False)
    return {"layers": [{"key": "window", "image": img, "depth": 0.6, "paper": False, "grade": 0}],
            "ambient": ambient, "weather": None, **extra}


@scene_set("glass_vineyard")
def glass_vineyard(W, H, rng):
    """The vineyards of Timnah (14:5)."""
    g = GlassCanvas(W, H, seed=int(rng.integers(1e6)))
    w = W / H
    _sky(g, w, 0.55)
    g.poly([(0, 0.55), (w * 0.3, 0.44), (w * 0.62, 0.53), (w, 0.46), (w, 0.66), (0, 0.66)], OLIVE, tiles=8)
    g.poly([(0, 0.64), (w, 0.64), (w, 1.0), (0, 1.0)], OCHRE, tiles=14)
    for row, y in enumerate((0.7, 0.8)):
        pts = [(x, y + 0.02 * math.sin(x * 9 + row)) for x in np.linspace(0, w, 40)]
        g.band(pts, 0.012, WOOD)
        for x in np.linspace(0.05, w - 0.05, 16):
            yy = y + 0.02 * math.sin(x * 9 + row)
            g.ellipse(x, yy - 0.02, 0.05, 0.03, EMERALD)
            g.circle(x + 0.02, yy + 0.025, 0.018, VIOLET)
    return _finish_set(g)


@scene_set("glass_gaza")
def glass_gaza(W, H, rng):
    """Gaza at midnight (16:3): the city wall and gate, a hill beyond."""
    g = GlassCanvas(W, H, seed=int(rng.integers(1e6)))
    w = W / H
    g.poly([(0, 0), (w, 0), (w, 0.7), (0, 0.7)], NIGHT, jitter=0.12, tiles=40)
    for _ in range(18):
        g.circle(rng.uniform(0.05, w - 0.05), rng.uniform(0.04, 0.42), rng.uniform(0.008, 0.016), GOLD)
    g.circle(w * 0.82, 0.16, 0.06, (230, 226, 200), cuts=1)
    g.poly([(w * 0.45, 0.72), (w * 0.75, 0.38), (w, 0.5), (w, 0.8)], (60, 80, 70), tiles=6)  # the hill
    g.poly([(0, 0.7), (w, 0.7), (w, 1.0), (0, 1.0)], (120, 100, 70), tiles=10)
    for i in range(10):  # city wall with battlements
        x0 = i * 0.075
        g.poly([(x0, 0.4), (x0 + 0.05, 0.4), (x0 + 0.05, 0.36), (x0 + 0.075, 0.36), (x0 + 0.075, 0.8),
                (x0, 0.8)], (150, 130, 100), cuts=1)
    g.poly([(0.28, 0.8), (0.28, 0.58), (0.34, 0.52), (0.4, 0.58), (0.4, 0.8)], (30, 26, 40))  # empty gateway
    return _finish_set(g, ambient=0.55)


@scene_set("glass_house")
def glass_house(W, H, rng):
    """Delilah's house in the valley of Sorek (16:4)."""
    g = GlassCanvas(W, H, seed=int(rng.integers(1e6)))
    w = W / H
    g.poly([(0, 0), (w, 0), (w, 0.82), (0, 0.82)], TERRACOTTA, tiles=24)
    for x in (w * 0.22, w * 0.78):
        g.poly([(x - 0.13, 0.62), (x - 0.13, 0.28), (x, 0.14), (x + 0.13, 0.28), (x + 0.13, 0.62)], NIGHT, tiles=4)
        g.circle(x + 0.04, 0.3, 0.025, GOLD)
    g.poly([(w * 0.47, 0.5), (w * 0.53, 0.5), (w * 0.52, 0.56), (w * 0.48, 0.56)], BRONZE)  # oil lamp
    g.ellipse(w * 0.5, 0.47, 0.012, 0.03, GOLD)
    g.poly([(0, 0.82), (w, 0.82), (w, 1.0), (0, 1.0)], (110, 70, 50), tiles=8)
    g.poly([(w * 0.2, 0.86), (w * 0.8, 0.86), (w * 0.84, 0.98), (w * 0.16, 0.98)], RUBY, cuts=4)  # rug
    return _finish_set(g, ambient=0.5)


@scene_set("glass_prison")
def glass_prison(W, H, rng):
    """The prison house in Gaza (16:21)."""
    g = GlassCanvas(W, H, seed=int(rng.integers(1e6)))
    w = W / H
    g.poly([(0, 0), (w, 0), (w, 1.0), (0, 1.0)], (70, 76, 96), jitter=0.12, tiles=36)
    g.poly([(w * 0.62, 0.12), (w * 0.78, 0.12), (w * 0.78, 0.3), (w * 0.62, 0.3)], (200, 210, 230))
    for x in np.linspace(w * 0.64, w * 0.76, 4):
        g.band([(x, 0.12), (x, 0.3)], 0.008, IRON)
    g.poly([(0, 0.85), (w, 0.85), (w, 1.0), (0, 1.0)], (60, 56, 60), tiles=6)
    return _finish_set(g, ambient=0.45)


@scene_set("glass_hall")
def glass_hall(W, H, rng):
    """The great hall of the house of Dagon."""
    g = GlassCanvas(W, H, seed=int(rng.integers(1e6)))
    w = W / H
    g.poly([(0, 0), (w, 0), (w, 1.0), (0, 1.0)], (120, 40, 44), jitter=0.12, tiles=30)
    for x in np.linspace(0.15, w - 0.15, 7):
        g.poly([(x - 0.03, 0.15), (x + 0.03, 0.15), (x + 0.03, 0.9), (x - 0.03, 0.9)], (150, 90, 70))
    g.poly([(0, 0.9), (w, 0.9), (w, 1.0), (0, 1.0)], (90, 60, 50), tiles=6)
    return _finish_set(g, ambient=0.5)


@scene_set("glass_birth")
def glass_birth(W, H, rng):
    """A field near Zorah (13:2, 9)."""
    g = GlassCanvas(W, H, seed=int(rng.integers(1e6)))
    w = W / H
    _sky(g, w, 0.6)
    g.poly([(0, 0.6), (w, 0.6), (w, 1.0), (0, 1.0)], (196, 170, 90), tiles=12)
    for x in np.linspace(0.05, w - 0.05, 22):  # standing grain
        g.poly([(x - 0.01, 0.75), (x, 0.62), (x + 0.01, 0.75)], GOLD)
    return _finish_set(g)


# ============================================================================ the Great Window
SEASON_COLORS = [EMERALD, (52, 70, 140), RUBY, VIOLET, GOLD, TEAL]
SEASONS = [(1, 7), (8, 12), (13, 19), (20, 23), (24, 32), (33, 34)]


def rose_layout():
    """Medallion slots of the rose window in frame fractions: {number: (x, y, diameter/H)}.
    1-12 run clockwise round the inner ring from the top, 13-34 round the outer ring."""
    aspect = 16 / 9
    slots = {}
    for i in range(12):
        a = -math.pi / 2 + i / 12 * 2 * math.pi
        slots[i + 1] = (0.5 + math.cos(a) * 0.21 / aspect, 0.5 + math.sin(a) * 0.21, 0.09)
    for i in range(22):
        a = -math.pi / 2 + (i + 0.5) / 22 * 2 * math.pi
        slots[i + 13] = (0.5 + math.cos(a) * 0.35 / aspect, 0.5 + math.sin(a) * 0.35, 0.08)
    return slots


@scene_set("great_window")
def great_window(W, H, rng, panes_dir="", exclude=None, hires=2):
    """The rose window every story is a pane of. Finished episodes' panes are set into their
    medallions; the centre stays dark until the series ends."""
    W2, H2 = W * hires, H * hires
    g = GlassCanvas(W2, H2, seed=int(rng.integers(1e6)))
    w = W2 / H2
    g.poly([(0, 0), (w, 0), (w, 1), (0, 1)], (22, 30, 70), jitter=0.12, tiles=40)
    cx, cy = w / 2, 0.5
    g.circle(cx, cy, 0.425, (44, 36, 30), cuts=0)                    # stone rim
    g.circle(cx, cy, 0.41, (60, 46, 120), jitter=0.12)
    for i in range(22):                                              # tracery spokes
        a = -math.pi / 2 + i / 22 * 2 * math.pi
        g.band([(cx + math.cos(a) * 0.14, cy + math.sin(a) * 0.14), (cx + math.cos(a) * 0.41,
                cy + math.sin(a) * 0.41)], 0.011, (90, 80, 70))
    g.circle(cx, cy, 0.28, (40, 34, 30))
    g.circle(cx, cy, 0.27, (70, 40, 110), jitter=0.12)
    slots = rose_layout()
    for n, (x, y, d) in slots.items():
        season = next(i for i, (a, b) in enumerate(SEASONS) if a <= n <= b)
        g.circle(x * w, y, d / 2 + 0.008, SEASON_COLORS[season])     # season-coloured ring
        g.circle(x * w, y, d / 2, (30, 26, 44), cuts=2)               # empty, unlit medallion
    g.circle(cx, cy, 0.125, (60, 48, 30), cuts=0)                    # the dark centre, waiting
    g.circle(cx, cy, 0.11, (96, 80, 40), cuts=4)
    img, _ = g.finish(lead=0.004, crop=False)
    d = ImageDraw.Draw(img)
    filled = []
    if panes_dir and os.path.isdir(panes_dir):
        for f in sorted(os.listdir(panes_dir)):
            stem = os.path.splitext(f)[0]
            if not stem.isdigit() or int(stem) == exclude or int(stem) not in slots:
                continue
            x, y, dia = slots[int(stem)]
            size = int(dia * H2)
            pane = Image.open(os.path.join(panes_dir, f)).convert("RGBA").resize((size, size), Image.LANCZOS)
            img.alpha_composite(pane, (int(x * W2 - size / 2), int(y * H2 - size / 2)))
            filled.append(int(stem))
    for n, (x, y, dia) in slots.items():  # lead ring round every medallion
        r = dia * H2 / 2
        d.ellipse([x * W2 - r, y * H2 - r, x * W2 + r, y * H2 + r], outline=(30, 27, 26, 255),
                  width=max(2, int(0.005 * H2)))
    places = {f"pane{n}": (x, y) for n, (x, y, _) in slots.items()}
    places["centre"] = (0.5, 0.5)
    return {"layers": [{"key": "window", "image": img, "depth": 0.6, "paper": False, "grade": 0, "hires": hires}],
            "ambient": 0.72, "weather": None, "places": places,
            "slot_sizes": {f"pane{n}": dia for n, (_, _, dia) in slots.items()}, "filled": filled}


def make_pane(img, center, radius, size=640):
    """Cut a circular medallion from a composed scene, with a lead ring."""
    W, H = img.size
    r = radius * H
    box = (int(center[0] * W - r), int(center[1] * H - r), int(center[0] * W + r), int(center[1] * H + r))
    crop = img.crop(box).resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size - 1, size - 1], fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(crop, (0, 0), mask)
    ImageDraw.Draw(out).ellipse([2, 2, size - 3, size - 3], outline=(30, 27, 26, 255), width=int(size * 0.025))
    return out

