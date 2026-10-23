# Free AI voiceovers

`voiceover.py` turns a script (our `.md` scripts work as-is) into a studio-processed male
voiceover, ready for the video pipeline.

```
pip install kokoro-onnx soundfile numpy        # once (the Kokoro model downloads on first use)
python3 voice/voiceover.py scripts/02-people-who-dont-get-tattoos.md -o voiceover.wav
python3 voice/voiceover.py SCRIPT --voice am_fenrir --speed 0.95
python3 voice/voiceover.py SCRIPT --voice "am_michael:0.6,am_fenrir:0.4"     # blended voice (default)
```

- **Kokoro (default, free, offline):** male voices `am_michael`, `am_fenrir`, `am_puck`, `am_onyx`,
  `am_echo`, `am_eric`, `am_liam`, `bm_george`, `bm_lewis`, `bm_daniel`, `bm_fable`, or a weighted blend.
  Compare them in `samples/`.
- **Gemini (Google AI Studio voices):** free tier with an API key from
  https://aistudio.google.com/apikey, read from the `GEMINI_API_KEY` environment variable.
  `--engine gemini --voice Charon` (also Orus, Fenrir, Puck, Iapetus…); `--style` tells it how to
  read ("calm, warm storyteller…"). Change the model with `GEMINI_TTS_MODEL`.
- **Flow (default `--flow paragraph`):** each paragraph is voiced in one take, so the intonation
  carries across sentences instead of resetting at every full stop (that reset made the old voice
  sound choppy). Pauses between paragraphs vary a little (0.55–0.9 s). Compare
  `samples/flow/blend-paragraph-flow.mp3` with `samples/flow/blend-old-sentence-by-sentence.mp3`.
  `--flow sentence` is the old mode: one take per sentence with fixed pauses.
- **Timing for the edit:** `--words est.json` writes each take's exact start and end. Then run
  `node tools/align.mjs assets/voiceover.wav est.json` in the video project: Whisper times the
  words inside each take (488 of 501 words on the tattoo script; the rest are estimated inside
  the exact take window).
- **Writing for flow:** fewer, longer sentences joined with "and", "but", "so" read more naturally
  than many short fragments. Keep the script's full stops for real beats.
- **Sound:** high-pass, a little chest, less boxiness, presence and air, de-essing and gentle
  compression, then -16 LUFS. The video mix brings the finished film to -14.
