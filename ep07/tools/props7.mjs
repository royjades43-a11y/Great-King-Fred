// EP07 sets and props (new presentation style). World coordinates: the ground line is y = 940 in every set.
// SETS are big continuous worlds the camera moves across; props are drawn on top of them by the beats.
import { C, K, K3, at, txt } from "../../moneybrain/tools/kit.mjs";

const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;
const rain = (x0, y0, w, h, n = 14) => Array.from({ length: n }, (_, i) => { const x = x0 + ((i * 97) % w), y = y0 + ((i * 53) % (h - 40)); return `<path d="M ${x} ${y} l -10 34" stroke="#9FB8C6" stroke-width="5" stroke-linecap="round"/>`; }).join("");

// ---------- Bean's apartment (x 0..2900) ----------
export function homeSet() {
  const stripes = Array.from({ length: 30 }, (_, i) => `<path d="M ${i * 100} 0 L ${i * 100} 940" stroke="#E6D9BA" stroke-width="14"/>`).join("");
  const boards = Array.from({ length: 30 }, (_, i) => `<path d="M ${i * 120} 940 L ${i * 120 - 60} 1500" stroke="${C.woodDk}" stroke-width="3" opacity="0.35"/>`).join("");
  return `<rect x="-600" y="-400" width="4200" height="1340" fill="#EFE3C6"/>${stripes}
    <rect x="-600" y="940" width="4200" height="700" fill="${C.wood}"/>${boards}<path d="M -600 940 L 3600 940" ${INK} stroke-width="6"/>
    <rect x="-600" y="905" width="4200" height="36" fill="#E2CFA4" ${K3}/>
    <!-- window: night, rain -->
    <rect x="1500" y="170" width="480" height="470" rx="10" fill="#3E4F63" ${K}/>
    <path d="M 1500 520 L 1560 470 L 1620 500 L 1680 430 L 1740 470 L 1800 410 L 1880 460 L 1980 420 L 1980 640 L 1500 640 Z" fill="#2E3A49"/>
    ${[[1560, 540], [1640, 560], [1700, 500], [1790, 520], [1880, 545], [1930, 500]].map(([x, y]) => `<rect x="${x}" y="${y}" width="18" height="22" fill="${C.gold}" opacity="0.7"/>`).join("")}
    ${rain(1520, 190, 440, 430, 18)}
    <path d="M 1740 170 L 1740 640 M 1500 405 L 1980 405" ${INK} stroke-width="10"/><rect x="1500" y="170" width="480" height="470" rx="10" fill="none" ${K}/>
    <rect x="1480" y="640" width="520" height="26" rx="6" fill="${C.paper}" ${K3}/>
    <!-- lamp -->
    <path d="M 300 940 L 300 560" ${INK} stroke-width="10"/><path d="M 230 560 L 370 560 L 340 470 L 260 470 Z" fill="${C.mustard}" ${K}/><ellipse cx="300" cy="940" rx="60" ry="10" fill="${C.ink}" opacity="0.2"/>

    <!-- sofa -->
    <rect x="560" y="700" width="720" height="150" rx="40" fill="${C.slateDk}" ${K}/><rect x="520" y="760" width="110" height="180" rx="40" fill="${C.slateDk}" ${K}/><rect x="1210" y="760" width="110" height="180" rx="40" fill="${C.slateDk}" ${K}/>
    <rect x="610" y="800" width="620" height="90" rx="26" fill="${C.slate}" ${K}/><path d="M 600 930 L 600 950 M 1240 930 L 1240 950" ${INK} stroke-width="8"/>
    <!-- door -->
    <rect x="2300" y="380" width="300" height="560" rx="8" fill="${C.woodDk}" ${K}/><rect x="2330" y="410" width="240" height="230" rx="6" fill="none" stroke="${C.wood}" stroke-width="8"/><circle cx="2560" cy="680" r="14" fill="${C.gold}" ${K3}/>
    <rect x="2290" y="930" width="320" height="14" fill="${C.ink}" opacity="0.25"/>`;
}
// ---------- the Black Friday mall (x 0..5600) ----------
// shop signs are pictures, not words, so they never fight with the hero words on screen
const SIGN = {
  clock: (x) => `<circle cx="${x}" cy="235" r="40" fill="${C.white}" ${K3}/><path d="M ${x} 235 L ${x} 208 M ${x} 235 L ${x + 20} 245" ${INK} stroke-width="6"/>`,
  tag: (x) => `<path d="M ${x - 70} 235 L ${x - 40} 205 L ${x + 70} 205 L ${x + 70} 265 L ${x - 40} 265 Z" fill="${C.white}" ${K3}/><path d="M ${x - 30} 250 L ${x + 60} 220" stroke="${C.red}" stroke-width="8" stroke-linecap="round"/>`,
  pct: (x) => `<circle cx="${x - 28}" cy="215" r="16" fill="none" stroke="${C.white}" stroke-width="9"/><circle cx="${x + 28}" cy="255" r="16" fill="none" stroke="${C.white}" stroke-width="9"/><path d="M ${x + 34} 205 L ${x - 34} 265" stroke="${C.white}" stroke-width="9" stroke-linecap="round"/>`,
};
export function shopFront(cx, sign, col) {
  return `<rect x="${cx - 470}" y="240" width="940" height="700" fill="${C.paper}" ${K}/><rect x="${cx - 470}" y="180" width="940" height="110" fill="${col}" ${K}/>
    ${SIGN[sign](cx)}
    ${Array.from({ length: 9 }, (_, i) => `<path d="M ${cx - 470 + i * 105} 290 q 52 50 105 0" fill="${i % 2 ? C.white : col}" ${K3}/>`).join("")}
    <rect x="${cx - 420}" y="760" width="840" height="180" fill="${C.wood}" ${K}/><rect x="${cx - 440}" y="740" width="880" height="30" fill="${C.woodDk}" ${K3}/>`;
}
export function mallSet() {
  const tiles = Array.from({ length: 40 }, (_, i) => `<path d="M ${i * 160} 940 L ${i * 160 - 120} 1500" stroke="#CDBF9E" stroke-width="3"/>`).join("");
  const lights = Array.from({ length: 28 }, (_, i) => `<circle cx="${i * 210 + 60}" cy="${60 + (i % 2) * 16}" r="12" fill="${[C.gold, C.red, C.olive][i % 3]}" ${K3}/>`).join("");
  return `<rect x="-800" y="-400" width="7400" height="1340" fill="#E9DAB6"/>
    <path d="M -800 50 Q 2000 110 6600 50" fill="none" ${INK} stroke-width="4"/>${lights}
    <rect x="-800" y="940" width="7400" height="700" fill="#E1D3AE"/>${tiles}<path d="M -800 940 L 6600 940" ${INK} stroke-width="6"/>
    ${shopFront(1050, "clock", C.red)}${shopFront(2550, "tag", C.slateDk)}${shopFront(4050, "pct", C.oliveDk)}
    ${[1800, 3300].map((x) => `<path d="M ${x - 120} 940 L ${x - 120} 760 M ${x + 120} 940 L ${x + 120} 760" ${INK} stroke-width="10"/><rect x="${x - 220}" y="580" width="440" height="190" rx="16" fill="${C.ink}" ${K}/>${txt(x, 645, "BLACK", 66, C.gold, { font: "bold" })}${txt(x, 712, "FRIDAY", 66, C.gold, { font: "bold" })}`).join("")}
    <rect x="4900" y="300" width="420" height="640" fill="#BFD9E6" ${K}/><path d="M 5110 300 L 5110 940" ${INK} stroke-width="6"/><rect x="4950" y="230" width="320" height="70" rx="10" fill="${C.olive}" ${K3}/>${txt(5110, 268, "EXIT", 48, C.white, { font: "bold" })}`;
}
// ---------- the street home (x 0..5000), four doors = four moves ----------
export function streetSet() {
  const doors = [["1", "MOOD CHECK", C.slateDk], ["2", "24-HOUR CART", C.terra], ["3", "FUN MONEY", C.olive], ["4", "SHOP THE LIST", C.mustard]].map(([n, l, col], i) => {
    const x = 800 + i * 1100;
    return `<rect x="${x - 330}" y="260" width="660" height="680" fill="${C.paper2}" ${K}/><rect x="${x - 130}" y="560" width="260" height="380" rx="10" fill="${col}" ${K}/>
      <circle cx="${x + 90}" cy="760" r="12" fill="${C.gold}" ${K3}/><rect x="${x - 250}" y="300" width="500" height="120" rx="14" fill="${C.white}" ${K}/>
      ${txt(x, 342, `MOVE ${n}`, 40, col, { font: "bold" })}${txt(x, 392, l, 44, C.ink, { font: "bold" })}`;
  }).join("");
  return `<rect x="-800" y="-400" width="6800" height="1340" fill="#DCE6E2"/><circle cx="4600" cy="160" r="70" fill="${C.gold}" opacity="0.8"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M ${i * 1000 - 300} 200 q 60 -50 120 0 q 60 -50 120 0" fill="none" stroke="${C.white}" stroke-width="14" stroke-linecap="round"/>`).join("")}
    <rect x="-800" y="940" width="6800" height="700" fill="${C.grey}"/><path d="M -800 940 L 6000 940" ${INK} stroke-width="6"/><path d="M -800 1000 L 6000 1000" stroke="#B5AE9F" stroke-width="4" stroke-dasharray="60 40"/>${doors}`;
}

// ---------- props ----------
export function personRow(n, col, gap = 70) { return Array.from({ length: n }, (_, i) => `<g transform="translate(${(i - (n - 1) / 2) * gap} 0)"><circle cy="-70" r="24" fill="${col}" ${K3}/><path d="M -36 0 Q -36 -40 0 -40 Q 36 -40 36 0 Z" fill="${col}" ${K3}/></g>`).join(""); }
export function tv(inner) { return `<rect x="-120" y="-90" width="240" height="160" rx="16" fill="${C.ink}" ${K}/><rect x="-102" y="-74" width="204" height="128" rx="8" fill="#CFE3EA"/>${inner}<path d="M -40 70 L -60 100 M 40 70 L 60 100" ${INK} stroke-width="6"/>`; }
export const sadFace = () => `<circle cx="0" cy="-10" r="40" fill="${C.bean}" ${K3}/><path d="M -16 -16 L -10 -16 M 10 -16 L 16 -16" ${INK} stroke-width="5"/><path d="M -14 10 Q 0 0 14 10" fill="none" ${INK} stroke-width="4"/><path d="M -14 -6 q -3 10 0 14" stroke="#7FB2D1" stroke-width="4"/>`;
export const fish = () => `<path d="M -50 -10 Q -10 -50 40 -10 Q -10 30 -50 -10 Z" fill="${C.mustard}" ${K3}/><path d="M 40 -10 L 70 -30 L 70 10 Z" fill="${C.mustard}" ${K3}/><circle cx="-26" cy="-14" r="5" fill="${C.ink}"/>`;
export function panel(w, h, col = C.white) { return `<rect x="${-w / 2 + 10}" y="${-h + 10}" width="${w}" height="${h}" rx="18" fill="${C.ink}" opacity="0.15"/><rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="18" fill="${col}" ${K}/>`; }
export function lever(on = false) {
  return `<rect x="-90" y="-50" width="180" height="100" rx="20" fill="${C.white}" ${K}/>${txt(-48, 4, "OFF", 26, C.grey, { font: "bold" })}${txt(48, 4, "ON", 26, C.oliveDk, { font: "bold" })}
    <g transform="rotate(${on ? 35 : -35})"><path d="M 0 0 L 0 -110" ${INK} stroke-width="12"/><circle cy="-116" r="22" fill="${on ? C.olive : C.red}" ${K3}/></g>${txt(0, 90, "CONTROL", 30, C.ink, { font: "bold" })}`;
}
export function pillBottle(label = "RETAIL THERAPY", exp = "") {
  return `<rect x="-90" y="-260" width="180" height="40" rx="8" fill="${C.white}" ${K}/><rect x="-80" y="-220" width="160" height="220" rx="20" fill="${C.terra}" ${K}/>
    <rect x="-70" y="-180" width="140" height="120" rx="8" fill="${C.white}" ${K3}/>${txt(0, -140, label.split(" ")[0], 22, C.ink, { font: "bold" })}${txt(0, -110, label.split(" ")[1] || "", 22, C.ink, { font: "bold" })}
    ${exp ? txt(0, -76, exp, 16, C.red, { font: "bold" }) : ""}`;
}
export function hoodie(tag = "$100", col = C.slateDk, tagCol = C.gold) {
  return `<path d="M 0 -430 Q -30 -460 -60 -430" fill="none" ${INK} stroke-width="8"/><path d="M -200 -360 L 200 -360" ${INK} stroke-width="8"/>
    <path d="M -110 -380 Q 0 -300 110 -380 L 210 -320 L 250 -150 L 170 -130 L 160 -220 L 160 0 L -160 0 L -160 -220 L -170 -130 L -250 -150 L -210 -320 Z" fill="${col}" ${K}/>
    <path d="M -60 -380 Q 0 -330 60 -380" fill="none" ${INK} stroke-width="5"/><rect x="-80" y="-160" width="160" height="70" rx="12" fill="none" stroke="${C.ink}" stroke-width="4" opacity="0.5"/>
    <path d="M 150 -300 L 230 -240" ${INK} stroke-width="4"/><g transform="translate(230 -240) rotate(14)"><path d="M 0 0 L 30 -36 L 190 -36 L 190 36 L 30 36 Z" fill="${tagCol}" ${K}/><circle cx="26" cy="0" r="8" fill="${C.paper}" ${K3}/>${txt(110, 4, tag, 46, C.ink, { font: "bold" })}</g>`;
}
export function timerSign(text = "00:10:00", id = "") { return `<rect x="-260" y="-80" width="520" height="160" rx="20" fill="${C.ink}" ${K}/><rect x="-236" y="-58" width="472" height="116" rx="10" fill="#2B1E1E"/><text ${id ? `id="${id}"` : ""} x="0" y="6" font-family="Space Mono" font-weight="700" font-size="84" fill="${C.red}" text-anchor="middle" dominant-baseline="middle">${text}</text>`; }
export function boxPile(n = 12) { let s = ""; for (let i = 0; i < n; i++) s += `<rect x="${(i % 4) * 110 - 220}" y="${-100 - Math.floor(i / 4) * 90}" width="104" height="88" fill="#D9B07A" ${K3}/>`; return s; }
export function cartIcon(n = "") { return `<path d="M -110 -120 L -80 -120 L -50 -30 L 80 -30 L 110 -100 L -70 -100" fill="none" ${INK} stroke-width="10"/><circle cx="-40" cy="0" r="16" fill="${C.ink}"/><circle cx="70" cy="0" r="16" fill="${C.ink}"/>${n ? `<circle cx="100" cy="-130" r="30" fill="${C.red}" ${K3}/>${txt(100, -126, n, 32, C.white, { font: "bold" })}` : ""}`; }
export function fridge(label = "24H") { return `<rect x="-130" y="-420" width="260" height="420" rx="24" fill="#DCEFF7" ${K}/><path d="M -130 -280 L 130 -280" ${INK} stroke-width="6"/><path d="M 100 -380 L 100 -320 M 100 -240 L 100 -160" ${INK} stroke-width="10"/>${txt(0, -150, label, 70, C.slateDk, { font: "bold" })}`; }
export function mirror() { return `<ellipse cx="0" cy="-300" rx="170" ry="240" fill="#CFE3EA" ${K}/><path d="M -80 -440 L -20 -500 M -100 -380 L 0 -480" stroke="${C.white}" stroke-width="12" stroke-linecap="round" opacity="0.8"/><path d="M -40 -60 L -60 0 L 60 0 L 40 -60" fill="${C.wood}" ${K}/>`; }
export function listPaper(items) { const h = 120 + items.length * 70; return `<rect x="-220" y="${-h}" width="440" height="${h}" fill="${C.white}" ${K}/>${txt(0, -h + 56, "MY LIST", 44, C.ink, { font: "bold" })}${items.map((t, i) => `<path d="M -180 ${-h + 120 + i * 70} l 20 0" ${INK} stroke-width="4"/>${txt(-140, -h + 122 + i * 70, t, 36, C.ink, { anchor: "start" })}`).join("")}`; }
export function cafe() { return `<rect x="-400" y="-60" width="800" height="40" rx="10" fill="${C.wood}" ${K}/><path d="M -340 -20 L -340 140 M 340 -20 L 340 140" ${INK} stroke-width="10"/><rect x="-130" y="-160" width="260" height="100" fill="${C.white}" ${K}/>${txt(0, -110, "BILL $$$", 34, C.red, { font: "bold" })}`; }
// the mood line drawn on the wall: rises to a peak at BUY, then falls
export function moodChart(upto = 1) {
  const pts = [[0, 320], [120, 300], [240, 260], [360, 190], [460, 90], [520, 60], [600, 140], [720, 250], [860, 300], [1000, 320]];
  const n = Math.max(2, Math.round(pts.length * upto));
  return `<path d="M 0 360 L 1000 360 M 0 360 L 0 0" ${INK} stroke-width="6"/>${txt(-20, -20, "MOOD", 30, C.ink, { font: "bold", anchor: "start" })}
    <polyline points="${pts.slice(0, n).map(([x, y]) => `${x},${y}`).join(" ")}" fill="none" stroke="${C.red}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
}
// the shopping loop: five stations on a circle
export function loopRing(r = 260) { return `<circle r="${r}" fill="none" stroke="${C.ink}" stroke-width="8" stroke-dasharray="26 18"/><path d="M ${r - 20} -40 l 20 30 l 24 -26" fill="none" ${INK} stroke-width="8"/>`; }
export const loopPos = (i, r = 260) => { const a = -Math.PI / 2 + (i / 5) * Math.PI * 2; return [Math.cos(a) * r, Math.sin(a) * r]; };
