// PesaBrain Shorts layout: a safe-zone guide and a mock frame with YouTube's Shorts buttons drawn on top.
//   node shorts/brand/layout.mjs
import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { C, at, txt, bean, brain, priceTag } from "../../moneybrain/tools/kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");
mkdirSync(OUT, { recursive: true });
const F = "../../moneybrain/assets/fonts";
const FONTS = `@font-face { font-family: "Archivo Black"; src: url("${F}/ArchivoBlack.woff2"); }
@font-face { font-family: "Patrick Hand"; src: url("${F}/PatrickHand.woff2"); }
@font-face { font-family: "Space Mono"; font-weight: 700; src: url("${F}/SpaceMono.woff2"); }`;
const W = 1080, H = 1920;
const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;

// the zones (approximate; YouTube moves its buttons between app versions and phones)
export const Z = {
  topUI: [0, 210],          // status bar, search, camera, "Shorts"
  tag: [230, 420],          // the price-tag headline
  stage: [430, 1240],       // characters and props; ground line at 1240
  captions: [1270, 1440],   // burned-in word captions
  bottomUI: [1480, 1920],   // channel, Subscribe, title, sound, progress bar
  rightX: 900,              // the like / dislike / comment / share / remix column starts here
  rightY: [760, 1700],
  leftX: 48,
};

const paper = () => `<rect width="${W}" height="${H}" fill="${C.paper}"/>` +
  Array.from({ length: 40 }, (_, i) => `<path d="M 0 ${(i + 1) * 48} L ${W} ${(i + 1) * 48}" stroke="${C.rule}" stroke-width="2"/>`).join("") +
  `<path d="M 70 0 L 70 ${H} M 78 0 L 78 ${H}" stroke="${C.margin}" stroke-width="3"/>`;

function tagHead(lines, cx, cy, w, size, col = C.white, rot = -3) {
  const h = lines.length * size * 1.08 + 40;
  return `<g transform="translate(${cx - w / 2} ${cy}) rotate(${rot})">
    <path d="M 0 0 L 56 ${-h / 2} L ${w} ${-h / 2} L ${w} ${h / 2} L 56 ${h / 2} Z" fill="${col}" ${INK} stroke-width="8"/>
    <circle cx="44" cy="0" r="14" fill="${C.paper}" ${INK} stroke-width="6"/>
    ${lines.map(([t, c], i) => `<text x="${(w + 60) / 2}" y="${(i - (lines.length - 1) / 2) * size * 1.08 + 6}" font-family="Archivo Black" font-size="${size}" fill="${c}" text-anchor="middle" dominant-baseline="middle">${t}</text>`).join("")}</g>`;
}
function caption(words, hi, cx, cy) {
  // word-by-word caption: one centred line, the spoken word highlighted in mustard
  return `<text x="${cx}" y="${cy}" font-family="Archivo Black" font-size="70" text-anchor="middle" dominant-baseline="middle" stroke="${C.ink}" stroke-width="14" paint-order="stroke">${words.map((w, i) => `<tspan fill="${i === hi ? C.mustard : C.white}">${w}${i < words.length - 1 ? " " : ""}</tspan>`).join("")}</text>`;
}
// YouTube's own Shorts buttons, drawn semi-transparent so the frame can be checked against them
function ytUI() {
  const ico = (y, label) => `<circle cx="1010" cy="${y}" r="44" fill="#000" opacity="0.28"/><circle cx="1010" cy="${y}" r="26" fill="none" stroke="#fff" stroke-width="5"/>
    <text x="1010" y="${y + 72}" font-family="Roboto, Arial" font-size="26" font-weight="700" fill="#fff" text-anchor="middle">${label}</text>`;
  return `<g opacity="0.92">
    <rect x="0" y="0" width="${W}" height="200" fill="url(#topfade)"/>
    <text x="54" y="130" font-family="Roboto, Arial" font-size="44" font-weight="700" fill="#fff">Shorts</text>
    <circle cx="900" cy="118" r="26" fill="none" stroke="#fff" stroke-width="5"/><rect x="980" y="96" width="50" height="40" rx="8" fill="none" stroke="#fff" stroke-width="5"/>
    ${ico(840, "48K")}${ico(1000, "Dislike")}${ico(1160, "1.2K")}${ico(1320, "Share")}${ico(1480, "Remix")}
    <rect x="975" y="1590" width="70" height="70" rx="12" fill="#fff" opacity="0.85"/>
    <rect x="0" y="1500" width="${W}" height="420" fill="url(#botfade)"/>
    <circle cx="84" cy="1640" r="34" fill="${C.slateDk}" stroke="#fff" stroke-width="3"/>
    <text x="134" y="1652" font-family="Roboto, Arial" font-size="32" font-weight="700" fill="#fff">@PesaBrain</text>
    <rect x="330" y="1612" width="180" height="58" rx="29" fill="#fff"/><text x="420" y="1651" font-family="Roboto, Arial" font-size="28" font-weight="700" fill="#000" text-anchor="middle">Subscribe</text>
    <text x="54" y="1730" font-family="Roboto, Arial" font-size="32" fill="#fff">Why $9.99 tricks your brain 🧠 #shorts</text>
    <text x="54" y="1790" font-family="Roboto, Arial" font-size="28" fill="#fff">♪ Original sound · PesaBrain</text>
    <rect x="0" y="1898" width="${W}" height="6" fill="#fff" opacity="0.4"/><rect x="0" y="1898" width="420" height="6" fill="#f00"/>
  </g>`;
}
const defs = `<defs><linearGradient id="topfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
  <linearGradient id="botfade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></linearGradient></defs>`;

// the sample frame: Short #1, beat 1 ("Your brain just read this as nine dollars")
function sampleFrame() {
  const G = Z.stage[1];
  return `${paper()}
    <path d="M 0 ${G} L ${W} ${G}" stroke="#B9AD8C" stroke-width="5"/>
    ${tagHead([["$9.99 IS", C.ink], ["A TRICK", C.red]], 470, 325, 640, 72)}
    ${at(250, 760, 1.25, priceTag("$9.99", { size: 70, rot: -8, color: C.gold, w: 330 }))}
    ${at(560, 600, 1, `<text x="40" y="20" font-family="Archivo Black" font-size="90" fill="${C.red}" stroke="${C.ink}" stroke-width="6" paint-order="stroke" transform="rotate(-8)">= $9?</text>`)}
    ${at(250, G, 0.95, brain({ face: "love", pose: "point", noShadow: true }))}
    ${at(700, G, 0.9, bean({ pose: "cheeks", face: "shocked", noShadow: true }))}
    ${caption(["YOUR", "BRAIN", "READS..."], 1, 470, 1355)}`;
}
function guide() {
  const box = (y0, y1, col, label, x0 = 0, x1 = W) => `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="${col}" opacity="0.32"/>
    <text x="${(x0 + x1) / 2}" y="${(y0 + y1) / 2}" font-family="Archivo Black" font-size="34" fill="${C.ink}" text-anchor="middle" dominant-baseline="middle">${label}</text>`;
  return `${paper()}
    ${box(...Z.topUI, C.grey, "YOUTUBE TOP BAR — KEEP CLEAR")}
    ${box(...Z.tag, C.mustard, "PRICE-TAG HEADLINE", 48, 900)}
    ${box(...Z.stage, C.olive, "MAIN STAGE", 48, 900)}
    ${box(...Z.captions, C.slate, "WORD CAPTIONS", 48, 900)}
    ${box(...Z.bottomUI, C.grey, "CHANNEL · SUBSCRIBE · TITLE · SOUND — KEEP CLEAR")}
    <rect x="${Z.rightX}" y="${Z.rightY[0]}" width="${W - Z.rightX}" height="${Z.rightY[1] - Z.rightY[0]}" fill="${C.red}" opacity="0.35"/>
    <text x="990" y="1230" font-family="Archivo Black" font-size="30" fill="${C.ink}" text-anchor="middle" transform="rotate(90 990 1230)">LIKE · COMMENT · SHARE COLUMN — CLEAR</text>
    <path d="M 0 ${Z.stage[1]} L ${W} ${Z.stage[1]}" stroke="${C.ink}" stroke-width="4" stroke-dasharray="16 10"/>
    <text x="60" y="${Z.stage[1] - 16}" font-family="Space Mono" font-weight="700" font-size="26" fill="${C.ink}">ground line y=1240</text>
    <path d="M 470 230 L 470 1440" stroke="${C.red}" stroke-width="3" stroke-dasharray="8 10"/>
    <text x="480" y="470" font-family="Space Mono" font-weight="700" font-size="24" fill="${C.red}">visual centre x=470</text>`;
}

const jobs = {
  "shorts-safe-zones": guide(),
  "shorts-sample-frame": sampleFrame(),
  "shorts-sample-frame-with-yt-ui": sampleFrame() + ytUI(),
};
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
for (const [name, body] of Object.entries(jobs)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs}${body}</svg>`;
  const html = join(HERE, `${name}.html`);
  writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS} body{margin:0}</style></head><body>${svg}</body></html>`);
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto("file://" + html);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, `${name}.png`) });
  await page.close();
  unlinkSync(html);
}
await browser.close();
console.log("wrote", Object.keys(jobs).join(", "));
