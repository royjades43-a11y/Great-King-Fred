# Direction guide

The rules every episode is scripted and directed to. The director (`lantern/director.py`)
enforces the mechanical ones; the rest are on the writer, which is usually Claude.

## Structure

| Beat | Length | Job |
|---|---|---|
| **Cold open** | 20–40 s | One paradox or mystery, stated in the first sentence. No context, no "in this video". The title card comes at the end of the cold open, after the hook has landed. |
| **Act I – the stakes** | 15–20% | Why this moment matters and what could be lost. Ends on a turn ("For now."). |
| **Act II – the fall** | 25–30% | The low point. This is where the legend or human-detail story goes: the cakes, the hut. |
| **Act III – the return** | 25–30% | Rally, confrontation, and a twist the viewer didn't expect (baptism, not execution). |
| **Epilogue – the payoff** | 10–15% | Answer the cold open's question in its own words ("…the only one we still call *the Great*"). |

Each act opens with a curtain and a ticket title (`ACT II | Twelfth Night`), which also gives YouTube natural chapter markers.

## Writing for the ear

- **Short sentences carry weight.** Put the key fact last: "It took York." "Wessex."
- **Write numbers as they're spoken.** Write "eight seventy-eight" rather than "878", because the voice reads digits literally.
- **Open loops.** End scenes on a turn ("For now.", "This time, he kept it."), so the viewer waits for the answer.
- **Name a legend as a legend.** Say when a story was written down and whether it's trusted, then say what it tells us that *is* true. Viewers trust a channel that does this.
- **Concrete over abstract.** Use "Twelfth Night", "the dead of winter", "a scrap of dry ground" rather than "a surprise attack" or "a remote location".

## Visual rhythm

- **Something changes every 4–6 seconds**, whether the spotlight swings, a figure enters, the camera pushes, or ink draws on a map. The director adds an automatic spotlight "breath" to any gap over 5.5 s and the timing report flags anything over 7 s. Treat a breath as a sign the script needs a real cue there.
- **The light says what the voice says.** Put a `[spot:x]` before the noun the narrator is naming, not after. The spotlight lands as the word is spoken.
- **Entrances are events.** Bring characters on (`[enter:x]`) at the moment they enter the story, not at the scene start.
- **Push in on the emotional line** (`[push:x]`), at most once per scene.
- **Maps for movement, stages for people.** Use a map scene whenever the story moves across country, and draw the route in ink as the narrator describes it.
- **Vary the sets.** Never put two consecutive scenes on the same set and time of day.

## Sound

- The music mood changes with the act: `mystery` → `tense` → `somber` → `wonder` → `battle` → `triumph`.
- The music-box motif (D–F–A–G–F–E–D) opens every mood change. It's the channel's signature, so keep it in every episode.
- Music sits about 16 dB under the voice and dips further while the narrator speaks.

## Accuracy

Each episode file starts with a comment listing its sources. Dates, numbers and quotations are checked against them. Where historians disagree, the narration says so.
