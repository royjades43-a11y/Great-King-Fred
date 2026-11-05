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
  .strike { position: absolute; height: 12px; background: ${theme.accent}; border-radius: 6px; transform: rotate(-4deg); box-shadow: 0 6px 0 rgba(0,0,0,0.15); }
`;

const variants = {
  // A: the hook. The typed-and-deleted message, and the twist in three words.
  a: `
    <div class="bubble" style="left:110px; top:110px; font-size:66px">Hey, how've you been?</div>
    <div class="strike" style="left:130px; top:178px; width:740px"></div>
    <div class="abs" style="left:180px; top:420px">${stick("a", { pose: "headDown", mouth: "tight", scale: 1.25 })}</div>
    <div class="abs ico" style="left:520px; top:560px; width:250px; height:250px">${iconSvg("phone")}</div>
    <div class="abs t" style="left:1060px; top:260px; font-size:146px">They're<br>waiting<br><span class="r">for you</span></div>
    <div class="abs tag" style="left:1070px; top:760px; font-size:54px; white-space:nowrap">why you never text first</div>`,
  // B: the irony. Two friends, two phones, nobody sends.
  b: `
    <div class="abs" style="left:110px; top:300px">${stick("a", { pose: "headDown", mouth: "frown", scale: 1.2 })}</div>
    <div class="abs ico" style="left:380px; top:450px; width:200px; height:200px">${iconSvg("phone")}</div>
    <div class="abs" style="left:640px; top:300px">${stick("b", { pose: "headDown", mouth: "frown", scale: 1.2, flip: true, bow: true })}</div>
    <div class="abs ico" style="left:560px; top:450px; width:200px; height:200px">${iconSvg("phone")}</div>
    <div class="abs t" style="left:1060px; top:270px; font-size:140px">Both<br>waiting.<br><span class="r">Neither<br>forgot.</span></div>`,
  // C: the number. What senders guessed vs how much it meant.
  c: `
    <div class="bar" style="left:150px; height:250px; background:#2E3A2C"></div>
    <div class="bar" style="left:420px; height:560px; background:${theme.accent}"></div>
    <div class="bl" style="left:115px">you<br>guess</div><div class="bl r" style="left:385px">they<br>feel</div>
    <div class="abs t" style="left:760px; top:280px; font-size:120px">One text<br>means <span class="r">more</span><br>than you think</div>`,
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
