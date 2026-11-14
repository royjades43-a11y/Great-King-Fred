---
name: make-the-video
description: Turns the user's recorded voiceover (MP3 from ElevenLabs) into the finished 1080p documentary with word-timed captions, then writes the YouTube description with credits. Use when the user drops an audio file and says "make the video", or asks to render an episode.
---

# Make the video (phase 2: voiceover to finished episode)

1. **Which episode?** Use the one discussed in this conversation. Otherwise pick the most recently changed `episodes/*/script.json` without an `out/<slug>.mp4`. Ask only if it's genuinely ambiguous.
2. **Find the audio**: use the path of the file the user attached or dragged in. If there's no path, look for the newest .mp3/.wav/.m4a in the episode folder, `~/Downloads`, or the working directory.
3. **video-editor**: "Episode: episodes/<slug>/. Voiceover: <path>. Make the video." It places the audio, times every word, builds the timeline, renders 1080p and runs QA.
4. **frame-inspector**: inspect the render. If it reports blockers, send them back to the video-editor to fix and re-render. Do at most 3 rounds. Polish items can wait for the user.
5. **publisher**: out/youtube-description.md.

Don't stop to ask for approval along the way.

## Finish with
- Where the video is saved (full path), its length, and the QA verdict.
- The YouTube description in one fenced code block (with chapters and every credit).
- A reminder: "Watch the whole video before uploading. The footage is free to use, but your narration and story are what make the channel yours. If anything bugs you, tell me in plain English and I'll change it."
