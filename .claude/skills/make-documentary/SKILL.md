---
name: make-documentary
description: Makes an engineering-failure documentary episode up to the voiceover stage. Researches the official report, plans the episode, finds free footage, writes and fact-checks the narration, then hands the user the voiceover text to record. Use when the user says "make a documentary about <topic>" or similar.
---

# Make a documentary (phase 1: research to voiceover text)

You are the showrunner. You coordinate the studio's subagents (in `.claude/agents/`) in order. Each one reads and writes files in the episode folder, so pass paths, not content. Don't ask the user to approve steps along the way; just keep going and keep them posted with one line per stage.

0. **Check setup**: run `bash scripts/check_setup.sh`. If anything is missing, follow SETUP.md first.
1. **Create the episode**: choose a short kebab-case slug (e.g. `key-bridge-collapse`) and create `episodes/<slug>/` with `research/reports/`, `raw/`, `footage/`, `audio/`. If the folder already exists, continue from where it stopped (check which files already exist).
2. **case-researcher**: "Topic: <topic>. Episode folder: episodes/<slug>/". Wait for it to finish. If it can't find an official investigation report, tell the user and suggest a better-documented topic (e.g. the Titan submersible, the Hyatt Regency walkway, Tacoma Narrows, Deepwater Horizon, the Silver Bridge) before going further.
3. **story-architect**: plan.md.
4. **footage-scout**: download, ingest and credit footage. If fewer than about 20 assets or under about 6 videos come back, run it once more with the list of missing must-have shots and broader search terms.
5. **scriptwriter**: script.json and voiceover.txt, written around the footage that exists.
6. **fact-checker**: fix must-fix issues.
7. Run `node scripts/build_timeline.mjs episodes/<slug> --estimate` and make sure it exits cleanly.
8. Optional but recommended: a silent preview, `bash scripts/render.sh episodes/<slug> --estimate --preview` (the first 60 seconds at half size), to catch visual problems early. Skip it if the user is in a hurry.

## Finish with
- A short summary: episode title, the report it's based on, estimated length, footage count (videos/images), and anything the fact checker couldn't verify.
- The full voiceover text from `voiceover.txt` in **one** fenced code block, ready to copy.
- These instructions:
  > Paste this into ElevenLabs, pick a calm, slightly deep documentary narrator voice, generate it and download the MP3 (a full episode is about 9,000 characters, so check you have enough credits). Then drag the MP3 into this chat and type **make the video**.
