// EP02 thumbnails (1280x720). node brand/thumbs.mjs
import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { C, at, txt, bean, brain, stampSvg, sparkles, speedLines, coin, letter, gift, bubble, cross } from "../../moneybrain/tools/kit.mjs";
import { snowball } from "../../ep03/tools/props3.mjs";
import { box, staircase, strawHat, seedBag, harvest, taxBite, truck } from "../tools/props4.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");
mkdirSync(OUT, { recursive: true });
const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;
const F = "../../moneybrain/assets/fonts";
const FONTS = `@font-face { font-family: "Archivo Black"; src: url("${F}/ArchivoBlack.woff2"); }
@font-face { font-family: "Patrick Hand"; src: url("${F}/PatrickHand.woff2"); }
@font-face { font-family: "Space Mono"; font-weight: 700; src: url("${F}/SpaceMono.woff2"); }`;

const paper = (bg = C.paper, rule = C.rule) => `<rect width="1280" height="720" fill="${bg}"/>` +
  Array.from({ length: 15 }, (_, i) => `<path d="M 0 ${(i + 1) * 48} L 1280 ${(i + 1) * 48}" stroke="${rule}" stroke-width="2"/>`).join("");
function tagHead(lines, x, y, w, size = 84, rot = -4, bg = C.white) {
  const h = lines.length * size * 1.08 + 46;
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M 10 ${h / 2 + 12} L 70 12 L ${w + 12} 12 L ${w + 12} ${h + 12} L 70 ${h + 12} Z" transform="translate(0 ${-h / 2})" fill="${C.ink}" opacity="0.3"/>
    <path d="M 0 0 L 60 ${-h / 2} L ${w} ${-h / 2} L ${w} ${h / 2} L 60 ${h / 2} Z" fill="${bg}" ${INK} stroke-width="8"/>
    <circle cx="48" cy="0" r="15" fill="${C.paper}" ${INK} stroke-width="6"/>
    ${lines.map(([t, col], i) => `<text x="${(w + 70) / 2}" y="${(i - (lines.length - 1) / 2) * size * 1.08 + 6}" font-family="Archivo Black" font-size="${size}" fill="${col}" text-anchor="middle" dominant-baseline="middle">${t}</text>`).join("")}
  </g>`;
}
const stop = `<path d="M 0 0 L 0 -200" stroke="${C.ink}" stroke-width="14" stroke-linecap="round"/>` + (() => { let p = ""; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; p += `${i ? "L" : "M"} ${(Math.cos(a) * 110).toFixed(1)} ${(Math.sin(a) * 110 - 300).toFixed(1)} `; } return `<path d="${p}Z" fill="${C.red}" stroke="${C.ink}" stroke-width="6"/>`; })() + txt(0, -296, "STOP", 56, C.white, { font: "bold" });

const thumbs = {
  // A — which box? Bean with the snowball, three labelled boxes, one glowing
  "ep04-thumb-A-which-box": `${paper(C.slateDk, "#6F8BA0")}
    ${at(250, 690, 0.95, box("401(K)", { w: 300, h: 230 }))}
    ${at(580, 690, 0.95, box("IRA", { w: 300, h: 230 }))}
    ${at(930, 700, 1.05, `<circle cx="0" cy="-120" r="230" fill="${C.gold}" opacity="0.35"/>` + box("ROTH", { w: 300, h: 230, open: true }))}
    ${at(930, 250, 1.2, txt(0, 0, "?", 140, C.gold, { font: "bold", extra: `stroke="${C.ink}" stroke-width="8" paint-order="stroke"` }))}
    ${at(1170, 720, 0.6, bean({ pose: "hold", face: "thinking", noShadow: true, item: snowball("$"), itemScale: 0.45 }))}
    ${tagHead([["WHICH BOX", C.ink], ["FIRST?", C.red]], 20, 150, 560, 64, -4)}`,

  // B — the staircase: step 1 is the free money
  "ep04-thumb-B-step-one": `${paper()}
    ${at(240, 700, 1.15, staircase(3, 1, ["MATCH", "", ""], { sw: 220, sh: 120 }))}
    ${at(366, 560, 0.62, bean({ pose: "cheer", face: "joy", noShadow: true }))}
    ${at(1080, 690, 1.15, gift("FREE $", C.olive))}${at(1080, 400, 1, sparkles(6, 200))}
    ${tagHead([["DO THIS", C.white], ["FIRST", C.gold]], 20, 130, 440, 74, -4, C.red)}`,

  // C — tax now or later: the farmer, seed bag vs harvest with the TAX bite
  "ep04-thumb-C-tax-now-or-later": `${paper()}
    ${at(240, 700, 1.15, seedBag())}${at(240, 420, 0.75, taxBite("NOW"))}
    ${at(720, 700, 1.1, harvest(""))}${at(720, 330, 0.95, taxBite("LATER"))}
    ${at(1140, 720, 0.7, bean({ pose: "shrug", face: "thinking", noShadow: true, front: at(4, -368, 0.8, strawHat()) }))}
    ${tagHead([["TAX NOW", C.oliveDk], ["OR LATER?", C.red]], 20, 110, 520, 64, -3)}`,

  // D — don't cash out: Impulse with the $48,000 letter, a stop sign
  "ep04-thumb-D-dont-cash-out": `${paper()}
    ${at(330, 740, 1.25, brain({ face: "love", pose: "point", noShadow: true }))}
    ${at(720, 640, 1.05, letter(["OLD 401(K)", "-", "$48,000"], { w: 300, h: 260, size: 42 }), 6)}
    ${at(1120, 740, 1.15, stop)}
    ${tagHead([["DON'T", C.white], ["CASH OUT", C.gold]], 20, 130, 500, 70, -4, C.red)}`,
};

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
const shots = [];
for (const [name, body] of Object.entries(thumbs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">${body}</svg>`;
  writeFileSync(join(OUT, `${name}.svg`), svg);
  const html = join(HERE, `${name}.html`);
  writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS} body{margin:0}</style></head><body>${svg}</body></html>`);
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto("file://" + html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  await page.close();
  unlinkSync(html);
  shots.push(name);
}
const prev = join(HERE, "prev.html");
writeFileSync(prev, `<body style="margin:0;padding:20px;background:#fff;font-family:Roboto,Arial,sans-serif">
  ${shots.map((s) => `<div style="display:flex;gap:16px;margin-bottom:18px;align-items:flex-start"><img src="out/${s}.png" style="width:360px;border-radius:12px"><img src="out/${s}.png" style="width:168px;border-radius:8px"><div style="font-size:16px;font-weight:600;width:300px">401(k), IRA or Roth? The Order That Actually Matters<div style="font-weight:400;color:#606060;font-size:13px;margin-top:6px">PesaBrain</div></div></div>`).join("")}
  <div style="display:flex;gap:16px;margin-top:10px"><img src="../../ep03/brand/out/ep03-thumb-C-10-beats-30.png" style="width:270px;border-radius:10px"><img src="out/${shots[0]}.png" style="width:270px;border-radius:10px"><img src="out/${shots[1]}.png" style="width:270px;border-radius:10px"></div></body>`);
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("file://" + prev);
await page.screenshot({ path: join(OUT, "ep04-thumbs-feed-preview.png"), fullPage: true });
unlinkSync(prev);
await browser.close();
console.log("wrote", shots.join(", "));
