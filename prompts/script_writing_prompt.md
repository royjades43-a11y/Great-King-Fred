# Script-Writing Prompt (channel standard)

Use this for every episode. Fill in `[TOPIC]`, `[LENGTH]` and `[TOPIC TYPE]`.
Check the finished script with `python3 tools/check_script.py scripts/<episode>_script.md --minutes [LENGTH]`.

---

Write a YouTube script for the channel "Genius History."

Topic: [TOPIC]
Target length: [LENGTH] minutes

---

TONE & STYLE RULES (do not ignore any of these):
- Conversational, direct, fast-paced — like a brilliant friend explaining
  history, not a professor lecturing
- Short sentences only. Maximum 20 words per sentence.
- No filler openers: never start with "Welcome back," "In this video,"
  or "Today we're going to"
- Use rhetorical questions every 90 seconds to maintain tension
- No academic jargon — if a 14-year-old wouldn't understand it, rephrase it
- Let facts speak for themselves — avoid words like "amazingly," "incredibly,"
  "surprisingly"
- Include at least 3 moments of genuine irony, humor, or unexpected human detail
- Target word count: 140 words × [LENGTH] minutes (e.g. 12 min = 1,680 words)

---

STRUCTURE (follow this exactly, with timestamps):

[0:00–0:30] HOOK
One shocking, counterintuitive fact that reframes everything the viewer
thinks they know about the topic. Immediately follow with a one-sentence
promise of what they'll understand by the end.

[0:30–1:30] ORIGINS
Where and when did this begin? The very first chapter. 3–4 punchy facts,
no long lists.

[1:30–4:00] RISE & GOLDEN AGE
The peak. 2–3 vivid stories with specific names, dates, and human detail.
Make ancient people feel real.

[4:00–7:00] CONFLICT & COLLAPSE
What broke it? Wars, invasions, internal collapse. Be dramatic.
End with a cliffhanger: "But it wasn't over yet."

[7:00–(LENGTH-1:30)] MODERN TRANSFORMATION
How it became what it is today. Move fast — one sentence per era
where possible.

[(LENGTH-1:30)–END] PUNCHLINE & CTA
One final surprising fact that reframes everything the viewer just learned.
End with: "Which [topic type] should we cover next? Drop it in the comments."

---

Output the full script with timestamps. No commentary before or after —
just the script.

---

## Channel additions (applied on top of the prompt above)

- Every fact must come from `sources/<episode>_sources.md`. Contested numbers are given as ranges.
- Keep the scene format that `tools/build_prompts.py` reads, so each beat still has an image prompt and a motion prompt.
