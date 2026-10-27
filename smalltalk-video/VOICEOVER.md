# Video 4 voiceover

- **File:** `assets/voiceover.mp3` (8:02, -16 LUFS; the final mix brings it to -14).
- **Voice:** same as video 3: Kokoro blend `am_puck:0.6,am_fenrir:0.4`, speed 0.88, 0.55 s between
  sentences, one take per paragraph (15 takes).
- **Read from:** `script/tts.txt` (years and numbers written out for the voice).

## Verification

Whisper transcribed the whole voiceover in short pause-cut clips and it was compared with the script
(`timing/heard.json`). Every sentence is spoken, in order; 1,397 of 1,460 words were matched exactly.
The remaining differences are spelling only (digits, hyphens, names) plus one word Whisper invented at
a clip boundary ("took place grooming's job"), which a separate check of that span confirmed is not in
the audio.

Fixed on the way (script wording updated everywhere):
- "writing down everything" sounded like "riding down" → "recording everything"
- "small-talk hater" ran together → "If you hate small talk…" / "do you hate small talk…"
