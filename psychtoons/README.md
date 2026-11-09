# Stickman psychology explainer (HyperFrames)

A 30 s HyperFrames video in the stickman explainer look: a big round white head, line arms and legs,
a coloured tunic, flat muted colours on cream paper and hand-lettered titles in caps.
**Every idea in the voiceover gets its own drawn scene, held for 2.5 s**, with the line's key words as the title.

- `renders/psychtoons-style-demo.mp4`: the rendered video (1920×1080, 30 fps)
- `SCRIPT.md`: the voiceover line for each 2.5 s scene
- `tools/draw.mjs`: drawing kit (stickman with poses, faces and hair; rulers, clouds, calendars, doors, props, backgrounds)
- `tools/scenes.mjs`: the 12 scenes (line, title, drawing, motion)
- `tools/build.mjs`: writes `compositions/sNN.html` + `index.html` + `SCRIPT.md`

## Make a new episode

1. Edit `tools/scenes.mjs`: one entry per idea (`title`, `line`, `bg`, `body`, `anim`).
2. `node tools/build.mjs`
3. `npm run check`, then `npx hyperframes snapshot --at 1.9,4.4` to look at frames
4. `npm run render`

Change `BEAT` in `tools/build.mjs` to change how long each idea stays on screen.
To add narration, put the file at `assets/voiceover.mp3` and uncomment the `<audio id="voiceover">` line in `index.html`
(or in the generator so it survives rebuilds).

The look in motion: each scene pops its parts in one by one, the camera pushes in slowly (3.5%), and the
lines "boil" (redraw slightly differently 8 times a second) so it reads as hand-drawn. A soft whoosh plays on every cut
and a pop when the key element of each scene lands.

Font: Gochi Hand (SIL OFL, `assets/fonts/OFL-GochiHand.txt`). GSAP 3.15.0 is in `assets/vendor/` so renders need no network.
