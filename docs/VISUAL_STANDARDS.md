# Visual and sound standards

What every episode must meet. The footage-scout, scriptwriter, video-editor and frame-inspector all work to this page. It's based on the first episode's review and on current editing guidance (sources at the end).

## Coverage
- **Moving picture dominates.** At least 60% of runtime is real video (event footage or B-roll). Motion graphics count as moving; stills with a slow push-in do not. Dark title cards stay under 5%. Timestamps and places are typed **over footage** (`stamp`), not on black.
- **Variety.** Target 150 to 250 distinct shots for 10 minutes. No asset appears twice unless it's a deliberate callback (the cold open's hook image returning at the end is fine). Never reuse a shot within 3 minutes.
- **Shot length follows the mood.** Use 3 to 5 s shots in tense sequences (the final four minutes), 6 to 10 s in reflective ones (aftermath, memorial). Alternate fast passages with breathing room; a single pace for 10 minutes feels flat.
- **Two or three shots per sentence** in the action acts. A sentence with no new picture should have a reason, such as a document card being read.

## Footage hierarchy
1. **Event footage** (agency video, docket material, on-scene photos): always first choice, and the only footage allowed for the event itself.
2. **Made in-house** motion graphics: the route map with a running clock, power diagrams, charts, to-scale comparisons, and zooms into report figures. These carry the explanation and make the channel look premium.
3. **Representative B-roll** (DVIDS, NOAA, NASA, Internet Archive, Wikimedia, Pexels, Pixabay): ships at sea and in port, tugs, crews, engine rooms, switchboards, wiring, the river at night, traffic, road crews, police lights, rescue boats, construction archive. Its job is atmosphere and context.
   - Never label it as the subject. No "Dali" caption over another ship.
   - Never use it for the event's decisive moments (the impact, the collapse, the victims).
   - Match era, weather and time of day to the narration: night scenes for 1:25 a.m., not sunny harbours.
   - Prefer close, specific shots (a hand on a breaker, a gauge needle) over generic wide stock; generic stock as the main visual feels inauthentic.

## Movement and edits
- Don't move every still the same way. Mix slow push-ins, lateral drifts and locked-off holds; constant zooming is disorienting.
- Cut on the word: the picture changes just before the noun it illustrates (J-cut feel). build_timeline already leads cuts by 0.25 s; place `at` phrases on the key noun.
- Every 30 to 60 s there's a pattern change: a motion graphic, a document card, a stamp, a music shift, or a silence. Never two minutes of the same treatment.
- Hold a beat of silence before the most important line (the impact, the reveal of the cause): music drops out for about 1 s.

## Sound
- **Music bed throughout**, chosen per act: tension for the night, investigative pulse for the investigation, restraint for the aftermath. It changes at act boundaries with a crossfade, not mid-sentence.
- **Levels:** music sits about 15 to 20 dB under the narration while it's speaking and lifts in pauses (handled by the renderer's ducking). The final mix is normalised to **-14 LUFS integrated, -1 dBTP true peak** (YouTube's playback target) by render.sh.
- Credit every track (Kevin MacLeod / incompetech: CC BY 4.0, credit line required).

## Sources
- B-roll pacing and authenticity: [captions.ai](https://captions.ai/blog/practical-guide-b-roll-video), [socialrails](https://socialrails.com/blog/b-roll-footage-complete-guide), [tinymedialab](https://tinymedialab.com/youtube-b-roll-guide/), [The Video Effect](https://www.thevideoeffect.tv/articles/crafting-depth-emotion-power-b-roll), [viralclips](https://www.viralclips.video/blog/guides/video-editing-tips)
- Documentary editing style and map graphics: [markstudios](https://www.markstudios.com/blog/video-editing-styles), [mappi.studio](https://mappi.studio/documentary-map-animation), [olafmotion](https://olafmotion.com/trends-inspiration/best-youtube-editing-styles-2026/)
- Music under narration and loudness: [Salford University ducking study](https://salford-repository.worktribe.com/OutputFile/1489990), [vidpros](https://vidpros.com/fix-background-music-too-loud-video/), [overseeros](https://www.overseeros.com/blog/background-music-volume-under-voiceover), [hackernoon](https://hackernoon.com/how-to-master-ai-generated-film-audio-for-youtube)
- Retention and pattern changes: [Search Engine Land](https://searchengineland.com/guide/audience-retention), [pixflow](https://pixflow.net/blog/?p=93140)
