# PesaBrain Shorts — layout around YouTube's buttons

Canvas: **1080 × 1920**, 30 fps. Zones measured from the top. These positions are approximate: YouTube moves its buttons
between app versions, phones and the web player, so always check a Short on a real phone before publishing.

| Zone | y range | What goes there |
|---|---|---|
| **Top bar** (YouTube: "Shorts", search, camera) | 0–210 | Background only |
| **Headline tag** | 230–420 | The price-tag headline. It's there from frame 1 and stays all Short |
| **Main stage** | 430–1240 | Characters and props. The ground line is at **y = 1240** |
| **Captions** | 1270–1440 | Burned-in captions, 2–3 words, 70 px Archivo Black, white with a thick ink outline, spoken word in mustard |
| **Bottom block** (channel, Subscribe, title, sound, progress bar) | 1480–1920 | Background only: the ledger paper and the ground |
| **Right column** (Like, Dislike, Comment, Share, Remix, sound disc) | x 900–1080, y ~760–1700 | Background only. Nothing important here, ever |

## The rules
1. **The visual centre is x = 470, not 540.** Everything is centred slightly left, so it balances against the right-hand button column and never slides under it.
2. **The usable width is x 48–900.** Captions and tags never go wider than this.
3. **One headline tag per Short,** placed in frame 1. Sound-off scrollers read the hook before they hear it.
4. **Characters stand on y = 1240,** so their feet sit just above the captions and well above the channel name and Subscribe button.
5. **Captions go under the stage, not at the bottom.** The bottom is where YouTube puts the title and channel name, so captions there would collide with them.
6. **A comment sticky note** (a yellow note with the question) appears in the stage area during the comment question. It points down-right, toward the comment button.
7. **Big numbers go top-left or centre-left** (prices, $ amounts), never top-right, where the search and camera icons sit.
8. **No end card or logo outro.** It breaks the loop. The PesaBrain identity comes from the cast, the paper and the tags.

## Files
- `brand/out/shorts-safe-zones.png` — the zones drawn on the canvas
- `brand/out/shorts-sample-frame.png` — Short 1's first frame
- `brand/out/shorts-sample-frame-with-yt-ui.png` — the same frame with YouTube's buttons drawn on top, to check placement
- Rebuild with `node shorts/brand/layout.mjs`
