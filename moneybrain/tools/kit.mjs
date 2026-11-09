// PESABRAIN drawing kit.
// Identity: ledger-paper world, flat muted palette, ink outlines that "boil",
// and a cast of three: BEAN (you), IMPULSE (your brain), PROF. CALC (the math).
// Every function returns an SVG string. Characters and most props stand on (0,0).

export const C = {
  paper: "#F4EBD5", paper2: "#EBDFC2", rule: "#D8CDB0", margin: "#D9937A",
  ink: "#231F1C", terra: "#B8704F", olive: "#8E9B6A", oliveDk: "#6F7C52",
  slate: "#8FA7B4", slateDk: "#5F7C90", mustard: "#D3A43F", bean: "#E2B04A",
  wood: "#C68A5B", woodDk: "#A56C43", grey: "#C9C3B6", white: "#FFFDF7",
  pink: "#E7958C", pinkDk: "#B9665E", screen: "#D7DEC3", gold: "#E9C25B", red: "#C4553F",
};
const INK = `stroke="${C.ink}" stroke-linecap="round" stroke-linejoin="round"`;
export const K = `${INK} stroke-width="5"`;
export const K3 = `${INK} stroke-width="3.5"`;
const F_HAND = `font-family="Patrick Hand"`;
const F_BOLD = `font-family="Archivo Black"`;
const F_MONO = `font-family="Space Mono" font-weight="700"`;

export const g = (inner, t = "") => `<g${t ? ` transform="${t}"` : ""}>${inner}</g>`;
export const at = (x, y, s = 1, inner = "", rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${inner}</g>`;
export const txt = (x, y, s, size = 44, fill = C.ink, o = {}) =>
  `<text x="${x}" y="${y}" ${o.font === "bold" ? F_BOLD : o.font === "mono" ? F_MONO : F_HAND} font-size="${size}" fill="${fill}" text-anchor="${o.anchor || "middle"}" dominant-baseline="middle"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ""}${o.extra ? " " + o.extra : ""}>${s}</text>`;
export const shadow = (rx = 90, ry = 14) => `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" fill="${C.ink}" opacity="0.12"/>`;
const hand = (x, y, fill) => `<circle cx="${x}" cy="${y}" r="11" fill="${fill}" ${K3}/>`;
const limb = (x0, y0, x1, y1, x2, y2, w = 6) => `<path d="M ${x0} ${y0} Q ${x1} ${y1} ${x2} ${y2}" fill="none" ${INK} stroke-width="${w}"/>`;

/* ======================= BEAN — you ======================= */
// jelly-bean body, sprout on top, big oval eyes, terracotta sneakers
const BEAN_ARMS = {
  down: [[-74, -190, -104, -150, -100, -104], [78, -190, 108, -150, 104, -104]],
  wave: [[-74, -190, -104, -150, -100, -104], [78, -190, 140, -230, 132, -310]],
  cheer: [[-74, -190, -140, -240, -128, -322], [78, -190, 144, -240, 132, -322]],
  shrug: [[-74, -190, -110, -150, -150, -206], [78, -190, 114, -150, 154, -206]],
  hold: [[-74, -190, -84, -130, -26, -150], [78, -190, 88, -130, 30, -150]],
  sip: [[-74, -190, -104, -150, -100, -104], [78, -190, 120, -170, 52, -232]],
  carry: [[-74, -190, -104, -150, -100, -104], [78, -190, 120, -160, 120, -128]],
  point: [[-74, -190, -104, -150, -100, -104], [78, -190, 150, -210, 196, -228]],
  pointL: [[-74, -190, -150, -210, -192, -228], [78, -190, 108, -150, 104, -104]],
  pointUp: [[-74, -190, -104, -150, -100, -104], [78, -190, 130, -260, 120, -340]],
  cheeks: [[-74, -190, -130, -220, -86, -272], [78, -190, 134, -220, 90, -272]],
  think: [[-74, -190, -84, -130, -26, -150], [78, -190, 140, -200, 92, -262]],
  phone: [[-74, -190, -104, -150, -100, -104], [78, -190, 130, -200, 92, -282]],
  heart: [[-74, -190, -40, -150, 0, -176], [78, -190, 44, -150, 6, -170]],
  push: [[-74, -190, -40, -200, 120, -196], [78, -190, 130, -180, 160, -170]],
  stop: [[-74, -190, -104, -150, -100, -104], [78, -190, 150, -200, 170, -260]],
};
const BEAN_GRIP = { hold: [2, -150], sip: [56, -236], carry: [124, -128], phone: [96, -286], cheer: [132, -330], wave: [134, -314], push: [168, -180], stop: [176, -268] };
const BEAN_FACE = {
  neutral: { eyes: "open", brows: "", mouth: `<path d="M -14 -244 Q 4 -236 20 -246" fill="none" ${K3}/>` },
  smile: { eyes: "open", brows: "", mouth: `<path d="M -20 -250 Q 2 -230 24 -250" fill="none" ${K3}/>` },
  happy: { eyes: "open", brows: "", mouth: `<path d="M -24 -254 Q 2 -218 28 -254 Z" fill="${C.ink}" ${K3}/><path d="M -8 -236 Q 4 -228 14 -236" fill="${C.pink}"/>`, blush: true },
  joy: { eyes: "closed", brows: "", mouth: `<path d="M -24 -254 Q 2 -218 28 -254 Z" fill="${C.ink}" ${K3}/>`, blush: true },
  content: { eyes: "closed", brows: "", mouth: `<path d="M -18 -248 Q 2 -234 22 -248" fill="none" ${K3}/>`, blush: true },
  worried: { eyes: "open", brows: `<path d="M -40 -318 L -12 -326 M 16 -326 L 44 -318" fill="none" ${K3}/>`, mouth: `<path d="M -18 -240 Q -9 -250 0 -242 Q 9 -234 20 -244" fill="none" ${K3}/>`, sweat: true },
  sad: { eyes: "open", brows: `<path d="M -40 -314 L -12 -322 M 16 -322 L 44 -314" fill="none" ${K3}/>`, mouth: `<path d="M -16 -238 Q 2 -250 20 -238" fill="none" ${K3}/>` },
  shocked: { eyes: "small", brows: `<path d="M -40 -326 Q -26 -336 -10 -330 M 14 -330 Q 30 -336 44 -326" fill="none" ${K3}/>`, mouth: `<ellipse cx="2" cy="-240" rx="12" ry="16" fill="${C.ink}"/>` },
  smug: { eyes: "lids", brows: "", mouth: `<path d="M -12 -246 Q 10 -238 26 -254" fill="none" ${K3}/>` },
  thinking: { eyes: "up", brows: `<path d="M -40 -320 L -12 -322 M 16 -332 Q 30 -340 44 -330" fill="none" ${K3}/>`, mouth: `<path d="M -6 -244 L 20 -246" fill="none" ${K3}/>` },
  wince: { eyes: "x", brows: "", mouth: `<path d="M -20 -244 l 8 -6 l 8 6 l 8 -6 l 8 6 l 8 -6" fill="none" ${K3}/>`, sweat: true },
  determined: { eyes: "open", brows: `<path d="M -40 -326 L -12 -316 M 16 -316 L 44 -326" fill="none" ${K3}/>`, mouth: `<path d="M -16 -244 L 22 -244" fill="none" ${K3}/>` },
  sleep: { eyes: "closed", brows: "", mouth: `<ellipse cx="4" cy="-242" rx="8" ry="6" fill="${C.ink}"/>` },
};
function beanEyes(kind, look = 0) {
  const L = [-22, -288], R = [28, -288];
  const white = ([x, y], ry = 19) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="${ry}" fill="${C.white}" ${K3}/>`;
  const pup = ([x, y], r = 7, dy = 2) => `<circle cx="${x + look}" cy="${y + dy}" r="${r}" fill="${C.ink}"/>`;
  switch (kind) {
    case "closed": return `<path d="M -36 -288 Q -22 -276 -8 -288 M 14 -288 Q 28 -276 42 -288" fill="none" ${K3}/>`;
    case "small": return white(L) + white(R) + pup(L, 4, 0) + pup(R, 4, 0);
    case "lids": return white(L) + white(R) + pup(L, 7, 6) + pup(R, 7, 6) + `<path d="M -38 -292 L -6 -292 M 12 -292 L 44 -292" ${K3}/>`;
    case "up": return white(L) + white(R) + pup(L, 7, -8) + pup(R, 7, -8);
    case "x": return `<path d="M -32 -298 L -12 -288 L -32 -278 M 38 -298 L 18 -288 L 38 -278" fill="none" ${K3}/>`;
    default: return white(L) + white(R) + pup(L) + pup(R);
  }
}
export function bean(o = {}) {
  const body = o.color || C.bean;
  const face = BEAN_FACE[o.face || "neutral"];
  const arms = BEAN_ARMS[o.pose || "down"];
  const grip = BEAN_GRIP[o.pose || "down"];
  const old = o.old
    ? `<path d="M -70 -300 Q -60 -340 -30 -350 M 74 -300 Q 66 -340 40 -352" fill="none" stroke="${C.white}" stroke-width="10" stroke-linecap="round"/>
       <circle cx="-22" cy="-288" r="20" fill="none" ${K3}/><circle cx="28" cy="-288" r="20" fill="none" ${K3}/><path d="M -2 -290 L 8 -290" ${K3}/>`
    : "";
  return `${o.noShadow ? "" : shadow(100, 15)}
  ${o.legs === false ? "" : `<path d="M -28 -78 L -32 -14 M 28 -78 L 32 -14" fill="none" ${INK} stroke-width="6"/>
  <path d="M -62 -2 Q -64 -22 -36 -20 Q -18 -18 -18 -2 Z" fill="${C.terra}" ${K3}/>
  <path d="M 62 -2 Q 64 -22 36 -20 Q 18 -18 18 -2 Z" fill="${C.terra}" ${K3}/>`}
  ${o.behind || ""}
  <path d="M 6 -372 Q 2 -392 4 -408" fill="none" stroke="${C.oliveDk}" stroke-width="5" stroke-linecap="round"/>
  <path d="M 4 -404 Q -26 -420 -34 -398 Q -12 -388 4 -404 Z" fill="${C.olive}" ${K3}/>
  <path d="M 4 -400 Q 30 -424 40 -402 Q 18 -388 4 -400 Z" fill="${C.olive}" ${K3}/>
  <path d="M -78 -250 C -80 -330 -40 -372 6 -372 C 56 -372 86 -330 82 -260 L 80 -150 C 82 -95 50 -70 0 -70 C -50 -70 -80 -95 -78 -150 Z" fill="${body}" ${K}/>
  <path d="M -56 -296 Q -50 -334 -18 -348" fill="none" stroke="${C.white}" stroke-width="7" stroke-linecap="round" opacity="0.75"/>
  ${o.tie ? `<path d="M -4 -200 L 8 -200 L 14 -150 L 2 -132 L -10 -150 Z" fill="${C.slateDk}" ${K3}/>` : ""}
  ${o.label ? txt(2, -150, o.label, 34, C.ink, { font: "bold" }) : ""}
  ${beanEyes(face.eyes, o.look || 0)}${face.brows}${face.mouth}${old}
  ${face.blush ? `<ellipse cx="-50" cy="-252" rx="12" ry="7" fill="${C.pink}" opacity="0.7"/><ellipse cx="56" cy="-252" rx="12" ry="7" fill="${C.pink}" opacity="0.7"/>` : ""}
  ${face.sweat || o.sweat ? `<path d="M -96 -330 Q -104 -312 -96 -306 Q -88 -312 -96 -330 Z" fill="${C.slate}" ${K3}/><path d="M 104 -310 Q 96 -292 104 -286 Q 112 -292 104 -310 Z" fill="${C.slate}" ${K3}/>` : ""}
  ${limb(...arms[0])}${limb(...arms[1])}
  ${o.item && grip ? at(grip[0], grip[1], o.itemScale || 1, o.item) : ""}
  ${hand(arms[0][4], arms[0][5], body)}${hand(arms[1][4], arms[1][5], body)}
  ${o.front || ""}`;
}

/* ======================= IMPULSE — your brain ======================= */
const BRAIN_ARMS = {
  down: [[-104, -170, -130, -130, -120, -92], [104, -170, 130, -130, 120, -92]],
  cheer: [[-104, -170, -160, -220, -146, -290], [104, -170, 160, -220, 146, -290]],
  point: [[-104, -170, -130, -130, -120, -92], [104, -170, 170, -200, 214, -214]],
  hold: [[-104, -170, -110, -110, -30, -120], [104, -170, 110, -110, 30, -120]],
  hug: [[-104, -170, -40, -90, 20, -150], [104, -170, 80, -100, 30, -170]],
  shrug: [[-104, -170, -130, -130, -170, -190], [104, -170, 130, -130, 170, -190]],
  pour: [[-104, -170, -150, -200, -180, -250], [104, -170, 60, -260, -110, -260]],
  reach: [[-104, -170, -130, -130, -120, -92], [104, -170, 190, -170, 250, -150]],
  mega: [[-104, -170, -130, -130, -120, -92], [104, -170, 120, -220, 60, -200]],
};
const BRAIN_GRIP = { hold: [0, -122], cheer: [146, -298], point: [214, -214], mega: [70, -205], hug: [20, -150] };
const BRAIN_FACE = {
  grin: { lids: true, mouth: `<path d="M -50 -150 Q 0 -96 50 -150 Z" fill="${C.white}" ${K3}/><path d="M -24 -140 L -24 -118 M 0 -136 L 0 -112 M 24 -140 L 24 -118" ${INK} stroke-width="2.5"/>` },
  sly: { lids: true, mouth: `<path d="M -30 -138 Q 10 -120 40 -152" fill="none" ${K3}/>` },
  happy: { lids: false, mouth: `<path d="M -40 -150 Q 0 -100 40 -150 Z" fill="${C.ink}" ${K3}/>` },
  meh: { lids: "heavy", mouth: `<path d="M -26 -134 L 26 -134" fill="none" ${K3}/>` },
  yawn: { lids: "heavy", mouth: `<ellipse cx="0" cy="-130" rx="22" ry="26" fill="${C.ink}"/>` },
  foiled: { lids: false, brows: true, mouth: `<path d="M -30 -124 Q 0 -146 30 -124" fill="none" ${K3}/>` },
  shout: { lids: false, mouth: `<path d="M -36 -150 Q 0 -80 36 -150 Z" fill="${C.ink}" ${K3}/>` },
  love: { lids: "heart", mouth: `<path d="M -40 -150 Q 0 -104 40 -150 Z" fill="${C.ink}" ${K3}/>` },
};
export function brain(o = {}) {
  const f = BRAIN_FACE[o.face || "grin"];
  const arms = BRAIN_ARMS[o.pose || "down"];
  const grip = BRAIN_GRIP[o.pose || "down"];
  const L = [-34, -196], R = [34, -196];
  let eyes;
  if (f.lids === "heart") eyes = [L, R].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M 0 14 C -30 -6 -20 -30 0 -16 C 20 -30 30 -6 0 14 Z" fill="${C.red}" ${K3}/>`).join("");
  else {
    eyes = [L, R].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="20" ry="22" fill="${C.white}" ${K3}/><circle cx="${x + (o.look ?? 6)}" cy="${y + 4}" r="8" fill="${C.ink}"/>`).join("");
    if (f.lids === true) eyes += [L, R].map(([x, y]) => `<path d="M ${x - 21} ${y - 4} Q ${x} ${y - 12} ${x + 21} ${y - 4} L ${x + 20} ${y - 12} Q ${x} ${y - 30} ${x - 20} ${y - 12} Z" fill="${C.pink}" ${K3}/>`).join("");
    if (f.lids === "heavy") eyes += [L, R].map(([x, y]) => `<path d="M ${x - 21} ${y + 4} L ${x + 21} ${y + 4} L ${x + 20} ${y - 12} Q ${x} ${y - 30} ${x - 20} ${y - 12} Z" fill="${C.pink}" ${K3}/>`).join("");
    if (f.brows) eyes += `<path d="M -56 -226 L -16 -216 M 16 -216 L 56 -226" fill="none" ${K3}/>`;
  }
  const blob = `M -120 -150 C -150 -210 -120 -280 -60 -286 C -40 -320 30 -320 50 -290 C 120 -290 150 -220 124 -160 C 140 -100 90 -76 40 -84 C 10 -66 -30 -66 -50 -84 C -110 -76 -146 -110 -120 -150 Z`;
  return `${o.noShadow ? "" : shadow(100, 15)}
  <path d="M -36 -82 L -40 -14 M 36 -82 L 40 -14" fill="none" ${INK} stroke-width="6"/>
  <path d="M -70 -2 Q -72 -26 -40 -24 Q -18 -22 -16 -2 Z" fill="${C.white}" ${K3}/><path d="M 70 -2 Q 72 -26 40 -24 Q 18 -22 16 -2 Z" fill="${C.white}" ${K3}/>
  <path d="M -60 -10 L -30 -10 M 60 -10 L 30 -10" stroke="${C.slateDk}" stroke-width="3"/>
  <path d="${blob}" fill="${o.color || C.pink}" ${K}/>
  <path d="M -96 -236 q 22 -26 46 -6 q 18 -24 44 -8 M 10 -276 q 26 -10 44 12 q 30 -6 40 22 M -110 -166 q 10 -20 30 -10 M 92 -150 q 20 -6 26 14 M 0 -296 L 2 -240" fill="none" stroke="${C.pinkDk}" stroke-width="4" stroke-linecap="round"/>
  ${o.shades === false ? "" : `<g transform="translate(0 -276) rotate(-6)"><rect x="-74" y="-18" width="60" height="34" rx="12" fill="${C.ink}"/><rect x="12" y="-18" width="60" height="34" rx="12" fill="${C.ink}"/><path d="M -14 -6 L 12 -6" ${K}/><path d="M -60 -8 L -40 -8" stroke="${C.grey}" stroke-width="4"/></g>`}
  ${eyes}${f.mouth}
  ${o.hat || ""}
  ${limb(...arms[0])}${limb(...arms[1])}
  ${o.item && grip ? at(grip[0], grip[1], o.itemScale || 1, o.item) : ""}
  ${hand(arms[0][4], arms[0][5], o.color || C.pink)}${hand(arms[1][4], arms[1][5], o.color || C.pink)}
  ${o.front || ""}`;
}

/* ======================= PROF. CALC — the math ======================= */
const CALC_ARMS = {
  down: [[-96, -210, -130, -160, -124, -110], [96, -210, 130, -160, 124, -110]],
  point: [[-96, -210, -130, -160, -124, -110], [96, -210, 160, -240, 210, -250]],
  pointL: [[-96, -210, -160, -240, -210, -250], [96, -210, 130, -160, 124, -110]],
  up: [[-96, -210, -130, -160, -124, -110], [96, -210, 140, -280, 128, -360]],
  hold: [[-96, -210, -150, -170, -160, -150], [96, -210, 150, -170, 160, -150]],
  shrug: [[-96, -210, -140, -170, -170, -230], [96, -210, 140, -170, 170, -230]],
  chin: [[-96, -210, -130, -160, -124, -110], [96, -210, 150, -150, 60, -196]],
};
const CALC_GRIP = { up: [128, -368], hold: [160, -150], point: [214, -252] };
export function calc(o = {}) {
  const arms = CALC_ARMS[o.pose || "down"];
  const grip = CALC_GRIP[o.pose || "down"];
  const scr = String(o.screen ?? "0");
  const size = Math.min(40, Math.floor(126 / Math.max(scr.length * 0.62, 1)));
  const mouth = { smile: `<path d="M -16 -192 Q 0 -180 16 -192" fill="none" ${K3}/>`, o: `<ellipse cx="0" cy="-188" rx="8" ry="10" fill="${C.ink}"/>`, flat: `<path d="M -14 -188 L 14 -188" ${K3}/>`, frown: `<path d="M -16 -182 Q 0 -194 16 -182" fill="none" ${K3}/>` }[o.mouth || "smile"];
  let btn = "";
  const cols = [C.white, C.white, C.white, C.white, C.white, C.mustard, C.white, C.white, C.terra];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) btn += `<rect x="${-62 + c * 44}" y="${-170 + r * 32}" width="36" height="24" rx="6" fill="${cols[r * 3 + c]}" ${K3}/>`;
  return `${o.noShadow ? "" : shadow(100, 15)}
  <path d="M -36 -70 L -38 -14 M 36 -70 L 38 -14" fill="none" ${INK} stroke-width="6"/>
  <path d="M -64 -2 Q -66 -22 -40 -22 Q -20 -20 -18 -2 Z" fill="${C.ink}"/><path d="M 64 -2 Q 66 -22 40 -22 Q 20 -20 18 -2 Z" fill="${C.ink}"/>
  <rect x="-96" y="-390" width="192" height="320" rx="24" fill="${C.slateDk}" ${K}/>
  <rect x="-74" y="-370" width="148" height="82" rx="8" fill="${C.screen}" ${K3}/>
  ${txt(64, -328, scr, size, C.ink, { font: "mono", anchor: "end" })}
  <circle cx="-30" cy="-240" r="22" fill="${C.white}" ${K3}/><circle cx="30" cy="-240" r="22" fill="${C.white}" ${K3}/><path d="M -8 -242 L 8 -242" ${K3}/>
  <circle cx="${-30 + (o.look || 0)}" cy="-238" r="7" fill="${C.ink}"/><circle cx="${30 + (o.look || 0)}" cy="-238" r="7" fill="${C.ink}"/>
  <path d="M -30 -206 Q -14 -218 0 -206 Q 14 -218 30 -206 Q 14 -198 0 -204 Q -14 -198 -30 -206 Z" fill="${C.ink}"/>
  ${mouth}
  <g transform="translate(0 30)">${btn}</g>
  ${limb(...arms[0])}${limb(...arms[1])}
  ${o.item && grip ? at(grip[0], grip[1], o.itemScale || 1, o.item) : ""}
  ${hand(arms[0][4], arms[0][5], C.white)}${hand(arms[1][4], arms[1][5], C.white)}`;
}

/* ======================= props ======================= */
export function coffee(o = {}) {
  // paper cup standing on 0,0; ~170 tall
  const steam = o.steam === false ? "" : `<path d="M -20 -200 q -14 -20 0 -40 q 14 -20 0 -40 M 18 -196 q -14 -20 0 -40" fill="none" stroke="${C.grey}" stroke-width="5" stroke-linecap="round"/>`;
  const empty = o.empty ? `<path d="M -34 -60 L 34 -110" stroke="${C.grey}" stroke-width="3" stroke-dasharray="6 8"/>` : "";
  return `${steam}<path d="M -52 -150 L 52 -150 L 42 0 L -42 0 Z" fill="${C.white}" ${K}/>
  <path d="M -49 -110 L 49 -110 L 45 -50 L -45 -50 Z" fill="${o.sleeve || C.terra}" ${K3}/>
  <rect x="-60" y="-170" width="120" height="24" rx="8" fill="${C.oliveDk}" ${K3}/>
  ${o.label ? txt(0, -80, o.label, 30, C.white, { font: "bold" }) : `<circle cx="0" cy="-80" r="12" fill="${C.white}" opacity="0.85"/>`}${empty}`;
}
export function priceTag(label, o = {}) {
  const w = o.w || Math.max(150, label.length * 26 + 70), h = o.h || 80, col = o.color || C.white;
  return `${o.string === false ? "" : `<path d="M 0 0 Q -10 -40 -30 -${o.len || 60}" fill="none" ${K3}/>`}
  <path d="M 0 0 L 30 ${-h / 2} L ${w} ${-h / 2} L ${w} ${h / 2} L 30 ${h / 2} Z" transform="rotate(${o.rot ?? 12})" fill="${col}" ${K}/>
  <g transform="rotate(${o.rot ?? 12})"><circle cx="26" cy="0" r="8" fill="${C.paper}" ${K3}/>${txt((w + 40) / 2, 3, label, o.size || 40, o.ink || C.ink, { font: "bold" })}</g>`;
}
export const coin = (r = 26, label = "$") => `<circle r="${r}" fill="${C.gold}" ${K3}/><circle r="${r * 0.72}" fill="none" stroke="${C.mustard}" stroke-width="3"/>${txt(0, 2, label, r * 1.1, C.ink, { font: "bold" })}`;
export function coinStack(n = 5, o = {}) {
  let s = "";
  for (let i = 0; i < n; i++) s += `<ellipse cx="${((i * 7) % 5) - 2}" cy="${-12 - i * 16}" rx="44" ry="14" fill="${C.gold}" ${K3}/><path d="M ${-44 + ((i * 7) % 5) - 2} ${-12 - i * 16} l 0 8 q 44 18 88 0 l 0 -8" fill="${C.mustard}" ${K3}/>`;
  return s + (o.label ? txt(0, -n * 16 - 50, o.label, o.size || 46, C.ink, { font: "bold" }) : "");
}
export function bill(o = {}) {
  return `<rect x="-90" y="-46" width="180" height="92" rx="6" fill="${o.color || "#A9C08E"}" ${K}/><rect x="-74" y="-32" width="148" height="64" rx="4" fill="none" stroke="${C.oliveDk}" stroke-width="3"/><circle r="22" fill="#CFE0B8" ${K3}/>${txt(0, 2, o.label || "$", 30, C.oliveDk, { font: "bold" })}`;
}
export const wing = (flip = 1) => `<path transform="scale(${flip} 1)" d="M 80 -20 Q 140 -80 170 -40 Q 140 -40 150 -10 Q 120 -20 120 10 Q 100 -10 80 0 Z" fill="${C.white}" ${K3}/>`;
export const flyingBill = () => bill() + wing(1) + wing(-1);
export function moneyBag(label = "$", o = {}) {
  return `<path d="M -30 -200 Q 0 -230 30 -200 L 20 -176 L -20 -176 Z" fill="${C.wood}" ${K}/>
  <path d="M -20 -176 Q -110 -130 -100 -50 Q -96 0 0 0 Q 96 0 100 -50 Q 110 -130 20 -176 Z" fill="${C.wood}" ${K}/>
  <path d="M -26 -178 L 26 -178" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>${txt(0, -80, label, o.size || 64, C.ink, { font: "bold" })}`;
}
export function piggy(o = {}) {
  return `<ellipse cx="0" cy="-80" rx="110" ry="74" fill="${C.pink}" ${K}/>
  <path d="M -70 -20 L -70 0 M -30 -10 L -30 4 M 40 -10 L 40 4 M 76 -20 L 76 0" ${INK} stroke-width="14"/>
  <ellipse cx="108" cy="-90" rx="24" ry="28" fill="${C.pink}" ${K3}/><circle cx="102" cy="-92" r="4" fill="${C.ink}"/><circle cx="114" cy="-92" r="4" fill="${C.ink}"/>
  <path d="M 50 -150 L 70 -180 L 82 -146 Z" fill="${C.pink}" ${K3}/><circle cx="62" cy="-110" r="7" fill="${C.ink}"/>
  <rect x="-30" y="-158" width="50" height="10" rx="4" fill="${C.ink}"/>
  <path d="M -110 -90 q -30 -10 -20 -30 q 14 -10 10 10" fill="none" ${K3}/>${o.label ? txt(-10, -70, o.label, 34, C.ink, { font: "bold" }) : ""}`;
}
export function wallet(o = {}) {
  return `<rect x="-90" y="-120" width="180" height="120" rx="14" fill="${C.wood}" ${K}/><path d="M 20 -90 L 96 -90 L 96 -40 L 20 -40 Q 6 -65 20 -90 Z" fill="${C.woodDk}" ${K3}/><circle cx="40" cy="-65" r="8" fill="${C.gold}" ${K3}/>${o.open ? `<path d="M -70 -120 L -60 -150 L 50 -150 L 60 -120" fill="#A9C08E" ${K3}/>` : ""}`;
}
export function card(o = {}) {
  return `<rect x="-130" y="-82" width="260" height="164" rx="16" fill="${o.color || C.slateDk}" ${K}/>
  <rect x="-100" y="-40" width="46" height="34" rx="6" fill="${C.gold}" ${K3}/>
  ${txt(-100, 30, o.number || "•••• 4021", 26, C.white, { font: "mono", anchor: "start" })}
  ${o.label ? txt(60, -46, o.label, 26, C.white, { font: "bold" }) : ""}
  ${o.mouth ? `<path d="M -60 50 Q 0 110 60 50 Z" fill="${C.ink}" ${K3}/><path d="M -40 56 l 10 14 l 10 -14 l 10 14 l 10 -14 l 10 14 l 10 -14" fill="${C.white}" stroke="${C.white}" stroke-width="2"/><circle cx="-40" cy="-12" r="12" fill="${C.white}" ${K3}/><circle cx="40" cy="-12" r="12" fill="${C.white}" ${K3}/><circle cx="-36" cy="-10" r="5" fill="${C.ink}"/><circle cx="44" cy="-10" r="5" fill="${C.ink}"/>` : ""}`;
}
export function phone(lines = [], o = {}) {
  const w = o.w || 200, h = o.h || 360;
  const body = lines.map((l, i) => txt(0, -h + 90 + i * 52, l, o.size || 30, i === 0 && o.head ? C.white : C.ink, { font: o.font || "bold" })).join("");
  return `${o.glow ? `<circle cx="0" cy="${-h / 2}" r="${h * 0.7}" fill="${C.gold}" opacity="0.25"/>` : ""}
  <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="28" fill="${C.ink}" ${K}/>
  <rect x="${-w / 2 + 14}" y="${-h + 34}" width="${w - 28}" height="${h - 68}" rx="10" fill="${o.screen || C.white}"/>
  ${o.head ? `<rect x="${-w / 2 + 14}" y="${-h + 34}" width="${w - 28}" height="70" fill="${o.head}"/>` : ""}
  <rect x="-24" y="${-h + 14}" width="48" height="8" rx="4" fill="${C.grey}"/>${body}${o.inner || ""}`;
}
export function envelope(label = "", o = {}) {
  const w = o.w || 300, h = o.h || 190;
  return `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${o.color || C.white}" ${K}/>
  <path d="M ${-w / 2} ${-h} L 0 ${-h * 0.42} L ${w / 2} ${-h}" fill="${o.open ? "none" : o.color || C.white}" ${K3}/>
  ${o.open ? `<path d="M ${-w / 2} ${-h} L 0 ${-h * 1.6} L ${w / 2} ${-h}" fill="${C.paper2}" ${K3}/>` : ""}
  ${o.seal ? `<circle cx="0" cy="${-h * 0.42}" r="20" fill="${C.red}" ${K3}/>` : ""}
  ${label ? txt(0, -h * 0.2, label, o.size || 34, C.ink, { font: "bold" }) : ""}`;
}
export function letter(lines = [], o = {}) {
  const w = o.w || 260, h = o.h || 320;
  return `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${C.white}" ${K}/>
  ${lines.map((l, i) => (l === "-" ? `<path d="M ${-w / 2 + 30} ${-h + 70 + i * 44} L ${w / 2 - 30} ${-h + 70 + i * 44}" stroke="${C.grey}" stroke-width="5" stroke-linecap="round"/>` : txt(0, -h + 66 + i * 44, l, o.size || 34, l.startsWith("+") ? C.oliveDk : C.ink, { font: "bold" }))).join("")}`;
}
export function calendar(cells = 28, cols = 7, o = {}) {
  const cw = o.cw || 60, rows = Math.ceil(cells / cols), w = cols * cw + 20, h = rows * cw + 90;
  let s = `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${C.white}" ${K}/><rect x="${-w / 2}" y="${-h}" width="${w}" height="60" fill="${o.head || C.terra}" ${K3}/>
  ${txt(0, -h + 32, o.title || "", 36, C.white, { font: "bold" })}`;
  for (let i = 0; i < cells; i++) {
    const x = -w / 2 + 10 + (i % cols) * cw, y = -h + 70 + Math.floor(i / cols) * cw;
    const fill = o.fill ? o.fill(i) : C.paper;
    s += `<rect ${o.cellClass ? `class="${o.cellClass}"` : ""} x="${x}" y="${y}" width="${cw - 6}" height="${cw - 6}" rx="4" fill="${fill}" ${K3}/>`;
    if (o.mark && o.mark(i)) s += at(x + cw / 2 - 3, y + cw / 2 - 3, (cw / 120), o.mark(i));
  }
  return s;
}
export function house(o = {}) {
  const c = o.color || C.terra;
  return `<path d="M -130 0 L -130 -170 L 130 -170 L 130 0 Z" fill="${C.paper2}" ${K}/><path d="M -160 -160 L 0 -290 L 160 -160 Z" fill="${c}" ${K}/>
  <rect x="-30" y="-100" width="60" height="100" fill="${C.wood}" ${K3}/><rect x="-104" y="-130" width="54" height="50" fill="${C.slate}" ${K3}/><rect x="50" y="-130" width="54" height="50" fill="${C.slate}" ${K3}/>
  <rect x="70" y="-270" width="34" height="60" fill="${c}" ${K3}/>`;
}
export function car(o = {}) {
  const c = o.color || C.slateDk;
  const sparkle = o.shiny ? [[-150, -200], [170, -190], [20, -250]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill="${C.gold}" ${K3}/>`).join("") : "";
  const dent = o.used ? `<path d="M 90 -80 q 10 10 0 20 q -10 10 0 20" fill="none" ${K3}/><rect x="-170" y="-96" width="60" height="22" fill="${C.grey}" ${K3}/>` : "";
  return `${shadow(210, 16)}<path d="M -200 -40 L -200 -100 Q -196 -120 -170 -124 L -110 -130 L -60 -190 Q -46 -204 -20 -204 L 80 -204 Q 104 -204 120 -186 L 160 -130 L 196 -124 Q 214 -118 214 -96 L 214 -40 Z" fill="${c}" ${K}/>
  <path d="M -90 -134 L -50 -182 L 20 -182 L 20 -134 Z M 40 -134 L 40 -182 L 84 -182 Q 98 -182 108 -168 L 132 -134 Z" fill="${C.slate}" ${K3}/>
  <circle cx="-120" cy="-36" r="40" fill="${C.ink}"/><circle cx="-120" cy="-36" r="16" fill="${C.grey}"/>
  <circle cx="130" cy="-36" r="40" fill="${C.ink}"/><circle cx="130" cy="-36" r="16" fill="${C.grey}"/>
  <rect x="196" y="-100" width="20" height="16" rx="4" fill="${C.gold}" ${K3}/>${dent}${sparkle}${o.label ? txt(10, -80, o.label, 34, C.white, { font: "bold" }) : ""}`;
}
export function cart(o = {}) {
  return `<path d="M -150 -170 L -110 -170 L -80 -50 L 100 -50 L 130 -140 L -100 -140" fill="none" ${K}/><path d="M -100 -140 L 130 -140 L 100 -50 L -80 -50 Z" fill="${C.white}" opacity="0.8"/>
  <path d="M -60 -140 L -50 -50 M 0 -140 L 0 -50 M 60 -140 L 50 -50" ${K3}/><circle cx="-60" cy="-20" r="18" fill="${C.ink}"/><circle cx="80" cy="-20" r="18" fill="${C.ink}"/>
  ${o.full ? `<circle cx="-40" cy="-160" r="30" fill="${C.terra}" ${K3}/><rect x="0" y="-200" width="50" height="70" fill="${C.olive}" ${K3}/><circle cx="80" cy="-160" r="26" fill="${C.mustard}" ${K3}/>` : ""}`;
}
export function bucket(label = "", o = {}) {
  const leak = o.leak ? `<path d="M 40 -20 Q 70 30 60 90" fill="none" stroke="${C.gold}" stroke-width="16" stroke-linecap="round"/>${[0, 1, 2].map((i) => at(80 + i * 50, 70 + (i % 2) * 14, 0.7, coin(22))).join("")}` : "";
  const fill = o.fill ? `<ellipse cx="0" cy="-150" rx="80" ry="16" fill="${C.gold}" ${K3}/>` : "";
  return `${leak}<path d="M -100 -160 L 100 -160 L 80 0 L -80 0 Z" fill="${o.color || C.slate}" ${K}/>${fill}<ellipse cx="0" cy="-160" rx="100" ry="20" fill="none" ${K3}/>
  <rect x="-70" y="-110" width="140" height="50" fill="${C.white}" ${K3}/>${txt(0, -84, label, o.size || 30, C.ink, { font: "bold" })}`;
}
export function jar(label = "", level = 0.5, o = {}) {
  const h = 260, w = 180, fy = -h * level + 10;
  return `<path d="M ${-w / 2} -20 L ${-w / 2} ${-h + 30} Q ${-w / 2} ${-h} ${-w / 2 + 30} ${-h} L ${w / 2 - 30} ${-h} Q ${w / 2} ${-h} ${w / 2} ${-h + 30} L ${w / 2} -20 Q ${w / 2} 0 ${w / 2 - 20} 0 L ${-w / 2 + 20} 0 Q ${-w / 2} 0 ${-w / 2} -20 Z" fill="${C.white}" opacity="0.6"/>
  <rect ${o.fillId ? `id="${o.fillId}"` : ""} x="${-w / 2 + 6}" y="${fy}" width="${w - 12}" height="${-fy - 6}" fill="${C.gold}"/>
  <path d="M ${-w / 2} -20 L ${-w / 2} ${-h + 30} Q ${-w / 2} ${-h} ${-w / 2 + 30} ${-h} L ${w / 2 - 30} ${-h} Q ${w / 2} ${-h} ${w / 2} ${-h + 30} L ${w / 2} -20 Q ${w / 2} 0 ${w / 2 - 20} 0 L ${-w / 2 + 20} 0 Q ${-w / 2} 0 ${-w / 2} -20 Z" fill="none" ${K}/>
  <rect x="${-w / 2 - 10}" y="${-h - 30}" width="${w + 20}" height="34" rx="8" fill="${C.oliveDk}" ${K3}/>
  <rect x="-70" y="${-h + 60}" width="140" height="56" fill="${C.paper}" ${K3}/>${txt(0, -h + 89, label, o.size || 32, C.ink, { font: "bold" })}`;
}
export function magnifier(o = {}) {
  return `<path d="M 50 50 L 130 130" stroke="${C.woodDk}" stroke-width="24" stroke-linecap="round"/><path d="M 50 50 L 130 130" ${INK} stroke-width="4" fill="none"/>
  <circle r="80" fill="${C.white}" fill-opacity="0.35" ${K}/><circle r="80" fill="none" stroke="${C.slate}" stroke-width="10"/><circle r="80" fill="none" ${K}/>${o.inner || ""}`;
}
export function scissors() {
  return `<circle cx="-70" cy="-30" r="30" fill="none" stroke="${C.terra}" stroke-width="14"/><circle cx="-70" cy="30" r="30" fill="none" stroke="${C.terra}" stroke-width="14"/>
  <path d="M -44 -14 L 120 40 L 110 50 L -40 0 Z M -44 14 L 120 -40 L 110 -50 L -40 0 Z" fill="${C.grey}" ${K3}/><circle cx="0" cy="0" r="8" fill="${C.ink}"/>`;
}
export function trophy(label = "", o = {}) {
  return `<rect x="-70" y="-30" width="140" height="30" fill="${C.wood}" ${K}/><rect x="-14" y="-90" width="28" height="60" fill="${C.gold}" ${K3}/>
  <path d="M -80 -230 L 80 -230 Q 80 -110 0 -96 Q -80 -110 -80 -230 Z" fill="${C.gold}" ${K}/>
  <path d="M -80 -210 Q -130 -200 -110 -150 Q -96 -130 -70 -140 M 80 -210 Q 130 -200 110 -150 Q 96 -130 70 -140" fill="none" ${K}/>
  ${label ? txt(0, -170, label, o.size || 30, C.ink, { font: "bold" }) : ""}`;
}
export function star(r = 40, col = C.gold) {
  let p = "";
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; p += `${i ? "L" : "M"} ${(Math.cos(a) * rr).toFixed(1)} ${(Math.sin(a) * rr).toFixed(1)} `; }
  return `<path d="${p}Z" fill="${col}" ${K3}/>`;
}
export const heart = (s = 1, col = C.red) => `<path d="M 0 ${20 * s} C ${-44 * s} ${-8 * s} ${-30 * s} ${-42 * s} 0 ${-22 * s} C ${30 * s} ${-42 * s} ${44 * s} ${-8 * s} 0 ${20 * s} Z" fill="${col}" ${K3}/>`;
export function bulb() {
  return `${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return `<path d="M ${Math.cos(a) * 100} ${-110 + Math.sin(a) * 100} L ${Math.cos(a) * 130} ${-110 + Math.sin(a) * 130}" stroke="${C.mustard}" stroke-width="7" stroke-linecap="round"/>`; }).join("")}
  <circle cx="0" cy="-120" r="70" fill="${C.gold}" ${K}/><rect x="-30" y="-56" width="60" height="50" rx="6" fill="${C.grey}" ${K3}/><path d="M -20 -130 Q 0 -100 20 -130" fill="none" ${K3}/>`;
}
export function clock(o = {}) {
  return `<circle r="90" fill="${C.white}" ${K}/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const a = (i / 12) * Math.PI * 2; return `<path d="M ${Math.cos(a) * 72} ${Math.sin(a) * 72} L ${Math.cos(a) * 82} ${Math.sin(a) * 82}" ${K3}/>`; }).join("")}
  <path ${o.handId ? `id="${o.handId}"` : ""} d="M 0 0 L 0 -62" ${INK} stroke-width="7"/><path d="M 0 0 L 40 14" ${INK} stroke-width="7"/><circle r="8" fill="${C.ink}"/>`;
}
export function bubble(text, o = {}) {
  // speech bubble with its tail pointing at (0,0); text centred above
  const w = o.w || Math.max(220, text.length * (o.size || 40) * 0.5 + 60), h = o.h || 110, dx = o.dx || 0, dy = o.dy || -170;
  const tx = o.tail ?? -1;
  return `<path d="M ${dx - w / 2 + 30} ${dy - h / 2} L ${dx + w / 2 - 30} ${dy - h / 2} Q ${dx + w / 2} ${dy - h / 2} ${dx + w / 2} ${dy - h / 2 + 30} L ${dx + w / 2} ${dy + h / 2 - 30} Q ${dx + w / 2} ${dy + h / 2} ${dx + w / 2 - 30} ${dy + h / 2} L ${dx + tx * 10 + 40} ${dy + h / 2} L 0 0 L ${dx + tx * 10 - 10} ${dy + h / 2} L ${dx - w / 2 + 30} ${dy + h / 2} Q ${dx - w / 2} ${dy + h / 2} ${dx - w / 2} ${dy + h / 2 - 30} L ${dx - w / 2} ${dy - h / 2 + 30} Q ${dx - w / 2} ${dy - h / 2} ${dx - w / 2 + 30} ${dy - h / 2} Z" fill="${o.color || C.white}" ${K}/>
  ${String(text).split("|").map((t, i, a) => txt(dx, dy + 4 + (i - (a.length - 1) / 2) * (o.size || 40) * 1.05, t, o.size || 40, C.ink, { font: o.font || "hand" })).join("")}`;
}
export function cloudThought(inner = "", r = 110) {
  let s = "", f = "";
  for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, x = Math.cos(a) * r * 0.8, y = Math.sin(a) * r * 0.62, rr = r * 0.42 * (1 + 0.15 * Math.sin(i * 2.3)); s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" fill="${C.white}" ${K}/>`; f += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(rr - 4).toFixed(1)}" fill="${C.white}"/>`; }
  return `<circle cx="${-r * 0.7}" cy="${r * 0.95}" r="16" fill="${C.white}" ${K3}/><circle cx="${-r * 0.9}" cy="${r * 1.25}" r="10" fill="${C.white}" ${K3}/>${s}${f}<ellipse rx="${r * 0.85}" ry="${r * 0.66}" fill="${C.white}"/>${inner}`;
}
export function arrow(len = 200, col = C.terra, h = 60) {
  return `<path d="M 0 ${-h * 0.3} L ${len - h * 0.8} ${-h * 0.3} L ${len - h * 0.8} ${-h * 0.8} L ${len} 0 L ${len - h * 0.8} ${h * 0.8} L ${len - h * 0.8} ${h * 0.3} L 0 ${h * 0.3} Z" fill="${col}" ${K3}/>`;
}
export function seesaw(tilt = 10, left = "", right = "") {
  // pivot at (0,0) on the ground; beam tilts by `tilt` degrees (positive = right side down)
  return `<path d="M -50 0 L 0 -90 L 50 0 Z" fill="${C.wood}" ${K}/>
  <g transform="translate(0 -96) rotate(${tilt})"><rect x="-360" y="-14" width="720" height="28" rx="8" fill="${C.woodDk}" ${K}/>${at(-260, -14, 1, left)}${at(260, -14, 1, right)}</g>`;
}
export function donut(slices, o = {}) {
  // slices: [{v, color, id}] fractions of 1, drawn clockwise from 12 o'clock as thick arcs
  const R = o.r || 200, w = o.w || 110;
  let a0 = -Math.PI / 2, s = `<circle r="${R}" fill="none" stroke="${C.paper2}" stroke-width="${w}"/>`;
  for (const sl of slices) {
    const a1 = a0 + sl.v * Math.PI * 2, large = sl.v > 0.5 ? 1 : 0;
    s += `<path ${sl.id ? `id="${sl.id}"` : ""} d="M ${Math.cos(a0) * R} ${Math.sin(a0) * R} A ${R} ${R} 0 ${large} 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R}" fill="none" stroke="${sl.color}" stroke-width="${w}"/>`;
    a0 = a1;
  }
  return s + `<circle r="${R + w / 2}" fill="none" ${K}/><circle r="${R - w / 2}" fill="${C.paper}" ${K}/>`;
}
export function gauge(o = {}) {
  const R = 180;
  return `<path d="M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 Z" fill="${C.white}" ${K}/>
  <path d="M ${-R + 30} 0 A ${R - 30} ${R - 30} 0 0 1 ${-(R - 30) * Math.cos(Math.PI / 3)} ${-(R - 30) * Math.sin(Math.PI / 3)}" fill="none" stroke="${C.olive}" stroke-width="40"/>
  <path d="M ${-(R - 30) * Math.cos(Math.PI / 3)} ${-(R - 30) * Math.sin(Math.PI / 3)} A ${R - 30} ${R - 30} 0 0 1 ${(R - 30) * Math.cos(Math.PI / 3)} ${-(R - 30) * Math.sin(Math.PI / 3)}" fill="none" stroke="${C.mustard}" stroke-width="40"/>
  <path d="M ${(R - 30) * Math.cos(Math.PI / 3)} ${-(R - 30) * Math.sin(Math.PI / 3)} A ${R - 30} ${R - 30} 0 0 1 ${R - 30} 0" fill="none" stroke="${C.red}" stroke-width="40"/>
  <g ${o.needleId ? `id="${o.needleId}"` : ""}><path d="M 0 0 L 0 ${-R + 20}" ${INK} stroke-width="9"/></g><circle r="16" fill="${C.ink}"/>`;
}
export function building(o = {}) {
  let w = "";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) w += `<rect x="${-90 + c * 66}" y="${-380 + r * 76}" width="44" height="44" fill="${C.slate}" ${K3}/>`;
  return `<rect x="-120" y="-420" width="240" height="420" fill="${C.paper2}" ${K}/>${w}<rect x="-30" y="-80" width="60" height="80" fill="${C.wood}" ${K3}/>${o.label ? `<rect x="-110" y="-470" width="220" height="56" fill="${C.oliveDk}" ${K3}/>${txt(0, -442, o.label, 34, C.white, { font: "bold" })}` : ""}`;
}
export function gift(label = "", col = C.terra) {
  return `<rect x="-90" y="-150" width="180" height="150" fill="${col}" ${K}/><rect x="-104" y="-190" width="208" height="46" fill="${col}" ${K}/>
  <rect x="-16" y="-190" width="32" height="190" fill="${C.gold}" ${K3}/><path d="M 0 -190 Q -60 -260 -70 -210 Q -60 -190 0 -190 Q 60 -260 70 -210 Q 60 -190 0 -190" fill="${C.gold}" ${K3}/>
  ${label ? txt(0, -80, label, 34, C.white, { font: "bold" }) : ""}`;
}
export function laptop(lines = [], o = {}) {
  return `<rect x="-200" y="-280" width="400" height="250" rx="14" fill="${C.ink}" ${K}/><rect x="-184" y="-264" width="368" height="218" fill="${o.screen || C.white}"/>
  <path d="M -240 -30 L 240 -30 L 260 0 L -260 0 Z" fill="${C.grey}" ${K}/>
  ${lines.map((l, i) => txt(0, -230 + i * 56, l, o.size || 40, o.ink || C.ink, { font: "bold" })).join("")}${o.inner || ""}`;
}
export function hourglass() {
  return `<rect x="-60" y="-210" width="120" height="20" rx="8" fill="${C.oliveDk}" ${K}/><rect x="-60" y="-10" width="120" height="20" rx="8" fill="${C.oliveDk}" ${K}/>
  <path d="M -46 -190 L 46 -190 Q 40 -120 6 -100 Q 40 -80 46 -10 L -46 -10 Q -40 -80 -6 -100 Q -40 -120 -46 -190 Z" fill="${C.white}" ${K}/>
  <path d="M -30 -170 L 30 -170 Q 24 -130 0 -114 Q -24 -130 -30 -170 Z" fill="#D9BE8A"/><path d="M -38 -14 Q 0 -60 38 -14 Z" fill="#D9BE8A"/>`;
}
export function snail() {
  return `<path d="M -120 0 Q -130 -30 -90 -30 L 80 -30 Q 120 -30 120 0 Z" fill="${C.olive}" ${K}/><circle cx="0" cy="-90" r="70" fill="${C.terra}" ${K}/>
  <path d="M 0 -90 m -10 0 a 10 10 0 1 1 20 0 a 24 24 0 1 1 -44 6 a 40 40 0 1 1 74 -10" fill="none" ${K3}/>
  <path d="M -100 -30 L -120 -80 M -84 -30 L -96 -84" ${K3}/><circle cx="-120" cy="-84" r="8" fill="${C.ink}"/><circle cx="-96" cy="-88" r="8" fill="${C.ink}"/>`;
}
export function treadmill() {
  return `<path d="M -240 -30 L 220 -30 Q 250 -30 250 0 Q 250 30 220 30 L -240 30 Q -270 30 -270 0 Q -270 -30 -240 -30 Z" fill="${C.ink}"/>
  <path d="M -220 -16 L 210 -16" stroke="${C.grey}" stroke-width="4" stroke-dasharray="20 18"/>
  <path d="M 200 -30 L 250 -330 L 290 -330" fill="none" ${INK} stroke-width="10"/><rect x="230" y="-370" width="110" height="60" rx="8" fill="${C.slateDk}" ${K3}/>`;
}
export function conveyor(len = 1200) {
  let rollers = "";
  for (let i = 0; i <= len / 120; i++) rollers += `<circle cx="${-len / 2 + i * 120}" cy="0" r="22" fill="${C.grey}" ${K3}/>`;
  return `<rect x="${-len / 2 - 30}" y="-30" width="${len + 60}" height="60" rx="30" fill="${C.ink}"/>${rollers}<path d="M ${-len / 2 + 60} 30 L ${-len / 2 + 60} 140 M ${len / 2 - 60} 30 L ${len / 2 - 60} 140" ${INK} stroke-width="12"/>`;
}
export function appIcon(col, glyph = "", s = 1) {
  return `<rect x="-55" y="-55" width="110" height="110" rx="26" fill="${col}" ${K}/>${txt(0, 4, glyph, 54, C.white, { font: "bold" })}`;
}
export function chartLine(points, col = C.olive, w = 10, id = "") {
  return `<path ${id ? `id="${id}"` : ""} d="M ${points.map((p) => p.join(" ")).join(" L ")}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
export function axes(w = 900, h = 500) {
  return `<path d="M 0 ${-h} L 0 0 L ${w} 0" fill="none" ${K}/><path d="M -12 ${-h + 16} L 0 ${-h} L 12 ${-h + 16} M ${w - 16} -12 L ${w} 0 L ${w - 16} 12" fill="none" ${K3}/>`;
}
export function counter(w = 700) {
  return `<rect x="${-w / 2}" y="-200" width="${w}" height="200" fill="${C.wood}" ${K}/><rect x="${-w / 2 - 20}" y="-220" width="${w + 40}" height="30" fill="${C.woodDk}" ${K}/>
  <path d="M ${-w / 2 + 40} -120 C ${-w / 4} -130 ${w / 4} -110 ${w / 2 - 40} -122" fill="none" stroke="${C.woodDk}" stroke-width="3"/>`;
}
export function magicHat() {
  return `<ellipse cx="0" cy="-10" rx="150" ry="30" fill="${C.ink}"/><path d="M -100 -14 L -90 -240 L 90 -240 L 100 -14 Z" fill="${C.ink}"/><rect x="-96" y="-90" width="192" height="30" fill="${C.red}"/><ellipse cx="0" cy="-240" rx="90" ry="20" fill="#3A3532" ${K3}/>`;
}
export function storm() {
  return `<g fill="${C.grey}" ${K}><circle cx="-80" cy="-40" r="70"/><circle cx="20" cy="-80" r="90"/><circle cx="120" cy="-40" r="70"/><rect x="-150" y="-40" width="340" height="70" rx="30"/></g>
  <path d="M -150 -40 L 190 -40" stroke="${C.grey}" stroke-width="60"/><path d="M 10 30 L -30 120 L 20 110 L -20 210" fill="none" stroke="${C.gold}" stroke-width="16" stroke-linejoin="round"/>`;
}
export function sun() {
  return `${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const a = (i / 10) * Math.PI * 2; return `<path d="M ${Math.cos(a) * 90} ${Math.sin(a) * 90} L ${Math.cos(a) * 130} ${Math.sin(a) * 130}" stroke="${C.mustard}" stroke-width="12" stroke-linecap="round"/>`; }).join("")}<circle r="70" fill="${C.gold}" ${K}/>`;
}
export function check(s = 1, col = C.olive) {
  return `<path transform="scale(${s})" d="M -50 0 L -14 36 L 56 -44" fill="none" stroke="${col}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>`;
}
export function cross(s = 1, col = C.red) {
  return `<path transform="scale(${s})" d="M -46 -46 L 46 46 M 46 -46 L -46 46" fill="none" stroke="${col}" stroke-width="20" stroke-linecap="round"/>`;
}
export function stampSvg(text, col = C.red, size = 64, rot = -10) {
  const w = text.length * size * 0.72 + 70;
  return `<g transform="rotate(${rot})" opacity="0.92"><rect x="${-w / 2}" y="${-size * 0.85}" width="${w}" height="${size * 1.7}" rx="12" fill="none" stroke="${col}" stroke-width="10"/>
  <rect x="${-w / 2 + 12}" y="${-size * 0.85 + 12}" width="${w - 24}" height="${size * 1.7 - 24}" rx="6" fill="none" stroke="${col}" stroke-width="4"/>${txt(0, 4, text, size, col, { font: "bold" })}</g>`;
}
export function ring() {
  return `<rect x="-560" y="-30" width="1120" height="30" fill="${C.slateDk}" ${K}/>${[-540, 540].map((x) => `<rect x="${x - 12}" y="-300" width="24" height="280" fill="${C.ink}"/>`).join("")}
  ${[-240, -170, -100].map((y, i) => `<path d="M -540 ${y} L 540 ${y}" stroke="${[C.red, C.white, C.slate][i]}" stroke-width="8"/>`).join("")}`;
}
export function ghost(svgInner) {
  return `<g opacity="0.35" stroke-dasharray="10 12">${svgInner}</g>`;
}
export function clipboard(rows = [], o = {}) {
  const h = rows.length * 64 + 120, W = o.w || 520;
  return `<rect x="${-W / 2}" y="${-h}" width="${W}" height="${h}" rx="14" fill="${C.wood}" ${K}/><rect x="${-W / 2 + 24}" y="${-h + 40}" width="${W - 48}" height="${h - 64}" fill="${C.white}" ${K3}/>
  <rect x="-60" y="${-h - 16}" width="120" height="44" rx="10" fill="${C.grey}" ${K3}/>
  ${rows.map((r, i) => `${txt(-W / 2 + 50, -h + 100 + i * 64, r[0], 32, C.ink, { font: "bold", anchor: "start" })}${txt(W / 2 - 50, -h + 100 + i * 64, r[1], 32, r[2] || C.ink, { font: "mono", anchor: "end" })}`).join("")}${o.inner || ""}`;
}
export function cards3(labels = ["1", "2", "3"], faceUp = []) {
  return labels.map((l, i) => at(-300 + i * 300, 0, 1, `<rect x="-110" y="-300" width="220" height="300" rx="18" fill="${faceUp[i] ? C.white : C.slateDk}" ${K}/>${faceUp[i] ? faceUp[i] : `<circle cx="0" cy="-150" r="60" fill="none" stroke="${C.slate}" stroke-width="8"/>${txt(0, -146, l, 80, C.white, { font: "bold" })}`}`)).join("");
}
export function speedLines(n = 6, len = 200) {
  let s = "";
  for (let i = 0; i < n; i++) s += `<path d="M 0 ${i * 30} L ${-len + (i % 2) * 60} ${i * 30}" stroke="${C.ink}" stroke-width="4" stroke-linecap="round" opacity="0.5"/>`;
  return s;
}
export function sparkles(n = 5, r = 160) {
  let s = "";
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + 0.4; s += at(Math.cos(a) * r, Math.sin(a) * r * 0.7, 0.6 + (i % 2) * 0.4, `<path d="M 0 -20 L 5 -5 L 20 0 L 5 5 L 0 20 L -5 5 L -20 0 L -5 -5 Z" fill="${C.gold}" ${K3}/>`); }
  return s;
}
export function confetti(n = 24, w = 1400, h = 500, seed = 3) {
  let s = "", x = seed;
  const cols = [C.terra, C.mustard, C.olive, C.slate, C.red];
  for (let i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; const px = (x / 233280) * w - w / 2; x = (x * 9301 + 49297) % 233280; const py = (x / 233280) * h - h; s += `<rect x="${px.toFixed(0)}" y="${py.toFixed(0)}" width="18" height="30" rx="3" fill="${cols[i % 5]}" transform="rotate(${(i * 37) % 180} ${px.toFixed(0)} ${py.toFixed(0)})"/>`; }
  return s;
}
