# Nudgebird — Voiceover Script (for ElevenLabs)

> **Status:** recorded. The ElevenLabs take ("Josh", eleven_v4) is in `assets/voice/source/vo-full-josh.mp3`. It was loudness-normalized to about −16 LUFS (true peak −1.5 dB), cut into `vo-01…vo-15.mp3` at the pauses between lines, and retimed in `build.py` to the real line lengths. To swap a single line, replace its `vo-XX.mp3` and update its length in the `VO` table.

**Voice direction:** Warm, confident, slightly wry narrator, about 30–40 years old. Conversational, not "announcer". The tone is a smart friend explaining something, with a hint of a smile on the funny lines (*"a very awkward meeting"*, *"Meet Nudgebird."*). Medium pace, about 2.6 words per second. Real pauses where you see "…".

**Suggested ElevenLabs settings:** Stability about 45%, Similarity about 75%, Style about 20%, Speaker Boost on. Export **MP3, 44.1 kHz**.

## How to deliver
- Generate **one file per line** and name it exactly as in the table, e.g. `vo-01.mp3`.
- Trim the silence at the start of each file, so the first word starts within about 0.05 s.
- **Stay under the "Max length"** for each line. If a take runs long, regenerate it a little faster (or tell me and I'll retime the scene).
- Drop all 15 files into `spec-explainers/nudgebird-hf/assets/voice/`, replacing the silent placeholders. Each line then plays at its slot automatically.

| File | Starts at | Max length | Line | On screen at that moment |
|---|---|---|---|---|
| `vo-01.mp3` | 0:00.8 | 4.2 s | Every day, your team sends hundreds of these. | One glowing paper plane flies in |
| `vo-02.mp3` | 0:05.5 | 6.0 s | Requests. Approvals. Little "can you take a look at this?"s. | Office from above, planes zipping between desks |
| `vo-03.mp3` | 0:13.0 | 6.5 s | And somewhere in there… one of them stalls. | One plane sputters and loses its glow |
| `vo-04.mp3` | 0:20.3 | 3.4 s | No one dropped it on purpose. It just… slipped. | Plane drifts toward a crack in the floor |
| `vo-05.mp3` | 0:23.8 | 5.8 s | Three days later, it's a missed deadline, an angry customer… and a very awkward meeting. | Stamps: MISSED (≈24.5s) → ESCALATED (≈26.0s) → AWKWARD (≈27.6s). Try to hit those words near those times. |
| — | 0:30–0:37 | — | *(silence: the crack swallows the plane, then the freeze and whip-pan)* | |
| `vo-06.mp3` | 0:37.6 | 3.2 s | Meet Nudgebird. | Bird lands and stares at camera; logo flashes |
| `vo-07.mp3` | 0:42.6 | 4.4 s | Nudgebird watches the work flowing through your tools… | Rewind, then the stall replays |
| `vo-08.mp3` | 0:47.1 | 4.6 s | …and catches the moment something starts to stall. | Bird taps the plane back into the air |
| `vo-09.mp3` | 0:52.3 | 3.0 s | Connect your tools in two minutes. | Step 1: Connect |
| `vo-10.mp3` | 0:55.4 | 3.2 s | It learns what normal looks like, and flags what isn't. | Step 2: Detect (scan beam) |
| `vo-11.mp3` | 0:58.7 | 3.7 s | Then it nudges exactly the right person. No nagging. No blame. | Step 3: Nudge (chat message and click) |
| `vo-12.mp3` | 1:02.6 | 3.6 s | Loops close faster. | Office flowing again; the crack zips shut |
| `vo-13.mp3` | 1:06.6 | 5.0 s | And nobody spends their week chasing people. | 40% / 6 hrs stat cards |
| `vo-14.mp3` | 1:12.6 | 6.8 s | So you can stop babysitting tasks, and get back to the work that actually matters. | Manager leans back; bird lands on the monitor |
| `vo-15.mp3` | 1:23.4 | 4.6 s | Nudgebird. Nothing falls through the cracks. | Logo, then tagline appear |

**Total:** about 150 words over 90 seconds.

## After you drop the files in
```bash
cd spec-explainers/nudgebird-hf
npx hyperframes audio assets/voice/*.mp3 --json   # sanity-check lengths and levels
npx hyperframes render -o renders/nudgebird-explainer.mp4
```
To nudge a line's timing, change its start in `build.py` (the `VO` table) and run `python3 build.py`, or drag it in the HyperFrames preview.

## Music
The draft has sound effects only. To add a music bed, export one from ElevenLabs Music (or any licensed track) as `assets/bgm/track.mp3`. Ask for: *"uplifting minimal corporate-tech, 110–120 bpm, sparse and tense for the first 35 s, then opens up bright and driving"*. I'll wire it in, with the music ducked under the voice (about 0.14 volume).
