# Channel Visual Style Guide

Reference channels: **Ink Explainer** and **Genius History**, both faceless 2D explainer channels.
Every image and video prompt in this project is built from the blocks below so all episodes look the same.

---

## 1. Master Style Block (append to every image prompt)

```
2D animated vector illustration, minimalist stick-figure character with a round expressive white face and simple bold facial features, thin black stick limbs, detailed historically accurate clothing drawn over the stick body, clean thick black outlines, flat vibrant colors with subtle cel shading, dramatic cinematic lighting, detailed painterly flat background with accurate regional architecture and landscape, documentary storytelling aesthetic, 16:9 widescreen composition, high contrast, crisp edges
```

## 2. Negative Prompt (for tools that support it)

```
photorealistic, 3D render, realistic human anatomy, realistic skin, detailed realistic faces, anime eyes, chibi, blurry, watercolor bleed, sketchy lines, messy linework, gradients everywhere, text, letters, watermark, logo, signature, extra limbs, deformed hands, low contrast, muddy colors, cluttered composition
```

> On-screen text, maps labels and numbers are added **in the edit**, not in the generator. AI text rendering is unreliable.

## 3. Motion / Image-to-Video Block (append to every video prompt)

```
smooth 2D vector animation, limited animation style like a YouTube history explainer, subtle character motion, gentle parallax camera movement, no morphing, keep outlines clean and consistent, keep character face white and simple, 24fps, 5 seconds
```

## 4. Color Palette

| Use | Color | Hex |
|---|---|---|
| Outlines | Ink black | `#111111` |
| Faces | Paper white | `#FAFAF7` |
| China / CCP accent | Imperial red | `#D7261E` |
| Gold accent / prosperity | Gold | `#F2B632` |
| Mao-era uniforms | Drab grey-blue | `#5E6B73` |
| Reform-era / modern city | Neon cyan | `#22C3E6` |
| Night skies / tension | Deep navy | `#14213D` |
| Rural / land | Rice-paddy green | `#7BB661` |

Era color moods:
- **1839–1949 (humiliation):** sepia, smoky brown, cold grey sky.
- **1949–1976 (Mao era):** red banners against grey-blue crowds, harsh top lighting.
- **1978–2000 (reform):** warm sunrise gold, green fields, construction yellow.
- **2001–today (rise):** neon city blues, glowing skylines, red-gold accents.
- **Challenges / tension:** desaturated navy, rim lighting, long shadows.

## 5. Recurring Character Sheet

Keep these descriptors **word-for-word** in every prompt so the character stays consistent.

| Character | Prompt descriptor |
|---|---|
| **Qin Shi Huang** | `a stick-figure emperor with a round white stern face, long black beard, black and red silk imperial robes with gold dragon embroidery, a tall flat-topped mianguan crown with hanging bead strings` |
| **Zheng He** | `a tall stick-figure admiral with a round white confident face, red and gold Ming court robe with a square embroidered rank badge and black winged official hat` |
| **Qianlong Emperor** | `an elderly stick-figure man with a round white face, thin white moustache, bright yellow dragon robe and imperial winter hat with a red tassel` |
| **Lin Zexu** | `a stick-figure Qing official with a round white determined face, black moustache, long queue braid, embroidered blue silk robe with rank badge and round hat with red finial` |
| **Hong Xiuquan** | `a stick-figure man with a round white wide-eyed visionary face, long queue braid, plain scholar's robe` |
| **Puyi (child)** | `a tiny six-year-old stick-figure boy emperor with a round white confused face, oversized bright yellow dragon robe and imperial hat too big for him` |
| **Narrator figure** (optional host) | `a stick-figure scholar with a round white face, small round glasses, dark blue scholar robe` |
| **Mao Zedong** | `a stick-figure man with a round white face, high receding black hairline, small mole on the chin, grey buttoned Zhongshan (Mao) suit with four pockets` |
| **Deng Xiaoping** | `a short stick-figure man with a round white face, short thinning black hair, calm determined smile, dark grey Zhongshan suit` |
| **Xi Jinping** | `a stick-figure man with a round white face, neat side-parted black hair, dark navy western business suit, red tie` |
| **Chinese farmer (1970s)** | `a stick-figure farmer with a round white face, faded blue cotton work jacket, straw conical hat, cloth shoes` |
| **Factory worker (1990s–2000s)** | `a stick-figure factory worker with a round white face, blue factory uniform, white cap` |
| **Modern Shenzhen engineer** | `a stick-figure young engineer with a round white face, hoodie, lanyard badge, holding a smartphone` |
| **Qing official (1840s)** | `a stick-figure Qing official with a round white face, long queue braid, embroidered blue silk robe with rank badge, round hat with red finial` |
| **British officer (1840s)** | `a stick-figure British naval officer with a round white face, red coat with gold epaulettes, bicorne hat` |

## 6. Composition Rules

1. One clear focal character or object per frame; leave negative space on one side for on-screen text.
2. Faces stay **white and minimal**: two dot or oval eyes, simple brows, a line mouth. Emotion comes from brows, mouth and posture.
3. Clothing and architecture carry the historical detail: buttons, insignia, roof tiles, signage shapes.
4. Light from one dramatic direction (sunrise, spotlight, firelight, neon).
5. Maps are stylized flat vector maps with thick borders, in the same palette.

## 7. Prompt Template

```
[SUBJECT & ACTION], [SETTING & ERA DETAILS], [LIGHTING & MOOD], + MASTER STYLE BLOCK
```

Example:

```
Deng Xiaoping (a short stick-figure man with a round white face, short thinning black hair, calm determined smile, dark grey Zhongshan suit) standing on a hill pointing at a half-built city, cranes and bamboo scaffolding below, 1992 Shenzhen, golden sunrise backlight, 2D animated vector illustration, minimalist stick-figure character ...
```

## 8. Tool Notes

| Tool | Tip |
|---|---|
| Midjourney | Append `--ar 16:9 --style raw --stylize 150`. Generate a character reference image first and reuse it with `--cref <url> --cw 80`. |
| DALL·E / GPT image | Paste the full prompt; ask for "flat vector, no text". |
| Leonardo / SDXL | Use a flat-vector or "cartoon outline" model; paste the negative prompt. |
| Ideogram | Good when you need a short title card, otherwise keep text out. |
| Runway / Kling / Pika / Luma (img→video) | Feed the generated still plus the motion prompt; keep clips 4–6 s and cut on the beat. |
