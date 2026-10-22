// Line icons, viewBox 0 0 200 200 (balance: 600x420). Class "s" = ink stroke, "f" = ink fill.
// pathLength="1" lets the "draw" entrance stroke them on.
const P = (d, cls = "s") => `<path class="${cls}" pathLength="1" d="${d}"/>`;

const ICONS = {
  question: `${P("M62 66 Q62 24 102 24 Q142 24 142 62 Q142 88 104 102 L104 128", "s alm-s")}<circle class="alm-f" cx="104" cy="166" r="11"/>`,
  halo: `<ellipse class="s a2" pathLength="1" cx="100" cy="100" rx="78" ry="20"/>`,
  crown: `${P("M28 150 L28 70 L68 108 L100 46 L132 108 L172 70 L172 150 Z", "s a2")}`,
  split: `${P("M100 40 L100 160")}${P("M80 100 L20 100 M44 76 L20 100 L44 124", "s acc-s")}${P("M120 100 L180 100 M156 76 L180 100 L156 124", "s acc-s")}`,
  hourglass: `${P("M50 20 L150 20 M50 180 L150 180 M60 20 Q60 80 100 100 Q140 120 140 180 M140 20 Q140 80 100 100 Q60 120 60 180")}`,
  stone: `${P("M20 50 Q20 30 40 30 L160 30 Q180 30 180 50 L180 170 Q180 186 164 186 L36 186 Q20 186 20 170 Z")}`
    + `${P("M100 62 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0 M100 76 L100 124 M100 124 L84 156 M100 124 L116 156 M100 90 L80 112 M100 90 L120 112", "s")}`
    + `${P("M150 36 L138 64 L152 80")}`,
  arrowDown: `${P("M100 20 L100 170 M50 120 L100 172 L150 120")}`,
  checklist: `${P("M36 20 L164 20 Q176 20 176 32 L176 176 Q176 186 164 186 L36 186 Q24 186 24 176 L24 32 Q24 20 36 20 Z")}`
    + `${P("M48 66 L60 78 L82 54", "s acc-s")}${P("M100 66 L150 66")}`
    + `${P("M48 112 L60 124 L82 100", "s acc-s")}${P("M100 112 L150 112")}`
    + `${P("M48 158 L60 170 L82 146", "s acc-s")}${P("M100 158 L150 158")}`,
  wall: `${P("M14 40 L186 40 L186 180 L14 180 Z")}${P("M14 87 L186 87 M14 134 L186 134 M70 40 L70 87 M130 40 L130 87 M44 87 L44 134 M100 87 L100 134 M156 87 L156 134 M70 134 L70 180 M130 134 L130 180")}`,
  heartbeat: `${P("M10 110 L60 110 L76 70 L96 160 L116 40 L134 130 L146 110 L190 110", "s alm-s")}`,
  calm: `${P("M10 110 L60 110 Q80 96 100 110 Q120 124 140 110 L190 110", "s acc-s")}`,
  bolt: `${P("M118 14 L52 112 L100 112 L82 186 L150 82 L102 82 Z", "s alm-s")}`,
  wave: `${P("M10 120 Q35 90 60 120 Q85 150 110 120 Q135 90 160 120 Q178 140 190 128")}${P("M10 160 Q35 130 60 160 Q85 190 110 160 Q135 130 160 160 Q178 180 190 168")}${P("M10 80 Q35 50 60 80 Q85 110 110 80 Q135 50 160 80 Q178 100 190 88")}`,
  house: `${P("M24 96 L100 30 L176 96 M44 80 L44 178 L156 178 L156 80")}`,
  shield: `${P("M100 18 L168 44 Q170 124 100 184 Q30 124 32 44 Z", "s acc-s")}${P("M70 100 L92 122 L134 78", "s acc-s")}`,
  alarm: `${P("M100 30 Q150 30 150 96 L150 136 L168 156 L32 156 L50 136 L50 96 Q50 30 100 30 Z", "s alm-s")}${P("M84 172 Q100 188 116 172", "s alm-s")}${P("M24 46 L10 34 M176 46 L190 34 M16 92 L2 92 M184 92 L198 92", "s alm-s")}`,
  pause: `<rect class="f" style="fill:var(--accent)" x="52" y="36" width="34" height="128" rx="10"/><rect class="f" style="fill:var(--accent)" x="114" y="36" width="34" height="128" rx="10"/>`,
  thumbsUp: `${P("M56 92 L56 180 L22 180 L22 92 Z", "s acc-s")}${P("M56 92 L92 30 Q112 30 110 56 L104 84 L164 84 Q184 86 178 108 L164 164 Q158 180 140 180 L56 180", "s acc-s")}`,
  loop: `${P("M150 70 A60 60 0 1 0 160 120", "s alm-s")}${P("M128 64 L152 70 L150 44", "s alm-s")}`,
  breath: `${P("M20 70 L120 70 Q150 70 150 46 Q150 26 130 26 Q112 26 112 44")}${P("M20 110 L160 110 Q186 110 186 136 Q186 160 162 160 Q140 160 140 140")}${P("M20 150 L90 150")}`,
  door: `${P("M50 20 L150 20 L150 186 L50 186 Z")}${P("M126 104 L126 112")}`,
  scribble: `${P("M20 100 Q40 40 60 100 Q80 160 100 100 Q120 40 140 100 Q160 160 180 100", "s alm-s")}${P("M30 60 L60 30 M170 60 L140 30 M100 30 L100 10", "s alm-s")}`,
  check: `${P("M30 104 L80 154 L172 50", "s acc-s")}`,
  cross: `${P("M40 40 L160 160 M160 40 L40 160", "s alm-s")}`,
  quiet: `${P("M100 20 Q160 20 160 80 Q160 140 100 140 L70 140 L40 176 L48 136 Q40 126 40 80 Q40 20 100 20 Z")}${P("M76 80 L124 80")}`,
  brain: `${P("M100 40 Q70 18 50 44 Q22 50 28 84 Q12 108 34 130 Q36 162 70 162 Q88 182 100 160 Q112 182 130 162 Q164 162 166 130 Q188 108 172 84 Q178 50 150 44 Q130 18 100 40 Z")}${P("M100 40 L100 160 M60 80 Q80 90 70 110 M140 80 Q120 90 130 110")}`,
  heart: `<path class="f" d="M100 176 C40 130 16 100 16 66 C16 38 38 20 62 20 C80 20 94 30 100 46 C106 30 120 20 138 20 C162 20 184 38 184 66 C184 100 160 130 100 176 Z"/>`,
  bubble: `<svg viewBox="0 0 280 200" preserveAspectRatio="none"><path class="s card-f" pathLength="1" d="M40 14 L240 14 Q266 14 266 40 L266 130 Q266 156 240 156 L110 156 L66 190 L74 156 L40 156 Q14 156 14 130 L14 40 Q14 14 40 14 Z"/></svg>`,
};

export function iconSvg(name, pid = "") {
  if (name === "balance") {
    // pivot at (300,120); pans hang from the beam ends at (90,120) and (510,120)
    const pan = (id, x, label) => `<g id="${pid}-${id}"><path class="s" d="M${x} 120 L${x - 70} 250 M${x} 120 L${x + 70} 250"/><path class="s card-f" d="M${x - 92} 250 L${x + 92} 250 Q${x + 80} 300 ${x} 300 Q${x - 80} 300 ${x - 92} 250 Z"/><text class="t" x="${x}" y="286">${label}</text></g>`;
    return `<svg viewBox="0 0 600 420"><path class="s" d="M300 120 L300 396 M220 400 L380 400"/>`
      + `<g id="${pid}-beam"><path class="s" d="M70 120 L530 120"/>${pan("panL", 90, "YOU")}${pan("panR", 510, "THEM")}</g>`
      + `<circle class="f" cx="300" cy="120" r="16"/></svg>`;
  }
  if (name === "bubble") return ICONS.bubble;
  const body = ICONS[name];
  if (!body) throw new Error(`unknown icon ${name}`);
  return `<svg viewBox="0 0 200 200">${body}</svg>`;
}
