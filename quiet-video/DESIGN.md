---
colors:
  ground: "#A8BDA2"   # sage background (static, whole video)
  ink: "#15241A"      # stickmen, body text
  green: "#0F5A2B"    # *word*  — the insight, the fix, the good outcome
  red: "#A61B14"      # !word!  — conflict, threat, the thing that hurts; strikes and stamps
  muted: "#3F5243"    # quiet supporting lines
  card: "#F1F5EF"
typography:
  display: { family: "Anton", weight: 400, use: "hero words, chapter numbers, UPPERCASE" }
  text: { family: "Montserrat", weights: [600, 800] }
fonts_source: "npm (@fontsource/anton, @fontsource/montserrat) → assets/fonts, no CDN"
lead_seconds: 0.25
---

# Da Real Why — sage / green / red stickman style

- Sage ground (#A8BDA2), dark-ink stickmen with soft cast shadows and a ground shadow under the feet, one idea per beat.
- **Green = insight**, **red = conflict**. Never both on one word; at most one coloured phrase per line.
- Hero words (QUIET, FLOODING, GIVE SPACE) in Anton caps; everything else Montserrat.
- Every element lands 0.25 s before the voice says it, comes in from a side (or pops/slams/draws),
  holds still, and leaves the way it came. The stage clears between ideas.
- Exact hex values are my picks for "green, black and red" — swap them in `theme.json` and rebuild.
- Shadows: text gets a soft text-shadow; stickmen, icons, cards, stamps and strikes get a drop-shadow; stickmen stand on a small ground shadow.
