// Short 4 — "Would You Take This Bet?"
import { C, at, txt, bean, brain, coin, clipboard, phone, stampSvg, cross, check, sparkles, arrow, chartLine, magnifier, G, CX, B, BR, PC, big, sticky, btn } from "./common.mjs";

export const CAPFIX = { "heads,@44": "heads…" };
const bigCoin = (label, col) => `<circle r="150" fill="${C.gold}" stroke="${C.ink}" stroke-width="8"/><circle r="118" fill="none" stroke="${C.mustard}" stroke-width="6"/>${txt(0, 6, label, 70, col, { font: "bold" })}`;
function balance(tiltDeg, left, right) {
  return `<path d="M -50 0 L 0 -320 L 50 0 Z" fill="${C.wood}" stroke="${C.ink}" stroke-width="6"/>
    <g transform="translate(0 -320) rotate(${tiltDeg})"><rect x="-340" y="-12" width="680" height="24" rx="8" fill="${C.woodDk}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M -300 12 L -300 90 M 300 12 L 300 90" stroke="${C.ink}" stroke-width="5"/>${at(-300, 90, 1, left)}${at(300, 90, 1, right)}</g>`;
}
const pan = (label, col) => `<path d="M -110 0 L 110 0 L 80 50 L -80 50 Z" fill="${C.grey}" stroke="${C.ink}" stroke-width="5"/>${txt(0, -50, label, 58, col, { font: "bold" })}`;
const HOOK = (S, a = "none") => S.put(bigCoin("?", C.ink), CX, 690, 1.25, { anim: a }) + S.put(btn("HEADS +$150", C.olive), 270, 1030, 0.8, { anim: a }) + S.put(btn("TAILS −$100", C.red, C.white), 680, 1030, 0.8, { anim: a });

export const BEATS = [
  { at: "Flip a coin", tag: "WOULD YOU TAKE THIS BET?", tagColor: "mustard",
    draw: (S) => HOOK(S) + S.js(`tl.fromTo("#${S.id("e0")}-i", { scaleX: 1 }, { scaleX: -1, duration: 0.25, ease: "none", yoyo: true, repeat: 7, transformOrigin: "50% 50%" }, 0.2);`) + S.sfx("whoosh", 0.2, 0.25, 0.6) },
  { at: "Would you take that bet", tag: "YES OR NO?", tagColor: "mustard",
    draw: (S) => S.put(bigCoin("?", C.ink), CX, 700, 1.1, { anim: "none" }) + S.put(btn("TAKE IT", C.olive), 270, 1020, 0.9, { anim: "pop" }) + S.put(btn("NO WAY", C.red, C.white), 680, 1020, 0.9, { anim: "pop", at: "bet" }) },
  { at: "Most people say no", tag: "MOST PEOPLE SAY NO",
    draw: (S) => [0, 1, 2].map((i) => S.put(bean({ color: [C.slate, C.olive, C.bean][i], pose: "stop", face: "worried", noShadow: true }), 200 + i * 270, G, 0.75, { anim: "pop", at: 0.05 + i * 0.12, idle: true })).join("") + S.put(txt(0, 0, "...but on average you WIN", 52, C.oliveDk, { font: "bold" }), CX, 560, 1, { anim: "fade", at: "ahead" }) },
  { at: "Why? Because losing hurts", tag: "LOSING HURTS ABOUT 2×", tagColor: "red",
    draw: (S) => S.put(balance(-12, pan("+$150", C.oliveDk), pan("−$100", C.red)), CX, G, 1, { anim: "pop", id: "bal" }) + S.js(`tl.fromTo("#${S.id("bal")} g[transform^='translate(0 -320)']", { rotation: -12, svgOrigin: "0 -320" }, { rotation: 14, duration: 0.7, ease: "bounce.out" }, ${S.t("twice")});`) },
  { at: "It's called loss aversion", tag: "LOSS AVERSION", tagColor: "slate",
    draw: (S) => PC(S, { screen: "LOSS×2", pose: "point", mouth: "o" }, 250, 0.95) + S.put(clipboard([["KAHNEMAN &", ""], ["TVERSKY, 1979", ""], ["NOBEL PRIZE", ""]], { w: 460 }), 650, 1000, 0.9, { anim: "rise", at: "Nobel" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "This is exactly why people panic sell", tag: "WHY PEOPLE PANIC-SELL", tagColor: "red",
    draw: (S) => S.put(`<rect x="-380" y="-300" width="760" height="300" rx="12" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + chartLine([[-340, -240], [-200, -200], [-60, -230], [80, -120], [220, -60], [340, -40]], C.red, 10), CX, 1000, 1, { anim: "pop" }) + S.put(btn("SELL!", C.red, C.white), CX, 1120, 0.9, { anim: "slam", at: "drops" }) },
  { at: "and why we keep subscriptions we never use", tag: "...AND KEEP SUBSCRIPTIONS", tagColor: "red",
    draw: (S) => S.put(phone(["SUBSCRIPTIONS", "-$14.99", "-$9.99", "-$12.99"], { size: 34, head: C.slateDk, w: 380, h: 640 }), CX, 1200, 1, { anim: "rise" }) + S.put(txt(0, 0, "CANCEL = LOSS?", 60, C.red, { font: "bold" }), CX, 500, 1, { anim: "fade", at: "Canceling" }) },
  { at: "So here's the rule", tag: "THE RULE: REAL LOSS?", tagColor: "olive",
    draw: (S) => B(S, { pose: "carry", face: "determined", item: magnifier(), itemScale: 0.7 }, 300, 0.95) + S.put(`<rect x="-200" y="-70" width="400" height="140" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 6, "REAL LOSS?", 54, C.ink, { font: "bold" }), 640, 620, 1, { anim: "pop", at: "real" }) + S.put(txt(0, 0, "...or just a feeling?", 50, C.oliveDk), 640, 760, 1, { anim: "fade", at: "feel" }) },
  { at: "So, heads or tails", tag: "WOULD YOU TAKE THE BET?", tagColor: "mustard",
    draw: (S) => S.put(sticky(["HEADS OR TAILS?", "TAKE IT / NO WAY"]), CX, 640, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "shrug" }, 280, 0.8, { at: "below" }) },
  { at: "Because if a coin flip says heads", tag: "WOULD YOU TAKE THIS BET?", tagColor: "mustard", tagAt: "coin",
    draw: (S) => HOOK(S, "pop") },
];
