# Shorts layout (YouTube safe zone)

Every Short from now on uses this layout (`quiet-video/shorts/make.mjs`; copy it into each new video
project). Measured from the YouTube Shorts player, in 1080×1920 video pixels:

| YouTube covers | Area |
| --- | --- |
| Top bar (search, menu) | y 0–125, full width |
| Like / dislike / comments / share / remix buttons | x 924–1080, from y 744 down |
| Channel name, title, Subscribe, related video | y 1363–1920, full width |

What we put where:

| Element | Position |
| --- | --- |
| Hook title (2 lines, 96 px, one red word) | x 50–1030, top at y 185 (above the buttons, so it may use full width) |
| Picture (title-safe crop of the 4K master) | x 20–900, y 450–978 |
| Captions (86 px, word by word) | x 40–880, y 1010–1260 |
| Channel handle | not drawn: YouTube already shows the channel name |

Nothing important goes right of x 900 below y 744, or below y 1300.
`old-vs-new-safe-zone.png` shows the old and new Short 03 with the YouTube overlays in red;
`03-why-you-freeze-NEW-LAYOUT.mp4` is a full render in the new layout.
