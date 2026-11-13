// Extra thumbnails (D) for videos 7 to 11, same layout as video 12's: KnowSense-style layout in our brand: one big hand-built ink figure (figures.mjs) on the right, short text on the left with
// one word in a red box. Each variant is a still HyperFrames composition (1920x1080).
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { skeletonCouple, nervousPhone, fallingHeart, hookedHeart, marionette } from "./figures.mjs";

const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));

const css = `
  @font-face { font-family: "M"; font-weight: 800; src: url("assets/fonts/montserrat-800.woff2") format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; overflow: hidden; }
  #root { position: absolute; inset: 0; font-family: "M", sans-serif; background: ${theme.paper}; }
  #root { background: radial-gradient(ellipse at 70% 50%, #B6CAB0 0%, ${theme.paper} 55%, #93AA8C 100%); }
  .fig2 { position: absolute; filter: drop-shadow(0 10px 0 rgba(0,0,0,0.14)) drop-shadow(12px 22px 20px rgba(0,0,0,0.22)); }
  .fig2 svg { width: 100%; height: 100%; overflow: visible; }
  .t { position: absolute; left: 90px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; color: #000; }
  .box { display: inline-block; background: ${theme.accent}; color: #fff; padding: 0 22px 8px; border-radius: 10px; margin: 6px 0;
    box-shadow: 0 10px 0 rgba(0,0,0,0.18); }
  .bubble { position: absolute; background: #F1F5EF; border: 9px solid #000; border-radius: 36px; padding: 18px 40px; font-weight: 800;
    font-size: 84px; letter-spacing: -0.03em; box-shadow: 0 10px 0 rgba(0,0,0,0.15), 0 24px 34px rgba(0,0,0,0.22); }
  .bubble::after { content: ""; position: absolute; right: 60px; bottom: -46px; border: 24px solid transparent; border-top: 30px solid #000; }
`;

const variants = {
  v07: { fig: skeletonCouple(), box: "left:860px; top:80px; width:1040px; height:946px",
         body: `<div class="t" style="top:300px; font-size:140px">Why Some<br>Couples<br><span class="box">Last</span></div>` },
  v08: { fig: nervousPhone(), box: "left:1080px; top:60px; width:800px; height:1000px",
         body: `<div class="t" style="top:260px; font-size:140px">Why They<br><span class="box">Never</span> Text<br>First</div>` },
  v09: { fig: fallingHeart(), box: "left:1060px; top:40px; width:820px; height:1025px",
         body: `<div class="t" style="top:280px; font-size:150px">Falling<br><span class="box">Too Fast?</span></div>` },
  v10: { fig: hookedHeart(), box: "left:1100px; top:0px; width:800px; height:1000px",
         body: `<div class="t" style="top:250px; font-size:140px">Why You<br>Keep <span class="box">Going</span><br><span class="box">Back</span></div>` },
  v11: { fig: marionette(), box: "left:1080px; top:30px; width:820px; height:1025px",
         body: `<div class="t" style="top:260px; font-size:150px">Why You<br><span class="box">Can't</span><br>Say No</div>
         <div class="bubble" style="left:1580px; top:180px; font-size:72px">Sure!</div>` },
};

for (const [k, v] of Object.entries(variants)) {
  const dir = join(here, "past", k);
  mkdirSync(join(dir, "assets/fonts"), { recursive: true });
  copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>
<div id="root" data-composition-id="thumb" data-start="0" data-duration="1" data-width="1920" data-height="1080" data-no-timeline>
<div class="fig2" style="${v.box}">${v.fig}</div>${v.body}</div>
</body></html>`);
}
console.log("wrote", Object.keys(variants).join(", "));
