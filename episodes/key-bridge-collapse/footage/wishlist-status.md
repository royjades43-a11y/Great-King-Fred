# Wishlist status: Key Bridge collapse

Status of every shot in `plan.md` → Shot wishlist. Asset ids refer to `footage/manifest.json` (credits in `CREDITS.md`).
No fair-use material is used. The third-party livestream of the collapse was **not** used.

## Rights note (read before locking the cut)

The four CCTV clips from the NTSB public docket (`cctv-*`, `dock-east-*`, `dali-arrival-*`) were **recorded by private cameras**: an industrial facility on the west bank (Attachments 1 and 3) and a private home in Dundalk (Attachment 4), per the docket's "CCTV Recordings – Index". The NTSB released them in the public docket, but that release does not by itself make them US Government works. Security-camera footage has no creative human author, so there is a reasonable argument that it is not copyrightable, but that is a legal judgment, not a licence. Their licence field in the manifest says exactly this. Everything else is a US federal work (NTSB, USCG, USACE, Navy), CC0, or CC BY.

The ECDIS and PPU playback videos (`ecdis-*`, `ppu-*`) were recorded by NTSB investigators (VDR group attachments 6 and 7), so they are treated as NTSB works.

## Must-have

| ID | Shot | Status | Asset(s) |
|---|---|---|---|
| S01 | CCTV: lights out 0125:00, back 0125:58, out again 0127:04 | **Found** (docket Attachment 4, Dundalk home camera). The ship is small and soft; the blackout is visible at about 12 s into the first clip, power returns at about 10 to 12 s into the second, and the lights fade in the third. | `cctv-dali-first-blackout`, `cctv-dali-lights-restored`, `cctv-dali-second-blackout-drift` |
| S02 | ECDIS playback of the final track | **Found** (docket VDR attachment 7) | `ecdis-playback-final-track` |
| S04 | Impact and collapse video | **Found** (docket Attachment 3, "Dock East", night, monochrome, distant). The main-span lights drop out about 13 to 22 s in. No livestream used. | `dock-east-impact-collapse`, `dock-east-dali-approach-night` |
| S05 | Terminal Block 381 / HHI engineer holding Wire 1 | **Found** (MIR Fig 51) | `mir-fig51-terminal-block-381-wire1` |
| S06 | Correct vs Wire 1 label-band placement | **Found** (NTSB Nov 18, 2025 press-release illustrations = MIR Fig 65, higher resolution, two separate panels) | `banding-correct-installation`, `banding-wire1-installation` |
| S07 | Blue Nagoya vs Dali size comparison | **Found** (MIR Fig 36; portrait aspect) | `mir-fig36-blue-nagoya-vs-dali` |
| S08 | AF table 0.002921 vs 0.0001 | **Found** (MIR Table 5) | `mir-table5-af-summary` |
| S09 | Aerial of the Dali under the fallen truss | **Found** (USCG aerial from Commons, 1280 px, low sun; plus MIR Fig E-1 and USCG dawn video) | `uscg-aerial-wide-dali-wreck`, `mir-figE1-dali-under-truss`, `uscg-dawn-truss-silhouette` |
| S10 | Bridge at 1977 opening / under construction | **Not found (blocked by rate limit)**. Retried on Nov 14, 00:00-00:10, with a descriptive User-Agent, strictly sequential requests, 2400px thumbnails and Retry-After waits: upload.wikimedia.org returned HTTP 429 every time. Commons "Francis Scott Key bridge 1976.jpg" and NARA construction photo (546837) are identified but upload.wikimedia.org kept returning HTTP 429 (rate limit). See below. The showrunner has excluded the docket CCTV clips, so there is **no usable fallback**. | none |
| S11 | Intact bridge, daylight | **Not found (blocked by rate limit)**. Commons candidates still rate-limited (429): 'The Francis Scott Key Bridge (Baltimore).jpg', '20190202 Francis Scott Key Bridge (Baltimore) at sunset.jpg', 'Francis Scott Key Bridge I-695 Aerial.jpg', 'Francis Scott Key Bridge southern truss support.jpg'. The docket CCTV daylight clips are excluded by the showrunner. A DVIDS search found no video of the intact bridge, and DVIDS stills need the proxy-blocked image CDN. | none |
| S12 | Aerial B-roll of bridge and Dali (NTSB) | **Found** (NTSB B-roll on Commons, 4 clips) | `ntsb-aerial-severed-roadway`, `ntsb-aerial-pier-stub-truss`, `ntsb-aerial-dali-truss-across-bow`, `ntsb-aerial-stern-span-gap` |
| S13 | NTSB investigators on scene | **Substitute**. Flickr album licence checked: all 8 photos are "Public Domain Mark" (NTSB, photographer Peter Knudson), but live.staticflickr.com returned HTTP 429 for every download. Used the NTSB photo of an investigator sealing the HV switchboard (preliminary report Fig 8). | `prelim-fig08-investigator-hv-switchboard` |
| S14 | Microscope close-ups: gouges, depression, arcing | **Found** (MIR Figs 58, 61, 62) | `mir-fig58-wire1-ferrule-gouges`, `mir-fig61-ferrule-arcing-depression`, `mir-fig62-arcing-damage-gate-face` |
| S15 | AIS trackline after the blackout | **Substitute**. MIR Fig 9 is on a Google Earth background (third party), so it was skipped. The NTSB preliminary-report route graphic shows the same track with numbered events 1 to 7 on a plain background; the ECDIS and PPU playbacks show it live. | `prelim-fig07-route-after-blackout`, `ecdis-playback-final-track`, `ppu-playback-final-approach` |
| S16 | Main spans with worker vehicle positions | **Found** (MIR Fig 17) | `mir-fig17-worker-vehicle-positions` |
| S17 | Overhead of collapsed bridge with dolphins | **Not used**. MIR Fig 30 has a MAXAR/Google Earth background, and Fig 27 an MDTA background, so both were skipped. The dolphins appear in `mir-fig17-worker-vehicle-positions` (plan view) and `prelim-fig07-route-after-blackout`. | partial: `mir-fig17-worker-vehicle-positions`, `prelim-fig07-route-after-blackout` |
| S18 | Controlled demolition, May 13, 2024 | **Found** (DVIDS 923331 USACE; DVIDS 923417 USCG; animation 922501) | `demolition-blast-closeup`, `demolition-side-view-uscg`, `precision-cutting-animation` |
| S19 | Dali refloat and transit, May 20, 2024 | **Found** (DVIDS 924382, 924359) | `refloat-transit-tugs`, `refloat-damaged-bow-terminal`, `refloat-timelapse`, `wreck-site-after-refloat` |
| S20 | Cable-stayed replacement rendering | **Not found**. MIR Fig 37 is an MDTA/Key Bridge Rebuild image with no free licence stated; skipped per the rule on Maryland works. | none |
| S22 | Power-plant state diagrams | **Found** (MIR Figs 5, 8, 11, 13, 16; Figs 10, 12, 14, 15 extracted but dropped to keep the count down, and can be re-added from `raw/mir/hi/`) | `mir-fig05-plant-at-departure`, `mir-fig08-plant-0125-00`, `mir-fig11-plant-0125-58`, `mir-fig13-plant-0127-04`, `mir-fig16-plant-0129-09` |
| S23 | HV and LV switchboards | **Found** (MIR Fig 42) | `mir-fig42-hv-lv-switchboards` |

## Nice-to-have

| ID | Shot | Status | Asset(s) |
|---|---|---|---|
| S03 | Portable Pilot Unit playback | **Found** (docket VDR attachment 6; 640 px, board or inset only) | `ppu-playback-final-approach` |
| S21 | Pier 17 before the accident | Not yet (Commons file rate-limited, 429) | none |
| S24 | X-ray of Terminal Block 381 | **Found** (MIR Fig 56) | `mir-fig56-terminal-block-xray` |
| S25 | How arcing occurs in the gap | **Found** (MIR Fig 64) | `mir-fig64-arcing-gap-diagram` |
| S26 | HR1 UVR circuit | **Skipped**. MIR Fig 50 is drawn on an HHI background (private party). | none |
| S27 | Sunshine Skyway 1980 | **Found** (MIR Fig 38) | `mir-fig38-sunshine-skyway-1980` |
| S28 | Navy 3D sonar of the wreck site | **Found** | `navy-3d-sonar-wreck` |
| S29 | Wreckage on March 26 | **Substitute**. The Army photo was rate-limited; the USCG March 26 dawn video covers it. | `uscg-dawn-truss-silhouette`, `uscg-sunrise-dali-wreck`, `uscg-boats-bow-under-truss` |
| S30 | Key Bridge memorial | Not yet (Commons, CC BY 4.0; rate-limited, 429) | none |
| S31 | Motorist warning lights and gates | **Skipped**. MIR Figs 71 and 72 are credited to Texas DOT. | none |
| S32 | In-port video aboard the Dali | **Found, but different content**. Docket Attachment 1 is a shore camera showing the Dali arriving **under the intact bridge on March 23**, not an onboard view. | `dali-arrival-under-bridge-wide`, `dali-arrival-under-bridge-tight` |
| S33 | Dali helm at night | **Found** (MIR Fig 4; photographed with lights on) | `mir-fig04-dali-helm` |
| S34 | Dali portrait | Not yet. Commons "DALI (29715954007).jpg" (kees torn, CC BY-SA 2.0) was rate-limited. MIR Fig 1 is third-party and was skipped. Partial substitute: the Dali in daylight in `dali-arrival-under-bridge-tight` and `refloat-transit-tugs`. | substitute |
| S35 | Locator map | **Found** (Commons, CC0) | `map-collision-location` |
| S36 | Satellite view | **Skipped**. The Copernicus licence is "attribution", not PD/CC, and Capella SAR was not needed. | none |
| S37 | Coast Guard and tug response on the water | **Found** (DVIDS 919034, USCG, March 26) | `uscg-boats-bow-under-truss`, `uscg-sunrise-dali-wreck` |
| S38 | Key Bridge in 2004 | **Skipped** (MIR Fig 2 is MDTA, no free licence) | none |
| S39 | Pier 17 fender system | **Skipped** (MIR Figs 31 and 32 are MDTA) | none |
| S41 | Seagirt / harbor cranes | **Partial** (cranes in `refloat-damaged-bow-terminal`) | `refloat-damaged-bow-terminal` |
| S42 | NTSB board meeting / briefing | **Not found**. These are on YouTube only, which is not allowed. | none |
| S43 | Aerial of collapsed section, channel open | **Substitute** (DVIDS, June 12, 2024, ships passing between the pier stubs in the reopened channel) | `channel-reopened-ship-passes-piers` |
| S45 | Container ship size comparison | Not downloaded (S07 covers it) | none |
| S46 | Labelled collapse diagram (SVG) | Not yet (the thumbnail render returned HTTP 400/429) | none |
| S47 | Traffic on the intact bridge | Not yet (Commons 2016 photo, rate-limited) | none |
| S49 | Queen Isabella and I-40 collapses | **Found** for I-40 (MIR Fig 40). Fig 39 (Queen Isabella) was extracted but dropped; it can be re-added from `raw/mir/hi/`. | `mir-fig40-i40-bridge-collapse` |
| S53 | Wire 1 and Wire 3; label banding | **Found** (MIR Fig 53; Fig 54 extracted, dropped) | `mir-fig53-wire1-wire3-in-block` |

Extra (not on the wishlist): `mir-fig19-bow-strikes-pier17`, `mir-fig21-damage-spans-16-18`, `mir-fig58-…`, `drone-truss-on-bow-container-removal` (USCG drone, April 7).

## Showrunner decision (Nov 14)

The 7 privately recorded CCTV clips (`cctv-*`, `dock-east-*`, `dali-arrival-*`) stay in the manifest with their rights flagged, but they will not be used in the episode. That removes S01, S04, S32 and the intact-bridge fallback. S34 (Dali before the accident) is also still not found: Commons 'DALI (29715954007).jpg' (kees torn, CC BY-SA 2.0) was rate-limited.

## Download problems

- **upload.wikimedia.org / commons.wikimedia.org**: these returned HTTP 429 (rate limit, `retry-after: 600`) for most requests through the shared proxy IP. The proxy did not refuse them. Still pending: bridge 1976, NARA construction photo, intact bridge 2015, Pier 17 truss support 2016, traffic 2016, Dali portrait, memorial, Army wreckage photo, labelled SVG, NTSB "Investigators aboard" B-roll, USCG overflight B-roll. The exact titles are in `raw/commons/urls.txt`. Retry later, or from another IP.
- **live.staticflickr.com**: HTTP 429 for every NTSB album photo. The licences were confirmed as Public Domain Mark.
- **Proxy-refused (403 on CONNECT)**: `d1ldvf68ux039x.cloudfront.net` and `d2cto119c3bgok.cloudfront.net`. These are the DVIDS **image** CDN, needed for DVIDS stills such as USCG photo 8314864 by PO3 Kimberly Reaves. The DVIDS video CDN `d34w7g4gy10iej.cloudfront.net` works.
