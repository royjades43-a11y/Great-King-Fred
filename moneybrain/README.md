# PESABRAIN — "The $5 Coffee Myth Is Wrong"

A 6:53 HyperFrames episode built on your four ElevenLabs voiceover parts. There are 155 drawn scenes, and each
one starts on the exact word it illustrates. On average the picture changes every 2.7 s.

- `renders/coffee-myth-web.mp4` — the finished video (1920×1080, 30 fps, 48 MB; the full-quality render is too big for GitHub, so re-render it with `npm run render`)
- `BEATS.md` — every scene: start time, length, tag text and the words it starts on
- `IDENTITY.md` — the channel's look: cast, palette, type and recurring devices

## How it's built

| File | What it holds |
|---|---|
| `tools/words.json` | Word-level timings for each voiceover part (Whisper, run locally) |
| `tools/kit.mjs` | The drawing kit: Bean, Impulse, Prof. Calc and about 50 props |
| `tools/beats.mjs` | The episode: one entry per idea, with the words it starts on, its price-tag title and the drawing |
| `tools/build.mjs` | Times every beat from the transcript and writes `compositions/bNNN.html`, `index.html` and `BEATS.md` |

```bash
node tools/build.mjs          # rebuild after editing beats or the kit
npm run check                 # HyperFrames lint + runtime checks
npx hyperframes snapshot --at 12,45,130   # look at frames
npm run render                # MP4
```

### Making the next episode
1. Put the voiceover parts in `assets/audio/` and list them in `PARTS` in `tools/build.mjs`.
2. Transcribe them into `tools/words.json`: one array per part, each word as `{ w, s, e }` (word, start, end).
3. Write the beats in `tools/beats.mjs`. `at:` is the first few words of the idea, exactly as they appear in the
   transcript. Inside `draw`, `S.put(svg, x, y, scale, { at: "word" })` makes something appear on that word;
   `S.receipt`, `S.countText` and `S.chapter` cover receipts, count-up numbers and stamped chapter cards.

The voiceover is unchanged; the four parts sit back to back with a 0.6 s gap.
Sound effects come from the HyperFrames library: pop for tags, typing for receipts, chime for big numbers, a bass hit for stamps.
There's no music bed yet.
