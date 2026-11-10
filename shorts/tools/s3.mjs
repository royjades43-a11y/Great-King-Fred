// Short 3 — "The Medium Popcorn Trap"
import { C, at, txt, bean, brain, priceTag, clipboard, letter, stampSvg, cross, check, sparkles, arrow, bubble, G, CX, B, BR, PC, big, sticky } from "./common.mjs";

export const CAPFIX = { "$8": "$8.50", ".50.": "", "counter,": "counter…" };
export function popcorn(s = 1, label = "", col = C.red) {
  const w = 120 * s, h = 190 * s;
  let stripes = "";
  for (let i = -2; i <= 2; i++) stripes += `<path d="M ${i * 28 * s} 0 L ${i * 32 * s} ${-h}" stroke="${C.white}" stroke-width="${16 * s}"/>`;
  let pops = "";
  for (let i = 0; i < 9; i++) pops += `<circle cx="${(-w * 0.9 + i * w * 0.23).toFixed(1)}" cy="${(-h - 14 * s - (i % 3) * 16 * s).toFixed(1)}" r="${(22 * s).toFixed(1)}" fill="#FFF6D8" stroke="${C.ink}" stroke-width="4"/>`;
  return `${pops}<clipPath id="pc${Math.round(s * 100)}${label}"><path d="M ${-w} ${-h} L ${w} ${-h} L ${w * 0.75} 0 L ${-w * 0.75} 0 Z"/></clipPath>
    <path d="M ${-w} ${-h} L ${w} ${-h} L ${w * 0.75} 0 L ${-w * 0.75} 0 Z" fill="${col}"/><g clip-path="url(#pc${Math.round(s * 100)}${label})">${stripes}</g>
    <path d="M ${-w} ${-h} L ${w} ${-h} L ${w * 0.75} 0 L ${-w * 0.75} 0 Z" fill="none" stroke="${C.ink}" stroke-width="6"/>${label ? txt(0, 50, label, 44, C.ink, { font: "bold" }) : ""}`;
}
const HOOK = (S, a = "none") => S.put(popcorn(0.7, "$5"), 190, 1150, 1, { anim: a }) + S.put(popcorn(0.9, "$8.50", C.slateDk), 470, 1150, 1, { anim: a }) + S.put(popcorn(1.1, "$9"), 770, 1150, 1, { anim: a }) +
  S.put(stampSvg("TRAP", C.red, 60, -12), 470, 640, 1, { anim: a });

export const BEATS = [
  { at: "The medium popcorn", tag: "THE MEDIUM IS A TRAP", tagColor: "red",
    draw: (S) => HOOK(S) + S.put(arrow(260, C.olive, 60), 600, 520, 1, { rot: 30, anim: "wipe", at: "large" }) },
  { at: "Small, $5", tag: "SMALL $5 vs LARGE $9",
    draw: (S) => S.put(popcorn(0.75, "$5"), 260, 1150, 1, { anim: "pop" }) + S.put(popcorn(1.15, "$9"), 680, 1150, 1, { anim: "pop", at: "Large" }) + S.put(txt(0, 0, "BIG JUMP", 70, C.red, { font: "bold" }), CX, 560, 1, { anim: "slam", at: "jump" }) },
  { at: "So a lot of people picked the small", tag: "MOST PICK SMALL",
    draw: (S) => S.put(popcorn(0.75, "$5"), 300, 1150, 1, { anim: "none" }) + S.put(check(1.3), 300, 700, 1, { anim: "grow", at: "small" }) + B(S, { pose: "pointL", face: "smile" }, 700, 0.85) },
  { at: "Now add a medium", tag: "NOW... ADD A MEDIUM", tagColor: "slate",
    draw: (S) => S.put(popcorn(0.7, "$5"), 190, 1150, 1, { anim: "none" }) + S.put(popcorn(1.1, "$9"), 770, 1150, 1, { anim: "none" }) + S.put(popcorn(0.9, "$8.50", C.slateDk), 470, 1150, 1, { anim: "drop", at: "medium" }) + S.sfx("pop", S.t("medium") + 0.3, 0.3, 0.5) },
  { at: "Suddenly, the large looks like a steal", tag: "\"ONLY 50¢ MORE!\"", tagColor: "red",
    draw: (S) => S.put(popcorn(1.25, "$9"), 650, 1150, 1, { anim: "none" }) + S.put(sparkles(6, 260), 650, 760, 1, { anim: "grow", at: "steal" }) + BR(S, { face: "love", pose: "point" }, 230, 0.85) + S.put(bubble("ONLY 50¢|MORE!", { size: 48, w: 340, h: 150, dx: 80, dy: -140 }), 250, 780, 1, { anim: "grow", at: "50" }) },
  { at: "It's called the decoy effect", tag: "THE DECOY EFFECT", tagColor: "slate",
    draw: (S) => S.put(popcorn(0.95, "DECOY", C.slateDk), CX, 1150, 1.2, { anim: "pop" }) + S.put(stampSvg("DECOY", C.red, 70, -10), CX, 560, 1, { anim: "slam", at: "decoy" }) + S.sfx("impact-bass-1", S.t("decoy") + 0.15, 0.3) },
  { at: "A bad option placed there on purpose", tag: "A BAD OPTION, ON PURPOSE",
    draw: (S) => PC(S, { screen: "DECOY", pose: "point", mouth: "flat" }, 230, 0.9) + S.put(popcorn(0.9, "$8.50", C.slateDk), 650, 1150, 1, { anim: "pop" }) + S.put(arrow(160, C.ink, 46), 520, 620, 1, { rot: 30, anim: "wipe", at: "purpose" }) + S.put(txt(0, 0, "makes $9 look smart", 52, C.oliveDk, { font: "bold" }), CX, 520, 1, { anim: "fade", at: "smart" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "When researchers tested this", tag: "IT WORKS ON SUBSCRIPTIONS TOO", tagColor: "slate",
    draw: (S) => S.put(letter(["SUBSCRIBE", "-", "WEB ONLY  $59", "PRINT  $125", "PRINT+WEB  $125"], { w: 620, h: 420, size: 40 }), CX, 1180, 1, { anim: "rise", at: "magazine" }) +
      S.put(`<path d="M -270 0 L 270 0" stroke="${C.red}" stroke-width="8"/>`, CX, 1180 - 420 + 66 + 3 * 44, 1, { anim: "wipe", at: "useless" }) + S.put(arrow(150, C.olive, 44), 120, 1180 - 420 + 66 + 4 * 44, 1, { anim: "wipe", at: "expensive" }) },
  { at: "So here's the rule", tag: "THE RULE: THUMB THE MIDDLE", tagColor: "olive",
    draw: (S) => S.put(popcorn(0.7, "$5"), 190, 1150, 1, { anim: "pop" }) + S.put(popcorn(1.1, "$9"), 770, 1150, 1, { anim: "pop" }) + S.put(popcorn(0.9, "$8.50", C.slateDk), 470, 1150, 1, { anim: "pop", at: "three" }) +
      S.put(`<path d="M -110 0 Q -120 -260 0 -270 Q 120 -260 110 0 Z" fill="${C.bean}" stroke="${C.ink}" stroke-width="7"/><path d="M -70 -200 Q 0 -240 70 -200 Q 60 -150 0 -150 Q -60 -150 -70 -200 Z" fill="#F6E3B4" stroke="${C.ink}" stroke-width="4"/>`, 470, 1150, 1.15, { anim: "drop", at: "thumb" }) + S.sfx("pop", S.t("thumb") + 0.3, 0.3, 0.5) },
  { at: "Where have you seen a decoy", tag: "SPOTTED A DECOY?", tagColor: "mustard",
    draw: (S) => S.put(sticky(["WHERE HAVE YOU", "SEEN A DECOY?"]), CX, 640, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "shrug" }, 280, 0.8, { at: "comments" }) },
  { at: "because the next time", tag: "THE MEDIUM IS A TRAP", tagColor: "red", tagAt: "counter",
    draw: (S) => HOOK(S, "pop") },
];
