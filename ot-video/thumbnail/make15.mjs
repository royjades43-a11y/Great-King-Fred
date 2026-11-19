// Video 15 thumbnails in the locked style: one big ink character on the right (figures.mjs), short text on the left, one word in a red box.
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { buttonChair, kettleWait, dishIdea } from "./figures.mjs";

const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));
const css = readFileSync(join(here, "make.mjs"), "utf8").match(/const css = `([\s\S]*?)`;/)[1].replace(/\$\{theme\.(\w+)\}/g, (_, k) => theme[k]);
const extra = `.bubble.tl::after { right: auto; left: 70px; }`;

const variants = {
  // A: the jaw-dropper. Two in three men chose the shock over 15 quiet minutes.
  a: { fig: buttonChair(), box: "left:1040px; top:70px; width:820px; height:1025px",
       body: `<div class="t" style="top:250px; font-size:150px">They Chose<br>the <span class="box">Shock</span></div>` },
  // B: the everyday hook. Thirty seconds into the kettle, the hand goes for the phone.
  b: { fig: kettleWait(), box: "left:1130px; top:60px; width:820px; height:1025px",
       body: `<div class="t" style="top:240px; font-size:130px">You Can't<br>Wait <span class="box">2 Minutes</span></div>` },
  // C: the payoff. Boring jobs are where the good ideas show up.
  c: { fig: dishIdea(), box: "left:1060px; top:40px; width:820px; height:1025px",
       body: `<div class="t" style="top:260px; font-size:150px">Boredom Is<br><span class="box">Good</span><br>for You</div>` },
};

for (const [k, v] of Object.entries(variants)) {
  const dir = join(here, "v15", k);
  mkdirSync(join(dir, "assets/fonts"), { recursive: true });
  copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><style>${css}${extra}</style></head><body>
<div id="root" data-composition-id="thumb" data-start="0" data-duration="1" data-width="1920" data-height="1080" data-no-timeline>
<div class="fig2" style="${v.box}">${v.fig}</div>${v.body}</div>
</body></html>`);
}
console.log("wrote", Object.keys(variants).join(", "));
