// Shared helpers for PesaBrain Shorts (1080x1920). Stage: x 48-900, y 430-1240, visual centre x = 470.
import { C, at, txt, bean, brain, calc } from "../../moneybrain/tools/kit.mjs";
export * from "../../moneybrain/tools/kit.mjs";
export const G = 1240, CX = 470;
export const B = (S, o, x, s = 1, opt = {}) => S.put(bean(o), x, G, s, { idle: true, ...opt });
export const BR = (S, o, x, s = 1, opt = {}) => S.put(brain(o), x, G, s, { idle: true, ...opt });
export const PC = (S, o, x, s = 1, opt = {}) => S.put(calc(o), x, G, s, { idle: true, ...opt });
export const big = (t, col = C.ink, size = 150) => txt(0, 0, t, size, col, { font: "bold", extra: `stroke="${C.ink}" stroke-width="7" paint-order="stroke"` });
// the comment sticky note: points down-right toward YouTube's comment button
export function sticky(lines, o = {}) {
  const w = o.w || 560, h = 70 + lines.length * 62;
  return `<g transform="rotate(${o.rot ?? -3})"><rect x="${-w / 2 + 10}" y="${-h / 2 + 12}" width="${w}" height="${h}" fill="${C.ink}" opacity="0.2"/>
    <rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#F3D86B" stroke="${C.ink}" stroke-width="6"/>
    <rect x="-70" y="${-h / 2 - 18}" width="140" height="36" fill="#E9E1C8" opacity="0.85" transform="rotate(4)"/>
    ${lines.map((l, i) => txt(0, -h / 2 + 62 + i * 62, l, o.size || 52, C.ink, { font: "bold" })).join("")}
    <text x="${-w / 2 + 10}" y="${h / 2 + 10}" font-size="60" text-anchor="middle" dominant-baseline="middle">💬</text>
    <path d="M ${w / 2 - 10} ${h / 2 - 10} q 70 40 90 120" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>
    <path d="M ${w / 2 + 62} ${h / 2 + 92} l 18 22 l 10 -28" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
export function btn(label, col = C.olive, ink = C.ink) {
  const w = Math.max(240, label.length * 34 + 80);
  return `<rect x="${-w / 2}" y="-55" width="${w}" height="110" rx="55" fill="${col}" stroke="${C.ink}" stroke-width="6"/>${txt(0, 4, label, 50, ink, { font: "bold" })}`;
}
