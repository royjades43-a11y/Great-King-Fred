# Engineering Failure Studio

Makes ~10 minute documentaries about engineering failures (bridge collapses, ship blackouts, dam breaches, chemical plant explosions) from official investigation reports and free-to-use footage. The user types a topic, records the narration in ElevenLabs, and gets a finished 1080p video.

## Routing
- "follow setup.md" → follow `SETUP.md`.
- "make a documentary about …" → `make-documentary` skill (research, plan, footage, script, fact check, voiceover text).
- user drops an MP3 / "make the video" → `make-the-video` skill (word timing, render, QA, YouTube description).
- "I don't like X" / "change Y" in a video → edit the renderer in `studio/src/` (or the episode's script.json) and re-render. The user doesn't need to touch code.

## The team (`.claude/agents/`)
| agent | does | writes |
|---|---|---|
| case-researcher | reads the official report, builds the sourced timeline and causal chain | research/case-file.md, research/sources.md |
| story-architect | hook, acts, beats, shot wishlist | plan.md |
| footage-scout | finds public-domain / CC footage, downloads, credits | footage/, footage/manifest.json, CREDITS.md |
| scriptwriter | narration written around footage that exists | script.json, voiceover.txt |
| fact-checker | verifies every claim and quote against the report | factcheck.md (+ fixes) |
| video-editor | word timing, timeline, Remotion render, fixes | build/, out/<slug>.mp4 |
| frame-inspector | looks at frames for broken or mismatched visuals | build/qa/inspection.md |
| publisher | titles, description, chapters, credits | out/youtube-description.md |

## Episode folder
```
episodes/<slug>/
  research/case-file.md  research/sources.md  research/reports/*.pdf
  plan.md
  raw/                      original downloads (not committed)
  footage/<id>.mp4|.jpg     render-ready media, made by scripts/ingest_media.py
  footage/manifest.json     every asset: file, type, duration, source, author, licence, description
  CREDITS.md                generated from the manifest
  script.json  voiceover.txt  factcheck.md
  audio/voiceover.mp3
  build/words.json  build/props.json  build/chapters.txt  build/qa/
  out/<slug>.mp4  out/youtube-description.md
```

## Tools
- `bash scripts/check_setup.sh`: what's installed and what's missing
- `python3 scripts/ingest_media.py <ep> --id … --src … --source-url … --license …`: add footage (also `--list`, `--remove`)
- `.venv/bin/python scripts/align_words.py <ep>`: time every voiceover word (faster-whisper)
- `node scripts/build_timeline.mjs <ep> [--estimate]`: script + words + manifest → build/props.json; validates everything
- `bash scripts/render.sh <ep> [--estimate] [--preview]`: render + QA
- `python3 scripts/check_frames.py <ep>`: contact sheets, black/frozen-frame detection
- Renderer: Remotion project in `studio/` (`Documentary.tsx`, `scenes/`, `theme.ts`). Visual kinds: `footage` (full screen), `stamp` (timestamp over footage), `route` (animated channel map + clock), `power` (animated power diagram), `chart`, `compare` (to-scale), `evidence` (pinned photos, notes, red string), `document` (report quote with highlight), `title`.
- `python3 scripts/stock_search.py "<terms>"`: Pexels/Pixabay B-roll search (needs PEXELS_API_KEY / PIXABAY_API_KEY env vars)
- Set `EFS_BROWSER=/path/to/chrome` to make Remotion use an existing Chrome instead of downloading one.

## Non-negotiables
- Facts come from the official report; never invent numbers, quotes or causes.
- Footage must be public domain, CC0, CC BY or CC BY-SA (or an equivalent open government licence), or free stock under the Pexels / Pixabay licences for representative B-roll only, and recorded in the manifest with its source. No news-broadcast, YouTube re-upload or paid stock footage.
- Representative B-roll is never captioned as the subject and never stands in for the event's decisive moments.
- Visual and sound standards: `docs/VISUAL_STANDARDS.md` (60%+ moving video, no shot reuse, music bed at -14 LUFS master).
- Narration never describes a shot the episode doesn't have.
