# Throttle & Track — Channel Style Guide

> Planes, trains, and "what would happen if…" — told fast, told true.

## Positioning
- **Who it's for:** curious people who scroll past "educational" content. Not enthusiasts only — the 14‑year‑old and the 60‑year‑old should both finish the video.
- **Promise:** every video answers one question you didn't know you had, with one fact you'll repeat to someone today.
- **Three series:**
  1. **What Would Happen If…** — physics/engineering scenarios (engines fail, a train never brakes, a plane flies too high).
  2. **Why Does It…** — the hidden engineering of normal things (why trains don't need steering, why plane windows are round).
  3. **The Record** — one machine, one record, one day (Mallard, Concorde, the SR‑71).

## The hook formula (first 3 seconds decide everything)
1. **Open on the most dramatic line in the script.** Never "Hi, welcome back". Never the question alone — the *stakes*.
   - ✅ "At forty-one thousand feet, both engines went silent."
   - ❌ "Today we're talking about the Gimli Glider."
2. **On-screen punch text** restates the hook in ≤5 words (e.g. `41,000 FT. ZERO ENGINES.`).
3. **Open a loop** by second 5: tease the payoff ("…and the place they landed was a racetrack full of people").
4. **Pay the loop off late** — around 70–80% of runtime — so retention holds.
5. **End on a question** that invites a comment ("Would you have tried the landing?"). No "like and subscribe" begging; one quick spoken line max.

## Pacing rules
| Element | Rule |
|---|---|
| Shot length | 2–4 s. A new visual at least every 4 s (pattern interrupt). |
| Sentence length | ≤ 14 words. One idea per sentence. |
| Captions | Always on, burned in, 1–3 words at a time, active word highlighted yellow. |
| Numbers | Always shown on screen as punch text. Convert units for both audiences (ft + m, mph + km/h). |
| Shorts length | 40–65 s (hard cap 75 s). Long-form: 8–12 min, chapters every ~90 s. |
| Visual motion | Stills get a Ken Burns push; video gets a slow punch-in. Nothing sits static. |

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
- Disaster topics: respectful tone, no sensational crash imagery, name the crew who saved lives.
