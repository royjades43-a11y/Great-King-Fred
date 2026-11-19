# Video 14 · voiceover check and direction

**File:** `assets/voiceover.mp3` (ElevenLabs, Josh), 8:37 (517.1 s). The script is
`scripts/14-procrastinate-voiceover.txt`, 1,471 words.

## Verification (Whisper, sentence by sentence)

- **Words:** all 1,471 are aligned (`timing/words.json`), and 1,412 were timed directly by Whisper.
- **Sound-alikes only (fine):**
  - names Whisper doesn't know: Sirois → "Soroi", Pychyl → "Tempichul" / "Pitchell", Tice → "Tyse",
    Baumeister → "Balmeister", Hershfield → "Hirschfield", Pronin → "Pronen", Dai → "died", Riis → "Reese",
    Wohl → "Wall", Wertenbroch → "Vertenbroch", Gollwitzer → "Golwitzer", Sheeran → "Shearon"
  - homophones: "an hour" → "and our", "wait" → "weight", "hand to a stranger" → "had to", "ketchup" →
    "catch up", "octopuses" → "octopus is"
- **Checked slowed down:** "So why doesn't that long night…" (2:28): the "So" is there.
- **For the owner to listen to:** at **8:16**, "Pick one thing you've been **putting** off" is heard as
  "**pushing** off" at three playback speeds. The meaning is the same, and the on-screen text avoids the word, so
  it's fine either way.

## Performance and art direction

- **The host** (left third) talks to the viewer, with a mouth synced to every word, and acts out each line.
- **Story figures act out the studies:**
  - the relaxed student who gets sick
  - three proofreaders with their deadline flags
  - the forgiven student next to the one under a rain cloud
  - the friend who gets "Let it go. Start again."
- **Rooms:**
  - kitchen (hook)
  - campus (semester)
  - study (future you)
  - bedroom (Monday)
  - office desk (deadlines)
  - exam hall (the one habit)
  - living room (rules)
  - kitchen again (ending)
- **Running image:** the junk drawer opens the video, returns at "think back to the start" and again at "go easy
  on yourself", and the ending says "at least the kitchen got cleaned".
- **New drawings** (`tools/icons.mjs`): drawer, octopus, thermometer, oldme ("future you"), star, ketchup, soy,
  cup, dumbbell, and the rooms bgCampus, bgBedroom, bgExam and bgLiving.

## Render note

A 4K render is split into scene parts: `python3 tools/mkparts.py && tools/render-parts.sh`, then concat with
`assets/soundtrack.m4a` at CRF 19. The mix targets -1.8 dBTP so the AAC file measures under -1.5 (-14.0 LUFS, -1.6
dBTP).
