// EP02 "Why You'll Never Feel Rich" — the magic-show episode.
// Same PesaBrain identity (ledger paper, price tags, receipts, Bean / Impulse / Prof. Calc);
// this episode's own devices: Impulse the magician, curtain + trick-card openers, the runaway
// RICH finish line (nailed down as ENOUGH at the end) and the scrolling highlight-reel phone.
import {
  C, at, txt, bean, brain, calc, coffee, priceTag, coin, coinStack, bill, moneyBag, piggy, wallet, card, phone, envelope,
  letter, calendar, house, car, jar, magnifier, trophy, star, heart, bulb, clock, bubble, cloudThought, arrow, chartLine, axes,
  stampSvg, check, cross, sparkles, confetti, snail, treadmill, laptop, clipboard, building, gift, hourglass, shadow, speedLines, ghost,
} from "../../moneybrain/tools/kit.mjs";
import {
  curtain, valance, stage, spotlight, topHat, wand, playingCard, cardBack, finishLine, post, couch, cushion, anvil, tapeMeasure,
  quotePoster, brick, scoreboard, STAGE,
} from "./props2.mjs";

const G = 940;
const B = (S, o, x, s = 1, opt = {}) => S.put(bean(o), x, G, s, { idle: true, ...opt });
const BR = (S, o, x, s = 1, opt = {}) => S.put(brain(o), x, G, s, { idle: true, ...opt });
const PC = (S, o, x, s = 1, opt = {}) => S.put(calc(o), x, G, s, { idle: true, ...opt });
const magician = (o = {}) => brain({ face: "grin", pose: "point", hat: at(6, -290, 0.95, topHat()), item: wand(), ...o });
const NEIGHBOR = [C.slate, C.olive, C.terra, C.pink];

// curtain-and-card opener for each trick
function trick(S, num, lines, color = C.red) {
  const T = +Math.min(0.75, S.dur * 0.32).toFixed(2);
  return S.put(stage(), 0, 0, 1, { anim: "none" }) + S.put(spotlight(1180, 0, 860, 300), 0, 0, 1, { anim: "fade", at: 0.35 }) +
    S.put(magician(), 620, 860, 1.05, { anim: "none", idle: true }) +
    S.put(cardBack(), 1180, 470, 1, { anim: "none", id: "cb" }) + S.put(playingCard(num, lines, { color }), 1180, 470, 1, { anim: "none", id: "cf" }) +
    S.js(`tl.fromTo("#${S.id("cb")}-i", { scaleX: 1, transformOrigin: "50% 50%" }, { scaleX: 0, duration: 0.16, ease: "power1.in" }, ${T});
      tl.fromTo("#${S.id("cf")}-i", { scaleX: 0, transformOrigin: "50% 50%" }, { scaleX: 1, duration: 0.24, ease: "back.out(2)", immediateRender: true }, ${T + 0.16});
      tl.fromTo("#${S.id("cf")}", { rotation: 0, transformOrigin: "50% 50%" }, { rotation: -4, duration: 0.3, ease: "power2.out" }, ${T + 0.4});`) +
    S.put(curtain(-1), 960, 0, 1, { anim: "none", id: "cl" }) + S.put(curtain(1), 960, 0, 1, { anim: "none", id: "cr" }) +
    S.js(`tl.fromTo("#${S.id("cl")}-i", { x: 0 }, { x: -980, duration: ${Math.min(0.7, T)}, ease: "power2.inOut" }, 0.05); tl.fromTo("#${S.id("cr")}-i", { x: 0 }, { x: 980, duration: ${Math.min(0.7, T)}, ease: "power2.inOut" }, 0.05);`) +
    S.put(valance(), 0, 0, 1, { anim: "none" }) + S.sfx("whooshBig", 0.05, 0.3, 1.2) + S.sfx("sparkle", T + 0.15, 0.3, 1.5);
}
// the runaway finish line: slides off when `when` is spoken
function runaway(S, label, x, when, dx = 760, s = 1) {
  return S.put(finishLine(label), x, G, s, { id: "fl", anim: "pop" }) +
    S.js(`tl.to("#${S.id("fl")}-i", { x: ${dx}, duration: 0.55, ease: "power2.in" }, ${S.t(when)});`) + S.sfx("whoosh", S.t(when), 0.3, 0.6);
}
// a phone whose screen scrolls through posts
function feedPhone(S, kinds, x, y, s, scrollAt, dist = 900) {
  const id = S.id("feed");
  const posts = kinds.map((k, i) => at(0, -560 + i * 470, 0.82, post(k, { id: i, who: NEIGHBOR[i % 4], likes: ["12.4k", "8,901", "3,377", "21k", "640"][i % 5] }))).join("");
  return S.put(`<rect x="-200" y="-420" width="400" height="800" rx="44" fill="${C.ink}" stroke="${C.ink}" stroke-width="5"/>
    <clipPath id="${id}-clip"><rect x="-180" y="-370" width="360" height="700" rx="12"/></clipPath>
    <rect x="-180" y="-370" width="360" height="700" rx="12" fill="${C.paper2}"/>
    <g clip-path="url(#${id}-clip)"><g id="${id}">${posts}</g></g><rect x="-50" y="-400" width="100" height="12" rx="6" fill="${C.grey}"/>`, x, y, s, { anim: "rise" }) +
    S.js(`tl.fromTo("#${id}", { y: 0 }, { y: -${dist}, duration: ${Math.max(1, S.dur - scrollAt - 0.2).toFixed(2)}, ease: "power1.inOut" }, ${scrollAt});`);
}
const happyMeter = (S, level, x, y, id) => S.put(`<rect x="-50" y="-320" width="100" height="320" rx="50" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>
  <rect id="${S.id(id)}" x="-38" y="-308" width="76" height="296" rx="38" fill="${C.olive}"/>` + txt(0, 50, "HAPPY", 34, C.ink, { font: "bold" }), x, y, 1, { anim: "pop" });

export const BEATS = [
  /* ============ HOOK ============ */
  { at: "Think back to your very first paycheck", tag: "YOUR FIRST PAYCHECK",
    draw: (S) => S.put(`<rect x="-420" y="-330" width="840" height="620" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/><rect x="-380" y="-290" width="760" height="460" fill="#E9DCC0"/>` + txt(250, 240, "back then", 44, C.ink), 960, 560, 1, { anim: "drop", rot: -3 }) +
      S.put(bean({ pose: "hold", face: "happy", item: letter(["PAYCHECK", "-", "$1,200"], { w: 200, h: 220, size: 28 }), itemScale: 0.8, noShadow: true }), 960, 720, 0.85, { anim: "pop", at: "paycheck" }) },
  { at: "Remember thinking", tag: "\"JUST A LITTLE MORE...\"",
    draw: (S) => B(S, { pose: "think", face: "thinking" }, 620, 1.05) +
      S.put(cloudThought(txt(0, -20, "a little more", 46) + txt(0, 34, "= comfortable", 46, C.oliveDk), 210), 1200, 500, 1, { anim: "grow", at: "little" }) },
  { at: "Now look at what you earned today", tag: "TODAY",
    draw: (S) => B(S, { pose: "hold", face: "smile", item: letter(["PAYCHECK", "-", "$4,800"], { w: 200, h: 220, size: 28 }), itemScale: 0.8 }, 620, 1.05) +
      S.receipt({ x: 1050, y: 240, title: "THEN vs NOW", lines: [["FIRST JOB", "$1,200"]], total: ["TODAY", "$4,800"], count: [1200, 4800], at: "today", printDur: 0.6 }) },
  { at: "maybe a lot more",
    draw: (S) => [2, 4, 7, 11, 16].map((n, i) => S.put(coinStack(n), 560 + i * 200, G, 1, { anim: "rise", at: 0.05 + i * 0.12 })).join("") + S.put(arrow(260, C.olive, 70), 640, 380, 1, { rot: -20, anim: "wipe", at: "lot" }) },
  { at: "So do you feel rich?", tag: "SO... DO YOU FEEL RICH?", tagColor: "mustard",
    draw: (S) => S.put(spotlight(960, 0, 940, 260), 0, 0, 1, { anim: "fade" }) + B(S, { pose: "down", face: "neutral" }, 960, 1.15, { at: 0.2 }) +
      S.put(txt(0, 0, "?", 200, C.mustard, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` }), 1250, 420, 1, { anim: "grow", at: "rich" }) },
  { at: "For most people, the honest answer is no",
    draw: (S) => B(S, { pose: "shrug", face: "sad" }, 700, 1.1) + S.put(stampSvg("NO.", C.red, 120, -10), 1280, 500, 1, { anim: "slam", at: "no" }) + S.sfx("impact-bass-1", S.t("no") + 0.18, 0.35) },
  { at: "And it's not because you're bad with money", tag: "NOT BAD WITH MONEY", tagColor: "olive",
    draw: (S) => B(S, { pose: "hold", face: "smug", item: clipboard([["BUDGET", "✓"], ["BILLS", "✓"]], { w: 320 }), itemScale: 0.55 }, 900, 1.1) },
  { at: "It's because your brain is running a trick on you", tag: "IT'S A TRICK", tagColor: "red",
    draw: (S) => S.put(spotlight(960, 0, 940, 280), 0, 0, 1, { anim: "fade" }) + BR(S, magicianOpts(), 960, 1.2, { anim: "drop" }) + S.put(sparkles(7, 280), 960, 600, 1, { anim: "grow", at: "trick" }) + S.sfx("sparkle", S.t("trick"), 0.3, 1.5) },
  { at: "Actually, three tricks", tag: "THREE TRICKS",
    draw: (S) => BR(S, magicianOpts({ pose: "down" }), 560, 1) + [0, 1, 2].map((i) => S.put(cardBack({ w: 230, h: 320 }), 1050 + i * 240, 560, 1, { anim: "slideR", rot: (i - 1) * 8, at: S.t("three") + i * 0.15 })).join("") },
  { at: "By the end of this video", tag: "3 TRICKS + 1 NUMBER",
    draw: (S) => [0, 1, 2].map((i) => S.put(cardBack({ w: 200, h: 280 }), 520 + i * 220, 580, 1, { anim: "none", rot: (i - 1) * 8 })).join("") +
      S.put(txt(0, 0, "+", 120, C.ink, { font: "bold" }), 1180, 600, 1, { anim: "grow", at: "one" }) + S.put(envelope("THE NUMBER", { seal: true, w: 340, h: 220, size: 34 }), 1500, 700, 1, { anim: "drop", at: "money" }) },
  { at: "Hint, it's not your salary", tag: "HINT: NOT YOUR SALARY",
    draw: (S) => S.put(letter(["SALARY", "-", "$$$$"], { w: 300, h: 340, size: 44 }), 960, 800, 1.1, { anim: "pop" }) + S.put(cross(2.2), 960, 600, 1, { anim: "grow", at: "salary" }) },
  { at: "Here's a strange fact", tag: "A STRANGE FACT", tagColor: "slate",
    draw: (S) => PC(S, { screen: "FACT", pose: "up", mouth: "o" }, 960, 1.15) + S.put(bulb(), 1250, 420, 0.8, { anim: "grow", at: "fact" }) },
  { at: "In a 2024 survey", tag: "THE 2024 SURVEY", tagColor: "slate",
    draw: (S) => S.put(clipboard([["CHARLES SCHWAB", ""], ["MODERN WEALTH", ""], ["SURVEY 2024", ""], ["\"WEALTHY\" =", "?"]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "2024", pose: "pointL" }, 1400, 0.95, { at: "Schwab" }) },
  { at: "Americans said it takes",
    draw: (S) => S.receipt({ x: 660, y: 200, w: 620, title: "TO FEEL WEALTHY", lines: [["AMERICANS SAY", ""]], total: ["", "$2,500,000"], count: [0, 2500000], at: "two", printDur: 0.6, countDur: 1.3 }) },
  { at: "Two and a half million Most", push: 1.05,
    draw: (S) => [12, 18, 24, 30, 24, 18, 12].map((n, i) => S.put(coinStack(n), 560 + i * 130, G, 0.9, { anim: "rise", at: 0.05 + i * 0.08 })).join("") +
      B(S, { pose: "cheeks", face: "shocked" }, 1620, 0.6, { at: "million" }) + S.put(txt(0, 0, "$2.5M", 120, C.terra, { font: "bold", extra: `stroke="${C.ink}" stroke-width="5" paint-order="stroke"` }), 960, 260, 1, { anim: "grow", at: "half" }) },
  { at: "Most people will never see that number", tag: "MOST WILL NEVER SEE IT",
    draw: (S) => B(S, { pose: "hold", face: "neutral", item: `<rect x="-20" y="-20" width="160" height="40" rx="10" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="5" transform="rotate(-20)"/>` }, 520, 1) +
      S.put(txt(0, 0, "$2.5M", 50, C.terra, { font: "bold" }), 1600, 330, 1, { anim: "fade", at: "number" }) + S.put(`<path d="M 0 0 L 900 -300" stroke="${C.grey}" stroke-width="4" stroke-dasharray="12 14"/>`, 680, 640, 1, { anim: "wipe", at: "see" }) },
  { at: "And when people do get closer", tag: "THE LINE MOVES", tagColor: "terra",
    draw: (S) => B(S, { pose: "push", face: "determined" }, 560, 1, { anim: "slideL" }) + S.put(speedLines(5, 180), 420, 700, 1, { anim: "fade" }) + runaway(S, "RICH", 1280, "moving") },
  { at: "So what keeps moving it?", tag: "WHO KEEPS MOVING IT?",
    draw: (S) => B(S, { pose: "shrug", face: "worried" }, 520, 0.95) + S.put(finishLine("RICH"), 1350, G, 0.9, { anim: "none", id: "fl" }) +
      S.put(brain({ face: "sly", pose: "push" === "push" ? "hold" : "hold", noShadow: true }), 1700, G, 0.75, { anim: "slideR", at: "keeps" }) +
      S.js(`tl.to("#${S.id("fl")}-i", { x: 140, duration: 0.6, ease: "power2.inOut" }, ${S.t("it") + 0.1});`) },
  { at: "Let's meet the first trick",
    draw: (S) => S.put(stage(), 0, 0, 1, { anim: "none" }) + S.put(curtain(-1), 960, 0, 1, { anim: "none" }) + S.put(curtain(1), 960, 0, 1, { anim: "none" }) + S.put(valance(), 0, 0, 1, { anim: "none" }) +
      S.put(brain({ face: "grin", pose: "down", hat: at(6, -290, 0.95, topHat()), noShadow: true }), 960, 700, 0.8, { anim: "rise", at: "first" }) + S.put(txt(0, 0, "PRESENTING...", 70, C.gold, { font: "bold" }), 960, 220, 1, { anim: "fade", at: 0.2 }) },

  /* ============ TRICK 1 ============ */
  { at: "Trick one, the treadmill", draw: (S) => trick(S, "#1", ["THE", "TREADMILL"], C.red) },
  { at: "Psychologists call it hedonic adaptation", tag: "HEDONIC ADAPTATION", tagColor: "slate",
    draw: (S) => PC(S, { screen: "ADAPT", pose: "point", mouth: "smile" }, 640, 1.05) + S.put(`<path d="M 0 0 C 120 -200 300 -200 420 -60 L 700 -60" fill="none" stroke="${C.olive}" stroke-width="14" stroke-linecap="round" id="${S.id("ad")}"/>` + txt(160, -230, "WOW", 44, C.oliveDk, { font: "bold" }) + txt(620, -110, "meh", 44, C.ink), 980, 760, 1, { anim: "fade", at: "adaptation" }) },
  { at: "Your brain gets used to good things", tag: "IT GETS USED TO IT. FAST.", tagSize: 54,
    draw: (S) => [0, 1, 2].map((i) => S.put(gift("", [C.terra, C.olive, C.slateDk][i]), 1150 + i * 210, G, 0.7, { anim: "drop", at: 0.1 + i * 0.15 })).join("") + BR(S, { face: "yawn", pose: "down" }, 620, 1.05, { at: "fast" }) },
  { at: "Remember your first car?", tag: "YOUR FIRST CAR",
    draw: (S) => S.put(car({ color: C.olive, shiny: true }), 1150, 880, 1.2, { anim: "slideR" }) + B(S, { pose: "cheer", face: "joy" }, 560, 1) },
  { at: "Your first apartment with a real couch", tag: "A REAL COUCH!",
    draw: (S) => S.put(couch(), 960, G, 1.2, { anim: "drop" }) + S.put(bean({ pose: "cheer", face: "joy", legs: false, noShadow: true }), 960, 900, 0.85, { anim: "pop", at: "couch" }) + S.put(sparkles(5, 300), 960, 600, 1, { anim: "grow", at: "couch" }) },
  { at: "It felt amazing for a few weeks",
    draw: (S) => happyMeter(S, 1, 1450, 900, "hm") + S.put(couch(), 760, G, 1, { anim: "none" }) + S.put(bean({ pose: "cheer", face: "joy", legs: false, noShadow: true }), 760, 900, 0.75, { anim: "none" }) +
      S.put(txt(0, 0, "AMAZING", 60, C.olive, { font: "bold" }), 1450, 480, 1, { anim: "grow", at: "amazing" }) + S.put(calendar(21, 7, { title: "A FEW WEEKS", cw: 46, head: C.olive }), 1150, 360, 0.8, { anim: "pop", at: "weeks" }) },
  { at: "Then it just became normal", tag: "...THEN NORMAL",
    draw: (S) => happyMeter(S, 1, 1450, 900, "hm") + S.put(couch(), 760, G, 1, { anim: "none" }) + S.put(bean({ pose: "down", face: "neutral", legs: false, noShadow: true }), 760, 900, 0.75, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("hm")}", { scaleY: 1, transformOrigin: "50% 100%" }, { scaleY: 0.35, duration: 1.0, ease: "power2.inOut" }, ${S.t("normal", -0.4)});`) },
  { at: "your new baseline", tag: "YOUR NEW BASELINE", tagColor: "slate",
    draw: (S) => S.put(axes(1000, 480), 460, 900, 1, { anim: "fade" }) + S.put(chartLine([[0, -60], [200, -60], [200, -170], [450, -170], [450, -280], [720, -280], [720, -390], [1000, -390]], C.terra, 12, S.id("bl")), 460, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("bl")}", { attr: { "stroke-dasharray": "0 3000" } }, { attr: { "stroke-dasharray": "1500 3000" }, duration: 1.2, ease: "none" }, 0.1);`) + S.put(txt(0, 0, "BASELINE", 46, C.terra, { font: "bold" }), 1340, 450, 1, { anim: "fade", at: "baseline" }) },
  { at: "Your brain is built to notice change", tag: "NOTICES CHANGE, NOT COMFORT", tagSize: 52,
    draw: (S) => BR(S, { face: "happy", pose: "point" }, 520, 0.95) + S.put(txt(0, 0, "NEW!", 90, C.red, { font: "bold", rot: -8 }), 1050, 520, 1, { anim: "slam", at: "change" }) + S.put(couch(C.grey), 1450, G, 0.7, { anim: "fade", at: "comfort" }) + S.put(txt(0, 0, "zzz", 50, C.grey, { font: "bold" }), 1450, 640, 1, { anim: "fade", at: "comfort" }) },
  { at: "Arrays feels great on day one", tag: "DAY 1: A RAISE!", tagColor: "olive",
    draw: (S) => B(S, { pose: "cheer", face: "joy", item: letter(["RAISE!", "+$5,000"], { w: 200, h: 180, size: 30 }), itemScale: 0.8 }, 760, 1.05) + S.put(confetti(30, 1300, 600, 4), 960, 700, 1, { anim: "drop", at: "great" }) + S.put(calendar(1, 1, { title: "DAY 1", cw: 140, head: C.olive }), 1450, 600, 1, { anim: "pop" }) },
  { at: "By month six", tag: "MONTH 6: JUST YOUR SALARY", tagSize: 54,
    draw: (S) => B(S, { pose: "down", face: "neutral" }, 760, 1.05) + S.put(calendar(6, 3, { title: "MONTH 6", cw: 90, head: C.slateDk }), 1400, 700, 1, { anim: "pop" }) + S.put(txt(0, 0, "meh.", 70, C.ink), 830, 430, 1, { anim: "fade", at: "salary" }) },
  { at: "So you chase the next upgrade", tag: "CHASE THE NEXT UPGRADE", tagColor: "terra",
    draw: (S) => BR(S, { face: "sly", pose: "hold", item: `<path d="M 0 0 L 360 -280" stroke="${C.woodDk}" stroke-width="12" stroke-linecap="round"/><path d="M 360 -280 Q 400 -200 390 -120" fill="none" stroke="${C.ink}" stroke-width="4"/>` + at(390, -40, 0.5, car({ color: C.gold, shiny: true })) }, 1180, 1.05) +
      B(S, { pose: "push", face: "determined" }, 560, 1, { anim: "slideL" }) },
  { at: "running faster", tag: "RUNNING FASTER...",
    draw: (S) => S.put(treadmill(), 960, G - 30, 1.3) + B(S, { pose: "cheer", face: "determined" }, 920, 1.05, { idle: 0.3 }) + S.put(speedLines(6, 220), 760, 620, 1, { anim: "fade" }) },
  { at: "and staying in the same place", tag: "...SAME PLACE.", tagColor: "red",
    draw: (S) => S.put(treadmill(), 960, G - 30, 1.3, { anim: "none" }) + B(S, { pose: "shrug", face: "worried" }, 920, 1.05, { anim: "none", idle: 0.3 }) + S.put(`<path d="M -40 0 L 40 0 M 0 -40 L 0 40" stroke="${C.red}" stroke-width="10"/>`, 920, 990, 1, { anim: "grow", at: "same" }) + S.put(txt(0, 0, "YOU ARE HERE", 40, C.red, { font: "bold" }), 920, 1040, 1, { anim: "fade", at: "place" }) },
  { at: "That's the hedonic treadmill", tag: "THE HEDONIC TREADMILL", tagColor: "red",
    draw: (S) => S.put(treadmill(), 860, G - 30, 1.3, { anim: "none" }) + B(S, { pose: "cheer", face: "determined" }, 820, 1.05, { anim: "none", idle: 0.3 }) +
      S.put(`<path d="M 0 0 L 0 -120" stroke="${C.ink}" stroke-width="6"/>` + at(0, 10, 0.32, finishLine("RICH")), 1300, 470, 1, { anim: "drop" }) + S.put(txt(0, 0, "always just ahead", 40, C.ink), 1300, 620, 1, { anim: "fade", at: "treadmill" }) },
  { at: "And it's why the finish line keeps moving", tag: "THE FINISH LINE KEEPS MOVING", tagSize: 52,
    draw: (S) => B(S, { pose: "push", face: "worried" }, 560, 1, { anim: "slideL" }) + runaway(S, "RICH", 1180, "moving", 900) },

  /* ============ TRICK 2 ============ */
  { at: "Trick two", draw: (S) => trick(S, "#2", ["THE", "COMPARISON"], C.slateDk) },
  { at: "you're not measuring yourself against your past", tag: "NOT AGAINST YOUR PAST...",
    draw: (S) => S.put(`<rect x="-150" y="-200" width="300" height="360" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><rect x="-130" y="-180" width="260" height="260" fill="#E9DCC0"/>` + at(0, 70, 0.55, bean({ pose: "down", face: "smile", noShadow: true })) + txt(0, 120, "you, 2015", 34, C.ink), 1350, 560, 1, { anim: "drop", rot: 4 }) +
      B(S, { pose: "carry", face: "thinking", item: tapeMeasure(200), itemScale: 0.8 }, 640, 1.05) },
  { at: "You're measuring yourself against other people", tag: "...AGAINST OTHER PEOPLE", tagColor: "slate",
    draw: (S) => B(S, { pose: "down", face: "worried" }, 560, 0.95) + [0, 1, 2].map((i) => S.put(bean({ color: NEIGHBOR[i], pose: ["cheer", "wave", "down"][i], face: "happy" }), 980 + i * 270, G, 1 + i * 0.1, { anim: "pop", at: S.t("other") + i * 0.15, idle: true })).join("") },
  { at: "Psychologists call this social comparison", tag: "SOCIAL COMPARISON", tagColor: "slate",
    draw: (S) => S.put(`<path d="M -250 0 L 250 0 M 0 0 L 0 -320" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/><path d="M -250 0 L -320 120 L -180 120 Z M 250 0 L 180 120 L 320 120 Z" fill="none" stroke="${C.ink}" stroke-width="6"/>` + at(-250, 120, 0.45, bean({ noShadow: true, face: "sad" })) + at(250, 120, 0.45, bean({ color: C.slate, noShadow: true, face: "happy" })), 960, 500, 1, { anim: "pop" }) },
  { at: "and your brain does it automatically", tag: "AUTOMATICALLY",
    draw: (S) => BR(S, { face: "meh", pose: "down" }, 960, 1.15) + S.put(`<circle r="60" fill="${C.grey}" stroke="${C.ink}" stroke-width="5"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<rect x="-12" y="-82" width="24" height="26" fill="${C.grey}" stroke="${C.ink}" stroke-width="4" transform="rotate(${i * 60})"/>`).join("") + `<circle r="20" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>`, 1260, 420, 1, { anim: "grow", id: "gear" }) +
      S.js(`tl.to("#${S.id("gear")}-i", { rotation: 360, transformOrigin: "50% 50%", duration: 2.4, ease: "none" }, 0.3);`) },
  { at: "Here's the problem", tag: "HERE'S THE PROBLEM", tagColor: "red",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, 960, 1.1) },
  { at: "100 years ago", tag: "100 YEARS AGO: THE NEIGHBORS", tagSize: 52,
    draw: (S) => S.put(`<rect width="1920" height="1080" fill="#B49A6E" opacity="0.22"/>`, 0, 0, 1, { anim: "fade" }) + S.put(house({ color: C.olive }), 600, G, 0.9) + S.put(house({ color: C.terra }), 1320, G, 0.9, { at: 0.25 }) +
      S.put(`<path d="M -260 0 L 260 0 M -260 -60 L 260 -60" stroke="${C.wood}" stroke-width="10"/>` + [-240, -160, -80, 0, 80, 160, 240].map((x) => `<rect x="${x - 10}" y="-110" width="20" height="120" fill="${C.wood}" stroke="${C.ink}" stroke-width="3"/>`).join(""), 960, G, 1, { anim: "fade" }) +
      S.put(bean({ face: "smile", pose: "wave", noShadow: true }), 820, G, 0.6, { anim: "pop", at: "neighbors" }) + S.put(bean({ color: C.slate, face: "smile", pose: "wave", noShadow: true }), 1100, G, 0.6, { anim: "pop", at: "neighbors" }) },
  { at: "Today, you compare yourself", tag: "TODAY: EVERYONE'S BEST MOMENTS", tagColor: "terra", tagSize: 50,
    draw: (S) => feedPhone(S, ["vacation", "car", "kitchen", "house", "vacation"], 1280, 620, 0.82, 0.4, 1300) + B(S, { pose: "phone", face: "worried" }, 560, 1) },
  { at: "all day on your phone", tag: "ALL DAY",
    draw: (S) => S.put(clock({ handId: S.id("h") }), 1350, 460, 1.1, { anim: "grow" }) + S.js(`tl.fromTo("#${S.id("h")}", { rotation: 0, svgOrigin: "0 0" }, { rotation: 720, duration: 1.4, ease: "power1.inOut" }, 0.2);`) + B(S, { pose: "phone", face: "sad", item: phone([], { w: 70, h: 120 }), itemScale: 0.9 }, 700, 1.05) },
  { at: "You see their vacation", tag: "YOU SEE...",
    draw: (S) => [["vacation", "vacation"], ["car", "car"], ["kitchen", "kitchen"]].map(([k, w], i) => S.put(post(k, { id: i, who: NEIGHBOR[i] }), 520 + i * 440, 560, 0.95, { anim: "drop", at: w, rot: (i - 1) * 4 })).join("") + S.sfx("pop", S.t("car"), 0.2, 0.5) + S.sfx("pop", S.t("kitchen"), 0.2, 0.5) },
  { at: "You don't see their credit card statement", tag: "...YOU DON'T SEE THIS", tagColor: "red",
    draw: (S) => S.put(post("kitchen", { id: 9, who: NEIGHBOR[2] }), 960, 560, 1.1, { anim: "none", id: "pk" }) + S.put(post("statement", { id: 8, who: NEIGHBOR[2] }), 960, 560, 1.1, { anim: "none", id: "ps" }) +
      S.js(`tl.fromTo("#${S.id("pk")}-i", { scaleX: 1, transformOrigin: "50% 50%" }, { scaleX: 0, duration: 0.18, ease: "power1.in" }, ${S.t("credit")}); tl.fromTo("#${S.id("ps")}-i", { scaleX: 0, transformOrigin: "50% 50%" }, { scaleX: 1, duration: 0.25, ease: "back.out(2)", immediateRender: true }, ${S.t("credit") + 0.18});`) + S.sfx("whoosh", S.t("credit"), 0.25, 0.6) },
  { at: "So you're comparing your whole life", tag: "YOUR LIFE vs. THEIR HIGHLIGHT REEL", tagSize: 48,
    draw: (S) => S.put(`<rect x="-480" y="-330" width="960" height="660" fill="${C.paper2}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -280, "YOUR WHOLE LIFE", 44, C.ink, { font: "bold" }) +
      at(-240, 300, 0.6, letter(["BILLS", "-", "-"], { w: 220, h: 260 })) + at(220, 300, 0.75, bean({ pose: "shrug", face: "neutral", noShadow: true })) + at(-60, 260, 0.4, coffee({ steam: false })), 560, 600, 0.8, { anim: "slideL" }) +
      S.put(`<rect x="-480" y="-330" width="960" height="660" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -280, "THEIR HIGHLIGHT REEL", 44, C.ink, { font: "bold" }) + at(-200, 60, 0.75, post("vacation", { id: 3 })) + at(220, 60, 0.75, post("car", { id: 4 })) + sparkles(6, 380), 1400, 600, 0.8, { anim: "slideR", at: "highlight" }) },
  { at: "And you'll lose that game every single time", tag: "YOU LOSE. EVERY TIME.", tagColor: "red",
    draw: (S) => S.put(scoreboard("0", "99"), 960, 560, 1.2, { anim: "drop" }) + S.sfx("impact-bass-1", S.t("lose") + 0.2, 0.3) },
  { at: "There's always someone with more", tag: "THERE'S ALWAYS MORE",
    draw: (S) => [[wallet(), 0.9], [car({ color: C.slateDk }), 0.55], [house({ color: C.olive }), 0.7], [`<path d="M -200 0 L -200 -260 L 0 -380 L 200 -260 L 200 0 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><rect x="-160" y="-220" width="320" height="40" fill="${C.gold}"/>` + txt(0, -120, "MANSION", 40, C.ink, { font: "bold" }), 0.8]].map(([svg, s], i) =>
      S.put(bean({ color: [C.bean, C.slate, C.olive, C.pink][i], pose: "cheer", face: "happy", noShadow: true }), 280 + i * 370, G, 0.55 + i * 0.08, { anim: "pop", at: 0.1 + i * 0.25 }) + S.put(svg, 460 + i * 370, G, s * (i === 3 ? 0.85 : 1), { anim: "pop", at: 0.2 + i * 0.25 })).join("") },
  { at: "which means rich is always just out of reach", tag: "ALWAYS JUST OUT OF REACH", tagColor: "terra",
    draw: (S) => S.put(`<path d="M 0 -180 L 0 0" stroke="${C.ink}" stroke-width="6"/>` + at(0, 170, 0.45, finishLine("RICH")), 1050, 300, 1, { anim: "drop", id: "hang" }) +
      B(S, { pose: "cheer", face: "determined" }, 1050, 1, { id: "jump", idle: false }) + S.js(`tl.to("#${S.id("jump")}-i", { y: -90, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 3 }, 0.5); tl.to("#${S.id("hang")}-i", { y: -70, duration: 0.3, ease: "power2.out", yoyo: true, repeat: 3 }, 0.5);`) },

  /* ============ TRICK 3 ============ */
  { at: "Trick three is the sneakiest", draw: (S) => trick(S, "#3", ["THE FOCUSING", "ILLUSION"], C.oliveDk) },
  { at: "It's called the focusing illusion", tag: "THE FOCUSING ILLUSION", tagColor: "olive",
    draw: (S) => S.put(house({ color: C.terra }), 760, G, 1.4, { anim: "pop" }) + S.put(magnifier({ inner: at(0, 30, 0.5, `<rect x="-120" y="-80" width="240" height="120" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -20, "KITCHEN", 40, C.white, { font: "bold" })) }), 1250, 520, 1.8, { anim: "grow", at: "focusing" }) },
  { at: "The Nobel Prize winning psychologist", tag: "DANIEL KAHNEMAN", tagColor: "slate",
    draw: (S) => S.put(`<circle r="150" fill="${C.gold}" stroke="${C.ink}" stroke-width="8"/><circle r="110" fill="none" stroke="${C.mustard}" stroke-width="6"/>` + txt(0, -20, "NOBEL", 52, C.ink, { font: "bold" }) + txt(0, 40, "PRIZE", 44, C.ink, { font: "bold" }) + `<path d="M -80 120 L -120 300 L -60 260 L -20 300 L -20 140 Z M 80 120 L 120 300 L 60 260 L 20 300 L 20 140 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>`, 1250, 480, 1, { anim: "drop" }) +
      PC(S, { screen: "QUOTE", pose: "point", mouth: "smile" }, 600, 1.0) + S.sfx("sparkle", 0.5, 0.25, 1.5) },
  { at: "Nothing in life is as important", tag: "THE FOCUSING ILLUSION", tagColor: "slate",
    draw: (S) => S.put(quotePoster(["Nothing in life is as important", "as you think it is,", "while you are thinking about it."], "Daniel Kahneman"), 960, 560, 1, { anim: "drop" }) +
      S.js([["Nothing", 0], ["as", 1], ["while", 2]].map(([w, i]) => `tl.fromTo(document.querySelectorAll("#${S.id("e0")} .ql")[${i}], { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${S.t(w === "as" ? "as you think" : w)});`).join(" ")) },
  { at: "When you imagine the bigger house",
    draw: (S) => B(S, { pose: "think", face: "content" }, 560, 1.05) + S.put(cloudThought(at(0, 90, 0.55, house({ color: C.terra })), 220), 1200, 500, 1, { anim: "grow", at: "bigger" }) },
  { at: "your brain zooms in on the best part", tag: "IT ZOOMS IN ON THE BEST PART", tagSize: 52,
    draw: (S) => S.put(cloudThought(at(0, 90, 0.55, house({ color: C.terra })), 220), 1200, 500, 1, { anim: "none", id: "cl" }) + B(S, { pose: "think", face: "content" }, 560, 1.05, { anim: "none" }) +
      S.js(`tl.to("#${S.id("cl")}-i", { scale: 1.55, transformOrigin: "50% 50%", x: -140, y: 150, duration: 0.8, ease: "power2.inOut" }, ${S.t("zooms")});`) + S.put(sparkles(6, 260), 1080, 560, 1, { anim: "grow", at: "best" }) },
  { at: "The big kitchen, the extra room", tag: "THE KITCHEN! THE EXTRA ROOM!", tagColor: "mustard", tagSize: 52,
    draw: (S) => S.put(post("kitchen", { id: 1, caption: "dream kitchen" }), 700, 560, 1.15, { anim: "pop", at: "kitchen" }) +
      S.put(`<rect x="-200" y="-150" width="400" height="300" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><rect x="-200" y="60" width="400" height="90" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -40, "EXTRA ROOM", 44, C.ink, { font: "bold" }) + sparkles(4, 200), 1300, 560, 1, { anim: "pop", at: "extra" }) },
  { at: "It doesn't picture the bigger mortgage", tag: "WHAT IT DOESN'T PICTURE", tagColor: "ink",
    draw: (S) => [["mortgage", letter(["MORTGAGE", "-", "+$900/mo"], { w: 260, h: 260, size: 32 })], ["commute", car({ color: C.slateDk })], ["taxes", letter(["PROPERTY", "TAX", "-", "$$$"], { w: 240, h: 290, size: 32 })]].map(([w, svg], i) =>
      S.put(svg, 520 + i * 440, 840, i === 1 ? 0.7 : 1, { anim: "rise", at: w }) + S.put(txt(0, 0, ["BIGGER MORTGAGE", "LONGER COMMUTE", "HIGHER TAXES"][i], 38, C.red, { font: "bold" }), 520 + i * 440, 470, 1, { anim: "fade", at: w })).join("") },
  { at: "Or the fact that six months later", tag: "6 MONTHS LATER...", tagColor: "slate",
    draw: (S) => S.put(post("kitchen", { id: 2 }), 1300, 520, 0.9, { anim: "fade" }) + B(S, { pose: "phone", face: "neutral", item: phone([], { w: 70, h: 120 }), itemScale: 0.9 }, 600, 1.05) + S.put(txt(0, 0, "what kitchen?", 50, C.ink), 640, 440, 1, { anim: "fade", at: "barely" }) },
  { at: "So your brain keeps promising", tag: "\"THE NEXT THING WILL BE THE THING\"", tagSize: 46,
    draw: (S) => BR(S, magicianOpts({ pose: "point", face: "sly" }), 560, 1.05) + S.put(gift("NEXT", C.gold) + sparkles(5, 220), 1300, G, 1.3, { anim: "drop", at: "next" }) },
  { at: "And it almost never is", tag: "...IT ALMOST NEVER IS.", tagColor: "ink",
    draw: (S) => S.put(`<rect x="-90" y="-150" width="180" height="150" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/><rect x="-80" y="-140" width="160" height="10" fill="${C.ink}" opacity="0.4"/>`, 960, G, 1.3, { anim: "none" }) +
      S.put(`<rect x="-104" y="-46" width="208" height="46" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/>`, 960, G - 195, 1.3, { anim: "none", id: "lid" }) + S.js(`tl.to("#${S.id("lid")}-i", { y: -160, rotation: -30, duration: 0.4, ease: "back.out(2)" }, ${S.t("never") - 0.3});`) +
      S.put(txt(0, 0, "( empty )", 50, C.grey, { font: "bold" }), 960, 560, 1, { anim: "fade", at: "never" }) + B(S, { pose: "shrug", face: "sad" }, 1450, 0.9) },

  /* ============ DOES MONEY BUY HAPPINESS ============ */
  { at: "So does that mean money doesn't make you happier?", tag: "SO MONEY DOESN'T HELP?",
    draw: (S) => B(S, { pose: "hold", face: "thinking", item: moneyBag("$"), itemScale: 0.6 }, 960, 1.1) + S.put(txt(0, 0, "?", 160, C.mustard, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` }), 1250, 440, 1, { anim: "grow", at: "happier" }) },
  { at: "Not quite", tag: "NOT QUITE.", tagColor: "olive",
    draw: (S) => PC(S, { screen: "WELL...", pose: "up", mouth: "smile" }, 960, 1.15) },
  { at: "And this is where it gets interesting", tag: "IT GETS INTERESTING", tagColor: "mustard",
    draw: (S) => S.put(spotlight(960, 0, 940, 300), 0, 0, 1, { anim: "fade" }) + PC(S, { screen: "!", pose: "point", mouth: "o" }, 760, 1) + S.put(sparkles(6, 200), 1250, 500, 1, { anim: "grow", at: "interesting" }) },
  { at: "For years, a famous study", tag: "THE OLD IDEA: $75K = MAX HAPPY", tagSize: 50,
    draw: (S) => S.put(axes(1000, 480), 460, 900, 1, { anim: "fade" }) + S.put(chartLine([[0, -40], [200, -200], [400, -320], [500, -360], [1000, -360]], C.slateDk, 12, S.id("c1")), 460, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("c1")}", { attr: { "stroke-dasharray": "0 3000" } }, { attr: { "stroke-dasharray": "1300 3000" }, duration: 1.2, ease: "power1.inOut" }, ${S.t("happiness")});`) +
      S.put(`<path d="M 0 0 L 0 -400" stroke="${C.red}" stroke-width="5" stroke-dasharray="12 10"/>` + txt(0, 40, "$75K", 44, C.red, { font: "bold" }), 960, 900, 1, { anim: "fade", at: "75" }) + S.put(txt(0, 0, "HAPPINESS", 34, C.ink, { font: "bold" }), 520, 400, 1, { anim: "fade" }) + S.put(txt(0, 0, "INCOME →", 34, C.ink, { font: "bold" }), 1380, 950, 1, { anim: "fade" }) },
  { at: "But newer research", tag: "NEWER RESEARCH (2023)", tagColor: "slate",
    draw: (S) => S.put(clipboard([["KILLINGSWORTH,", ""], ["KAHNEMAN &", ""], ["MELLERS, 2023", ""], ["HAPPINESS", "↑"]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "2023", pose: "pointL" }, 1400, 0.95, { at: "Kahneman" }) },
  { at: "found that for most people", tag: "IT KEEPS RISING", tagColor: "olive",
    draw: (S) => S.put(axes(1000, 480), 460, 900, 1, { anim: "none" }) + S.put(chartLine([[0, -40], [200, -200], [400, -320], [500, -360], [1000, -360]], C.grey, 8), 460, 900, 1, { anim: "none" }) +
      S.put(chartLine([[0, -40], [200, -200], [400, -320], [600, -380], [800, -420], [1000, -450]], C.olive, 14, S.id("c2")), 460, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("c2")}", { attr: { "stroke-dasharray": "0 3000" } }, { attr: { "stroke-dasharray": "1300 3000" }, duration: 1.4, ease: "power1.inOut" }, ${S.t("rising", -0.8)});`) },
  { at: "Just slowly", tag: "JUST... SLOWLY",
    draw: (S) => S.put(axes(1000, 480), 460, 900, 1, { anim: "none" }) + S.put(chartLine([[0, -40], [200, -200], [400, -320], [600, -380], [800, -420], [1000, -450]], C.olive, 14), 460, 900, 1, { anim: "none" }) + S.put(snail(), 1160, 500, 0.6, { anim: "pop", rot: -8 }) },
  { at: "Much more slowly than your brain predicts", tag: "SLOWER THAN YOUR BRAIN PREDICTS", tagColor: "terra", tagSize: 50,
    draw: (S) => S.put(axes(1000, 480), 460, 900, 1, { anim: "none" }) + S.put(chartLine([[0, -40], [200, -200], [400, -320], [600, -380], [800, -420], [1000, -450]], C.olive, 14), 460, 900, 1, { anim: "none" }) +
      S.put(chartLine([[0, -40], [300, -380], [500, -600]], C.pink, 14, S.id("c3")), 460, 900, 1, { anim: "none" }) + S.js(`tl.fromTo("#${S.id("c3")}", { attr: { "stroke-dasharray": "0 3000" } }, { attr: { "stroke-dasharray": "900 3000" }, duration: 0.8, ease: "power2.out" }, ${S.t("brain")});`) +
      S.put(brain({ face: "love", noShadow: true }), 1040, 360, 0.45, { anim: "grow", at: "predicts" }) + S.put(txt(0, 0, "REALITY", 34, C.oliveDk, { font: "bold" }), 1560, 460, 1, { anim: "fade" }) },
  { at: "Money helps", tag: "MONEY HELPS ✓", tagColor: "olive",
    draw: (S) => B(S, { pose: "hold", face: "smile", item: moneyBag("$"), itemScale: 0.6 }, 960, 1.1) + S.put(check(1.6), 1250, 500, 1, { anim: "grow", at: "helps" }) },
  { at: "It just never feels the way your brain promised", tag: "...NOT THE WAY IT PROMISED", tagSize: 52,
    draw: (S) => S.put(letter(["PROMISE", "-", "ENDLESS", "BLISS ✨", "- Impulse"], { w: 340, h: 380, size: 36 }), 1200, 880, 1.1, { anim: "pop" }) + S.put(cross(2), 1200, 560, 1, { anim: "grow", at: "promised" }) + BR(S, { face: "sly", pose: "shrug" }, 560, 0.95) },
  { at: "But there's one money number", tag: "THE ONE NUMBER", tagColor: "mustard",
    draw: (S) => S.put(envelope("THE NUMBER", { seal: true, w: 420, h: 280, size: 44, open: false }), 960, 760, 1.2, { anim: "drop", id: "env" }) + S.sfx("sparkle", S.t("salary") - 0.2, 0.25, 1.5) },
  { at: "In a study published in 2016", tag: "A 2016 STUDY", tagColor: "slate",
    draw: (S) => S.put(clipboard([["BANK BALANCE", ""], ["vs.", ""], ["LIFE", ""], ["SATISFACTION", ""]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "2016", pose: "pointL" }, 1400, 0.95, { at: "researchers" }) },
  { at: "how much cash people had in the bank",
    draw: (S) => S.put(laptop(["BANK", "$$$"], { size: 56 }), 640, 880, 1.1, { anim: "pop" }) + S.put(arrow(200, C.ink, 50), 960, 700, 1, { anim: "wipe", at: "linked" }) +
      S.put(`<circle r="120" fill="${C.gold}" stroke="${C.ink}" stroke-width="6"/><circle cx="-40" cy="-30" r="12" fill="${C.ink}"/><circle cx="40" cy="-30" r="12" fill="${C.ink}"/><path d="M -60 30 Q 0 90 60 30" fill="none" stroke="${C.ink}" stroke-width="8"/>`, 1420, 680, 1, { anim: "grow", at: "satisfied" }) + S.put(txt(0, 0, "LIFE SATISFACTION", 36, C.ink, { font: "bold" }), 1420, 860, 1, { anim: "fade", at: "satisfied" }) },
  { at: "even after accounting for how much they earned", tag: "EVEN AFTER INCOME", tagColor: "olive",
    draw: (S) => S.put(laptop(["BANK", "$$$"], { size: 56 }), 640, 880, 1.1, { anim: "none" }) + S.put(letter(["SALARY", "-"], { w: 220, h: 220, size: 34 }), 1300, 880, 1, { anim: "pop", at: "earned" }) + S.put(txt(0, 0, "set aside", 44, C.ink), 1300, 560, 1, { anim: "fade", at: "earned" }) },
  { at: "Not how much they made", tag: "NOT WHAT THEY MADE...",
    draw: (S) => S.put(letter(["SALARY", "-"], { w: 240, h: 240, size: 36 }), 640, 860, 1.1, { anim: "pop" }) + S.put(cross(1.6), 640, 650, 1, { anim: "grow", at: "made" }) + S.put(piggy({ label: "SAVED" }), 1350, G, 1.4, { anim: "pop", at: "had" }) + S.put(sparkles(5, 220), 1350, 760, 1, { anim: "grow", at: "had" }) },
  { at: "sitting there, ready", tag: "...WHAT THEY HAD, READY", tagColor: "olive",
    draw: (S) => B(S, { pose: "down", face: "content" }, 960, 0.85) + S.put(cushion(), 960, 500, 1, { anim: "pop", at: "ready" }) + S.put(anvil(), 960, 400, 1, { anim: "drop", at: "emergency", id: "an" }) + S.sfx("impact-bass-1", S.t("emergency") + 0.45, 0.3) },
  { at: "Because feeling rich isn't really about having more stuff", tag: "NOT MORE STUFF...",
    draw: (S) => [gift("", C.terra), car({ color: C.red }), phone(["NEW"], { w: 140, h: 240, size: 30 }), couch(), gift("", C.olive)].map((svg, i) => S.put(svg, 520 + (i % 3) * 420, [880, 880, 880, 600, 600][i], [0.7, 0.55, 0.8, 0.5, 0.6][i], { anim: "drop", at: S.t("stuff") - 0.6 + i * 0.1 })).join("") + S.put(cross(3), 960, 620, 1, { anim: "grow", at: "stuff" }) },
  { at: "It's about having room", tag: "...IT'S ABOUT ROOM", tagColor: "olive", push: 1.0,
    draw: (S) => S.put(txt(0, 0, "ROOM", 300, C.olive, { font: "bold", extra: `stroke="${C.ink}" stroke-width="8" paint-order="stroke"` }), 960, 520, 1, { anim: "grow", at: "room" }) + B(S, { pose: "cheer", face: "joy" }, 960, 0.75, { at: 0.3 }) },
  { at: "Room to say no to a job you hate", tag: "ROOM TO SAY NO",
    draw: (S) => S.put(building({ label: "BAD JOB" }), 1350, G, 1, { anim: "pop" }) + B(S, { pose: "stop", face: "determined" }, 640, 1.05) + S.put(bubble("NO, THANKS.", { size: 48, w: 340, h: 110, dx: 80, dy: -120 }), 720, 470, 1, { anim: "grow", at: "no" }) },
  { at: "Room for the car to break down without panic", tag: "ROOM FOR SURPRISES",
    draw: (S) => S.put(car({ color: C.slateDk }), 1250, 880, 1.1, { anim: "pop" }) + S.put(`<g fill="${C.grey}" stroke="${C.ink}" stroke-width="4"><circle cx="0" cy="0" r="40"/><circle cx="40" cy="-40" r="50"/><circle cx="90" cy="-90" r="40"/></g>`, 1450, 700, 1, { anim: "grow", at: "break" }) + B(S, { pose: "down", face: "content", item: phone([], { w: 70, h: 120 }) }, 600, 1.05) + S.put(txt(0, 0, "no panic", 50, C.oliveDk), 640, 440, 1, { anim: "fade", at: "panic" }) },
  { at: "Room to breathe", tag: "ROOM TO BREATHE", tagColor: "olive",
    draw: (S) => S.put(`<path d="M -400 0 Q -300 -60 -200 0 T 0 0 T 200 0 T 400 0" fill="none" stroke="${C.slate}" stroke-width="6"/>`, 960, 360, 1, { anim: "wipe" }) + B(S, { pose: "cheer", face: "content" }, 960, 1.1, { idle: 1.6 }) },
  { at: "Psychologists call it financial security", tag: "FINANCIAL SECURITY", tagColor: "slate",
    draw: (S) => PC(S, { screen: "SECURE", pose: "point", mouth: "smile" }, 640, 1.05) + S.put(`<path d="M 0 -200 L 160 -140 L 160 0 Q 160 120 0 180 Q -160 120 -160 0 L -160 -140 Z" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + check(1.2, C.white), 1300, 560, 1, { anim: "grow", at: "security" }) },
  { at: "Most of us just call it peace of mind", tag: "PEACE OF MIND", tagColor: "olive",
    draw: (S) => S.put(bean({ pose: "shrug", face: "content", legs: false }), 960, 820, 1.1, { anim: "pop", idle: 1.2 }) + S.put(`<ellipse rx="220" ry="40" fill="${C.olive}" opacity="0.5"/>`, 960, 880, 1, { anim: "fade" }) + S.put(sparkles(6, 280), 960, 560, 1, { anim: "grow", at: "peace" }) },
  { at: "And here's the good news", tag: "THE GOOD NEWS", tagColor: "mustard",
    draw: (S) => B(S, { pose: "pointUp", face: "happy" }, 960, 1.1) + S.put(sun(), 1400, 360, 1, { anim: "rise" }) },
  { at: "Room is something you can build", tag: "YOU CAN BUILD ROOM", tagColor: "olive",
    draw: (S) => [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => S.put(brick(), 1100 + (i % 3) * 124 + (Math.floor(i / 3) % 2) * 62, G - 34 - Math.floor(i / 3) * 70, 1, { anim: "drop", at: S.t("build") - 0.2 + i * 0.12, d: 0.45 })).join("") + B(S, { pose: "carry", face: "determined", item: brick() }, 640, 1.05) },
  { at: "Even on the salary you have right now", tag: "ON YOUR SALARY. RIGHT NOW.", tagSize: 52,
    draw: (S) => S.put(letter(["YOUR SALARY", "-", "as is"], { w: 280, h: 280, size: 34 }), 700, 880, 1, { anim: "pop" }) + S.put(check(1.5), 1150, 560, 1, { anim: "grow", at: "now" }) + B(S, { pose: "cheer", face: "joy" }, 1450, 0.9) },

  /* ============ THE COUNTER-TRICKS ============ */
  { at: "So here are four ways to beat the tricks", tag: "4 WAYS TO BEAT THE TRICKS", tagColor: "red",
    draw: (S) => S.put(stage(), 0, 0, 1, { anim: "none" }) + S.put(spotlight(960, 0, 860, 300), 0, 0, 1, { anim: "fade" }) +
      S.put(bean({ pose: "wave", face: "smug", item: wand(), front: at(6, -372, 0.85, topHat()) }), 960, 860, 1.15, { anim: "drop", idle: true }) + S.put(brain({ face: "foiled", pose: "down", noShadow: true }), 1550, 860, 0.8, { anim: "pop", at: "beat" }) + S.put(valance(), 0, 0, 1, { anim: "none" }) + S.sfx("sparkle", 0.4, 0.3, 1.5) },
  { at: "One, write down your enough number", tag: "#1  WRITE YOUR \"ENOUGH\" NUMBER", tagColor: "mustard", tagSize: 50,
    draw: (S) => S.put(`<rect x="-260" y="-330" width="520" height="660" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + [0, 1, 2, 3, 4, 5].map((i) => `<path d="M -220 ${-210 + i * 80} L 220 ${-210 + i * 80}" stroke="${C.rule}" stroke-width="3"/>`).join("") + txt(0, -260, "MY ENOUGH NUMBER", 40, C.ink, { font: "bold" }), 760, 560, 1, { anim: "drop" }) +
      S.put(`<text x="0" y="0" font-family="Patrick Hand" font-size="96" fill="${C.terra}" text-anchor="middle">$______</text>`, 760, 520, 1, { anim: "wipe", at: "enough" }) + B(S, { pose: "carry", face: "determined", item: `<path d="M 0 0 L -60 -120" stroke="${C.ink}" stroke-width="16" stroke-linecap="round"/>` }, 1350, 1) },
  { at: "A real number for the life you actually want", tag: "A REAL NUMBER",
    draw: (S) => S.put(`<rect x="-260" y="-330" width="520" height="660" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -260, "MY ENOUGH NUMBER", 40, C.ink, { font: "bold" }), 760, 560, 1, { anim: "none" }) +
      [["HOME", "$"], ["FOOD", "$"], ["FUN", "$"], ["SAVING", "$"]].map(([a], i) => S.put(`<text x="-200" y="0" font-family="Patrick Hand" font-size="56" fill="${C.ink}">${a} .......... $</text>`, 760, 400 + i * 80, 1, { anim: "fade", at: 0.15 + i * 0.25 })).join("") + S.put(house({ color: C.olive }), 1400, G, 0.8, { anim: "pop", at: "life" }) },
  { at: "Not a vague feeling", tag: "NOT A VAGUE FEELING",
    draw: (S) => S.put(`<g fill="${C.grey}" opacity="0.7"><circle cx="-120" cy="0" r="110"/><circle cx="20" cy="-40" r="140"/><circle cx="160" cy="0" r="110"/></g>` + txt(20, 10, "\"more...?\"", 64, C.ink), 960, 560, 1, { anim: "fade" }) + S.put(cross(2.4), 960, 560, 1, { anim: "grow", at: "feeling" }) },
  { at: "When the line is written down", tag: "WRITTEN DOWN = IT CAN'T MOVE", tagColor: "olive", tagSize: 50,
    draw: (S) => S.put(finishLine("ENOUGH", { color: C.olive, ink: C.white }), 1150, G, 1, { anim: "drop" }) + B(S, { pose: "cheer", face: "determined", item: `<path d="M 0 0 L 0 -90" stroke="${C.woodDk}" stroke-width="16" stroke-linecap="round"/><rect x="-40" y="-130" width="80" height="44" rx="6" fill="${C.grey}" stroke="${C.ink}" stroke-width="5"/>` }, 600, 1.0, { id: "ham" }) +
      S.put(finishLine("ENOUGH", { color: C.olive, ink: C.white, nails: true }), 1150, G, 1, { anim: "fade", at: "quietly" }) + S.js(`tl.to("#${S.id("ham")}-i", { rotation: 14, transformOrigin: "50% 100%", duration: 0.12, yoyo: true, repeat: 5 }, ${S.t("written")});`) +
      S.sfx("impact-bass-1", S.t("move"), 0.3) + S.put(stampSvg("STAYS PUT", C.oliveDk, 56, -8), 1150, 400, 1, { anim: "slam", at: "move" }) },
  { at: "Two, build your room first", tag: "#2  BUILD YOUR ROOM FIRST", tagColor: "mustard", tagSize: 52,
    draw: (S) => S.put(cushion(), 960, G - 40, 1.2, { anim: "pop" }) + S.put(bean({ pose: "cheer", face: "happy" }), 960, G - 120, 0.85, { anim: "drop", at: "room", idle: true }) },
  { at: "Start a cash buffer", tag: "START A CASH BUFFER",
    draw: (S) => S.put(jar("1 MONTH", 0.6, { size: 24 }), 960, G, 1.4, { anim: "pop", at: "month" }) + B(S, { pose: "push", face: "smile", item: coin(26) }, 520, 1) },
  { at: "Then three", tag: "THEN 3 MONTHS",
    draw: (S) => [0, 1, 2].map((i) => S.put(jar(`MONTH ${i + 1}`, 0.75, { size: 22 }), 620 + i * 340, G, 1.15, { anim: "pop", at: 0.05 + i * 0.15 })).join("") },
  { at: "watch how different it feels", tag: "FEEL THE DIFFERENCE", tagColor: "olive",
    draw: (S) => [0, 1, 2].map((i) => S.put(jar("", 0.75), 1150 + i * 200, G, 0.8, { anim: "none" })).join("") + B(S, { pose: "heart", face: "content" }, 640, 1.1) + S.put(sparkles(5, 200), 640, 600, 1, { anim: "grow", at: "feels" }) },
  { at: "Three, when you spend", tag: "#3  BUY EXPERIENCES & TIME", tagColor: "mustard", tagSize: 52,
    draw: (S) => [[`<rect x="-150" y="-60" width="300" height="120" rx="10" fill="${C.terra}" stroke="${C.ink}" stroke-width="5"/><path d="M 60 -60 L 60 60" stroke="${C.white}" stroke-width="4" stroke-dasharray="8 8"/>` + txt(-40, 4, "CONCERT", 36, C.white, { font: "bold" }), "experiences"], [`<rect x="-120" y="-140" width="240" height="180" rx="16" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="6"/><path d="M -50 -140 L -50 -170 L 50 -170 L 50 -140" fill="none" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -50, "TRIP", 50, C.white, { font: "bold" }), "experiences"], [clock(), "time"]].map(([svg, w], i) =>
      S.put(svg, 560 + i * 420, 600, 1, { anim: "pop", at: S.t(w) + i * 0.15 })).join("") },
  { at: "Not just things", tag: "NOT JUST THINGS",
    draw: (S) => S.put(`<path d="M -120 0 L -140 -260 L 140 -260 L 120 0 Z" fill="${C.paper2}" stroke="${C.ink}" stroke-width="6"/><path d="M -60 -260 Q 0 -360 60 -260" fill="none" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -120, "STUFF", 50, C.ink, { font: "bold" }), 960, G, 1.1, { anim: "pop" }) + S.put(cross(1.6), 960, 640, 1, { anim: "grow", at: "things" }) },
  { at: "Research by psychologist Thomas", tag: "THOMAS GILOVICH, CORNELL", tagColor: "slate",
    draw: (S) => PC(S, { screen: "MEMORY", pose: "point", mouth: "smile" }, 560, 1.0) +
      [0, 1, 2].map((i) => S.put(`<rect x="-120" y="-140" width="240" height="280" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><rect x="-100" y="-120" width="200" height="180" fill="${[C.slate, C.olive, C.terra][i]}"/>` + sun().replace(/<path[^>]*>/g, "").slice(0, 0), 1100 + i * 230, 560 - (i % 2) * 40, 1, { anim: "drop", rot: (i - 1) * 8, at: S.t("experiences") + i * 0.15 })).join("") +
      "" },
  { at: "because we don't adapt to memories", tag: "MEMORIES DON'T GET OLD", tagColor: "olive",
    draw: (S) => [0, 1, 2].map((i) => S.put(`<rect x="-120" y="-140" width="240" height="280" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><rect x="-100" y="-120" width="200" height="180" fill="${[C.slate, C.olive, C.terra][i]}"/>` + sparkles(3, 120), 520 + i * 230, 520 - (i % 2) * 40, 0.9, { anim: "pop", rot: (i - 1) * 8, at: S.t("memories") + i * 0.12 })).join("") +
      [0, 1].map((i) => S.put(`<rect x="-110" y="-160" width="220" height="160" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -80, "STUFF", 40, C.ink, { font: "bold" }) + `<path d="M -100 -170 q 30 -20 60 0 M 20 -170 q 30 -20 60 0" fill="none" stroke="${C.grey}" stroke-width="3"/>`, 1300 + i * 260, G, 0.9, { anim: "fade", at: "stuff" })).join("") + S.put(txt(0, 0, "dusty", 44, C.grey), 1430, 640, 1, { anim: "fade", at: "stuff" }) },
  { at: "And paying to get your time back", tag: "BUY BACK YOUR TIME", tagColor: "olive",
    draw: (S) => S.put(clock({ handId: S.id("h") }), 1300, 520, 1.3, { anim: "grow" }) + S.js(`tl.fromTo("#${S.id("h")}", { rotation: 0, svgOrigin: "0 0" }, { rotation: -360, duration: 1.6, ease: "power1.inOut" }, 0.3);`) +
      S.put(couch(), 640, G, 0.9, { anim: "none" }) + S.put(bean({ pose: "shrug", face: "content", legs: false, noShadow: true }), 640, 900, 0.7, { anim: "pop" }) + S.put(txt(0, 0, "skipped: laundry", 40, C.ink), 640, 500, 1, { anim: "fade", at: "chore" }) },
  { at: "Four, unfollow what makes you feel poor", tag: "#4  UNFOLLOW WHAT MAKES YOU FEEL POOR", tagColor: "mustard", tagSize: 46,
    draw: (S) => S.put(phone(["", "@flexlife", "", ""], { w: 340, h: 600, size: 40, head: C.slateDk }), 960, 900, 1, { anim: "rise" }) +
      S.put(`<rect x="-120" y="-36" width="240" height="72" rx="36" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, "UNFOLLOW", 36, C.white, { font: "bold" }), 960, 640, 1, { anim: "grow", at: "unfollow" }) + S.sfx("pop", S.t("unfollow") + 0.1, 0.3, 0.5) },
  { at: "If an account makes you want things", tag: "WANT THINGS YOU DIDN'T WANT?",
    draw: (S) => BR(S, { face: "love", pose: "reach" }, 620, 1.05) + S.put(post("car", { id: 5, who: C.slate }), 1350, 560, 1, { anim: "pop" }) + S.put(clock(), 1350, 900, 0.45, { anim: "grow", at: "minutes" }) + S.put(txt(0, 0, "5 min ago: didn't care", 34, C.ink), 1350, 1010, 1, { anim: "fade", at: "minutes" }) },
  { at: "that's not inspiration", tag: "THAT'S NOT INSPIRATION...",
    draw: (S) => S.put(post("car", { id: 6, who: C.slate }), 960, 560, 1.15, { anim: "none" }) + S.put(stampSvg("AD", C.red, 140, -12), 960, 560, 1, { anim: "slam", at: "ad" }) + S.sfx("impact-bass-1", S.t("ad") + 0.18, 0.35) },

  /* ============ THE TRUTH ============ */
  { at: "So here's the truth", tag: "THE TRUTH",
    draw: (S) => S.put(spotlight(960, 0, 940, 280), 0, 0, 1, { anim: "fade" }) + B(S, { pose: "down", face: "content" }, 960, 1.15) },
  { at: "You'll probably never feel rich by earning more", tag: "EARNING MORE WON'T DO IT",
    draw: (S) => S.put(treadmill(), 960, G - 30, 1.2, { anim: "none" }) + B(S, { pose: "cheer", face: "worried" }, 920, 1, { idle: 0.3 }) + S.put(letter(["RAISE", "+$$$"], { w: 180, h: 180, size: 30 }), 1400, 640, 1, { anim: "drop", at: "earning" }) },
  { at: "Your brain will move the line every single time", tag: "IT WILL MOVE THE LINE", tagColor: "red",
    draw: (S) => S.put(finishLine("RICH"), 1100, G, 0.9, { anim: "pop", id: "fl" }) + BR(S, { face: "sly", pose: "hold" }, 1450, 0.85, { at: "move" }) +
      S.js(`tl.to("#${S.id("fl")}-i", { x: 300, duration: 0.5, ease: "power2.in" }, ${S.t("line")}); tl.to("#${S.id("fl")}-i", { x: 700, duration: 0.5, ease: "power2.in" }, ${S.t("single")});`) + B(S, { pose: "shrug", face: "sad" }, 500, 0.95) },
  { at: "But you can feel rich by needing less", tag: "NEED LESS TO FEEL SAFE", tagColor: "olive",
    draw: (S) => S.put(finishLine("ENOUGH", { color: C.olive, ink: C.white, nails: true }), 1250, G, 0.9, { anim: "pop" }) + S.put(cushion(), 650, G - 30, 0.9, { anim: "pop", at: "room" }) + S.put(bean({ pose: "cheer", face: "joy" }), 650, G - 95, 0.8, { anim: "drop", at: "safe", idle: true }) },
  { at: "That's not a bigger salary", tag: "NOT A BIGGER SALARY",
    draw: (S) => S.put(letter(["SALARY", "-", "$$$$$"], { w: 280, h: 300, size: 40 }), 960, 860, 1.1, { anim: "pop" }) + S.put(cross(2), 960, 650, 1, { anim: "grow", at: "salary" }) },
  { at: "That's a bigger gap", tag: "A BIGGER GAP", tagColor: "olive", push: 1.0,
    draw: (S) => S.put(`<rect x="-160" y="-560" width="320" height="560" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "WHAT YOU EARN", 36, C.ink, { font: "bold" }), 760, 900, 1, { anim: "rise" }) +
      S.put(`<rect x="-160" y="-330" width="320" height="330" fill="${C.terra}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 40, "WHAT YOU NEED", 36, C.ink, { font: "bold" }), 1160, 900, 1, { anim: "rise", at: 0.2 }) +
      S.put(`<path d="M 0 0 L 0 -230" stroke="${C.gold}" stroke-width="12"/><path d="M -30 -200 L 0 -230 L 30 -200 M -30 -30 L 0 0 L 30 -30" fill="none" stroke="${C.gold}" stroke-width="12"/>` + txt(220, -115, "THE GAP", 64, C.oliveDk, { font: "bold" }), 1160, 570, 1, { anim: "grow", at: "gap" }) + S.sfx("chime", S.t("gap"), 0.3) },
  { at: "And if you want to see how that gap", tag: "THE GAP → REAL WEALTH", tagColor: "olive",
    draw: (S) => [2, 4, 7, 11, 16, 22].map((n, i) => S.put(coinStack(n), 560 + i * 160, G, 0.9, { anim: "rise", at: S.t("turns") - 0.4 + i * 0.15 })).join("") + B(S, { pose: "cheer", face: "joy" }, 400, 0.8) + S.put(arrow(300, C.olive, 70), 760, 420, 1, { rot: -18, anim: "wipe", at: "wealth" }) },
  { at: "the boring automatic way", push: 1.0,
    draw: (S) => S.put(`<rect x="-440" y="-250" width="880" height="500" rx="18" fill="${C.olive}" stroke="${C.ink}" stroke-width="8"/>` +
      [3, 6, 10].map((n, i) => at(-80 + i * 110, 210, 0.75, coinStack(n))).join("") + at(-280, 230, 0.6, bean({ pose: "cheer", face: "joy", noShadow: true })) +
      `<rect x="-420" y="-230" width="840" height="120" fill="${C.ink}" opacity="0.35"/>` + txt(0, -170, "THE BORING WAY", 56, C.white, { font: "bold" }) + txt(0, -100, "TO GET RICH", 70, C.gold, { font: "bold" }) +
      `<circle r="70" fill="${C.red}" stroke="${C.ink}" stroke-width="6" cx="300" cy="80"/><path d="M 280 50 L 334 80 L 280 110 Z" fill="${C.white}"/>`, 960, 500, 1, { anim: "grow", at: 0.2 }) +
      S.put(at(-70, 0, 0.32, bean({ face: "happy", noShadow: true })) + at(10, 0, 0.26, brain({ face: "grin", noShadow: true })) + `<text x="70" y="-60" font-family="Archivo Black" font-size="64" fill="${C.ink}" dominant-baseline="middle">PESA<tspan fill="${C.terra}">BRAIN</tspan></text>`, 760, 960, 1, { anim: "rise", at: "video" }) },
];

function magicianOpts(o = {}) { return { face: "grin", pose: "point", hat: at(6, -290, 0.95, topHat()), item: wand(), ...o }; }
function sun() { return `<circle r="70" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return `<path d="M ${Math.cos(a) * 90} ${Math.sin(a) * 90} L ${Math.cos(a) * 125} ${Math.sin(a) * 125}" stroke="${C.mustard}" stroke-width="12" stroke-linecap="round"/>`; }).join(""); }
