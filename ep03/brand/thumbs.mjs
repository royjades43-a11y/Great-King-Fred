// EP02 thumbnails (1280x720). node brand/thumbs.mjs
import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { C, at, txt, bean, brain, stampSvg, sparkles, speedLines, coin, coinStack, confetti, moneyBag } from "../../moneybrain/tools/kit.mjs";
import { kitchen, bowl, ingredientJar, hill, hillY, snowball, boringMeter, hammock, chefHat } from "../tools/props3.mjs";

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
const AVA = (o = {}) => bean({ color: C.pink, face: "happy", noShadow: true, ...o, front: `<path d="M -50 -372 Q -20 -400 6 -372 Q 30 -400 60 -372 L 40 -350 L -30 -350 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/>` });
const LEO = (o = {}) => bean({ color: C.slate, face: "neutral", noShadow: true, ...o, front: `<path d="M -70 -330 Q -60 -400 10 -398 Q 70 -396 76 -330 Z" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="5"/><path d="M 60 -334 L 130 -330" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>` });
const HILL = `<g transform="scale(0.6667)">${hill()}</g>`;

const thumbs = {
  // A — the payoff: Bean naps in a hammock while a giant $ snowball rolls down the hill
  "ep03-thumb-A-boring-rich": `${paper()}${HILL}
    ${at(990, 440, 2.5, snowball("$", { size: 110 }), 25)}
    ${at(690, 330, 1, speedLines(5, 140))}
    ${at(330, 720, 0.85, hammock())}${at(330, 640, 0.62, bean({ pose: "shrug", face: "content", legs: false, noShadow: true }))}
    ${at(420, 330, 1, txt(0, 0, "zzz", 70, C.slateDk, { font: "bold" }))}
    ${tagHead([["BORING", C.ink], ["= RICH", C.oliveDk]], 20, 110, 470, 72, -4)}`,

  // B — the cooking show: Bean the chef with a bowl overflowing with gold
  "ep03-thumb-B-the-recipe": `<g transform="scale(0.6667)">${kitchen()}</g>
    ${at(880, 560, 1.35, bowl(0.9))}
    ${[[-150, -330], [-60, -380], [40, -360], [130, -320], [-100, -300], [80, -300], [-10, -420]].map(([x, y]) => at(880 + x, 560 + y * 0.9 + 40, 1.4, coin(28))).join("")}
    ${at(880, 140, 1, sparkles(6, 300))}
    ${at(300, 740, 1.15, bean({ pose: "cheer", face: "joy", noShadow: true, front: at(4, -372, 0.95, chefHat()) }))}
    ${tagHead([["THE RICH", C.ink], ["RECIPE", C.red]], 20, 120, 470, 72, -4)}`,

  // C — Ava vs Leo: 10 years beats 30
  "ep03-thumb-C-10-beats-30": `${paper(C.slateDk, "#6F8BA0")}
    ${at(300, 250, 1.45, snowball("$", { size: 100 }))}${at(300, 735, 0.66, AVA({ pose: "cheer", face: "joy" }))}
    ${at(1010, 300, 0.9, snowball("$", { size: 100 }))}${at(1010, 735, 0.66, LEO({ pose: "shrug", face: "sad" }))}
    ${at(300, 425, 1, `<rect x="-110" y="-40" width="220" height="80" rx="12" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 4, "10 YRS", 52, C.red, { font: "bold" }))}
    ${at(1010, 425, 1, `<rect x="-110" y="-40" width="220" height="80" rx="12" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 4, "30 YRS", 52, C.slateDk, { font: "bold" }))}
    ${at(640, 330, 1, txt(0, 0, ">", 220, C.gold, { font: "bold", extra: `stroke="${C.ink}" stroke-width="10" paint-order="stroke"` }))}
    ${tagHead([["START", C.white], ["EARLY", C.gold]], 400, 600, 400, 58, -4, C.red)}`,

  // D — the BORING-O-METER maxed out next to a money bag
  "ep03-thumb-D-boring-wins": `${paper()}
    ${at(470, 560, 1.55, boringMeter("").replace('<path d="M 0 0 L 0 -180"', '<path transform="rotate(76)" d="M 0 0 L 0 -180"'))}
    ${at(1050, 690, 1.45, moneyBag("$$$", { size: 64 }))}
    ${at(1050, 300, 1, sparkles(5, 200))}
    ${at(820, 700, 0.7, brain({ face: "yawn", pose: "down", noShadow: true }))}
    ${tagHead([["BORING", C.ink], ["WINS.", C.oliveDk]], 20, 120, 460, 76, -4)}`,
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
  ${shots.map((s) => `<div style="display:flex;gap:16px;margin-bottom:18px;align-items:flex-start"><img src="out/${s}.png" style="width:360px;border-radius:12px"><img src="out/${s}.png" style="width:168px;border-radius:8px"><div style="font-size:16px;font-weight:600;width:300px">The Boring Way to Get Rich (That Actually Works)<div style="font-weight:400;color:#606060;font-size:13px;margin-top:6px">PesaBrain</div></div></div>`).join("")}
  <div style="display:flex;gap:16px;margin-top:10px"><img src="../../ep02/brand/out/ep02-thumb-B-its-a-trick.png" style="width:270px;border-radius:10px"><img src="out/${shots[0]}.png" style="width:270px;border-radius:10px"><img src="out/${shots[1]}.png" style="width:270px;border-radius:10px"></div></body>`);
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("file://" + prev);
await page.screenshot({ path: join(OUT, "ep03-thumbs-feed-preview.png"), fullPage: true });
unlinkSync(prev);
await browser.close();
console.log("wrote", shots.join(", "));
