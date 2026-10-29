"""Easing curves, keyframe interpolation and smooth deterministic noise."""
import math


def clamp(v, lo=0.0, hi=1.0):
    return lo if v < lo else hi if v > hi else v


def ease_in_out(t):
    """Gentle sine ease - the default for everything on stage."""
    t = clamp(t)
    return 0.5 - 0.5 * math.cos(math.pi * t)


def ease_out(t):
    t = clamp(t)
    return 1 - (1 - t) ** 3


def ease_in(t):
    t = clamp(t)
    return t ** 3


def lerp(a, b, t):
    return a + (b - a) * t


def keyframes(keys, t, default=None):
    """Interpolate a list of keys [[time, v1, v2, ...], ...] at time t.

    Values ease in and out between keys and hold before the first / after the last.
    Returns a tuple of values (or `default` when there are no keys).
    """
    if not keys:
        return default
    keys = sorted(keys, key=lambda k: k[0])
    if t <= keys[0][0]:
        return tuple(keys[0][1:])
    if t >= keys[-1][0]:
        return tuple(keys[-1][1:])
    for a, b in zip(keys, keys[1:]):
        if a[0] <= t <= b[0]:
            span = b[0] - a[0]
            u = ease_in_out((t - a[0]) / span) if span > 0 else 1.0
            return tuple(lerp(x, y, u) for x, y in zip(a[1:], b[1:]))
    return tuple(keys[-1][1:])


def smooth_noise(t, seed=0.0, speed=1.0):
    """Cheap smooth 1-D noise in roughly [-1, 1], built from incommensurate sines."""
    t = t * speed
    return (
        0.5 * math.sin(t * 1.7 + seed * 12.9898)
        + 0.3 * math.sin(t * 3.1 + seed * 78.233 + 1.3)
        + 0.2 * math.sin(t * 7.3 + seed * 37.719 + 2.1)
    )


def point_along(points, progress, aspect=(1.0, 1.0)):
    """Position at `progress` (0..1) of a polyline's arc length.

    `aspect` scales x/y when measuring length, so fractional coordinates on a 16:9
    stage travel at the same speed as the same path drawn in pixels.
    """
    progress = clamp(progress)
    ax, ay = aspect
    seg = [math.hypot((b[0] - a[0]) * ax, (b[1] - a[1]) * ay) for a, b in zip(points, points[1:])]
    remaining = (sum(seg) or 1.0) * progress
    for (a, b), L in zip(zip(points, points[1:]), seg):
        if remaining <= L and L > 0:
            u = remaining / L
            return a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u
        remaining -= L
    return tuple(points[-1])
