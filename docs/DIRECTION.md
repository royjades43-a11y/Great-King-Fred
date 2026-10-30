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

- **Something moves at least every 2.5 seconds** (the series `pace` setting), whether the spotlight swings, a figure acts, the camera pushes, or ink draws on a map. Act out what the voice says: lunges, recoils, swaps between poses, flashes and quakes. The director adds an automatic spotlight "breath" to any longer gap, and the timing report flags scripted gaps over 3.2 s. Treat a breath as a sign the script needs a real cue there.
- **The light says what the voice says.** Put a `[spot:x]` before the noun the narrator is naming, not after. The spotlight lands as the word is spoken.
- **Entrances are events.** Bring characters on (`[enter:x]`) at the moment they enter the story, not at the scene start.
- **Push in on the emotional line** (`[push:x]`), at most once per scene.
- **Maps for movement, stages for people.** Use a map scene whenever the story moves across country, and draw the route in ink as the narrator describes it.
- **Vary the sets.** Never put two consecutive scenes on the same set and time of day.

## Camera and faces

- **Film it, don't stage it.** Cut within a scene, roughly every 3 to 6 seconds in dialogue and action. Start wide to show where we are, go medium for an action, and go close for a feeling.
- **Dialogue is shot, reverse shot.** Cut to whoever is speaking (`[cut:delilah:close]` then `[cut:samson:close]`), and use a two-shot (`[cut:samson:two:delilah]`) when the line is about both of them.
- **Return wide for the big physical moments**: the burst ropes, the collapse, the thousand fallen.
- **Faces carry the emotion.** Change the expression on the beat it changes in the story (`[face:samson:afraid]`), and especially in close-ups.
- **Focus pulls are automatic**: the window softens behind a count, a timeline or a centred line of glass words.

## On-screen words

- **Use them sparingly**: about one a minute, never more than one per scene. Words on screen compete with the picture and the voice, so save them for the line the viewer should remember.
- **Glass words** (`[say:…]`) go on the hook and the turning points: *BLIND. IN CHAINS.*, *HE DID NOT KNOW*, *IT WAS THE LAST.*, *THAT IS GRACE.*
- **Speech scrolls** (`[scroll:who|…]`) are only for a short line a character actually speaks that matters to the story, like Delilah's cry or the final prayer.
- Never put up words that just repeat the narration word for word, unless the line is the point of the scene.

## Sound

- The music mood changes with the act: `mystery` → `tense` → `somber` → `wonder` → `battle` → `triumph`.
- The music-box motif (D–F–A–G–F–E–D) opens every mood change. It's the channel's signature, so keep it in every episode.
- Music sits about 16 dB under the voice and dips further while the narrator speaks.

## Accuracy

Each episode file starts with a comment listing its sources. Dates, numbers and quotations are checked against them. Where historians disagree, the narration says so.
