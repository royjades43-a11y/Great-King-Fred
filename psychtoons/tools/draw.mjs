// Drawing kit for the stickman explainer look: big round white head, line limbs,
// a coloured tunic, cream paper world, hand-lettered caps, flat muted palette.
// Everything returns SVG strings in a 1920x1080 space.

export const C = {
  paper: "#F4EBD5",
  paper2: "#EFE3C6",
  ink: "#231F1C",
  terra: "#B8704F",
  olive: "#8E9B6A",
  oliveDk: "#7D8A5B",
  slate: "#8FA7B4",
  slateDk: "#6F8CA0",
  mustard: "#D3A43F",
  wood: "#C68A5B",
  woodDk: "#A56C43",
  stone: "#B8B3A7",
  grey: "#CBC6BC",
  board: "#3D5245",
  white: "#FFFFFF",
  pink: "#E58E8E",
  brain: "#C27A63",
};

const K = `stroke="${C.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"`;
const K3 = `stroke="${C.ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"`;
export { K, K3 };

export const g = (inner, t = "") => (t ? `<g transform="${t}">${inner}</g>` : `<g>${inner}</g>`);
/** An animatable group: the outer group positions, the inner (with the id) is free for GSAP. */
export const pop = (id, cls, inner, x = 0, y = 0, s = 1, rot = 0) =>
  `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><g id="${id}" class="${cls}">${inner}</g></g>`;

export const txt = (x, y, s, size = 48, fill = C.ink, anchor = "middle", extra = "") =>
  `<text x="${x}" y="${y}" font-family="Gochi Hand" font-size="${size}" fill="${fill}" text-anchor="${anchor}" dominant-baseline="middle" ${extra}>${s}</text>`;

export const shadow = (x, y, rx = 80, ry = 14) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.ink}" opacity="0.13"/>`;

/* ---------------- the stickman ---------------- */

const FACES = {
  neutral: `<circle cx="-22" cy="-4" r="6" fill="${C.ink}"/><circle cx="22" cy="-4" r="6" fill="${C.ink}"/>
    <path d="M -12 30 Q 2 38 14 28" fill="none" ${K3}/>`,
  smile: `<path d="M -36 -24 Q -24 -32 -12 -24 M 12 -24 Q 24 -32 36 -24" fill="none" ${K3}/>
    <circle cx="-22" cy="-4" r="6" fill="${C.ink}"/><circle cx="22" cy="-4" r="6" fill="${C.ink}"/>
    <path d="M -18 24 Q 0 42 20 22" fill="none" ${K3}/>`,
  puzzled: `<path d="M -36 -22 Q -24 -26 -12 -22 M 12 -30 Q 24 -40 36 -30" fill="none" ${K3}/>
    <circle cx="-22" cy="-4" r="6" fill="${C.ink}"/><circle cx="22" cy="-6" r="7" fill="${C.ink}"/>
    <path d="M -16 30 L 18 26" fill="none" ${K3}/>
    <path d="M 0 29 Q 2 46 12 44 Q 18 40 14 27" fill="${C.pink}" ${K3}/>`,
  worried: `<path d="M -38 -18 L -12 -28 M 12 -28 L 38 -18" fill="none" ${K3}/>
    <circle cx="-22" cy="-2" r="6" fill="${C.ink}"/><circle cx="22" cy="-2" r="6" fill="${C.ink}"/>
    <path d="M -18 36 Q -9 26 0 34 Q 9 42 18 32" fill="none" ${K3}/>`,
  sad: `<path d="M -36 -16 L -12 -24 M 12 -24 L 36 -16" fill="none" ${K3}/>
    <circle cx="-22" cy="0" r="5.5" fill="${C.ink}"/><circle cx="22" cy="0" r="5.5" fill="${C.ink}"/>
    <path d="M -14 36 Q 0 26 14 36" fill="none" ${K3}/>`,
  content: `<path d="M -32 -4 Q -22 6 -12 -4 M 12 -4 Q 22 6 32 -4" fill="none" ${K3}/>
    <path d="M -14 26 Q 2 38 18 24" fill="none" ${K3}/>`,
  shocked: `<path d="M -38 -30 Q -24 -40 -10 -32 M 10 -32 Q 24 -40 38 -30" fill="none" ${K3}/>
    <circle cx="-22" cy="-6" r="9" fill="${C.ink}"/><circle cx="22" cy="-6" r="9" fill="${C.ink}"/>
    <ellipse cx="0" cy="34" rx="11" ry="14" fill="${C.ink}"/>`,
  thinking: `<path d="M -36 -22 Q -24 -28 -12 -24 M 12 -30 Q 24 -36 36 -28" fill="none" ${K3}/>
    <circle cx="-20" cy="-4" r="6" fill="${C.ink}"/><circle cx="24" cy="-6" r="6" fill="${C.ink}"/>
    <path d="M -8 32 Q 6 28 18 32" fill="none" ${K3}/>`,
  happy: `<path d="M -32 -2 Q -22 -14 -12 -2 M 12 -2 Q 22 -14 32 -2" fill="none" ${K3}/>
    <path d="M -22 20 Q 0 50 24 18 Z" fill="${C.ink}" ${K3}/>`,
};

const HAIR = {
  tuft: `<path d="M -14 -70 Q -12 -98 4 -80 M 0 -72 Q 10 -100 22 -76" fill="none" ${K3}/>`,
  quiff: `<path d="M -30 -64 Q -20 -100 14 -86 Q 0 -80 6 -70 Q 26 -96 40 -60" fill="${C.white}" ${K3}/>`,
  kid: `<path d="M -68 -14 Q -74 -82 0 -80 Q 74 -82 68 -14 Q 56 -50 10 -50 Q -6 -40 -24 -52 Q -50 -44 -68 -14 Z" fill="#6B4B35" ${K3}/>`,
  granny: `<circle cx="0" cy="-84" r="22" fill="${C.grey}" ${K3}/>
    <path d="M -70 0 Q -78 -76 0 -76 Q 78 -76 70 0 Q 60 -46 18 -48 Q 0 -36 -18 -48 Q -60 -46 -70 0 Z" fill="${C.grey}" ${K3}/>`,
  grandpa: `<ellipse cx="-68" cy="-6" rx="13" ry="22" fill="${C.grey}" ${K3}/><ellipse cx="68" cy="-6" rx="13" ry="22" fill="${C.grey}" ${K3}/>
    <path d="M -24 -46 Q 0 -54 24 -46" fill="none" ${K3}/>`,
  none: "",
};

// arm paths from shoulders (-38,-245) / (38,-245); returns [leftPath, leftHand, rightPath, rightHand]
const ARMS = {
  down: [[-38, -245, -60, -190, -66, -138], [38, -245, 60, -190, 66, -138]],
  out: [[-38, -245, -96, -200, -112, -176], [38, -245, 96, -200, 112, -176]],
  shrug: [[-38, -245, -86, -192, -126, -230], [38, -245, 86, -192, 126, -230]],
  chin: [[-38, -245, -82, -200, -28, -266], [38, -245, 60, -190, 66, -138]],
  cheeks: [[-38, -245, -96, -220, -64, -300], [38, -245, 96, -220, 64, -300]],
  point: [[-38, -245, -60, -190, -66, -138], [38, -245, 100, -250, 150, -262]],
  pointL: [[-38, -245, -100, -250, -150, -262], [38, -245, 60, -190, 66, -138]],
  phone: [[-38, -245, -104, -262, -70, -324], [38, -245, 60, -190, 66, -138]],
  hold: [[-38, -245, -70, -170, -10, -196], [38, -245, 100, -250, 150, -262]],
  write: [[-38, -245, -80, -190, -40, -150], [38, -245, 70, -180, 20, -146]],
  reach: [[-38, -245, -60, -190, -66, -138], [38, -245, 100, -190, 150, -150]],
  behind: [[-38, -245, -106, -300, -58, -352], [38, -245, 106, -300, 58, -352]],
  wave: [[-38, -245, -60, -190, -66, -138], [38, -245, 110, -280, 120, -360]],
};

function arm([x0, y0, x1, y1, x2, y2]) {
  return `<path d="M ${x0} ${y0} Q ${x1} ${y1} ${x2} ${y2}" fill="none" ${K}/>
    <circle cx="${x2}" cy="${y2}" r="10" fill="${C.white}" ${K3}/>`;
}

/**
 * A stickman whose feet sit on (0,0). Height ~410 at scale 1.
 * o: { shirt, face, arms, hair, coat, tie, legs:'stand'|'none', inHand:'' svg drawn above the arms,
 *      behindArms:'' svg drawn under the arms }
 */
export function man(o = {}) {
  const shirt = o.shirt || C.olive;
  const face = FACES[o.face || "neutral"];
  const hair = HAIR[o.hair || "none"];
  const arms = ARMS[o.arms || "down"];
  const tilt = o.tilt || 0;
  const legs =
    o.legs === "none"
      ? ""
      : `<path d="M -16 -132 L -22 -10 M 16 -132 L 22 -10" fill="none" ${K}/>
    <ellipse cx="-30" cy="-6" rx="18" ry="8" fill="${C.white}" ${K3}/>
    <ellipse cx="30" cy="-6" rx="18" ry="8" fill="${C.white}" ${K3}/>`;
  const shirtSleeves = `<path d="M -40 -258 Q 0 -266 40 -258 L 52 -200 L 38 -196 L 44 -128 L -44 -128 L -38 -196 L -52 -200 Z" fill="${shirt}" ${K}/>`;
  const coat = o.coat
    ? `<path d="M -42 -258 Q 0 -266 42 -258 L 56 -200 L 42 -196 L 52 -100 L -52 -100 L -42 -196 L -56 -200 Z" fill="${o.coat}" ${K}/>
       <path d="M -10 -256 L 0 -200 L 10 -256 M 0 -200 L 0 -104" fill="none" ${K3}/>`
    : "";
  const tie = o.tie
    ? `<path d="M -6 -256 L 6 -256 L 10 -200 L 0 -186 L -10 -200 Z" fill="${C.ink}"/>
       <path d="M -24 -258 L 0 -236 L 24 -258" fill="none" ${K3}/>`
    : "";
  const drops = o.sweat
    ? `<path d="M -100 -380 Q -108 -364 -100 -358 Q -92 -364 -100 -380 Z" fill="${C.slate}" ${K3}/>
       <path d="M 96 -350 Q 88 -334 96 -328 Q 104 -334 96 -350 Z" fill="${C.slate}" ${K3}/>
       <path d="M 108 -310 Q 102 -298 108 -294 Q 114 -298 108 -310 Z" fill="${C.slate}" ${K3}/>`
    : "";
  return `${o.noShadow ? "" : shadow(0, 0, 90, 16)}
  ${legs}
  ${coat || shirtSleeves}${tie}
  ${o.behindArms || ""}
  <g transform="translate(0 -330) rotate(${tilt})">
    <circle cx="0" cy="0" r="72" fill="url(#HEAD)" ${K}/>
    ${hair}
    <g transform="translate(${o.look || 0} 0)">${face}</g>
  </g>
  ${arm(arms[0])}${arm(arms[1])}
  ${o.inHand || ""}
  ${drops}`;
}

/* ---------------- props ---------------- */

export function cloud(cx, cy, rx, ry, tx, ty, inner = "") {
  // a thought bubble: lumpy outline, then trailing dots towards (tx,ty)
  const n = 9;
  let ring = "",
    fill = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = cx + Math.cos(a) * rx * 0.78;
    const y = cy + Math.sin(a) * ry * 0.72;
    const r = (Math.min(rx, ry) * 0.42 * (1 + 0.18 * Math.sin(i * 2.3))).toFixed(1);
    ring += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${C.white}" ${K}/>`;
    fill += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r - 4}" fill="${C.white}"/>`;
  }
  const core = `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.85}" ry="${ry * 0.8}" fill="${C.white}"/>`;
  let dots = "";
  [0.55, 0.75, 0.9].forEach((k, i) => {
    const x = cx + (tx - cx) * k,
      y = cy + (ty - cy) * k;
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${16 - i * 5}" fill="${C.white}" ${K3}/>`;
  });
  return `${dots}${ring}${fill}${core}${inner}`;
}

export function ruler(x, y, w, h, label, size = 56) {
  let ticks = "";
  const step = w / 44;
  for (let i = 1; i < 44; i++) {
    const len = i % 5 === 0 ? h * 0.3 : h * 0.17;
    ticks += `M ${(x + i * step).toFixed(1)} ${y} L ${(x + i * step).toFixed(1)} ${(y + len).toFixed(1)} `;
  }
  const grain = [0.62, 0.78, 0.9]
    .map(
      (k, i) =>
        `<path d="M ${x + 12} ${y + h * k} C ${x + w * 0.3} ${y + h * k - 8} ${x + w * 0.6} ${y + h * k + 10} ${x + w - 14} ${y + h * k - 4}" fill="none" stroke="${C.woodDk}" stroke-width="2.5" opacity="${0.7 - i * 0.15}"/>`,
    )
    .join("");
  return `<rect x="${x + 6}" y="${y + 8}" width="${w}" height="${h}" rx="6" fill="${C.ink}" opacity="0.15"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${C.wood}" ${K}/>
  ${grain}<path d="${ticks}" fill="none" ${K3}/>
  ${txt(x + w / 2, y + h * 0.62, label, size)}`;
}

export function armchair(s = 1, col = C.terra) {
  return g(
    `${shadow(0, 2, 150, 18)}
    <rect x="-100" y="-230" width="200" height="170" rx="40" fill="${col}" ${K}/>
    <rect x="-100" y="-96" width="200" height="56" rx="16" fill="${col}" ${K}/>
    <rect x="-142" y="-150" width="58" height="130" rx="28" fill="${col}" ${K}/>
    <rect x="84" y="-150" width="58" height="130" rx="28" fill="${col}" ${K}/>
    <rect x="-124" y="-48" width="248" height="38" rx="10" fill="${col}" ${K}/>
    <path d="M -104 -10 L -104 4 M 104 -10 L 104 4" fill="none" ${K}/>`,
    `scale(${s})`,
  );
}

export function books(x, y, cols = [C.terra, C.olive, C.slate, C.mustard, C.oliveDk, C.terra]) {
  let b = "",
    cx = x;
  cols.forEach((c, i) => {
    const h = 70 + ((i * 37) % 30),
      w = 24 + ((i * 13) % 12);
    b += `<rect x="${cx}" y="${y - h}" width="${w}" height="${h}" rx="3" fill="${c}" ${K3}/>`;
    cx += w + 3;
  });
  return b;
}

export function door(x, y, w, h, { open = false, label = "", glass = true } = {}) {
  const frame = `<rect x="${x - 16}" y="${y - 16}" width="${w + 32}" height="${h + 16}" fill="${C.wood}" ${K}/>`;
  const dark = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#4A4542" ${K}/>`;
  const leafW = open ? w * 0.45 : w;
  const leaf = `<path d="M ${x} ${y} L ${x + leafW} ${y + (open ? -10 : 0)} L ${x + leafW} ${y + h + (open ? 10 : 0)} L ${x} ${y + h} Z" fill="${C.wood}" ${K}/>
   <path d="M ${x + 20} ${y + h * 0.55} C ${x + leafW * 0.4} ${y + h * 0.6} ${x + leafW * 0.6} ${y + h * 0.5} ${x + leafW - 20} ${y + h * 0.58} M ${x + 26} ${y + h * 0.8} C ${x + leafW * 0.5} ${y + h * 0.76} ${x + leafW * 0.7} ${y + h * 0.84} ${x + leafW - 24} ${y + h * 0.79}" fill="none" stroke="${C.woodDk}" stroke-width="2.5"/>
   ${glass && !open ? `<rect x="${x + w * 0.14}" y="${y + h * 0.07}" width="${w * 0.72}" height="${h * 0.36}" fill="${C.board}" ${K}/><path d="M ${x + w * 0.25} ${y + h * 0.2} l 60 -40 M ${x + w * 0.3} ${y + h * 0.3} l 90 -60" stroke="#6E8577" stroke-width="3" fill="none"/>` : ""}
   <circle cx="${x + leafW - 26}" cy="${y + h * 0.55}" r="10" fill="${C.grey}" ${K3}/>
   ${label ? txt(x + leafW / 2, y + h * 0.2, label, 44, C.ink, "middle", `transform="rotate(90 ${x + leafW / 2} ${y + h * 0.2})"`) : ""}`;
  return `${frame}${open ? dark : ""}${leaf}`;
}

export function blockArrow(x, y, len, col = C.terra, h = 52) {
  return `<path d="M ${x} ${y - h * 0.3} L ${x + len - h * 0.8} ${y - h * 0.3} L ${x + len - h * 0.8} ${y - h * 0.8} L ${x + len} ${y} L ${x + len - h * 0.8} ${y + h * 0.8} L ${x + len - h * 0.8} ${y + h * 0.3} L ${x} ${y + h * 0.3} Z" fill="${col}"/>`;
}

export function thinArrow(x0, y0, x1, y1, bend = 0) {
  const mx = (x0 + x1) / 2 + bend,
    my = (y0 + y1) / 2 - Math.abs(bend) * 0.3;
  const a = Math.atan2(y1 - my, x1 - mx);
  const hx = (d) => (x1 - 26 * Math.cos(a + d)).toFixed(1),
    hy = (d) => (y1 - 26 * Math.sin(a + d)).toFixed(1);
  return `<path d="M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1} M ${hx(0.5)} ${hy(0.5)} L ${x1} ${y1} L ${hx(-0.5)} ${hy(-0.5)}" fill="none" ${K3}/>`;
}

export const heartPath = (s = 1) =>
  `M 0 ${20 * s} C ${-44 * s} ${-8 * s} ${-30 * s} ${-42 * s} 0 ${-22 * s} C ${30 * s} ${-42 * s} ${44 * s} ${-8 * s} 0 ${20 * s} Z`;
export const heart = (x, y, s = 1, col = C.terra, stroke = true) =>
  `<path transform="translate(${x} ${y})" d="${heartPath(s)}" fill="${col}" ${stroke ? K3 : ""}/>`;

export function star(x, y, r, col = C.mustard) {
  let p = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    p += `${i ? "L" : "M"} ${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)} `;
  }
  return `<path d="${p}Z" fill="${col}" ${K3}/>`;
}

export function clockIcon(x, y, r) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.paper}" ${K3}/><path d="M ${x} ${y} L ${x} ${y - r * 0.65} M ${x} ${y} L ${x + r * 0.5} ${y + r * 0.2}" fill="none" ${K3}/>`;
}

export function calIcon(x, y, w) {
  const h = w * 0.85;
  let dots = "";
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 4; c++)
      dots += `<rect x="${x - w / 2 + 8 + c * (w - 16) / 4}" y="${y - h / 2 + 22 + r * (h - 30) / 3}" width="${(w - 24) / 4 - 2}" height="${(h - 40) / 3 - 2}" fill="${C.ink}" opacity="0.55"/>`;
  return `<rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="4" fill="${C.white}" ${K3}/><rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="14" fill="${C.slateDk}" ${K3}/>${dots}`;
}

export function phoneIcon(x, y, s = 1, col = C.oliveDk) {
  return `<path transform="translate(${x} ${y}) scale(${s}) rotate(-20)" d="M -14 -34 Q -30 -30 -30 -16 Q -26 14 6 32 Q 22 38 30 26 L 22 12 Q 18 8 12 12 L 4 16 Q -10 8 -14 -8 L -8 -16 Q -4 -22 -8 -26 Z" fill="${col}" ${K3}/>`;
}

export function hourglass(s = 1) {
  return g(
    `<rect x="-60" y="-112" width="120" height="20" rx="8" fill="${C.oliveDk}" ${K}/>
    <rect x="-60" y="92" width="120" height="20" rx="8" fill="${C.oliveDk}" ${K}/>
    <path d="M -46 -92 L 46 -92 Q 40 -20 6 0 Q 40 20 46 92 L -46 92 Q -40 20 -6 0 Q -40 -20 -46 -92 Z" fill="#F7F4EC" opacity="0.9" ${K}/>
    <path d="M -36 -84 L 36 -84 Q 30 -40 0 -20 Q -30 -40 -36 -84 Z" fill="#D9BE8A"/>
    <path d="M -40 88 Q 0 40 40 88 Z" fill="#D9BE8A"/>`,
    `scale(${s})`,
  );
}

export function frame(x, y, w, h, inner) {
  return `<rect x="${x + 8}" y="${y + 10}" width="${w}" height="${h}" fill="${C.ink}" opacity="0.15"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.wood}" ${K}/>
  <rect x="${x + 34}" y="${y + 34}" width="${w - 68}" height="${h - 68}" fill="${C.paper}" ${K3}/>
  <path d="M ${x} ${y} L ${x + 34} ${y + 34} M ${x + w} ${y} L ${x + w - 34} ${y + 34} M ${x} ${y + h} L ${x + 34} ${y + h - 34} M ${x + w} ${y + h} L ${x + w - 34} ${y + h - 34}" ${K3}/>
  ${inner}`;
}

export function envelope(x, y, w, h, label) {
  return `<rect x="${x + 6}" y="${y + 8}" width="${w}" height="${h}" fill="${C.ink}" opacity="0.12"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.paper2}" ${K}/>
  <path d="M ${x} ${y} L ${x + w / 2} ${y + h * 0.55} L ${x + w} ${y} M ${x} ${y + h} L ${x + w * 0.38} ${y + h * 0.42} M ${x + w} ${y + h} L ${x + w * 0.62} ${y + h * 0.42}" fill="none" ${K3}/>
  <circle cx="${x + w / 2}" cy="${y - 4}" r="8" fill="${C.slateDk}" ${K3}/>
  ${txt(x + w / 2, y + h * 0.25, label, 40)}`;
}

export function plant(x, y, s = 1) {
  return g(
    `<path d="M -40 -70 L 40 -70 L 30 0 L -30 0 Z" fill="${C.terra}" ${K}/>
     <rect x="-46" y="-84" width="92" height="18" rx="4" fill="${C.terra}" ${K}/>
     ${[
       [-60, -200, -20],
       [0, -250, 0],
       [55, -210, 20],
       [-80, -140, -40],
       [80, -150, 40],
     ]
       .map(
         ([lx, ly]) =>
           `<path d="M 0 -84 Q ${lx * 0.3} ${(ly - 84) / 2} ${lx} ${ly}" fill="none" stroke="${C.oliveDk}" stroke-width="5"/>
            <path d="M ${lx} ${ly} q ${-28} ${30} ${lx * 0.1} ${60} q ${30} ${-30} ${-lx * 0.1} ${-60} Z" fill="${C.olive}" ${K3}/>`,
       )
       .join("")}`,
    `translate(${x} ${y}) scale(${s})`,
  );
}

/* ---------------- backgrounds ---------------- */

export function wall(floorY = 900, floor = C.olive, { planks = false, line = true } = {}) {
  let pl = "";
  if (planks)
    for (let i = 0; i < 7; i++)
      pl += `<path d="M ${-20 + i * 300} ${floorY + 30 + (i % 3) * 40} C ${120 + i * 300} ${floorY + 20 + (i % 3) * 40} ${200 + i * 300} ${floorY + 46 + (i % 3) * 40} ${300 + i * 300} ${floorY + 34 + (i % 3) * 40}" fill="none" stroke="${C.woodDk}" stroke-width="3" opacity="0.6"/>`;
  return `<rect x="0" y="0" width="1920" height="1080" fill="${C.paper}"/>
  <rect x="0" y="${floorY}" width="1920" height="${1080 - floorY}" fill="${floor}"/>
  ${pl}${line ? `<path d="M -10 ${floorY} L 1930 ${floorY}" ${K}/>` : ""}`;
}

export function bands(list) {
  // list of [y0, y1, color]
  return list.map(([a, b, c]) => `<rect x="0" y="${a}" width="1920" height="${b - a}" fill="${c}"/>`).join("");
}
