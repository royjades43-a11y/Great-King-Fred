# Video 5 voiceover

- **File:** `assets/voiceover.mp3` (9:18, -16 LUFS before the final mix).
- **Read from:** `script/direction.md` (copy of `scripts/05-always-late-voice-direction.md`), using
  `voice/directed.py`: same voice as videos 3 and 4 (`am_puck:0.6,am_fenrir:0.4`), base pace 0.92,
  with each line's pace and pauses taken from the direction marks (109 takes).

## Verification

Whisper transcribed the voiceover in pause-cut clips and it was compared with the script
(`timing/heard.json`): every sentence is present and in order; 1,333 of 1,460 words matched exactly.
The other differences are spelling only (digits, "$" for "dollars", hyphens, names such as Kahneman and
Flyvbjerg). Three short spots Whisper misheard ("Lie number" as "line number", "Shower" as "shall we",
"a sneakier" as "to sneak your") were checked: the phonemes Kokoro used are correct.
