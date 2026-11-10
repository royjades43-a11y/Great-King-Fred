// Short 5 — "The Free Shipping Trap"
import { C, at, txt, bean, brain, cart, phone, letter, stampSvg, cross, check, sparkles, arrow, heart, magnifier, G, CX, B, BR, PC, big, sticky, btn } from "./common.mjs";

export const CAPFIX = { "Because@45": "because…" };
// progress bar toward the free-shipping threshold; fill 0..1
function bar(fill, label = "$35 = FREE SHIPPING", id = "") {
  return `<rect x="-380" y="-40" width="760" height="80" rx="40" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>
    <rect ${id ? `id="${id}"` : ""} x="-372" y="-32" width="${744 * fill}" height="64" rx="32" fill="${C.olive}"/>
    <path d="M 372 -60 L 372 60" stroke="${C.red}" stroke-width="6"/>${txt(0, 90, label, 44, C.ink, { font: "bold" })}`;
}
const box = `<rect x="-90" y="-120" width="180" height="120" fill="#C9A27A" stroke="${C.ink}" stroke-width="6"/><path d="M -90 -120 L 0 -150 L 90 -120" fill="#A67F57" stroke="${C.ink}" stroke-width="5"/>${txt(0, -60, "📦", 60, C.ink)}`;
const HOOK = (S, a = "none") => S.put(cart({ full: true }), 300, 1150, 1.35, { anim: a }) + S.put(txt(0, 0, "$28", 90, C.ink, { font: "bold" }), 300, 820, 1, { anim: a }) + S.put(bar(0.8), CX, 560, 0.95, { anim: a }) + S.put(box, 720, 1150, 1.2, { anim: a });

export const BEATS = [
  { at: "Free shipping just made you spend", tag: "FREE SHIPPING ISN'T FREE", tagColor: "red",
    draw: (S) => HOOK(S) + S.put(txt(0, 0, "−$12", 90, C.red, { font: "bold", rot: -8 }), 700, 780, 1, { anim: "slam", at: "12" }) + S.put(txt(0, 0, "to save $6", 50, C.oliveDk, { font: "bold" }), 700, 880, 1, { anim: "fade", at: "save" }) },
  { at: "Your cart is $28", tag: "CART $28 + SHIPPING $6",
    draw: (S) => S.put(cart({ full: true }), CX, 1150, 1.5, { anim: "pop" }) + S.put(btn("$28", C.white), 300, 600, 1, { anim: "pop", at: "28" }) + S.put(btn("SHIP $6", C.red, C.white), 660, 600, 1, { anim: "pop", at: "six" }) },
  { at: "But if you hit 35", tag: "$35 = FREE SHIPPING", tagColor: "olive",
    draw: (S) => S.put(bar(0.8, "$35 = FREE SHIPPING", S.id("b")), CX, 680, 1, { anim: "pop" }) + S.put(txt(0, 0, "SO CLOSE!", 80, C.red, { font: "bold", rot: -6 }), 600, 960, 1, { anim: "slam", at: "free" }) + BR(S, { face: "love", pose: "point" }, 230, 0.6, { at: "free" }) },
  { at: "So you add a phone case", tag: "+ A PHONE CASE YOU DIDN'T NEED",
    draw: (S) => S.put(cart({ full: true }), 330, 1150, 1.3, { anim: "none" }) + S.put(`<rect x="-70" y="-130" width="140" height="260" rx="26" fill="${C.slate}" stroke="${C.ink}" stroke-width="6"/><circle cx="-30" cy="-90" r="16" fill="${C.ink}"/>`, 700, 700, 1, { anim: "drop", at: "case" }) + S.put(btn("+$12", C.red, C.white), 700, 960, 1, { anim: "pop", at: "12" }) },
  { at: "Now your total is 40", tag: "TOTAL: $40",
    draw: (S) => S.put(letter(["RECEIPT", "-", "CART  $28", "CASE  $12", "SHIP  FREE", "TOTAL  $40"], { w: 520, h: 420, size: 44 }), CX, 1180, 1, { anim: "rise" }) },
  { at: "You didn't save $6", tag: "NOT A DEAL", tagColor: "red",
    draw: (S) => S.put(btn("SAVED $6", C.olive), 260, 640, 1, { anim: "pop" }) + S.put(btn("SPENT +$12", C.red, C.white), 680, 640, 1, { anim: "pop", at: "spent" }) + S.put(stampSvg("NOT A DEAL", C.red, 72, -8), CX, 940, 1, { anim: "slam", at: "avoid" }) + S.sfx("impact-bass-1", S.t("avoid") + 0.15, 0.3) },
  { at: "Your brain loves the word free", tag: "YOUR BRAIN LOVES \"FREE\"", tagColor: "red",
    draw: (S) => BR(S, { face: "love", pose: "hug" }, 300, 1.0) + S.put(big("FREE", C.olive, 160), 680, 620, 1, { anim: "grow", at: "free" }) + [0, 1, 2].map((i) => S.put(heart(1.2), 560 + i * 110, 460 - (i % 2) * 40, 1, { anim: "grow", at: S.t("free") + 0.2 + i * 0.1 })).join("") },
  { at: "It treats zero as a special number", tag: "$0 FEELS MAGIC", tagColor: "slate",
    draw: (S) => S.put(big("$0", C.olive, 260), CX, 700, 1, { anim: "slam" }) + S.put(sparkles(7, 260), CX, 700, 1, { anim: "grow", at: "special" }) + PC(S, { screen: "BUT MATH", pose: "point", mouth: "flat" }, 760, 0.7, { at: "math" }) },
  { at: "And the store knows it", tag: "THE BAR IS ALWAYS JUST AHEAD", tagColor: "red",
    draw: (S) => S.put(bar(0.75, "FREE SHIPPING AT...", S.id("b")), CX, 680, 1, { anim: "pop" }) + S.put(`<path d="M 0 -60 L 0 60" stroke="${C.red}" stroke-width="8"/>`, CX + 372, 680, 1, { anim: "none", id: "line" }) +
      S.js(`tl.fromTo("#${S.id("b")}", { attr: { width: 400 } }, { attr: { width: 700 }, duration: 1.4, ease: "power1.inOut" }, ${S.t("threshold")});`) + S.put(txt(0, 0, "a little higher than your cart", 46, C.ink), CX, 900, 1, { anim: "fade", at: "higher" }) },
  { at: "So here's the rule", tag: "THE RULE", tagColor: "olive",
    draw: (S) => B(S, { pose: "carry", face: "determined", item: magnifier(), itemScale: 0.7 }, 280, 0.95) + S.put(`<rect x="-230" y="-110" width="460" height="220" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -40, "WOULD I BUY", 50, C.ink, { font: "bold" }) + txt(0, 30, "THIS ALONE?", 50, C.olive, { font: "bold" }), 640, 640, 1, { anim: "pop", at: "buy" }) },
  { at: "What's the most useless thing", tag: "CONFESS 😂", tagColor: "mustard",
    draw: (S) => S.put(sticky(["MOST USELESS THING", "YOU ADDED FOR", "FREE SHIPPING?"], { size: 46 }), CX, 640, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "shrug" }, 280, 0.75, { at: "Comments" }) },
  { at: "Because", tag: "FREE SHIPPING ISN'T FREE", tagColor: "red",
    draw: (S) => HOOK(S, "pop") },
];
