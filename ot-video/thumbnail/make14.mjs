// Video 14 thumbnails in the locked style: one big ink character on the right (figures.mjs), short text on the left, one word in a red box.
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { todoBox, futureYou, allMondays } from "./figures.mjs";

const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));
const css = readFileSync(join(here, "make.mjs"), "utf8").match(/const css = `([\s\S]*?)`;/)[1].replace(/\$\{theme\.(\w+)\}/g, (_, k) => theme[k]);
const extra = `.bubble.tl::after { right: auto; left: 70px; }`;

const variants = {
  // A: the reframe. Procrastination is a feeling, not laziness: hiding in the TO DO box.
  a: { fig: todoBox(), box: "left:1060px; top:80px; width:800px; height:1000px",
       body: `<div class="t" style="top:250px; font-size:160px">You're<br>Not <span class="box">Lazy</span></div>` },
  // B: the jaw-dropper. Future you got the ketchup.
  b: { fig: futureYou(), box: "left:1060px; top:60px; width:820px; height:1025px",
       body: `<div class="t" style="top:240px; font-size:150px">Future You<br><span class="box">Hates</span><br>This</div>` },
  // C: the confession. "I'll start Monday", every single week.
  c: { fig: allMondays(), box: "left:1040px; top:60px; width:820px; height:1025px",
       body: `<div class="t" style="top:280px; font-size:150px">I'll Start<br><span class="box">Monday</span></div>` },
};

for (const [k, v] of Object.entries(variants)) {
  const dir = join(here, "v14", k);
  mkdirSync(join(dir, "assets/fonts"), { recursive: true });
  copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><style>${css}${extra}</style></head><body>
<div id="root" data-composition-id="thumb" data-start="0" data-duration="1" data-width="1920" data-height="1080" data-no-timeline>
<div class="fig2" style="${v.box}">${v.fig}</div>${v.body}</div>
</body></html>`);
}
console.log("wrote", Object.keys(variants).join(", "));
