// Short 15 — "The 50% Trap" (viral playbook)
import { C, txt, bean, stampSvg, cross, check, sparkles, arrow, clock, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { hole, ladder } from "../../ep05/tools/props5.mjs";
import { anvil } from "../../ep02/tools/props2.mjs";
import { bigReceipt } from "./props-b2.mjs";

export const CAPFIX = { "50@10": "50%", "50@14": "50%", "%": "", "90": "90%", "900": "900%" };
const K = `stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const bill100 = (torn = false, label = "$100") => torn
  ? `<path d="M -220 -110 L 0 -110 L -20 -60 L 10 -10 L -15 40 L 5 110 L -220 110 Z" fill="${C.olive}" ${K}/><path d="M 40 -110 L 260 -110 L 260 110 L 45 110 L 25 40 L 50 -10 L 20 -60 Z" fill="${C.olive}" ${K} transform="translate(30 30) rotate(8)"/>${txt(-110, 4, label, 60, C.ink, { font: "bold" })}`
  : `<rect x="-220" y="-110" width="440" height="220" rx="12" fill="${C.olive}" ${K}/><rect x="-190" y="-80" width="380" height="160" rx="8" fill="none" stroke="${C.oliveDk}" stroke-width="5"/>${txt(0, 4, label, 80, C.ink, { font: "bold" })}`;
const bigArrow = (label, col, down) => `<g transform="rotate(${down ? 180 : 0})"><path d="M -75 120 L -75 -40 L -130 -40 L 0 -170 L 130 -40 L 75 -40 L 75 120 Z" fill="${col}" ${K}/></g>${txt(0, down ? -40 : 40, label, label.length > 4 ? 40 : 46, C.white, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` })}`;
const HOOK = (S, a = "none") => S.put(bill100(true), 360, 760, 1, { anim: a }) + S.put(bigArrow("−50%", C.red, true), 230, 1130, 0.9, { anim: a }) + S.put(bigArrow("+?%", C.olive, false), 720, 1130, 1.05, { anim: a === "none" ? "rise" : a, at: 0.4 });
const egg = (col = C.white) => `<ellipse cx="0" cy="-60" rx="46" ry="60" fill="${col}" ${K}/>`;
const basket = () => `<path d="M -120 -80 L 120 -80 L 90 0 L -90 0 Z" fill="${C.wood}" ${K}/><path d="M -110 -60 L 110 -60 M -100 -35 L 100 -35" stroke="${C.woodDk}" stroke-width="5"/>`;

export const BEATS = [
  { at: "Your $100 drops", tag: "MOST PEOPLE GET THIS WRONG", tagColor: "red", tagSize: 60,
    draw: (S) => HOOK(S) + S.sfx("impact-bass-1", 0.3, 0.25) },
  { at: "How much does it need to go up", tag: "WHAT GETS YOU BACK TO $100?", tagColor: "mustard", tagSize: 56,
    draw: (S) => S.put(bill100(false, "$50"), 280, 1180, 0.8, { anim: "none" }) + S.put(bigArrow("+?%", C.olive, false), 680, 1150, 1.25, { anim: "rise" }) + S.put(clock(), 300, 700, 0.8, { anim: "grow", at: "back" }) },
  { at: "Lock in your answer", tag: "LOCK IN YOUR ANSWER", tagColor: "mustard",
    draw: (S) => ["3", "2", "1"].map((n, i) => S.put(big(n, [C.olive, C.mustard, C.red][i], 240), 190 + i * 280, 820, 1, { anim: "slam", at: 0.05 + i * 0.28 }) + S.sfx("click", 0.05 + i * 0.28, 0.3)).join("") },
  { at: "Type it in the comments", tag: "TYPE YOUR % 👇", tagColor: "mustard", tagSize: 72,
    draw: (S) => S.put(sticky(["+____%", "GETS ME BACK"]), CX, 800, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "point" }, 230, 0.7, { at: "before" }) },
  { at: "50 % that's what most people say", tag: "+50%?", tagColor: "white", tagSize: 80,
    draw: (S) => S.put(bigArrow("+50%", C.olive, false), 300, 1150, 1.1, { anim: "pop" }) + BR(S, { face: "grin", pose: "point" }, 720, 0.85, { at: "most" }) + S.put(stampSvg("WRONG", C.red, 120, -12), CX, 760, 1, { anim: "slam", at: "wrong" }) + S.shake(S.t("wrong") + 0.2, 14) + S.sfx("impact-bass-1", S.t("wrong") + 0.15, 0.45) },
  { at: "of $50 is only", tag: "+50% OF $50 = ONLY $25",
    draw: (S) => S.put(bigReceipt([["START  $50", C.ink, 56], ["+50%  +$25", C.ink, 56], ["NOW  $75", C.red, 76]], { w: 600, title: "CHECK" }), CX, 1230, 1.1, { anim: "rise" }) + S.put(cross(1.3), 790, 640, 1, { anim: "grow", at: "75" }) },
  { at: "You need 100", tag: "YOU NEED +100%", tagColor: "olive", tagSize: 72,
    draw: (S) => S.put(bill100(false, "$50"), 250, 1180, 0.75, { anim: "none" }) + S.put(bigArrow("+100%", C.olive, false), 500, 1100, 1.1, { anim: "rise" }) + S.put(bill100(false, "$100"), 760, 760, 0.6, { anim: "pop", at: "double" }) + S.put(check(1.2), 760, 560, 1, { anim: "grow", at: "started" }) + S.sfx("chime", S.t("started"), 0.3) },
  { at: "Lose 90", tag: "LOSE 90%? YOU NEED +900%", tagColor: "red", tagSize: 64,
    draw: (S) => S.put(hole(700), CX, 1090, 1, { anim: "pop" }) + S.put(`<circle r="40" fill="${C.gold}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 4, "$10", 30, C.ink, { font: "bold" }), CX, 1140, 1.3, { anim: "drop", at: "90" }) +
      S.put(ladder(580, C.olive), CX + 150, 1150, 1, { anim: "rise", at: "900" }) + S.put(txt(0, 0, "+900%", 90, C.olive, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` }), 260, 640, 1, { anim: "slam", at: "900" }) + S.shake(S.t("900") + 0.2, 10) + S.sfx("impact-bass-1", S.t("900") + 0.15, 0.4) },
  { at: "Gains and losses aren't equal", tag: "GAINS AND LOSSES AREN'T EQUAL", tagColor: "slate", tagSize: 54,
    draw: (S) => S.put(`<g transform="rotate(14)"><path d="M -380 0 L 380 0" stroke="${C.woodDk}" stroke-width="22" stroke-linecap="round"/></g><path d="M -36 110 L 0 0 L 36 110 Z" fill="${C.wood}" ${K}/>`, CX, 1120, 1, { anim: "pop" }) +
      S.put(`<circle r="50" fill="${C.olive}" ${K}/>` + txt(0, 6, "+", 70, C.white, { font: "bold" }), CX - 300, 970, 1, { anim: "drop", at: "Gains" }) + S.put(anvil("LOSS"), CX + 280, 1180, 0.8, { anim: "drop", at: "losses" }) },
  { at: "One big loss can wipe out", tag: "ONE BIG LOSS WIPES OUT YEARS", tagColor: "red", tagSize: 56,
    draw: (S) => [0, 1, 2, 3, 4].map((i) => S.put(`<rect x="-55" y="${-80 - i * 60}" width="110" height="${80 + i * 60}" fill="${C.olive}" ${K}/>`, 160 + i * 150, 1240, 1, { anim: "rise", at: 0.1 + i * 0.12, id: "y" + i })).join("") + S.put(anvil("LOSS"), 760, 1240, 0.75, { anim: "drop", at: "wipe" }) + S.sfx("impact-bass-1", S.t("wipe") + 0.4, 0.35) },
  { at: "That's why the first rule", tag: "THE FIRST RULE OF MONEY", tagColor: "olive",
    draw: (S) => S.put(txt(0, 0, "\"WIN BIG\"", 100, C.grey, { font: "bold" }), CX, 680, 1, { anim: "pop" }) + S.put(cross(2), CX, 680, 1, { anim: "grow", at: "win" }) + S.put(stampSvg("DON'T LOSE BIG", C.oliveDk, 76, -8), CX, 1000, 1, { anim: "slam", at: "lose" }) + S.sfx("impact-bass-1", S.t("lose") + 0.2, 0.3) },
  { at: "Spread it out", tag: "SPREAD IT OUT", tagColor: "olive", tagSize: 72,
    draw: (S) => S.put(basket(), 200, 1240, 0.9, { anim: "pop" }) + S.put(egg(C.white) + `<path d="M -20 -110 L 0 -80 L -14 -60 L 6 -36" fill="none" stroke="${C.ink}" stroke-width="5"/>`, 200, 1180, 1, { anim: "pop" }) + S.put(cross(1), 200, 900, 1, { anim: "grow", at: "Never" }) +
      [0, 1, 2, 3].map((i) => S.put(basket(), 420 + (i % 2) * 260, 1000 + Math.floor(i / 2) * 240, 0.7, { anim: "pop", at: 0.3 + i * 0.12 }) + S.put(egg(), 420 + (i % 2) * 260, 950 + Math.floor(i / 2) * 240, 0.7, { anim: "drop", at: 0.5 + i * 0.12 })).join("") },
  { at: "Send this to the friend", tag: "SEND THIS TO YOUR ALL-IN FRIEND", tagColor: "mustard", tagSize: 54,
    draw: (S) => B(S, { pose: "carry", face: "worried", sweat: true, item: egg(C.gold) + txt(0, -60, "ONE", 28, C.ink, { font: "bold" }), itemScale: 1.4 }, 330, 1.05) + S.put(txt(0, 0, "ONE STOCK", 60, C.red, { font: "bold" }), 700, 700, 1, { anim: "slam", at: "stock" }) },
  { at: "and ask them", tag: "MOST PEOPLE GET THIS WRONG", tagColor: "red", tagSize: 60, tagAt: "ask",
    draw: (S) => HOOK(S, "pop") },
];
