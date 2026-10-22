---
colors:
  paper: "#F4F1EA"
  ink: "#151515"
  muted: "#857F76"
  accent: "#E5372A"
  accent2: "#F2B705"
typography:
  display: { family: "Montserrat", weight: 800, tracking: "-0.03em" }
  support: { family: "Montserrat", weight: 600 }
spacing:
  lead_seconds: 0.25
  safe_title: "80% (192..1728 x, 108..972 y)"
components:
  stroke: "10px ink, round caps and joins"
---

# Da Real Why — "Stick & Paper" style

What it is for: a calm, minimalist psychology explainer. One idea per beat, a stickman acting it out,
and words that arrive a quarter-second **before** the voice says them, so the eye is already there when
the ear catches up.

Swap your own theme by editing `theme.json` (same keys as above) and running `npm run build`.

## Rules

- Paper ground, ink lines, **one red accent** that carries meaning (the hurt word, the key number).
  Yellow (`accent2`) only for halo / crown — "status" objects.
- Every element enters from a side (left, right, top, bottom), pops, slams or draws on, then **leaves**:
  nothing piles up. A stage is cleared before the next idea lands.
- Entrances: 0.45–0.6 s, long-tailed `expo.out`/`power4.out` with motion blur on the move.
  Exits: ~45% shorter, `power3.in`, back the way they came.
- Every visual is timed off the voiceover word that names it, minus `lead_seconds` (0.25 s).
- Titles land and hold dead still. The only thing that keeps moving is the stickman acting.
- Words: max ~6 on screen at once, hero word in accent. On-screen text never repeats a long sentence
  word for word: it carries the 2–4 words that matter.

## Banned

Bullet slides, icons in circles, three cards in a row as decoration, fade-and-slide-up on everything,
floating/pulsing loops on text, gradients, drop shadows, stock emoji.
