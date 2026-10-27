# Video 3 voiceover

- **File:** `assets/voiceover.mp3` (9:21, 48 kHz stereo, -16 LUFS; the final mix brings it to -14).
- **Voice:** free Kokoro blend `am_puck:0.6,am_fenrir:0.4`, the closest match to the video 1 voice.
  Speed 0.88, 0.55 s between sentences, one take per paragraph (17 takes).
- **Read from:** `script/tts.txt`, the script with numbers written out and names spelled for the
  voice (Dezzy, Dessy-loo, Zye-onts, Seh-dick-ih-deez, ree-runs). The words heard are the script's.

```
python3 ../voice/voiceover.py script/tts.txt -o .work/vo.wav --voice "am_puck:0.6,am_fenrir:0.4" \
  --speed 0.88 --sentence-pause 0.55 --words .work/est.json
node tools/align.mjs assets/voiceover.mp3 .work/est.json   # word timing + timing/heard.json
```

## Verification

Whisper transcribed every take in 20-second windows and the transcript was compared with the script
(`timing/heard.json`).
- Every sentence is spoken, in order. Two spans the checker missed (lockdown paragraph, "at
  twenty-five") were re-transcribed on their own and are present.
- The remaining differences are spelling only: numbers as digits, "$" for "dollars", US/UK spelling,
  hyphens.
- Fixed on the way: "Desi" was read as "Daisy"; "reruns" was read as "ruh-runs";
  "In two thousand, two researchers" was heard as "2002" (now "In the year two thousand").
- 1,510 of 1,707 words carry Whisper timestamps; the rest are placed inside their exact take window.
