// Short 11 — "Why Your Old Stuff Feels Worth More"
import { C, txt, bean, priceTag, clipboard, bubble, stampSvg, cross, check, heart, arrow, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { personIcon } from "../../ep03/tools/props3.mjs";
import { mug, garage, saleTable } from "./props-b2.mjs";

export const CAPFIX = { "three,": "$3," };
const HOOK = (S, a = "none") => B(S, { pose: "heart", face: "content" }, 250, 1.05, { anim: a }) + S.put(mug("MINE"), 620, 1240, 1.25, { anim: a }) +
  S.put(priceTag("$7?!", { size: 80, rot: 8, color: C.gold, w: 280 }), 470, 640, 1.1, { anim: a });

export const BEATS = [
  { at: "Why does your old stuff", tag: "WHY $3 FEELS LIKE $7", tagColor: "red", tagSize: 66,
    draw: (S) => HOOK(S) },
  { at: "In a famous experiment", tag: "A FAMOUS MUG EXPERIMENT", tagColor: "slate",
    draw: (S) => S.put(clipboard([["KAHNEMAN, KNETSCH", ""], ["& THALER, 1990", ""], ["COFFEE MUGS", ""]], { w: 620 }), CX, 1180, 1.05, { anim: "rise" }) + S.put(mug(), 760, 640, 0.8, { anim: "drop", at: "mugs" }) },
  { at: "Then they let them trade", tag: "HALF GET A MUG. THEN: TRADE.", tagSize: 56,
    draw: (S) => [...Array(6)].map((_, i) => S.put(personIcon(i % 2 ? C.grey : C.olive), 140 + (i % 3) * 300, 860 + Math.floor(i / 3) * 280, 1.5, { anim: "pop", at: 0.05 + i * 0.06 }) + (i % 2 ? "" : S.put(mug(), 210 + (i % 3) * 300, 860 + Math.floor(i / 3) * 280, 0.4, { anim: "drop", at: 0.4 + i * 0.06 }))).join("") + S.put(arrow(200, C.ink, 44), CX, 640, 1, { anim: "wipe", at: "trade" }) },
  { at: "People who owned a mug", tag: "OWNERS WANTED ~$7", tagColor: "olive",
    draw: (S) => B(S, { pose: "carry", face: "smug", item: mug(), itemScale: 0.5 }, 300, 1) + S.put(bubble("$7", { size: 90, w: 260, h: 160, dx: -60, dy: -130 }), 640, 700, 1, { anim: "grow", at: "7" }) },
  { at: "People without one", tag: "BUYERS OFFERED ~$3", tagColor: "red",
    draw: (S) => B(S, { pose: "shrug", face: "neutral" }, 700, 1) + S.put(bubble("$3", { size: 90, w: 260, h: 160, dx: 60, dy: -130 }), 360, 700, 1, { anim: "grow", at: "three" }) + S.put(big("SAME MUG", C.ink, 64), 290, 1040, 1, { anim: "slam", at: "same" }) },
  { at: "It's called the endowment", tag: "THE ENDOWMENT EFFECT", tagColor: "slate",
    draw: (S) => PC(S, { screen: "MINE", pose: "point", mouth: "o" }, 260, 1) + S.put(stampSvg("MINE = MORE", C.slateDk, 56, -8), 640, 760, 1, { anim: "slam", at: "endowment" }) },
  { at: "The moment something is yours", tag: "LOSING IT FEELS LIKE A LOSS", tagColor: "red",
    draw: (S) => S.put(mug("MINE"), 300, 1150, 1.1, { anim: "pop" }) + BR(S, { face: "foiled", pose: "hug" }, 680, 0.9, { at: "loss" }) + S.put(heart(), 300, 760, 1, { anim: "grow", at: "yours" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "It's why your garage", tag: "A FULL GARAGE. A FULL CLOSET.", tagSize: 56,
    draw: (S) => S.put(garage(), CX, G, 1.05, { anim: "rise" }) },
  { at: "and nothing sells", tag: "...AND NOTHING SELLS", tagColor: "red",
    draw: (S) => S.put(saleTable(), CX, G, 1.1, { anim: "pop" }) + S.put(txt(0, 0, "(nobody pays $7)", 54, C.ink), CX, 640, 1, { anim: "fade", at: "sale" }) },
  { at: "So here's the rule", tag: "THE RULE", tagColor: "olive",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, CX, 1.1) },
  { at: "If I didn't own this", tag: "WOULD I BUY IT TODAY?", tagColor: "olive",
    draw: (S) => S.put(mug(), 300, 1150, 1.1, { anim: "pop" }) + S.put(priceTag("TODAY'S PRICE?", { size: 46, rot: -6, color: C.gold, w: 380 }), 440, 700, 1, { anim: "drop", at: "price" }) },
  { at: "If the answer's no", tag: "NO? LET IT GO.", tagColor: "olive",
    draw: (S) => B(S, { pose: "wave", face: "happy" }, 300, 1) + S.put(mug(), 700, 1100, 0.8, { anim: "slideR", at: "go" }) },
  { at: "What's one thing you'll never sell", tag: "WHAT WILL YOU NEVER SELL?", tagColor: "mustard",
    draw: (S) => S.put(sticky(["WHAT WILL", "YOU NEVER", "SELL?"]), CX, 760, 1, { anim: "drop" }) + B(S, { pose: "heart", face: "content" }, 260, 0.7, { at: "comments" }) },
  { at: "Because the moment something", tag: "WHY $3 FEELS LIKE $7", tagColor: "red", tagSize: 66, tagAt: "yours",
    draw: (S) => HOOK(S, "pop") },
];
