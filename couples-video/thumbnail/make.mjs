// Builds YouTube thumbnail variants as still HyperFrames compositions (1920x1080),
// then `npm run thumbs` snapshots them and scales to 1280x720 JPGs.
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { stickSvg, POSES } from "../tools/stick.mjs";
import { iconSvg } from "../tools/icons.mjs";

const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));

// a posed, static stickman: joint rotations baked into SVG transforms
function stick(id, { pose = "idle", mouth = "neutral", flip = false, bow = false, scale = 1, tattoo = false, sit = false }) {
  const p = POSES[pose];
  let svg = stickSvg(id, { flip, variant: bow ? "bow" : undefined, scale, tattoo, sit });
  for (const j of ["aLu", "aLl", "aRu", "aRl", "hd"]) {
    const [cx, cy] = POSES._org[j].split(" ");
    const extraY = j === "hd" ? ` translate(0 ${p.hy || 0})` : "";
    svg = svg.replace(`id="${id}-${j}"`, `id="${id}-${j}" transform="rotate(${p[j] || 0} ${cx} ${cy})${extraY}"`);
  }
  return svg.replace(/id="(\S+)-m-(\w+)"/g, (m, a, name) => `${m}${name === mouth ? "" : ' style="display:none"'}`);
}

const css = `
  @font-face { font-family: "M"; font-weight: 800; src: url("assets/fonts/montserrat-800.woff2") format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1920px; height: 1080px; overflow: hidden; }
  #root { position: absolute; inset: 0; font-family: "M", sans-serif;
    background: radial-gradient(ellipse at 50% 45%, #B6CAB0 0%, ${theme.paper} 55%, #93AA8C 100%); }
  .abs { position: absolute; }
  .t { font-weight: 800; letter-spacing: -0.04em; line-height: 0.88; color: #000; text-transform: uppercase;
    text-shadow: 0 8px 0 rgba(0,0,0,0.18), 0 18px 30px rgba(0,0,0,0.25); }
  .r { color: ${theme.accent}; }
  .stick { overflow: visible; filter: drop-shadow(0 10px 0 rgba(0,0,0,0.14)) drop-shadow(10px 20px 18px rgba(0,0,0,0.22)); }
  .stick .s { fill: none; stroke: #000; stroke-width: 13; stroke-linecap: round; stroke-linejoin: round; }
  .stick .face { fill: #F1F5EF; } .stick .f { fill: #000; } .stick .bow { fill: ${theme.accent}; }
  .stick .ground { fill: rgba(0,0,0,0.28); } .stick .tat { fill: ${theme.accent}; }
  .ico svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 8px 0 rgba(0,0,0,0.15)) drop-shadow(0 16px 18px rgba(0,0,0,0.2)); }
  .ico .s { fill: none; stroke: #000; stroke-width: 11; stroke-linecap: round; stroke-linejoin: round; }
  .ico .alm-s { stroke: ${theme.accent}; } .ico .acc-s { stroke: ${theme.accent}; } .ico .alm-f { fill: ${theme.accent}; }
  .wave .s { stroke: #1F6FB2; stroke-width: 14; }
  .ico .card-f { fill: #F1F5EF; } .ico .f { fill: #000; }
  .bubble { position: absolute; background: #F1F5EF; border: 9px solid #000; border-radius: 40px; padding: 26px 44px; font-weight: 800; font-size: 72px;
    letter-spacing: -0.03em; white-space: nowrap; box-shadow: 0 10px 0 rgba(0,0,0,0.15), 0 24px 34px rgba(0,0,0,0.22); }
  .bubble::after { content: ""; position: absolute; left: 70px; bottom: -46px; border: 24px solid transparent; border-top: 30px solid #000; }
  .bar { position: absolute; bottom: 230px; width: 130px; border-radius: 16px 16px 0 0; box-shadow: 0 10px 0 rgba(0,0,0,0.15); }
  .bl { position: absolute; top: 870px; width: 200px; text-align: center; font-weight: 800; font-size: 46px; }
  .tag { background: ${theme.accent}; color: #fff; font-weight: 800; border-radius: 18px; padding: 10px 30px; letter-spacing: 0.02em;
    box-shadow: 0 10px 0 rgba(0,0,0,0.18), 0 22px 30px rgba(0,0,0,0.25); }
`;

const variants = {
  // A: the hook scene. One bid, one partner on a phone, and the promise of the habit.
  a: `
    <div class="bubble" style="left:190px; top:70px; font-size:64px">Look at that bird.</div>
    <div class="abs ico" style="left:880px; top:150px; width:270px; height:270px">${iconSvg("window")}</div>
    <div class="abs ico" style="left:950px; top:200px; width:135px; height:135px">${iconSvg("bird")}</div>
    <div class="abs" style="left:150px; top:420px">${stick("a", { pose: "point", mouth: "smile", scale: 1.1, sit: true })}</div>
    <div class="abs" style="left:470px; top:420px">${stick("b", { pose: "headDown", mouth: "neutral", scale: 1.1, sit: true, flip: true, bow: true })}</div>
    <div class="abs ico" style="left:140px; top:600px; width:560px; height:560px">${iconSvg("table")}</div>
    <div class="abs t" style="left:1210px; top:330px; font-size:116px">The<br><span class="r">10-second</span><br>habit</div>
    <div class="abs tag" style="left:1215px; top:720px; font-size:52px; white-space:nowrap">couples who last</div>`,
  // B: the twist. A couple mid-argument, still together.
  b: `
    <div class="abs" style="left:150px; top:260px">${stick("a", { pose: "point", mouth: "tight", scale: 1.35 })}</div>
    <div class="abs" style="left:520px; top:260px">${stick("b", { pose: "armsCrossed", mouth: "frown", scale: 1.35, flip: true, bow: true })}</div>
    <div class="abs ico" style="left:395px; top:110px; width:200px; height:200px">${iconSvg("heart")}</div>
    <div class="abs t" style="left:1000px; top:250px; font-size:140px">Happy<br>couples<br><span class="r">still fight</span></div>`,
  // C: the number. Turned toward the bids: 86% vs 33%.
  c: `
    <div class="bar" style="left:150px; height:560px; background:${theme.accent}"></div>
    <div class="bar" style="left:420px; height:215px; background:#2E3A2C"></div>
    <div class="abs t r" style="left:118px; top:200px; font-size:84px">86%</div>
    <div class="abs t" style="left:388px; top:545px; font-size:84px">33%</div>
    <div class="bl" style="left:115px">stayed</div><div class="bl" style="left:385px">split</div>
    <div class="abs t" style="left:800px; top:250px; font-size:122px">One tiny habit<br><span class="r">predicted</span><br>who stayed</div>
    <div class="abs tag" style="left:810px; top:700px; font-size:52px; white-space:nowrap">turning toward the bids</div>`,
};

for (const [k, body] of Object.entries(variants)) {
  const dir = join(here, k);
  mkdirSync(join(dir, "assets/fonts"), { recursive: true });
  copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>
<div id="root" data-composition-id="thumb" data-start="0" data-duration="1" data-width="1920" data-height="1080" data-no-timeline>${body}</div>
</body></html>`);
}
console.log("wrote", Object.keys(variants).join(", "));
