# Video 15 · voiceover check and direction

**File:** `assets/voiceover.mp3` (ElevenLabs, Josh), 8:36 (516.0 s). The script is
`scripts/15-bored-voiceover.txt`, 1,465 words.

## Verification (Whisper, sentence by sentence)

- **Words:** all 1,465 are aligned (`timing/words.json`), and 1,390 were timed directly by Whisper.
- **Sound-alikes only (fine):**
  - names: Erin → "Aaron", Drouin → "Drewann", Sandi → "Sandy", Rebekah → "Rebecca", Thuy-vy Nguyen →
    "TV Nwyn", Deci → "Desi", Kushlev → "Kurschlev"
  - homophones: "plain" → "plane", "bored" → "board", "invents" → "in vents"
- **Checked slowed down, and fine:**
  - "You weren't expecting a message, you just couldn't stand doing nothing" (0:09)
  - "They checked their phones, or listened to music" (1:19): the "-ed" blends into "their"
  - the Kushlev and Dunn line (4:37). Whisper looped on the first pass, but a wider window hears every word.
  - "There's a calmer benefit, too" (5:59): first heard as "karma"
- **Can't tell apart, either is fine:** "who had just said they'd **pay** to avoid that shock" (2:12) sounds like
  "they'd **paid** to avoid". Before "to", the two are the same sound.

## Performance and art direction

- **The host** (left third) talks to the viewer, with a mouth synced to every word, and acts out each line.
- **Story figures act out the studies:**
  - the sitter in Wilson's plain room, whose thought cloud drifts
  - the button-presser, from "I'd pay to avoid that" to 190 presses
  - the figure patting a pocket for a phantom "bzz?"
  - a calm figure on a park bench (Nguyen, Ryan & Deci)
- **Rooms:**
  - kitchen (the kettle)
  - a plain lab room (Wilson's studies)
  - study (what boredom is)
  - bedroom (the phone)
  - office desk (email batches)
  - outdoors (the good side)
  - living room (rules)
  - kitchen again (ending)
- **The shock is told calmly:** no flashes or shaking, just a small zap and the 190 counter.
- **Running image:** the kettle opens the video, returns as rule one and closes it ("let it boil").
- **New drawings** (`tools/icons.mjs`): kettle, button, shower, sink, pcup, and the rooms bgLab and bgOutdoor.

## Render

Rendered in scene parts: `python3 tools/mkparts.py && tools/render-parts.sh`, then concat with
`assets/soundtrack.m4a` at CRF 19. Mix: -14.0 LUFS, -1.6 dBTP.
