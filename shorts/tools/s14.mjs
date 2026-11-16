// Short 14 — "The Penny Question" (viral playbook)
import { C, txt, bean, calendar, stampSvg, cross, check, sparkles, arrow, phone, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { personIcon, snowball } from "../../ep03/tools/props3.mjs";

export const CAPFIX = { "5@17": "", ",000.": "$5,000.", "5@24": "", ".3": "$5.3" };
const K = `stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const cash = (n = 6, label = "") => { let s = ""; for (let i = 0; i < n; i++) s += `<rect x="-150" y="${-60 - i * 46}" width="300" height="46" rx="6" fill="${i % 2 ? C.olive : "#9DAA78"}" ${K}/><rect x="-36" y="${-60 - i * 46}" width="72" height="46" fill="${C.oliveDk}" opacity="0.5"/>`; return s + (label ? `<rect x="-170" y="-20" width="340" height="66" rx="12" fill="${C.white}" ${K}/>${txt(0, 14, label, 40, C.ink, { font: "bold" })}` : ""); };
const penny = (s = 1) => `<g transform="scale(${s})"><circle r="60" fill="#C8784A" ${K}/><circle r="44" fill="none" stroke="#9E5A33" stroke-width="5"/>${txt(0, 6, "1¢", 46, C.white, { font: "bold" })}<path d="M -30 -38 Q -10 -50 10 -46" stroke="${C.white}" stroke-width="6" stroke-linecap="round" fill="none" opacity="0.7"/></g>`;
const pile = (n) => { let s = ""; for (let i = 0; i < n; i++) s += `<g transform="translate(${((i * 37) % 7 - 3) * 22} ${-30 - Math.floor(i / 3) * 34})">${penny(0.55)}</g>`; return s; };
// the doubling chart: flat for ages, then a rocket at the end
function chart(upto = 30) {
  const W = 760, H = 560, pts = [];
  for (let d = 1; d <= upto; d++) pts.push(`${(-W / 2 + (d - 1) * W / 29).toFixed(1)},${(-Math.pow(2, d - 1) / Math.pow(2, 29) * H).toFixed(1)}`);
  const m = -H * 100000000 / 536870912;
  return `<path d="M ${-W / 2} 0 L ${W / 2} 0 M ${-W / 2} 0 L ${-W / 2} ${-H - 30}" ${K}/><path d="M ${-W / 2} ${m} L ${W / 2} ${m}" stroke="${C.red}" stroke-width="4" stroke-dasharray="14 10"/>${txt(-W / 2 + 70, m - 26, "$1M", 36, C.red, { font: "bold" })}
    <polyline points="${pts.join(" ")}" fill="none" stroke="${C.olive}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${txt(0, 50, "DAY 1 → DAY 30", 36, C.ink, { font: "bold" })}`;
}
const HOOK = (S, a = "none") => S.put(cash(9, "$1,000,000"), 250, 1200, 1, { anim: a }) + S.put(penny(1.6), 690, 1000, 1, { anim: a, idle: true }) + S.put(`<rect x="-170" y="-40" width="340" height="80" rx="12" fill="${C.white}" ${K}/>` + txt(0, 4, "1¢ × 2 × 30 DAYS", 34, C.ink, { font: "bold" }), 690, 1190, 1, { anim: a }) + S.put(big("VS", C.red, 110), CX, 700, 1, { anim: a === "none" ? "slam" : a, at: 0.5 });

export const BEATS = [
  { at: "A million dollars today", tag: "WHICH ONE DO YOU TAKE?", tagColor: "red", tagSize: 64,
    draw: (S) => HOOK(S) + S.sfx("impact-bass-1", 0.6, 0.3) },
  { at: "Pick one", tag: "PICK ONE 👇", tagColor: "mustard", tagSize: 72,
    draw: (S) => S.put(sticky(["MILLION", "or PENNY?"]), CX, 780, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "point" }, 230, 0.7, { at: "comments" }) },
  { at: "Most people grab the million", tag: "MOST PEOPLE GRAB THE MILLION", tagSize: 56,
    draw: (S) => S.put(cash(9), 650, 1240, 1, { anim: "pop" }) + B(S, { pose: "cheer", face: "joy" }, 650, 0.6, { at: "million" }) + [0, 1, 2, 3].map((i) => S.put(personIcon(C.slate), 110 + i * 110, 1180, 1.1, { anim: "slideL", at: 0.2 + i * 0.15 })).join("") },
  { at: "Here's what the penny does", tag: "WHAT THE PENNY DOES...", tagColor: "slate",
    draw: (S) => S.put(penny(2.2), CX, 820, 1, { anim: "grow" }) },
  { at: "Day 10", tag: "DAY 10: $5.12", tagColor: "white", tagSize: 72,
    draw: (S) => S.put(calendar(10, 5, { title: "DAY 10", cw: 90, head: C.slateDk, mark: () => check(0.6) }), 300, 1000, 0.9, { anim: "pop" }) + S.put(pile(5), 700, 1220, 1, { anim: "rise", at: "Five" }) + S.put(txt(0, 0, "$5", 110, C.oliveDk, { font: "bold" }), 700, 760, 1, { anim: "slam", at: "Five" }) },
  { at: "Day 20", tag: "DAY 20: ~$5,000", tagColor: "white", tagSize: 72,
    draw: (S) => S.put(pile(12), 280, 1220, 1, { anim: "rise" }) + S.put(txt(0, 0, "$5,242", 90, C.oliveDk, { font: "bold" }), 280, 820, 1, { anim: "slam", at: "5" }) + S.put(cash(9), 700, 1240, 0.9, { anim: "none" }) + B(S, { pose: "point", face: "smug" }, 700, 0.5, { at: "wrong" }) },
  { at: "Day 28", tag: "DAY 28: PASSES $1 MILLION", tagColor: "red", tagSize: 60,
    draw: (S) => S.put(chart(28), CX, 1180, 1, { anim: "wipe", d: 1.2 }) + S.put(sparkles(6, 160), 820, 760, 1, { anim: "grow", at: "passes" }) + S.sfx("riser", 0.1, 0.3, 1.2) },
  { at: "Day 30", tag: "DAY 30: $5,368,709", tagColor: "olive", tagSize: 66,
    draw: (S) => S.put(chart(30), CX, 1180, 1, { anim: "none" }) + S.put(big("$5.3M", C.gold, 180), 330, 760, 1, { anim: "slam", at: "million" }) + S.shake(S.t("million") + 0.2, 12) + S.sfx("impact-bass-1", S.t("million") + 0.15, 0.45) + S.sfx("chime", S.t("million") + 0.4, 0.3) },
  { at: "That's compounding", tag: "THAT'S COMPOUNDING", tagColor: "olive",
    draw: (S) => S.put(snowball("$"), 260, 1100, 0.6, { anim: "pop" }) + S.put(arrow(140, C.ink, 40), 430, 1050, 1, { anim: "wipe", at: "compounding" }) + S.put(snowball("$"), 720, 1060, 1.7, { anim: "grow", at: "compounding" }) },
  { at: "Almost all the growth", tag: "ALMOST ALL THE GROWTH IS AT THE END", tagColor: "olive", tagSize: 50,
    draw: (S) => S.put(chart(30), CX, 1180, 1, { anim: "none" }) + S.put(`<ellipse rx="130" ry="230" fill="none" stroke="${C.red}" stroke-width="10"/>`, 780, 930, 1, { anim: "grow", at: "end" }) },
  { at: "And that's exactly where most people quit", tag: "...WHERE MOST PEOPLE QUIT", tagColor: "red",
    draw: (S) => S.put(chart(20), CX, 1180, 1, { anim: "none" }) + S.put(bean({ pose: "shrug", face: "sad", noShadow: true }), 380, 1170, 0.6, { anim: "pop", id: "q" }) + S.js(`tl.to("#${S.id("q")}-i", { x: -260, opacity: 0.2, duration: 1.4 }, ${S.t("give")});`) + S.put(txt(0, 0, "DAY 20", 50, C.red, { font: "bold" }), 330, 640, 1, { anim: "fade", at: "20" }) },
  { at: "So whatever you're growing", tag: "MONEY · SKILLS · A BUSINESS", tagColor: "olive", tagSize: 56,
    draw: (S) => PC(S, { screen: "DAY 20", pose: "up", mouth: "smile" }, 250, 1) + S.put(stampSvg("DON'T JUDGE IT ON DAY 20", C.oliveDk, 40, -8), 610, 760, 1, { anim: "slam", at: "judge" }) + S.sfx("impact-bass-1", S.t("judge") + 0.2, 0.25) },
  { at: "Send this to someone", tag: "SEND THIS TO SOMEONE WHO NEEDS IT", tagColor: "mustard", tagSize: 50,
    draw: (S) => S.put(phone(["SHARE", "", "↗"], { size: 44, w: 300, h: 520, head: C.olive }), 300, 1220, 1, { anim: "pop" }) + B(S, { pose: "wave", face: "happy" }, 700, 0.95) },
  { at: "and ask them", tag: "WHICH ONE DO YOU TAKE?", tagColor: "red", tagSize: 64, tagAt: "ask",
    draw: (S) => HOOK(S, "pop") },
];
