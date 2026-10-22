// Line icons, viewBox 0 0 200 200 (balance: 600x420). Class "s" = ink stroke, "f" = ink fill.
// pathLength="1" lets the "draw" entrance stroke them on.
const P = (d, cls = "s") => `<path class="${cls}" pathLength="1" d="${d}"/>`;

const ICONS = {
  question: `${P("M62 66 Q62 24 102 24 Q142 24 142 62 Q142 88 104 102 L104 128", "s acc-s")}<circle class="f" style="fill:var(--accent)" cx="104" cy="166" r="11"/>`,
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
  heart: `<path class="f" d="M100 176 C40 130 16 100 16 66 C16 38 38 20 62 20 C80 20 94 30 100 46 C106 30 120 20 138 20 C162 20 184 38 184 66 C184 100 160 130 100 176 Z"/>`,
  bubble: `<svg viewBox="0 0 280 200" preserveAspectRatio="none"><path class="s" style="fill:#fff" pathLength="1" d="M40 14 L240 14 Q266 14 266 40 L266 130 Q266 156 240 156 L110 156 L66 190 L74 156 L40 156 Q14 156 14 130 L14 40 Q14 14 40 14 Z"/></svg>`,
};

export function iconSvg(name, pid = "") {
  if (name === "balance") {
    // pivot at (300,120); pans hang from the beam ends at (90,120) and (510,120)
    const pan = (id, x, label) => `<g id="${pid}-${id}"><path class="s" d="M${x} 120 L${x - 70} 250 M${x} 120 L${x + 70} 250"/><path class="s" style="fill:#fff" d="M${x - 92} 250 L${x + 92} 250 Q${x + 80} 300 ${x} 300 Q${x - 80} 300 ${x - 92} 250 Z"/><text class="t" x="${x}" y="286">${label}</text></g>`;
    return `<svg viewBox="0 0 600 420"><path class="s" d="M300 120 L300 396 M220 400 L380 400"/>`
      + `<g id="${pid}-beam"><path class="s" d="M70 120 L530 120"/>${pan("panL", 90, "YOU")}${pan("panR", 510, "THEM")}</g>`
      + `<circle class="f" cx="300" cy="120" r="16"/></svg>`;
  }
  if (name === "bubble") return ICONS.bubble;
  const body = ICONS[name];
  if (!body) throw new Error(`unknown icon ${name}`);
  return `<svg viewBox="0 0 200 200">${body}</svg>`;
}
