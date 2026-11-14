// Short 10 — "You Didn't Save $40"
import { C, txt, bean, priceTag, trophy, wallet, building, stampSvg, cross, check, sparkles, arrow, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { anchor } from "../../ep05/tools/props5.mjs";
import { bigReceipt } from "./props-b2.mjs";

export const CAPFIX = {};
const strike = (w) => `<path d="M ${-w / 2} 8 Q 0 -10 ${w / 2} 4" stroke="${C.red}" stroke-width="16" stroke-linecap="round" fill="none"/>`;
const HOOK = (S, a = "none") => S.put(bigReceipt([["YOU SAVED", C.oliveDk, 64], ["$40!", C.oliveDk, 100], ["TOTAL: $60", C.ink, 56]], { w: 620, title: "THANK YOU!" }), CX, 1230, 1.25, { anim: a }) +
  S.put(strike(360), CX, 1230 - 1.25 * (120 + 3 * 90) + 1.25 * 160, 1.25, { anim: a === "none" ? "wipe" : a, at: 0.4 }) + S.put(txt(0, 0, "SPENT", 110, C.red, { font: "bold", rot: -6 }), CX, 620, 1, { anim: a === "none" ? "slam" : a, at: 0.9 });

export const BEATS = [
  { at: "You didn't save", tag: "YOU DIDN'T SAVE $40", tagColor: "red", tagSize: 68,
    draw: (S) => HOOK(S) + S.sfx("impact-bass-1", 1.0, 0.3) },
  { at: "When a store says", tag: "\"YOU SAVED $40!\"", tagColor: "olive",
    draw: (S) => S.put(building({ label: "SALE" }), 260, G, 1.1, { anim: "pop" }) + S.put(priceTag("SAVE $40!", { size: 54, rot: -8, color: C.gold, w: 330 }), 520, 680, 1, { anim: "drop", at: "saved" }) },
  { at: "your brain feels two things", tag: "YOUR BRAIN FEELS 2 THINGS",
    draw: (S) => BR(S, { face: "meh", pose: "shrug" }, CX, 1.15) },
  { at: "the pain of paying", tag: "1 · THE PAIN OF PAYING $60", tagColor: "red", tagSize: 56,
    draw: (S) => S.put(wallet({ open: true }), 300, 1150, 2.2, { anim: "pop" }) + S.put(txt(0, 0, "−$60", 110, C.red, { font: "bold" }), 680, 760, 1, { anim: "slam", at: "60" }) },
  { at: "and the pleasure", tag: "2 · THE PLEASURE OF A \"$40 WIN\"", tagColor: "olive", tagSize: 52,
    draw: (S) => S.put(trophy("+$40", { size: 44 }), 300, G, 1.6, { anim: "drop" }) + BR(S, { face: "love", pose: "cheer" }, 700, 0.85, { at: "win" }) + S.put(sparkles(6, 220), 300, 760, 1, { anim: "grow", at: "win" }) },
  { at: "Economists call that second feeling", tag: "\"TRANSACTION UTILITY\"", tagColor: "slate",
    draw: (S) => PC(S, { screen: "DEAL", pose: "point", mouth: "o" }, 260, 1) + S.put(stampSvg("THE DEAL HIGH", C.slateDk, 52, -8), 640, 760, 1, { anim: "slam", at: "utility" }) },
  { at: "It's the joy of a good deal", tag: "JOY OF THE DEAL, NOT THE THING", tagSize: 54,
    draw: (S) => S.put(trophy("DEAL", { size: 40 }), 300, G, 1.5, { anim: "pop" }) + S.put(`<rect x="-90" y="-180" width="180" height="180" fill="${C.paper2}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -90, "?", 90, C.grey, { font: "bold" }), 700, G, 1, { anim: "pop", at: "needed" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "That deal feeling is often stronger", tag: "THE DEAL > THE ITEM", tagColor: "red",
    draw: (S) => S.put(`<path d="M -380 0 L 380 0" stroke="${C.woodDk}" stroke-width="22" stroke-linecap="round" transform="rotate(10)"/><path d="M -30 80 L 0 0 L 30 80 Z" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/>`, CX, 1160, 1, { anim: "pop" }) +
      S.put(`<rect x="-60" y="-120" width="120" height="120" fill="${C.paper2}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -60, "ITEM", 32, C.ink, { font: "bold" }), CX - 300, 1110, 1, { anim: "drop", at: "item" }) + S.put(trophy("DEAL", { size: 30 }), CX + 300, 1220, 1.15, { anim: "drop", at: "stronger" }) },
  { at: "So we buy things", tag: "SO WE BUY THINGS WE DIDN'T WANT", tagSize: 52,
    draw: (S) => [0, 1, 2, 3, 4].map((i) => S.put(`<path d="M -70 -160 L 70 -160 L 84 0 L -84 0 Z" fill="${[C.terra, C.slate, C.olive, C.mustard, C.pink][i]}" stroke="${C.ink}" stroke-width="5"/><path d="M -30 -160 Q -30 -210 0 -210 Q 30 -210 30 -160" fill="none" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -80, "SALE", 30, C.ink, { font: "bold" }), 140 + i * 160, G - (i % 2) * 40, 1, { anim: "drop", at: 0.2 + i * 0.25 })).join("") + B(S, { pose: "shrug", face: "worried" }, 470, 0.7, { at: "winning" }) },
  { at: "That's why the original price", tag: "THE \"WAS\" PRICE IS AN ANCHOR", tagColor: "slate", tagSize: 56,
    draw: (S) => S.put(priceTag("WAS $100", { size: 54, rot: -6, w: 330 }), 160, 640, 1, { anim: "drop" }) + S.put(`<path d="M 30 0 L 300 0" stroke="${C.red}" stroke-width="10"/>`, 160, 640, 1, { anim: "wipe", at: "printed" }) + S.put(anchor("$100", 80), 600, 600, 0.75, { anim: "drop", at: "anchor" }) },
  { at: "So here's the rule", tag: "THE RULE", tagColor: "olive",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, CX, 1.1) },
  { at: "Before you buy anything on sale", tag: "WOULD I BUY IT AT FULL PRICE?", tagColor: "olive", tagSize: 52,
    draw: (S) => S.put(priceTag("FULL PRICE", { size: 60, rot: -4, color: C.gold, w: 400 }), 170, 760, 1, { anim: "pop", at: "full" }) + S.put(check(1.4), 300, 1080, 1, { anim: "grow", at: "full" }) + S.put(cross(1.4), 640, 1080, 1, { anim: "grow", at: "full" }) },
  { at: "If not, the deal", tag: "IF NOT, THE DEAL IS FOR THE STORE", tagColor: "red", tagSize: 50,
    draw: (S) => S.put(building({ label: "STORE" }), CX, G, 1.15, { anim: "pop" }) + S.put(trophy("DEAL", { size: 30 }), 740, G, 0.9, { anim: "drop", at: "store" }) },
  { at: "What's the best deal you regret", tag: "THE \"DEAL\" YOU REGRET?", tagColor: "mustard",
    draw: (S) => S.put(sticky(["BEST \"DEAL\"", "YOU REGRET?"]), CX, 760, 1, { anim: "drop" }) + B(S, { pose: "shrug", face: "smile" }, 260, 0.7, { at: "comments" }) },
  { at: "because when the receipt", tag: "YOU DIDN'T SAVE $40", tagColor: "red", tagSize: 68, tagAt: "receipt",
    draw: (S) => HOOK(S, "pop") },
];
