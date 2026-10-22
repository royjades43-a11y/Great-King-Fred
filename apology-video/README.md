# Why Most People Don't Say Sorry — HyperFrames edit

A stickman, paper-and-ink psychology explainer (1920×1080, 30 fps, ~2:03). Every element
enters from a side (or pops, slams, draws on), holds still, then leaves the way it came.
Each one is timed off the voiceover word that names it and lands **0.25 s before** the word is spoken.

```
script/script.json   the edit: beats (what is said) + elements (what appears, cued to a word)
theme.json           palette, font, lead time (0.25 s), channel handle
timing/words.json    word-level timestamps of the voiceover
timing/cues.txt      generated cue sheet: element → word → spoken time → in/out time
tools/build.mjs      generates index.html + compositions/*.html from the three files above
tools/stick.mjs      the stickman rig and poses      tools/icons.mjs   line icons
assets/voiceover.wav the narration (currently a PLACEHOLDER voice — see below)
```

## Swap in your real voiceover

1. Put your file at `assets/voiceover.wav` (or .mp3 — then change the `src` in `tools/build.mjs`).
2. Get word timings:
   `npx hyperframes transcribe assets/voiceover.wav` (writes `transcript.json`), then
   `cp transcript.json timing/words.json`.
   Any `[{text,start,end}]` list, or `{words:[…]}`, works.
3. If your wording differs from the script, edit each beat's `say` in `script/script.json` to match
   what you actually said (the aligner tolerates small differences, and `at` cues must name a word
   that is in that beat).
4. `npm run build && npm run check`, look at `timing/cues.txt`, then `npm run render`.

Change the lead with `"lead"` in `theme.json`; change colours/font there too, then rebuild.

## Commands

```
npm run vo:placeholder   regenerate the placeholder narration (local Kokoro voice)
npm run build            regenerate the compositions
npm run cues             build + print the cue sheet
npm run dev              open the Studio preview
npm run check            lint + layout + contrast + craft checks
npm run render           → renders/why-people-dont-say-sorry.mp4
```
