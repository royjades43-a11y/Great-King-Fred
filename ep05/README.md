# PesaBrain EP05 — "Why Your Credit Card Balance Never Shrinks (And How to Break the Trap)"

An 8:59 HyperFrames episode built on your voiceover: 126 drawn scenes, each starting on the exact word it illustrates.

- `renders/credit-trap-web.mp4` — the video (1920×1080, 30 fps)
- `SCRIPT.md` — the voiceover script with fact notes
- `PUBLISH.md` — titles, ad-break times, description with chapters and sources, tags, pinned comment
- `BEATS.md` — every scene's start time, tag and the words it starts on

## Same identity
Ledger paper, price-tag titles, receipts, rubber-stamp chapters, the ink line that "boils", Bean, Impulse and Prof. Calc, plus EP03's snowball hill.

## This episode's own personality: the anchor
- **The MINIMUM anchor.** A heavy anchor on a chain drags Bean's payment down; the scene floods slate-grey as it sinks.
- **The card statement.** One recurring statement with the gold MINIMUM DUE $170 box and the warning box nobody reads.
- **The debt snowball, rolling the wrong way.** A pink DEBT ball rolls down EP03's hill toward Bean; by the end Bean's own $ snowball rolls the right way.
- **The ostrich.** Head in the sand, labelled DEBT, for the ostrich effect.
- **Two ladders out of a hole** for avalanche vs. snowball, plus the avalanche mountain and the 5-vs-15-month timeline.
- **The red telephone** for the call that lowers the rate, and scissors for each card Bean pays off.

Episode props are in `tools/props5.mjs`; it reuses EP02's cushion, EP03's hill and snowball and EP04's trap.

```bash
node tools/build.mjs
npm run check
npm run render
```
