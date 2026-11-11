// EP05 thumbnails (1280x720). node brand/thumbs.mjs
// Rule for this set: one idea, at most three elements, one short phrase. Each one leaves a question open.
import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { C, at, txt, bean, brain, card } from "../../moneybrain/tools/kit.mjs";
import { anchor, telephone } from "../tools/props5.mjs";

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
const T = (x, y, t, size, col, o = {}) => `<text x="${x}" y="${y}" font-family="${o.font || "Archivo Black"}" font-size="${size}" fill="${col}" text-anchor="${o.anchor || "middle"}" dominant-baseline="middle" ${o.stroke ? `stroke="${C.ink}" stroke-width="${o.stroke}" paint-order="stroke" stroke-linejoin="round"` : ""}>${t}</text>`;
function tagHead(lines, x, y, w, size = 84, rot = -4, bg = C.white) {
  const h = lines.length * size * 1.08 + 46;
  return `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M 10 ${h / 2 + 12} L 70 12 L ${w + 12} 12 L ${w + 12} ${h + 12} L 70 ${h + 12} Z" transform="translate(0 ${-h / 2})" fill="${C.ink}" opacity="0.3"/>
    <path d="M 0 0 L 60 ${-h / 2} L ${w} ${-h / 2} L ${w} ${h / 2} L 60 ${h / 2} Z" fill="${bg}" ${INK} stroke-width="8"/>
    <circle cx="48" cy="0" r="15" fill="${C.paper}" ${INK} stroke-width="6"/>
    ${lines.map(([t, col], i) => T((w + 70) / 2, (i - (lines.length - 1) / 2) * size * 1.08 + 6, t, size, col)).join("")}
  </g>`;
}
// a hand-drawn marker circle (two loose passes)
const scribble = (rx, ry, col = C.red) => `<ellipse rx="${rx}" ry="${ry}" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round" transform="rotate(-4)" stroke-dasharray="${Math.PI * (rx + ry) * 0.98} 9999"/>
  <ellipse rx="${rx + 14}" ry="${ry - 8}" fill="none" stroke="${col}" stroke-width="9" stroke-linecap="round" opacity="0.85" transform="rotate(3)" stroke-dasharray="${Math.PI * (rx + ry) * 0.7} 9999" stroke-dashoffset="-80"/>`;
const bubbles = (list) => list.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="#D8E6EE" stroke-width="5" opacity="0.8"/><circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.22}" fill="#D8E6EE" opacity="0.8"/>`).join("");

const thumbs = {
  // A — DON'T PAY THIS: one giant gold MINIMUM DUE box, circled in red marker. Impulse loves it.
  "ep05-thumb-A-dont-pay-this": `${paper()}
    <g transform="translate(560 430) rotate(-5)">
      <rect x="-420" y="-200" width="860" height="420" rx="30" fill="${C.ink}" opacity="0.25" transform="translate(16 18)"/>
      <rect x="-420" y="-200" width="840" height="400" rx="30" fill="${C.gold}" ${INK} stroke-width="10"/>
      ${T(0, -110, "MINIMUM DUE", 66, C.ink)}
      ${T(0, 60, "$170", 230, C.ink)}
      ${scribble(470, 250)}
    </g>
    ${at(1130, 720, 0.78, brain({ face: "love", pose: "hug", noShadow: true }))}
    ${tagHead([["DON'T PAY THIS", C.white]], 610, 80, 640, 62, 3, C.red)}`,

  // B — STILL $6,000? Bean sinking, tied to the MINIMUM anchor, in deep slate water.
  "ep05-thumb-B-anchor": `<defs><linearGradient id="sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6F8BA0"/><stop offset="1" stop-color="#2E4150"/></linearGradient></defs>
    <rect width="1280" height="720" fill="url(#sea)"/>
    <path d="M 0 40 Q 160 10 320 40 T 640 40 T 960 40 T 1280 40 L 1280 0 L 0 0 Z" fill="${C.paper}" ${INK} stroke-width="6"/>
    ${at(900, 40, 1.12, anchor("MINIMUM", 120))}
    <path d="M 470 520 Q 660 640 800 520" fill="none" stroke="${C.wood}" stroke-width="12" stroke-linecap="round"/><path d="M 470 520 Q 660 640 800 520" fill="none" ${INK} stroke-width="3"/>
    ${at(420, 690, 0.82, bean({ pose: "cheer", face: "shocked", sweat: true, noShadow: true }))}
    ${bubbles([[470, 330, 22], [520, 270, 14], [560, 360, 11], [600, 230, 9]])}
    ${tagHead([["STILL", C.ink], ["$6,000?", C.red]], 20, 210, 420, 76, -5)}`,

  // C — the paradox receipt: 5 years of paying, still owing. Bean's face does the rest.
  "ep05-thumb-C-five-years": `${paper(C.red, "#D9705E")}
    <g transform="translate(470 370) rotate(-4)">
      <path d="M -330 -300 L 330 -300 L 330 280 ${Array.from({ length: 11 }, (_, i) => `L ${330 - (i + 0.5) * 60} 310 L ${330 - (i + 1) * 60} 280`).join(" ")} Z" fill="${C.ink}" opacity="0.3" transform="translate(14 16)"/>
      <path d="M -330 -300 L 330 -300 L 330 280 ${Array.from({ length: 11 }, (_, i) => `L ${330 - (i + 0.5) * 60} 310 L ${330 - (i + 1) * 60} 280`).join(" ")} Z" fill="${C.white}" ${INK} stroke-width="8"/>
      ${T(0, -230, "5 YEARS OF PAYMENTS", 40, C.ink, { font: "Space Mono" })}
      <path d="M -290 -180 L 290 -180" stroke="${C.ink}" stroke-width="4" stroke-dasharray="14 10"/>
      ${T(-290, -100, "PAID", 56, C.ink, { anchor: "start" })}${T(290, -100, "$7,700", 72, C.oliveDk, { anchor: "end" })}
      <path d="M -290 -20 L 290 -20" stroke="${C.ink}" stroke-width="4" stroke-dasharray="14 10"/>
      ${T(-290, 60, "STILL OWE", 56, C.ink, { anchor: "start" })}
      ${T(0, 190, "$3,300", 150, C.red, { stroke: 0 })}
    </g>
    ${at(1060, 720, 1.05, bean({ pose: "cheeks", face: "shocked", sweat: true, noShadow: true }))}
    ${T(1060, 120, "HOW?!", 110, C.gold, { stroke: 10 })}`,

  // D — 1 CALL: the red telephone, and the card's rate struck out. Which call? You have to click.
  "ep05-thumb-D-one-call": `${paper(C.gold, "#D9B85A")}
    ${at(380, 640, 1.85, telephone())}
    ${[[-1, 0], [1, 0]].map(([s]) => `<path d="M ${380 + s * 330} 230 q ${s * 40} 40 0 80 M ${380 + s * 380} 200 q ${s * 60} 70 0 140" fill="none" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>`).join("")}
    ${at(970, 400, 1.6, card({ mouth: true, label: "", color: C.slateDk }), -6)}
    ${T(980, 210, "22%", 120, C.white, { stroke: 12 })}
    <path d="M 860 225 L 1100 195" stroke="${C.red}" stroke-width="22" stroke-linecap="round"/>
    ${tagHead([["1 CALL", C.white]], 640, 590, 560, 92, -3, C.red)}`,
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
const title = "Why Your Credit Card Balance Never Shrinks (And How to Break the Trap)";
writeFileSync(prev, `<body style="margin:0;padding:20px;background:#fff;font-family:Roboto,Arial,sans-serif">
  ${shots.map((s) => `<div style="display:flex;gap:16px;margin-bottom:18px;align-items:flex-start"><img src="out/${s}.png" style="width:360px;border-radius:12px"><img src="out/${s}.png" style="width:168px;border-radius:8px"><div style="font-size:16px;font-weight:600;width:300px">${title}<div style="font-weight:400;color:#606060;font-size:13px;margin-top:6px">PesaBrain</div></div></div>`).join("")}
  <div style="display:flex;gap:16px;margin-top:10px"><img src="../../ep04/brand/out/ep04-thumb-A-which-box.png" style="width:270px;border-radius:10px"><img src="out/${shots[0]}.png" style="width:270px;border-radius:10px"><img src="out/${shots[1]}.png" style="width:270px;border-radius:10px"></div></body>`);
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
await page.goto("file://" + prev);
await page.screenshot({ path: join(OUT, "ep05-thumbs-feed-preview.png"), fullPage: true });
unlinkSync(prev);
await browser.close();
console.log("wrote", shots.join(", "));
