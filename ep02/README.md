# PesaBrain EP02 — "Why You'll Never Feel Rich (Even When You Earn More)"

A 5:36 HyperFrames episode built on your voiceover: 112 drawn scenes, each starting on the exact word it illustrates.

- `renders/never-feel-rich-web.mp4` — the video (1920×1080, 30 fps)
- `BEATS.md` — every scene's start time, length, tag and the words it starts on
- `PUBLISH.md` — titles, description with chapters, and tags

## Same identity
Ledger paper, swinging price-tag titles, printing receipts, the ink line that "boils", and the cast:
Bean (you), Impulse (your brain) and Prof. Calc (the math). Characters and props come from `../moneybrain/tools/kit.mjs`.

## This episode's own personality
- **The magic show.** Impulse is a stage magician in a top hat with a wand. Each of the three tricks opens with
  red curtains parting and a giant playing card flipping over (TRICK #1 THE TREADMILL, #2 THE COMPARISON, #3 THE FOCUSING ILLUSION).
  For the four fixes, Bean takes the stage with the hat and wand, and Impulse watches, foiled.
- **The runaway finish line.** A RICH finish line slides away whenever Bean gets close, and Impulse is caught moving it.
  In the fixes, Bean writes his own ENOUGH line and hammers it down, stamped STAYS PUT.
- **The highlight-reel phone.** A phone feed scrolls other people's best moments; one post flips over to show the $18,400 card statement.
- **The cash buffer.** A cushion that catches the EMERGENCY anvil; later Bean stands on it.

Episode-only props are in `tools/props2.mjs` (curtains, stage, trick cards, finish line, social posts, cushion, anvil).

```bash
node tools/build.mjs     # rebuild scenes from tools/beats.mjs + tools/words.json
npm run check
npm run render
```
