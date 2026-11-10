# PesaBrain EP04 — "401(k), IRA or Roth? The Order That Actually Matters"

A 9:26 HyperFrames episode built on your voiceover: 132 drawn scenes, each starting on the exact word it illustrates.

- `renders/which-account-web.mp4` — the video (1920×1080, 30 fps)
- `SCRIPT.md` — the voiceover script with fact notes
- `PUBLISH.md` — titles, ad-break times, description with chapters, and tags
- `BEATS.md` — every scene's start time, tag and the words it starts on

## Same identity
Ledger paper, price-tag titles, receipts, the ink line that "boils", Bean, Impulse and Prof. Calc, plus EP03's snowball.

## This episode's own personality: moving day
- **Account boxes.** Every account is a labelled cardboard box. Traditional boxes are stamped TAX LATER (red) and Roth boxes TAX NOW (olive). Storage-unit doors show where the snowball will live.
- **The staircase.** A 5-step staircase (MATCH → PROTECT → ROTH IRA → 401(K) → BROKERAGE) lights up one step at a time, with Bean climbing it.
- **The farmer.** Bean in a straw hat: a TAX bite chomps the huge harvest (traditional) versus the small seed bag (Roth).
- **The cash trap.** IRA money lands as a pile of cash that gathers cobwebs until Bean presses BUY.
- **The job-change mistake.** A moving truck labelled NEW JOB, the old-401(k) letter, Impulse begging to cash it out, a stop sign and a receipt of what cashing out costs.

Episode props are in `tools/props4.mjs`; it also reuses EP02's cushion and anvil and EP03's snowball, hill and jars.

```bash
node tools/build.mjs
npm run check
npm run render
```
