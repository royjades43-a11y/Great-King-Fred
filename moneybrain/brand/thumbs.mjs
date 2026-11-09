// Thumbnails for "The $5 Coffee Myth Is Wrong" (1280x720). node brand/thumbs.mjs
import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { C, at, txt, bean, brain, coffee, car, card, stampSvg, cross, sparkles } from "../tools/kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");
mkdirSync(OUT, { recursive: true });
const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;
const FONTS = `@font-face { font-family: "Archivo Black"; src: url("../assets/fonts/ArchivoBlack.woff2"); }
@font-face { font-family: "Patrick Hand"; src: url("../assets/fonts/PatrickHand.woff2"); }
@font-face { font-family: "Space Mono"; font-weight: 700; src: url("../assets/fonts/SpaceMono.woff2"); }`;

const paper = (bg = C.paper, rule = C.rule) => `<rect width="1280" height="720" fill="${bg}"/>` +
  Array.from({ length: 15 }, (_, i) => `<path d="M 0 ${(i + 1) * 48} L 1280 ${(i + 1) * 48}" stroke="${rule}" stroke-width="2"/>`).join("");
// big price-tag headline; lines = [[text, colour], ...]
function tagHead(lines, x, y, w, size = 92, rot = -4, bg = C.white) {
  const h = lines.length * size * 1.08 + 46;
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M 10 ${h / 2 + 12} L 70 12 L ${w + 12} 12 L ${w + 12} ${h + 12} L 70 ${h + 12} Z" transform="translate(0 ${-h / 2})" fill="${C.ink}" opacity="0.25"/>
    <path d="M 0 0 L 60 ${-h / 2} L ${w} ${-h / 2} L ${w} ${h / 2} L 60 ${h / 2} Z" fill="${bg}" ${INK} stroke-width="8"/>
    <circle cx="48" cy="0" r="15" fill="${C.paper}" ${INK} stroke-width="6"/>
    ${lines.map(([t, col], i) => `<text x="${(w + 70) / 2}" y="${(i - (lines.length - 1) / 2) * size * 1.08 + 6}" font-family="Archivo Black" font-size="${size}" fill="${col}" text-anchor="middle" dominant-baseline="middle">${t}</text>`).join("")}
  </g>`;
}
function receipt(lines, total, x, y, w = 360, rot = 4) {
  const h = 70 + lines.length * 44 + 110;
  let d = `M 0 0 L ${w} 0 L ${w} ${h}`;
  for (let i = w; i >= 0; i -= 24) d += ` L ${i} ${h + ((i / 24) % 2 ? -12 : 0)}`;
  return `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="${d} Z" fill="${C.white}" ${INK} stroke-width="6"/>
    ${lines.map(([a, b], i) => txt(24, 50 + i * 44, a, 30, C.ink, { font: "mono", anchor: "start" }) + txt(w - 24, 50 + i * 44, b, 30, C.ink, { font: "mono", anchor: "end" })).join("")}
    <path d="M 20 ${54 + lines.length * 44} L ${w - 20} ${54 + lines.length * 44}" stroke="${C.ink}" stroke-width="4" stroke-dasharray="10 8"/>
    ${txt(w / 2, 110 + lines.length * 44, total, 66, C.red, { font: "bold" })}</g>`;
}

const thumbs = {
  // A — the verdict: the coffee walks free, the real culprit is the car
  "thumb-A-not-the-coffee": `${paper()}
    <circle cx="420" cy="430" r="300" fill="${C.olive}" opacity="0.25"/>
    ${at(400, 690, 2.25, coffee())}
    ${at(410, 430, 1, stampSvg("NOT GUILTY", C.oliveDk, 64, -12))}
    ${at(930, 640, 1.0, car({ color: C.red, shiny: true }))}
    ${at(950, 330, 1, `<rect x="-150" y="-62" width="300" height="124" rx="14" fill="${C.gold}" ${INK} stroke-width="7"/>` + txt(0, 4, "$700/mo", 64, C.red, { font: "bold" }), 6)}
    ${at(1185, 735, 0.7, brain({ face: "sly", pose: "down", noShadow: true }))}
    ${tagHead([["IT'S NOT THE", C.ink], ["COFFEE", C.terra]], 30, 140, 720, 72, -4)}`,

  // B — the math: a tiny $172K cup next to a giant $380K car
  "thumb-B-wrong-math": `${paper(C.slateDk, "#6F8BA0")}
    ${at(250, 640, 0.95, coffee())}
    ${at(250, 400, 1, `<rect x="-120" y="-50" width="240" height="100" rx="12" fill="${C.white}" ${INK} stroke-width="6"/>` + txt(0, 4, "$172K", 60, C.ink, { font: "bold" }))}
    ${at(880, 660, 1.9, car({ color: C.red, shiny: true }))}
    ${at(880, 210, 1, `<rect x="-210" y="-74" width="420" height="148" rx="16" fill="${C.gold}" ${INK} stroke-width="8"/>` + txt(0, 6, "$380K", 110, C.red, { font: "bold" }), -4)}
    ${at(520, 520, 1, txt(0, 0, "<", 220, C.white, { font: "bold", extra: `stroke="${C.ink}" stroke-width="10" paint-order="stroke"` }))}
    ${tagHead([["WRONG MATH", C.ink]], 30, 90, 700, 76, -3)}`,

  // C — the reaction: Bean finds the myth on the receipt
  "thumb-C-the-5-dollar-lie": `${paper()}
    ${receipt([["LATTE", "$5"], ["x 365 x 30 YRS", ""]], "$172,000", 610, 120, 470, 5)}
    ${at(1040, 150, 1, stampSvg("MYTH", C.red, 70, 12))}
    ${at(330, 820, 1.55, bean({ pose: "cheeks", face: "shocked", noShadow: true }))}
    ${tagHead([["THE $5 LIE", C.white]], 560, 610, 640, 92, -3, C.red)}`,
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
// how they look in a feed: 3 at real search-result size (360x202) plus the small sidebar size
const prev = join(HERE, "thumbs-preview.html");
writeFileSync(prev, `<body style="margin:0;padding:20px;background:#fff;font-family:Roboto,Arial,sans-serif">
  ${shots.map((s) => `<div style="display:flex;gap:16px;margin-bottom:18px;align-items:flex-start"><img src="out/${s}.png" style="width:360px;border-radius:12px"><img src="out/${s}.png" style="width:168px;border-radius:8px"><div style="font-size:16px;font-weight:600;width:300px">The $5 Coffee Myth Is Wrong (Here's What Actually Keeps You Poor)<div style="font-weight:400;color:#606060;font-size:13px;margin-top:6px">PesaBrain</div></div></div>`).join("")}</body>`);
const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
await page.goto("file://" + prev);
await page.screenshot({ path: join(OUT, "thumbs-feed-preview.png"), fullPage: true });
unlinkSync(prev);
await browser.close();
console.log("wrote", shots.join(", "));
