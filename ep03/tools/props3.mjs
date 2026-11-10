// Episode 3 props: the cooking-show kitchen, recipe cards and jars, the snowy hill and $ snowball,
// the BORING-O-METER and Impulse's temptations. Same ink, palette and line weight as the PesaBrain kit.
import { C, K, K3, at, txt, coin, star } from "../../moneybrain/tools/kit.mjs";

const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;
export const SNOW = "#F7F7F2", SNOW_SH = "#D9E2E6";

export function kitchen() {
  // backsplash tiles + counter, full width, counter top at y=760
  let tiles = "";
  for (let y = 0; y < 760; y += 90) for (let x = (y / 90) % 2 ? -45 : 0; x < 1920; x += 90) tiles += `<rect x="${x + 4}" y="${y + 4}" width="82" height="82" rx="6" fill="${(x / 90 + y / 90) % 3 === 0 ? "#E5DCC0" : C.paper}" stroke="#D3C7A6" stroke-width="2"/>`;
  return `<rect width="1920" height="1080" fill="${C.paper}"/>${tiles}
    <rect x="0" y="760" width="1920" height="40" fill="${C.woodDk}" ${K}/><rect x="0" y="800" width="1920" height="280" fill="${C.wood}" ${K}/>
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${60 + i * 380}" y="830" width="320" height="220" rx="10" fill="none" stroke="${C.woodDk}" stroke-width="5"/><circle cx="${220 + i * 380}" cy="860" r="9" fill="${C.ink}"/>`).join("")}`;
}
export function bowl(level = 0, id = "") {
  return `<path d="M -230 -200 Q -230 0 0 0 Q 230 0 230 -200 Z" fill="${C.slate}" ${K}/>
    <ellipse cx="0" cy="-200" rx="230" ry="40" fill="${C.slateDk}" ${K}/>
    ${level ? `<ellipse ${id ? `id="${id}"` : ""} cx="0" cy="-196" rx="${190 * level}" ry="${30 * level}" fill="${C.gold}"/>` : ""}
    <path d="M -150 -90 Q 0 -60 150 -90" fill="none" stroke="${C.white}" stroke-width="6" opacity="0.5"/>`;
}
export function ingredientJar(label, icon = "", col = C.olive) {
  return `<rect x="-80" y="-230" width="160" height="230" rx="26" fill="${C.white}" fill-opacity="0.75" ${K}/>
    <rect x="-90" y="-262" width="180" height="40" rx="10" fill="${col}" ${K3}/>
    <rect x="-70" y="-150" width="140" height="70" fill="${C.paper}" ${K3}/>${txt(0, -114, label, Math.min(34, Math.floor(130 / (label.length * 0.72))), C.ink, { font: "bold" })}
    ${icon ? at(0, -40, 1, icon) : ""}`;
}
export function recipeCard(num, title, o = {}) {
  const w = o.w || 640, h = o.h || 300;
  let lines = "";
  for (let i = 0; i < 4; i++) lines += `<path d="M ${-w / 2 + 40} ${-h / 2 + 140 + i * 36} L ${w / 2 - 40} ${-h / 2 + 140 + i * 36}" stroke="${C.slate}" stroke-width="2" opacity="0.6"/>`;
  return `<rect x="${-w / 2 + 10}" y="${-h / 2 + 12}" width="${w}" height="${h}" rx="10" fill="${C.ink}" opacity="0.25"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" fill="${C.white}" ${K}/>
    <path d="M ${-w / 2} ${-h / 2 + 90} L ${w / 2} ${-h / 2 + 90}" stroke="${C.red}" stroke-width="4"/>${lines}
    ${txt(-w / 2 + 40, -h / 2 + 50, "RECIPE · INGREDIENT " + num, 30, C.red, { font: "mono", anchor: "start" })}
    ${txt(0, 40, title, o.size || Math.min(76, Math.floor((w - 60) / (title.length * 0.72))), C.ink, { font: "bold" })}`;
}
export const chefHat = (s = 1) => `<g transform="scale(${s})"><rect x="-60" y="-50" width="120" height="50" fill="${C.white}" ${K}/>
  <path d="M -66 -46 Q -110 -90 -70 -130 Q -50 -170 0 -150 Q 50 -175 76 -128 Q 116 -90 66 -46 Z" fill="${C.white}" ${K}/></g>`;

export function hill(w = 1920) {
  // a snowy hill sloping down left→right across the frame (top at x≈120,y≈380; bottom at y≈940)
  return `<path d="M -20 360 C 300 380 600 560 1000 720 C 1300 830 1600 900 ${w + 20} 920 L ${w + 20} 1080 L -20 1080 Z" fill="${SNOW}" ${K}/>
    <path d="M 200 440 C 450 500 700 640 980 760" fill="none" stroke="${SNOW_SH}" stroke-width="10" stroke-linecap="round"/>
    ${[[300, 470], [700, 640], [1200, 830], [1650, 900]].map(([x, y]) => `<path d="M ${x} ${y} l 30 -70 l 30 70 Z M ${x + 10} ${y - 30} l 20 -50 l 20 50 Z" fill="${C.oliveDk}" ${K3}/>`).join("")}`;
}
// point on the hill path for x in [0,1920] (approximate, for placing the snowball)
export function hillY(x) {
  const pts = [[0, 360], [300, 400], [600, 520], [1000, 720], [1300, 830], [1600, 895], [1920, 920]];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0); }
  return 920;
}
export function snowball(label = "$", o = {}) {
  // centred on (0,0), radius 100
  return `<circle r="100" fill="${SNOW}" ${K}/><path d="M -60 40 Q 0 90 70 40" fill="none" stroke="${SNOW_SH}" stroke-width="12" stroke-linecap="round"/>
    <circle cx="-40" cy="-40" r="14" fill="${SNOW_SH}"/><circle cx="45" cy="-55" r="10" fill="${SNOW_SH}"/>
    ${label ? txt(0, 8, label, o.size || 90, o.col || C.oliveDk, { font: "bold" }) : ""}`;
}
export function boringMeter(needleId = "") {
  return `<path d="M -220 0 A 220 220 0 0 1 220 0 Z" fill="${C.white}" ${K}/>
    <path d="M -190 0 A 190 190 0 0 1 -95 -164" fill="none" stroke="${C.red}" stroke-width="40"/>
    <path d="M -95 -164 A 190 190 0 0 1 95 -164" fill="none" stroke="${C.mustard}" stroke-width="40"/>
    <path d="M 95 -164 A 190 190 0 0 1 190 0" fill="none" stroke="${C.slate}" stroke-width="40"/>
    ${txt(-150, -40, "WOW", 26, C.white, { font: "bold", rot: -60 })}${txt(150, -40, "ZZZ", 26, C.white, { font: "bold", rot: 60 })}
    <g ${needleId ? `id="${needleId}"` : ""}><path d="M 0 0 L 0 -180" ${INK} stroke-width="10"/></g><circle r="20" fill="${C.ink}"/>
    <rect x="-200" y="20" width="400" height="56" rx="10" fill="${C.ink}"/>${txt(0, 50, "BORING-O-METER", 34, C.gold, { font: "bold" })}`;
}
export function slotMachine(reels = ["7", "7", "💀"]) {
  return `<rect x="-170" y="-380" width="340" height="380" rx="30" fill="${C.red}" ${K}/><rect x="-140" y="-300" width="280" height="140" rx="10" fill="${C.white}" ${K3}/>
    ${reels.map((r, i) => `<rect x="${-130 + i * 90}" y="-290" width="80" height="120" fill="${C.paper}" ${K3}/>` + txt(-90 + i * 90, -226, r, 64, C.ink, { font: "bold" })).join("")}
    <rect x="-120" y="-360" width="240" height="44" rx="8" fill="${C.gold}" ${K3}/>${txt(0, -336, "JACKPOT?", 30, C.ink, { font: "bold" })}
    <path d="M 170 -260 L 220 -260 L 220 -380" fill="none" ${INK} stroke-width="10"/><circle cx="220" cy="-390" r="24" fill="${C.ink}"/>
    <rect x="-100" y="-120" width="200" height="60" rx="8" fill="${C.ink}"/>`;
}
export function rocket(label = "") {
  return `<path d="M 0 -300 Q 70 -220 70 -60 L -70 -60 Q -70 -220 0 -300 Z" fill="${C.white}" ${K}/><circle cy="-180" r="30" fill="${C.slate}" ${K}/>
    <path d="M -70 -120 L -130 -20 L -70 -60 Z M 70 -120 L 130 -20 L 70 -60 Z" fill="${C.red}" ${K}/>
    <path d="M -40 -60 Q 0 60 40 -60 Z" fill="${C.gold}" ${K3}/>${label ? txt(0, -100, label, 30, C.red, { font: "bold" }) : ""}`;
}
export function haystack(w = 1) {
  let straws = "";
  for (let i = 0; i < 26; i++) straws += `<path d="M ${-200 + (i * 37) % 400} ${-20 - (i * 53) % 260} l ${(i % 2 ? 1 : -1) * 30} -24" stroke="${C.woodDk}" stroke-width="4" stroke-linecap="round"/>`;
  return `<path d="M -240 0 Q -230 -200 -120 -300 Q 0 -360 120 -300 Q 230 -200 240 0 Z" fill="${C.gold}" ${K}/>${straws}`;
}
export function companyBlock(col, label = "") {
  return `<rect x="-36" y="-36" width="72" height="72" rx="8" fill="${col}" ${K3}/>${label ? txt(0, 2, label, 22, C.white, { font: "bold" }) : ""}`;
}
export function pie(fracs, cols, r = 160) {
  let a0 = -Math.PI / 2, s = "";
  fracs.forEach((f, i) => {
    const a1 = a0 + f * Math.PI * 2, large = f > 0.5 ? 1 : 0;
    s += `<path d="M 0 0 L ${(Math.cos(a0) * r).toFixed(1)} ${(Math.sin(a0) * r).toFixed(1)} A ${r} ${r} 0 ${large} 1 ${(Math.cos(a1) * r).toFixed(1)} ${(Math.sin(a1) * r).toFixed(1)} Z" fill="${cols[i]}" ${K3}/>`;
    a0 = a1;
  });
  return s + `<circle r="${r}" fill="none" ${K}/>`;
}
export function personIcon(col = C.grey) {
  return `<circle cx="0" cy="-70" r="22" fill="${col}" ${K3}/><path d="M -34 0 Q -34 -44 0 -44 Q 34 -44 34 0 Z" fill="${col}" ${K3}/>`;
}
export function toggle(on = true, label = "") {
  return `<rect x="-90" y="-44" width="180" height="88" rx="44" fill="${on ? C.olive : C.grey}" ${K}/><circle cx="${on ? 46 : -46}" cy="0" r="34" fill="${C.white}" ${K3}/>${label ? txt(0, 90, label, 34, C.ink, { font: "bold" }) : ""}`;
}
export function hammock() {
  return `<path d="M -320 -260 L -320 0 M 320 -260 L 320 0" ${INK} stroke-width="14"/><path d="M -320 -220 Q 0 -40 320 -220" fill="none" stroke="${C.terra}" stroke-width="40"/><path d="M -320 -220 Q 0 -40 320 -220" fill="none" ${INK} stroke-width="5"/>`;
}
export function sandwich() {
  return `<path d="M -70 0 L 70 0 L 60 -20 L -60 -20 Z" fill="${C.wood}" ${K3}/><path d="M -76 -20 L 76 -20 L 66 -34 L -66 -34 Z" fill="${C.olive}" ${K3}/><path d="M -70 -34 Q 0 -90 70 -34 Z" fill="${C.wood}" ${K3}/>`;
}
export function stopSign() {
  let p = "";
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; p += `${i ? "L" : "M"} ${(Math.cos(a) * 90).toFixed(1)} ${(Math.sin(a) * 90 - 260).toFixed(1)} `; }
  return `<path d="M 0 0 L 0 -180" ${INK} stroke-width="12"/><path d="${p}Z" fill="${C.red}" ${K}/>${txt(0, -256, "STOP", 44, C.white, { font: "bold" })}`;
}
export function timelineBar(label, from, to, x0, x1, col) {
  return `<rect x="${x0}" y="-30" width="${x1 - x0}" height="60" rx="12" fill="${col}" ${K3}/>${txt(x0 - 20, 4, String(from), 36, C.ink, { font: "bold", anchor: "end" })}${txt(x1 + 20, 4, String(to), 36, C.ink, { font: "bold", anchor: "start" })}${txt((x0 + x1) / 2, 4, label, 32, C.white, { font: "bold" })}`;
}
export function moonCoin() {
  return coin(70, "🚀".length ? "M" : "M") + txt(0, 104, "MOONCOIN", 30, C.ink, { font: "bold" });
}
