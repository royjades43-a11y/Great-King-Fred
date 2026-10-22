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
function stick(id, { pose = "idle", mouth = "neutral", flip = false, bow = false, scale = 1 }) {
  const p = POSES[pose];
  let svg = stickSvg(id, { flip, variant: bow ? "bow" : undefined, scale });
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
  .stick .ground { fill: rgba(0,0,0,0.28); }
  .ico svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 8px 0 rgba(0,0,0,0.15)) drop-shadow(0 16px 18px rgba(0,0,0,0.2)); }
  .ico .s { fill: none; stroke: #000; stroke-width: 11; stroke-linecap: round; stroke-linejoin: round; }
  .ico .alm-s { stroke: ${theme.accent}; } .ico .acc-s { stroke: ${theme.accent}; } .ico .alm-f { fill: ${theme.accent}; }
  .wave .s { stroke: #1F6FB2; stroke-width: 14; }
  .ico .card-f { fill: #F1F5EF; } .ico .f { fill: #000; }
  .tag { background: ${theme.accent}; color: #fff; font-weight: 800; border-radius: 18px; padding: 10px 30px; letter-spacing: 0.02em;
    box-shadow: 0 10px 0 rgba(0,0,0,0.18), 0 22px 30px rgba(0,0,0,0.25); }
`;

const variants = {
  // A: the fight frozen mid-moment — one yells, one goes silent. Text = the reveal.
  a: `
    <div class="abs" style="left:70px; top:250px">${stick("a", { pose: "point", mouth: "o", scale: 1.45 })}</div>
    <div class="abs ico" style="left:360px; top:130px; width:250px; height:250px">${iconSvg("scribble")}</div>
    <div class="abs" style="left:620px; top:300px">${stick("b", { pose: "armsCrossed", mouth: "tight", flip: true, bow: true, scale: 1.45 })}</div>
    <div class="abs ico" style="left:870px; top:120px; width:170px; height:170px">${iconSvg("quiet")}</div>
    <div class="abs t" style="left:1080px; top:300px; font-size:150px">They're<br>not<br><span class="r">ignoring</span><br><span class="r">you</span></div>`,
  // B: the wall — the silent one behind a brick wall. Curiosity question.
  b: `
    <div class="abs" style="left:120px; top:250px">${stick("a", { pose: "shrug", mouth: "o", scale: 1.45 })}</div>
    <div class="abs ico" style="left:520px; top:627px; width:380px; height:380px">${iconSvg("wall")}</div>
    <div class="abs" style="left:900px; top:290px">${stick("b", { pose: "headDown", mouth: "tight", flip: true, bow: true, scale: 1.45 })}</div>
    <div class="abs t" style="left:1300px; top:220px; font-size:140px">Why<br>they<br>go<br><span class="r">silent</span></div>`,
  // C: flooding — a body overwhelmed; the science hook.
  c: `
    <div class="abs" style="left:240px; top:200px">${stick("b", { pose: "holdHead", mouth: "o", bow: true, scale: 1.6 })}</div>
    <div class="abs ico wave" style="left:150px; top:560px; width:560px; height:520px">${iconSvg("wave")}</div>
    <div class="abs ico" style="left:700px; top:150px; width:220px; height:220px">${iconSvg("heartbeat")}</div>
    <div class="abs t" style="left:1000px; top:260px; font-size:132px">It's not<br><span class="r">silence.</span></div>
    <div class="abs tag" style="left:1010px; top:600px; font-size:92px">It's flooding</div>`,
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
