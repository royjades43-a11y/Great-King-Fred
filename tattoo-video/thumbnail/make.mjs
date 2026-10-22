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
function stick(id, { pose = "idle", mouth = "neutral", flip = false, bow = false, scale = 1, tattoo = false }) {
  const p = POSES[pose];
  let svg = stickSvg(id, { flip, variant: bow ? "bow" : undefined, scale, tattoo });
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
  .tag { background: ${theme.accent}; color: #fff; font-weight: 800; border-radius: 18px; padding: 10px 30px; letter-spacing: 0.02em;
    box-shadow: 0 10px 0 rgba(0,0,0,0.18), 0 22px 30px rgba(0,0,0,0.25); }
`;

const variants = {
  // A: the reveal. Bare arm, the needle waiting, and the reframe in four words.
  a: `
    <div class="abs" style="left:140px; top:260px">${stick("a", { pose: "armsCrossed", mouth: "tight", scale: 1.45 })}</div>
    <div class="abs ico" style="left:560px; top:380px; width:300px; height:300px">${iconSvg("needle")}</div>
    <div class="abs ico" style="left:610px; top:690px; width:90px; height:90px">${iconSvg("ink")}</div>
    <div class="abs t" style="left:1000px; top:250px; font-size:150px">Not<br>boring.<br><span class="r">Careful.</span></div>`,
  // B: time. Today's self and three future selves, an hourglass between.
  b: `
    <div class="abs" style="left:60px; top:330px">${stick("a", { pose: "point", mouth: "neutral", scale: 1.25 })}</div>
    <div class="abs ico" style="left:420px; top:300px; width:170px; height:170px">${iconSvg("hourglass")}</div>
    <div class="abs" style="left:470px; top:500px">${stick("f1", { pose: "idle", mouth: "neutral", scale: 0.8 })}</div>
    <div class="abs" style="left:660px; top:500px">${stick("f2", { pose: "shrug", mouth: "o", scale: 0.8 })}</div>
    <div class="abs" style="left:850px; top:500px">${stick("f3", { pose: "armsCrossed", mouth: "tight", scale: 0.8 })}</div>
    <div class="abs t" style="left:1180px; top:250px; font-size:130px">Forever<br>is a<br><span class="r">long time</span></div>`,
  // C: the number. A tattooed figure with second thoughts and the stat.
  c: `
    <div class="abs" style="left:200px; top:260px">${stick("b", { pose: "give", mouth: "frown", scale: 1.45, tattoo: true })}</div>
    <div class="abs ico" style="left:640px; top:200px; width:180px; height:180px">${iconSvg("question")}</div>
    <div class="abs t" style="left:900px; top:270px; font-size:170px"><span class="r">1 in 4</span><br>regret it</div>
    <div class="abs tag" style="left:930px; top:690px; font-size:64px">So why do others say no?</div>`,
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
