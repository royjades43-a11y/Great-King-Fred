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
  // A: the reframe. A cheerful late runner and a clock, with the twist in two words.
  a: `
    <div class="abs ico" style="left:120px; top:120px; width:260px; height:260px">${iconSvg("clock")}</div>
    <div class="abs" style="left:330px; top:330px">${stick("a", { pose: "victory", mouth: "smile", scale: 1.4 })}</div>
    <div class="abs t" style="left:900px; top:250px; font-size:150px">Not rude.</div>
    <div class="abs t r" style="left:900px; top:430px; font-size:118px">Optimistic.</div>
    <div class="abs tag" style="left:920px; top:650px; font-size:58px; white-space:nowrap">why you're always late</div>`,
  // B: the text message, and the friend waiting.
  b: `
    <div class="bubble" style="left:110px; top:120px">I'll be there in 5 min</div>
    <div class="abs" style="left:262px; top:430px">${stick("f", { pose: "headDown", mouth: "frown", scale: 1.1, sit: true })}</div>
    <div class="abs ico" style="left:190px; top:590px; width:480px; height:480px">${iconSvg("table")}</div>
    <div class="abs t" style="left:930px; top:270px; font-size:136px">Your 5 min<br>≠ their<br><span class="r">5 min</span></div>`,
  // C: the numbers. Best guess, worst case, reality.
  c: `
    <div class="bar" style="left:120px; height:300px; background:#2E3A2C"></div>
    <div class="bar" style="left:330px; height:430px; background:#2E3A2C"></div>
    <div class="bar" style="left:540px; height:490px; background:${theme.accent}"></div>
    <div class="bl" style="left:85px">best</div><div class="bl" style="left:295px">worst</div><div class="bl r" style="left:505px">real</div>
    <div class="abs t" style="left:830px; top:270px; font-size:140px">Later than<br>the <span class="r">worst</span><br><span class="r">case</span></div>`,
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
