// EP03 "The Boring Way to Get Rich" — the cooking-show + snowball episode.
// Same PesaBrain identity (ledger paper, price tags, receipts, Bean / Impulse / Prof. Calc).
// This episode's devices: the kitchen set where each ingredient jar drops into the mixing bowl,
// the snowy hill with the $ snowball that grows with the numbers, the BORING-O-METER and
// Impulse's temptations (rockets, moon coins, slot machines).
import {
  C, at, txt, bean, brain, calc, coffee, priceTag, coin, coinStack, bill, moneyBag, piggy, wallet, card, phone, envelope,
  letter, calendar, house, car, jar, magnifier, trophy, star, heart, bulb, clock, bubble, cloudThought, arrow, chartLine, axes,
  stampSvg, check, cross, sparkles, confetti, snail, laptop, clipboard, building, gift, hourglass, speedLines, ghost, bucket, storm, sun,
} from "../../moneybrain/tools/kit.mjs";
import { cushion, anvil } from "../../ep02/tools/props2.mjs";
import {
  kitchen, bowl, ingredientJar, recipeCard, chefHat, hill, hillY, snowball, boringMeter, slotMachine, rocket, haystack, companyBlock,
  pie, personIcon, toggle, hammock, sandwich, stopSign, timelineBar, moonCoin, SNOW,
} from "./props3.mjs";

const G = 940;
const B = (S, o, x, s = 1, opt = {}) => S.put(bean(o), x, G, s, { idle: true, ...opt });
const BR = (S, o, x, s = 1, opt = {}) => S.put(brain(o), x, G, s, { idle: true, ...opt });
const PC = (S, o, x, s = 1, opt = {}) => S.put(calc(o), x, G, s, { idle: true, ...opt });
const AVA = (o = {}) => bean({ color: C.pink, face: "happy", ...o, front: `<path d="M -50 -372 Q -20 -400 6 -372 Q 30 -400 60 -372 L 40 -350 L -30 -350 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/>` });
const LEO = (o = {}) => bean({ color: C.slate, face: "neutral", ...o, front: `<path d="M -70 -330 Q -60 -400 10 -398 Q 70 -396 76 -330 Z" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="5"/><path d="M 60 -334 L 130 -330" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>` });
const chef = (o = {}) => bean({ pose: "wave", face: "happy", front: at(4, -372, 0.95, chefHat()), ...o });
const big = (t, col = C.ink, size = 150) => txt(0, 0, t, size, col, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` });
const meter = (S, x, y, s, from, to, at0 = 0.3) => S.put(boringMeter(S.id("ndl")), x, y, s, { anim: "pop" }) +
  S.js(`tl.fromTo("#${S.id("ndl")}", { rotation: ${from}, svgOrigin: "0 0" }, { rotation: ${to}, duration: 0.9, ease: "back.out(1.6)" }, ${at0});`);

// the kitchen opener for each ingredient: recipe card slides in, the jar drops into the bowl
function ingredient(S, num, title, label, col, icon = "") {
  const T = +Math.min(0.9, S.dur * 0.35).toFixed(2);
  return S.put(kitchen(), 0, 0, 1, { anim: "none" }) +
    S.put(recipeCard(num, title, { w: 560, h: 260 }), 860, 350, 1, { anim: "drop", at: 0.05, d: 0.55 }) +
    S.put(chef(), 470, 1060, 0.95, { anim: "slideL", at: 0.1, idle: true }) +
    S.put(bowl(0), 1300, 780, 1, { anim: "pop", at: 0.15 }) + S.put(`<ellipse id="${S.id("lvl")}" cx="0" cy="-196" rx="190" ry="30" fill="${col}"/>`, 1300, 780, 1, { anim: "none" }) +
    S.put(ingredientJar(label, icon, col), 1300, 560, 0.8, { anim: "drop", at: T - 0.35, id: "jar" }) +
    S.js(`tl.to("#${S.id("jar")}-i", { y: 220, scale: 0.4, opacity: 0, duration: 0.35, ease: "power2.in", transformOrigin: "50% 100%" }, ${T + 0.45});
      tl.fromTo("#${S.id("lvl")}", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.3, ease: "back.out(2)" }, ${T + 0.75});`) +
    S.put(sparkles(5, 200), 1300, 560, 1, { anim: "grow", at: T + 0.8 }) + S.sfx("whoosh", 0.05, 0.25, 0.6) + S.sfx("sparkle", T + 0.75, 0.3, 1.5);
}
// a snowball rolling down the hill between two x positions, growing as it goes
function roll(S, label, x0, x1, s0, s1, at0, dur, id = "sb") {
  const y0 = hillY(x0) - 100 * s0, y1 = hillY(x1) - 100 * s1;
  return S.put(snowball(label), x0, y0, s0, { anim: "pop", id, at: Math.max(0, at0 - 0.25) }) +
    S.js(`tl.fromTo("#${S.id(id)}-i", { x: 0, y: 0, scale: 1, rotation: 0, transformOrigin: "50% 50%" }, { x: ${(x1 - x0) / s0}, y: ${(y1 - y0) / s0}, scale: ${s1 / s0}, rotation: ${Math.round((x1 - x0) / 3)}, duration: ${dur}, ease: "power1.in" }, ${at0});`);
}
const hillScene = (S) => S.put(hill(), 0, 0, 1, { anim: "none" });

export const BEATS = [
  /* ================= HOOK ================= */
  { at: "Here's something nobody wants to hear", tag: "NOBODY WANTS TO HEAR THIS",
    draw: (S) => B(S, { pose: "phone", face: "smug" }, 640, 1.05) + BR(S, { face: "foiled", pose: "cheeks" === "cheeks" ? "hold" : "hold" }, 1280, 1, { at: "hear" }) },
  { at: "The most reliable way to build wealth", tag: "THE MOST RELIABLE WAY TO GET RICH...", tagSize: 48,
    draw: (S) => PC(S, { screen: "WEALTH", pose: "up", mouth: "smile" }, 760, 1.05) + S.put(moneyBag("$$$"), 1300, G, 1.3, { anim: "drop", at: "wealth" }) },
  { at: "is incredibly boring", tag: "...IS INCREDIBLY BORING", tagColor: "slate",
    draw: (S) => meter(S, 1250, 640, 1.2, -60, 82, S.t("boring")) + BR(S, { face: "yawn", pose: "down" }, 560, 1) + S.put(txt(0, 0, "zzz", 60, C.grey, { font: "bold" }), 640, 440, 1, { anim: "fade", at: "boring" }) },
  { at: "No secret stock", tag: "NONE OF THIS",
    draw: (S) => [["stock", `<rect x="-150" y="-170" width="300" height="170" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + chartLine([[-120, -30], [-60, -60], [0, -40], [60, -120], [120, -150]], C.olive, 8) + txt(0, 40, "SECRET STOCK", 32, C.ink, { font: "bold" })],
      ["crypto", at(0, -10, 1, rocket("COIN")) + txt(0, 40, "TO THE MOON", 32, C.ink, { font: "bold" })],
      ].map(([w, svg], i) =>
      S.put(svg, 640 + i * 640, 780, 1, { anim: "pop", at: w }) + S.put(cross(1.8), 640 + i * 640, 620, 1, { anim: "grow", at: S.t(w) + 0.4 })).join("") },
  { at: "Just a few dull habits", tag: "DULL HABITS. REPEATED.", tagColor: "olive",
    draw: (S) => B(S, { pose: "push", face: "content", item: coin(26) }, 560, 1) + S.put(jar("", 0.3, { fillId: S.id("f") }), 960, G, 1.1, { anim: "pop" }) +
      S.put(calendar(28, 7, { title: "EVERY MONTH", cw: 50, head: C.olive, mark: () => check(0.8) }), 1460, 820, 1, { anim: "pop", at: "repeated" }) +
      S.js(`tl.fromTo("#${S.id("f")}", { scaleY: 0.3, transformOrigin: "50% 100%" }, { scaleY: 1, duration: ${Math.max(1, S.dur - 0.6).toFixed(2)}, ease: "none" }, 0.3);`) },
  { at: "And the reason most people never get rich", tag: "THE BORING WAY WORKS...", tagColor: "olive",
    draw: (S) => B(S, { pose: "hold", face: "smile", item: `<rect x="-150" y="-60" width="300" height="120" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, "BORING WAY", 40, C.ink, { font: "bold" }) + at(150, -40, 0.9, check(0.7)), itemScale: 0.9 }, 960, 1.1) },
  { at: "It's that the boring way is boring", tag: "...IT'S JUST BORING", tagColor: "slate",
    draw: (S) => meter(S, 1300, 640, 1, 0, 80) + BR(S, { face: "meh", pose: "down", noShadow: true }, 640, 0.95) },
  { at: "and your brain hates boring", tag: "YOUR BRAIN HATES BORING", tagColor: "red",
    draw: (S) => BR(S, { face: "shout", pose: "cheer" }, 960, 1.2, { id: "tan" }) + S.put(bubble("BORING!!", { size: 64, w: 340, h: 120, dx: 160, dy: -110 }), 1060, 420, 1, { anim: "grow", at: "hates" }) +
      S.js(`tl.to("#${S.id("tan")}", { x: 14, duration: 0.05, yoyo: true, repeat: 7, ease: "none" }, ${S.t("hates")});`) },
  { at: "In the last video, we found the gap", tag: "LAST TIME: THE GAP", tagColor: "olive",
    draw: (S) => S.put(`<rect x="-160" y="-520" width="320" height="520" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "YOU EARN", 36, C.ink, { font: "bold" }), 760, 900, 1, { anim: "rise" }) +
      S.put(`<rect x="-160" y="-310" width="320" height="310" fill="${C.terra}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "YOU NEED", 36, C.ink, { font: "bold" }), 1160, 900, 1, { anim: "rise", at: 0.2 }) +
      S.put(`<path d="M 0 0 L 0 -210" stroke="${C.gold}" stroke-width="12"/>` + txt(170, -105, "THE GAP", 60, C.oliveDk, { font: "bold" }), 1160, 590, 1, { anim: "grow", at: "gap" }) },
  { at: "Today, we're going to turn that gap", tag: "TODAY: THE GAP → REAL WEALTH", tagColor: "olive", tagSize: 52,
    draw: (S) => hillScene(S) + S.put(`<rect x="-120" y="-200" width="240" height="200" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -100, "GAP", 56, C.ink, { font: "bold" }), 260, 380, 0.8, { anim: "pop" }) + roll(S, "$", 380, 1500, 0.4, 1.3, S.t("turn"), 2.2) },
  { at: "automatically, without you having to be a genius", tag: "NO GENIUS. NO LUCK.",
    draw: (S) => [["automatically", `<circle r="70" fill="${C.grey}" stroke="${C.ink}" stroke-width="5"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<rect x="-12" y="-92" width="24" height="26" fill="${C.grey}" stroke="${C.ink}" stroke-width="4" transform="rotate(${i * 60})"/>`).join("") + `<circle r="24" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>`, "AUTO", false],
      ["genius", bulb(), "GENIUS", true], ["lucky", `<g fill="${C.olive}" stroke="${C.ink}" stroke-width="5">${[0, 1, 2, 3].map((i) => `<circle cx="${Math.cos(i * Math.PI / 2) * 40}" cy="${Math.sin(i * Math.PI / 2) * 40}" r="40"/>`).join("")}</g>`, "LUCK", true], ["attention", at(0, 80, 0.6, magnifier()), "ATTENTION", true]].map(([w, svg, lab, x], i) =>
      S.put(svg + txt(0, 150, lab, 36, C.ink, { font: "bold" }), 400 + i * 380, 600, 1, { anim: "pop", at: w }) + (x ? S.put(cross(1.4), 400 + i * 380, 600, 1, { anim: "grow", at: S.t(w) + 0.3 }) : S.put(check(1.2), 400 + i * 380, 420, 1, { anim: "grow", at: S.t(w) + 0.3 }))).join("") },
  { at: "By the end of this video", tag: "THE WHOLE RECIPE: 4 INGREDIENTS", tagColor: "mustard", tagSize: 52,
    draw: (S) => S.put(kitchen(), 0, 0, 1, { anim: "none" }) + S.put(chef(), 400, 1060, 0.95, { anim: "slideL" }) +
      [1, 2, 3, 4].map((n, i) => S.put(ingredientJar(`#${n}`, "", [C.olive, C.slateDk, C.mustard, C.terra][i]), 820 + i * 260, 770, 0.85, { anim: "drop", at: S.t("four") + i * 0.15 })).join("") },
  { at: "and the last one is the one almost everyone gets wrong", tag: "#4: ALMOST EVERYONE GETS IT WRONG", tagColor: "red", tagSize: 48,
    draw: (S) => S.put(kitchen(), 0, 0, 1, { anim: "none" }) + [1, 2, 3].map((n, i) => S.put(ingredientJar(`#${n}`, "", C.grey), 520 + i * 240, 770, 0.75, { anim: "none" })).join("") +
      S.put(`<circle r="190" fill="${C.gold}" opacity="0.35"/>` + ingredientJar("#4", txt(0, 0, "?", 70, C.red, { font: "bold" }), C.terra), 1380, 770, 1.05, { anim: "grow" }) + S.sfx("sparkle", 0.4, 0.25, 1.5) },
  { at: "Let's start with the engine", tag: "THE ENGINE BEHIND IT ALL",
    draw: (S) => S.put(`<circle r="130" fill="${C.grey}" stroke="${C.ink}" stroke-width="6"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="-20" y="-168" width="40" height="44" fill="${C.grey}" stroke="${C.ink}" stroke-width="5" transform="rotate(${i * 45})"/>`).join("") + `<circle r="50" fill="${C.paper}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 6, "$", 60, C.oliveDk, { font: "bold" }), 960, 560, 1.2, { anim: "grow", id: "eng" }) +
      S.js(`tl.to("#${S.id("eng")}-i", { rotation: 200, transformOrigin: "50% 50%", duration: ${S.dur.toFixed(2)}, ease: "none" }, 0);`) },
  { at: "It's called compound interest", tag: "COMPOUND INTEREST", tagColor: "slate",
    draw: (S) => PC(S, { screen: "COMPOUND", pose: "point", mouth: "smile" }, 700, 1.05) + S.put(coin(60), 1180, 560, 1, { anim: "grow", at: "compound" }) + S.put(coin(44), 1320, 470, 1, { anim: "grow", at: "interest" }) + S.put(coin(32), 1420, 400, 1, { anim: "grow", at: S.t("interest") + 0.3 }) },
  { at: "and it works like a snowball", tag: "IT WORKS LIKE A SNOWBALL", tagColor: "slate",
    draw: (S) => hillScene(S) + S.put(snowball("$"), 960, 520, 1.6, { anim: "grow", at: "snowball" }) + S.sfx("pop", S.t("snowball"), 0.25, 0.5) },
  { at: "Picture a tiny snowball at the top of a hill", tag: "A TINY SNOWBALL",
    draw: (S) => hillScene(S) + S.put(snowball(""), 260, hillY(260) - 30, 0.3, { anim: "grow", at: "tiny" }) + S.put(bean({ pose: "point", face: "smile", noShadow: true }), 140, hillY(140) + 4, 0.5, { anim: "pop" }) + S.put(arrow(140, C.ink, 40), 470, 260, 1, { rot: 150, anim: "wipe", at: "top" }) },
  { at: "As it rolls, it picks up snow", tag: "IT ROLLS... IT GROWS",
    draw: (S) => hillScene(S) + roll(S, "", 260, 1000, 0.3, 0.8, 0.2, Math.max(1.2, S.dur - 0.4)) },
  { at: "The bigger it gets", tag: "BIGGER = MORE SNOW EVERY TURN", tagSize: 52,
    draw: (S) => hillScene(S) + roll(S, "", 800, 1620, 0.7, 1.6, 0.1, Math.max(1.2, S.dur - 0.3)) + S.put(speedLines(5, 200), 900, 600, 1, { anim: "fade", at: 0.6 }) },
  { at: "At first, nothing seems to happen", tag: "AT FIRST... NOTHING",
    draw: (S) => S.put(axes(1000, 520), 460, 900, 1, { anim: "fade" }) + S.put(chartLine([[0, -20], [200, -30], [400, -45], [600, -70]], C.olive, 14, S.id("c")), 460, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("c")}", { attr: { "stroke-dasharray": "0 2000" } }, { attr: { "stroke-dasharray": "700 2000" }, duration: 1.4, ease: "none" }, 0.2);`) + S.put(snail(), 1080, 820, 0.5, { anim: "pop", at: "nothing" }) },
  { at: "and then everything happens at once", tag: "...THEN EVERYTHING AT ONCE", tagColor: "olive",
    draw: (S) => S.put(axes(1000, 520), 460, 900, 1, { anim: "none" }) + S.put(chartLine([[0, -20], [200, -30], [400, -45], [600, -70], [750, -130], [870, -260], [960, -460]], C.olive, 14, S.id("c")), 460, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("c")}", { attr: { "stroke-dasharray": "700 3000" } }, { attr: { "stroke-dasharray": "1400 3000" }, duration: 0.7, ease: "power3.in" }, ${S.t("everything")});`) + S.shake(S.t("once"), 10) + S.sfx("impact-bass-1", S.t("once"), 0.3) + S.put(snowball("$"), 1380, 420, 1.1, { anim: "grow", at: "once" }) },
  { at: "Money does the same thing", tag: "MONEY DOES THE SAME",
    draw: (S) => hillScene(S) + roll(S, "$", 300, 1300, 0.4, 1.2, 0.2, Math.max(1.2, S.dur - 0.3)) },
  { at: "Your money earns a return", tag: "RETURNS ON RETURNS", tagColor: "olive",
    draw: (S) => S.put(coin(90), 520, 600, 1, { anim: "grow" }) + S.put(arrow(120, C.olive, 40), 640, 600, 1, { anim: "wipe", at: "return" }) + S.put(coin(70), 860, 600, 1, { anim: "grow", at: "return" }) +
      S.put(arrow(110, C.olive, 36), 960, 600, 1, { anim: "wipe", at: "then" }) + S.put(coin(54), 1160, 600, 1, { anim: "grow", at: "then" }) },
  { at: "Let's put real numbers on it", tag: "REAL NUMBERS", tagColor: "slate",
    draw: (S) => PC(S, { screen: "$300/MO", pose: "up", mouth: "o" }, 960, 1.15) },
  { at: "Say you invest $300 a month",
    draw: (S) => S.receipt({ x: 1060, y: 220, w: 600, title: "THE BORING PLAN", lines: [["INVEST", "$300/MO"], ["FOR", "30 YEARS"], ["AVG GROWTH", "7%/YR"]], at: 0.1, printDur: 0.9 }) + B(S, { pose: "push", face: "smile", item: coin(26) }, 560, 1) },
  { at: "How much did you put in?", tag: "YOU PUT IN...",
    draw: (S) => S.put(coinStack(8), 760, G, 1.4, { anim: "rise" }) + S.put(S.countText(0, 0, 0, 108000, { at: "108", size: 140, color: C.ink, stroke: false }), 1300, 560, 1, { anim: "grow", at: S.t("108") - 0.05 }) },
  { at: "How much do you end up with?", tag: "YOU END UP WITH...", tagColor: "olive",
    draw: (S) => S.put(snowball("$", { size: 110 }), 600, 640, 2.2, { anim: "grow", at: "366" }) + S.put(S.countText(0, 0, 108000, 366000, { at: "366", size: 160, color: C.olive, stroke: true }), 1300, 560, 1, { anim: "grow", at: S.t("366") - 0.05 }) },
  { at: "More than half of that money", tag: "THE SNOWBALL MADE IT", tagColor: "olive",
    draw: (S) => S.put(`<rect x="-150" y="-270" width="300" height="270" fill="${C.slate}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -135, "$108K", 56, C.ink, { font: "bold" }) + txt(0, 40, "YOU PUT IN", 34, C.ink, { font: "bold" }), 760, 880, 1, { anim: "rise" }) +
      S.put(`<rect x="-150" y="-630" width="300" height="630" fill="${C.gold}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -315, "$258K", 56, C.ink, { font: "bold" }) + txt(0, 40, "THE SNOWBALL", 34, C.ink, { font: "bold" }), 1160, 880, 1, { anim: "rise", at: "never" }) + S.put(snowball(""), 1160, 230, 0.4, { anim: "grow", at: "snowball" }) },
  { at: "But here's the part that should make you sit up", tag: "SIT UP FOR THIS", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, 960, 1.15, { anim: "drop" }) + S.put(txt(0, 0, "!", 200, C.red, { font: "bold" }), 1250, 440, 1, { anim: "grow", at: "sit" }) },
  { at: "Same $300 a month", tag: "SAME $300. SAME 7%.",
    draw: (S) => S.put(hourglass(), 760, 760, 1.6, { anim: "pop" }) + S.put(txt(0, 0, "same plan...", 60, C.ink), 1350, 560, 1, { anim: "fade", at: "same" }) },
  { at: "You invest for 20 years instead of 30",
    draw: (S) => S.put(timelineBar("30 YEARS", "25", "55", -400, 400, C.olive), 960, 460, 1, { anim: "wipe" }) + S.put(timelineBar("20 YEARS", "35", "55", -134, 400, C.terra), 960, 640, 1, { anim: "wipe", at: "20" }) },
  { at: "You end up with about $156", tag: "YOU END UP WITH...",
    draw: (S) => S.put(snowball("$"), 620, 640, 1.2, { anim: "grow" }) + S.put(S.countText(0, 0, 0, 156000, { at: "156", size: 160, color: C.terra, stroke: true }), 1300, 560, 1, { anim: "grow", at: S.t("156") - 0.05 }) },
  { at: "Waiting 10 years didn't cost you a third", tag: "IT COST MORE THAN HALF", tagColor: "red",
    draw: (S) => S.put(`<rect x="-120" y="-560" width="240" height="560" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "START AT 25", 32, C.ink, { font: "bold" }) + txt(0, -590, "$366K", 48, C.ink, { font: "bold" }), 760, 880, 1, { anim: "rise" }) +
      S.put(`<rect x="-120" y="-240" width="240" height="240" fill="${C.terra}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "START AT 35", 32, C.ink, { font: "bold" }) + txt(0, -270, "$156K", 48, C.ink, { font: "bold" }), 1160, 880, 1, { anim: "rise", at: 0.2 }) +
      S.put(`<rect x="-120" y="-560" width="240" height="320" fill="none" stroke="${C.red}" stroke-width="6" stroke-dasharray="16 12"/>` + txt(0, -400, "−57%", 72, C.red, { font: "bold" }), 1160, 880, 1, { anim: "fade", at: "half" }) },
  { at: "because the most powerful years", tag: "THE LAST YEARS DO THE MOST", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(`<path d="M 1000 720 C 1300 830 1600 900 1940 920" fill="none" stroke="${C.gold}" stroke-width="30" opacity="0.6"/>`, 0, 0, 1, { anim: "fade", at: "powerful" }) + roll(S, "$", 1000, 1700, 0.9, 1.7, S.t("last"), 1.2) },
  { at: "Here's an even stranger example", tag: "AN EVEN STRANGER EXAMPLE", tagColor: "mustard",
    draw: (S) => PC(S, { screen: "WAIT...", pose: "chin", mouth: "o" }, 960, 1.1) },
  { at: "Meet two friends, Ava and Leo", tag: "MEET AVA & LEO",
    draw: (S) => S.put(AVA({ pose: "wave" }), 700, G, 1.05, { anim: "pop", at: "Ava", idle: true }) + S.put(LEO({ pose: "wave" }), 1220, G, 1.05, { anim: "pop", at: "Leo", idle: true }) +
      S.put(priceTag("AVA", { size: 40, rot: -6 }), 560, 420, 1, { anim: "drop", at: "Ava" }) + S.put(priceTag("LEO", { size: 40, rot: 6 }), 1300, 420, 1, { anim: "drop", at: "Leo" }) },
  { at: "Ava starts investing $300 a month at 25", tag: "AVA: $300/MO FROM AGE 25", tagColor: "red",
    draw: (S) => S.put(AVA({ pose: "push", item: coin(26) }), 620, G, 1.05, { anim: "pop", idle: true }) + S.put(jar("AVA", 0.3, { fillId: S.id("f") }), 1050, G, 1.1, { anim: "pop" }) + S.put(big("25", C.red, 130), 1500, 520, 1, { anim: "grow", at: "25" }) },
  { at: "She keeps it up for just 10 years", tag: "10 YEARS... THEN SHE STOPS", tagColor: "red",
    draw: (S) => S.put(timelineBar("AVA INVESTS", "25", "35", -500, -100, C.red), 960, 420, 1, { anim: "wipe" }) + S.put(AVA({ pose: "push", face: "happy", item: coin(26) }), 760, G, 0.95, { anim: "pop", idle: true }) },
  { at: "Leo waits", tag: "LEO WAITS...", tagColor: "slate",
    draw: (S) => S.put(hammock(), 960, G, 1, { anim: "pop" }) + S.put(LEO({ pose: "shrug", face: "content", legs: false, noShadow: true }), 960, 840, 0.75, { anim: "drop" }) + S.put(clock(), 1500, 400, 0.8, { anim: "grow" }) },
  { at: "He starts at 35", tag: "LEO: $300/MO FROM 35 TO 65", tagColor: "slate", tagSize: 54,
    draw: (S) => S.put(timelineBar("AVA", "25", "35", -500, -250, C.red), 960, 360, 1, { anim: "none" }) + S.put(timelineBar("LEO INVESTS", "35", "65", -250, 500, C.slateDk), 960, 520, 1, { anim: "wipe", at: "starts" }) + S.put(LEO({ pose: "wave", face: "smile" }), 960, G, 0.9, { anim: "pop", at: "right", idle: true }) },
  { at: "Ava put in $36", tag: "AVA: $36K · LEO: $108K",
    draw: (S) => S.put(coinStack(4, { label: "$36K", size: 50 }), 700, G, 1.4, { anim: "rise", at: "36" }) + S.put(coinStack(12, { label: "$108K", size: 50 }), 1220, G, 1.4, { anim: "rise", at: "108" }) +
      S.put(AVA({ pose: "down", noShadow: true }), 460, G, 0.6, { anim: "pop" }) + S.put(LEO({ pose: "down", noShadow: true }), 1460, G, 0.6, { anim: "pop", at: "Leo" }) },
  { at: "So who has more at 65?", tag: "WHO HAS MORE AT 65?", tagColor: "mustard",
    draw: (S) => S.put(AVA({ pose: "shrug" }), 700, G, 1, { anim: "pop", idle: true }) + S.put(LEO({ pose: "shrug" }), 1220, G, 1, { anim: "pop", idle: true }) + S.put(big("?", C.mustard, 200), 960, 460, 1, { anim: "grow", at: "65" }) },
  { at: "Ava with about $420", tag: "AVA: $420,000", tagColor: "red",
    draw: (S) => S.put(snowball("$", { size: 100 }), 620, 600, 1.7, { anim: "grow" }) + S.put(S.countText(0, 0, 0, 420000, { at: "420", size: 90, color: C.red, stroke: true }), 620, 260, 1, { anim: "grow" }) +
      S.put(AVA({ pose: "cheer", face: "joy" }), 1300, G, 0.9, { anim: "pop", at: "420", idle: true }) },
  { at: "Leo ends up with around $366", tag: "LEO: $366,000", tagColor: "slate",
    draw: (S) => S.put(snowball("$", { size: 90 }), 620, 600, 1.35, { anim: "grow" }) + S.put(S.countText(0, 0, 0, 366000, { at: 0.2, size: 80, color: C.slateDk, stroke: true, chime: false }), 620, 330, 1, { anim: "grow" }) + S.put(LEO({ pose: "shrug", face: "neutral" }), 1250, G, 0.95, { anim: "pop", idle: true }) },
  { at: "Ava invested for 10 years", tag: "10 YEARS BEAT 30 YEARS",
    draw: (S) => S.put(AVA({ pose: "cheer", face: "joy" }), 700, G, 1, { anim: "pop", idle: true }) + S.put(big("10 YRS", C.red, 90), 700, 380, 1, { anim: "grow", at: "10" }) + S.put(LEO({ pose: "shrug", face: "sad" }), 1220, G, 1, { anim: "pop", at: "Leo", idle: true }) + S.put(big("30 YRS", C.slateDk, 90), 1220, 380, 1, { anim: "grow", at: "30" }) },
  { at: "and Ava still wins because her snowball", tag: "A 10-YEAR HEAD START", tagColor: "red",
    draw: (S) => hillScene(S) + roll(S, "A", 300, 1500, 0.5, 1.5, 0.2, Math.max(1.4, S.dur - 0.4), "a") + roll(S, "L", 120, 900, 0.35, 0.9, S.t("head"), Math.max(0.8, S.dur - S.t("head") - 0.3), "l") },
  { at: "That's ingredient number one, time", tag: "INGREDIENT #1: TIME", tagColor: "olive",
    draw: (S) => ingredient(S, "#1", "TIME", "TIME", C.olive, at(0, 0, 0.35, hourglass())) },
  { at: "and it's the only one you can never buy back", tag: "THE ONLY ONE YOU CAN'T BUY BACK", tagColor: "red", tagSize: 50,
    draw: (S) => S.put(hourglass(), 960, 820, 2, { anim: "pop" }) + S.put(priceTag("NOT FOR SALE", { size: 40, rot: 10, color: C.red, ink: C.white }), 1200, 520, 1, { anim: "drop", at: "buy" }) },

  /* ================= INGREDIENT 2: AUTOMATE ================= */
  { at: "So if time is the engine", tag: "SO WHY DOESN'T EVERYONE START?", tagSize: 50,
    draw: (S) => B(S, { pose: "shrug", face: "thinking" }, 960, 1.1) + S.put(big("?", C.mustard, 180), 1260, 460, 1, { anim: "grow", at: "start" }) },
  { at: "Because of our old friend, your brain", tag: "OUR OLD FRIEND...", tagColor: "red",
    draw: (S) => BR(S, { face: "grin", pose: "cheer" }, 960, 1.2, { anim: "drop" }) },
  { at: "Every month you get paid", tag: "PAYDAY!", tagColor: "olive",
    draw: (S) => B(S, { pose: "cheer", face: "joy", item: letter(["PAYCHECK", "-", "$$$"], { w: 200, h: 200, size: 30 }), itemScale: 0.8 }, 960, 1.1) + S.put(confetti(20, 1100, 500, 2), 960, 600, 1, { anim: "drop", at: "paid" }) },
  { at: "and every month your brain sees that money as available", tag: "\"AVAILABLE. SPENDABLE. YOURS.\"", tagColor: "red", tagSize: 52,
    draw: (S) => BR(S, { face: "love", pose: "reach" }, 560, 1.05) + S.put(moneyBag("$"), 1100, G, 1.1, { anim: "pop" }) +
      [["available", "AVAILABLE"], ["spendable", "SPENDABLE"], ["yours", "YOURS"]].map(([w, t], i) => S.put(priceTag(t, { size: 34, rot: -8 + i * 8 }), 1450, 330 + i * 160, 1, { anim: "drop", at: w })).join("") },
  { at: "So you tell yourself", tag: "\"I'LL INVEST WHAT'S LEFT\"",
    draw: (S) => B(S, { pose: "think", face: "smile" }, 620, 1.05) + S.put(cloudThought(txt(0, -10, "I'll invest", 50) + txt(0, 46, "what's left!", 50, C.oliveDk), 220), 1200, 480, 1, { anim: "grow", at: "invest" }) },
  { at: "and at the end of the month, there's nothing left", tag: "...THERE'S NOTHING LEFT", tagColor: "ink",
    draw: (S) => B(S, { pose: "hold", face: "sad", item: wallet({ open: true }), itemScale: 0.8 }, 760, 1.05) + S.put(`<path d="M 0 0 q -30 -30 -10 -50 q 20 10 10 50 M 0 0 q 30 -30 10 -50 q -20 10 -10 50" fill="${C.grey}" stroke="${C.ink}" stroke-width="3"/>`, 780, 600, 1.4, { anim: "rise", at: "nothing", d: 1 }) +
      S.put(calendar(31, 7, { title: "END OF MONTH", cw: 44, head: C.red }), 1400, 800, 1, { anim: "pop" }) },
  { at: "That's not a discipline problem", tag: "NOT DISCIPLINE. DESIGN.", tagColor: "slate",
    draw: (S) => S.put(`<rect x="-360" y="-240" width="720" height="480" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="6"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<path d="M ${-360 + i * 120} -240 L ${-360 + i * 120} 240 M -360 ${-240 + i * 80} L 360 ${-240 + i * 80}" stroke="#7E9AAE" stroke-width="2"/>`).join("") + txt(0, -150, "BLUEPRINT", 44, C.white, { font: "bold" }), 1150, 540, 1, { anim: "pop", at: "design" }) +
      S.put(cross(1.4), 560, 520, 1, { anim: "grow", at: "discipline" }) + S.put(txt(0, 0, "willpower", 50, C.ink), 560, 380, 1, { anim: "fade" }) },
  { at: "So here's ingredient number two", tag: "INGREDIENT #2: AUTOMATE IT", tagColor: "slate",
    draw: (S) => ingredient(S, "#2", "AUTOMATE IT", "AUTO", C.slateDk, `<circle r="26" fill="${C.grey}" stroke="${C.ink}" stroke-width="4"/>`) },
  { at: "Instead of investing what's left after spending", tag: "FLIP THE ORDER",
    draw: (S) => S.put(`<rect x="-180" y="-60" width="360" height="120" rx="14" fill="${C.terra}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, "1. SPEND", 50, C.white, { font: "bold" }), 760, 440, 1, { anim: "pop", id: "s1" }) +
      S.put(`<rect x="-180" y="-60" width="360" height="120" rx="14" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, "2. INVEST", 50, C.ink, { font: "bold" }), 760, 660, 1, { anim: "pop", id: "s2" }) +
      S.js(`tl.to("#${S.id("s1")}-i", { y: 220, duration: 0.5, ease: "power2.inOut" }, ${S.t("spend")}); tl.to("#${S.id("s2")}-i", { y: -220, duration: 0.5, ease: "power2.inOut" }, ${S.t("spend")});`) + S.put(check(1.4), 1150, 540, 1, { anim: "grow", at: S.t("investing", 0.2) }) },
  { at: "Money moves to your investments on payday", tag: "ON PAYDAY. AUTOMATICALLY.", tagColor: "olive",
    draw: (S) => S.put(letter(["PAYDAY", "-", "$$$"], { w: 240, h: 240, size: 40 }), 480, 880, 1, { anim: "pop" }) + S.put(arrow(400, C.olive, 60), 680, 760, 1, { anim: "wipe", at: "moves" }) +
      S.put(jar("INVEST", 0.6), 1350, G, 1.2, { anim: "pop", at: "investments" }) + [0, 1, 2].map((i) => S.put(coin(24), 760 + i * 100, 640, 1, { anim: "slideL", at: S.t("automatically") + i * 0.15 })).join("") },
  { at: "Personal finance people call this paying yourself first", tag: "PAY YOURSELF FIRST", tagColor: "olive",
    draw: (S) => B(S, { pose: "push", face: "smile", item: coin(26) }, 620, 1.05) + S.put(piggy({ label: "FUTURE ME" }), 1250, G, 1.3, { anim: "pop", at: "yourself" }) },
  { at: "and it works because it takes your brain out", tag: "BRAIN: OUT OF THE DECISION", tagColor: "red", tagSize: 52,
    draw: (S) => S.put(brain({ face: "foiled", pose: "down" }), 960, G, 1.05, { anim: "pop", id: "br" }) + S.js(`tl.to("#${S.id("br")}-i", { x: 900, rotation: 20, duration: 0.6, ease: "power2.in" }, ${S.t("out")});`) + S.sfx("whoosh", S.t("out"), 0.25, 0.6) + S.put(txt(0, 0, "EXIT →", 60, C.red, { font: "bold" }), 1600, 400, 1, { anim: "fade", at: "brain" }) },
  { at: "and this isn't just a nice idea", tag: "RESEARCHERS MEASURED IT", tagColor: "slate",
    draw: (S) => PC(S, { screen: "DATA", pose: "point", mouth: "smile" }, 640, 1.05) + S.put(clipboard([["THE POWER OF", ""], ["SUGGESTION", ""]]), 1300, 940, 1, { anim: "rise", at: "measured" }) },
  { at: "In a famous study published in 2001", tag: "MADRIAN & SHEA, 2001", tagColor: "slate",
    draw: (S) => S.put(clipboard([["MADRIAN & SHEA", ""], ["2001", ""], ["401(K) STUDY", ""]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "2001", pose: "pointL" }, 1400, 0.95, { at: "economists" }) },
  { at: "looked at a company that changed one small thing", tag: "ONE SMALL CHANGE",
    draw: (S) => S.put(building({ label: "A COMPANY" }), 700, G, 1, { anim: "pop" }) + S.put(toggle(false, ""), 1300, 560, 1.4, { anim: "grow", at: "small", id: "tg" }) },
  { at: "Instead of asking new employees", tag: "SIGNED UP AUTOMATICALLY", tagColor: "olive",
    draw: (S) => S.put(letter(["RETIREMENT", "PLAN", "-", "☐ SIGN ME UP"], { w: 320, h: 300, size: 32 }), 700, 880, 1.1, { anim: "pop" }) +
      S.put(letter(["RETIREMENT", "PLAN", "-", "☑ ENROLLED"], { w: 320, h: 300, size: 32 }), 1250, 880, 1.1, { anim: "slideR", at: "automatically" }) + S.put(arrow(140, C.olive, 40), 900, 740, 1, { anim: "wipe", at: "automatically" }) },
  { at: "They could still opt out at any time", tag: "OPTING OUT: STILL ALLOWED",
    draw: (S) => S.put(`<rect x="-150" y="-380" width="300" height="380" fill="${C.wood}" stroke="${C.ink}" stroke-width="6"/><rect x="-130" y="-360" width="260" height="360" fill="#4A4542"/>` + txt(0, -420, "OPT OUT", 50, C.ink, { font: "bold" }), 1250, G, 1, { anim: "pop" }) + B(S, { pose: "pointL", face: "smile", look: 10 }, 700, 1) },
  { at: "Before the change, only about a third", tag: "BEFORE: ABOUT 1 IN 3",
    draw: (S) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => S.put(personIcon(i < 3 ? C.olive : C.grey), 560 + (i % 9) * 100, 640, 1.2, { anim: "pop", at: 0.1 + i * 0.05 })).join("") + S.put(txt(0, 0, "JOINED THE PLAN", 44, C.oliveDk, { font: "bold" }), 760, 760, 1, { anim: "fade", at: "third" }) },
  { at: "After the change, more than eight out of 10", tag: "AFTER: 8+ IN 10", tagColor: "olive",
    draw: (S) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => S.put(personIcon(C.grey), 510 + i * 100, 640, 1.2, { anim: "none", id: `p${i}` })).join("") +
      S.js(`tl.to(Array.from(document.querySelectorAll("[id^='${S.id("p")}'] circle, [id^='${S.id("p")}'] path")).slice(0, 16), { attr: { fill: "${C.olive}" }, duration: 0.08, stagger: 0.05 }, ${S.t("eight")});`) + S.sfx("chime", S.t("10"), 0.25) },
  { at: "Same people, same paychecks", tag: "ONLY THE DEFAULT CHANGED", tagColor: "slate",
    draw: (S) => [["people", personIcon(C.olive)], ["paychecks", letter(["PAY"], { w: 120, h: 120, size: 30 })], ["choices", toggle(true)]].map(([w, svg], i) => S.put(svg, 520 + i * 440, 600, 1.2, { anim: "pop", at: w }) + S.put(txt(0, 0, "SAME", 44, C.ink, { font: "bold" }), 520 + i * 440, 760, 1, { anim: "fade", at: w })).join("") },
  { at: "That's how powerful the default is", tag: "MAKE INVESTING YOUR DEFAULT", tagColor: "olive",
    draw: (S) => S.put(toggle(false), 960, 560, 2.2, { anim: "pop", id: "off" }) + S.put(toggle(true, ""), 960, 560, 2.2, { anim: "none", id: "on" }) + S.put(txt(0, 0, "DEFAULT: INVEST", 56, C.oliveDk, { font: "bold" }), 960, 800, 1, { anim: "fade", at: "make" }) +
      S.js(`tl.fromTo("#${S.id("on")}", { opacity: 0 }, { opacity: 1, duration: 0.15 }, ${S.t("make")}); tl.to("#${S.id("off")}", { opacity: 0, duration: 0.15 }, ${S.t("make")});`) + S.sfx("click", S.t("make"), 0.4, 0.4) },
  { at: "and don't wait until you can invest a lot", tag: "DON'T WAIT FOR \"A LOT\"",
    draw: (S) => B(S, { pose: "down", face: "neutral", old: true }, 760, 1.05) + S.put(clock(), 1300, 520, 1, { anim: "grow" }) + S.put(txt(0, 0, "still waiting...", 48, C.ink), 1300, 700, 1, { anim: "fade", at: "lot" }) },
  { at: "If $300 a month sounds impossible", tag: "START WITH $50. OR $25.", tagColor: "olive",
    draw: (S) => S.put(priceTag("$300", { size: 54, rot: -6 }), 560, 520, 1.2, { anim: "drop" }) + S.put(cross(1.3), 680, 520, 1, { anim: "grow", at: "impossible" }) +
      S.put(priceTag("$50", { size: 54, rot: 4, color: C.olive }), 1050, 520, 1.2, { anim: "drop", at: "50" }) + S.put(priceTag("$25", { size: 54, rot: -4, color: C.olive }), 1450, 520, 1.2, { anim: "drop", at: "25" }) },
  { at: "The amount matters less than the habit", tag: "THE HABIT > THE AMOUNT", tagColor: "olive",
    draw: (S) => S.put(calendar(28, 7, { title: "HABIT", cw: 56, head: C.olive, mark: () => check(0.8) }), 960, 860, 1.1, { anim: "pop" }) },
  { at: "A small snowball that's rolling", tag: "SMALL & ROLLING > BIG & STUCK",
    draw: (S) => hillScene(S) + roll(S, "$", 500, 1500, 0.4, 0.9, 0.2, Math.max(1.4, S.dur - 0.4)) + S.put(snowball("$"), 250, hillY(250) - 100, 1.0, { anim: "pop", at: "big" }) + S.put(txt(0, 0, "stuck", 44, C.ink), 250, 220, 1, { anim: "fade", at: "sitting" }) },
  { at: "Set up an automatic transfer for payday", tag: "AUTOMATIC TRANSFER: ON", tagColor: "olive",
    draw: (S) => S.put(phone(["", "AUTO-INVEST", "", "EVERY PAYDAY"], { size: 30, head: C.oliveDk, w: 300, h: 560 }), 960, 920, 1.1, { anim: "rise" }) + S.put(toggle(true), 960, 760, 1, { anim: "grow", at: "transfer" }) + S.sfx("click", S.t("transfer") + 0.1, 0.4, 0.4) },
  { at: "Use your employer's retirement plan", tag: "GET THE FULL MATCH", tagColor: "olive",
    draw: (S) => S.put(building({ label: "YOUR JOB" }), 620, G, 1, { anim: "pop" }) + S.put(gift("MATCH", C.terra), 1150, G, 1.1, { anim: "drop", at: "match" }) + S.put(coffee(), 1550, G, 0.6, { anim: "pop", at: "coffee" }) + S.put(txt(0, 0, "see EP1", 36, C.ink), 1550, 700, 1, { anim: "fade", at: "coffee" }) },
  { at: "and every time you get a raise", tag: "RAISE? BUMP IT UP.", tagColor: "mustard",
    draw: (S) => S.put(letter(["RAISE!", "+$"], { w: 200, h: 200, size: 36 }), 600, 860, 1.1, { anim: "pop" }) + S.put(`<rect x="-30" y="-300" width="60" height="300" rx="30" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><rect id="${S.id("sl")}" x="-22" y="-292" width="44" height="284" rx="22" fill="${C.olive}"/>`, 1200, 880, 1, { anim: "pop" }) +
      S.js(`tl.fromTo("#${S.id("sl")}", { scaleY: 0.3, transformOrigin: "50% 100%" }, { scaleY: 0.6, duration: 0.6, ease: "back.out(2)" }, ${S.t("bump")});`) + BR(S, { face: "meh", pose: "down" }, 1550, 0.7, { at: "notices" }) },
  { at: "Even 1% more each year", tag: "+1% A YEAR. BARELY FELT.",
    draw: (S) => [1, 2, 3, 4, 5, 6].map((n, i) => S.put(`<rect x="-50" y="${-60 - i * 50}" width="100" height="${60 + i * 50}" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 30, `${5 + i}%`, 30, C.ink, { font: "bold" }), 560 + i * 160, 860, 1, { anim: "rise", at: 0.1 + i * 0.12 })).join("") },
  { at: "Then comes the hard part, forget about it", tag: "THEN... FORGET ABOUT IT", tagColor: "slate",
    draw: (S) => B(S, { pose: "down", face: "content", look: -10 }, 760, 1.05, { anim: "slideL" }) + S.put(txt(0, 0, "♪", 90, C.ink), 640, 420, 1, { anim: "fade", at: "forget" }) + S.put(phone(["AUTO ✓"], { w: 160, h: 280, size: 30 }), 1400, 820, 1, { anim: "pop" }) },
  { at: "which brings us to the question", tag: "OKAY... BUT INVEST IN WHAT?", tagColor: "mustard",
    draw: (S) => B(S, { pose: "shrug", face: "thinking" }, 760, 1.05) + S.put(big("?", C.mustard, 220), 1250, 520, 1, { anim: "grow", at: "question" }) },

  /* ================= INGREDIENT 3: THE HAYSTACK ================= */
  { at: "Your brain has an answer ready", tag: "IMPULSE HAS AN ANSWER", tagColor: "red",
    draw: (S) => BR(S, { face: "happy", pose: "cheer" }, 960, 1.2, { anim: "drop" }) + S.put(bulb(), 1250, 380, 0.8, { anim: "grow", at: "answer" }) },
  { at: "Find the next big thing", tag: "\"FIND THE NEXT BIG THING!\"", tagColor: "red",
    draw: (S) => BR(S, { face: "love", pose: "point" }, 520, 1) + S.put(rocket("10×"), 1050, G, 1.3, { anim: "rise", at: "winner" }) },
  { at: "It feels smart", tag: "FEELS SMART. FEELS EXCITING.", tagColor: "mustard",
    draw: (S) => BR(S, { face: "happy", pose: "cheer", hat: `<g transform="translate(0 -300)"><rect x="-80" y="-12" width="160" height="24" fill="${C.ink}"/><path d="M -110 -24 L 0 -64 L 110 -24 L 0 16 Z" fill="${C.ink}"/></g>` }, 960, 1.15) + S.put(sparkles(7, 320), 960, 560, 1, { anim: "grow", at: "exciting" }) },
  { at: "and for most people, it's a losing game", tag: "MOSTLY... A LOSING GAME", tagColor: "red",
    draw: (S) => S.put(slotMachine(["7", "7", "✗"]), 960, G, 1.2, { anim: "pop" }) + S.put(stampSvg("YOU LOSE", C.red, 60, -10), 960, 400, 1, { anim: "slam", at: "losing" }) + S.sfx("impact-bass-1", S.t("losing") + 0.2, 0.3) },
  { at: "Here's why. Every year", tag: "THE YEARLY SCORECARD", tagColor: "slate",
    draw: (S) => S.put(clipboard([["S&P DOW JONES", ""], ["SPIVA SCORECARD", ""], ["PROS vs. MARKET", ""]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "SPIVA", pose: "pointL" }, 1400, 0.95, { at: "compares" }) },
  { at: "These are people with degrees", tag: "THE PROS",
    draw: (S) => [0, 1, 2].map((i) => S.put(bean({ color: [C.slate, C.olive, C.terra][i], pose: "hold", face: "smug", tie: true, item: laptop([], {}), itemScale: 0.3 }), 560 + i * 400, G, 0.85, { anim: "pop", at: ["degrees", "research", "data"][i], idle: true })).join("") },
  { at: "Over 15 years, roughly nine out of 10", tag: "15 YEARS: 9 IN 10 LOST TO THE INDEX", tagColor: "red", tagSize: 48,
    draw: (S) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => S.put(personIcon(C.slateDk), 510 + i * 100, 640, 1.2, { anim: "pop", at: 0.05 + i * 0.04 }) + (i < 9 ? S.put(cross(0.5), 510 + i * 100, 590, 1, { anim: "grow", at: S.t("failed") + i * 0.07 }) : S.put(check(0.5), 510 + i * 100, 560, 1, { anim: "grow", at: "beat" }))).join("") },
  { at: "Nine out of 10 professionals", tag: "SO... ON YOUR LUNCH BREAK?", tagColor: "mustard",
    draw: (S) => B(S, { pose: "phone", face: "thinking", item: phone([], { w: 70, h: 120 }), itemScale: 0.9 }, 760, 1.05) + S.put(sandwich(), 1250, 760, 1.6, { anim: "pop", at: "lunch" }) + S.put(txt(0, 0, "the odds?", 60, C.red, { font: "bold" }), 1250, 480, 1, { anim: "fade", at: "odds" }) },
  { at: "So here's ingredient number three", tag: "INGREDIENT #3: BUY THE HAYSTACK", tagColor: "mustard", tagSize: 52,
    draw: (S) => ingredient(S, "#3", "THE WHOLE MARKET", "INDEX", C.mustard, at(0, 10, 0.25, haystack())) },
  { at: "Don't try to find the needle", tag: "DON'T HUNT THE NEEDLE...",
    draw: (S) => S.put(haystack(), 1150, G, 1.6, { anim: "pop" }) + B(S, { pose: "carry", face: "worried", item: magnifier(), itemScale: 0.7 }, 560, 1) + S.put(bean({ pose: "cheer", face: "joy", noShadow: true }), 1150, 640, 0.6, { anim: "drop", at: "buy" }) + S.put(txt(0, 0, "...BUY THE HAYSTACK", 54, C.oliveDk, { font: "bold" }), 1150, 270, 1, { anim: "fade", at: "haystack" }) },
  { at: "That's what an index fund does", tag: "AN INDEX FUND", tagColor: "olive",
    draw: (S) => S.put(`<path d="M -320 -260 L 320 -260 L 280 0 L -280 0 Z" fill="${C.wood}" stroke="${C.ink}" stroke-width="6"/>`, 960, G, 1, { anim: "pop" }) +
      Array.from({ length: 18 }, (_, i) => S.put(companyBlock([C.olive, C.slate, C.terra, C.mustard, C.slateDk, C.oliveDk][i % 6]), 700 + (i % 6) * 104, G - 60 - Math.floor(i / 6) * 90, 1, { anim: "drop", at: S.t("hundreds") - 0.4 + i * 0.04, d: 0.4 })).join("") + S.put(txt(0, 0, "HUNDREDS OF COMPANIES", 48, C.ink, { font: "bold" }), 960, 420, 1, { anim: "fade", at: "hundreds" }) },
  { at: "When a few do badly", tag: "SOME DROP, OTHERS RISE",
    draw: (S) => Array.from({ length: 12 }, (_, i) => S.put(companyBlock([C.olive, C.slate, C.terra, C.mustard][i % 4]) + (i % 4 === 2 ? `<path d="M 0 -50 L 0 -90 M -14 -64 L 0 -50 L 14 -64" stroke="${C.red}" stroke-width="6" fill="none"/>` : `<path d="M 0 -90 L 0 -50 M -14 -76 L 0 -90 L 14 -76" stroke="${C.oliveDk}" stroke-width="6" fill="none"/>`), 560 + (i % 6) * 160, 520 + Math.floor(i / 6) * 220, 1.1, { anim: "pop", at: i % 4 === 2 ? "badly" : "slack" })).join("") },
  { at: "You don't need to know which company will win", tag: "JUST OWN THEM ALL", tagColor: "olive",
    draw: (S) => B(S, { pose: "cheer", face: "content" }, 960, 1.05) + Array.from({ length: 8 }, (_, i) => S.put(companyBlock([C.olive, C.slate, C.terra, C.mustard][i % 4]), 960 + Math.cos(i / 8 * Math.PI * 2) * 360, 560 + Math.sin(i / 8 * Math.PI * 2) * 200, 1, { anim: "grow", at: S.t("own") + i * 0.05 })).join("") },
  { at: "An index is just a list", tag: "AN INDEX = A LIST", tagColor: "slate",
    draw: (S) => S.put(letter(["S&P 500", "-", "1. COMPANY A", "2. COMPANY B", "3. COMPANY C", "...", "500. COMPANY Z"], { w: 460, h: 440, size: 34 }), 760, 960, 1.1, { anim: "rise" }) },
  { at: "An index fund simply buys everything on the list", tag: "BUY EVERYTHING ON THE LIST", tagColor: "olive",
    draw: (S) => S.put(letter(["S&P 500", "-", "✓ ✓ ✓ ✓", "✓ ✓ ✓ ✓", "✓ ✓ ✓ ✓"], { w: 420, h: 380, size: 40 }), 760, 920, 1.1, { anim: "pop" }) + S.put(cart_({}), 1400, G, 1.1, { anim: "slideR", at: "buys" }) },
  { at: "No genius manager, no guessing", tag: "THAT'S WHY IT'S CHEAP", tagColor: "olive",
    draw: (S) => S.put(bean({ color: C.slate, tie: true, pose: "point", face: "smug" }), 640, G, 0.9, { anim: "pop" }) + S.put(cross(2), 640, 640, 1, { anim: "grow", at: "manager" }) + S.put(priceTag("CHEAP ✓", { size: 50, rot: -6, color: C.olive }), 1250, 520, 1.1, { anim: "drop", at: "cheap" }) },
  { at: "And if even choosing a fund feels like too much", tag: "TOO MANY CHOICES?",
    draw: (S) => B(S, { pose: "cheeks", face: "worried" }, 960, 1.05) + Array.from({ length: 10 }, (_, i) => S.put(`<rect x="-70" y="-50" width="140" height="100" rx="8" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>` + txt(0, 4, `FUND ${String.fromCharCode(65 + i)}`, 26, C.ink, { font: "bold" }), 960 + Math.cos(i / 10 * Math.PI * 2) * 520, 520 + Math.sin(i / 10 * Math.PI * 2) * 260, 1, { anim: "grow", at: 0.1 + i * 0.06 })).join("") },
  { at: "many retirement plans offer something called a target date fund", tag: "THE TARGET-DATE FUND", tagColor: "olive",
    draw: (S) => S.put(`<circle r="170" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/><circle r="120" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/><circle r="70" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><circle r="26" fill="${C.red}"/>`, 960, 560, 1.2, { anim: "grow", at: "target" }) + S.put(txt(0, 0, "2060", 60, C.ink, { font: "bold" }), 960, 820, 1, { anim: "fade", at: "date" }) },
  { at: "You pick the year you expect to retire", tag: "PICK YOUR YEAR. IT DOES THE REST.", tagSize: 50,
    draw: (S) => S.put(pie([0.9, 0.1], [C.olive, C.slate]), 560, 560, 1, { anim: "grow" }) + S.put(txt(0, 0, "NOW", 44, C.ink, { font: "bold" }), 560, 780, 1, { anim: "fade" }) +
      S.put(arrow(220, C.ink, 50), 790, 560, 1, { anim: "wipe", at: "stocks" }) + S.put(pie([0.5, 0.5], [C.olive, C.slate]), 1360, 560, 1, { anim: "grow", at: "bonds" }) + S.put(txt(0, 0, "LATER", 40, C.ink, { font: "bold" }), 1360, 780, 1, { anim: "fade", at: "bonds" }) +
      S.put(txt(0, 0, "STOCKS", 30, C.olive, { font: "bold" }) + txt(0, 40, "BONDS", 30, C.slateDk, { font: "bold" }), 960, 860, 1, { anim: "fade", at: "stocks" }) },
  { at: "One decision, then you're done", tag: "ONE DECISION. DONE.", tagColor: "olive",
    draw: (S) => B(S, { pose: "cheer", face: "joy" }, 960, 1.1) + S.put(check(2), 1300, 460, 1, { anim: "grow", at: "done" }) },
  { at: "And this isn't some fringe idea", tag: "NOT A FRINGE IDEA",
    draw: (S) => PC(S, { screen: "LEGIT", pose: "up", mouth: "smile" }, 960, 1.1) },
  { at: "In his 2013 letter to shareholders", tag: "WARREN BUFFETT, 2013", tagColor: "slate",
    draw: (S) => S.put(letter(["BERKSHIRE", "HATHAWAY", "-", "2013 LETTER TO", "SHAREHOLDERS"], { w: 480, h: 420, size: 38 }), 760, 960, 1.1, { anim: "rise" }) + PC(S, { screen: "BUFFETT", pose: "pointL" }, 1400, 0.95, { at: "Buffett" }) },
  { at: "Put 90 % of it", tag: "90% → A LOW-COST S&P 500 INDEX FUND", tagColor: "olive", tagSize: 46,
    draw: (S) => S.put(pie([0.9, 0.1], [C.olive, C.slate], 220), 760, 580, 1, { anim: "grow" }) + S.put(txt(0, 0, "90%", 90, C.white, { font: "bold" }), 700, 620, 1, { anim: "fade", at: "90" }) +
      S.put(txt(0, 0, "S&P 500 INDEX FUND", 46, C.oliveDk, { font: "bold" }) + txt(0, 70, "(very low-cost)", 44, C.ink), 1400, 520, 1, { anim: "fade", at: "index" }) + S.put(txt(0, 0, "10% BONDS", 40, C.slateDk, { font: "bold" }), 1400, 720, 1, { anim: "fade", at: "tracks" }) },
  { at: "Notice those words, very low cost", tag: "\"VERY LOW-COST\"", tagColor: "mustard",
    draw: (S) => S.put(txt(0, 0, "very low-cost", 130, C.ink), 960, 560, 1, { anim: "fade" }) + S.put(magnifier(), 1300, 520, 1.4, { anim: "pop", at: "low" }) },
  { at: "because fees are the silent leak", tag: "FEES: THE SILENT LEAK", tagColor: "red",
    draw: (S) => S.put(bucket("PLAN", { leak: true, fill: true, color: C.slateDk }), 960, 820, 1.5, { anim: "pop" }) + S.put(priceTag("FEES", { size: 40, color: C.red, ink: C.white, rot: 20 }), 1250, 880, 1, { anim: "drop", at: "leak" }) },
  { at: "A 1% fee sounds tiny", tag: "\"IT'S JUST 1%\"",
    draw: (S) => S.put(priceTag("1%", { size: 30, rot: -10, w: 110 }), 960, 560, 1, { anim: "pop" }) + BR(S, { face: "sly", pose: "shrug" }, 1400, 0.9) + S.put(txt(0, 0, "tiny!", 50, C.ink), 1400, 450, 1, { anim: "fade", at: "tiny" }) },
  { at: "But remember our $300 a month for 30 years", tag: "THAT 1% OVER 30 YEARS...",
    draw: (S) => S.put(snowball("$"), 760, 600, 1.6, { anim: "pop" }) + S.put(`<path d="M 80 120 Q 120 200 100 300" fill="none" stroke="${C.gold}" stroke-width="16" stroke-linecap="round"/>`, 760, 600, 1, { anim: "fade", at: "30" }) },
  { at: "that one little percent can cost you around $65",
    draw: (S) => S.receipt({ x: 660, y: 200, w: 620, title: "THE 1% FEE", lines: [["$300/MO x 30 YRS", ""], ["7% vs 6%", ""]], total: ["COST", "$65,000"], count: [0, 65000], at: "cost", printDur: 0.7 }) },
  { at: "For the privilege of probably doing worse", tag: "...TO PROBABLY DO WORSE", tagColor: "red",
    draw: (S) => S.put(trophy("WORSE", { size: 30 }), 860, G, 1.4, { anim: "drop" }) + S.put(cross(1.5), 860, 640, 1, { anim: "grow", at: "worse" }) + B(S, { pose: "shrug", face: "sad" }, 1450, 0.9) },
  { at: "So before you buy anything, look at the expense ratio", tag: "CHECK THE EXPENSE RATIO", tagColor: "olive",
    draw: (S) => S.put(letter(["INDEX FUND", "-", "EXPENSE RATIO", "0.03%"], { w: 380, h: 340, size: 38 }), 760, 900, 1.1, { anim: "pop" }) + S.put(magnifier(), 860, 700, 1.1, { anim: "pop", at: "expense" }) },
  { at: "Boring, cheap, everything", tag: "",
    draw: (S) => [["Boring", "BORING.", C.slateDk], ["cheap", "CHEAP.", C.olive], ["everything", "EVERYTHING.", C.red]].map(([w, t, col], i) => S.put(stampSvg(t, col, 70, -6 + i * 5), 960, 330 + i * 220, 1, { anim: "slam", at: w }) + S.sfx("impact-bass-1", S.t(w) + 0.2, 0.22)).join("") },
  { at: "And now, the last ingredient", tag: "THE LAST INGREDIENT...", tagColor: "red",
    draw: (S) => S.put(kitchen(), 0, 0, 1, { anim: "none" }) + S.put(`<circle r="200" fill="${C.gold}" opacity="0.35"/>` + ingredientJar("#4", txt(0, 0, "?", 70, C.red, { font: "bold" }), C.terra), 960, 770, 1.15, { anim: "grow" }) + S.sfx("riser", 0, 0.2, 2) },

  /* ================= INGREDIENT 4: LEAVE IT ALONE ================= */
  { at: "Ingredient number four, leave it alone", tag: "INGREDIENT #4: LEAVE IT ALONE", tagColor: "terra", tagSize: 52,
    draw: (S) => ingredient(S, "#4", "LEAVE IT ALONE", "PATIENCE", C.terra, `<rect x="-60" y="-14" width="120" height="28" fill="${C.gold}" stroke="${C.ink}" stroke-width="3" transform="rotate(-12)"/>`) },
  { at: "It sounds easy", tag: "SOUNDS EASY. IT'S THE HARDEST PART.", tagSize: 48,
    draw: (S) => B(S, { pose: "shrug", face: "smile" }, 700, 1.05) + S.put(stampSvg("HARDEST", C.red, 70, -8), 1300, 520, 1, { anim: "slam", at: "hardest" }) },
  { at: "because the market doesn't go up in a straight line", tag: "NOT A STRAIGHT LINE",
    draw: (S) => S.put(axes(1000, 520), 460, 900, 1, { anim: "fade" }) + S.put(chartLine([[0, -60], [80, -120], [140, -80], [220, -170], [280, -110], [360, -230], [420, -160], [500, -280], [560, -200], [640, -330], [720, -260], [800, -400], [880, -350], [960, -470]], C.olive, 10, S.id("c")), 460, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("c")}", { attr: { "stroke-dasharray": "0 4000" } }, { attr: { "stroke-dasharray": "2000 4000" }, duration: 1.8, ease: "none" }, 0.2);`) },
  { at: "Some years, it drops", tag: "SOME YEARS IT DROPS. A LOT.", tagColor: "red",
    draw: (S) => S.put(axes(1000, 520), 460, 900, 1, { anim: "none" }) + S.put(chartLine([[0, -260], [200, -320], [400, -380], [460, -300], [520, -140], [600, -100]], C.red, 12, S.id("c")), 460, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("c")}", { attr: { "stroke-dasharray": "0 3000" } }, { attr: { "stroke-dasharray": "900 3000" }, duration: 1.0, ease: "power2.in" }, ${S.t("drops")});`) + S.shake(S.t("lot"), 12) + S.sfx("impact-bass-1", S.t("lot"), 0.3) },
  { at: "Your account shows a big red number", tag: "A BIG RED NUMBER", tagColor: "red",
    draw: (S) => S.put(phone(["MY ACCOUNT", "", "-$12,400", "▼ 18%"], { size: 40, head: C.red, w: 340, h: 560 }), 1250, 920, 1.05, { anim: "rise" }) + B(S, { pose: "cheeks", face: "shocked" }, 600, 1) },
  { at: "and your brain starts screaming", tag: "...AND YOUR BRAIN SCREAMS", tagColor: "red",
    draw: (S) => BR(S, { face: "shout", pose: "mega", item: `<path d="M 0 -20 L 120 -70 L 120 70 L 0 20 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>` }, 560, 1.05, { id: "scr" }) +
      [["sell", "SELL!"], ["get", "GET OUT!"], ["wait", "WAIT TILL IT'S CALM!"]].map(([w, t], i) => S.put(bubble(t, { size: 46, w: t.length * 30 + 80, h: 100, dx: 0, dy: -60 }), 1250 + (i % 2) * 160, 330 + i * 200, 1, { anim: "grow", at: w })).join("") + S.js(`tl.to("#${S.id("scr")}", { x: 10, duration: 0.05, yoyo: true, repeat: 9, ease: "none" }, ${S.t("screaming")});`) },
  { at: "And this is where real wealth quietly leaks away", tag: "WHERE WEALTH LEAKS AWAY",
    draw: (S) => S.put(bucket("WEALTH", { leak: true, fill: true }), 960, 820, 1.5, { anim: "pop" }) },
  { at: "Every year, the research firm Morningstar", tag: "MORNINGSTAR: \"MIND THE GAP\"", tagColor: "slate",
    draw: (S) => S.put(clipboard([["MORNINGSTAR", ""], ["MIND THE GAP", ""], ["FUND vs. INVESTOR", ""]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "STUDY", pose: "pointL" }, 1400, 0.95, { at: "compares" }) },
  { at: "And investors keep earning less", tag: "INVESTORS EARN LESS THAN THEIR FUNDS", tagColor: "red", tagSize: 48,
    draw: (S) => S.put(`<rect x="-140" y="-500" width="280" height="500" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "THE FUND", 36, C.ink, { font: "bold" }), 760, 900, 1, { anim: "rise" }) +
      S.put(`<rect x="-140" y="-400" width="280" height="400" fill="${C.terra}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "ITS INVESTORS", 36, C.ink, { font: "bold" }), 1160, 900, 1, { anim: "rise", at: "less" }) },
  { at: "Same funds, worse results", tag: "SAME FUNDS. WORSE RESULTS.",
    draw: (S) => [0, 1].map((i) => S.put(letter(["SAME", "FUND"], { w: 220, h: 200, size: 40 }), 720 + i * 480, 760, 1, { anim: "pop", at: 0.1 + i * 0.2 })).join("") + S.put(check(1.2), 720, 480, 1, { anim: "grow", at: "worse" }) + S.put(cross(1.2), 1200, 480, 1, { anim: "grow", at: "results" }) },
  { at: "Because people buy after prices go up", tag: "BUY HIGH. SELL LOW.", tagColor: "red",
    draw: (S) => S.put(axes(1000, 520), 460, 900, 1, { anim: "fade" }) + S.put(chartLine([[0, -150], [250, -420], [500, -100], [750, -260], [1000, -380]], C.slateDk, 12), 460, 900, 1, { anim: "fade" }) +
      S.put(`<circle r="30" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -70, "BUY", 50, C.oliveDk, { font: "bold" }), 710, 480, 1, { anim: "grow", at: "buy" }) + S.put(`<circle r="30" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 80, "SELL", 50, C.red, { font: "bold" }), 960, 800, 1, { anim: "grow", at: "sell" }) },
  { at: "Excitement in, panic out", tag: "EXCITEMENT IN. PANIC OUT.",
    draw: (S) => S.put(brain({ face: "love", pose: "cheer" }), 700, G, 1, { anim: "pop", at: "Excitement" }) + S.put(brain({ face: "shout", pose: "shrug" }), 1250, G, 1, { anim: "pop", at: "panic" }) },
  { at: "And getting out at the wrong time is expensive", tag: "BAD TIMING IS EXPENSIVE",
    draw: (S) => S.put(clock(), 760, 560, 1.4, { anim: "grow" }) + S.put(priceTag("$$$$", { size: 50, rot: 10, color: C.red, ink: C.white }), 1250, 520, 1.1, { anim: "drop", at: "expensive" }) },
  { at: "Research from JP Morgan", tag: "J.P. MORGAN: 20 YEARS OF MARKET DAYS", tagColor: "slate", tagSize: 46,
    draw: (S) => { let d = ""; for (let i = 0; i < 260; i++) d += `<rect x="${(i % 26) * 44}" y="${Math.floor(i / 26) * 44}" width="34" height="34" rx="4" fill="${[7, 33, 58, 91, 120, 147, 166, 190, 215, 248].includes(i) ? C.gold : C.paper2}" stroke="${C.ink}" stroke-width="2"/>`;
      return S.put(d, 390, 300, 1, { anim: "fade" }) + S.put(txt(0, 0, "20 YEARS OF MARKET DAYS", 40, C.ink, { font: "bold" }), 960, 800, 1, { anim: "fade", at: "20" }); } },
  { at: "cut an investor's returns roughly in half", tag: "...RETURNS CUT IN HALF", tagColor: "red",
    draw: (S) => S.put(snowball("$"), 860, 580, 2, { anim: "none", id: "h1" }) + S.put(`<rect x="0" y="-220" width="240" height="440" fill="${C.paper}"/>`, 860, 580, 1, { anim: "none" }) + S.put(snowball("$"), 1060, 580, 2, { anim: "none", id: "h2" }) +
      S.put(`<path d="M 0 -260 L 0 260" stroke="${C.red}" stroke-width="10" stroke-dasharray="20 14"/>`, 960, 580, 1, { anim: "wipe", at: "half" }) + S.js(`tl.to("#${S.id("h2")}-i", { x: 120, rotation: 25, opacity: 0.25, duration: 0.6, ease: "power2.out" }, ${S.t("half")});`) },
  { at: "10 days, in 20 years", tag: "10 DAYS. IN 20 YEARS.",
    draw: (S) => S.put(big("10", C.gold, 220), 760, 560, 1, { anim: "grow" }) + S.put(txt(0, 0, "days", 60, C.ink), 760, 700, 1, { anim: "fade" }) + S.put(big("5,000+", C.slateDk, 150), 1350, 560, 1, { anim: "grow", at: "20" }) + S.put(txt(0, 0, "trading days", 50, C.ink), 1350, 700, 1, { anim: "fade", at: "years" }) },
  { at: "And here's the cruel twist", tag: "THE CRUEL TWIST", tagColor: "ink",
    draw: (S) => S.put(axes(1000, 520), 460, 900, 1, { anim: "fade" }) + S.put(chartLine([[0, -300], [300, -320], [380, -120], [440, -360], [700, -380], [1000, -440]], C.slateDk, 12), 460, 900, 1, { anim: "fade" }) +
      S.put(txt(0, 0, "WORST DAY", 40, C.red, { font: "bold" }), 840, 820, 1, { anim: "fade", at: "worst" }) + S.put(txt(0, 0, "BEST DAY", 40, C.oliveDk, { font: "bold" }), 920, 480, 1, { anim: "fade", at: "best" }) },
  { at: "exactly when panicked people had already sold", tag: "...AFTER PEOPLE SOLD", tagColor: "red",
    draw: (S) => B(S, { pose: "hold", face: "sad", item: `<rect x="-80" y="-50" width="160" height="100" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, "SOLD", 44, C.red, { font: "bold" }), itemScale: 0.9 }, 560, 1) +
      S.put(chartLine([[0, 0], [150, 40], [300, -200], [600, -360]], C.olive, 14), 960, 760, 1, { anim: "wipe", at: "sold" }) + S.put(rocket(), 1600, 520, 0.6, { anim: "rise", at: "sold", rot: 30 }) },
  { at: "So the plan for a scary market is", tag: "THE PLAN FOR A SCARY MARKET:", tagSize: 52,
    draw: (S) => S.put(storm(), 960, 360, 1.2, { anim: "drop" }) + B(S, { pose: "down", face: "content" }, 960, 1, { at: "same" }) + S.put(txt(0, 0, "...the same plan.", 60, C.oliveDk, { font: "bold" }), 1450, 640, 1, { anim: "fade", at: "always" }) },
  { at: "Keep the automatic transfers going", tag: "KEEP THE TRANSFERS GOING", tagColor: "olive",
    draw: (S) => S.put(toggle(true), 760, 560, 2, { anim: "pop" }) + S.put(phone(["AUTO-INVEST", "ON ✓"], { w: 260, h: 440, size: 32, head: C.oliveDk }), 1350, 880, 1, { anim: "rise" }) },
  { at: "Don't check your account every day", tag: "DON'T CHECK IT DAILY",
    draw: (S) => S.put(`<rect x="-260" y="-200" width="520" height="200" fill="${C.wood}" stroke="${C.ink}" stroke-width="6"/><rect x="-220" y="-170" width="440" height="140" fill="${C.woodDk}" stroke="${C.ink}" stroke-width="4"/><circle cx="0" cy="-100" r="14" fill="${C.ink}"/>`, 960, G, 1.1, { anim: "pop" }) + S.put(phone([], { w: 120, h: 200 }), 960, 700, 0.8, { anim: "none", id: "ph" }) +
      S.js(`tl.to("#${S.id("ph")}-i", { y: 160, opacity: 0, duration: 0.5, ease: "power2.in" }, ${S.t("check")});`) },
  { at: "Let the snowball roll", tag: "LET THE SNOWBALL ROLL", tagColor: "olive",
    draw: (S) => hillScene(S) + roll(S, "$", 300, 1500, 0.6, 1.5, 0.1, Math.max(1.2, S.dur - 0.3)) },
  { at: "That's why it's called the boring way", tag: "THAT'S WHY IT'S \"BORING\"", tagColor: "slate",
    draw: (S) => meter(S, 960, 640, 1.3, -40, 85) },
  { at: "because once it's set up", tag: "NOTHING LEFT TO DO", tagColor: "olive",
    draw: (S) => S.put(hammock(), 960, G, 1, { anim: "pop" }) + S.put(bean({ pose: "shrug", face: "content", legs: false, noShadow: true }), 960, 840, 0.75, { anim: "drop" }) + S.put(sun(), 1500, 300, 0.9, { anim: "rise" }) },
  { at: "Honestly, once a year is plenty", tag: "ONCE A YEAR IS PLENTY", tagColor: "mustard",
    draw: (S) => S.put(clipboard([["☐ TRANSFERS RUNNING?", ""], ["☐ RAISE? BUMP IT", ""], ["☐ FEES STILL LOW?", ""]], { w: 600 }), 960, 940, 1.15, { anim: "rise" }) +
      [["transfers", 0], ["Raise", 1], ["fees", 2]].map(([w, i]) => S.put(check(0.6), 690, 940 - 340 + 100 + i * 64 - 4, 1, { anim: "grow", at: w })).join("") },
  { at: "That's it, 15 minutes a year", tag: "15 MINUTES A YEAR", tagColor: "olive",
    draw: (S) => S.put(clock(), 960, 520, 1.6, { anim: "grow" }) + S.put(`<path d="M 0 0 L 0 -80 A 80 80 0 0 1 80 0 Z" fill="${C.olive}" opacity="0.6"/>`, 960, 520, 1.6, { anim: "grow", at: "15" }) },
  { at: "Then close the app and go live your life", tag: "GO LIVE YOUR LIFE", tagColor: "olive",
    draw: (S) => S.put(sun(), 1500, 300, 1, { anim: "rise" }) + B(S, { pose: "cheer", face: "joy", item: `<path d="M 0 0 L 160 -200" stroke="${C.ink}" stroke-width="3"/><path d="M 160 -200 L 220 -300 L 280 -220 L 220 -160 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>` }, 760, 1.05) + S.put(`<rect x="-260" y="-20" width="520" height="40" rx="20" fill="${C.olive}" opacity="0.4"/>`, 760, G, 1, { anim: "fade" }) },
  { at: "Now, before you start, two quick rules", tag: "2 QUICK RULES FIRST", tagColor: "red",
    draw: (S) => PC(S, { screen: "RULES", pose: "up", mouth: "o" }, 960, 1.1) + S.put(txt(0, 0, "1", 120, C.red, { font: "bold" }), 1300, 440, 1, { anim: "grow", at: "two" }) + S.put(txt(0, 0, "2", 120, C.red, { font: "bold" }), 1460, 440, 1, { anim: "grow", at: "quick" }) },
  { at: "Build your cash buffer first", tag: "#1  CASH BUFFER FIRST", tagColor: "olive",
    draw: (S) => B(S, { pose: "down", face: "content" }, 960, 0.85) + S.put(cushion(), 960, 500, 1, { anim: "pop" }) + S.put(anvil(), 960, 400, 1, { anim: "drop", at: "emergency" }) + S.put(txt(0, 0, "never forced to sell", 44, C.oliveDk, { font: "bold" }), 1500, 700, 1, { anim: "fade", at: "sell" }) },
  { at: "And pay off high interest debt", tag: "#2  KILL HIGH-INTEREST DEBT", tagColor: "red",
    draw: (S) => S.put(card({ mouth: true, label: "20%" }), 1250, 600, 1.4, { anim: "pop" }) + B(S, { pose: "push", face: "determined" }, 600, 1) },
  { at: "So here's the whole recipe", tag: "THE WHOLE RECIPE", tagColor: "mustard",
    draw: (S) => S.put(kitchen(), 0, 0, 1, { anim: "none" }) + S.put(bowl(0.9), 1350, 780, 1.1, { anim: "pop" }) + S.put(chef({ pose: "point" }), 380, 1060, 0.9, { anim: "slideL" }) +
      S.put(`<rect x="-300" y="-250" width="600" height="560" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/><path d="M -300 -160 L 300 -160" stroke="${C.red}" stroke-width="4"/>` + txt(0, -205, "THE BORING WAY", 44, C.ink, { font: "bold" }), 860, 400, 0.9, { anim: "drop" }) +
      [["Start", "1. START EARLY"], ["automate", "2. AUTOMATE IT"], ["market", "3. BUY THE MARKET"], ["alone", "4. LEAVE IT ALONE"]].map(([w, t], i) => S.put(`<text x="-250" y="0" font-family="Patrick Hand" font-size="50" fill="${C.ink}">${t}</text>`, 860, 320 + i * 72, 0.9, { anim: "fade", at: w })).join("") },
  { at: "Time, automation, index funds, patience",
    draw: (S) => S.put(kitchen(), 0, 0, 1, { anim: "none" }) + [["Time", "TIME", C.olive], ["automation", "AUTO", C.slateDk], ["index", "INDEX", C.mustard], ["patience", "PATIENCE", C.terra]].map(([w, t, col], i) => S.put(ingredientJar(t, "", col), 480 + i * 320, 770, 1, { anim: "drop", at: S.t(w) - 0.25 })).join("") },
  { at: "No hot tips, no luck, no genius required", tag: "NO HOT TIPS. NO LUCK. NO GENIUS.", tagSize: 50,
    draw: (S) => [["tips", rocket()], ["luck", slotMachine(["7", "7", "7"])], ["genius", bulb()]].map(([w, svg], i) => S.put(svg, 480 + i * 480, 860, i === 1 ? 0.8 : 1, { anim: "pop", at: w }) + S.put(cross(1.8), 480 + i * 480, 640, 1, { anim: "grow", at: S.t(w) + 0.25 })).join("") },
  { at: "Even Warren Buffett built the vast majority", tag: "BUFFETT: MOST OF IT AFTER 50", tagColor: "slate",
    draw: (S) => S.put(axes(1000, 520), 460, 900, 1, { anim: "fade" }) + S.put(chartLine([[0, -10], [300, -20], [500, -40], [600, -70], [700, -140], [800, -260], [900, -400], [1000, -500]], C.olive, 14, S.id("c")), 460, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("c")}", { attr: { "stroke-dasharray": "0 3000" } }, { attr: { "stroke-dasharray": "1600 3000" }, duration: 1.6, ease: "power2.in" }, 0.3);`) +
      S.put(`<path d="M 0 0 L 0 -520" stroke="${C.red}" stroke-width="5" stroke-dasharray="12 10"/>` + txt(0, 40, "AGE 50", 40, C.red, { font: "bold" }), 1060, 900, 1, { anim: "fade", at: "50" }) },
  { at: "Not because he found some new trick", tag: "NO NEW TRICK. JUST A LONG ROLL.",
    draw: (S) => S.put(brain({ face: "foiled", pose: "down", hat: `<g transform="translate(6 -290) scale(0.95)"><ellipse rx="92" ry="20" fill="${C.ink}"/><path d="M -62 -4 L -56 -150 L 56 -150 L 62 -4 Z" fill="${C.ink}"/></g>` }), 560, G, 0.9, { anim: "pop" }) + S.put(cross(1.5), 560, 600, 1, { anim: "grow", at: "trick" }) + S.put(magicHatSmall(), 1300, G, 1.2, { anim: "pop" }) },
  { at: "Your snowball is waiting at the top of the hill", tag: "YOUR SNOWBALL IS WAITING", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(snowball("$"), 300, hillY(300) - 60, 0.6, { anim: "grow", at: "snowball" }) + S.put(bean({ pose: "push", face: "determined", noShadow: true }), 170, hillY(170) + 4, 0.55, { anim: "pop", at: "waiting" }) },
  { at: "The boring part is giving it the first push", tag: "GIVE IT THE FIRST PUSH", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(bean({ pose: "push", face: "determined", noShadow: true }), 170, hillY(170) + 4, 0.55, { anim: "none" }) + roll(S, "$", 300, 1450, 0.6, 1.6, S.t("push"), Math.max(1, S.dur - S.t("push") - 0.2)) + S.sfx("whoosh", S.t("push"), 0.3, 0.6) },
  { at: "The exciting part comes later", tag: "THE EXCITING PART COMES LATER", tagColor: "mustard", tagSize: 52,
    draw: (S) => hillScene(S) + S.put(snowball("$", { size: 120 }), 1450, 640, 2.4, { anim: "grow" }) + S.put(confetti(40, 1600, 700, 9), 960, 760, 1, { anim: "drop", at: "later" }) + S.put(bean({ pose: "cheer", face: "joy", noShadow: true }), 900, hillY(900) + 4, 0.7, { anim: "pop", at: "exciting" }) + S.sfx("chime", S.t("later"), 0.3) },
  { at: "And if you want to know which account", tag: "WHERE SHOULD YOUR SNOWBALL LIVE?", tagColor: "olive", tagSize: 50,
    draw: (S) => B(S, { pose: "think", face: "thinking" }, 560, 1) + [["401(K)", C.olive], ["IRA", C.mustard], ["ROTH", C.terra]].map(([t, col], i) => S.put(`<rect x="-150" y="-80" width="300" height="160" rx="16" fill="${col}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, t, 56, C.ink, { font: "bold" }), 1200, 330 + i * 230, 1, { anim: "slideR", at: 0.4 + i * 0.3 })).join("") },
];

function magicHatSmall() { return `<ellipse cx="0" cy="-10" rx="120" ry="24" fill="${C.ink}"/><path d="M -80 -14 L -72 -200 L 72 -200 L 80 -14 Z" fill="${C.ink}"/><rect x="-78" y="-70" width="156" height="24" fill="${C.red}"/>` + at(0, -300, 1, cross(1.2)); }
function cart_() {
  return `<path d="M -150 -170 L -110 -170 L -80 -50 L 100 -50 L 130 -140 L -100 -140" fill="none" stroke="${C.ink}" stroke-width="5"/><path d="M -100 -140 L 130 -140 L 100 -50 L -80 -50 Z" fill="${C.white}" opacity="0.8"/>
    ${[[-50, -170, C.olive], [10, -180, C.slate], [70, -165, C.terra], [-20, -210, C.mustard], [40, -220, C.slateDk]].map(([x, y, c]) => `<rect x="${x - 26}" y="${y - 26}" width="52" height="52" rx="6" fill="${c}" stroke="${C.ink}" stroke-width="4"/>`).join("")}
    <circle cx="-60" cy="-20" r="18" fill="${C.ink}"/><circle cx="80" cy="-20" r="18" fill="${C.ink}"/>`;
}

// ---------- extra beats, inserted right after the beat whose `at` is the key ----------
const INSERTS = {
  "No secret stock": [
    { at: "no course from a guy", tag: "NO GURU WITH A RENTED LAMBO",
      draw: (S) => S.put(car({ color: C.gold, shiny: true, label: "RENTED" }), 1150, 880, 1.3, { anim: "slideR" }) +
        S.put(bean({ color: C.slate, pose: "point", face: "smug", front: `<g transform="translate(0 -300)"><rect x="-74" y="-18" width="60" height="34" rx="12" fill="${C.ink}"/><rect x="12" y="-18" width="60" height="34" rx="12" fill="${C.ink}"/></g>` }), 560, G, 1, { anim: "pop", idle: true }) +
        S.put(stampSvg("NOPE", C.red, 70, -10), 1150, 420, 1, { anim: "slam", at: "Lamborghini" }) },
  ],
  "In the last video, we found the gap": [
    { at: "the space between what you earn", tag: "THE SPACE BETWEEN EARN & NEED", tagSize: 52,
      draw: (S) => S.put(`<rect x="-120" y="-520" width="240" height="520" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "EARN", 40, C.ink, { font: "bold" }), 600, 900, 1, { anim: "none" }) +
        S.put(`<rect x="-120" y="-320" width="240" height="320" fill="${C.terra}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "NEED", 40, C.ink, { font: "bold" }), 1320, 900, 1, { anim: "none" }) +
        S.put(bean({ pose: "cheer", face: "joy" }), 960, 900, 0.8, { anim: "drop", at: "need" }) + S.put(sparkles(5, 200), 960, 600, 1, { anim: "grow", at: "need" }) },
  ],
  "Your money earns a return": [
    { at: "and then the return on the return", tag: "...AND THOSE RETURNS EARN TOO", tagColor: "olive",
      draw: (S) => Array.from({ length: 15 }, (_, i) => { const row = i < 5 ? 0 : i < 9 ? 1 : i < 12 ? 2 : i < 14 ? 3 : 4; const idx = [0, 5, 9, 12, 14][row]; return S.put(coin(36), 960 + (i - idx - ([5, 4, 3, 2, 1][row] - 1) / 2) * 84, 860 - row * 76, 1, { anim: "drop", at: 0.1 + i * 0.08, d: 0.4 }); }).join("") },
  ],
  "Say you invest $300 a month": [
    { at: "and it grows at 7", tag: "7% A YEAR, ON AVERAGE", tagColor: "slate",
      draw: (S) => PC(S, { screen: "7%/YR", pose: "up", mouth: "smile" }, 640, 1.05) + S.put(arrow(320, C.olive, 80), 1000, 560, 1, { rot: -25, anim: "wipe", at: "7" }) + S.put(txt(0, 0, "(some years down, some up)", 40, C.ink), 1250, 780, 1, { anim: "fade", at: "average" }) },
  ],
  "Same $300 a month": [
    { at: "but you wait 10 years to start", tag: "BUT YOU WAIT 10 YEARS", tagColor: "red",
      draw: (S) => S.put(calendar(10, 5, { title: "10 YEARS", cw: 90, head: C.terra }), 760, 820, 1, { anim: "pop" }) + B(S, { pose: "down", face: "content" }, 1350, 1, { anim: "pop" }) + S.put(txt(0, 0, "\"later...\"", 56, C.ink), 1350, 420, 1, { anim: "fade", at: "start" }) },
  ],
  "because the most powerful years": [
    { at: "and you only get them if you start early", tag: "ONLY IF YOU START EARLY", tagColor: "olive",
      draw: (S) => S.put(`<path d="M -400 0 L 400 0" stroke="${C.white}" stroke-width="16" stroke-dasharray="40 20"/>` + txt(0, 60, "START", 60, C.ink, { font: "bold" }), 960, 900, 1, { anim: "wipe" }) + B(S, { pose: "push", face: "determined" }, 960, 1, { anim: "pop", at: "start" }) },
  ],
  "She keeps it up for just 10 years": [
    { at: "and at 35, she stops", tag: "AT 35 SHE STOPS. FOR GOOD.", tagColor: "red",
      draw: (S) => S.put(stopSign(), 760, G, 1.2, { anim: "drop" }) + S.put(AVA({ pose: "stop", face: "smug" }), 1250, G, 1, { anim: "pop", idle: true }) + S.put(txt(0, 0, "never adds another cent", 46, C.ink), 1250, 420, 1, { anim: "fade", at: "never" }) },
  ],
  "He starts at 35": [
    { at: "and he invests $300 a month for 30 straight years", tag: "LEO: 30 STRAIGHT YEARS", tagColor: "slate",
      draw: (S) => S.put(LEO({ pose: "push", face: "determined", item: coin(26) }), 620, G, 1.05, { anim: "pop", idle: true }) + S.put(calendar(30, 10, { title: "30 YEARS", cw: 56, head: C.slateDk, mark: () => coin(40) }), 1300, 820, 1, { anim: "pop", at: "30" }) },
  ],
  "Ava put in $36": [
    { at: "three times as much", tag: "LEO PUT IN 3× AS MUCH", tagColor: "slate",
      draw: (S) => S.put(big("3×", C.slateDk, 260), 960, 600, 1, { anim: "slam" }) + S.put(LEO({ pose: "cheer", face: "smug" }), 1450, G, 0.8, { anim: "pop", idle: true }) },
  ],
  "which brings us to the question": [
    { at: "Okay, but invest in what?", tag: "INVEST IN WHAT?", tagColor: "mustard",
      draw: (S) => [["STOCKS?", C.olive], ["CRYPTO?", C.mustard], ["GOLD?", C.gold], ["FUNDS?", C.slate]].map(([t, col], i) => S.put(`<rect x="-150" y="-70" width="300" height="140" rx="16" fill="${col}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, t, 48, C.ink, { font: "bold" }), 560 + (i % 2) * 800, 420 + Math.floor(i / 2) * 300, 1, { anim: "grow", at: 0.1 + i * 0.15 })).join("") + B(S, { pose: "shrug", face: "worried" }, 960, 0.9) },
  ],
  "Find the next big thing": [
    { at: "The coin your cousin", tag: "YOUR COUSIN'S \"SURE THING\"", tagColor: "red",
      draw: (S) => S.put(bean({ color: C.olive, pose: "point", face: "happy" }), 600, G, 1, { anim: "pop", idle: true }) + S.put(moonCoin(), 1200, 560, 1.4, { anim: "grow" }) + S.put(bubble("TRUST ME BRO", { size: 44, w: 360, h: 110, dx: 120, dy: -110 }), 680, 470, 1, { anim: "grow", at: "talking" }) },
  ],
  "An index is just a list": [
    { at: "The S &P 500, for example", tag: "THE S&P 500 = ~500 BIG COMPANIES", tagColor: "slate", tagSize: 50,
      draw: (S) => Array.from({ length: 40 }, (_, i) => S.put(companyBlock([C.olive, C.slate, C.terra, C.mustard, C.slateDk][i % 5]), 470 + (i % 10) * 108, 330 + Math.floor(i / 10) * 108, 1, { anim: "grow", at: 0.1 + i * 0.03, d: 0.25 })).join("") + S.put(txt(0, 0, "...and ~460 more", 48, C.ink, { font: "bold" }), 960, 840, 1, { anim: "fade", at: "largest" }) },
  ],
  "You pick the year you expect to retire": [
    { at: "and slowly gets more careful", tag: "SAFER AS YOU GET CLOSER", tagColor: "olive",
      draw: (S) => S.put(timelineBar("", "NOW", "2060", -500, 500, C.olive), 960, 760, 1, { anim: "wipe" }) + S.put(snail(), 600, 700, 0.6, { anim: "slideL", id: "sn" }) + S.js(`tl.to("#${S.id("sn")}-i", { x: 1000, duration: ${Math.max(1, S.dur - 0.4).toFixed(2)}, ease: "power1.out" }, 0.3);`) },
  ],
  "In his 2013 letter to shareholders": [
    { at: "described the instructions he left", tag: "HIS INSTRUCTIONS FOR HIS FAMILY'S MONEY", tagSize: 46,
      draw: (S) => S.put(envelope("FOR MY FAMILY", { seal: true, w: 480, h: 300, size: 40 }), 960, 800, 1.1, { anim: "drop" }) + S.put(heart(2.4), 1300, 440, 1, { anim: "grow", at: "family's" }) },
  ],
  "But remember our $300 a month for 30 years": [
    { at: "If fees eat 1 % of your return", tag: "FEES EAT 1% EVERY YEAR", tagColor: "red",
      draw: (S) => S.put(`<path d="M -100 -60 Q -60 -120 0 -100 Q 60 -120 100 -60 L 80 40 L -80 40 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -10, "FEES", 50, C.white, { font: "bold" }) + `<path d="M -60 40 l 20 30 l 20 -30 l 20 30 l 20 -30 l 20 30" fill="${C.white}" stroke="${C.ink}" stroke-width="4"/>`, 700, 560, 1.3, { anim: "pop" }) +
        [0, 1, 2, 3].map((i) => S.put(coin(30), 1100 + i * 110, 560, 1, { anim: "none", id: `c${i}` })).join("") + S.js([0, 1, 2, 3].map((i) => `tl.to("#${S.id(`c${i}`)}-i", { x: ${-400 - i * 110}, scale: 0, duration: 0.4, ease: "power2.in" }, ${(0.5 + i * 0.4).toFixed(2)});`).join(" ")) },
  ],
  "So before you buy anything, look at the expense ratio": [
    { at: "Many broad index funds charge", tag: "MANY CHARGE A TINY FRACTION OF 1%", tagColor: "olive", tagSize: 48,
      draw: (S) => S.put(priceTag("0.03%", { size: 60, rot: -6, color: C.olive }), 760, 520, 1.3, { anim: "drop" }) + S.put(priceTag("1.00%", { size: 60, rot: 6, color: C.red, ink: C.white }), 1300, 520, 1.3, { anim: "drop", at: "fraction" }) + S.put(cross(1.5), 1420, 520, 1, { anim: "grow", at: S.t("fraction") + 0.3 }) },
  ],
  "Every year, the research firm Morningstar": [
    { at: "with the returns their investors actually get", tag: "WHAT INVESTORS ACTUALLY GET",
      draw: (S) => [0, 1, 2].map((i) => S.put(bean({ color: [C.slate, C.olive, C.bean][i], pose: "hold", face: "neutral", item: phone([], { w: 70, h: 120 }), itemScale: 0.9 }), 560 + i * 400, G, 0.9, { anim: "pop", at: 0.1 + i * 0.15, idle: true })).join("") },
  ],
  "And investors keep earning less": [
    { at: "In recent studies, about 1 %", tag: "ABOUT 1% A YEAR LESS", tagColor: "red",
      draw: (S) => S.put(big("−1%", C.red, 240), 960, 520, 1, { anim: "slam" }) + S.put(txt(0, 0, "every single year", 60, C.ink), 960, 720, 1, { anim: "fade", at: "single" }) + S.sfx("impact-bass-1", 0.25, 0.25) },
  ],
  "Research from JP Morgan": [
    { at: "missing just the 10 best days", tag: "MISS JUST THE 10 BEST DAYS", tagColor: "mustard",
      draw: (S) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => S.put(`<rect x="-44" y="-44" width="88" height="88" rx="8" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/>` + star(26, C.white), 500 + i * 102, 560, 1, { anim: "grow", at: 0.1 + i * 0.06 }) + S.put(cross(0.5), 500 + i * 102, 560, 1, { anim: "grow", at: S.t("market") + i * 0.05 })).join("") },
  ],
  "And pay off high interest debt": [
    { at: "because no index fund reliably beats", tag: "7% CAN'T BEAT 20% AGAINST YOU", tagColor: "red", tagSize: 52,
      draw: (S) => S.put(seesaw_(), 960, G, 1, { anim: "pop" }) },
  ],
  "Not because he found some new trick": [
    { at: "because his snowball had finally been rolling", tag: "HIS SNOWBALL ROLLED FOR DECADES", tagColor: "olive",
      draw: (S) => hillScene(S) + roll(S, "$", 200, 1600, 0.4, 2.0, 0.1, Math.max(1.4, S.dur - 0.3)) },
  ],
  "And if you want to know which account": [
    { at: "a 401K", push: 1.0,
      draw: (S) => S.put(`<rect x="-440" y="-250" width="880" height="500" rx="18" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="8"/>` +
        `<rect x="-420" y="-230" width="840" height="120" fill="${C.ink}" opacity="0.4"/>` + txt(0, -170, "WHICH ACCOUNT FIRST?", 56, C.white, { font: "bold" }) +
        [["401(K)", C.olive], ["IRA", C.mustard], ["ROTH", C.terra]].map(([t, col], i) => `<rect x="${-360 + i * 250}" y="-40" width="220" height="140" rx="16" fill="${col}" stroke="${C.ink}" stroke-width="5"/>` + txt(-250 + i * 250, 34, t, 50, C.ink, { font: "bold" })).join("") +
        `<circle r="56" fill="${C.red}" stroke="${C.ink}" stroke-width="6" cx="0" cy="190"/><path d="M -16 166 L 28 190 L -16 214 Z" fill="${C.white}"/>`, 960, 500, 1, { anim: "none" }) +
        S.put(at(-70, 0, 0.32, bean({ face: "happy", noShadow: true })) + at(10, 0, 0.26, brain({ face: "grin", noShadow: true })) + `<text x="70" y="-60" font-family="Archivo Black" font-size="64" fill="${C.ink}" dominant-baseline="middle">PESA<tspan fill="${C.terra}">BRAIN</tspan></text>`, 760, 960, 1, { anim: "rise", at: 0.3 }) },
  ],
};
function seesaw_() {
  return `<path d="M -50 0 L 0 -90 L 50 0 Z" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/>
    <g transform="translate(0 -96) rotate(12)"><rect x="-420" y="-14" width="840" height="28" rx="8" fill="${C.woodDk}" stroke="${C.ink}" stroke-width="5"/>
    ${at(-300, -14, 1, `<rect x="-110" y="-120" width="220" height="120" rx="12" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -60, "+7%", 54, C.ink, { font: "bold" }))}
    ${at(300, -14, 1, `<rect x="-130" y="-200" width="260" height="200" rx="12" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -100, "−20%", 64, C.white, { font: "bold" }))}</g>`;
}
const BASE = BEATS.splice(0);
for (const b of BASE) { BEATS.push(b); for (const x of INSERTS[b.at] || []) BEATS.push(x); }
