// Big thumbnail characters, drawn natively at 1920×1080 scale in the PesaBrain look:
// flat fills from the brand palette, ink outlines, round caps. Every function draws around (0,0) = the character's ground point.
import { C, at, bean } from "../moneybrain/tools/kit.mjs";

const W = 12; // outline weight at thumbnail scale
const I = (w = W) => `stroke="${C.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
export const shadow = (rx, x = 0) => `<ellipse cx="${x}" cy="6" rx="${rx}" ry="${rx * 0.09}" fill="${C.ink}" opacity="0.14"/>`;

// ---------- faces (centre between the eyes) ----------
const eye = (x, o = {}) => `<ellipse cx="${x}" cy="0" rx="${o.rx || 26}" ry="${o.ry || 32}" fill="${C.white}" ${I(8)}/><circle cx="${x + (o.dx || 0)}" cy="${o.dy || 4}" r="${o.p || 13}" fill="${C.ink}"/><circle cx="${x + (o.dx || 0) + 5}" cy="${(o.dy || 4) - 5}" r="4" fill="${C.white}"/>`;
const arcEye = (x, up = true) => `<path d="M ${x - 26} ${up ? 8 : -6} Q ${x} ${up ? -26 : 20} ${x + 26} ${up ? 8 : -6}" fill="none" ${I(10)}/>`;
const sweat = (x, y, s = 1) => `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -30 Q 22 0 14 14 Q 0 28 -14 14 Q -22 0 0 -30 Z" fill="#BFE0F0" ${I(6)}/>`;
const blush = (d = 70, y = 44) => `<ellipse cx="${-d}" cy="${y}" rx="22" ry="12" fill="${C.pink}" opacity="0.75"/><ellipse cx="${d}" cy="${y}" rx="22" ry="12" fill="${C.pink}" opacity="0.75"/>`;
export function face(type, s = 1) {
  let f = "";
  if (type === "worried") f = eye(-46, { dy: 8 }) + eye(46, { dy: 8 }) + `<path d="M -76 -52 L -24 -40 M 76 -52 L 24 -40" ${I(9)}/><path d="M -34 76 Q -18 60 0 72 Q 18 84 34 68" fill="none" ${I(9)}/>` + sweat(98, -30);
  if (type === "innocent") f = eye(-46, { dy: -6, dx: -4 }) + eye(46, { dy: -6, dx: -4 }) + `<path d="M -74 -54 Q -46 -70 -20 -54 M 74 -54 Q 46 -70 20 -54" fill="none" ${I(9)}/><path d="M -22 70 Q 0 60 22 70" fill="none" ${I(9)}/>` + sweat(96, -36);
  if (type === "smug") f = eye(-46, { dy: 10 }) + eye(46, { dy: 10 }) + `<path d="M -76 -6 L -16 -2 M 76 -6 L 16 -2" ${I(10)}/><path d="M -40 66 Q 10 92 46 52" fill="none" ${I(10)}/>`;
  if (type === "sweet") f = arcEye(-46) + arcEye(46) + `<path d="M -54 46 Q 0 110 54 46 Z" fill="${C.ink}" ${I(8)}/><path d="M -34 56 L 34 56 L 30 66 L -30 66 Z" fill="${C.white}"/>` + blush(84, 30) + sweat(104, -46, 0.8);
  if (type === "happy") f = arcEye(-46) + arcEye(46) + `<path d="M -50 40 Q 0 104 50 40 Z" fill="${C.ink}" ${I(8)}/><path d="M -22 74 Q 0 62 22 74" fill="${C.pink}"/>` + blush(84, 30);
  if (type === "content") f = arcEye(-46, false) + arcEye(46, false) + `<path d="M -30 50 Q 0 72 30 50" fill="none" ${I(9)}/>` + blush(84, 34);
  if (type === "sleepy") f = `<path d="M -70 4 Q -46 20 -22 4 M 22 4 Q 46 20 70 4" fill="none" ${I(10)}/><ellipse cx="0" cy="62" rx="14" ry="18" fill="${C.ink}"/>` + blush(84, 34);
  if (type === "shocked") f = eye(-46, { p: 8, ry: 36 }) + eye(46, { p: 8, ry: 36 }) + `<path d="M -76 -64 Q -46 -84 -18 -64 M 76 -64 Q 46 -84 18 -64" fill="none" ${I(9)}/><ellipse cx="0" cy="76" rx="22" ry="28" fill="${C.ink}"/>` + sweat(100, -40);
  if (type === "confident") f = eye(-46, { dy: 6 }) + eye(46, { dy: 6 }) + `<path d="M -76 -46 L -20 -32 M 76 -46 L 20 -32" ${I(10)}/><path d="M -46 48 Q 0 96 46 48 Z" fill="${C.ink}" ${I(8)}/><path d="M -30 56 L 30 56 L 26 66 L -26 66 Z" fill="${C.white}"/>`;
  if (type === "hopeful") f = eye(-46, { dy: -8, ry: 34 }) + eye(46, { dy: -8, ry: 34 }) + `<path d="M -74 -60 Q -46 -74 -20 -58 M 74 -60 Q 46 -74 20 -58" fill="none" ${I(9)}/><path d="M -36 54 Q 0 86 36 54" fill="none" ${I(10)}/>` + blush(84, 40);
  return `<g transform="scale(${s})">${f}</g>`;
}
const arm = (d, hand = true) => `<path d="${d}" fill="none" ${I(14)}/>` ;
const mitt = (x, y, r = 22) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.white}" ${I(9)}/>`;
const legs = (xs, top, col = C.ink) => xs.map((x) => `<path d="M ${x} ${top} L ${x} -20" ${I(14)}/><path d="M ${x - 6} -16 L ${x + 36} -16" stroke="${C.terra}" stroke-width="26" stroke-linecap="round"/><path d="M ${x - 6} -16 L ${x + 36} -16" fill="none" ${I(6)}/>`).join("");
const sparkle = (x, y, s = 1, col = C.gold) => `<path transform="translate(${x} ${y}) scale(${s})" d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill="${col}" ${I(6)}/>`;

// ---------- EP01 ----------
export function coffeeCup() { // hands up: "Wasn't me!"
  return shadow(240) + `
    ${legs([-70, 50], -60)}
    <path d="M -230 -720 L 230 -720 L 180 -60 L -180 -60 Z" fill="${C.white}" ${I()}/>
    <path d="M -214 -500 L 214 -500 L 200 -300 L -200 -300 Z" fill="${C.terra}" ${I(9)}/>
    <circle cx="0" cy="-400" r="46" fill="${C.white}" opacity="0.9"/>
    <rect x="-270" y="-800" width="540" height="96" rx="32" fill="${C.oliveDk}" ${I()}/>
    <path d="M -80 -840 q -30 -50 0 -100 M 40 -840 q -30 -50 0 -100" fill="none" stroke="${C.grey}" stroke-width="16" stroke-linecap="round"/>
    ${arm("M -214 -560 Q -320 -600 -330 -760")}${mitt(-330, -780, 30)}${arm("M 214 -560 Q 320 -600 330 -760")}${mitt(330, -780, 30)}
    <g transform="translate(0 -620)">${face("innocent", 1.25)}</g>`;
}
export function smugCar() { // sunglasses, price tag on the mirror
  return shadow(380) + `
    <path d="M -380 -90 L -380 -230 Q -372 -270 -320 -280 L -210 -292 L -120 -420 Q -96 -450 -44 -450 L 150 -450 Q 196 -450 226 -414 L 300 -292 L 370 -280 Q 404 -270 404 -230 L 404 -90 Z" fill="${C.red}" ${I()}/>
    <path d="M -170 -300 L -96 -404 L 150 -404 Q 180 -404 198 -380 L 262 -300 Z" fill="${C.slate}" ${I(9)}/>
    <g transform="translate(40 -350)"><rect x="-130" y="-40" width="110" height="64" rx="22" fill="${C.ink}"/><rect x="20" y="-40" width="110" height="64" rx="22" fill="${C.ink}"/><path d="M -20 -20 L 20 -20" ${I(10)}/><path d="M -100 -24 L -60 -24" stroke="${C.white}" stroke-width="8" stroke-linecap="round" opacity="0.6"/></g>
    <path d="M -30 -200 Q 40 -150 120 -210" fill="none" ${I(12)}/>
    <circle cx="-230" cy="-90" r="84" fill="${C.ink}"/><circle cx="-230" cy="-90" r="34" fill="${C.grey}"/>
    <circle cx="250" cy="-90" r="84" fill="${C.ink}"/><circle cx="250" cy="-90" r="34" fill="${C.grey}"/>
    <rect x="330" y="-250" width="60" height="40" rx="10" fill="${C.gold}" ${I(8)}/><rect x="-370" y="-250" width="50" height="40" rx="10" fill="${C.white}" ${I(8)}/>
    ${sparkle(-300, -400, 1.1)}${sparkle(330, -470, 0.9)}`;
}
export function chillBean() { // keeps the coffee, scissors in the other hand
  const sc = `<g transform="rotate(-30)"><circle cx="-26" cy="40" r="22" fill="none" stroke="${C.terra}" stroke-width="12"/><circle cx="26" cy="40" r="22" fill="none" stroke="${C.terra}" stroke-width="12"/><path d="M -14 22 L 30 -110 L 40 -100 L 6 24 Z M 14 22 L -30 -110 L -40 -100 L -6 24 Z" fill="${C.grey}" ${I(6)}/></g>`;
  return at(0, 0, 2.05, bean({ pose: "hold", face: "content", noShadow: true })) + shadow(200) +
    `<g transform="translate(-150 -380) scale(1.25)">${cupSmall()}</g><g transform="translate(160 -350) scale(1.0)">${sc}</g>`;
}
function cupSmall() { return `<path d="M -52 -150 L 52 -150 L 42 0 L -42 0 Z" fill="${C.white}" ${I(8)}/><path d="M -49 -110 L 49 -110 L 45 -50 L -45 -50 Z" fill="${C.terra}" ${I(6)}/><rect x="-60" y="-170" width="120" height="24" rx="8" fill="${C.oliveDk}" ${I(6)}/>`; }

// ---------- EP02 ----------
export function treadmillBean() { // chasing a dollar dangling from a stick on its own head
  return `<path d="M -430 -40 L 300 -40 Q 350 -40 350 0 Q 350 40 300 40 L -430 40 Q -480 40 -480 0 Q -480 -40 -430 -40 Z" fill="${C.ink}"/>
    <path d="M -420 -12 L 290 -12" stroke="${C.grey}" stroke-width="8" stroke-dasharray="40 34"/>
    <path d="M 290 -40 L 380 -560" fill="none" ${I(18)}/><rect x="320" y="-640" width="190" height="100" rx="14" fill="${C.slateDk}" ${I(9)}/>
    ${at(-60, -40, 2.4, bean({ pose: "cheer", face: "worried", sweat: true, noShadow: true }))}
    <path d="M -60 -900 Q 140 -1010 330 -860" fill="none" stroke="${C.wood}" stroke-width="22" stroke-linecap="round"/><path d="M -60 -900 Q 140 -1010 330 -860" fill="none" ${I(5)}/>
    <path d="M 330 -860 L 330 -700" stroke="${C.ink}" stroke-width="5"/>
    <g transform="translate(330 -640) rotate(8)"><rect x="-110" y="-60" width="220" height="120" rx="12" fill="${C.olive}" ${I(9)}/><circle r="38" fill="none" ${I(7)}/><text x="0" y="16" font-family="Archivo Black" font-size="56" text-anchor="middle" fill="${C.ink}">$</text></g>
    <path d="M -380 -380 L -520 -380 M -400 -300 L -560 -300 M -380 -220 L -500 -220" stroke="${C.ink}" stroke-width="10" stroke-linecap="round" opacity="0.5"/>`;
}
export function runawayFinish() { // the finish line, running away
  return shadow(300) + legs([-170, 190], -330).replace(/M (-?\d+) -16 L (-?\d+) -16/g, (m, a, b) => `M ${a} -16 L ${+a + 46} -16`) + `
    <path d="M -230 -340 L -230 -580 M 250 -340 L 250 -580" ${I(26)}/><path d="M -230 -340 L -230 -580 M 250 -340 L 250 -580" stroke="${C.wood}" stroke-width="10" stroke-linecap="round"/>
    <path d="M -340 -1000 L 360 -1000 L 360 -560 L -340 -560 Z" fill="${C.white}" ${I()}/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<rect x="${-340 + i * 70}" y="-1000" width="35" height="35" fill="${C.ink}"/><rect x="${-305 + i * 70}" y="-965" width="35" height="35" fill="${C.ink}"/>`).join("")}
    <text x="10" y="-845" font-family="Archivo Black" font-size="96" text-anchor="middle" fill="${C.ink}">FINISH</text>
    <g transform="translate(10 -700)">${face("smug", 0.95)}</g>
    <path d="M -400 -500 L -560 -500 M -420 -420 L -620 -420 M -400 -340 L -540 -340" stroke="${C.ink}" stroke-width="12" stroke-linecap="round" opacity="0.5"/>`;
}
export function hammockPiggy() {
  return `<path d="M -440 -620 L -440 0 M 440 -620 L 440 0" ${I(22)}/><path d="M -440 -620 L -440 0 M 440 -620 L 440 0" stroke="${C.wood}" stroke-width="8"/>${shadow(460)}
    <path d="M -440 -560 Q 0 -150 440 -560" fill="none" stroke="${C.terra}" stroke-width="90"/><path d="M -440 -515 Q 0 -105 440 -515 M -440 -605 Q 0 -195 440 -605" fill="none" ${I(10)}/>
    <g transform="translate(0 -470) rotate(-8)">
      <ellipse cx="0" cy="0" rx="330" ry="200" fill="${C.pink}" ${I()}/>
      <path d="M 120 -170 L 170 -270 L 220 -150 Z M -60 -190 L -40 -290 L 30 -190 Z" fill="${C.pink}" ${I(10)}/>
      <ellipse cx="310" cy="20" rx="70" ry="80" fill="${C.pink}" ${I(10)}/><ellipse cx="292" cy="16" rx="12" ry="16" fill="${C.ink}"/><ellipse cx="330" cy="16" rx="12" ry="16" fill="${C.ink}"/>
      <rect x="-80" y="-205" width="150" height="26" rx="12" fill="${C.ink}"/>
      <path d="M -330 0 q -70 -20 -50 -80 q 40 -20 30 30" fill="none" ${I(10)}/>
      <g transform="translate(130 -50)">${face("content", 1.0).replace(/<path d="M -30 50[^>]*>/, "")}</g>
    </g>
    <text x="280" y="-890" font-family="Patrick Hand" font-size="90" fill="${C.ink}">z</text><text x="350" y="-960" font-family="Patrick Hand" font-size="70" fill="${C.ink}">z</text>`;
}

// ---------- EP03 ----------
export function crownSnail() {
  return shadow(420) + `
    <path d="M -420 0 Q -440 -90 -330 -100 L 330 -100 Q 470 -100 470 -260 L 470 -420 Q 470 -520 380 -520 Q 290 -520 290 -420 L 290 -100" fill="${C.olive}" ${I()}/>
    <path d="M 340 -510 L 300 -680 M 430 -510 L 470 -680" ${I(14)}/><circle cx="300" cy="-700" r="34" fill="${C.white}" ${I(9)}/><circle cx="306" cy="-696" r="15" fill="${C.ink}"/><circle cx="470" cy="-700" r="34" fill="${C.white}" ${I(9)}/><circle cx="476" cy="-696" r="15" fill="${C.ink}"/>
    <path d="M 270 -705 L 334 -712 M 440 -712 L 504 -705" ${I(9)}/>
    <path d="M 330 -360 Q 380 -320 440 -380" fill="none" ${I(10)}/>${'${'}blushS()}
    <circle cx="-40" cy="-380" r="290" fill="${C.gold}" ${I()}/>
    <path d="M -40 -380 m -40 0 a 40 40 0 1 1 80 0 a 100 100 0 1 1 -180 20 a 170 170 0 1 1 320 -40" fill="none" ${I(10)}/>
    <text x="-40" y="-330" font-family="Archivo Black" font-size="150" text-anchor="middle" fill="${C.oliveDk}">$</text>
    <g transform="translate(385 -790) rotate(4)"><path d="M -100 0 L -120 -110 L -55 -50 L 0 -130 L 55 -50 L 120 -110 L 100 0 Z" fill="${C.gold}" ${I(9)}/><circle cx="0" cy="-34" r="14" fill="${C.red}"/></g>`;
}
const blushS = () => `<ellipse cx="320" cy="-400" rx="20" ry="11" fill="${C.pink}"/><ellipse cx="450" cy="-400" rx="20" ry="11" fill="${C.pink}"/>`;
export function crackedBall() { // the fortune-teller's crystal ball, sweating
  return shadow(300) + `
    <path d="M -260 0 L -200 -150 L 200 -150 L 260 0 Z" fill="${C.wood}" ${I()}/><rect x="-230" y="-200" width="460" height="60" rx="20" fill="${C.woodDk}" ${I(10)}/>
    <circle cx="0" cy="-520" r="330" fill="#C9DCE4" ${I()}/>
    <ellipse cx="-130" cy="-680" rx="60" ry="110" fill="${C.white}" opacity="0.7" transform="rotate(30 -130 -680)"/>
    <path d="M 140 -830 L 90 -700 L 160 -640 L 100 -540" fill="none" ${I(9)}/>
    <g transform="translate(0 -480)">${face("worried", 1.3)}</g>
    ${sweat(-300, -720, 1.4)}`;
}
export function snowballHammock() {
  return `<path d="M -440 -560 L -440 0 M 440 -560 L 440 0" ${I(22)}/><path d="M -440 -560 L -440 0 M 440 -560 L 440 0" stroke="${C.wood}" stroke-width="8"/>${shadow(460)}
    <path d="M -440 -500 Q 0 -120 440 -500" fill="none" stroke="${C.terra}" stroke-width="90"/><path d="M -440 -455 Q 0 -75 440 -455 M -440 -545 Q 0 -165 440 -545" fill="none" ${I(10)}/>
    <circle cx="0" cy="-560" r="300" fill="${C.white}" ${I()}/>
    
    <text x="0" y="-700" font-family="Archivo Black" font-size="130" text-anchor="middle" fill="${C.oliveDk}">$</text>
    <g transform="translate(0 -560)">${face("sleepy", 1.2)}</g>
    <text x="250" y="-880" font-family="Patrick Hand" font-size="100" fill="${C.ink}">z</text><text x="330" y="-960" font-family="Patrick Hand" font-size="76" fill="${C.ink}">z</text>`;
}

// ---------- EP04 ----------
const CARD = "#D9B07A", CARD_DK = "#B98C55";
const sticker = (x, y, rot, t) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="-140" y="-48" width="280" height="96" rx="10" fill="${C.white}" ${I(8)}/><text x="0" y="22" font-family="Archivo Black" font-size="60" text-anchor="middle" fill="${C.ink}">${t}</text></g>`;
export function confusedBox() {
  return shadow(360) + `
    <rect x="-340" y="-700" width="680" height="700" fill="${CARD}" ${I()}/><path d="M -340 -700 L 0 -790 L 340 -700 Z" fill="${CARD_DK}" ${I(10)}/>
    <rect x="-46" y="-720" width="92" height="260" fill="#E8CFA0" opacity="0.8"/>
    ${sticker(-170, -560, -12, "401(K)")}${sticker(170, -520, 9, "IRA")}${sticker(0, -110, -5, "ROTH")}
    <g transform="translate(0 -330)">${face("shocked", 1.1)}</g>
    <text x="-300" y="-820" font-family="Archivo Black" font-size="150" fill="${C.red}" stroke="${C.ink}" stroke-width="8" paint-order="stroke" transform="rotate(-12 -300 -820)">?</text>
    <text x="300" y="-850" font-family="Archivo Black" font-size="120" fill="${C.red}" stroke="${C.ink}" stroke-width="8" paint-order="stroke" transform="rotate(14 300 -850)">?</text>`;
}
export function sleepingCash() { // cash asleep in the IRA box, cobwebs
  const bill = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-150" y="-70" width="300" height="140" rx="10" fill="${C.olive}" ${I(9)}/><rect x="-120" y="-44" width="240" height="88" rx="6" fill="none" stroke="${C.oliveDk}" stroke-width="6"/><circle r="34" fill="${C.oliveDk}"/><text x="0" y="16" font-family="Archivo Black" font-size="46" text-anchor="middle" fill="${C.olive}">$</text></g>`;
  return shadow(380) + `
    ${bill(-60, -720, -8)}${bill(80, -650, 6)}
    <g transform="translate(0 -560)"><rect x="-230" y="-120" width="460" height="230" rx="18" fill="${C.olive}" ${I()}/><g transform="translate(0 10)">${face("sleepy", 1.1)}</g></g>
    <rect x="-360" y="-480" width="720" height="480" fill="${CARD}" ${I()}/>
    <path d="M -360 -480 L -440 -580 L -300 -600 L -300 -480 Z M 360 -480 L 440 -580 L 300 -600 L 300 -480 Z" fill="${CARD_DK}" ${I(10)}/>
    <rect x="-200" y="-330" width="400" height="140" rx="12" fill="${C.white}" ${I(9)}/><text x="0" y="-232" font-family="Archivo Black" font-size="96" text-anchor="middle" fill="${C.ink}">IRA</text>
    <path d="M 360 -480 L 230 -350 M 360 -480 L 360 -330 M 360 -480 L 210 -480 M 360 -420 Q 300 -420 300 -480 M 360 -370 Q 260 -370 260 -480" fill="none" stroke="${C.grey}" stroke-width="6"/>
    <text x="280" y="-900" font-family="Patrick Hand" font-size="100" fill="${C.ink}">z</text><text x="360" y="-980" font-family="Patrick Hand" font-size="76" fill="${C.ink}">z</text>`;
}
export function happyGift() {
  return shadow(340) + `
    <rect x="-300" y="-560" width="600" height="560" fill="${C.olive}" ${I()}/><rect x="-340" y="-700" width="680" height="150" fill="${C.olive}" ${I()}/>
    <rect x="-50" y="-700" width="100" height="700" fill="${C.gold}" ${I(10)}/>
    <path d="M 0 -700 Q -200 -930 -240 -760 Q -200 -700 0 -700 Q 200 -930 240 -760 Q 200 -700 0 -700" fill="${C.gold}" ${I(10)}/>
    <g transform="translate(-170 -330)">${face("happy", 0.95)}</g>
    <g transform="translate(180 -260) rotate(-6)"><rect x="-110" y="-46" width="220" height="92" rx="10" fill="${C.white}" ${I(8)}/><text x="0" y="22" font-family="Archivo Black" font-size="56" text-anchor="middle" fill="${C.ink}">MATCH</text></g>
    ${sparkle(-380, -800, 1.3)}${sparkle(380, -860, 1)}${sparkle(420, -500, 0.8)}`;
}

// ---------- EP05 ----------
export function lureCard() { // a sweet-smiling credit card dangling $170 like bait
  return shadow(300) + `
    ${legs([-110, 90], -150)}
    <g transform="rotate(-6 0 -440)"><rect x="-330" y="-640" width="660" height="440" rx="44" fill="${C.slateDk}" ${I()}/>
    <rect x="-260" y="-560" width="120" height="90" rx="14" fill="${C.gold}" ${I(9)}/>
    <text x="-260" y="-250" font-family="Space Mono" font-weight="700" font-size="52" fill="${C.white}">•••• 4021</text>
    <g transform="translate(60 -440)">${face("sweet", 1.05)}</g></g>
    <path d="M 310 -520 Q 360 -560 380 -600" fill="none" ${I(14)}/>
    <path d="M 380 -600 L 330 -960" stroke="${C.wood}" stroke-width="22" stroke-linecap="round"/><path d="M 380 -600 L 330 -960" fill="none" ${I(5)}/>
    <path d="M 330 -960 Q 450 -1000 470 -900 L 470 -720" fill="none" stroke="${C.ink}" stroke-width="5"/>
    <g transform="translate(470 -620) scale(1.35)"><path d="M -100 -70 L 0 -110 L 100 -70 L 100 90 L -100 90 Z" fill="${C.gold}" ${I(9)}/><circle cx="0" cy="-70" r="12" fill="${C.paper}" ${I(6)}/><text x="0" y="40" font-family="Archivo Black" font-size="60" text-anchor="middle" fill="${C.ink}">$170</text></g>`;
}
export function skeletonPayer() { // still paying, 20 years later
  const bone = (d, w = 24) => `<path d="${d}" fill="none" ${I(w + 12)}/><path d="${d}" fill="none" stroke="${C.white}" stroke-width="${w}" stroke-linecap="round"/>`;
  const rib = [0, 1, 2, 3].map((i) => bone(`M -100 ${-560 + i * 50} Q 0 ${-536 + i * 50} 100 ${-560 + i * 50}`, 18)).join("");
  return shadow(260) + `
    ${bone("M 0 -620 L 0 -340", 26)}${rib}
    <ellipse cx="0" cy="-330" rx="100" ry="44" fill="${C.white}" ${I(10)}/>
    ${bone("M -60 -320 L -80 -150 L -90 -10")}${bone("M 60 -320 L 80 -150 L 90 -10")}
    <path d="M -130 -10 L -60 -10 M 60 -10 L 130 -10" ${I(18)}/>
    ${bone("M -110 -600 Q -220 -460 -150 -330")}${bone("M 110 -600 Q 230 -620 280 -760")}
    <g transform="translate(290 -830) rotate(-14)"><rect x="-110" y="-70" width="220" height="140" rx="16" fill="${C.slateDk}" ${I(9)}/><rect x="-80" y="-36" width="44" height="34" rx="6" fill="${C.gold}" ${I(5)}/><text x="-80" y="44" font-family="Space Mono" font-weight="700" font-size="26" fill="${C.white}">•••• 4021</text></g>
    <g transform="translate(0 -780)"><path d="M -150 0 Q -160 -180 0 -190 Q 160 -180 150 0 Q 140 76 76 86 L 76 140 L -76 140 L -76 86 Q -140 76 -150 0 Z" fill="${C.white}" ${I()}/>
      <ellipse cx="-60" cy="-14" rx="44" ry="50" fill="${C.ink}"/><ellipse cx="60" cy="-14" rx="44" ry="50" fill="${C.ink}"/><path d="M 0 40 L -20 72 L 20 72 Z" fill="${C.ink}"/>
      <path d="M -54 104 L -54 140 M -18 104 L -18 140 M 18 104 L 18 140 M 54 104 L 54 140" ${I(7)}/></g>
    <path d="M 140 -620 L 60 -520 M 140 -620 L 140 -500 M 140 -620 L 30 -620 M 140 -580 Q 90 -580 90 -620 M 140 -540 Q 60 -540 60 -620" fill="none" stroke="${C.grey}" stroke-width="6"/>`;
}
export function boldPhone() { // the red telephone, ready to call
  return shadow(360) + `
    <path d="M -380 0 L -320 -400 Q -300 -460 -230 -460 L 230 -460 Q 300 -460 320 -400 L 380 0 Z" fill="${C.red}" ${I()}/>
    <g transform="translate(0 -260)">${face("confident", 1.25)}</g>
    ${[-120, -40, 40, 120].map((x) => `<circle cx="${x}" cy="-70" r="20" fill="${C.white}" ${I(6)}/>`).join("")}
    <path d="M -400 -500 Q -400 -640 -260 -640 L 260 -640 Q 400 -640 400 -500 L 290 -470 Q 290 -540 220 -540 L -220 -540 Q -290 -540 -290 -470 Z" fill="${C.red}" ${I()}/>
    <path d="M -330 -200 Q -470 -160 -440 -420" fill="none" ${I(10)}/>
    <path d="M 460 -760 q 60 60 0 130 M 540 -820 q 100 110 0 250" fill="none" ${I(12)}/><path d="M -460 -760 q -60 60 0 130 M -540 -820 q -100 110 0 250" fill="none" ${I(12)}/>`;
}
