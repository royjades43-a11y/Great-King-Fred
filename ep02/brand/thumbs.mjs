// EP02 thumbnails (1280x720). node brand/thumbs.mjs
import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { C, at, txt, bean, brain, stampSvg, sparkles, speedLines, treadmill, heart } from "../../moneybrain/tools/kit.mjs";
import { curtain, valance, stage, spotlight, topHat, wand, finishLine, post, STAGE } from "../tools/props2.mjs";

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
const magician = (o = {}) => brain({ face: "grin", pose: "point", hat: at(6, -290, 0.95, topHat()), item: wand(), noShadow: true, ...o });

const thumbs = {
  // A — the heist: Impulse drags the RICH finish line away just as Bean reaches it
  "ep02-thumb-A-it-moved": `${paper()}
    ${at(860, 700, 1.15, finishLine("RICH", { size: 72 }), 4)}
    ${at(1150, 700, 0.95, brain({ face: "sly", pose: "reach", noShadow: true }))}
    ${at(660, 360, 1, speedLines(6, 160))}
    ${at(300, 770, 1.3, bean({ pose: "push", face: "shocked", noShadow: true }))}
    ${tagHead([["IT MOVED", C.white], ["AGAIN.", C.gold]], 610, 120, 560, 76, -4, C.red)}`,

  // B — the magic show: dark stage, spotlight, Impulse pulls RICH out of a hat
  "ep02-thumb-B-its-a-trick": `<rect width="1280" height="720" fill="${STAGE}"/>
    <path d="M 0 610 L 1280 610 L 1280 720 L 0 720 Z" fill="${C.woodDk}"/><path d="M 0 610 L 1280 610" stroke="${C.ink}" stroke-width="6"/>
    ${spotlight(760, 0, 610, 320)}
    ${at(0, 0, 0.67, curtain(1, 1080, 330))}${at(1280, 0, 0.67, curtain(-1, 1080, 330))}
    ${at(820, 640, 1.2, brain({ face: "grin", pose: "cheer", hat: at(6, -290, 0.95, topHat()), noShadow: true }))}
    ${at(820, 210, 1, `<rect x="-210" y="-70" width="420" height="140" rx="16" fill="${C.gold}" ${INK} stroke-width="8"/>` + txt(0, 6, "RICH", 108, C.ink, { font: "bold" }) + sparkles(6, 260), -6)}
    ${at(0, 0, 0.67, valance(1920))}
    ${tagHead([["IT'S A", C.ink], ["TRICK", C.red]], 20, 380, 420, 82, -5)}`,

  // C — the treadmill: Bean sprints after RICH dangling from Impulse's fishing rod
  "ep02-thumb-C-never-rich": `${paper(C.slateDk, "#6F8BA0")}
    ${at(520, 640, 1.4, treadmill())}
    ${at(480, 600, 1.15, bean({ pose: "cheer", face: "worried", noShadow: true, sweat: true }))}
    ${at(220, 360, 1, speedLines(6, 160))}
    ${at(1110, 690, 1.0, brain({ face: "sly", pose: "hold", noShadow: true, item: `<path d="M 0 0 L -420 -380" stroke="${C.woodDk}" stroke-width="14" stroke-linecap="round"/><path d="M -420 -380 Q -440 -300 -430 -230" fill="none" stroke="${C.white}" stroke-width="4"/>` }))}
    ${at(700, 330, 1, `<rect x="-130" y="-56" width="260" height="112" rx="14" fill="${C.gold}" ${INK} stroke-width="7"/>` + txt(0, 6, "RICH", 78, C.ink, { font: "bold" }), 8)}
    ${tagHead([["NEVER", C.ink], ["RICH?", C.terra]], 830, 110, 410, 72, 4)}`,

  // D — fake rich: their feed vs their statement
  "ep02-thumb-D-fake-rich": `${paper()}
    ${at(330, 400, 1.18, post("vacation", { id: 1, who: C.slate, likes: "21k" }), -6)}
    ${at(690, 400, 1.18, post("statement", { id: 2, who: C.slate }), 5)}
    ${at(330, 220, 1, sparkles(5, 180))}
    ${at(1060, 760, 1.05, bean({ pose: "cheeks", face: "shocked", noShadow: true }))}
    ${at(720, 600, 1, stampSvg("REALITY", C.red, 46, -12))}
    ${tagHead([["FAKE RICH", C.white]], 640, 90, 600, 74, -3, C.ink)}`,
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
  ${shots.map((s) => `<div style="display:flex;gap:16px;margin-bottom:18px;align-items:flex-start"><img src="out/${s}.png" style="width:360px;border-radius:12px"><img src="out/${s}.png" style="width:168px;border-radius:8px"><div style="font-size:16px;font-weight:600;width:300px">Why You'll Never Feel Rich (Even When You Earn More)<div style="font-weight:400;color:#606060;font-size:13px;margin-top:6px">PesaBrain</div></div></div>`).join("")}
  <div style="display:flex;gap:16px;margin-top:10px"><img src="../../moneybrain/brand/out/thumb-B-wrong-math.png" style="width:270px;border-radius:10px"><img src="out/${shots[0]}.png" style="width:270px;border-radius:10px"><img src="out/${shots[1]}.png" style="width:270px;border-radius:10px"></div></body>`);
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("file://" + prev);
await page.screenshot({ path: join(OUT, "ep02-thumbs-feed-preview.png"), fullPage: true });
unlinkSync(prev);
await browser.close();
console.log("wrote", shots.join(", "));
