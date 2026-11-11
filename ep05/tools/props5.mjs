// Episode 5 props: the MINIMUM anchor, the card statement, the ostrich, the ladder and the hole,
// an old telephone and the debt snowball. Same ink, palette and line weight as the PesaBrain kit.
import { C, K, K3, at, txt } from "../../moneybrain/tools/kit.mjs";

const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;

// anchor hanging from (0,0) by a chain of length `chain`
export function anchor(label = "MINIMUM", chain = 0, o = {}) {
  let links = "";
  for (let y = 0; y < chain; y += 34) links += `<ellipse cx="0" cy="${y + 16}" rx="${y / 34 % 2 ? 7 : 14}" ry="18" fill="none" stroke="${C.grey}" stroke-width="8"/><ellipse cx="0" cy="${y + 16}" rx="${y / 34 % 2 ? 7 : 14}" ry="18" fill="none" ${INK} stroke-width="3"/>`;
  const col = o.color || "#5B6670";
  return `${links}<g transform="translate(0 ${chain})">
    <circle cx="0" cy="22" r="26" fill="none" stroke="${col}" stroke-width="16"/><circle cx="0" cy="22" r="26" fill="none" ${INK} stroke-width="4"/>
    <rect x="-16" y="46" width="32" height="250" fill="${col}" ${K}/><rect x="-90" y="90" width="180" height="30" rx="12" fill="${col}" ${K}/>
    <path d="M -170 220 Q -150 340 0 350 Q 150 340 170 220 L 200 250 L 190 180 L 120 200 L 150 220 Q 130 300 0 306 Q -130 300 -150 220 L -120 200 L -190 180 L -200 250 Z" fill="${col}" ${K}/>
    ${label ? `<rect x="-120" y="140" width="240" height="64" rx="10" fill="${C.white}" ${K3}/>${txt(0, 174, label, label.length > 8 ? 34 : 42, C.ink, { font: "bold" })}` : ""}</g>`;
}
// a credit-card statement standing on (0,0)
export function statement(o = {}) {
  const w = 520, h = 640;
  return `<rect x="${-w / 2 + 12}" y="${-h + 14}" width="${w}" height="${h}" fill="${C.ink}" opacity="0.15"/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${C.white}" ${K}/>
    <rect x="${-w / 2}" y="${-h}" width="${w}" height="90" fill="${C.slateDk}" ${K3}/>${txt(0, -h + 46, "CARD STATEMENT", 40, C.white, { font: "bold" })}
    ${txt(-w / 2 + 30, -h + 140, "BALANCE", 34, C.ink, { font: "mono", anchor: "start" })}${txt(w / 2 - 30, -h + 140, o.balance || "$6,000", 40, C.ink, { font: "bold", anchor: "end" })}
    ${txt(-w / 2 + 30, -h + 196, "APR", 34, C.ink, { font: "mono", anchor: "start" })}${txt(w / 2 - 30, -h + 196, "22%", 40, C.red, { font: "bold", anchor: "end" })}
    <rect x="${-w / 2 + 24}" y="${-h + 240}" width="${w - 48}" height="150" rx="12" fill="${C.gold}" ${K}/>
    ${txt(0, -h + 286, "MINIMUM DUE", 36, C.ink, { font: "bold" })}${txt(0, -h + 346, o.min || "$170", 76, C.ink, { font: "bold" })}
    <rect x="${-w / 2 + 40}" y="${-h + 430}" width="${w - 80}" height="150" fill="none" stroke="${C.grey}" stroke-width="3"/>
    ${txt(0, -h + 460, "MINIMUM PAYMENT WARNING", 20, C.grey, { font: "mono" })}${txt(0, -h + 500, "If you make only the", 20, C.grey, { font: "mono" })}${txt(0, -h + 530, "minimum payment...", 20, C.grey, { font: "mono" })}
    ${o.warn ? `<rect x="${-w / 2 + 40}" y="${-h + 430}" width="${w - 80}" height="150" fill="none" stroke="${C.red}" stroke-width="8"/>${txt(0, -h + 560, "20+ YEARS · ~$15,900", 26, C.red, { font: "bold" })}` : ""}`;
}
export function ostrich(o = {}) {
  return `<ellipse cx="0" cy="-200" rx="150" ry="100" fill="${C.ink}" ${K}/>
    <path d="M -110 -230 q -60 -40 -40 -90 q 30 20 60 50 M -60 -270 q -30 -60 10 -90 q 20 40 30 70" fill="${C.white}" ${K3}/>
    <path d="M 120 -220 Q 220 -180 240 -40" fill="none" stroke="${C.pink}" stroke-width="28" stroke-linecap="round"/><path d="M 120 -220 Q 220 -180 240 -40" fill="none" ${INK} stroke-width="4"/>
    <path d="M -40 -110 L -60 0 M 40 -110 L 60 0" stroke="${C.pink}" stroke-width="14" stroke-linecap="round"/>
    <path d="M -90 0 L -30 0 M 30 0 L 90 0" ${INK} stroke-width="8"/>
    <path d="M 160 -40 Q 240 -90 320 -40 L 330 0 L 150 0 Z" fill="#D9BE8A" ${K}/>
    ${o.label ? txt(240, -10, o.label, 28, C.ink, { font: "bold" }) : ""}`;
}
export function hole(w = 520) {
  return `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${w / 8}" fill="#3A3532" ${K}/><path d="M ${-w / 2} 0 Q 0 ${w / 2.2} ${w / 2} 0" fill="#3A3532" ${K}/>`;
}
export function ladder(h = 520, col = C.wood) {
  let rungs = "";
  for (let y = -40; y > -h; y -= 70) rungs += `<path d="M -50 ${y} L 50 ${y}" stroke="${col}" stroke-width="12"/><path d="M -50 ${y} L 50 ${y}" ${INK} stroke-width="3" fill="none"/>`;
  return `<path d="M -50 0 L -50 ${-h} M 50 0 L 50 ${-h}" stroke="${col}" stroke-width="16"/><path d="M -50 0 L -50 ${-h} M 50 0 L 50 ${-h}" ${INK} stroke-width="4" fill="none"/>${rungs}`;
}
export function telephone(o = {}) {
  return `<path d="M -160 0 L -130 -150 Q -120 -180 -90 -180 L 90 -180 Q 120 -180 130 -150 L 160 0 Z" fill="${o.col || C.red}" ${K}/>
    <circle cx="0" cy="-95" r="56" fill="${C.white}" ${K3}/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return `<circle cx="${(Math.cos(a) * 38).toFixed(1)}" cy="${(-95 + Math.sin(a) * 38).toFixed(1)}" r="8" fill="${C.grey}"/>`; }).join("")}
    <path d="M -150 -190 Q -150 -250 -90 -250 L 90 -250 Q 150 -250 150 -190 L 110 -180 Q 110 -210 80 -210 L -80 -210 Q -110 -210 -110 -180 Z" fill="${o.col || C.red}" ${K}/>`;
}
export const handset = () => `<path d="M -40 -40 Q -60 0 -40 40 L -10 40 Q -20 0 -10 -40 Z" fill="${C.red}" ${K3}/>`;
export function debtBall(label = "DEBT", r = 1) {
  return `<circle r="100" fill="#F2E3E0" ${K}/><path d="M -60 40 Q 0 90 70 40" fill="none" stroke="${C.pink}" stroke-width="12" stroke-linecap="round"/>
    <circle cx="-40" cy="-40" r="14" fill="${C.pink}" opacity="0.6"/>${txt(0, 10, label, label.length > 4 ? 42 : 56, C.red, { font: "bold" })}`;
}
export function avalancheHill(flip = false) {
  return `<g transform="${flip ? "scale(-1 1)" : ""}"><path d="M -360 0 L 0 -520 L 360 0 Z" fill="${C.slate}" ${K}/><path d="M -110 -360 L 0 -520 L 110 -360 Q 60 -330 30 -370 Q 0 -330 -40 -370 Q -70 -330 -110 -360 Z" fill="${C.white}" ${K3}/></g>`;
}
export function scale2(tilt, l, r) {
  return `<path d="M -40 0 L 0 -300 L 40 0 Z" fill="${C.wood}" ${K}/><g transform="translate(0 -300) rotate(${tilt})"><rect x="-300" y="-10" width="600" height="20" rx="8" fill="${C.woodDk}" ${K3}/>${at(-260, 0, 1, l)}${at(260, 0, 1, r)}</g>`;
}
