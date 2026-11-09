// Channel art for PESABRAIN: profile picture, banner and video watermark.
// Drawn with the same kit as the episodes, then rendered to PNG with Playwright.
//   node brand/make.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { C, at, txt, bean, brain, calc, coffee, coinStack, coin, piggy, card, sparkles } from "../tools/kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "out");
mkdirSync(OUT, { recursive: true });
const FONTS = `
@font-face { font-family: "Archivo Black"; src: url("../assets/fonts/ArchivoBlack.woff2"); }
@font-face { font-family: "Patrick Hand"; src: url("../assets/fonts/PatrickHand.woff2"); }
@font-face { font-family: "Space Mono"; font-weight: 700; src: url("../assets/fonts/SpaceMono.woff2"); }`;
const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;

const ledger = (w, h, step, col = C.rule, bg = C.paper, margin = true) =>
  `<rect width="${w}" height="${h}" fill="${bg}"/>` +
  Array.from({ length: Math.floor(h / step) }, (_, i) => `<path d="M 0 ${(i + 1) * step} L ${w} ${(i + 1) * step}" stroke="${col}" stroke-width="${step / 22}"/>`).join("") +
  (margin ? `<path d="M ${w * 0.06} 0 L ${w * 0.06} ${h} M ${w * 0.064} 0 L ${w * 0.064} ${h}" stroke="${C.margin}" stroke-width="${step / 14}"/>` : "");

// the wordmark: a big swinging price tag with the channel name
function wordmark(scale = 1) {
  const w = 1160, h = 200;
  return `<g transform="scale(${scale})">
    <g transform="rotate(-3)">
      <rect x="${-w / 2 + 14}" y="${-h / 2 + 16}" width="${w}" height="${h}" rx="26" fill="${C.ink}" opacity="0.18"/>
      <path d="M ${-w / 2} 0 L ${-w / 2 + 70} ${-h / 2} L ${w / 2} ${-h / 2} L ${w / 2} ${h / 2} L ${-w / 2 + 70} ${h / 2} Z" fill="${C.white}" ${INK} stroke-width="9"/>
      <circle cx="${-w / 2 + 62}" cy="0" r="20" fill="${C.paper}" ${INK} stroke-width="7"/>
      <text x="${50}" y="12" font-family="Archivo Black" font-size="124" text-anchor="middle" dominant-baseline="middle" fill="${C.ink}">PESA<tspan fill="${C.terra}">BRAIN</tspan></text>
    </g></g>`;
}
function receiptStrip(text, w = 900) {
  let d = `M ${-w / 2} -40 L ${w / 2} -40 L ${w / 2} 64`;
  for (let x = w; x >= 0; x -= 30) d += ` L ${-w / 2 + x} ${(x / 30) % 2 ? 52 : 66}`;
  return `<path d="${d} Z" fill="${C.white}" ${INK} stroke-width="6"/>
    <path d="M ${-w / 2 - 20} -44 L ${w / 2 + 20} -44" ${INK} stroke-width="20"/>
    ${txt(0, 12, text, 50, C.ink, { font: "mono" })}`;
}

/* ---------- profile picture 800x800 (YouTube shows it as a circle) ---------- */
const avatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  ${ledger(800, 800, 50, "#6F8BA0", C.slateDk, false)}
  <circle cx="400" cy="400" r="300" fill="${C.gold}" opacity="0.22"/>
  ${at(400, 1010, 2.15, bean({ pose: "wave", face: "happy", noShadow: true, legs: false }))}
  ${at(650, 210, 0.85, coin(48))}
</svg>`;

const avatarDuo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  ${ledger(800, 800, 50, "#6F8BA0", C.slateDk, false)}
  ${at(560, 900, 1.5, brain({ face: "sly", pose: "down", noShadow: true }))}
  ${at(300, 960, 1.75, bean({ pose: "down", face: "happy", noShadow: true, look: 8 }))}
</svg>`;

/* ---------- banner 2560x1440, everything important inside the 1546x423 middle ---------- */
const SAFE = { x: 507, y: 509, w: 1546, h: 423 };
const banner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2560 1440" width="2560" height="1440">
  ${ledger(2560, 1440, 60)}
  <path d="M 0 932 L 2560 932" stroke="#B9AD8C" stroke-width="6"/>
  <!-- desktop / TV extras (outside the mobile-safe middle) -->
  ${at(200, 932, 1.1, coinStack(9))}${at(330, 932, 1.1, coinStack(5))}
  ${at(400, 760, 0.75, coffee())}
  ${at(2300, 932, 1.0, calc({ screen: "$172K", pose: "up", mouth: "smile" }))}
  ${at(2140, 932, 0.7, piggy())}
  ${at(2420, 520, 0.6, card({ label: "22%" }), 12)}
  ${at(230, 440, 1, sparkles(4, 90))}
  <!-- mobile-safe middle -->
  ${at(630, 925, 0.95, bean({ pose: "wave", face: "happy" }))}
  ${at(1905, 925, 0.85, brain({ face: "sly", pose: "down" }))}
  ${at(1285, 650, 0.86, wordmark())}
  ${at(1285, 820, 1, receiptStrip("THE PSYCHOLOGY OF YOUR MONEY"))}
</svg>`;
const bannerGuides = banner.replace("</svg>", `<rect x="${SAFE.x}" y="${SAFE.y}" width="${SAFE.w}" height="${SAFE.h}" fill="none" stroke="red" stroke-width="6" stroke-dasharray="20 14"/>${txt(SAFE.x + 10, SAFE.y - 24, "visible on every device (1546×423)", 36, "red", { anchor: "start" })}</svg>`);

/* ---------- video watermark 150x150, transparent ---------- */
const watermark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" width="150" height="150">
  <circle cx="75" cy="75" r="70" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="5"/>
  <clipPath id="c"><circle cx="75" cy="75" r="67"/></clipPath>
  <g clip-path="url(#c)">${at(75, 200, 0.42, bean({ pose: "down", face: "happy", noShadow: true, legs: false }))}</g>
</svg>`;

const jobs = [
  ["avatar", avatar, 800, 800, false],
  ["avatar-duo", avatarDuo, 800, 800, false],
  ["banner", banner, 2560, 1440, false],
  ["banner-safe-area-guide", bannerGuides, 2560, 1440, false],
  ["watermark", watermark, 150, 150, true],
];
for (const [name, svg] of jobs) {
  writeFileSync(join(OUT, `${name}.svg`), svg);
  writeFileSync(join(HERE, `${name}.html`), `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS} html,body{margin:0;background:transparent}</style></head><body>${svg}</body></html>`);
}

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch();
for (const [name, , w, h, transparent] of jobs) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto("file://" + join(HERE, `${name}.html`));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: join(OUT, `${name}.png`), omitBackground: transparent, clip: { x: 0, y: 0, width: w, height: h } });
  await page.close();
}
// circle preview of the avatar, the way YouTube shows it
const page = await browser.newPage({ viewport: { width: 1000, height: 300 } });
writeFileSync(join(HERE, "preview.html"), `<body style="margin:0;background:#fff;display:flex;gap:40px;align-items:center;padding:20px;font-family:sans-serif">
  ${[176, 98, 40].map((s) => `<img src="file://${join(OUT, "avatar.png")}" style="width:${s}px;height:${s}px;border-radius:50%">`).join("")}
  ${[176, 98, 40].map((s) => `<img src="file://${join(OUT, "avatar-duo.png")}" style="width:${s}px;height:${s}px;border-radius:50%">`).join("")}</body>`);
await page.goto("file://" + join(HERE, "preview.html"));
await page.screenshot({ path: join(OUT, "avatar-preview-sizes.png") });
await browser.close();
console.log("wrote", jobs.map((j) => j[0]).join(", "));
