# Throttle & Track

A YouTube channel that explains **how planes and trains really work, using real numbers and animated charts**, with a pipeline that turns a script into a finished, upload-ready Short using only **Creative Commons footage** and an **ElevenLabs** voiceover.

```
episodes/*.yaml ──► footage (Wikimedia Commons, CC0/PD/CC BY/CC BY-SA only)
                ──► voiceover (ElevenLabs, word-level timestamps)
                ──► edit (ffmpeg: motion, flash cuts, kinetic captions, punch text, progress bar, ducked music)
                ──► out/<id>/video.mp4 + thumbnail.jpg + description.txt (with full attribution) + credits.json
```

## Channel
- [`channel/STYLE_GUIDE.md`](channel/STYLE_GUIDE.md): the hook formula, pacing rules, look, voice settings, licensing and accuracy rules.
- [`channel/CONTENT_PLAN.md`](channel/CONTENT_PLAN.md): the first 12 uploads, cadence, and growth loop.
- `episodes/`: scripts, one YAML per video:
  - `ep001_why_35000_feet.yaml`: *Why planes fly at 35,000 ft (it's not the weather)*
  - `ep002_train_steering.yaml`: *Why trains don't need a steering wheel*

## Run it
Requirements: Python 3.10+ (with matplotlib), `ffmpeg` with libass, and the Inter font (`fonts-inter`).

```bash
pip install -r requirements.txt

# Free draft: real footage + full edit, silent placeholder narration with estimated timing
python make_video.py episodes/ep001_why_35000_feet.yaml --draft

# Final: real ElevenLabs narration (set voice_id in the YAML), slower/better encode, music bed
export ELEVENLABS_API_KEY=...
python make_video.py episodes/ep001_why_35000_feet.yaml --preset slow --music music/bed.mp3
```

Re-runs are cached: footage searches and downloads, plus each voice line. Change one sentence and only that line is re-synthesised.

## Writing an episode
```yaml
segments:
  - say: "At forty-one thousand feet, both engines went silent."   # narration (write for the ear)
    punch: "41,000 FT. ZERO ENGINES."                               # on-screen red box, ≤5 words
    footage: {query: "Boeing 767 in flight", type: video}           # Commons search; video or image

  - say: "Up there, only thirty-one percent of the air is left."
    punch: "ONLY 31% OF THE AIR"
    footage:                                                        # animated chart, built from your data
      type: chart
      chart:
        x_label: "air density, % of sea level"
        y_label: "altitude (thousand ft)"
        series: [{name: "Air density", points: [[100, 0], [53.3, 20], [31.0, 35]]}]
        highlights: [{x: 31.0, y: 35, label: "31% at 35,000 ft"}]

  - say: "…but across the ground, you're doing about four hundred and fifty."
    footage: {type: counter, from: 250, to: 449, suffix: " kt", above: "true airspeed", below: "≈ MACH 0.78"}
```
Each beat becomes 1–3 cuts depending on its length, so there's a fresh visual roughly every 3–4 s. Captions are timed to the actual ElevenLabs word timings.

## Before uploading (checklist)
- [ ] Watch the whole render and swap any `footage.query` that matched something off-topic (edit `work/<id>/footage.json` or change the query and delete that file).
- [ ] Paste `description.txt` as the YouTube description. It contains every CC credit and licence, which is required for CC BY/BY-SA.
- [ ] Your ElevenLabs plan must allow commercial use if the channel is monetised.
- [ ] Music: only royalty-free or CC-licensed tracks, and add their credit to the description.
