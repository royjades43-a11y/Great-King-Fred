# Great-King-Fred

Production workspace for a faceless history YouTube channel in a minimalist 2D vector style: clean black outlines, stick-figure bodies with expressive white faces, historically accurate clothing, flat vibrant colors and dramatic lighting. Inspired by Ink Explainer and Genius History.

## Structure

| Path | Contents |
|---|---|
| `scripts/` | Narration scripts with timestamps, voiceover, visual direction and per-scene prompts |
| `prompts/` | Channel style guide plus generated prompt exports (JSON/CSV) for batch image and video generation |
| `sources/` | Verified facts, data points and quotes, each tagged ✅ verified / ⚠️ contested / ❌ apocryphal |
| `tools/` | Automation scripts |

## Current episode: The Rise of China

- Script: [`scripts/china_rise_script.md`](scripts/china_rise_script.md) (24 scenes, 12 min, written to the channel script prompt)
- Sources: [`sources/china_rise_sources.md`](sources/china_rise_sources.md)
- Style bible: [`prompts/style_guide.md`](prompts/style_guide.md)
- Script-writing prompt: [`prompts/script_writing_prompt.md`](prompts/script_writing_prompt.md)
- Prompt exports: `prompts/china_rise_scene_prompts.json` / `.csv`

## Workflow

1. Research: add facts to `sources/<episode>_sources.md` with a status tag.
2. Write: draft `scripts/<episode>_script.md` with `prompts/script_writing_prompt.md`, using `## [m:ss–m:ss] SECTION` headers and the scene format (`### Scene NN — Title`, `**Timestamp:**`, `**Voiceover:**`, `**Visual:**`, `**Image prompt:**`, `**Motion prompt:**`).
3. Check: `python3 tools/check_script.py scripts/<episode>_script.md --minutes <N>` tests sentence length, banned words, word count, question spacing, cliffhanger and CTA.
4. Build: `python3 tools/build_prompts.py scripts/<episode>_script.md --retime` fits scene timestamps inside each section by word count and exports every prompt.
5. Generate: feed the CSV to your image tool (filenames like `s07_image_a`), then animate each still with its motion prompt.
6. Fact-check: re-verify every 🔄 figure before upload.
