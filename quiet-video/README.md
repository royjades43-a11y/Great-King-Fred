# The Psychology of People Who Go Quiet in a Fight — HyperFrames edit

4:06, 1920×1080, 30 fps, cut to your voiceover (`assets/voiceover.mp3`). Every element lands
**0.25 s before** the word that names it is spoken.

```
script/script.json   the edit: one beat per spoken sentence + elements cued to words ("b19:flooding")
theme.json           colours, fonts, lead time, voiceover file
timing/words.json    word timestamps of your voiceover (local Whisper)
timing/cues.txt      generated cue sheet: element → word → spoken time → in/out
tools/build.mjs      generates index.html + compositions/*.html
tools/transcribe.mjs offline word timestamps (Whisper base from npm, no network)
tools/vendor.mjs     copies GSAP + fonts from node_modules into assets/ (runs on npm install)
```

## New voiceover → new video

```
npm install                                  # libraries + fonts, all from npm
cp my-voiceover.mp3 assets/voiceover.mp3
npm run transcribe -- assets/voiceover.mp3   # → timing/words.json
# edit script/script.json: beats = your sentences, elements = what appears on which word
npm run build && npm run check
npm run dev                                  # Studio preview
npm run render                               # → renders/people-who-go-quiet-in-a-fight.mp4
```

## Soundtrack (music + sound effects)

```
python3 tools/music.py   # original piano score, one section per scene, downbeat on every scene change
python3 tools/mix.py     # voice + piano bed (ducked under speech) + 30 quiet SFX → -14 LUFS / -1.5 dBTP
npm run build            # index.html now plays assets/soundtrack.m4a
```
Needs `pip install numpy scipy`. Credits: `assets/sfx/CREDITS.md`. SFX placement: `timing/sfx.txt`.
