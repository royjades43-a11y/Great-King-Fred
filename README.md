# Great-King-Fred: Lantern Theatre documentaries

A code-only pipeline for history documentaries in the **Lantern Theatre** style. Every scene
plays on a Victorian toy-theatre stage: cut-paper flats move on rails, and a warm lantern
spotlight "reads along" with the narrator, landing on each person or place as it's named.

```
episode.yaml ──► READ_ALONG.md ──► your voiceover (voice/*.mp3) ──► aligner: sentence + cue timing
   script                                                              │
   + cues        art (code-drawn sets & props) ◄───────────────────────┤
                                                                       ▼
                     director: camera, lighting, entrances, music ──► renderer
                                                                       │
                                     episode.mp4 + captions.srt + timing.md
```

## Making an episode

```bash
pip install -r requirements.txt            # plus ffmpeg on the PATH

python3 -m lantern.director episodes/01-the-king-in-the-marsh --export-script
#   -> READ_ALONG.md: the narration to record, per scene, with delivery and pronunciation notes

#   record it (or paste each scene into a TTS site) and save the audio as either
#     episodes/01-the-king-in-the-marsh/voice/<scene id>.mp3   (one file per scene), or
#     episodes/01-the-king-in-the-marsh/voice/full.mp3         (everything, ~2 s between scenes)

python3 -m lantern.director episodes/01-the-king-in-the-marsh --no-render --stills  # check timing
python3 -m lantern.director episodes/01-the-king-in-the-marsh --draft              # half-size render
python3 -m lantern.director episodes/01-the-king-in-the-marsh                      # final 1080p
```

The build folder gets `episode.mp4`, `captions.srt` (upload to YouTube), `timing.md` (every
cue with its timestamp, plus an engagement check), the narration and music stems, and the
generated art.

**How the voiceover is timed.** The aligner finds speech and pauses in your recording. It then
picks the sentence boundaries that best match each scripted sentence's length, preferring clear
pauses. Inside a sentence, cues are placed by phoneme count along the speech only, so dramatic
pauses don't throw them off. On test recordings with mid-sentence pauses of up to half a second,
sentence boundaries land within about 0.01 s (`python3 tests/test_align.py`). Read the script as
written: an added or skipped sentence will shift the timing.

**Generated voice (Kokoro).** With no recordings present, the director narrates with Kokoro, a
free open-weights TTS model, if it is installed. Use `python3 -m lantern.voice --fetch` (from
huggingface.co) or, where that host is blocked, `--fetch-npm`. The second option is an unofficial
npm re-upload of the same quantized model; the download is checked against its published
sha256. Episode 1 uses `bm_george`, a deep British male voice. Set `voice.respell` in
`episode.yaml` to fix how the voice says a name without changing the captions
(`{Athelstan: Athelston}`). `--silent-preview`
blocks out timing with estimated durations and no voice; its output is labeled `SILENT_PREVIEW`.

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
lantern/align.py     times the script against an uploaded voiceover
lantern/voice.py     sentence splitting, cue parsing; optional Kokoro TTS
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
