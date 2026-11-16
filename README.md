# Throttle & Track

A YouTube channel about **planes, trains, and "what would happen if…"**, with a pipeline that turns a script into a finished, upload-ready Short using only **Creative Commons footage** and an **ElevenLabs** voiceover.

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
  - `ep001_gimli_glider.yaml`: *What happens if a jet runs out of fuel at 41,000 ft?*
  - `ep002_train_steering.yaml`: *Why trains don't need a steering wheel*
  - `ep003_mallard.yaml`: *The steam record nobody has beaten since 1938*

## Run it
Requirements: Python 3.10+, `ffmpeg` with libass, and the Inter font (`fonts-inter`).

```bash
pip install -r requirements.txt

# Free draft: real footage + full edit, silent placeholder narration with estimated timing
python make_video.py episodes/ep001_gimli_glider.yaml --draft

# Final: real ElevenLabs narration (set voice_id in the YAML), slower/better encode, music bed
export ELEVENLABS_API_KEY=...
python make_video.py episodes/ep001_gimli_glider.yaml --preset slow --music music/bed.mp3
```

Re-runs are cached: footage searches and downloads, plus each voice line. Change one sentence and only that line is re-synthesised.

## Writing an episode
```yaml
segments:
  - say: "At forty-one thousand feet, both engines went silent."   # narration (write for the ear)
    punch: "41,000 FT. ZERO ENGINES."                               # on-screen red box, ≤5 words
    footage: {query: "Boeing 767 in flight", type: video}           # Commons search; video or image
```
Each beat becomes 1–3 cuts depending on its length, so there's a fresh visual roughly every 3–4 s. Captions are timed to the actual ElevenLabs word timings.

## Before uploading (checklist)
- [ ] Watch the whole render and swap any `footage.query` that matched something off-topic (edit `work/<id>/footage.json` or change the query and delete that file).
- [ ] Paste `description.txt` as the YouTube description. It contains every CC credit and licence, which is required for CC BY/BY-SA.
- [ ] Your ElevenLabs plan must allow commercial use if the channel is monetised.
- [ ] Music: only royalty-free or CC-licensed tracks, and add their credit to the description.
