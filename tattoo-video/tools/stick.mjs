// Stickman rig. viewBox 300x520: head centre (150,80), shoulders (150,160), hips (150,300).
// Each arm is upper + lower segment rotating about shoulder and elbow; 0° hangs straight down,
// positive rotates clockwise on screen. Poses are joint angles; the scene runtime eases between them.
export const POSES = {
  _org: { aLu: "150 160", aLl: "150 255", aRu: "150 160", aRl: "150 255", hd: "150 140" },
  idle:        { aLu: 14,  aLl: -4,   aRu: -14,  aRl: 4 },
  happy:       { aLu: 28,  aLl: 10,   aRu: -28,  aRl: -10, hd: 0 },
  headDown:    { aLu: 6,   aLl: 0,    aRu: -6,   aRl: 0,   hd: 0,  hy: 16 },
  point:       { aLu: 14,  aLl: -4,   aRu: -112, aRl: -8 },
  strain:      { aLu: 40,  aLl: -120, aRu: -40,  aRl: 120, hy: 6 },
  shrug:       { aLu: 62,  aLl: -112, aRu: -62,  aRl: 112, hd: 8 },
  holdHead:    { aLu: 150, aLl: -128, aRu: -150, aRl: 128, hy: 6 },
  armsCrossed: { aLu: 24,  aLl: -112, aRu: -24,  aRl: 112, hd: -4 },
  victory:     { aLu: 128, aLl: 22,   aRu: -128, aRl: -22 },
  proud:       { aLu: 44,  aLl: -84,  aRu: -44,  aRl: 84,  hd: 0 },
  sorry:       { aLu: 8,   aLl: 0,    aRu: -22,  aRl: 128, hy: 12 },
  give:        { aLu: 10,  aLl: 0,    aRu: -78,  aRl: -10, hd: 4 },
};
export const MOUTHS = ["neutral", "smile", "frown", "o", "tight"];

const mouthPaths = {
  neutral: `<path class="s" d="M132 102 L168 102"/>`,
  smile: `<path class="s" d="M128 96 Q150 120 172 96"/>`,
  frown: `<path class="s" d="M130 110 Q150 92 170 110"/>`,
  o: `<ellipse class="s" cx="150" cy="104" rx="9" ry="11"/>`,
  tight: `<path class="s" d="M136 104 L164 100"/>`,
};

export function stickSvg(pid, el) {
  const s = el.scale ?? 1;
  const flip = el.flip ? ` transform="translate(300,0) scale(-1,1)"` : "";
  const bow = el.variant === "bow"
    ? `<path class="bow" d="M178 34 L206 18 L204 50 Z"/><path class="bow" d="M178 34 L196 6 L210 28 Z"/><circle class="f" cx="182" cy="34" r="7"/>`
    : "";
  return `<svg class="stick" id="${pid}-svg" width="${300 * s}" height="${520 * s}" viewBox="0 0 300 520">
  <ellipse class="ground" cx="150" cy="496" rx="92" ry="12"/>
  <g${flip}>
    <path class="s" d="M150 140 L150 300"/>
    <path class="s" d="M150 300 L106 492"/><path class="s" d="M150 300 L194 492"/>
    <g id="${pid}-aLu"><path class="s" d="M150 160 L150 255"/><g id="${pid}-aLl"><path class="s" d="M150 255 L150 340"/></g></g>
    <g id="${pid}-aRu"><path class="s" d="M150 160 L150 255"/>${el.tattoo ? `<path class="tat" d="M150 196 C138 182 124 196 150 222 C176 196 162 182 150 196 Z"/>` : ""}<g id="${pid}-aRl"><path class="s" d="M150 255 L150 340"/></g></g>
    <g id="${pid}-hd">
      <circle class="s face" cx="150" cy="80" r="56"/>${bow}
      <g class="eye"><circle class="f" cx="131" cy="74" r="7"/><circle class="f" cx="169" cy="74" r="7"/></g>
      ${MOUTHS.map((m) => `<g id="${pid}-m-${m}">${mouthPaths[m]}</g>`).join("")}
    </g>
  </g>
</svg>`;
}
