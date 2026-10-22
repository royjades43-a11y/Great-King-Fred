---
colors:
  ground: "#0B0D0B"   # near-black background
  ink: "#F4F4EF"      # stickmen, body text
  green: "#2EE66B"    # *word*  — the insight, the fix, the good outcome
  red: "#FF3B30"      # !word!  — conflict, threat, the thing that hurts; strikes and stamps
  muted: "#9AA39A"    # quiet supporting lines
  card: "#161A16"
typography:
  display: { family: "Anton", weight: 400, use: "hero words, chapter numbers, UPPERCASE" }
  text: { family: "Montserrat", weights: [600, 800] }
fonts_source: "npm (@fontsource/anton, @fontsource/montserrat) → assets/fonts, no CDN"
lead_seconds: 0.25
---

# Da Real Why — black / green / red stickman style

- Black ground, white line stickmen, one idea per beat.
- **Green = insight**, **red = conflict**. Never both on one word; at most one coloured phrase per line.
- Hero words (QUIET, FLOODING, GIVE SPACE) in Anton caps; everything else Montserrat.
- Every element lands 0.25 s before the voice says it, comes in from a side (or pops/slams/draws),
  holds still, and leaves the way it came. The stage clears between ideas.
- Exact hex values are my picks for "green, black and red" — swap them in `theme.json` and rebuild.
