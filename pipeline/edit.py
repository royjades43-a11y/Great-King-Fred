"""The edit: cuts, motion, kinetic captions, punch text, progress bar, mix.

House style (see channel/STYLE_GUIDE.md):
  * every shot moves  — stills get a Ken Burns pan, video gets a slow punch-in
  * flash-cut into every new shot
  * word-by-word captions, active word in yellow, pop-in per caption chunk
  * red "punch text" box restating each beat's key fact
  * yellow progress bar along the bottom (retention trick for Shorts)
"""
from __future__ import annotations

import json
import random
import re
import subprocess
from pathlib import Path

FPS = 30
FORMATS = {"short": (1080, 1920), "long": (1920, 1080)}
YELLOW_ASS = "&H0000D4FF"   # #FFD400 in ASS BGR
RED_ASS = "&H002F31E8"      # #E8312F
FONT = "Inter ExtraBold"
FONT_FILE = "/usr/share/fonts/opentype/inter/Inter-ExtraBold.otf"


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def probe_duration(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", str(path)], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


GRADE = "eq=contrast=1.08:saturation=1.18:brightness=0.01,vignette=PI/5"
ENCODE = ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-r", str(FPS)]


def render_shot(asset: dict, dur: float, idx: int, size: tuple[int, int], out: Path,
                preset: str) -> None:
    W, H = size
    frames = max(1, round(dur * FPS))
    flash = f"fade=in:st=0:d=0.12:color=white"
    if asset["kind"] == "image":
        inp = ["-loop", "1", "-framerate", str(FPS), "-i", asset["path"]]
        z = "1+0.10*t/{d}".format(d=dur) if idx % 2 == 0 else "1.10-0.10*t/{d}".format(d=dur)
        if H > W:
            # vertical: blurred full-bleed backdrop + the whole still in front, slowly zooming
            vf = (f"split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                  f"boxblur=30:2,eq=brightness=-0.12[bg];"
                  f"[b]scale=w='trunc({W}*1.06*({z})/2)*2':h=-2:eval=frame[fg];"
                  f"[bg][fg]overlay=x='(W-w)/2':y='(H-h)/2-{int(H*0.06)}':eval=frame,"
                  f"{GRADE},{flash},format=yuv420p")
        else:
            # landscape: Ken Burns pan across the still, alternating direction
            sx = f"(iw-ow)*t/{dur}" if idx % 2 == 0 else f"(iw-ow)*(1-t/{dur})"
            vf = (f"scale={int(W*1.15)}:{int(H*1.15)}:force_original_aspect_ratio=increase,"
                  f"crop={W}:{H}:x='{sx}':y='(ih-oh)/2',{GRADE},{flash},format=yuv420p")
    else:
        # skip the (often boring) first 15% of the clip, loop short clips
        src_dur = asset.get("duration") or probe_duration(Path(asset["path"]))
        start = 0.0
        if src_dur > dur + 1:
            rnd = random.Random(asset["url"] + str(idx))
            start = rnd.uniform(src_dur * 0.15, max(src_dur * 0.15, src_dur - dur - 0.5))
        z0, z1 = (1.0, 1.12) if idx % 2 == 0 else (1.12, 1.0)
        vf = (f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
              f"zoompan=z='{z0}+({z1}-{z0})*on/{frames}':d=1:x='iw/2-iw/zoom/2':"
              f"y='ih/2-ih/zoom/2':s={W}x{H}:fps={FPS},{GRADE},{flash},format=yuv420p")
        inp = ["-stream_loop", "-1", "-ss", f"{start:.2f}", "-i", asset["path"]]
    run(["ffmpeg", "-y", "-v", "error", *inp, "-t", f"{dur:.3f}", "-an", "-vf", vf,
         *ENCODE, "-preset", preset, "-crf", "20", "-frames:v", str(frames), str(out)])


# ---------- captions -------------------------------------------------------

def _ts(t: float) -> str:
    t = max(0.0, t)
    h, rem = divmod(t, 3600)
    m, s = divmod(rem, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def _esc(s: str) -> str:
    return s.replace("\\", "").replace("{", "(").replace("}", ")")


def chunk_words(words: list[dict], max_words: int = 3) -> list[list[dict]]:
    chunks, cur = [], []
    for w in words:
        cur.append(w)
        if len(cur) >= max_words or re.search(r"[.,?!…:;]$", w["word"]):
            chunks.append(cur)
            cur = []
    if cur:
        chunks.append(cur)
    return chunks


def build_ass(segments: list[dict], size: tuple[int, int], out: Path) -> None:
    W, H = size
    vertical = H > W
    cap_size = 92 if vertical else 78
    punch_size = 70 if vertical else 60
    cap_margin = int(H * 0.27) if vertical else int(H * 0.10)
    punch_margin = int(H * 0.16) if vertical else int(H * 0.07)
    header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,{FONT},{cap_size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H96000000,-1,0,0,0,100,100,1,0,1,7,3,2,60,60,{cap_margin},1
Style: Punch,{FONT},{punch_size},&H00FFFFFF,&H00FFFFFF,{RED_ASS},&H00000000,-1,0,0,0,100,100,2,-2,3,18,0,8,80,80,{punch_margin},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    lines = []
    for seg in segments:
        off, dur = seg["offset"], seg["duration"]
        if seg.get("punch"):
            pop = r"{\fscx40\fscy40\t(0,140,\fscx108\fscy108)\t(140,220,\fscx100\fscy100)}"
            lines.append(f"Dialogue: 1,{_ts(off + 0.05)},{_ts(off + dur - 0.05)},Punch,,0,0,0,,"
                         f"{pop}{_esc(seg['punch'].upper())}")
        chunks = chunk_words(seg["words"])
        for ci, chunk in enumerate(chunks):
            chunk_end = chunks[ci + 1][0]["start"] if ci + 1 < len(chunks) else chunk[-1]["end"] + 0.2
            for wi, w in enumerate(chunk):
                start = w["start"] if wi else chunk[0]["start"]
                end = chunk[wi + 1]["start"] if wi + 1 < len(chunk) else chunk_end
                parts = []
                for j, x in enumerate(chunk):
                    txt = _esc(x["word"].upper())
                    parts.append(f"{{\\c{YELLOW_ASS}}}{txt}{{\\c&H00FFFFFF&}}" if j == wi else txt)
                pop = r"{\fscx70\fscy70\t(0,90,\fscx100\fscy100)}" if wi == 0 else ""
                lines.append(f"Dialogue: 0,{_ts(off + start)},{_ts(off + end)},Cap,,0,0,0,,"
                             f"{pop}{' '.join(parts)}")
    out.write_text(header + "\n".join(lines) + "\n", encoding="utf-8")


# ---------- assembly --------------------------------------------------------

def assemble(segments: list[dict], assets: list[dict], size: tuple[int, int], work: Path,
             out: Path, music: Path | None, preset: str = "veryfast") -> float:
    W, H = size
    shots_dir = work / "shots"
    shots_dir.mkdir(exist_ok=True)
    offset = 0.0
    shot_list, voice_list = [], []
    for i, (seg, asset) in enumerate(zip(segments, assets)):
        seg["offset"] = offset
        # pattern interrupt: beats longer than ~4 s get re-cut into 2-3 shots with
        # alternating motion (and a different source offset for video)
        n = 1 if seg["duration"] <= 4.5 else 2 if seg["duration"] <= 8 else 3
        cuts = [round(seg["duration"] * k / n * FPS) / FPS for k in range(n + 1)]
        print(f"  beat {i:02d}  {seg['duration']:.2f}s  {asset['kind']}  x{n} cut(s)")
        for k in range(n):
            shot = shots_dir / f"shot_{i:02d}_{k}.mp4"
            render_shot(asset, cuts[k + 1] - cuts[k], i * 3 + k + (i % 2), size, shot, preset)
            shot_list.append(shot)
        voice_list.append(Path(seg["voice_path"]))
        offset += seg["duration"]
    total = offset

    (work / "shots.txt").write_text("".join(f"file '{p.resolve()}'\n" for p in shot_list))
    (work / "voice.txt").write_text("".join(f"file '{p.resolve()}'\n" for p in voice_list))
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(work / "shots.txt"),
         "-c", "copy", str(work / "picture.mp4")])
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", str(work / "voice.txt"),
         "-c:a", "pcm_s16le", str(work / "voice.wav")])

    ass = work / "captions.ass"
    build_ass(segments, size, ass)

    bar_h = 14 if H > W else 10
    vf = (f"subtitles='{ass}':fontsdir=/usr/share/fonts/opentype/inter,"
          f"drawbox=x=0:y={H - bar_h}:w='max(2,{W}*t/{total:.3f})':h={bar_h}:color=0xFFD400@0.95:t=fill")
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(work / "picture.mp4"), "-i", str(work / "voice.wav")]
    if music and music.exists():
        # music bed ducked under the narration (sidechain compression)
        cmd += ["-stream_loop", "-1", "-i", str(music), "-filter_complex",
                f"[0:v]{vf}[v];[2:a]volume=0.22,afade=t=out:st={max(0, total - 1.5):.2f}:d=1.5[m];"
                f"[1:a]asplit[vo][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=8:release=350[duck];"
                f"[vo][duck]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5[a]",
                "-map", "[v]", "-map", "[a]"]
    else:
        cmd += ["-filter_complex", f"[0:v]{vf}[v];[1:a]loudnorm=I=-14:TP=-1.5[a]",
                "-map", "[v]", "-map", "[a]"]
    cmd += [*ENCODE, "-preset", preset, "-crf", "19", "-c:a", "aac", "-b:a", "192k",
            "-t", f"{total:.3f}", "-movflags", "+faststart", str(out)]
    run(cmd)
    return total


def thumbnail(picture: Path, text: str, size: tuple[int, int], out: Path) -> None:
    """1280x720 thumbnail: first-shot frame + up to 3 big words in brand colours."""
    words = text.upper().split()[:3]
    label = " ".join(words).replace(":", r"\:").replace("'", "")
    vf = (f"select=eq(n\\,20),scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,"
          f"eq=contrast=1.2:saturation=1.35,"
          f"drawtext=fontfile={FONT_FILE}:text='{label}':fontsize=120:fontcolor=0xFFD400:"
          f"borderw=10:bordercolor=black:x=(w-tw)/2:y=h-th-70")
    run(["ffmpeg", "-y", "-v", "error", "-i", str(picture), "-vf", vf, "-frames:v", "1", str(out)])


def write_description(ep: dict, assets: list[dict], out: Path, synthetic_voice: bool) -> None:
    lines = [ep["title"], "", ep.get("description", "").strip(), ""]
    if ep.get("sources"):
        lines += ["📚 Sources:"] + [f"• {s}" for s in ep["sources"]] + [""]
    lines += ["🎞 Footage (Creative Commons / Public Domain, via Wikimedia Commons):"]
    seen = set()
    for a in assets:
        if a["url"] in seen:
            continue
        seen.add(a["url"])
        lines.append(f"• \"{a['title']}\" by {a['author']} — {a['licence']} — {a['page']}")
    if any("SA" in a["licence"].upper() for a in assets):
        lines += ["", "Footage marked CC BY-SA was cut, cropped, colour-graded and captioned by "
                  "Throttle & Track; this edit is shared under the same licence."]
    lines += ["", "🎙 Narration voice is AI-generated (ElevenLabs)." if synthetic_voice else "", "",
              " ".join(f"#{t.replace(' ', '')}" for t in ep.get("tags", [])[:5])]
    out.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    (out.parent / "credits.json").write_text(json.dumps(
        [{k: a[k] for k in ("title", "author", "licence", "licence_url", "page")} for a in assets], indent=2))
