# Reference video: frame-by-frame analysis

Source: "There's a certain kind of person" (4:05.8, 1920×1080, 30 fps). I sampled it at 1 frame per
second (246 frames) and at 30 fps around transitions. Values were measured from the pixels.

## Measured

| What | Reference | Our video now |
| --- | --- | --- |
| Background | solid `#A7BCA0`, static for the whole video, no texture | `#A8BDA2` (your code), static |
| Main text / lines | pure black `#000000` | `#000000` |
| Highlight | one red, `#BF101D`, on the key phrase of each line | `#B00E1B` (same red, a touch darker so it reads on sage) |
| Type | heavy geometric sans (Montserrat-style ExtraBold), tight tracking, sentence case; big end title in caps | Montserrat 800, tight tracking; hero lines in Montserrat caps (Anton removed) |
| Text size | ~55–65 px body, two-line stacks with very tight leading, second line often red | 48–84 px, hero 110–190 px |
| Cuts | one continuous stage: no scene cuts, the background never changes | same |

## Grammar

- **Text builds word by word, as the voice speaks.** Each word appears instantly with no slide (frames
  5.80→6.47 s: "But" → "But never" → "…their" → "…own" → "…face"). → **Adopted**: every line in our
  video now reveals word by word, each word 0.25 s before it is spoken.
- **Pictures fade in about 0.3 s after the text that names them** (the face at 6.33–6.73 s goes from
  30% to 100% opacity, with no movement).
- **The stage clears all at once.** Everything fades out in 2–3 frames (5.60→5.67 s), then the next
  line starts on an empty stage. → Already ours: each idea clears before the next one lands.
- **Layout:** text and picture sit side by side as one compact group (text left, picture right, or
  the other way round), placed at varying heights. Lots of empty sage around it.
- **Picture types:** solid black pictograms, thin-line sketches (a hand-drawn stickman with a tie),
  outline icons, and a few small colour clip-art pieces.
- **Pacing:** a new picture or line about every 1.5–3 s; nothing holds still for more than ~3 s.
- **No shadows** in the reference. Yours keep them, as you asked.

## What I kept from your video (you called it perfect)

- Elements still enter from different sides and leave the way they came, not with the reference's
  plain fades.
- The stickmen act out the poses, with a soft drop shadow and a ground shadow under their feet.
- The 0.25 s lead before every spoken word.
