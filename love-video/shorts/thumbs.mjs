// Vertical (1080x1920) cover images for the Shorts, same look as the long-form thumbnails.
//   node shorts/thumbs.mjs   -> shorts/build/thumbs/<id>/index.html (snapshot + export in the README steps)
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { stickSvg, POSES } from "../tools/stick.mjs";
import { iconSvg } from "../tools/icons.mjs";

const here = new URL(".", import.meta.url).pathname;
const root = join(here, "..");
const theme = JSON.parse(readFileSync(join(root, "theme.json"), "utf8"));

function stick(id, { pose = "idle", mouth = "neutral", flip = false, bow = false, scale = 1, hat = false, sit = false }) {
  const p = POSES[pose];
  let svg = stickSvg(id, { flip, variant: bow ? "bow" : undefined, scale, hat, sit });
  for (const j of ["aLu", "aLl", "aRu", "aRl", "hd"]) {
    const [cx, cy] = POSES._org[j].split(" ");
    const extraY = j === "hd" ? ` translate(0 ${p.hy || 0})` : "";
    svg = svg.replace(`id="${id}-${j}"`, `id="${id}-${j}" transform="rotate(${p[j] || 0} ${cx} ${cy})${extraY}"`);
  }
  return svg.replace(/id="(\S+)-m-(\w+)"/g, (m, a, name) => `${m}${name === mouth ? "" : ' style="display:none"'}`);
}
const at = (x, y, html, extra = "") => `<div class="abs ${extra}" style="left:${x}px; top:${y}px">${html}</div>`;
const ico = (name, x, y, size, extra = "") => `<div class="abs ico ${extra}" style="left:${x}px; top:${y}px; width:${size}px; height:${size}px">${iconSvg(name)}</div>`;
const title = (lines, size = 150) => `<div class="abs t" style="left:0; right:0; top:330px; font-size:${size}px">${lines.join("<br>").replace(/!([^!]+)!/g, '<span class="r">$1</span>')}</div>`;

const css = `
  @font-face { font-family: "M"; font-weight: 800; src: url("assets/fonts/montserrat-800.woff2") format("woff2"); }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1920px; overflow: hidden; }
  #root { position: absolute; inset: 0; font-family: "M", sans-serif;
    background: radial-gradient(ellipse at 50% 55%, #B6CAB0 0%, ${theme.paper} 55%, #93AA8C 100%); }
  .abs { position: absolute; }
  .t { text-align: center; font-weight: 800; letter-spacing: -0.045em; line-height: 0.9; color: #000; text-transform: uppercase;
    text-shadow: 0 8px 0 rgba(0,0,0,0.18), 0 18px 30px rgba(0,0,0,0.25); }
  .r { color: ${theme.accent}; }
  .handle { left: 0; right: 0; text-align: center; font-weight: 800; font-size: 40px; color: ${theme.muted}; }
  .stick { overflow: visible; filter: drop-shadow(0 10px 0 rgba(0,0,0,0.14)) drop-shadow(10px 20px 18px rgba(0,0,0,0.22)); }
  .stick .s { fill: none; stroke: #000; stroke-width: 13; stroke-linecap: round; stroke-linejoin: round; }
  .stick .face { fill: #F1F5EF; } .stick .f { fill: #000; } .stick .bow { fill: ${theme.accent}; }
  .stick .ground { fill: rgba(0,0,0,0.28); }
  .bubble { background: #F1F5EF; border: 8px solid #000; border-radius: 40px; padding: 26px 40px; font-weight: 800; font-size: 64px;
    line-height: 1.05; letter-spacing: -0.03em; text-align: center; white-space: nowrap; box-shadow: 0 10px 0 rgba(0,0,0,0.15), 0 24px 34px rgba(0,0,0,0.22); }
  .tag { background: ${theme.accent}; color: #fff; font-weight: 800; border-radius: 22px; padding: 14px 40px; font-size: 72px; box-shadow: 0 10px 0 rgba(0,0,0,0.18), 0 22px 30px rgba(0,0,0,0.25); }
  .ico svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 8px 0 rgba(0,0,0,0.15)) drop-shadow(0 16px 18px rgba(0,0,0,0.2)); }
  .ico .s { fill: none; stroke: #000; stroke-width: 11; stroke-linecap: round; stroke-linejoin: round; }
  .ico .alm-s, .ico .acc-s { stroke: ${theme.accent}; } .ico .alm-f { fill: ${theme.accent}; } .ico .f { fill: #000; }
  .ico .card-f { fill: #F1F5EF; }
  .ico .s.thin { stroke-width: 4.5; } .ico .s.mid { stroke-width: 7; }
  .big .s.thin { stroke-width: 2.6; } .big .s.mid { stroke-width: 3.8; }
  .ico.red .f { fill: ${theme.accent}; }
  .wave .s { stroke: #1F6FB2; stroke-width: 14; }
  .bubble { background: #F1F5EF; border: 8px solid #000; border-radius: 40px; padding: 30px 40px; font-weight: 800; font-size: 64px;
    line-height: 1.05; letter-spacing: -0.03em; text-align: center; box-shadow: 0 10px 0 rgba(0,0,0,0.15), 0 24px 34px rgba(0,0,0,0.22); }
  .stamp { border: 12px solid ${theme.accent}; color: ${theme.accent}; background: rgba(241,245,239,0.6); border-radius: 22px; padding: 12px 40px;
    font-weight: 800; font-size: 84px; letter-spacing: 0.06em; transform: rotate(-8deg); box-shadow: 0 10px 0 rgba(0,0,0,0.15), 0 22px 30px rgba(0,0,0,0.22); }
`;

const S = 1.5; // stickman scale (300x520 -> 450x780)
const covers = {
  "01-same-woman-different-bridge": title(["Same woman.", "Different", "!bridge!"], 122)
    + ico("bridge", 40, 830, 1000, "big") + at(400, 900, stick("a", { pose: "strain", mouth: "o", scale: 0.9 })),
  "02-fear-feels-like-love": title(["Fear feels", "like !love!"], 150)
    + at(110, 1000, stick("a", { pose: "holdHead", mouth: "o", scale: 1.25 })) + ico("heart", 560, 930, 380, "red") + ico("heartbeat", 520, 1330, 460),
  "03-hot-and-cold": title(["Hot and cold", "isn't", "!chemistry!"], 130)
    + ico("alarm", 120, 1020, 380) + ico("heart", 600, 1060, 340, "red"),
  "04-who-says-it-first": title(["Who says", "“I love you”", "!first!?"], 124)
    + `<div class="abs bubble" style="left:70px; top:820px; font-size:84px">I love you!</div>`
    + at(80, 1040, stick("a", { pose: "happy", mouth: "smile", scale: 1.2 })) + at(600, 1040, stick("b", { pose: "idle", mouth: "o", flip: true, bow: true, scale: 1.2 })),
  "05-love-at-first-sight": title(["Love at", "first !sight!?"], 150)
    + at(60, 1040, stick("a", { pose: "idle", mouth: "smile", scale: 1.2 })) + at(620, 1040, stick("b", { pose: "idle", mouth: "neutral", flip: true, bow: true, scale: 1.2 }))
    + ico("heart", 420, 900, 240, "red"),
  "06-its-chemistry": title(["Not weakness.", "!Chemistry.!"], 112)
    + ico("brain", 90, 980, 440) + ico("phone", 620, 1040, 340),
  "07-three-dates-in": title(["3 dates in.", "Already", "!sure!?"], 140)
    + ico("thought", 400, 860, 600) + ico("dog", 500, 940, 210) + ico("rings", 730, 960, 170)
    + at(60, 1120, stick("a", { pose: "happy", mouth: "smile", scale: 1.1 })) + ico("heart", 120, 970, 130, "red") + ico("heart", 300, 930, 100, "red"),
  "08-five-rules": title(["5 rules to", "fall in love", "at the !right speed!"], 104)
    + ico("checklist", 110, 1000, 420) + ico("heart", 620, 1080, 320, "red"),
  "09-not-a-flaw": title(["Falling fast", "isn't a !flaw!"], 140)
    + at(300, 960, stick("a", { pose: "happy", mouth: "smile", scale: 1.35 })) + ico("heart", 455, 1170, 150, "red"),
};

for (const [id, body] of Object.entries(covers)) {
  const dir = join(here, "build/thumbs", id);
  mkdirSync(join(dir, "assets/fonts"), { recursive: true });
  copyFileSync(join(root, "assets/fonts/montserrat-800.woff2"), join(dir, "assets/fonts/montserrat-800.woff2"));
  writeFileSync(join(dir, "index.html"), `<!doctype html><html><head><meta charset="UTF-8"><style>${css}</style></head><body>
<div id="root" data-composition-id="thumb" data-start="0" data-duration="1" data-width="1080" data-height="1920" data-no-timeline>${body}
<div class="abs handle" style="top:1760px">${theme.handle}</div></div></body></html>`);
}
console.log("wrote", Object.keys(covers).length, "covers");
