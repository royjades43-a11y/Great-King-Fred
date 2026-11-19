// Video 13 thumbnails in the locked style: one big ink character on the right (figures.mjs), short text on the left, one word in a red box.
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { shoulderTalk, quietRoomHead, mirrorPep } from "./figures.mjs";

const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));
const css = readFileSync(join(here, "make.mjs"), "utf8").match(/const css = `([\s\S]*?)`;/)[1].replace(/\$\{theme\.(\w+)\}/g, (_, k) => theme[k]);
const extra = `.bubble.tl::after { right: auto; left: 70px; }`;

const variants = {
  // A: the embarrassing habit, made friendly. You and a tiny you, deep in conversation.
  a: { fig: shoulderTalk(), box: "left:1040px; top:60px; width:820px; height:1025px",
       body: `<div class="t" style="top:250px; font-size:160px">You're<br><span class="box">Not</span><br>Crazy</div>
       <div class="bubble" style="left:1330px; top:40px; font-size:72px">Keys…?</div>` },
  // B: the jaw-dropper. Some heads have an empty chair where the voice should be.
  b: { fig: quietRoomHead(), box: "left:1080px; top:60px; width:800px; height:1000px",
       body: `<div class="t" style="top:200px; font-size:130px">Some People<br>Have <span class="box">No</span><br>Inner Voice</div>` },
  // C: the payoff. Nervous you, confident reflection, one word that flips it.
  c: { fig: mirrorPep(), box: "left:960px; top:110px; width:930px; height:1033px",
       body: `<div class="t" style="top:300px; font-size:160px">Say Your<br><span class="box">Name</span></div>
       <div class="bubble tl" style="left:900px; top:40px; font-size:64px">Sam, you've got this.</div>` },
};

for (const [k, v] of Object.entries(variants)) {
  const dir = join(here, "v13", k);
  mkdirSync(join(dir, "assets/fonts"), { recursive: true });
  copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><style>${css}${extra}</style></head><body>
<div id="root" data-composition-id="thumb" data-start="0" data-duration="1" data-width="1920" data-height="1080" data-no-timeline>
<div class="fig2" style="${v.box}">${v.fig}</div>${v.body}</div>
</body></html>`);
}
console.log("wrote", Object.keys(variants).join(", "));
