// Cuts the long video into vertical Shorts (1080x1920): hook title on top, the landscape frame
// in the middle on the same sage ground (so it reads as one canvas), word-by-word captions below.
//
// YouTube Shorts safe zone (measured from the Shorts player on a phone, in video pixels):
//   top bar ........................ y 0-125      keep clear
//   right buttons (Ask/like/comment)  x 924-1080 from y 744 down
//   channel / title / Promote ........ y 1363 down  keep clear
// So everything that matters lives in x 20-900, y 170-1300 (the title may use the full width above
// y 744, where there are no buttons).
//   node shorts/make.mjs   -> shorts/build/<id>/ (one HyperFrames project per short)
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));
const script = JSON.parse(readFileSync(join(root, "script/script.json"), "utf8"));
const words = JSON.parse(readFileSync(join(root, "timing/words.json"), "utf8")).words;
const shorts = JSON.parse(readFileSync(join(here, "shorts.json"), "utf8"));
const MASTER = join(root, "../videos/03-people-who-rewatch-the-same-shows-4K-YouTube.mp4");

// the voice read script/tts.txt (numbers spelled out, names respelled for the voice); captions show
// the script's own spelling: digits and real names
const PHRASES = [
  ["four hundred and twenty-five million dollars", "$425 million"], ["a hundred million dollars", "$100 million"],
  ["three billion dollars", "$3 billion"], ["five hundred million", "500 million"], ["fifty-seven billion", "57 billion"],
  ["forty-four million", "44 million"], ["fifty-two million", "52 million"], ["two thousand and four", "2004"],
  ["two thousand and nine", "2009"], ["the year two thousand", "the year 2000"], ["twenty twenty-one", "2021"],
  ["twenty twenty-three", "2023"], ["twenty twenty", "2020"], ["twenty eleven", "2011"], ["twenty twelve", "2012"],
  ["twenty eighteen", "2018"], ["sixteen eighty-eight", "1688"], ["nineteen fifty-one", "1951"], ["nineteen sixty-eight", "1968"],
  ["nineteen ninety-six", "1996"], ["twenty-five times", "25 times"], ["twenty-four flavours", "24 flavours"],
  ["three percent", "3%"], ["thirty percent", "30%"], ["twenty minutes", "20 minutes"], ["U. S.", "U.S."], ["U. C.", "UC"],
];
const NAMES = { "dezzy": "Desi", "dessyloo": "Desilu", "reeruns": "reruns", "reerun": "rerun", "reeread": "reread", "zyeonts": "Zajonc",
  "hoffer": "Hofer", "hoffers": "Hofer's", "sehdickihdeez": "Sedikides", "wildshoot": "Wildschut", "yohahness": "Johannes", "sinefeld": "Seinfeld" };
function display(list) {
  const out = [];
  for (let i = 0; i < list.length;) {
    let hit = null;
    for (const [from, to] of PHRASES) {
      const f = from.split(" ");
      if (i + f.length > list.length) continue;
      if (f.every((x, k) => list[i + k].text.toLowerCase().replace(/[.,?!"”:;]+$/, "").replace(/^the$/, "the") === x.toLowerCase().replace(/[.,]+$/, "") ||
          (x.endsWith(".") && list[i + k].text === x))) { hit = [f.length, to]; break; }
    }
    if (hit) {
      const last = list[i + hit[0] - 1].text, tail = (last.match(/[.,?!"”:;]+$/) || [""])[0];
      out.push({ ...list[i], text: hit[1] + (hit[1].endsWith(".") ? "" : tail), end: list[i + hit[0] - 1].end });
      i += hit[0];
    } else {
      const w = list[i], key = w.text.toLowerCase().replace(/[^a-z]/g, ""), tail = (w.text.match(/[.,?!"”:;']+s?$/) || [""])[0];
      out.push(NAMES[key] ? { ...w, text: NAMES[key] + (/[.,?!]$/.test(w.text) ? w.text.slice(-1) : "") } : w);
      i++;
    }
  }
  return out;
}

// sentence -> word range (script tokens map 1:1 onto the transcript words)
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");
const beats = {};
let wi = 0;
for (const sc of script.scenes)
  for (const b of sc.beats) {
    const n = b.say.split(/\s+/).filter((w) => norm(w)).length;
    beats[b.id] = { first: wi, last: wi + n - 1 };
    wi += n;
  }

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const em = (s) => esc(s).replace(/!([^!]+)!/g, '<span class="r">$1</span>');
const VIDEO = { left: 20, top: 450, w: 880, h: 528 }; // title-safe area of the 4K frame (x 480-3360, y 216-1944), clear of the button column

for (const sh of shorts) {
  const w0 = beats[sh.from].first, w1 = beats[sh.to].last;
  const start = Math.max(0, words[w0].start - 0.35);
  const end = words[w1].end + 0.7;
  const dur = +(end - start).toFixed(3);
  const dir = join(here, "build", sh.id);
  mkdirSync(join(dir, "assets/fonts"), { recursive: true });
  mkdirSync(join(dir, "assets/vendor"), { recursive: true });
  copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
  copyFileSync(join(root, "assets/vendor/gsap.min.js"), join(dir, "assets/vendor/gsap.min.js"));
  const seg = join(dir, "assets/seg.mp4");
  if (!existsSync(seg))
    execFileSync("ffmpeg", ["-v", "error", "-y", "-ss", String(start), "-i", MASTER, "-t", String(dur),
      "-vf", `crop=2880:1728:480:216,scale=${VIDEO.w}:${VIDEO.h}:flags=lanczos:in_color_matrix=bt709:out_color_matrix=bt709`, "-c:v", "libx264", "-crf", "12", "-preset", "medium", "-pix_fmt", "yuv420p",
      "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
      "-af", `afade=t=in:d=0.12,afade=t=out:st=${(dur - 0.25).toFixed(2)}:d=0.25`, "-c:a", "aac", "-b:a", "320k", seg]);

  // captions: groups of up to 3 words, broken at punctuation or pauses
  const groups = [];
  let g = [];
  const shown = display(words.slice(w0, w1 + 1));
  for (let i = 0; i < shown.length; i++) {
    const w = shown[i];
    const gap = i > 0 ? w.start - shown[i - 1].end : 0;
    if (g.length && (g.length >= 3 || gap > 0.35 || /[.,?!]$/.test(shown[i - 1].text))) { groups.push(g); g = []; }
    g.push({ text: w.text.replace(/^-/, ""), t: +(w.start - start).toFixed(3) });
  }
  if (g.length) groups.push(g);
  const capHtml = groups.map((gr, k) => {
    const t0 = gr[0].t - 0.05;
    const t1 = k + 1 < groups.length ? groups[k + 1][0].t - 0.05 : dur - 0.05;
    return `<div id="g${k}" class="clip cap" data-start="${Math.max(0, t0).toFixed(3)}" data-duration="${(t1 - Math.max(0, t0)).toFixed(3)}" data-track-index="3"><div class="cap-in">${gr
      .map((w, j) => `<span id="g${k}w${j}" class="cw">${esc(w.text)}</span>`).join(" ")}</div></div>`;
  }).join("\n      ");
  const capData = groups.map((gr) => gr.map((w) => w.t));

  writeFileSync(join(dir, "index.html"), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      @font-face { font-family: "Montserrat"; font-weight: 800; src: url("assets/fonts/montserrat-800.woff2") format("woff2"); }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: ${theme.paper}; }
      #ground { position: absolute; inset: 0; background: ${theme.paper}; }
      #root { font-family: "Montserrat", sans-serif; }
      .title { position: absolute; left: 50px; right: 50px; top: 185px; text-align: center; font-weight: 800; font-size: 96px;
        line-height: 1.0; letter-spacing: -0.04em; color: #000; text-shadow: 0 6px 0 rgba(0,0,0,0.14), 0 14px 24px rgba(0,0,0,0.2); }
      .r { color: ${theme.accent}; }
      .handle { position: absolute; left: 0; right: 0; top: 488px; text-align: center; font-weight: 800; font-size: 36px; color: ${theme.muted}; }
      #v { position: absolute; left: ${VIDEO.left}px; top: ${VIDEO.top}px; width: ${VIDEO.w}px; height: ${VIDEO.h}px; }
      .cap { position: absolute; left: 40px; width: 840px; top: 1010px; height: 250px; display: flex; align-items: center; justify-content: center; }
      .cap-in { text-align: center; font-weight: 800; font-size: 86px; line-height: 1.05; letter-spacing: -0.03em; color: #000;
        text-shadow: 0 5px 0 rgba(0,0,0,0.12), 0 12px 20px rgba(0,0,0,0.18); }
      .cw { display: inline-block; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${dur}" data-width="1080" data-height="1920">
      <div id="ground"></div>
      <div id="title" class="clip title" style="font-size:${Math.min(96, Math.floor(980 / (0.6 * Math.max(...sh.title.map((l) => l.replace(/!/g, "").length)))))}px" data-start="0" data-duration="${dur}" data-track-index="1"><div id="title-in">${sh.title.map(em).join("<br>")}</div></div>
      <video id="v" class="clip" src="assets/seg.mp4" data-start="0" data-duration="${dur}" data-track-index="2" data-has-audio="true" data-volume="1" playsinline></video>
      ${capHtml}
    </div>
    <script>
      const tl = gsap.timeline({ paused: true });
      const CAPS = ${JSON.stringify(capData)};
      // the hook is on screen from frame 0 (the feed preview); it settles in with one small pulse
      tl.fromTo("#title-in", { scale: 1.06 }, { scale: 1, duration: 0.5, ease: "power3.out" }, 0);
      CAPS.forEach((times, k) => {
        times.forEach((t, j) => {
          const w = "#g" + k + "w" + j;
          // each word pops in on its spoken word and turns red while it is the one being said
          tl.fromTo(w, { opacity: 0, scale: 0.8, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.14, ease: "back.out(2)" }, Math.max(0, t - 0.05));
          tl.fromTo(w, { color: "#000000" }, { color: "${theme.accent}", duration: 0.01 }, Math.max(0, t - 0.05));
          const next = j + 1 < times.length ? times[j + 1] : (CAPS[k + 1] ? CAPS[k + 1][0] : t + 0.6);
          tl.fromTo(w, { color: "${theme.accent}" }, { color: "#000000", duration: 0.01, immediateRender: false }, Math.max(0, next - 0.05));
        });
      });
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
  writeFileSync(join(dir, "hyperframes.json"), readFileSync(join(root, "hyperframes.json")));
  console.log(`${sh.id}: ${start.toFixed(2)}-${end.toFixed(2)}s (${dur}s), ${groups.length} caption groups`);
}
