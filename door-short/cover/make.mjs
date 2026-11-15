// Vertical cover for Short 04 in the locked thumbnail style.
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sneakyDoor } from "../../ot-video/thumbnail/figures.mjs";
const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));
const dir = join(here, "c");
mkdirSync(join(dir, "assets/fonts"), { recursive: true });
copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><style>
  @font-face { font-family: "M"; font-weight: 800; src: url("assets/fonts/montserrat-800.woff2") format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; }
  #root { position: absolute; inset: 0; font-family: "M", sans-serif; background: radial-gradient(ellipse at 50% 55%, #B6CAB0 0%, ${theme.paper} 55%, #93AA8C 100%); }
  .t { position: absolute; left: 0; right: 0; text-align: center; font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; color: #000; }
  .box { display: inline-block; background: ${theme.accent}; color: #fff; padding: 0 26px 10px; border-radius: 12px; box-shadow: 0 10px 0 rgba(0,0,0,0.18); }
  .fig { position: absolute; left: 100px; top: 640px; width: 880px; height: 1100px; filter: drop-shadow(0 10px 0 rgba(0,0,0,0.14)) drop-shadow(12px 22px 20px rgba(0,0,0,0.22)); }
  .fig svg { width: 100%; height: 100%; overflow: visible; }
</style></head><body>
<div id="root" data-composition-id="cover" data-start="0" data-duration="1" data-width="1080" data-height="1920" data-no-timeline>
<div class="t" style="top:250px; font-size:170px">Blame<br>the <span class="box">Door</span></div>
<div class="fig">${sneakyDoor()}</div>
</div></body></html>`);
console.log("wrote cover");
