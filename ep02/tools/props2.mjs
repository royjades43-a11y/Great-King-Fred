// Episode 2 props: the magic-show stage, trick cards, the runaway finish line and the social feed.
// Same ink, palette and line weight as the PesaBrain kit.
import { C, K, K3, at, txt, house, car, star, heart } from "../../moneybrain/tools/kit.mjs";

const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;
export const CURTAIN = "#9E3B2C", CURTAIN_DK = "#7A2C21", STAGE = "#2E2925";

export function curtain(side = 1, h = 1080, w = 560) {
  // one curtain panel; side -1 = left, 1 = right. Drawn from x=0 outward.
  let folds = "";
  for (let i = 1; i < 6; i++) folds += `<path d="M ${side * i * (w / 6)} 0 Q ${side * (i * (w / 6) + 18)} ${h / 2} ${side * i * (w / 6)} ${h}" fill="none" stroke="${CURTAIN_DK}" stroke-width="10"/>`;
  return `<path d="M 0 0 L ${side * w} 0 L ${side * w} ${h} L 0 ${h} Q ${side * 40} ${h / 2} 0 0 Z" fill="${CURTAIN}" ${K}/>${folds}
    <path d="M ${side * w} ${h * 0.55} Q ${side * (w - 60)} ${h * 0.6} ${side * (w - 20)} ${h * 0.7}" fill="none" stroke="${C.gold}" stroke-width="10"/>`;
}
export function valance(w = 1920) {
  let scallops = "";
  for (let x = 0; x < w; x += 160) scallops += `<path d="M ${x} 90 Q ${x + 80} 150 ${x + 160} 90" fill="${CURTAIN}" ${K}/>`;
  return `${scallops}<rect x="0" y="0" width="${w}" height="96" fill="${CURTAIN}" ${K}/><path d="M 0 80 L ${w} 80" stroke="${C.gold}" stroke-width="8"/>`;
}
export function stage(w = 1920, h = 1080) {
  return `<rect width="${w}" height="${h}" fill="${STAGE}"/>
    <path d="M 0 860 L ${w} 860 L ${w} ${h} L 0 ${h} Z" fill="${C.woodDk}"/>
    ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M ${-200 + i * 380} 860 L ${-600 + i * 520} ${h}" stroke="${C.wood}" stroke-width="4"/>`).join("")}
    <path d="M 0 860 L ${w} 860" ${K}/>`;
}
export const spotlight = (x = 960, top = 0, bottom = 900, r = 330) =>
  `<path d="M ${x - 60} ${top} L ${x + 60} ${top} L ${x + r} ${bottom} L ${x - r} ${bottom} Z" fill="${C.gold}" opacity="0.22"/><ellipse cx="${x}" cy="${bottom}" rx="${r}" ry="50" fill="${C.gold}" opacity="0.35"/>`;

export function topHat(s = 1) {
  return `<g transform="scale(${s})"><ellipse cx="0" cy="0" rx="92" ry="20" fill="${C.ink}"/><path d="M -62 -4 L -56 -150 L 56 -150 L 62 -4 Z" fill="${C.ink}"/>
    <rect x="-60" y="-50" width="120" height="22" fill="${C.red}"/><ellipse cx="0" cy="-150" rx="56" ry="12" fill="#3A3532"/></g>`;
}
export const wand = () => `<path d="M 0 0 L 150 -150" stroke="${C.ink}" stroke-width="14" stroke-linecap="round"/><path d="M 120 -120 L 150 -150" stroke="${C.white}" stroke-width="14" stroke-linecap="round"/>` + at(162, -162, 0.7, star(30, C.gold));

export function playingCard(num, lines = [], o = {}) {
  const w = o.w || 380, h = o.h || 520, suit = o.suit || "$";
  return `<rect x="${-w / 2 + 10}" y="${-h / 2 + 12}" width="${w}" height="${h}" rx="26" fill="${C.ink}" opacity="0.3"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="26" fill="${C.white}" ${K}/>
    <rect x="${-w / 2 + 20}" y="${-h / 2 + 20}" width="${w - 40}" height="${h - 40}" rx="16" fill="none" stroke="${o.color || C.red}" stroke-width="5"/>
    ${txt(-w / 2 + 52, -h / 2 + 62, num, 50, o.color || C.red, { font: "bold" })}${txt(-w / 2 + 52, -h / 2 + 112, suit, 44, o.color || C.red, { font: "bold" })}
    <g transform="rotate(180)">${txt(-w / 2 + 52, -h / 2 + 62, num, 50, o.color || C.red, { font: "bold" })}${txt(-w / 2 + 52, -h / 2 + 112, suit, 44, o.color || C.red, { font: "bold" })}</g>
    ${txt(0, -70, "TRICK", 40, C.ink, { font: "mono" })}
    ${(() => { const sz = o.size || Math.min(58, Math.floor((w - 70) / (Math.max(...lines.map((l) => l.length)) * 0.74))); return lines.map((l, i) => txt(0, -10 + i * (sz + 10), l, sz, C.ink, { font: "bold" })).join(""); })()}`;
}
export function cardBack(o = {}) {
  const w = o.w || 380, h = o.h || 520;
  let dots = "";
  for (let y = -h / 2 + 50; y < h / 2 - 30; y += 46) for (let x = -w / 2 + 50; x < w / 2 - 30; x += 46) dots += `<circle cx="${x}" cy="${y}" r="8" fill="${CURTAIN_DK}"/>`;
  return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="26" fill="${CURTAIN}" ${K}/>${dots}<rect x="${-w / 2 + 20}" y="${-h / 2 + 20}" width="${w - 40}" height="${h - 40}" rx="16" fill="none" stroke="${C.gold}" stroke-width="5"/>`;
}

// the runaway finish line: two posts + a ribbon with a word on it; stands on (0,0), centred
export function finishLine(label = "RICH", o = {}) {
  const w = o.w || 560, h = o.h || 330, col = o.color || C.mustard;
  let checks = "";
  for (let i = 0; i < 6; i++) checks += `<rect x="${-w / 2 - 16 + (i % 2) * 16}" y="${-h - 40 + Math.floor(i / 2) * 16}" width="16" height="16" fill="${C.ink}"/>`;
  return `<path d="M ${-w / 2} 0 L ${-w / 2} ${-h - 60} M ${w / 2} 0 L ${w / 2} ${-h - 60}" ${INK} stroke-width="12"/>
    <path d="M ${-w / 2} ${-h - 60} L ${-w / 2 - 70} ${-h - 46} L ${-w / 2} ${-h - 30} Z M ${w / 2} ${-h - 60} L ${w / 2 + 70} ${-h - 46} L ${w / 2} ${-h - 30} Z" fill="${C.red}" ${K3}/>
    <path d="M ${-w / 2} ${-h + 10} Q 0 ${-h + 40} ${w / 2} ${-h + 10} L ${w / 2} ${-h + 80} Q 0 ${-h + 110} ${-w / 2} ${-h + 80} Z" fill="${col}" ${K}/>
    ${txt(0, -h + 66, label, o.size || 64, o.ink || C.ink, { font: "bold" })}
    ${o.nails ? `<path d="M ${-w / 2 - 24} 0 L ${-w / 2 + 24} 0 M ${w / 2 - 24} 0 L ${w / 2 + 24} 0" ${INK} stroke-width="14"/>` + [-w / 2, w / 2].map((x) => `<circle cx="${x}" cy="${-h + 46}" r="10" fill="${C.grey}" ${K3}/>`).join("") : ""}`;
}

// a social-media post card, centred on (0,0)
export function post(kind, o = {}) {
  const w = 360, h = 440;
  const scenes = {
    vacation: `<rect x="-160" y="-130" width="320" height="230" fill="${C.slate}"/><rect x="-160" y="40" width="320" height="60" fill="#E8D3A2"/>
      <circle cx="90" cy="-70" r="34" fill="${C.gold}"/><path d="M -60 60 Q -50 -20 -70 -80 M -70 -80 q -50 -10 -70 20 M -70 -80 q 40 -30 70 0 M -70 -80 q -20 -40 -60 -40 M -70 -80 q 30 -50 70 -30" fill="none" stroke="${C.oliveDk}" stroke-width="10" stroke-linecap="round"/>`,
    car: `<rect x="-160" y="-130" width="320" height="230" fill="#E9DCC0"/>${at(0, 60, 0.62, car({ color: C.gold, shiny: true }))}`,
    kitchen: `<rect x="-160" y="-130" width="320" height="230" fill="${C.white}"/><rect x="-140" y="-20" width="280" height="100" fill="${C.olive}" ${K3}/><rect x="-150" y="-36" width="300" height="20" fill="${C.grey}" ${K3}/>
      <rect x="-120" y="-120" width="90" height="60" fill="${C.slate}" ${K3}/><rect x="40" y="-120" width="90" height="60" fill="${C.slate}" ${K3}/>${[-100, -30, 40, 110].map((x) => `<path d="M ${x} 10 L ${x + 30} 10" ${K3}/>`).join("")}`,
    house: `<rect x="-160" y="-130" width="320" height="230" fill="#DDE7D0"/>${at(0, 90, 0.62, house({ color: C.terra }))}`,
    statement: `<rect x="-160" y="-130" width="320" height="230" fill="${C.white}"/>${txt(0, -80, "CARD STATEMENT", 28, C.ink, { font: "bold" })}${txt(0, -10, "BALANCE", 30, C.ink, { font: "mono" })}${txt(0, 50, "$18,400", 60, C.red, { font: "bold" })}`,
  };
  return `<rect x="${-w / 2 + 8}" y="${-h / 2 + 10}" width="${w}" height="${h}" rx="18" fill="${C.ink}" opacity="0.2"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="${C.white}" ${K}/>
    <circle cx="${-w / 2 + 38}" cy="${-h / 2 + 36}" r="18" fill="${o.who || C.olive}" ${K3}/><rect x="${-w / 2 + 66}" y="${-h / 2 + 28}" width="130" height="14" rx="7" fill="${C.grey}"/>
    <g transform="translate(0 ${-h / 2 + 200})"><clipPath id="clp-${kind}-${o.id || 0}"><rect x="-160" y="-130" width="320" height="230"/></clipPath><g clip-path="url(#clp-${kind}-${o.id || 0})">${scenes[kind]}</g><rect x="-160" y="-130" width="320" height="230" fill="none" ${K3}/></g>
    ${at(-w / 2 + 40, h / 2 - 40, 0.7, heart(1, C.red))}${txt(-w / 2 + 72, h / 2 - 38, o.likes || "2,481", 30, C.ink, { font: "bold", anchor: "start" })}
    ${o.caption ? txt(40, h / 2 - 38, o.caption, 26, C.ink, { anchor: "start" }) : ""}`;
}

export function couch(col = C.slateDk) {
  return `<rect x="-230" y="-170" width="460" height="110" rx="30" fill="${col}" ${K}/><rect x="-230" y="-80" width="460" height="70" rx="16" fill="${col}" ${K}/>
    <rect x="-270" y="-130" width="70" height="120" rx="30" fill="${col}" ${K}/><rect x="200" y="-130" width="70" height="120" rx="30" fill="${col}" ${K}/>
    <path d="M 0 -160 L 0 -80" stroke="${C.ink}" stroke-width="4"/><path d="M -200 -10 L -200 6 M 200 -10 L 200 6" ${INK} stroke-width="8"/>`;
}
export function cushion(label = "CASH BUFFER") {
  return `<path d="M -230 0 Q -250 -60 -200 -80 L 200 -80 Q 250 -60 230 0 Q 250 30 200 40 L -200 40 Q -250 30 -230 0 Z" fill="${C.olive}" ${K}/>
    ${[-120, 0, 120].map((x) => `<circle cx="${x}" cy="-20" r="7" fill="${C.oliveDk}"/>`).join("")}${txt(0, 6, label, 40, C.ink, { font: "bold" })}`;
}
export function anvil(label = "EMERGENCY") {
  return `<path d="M -150 -150 L 150 -150 L 120 -100 L 60 -90 L 60 -40 L 110 0 L -110 0 L -60 -40 L -60 -90 L -180 -110 Z" fill="#4E4A47" ${K}/>${txt(0, -120, label, 26, C.white, { font: "bold" })}`;
}
export function tapeMeasure(len = 300) {
  let t = "";
  for (let x = 0; x <= len; x += 20) t += `<path d="M ${x} -18 L ${x} ${x % 100 ? -8 : 2}" stroke="${C.ink}" stroke-width="3"/>`;
  return `<rect x="0" y="-20" width="${len}" height="34" fill="${C.gold}" ${K3}/>${t}<rect x="-70" y="-50" width="80" height="90" rx="16" fill="${C.red}" ${K}/>`;
}
export function quotePoster(lines, author) {
  const h = lines.length * 70 + 170;
  return `<rect x="-520" y="${-h / 2}" width="1040" height="${h}" rx="10" fill="${C.white}" ${K}/>
    ${txt(-470, -h / 2 + 70, "“", 140, C.terra, { font: "bold", anchor: "start" })}
    ${lines.map((l, i) => `<text class="ql" x="0" y="${-h / 2 + 100 + i * 70}" font-family="Patrick Hand" font-size="58" fill="${C.ink}" text-anchor="middle" dominant-baseline="middle">${l}</text>`).join("")}
    ${txt(440, h / 2 - 40, "— " + author, 36, C.ink, { font: "bold", anchor: "end" })}`;
}
export function brick(label = "") {
  return `<rect x="-60" y="-34" width="120" height="68" rx="6" fill="${C.gold}" ${K3}/>${label ? txt(0, 3, label, 26, C.ink, { font: "bold" }) : ""}`;
}
export function scoreboard(a, b) {
  return `<rect x="-300" y="-150" width="600" height="300" rx="20" fill="${C.ink}" ${K}/><rect x="-270" y="-120" width="250" height="200" fill="#1A1714"/><rect x="20" y="-120" width="250" height="200" fill="#1A1714"/>
    ${txt(-145, -20, a, 130, C.gold, { font: "mono" })}${txt(145, -20, b, 130, C.gold, { font: "mono" })}${txt(-145, 110, "YOU", 32, C.white, { font: "bold" })}${txt(145, 110, "THE FEED", 32, C.white, { font: "bold" })}`;
}
