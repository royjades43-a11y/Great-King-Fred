# Great-King-Fred: Lantern Theatre documentaries

A code-only pipeline for history documentaries in the **Lantern Theatre** style. Every scene
plays on a Victorian toy-theatre stage: cut-paper flats move on rails, and a warm lantern
spotlight "reads along" with the narrator, landing on each person or place as it's named.

```
episode.yaml ──► voice (Kokoro TTS, per-word timing) ──► art (code-drawn sets & props)
   script          │                                        │
   + cues          └──────────► director: cue timing, camera, lighting, entrances, music
                                         │
                                         └──► renderer ──► episode.mp4 + captions.srt + timing.md
```

## Making an episode

```bash
pip install -r requirements.txt            # plus ffmpeg on the PATH
python3 -m lantern.voice --fetch           # one-time: Kokoro voice model from huggingface.co (~330 MB)

python3 -m lantern.director episodes/01-the-king-in-the-marsh --no-render --stills  # check timing + stills
python3 -m lantern.director episodes/01-the-king-in-the-marsh --draft              # half-size render
python3 -m lantern.director episodes/01-the-king-in-the-marsh                      # final 1080p
```

The build folder gets `episode.mp4`, `captions.srt` (upload to YouTube), `timing.md` (every
cue with its timestamp, plus an engagement check), the narration and music stems, and the
generated art.

`--silent-preview` blocks out timing with estimated durations and no voice. It's only for
checking layout before the voice model is installed, and its output is labeled `SILENT_PREVIEW`.

## Writing the script

An episode is one YAML file. Each scene picks a **set**, places a **cast** of props, and gives
the **narration** with cues placed just before the word they should land on:

```yaml
- id: twelfth_night
  set: {name: hills, time: night, snow: true}
  open: curtain                  # curtain | lantern | fade | none
  mood: tense                    # music: mystery somber tense battle triumph wonder
  cast:
    hall:  {prop: longhall, at: [0.62, 0.82], height: 0.34, fx: [smoke@smoke]}
    danes: {prop: warband, params: {side: dane, count: 8, torches: 3}, at: [0.24, 0.92],
            height: 0.34, fx: [flames]}
  narration: |
    [title:ACT II|Twelfth Night] [spot:hall] The peace did not last.
    [enter:danes] Out of the snow came a Viking army, [spot:danes] led by a warlord named Guthrum.
```

`at` is where the prop's feet stand (fractions of the frame) and `height` is its height as a
fraction of the frame.

| Cue | Effect |
|---|---|
| `[spot:x]` `[spot:x:wide]` `[spot:x:tight]` | swing the lantern to a cast member |
| `[spot:@place]` | spotlight a place on a map set (`@chippenham`, `@wessex`) |
| `[spot:all]` | open the light to the whole stage |
| `[enter:x]` `[enter:x:right]` `[exit:x]` `[exit:x:bottom]` | slide a flat on / off |
| `[show:x]` | raise a flat up through the stage floor |
| `[move:x:0.4]` | slide a flat along its rail to a new x |
| `[push:x]` | camera pushes in on x (once per scene, on the emotional line) |
| `[ignite:x]` | light the flames on x |
| `[ink:route]` `[sail:x:route]` | draw a route on the map / move a figure along it |
| `[title:ACT I|Subtitle]` | theatre-ticket title card |
| `[pause:0.8]` | extra silence after this sentence |

See [`docs/DIRECTION.md`](docs/DIRECTION.md) for the structure and pacing rules episodes are
written to.

### Sets and props

- **Sets:** `hills` (time: night/dusk/dawn/day/storm, snow, trees), `marsh`, `coast`, `hall`,
  `hut_interior`, `void` (dark/parchment/blood), `map` (view: england/heptarchy/wessex; places,
  regions, frontier).
- **Props:** `king` (hooded), `warrior` (dane/saxon), `woman`, `monk`, `warband`, `shieldwall`,
  `longship`, `longhall`, `hut`, `church`, `burh`, `tree`, `reeds`, `standing_stone`, `hearth`,
  `crown`, `cross`, `font`, `book`, `sword`, `campfire`.

Add a new prop by writing a function in `lantern/art/props.py` with the `@prop("name")`
decorator. Maps are drawn from real coordinates (`lantern/art/maps.py`), so adding a place is one line.

## Layout

```
lantern/director.py  script -> timed scenes, camera, lighting, music, captions, report
lantern/voice.py     Kokoro narration with per-word cue timing
lantern/music.py     procedural score built on the channel motif
lantern/art/         code-drawn sets, props and maps
lantern/render.py    per-frame compositing, lighting, encoding
lantern/stage.py     proscenium, curtains, title tickets, dust, snow, grain
lantern/fx.py        duotone grade, cut-paper cards, flames, smoke, ink
lantern/audio.py     stage foley, mixing, music ducking
episodes/            one folder per episode (episode.yaml is the source of truth)
demo/                the original three-scene style demo (hand-written scene.json)
```

The renderer can also be driven directly with a hand-written `scene.json` (see `demo/`). Each
layer there takes `image`, `pos`/`scale`/`anchor`, `depth`, `paper`, `grade`, `enter`/`exit`,
`slide`, `sway`, `bob`, `follow` and `fx` (flame, smoke, ink).
