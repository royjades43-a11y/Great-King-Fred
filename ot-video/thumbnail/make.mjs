// Video 12 thumbnails, KnowSense-style layout in our brand: a large AI-generated ink figure (img/*.png,
// made with Canva's image generator on our sage background) on the right, short text on the left with
// one word in a red box. Each variant is a still HyperFrames composition (1920x1080).
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));

const css = `
  @font-face { font-family: "M"; font-weight: 800; src: url("assets/fonts/montserrat-800.woff2") format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; overflow: hidden; }
  #root { position: absolute; inset: 0; font-family: "M", sans-serif; background: ${theme.paper}; }
  .fig { position: absolute; inset: 0; width: 1920px; height: 1080px; object-fit: cover; }
  .fade { position: absolute; inset: 0; background: linear-gradient(90deg, ${theme.paper} 0%, ${theme.paper} 38%, rgba(168,189,162,0) 58%); }
  .t { position: absolute; left: 90px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.02; color: #000; }
  .box { display: inline-block; background: ${theme.accent}; color: #fff; padding: 0 22px 8px; border-radius: 10px; margin: 6px 0;
    box-shadow: 0 10px 0 rgba(0,0,0,0.18); }
  .bubble { position: absolute; background: #F1F5EF; border: 9px solid #000; border-radius: 36px; padding: 18px 40px; font-weight: 800;
    font-size: 84px; letter-spacing: -0.03em; box-shadow: 0 10px 0 rgba(0,0,0,0.15), 0 24px 34px rgba(0,0,0,0.22); }
  .bubble::after { content: ""; position: absolute; right: 60px; bottom: -46px; border: 24px solid transparent; border-top: 30px solid #000; }
`;

const variants = {
  a: { img: "a.png", body: `<div class="t" style="top:250px; font-size:150px">You're<br><span class="box">Overthinking</span><br>It</div>
       <div class="bubble" style="left:1610px; top:290px">ok.</div>` },
  b: { img: "b.png", body: `<div class="t" style="top:230px; font-size:140px"><span class="box">91%</span> of<br>Worries Never<br>Happen</div>` },
  c: { img: "c.png", body: `<div class="t" style="top:280px; font-size:165px">Do <span class="box">This</span><br>Instead</div>` },
};

for (const [k, v] of Object.entries(variants)) {
  const dir = join(here, k);
  mkdirSync(join(dir, "assets/fonts"), { recursive: true });
  copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
  copyFileSync(join(here, "img", v.img), join(dir, "assets", v.img));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>
<div id="root" data-composition-id="thumb" data-start="0" data-duration="1" data-width="1920" data-height="1080" data-no-timeline>
<img class="fig" src="assets/${v.img}" alt=""><div class="fade"></div>${v.body}</div>
</body></html>`);
}
console.log("wrote", Object.keys(variants).join(", "));
