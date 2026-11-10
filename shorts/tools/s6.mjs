// Short 6 — "Pay in 4 Is Not Your Friend"
import { C, at, txt, bean, brain, coin, calendar, letter, stampSvg, cross, check, sparkles, arrow, priceTag, G, CX, B, BR, PC, big, sticky, btn } from "./common.mjs";

export const CAPFIX = { "paying@42": "pay-in-", "because@44": "because…" };
const jacket = (col = C.slateDk) => `<path d="M -60 -300 L 60 -300 L 150 -240 L 190 -20 L 120 -10 L 110 -180 L 100 0 L -100 0 L -110 -180 L -120 -10 L -190 -20 L -150 -240 Z" fill="${col}" stroke="${C.ink}" stroke-width="6"/><path d="M 0 -300 L 0 0 M -60 -300 L 0 -230 L 60 -300" fill="none" stroke="${C.ink}" stroke-width="5"/>`;
const shoe = () => `<path d="M -110 0 L -110 -70 Q -60 -90 -20 -60 L 90 -30 Q 120 -20 120 0 Z" fill="${C.terra}" stroke="${C.ink}" stroke-width="6"/><path d="M -110 -10 L 120 -10" stroke="${C.white}" stroke-width="10"/>`;
const phones = () => `<path d="M -90 0 Q -110 -150 0 -160 Q 110 -150 90 0" fill="none" stroke="${C.ink}" stroke-width="14"/><rect x="-115" y="-40" width="50" height="80" rx="16" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/><rect x="65" y="-40" width="50" height="80" rx="16" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>`;
const HOOK = (S, a = "none") => S.put(jacket(), 280, 1180, 1.25, { anim: a }) + S.put(priceTag("$200", { size: 56, rot: -8, color: C.white, w: 240 }), 100, 560, 1.1, { anim: a }) +
  [0, 1, 2, 3].map((i) => S.put(coin(56, "$50"), 640 + (i % 2) * 140, 760 + Math.floor(i / 2) * 150, 1, { anim: a })).join("");

export const BEATS = [
  { at: "$200 feels expensive", tag: "PAY IN 4 = A TRAP?", tagColor: "red",
    draw: (S) => HOOK(S) + S.put(txt(0, 0, "feels fine?", 56, C.oliveDk, { font: "bold" }), 710, 1100, 1, { anim: "fade", at: "fine" }) + S.put(txt(0, 0, "SAME JACKET", 50, C.red, { font: "bold" }), 710, 1180, 1, { anim: "fade", at: "Same" }) },
  { at: "That's the trick behind buy now, pay later", tag: "BUY NOW, PAY LATER", tagColor: "slate",
    draw: (S) => PC(S, { screen: "BNPL", pose: "point", mouth: "flat" }, 230, 0.9) + S.put(btn("BUY NOW", C.olive), 640, 600, 1, { anim: "pop", at: "buy" }) + S.put(btn("PAY LATER", C.red, C.white), 640, 780, 1, { anim: "pop", at: "pay" }) },
  { at: "Splitting the price makes it feel smaller", tag: "SPLIT = FEELS SMALLER",
    draw: (S) => S.put(coin(150, "$200"), CX, 700, 1, { anim: "pop", id: "big" }) + S.js(`tl.to("#${S.id("big")}-i", { scale: 0.4, opacity: 0, transformOrigin: "50% 50%", duration: 0.4 }, ${S.t("Splitting")});`) +
      [0, 1, 2, 3].map((i) => S.put(coin(60, "$50"), 230 + i * 160, 700, 1, { anim: "grow", at: S.t("Splitting") + 0.3 + i * 0.1 })).join("") + BR(S, { face: "happy", pose: "cheer" }, CX, 0.7, { at: "yes" }) },
  { at: "But here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "It's easy to do it again", tag: "AGAIN... AND AGAIN", tagColor: "red",
    draw: (S) => [0, 1, 2].map((i) => S.put(`<rect x="-180" y="-60" width="360" height="120" rx="16" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 4, "PAY IN 4 ✓", 50, C.ink, { font: "bold" }), CX, 1100 - i * 150, 1, { anim: "drop", at: S.t("again") + i * 0.35 })).join("") },
  { at: "One pay in four for the jacket", tag: "JACKET. SHOES. HEADPHONES.",
    draw: (S) => S.put(jacket(), 200, 1180, 0.85, { anim: "pop", at: "jacket" }) + S.put(shoe(), 480, 1180, 1.2, { anim: "pop", at: "shoes" }) + S.put(phones(), 760, 1060, 1, { anim: "pop", at: "headphones" }) +
      [["jacket", 200], ["shoes", 480], ["headphones", 760]].map(([w, x]) => S.put(btn("÷4", C.mustard), x, 600, 0.8, { anim: "grow", at: w })).join("") },
  { at: "Suddenly you're paying 50 here", tag: "EVERY TWO WEEKS...", tagColor: "red",
    draw: (S) => S.put(calendar(28, 7, { title: "THIS MONTH", cw: 90, head: C.red, mark: (i) => [2, 6, 9, 13, 16, 20, 23, 27].includes(i) ? coin(36, "$") : "" }), CX, 1180, 1, { anim: "pop" }) +
      [["50", "−$50"], ["30", "−$30"], ["40", "−$40"]].map(([w, t], i) => S.put(btn(t, C.red, C.white), 200 + i * 280, 540, 0.8, { anim: "pop", at: w })).join("") },
  { at: "And if you miss a payment", tag: "MISS ONE? LATE FEES.", tagColor: "red",
    draw: (S) => S.put(letter(["PAYMENT", "-", "MISSED"], { w: 360, h: 300, size: 50 }), CX, 1100, 1.1, { anim: "pop" }) + S.put(stampSvg("LATE FEE", C.red, 80, -10), CX, 700, 1, { anim: "slam", at: "late" }) + S.sfx("impact-bass-1", S.t("late") + 0.15, 0.3) },
  { at: "Each one felt small", tag: "SMALL... UNTIL THEY'RE NOT",
    draw: (S) => [0, 1, 2, 3, 4, 5].map((i) => S.put(coin(44, "$"), 330 + (i % 3) * 140, 600 + Math.floor(i / 3) * 110, 1, { anim: "grow", at: 0.1 + i * 0.08 })).join("") + S.put(btn("TOTAL $620", C.red, C.white), CX, 1000, 1.1, { anim: "slam", at: "Together" }) },
  { at: "So here's the rule", tag: "THE RULE: FULL PRICE TODAY?", tagColor: "olive",
    draw: (S) => B(S, { pose: "hold", face: "determined", item: coin(40, "$") }, 250, 0.95) + S.put(`<rect x="-260" y="-130" width="520" height="260" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -60, "WOULD I BUY IT", 48, C.ink, { font: "bold" }) + txt(0, 0, "TODAY, FULL PRICE,", 46, C.olive, { font: "bold" }) + txt(0, 60, "WITH MONEY I HAVE?", 46, C.ink, { font: "bold" }), 620, 640, 1, { anim: "pop", at: "would" }) },
  { at: "Have you ever stacked", tag: "BE HONEST 👀", tagColor: "mustard",
    draw: (S) => S.put(sticky(["HOW MANY PAY-IN-4", "PLANS RIGHT NOW?"], { size: 48 }), CX, 640, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "shrug" }, 280, 0.75, { at: "comments" }) },
  { at: "because", tag: "PAY IN 4 = A TRAP?", tagColor: "red",
    draw: (S) => HOOK(S, "pop") },
];
