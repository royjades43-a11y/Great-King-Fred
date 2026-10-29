# Great-King-Fred — Lantern Theatre renderer

A small tool that turns layered images into documentary footage in the **Lantern Theatre** style:
every scene plays on a Victorian toy-theatre stage, images are cut-paper flats that move on
rails, and a warm lantern spotlight "reads along" with the narration.

What it does for you automatically:

- **Stage frame** — wooden proscenium, scalloped velvet valance, footlights (your channel's signature).
- **Cut-paper layers** — cream cut edge + drop shadow on every figure, parallax by depth.
- **Duotone grade** — indigo shadows / sepia highlights so mixed archival sources look like one world.
- **Lantern spotlight** — keyframed or locked to a moving figure; the rest of the stage stays dim.
- **Living details** — flickering flames that cast light, swaying banners, bobbing ships,
  ink routes that draw themselves across maps.
- **Stage movement** — slow camera push, flats that drop in / rise / slide in from the wings.
- **Transitions** — curtains, lantern-slide flash, fade.
- **Title tickets** — theatre-ticket cards that rise from behind the stage lip.
- **Atmosphere** — lantern flicker, dust motes in the beam, film grain, vignette.
- **Sound** — projector hum, curtain swish, paper slides and slide clacks, mixed with your narration/music.

## Quick start

Needs Python 3.10+, `ffmpeg`, and `pip install -r requirements.txt`.

```bash
python3 demo/make_assets.py                                   # placeholder artwork
python3 -m lantern.render demo/scene.json -o out/demo.mp4     # full render
python3 -m lantern.render demo/scene.json --scale 0.5 -o out/draft.mp4   # fast draft
python3 -m lantern.render demo/scene.json --still 1:6 -o out/still.png   # scene 1 at 6s
```

A 1080p render takes roughly 10–15 s of compute per second of video on a 4-core machine;
use `--scale 0.5` and `--still` while blocking a scene.

## Making a real episode

1. **Cut your images into layers.** Background, middle, subject, foreground — transparent PNGs.
   (Photoshop / Photopea "select subject", or an AI depth/segmentation tool, then clean up.)
2. **Write the scene file** (see `demo/scene.json`). Coordinates are fractions of the frame
   (0–1), times are seconds from the start of the scene.
3. **Drop in narration** with an `audio.tracks` entry and time the spotlight to the words.

### Scene file reference

```jsonc
{
  "width": 1920, "height": 1080, "fps": 24,
  "style": { "shadow": "#141833", "mid": "#6b4a32", "highlight": "#f2dcb0", "accent": "#7a1f1f",
             "ambient": 0.5, "flicker": 0.035, "grain": 5, "dust": 60, "grade": 0.85 },
  "audio": { "hum": 1.0, "tracks": [{ "file": "narration.wav", "at": 0, "volume": 1.0 }] },
  "scenes": [{
    "duration": 12,
    "open": "curtain", "close": "lantern",          // curtain | lantern | fade | none
    "ambient": 0.45,                                 // how dark the stage is outside the spotlight
    "camera":    [[0, 1.0, 0.5, 0.5], [12, 1.05, 0.45, 0.55]],      // [t, zoom, focusX, focusY]
    "spotlight": [[0, 0.6, 0.5, 0.3], [5, 0.2, 0.6, 0.15]],         // [t, x, y, radius(, intensity)]
    "spotlight_follow": { "layer": 3, "from": 4, "to": 9, "offset": [0, -0.05] },
    "title": { "text": "ACT I", "sub": "Wessex, 871", "at": 1.5, "hold": 3 },
    "layers": [
      { "image": "bg.png", "depth": 0.3 },                           // full backdrop (fills the stage)
      { "image": "king.png", "pos": [0.2, 0.75], "scale": 0.08,      // figure: pos = anchor point
        "anchor": [0.5, 1.0], "depth": 1.0, "paper": true, "grade": 0.85,
        "enter": { "from": "left", "at": 3, "dur": 1.5 },            // top | bottom | left | right
        "exit":  { "to": "right", "at": 10, "dur": 1.2 },
        "slide": [[0, 0, 0], [6, 0.05, 0]],                          // [t, dx, dy] on rails
        "pivot": [0.5, 1.0],                                         // rotation point (fraction of image)
        "sway":  { "amp": 3, "period": 4 },                          // banners, trees
        "bob":   { "amp": 0.004, "period": 2.6, "roll": 3 },         // ships
        "follow": { "points": [[0.1, 0.3], [0.5, 0.2]], "start": 1, "end": 9 },
        "fx": [
          { "type": "flame", "x": 0.4, "y": 0.7, "size": 0.006, "light": 0.25 },
          { "type": "ink", "points": [[0.1, 0.3], [0.5, 0.2]], "start": 1, "end": 9,
            "color": "#7a1f1f", "width": 5 }
        ] }
    ]
  }]
}
```

`fx` coordinates are fractions of that layer's own image. Set `"grade": 0` on a layer to keep its
original colours.

## Layout

```
lantern/render.py   scene loading, per-frame compositing, lighting, encoding
lantern/stage.py    proscenium, curtains, title tickets, dust, grain
lantern/fx.py       duotone grade, cut-paper cards, flames, ink lines
lantern/anim.py     easing, keyframes, noise, path following
lantern/audio.py    synthesised stage foley + track mixing
demo/               placeholder artwork generator and a three-scene example
```
