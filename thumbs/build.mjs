// PesaBrain thumbnails v2: one big relatable character (right), 2–5 words (left), one highlighted word.
// Design 1920×1080, export 1280×720 JPG.   node thumbs/build.mjs [filter]
import { writeFileSync, mkdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { C } from "../moneybrain/tools/kit.mjs";
import * as K from "./chars.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");
mkdirSync(OUT, { recursive: true });
const F = "../moneybrain/assets/fonts";

// text: array of lines; [word] = the highlighted word (accent box, white letters)
export const THUMBS = [
  // 01 — The $5 Coffee Myth Is Wrong
  { file: "01-thumbnail-A-not-the-coffee", text: ["It's not", "the [coffee]"], char: K.coffeeCup, x: 1420, s: 0.95, bubble: { t: "Wasn't me!", x: 1700, y: 150, w: 360, tail: "dl" } },
  { file: "01-thumbnail-B-car-real-cost", text: ["Your car's", "real cost:", "[$380K]"], char: K.smugCar, x: 1400, y: 900, s: 1.08, bubble: { t: "Only $700/mo!", x: 1430, y: 230, w: 430, tail: "d" } },
  { file: "01-thumbnail-C-keep-your-coffee", text: ["Keep your", "[coffee]"], char: K.chillBean, x: 1420, s: 1.0, bubble: { t: "Cut the big stuff.", x: 1470, y: 150, w: 500, tail: "d" } },
  // 02 — Why You'll Never Feel Rich
  { file: "02-thumbnail-A-never-enough", text: ["Why it's", "never", "[enough]"], char: K.treadmillBean, x: 1420, s: 0.85 },
  { file: "02-thumbnail-B-rich-number", text: ["[$2.5M]", "to feel", "rich?"], char: K.runawayFinish, x: 1420, s: 0.8, bubble: { t: "Almost there!", x: 1600, y: 100, w: 0, tail: "dl", w: 420, tail: "d" } },
  { file: "02-thumbnail-C-one-number", text: ["The [one]", "number that", "matters"], char: K.hammockPiggy, x: 1500, s: 0.72, size: 140, bubble: { t: "Not your salary.", x: 1500, y: 260, w: 480, tail: "d" } },
  // 03 — The Boring Way to Get Rich
  { file: "03-thumbnail-A-boring-wins", text: ["Boring", "[wins]"], char: K.crownSnail, x: 1330, s: 0.82, bubble: { t: "Told you.", x: 1660, y: 120, w: 330, tail: "dl" } },
  { file: "03-thumbnail-B-pros-lose", text: ["[9 in 10]", "pros lose"], char: K.crackedBall, x: 1380, s: 0.9, bubble: { t: "Trust me…", x: 1680, y: 140, w: 330, tail: "dl" } },
  { file: "03-thumbnail-C-automate-it", text: ["[Automate] it.", "Forget it."], char: K.snowballHammock, x: 1420, s: 0.8 },
  // 04 — 401(k), IRA or Roth?
  { file: "04-thumbnail-A-which-first", text: ["Which one", "[first]?"], char: K.confusedBox, x: 1430, s: 0.92 },
  { file: "04-thumbnail-B-ira-asleep", text: ["Is your IRA", "[asleep]?"], char: K.sleepingCash, x: 1460, s: 0.85 },
  { file: "04-thumbnail-C-free-money-first", text: ["Step one:", "[free money]"], char: K.happyGift, x: 1400, s: 0.92, bubble: { t: "Unwrap me!", x: 1640, y: 130, w: 360, tail: "dl" } },
  // 05 — Why Your Credit Card Balance Never Shrinks
  { file: "05-thumbnail-A-170-trap", text: ["The [$170]", "trap"], char: K.lureCard, x: 1330, s: 0.82, bubble: { t: "Only $170 a month!", x: 1350, y: 200, w: 600, tail: "d" } },
  { file: "05-thumbnail-B-20-years", text: ["[20 years]", "for $6,000"], char: K.skeletonPayer, x: 1360, s: 0.8, bubble: { t: "Almost paid off…", x: 1590, y: 110, w: 480, tail: "dl" } },
  { file: "05-thumbnail-C-one-call", text: ["One call.", "[Lower] rate."], char: K.boldPhone, x: 1400, s: 0.88, bubble: { t: "Just ask.", x: 1660, y: 150, w: 300, tail: "dl" } },
  // 06 — How Much Money Should You Keep in the Bank?
  { file: "06-thumbnail-A-pay-1200-today", text: ["Could you", "pay [$1,200]", "today?"], char: K.worriedCar, x: 1380, y: 900, s: 0.95, size: 140, bubble: { t: "clunk.", x: 1640, y: 220, tail: "dl" } },
  { file: "06-thumbnail-B-1-in-3", text: ["[1 in 3]", "can't cover", "$400"], char: K.emptyWallet, x: 1470, s: 0.9, size: 140 },
  { file: "06-thumbnail-C-how-much-enough", text: ["How much", "is [enough]?"], char: K.umbrellaPiggy, x: 1400, y: 990, s: 0.74 },
];

function bubbleSvg({ t, x, y, tail = "d" }) {
  const w = Math.round(t.length * 33 + 90), h = 120, tx = tail === "dl" ? -w / 4 : tail === "dr" ? w / 4 : 0;
  return `<g transform="translate(${x} ${y})"><path d="M ${tx - 30} ${h / 2 - 4} L ${tx - (tail === "dl" ? 80 : tail === "dr" ? -60 : 10)} ${h / 2 + 70} L ${tx + 34} ${h / 2 - 4} Z" fill="${C.white}" stroke="${C.ink}" stroke-width="10" stroke-linejoin="round"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="40" fill="${C.white}" stroke="${C.ink}" stroke-width="10"/>
    <path d="M ${tx - 26} ${h / 2 - 6} L ${tx + 30} ${h / 2 - 6}" stroke="${C.white}" stroke-width="14"/>
    <text x="0" y="20" font-family="Archivo Black" font-size="54" text-anchor="middle" fill="${C.ink}">${t}</text></g>`;
}
const textHtml = (lines) => lines.map((l) => `<div class="ln">${l.replace(/\[(.+?)\]/g, '<span class="hl">$1</span>')}</div>`).join("");

function page(t) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080" style="position:absolute;inset:0">
    <defs><radialGradient id="vig" cx="50%" cy="48%" r="75%"><stop offset="0.55" stop-color="${C.ink}" stop-opacity="0"/><stop offset="1" stop-color="${C.ink}" stop-opacity="0.32"/></radialGradient></defs>
    <rect width="1920" height="1080" fill="${C.paper}"/>
    <g transform="translate(${t.x} ${t.y || 990}) scale(${t.s})">${t.char()}</g>
    ${t.bubble ? bubbleSvg(t.bubble) : ""}
    <rect width="1920" height="1080" fill="url(#vig)"/></svg>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: "Archivo Black"; src: url("${F}/ArchivoBlack.woff2"); }
    @font-face { font-family: "Patrick Hand"; src: url("${F}/PatrickHand.woff2"); }
    @font-face { font-family: "Space Mono"; font-weight: 700; src: url("${F}/SpaceMono.woff2"); }
    html,body{margin:0;width:1920px;height:1080px;overflow:hidden;background:${C.paper}}
    .txt{position:absolute;left:96px;top:0;bottom:0;width:${t.textW || 880}px;display:flex;flex-direction:column;justify-content:center;gap:6px;
      font-family:"Archivo Black";font-size:${t.size || 150}px;line-height:1.02;color:${C.ink};letter-spacing:-2px}
    .ln{white-space:nowrap}
    .hl{background:${C.red};color:${C.white};padding:0 22px 6px;border-radius:18px;box-decoration-break:clone;display:inline-block;transform:rotate(-2deg);
      box-shadow:8px 10px 0 rgba(35,31,28,.28)}
  </style></head><body>${svg}<div class="txt">${textHtml(t.text)}</div></body></html>`;
}

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 / 3 });
const only = process.argv[2];
const done = [];
for (const t of THUMBS) {
  if (only && !t.file.startsWith(only)) continue;
  const html = join(HERE, `_${t.file}.html`);
  writeFileSync(html, page(t));
  const p = await ctx.newPage();
  await p.goto("file://" + html);
  await p.evaluate(() => document.fonts.ready);
  // quality checks: text block must not overlap the character's box, and must fit
  const over = await p.evaluate(() => [...document.querySelectorAll(".ln")].map((e) => Math.round(e.getBoundingClientRect().right)));
  if (Math.max(...over) > 990) console.log(`! ${t.file}: text runs to x=${Math.max(...over)}`);
  await p.screenshot({ path: join(OUT, `${t.file}.jpg`), type: "jpeg", quality: 92 });
  await p.close(); unlinkSync(html); done.push(t.file);
}
await browser.close();
console.log("wrote", done.length);
