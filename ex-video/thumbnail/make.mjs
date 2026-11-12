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
  #root { --paper: ${theme.paper}; position: absolute; inset: 0; font-family: "M", sans-serif;
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
  .ico .s.thin { stroke-width: 4.5; } .ico .s.mid { stroke-width: 7; }
  .big .s.thin { stroke-width: 2.2; } .big .s.mid { stroke-width: 3.2; }
  .red .f { fill: ${theme.accent}; }
  .bar { bottom: auto; }
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
  // A: the hook. Late at night in bed, the message already typed.
  a: `
    <div class="abs ico" style="left:70px; top:60px; width:150px; height:150px">${iconSvg("moon")}</div>
    <div class="abs ico" style="left:40px; top:250px; width:860px; height:860px">${iconSvg("bed")}</div>
    <div class="abs" style="left:297px; top:373px">${stick("a", { pose: "give", mouth: "o", scale: 0.95, sit: true })}</div>
    <div class="abs ico" style="left:520px; top:345px; width:300px; height:300px; opacity:0.9">${iconSvg("glow")}</div>
    <div class="abs ico" style="left:585px; top:410px; width:170px; height:170px">${iconSvg("phone")}</div>
    <div class="bubble" style="left:480px; top:160px; font-size:66px">Hey, stranger.</div>
    <div class="abs t" style="left:1150px; top:330px; font-size:165px">Don't<br>send<br><span class="r">it.</span></div>`,
  // B: the highlight reel. The good frames stay, the bad one gets cut out.
  b: `
    <div class="abs ico" style="left:20px; top:120px; width:1000px; height:1000px; clip-path:inset(0 33.5% 0 0)">${iconSvg("film")}</div>
    <div class="abs ico red" style="left:125px; top:500px; width:160px; height:160px">${iconSvg("heart")}</div>
    <div class="abs ico red" style="left:440px; top:500px; width:160px; height:160px">${iconSvg("heart")}</div>
    <div class="abs" style="left:0; top:0; width:1920px; height:1080px; transform-origin:830px 620px; transform:translate(10px,100px) rotate(12deg)">
      <div class="abs ico" style="left:20px; top:120px; width:1000px; height:1000px; clip-path:inset(0 0 0 66.5%)">${iconSvg("film")}</div>
      <div class="abs ico" style="left:755px; top:510px; width:150px; height:150px">${iconSvg("broken")}</div>
    </div>
    <div class="abs ico" style="left:600px; top:110px; width:270px; height:270px; transform:rotate(-8deg)">${iconSvg("scissors")}</div>
    <div class="abs t" style="left:1110px; top:260px; font-size:132px">You miss<br>the <span class="r">highlight<br>reel</span></div>`,
  // C: the brain scans. Rejection lit up the brain's craving system.
  c: `
    <div class="abs ico" style="left:180px; top:0px; width:500px; height:500px; opacity:0.45">${iconSvg("glow")}</div>
    <div class="abs ico" style="left:265px; top:85px; width:330px; height:330px">${iconSvg("brain")}</div>
    <div class="abs" style="left:280px; top:420px">${stick("a", { pose: "holdHead", mouth: "frown", scale: 1.15 })}</div>
    <div class="abs ico" style="left:700px; top:560px; width:170px; height:170px; transform:rotate(10deg)">${iconSvg("phone")}</div>
    <div class="abs ico" style="left:90px; top:560px; width:150px; height:150px; transform:rotate(-12deg)">${iconSvg("broken")}</div>
    <div class="abs t" style="left:980px; top:290px; font-size:150px">Your ex<br>is a<br><span class="r">craving</span></div>`,
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
