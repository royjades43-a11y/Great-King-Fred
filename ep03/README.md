# PesaBrain EP03 — "The Boring Way to Get Rich"

A 10:59 HyperFrames episode built on your voiceover: 172 drawn scenes, each starting on the exact word it illustrates.

- `renders/boring-way-web.mp4` — the video (1920×1080, 30 fps)
- `SCRIPT.md` — the voiceover script with fact notes
- `PUBLISH.md` — titles, ad-break times, description with chapters, and tags
- `BEATS.md` — every scene's start time, tag and the words it starts on

## Same identity
Ledger paper, swinging price-tag titles, printing receipts, the ink line that "boils", and the cast: Bean, Impulse and Prof. Calc.

## This episode's own personality
- **A cooking show.** The four ingredients are a recipe. Bean, in a chef's hat, adds each one to a mixing bowl:
  a recipe card drops in, then a labelled jar (TIME, AUTO, INDEX, PATIENCE) tips into the bowl. The finale lines up all four jars.
- **The snowball on the hill.** Compound interest is a $ snowball that grows as it rolls. It comes back for
  "the last years do the most", Ava's head start, "let the snowball roll" and Bean's first push at the end.
- **Ava and Leo.** Two new bean characters (Ava with a red bow, Leo with a slate cap) for the head-start example.
- **The BORING-O-METER** needle swings to ZZZ whenever "boring" comes up.
- **Impulse's temptations:** a 10× rocket, a MOONCOIN, a slot machine and the guru's rented Lambo.

Episode props are in `tools/props3.mjs`; it also reuses EP02's cushion and anvil.

```bash
node tools/build.mjs     # rebuild scenes from tools/beats.mjs + tools/words.json
npm run check
npm run render
```
