// Episode 4 props: the moving-day / storage theme. Cardboard account boxes with TAX stamps,
// storage-unit doors, the 5-step staircase, the farmer (seeds vs harvest), the old-401(k) letter,
// the moving truck and the IRA "cash sitting" pile. Same ink, palette and line weight as the kit.
import { C, K, K3, at, txt, coin, star, check, bill } from "../../moneybrain/tools/kit.mjs";

const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;
export const CARD = "#C9A27A", CARD_DK = "#A67F57";

// a cardboard box standing on (0,0); o: { stamp, stampCol, open, w, h, size }
export function box(label = "", o = {}) {
  const w = o.w || 300, h = o.h || 230;
  const flaps = o.open
    ? `<path d="M ${-w / 2} ${-h} L ${-w / 2 - 60} ${-h - 70} L ${-w / 2 + 40} ${-h - 90} L ${-w / 2 + 40} ${-h} Z" fill="${CARD_DK}" ${K3}/>
       <path d="M ${w / 2} ${-h} L ${w / 2 + 60} ${-h - 70} L ${w / 2 - 40} ${-h - 90} L ${w / 2 - 40} ${-h} Z" fill="${CARD_DK}" ${K3}/>`
    : `<path d="M ${-w / 2} ${-h} L 0 ${-h - 34} L ${w / 2} ${-h} Z" fill="${CARD_DK}" ${K3}/><rect x="-24" y="${-h - 4}" width="48" height="${h * 0.45}" fill="#D9C08F" opacity="0.8"/>`;
  return `<rect x="${-w / 2 + 10}" y="${-h + 10}" width="${w}" height="${h}" fill="${C.ink}" opacity="0.15"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${CARD}" ${K}/>${flaps}
    <path d="M ${-w / 2 + 20} ${-h + 40} L ${-w / 2 + 60} ${-h + 40} M ${w / 2 - 60} -24 L ${w / 2 - 20} -24" stroke="${CARD_DK}" stroke-width="4"/>
    ${label ? `<rect x="${-w / 2 + 30}" y="${-h * 0.62}" width="${w - 60}" height="${h * 0.3}" rx="6" fill="${C.white}" ${K3}/>${txt(0, -h * 0.47, label, o.size || Math.min(48, Math.floor((w - 80) / (label.length * 0.72))), C.ink, { font: "bold" })}` : ""}
    ${o.stamp ? `<g transform="translate(0 ${-h * 0.16}) rotate(-6)"><rect x="${-w / 2 + 40}" y="-24" width="${w - 80}" height="48" rx="6" fill="${C.white}" fill-opacity="0.7" stroke="${o.stampCol || C.red}" stroke-width="5"/>${txt(0, 3, o.stamp, Math.min(34, Math.floor((w - 90) / (o.stamp.length * 0.68))), o.stampCol || C.red, { font: "bold" })}</g>` : ""}`;
}
export function storageDoor(label = "", o = {}) {
  const w = o.w || 300, h = o.h || 380;
  let slats = "";
  for (let y = -h + 30; y < 0; y += 34) slats += `<path d="M ${-w / 2 + 10} ${y} L ${w / 2 - 10} ${y}" stroke="${C.slateDk}" stroke-width="4"/>`;
  return `<rect x="${-w / 2 - 20}" y="${-h - 30}" width="${w + 40}" height="${h + 30}" fill="${C.paper2}" ${K}/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${C.slate}" ${K}/>${slats}
    <rect x="-40" y="-40" width="80" height="16" rx="6" fill="${C.grey}" ${K3}/>
    ${label ? `<rect x="${-w / 2 + 10}" y="${-h - 26}" width="${w - 20}" height="52" fill="${o.col || C.mustard}" ${K3}/>${txt(0, -h, label, 36, C.ink, { font: "bold" })}` : ""}`;
}
// staircase going up to the right, base at (0,0); lit = how many steps are highlighted
export function staircase(n = 5, lit = 0, labels = [], o = {}) {
  const sw = o.sw || 230, sh = o.sh || 110;
  let s = "";
  for (let i = 0; i < n; i++) {
    const on = i < lit;
    if ((o.skip || []).includes(i)) { s += `<rect x="${i * sw}" y="${-(i + 1) * sh}" width="${sw}" height="${(i + 1) * sh}" fill="${C.paper2}" ${K}/>`; continue; }
    s += `<rect x="${i * sw}" y="${-(i + 1) * sh}" width="${sw}" height="${(i + 1) * sh}" fill="${on ? [C.olive, C.olive, C.olive, C.mustard, C.slate][i] || C.olive : C.paper2}" ${K}/>
      ${txt(i * sw + 32, -(i + 1) * sh + 24, String(i + 1), 28, on ? C.white : C.grey, { font: "bold" })}
      ${labels[i] ? txt(i * sw + sw / 2, -(i + 1) * sh + 90, labels[i], Math.min(30, Math.floor((sw - 30) / (labels[i].length * 0.7))), on ? C.ink : C.grey, { font: "bold" }) : ""}`;
  }
  return s;
}
export const strawHat = () => `<ellipse cx="0" cy="0" rx="120" ry="24" fill="${C.gold}" ${K}/><path d="M -60 -4 Q -56 -80 0 -82 Q 56 -80 60 -4 Z" fill="${C.gold}" ${K}/><rect x="-58" y="-26" width="116" height="18" fill="${C.red}"/>`;
export function seedBag(label = "SEEDS") {
  return `<path d="M -70 0 Q -90 -100 -50 -150 L 50 -150 Q 90 -100 70 0 Z" fill="${C.wood}" ${K}/><path d="M -50 -150 Q 0 -180 50 -150" fill="none" ${K}/>
    ${[[-20, -170], [10, -178], [30, -166]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="8" ry="5" fill="${C.oliveDk}"/>`).join("")}${txt(0, -70, label, 30, C.ink, { font: "bold" })}`;
}
export function harvest(label = "HARVEST", s = 1) {
  let sheaves = "";
  for (let i = 0; i < 7; i++) {
    const x = -240 + i * 80, hh = 220 + ((i * 37) % 60);
    sheaves += `<path d="M ${x} 0 L ${x - 10} ${-hh} M ${x} 0 L ${x + 14} ${-hh + 10} M ${x} 0 L ${x} ${-hh - 10}" stroke="${C.mustard}" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="${x}" cy="${-hh - 20}" rx="18" ry="40" fill="${C.gold}" ${K3}/>`;
  }
  return `<g transform="scale(${s})">${sheaves}<rect x="-280" y="-80" width="560" height="40" rx="10" fill="${C.woodDk}" ${K3}/>${txt(0, -58, label, 30, C.white, { font: "bold" })}</g>`;
}
export function taxBite(label = "TAX") {
  return `<path d="M -90 -40 Q -60 -110 0 -96 Q 60 -110 90 -40 L 70 50 L -70 50 Z" fill="${C.red}" ${K}/>
    <path d="M -54 50 l 18 30 l 18 -30 l 18 30 l 18 -30 l 18 30" fill="${C.white}" ${K3}/>${txt(0, -18, label, 44, C.white, { font: "bold" })}`;
}
export function truck(label = "NEW JOB") {
  return `<rect x="-300" y="-260" width="380" height="220" rx="10" fill="${C.white}" ${K}/>${txt(-110, -150, label, 50, C.ink, { font: "bold" })}
    <path d="M 80 -200 L 200 -200 L 260 -130 L 260 -40 L 80 -40 Z" fill="${C.olive}" ${K}/><path d="M 100 -180 L 190 -180 L 230 -130 L 100 -130 Z" fill="${C.slate}" ${K3}/>
    <circle cx="-200" cy="-36" r="40" fill="${C.ink}"/><circle cx="-200" cy="-36" r="14" fill="${C.grey}"/><circle cx="170" cy="-36" r="40" fill="${C.ink}"/><circle cx="170" cy="-36" r="14" fill="${C.grey}"/>`;
}
export function cashPile(cobweb = false) {
  let b = "";
  for (let i = 0; i < 6; i++) b += at(((i % 3) - 1) * 70, -30 - Math.floor(i / 3) * 50, 0.7, bill());
  return b + (cobweb ? `<path d="M -150 -150 L -60 -60 M -150 -150 L -150 -40 M -150 -150 L -40 -150 M -150 -110 Q -110 -110 -110 -150 M -150 -80 Q -80 -80 -80 -150" fill="none" stroke="${C.grey}" stroke-width="3"/>` : "");
}
export function buyButton(label = "BUY") {
  return `<rect x="-140" y="-56" width="280" height="112" rx="56" fill="${C.olive}" ${K}/><rect x="-140" y="-56" width="280" height="40" rx="20" fill="${C.white}" opacity="0.25"/>${txt(0, 4, label, 52, C.ink, { font: "bold" })}`;
}
export function trap() {
  return `<rect x="-200" y="-30" width="400" height="30" rx="6" fill="${C.wood}" ${K}/>
    <path d="M -150 -30 Q -150 -200 0 -200 Q 150 -200 150 -30" fill="none" stroke="${C.grey}" stroke-width="16"/><path d="M -150 -30 Q -150 -200 0 -200 Q 150 -200 150 -30" fill="none" ${K}/>
    <path d="M -40 -30 L 40 -30 L 30 -60 L -30 -60 Z" fill="${C.gold}" ${K3}/>`;
}
export function gauge2(level, label) {
  // tiny tax-rate thermometer, level 0..1
  return `<rect x="-36" y="-300" width="72" height="300" rx="36" fill="${C.white}" ${K}/><rect x="-24" y="${-12 - 276 * level}" width="48" height="${276 * level}" rx="24" fill="${level > 0.5 ? C.red : C.olive}"/>${txt(0, 40, label, 30, C.ink, { font: "bold" })}`;
}
export function bigLetters(letters, words, col = C.slateDk) {
  return letters.map((l, i) => txt(-380 + i * 380, -40, l, 200, col, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` }) + txt(-380 + i * 380, 110, words[i], 44, C.ink, { font: "bold" })).join("");
}
