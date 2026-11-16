# Throttle & Track — Channel Style Guide

> How planes and trains really work: real numbers, explained fast.

## Positioning
- **Who it's for:** curious people who scroll past "educational" content. Not enthusiasts only — the 14‑year‑old and the 60‑year‑old should both finish the video.
- **Promise:** every video answers one question you didn't know you had, with one fact you'll repeat to someone today.
- **Format:** analysis, not anecdotes. Each video takes one common belief, breaks it with one number, and shows the mechanism on an animated chart. No incident or disaster stories.
- **Series:** *Why Does It…* (hidden engineering), *What Would Happen If…* (physics thought experiments worked through with real numbers), *By The Numbers* (one dataset, one surprising answer).

## The hook formula (first 3 seconds decide everything)
1. **Open by contradicting a common belief.** Never "Hi, welcome back".
   - ✅ "Planes don't cruise at thirty-five thousand feet to avoid the weather."
   - ❌ "Today we're looking at cruising altitude."
2. **On-screen punch text** restates the hook in ≤5 words (e.g. `IT'S NOT THE WEATHER`).
3. **Open a loop** by second 5: promise the answer ("The real reason is hiding in one number").
4. **Pay the loop off late** — around 70–80% of runtime — so retention holds.
5. **End with something viewers can check themselves** plus a question ("Next flight, watch the altitude on the map screen. Did you know this one?"). No "like and subscribe" begging; one quick spoken line max.

## Pacing rules
| Element | Rule |
|---|---|
| Shot length | 2–4 s. A new visual at least every 4 s (pattern interrupt). |
| Sentence length | ≤ 14 words. One idea per sentence. |
| Captions | Always on, burned in, 1–3 words at a time, active word highlighted yellow. |
| Numbers | Always shown on screen as punch text. Convert units for both audiences (ft + m, mph + km/h). |
| Shorts length | 40–65 s (hard cap 75 s). Long-form: 8–12 min, chapters every ~90 s. |
| Visual motion | Stills get a Ken Burns push; video gets a slow punch-in. Nothing sits static. |

## Charts (the core of every video)
- Built from data written in the script YAML and animated: the line draws itself, and callouts pop in as the line reaches them.
- One axis per chart, never two. Thin lines, recessive grid, direct labels (no legend box), text in neutral ink.
- Series colours are amber `#CF7F00` then blue `#3A92DB`, checked for colour-blind separation on the dark `#0E1116` background. Brand yellow is reserved for callout rings and hero numbers.
- Big counting numbers (`type: counter`) for the single headline number of a beat.

## Look
- **Font:** Inter ExtraBold/Black, ALL CAPS captions, heavy black outline.
- **Colours:** caption white `#FFFFFF`, active word signal yellow `#FFD400`, punch text with a red `#E8312F` box. Progress bar yellow along the bottom.
- **Format:** Shorts 1080×1920 by default; long-form 1920×1080.

## Voice (ElevenLabs)
- Narrator persona: calm-but-urgent documentary voice; never shouty.
- Settings that work for this style: `stability 0.35–0.45`, `similarity_boost 0.75`, `style 0.45–0.6`, speaker boost on. Model `eleven_multilingual_v2` for quality, `eleven_flash_v2_5` for drafts.
- Write for the ear: spell out numbers the way you'd say them ("forty-one thousand feet"), use commas for breath, `…` for a dramatic pause.
- Commercial monetisation requires a paid ElevenLabs plan — check the plan's licence before uploading.

## Footage & licensing (non-negotiable)
- Source: **Wikimedia Commons** (and other CC sources) only. The pipeline accepts **CC0, Public Domain, CC BY, CC BY‑SA** and rejects anything else, including NC/ND.
- Every asset's title, author, licence and URL is written to `credits.json` and into the YouTube description automatically.
- CC BY‑SA footage: the *edit* is a derivative — say so in the description ("Adapted footage, edited by Throttle & Track") and note the licence.
- Never imply a real airline/manufacturer endorses us; no logos in thumbnails.
- Disclose the AI-generated narration in the description. Use YouTube's "altered or synthetic content" toggle if a video ever depicts realistic events that didn't happen (e.g. simulated crashes).

## Accuracy
- Every fact in a script carries a source in the YAML `sources:` list. If it can't be sourced, it doesn't get said.
- "What would happen if" scenarios: be clear which parts are real incidents and which are hypothetical.
- State modelling assumptions in `graphics_note` (e.g. "International Standard Atmosphere, constant equivalent airspeed").
