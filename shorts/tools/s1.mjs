// Short 1 — "Why $9.99 Tricks Your Brain"
import { C, at, txt, bean, brain, priceTag, clipboard, trophy, stampSvg, arrow, cross, check, sparkles, G, CX, B, BR, PC, big, sticky } from "./common.mjs";

export const CAPFIX = { "$999": "$9.99", "$9.": "$9.", "99,": "99…" };
const dress = (col) => `<path d="M -40 -330 L 40 -330 L 50 -280 L 120 0 L -120 0 L -50 -280 Z" fill="${col}" stroke="${C.ink}" stroke-width="6"/><path d="M -40 -330 Q 0 -300 40 -330" fill="none" stroke="${C.ink}" stroke-width="5"/><path d="M -20 -360 L -40 -330 M 20 -360 L 40 -330" stroke="${C.ink}" stroke-width="5"/>`;
const HOOK = (S, a = "none") => S.put(priceTag("$9.99", { size: 76, rot: -8, color: C.gold, w: 340 }), 230, 640, 1.3, { anim: a }) +
  BR(S, { face: "love", pose: "point" }, 250, 1.0, { anim: a }) + B(S, { pose: "cheeks", face: "shocked" }, 720, 0.95, { anim: a });

export const BEATS = [
  { at: "Your brain just read", tag: "$9.99 IS A TRICK", tagColor: "white", tagSize: 72,
    draw: (S) => HOOK(S) + S.put(`<text x="0" y="0" font-family="Archivo Black" font-size="96" fill="${C.red}" stroke="${C.ink}" stroke-width="6" paint-order="stroke" transform="rotate(-8)">= $9?</text>`, 560, 560, 1, { anim: "slam", at: "as" }) + S.sfx("impact-bass-1", S.t("as") + 0.15, 0.3) },
  { at: "It's called the left digit effect", tag: "THE LEFT-DIGIT EFFECT", tagColor: "slate",
    draw: (S) => PC(S, { screen: "9.99", pose: "point", mouth: "o" }, 230, 0.95) + S.put(`<text x="0" y="0" font-family="Archivo Black" font-size="190" text-anchor="middle" dominant-baseline="middle" stroke="${C.ink}" stroke-width="8" paint-order="stroke"><tspan fill="${C.red}">9</tspan><tspan fill="${C.white}">.99</tspan></text>`, 620, 640, 1, { anim: "grow", at: "left" }) },
  { at: "Your brain reads prices left to right", tag: "IT STOPS AT THE FIRST DIGIT", tagColor: "red",
    draw: (S) => S.put(`<text x="0" y="0" font-family="Archivo Black" font-size="200" text-anchor="middle" dominant-baseline="middle" stroke="${C.ink}" stroke-width="8" paint-order="stroke" fill="${C.red}">$9</text>`, 360, 650, 1, { anim: "pop" }) +
      S.put(`<text x="0" y="0" font-family="Archivo Black" font-size="200" text-anchor="middle" dominant-baseline="middle" fill="${C.grey}" opacity="0.55">.99</text>`, 690, 650, 1, { anim: "fade", at: "stops" }) +
      S.put(arrow(520, C.ink, 50), 200, 820, 1, { anim: "wipe", at: "left" }) + BR(S, { face: "meh", pose: "down" }, 470, 0.8, { at: "caring" }) },
  { at: "So 999 feels like nine", tag: "FEELS LIKE $9. NOT $10.",
    draw: (S) => S.put(priceTag("$9.99", { size: 60, rot: 0, color: C.gold, w: 280 }), 120, 540, 1.1, { anim: "pop" }) +
      S.put(big("≈ $9", C.olive, 140), 330, 820, 1, { anim: "slam", at: "nine" }) + S.put(big("$10", C.grey, 140), 700, 820, 1, { anim: "pop", at: "not" }) + S.put(cross(1.5), 700, 820, 1, { anim: "grow", at: "10" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "In one famous experiment", tag: "A REAL EXPERIMENT", tagColor: "slate",
    draw: (S) => S.put(clipboard([["ANDERSON &", ""], ["SIMESTER, 2003", ""], ["$9 PRICE ENDINGS", ""]], { w: 600 }), CX, 1100, 1.05, { anim: "rise" }) },
  { at: "a dress sold better at 39", tag: "$39 OUTSOLD $34", tagColor: "olive",
    draw: (S) => S.put(dress(C.slate), 260, 1180, 1.25, { anim: "pop", at: "dress" }) + S.put(priceTag("$34", { size: 50, rot: -10, w: 170 }), 300, 640, 1, { anim: "drop", at: "34" }) +
      S.put(dress(C.terra), 680, 1180, 1.25, { anim: "pop", at: "39" }) + S.put(priceTag("$39", { size: 50, rot: 8, color: C.gold, w: 170 }), 720, 640, 1, { anim: "drop", at: "39" }) +
      S.put(check(1.3), 680, 520, 1, { anim: "grow", at: "better" }) + S.put(txt(0, 0, "SOLD MORE", 50, C.oliveDk, { font: "bold" }), 680, 440, 1, { anim: "fade", at: "better" }) },
  { at: "Cheaper didn't win", tag: "CHEAPER LOST. THE 9 WON.", tagColor: "olive",
    draw: (S) => S.put(trophy("$39", { size: 40 }), CX, 1180, 1.6, { anim: "drop", at: 0.05 }) + S.put(sparkles(6, 260), CX, 760, 1, { anim: "grow", at: "did" }) + S.sfx("chime", S.t("did"), 0.25) },
  { at: "Stores know this", tag: "NOTHING COSTS A ROUND NUMBER",
    draw: (S) => S.put(`<rect x="-400" y="-16" width="800" height="32" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/>` + `<rect x="-400" y="244" width="800" height="32" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/>`, CX, 760, 1, { anim: "fade" }) +
      ["$4.99", "$19.99", "$9.95", "$29.99"].map((t, i) => S.put(priceTag(t, { size: 38, rot: -6 + i * 5, w: 210, string: false }), 120 + (i % 2) * 400, 700 + Math.floor(i / 2) * 260, 1, { anim: "drop", at: S.t("know") + i * 0.2 })).join("") },
  { at: "So here's the rule", tag: "THE RULE: ROUND IT UP", tagColor: "olive",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, 250, 0.95) + S.put(priceTag("$9.99", { size: 56, rot: -6, color: C.gold, w: 260 }), 470, 600, 1, { anim: "pop" }) +
      S.put(arrow(180, C.olive, 50), 640, 700, 1, { rot: 90, anim: "wipe", at: "round" }) + S.put(priceTag("$10", { size: 64, rot: 4, color: C.olive, w: 220 }), 560, 1040, 1, { anim: "slam", at: "up" }) },
  { at: "10 40 100", tag: "SAY IT OUT LOUD", tagColor: "mustard",
    draw: (S) => [["10", "$10"], ["40", "$40"], ["100", "$100"]].map(([w, t], i) => S.put(big(t, [C.olive, C.mustard, C.terra][i], 150), CX, 600 + i * 210, 1, { anim: "slam", at: w }) + S.sfx("pop", S.t(w), 0.3, 0.5)).join("") },
  { at: "Which store gets you", tag: "WHICH STORE GETS YOU?", tagColor: "mustard",
    draw: (S) => S.put(sticky(["WHICH STORE", "GETS YOU MOST?"]), CX, 700, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "shrug" }, 300, 0.8, { at: "comments" }) },
  { at: "because the next time", tag: "$9.99 IS A TRICK", tagColor: "white", tagSize: 72, tagAt: "ending",
    draw: (S) => HOOK(S, "pop") },
];
