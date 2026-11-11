// EP05 "Why Your Credit Card Balance Never Shrinks" — the anchor episode.
// Same PesaBrain identity. This episode's devices: the MINIMUM anchor on a chain, the card statement with its
// gold MINIMUM DUE box, the debt snowball rolling the wrong way (toward Bean), the ostrich, the avalanche vs
// snowball race, the ladder out of the hole, and the red telephone.
import {
  C, at, txt, bean, brain, calc, coffee, priceTag, coin, coinStack, bill, moneyBag, piggy, wallet, card, phone, envelope,
  letter, calendar, house, car, jar, magnifier, trophy, star, heart, bulb, clock, bubble, cloudThought, arrow, chartLine, axes,
  stampSvg, check, cross, sparkles, confetti, laptop, clipboard, building, gift, hourglass, speedLines, ghost, sun, treadmill, scissors, storm,
} from "../../moneybrain/tools/kit.mjs";
import { cushion } from "../../ep02/tools/props2.mjs";
import { hill, hillY, snowball, toggle, personIcon, stopSign, pie } from "../../ep03/tools/props3.mjs";
import { trap, taxBite } from "../../ep04/tools/props4.mjs";
import { anchor, statement, ostrich, hole, ladder, telephone, handset, debtBall, avalancheHill, scale2 } from "./props5.mjs";

const G = 940;
const B = (S, o, x, s = 1, opt = {}) => S.put(bean(o), x, G, s, { idle: true, ...opt });
const BR = (S, o, x, s = 1, opt = {}) => S.put(brain(o), x, G, s, { idle: true, ...opt });
const PC = (S, o, x, s = 1, opt = {}) => S.put(calc(o), x, G, s, { idle: true, ...opt });
const big = (t, col = C.ink, size = 150) => txt(0, 0, t, size, col, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` });
const hillScene = (S) => S.put(hill(), 0, 0, 1, { anim: "none" });
// the debt snowball rolls DOWN the hill toward Bean standing at the bottom right
function debtRoll(S, x0, x1, s0, s1, at0, dur, label = "DEBT") {
  const y0 = hillY(x0) - 100 * s0, y1 = hillY(x1) - 100 * s1;
  return S.put(debtBall(label), x0, y0, s0, { anim: "pop", id: "db", at: Math.max(0, at0 - 0.25) }) +
    S.js(`tl.fromTo("#${S.id("db")}-i", { x: 0, y: 0, scale: 1, rotation: 0, transformOrigin: "50% 50%" }, { x: ${(x1 - x0) / s0}, y: ${(y1 - y0) / s0}, scale: ${s1 / s0}, rotation: ${Math.round((x1 - x0) / 3)}, duration: ${dur}, ease: "power1.in" }, ${at0});`);
}
function cardsRow(S, list, opts = {}) {
  // list: [label, balance, rate, colour]
  return list.map(([l, b, r, col], i) => S.put(card({ label: r, color: col, number: b }), 420 + i * 540, opts.y || 560, opts.s || 1.2, { anim: opts.anim || "pop", at: opts.at ?? 0.1 + i * 0.15, id: `cd${i}` })).join("");
}
const CARDS = [["A", "$800", "15%", C.olive], ["B", "$2,700", "27%", C.red], ["C", "$2,500", "20%", C.slateDk]];

export const BEATS = [
  /* ================= HOOK ================= */
  { at: "Every month, you pay your credit card bill", tag: "YOU PAY. EVERY. MONTH.",
    draw: (S) => B(S, { pose: "push", face: "determined", item: card({ label: "PAY" }), itemScale: 0.4 }, 560, 1.05) + S.put(calendar(12, 4, { title: "ON TIME", cw: 70, head: C.olive, mark: () => check(0.6) }), 1300, 820, 1, { anim: "pop", at: "time" }) },
  { at: "and every month, the balance barely moves", tag: "...THE BALANCE BARELY MOVES", tagColor: "red",
    draw: (S) => S.put(statement({ balance: "$6,000" }), 960, 1000, 1, { anim: "rise" }) + S.put(txt(0, 0, "still $5,9XX...", 54, C.red, { font: "bold", rot: -6 }), 1450, 500, 1, { anim: "slam", at: "barely" }) },
  { at: "It feels like bad luck", tag: "BAD LUCK? BROKEN CARD? BAD WITH MONEY?", tagSize: 44,
    draw: (S) => [["luck", storm()], ["broken", card({ mouth: true, label: "ERROR" })], ["money", bean({ pose: "cheeks", face: "sad", noShadow: true })]].map(([w, svg], i) => S.put(svg, 440 + i * 520, i === 2 ? G : 640, i === 2 ? 0.8 : 1, { anim: "pop", at: w })).join("") },
  { at: "You're not, you're inside a trap", tag: "IT'S A TRAP", tagColor: "red",
    draw: (S) => S.put(trap(), 960, G, 1.7, { anim: "pop", at: "trap" }) + S.put(bean({ pose: "cheeks", face: "shocked", noShadow: true }), 960, G - 50, 0.55, { anim: "drop", at: "trap" }) + S.put(statement(), 1550, 1000, 0.6, { anim: "slideR", at: "tiny" }) + S.sfx("impact-bass-1", S.t("trap") + 0.2, 0.3) },
  { at: "By the end of this video", tag: "HOW IT WORKS · 2 WAYS OUT · 1 CALL", tagColor: "mustard", tagSize: 48,
    draw: (S) => [["trap", trap(), 0.7], ["two", `<path d="M 0 0 L -120 -200 M 0 0 L 120 -200" stroke="${C.olive}" stroke-width="20" stroke-linecap="round"/>`, 1], ["phone", telephone(), 0.9]].map(([w, svg, s], i) => S.put(svg, 440 + i * 520, 820, s, { anim: "pop", at: w })).join("") },
  { at: "Most people never make it", tag: "MOST PEOPLE NEVER CALL",
    draw: (S) => S.put(telephone(), 960, 860, 1.3, { anim: "pop" }) + S.put(cross(2), 960, 600, 1, { anim: "grow", at: "never" }) },
  { at: "Let's start with the number", tag: "THE NUMBER", tagColor: "slate",
    draw: (S) => S.put(statement(), 960, 1010, 1.05, { anim: "rise" }) + S.put(magnifier(), 1080, 520, 1.3, { anim: "pop", at: "Minimum" }) },
  { at: "Say you owe", tag: "$6,000 AT 22%",
    draw: (S) => S.put(card({ label: "22%", number: "$6,000" }), 760, 560, 1.6, { anim: "pop" }) + S.put(tag2("MIN $170", { size: 44, rot: 8, color: C.gold }), 1250, 720, 1.2, { anim: "drop", at: "170" }) },
  { at: "It looks reasonable", tag: "\"REASONABLE. RESPONSIBLE.\"", tagColor: "olive",
    draw: (S) => B(S, { pose: "push", face: "smile", item: coin(30) }, 760, 1.05) + S.put(statement(), 1350, 1000, 0.8, { anim: "pop" }) + S.put(check(1.4), 1350, 340, 1, { anim: "grow", at: "Responsible" }) },
  { at: "Here's what that minimum hides", tag: "WHAT THE MINIMUM HIDES", tagColor: "red",
    draw: (S) => S.put(tag2("MINIMUM", { size: 60, rot: -4, color: C.gold, w: 380 }), 760, 520, 1.3, { anim: "pop" }) + S.put(`<rect x="-220" y="-160" width="440" height="320" fill="${C.ink}" opacity="0.85"/>` + txt(0, 0, "?", 160, C.white, { font: "bold" }), 1250, 640, 1, { anim: "grow", at: "hides" }) },
  { at: "If you only ever pay the minimum", tag: "ONLY THE MINIMUM...",
    draw: (S) => S.put(calendar(20, 5, { title: "20+ YEARS", cw: 90, head: C.red }), 960, 900, 1, { anim: "pop", at: "20" }) + S.put(hourglass(), 1500, 760, 1.2, { anim: "pop", at: "shrinking" }) },
  { at: "and you'll pay almost $16",
    draw: (S) => S.receipt({ x: 620, y: 170, w: 680, title: "MINIMUM ONLY", lines: [["BORROWED", "$6,000"], ["TIME", "20+ YEARS"]], total: ["YOU PAY", "$15,900"], count: [6000, 15900], at: 0.05, printDur: 0.7 }) },
  { at: "$10 ,000 just for the privilege", tag: "$10,000 TO PAY SLOWLY", tagColor: "red",
    draw: (S) => S.put(big("$10,000", C.red, 170), 960, 520, 1, { anim: "slam" }) + S.put(snailLocal(), 960, 880, 1.3, { anim: "slideL", at: "slowly" }) + S.sfx("impact-bass-1", 0.2, 0.3) },
  { at: "Think about what that $6", tag: "WHAT WAS THE $6,000?",
    draw: (S) => [["laptop", laptop([], {}), 0.7], ["trip", `<rect x="-120" y="-150" width="240" height="180" rx="16" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="6"/><path d="M -50 -150 L -50 -180 L 50 -180 L 50 -150" fill="none" stroke="${C.ink}" stroke-width="6"/>`, 1], ["emergencies", storm(), 0.6], ["dinners", coffee(), 0.8]].map(([w, svg, s], i) => S.put(svg, 360 + i * 400, 860, s, { anim: "pop", at: w })).join("") + S.put(txt(0, 0, "normal life", 54, C.ink), 960, 400, 1, { anim: "fade", at: "normal" }) },
  { at: "But by the time it's paid off", tag: "THE LAPTOP COST ~3×",
    draw: (S) => S.put(laptop(["$1,000"], { size: 60 }), 700, 880, 1, { anim: "pop" }) + S.put(big("×3", C.red, 160), 1300, 600, 1, { anim: "slam", at: "three" }) },
  { at: "You might be on your fourth laptop", tag: "ON LAPTOP #4, STILL PAYING FOR #1", tagSize: 48,
    draw: (S) => [0, 1, 2, 3].map((i) => S.put(laptop([`#${i + 1}`], { size: 70 }), 400 + i * 380, 880, 0.75, { anim: "drop", at: 0.15 + i * 0.25 })).join("") + S.put(txt(0, 0, "still paying", 46, C.red, { font: "bold" }), 400, 560, 1, { anim: "fade", at: "first" }) },
  { at: "And here's the part nobody says out loud", tag: "WHAT NOBODY SAYS", tagColor: "ink",
    draw: (S) => S.put(card({ mouth: true, label: "BANK" }), 960, 600, 1.8, { anim: "pop" }) + S.put(txt(0, 0, "shh...", 60, C.ink), 1400, 420, 1, { anim: "fade", at: "loud" }) },
  { at: "For the card company", tag: "YOU'RE THE PERFECT CUSTOMER", tagColor: "red",
    draw: (S) => S.put(card({ mouth: true }), 640, 600, 1.4, { anim: "pop" }) + S.put(trophy("BEST", { size: 34 }), 1300, G, 1.3, { anim: "drop", at: "perfect" }) },
  { at: "The law actually makes card companies", tag: "THE WARNING BOX", tagColor: "slate",
    draw: (S) => S.put(statement({ warn: true }), 960, 1010, 1.05, { anim: "rise" }) + S.put(magnifier(), 1220, 860, 1, { anim: "pop", at: "box" }) },
  { at: "Most people never read it", tag: "NOBODY READS IT",
    draw: (S) => S.put(statement(), 760, 1000, 0.9, { anim: "none" }) + B(S, { pose: "point", face: "smile" }, 1400, 1) + S.put(`<path d="M 0 0 L -440 -200" stroke="${C.gold}" stroke-width="8" stroke-dasharray="14 12"/>`, 1340, 640, 1, { anim: "wipe", at: "friendly" }) },
  { at: "And that's the first trick", 
    draw: (S) => S.chapter("TRICK #1", "THE ANCHOR") + S.put(anchor("MINIMUM", 280), 960, 260, 0.9, { anim: "drop", at: 0.5 }) },

  /* ================= ANCHORING ================= */
  { at: "Psychologists call it anchoring", tag: "ANCHORING", tagColor: "slate",
    draw: (S) => PC(S, { screen: "ANCHOR", pose: "point", mouth: "o" }, 560, 1) + S.put(anchor("MINIMUM", 120), 1250, 300, 1, { anim: "drop", at: "anchoring" }) },
  { at: "When your brain sees a number first", tag: "THE FIRST NUMBER STICKS",
    draw: (S) => BR(S, { face: "happy", pose: "point" }, 520, 1) + S.put(big("$170", C.gold, 180), 1250, 520, 1, { anim: "slam", at: "first" }) + S.put(txt(0, 0, "...starting point", 50, C.ink), 1250, 700, 1, { anim: "fade", at: "starting" }) },
  { at: "In a study published in 2009", tag: "STEWART, 2009", tagColor: "slate",
    draw: (S) => S.put(clipboard([["NEIL STEWART", ""], ["PSYCHOLOGICAL", ""], ["SCIENCE, 2009", ""]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "2009", pose: "pointL" }, 1400, 0.95, { at: "showed" }) },
  { at: "Some bills showed a minimum payment", tag: "WITH vs. WITHOUT A MINIMUM",
    draw: (S) => S.put(statement(), 640, 1000, 0.8, { anim: "pop" }) + S.put(statement({ min: "—" }), 1280, 1000, 0.8, { anim: "pop", at: "didn't" }) },
  { at: "When the minimum payment was printed", tag: "PRINTED MINIMUM = PAY LESS", tagColor: "red",
    draw: (S) => S.put(`<rect x="-110" y="-200" width="220" height="200" fill="${C.red}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "WITH MIN", 36, C.ink, { font: "bold" }), 700, 880, 1, { anim: "rise", at: "less" }) +
      S.put(`<rect x="-110" y="-480" width="220" height="480" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "NO MIN", 36, C.ink, { font: "bold" }), 1220, 880, 1, { anim: "rise", at: "printed" }) + S.put(txt(0, 0, "REPAID", 40, C.ink, { font: "bold" }), 960, 360, 1, { anim: "fade" }) },
  { at: "just seeing that small number", tag: "IT PULLS YOUR PAYMENT DOWN",
    draw: (S) => S.put(anchor("$170", 80), 960, 380, 1, { anim: "drop" }) + S.put(coinStack(6), 1350, 420, 0.9, { anim: "none", id: "pay" }) + S.js(`tl.to("#${S.id("pay")}-i", { y: 380, duration: 1.0, ease: "power2.in" }, ${S.t("pulled")});`) },
  { at: "The minimum isn't a suggestion", tag: "IT'S AN ANCHOR", tagColor: "red",
    draw: (S) => S.put(`<rect x="0" y="560" width="1920" height="520" fill="${C.slate}" opacity="0.35"/>`, 0, 0, 1, { anim: "fade" }) + S.put(anchor("MINIMUM", 200), 960, 200, 1, { anim: "drop", id: "anc" }) +
      S.js(`tl.to("#${S.id("anc")}-i", { y: 240, duration: 1.4, ease: "power2.in" }, ${S.t("dragging")});`) + S.put(coin(34), 1250, 470, 1, { anim: "none", id: "c" }) + S.js(`tl.to("#${S.id("c")}-i", { y: 380, duration: 1.4, ease: "power2.in" }, ${S.t("dragging")});`) },
  { at: "Now here's the second trick", 
    draw: (S) => S.chapter("TRICK #2", "THE TREADMILL") + S.put(treadmill(), 960, G - 30, 1.1, { anim: "rise", at: 0.5 }) },
  { at: "Remember the snowball", tag: "REMEMBER THE SNOWBALL?", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(snowball("$"), 300, hillY(300) - 120, 1.2, { anim: "grow", at: "snowball" }) + S.put(arrow(260, C.olive, 60), 900, 520, 1, { rot: 25, anim: "wipe", at: "Compound" }) },
  { at: "Credit card debt is the same snowball", tag: "...ROLLING THE WRONG WAY", tagColor: "red",
    draw: (S) => hillScene(S) + S.put(bean({ pose: "cheeks", face: "shocked", noShadow: true }), 1650, hillY(1650) + 4, 0.8, { anim: "pop", at: "toward", idle: true }) + debtRoll(S, 260, 1300, 0.45, 1.3, S.t("rolling"), 1.6) + S.sfx("whoosh", S.t("rolling"), 0.3, 0.6) },
  { at: "Every month, the card adds interest", tag: "INTEREST ON INTEREST", tagColor: "red",
    draw: (S) => S.put(debtBall("$6,000"), 600, 600, 1.5, { anim: "pop" }) + S.put(debtBall("+$110"), 1100, 600, 1.0, { anim: "grow", at: "adds" }) + S.put(debtBall("+$112"), 1450, 600, 0.8, { anim: "grow", at: "interest" }) + S.put(txt(0, 0, "22% a year", 54, C.red, { font: "bold" }), 600, 860, 1, { anim: "fade", at: "22" }) },
  { at: "So when you pay $170", tag: "WHERE YOUR $170 GOES", tagColor: "red",
    draw: (S) => S.put(`<rect x="-500" y="-60" width="1000" height="120" rx="20" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/><rect x="-494" y="-54" width="${988 * 0.65}" height="108" rx="16" fill="${C.red}"/>`, 960, 560, 1, { anim: "wipe" }) +
      S.put(txt(0, 0, "INTEREST ~$110", 42, C.white, { font: "bold" }), 787, 566, 1, { anim: "fade", at: "100" }) + S.put(txt(0, 0, "DEBT $60", 40, C.ink, { font: "bold" }), 1300, 566, 1, { anim: "fade", at: "100" }) + S.put(txt(0, 0, "YOUR $170 PAYMENT", 54, C.ink, { font: "bold" }), 960, 400, 1, { anim: "fade" }) },
  { at: "You're running, you're sweating", tag: "RUNNING IN PLACE", tagColor: "red",
    draw: (S) => S.put(treadmill(), 960, G - 30, 1.3) + B(S, { pose: "cheer", face: "worried", sweat: true }, 920, 1.05, { idle: 0.3 }) + S.put(speedLines(6, 220), 760, 620, 1, { anim: "fade" }) + S.put(txt(0, 0, "SAME PLACE", 60, C.red, { font: "bold" }), 920, 360, 1, { anim: "slam", at: "same" }) },
  { at: "That's why the balance never seems to shrink", tag: "NOT LUCK. MATH.", tagColor: "slate",
    draw: (S) => PC(S, { screen: "MATH", pose: "up", mouth: "flat" }, 640, 1) + S.put(stampSvg("NOT LUCK", C.red, 70, -10), 1250, 500, 1, { anim: "slam", at: "luck" }) + S.put(big("+", C.ink, 110), 1250, 700, 1, { anim: "grow", at: "plus" }) + S.put(brain({ face: "love", noShadow: true }), 1250, 980, 0.55, { anim: "pop", at: "trusts" }) },
  { at: "And there's something else making it worse", tag: "IT DOESN'T FEEL LIKE MONEY",
    draw: (S) => S.put(phone(["BALANCE", "$6,000"], { size: 32, w: 260, head: C.slateDk }), 760, 900, 1.1, { anim: "pop" }) + S.put(`<path d="M -240 0 L 240 0" stroke="${C.ink}" stroke-width="10"/><path d="M 0 0 L 0 -200" stroke="${C.ink}" stroke-width="10"/>`, 1350, 900, 1, { anim: "pop", at: "weigh" }) + S.put(txt(0, 0, "weighs nothing", 50, C.ink), 1350, 980, 1, { anim: "fade", at: "weigh" }) },
  { at: "Remember the pain of paying", tag: "THE PAIN IS HIDDEN FOR YEARS", tagColor: "red",
    draw: (S) => S.put(card({ label: "TAP" }), 700, 600, 1.4, { anim: "pop" }) + S.put(sparkles(5, 200), 700, 600, 1, { anim: "grow", at: "Swiping" }) + S.put(calendar(28, 7, { title: "YEARS", cw: 50, head: C.red }), 1350, 860, 1, { anim: "pop", at: "hidden" }) },
  { at: "And there's a third trick", 
    draw: (S) => S.chapter("TRICK #3", "LOOKING AWAY") + S.put(statement(), 960, 1010, 0.8, { anim: "rise", at: 0.5 }) },
  { at: "Your brain hates looking at debt", tag: "YOUR BRAIN LOOKS AWAY",
    draw: (S) => BR(S, { face: "foiled", pose: "shrug", look: -14 }, 1250, 1.05) + S.put(statement(), 600, 1000, 0.8, { anim: "pop" }) + S.put(txt(0, 0, "failure?", 54, C.red), 1250, 420, 1, { anim: "fade", at: "failure" }) },
  { at: "Psychologists call it the ostrich effect", tag: "THE OSTRICH EFFECT", tagColor: "slate",
    draw: (S) => S.put(ostrich({ label: "DEBT" }), 860, G, 1.6, { anim: "drop", at: "ostrich" }) + S.sfx("pop", S.t("ostrich") + 0.4, 0.3, 0.5) },
  { at: "Studies have found that people check", tag: "CHECK WHEN GOOD · HIDE WHEN BAD", tagSize: 48,
    draw: (S) => S.put(phone(["▲ +$500"], { size: 32, w: 260, head: C.olive }), 600, 900, 1, { anim: "pop", at: "good" }) + S.put(check(1.2), 600, 400, 1, { anim: "grow", at: "good" }) +
      S.put(phone(["▼ −$500"], { size: 32, w: 260, head: C.red }), 1300, 900, 1, { anim: "pop", at: "bad" }) + S.put(ostrich(), 1650, G, 0.55, { anim: "pop", at: "most" }) },
  { at: "So, how do you break out", tag: "HOW DO YOU BREAK OUT?", tagColor: "olive",
    draw: (S) => S.put(hole(), 960, 860, 1.6, { anim: "pop" }) + S.put(bean({ pose: "cheer", face: "determined", noShadow: true }), 960, 900, 0.7, { anim: "rise", at: "break" }) + S.put(txt(0, 0, "2 METHODS", 60, C.oliveDk, { font: "bold" }), 960, 400, 1, { anim: "fade", at: "two" }) },

  /* ================= THE FIXED PAYMENT + AVALANCHE vs SNOWBALL ================= */
  { at: "First, the rule for both", tag: "RULE: A FIXED PAYMENT > MINIMUM", tagColor: "olive", tagSize: 52,
    draw: (S) => S.put(statement(), 640, 1000, 0.8, { anim: "pop" }) + S.put(stampSvg("$170 / MONTH. FIXED.", C.oliveDk, 56, -6), 1350, 420, 1, { anim: "slam", at: "fixed" }) + S.put(cross(1), 640, 640, 1, { anim: "grow", at: "suggests" }) },
  { at: "Remember that $6", tag: "KEEP PAYING THE FIRST $170",
    draw: (S) => S.put(calendar(58, 10, { title: "UNDER 5 YEARS", cw: 56, head: C.olive }), 760, 900, 1, { anim: "pop", at: "under" }) + S.put(calendar(20, 5, { title: "20+", cw: 50, head: C.red }), 1450, 820, 0.9, { anim: "pop", at: "not" }) + S.put(cross(1.5), 1450, 620, 1, { anim: "grow", at: "not" }) },
  { at: "And you'd save around $6",
    draw: (S) => S.receipt({ x: 620, y: 200, w: 680, title: "SAME $170, KEPT FIXED", lines: [["MINIMUM ONLY", "$15,900"], ["FIXED $170", "$9,750"]], total: ["SAVED", "$6,000+"], count: [0, 6150], at: 0.05, printDur: 0.7 }) },
  { at: "Same payment, one decision", tag: "ONE DECISION. $6,000.", tagColor: "olive",
    draw: (S) => [["payment", "SAME PAYMENT"], ["decision", "ONE DECISION"]].map(([w, t], i) => S.put(`<rect x="-260" y="-56" width="520" height="112" rx="56" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 4, t, 48, C.ink, { font: "bold" }), 960, 420 + i * 170, 1, { anim: "pop", at: w })).join("") + S.put(big("$6,000", C.olive, 140), 960, 820, 1, { anim: "slam", at: "6" }) },
  { at: "Now, if you have more than one debt", tag: "MORE THAN ONE DEBT? PICK AN ORDER.", tagSize: 48,
    draw: (S) => cardsRow(S, CARDS) },
  { at: "Method one, the avalanche", tag: "METHOD 1: THE AVALANCHE", tagColor: "slate",
    draw: (S) => S.put(avalancheHill(), 960, G, 1.2, { anim: "rise" }) + [0, 1, 2, 3, 4].map((i) => S.put(`<circle r="${40 - i * 4}" fill="${C.grey}" stroke="${C.ink}" stroke-width="5"/>`, 860 - i * 60, 420 + i * 90, 1, { anim: "drop", at: S.t("avalanche") + i * 0.12 })).join("") },
  { at: "List your debts from the highest interest rate", tag: "HIGHEST RATE FIRST", tagColor: "slate",
    draw: (S) => S.put(clipboard([["CARD B", "27%", C.red], ["CARD C", "20%"], ["CARD A", "15%"]], { w: 560 }), 700, 960, 1.15, { anim: "rise" }) + S.put(`<ellipse rx="240" ry="44" fill="none" stroke="${C.red}" stroke-width="8"/>`, 700, 960 - 312 + 94, 1.15, { anim: "grow", at: "highest" }) + S.put(arrow(220, C.ink, 54), 1060, 650, 1, { anim: "wipe", at: "throw" }) + S.put(coinStack(5), 1450, 760, 1, { anim: "rise", at: "extra" }) },
  { at: "Mathematically, this is the winner", tag: "MATH WINNER: LOWEST COST", tagColor: "olive",
    draw: (S) => PC(S, { screen: "WINNER", pose: "up", mouth: "smile" }, 700, 1.05) + S.put(trophy("AVALANCHE", { size: 24 }), 1300, G, 1.4, { anim: "drop", at: "winner" }) },
  { at: "Method two, the snowball", tag: "METHOD 2: THE SNOWBALL", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(snowball("$"), 400, hillY(400) - 90, 0.9, { anim: "grow", at: "snowball" }) },
  { at: "List your debts from the smallest balance", tag: "SMALLEST BALANCE FIRST", tagColor: "olive",
    draw: (S) => S.put(clipboard([["CARD A", "$800", C.oliveDk], ["CARD C", "$2,500"], ["CARD B", "$2,700"]], { w: 560 }), 700, 960, 1.15, { anim: "rise" }) + S.put(`<ellipse rx="240" ry="44" fill="none" stroke="${C.olive}" stroke-width="8"/>`, 700, 960 - 312 + 94, 1.15, { anim: "grow", at: "smallest" }) + S.put(arrow(220, C.ink, 54), 1060, 650, 1, { anim: "wipe", at: "throw" }) + S.put(coinStack(5), 1450, 760, 1, { anim: "rise", at: "extra" }) },
  { at: "Let's compare", tag: "3 CARDS · $6,000 · $300/MONTH",
    draw: (S) => cardsRow(S, CARDS, { y: 500, s: 1 }) + S.put(btn2("$300 / MONTH"), 960, 860, 1, { anim: "pop", at: "300" }) },
  { at: "With the avalanche, you're debt -free", tag: "AVALANCHE 25 MO · SNOWBALL 26 MO",
    draw: (S) => S.put(`<rect x="-120" y="-500" width="240" height="500" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -540, "25 MO", 52, C.ink, { font: "bold" }) + txt(0, 40, "AVALANCHE", 34, C.ink, { font: "bold" }), 760, 900, 1, { anim: "rise", at: "25" }) +
      S.put(`<rect x="-120" y="-520" width="240" height="520" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -560, "26 MO", 52, C.ink, { font: "bold" }) + txt(0, 40, "SNOWBALL", 34, C.ink, { font: "bold" }), 1160, 900, 1, { anim: "rise", at: "26" }) + S.put(txt(0, 0, "+$300 interest", 46, C.red, { font: "bold" }), 1500, 600, 1, { anim: "fade", at: "300" }) },
  { at: "So, the avalanche wins, right", tag: "SO THE AVALANCHE WINS... RIGHT?",
    draw: (S) => S.put(trophy("AVALANCHE", { size: 24 }), 960, G, 1.5, { anim: "drop" }) + S.put(big("?", C.mustard, 160), 1300, 520, 1, { anim: "grow", at: "right" }) },
  { at: "Here's the twist", tag: "THE TWIST: THE FIRST WIN", tagColor: "red",
    draw: (S) => S.put(`<rect x="-760" y="-40" width="1520" height="80" rx="40" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>`, 960, 760, 1, { anim: "wipe" }) +
      S.put(`<circle r="50" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 4, "5", 48, C.white, { font: "bold" }) + txt(0, -90, "SNOWBALL", 34, C.oliveDk, { font: "bold" }), 960 - 760 + 1520 * 5 / 26, 760, 1, { anim: "grow", at: "five" }) +
      S.put(`<circle r="50" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 4, "15", 44, C.white, { font: "bold" }) + txt(0, 100, "AVALANCHE", 34, C.slateDk, { font: "bold" }), 960 - 760 + 1520 * 15 / 26, 760, 1, { anim: "grow", at: "15" }) + S.put(txt(0, 0, "FIRST CARD PAID OFF (MONTH)", 40, C.ink, { font: "bold" }), 960, 520, 1, { anim: "fade" }) },
  { at: "And that matters more than you'd think", tag: "IT MATTERS",
    draw: (S) => B(S, { pose: "cheer", face: "joy", item: scissors(), itemScale: 0.5 }, 960, 1.1) + S.put(sparkles(6, 260), 960, 600, 1, { anim: "grow" }) },
  { at: "Researchers at Northwestern University", tag: "KELLOGG / NORTHWESTERN STUDY", tagColor: "slate",
    draw: (S) => S.put(clipboard([["GAL & McSHANE", ""], ["SMALL VICTORIES", ""], ["& CONSUMER DEBT", ""]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "STUDY", pose: "pointL" }, 1400, 0.95, { at: "studied" }) },
  { at: "They found that people who paid off whole accounts", tag: "CLOSE ACCOUNTS → MORE LIKELY DEBT-FREE", tagColor: "olive", tagSize: 44,
    draw: (S) => [0, 1, 2].map((i) => S.put(card({ color: [C.olive, C.slateDk, C.red][i] }), 500 + i * 300, 620, 0.9, { anim: "pop", at: 0.1 + i * 0.15 }) + S.put(stampSvg("PAID", C.oliveDk, 40, -10), 500 + i * 300, 620, 1, { anim: "slam", at: S.t("closing") + i * 0.3 })).join("") + S.put(trophy("DEBT-FREE", { size: 22 }), 1500, G, 1.3, { anim: "drop", at: "eliminate" }) },
  { at: "Small wins keep you going", tag: "SMALL WINS KEEP YOU GOING", tagColor: "olive",
    draw: (S) => [0, 1, 2, 3].map((i) => S.put(check(1), 560 + i * 260, 520, 1, { anim: "grow", at: 0.1 + i * 0.25 })).join("") + BR(S, { face: "happy", pose: "cheer" }, 960, 0.9, { at: "proof" }) },
  { at: "Think of it like climbing out of a hole", tag: "TWO LADDERS",
    draw: (S) => S.put(hole(1300), 960, 940, 1, { anim: "pop" }) + S.put(ladder(380, C.slateDk), 640, 1060, 1, { anim: "rise", at: "shortest" }) + S.put(txt(0, 0, "AVALANCHE", 40, C.slateDk, { font: "bold" }), 640, 600, 1, { anim: "fade", at: "shortest" }) +
      S.put(ladder(500, C.olive), 1280, 1060, 1, { anim: "rise", at: "snowball" }) + S.put(txt(0, 0, "SNOWBALL", 40, C.oliveDk, { font: "bold" }), 1280, 480, 1, { anim: "fade", at: "snowball" }) + S.put(check(1), 1280, 400, 1, { anim: "grow", at: "climb" }) },
  { at: "So, which one should you pick", tag: "THE ONE YOU'LL FINISH", tagColor: "mustard",
    draw: (S) => S.put(`<rect x="-260" y="-110" width="520" height="220" rx="20" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -30, "LOVE NUMBERS?", 40, C.white, { font: "bold" }) + txt(0, 40, "AVALANCHE", 56, C.white, { font: "bold" }), 640, 560, 1, { anim: "pop", at: "numbers" }) +
      S.put(`<rect x="-260" y="-110" width="520" height="220" rx="20" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -30, "QUIT BEFORE?", 40, C.ink, { font: "bold" }) + txt(0, 40, "SNOWBALL", 56, C.ink, { font: "bold" }), 1280, 560, 1, { anim: "pop", at: "quit" }) + S.put(trophy("FINISH", { size: 26 }), 960, G, 1, { anim: "drop", at: "finish" }) },
  { at: "But both methods have the same enemy", tag: "THE REAL ENEMY: 22%", tagColor: "red",
    draw: (S) => S.put(card({ mouth: true, label: "22%" }), 960, 600, 1.8, { anim: "pop" }) + S.put(btn2("ATTACK IT"), 960, 920, 1, { anim: "pop", at: "attack" }) },

  /* ================= THE THREE MOVES ================= */
  { at: "Move one",
    draw: (S) => S.chapter("MOVE #1", "THE PHONE CALL", { color: C.oliveDk }) + S.put(telephone(), 960, 900, 1.3, { anim: "drop", at: 0.5 }) },
  { at: "That's it. One phone call", tag: "\"I'D LIKE A LOWER RATE\"",
    draw: (S) => B(S, { pose: "phone", face: "determined", item: handset(), itemScale: 1 }, 560, 1.05) + S.put(card({ mouth: true, label: "22%" }), 1350, 560, 1.2, { anim: "pop" }) +
      S.put(bubble("A LOWER|RATE, PLEASE.", { size: 44, w: 380, h: 140, dx: 160, dy: -120 }), 650, 470, 1, { anim: "grow", at: "lower" }) },
  { at: "Surveys of card holders", tag: "MANY WHO ASK... GET ONE", tagColor: "olive",
    draw: (S) => S.put(card({ label: "16%", color: C.olive }), 960, 600, 1.6, { anim: "pop", at: "get" }) + S.put(stampSvg("APPROVED", C.oliveDk, 60, -10), 960, 860, 1, { anim: "slam", at: "one" }) + S.sfx("chime", S.t("get"), 0.3) },
  { at: "Your brain will tell you it's awkward", tag: "AWKWARD? DO IT ANYWAY.",
    draw: (S) => BR(S, { face: "foiled", pose: "cheeks" === "x" ? "down" : "shrug" }, 560, 0.95) + B(S, { pose: "phone", face: "determined", item: handset() }, 1350, 1.05, { at: "anyway" }) + S.put(clock(), 960, 460, 0.8, { anim: "grow", at: "10" }) + S.put(txt(0, 0, "10 MIN", 50, C.oliveDk, { font: "bold" }), 960, 600, 1, { anim: "fade", at: "minutes" }) },
  { at: "Move two", tag: "MOVE #2: A BALANCE TRANSFER", tagColor: "slate",
    draw: (S) => S.put(card({ label: "22%" }), 560, 600, 1.3, { anim: "pop" }) + S.put(arrow(300, C.olive, 70), 820, 600, 1, { anim: "wipe", at: "transfer" }) + S.put(card({ label: "0%", color: C.olive }), 1400, 600, 1.3, { anim: "pop", at: "0" }) },
  { at: "There's usually a fee", tag: "WATCH: 3–5% FEE · PROMO ENDS", tagColor: "red",
    draw: (S) => S.put(tag2("FEE 3–5%", { size: 44, rot: -8 }), 600, 520, 1.2, { anim: "drop", at: "fee" }) + S.put(calendar(12, 4, { title: "0% UNTIL...", cw: 70, head: C.olive }), 1300, 860, 1, { anim: "pop", at: "offer" }) + S.put(txt(0, 0, "→ 25%", 60, C.red, { font: "bold" }), 1300, 400, 1, { anim: "slam", at: "ends" }) },
  { at: "But used carefully", tag: "EVERY PAYMENT HITS THE BALANCE", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(debtBall("DEBT"), 700, hillY(700) - 120, 1.2, { anim: "pop", id: "frz" }) + S.put(`<rect x="-120" y="-16" width="240" height="32" rx="10" fill="#BFE0F0" stroke="${C.ink}" stroke-width="5"/>`, 700, hillY(700) + 4, 1.2, { anim: "grow", at: "cold" }) + S.put(txt(0, 0, "FROZEN", 54, C.slateDk, { font: "bold" }), 700, 360, 1, { anim: "slam", at: "cold" }) },
  { at: "Move three", tag: "MOVE #3: STOP ADDING", tagColor: "red",
    draw: (S) => S.put(phone(["WALLET", "", "CARD ✕"], { size: 32, w: 260, head: C.slateDk }), 760, 900, 1.1, { anim: "pop" }) + S.put(card(), 1350, 560, 1, { anim: "pop", id: "out" }) + S.js(`tl.to("#${S.id("out")}-i", { x: 300, y: -200, rotation: 30, opacity: 0, duration: 0.7, ease: "power2.in" }, ${S.t("Take")});`) + S.put(stopSign(), 1500, G, 0.9, { anim: "drop", at: "pile" }) },
  { at: "Remember the pain of paying", tag: "PUT THE PAIN BACK",
    draw: (S) => S.put(wallet({ open: true }), 960, 780, 2, { anim: "pop" }) + S.put(txt(0, 0, "ouch.", 70, C.red, { font: "bold" }), 1250, 480, 1, { anim: "fade", at: "back" }) },
  { at: "And if the debt feels too big", tag: "TOO BIG? NONPROFIT COUNSELING", tagColor: "slate",
    draw: (S) => S.put(building({ label: "NONPROFIT" }), 640, G, 1, { anim: "pop", at: "non" }) + B(S, { pose: "wave", face: "smile" }, 1000, 0.9, { at: "plan" }) + S.put(stampSvg("ACCREDITED?", C.oliveDk, 50, -8), 1450, 520, 1, { anim: "slam", at: "accredited" }) },

  /* ================= CLOSE ================= */
  { at: "So here's the truth", tag: "THE TRUTH",
    draw: (S) => S.put(statement(), 960, 1010, 1, { anim: "rise" }) },
  { at: "Your credit card balance doesn't shrink", tag: "A SYSTEM BUILT ON ONE FRIENDLY NUMBER", tagSize: 46,
    draw: (S) => S.put(big("$170", C.gold, 220), 960, 560, 1, { anim: "slam" }) + S.put(brain({ face: "love", noShadow: true }), 1450, G, 0.8, { anim: "pop", at: "trusts" }) },
  { at: "The minimum payment is an anchor", tag: "ANCHOR · SNOWBALL · LOOKING AWAY", tagColor: "red", tagSize: 48,
    draw: (S) => S.put(anchor("MIN", 60), 420, 360, 0.75, { anim: "drop", at: "anchor" }) + S.put(debtBall(), 960, 680, 1.1, { anim: "pop", at: "snowball" }) + S.put(ostrich(), 1500, G, 0.7, { anim: "pop", at: "looking" }) },
  { at: "Here's what it can look like", tag: "BEAN'S PLAN", tagColor: "olive",
    draw: (S) => B(S, { pose: "hold", face: "determined", item: card(), itemScale: 0.5 }, 360, 1) + CARDS.map(([l, b, r, col], j) => S.put(card({ label: r, color: col, number: b }), 800 + j * 400, 600, 1.0, { anim: "pop", at: S.t("cards") + j * 0.15 })).join("") + S.put(txt(0, 0, "$6,000 TOTAL", 56, C.red, { font: "bold" }), 1200, 820, 1, { anim: "fade", at: "debt" }) },
  { at: "He takes the cards out of his phone", tag: "$300 A MONTH · SMALLEST FIRST", tagColor: "olive",
    draw: (S) => S.put(phone(["WALLET", "", "EMPTY"], { size: 32, w: 260, head: C.slateDk }), 600, 900, 1, { anim: "pop" }) + S.put(btn2("$300 / MONTH"), 1300, 520, 1, { anim: "pop", at: "fixed" }) + S.put(btn2("SNOWBALL"), 1300, 720, 1, { anim: "pop", at: "snowball" }) },
  { at: "Month five, the first card hits zero", tag: "MONTH 5: CARD #1 = $0", tagColor: "olive",
    draw: (S) => S.put(card({ color: C.olive, number: "$0" }), 960, 600, 1.6, { anim: "pop", id: "c1" }) + S.put(scissors(), 1350, 600, 1.2, { anim: "slideR", at: "cuts" }) +
      S.js(`tl.to("#${S.id("c1")}-i", { rotation: -25, x: -60, duration: 0.4, ease: "power2.out" }, ${S.t("half") + 0.1});`) + S.sfx("pop", S.t("half"), 0.3, 0.5) },
  { at: "Month 16, the second one", tag: "MONTH 16 · THEN THE LAST ONE", tagColor: "olive",
    draw: (S) => S.put(card({ color: C.slateDk, number: "$0" }), 640, 600, 1.2, { anim: "pop" }) + S.put(stampSvg("PAID", C.oliveDk, 50, -10), 640, 600, 1, { anim: "slam", at: "second" }) +
      S.put(card({ color: C.red, number: "$0" }), 1300, 600, 1.2, { anim: "pop", at: "last" }) + S.put(stampSvg("PAID", C.oliveDk, 50, -10), 1300, 600, 1, { anim: "slam", at: "payment" }) },
  { at: "And for the first time in years", tag: "BALANCE: $0", tagColor: "olive",
    draw: (S) => S.put(statement({ balance: "$0", min: "$0" }), 760, 1010, 1, { anim: "rise" }) + B(S, { pose: "cheer", face: "joy" }, 1400, 1, { at: "zero" }) + S.put(confetti(40, 1600, 700, 6), 960, 760, 1, { anim: "drop", at: "zero" }) + S.sfx("chime", S.t("zero"), 0.35) },
  { at: "So pick a fixed payment", tag: "FIXED PAYMENT · METHOD · CALL · STOP", tagColor: "olive", tagSize: 48,
    draw: (S) => [["fixed", "FIXED PAYMENT"], ["method", "PICK A METHOD"], ["phone", "MAKE THE CALL"], ["stop", "STOP ADDING"]].map(([w, t], i) => S.put(`<rect x="-340" y="-50" width="680" height="100" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + check(0.5).replace("<path", `<path transform="translate(-280 0)"`) + txt(30, 4, t, 46, C.ink, { font: "bold" }), 960, 380 + i * 140, 1, { anim: "slideL", at: w })).join("") },
  { at: "Every dollar you free from interest", tag: "NOW YOUR SNOWBALL ROLLS FOR YOU", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(bean({ pose: "push", face: "joy", noShadow: true }), 170, hillY(170) + 4, 0.55, { anim: "pop" }) + (() => { const x0 = 300, x1 = 1450, s0 = 0.5, s1 = 1.5, y0 = hillY(x0) - 100 * s0, y1 = hillY(x1) - 100 * s1; return S.put(snowball("$"), x0, y0, s0, { anim: "pop", id: "sb", at: S.t("snowball") - 0.3 }) + S.js(`tl.fromTo("#${S.id("sb")}-i", { x: 0, y: 0, scale: 1, rotation: 0, transformOrigin: "50% 50%" }, { x: ${(x1 - x0) / s0}, y: ${(y1 - y0) / s0}, scale: ${s1 / s0}, rotation: 380, duration: 1.8, ease: "power1.in" }, ${S.t("snowball")});`); })() },
  { at: "And once the debt is gone", tag: "NEXT: HOW MUCH SHOULD YOU KEEP?", tagColor: "mustard",
    draw: (S) => B(S, { pose: "think", face: "thinking" }, 560, 1) + S.put(cushion(), 1300, 760, 1, { anim: "pop", at: "bank" }) + S.put(storm(), 1300, 360, 0.8, { anim: "drop", at: "emergency" }) },
  { at: "That's the next video", push: 1.0,
    draw: (S) => S.put(`<rect x="-440" y="-250" width="880" height="500" rx="18" fill="${C.olive}" stroke="${C.ink}" stroke-width="8"/>` +
      `<rect x="-420" y="-230" width="840" height="170" fill="${C.ink}" opacity="0.55"/>` + txt(0, -185, "HOW MUCH SHOULD", 52, C.white, { font: "bold" }) + txt(0, -110, "YOU KEEP IN THE BANK?", 52, C.gold, { font: "bold" }) +
      at(-180, 150, 0.8, cushion()) + `<circle r="56" fill="${C.red}" stroke="${C.ink}" stroke-width="6" cx="280" cy="130"/><path d="M 264 106 L 308 130 L 264 154 Z" fill="${C.white}"/>`, 960, 500, 1, { anim: "grow", at: 0.05 }) +
      S.put(at(-70, 0, 0.32, bean({ face: "happy", noShadow: true })) + at(10, 0, 0.26, brain({ face: "grin", noShadow: true })) + `<text x="70" y="-60" font-family="Archivo Black" font-size="64" fill="${C.ink}" dominant-baseline="middle">PESA<tspan fill="${C.terra}">BRAIN</tspan></text>`, 760, 960, 1, { anim: "rise", at: 0.3 }) },
];

function snailLocal() {
  return `<path d="M -120 0 Q -130 -30 -90 -30 L 80 -30 Q 120 -30 120 0 Z" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/><circle cx="0" cy="-90" r="70" fill="${C.terra}" stroke="${C.ink}" stroke-width="5"/>
    <path d="M -100 -30 L -120 -80 M -84 -30 L -96 -84" stroke="${C.ink}" stroke-width="3.5"/><circle cx="-120" cy="-84" r="8" fill="${C.ink}"/><circle cx="-96" cy="-88" r="8" fill="${C.ink}"/>`;
}
function btn2(label) {
  const w = Math.max(260, label.length * 34 + 80);
  return `<rect x="${-w / 2}" y="-55" width="${w}" height="110" rx="55" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>${txt(0, 4, label, 50, C.ink, { font: "bold" })}`;
}

/* ---------- inserts: split long scenes so the picture changes every ~3–4 s ---------- */
const pill = (t, col = C.white) => `<rect x="${-(t.length * 17 + 60)}" y="-56" width="${t.length * 34 + 120}" height="112" rx="56" fill="${col}" stroke="${C.ink}" stroke-width="6"/>${txt(0, 4, t, 50, C.ink, { font: "bold" })}`;
const INSERTS = {
  "Every month, you pay your credit card bill": [
    { at: "every single month", tag: "EVERY SINGLE MONTH", draw: (S) => [0, 1, 2, 3, 4, 5].map((i) => S.put(check(0.9), 360 + i * 240, 560, 1, { anim: "grow", at: 0.1 + i * 0.18 })).join("") + B(S, { pose: "hold", face: "content", item: card(), itemScale: 0.45 }, 960, 0.8) },
  ],
  "It feels like bad luck": [
    { at: "like you're just bad", tag: "\"I'M JUST BAD WITH MONEY\"", draw: (S) => B(S, { pose: "cheeks", face: "sad" }, 960, 1.1) + S.put(cloudThought(txt(0, -16, "bad with", 40, C.ink, { font: "bold" }) + txt(0, 30, "money?", 40, C.ink, { font: "bold" }), 130), 1350, 420, 1, { anim: "grow", at: "money" }) },
  ],
  "You're not, you're inside a trap": [
    { at: "one tiny number", tag: "ONE TINY NUMBER", tagColor: "mustard", draw: (S) => S.put(statement(), 960, 1010, 1, { anim: "rise" }) + S.put(`<ellipse rx="250" ry="90" fill="none" stroke="${C.red}" stroke-width="10"/>`, 960, 1010 - 640 + 315, 1, { anim: "grow", at: "statement" }) },
  ],
  "By the end of this video": [
    { at: "and the one phone call", tag: "+ 1 PHONE CALL", tagColor: "mustard", draw: (S) => B(S, { pose: "phone", face: "determined", item: handset() }, 700, 1) + S.put(telephone(), 1300, 880, 1.1, { anim: "pop" }) + S.put(txt(0, 0, "SHRINK FASTER", 60, C.oliveDk, { font: "bold" }), 1300, 420, 1, { anim: "slam", at: "shrink" }) },
  ],
  "Let's start with the number": [
    { at: "Minimum payment due", tag: "\"MINIMUM PAYMENT DUE\"", tagColor: "mustard", draw: (S) => S.put(`<rect x="-420" y="-170" width="840" height="340" rx="24" fill="${C.gold}" stroke="${C.ink}" stroke-width="8"/>` + txt(0, -70, "MINIMUM DUE", 70, C.ink, { font: "bold" }) + txt(0, 70, "$170", 150, C.ink, { font: "bold" }), 960, 560, 1, { anim: "slam" }) + S.sfx("impact-bass-1", 0.15, 0.25) },
  ],
  "Say you owe": [
    { at: "Your minimum payment might be", tag: "MINIMUM: ABOUT $170", draw: (S) => B(S, { pose: "point", face: "smile" }, 640, 1) + S.put(tag2("$170", { size: 90, rot: -6, color: C.gold }), 1300, 560, 1.3, { anim: "drop", at: "170" }) },
  ],
  "If you only ever pay the minimum": [
    { at: "and the minimum keeps shrinking", tag: "THE MINIMUM SHRINKS TOO", draw: (S) => [170, 150, 130, 110, 90].map((v, i) => S.put(tag2(`$${v}`, { size: 50 - i * 4, rot: i % 2 ? 6 : -6, color: C.gold }), 400 + i * 280, 600, 1.2 - i * 0.12, { anim: "pop", at: 0.1 + i * 0.3 })).join("") + S.put(arrow(900, C.red, 50), 500, 860, 1, { anim: "wipe", at: "balance" }) },
    { at: "it can take you more than 20 years", tag: "20+ YEARS", tagColor: "red", draw: (S) => S.put(calendar(20, 5, { title: "20+ YEARS", cw: 90, head: C.red }), 760, 900, 1, { anim: "pop" }) + B(S, { pose: "down", face: "sad", old: true }, 1450, 1, { at: "years" }) },
  ],
  "and you'll pay almost $16": [
    { at: "for $6 ,000 of stuff", tag: "$15,900 FOR $6,000 OF STUFF", tagColor: "red", draw: (S) => S.put(`<path d="M -300 0 L 300 0" stroke="${C.ink}" stroke-width="10"/>`, 960, 900, 1, { anim: "none" }) + S.put(moneyBag("$6K"), 640, 900, 0.9, { anim: "pop" }) + S.put(moneyBag("$15.9K"), 1280, 900, 1.4, { anim: "drop", at: "stuff" }) },
  ],
  "Think about what that $6": [
  ],
  "For the card company": [
    { at: "You're the perfect customer", tag: "THE PERFECT CUSTOMER", tagColor: "red", draw: (S) => S.put(trophy("PERFECT", { size: 30 }), 640, G, 1.4, { anim: "drop" }) + B(S, { pose: "cheer", face: "smile" }, 1300, 1) },
    { at: "Someone who always pays", tag: "ALWAYS PAYS · NEVER FINISHES", tagColor: "red", draw: (S) => S.put(treadmill(), 960, G - 30, 1.2) + B(S, { pose: "push", face: "worried", item: coin(30), sweat: true }, 920, 1) },
  ],
  "The law actually makes card companies": [
    { at: "a little box that shows", tag: "\"HOW LONG THE MINIMUM WILL TAKE\"", tagSize: 48, draw: (S) => S.put(`<rect x="-520" y="-220" width="1040" height="440" fill="${C.white}" stroke="${C.red}" stroke-width="10"/>` + txt(0, -140, "MINIMUM PAYMENT WARNING", 46, C.ink, { font: "bold" }) + txt(0, -40, "Only the minimum:", 44, C.ink, { font: "mono" }) + txt(0, 60, "20+ YEARS", 80, C.red, { font: "bold" }) + txt(0, 150, "TOTAL ~$15,900", 56, C.red, { font: "bold" }), 960, 600, 1, { anim: "grow" }) },
  ],
  "Most people never read it": [
    { at: "It's looking at the big", tag: "IT SEES THE BIG FRIENDLY NUMBER", tagColor: "mustard", draw: (S) => BR(S, { face: "love", pose: "hug" }, 640, 1) + S.put(big("$170", C.gold, 200), 1300, 560, 1, { anim: "slam", at: "friendly" }) + S.put(heart(), 1300, 330, 0.8, { anim: "grow", at: "top" }) },
  ],
  "When your brain sees a number first": [
  ],
  "In a study published in 2009": [
    { at: "showed people credit card bills", tag: "PEOPLE SAW CARD BILLS", draw: (S) => [0, 1, 2].map((i) => S.put(statement(), 520 + i * 440, 1000, 0.7, { anim: "rise", at: 0.1 + i * 0.2 })).join("") },
  ],
  "When the minimum payment was printed": [],
  "The minimum isn't a suggestion": [],
  "Remember the snowball": [
    { at: "Compound interest working for you", tag: "COMPOUND INTEREST, FOR YOU", tagColor: "olive", draw: (S) => hillScene(S) + S.put(bean({ pose: "push", face: "joy", noShadow: true }), 200, hillY(200) + 4, 0.55, { anim: "pop" }) + S.put(snowball("$"), 420, hillY(420) - 110, 1.1, { anim: "grow", at: "growing" }) + S.put(txt(0, 0, "bigger every year", 54, C.oliveDk), 960, 360, 1, { anim: "fade", at: "every" }) },
  ],
  "Every month, the card adds interest": [
    { at: "Then next month, it charges interest", tag: "THEN INTEREST ON THE INTEREST", tagColor: "red", draw: (S) => S.put(debtBall("$6,110"), 700, 600, 1.6, { anim: "pop" }) + S.put(debtBall("+$112"), 1250, 600, 1.0, { anim: "grow", at: "charges" }) + S.put(debtBall("+$2"), 1600, 600, 0.55, { anim: "grow", at: "that" }) },
  ],
  "So when you pay $170": [
    { at: "On that first payment", tag: "$110+ STRAIGHT TO INTEREST", tagColor: "red", draw: (S) => S.put(coinStack(6), 640, 900, 1.2, { anim: "pop" }) + S.put(card({ mouth: true, label: "22%" }), 1300, 560, 1.4, { anim: "pop", at: "straight" }) + S.put(arrow(400, C.red, 60), 820, 700, 1, { anim: "wipe", at: "straight" }) },
  ],
  "You're running, you're sweating": [],
  "That's why the balance never seems to shrink": [
    { at: "It's math, plus a brain", tag: "MATH + A BRAIN THAT TRUSTS THE WRONG NUMBER", tagSize: 42, draw: (S) => BR(S, { face: "love", pose: "hug" }, 760, 1) + S.put(big("$170", C.gold, 160), 1350, 560, 1, { anim: "slam", at: "wrong" }) },
  ],
  "And there's something else making it worse": [
    { at: "It's a number on a screen", tag: "JUST A NUMBER ON A SCREEN", draw: (S) => S.put(phone(["BALANCE", "$6,000"], { size: 32, w: 260, head: C.slateDk }), 960, 900, 1.3, { anim: "pop" }) },
    { at: "It doesn't sit in your wallet", tag: "NOT IN YOUR WALLET", draw: (S) => S.put(wallet({ open: true }), 960, 760, 1.8, { anim: "pop" }) + S.put(txt(0, 0, "nothing here...", 56, C.ink), 960, 400, 1, { anim: "fade", at: "wallet" }) },
  ],
  "Remember the pain of paying": [
    { at: "And the debt keeps that pain hidden", tag: "THE PAIN, HIDDEN FOR YEARS", tagColor: "red", draw: (S) => S.put(calendar(28, 7, { title: "YEARS", cw: 56, head: C.red }), 960, 880, 1.1, { anim: "pop" }) + S.put(hourglass(), 1500, 760, 1.1, { anim: "pop", at: "hidden" }) },
  ],
  "Your brain hates looking at debt": [
    { at: "So it does the comfortable thing", tag: "SO IT LOOKS AWAY", draw: (S) => BR(S, { face: "yawn", pose: "shrug" }, 960, 1.1) + S.put(statement(), 400, 1000, 0.5, { anim: "slideL" }) },
  ],
  "Studies have found that people check": [
    { at: "Exactly when looking matters most", tag: "EXACTLY WHEN IT MATTERS MOST", tagColor: "red", draw: (S) => S.put(ostrich({ label: "DEBT" }), 960, G, 1.4, { anim: "pop" }) + S.put(debtBall("DEBT"), 1550, 600, 1.0, { anim: "grow", at: "most" }) },
  ],
  "First, the rule for both": [
    { at: "and pay it every month", tag: "EVERY MONTH, NO MATTER WHAT", tagColor: "olive", draw: (S) => S.put(calendar(12, 4, { title: "$170 / MO", cw: 80, head: C.olive, mark: () => check(0.6) }), 960, 880, 1.05, { anim: "pop" }) },
  ],
  "Remember that $6": [
    { at: "you'd be done in under five years", tag: "UNDER 5 YEARS, NOT 20", tagColor: "olive", draw: (S) => S.put(big("< 5 YRS", C.olive, 170), 760, 560, 1, { anim: "slam" }) + S.put(big("20", C.red, 120), 1450, 560, 1, { anim: "fade", at: "not" }) + S.put(cross(1.3), 1450, 560, 1, { anim: "grow", at: "20" }) },
  ],
  "List your debts from the highest interest rate": [
    { at: "and throw every extra dollar", tag: "EXTRA $ → HIGHEST RATE", tagColor: "slate", draw: (S) => S.put(card({ label: "27%", color: C.red }), 1300, 600, 1.4, { anim: "pop" }) + [0, 1, 2].map((i) => S.put(coin(30), 500 + i * 120, 600 - i * 40, 1, { anim: "slideL", at: S.t("extra") + i * 0.2 })).join("") },
  ],
  "List your debts from the smallest balance": [
    { at: "and throw every extra dollar", tag: "EXTRA $ → SMALLEST BALANCE", tagColor: "olive", draw: (S) => S.put(card({ label: "$800", color: C.olive }), 1300, 600, 1.4, { anim: "pop" }) + [0, 1, 2].map((i) => S.put(coin(30), 500 + i * 120, 600 - i * 40, 1, { anim: "slideL", at: S.t("extra") + i * 0.2 })).join("") },
  ],
  "With the avalanche, you're debt -free": [
    { at: "and around $300 more", tag: "SNOWBALL: ~$300 MORE", tagColor: "mustard", draw: (S) => S.put(tag2("+$300", { size: 90, rot: -6 }), 960, 560, 1.4, { anim: "drop" }) },
  ],
  "Here's the twist": [
    { at: "With the avalanche, you wait", tag: "AVALANCHE: WAIT UNTIL MONTH 15", tagColor: "slate", draw: (S) => S.put(calendar(15, 5, { title: "MONTH 15", cw: 64, head: C.slateDk }), 760, 880, 1, { anim: "pop" }) + B(S, { pose: "down", face: "sleep" }, 1400, 1) },
  ],
  "Researchers at Northwestern University": [
    { at: "studied real people", tag: "REAL PEOPLE, REAL DEBT", draw: (S) => [0, 1, 2, 3, 4].map((i) => S.put(personIcon(), 440 + i * 260, 820, 2, { anim: "pop", at: 0.1 + i * 0.12 })).join("") },
  ],
  "They found that people who paid off whole accounts": [],
  "Think of it like climbing out of a hole": [
    { at: "The snowball gives you a ladder", tag: "SNOWBALL: SEE EACH STEP WORK", tagColor: "olive", draw: (S) => S.put(ladder(600, C.olive), 960, 1000, 1, { anim: "rise" }) + [0, 1, 2, 3].map((i) => S.put(check(0.6), 1100, 920 - i * 140, 1, { anim: "grow", at: S.t("step") + i * 0.25 })).join("") + S.put(bean({ pose: "cheer", face: "happy", noShadow: true }), 960, 760, 0.45, { anim: "pop", at: "working" }) },
    { at: "If you keep falling off", tag: "THE LADDER YOU CLIMB WINS", tagColor: "mustard", draw: (S) => S.put(ladder(300, C.slateDk), 640, 1000, 1, { anim: "pop" }) + S.put(bean({ pose: "cheeks", face: "shocked", noShadow: true }), 760, 960, 0.45, { anim: "drop", at: "falling" }) + S.put(ladder(560, C.olive), 1300, 1000, 1, { anim: "pop", at: "longer" }) + S.put(trophy("WINS", { size: 30 }), 1600, G, 0.9, { anim: "drop", at: "better" }) },
  ],
  "So, which one should you pick": [
    { at: "The best method is the one", tag: "THE BEST METHOD = THE ONE YOU FINISH", tagColor: "mustard", tagSize: 46, draw: (S) => S.put(trophy("FINISHED", { size: 28 }), 960, G, 1.6, { anim: "drop" }) + B(S, { pose: "cheer", face: "joy" }, 1450, 0.9, { at: "finish" }) + S.put(confetti(30, 1400, 400, 5), 960, 720, 1, { anim: "drop", at: "finish" }) },
  ],
  "But both methods have the same enemy": [
    { at: "And there's a way to attack it", tag: "ATTACK THE RATE DIRECTLY", tagColor: "olive", draw: (S) => S.put(card({ mouth: true, label: "22%" }), 1200, 600, 1.5, { anim: "pop" }) + B(S, { pose: "point", face: "determined" }, 560, 1) + S.put(arrow(260, C.olive, 60), 760, 600, 1, { anim: "wipe", at: "directly" }) },
  ],
  "Move one": [
  ],
  "Your brain will tell you it's awkward": [],
  "Move two": [
    { at: "Some cards offer 0", tag: "0% FOR A YEAR OR MORE", tagColor: "olive", draw: (S) => S.put(card({ label: "0%", color: C.olive }), 760, 600, 1.6, { anim: "pop" }) + S.put(calendar(12, 4, { title: "12+ MONTHS", cw: 60, head: C.olive }), 1450, 860, 0.9, { anim: "pop", at: "year" }) },
  ],
  "But used carefully": [],
  "Move three": [
    { at: "Take the card out of your phone", tag: "OUT OF YOUR PHONE. OUT OF SAVED PAYMENTS.", tagSize: 42, draw: (S) => S.put(laptop(["SAVED CARDS", "REMOVE ✕"], { size: 44 }), 960, 900, 1.1, { anim: "pop", at: "saved" }) + S.put(cross(1.2), 1400, 500, 1, { anim: "grow", at: "payments" }) },
  ],
  "And if the debt feels too big": [
    { at: "and be careful with anyone", tag: "\"WE'LL MAKE DEBT DISAPPEAR\" = RUN", tagColor: "red", tagSize: 48, draw: (S) => S.put(magicHatLocal(), 760, G, 1, { anim: "pop" }) + B(S, { pose: "stop", face: "wince" }, 1350, 1, { at: "disappear" }) },
  ],
  "Your credit card balance doesn't shrink": [],
  "The minimum payment is an anchor": [
    { at: "and looking away only makes it bigger", tag: "LOOKING AWAY MAKES IT BIGGER", tagColor: "red", draw: (S) => S.put(ostrich(), 640, G, 1, { anim: "pop" }) + S.put(debtBall("DEBT"), 1350, 600, 1.4, { anim: "grow", at: "bigger" }) },
  ],
  "He takes the cards out of his phone": [],
  "So pick a fixed payment": [],
  "Every dollar you free from interest": [
    { at: "The one rolling toward you", tag: "ROLLING THE RIGHT WAY", tagColor: "olive", draw: (S) => S.put(snowball("$"), 960, 620, 2, { anim: "grow" }) + S.put(sparkles(6, 300), 960, 620, 1, { anim: "grow", at: "right" }) },
  ],
  "And once the debt is gone": [
    { at: "How much is actually enough", tag: "HOW MUCH IS ENOUGH?", tagColor: "mustard", draw: (S) => S.put(jar("BANK", 0.15), 960, G, 1.4, { anim: "pop" }) + S.put(big("?", C.mustard, 200), 1350, 520, 1, { anim: "grow", at: "enough" }) },
    { at: "Too little, and one emergency", tag: "TOO LITTLE = BACK IN THE TRAP", tagColor: "red", draw: (S) => S.put(trap(), 960, G, 1.4, { anim: "pop" }) + S.put(storm(), 960, 360, 0.8, { anim: "drop", at: "emergency" }) },
  ],
};
function magicHatLocal() {
  return `<rect x="-120" y="-240" width="240" height="220" fill="${C.ink}"/><rect x="-170" y="-30" width="340" height="30" rx="10" fill="${C.ink}"/><rect x="-120" y="-90" width="240" height="30" fill="${C.red}"/>${txt(0, -150, "DEBT", 40, C.white, { font: "bold" })}`;
}
const BASE = BEATS.splice(0);
for (const b of BASE) { BEATS.push(b); for (const x of INSERTS[b.at] || []) BEATS.push(x); delete INSERTS[b.at]; }

function tag2(label, o = {}) { return priceTag(label, { ...o, w: o.w || Math.round(label.length * (o.size || 40) * 0.68 + 80) }); }
