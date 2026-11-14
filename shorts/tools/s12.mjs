// Short 12 — "Why Surprise Money Disappears So Fast"
import { C, txt, bean, envelope, gift, house, priceTag, stampSvg, cross, check, sparkles, arrow, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { wingedBill, bucket } from "./props-b2.mjs";

export const CAPFIX = {};
const HOOK = (S, a = "none") => S.put(envelope("TAX REFUND", { open: true, w: 420, h: 260 }), 300, 1200, 1.1, { anim: a }) + S.put(wingedBill("$100"), 600, 720, 1.1, { anim: a, idle: true, rot: -10 });

export const BEATS = [
  { at: "Why does surprise money", tag: "WHY \"FREE\" MONEY VANISHES", tagColor: "red", tagSize: 62,
    draw: (S) => HOOK(S) + S.sfx("whoosh", 0.3, 0.3, 0.5) },
  { at: "A tax refund", tag: "REFUND · BIRTHDAY CHECK · JACKET $20", tagSize: 46,
    draw: (S) => S.put(envelope("REFUND", { w: 300, h: 190 }), 180, 1000, 0.85, { anim: "pop", at: "tax" }) + S.put(gift("$50", C.slateDk), CX, 1000, 0.95, { anim: "pop", at: "birthday" }) + S.put(wingedBill("$20").replace(/<path[^>]*Z" fill[^>]*\/>/, ""), 760, 900, 0.6, { anim: "pop", at: "jacket" }) },
  { at: "It's real money", tag: "REAL MONEY... FILED DIFFERENTLY", tagSize: 56,
    draw: (S) => BR(S, { face: "sly", pose: "hold" }, 300, 1) + S.put(`<rect x="-150" y="-110" width="300" height="220" rx="14" fill="${C.mustard}" stroke="${C.ink}" stroke-width="6"/><path d="M -150 -110 L -150 -150 L -40 -150 L -10 -110" fill="${C.mustard}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 10, "BONUS $", 44, C.ink, { font: "bold" }), 680, 800, 1, { anim: "pop", at: "files" }) },
  { at: "Psychologists call this mental", tag: "MENTAL ACCOUNTING", tagColor: "slate",
    draw: (S) => PC(S, { screen: "BUCKETS", pose: "point", mouth: "o" }, 260, 1) + S.put(stampSvg("2 BUCKETS", C.slateDk, 60, -8), 650, 760, 1, { anim: "slam", at: "accounting" }) },
  { at: "Money you worked for", tag: "WORKED FOR IT? \"CAREFUL\"", tagColor: "slate",
    draw: (S) => B(S, { pose: "carry", face: "determined", sweat: true }, 260, 0.9) + S.put(bucket("CAREFUL", C.slate, 0.6), 680, G, 1.1, { anim: "pop", at: "careful" }) },
  { at: "Money that just showed up", tag: "JUST SHOWED UP? \"FUN\"", tagColor: "mustard",
    draw: (S) => S.put(bucket("CAREFUL", C.slate, 0.6), 230, G, 0.9, { anim: "none" }) + S.put(bucket("FUN", C.mustard, 0.8), 690, G, 1.1, { anim: "pop", at: "fun" }) + S.put(sparkles(5, 200), 690, 900, 1, { anim: "grow", at: "fun" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "In experiments, people handed", tag: "SURPRISE MONEY GOT SPENT MORE FREELY", tagColor: "red", tagSize: 46,
    draw: (S) => B(S, { pose: "cheer", face: "joy" }, 250, 0.85) + S.put(wingedBill("$"), 250, 640, 0.6, { anim: "pop", id: "fly" }) + S.js(`tl.to("#${S.id("fly")}-i", { x: 300, y: -260, rotation: 20, duration: 1.4, ease: "power2.in" }, ${S.t("freely")});`) +
      B(S, { pose: "carry", face: "determined" }, 700, 0.85, { at: "earned" }) + S.put(txt(0, 0, "EARNED IT", 40, C.ink, { font: "bold" }), 700, 860, 1, { anim: "fade", at: "earned" }) },
  { at: "But a dollar is a dollar", tag: "A DOLLAR IS A DOLLAR", tagColor: "olive",
    draw: (S) => S.put(big("$1 = $1", C.olive, 180), CX, 820, 1, { anim: "slam" }) + S.sfx("impact-bass-1", 0.25, 0.25) },
  { at: "Your landlord doesn't care", tag: "YOUR LANDLORD DOESN'T CARE",
    draw: (S) => S.put(house(), CX, G, 1.6, { anim: "pop" }) + S.put(priceTag("RENT", { size: 56, rot: -8, color: C.gold, w: 220 }), 640, 700, 1, { anim: "drop", at: "care" }) },
  { at: "So here's the rule", tag: "THE RULE: SPLIT IT", tagColor: "olive",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, CX, 1.1) + S.put(wingedBill("$"), CX, 640, 0.7, { anim: "pop", at: "split" }) },
  { at: "Half to a goal", tag: "HALF TO A GOAL · HALF TO FUN", tagColor: "olive", tagSize: 56,
    draw: (S) => S.put(bucket("GOAL", C.olive, 0.5), 250, G, 1.1, { anim: "pop", at: "goal" }) + S.put(bucket("FUN", C.mustard, 0.5), 690, G, 1.1, { anim: "pop", at: "fun" }) },
  { at: "You still get the joy", tag: "JOY... AND PROGRESS", tagColor: "olive",
    draw: (S) => B(S, { pose: "cheer", face: "joy" }, CX, 1.1) + S.put(sparkles(6, 260), CX, 800, 1, { anim: "grow", at: "somewhere" }) },
  { at: "What did you do with your last", tag: "YOUR LAST SURPRISE MONEY?", tagColor: "mustard",
    draw: (S) => S.put(sticky(["WHAT DID YOU", "DO WITH YOUR", "LAST WINDFALL?"]), CX, 760, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "shrug" }, 260, 0.7, { at: "comments" }) },
  { at: "because when money", tag: "WHY \"FREE\" MONEY VANISHES", tagColor: "red", tagSize: 62, tagAt: "money",
    draw: (S) => HOOK(S, "pop") },
];
