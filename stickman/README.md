# Stickman video engine

Code-driven stickman animations in the channel's hand-drawn style (round white head,
bold wobbly black ink, dot eyes, messy hair, warm paper, handwritten captions with
red/blue emphasis). Each scene renders to a 1920×1080 MP4 that drops straight onto a
Canva video timeline, where the voiceover, music and final timing get added.

Why not Canva Code directly? Canva Code elements are live/interactive and don't
export as MP4, so for video the animation is rendered here and uploaded to Canva.

## Use

```bash
# preview: open the scene in a browser (plays on loop)
open stickman/scenes/quiet-opening.html

# check a single frame (seconds)
node stickman/render.js stickman/scenes/quiet-opening.html out.png --still 4.8

# render the MP4
node stickman/render.js stickman/scenes/quiet-opening.html stickman/out/quiet-opening.mp4
```

Needs Node, Playwright (Chromium) and ffmpeg.

## Making a new scene

Copy `scenes/quiet-opening.html` and edit `draw(t)`. Building blocks from `engine.js`:

| Helper | What it does |
| --- | --- |
| `stickman({ x, y, shirt, hair, lookX, lookY, mouth, angry, blink, armL, armR, shoulders })` | Draws a character. `hair`: `short`/`long`. `mouth`: `flat`, `tight`, `frown`, `o`. Arms are `[upper, lower]` angles in radians. |
| `caption(parts, p, alpha, opts)` | Handwritten caption with a write-on reveal. `parts` = `[['AND THEN... '], ['NOTHING.', C.red]]`. |
| `drawOn(d, p, colour, width)` | Any SVG path that draws itself on (cross-outs, heat lines, underlines). |
| `seg(t, a, b)` | Eased 0→1 progress between seconds `a` and `b`. |
| `win(t, a, b)` | 1 inside `[a, b]` with soft fades — for things that appear then leave. |
| `lerp(a, b, p)` | Blend between two values. |

Every frame is deterministic, and line "boil" (the hand-drawn jitter) runs at 8 fps.
