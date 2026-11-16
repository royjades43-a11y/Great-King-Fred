"""Animated explainer graphics for analysis beats: line charts that draw themselves
and big counting numbers. Rendered with matplotlib and piped straight into ffmpeg.

Chart rules (from the dataviz method): one axis, thin 2px-equivalent lines,
recessive grid, direct labels instead of a legend box for <=2 series, text in
neutral ink, never in the series colour. Series palette validated for the dark
surface: amber #CF7F00, blue #3A92DB (OKLCH L in band, CVD dE > 24).
"""
from __future__ import annotations

import subprocess
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager  # noqa: E402
from matplotlib.patches import Rectangle  # noqa: E402
import numpy as np  # noqa: E402

FPS = 30
SURFACE = "#0E1116"
GRID = "#262B33"
INK = "#F2F4F7"
INK_2 = "#9AA3AF"
SERIES = ["#CF7F00", "#3A92DB"]
HERO = "#FFD400"

for f in ("Inter-ExtraBold.otf", "Inter-SemiBold.otf", "Inter-Regular.otf"):
    p = Path("/usr/share/fonts/opentype/inter") / f
    if p.exists():
        font_manager.fontManager.addfont(str(p))
plt.rcParams["font.family"] = "Inter"


def _ease(x: float) -> float:
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


STRIP = 0.24  # vertical layout: top 24% of the frame shows the aircraft b-roll


def _pipe(size: tuple[int, int], out: Path, preset: str, dur: float, bg: dict | None = None) -> subprocess.Popen:
    """ffmpeg process that composites piped RGBA chart frames over aircraft b-roll."""
    W, H = size
    vertical = H > W
    frames = max(1, round(dur * FPS))
    inputs, chain = [], f"color=c={SURFACE}:s={W}x{H}:r={FPS}:d={dur + 1:.3f}[base];"
    if bg:
        if bg["kind"] == "video":
            inputs = ["-stream_loop", "-1", "-ss", f"{float(bg.get('start') or 0):.2f}", "-i", bg["path"]]
        else:
            inputs = ["-loop", "1", "-framerate", str(FPS), "-i", bg["path"]]
        grade = "eq=contrast=1.08:saturation=1.18"
        if vertical:
            sh = int(H * STRIP) // 2 * 2
            chain += (f"[0:v]fps={FPS},scale={W}:{sh}:force_original_aspect_ratio=increase,"
                      f"crop={W}:{sh},{grade}[bg];[base][bg]overlay=0:0[under];")
        else:
            chain += (f"[0:v]fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,"
                      f"crop={W}:{H},{grade}[bg];[base][bg]overlay=0:0[under];")
        fg = 1
    else:
        chain += "[base]null[under];"
        fg = 0
    chain += f"[{fg}:v]format=rgba[fg];[under][fg]overlay=0:0:format=auto,format=yuv420p[v]"
    return subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error", *inputs,
         "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-filter_complex", chain, "-map", "[v]", "-frames:v", str(frames), "-an",
         "-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS), "-preset", preset, "-crf", "18", str(out)],
        stdin=subprocess.PIPE)


def _canvas(size: tuple[int, int], has_bg: bool):
    """Transparent figure with the dark chart surface painted where the chart lives."""
    W, H = size
    vertical = H > W
    fig = plt.figure(figsize=(W / 100, H / 100), dpi=100)
    fig.patch.set_alpha(0)
    if not has_bg:
        fig.patches.append(Rectangle((0, 0), 1, 1, transform=fig.transFigure, fc=SURFACE, zorder=-10))
    elif vertical:
        top = 1 - STRIP
        fig.patches.append(Rectangle((0, 0), 1, top, transform=fig.transFigure, fc=SURFACE, zorder=-10))
        steps = 24  # soft fade from footage into the chart surface
        for k in range(steps):
            fig.patches.append(Rectangle((0, top + 0.05 * k / steps), 1, 0.05 / steps + 0.0005,
                                         transform=fig.transFigure, fc=SURFACE, lw=0,
                                         alpha=(1 - k / steps) ** 1.6, zorder=-10))
    else:
        fig.patches.append(Rectangle((0, 0), 1, 1, transform=fig.transFigure, fc=SURFACE,
                                     alpha=0.82, zorder=-10))
    return fig


def _frame(fig) -> bytes:
    fig.canvas.draw()
    return fig.canvas.buffer_rgba().tobytes()


def _densify(pts: np.ndarray, n: int = 400) -> np.ndarray:
    """Resample a polyline evenly by arc length so the draw-on animation is smooth."""
    seg = np.hypot(*np.diff(pts / (pts.max(0) - pts.min(0) + 1e-9), axis=0).T)
    s = np.concatenate([[0], np.cumsum(seg)])
    t = np.linspace(0, s[-1], n)
    return np.column_stack([np.interp(t, s, pts[:, 0]), np.interp(t, s, pts[:, 1])])


def render_chart(spec: dict, dur: float, size: tuple[int, int], out: Path, preset: str = "veryfast",
                 bg: dict | None = None) -> None:
    W, H = size
    vertical = H > W
    fig = _canvas(size, bg is not None)
    # keep clear of the punch box (top) and captions (lower third)
    ax = fig.add_axes([0.17, 0.45, 0.73, 0.25] if vertical else [0.10, 0.25, 0.80, 0.55])
    ax.set_facecolor("none")
    for side in ("top", "right"):
        ax.spines[side].set_visible(False)
    for side in ("left", "bottom"):
        ax.spines[side].set_color(INK_2)
        ax.spines[side].set_linewidth(1.5)
    ax.tick_params(colors=INK_2, labelsize=26 if vertical else 20, length=0, pad=10)
    ax.grid(True, color=GRID, linewidth=1.2)
    ax.set_axisbelow(True)
    ax.set_xlabel(spec.get("x_label", ""), color=INK_2, fontsize=28 if vertical else 22, labelpad=14)
    ax.set_ylabel(spec.get("y_label", ""), color=INK_2, fontsize=28 if vertical else 22, labelpad=14)
    if spec.get("x_lim"):
        ax.set_xlim(*spec["x_lim"])
    if spec.get("y_lim"):
        ax.set_ylim(*spec["y_lim"])
    if spec.get("note"):
        fig.text(0.90, 0.715 if vertical else 0.83, spec["note"], color=INK_2, ha="right",
                 fontsize=20 if vertical else 16, style="italic")

    lines, heads, paths = [], [], []
    all_pts = []
    for i, s in enumerate(spec["series"]):
        pts = np.array(s["points"], dtype=float)
        all_pts.append(pts)
        path = _densify(pts)
        paths.append(path)
        color = SERIES[i % len(SERIES)]
        (ln,) = ax.plot([], [], color=color, linewidth=5, solid_capstyle="round")
        (hd,) = ax.plot([], [], "o", color=color, markersize=16, markeredgecolor=SURFACE, markeredgewidth=3)
        lines.append(ln)
        heads.append(hd)
    if not spec.get("x_lim"):
        allp = np.vstack(all_pts)
        ax.set_xlim(min(0, allp[:, 0].min()), allp[:, 0].max() * 1.08)
    if not spec.get("y_lim"):
        allp = np.vstack(all_pts)
        ax.set_ylim(min(0, allp[:, 1].min()), allp[:, 1].max() * 1.05)

    # direct series labels (no legend box) at each line's end, in neutral ink + colour chip
    end_labels = []
    for i, s in enumerate(spec["series"]):
        x, y = s.get("label_at", all_pts[i][-1])
        dx, dy = s.get("label_offset", [12, 0]) if "label_at" not in s else (0, 0)
        t = ax.annotate(f"● {s['name']}" if len(spec["series"]) > 1 else s["name"], (x, y),
                        xytext=(dx, dy), textcoords="offset points", color=INK,
                        fontsize=26 if vertical else 20, fontweight="semibold", va="center",
                        ha=s.get("label_ha", "left"), alpha=0)
        if len(spec["series"]) > 1:
            t.set_text(s["name"])
            t.set_bbox(dict(boxstyle="round,pad=0.35", fc=SURFACE, ec=SERIES[i % len(SERIES)], lw=3))
        end_labels.append(t)

    callouts = []
    for h in spec.get("highlights", []):
        dot = ax.plot([h["x"]], [h["y"]], "o", markersize=26, markerfacecolor="none",
                      markeredgecolor=HERO, markeredgewidth=4, alpha=0)[0]
        dx, dy = h.get("offset", [-30, 40])
        txt = ax.annotate(h["label"], (h["x"], h["y"]), xytext=(dx, dy), textcoords="offset points",
                          color=INK, fontsize=34 if vertical else 26, fontweight="bold",
                          ha=h.get("ha", "right"), va="bottom", alpha=0,
                          bbox=dict(boxstyle="round,pad=0.4", fc="#1B2028", ec="none"))
        # the callout appears once the line has been drawn past it
        pts = paths[h.get("series", 0)]
        idx = int(np.argmin(np.hypot(*((pts - [h["x"], h["y"]]) /
                                          (pts.max(0) - pts.min(0) + 1e-9)).T)))
        callouts.append((dot, txt, idx / (len(pts) - 1)))

    proc = _pipe(size, out, preset, dur, bg)
    frames = max(1, round(dur * FPS))
    draw_time = min(dur * 0.7, max(1.5, dur - 1.2))
    for n in range(frames):
        t = n / FPS
        f = _ease(t / draw_time)
        for ln, hd, path in zip(lines, heads, paths):
            k = max(2, int(f * (len(path) - 1)) + 1)
            ln.set_data(path[:k, 0], path[:k, 1])
            hd.set_data([path[k - 1, 0]], [path[k - 1, 1]])
        for lab in end_labels:
            lab.set_alpha(min(1.0, max(0.0, (f - 0.92) / 0.08)))
        for dot, txt, at in callouts:
            a = min(1.0, max(0.0, (f - min(at, 0.9)) / 0.08))
            dot.set_alpha(a)
            txt.set_alpha(a)
            txt.get_bbox_patch().set_alpha(a)
        proc.stdin.write(_frame(fig))
    proc.stdin.close()
    proc.wait()
    plt.close(fig)
    if proc.returncode:
        raise RuntimeError("ffmpeg failed while encoding chart")


def render_counter(spec: dict, dur: float, size: tuple[int, int], out: Path, preset: str = "veryfast",
                   bg: dict | None = None) -> None:
    """A huge number counting from `from` to `to`, with small labels above/below."""
    W, H = size
    vertical = H > W
    fig = _canvas(size, bg is not None)
    cy = 0.56 if vertical else 0.55
    top = fig.text(0.5, cy + 0.085, spec.get("above", ""), color=INK_2, ha="center",
                   fontsize=40 if vertical else 34, fontweight="semibold")
    num = fig.text(0.5, cy, "", color=HERO, ha="center", va="center",
                   fontsize=200 if vertical else 170, fontweight="heavy")
    unit = fig.text(0.5, cy - 0.085, spec.get("below", ""), color=INK, ha="center",
                    fontsize=46 if vertical else 38, fontweight="bold")
    start, end = float(spec["from"]), float(spec["to"])
    dec = int(spec.get("decimals", 0))
    pre, suf = spec.get("prefix", ""), spec.get("suffix", "")
    proc = _pipe(size, out, preset, dur, bg)
    frames = max(1, round(dur * FPS))
    hold = float(spec.get("hold_start", 0.4))
    for n in range(frames):
        t = n / FPS
        f = _ease((t - hold) / max(0.6, dur * 0.6))
        v = start + (end - start) * f
        num.set_text(f"{pre}{v:,.{dec}f}{suf}")
        s = 1.0 + 0.06 * max(0.0, 1 - abs(f - 1) * 20) if f >= 0.999 else 1.0
        num.set_fontsize((200 if vertical else 170) * s)
        proc.stdin.write(_frame(fig))
    proc.stdin.close()
    proc.wait()
    plt.close(fig)
    if proc.returncode:
        raise RuntimeError("ffmpeg failed while encoding counter")
