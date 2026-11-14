// Props for Shorts batch 2 (Shorts 7–12). Same ink, palette and line weight as the PesaBrain kit.
import { C, txt } from "../../moneybrain/tools/kit.mjs";
const K = `stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const K3 = `stroke="${C.ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"`;

// a card reader / tip screen standing on (0,0); buttons = array of labels, hi = index to pulse
export function tipScreen(buttons = ["20%", "25%", "30%"], o = {}) {
  const w = 420, h = 560;
  return `<rect x="${-w / 2 + 12}" y="${-h + 14}" width="${w}" height="${h}" rx="40" fill="${C.ink}" opacity="0.2"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="40" fill="#3A3532" ${K}/>
    <rect x="${-w / 2 + 26}" y="${-h + 30}" width="${w - 52}" height="${h - 110}" rx="16" fill="${C.white}" ${K3}/>
    ${txt(0, -h + 80, o.title || "ADD A TIP?", 38, C.ink, { font: "bold" })}
    ${buttons.map((b, i) => `<rect x="${-w / 2 + 50}" y="${-h + 120 + i * 100}" width="${w - 100}" height="80" rx="18" fill="${i === o.hi ? C.olive : C.slate}" ${K3}/>${txt(0, -h + 162 + i * 100, b, 46, C.ink, { font: "bold" })}`).join("")}
    ${o.custom !== false ? txt(w / 2 - 70, -110, "custom", o.bigCustom ? 34 : 18, C.grey, { font: "bold" }) : ""}
    <circle cx="0" cy="-42" r="16" fill="${C.grey}" ${K3}/>`;
}
export function taxi() {
  return `<path d="M -230 -50 L -230 -150 Q -222 -176 -190 -180 L -120 -190 L -70 -260 Q -56 -276 -30 -276 L 90 -276 Q 116 -276 132 -258 L 180 -190 L 214 -184 Q 240 -178 240 -150 L 240 -50 Z" fill="${C.gold}" ${K}/>
    <path d="M -100 -194 L -56 -250 L 26 -250 L 26 -194 Z M 46 -194 L 46 -250 L 98 -250 Q 112 -250 122 -236 L 150 -194 Z" fill="${C.slate}" ${K3}/>
    <rect x="-40" y="-310" width="80" height="34" rx="6" fill="${C.white}" ${K3}/>${txt(0, -292, "TAXI", 24, C.ink, { font: "bold" })}
    <path d="M -230 -110 L 240 -110" stroke="${C.ink}" stroke-width="4" stroke-dasharray="20 14"/>
    <circle cx="-130" cy="-46" r="46" fill="${C.ink}"/><circle cx="-130" cy="-46" r="18" fill="${C.grey}"/><circle cx="140" cy="-46" r="46" fill="${C.ink}"/><circle cx="140" cy="-46" r="18" fill="${C.grey}"/>`;
}
export function tipJar(level = 0.4, label = "TIPS") {
  const h = 280, w = 220, fy = -h * level;
  return `<path d="M ${-w / 2} -10 L ${-w / 2} ${-h} L ${w / 2} ${-h} L ${w / 2} -10 Q ${w / 2} 0 ${w / 2 - 10} 0 L ${-w / 2 + 10} 0 Q ${-w / 2} 0 ${-w / 2} -10 Z" fill="${C.white}" fill-opacity="0.7" ${K}/>
    <rect x="${-w / 2 + 8}" y="${fy}" width="${w - 16}" height="${Math.max(0, -fy - 8)}" fill="${C.olive}" opacity="0.85"/>
    <rect x="-70" y="${-h * 0.62}" width="140" height="56" rx="8" fill="${C.white}" ${K3}/>${txt(0, -h * 0.62 + 30, label, 32, C.ink, { font: "bold" })}`;
}
export function gymCard(o = {}) {
  return `<rect x="-200" y="-125" width="400" height="250" rx="22" fill="${C.red}" ${K}/>${txt(-160, -60, "GYM", 70, C.white, { font: "bold", anchor: "start" })}
    ${txt(-160, 20, o.price || "$70 / MONTH", 40, C.white, { font: "bold", anchor: "start" })}<rect x="-160" y="60" width="200" height="22" rx="6" fill="${C.white}" opacity="0.6"/>
    ${o.web ? `<path d="M 200 -125 L 120 -45 M 200 -125 L 200 -20 M 200 -125 L 90 -125 M 200 -85 Q 160 -85 160 -125 M 200 -55 Q 130 -55 130 -125" fill="none" stroke="${C.grey}" stroke-width="4"/>` : ""}`;
}
export function dumbbell() {
  return `<rect x="-140" y="-18" width="280" height="36" rx="12" fill="${C.grey}" ${K}/>${[-1, 1].map((s) => `<rect x="${s * 140 - 36}" y="-80" width="72" height="160" rx="14" fill="${C.ink}"/><rect x="${s * 190 - 20}" y="-56" width="40" height="112" rx="10" fill="${C.ink}"/>`).join("")}`;
}
export function sofa() {
  return `<rect x="-300" y="-170" width="600" height="110" rx="30" fill="${C.slateDk}" ${K}/><rect x="-340" y="-140" width="90" height="140" rx="30" fill="${C.slateDk}" ${K}/><rect x="250" y="-140" width="90" height="140" rx="30" fill="${C.slateDk}" ${K}/>
    <rect x="-260" y="-80" width="520" height="70" rx="20" fill="${C.slate}" ${K}/><path d="M -260 0 L -260 20 M 260 0 L 260 20" ${K}/>`;
}
// a phone covered with tiny subscription app icons, each with a price
export function subsPhone(prices = ["$15", "$11", "$9", "$13", "$7", "$18", "$5", "$12", "$10"]) {
  const w = 420, h = 780, cols = ["#C4553F", "#5F7C90", "#8E9B6A", "#D3A43F", "#E7958C", "#231F1C", "#B8704F", "#8FA7B4", "#6F7C52"];
  return `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="50" fill="${C.ink}" ${K}/><rect x="${-w / 2 + 22}" y="${-h + 60}" width="${w - 44}" height="${h - 120}" rx="16" fill="${C.white}"/>
    ${prices.map((p, i) => { const x = -120 + (i % 3) * 120, y = -h + 150 + Math.floor(i / 3) * 190; return `<rect x="${x - 46}" y="${y - 46}" width="92" height="92" rx="22" fill="${cols[i % cols.length]}" ${K3}/><path d="M ${x - 14} ${y - 18} L ${x + 18} ${y} L ${x - 14} ${y + 18} Z" fill="${C.white}" opacity="${i % 2 ? 0 : 0.8}"/><rect x="${x - 40}" y="${y + 54}" width="80" height="36" rx="8" fill="${C.gold}" ${K3}/>${txt(x, y + 73, p, 26, C.ink, { font: "bold" })}`; }).join("")}`;
}
export function ghostSub(label = "$9/mo") {
  return `<path d="M -90 0 L -90 -120 Q -90 -200 0 -200 Q 90 -200 90 -120 L 90 0 L 60 -24 L 30 0 L 0 -24 L -30 0 L -60 -24 Z" fill="${C.white}" fill-opacity="0.85" ${K}/>
    <circle cx="-30" cy="-120" r="10" fill="${C.ink}"/><circle cx="30" cy="-120" r="10" fill="${C.ink}"/><ellipse cx="0" cy="-80" rx="14" ry="18" fill="${C.ink}"/>${txt(0, -40, label, 26, C.red, { font: "bold" })}`;
}
// a shop receipt with big print
export function bigReceipt(lines, o = {}) {
  const w = o.w || 520, h = 120 + lines.length * 90;
  let zig = "";
  for (let i = 0; i <= 12; i++) zig += ` L ${(w / 2 - (i * w) / 12).toFixed(1)} ${i % 2 ? 22 : 0}`;
  return `<path d="M ${-w / 2} ${-h} L ${w / 2} ${-h}${zig} Z" fill="${C.white}" ${K}/>
    ${txt(0, -h + 60, o.title || "RECEIPT", 40, C.ink, { font: "mono" })}<path d="M ${-w / 2 + 30} ${-h + 96} L ${w / 2 - 30} ${-h + 96}" stroke="${C.ink}" stroke-width="3" stroke-dasharray="10 8"/>
    ${lines.map(([t, col, size], i) => txt(0, -h + 160 + i * 90, t, size || 56, col || C.ink, { font: "bold" })).join("")}`;
}
export function mug(label = "", col = C.terra) {
  return `<path d="M 80 -170 Q 160 -170 160 -110 Q 160 -50 80 -50" fill="none" ${K} stroke-width="22"/><path d="M 80 -170 Q 160 -170 160 -110 Q 160 -50 80 -50" fill="none" stroke="${col}" stroke-width="12"/>
    <path d="M -100 -220 L 100 -220 L 90 -10 Q 88 0 76 0 L -76 0 Q -88 0 -90 -10 Z" fill="${col}" ${K}/><ellipse cx="0" cy="-220" rx="100" ry="18" fill="#8B5A3C" ${K3}/>
    ${label ? txt(0, -110, label, 40, C.white, { font: "bold" }) : ""}`;
}
export function garage() {
  let stuff = "";
  const items = [[-260, C.slate, 120, 100], [-120, C.wood, 140, 160], [40, C.terra, 120, 120], [180, C.olive, 140, 180], [-200, C.mustard, 110, 90], [100, C.slateDk, 120, 100], [-40, C.pink, 100, 80]];
  items.forEach(([x, col, w, h], i) => { const y = i < 4 ? -h : -h - 170; stuff += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}" ${K3}/>`; });
  return `<path d="M -380 0 L -380 -420 L 0 -560 L 380 -420 L 380 0 Z" fill="${C.paper2}" ${K}/><rect x="-320" y="-400" width="640" height="400" fill="#3A3532" ${K}/>${stuff}
    <rect x="-320" y="-400" width="640" height="70" fill="${C.grey}" ${K3}/>`;
}
export function saleTable() {
  return `<rect x="-360" y="-200" width="720" height="40" fill="${C.wood}" ${K}/><path d="M -320 -160 L -330 0 M 320 -160 L 330 0" ${K}/>
    <path d="M -300 -200 L -300 -300 L -200 -300 L -200 -200" fill="${C.slate}" ${K3}/><circle cx="-60" cy="-250" r="50" fill="${C.terra}" ${K3}/><rect x="80" y="-320" width="90" height="120" fill="${C.olive}" ${K3}/><rect x="220" y="-280" width="100" height="80" fill="${C.mustard}" ${K3}/>
    <rect x="-150" y="-460" width="300" height="80" rx="10" fill="${C.white}" ${K3}/>${txt(0, -420, "YARD SALE", 44, C.ink, { font: "bold" })}`;
}
export function wingedBill(label = "$100") {
  return `<path d="M -150 -40 Q -260 -120 -230 -10 Q -280 30 -150 20 Z M 150 -40 Q 260 -120 230 -10 Q 280 30 150 20 Z" fill="${C.white}" ${K3}/>
    <rect x="-150" y="-70" width="300" height="140" rx="10" fill="${C.olive}" ${K}/><rect x="-120" y="-44" width="240" height="88" rx="6" fill="none" stroke="${C.oliveDk}" stroke-width="5"/>${txt(0, 4, label, 50, C.ink, { font: "bold" })}`;
}
export function bucket(label, col = C.slate, level = 0.5) {
  const fy = -220 * level;
  return `<path d="M -140 -230 L 140 -230 L 110 0 L -110 0 Z" fill="${C.white}" ${K}/><path d="M ${-140 + 30 * (1 - level)} ${fy} L ${140 - 30 * (1 - level)} ${fy} L 110 -6 L -110 -6 Z" fill="${col}" opacity="0.85"/>
    <path d="M -140 -230 L 140 -230 L 110 0 L -110 0 Z" fill="none" ${K}/><path d="M -130 -230 Q 0 -360 130 -230" fill="none" ${K}/>
    <rect x="-100" y="-170" width="200" height="60" rx="10" fill="${C.white}" ${K3}/>${txt(0, -138, label, 36, C.ink, { font: "bold" })}`;
}
