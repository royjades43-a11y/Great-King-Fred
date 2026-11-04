# Video 7 voiceover

- **File:** `assets/voiceover.mp3` (8:02, -16 LUFS before the final mix; the finished video runs past 8:00).
- **Read from:** `script/direction.md` (copy of `scripts/07-couples-who-last-voice-direction.md`) with
  `voice/directed.py --pace 1.12 --pauses 0.5`: same voice as videos 3 to 6, each line's pace and pauses
  from the direction marks (119 takes).

## Verification

Whisper transcribed the voiceover in pause-cut clips and it was compared with the script
(`timing/heard.json`): every sentence is present and in order; 1,370 of 1,416 words matched exactly.
The rest are spelling only (digits, hyphens, names: Gottman, Levenson, Aron, Shelly).

Fixed on the way (guide updated too):
- "Mockery. Sarcasm. Eye-rolling." ran together: each word now gets a long beat.
- "They balanced it." was clipped as a one-line take: it now flows on from the sentence before.
