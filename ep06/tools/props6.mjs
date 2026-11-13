// Episode 6 props: the weather episode. Emergencies are storm clouds, the fund is an umbrella that grows,
// a brick wall stands between you and the debt trap. Same ink, palette and line weight as the PesaBrain kit.
import { C, K, K3, at, txt } from "../../moneybrain/tools/kit.mjs";

const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;

// an open umbrella; (0,0) = bottom of the handle. size 1 ≈ 360 wide
export function umbrella(label = "", o = {}) {
  const s = o.size || 1, col = o.color || C.red, r = 180 * s, top = -360 * s;
  const scal = [-1, -0.5, 0, 0.5, 1].map((k) => k * r);
  let edge = `M ${-r} ${top + r * 0.55}`;
  for (let i = 0; i < 4; i++) edge += ` Q ${(scal[i] + scal[i + 1]) / 2} ${top + r * 0.55 - 26 * s} ${scal[i + 1]} ${top + r * 0.55}`;
  return `<path d="M 0 ${top + r * 0.5} L 0 -26 Q 0 0 -26 0 Q -50 0 -50 -26" fill="none" ${INK} stroke-width="${8}"/>
    <path d="M ${-r} ${top + r * 0.55} Q ${-r} ${top - r * 0.2} 0 ${top - r * 0.25} Q ${r} ${top - r * 0.2} ${r} ${top + r * 0.55} ${edge.replace(/^M [^Q]+/, "")}" fill="${col}" ${K}/>
    <path d="M 0 ${top - r * 0.25} Q ${-r * 0.4} ${top + r * 0.1} ${-r * 0.5} ${top + r * 0.55} M 0 ${top - r * 0.25} Q ${r * 0.4} ${top + r * 0.1} ${r * 0.5} ${top + r * 0.55}" fill="none" ${K3}/>
    <path d="M 0 ${top - r * 0.25} L 0 ${top - r * 0.25 - 26}" ${INK} stroke-width="8"/>
    ${label ? txt(0, top + r * 0.18, label, o.font || Math.round(40 * s), C.white, { font: "bold" }) : ""}`;
}
// a rain cloud centred on (0,0) with optional label and rain
export function raincloud(label = "", o = {}) {
  const col = o.dark ? "#8C8A86" : C.grey;
  const drops = o.rain === false ? "" : [-110, -50, 10, 70, 130].map((x, i) => `<path d="M ${x} ${60 + (i % 2) * 30} l -12 40" stroke="${C.slateDk}" stroke-width="8" stroke-linecap="round"/>`).join("");
  return `${drops}<g fill="${col}" ${K}><circle cx="-90" cy="-10" r="62"/><circle cx="0" cy="-60" r="86"/><circle cx="100" cy="-14" r="66"/><rect x="-150" y="-10" width="320" height="64" rx="30"/></g>
    <path d="M -150 -6 L 170 -6" stroke="${col}" stroke-width="54"/>${label ? txt(10, 0, label, o.size || 40, C.ink, { font: "bold" }) : ""}`;
}
// a brick wall standing on (0,0)
export function brickWall(w = 520, h = 300, label = "") {
  let b = "";
  const bw = 104, bh = 50;
  for (let r = 0; r * bh < h; r++) for (let x = -w / 2 - (r % 2 ? bw / 2 : 0); x < w / 2; x += bw) {
    const x0 = Math.max(x, -w / 2), x1 = Math.min(x + bw, w / 2);
    if (x1 - x0 > 8) b += `<rect x="${x0}" y="${-(r + 1) * bh}" width="${x1 - x0}" height="${bh}" fill="${r % 3 === 1 ? C.terra : "#C47E5C"}" ${K3}/>`;
  }
  return b + `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="none" ${K}/>` + (label ? `<rect x="${-150}" y="${-h / 2 - 34}" width="300" height="68" rx="10" fill="${C.white}" ${K3}/>${txt(0, -h / 2 + 2, label, 38, C.ink, { font: "bold" })}` : "");
}
// a mechanic's clipboard bill
export function repairBill(total = "$1,200") {
  return `<rect x="-150" y="-380" width="300" height="380" rx="14" fill="${C.wood}" ${K}/><rect x="-124" y="-350" width="248" height="330" fill="${C.white}" ${K3}/>
    <rect x="-50" y="-396" width="100" height="40" rx="10" fill="${C.grey}" ${K3}/>
    ${txt(0, -310, "REPAIR", 34, C.ink, { font: "bold" })}${[0, 1, 2].map((i) => `<path d="M -100 ${-260 + i * 40} L 100 ${-260 + i * 40}" stroke="${C.grey}" stroke-width="6"/>`).join("")}
    <path d="M -100 -130 L 100 -130" stroke="${C.ink}" stroke-width="4"/>${txt(0, -80, total, 54, C.red, { font: "bold" })}`;
}
// a wrench
export const wrench = () => `<path d="M -120 20 L 60 -160" stroke="${C.grey}" stroke-width="34" stroke-linecap="round"/><path d="M -120 20 L 60 -160" fill="none" ${INK} stroke-width="5"/>
  <path d="M 40 -180 a 50 50 0 1 1 60 60 l -24 -24 l 20 -20 l -20 -20 l -20 20 Z" fill="${C.grey}" ${K}/>`;
// a 3-level fund tank; level 0..1, marks at levels
export function fundTank(level = 0.3, labels = ["$1,000", "1 MONTH", "3–6 MONTHS"], marks = [0.2, 0.45, 0.95], o = {}) {
  const w = 300, h = 560, fy = -h * level;
  return `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="30" fill="${C.white}" ${K}/>
    <rect ${o.fillId ? `id="${o.fillId}"` : ""} x="${-w / 2 + 8}" y="${fy}" width="${w - 16}" height="${Math.max(0, -fy - 8)}" rx="22" fill="${C.slate}"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="30" fill="none" ${K}/>
    ${marks.map((m, i) => `<path d="M ${w / 2 - 6} ${-h * m} L ${w / 2 + 30} ${-h * m}" ${INK} stroke-width="6"/>${txt(w / 2 + 44, -h * m + 4, labels[i] || "", 34, C.ink, { font: "bold", anchor: "start" })}`).join("")}`;
}
// rose-tinted glasses (centre between lenses)
export const roseGlasses = (s = 1) => `<g transform="scale(${s})"><circle cx="-38" cy="0" r="30" fill="${C.pink}" opacity="0.75" ${K3}/><circle cx="38" cy="0" r="30" fill="${C.pink}" opacity="0.75" ${K3}/><path d="M -8 -4 Q 0 -12 8 -4" fill="none" ${K3}/></g>`;
// a labelled envelope with a tiny family photo on it
export function photoEnvelope(label = "SAVINGS", photo = true) {
  return `<rect x="-160" y="-200" width="320" height="200" fill="${C.white}" ${K}/><path d="M -160 -200 L 0 -110 L 160 -200" fill="none" ${K3}/>
    ${photo ? `<rect x="40" y="-90" width="90" height="70" fill="${C.slate}" ${K3}/><circle cx="70" cy="-62" r="12" fill="${C.bean}" ${K3}/><circle cx="100" cy="-58" r="10" fill="${C.bean}" ${K3}/>` : ""}
    ${txt(photo ? -50 : 0, -50, label, 30, C.ink, { font: "bold" })}`;
}
// a car with a "clunk" noise and a small smoke puff
export const clunk = (t = "clunk!") => `<path d="M -40 -20 q -20 -20 0 -40 q 20 -20 0 -40" fill="none" stroke="${C.grey}" stroke-width="10" stroke-linecap="round"/>${txt(60, -70, t, 54, C.ink, { font: "hand", rot: -10 })}`;
// an account card in a banking app, with a name
export function accountCard(name, amount, col = C.olive) {
  return `<rect x="-230" y="-80" width="460" height="160" rx="22" fill="${C.white}" ${K}/><rect x="-230" y="-80" width="24" height="160" rx="10" fill="${col}"/>
    ${txt(-190, -30, name, 34, C.ink, { font: "bold", anchor: "start" })}${txt(-190, 34, amount, 46, col === C.olive ? C.oliveDk : C.ink, { font: "bold", anchor: "start" })}`;
}
// a padlock
export const padlock = () => `<path d="M -50 -110 L -50 -150 Q -50 -200 0 -200 Q 50 -200 50 -150 L 50 -110" fill="none" stroke="${C.grey}" stroke-width="22"/><path d="M -50 -110 L -50 -150 Q -50 -200 0 -200 Q 50 -200 50 -150 L 50 -110" fill="none" ${K3}/>
  <rect x="-80" y="-120" width="160" height="120" rx="18" fill="${C.gold}" ${K}/><circle cx="0" cy="-70" r="14" fill="${C.ink}"/><path d="M 0 -64 L 0 -34" ${INK} stroke-width="10"/>`;
// melting ice cube (inflation eating idle cash)
export const iceCube = (label = "$") => `<path d="M -120 0 Q -150 -10 -90 -14 L 90 -14 Q 150 -10 120 0 Z" fill="#BFE0F0" ${K3}/><rect x="-90" y="-180" width="180" height="170" rx="20" fill="#DCEFF7" ${K}/>
  <path d="M -60 -150 L -20 -150" stroke="${C.white}" stroke-width="10" stroke-linecap="round"/>${txt(0, -86, label, 70, C.slateDk, { font: "bold" })}<path d="M 60 -10 q 6 30 0 40" fill="none" stroke="#BFE0F0" stroke-width="10" stroke-linecap="round"/>`;
