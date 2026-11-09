// "The $5 Coffee Myth Is Wrong" — one beat per idea, each starting on the words in `at`.
// draw(S) returns SVG; S.put(svg, x, y, scale, {at, anim, rot, idle}) animates a group in,
// `at` can be a phrase spoken inside the beat so things land exactly on the word.
import {
  C, at, txt, bean, brain, calc, coffee, priceTag, coin, coinStack, bill, flyingBill, moneyBag, piggy, wallet, card,
  phone, envelope, letter, calendar, house, car, cart, bucket, jar, magnifier, scissors, trophy, star, heart, bulb, clock,
  bubble, cloudThought, arrow, seesaw, donut, gauge, building, gift, laptop, hourglass, snail, treadmill, conveyor, appIcon,
  chartLine, axes, counter, magicHat, storm, sun, check, cross, stampSvg, ring, ghost, clipboard, cards3, speedLines, sparkles, confetti, wing,
} from "./kit.mjs";

const G = 940; // the ground rule
const B = (S, o, x, s = 1, opt = {}) => S.put(bean(o), x, G, s, { idle: true, ...opt });
const BR = (S, o, x, s = 1, opt = {}) => S.put(brain(o), x, G, s, { idle: true, ...opt });
const PC = (S, o, x, s = 1, opt = {}) => S.put(calc(o), x, G, s, { idle: true, ...opt });
const giantFinger = `<path d="M 0 -40 L -260 -40 Q -300 -40 -300 -10 Q -300 20 -260 20 L 0 20 Z" fill="${C.bean}" stroke="${C.ink}" stroke-width="5"/><path d="M 0 -60 L 300 -60 L 300 60 L 0 60 Q -40 50 -40 0 Q -40 -50 0 -60 Z" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="5"/>`;
const cupRow = (n, gap = 70, s = 0.4) => Array.from({ length: n }, (_, i) => at(i * gap, 0, s, coffee({ steam: false }))).join("");

export const BEATS = [
  /* ================= PART 1 ================= */
  { at: "Somebody once told you", tag: "THE COFFEE MYTH",
    draw: (S) => B(S, { pose: "sip", face: "content", item: coffee(), itemScale: 0.55 }, 820, 1.15) +
      S.put(giantFinger, 1700, 560, 1, { anim: "slideR", at: "told" }) +
      S.put(bubble("THAT'S WHY|YOU'RE BROKE!", { size: 50, w: 420, h: 150, dx: 0, dy: -150 }), 1500, 480, 1, { anim: "grow", at: "why" }) },
  { at: "$5 a day",
    draw: (S) => B(S, { pose: "sip", face: "smile", item: coffee(), itemScale: 0.55 }, 600, 1.1) +
      S.receipt({ x: 1080, y: 230, title: "DAILY LATTE", lines: [["LATTE", "$5.00"], ["x 365 DAYS", ""]], total: ["/YEAR", "$1,825"], count: [0, 1825], at: 0.1, printDur: 0.7 }) },
  { at: "Invested instead", tag: "INVESTED INSTEAD", tagColor: "olive",
    draw: (S) => PC(S, { screen: "7% x 30", pose: "point", mouth: "smile" }, 700, 1.05, { anim: "slideL" }) +
      [3, 5, 7, 10, 14].map((n, i) => S.put(coinStack(n), 1080 + i * 150, G, 1, { anim: "rise", at: S.t("30", -0.6) + i * 0.15 })).join("") },
  { at: "that's about $172", push: 1.06,
    draw: (S) => S.put(coffee({ label: "" }), 520, 860, 2.2, { anim: "pop" }) +
      S.put(priceTag("$172,000", { size: 54, rot: -14, color: C.gold }), 640, 400, 1, { anim: "drop", at: S.t("172", 0.1) }) +
      S.put(S.countText(0, 0, 0, 172000, { at: S.t("172"), size: 170, color: C.terra, stroke: true }), 1300, 600, 1, { anim: "grow", at: S.t("172") - 0.05 }) +
      S.put(txt(0, 0, "IN 30 YEARS", 56, C.ink, { font: "bold" }), 1300, 730, 1, { at: S.t("172") + 0.6 }) },
  { at: "And here's the strange part", tag: "THE STRANGE PART",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, 960, 1.1) +
      S.put(txt(0, 0, "?", 220, C.mustard, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` }), 1260, 520, 1, { anim: "grow", at: "strange" }) +
      S.put(txt(0, 0, "?", 150, C.terra, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` }), 680, 470, 1, { anim: "grow", at: "part" }) },
  { at: "That math is correct", tag: "THE MATH IS... CORRECT",
    draw: (S) => PC(S, { screen: "$172,000", pose: "up", mouth: "smile" }, 760, 1.1) +
      S.put(check(2.4), 1300, 560, 1, { anim: "grow", at: "correct" }) },
  { at: "but it's also one of the most misleading",
    draw: (S) => S.put(`<rect x="-360" y="-230" width="720" height="460" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -140, "COFFEE = BROKE", 64, C.ink, { font: "bold" }) + txt(0, -50, "$172,000 LOST!", 70, C.terra, { font: "bold" }), 960, 540, 1, { anim: "pop" }) +
      S.put(stampSvg("MISLEADING", C.red, 100, -8), 980, 650, 1, { anim: "slam", at: "misleading" }) + S.shake(S.t("misleading") + 0.22) + S.sfx("impact-bass-1", S.t("misleading") + 0.18, 0.4) },
  { at: "and believing it may be costing you", tag: "COSTING YOU MORE", tagColor: "terra",
    draw: (S) => B(S, { pose: "hold", face: "worried", item: coffee({ steam: false }), itemScale: 0.45 }, 620, 1.05) +
      S.put(wallet({ open: true }), 1100, 820, 1.3, { at: 0.3 }) +
      [[1300, 600, -10], [1480, 470, 8], [1650, 330, -6], [1420, 260, 12]].map(([x, y, r], i) => S.put(flyingBill(), x, y, 0.8, { anim: "rise", rot: r, at: S.t("costing") + i * 0.25 })).join("") },
  { at: "In the next few minutes", tag: "THE REAL NUMBERS",
    draw: (S) => [0, 1, 2].map((i) => S.put(envelope(`#${i + 1}`, { seal: true, size: 70, w: 320, h: 210 }), 600 + i * 380, 760, 1, { anim: "drop", at: 0.3 + i * 0.25 })).join("") +
      S.put(txt(0, 0, "?", 90, C.ink, { font: "bold" }), 1020, 420, 1, { anim: "grow", at: "numbers" }) },
  { at: "decide whether you build wealth", tag: "WHAT BUILDS WEALTH", tagColor: "olive",
    draw: (S) => B(S, { pose: "cheer", face: "happy" }, 620, 1) + [2, 4, 7, 11].map((n, i) => S.put(coinStack(n), 1050 + i * 170, G, 1, { anim: "rise", at: S.t("build") - 0.3 + i * 0.15 })).join("") },
  { at: "They're much bigger than a latte", tag: "BIGGER THAN A LATTE",
    draw: (S) => S.put(coffee(), 520, G, 0.5, { anim: "pop" }) + S.put(txt(0, 0, "you're here", 36), 520, 760, 1, { anim: "fade" }) +
      S.put(moneyBag("$$$", { size: 110 }), 1250, G, 3.0, { anim: "rise", at: "bigger" }) },
  { at: "and one of them is probably sitting on your phone", tag: "IT'S ON YOUR PHONE", tagColor: "mustard",
    draw: (S) => S.put(phone(["", "1 NEW", "NUMBER"], { glow: true, size: 32, head: C.slateDk }), 1000, 900, 1.5, { anim: "rise" }) +
      S.put(`<circle r="34" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/>` + txt(0, 3, "1", 40, C.white, { font: "bold" }), 1140, 330, 1, { anim: "grow", at: "phone" }) },
  { at: "and most people never look at it", tag: "NOBODY LOOKS",
    draw: (S) => S.put(phone(["", "1 NEW"], { size: 32, head: C.slateDk }), 1350, 900, 1.0, { anim: "pop" }) +
      B(S, { pose: "down", face: "content", look: -10 }, 700, 1.05, { anim: "slideL", d: 1.2 }) +
      S.put(txt(0, 0, "♪", 90, C.ink), 560, 450, 1, { anim: "grow", at: "never" }) },
  { at: "But first, let's talk", tag: "BUT FIRST...",
    draw: (S) => B(S, { pose: "pointUp", face: "smile", look: 10 }, 760, 1.1) +
      S.put(brain({ face: "sly", pose: "down", noShadow: true }), 1200, G, 0.9, { anim: "rise", at: "talk" }) },
  { at: "why your brain fell for", tag: "WHY YOU FELL FOR IT",
    draw: (S) => BR(S, { face: "sly", pose: "hold", item: `<path d="M 0 0 L 240 -260" stroke="${C.woodDk}" stroke-width="10" stroke-linecap="round"/><path d="M 240 -260 Q 300 -200 300 -60" fill="none" stroke="${C.ink}" stroke-width="3"/>` + at(300, 70, 0.5, coffee()) }, 620, 1.05) +
      B(S, { pose: "pointL", face: "happy", look: -10 }, 1450, 0.95, { at: "fell" }) },
  { at: "Meet your brain", tag: "MEET IMPULSE (YOUR BRAIN)", tagColor: "red", tagSize: 54,
    draw: (S) => BR(S, { face: "grin", pose: "cheer" }, 960, 1.4, { anim: "drop" }) + S.put(sparkles(7, 300), 960, 600, 1, { anim: "grow", at: 0.6 }) + S.sfx("chime", 0.5, 0.25) },
  { at: "It loves the coffee story", tag: "IT LOVES THIS STORY",
    draw: (S) => BR(S, { face: "love", pose: "hug", item: coffee(), itemScale: 0.8 }, 960, 1.3) +
      [[700, 420], [1240, 380], [1300, 560], [640, 600]].map(([x, y], i) => S.put(heart(1.4), x, y, 1, { anim: "grow", at: 0.4 + i * 0.15 })).join("") },
  { at: "for three reasons", tag: "3 REASONS",
    draw: (S) => BR(S, { face: "grin", pose: "point" }, 620, 1.1) +
      [1, 2, 3].map((n, i) => S.put(priceTag(`#${n}`, { size: 56, rot: 0, w: 170, string: false }), 1050 + i * 230, 520, 1, { anim: "drop", at: "three" === "three" ? S.t("reasons") + i * 0.18 : 0 })).join("") },
  { at: "One, you can see it", tag: "#1  YOU CAN SEE IT", tagColor: "mustard",
    draw: (S) => S.put(`<path d="M -300 0 L 0 -700 L 300 0 Z" fill="${C.gold}" opacity="0.28"/>`, 960, G, 1, { anim: "fade" }) +
      S.put(coffee(), 960, G, 1.6, { anim: "pop", at: 0.15 }) + B(S, { pose: "point", face: "smile", look: 10 }, 560, 1) },
  { at: "You buy coffee every day",
    draw: (S) => S.put(counter(900), 1180, G, 1) + B(S, { pose: "push", face: "smile", item: coin(26) }, 600, 1.05) +
      S.put(coffee(), 1250, 720, 0.8, { anim: "pop", at: "every" }) +
      S.put(calendar(14, 7, { title: "EVERY DAY", cw: 54, head: C.olive, mark: () => coffee({ steam: false }) }), 1300, 430, 0.9, { anim: "pop", at: "day" }) },
  { at: "A car payment leaves your account", tag: "AUTOPAY", tagColor: "slate",
    draw: (S) => S.put(laptop(["BANK", "AUTOPAY: CAR", "-$700"], { size: 42 }), 640, 860, 1.2, { anim: "pop" }) +
      S.put(car({ color: C.slateDk }), 1450, 860, 1.0, { anim: "slideR", at: "car" }) +
      [0, 1, 2].map((i) => S.put(bill(), 1000 + i * 120, 560 - i * 30, 0.6, { anim: "slideR", at: S.t("leaves") + i * 0.2 })).join("") },
  { at: "and you barely notice", tag: "BARELY NOTICED",
    draw: (S) => B(S, { pose: "down", face: "sleep" }, 760, 1.1) +
      S.put(txt(0, 0, "z", 70, C.ink, { font: "bold" }) + txt(40, -60, "z", 56, C.ink, { font: "bold" }) + txt(80, -110, "z", 44, C.ink, { font: "bold" }), 880, 470, 1, { anim: "fade" }) +
      S.put(laptop(["-$700", "-$700", "-$700"], { size: 44 }), 1400, 880, 0.9, { at: "notice" }) },
  { at: "Two, skipping it feels like progress", tag: "#2  FEELS LIKE PROGRESS", tagColor: "mustard",
    draw: (S) => B(S, { pose: "stop", face: "determined" }, 640, 1.05) + S.put(coffee({ steam: false }), 900, G, 0.6) +
      S.put(`<rect x="0" y="-40" width="600" height="80" rx="40" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><rect id="${S.id("bar")}" x="8" y="-32" width="584" height="64" rx="32" fill="${C.olive}"/>` + txt(300, 4, "PROGRESS", 40, C.ink, { font: "bold" }), 1080, 520, 1, { anim: "pop", at: "feels" }) +
      S.js(`tl.fromTo("#${S.id("bar")}", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 0.85, duration: 1.0, ease: "power2.out" }, ${S.t("progress")});`) },
  { at: "You say no to a latte",
    draw: (S) => B(S, { pose: "stop", face: "smug" }, 640, 1.05) + S.put(cross(1.2), 960, 650, 1, { anim: "grow", at: "no" }) + S.put(coffee({ steam: false }), 960, G, 0.7) +
      BR(S, { face: "happy", pose: "cheer", item: star(46) }, 1440, 0.95, { at: "small" }) +
      S.put(bubble("I'M BEING|RESPONSIBLE!", { size: 40, w: 330, h: 130, dx: 140, dy: -130 }), 980, 460, 1, { anim: "grow", at: "Im" }) },
  { at: "Your brain counts that as a win", tag: "A 'WIN'", tagColor: "olive",
    draw: (S) => BR(S, { face: "happy", pose: "cheer", item: trophy("WIN", { size: 36 }), itemScale: 0.7 }, 960, 1.15) + S.put(confetti(30, 1300, 600), 960, 700, 1, { anim: "drop", at: "win" }) + S.sfx("chime", S.t("win"), 0.2) },
  { at: "even if nothing else changes", tag: "NOTHING CHANGES",
    draw: (S) => S.put(laptop(["SAVINGS", "$0", "(still)"], { size: 54 }), 960, 880, 1.4, { anim: "pop" }) + B(S, { pose: "shrug", face: "neutral" }, 1500, 0.9, { at: "nothing" }) },
  { at: "Three, it's easy", tag: "#3  IT'S EASY", tagColor: "mustard",
    draw: (S) => S.put(`<path d="M -300 -260 Q 0 -120 300 -260" fill="none" stroke="${C.wood}" stroke-width="22"/><path d="M -300 -260 L -300 0 M 300 -260 L 300 0" stroke="${C.woodDk}" stroke-width="18"/>`, 960, G, 1) +
      S.put(brain({ face: "meh", pose: "down", noShadow: true }), 960, 760, 0.9, { rot: -78, anim: "drop" }) },
  { at: "Cutting coffee asks nothing hard", tag: "CUTTING COFFEE = EASY",
    draw: (S) => S.put(priceTag("$5", { size: 60, rot: 0, w: 220, string: false }), 860, 540, 1.2, { anim: "pop" }) +
      S.put(scissors(), 1200, 540, 1.3, { anim: "slideR", at: "cutting" }) + B(S, { pose: "shrug", face: "smile" }, 500, 0.9) },
  { at: "No awkward talks", tag: "THE HARD STUFF",
    draw: (S) => [["talks", at(0, 0, 1.5, bubble("WE NEED|TO TALK", { size: 34, w: 240, h: 110, dy: -80 }))], ["moving", house({ color: C.olive })], ["selling", car({ label: "SOLD" })]].map(([w, svg], i) =>
      S.put(svg, 520 + i * 470, 820, i === 1 ? 0.9 : 0.85, { anim: "pop", at: w }) + S.put(cross(1.6), 520 + i * 470, 680, 1, { anim: "grow", at: S.t(w) + 0.35 })).join("") },
  { at: "Your brain always picks the easy fight", tag: "THE EASY FIGHT", tagColor: "red",
    draw: (S) => S.put(ring(), 960, G, 0.9) +
      BR(S, { face: "grin", pose: "cheer", item: `<circle r="34" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/>` }, 760, 0.95) +
      S.put(coffee({ steam: false }), 1150, G, 0.7, { at: "easy" }) + S.put(car({ color: C.slateDk }), 1650, 700, 0.6, { anim: "fade", at: "fight" }) + S.put(house(), 260, 700, 0.6, { anim: "fade", at: "fight" }) },
  { at: "Psychologists call part of this mental accounting", tag: "MENTAL ACCOUNTING", tagColor: "slate",
    draw: (S) => PC(S, { screen: "MENTAL", pose: "point", mouth: "o" }, 640, 1.05) +
      S.put(clipboard([["COFFEE", "BAD"], ["CAR", "??"], ["RENT", "??"]]), 1250, 880, 1.1, { anim: "pop", at: "mental" }) },
  { at: "We sort money into separate mental buckets",
    draw: (S) => ["COFFEE", "RENT", "CAR", "FUN"].map((l, i) => S.put(bucket(l, { color: [C.terra, C.slate, C.slateDk, C.olive][i] }), 460 + i * 340, G, 1, { anim: "pop", at: 0.2 + i * 0.18 }) +
      S.put(coin(30), 460 + i * 340, 520, 1, { anim: "drop", at: S.t("buckets") + i * 0.12 })).join("") },
  { at: "and judge each one on its own", tag: "JUDGED ONE BY ONE",
    draw: (S) => ["COFFEE", "RENT", "CAR", "FUN"].map((l, i) => S.put(bucket(l, { color: [C.terra, C.slate, C.slateDk, C.olive][i] }), 460 + i * 340, G, 1, { anim: "none" })).join("") +
      S.put(magnifier(), 460, 640, 1.1, { anim: "pop" }) + S.js(`tl.to("#${S.id("e4")}", { x: 1020, duration: ${Math.max(0.8, S.dur - 0.8).toFixed(2)}, ease: "power1.inOut" }, 0.4);`) },
  { at: "The coffee bucket looks guilty", tag: "GUILTY?", tagColor: "red",
    draw: (S) => S.put(`<rect x="-500" y="-500" width="1000" height="500" fill="${C.paper2}"/>` + [0, 1, 2, 3, 4].map((i) => `<path d="M -500 ${-100 * i} L 500 ${-100 * i}" stroke="${C.grey}" stroke-width="4"/>` + txt(-470, -100 * i - 20, `${i + 4} FT`, 26, C.ink, { anchor: "start" })).join(""), 960, G, 1, { anim: "fade" }) +
      S.put(bucket("COFFEE", { color: C.terra }), 960, G, 1.4, { anim: "pop" }) + S.put(`<path d="M -150 -260 Q -160 -230 -150 -224 Q -140 -230 -150 -260 Z M 160 -230 Q 152 -206 160 -200 Q 168 -206 160 -230 Z" fill="${C.slate}" stroke="${C.ink}" stroke-width="3"/>`, 960, G, 1.4, { anim: "grow", at: "guilty" }) },
  { at: "Meanwhile, the bucket that's actually draining you", tag: "THE REAL LEAK", tagColor: "terra",
    draw: (S) => S.put(bucket("BIG BILLS", { color: C.slateDk, leak: true, fill: true, size: 28 }), 900, 820, 1.6, { anim: "pop" }) + S.put(bucket("COFFEE", { color: C.terra }), 1560, G, 0.5, { anim: "pop", at: "draining" }) },
  { at: "never gets checked", tag: "NEVER CHECKED",
    draw: (S) => S.put(`<rect x="-120" y="-120" width="240" height="240" rx="20" fill="${C.white}" stroke="${C.ink}" stroke-width="8"/>` + txt(0, 190, "BIG BILLS: CHECKED?", 48, C.ink, { font: "bold" }), 1250, 480, 1, { anim: "pop" }) +
      B(S, { pose: "down", face: "content", look: -10 }, 620, 1, { anim: "slideL", d: 1.0 }) },
  { at: "So, let's check it", tag: "LET'S CHECK IT", tagColor: "olive",
    draw: (S) => B(S, { pose: "carry", face: "determined", item: magnifier(), itemScale: 0.8 }, 780, 1.1) +
      PC(S, { screen: "OK", pose: "up", mouth: "smile" }, 1350, 0.95, { at: "check" }) + S.put(`<rect x="-120" y="-120" width="240" height="240" rx="20" fill="${C.white}" stroke="${C.ink}" stroke-width="8"/>` + check(2), 1700, 520, 0.6, { anim: "grow", at: "check" }) },
  { at: "According to the US Bureau", tag: "THE DATA",
    draw: (S) => S.put(clipboard([["U.S. BUREAU OF", ""], ["LABOR STATS", ""], ["CONSUMER", ""], ["SPENDING", ""], ["SURVEY", ""]]), 960, 960, 1.2, { anim: "rise" }) +
      PC(S, { screen: "BLS", pose: "pointL", mouth: "smile" }, 1550, 0.9, { at: "Labor" }) },
  { at: "the average American household spends", tag: "HOUSING ≈ 1/3",
    draw: (S) => S.put(donut([{ v: 0.33, color: C.terra, id: S.id("d1") }]), 820, 580, 1, { anim: "grow" }) +
      S.put(house({ color: C.terra }), 820, 640, 0.45, { anim: "pop", at: "third" }) +
      S.js(`tl.fromTo("#${S.id("d1")}", { attr: { "stroke-dasharray": "0 2000" } }, { attr: { "stroke-dasharray": "430 2000" }, duration: 0.8, ease: "power2.out" }, ${S.t("third")});`) +
      S.put(txt(0, 0, "≈ 1/3", 110, C.terra, { font: "bold" }), 1420, 560, 1, { anim: "grow", at: "third" }) },
  { at: "Transportation takes about", tag: "TRANSPORT ≈ 1/6",
    draw: (S) => S.put(donut([{ v: 0.33, color: C.terra }, { v: 0.167, color: C.slateDk, id: S.id("d2") }]), 820, 580, 1, { anim: "none" }) +
      S.put(house({ color: C.terra }), 820, 640, 0.45, { anim: "none" }) + S.put(car(), 1380, 760, 0.8, { anim: "slideR", at: "Transportation" }) +
      S.js(`tl.fromTo("#${S.id("d2")}", { attr: { "stroke-dasharray": "0 2000" } }, { attr: { "stroke-dasharray": "220 2000" }, duration: 0.7, ease: "power2.out" }, ${S.t("Transportation")});`) +
      S.put(txt(0, 0, "≈ 1/6", 110, C.slateDk, { font: "bold" }), 1400, 420, 1, { anim: "grow", at: "6" }) },
  { at: "Food is next", tag: "THEN FOOD",
    draw: (S) => S.put(donut([{ v: 0.33, color: C.terra }, { v: 0.167, color: C.slateDk }, { v: 0.13, color: C.olive, id: S.id("d3") }]), 820, 580, 1, { anim: "none" }) +
      S.put(house({ color: C.terra }), 820, 640, 0.45, { anim: "none" }) + S.put(cart({ full: true }), 1420, 860, 1.1, { anim: "slideR" }) +
      S.js(`tl.fromTo("#${S.id("d3")}", { attr: { "stroke-dasharray": "0 2000" } }, { attr: { "stroke-dasharray": "170 2000" }, duration: 0.6, ease: "power2.out" }, 0.1);`) },
  { at: "Daily coffee?", tag: "AND COFFEE?",
    draw: (S) => S.put(donut([{ v: 0.33, color: C.terra }, { v: 0.167, color: C.slateDk }, { v: 0.13, color: C.olive }]), 820, 580, 1, { anim: "none" }) +
      S.put(magnifier({ inner: txt(0, 6, "?", 80, C.ink, { font: "bold" }) }), 900, 440, 1.2, { anim: "pop" }) + S.js(`tl.to("#${S.id("e1")}", { x: -200, y: 140, duration: 0.9, ease: "sine.inOut", yoyo: true, repeat: 1 }, 0.4);`) },
  { at: "It doesn't even make the chart", tag: "NOT EVEN ON THE CHART", tagColor: "terra",
    draw: (S) => S.put(donut([{ v: 0.33, color: C.terra }, { v: 0.167, color: C.slateDk }, { v: 0.13, color: C.olive }]), 820, 580, 1, { anim: "none" }) +
      S.put(coffee(), 1300, 420, 0.4, { anim: "pop" }) + S.js(`tl.to("#${S.id("e1")}", { y: 520, rotation: 200, duration: 0.8, ease: "power2.in" }, ${S.t("chart")});`) + S.sfx("whoosh", S.t("chart"), 0.25, 0.6) },
  { at: "Here's the key idea", tag: "THE KEY IDEA", tagColor: "mustard",
    draw: (S) => B(S, { pose: "pointUp", face: "happy" }, 960, 1.1) + S.put(bulb(), 1180, 440, 1, { anim: "grow", at: "key" }) + S.sfx("chime", S.t("key"), 0.2) },
  { at: "Cutting your biggest expense", tag: "BIGGEST BILL: −10%", tagColor: "olive",
    draw: (S) => S.put(house({ color: C.terra }), 760, G, 1.4, { anim: "pop" }) + S.put(scissors(), 1080, 600, 1.1, { anim: "slideR", at: "expense" }) +
      S.put(txt(0, 0, "−10%", 130, C.olive, { font: "bold", extra: `stroke="${C.ink}" stroke-width="5" paint-order="stroke"` }), 1420, 480, 1, { anim: "slam", at: "10" }) },
  { at: "usually beats cutting your smallest", tag: "BEATS SMALLEST: −100%",
    draw: (S) => S.put(seesaw(0, coinStack(9, { label: "RENT −10%", size: 40 }), coinStack(2, { label: "COFFEE −100%", size: 40 })), 960, G, 1, { anim: "pop", id: "ss" }) +
      S.js(`tl.fromTo("#${S.id("ss")} g[transform^='translate(0 -96)']", { rotation: 0, svgOrigin: "0 -96" }, { rotation: -9, duration: 0.6, ease: "bounce.out" }, ${S.t("smallest")});`) },
  { at: "Save 10 % on rent", tag: "10% OFF RENT",
    draw: (S) => S.put(letter(["RENT", "-", "$1,600", "-", "−10% = $160"], { size: 38 }), 760, 880, 1.2, { anim: "pop" }) + S.put(coinStack(6, { label: "+$160/MO", size: 44 }), 1350, G, 1.2, { anim: "rise", at: "rent" }) },
  { at: "and you could free up more money", tag: "MORE THAN ALL THE COFFEE", tagColor: "olive", tagSize: 52,
    draw: (S) => S.put(coinStack(11, { label: "RENT", size: 44 }), 820, G, 1.3, { anim: "rise" }) + S.put(coinStack(7, { label: "COFFEE", size: 44 }), 1250, G, 1.3, { anim: "rise", at: "coffee" }) },
  { at: "without changing a single morning", tag: "KEEP YOUR MORNING",
    draw: (S) => S.put(sun(), 1450, 400, 1, { anim: "rise" }) + B(S, { pose: "sip", face: "content", item: coffee(), itemScale: 0.55 }, 860, 1.15) },
  { at: "But housing isn't the one", tag: "NOT HOUSING...",
    draw: (S) => S.put(ghost(house()), 640, G, 1.1, { anim: "fade" }) + B(S, { pose: "shrug", face: "worried" }, 1250, 1.05) },
  { at: "This next one is", tag: "THIS ONE.", tagColor: "red",
    draw: (S) => S.put(`<path d="M -260 0 Q -280 -200 -150 -230 Q 0 -300 150 -230 Q 280 -200 260 0 Z" fill="${C.grey}" stroke="${C.ink}" stroke-width="5"/><path d="M -150 -230 Q -120 -100 -160 0 M 60 -270 Q 90 -120 70 0" fill="none" stroke="${C.ink}" stroke-width="3"/>`, 960, G, 1.3, { anim: "drop" }) +
      S.put(txt(0, 0, "?", 160, C.red, { font: "bold" }), 960, 520, 1, { anim: "grow", at: "is" }) },

  /* ================= PART 2 ================= */
  { at: "Experian reports that",
    draw: (S) => S.chapter("PART 1", "THE CAR") + S.put(car({ color: C.red, shiny: true }), 980, 880, 1.6, { anim: "slideR", at: 0.5 }) + B(S, { pose: "wave", face: "happy" }, 420, 0.9, { at: 0.9 }) },
  { at: "is over $700", tag: "THE AVERAGE NEW CAR",
    draw: (S) => S.put(car({ color: C.red, shiny: true }), 600, 880, 1.0, { anim: "none" }) +
      S.receipt({ x: 1100, y: 230, title: "NEW CAR LOAN", lines: [["PAYMENT", "MONTHLY"]], total: ["/MO", "$700+"], count: [0, 700], at: 0.0, printDur: 0.6, suffix: "+" }) },
  { at: "Now imagine a reliable used car", tag: "A RELIABLE USED CAR", tagColor: "olive",
    draw: (S) => S.put(car({ color: C.olive, used: true }), 900, 880, 1.4, { anim: "slideL" }) + S.put(priceTag("RELIABLE ✓", { size: 34, rot: -10 }), 1380, 560, 1, { anim: "drop", at: "reliable" }) },
  { at: "closer to $400", tag: "≈ $400 / MONTH",
    draw: (S) => S.put(car({ color: C.olive, used: true }), 760, 880, 1.2, { anim: "none" }) + S.put(S.countText(0, 0, 700, 400, { at: 0.1, size: 160, color: C.olive, stroke: true, suffix: "/mo" }), 1400, 560, 1, { anim: "grow" }) },
  { at: "That's about $340", tag: "+$340 BACK IN YOUR POCKET", tagColor: "olive", tagSize: 50,
    draw: (S) => B(S, { pose: "cheer", face: "joy" }, 760, 1.1) +
      [0, 1, 2, 3].map((i) => S.put(bill(), 1500 - i * 140, 420 + i * 90, 0.6, { anim: "slideR", at: S.t("pocket") - 0.9 + i * 0.15, rot: -10 + i * 6 })).join("") + S.sfx("chime", S.t("pocket"), 0.2) },
  { at: "That's over $4",
    draw: (S) => B(S, { pose: "hold", face: "happy", item: moneyBag("$"), itemScale: 0.6 }, 560, 1.05) +
      S.receipt({ x: 1000, y: 230, title: "FREED UP", lines: [["$340 x 12", ""]], total: ["/YEAR", "$4,000+"], count: [0, 4080], suffix: "+", at: 0.05, printDur: 0.6 }) },
  { at: "More than two years of daily coffee", tag: "= 2+ YEARS OF COFFEE", tagColor: "mustard",
    draw: (S) => [0, 1].map((i) => S.put(calendar(28, 7, { title: `YEAR ${i + 1}`, cw: 52, head: C.terra, mark: () => coffee({ steam: false }) }), 680 + i * 560, 900, 1, { anim: "pop", at: S.t("two") + i * 0.25 })).join("") },
  { at: "Every single year", tag: "EVERY. SINGLE. YEAR.", tagColor: "red",
    draw: (S) => [0, 1, 2, 3, 4].map((i) => S.put(calendar(28, 7, { title: `${2026 + i}`, cw: 40, head: C.terra }), 520 + i * 230, 860 - (i % 2) * 40, 0.9, { anim: "drop", at: 0.1 + i * 0.22 })).join("") },
  { at: "Invest that difference", tag: "INVEST THE DIFFERENCE", tagColor: "slate",
    draw: (S) => PC(S, { screen: "7% x 30", pose: "point", mouth: "smile" }, 700, 1.05) + S.put(coinStack(4, { label: "$340/MO" }), 1250, G, 1.2, { anim: "rise" }) },
  { at: "roughly $380", push: 1.06,
    draw: (S) => S.put(S.countText(0, 0, 0, 380000, { at: 0.1, size: 200, color: C.olive, stroke: true }), 960, 480, 1, { anim: "grow" }) +
      [3, 6, 9, 13, 17, 21].map((n, i) => S.put(coinStack(n), 560 + i * 160, G, 0.9, { anim: "rise", at: 0.2 + i * 0.12 })).join("") + S.shake(1.2, 8) },
  { at: "That's more than double the coffee fortune", tag: "MORE THAN DOUBLE",
    draw: (S) => S.put(axes(900, 520), 560, 900, 1, { anim: "fade" }) +
      S.put(`<rect x="-90" y="-230" width="180" height="230" fill="${C.terra}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -270, "$172K", 52, C.ink, { font: "bold" }) + txt(0, 50, "COFFEE", 40, C.ink, { font: "bold" }), 800, 900, 1, { anim: "pop", id: "b1" }) +
      S.put(`<rect x="-90" y="-500" width="180" height="500" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -540, "$380K", 52, C.ink, { font: "bold" }) + txt(0, 50, "CAR", 40, C.ink, { font: "bold" }), 1180, 900, 1, { anim: "pop", id: "b2", at: "double" }) },
  { at: "and you never gave up a latte", tag: "LATTE: KEPT ✓", tagColor: "olive",
    draw: (S) => B(S, { pose: "cheer", face: "joy", item: coffee(), itemScale: 0.5 }, 960, 1.15) + S.put(sparkles(6, 260), 960, 560, 1, { anim: "grow", at: "latte" }) },
  { at: "So why do we do it?", tag: "SO WHY DO WE DO IT?",
    draw: (S) => S.put(car({ color: C.red, shiny: true }), 1250, 880, 1.2, { anim: "pop" }) + B(S, { pose: "think", face: "thinking" }, 600, 1.05) },
  { at: "Because your brain prices the car", tag: "IT PRICES THE PAYMENT", tagColor: "red",
    draw: (S) => S.put(car({ color: C.red, shiny: true }), 1200, 880, 1.2, { anim: "none" }) + BR(S, { face: "grin", pose: "point" }, 520, 1) +
      S.put(`<rect x="-200" y="-90" width="400" height="180" rx="12" fill="${C.gold}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -20, "ONLY", 50, C.ink, { font: "bold" }) + txt(0, 40, "$700/MO!", 70, C.red, { font: "bold" }), 1200, 450, 1, { anim: "drop", at: "monthly" }) },
  { at: "not the total", tag: "NOT THE TOTAL",
    draw: (S) => S.put(`<rect x="-200" y="-90" width="400" height="180" rx="12" fill="${C.gold}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 0, "$700/MO", 70, C.red, { font: "bold" }), 600, 450, 1, { anim: "none" }) +
      S.receipt({ x: 1000, y: 180, title: "THE TOTAL", lines: [["$700 x 72 MO", ""], ["+ INTEREST", ""], ["+ INSURANCE", ""]], total: ["", "$50,000+"], at: "total", printDur: 0.8 }) },
  { at: "It's only $700 a month feels", tag: "\"IT'S ONLY...\"",
    draw: (S) => BR(S, { face: "sly", pose: "shrug" }, 960, 1.05) +
      S.put(bubble("only $700|a month", { size: 44, w: 330, h: 140, dx: -150, dy: -120 }), 820, 500, 1, { anim: "grow", at: "only" }) +
      S.put(bubble("only five|bucks", { size: 44, w: 300, h: 140, dx: 150, dy: -120, tail: 1 }), 1100, 500, 1, { anim: "grow", at: "five" }) },
  { at: "It's the same trick, just bigger", tag: "SAME TRICK. BIGGER.", tagColor: "red",
    draw: (S) => S.put(magicHat(), 960, G, 1.1) + BR(S, { face: "grin", pose: "cheer", hat: "" }, 520, 0.9) +
      S.put(coffee(), 900, 700, 0.5, { anim: "rise", at: "same" }) + S.put(car({ color: C.red }), 1250, 600, 0.9, { anim: "rise", at: "bigger" }) + S.shake(S.t("bigger") + 0.3, 8) },
  { at: "And if the car feels expensive", tag: "FEELS EXPENSIVE?",
    draw: (S) => S.put(car({ color: C.red }), 1250, 880, 1.1, { anim: "pop" }) + B(S, { pose: "cheeks", face: "worried" }, 600, 1.05) },
  { at: "the next one is worse", tag: "IT GETS WORSE", tagColor: "ink",
    draw: (S) => S.put(`<rect x="-1000" y="-600" width="2000" height="1200" fill="${C.ink}" opacity="0.18"/>`, 960, 540, 1, { anim: "fade" }) + S.put(storm(), 960, 420, 1.3, { anim: "drop" }) + B(S, { pose: "cheeks", face: "shocked" }, 960, 0.9, { at: "worse" }) + S.sfx("impact-bass-1", S.t("worse"), 0.3) },
  { at: "because you pay for it and get nothing back", tag: "YOU GET NOTHING BACK",
    draw: (S) => S.put(`<ellipse rx="220" ry="70" fill="${C.ink}"/><ellipse rx="160" ry="44" fill="#000"/>`, 1250, 820, 1, { anim: "grow" }) +
      B(S, { pose: "push", face: "sad", item: coin(28) }, 700, 1.05) + [0, 1, 2].map((i) => S.put(coin(26), 1000 + i * 70, 680 + i * 40, 1, { anim: "slideL", at: S.t("pay") + i * 0.2 })).join("") },
  { at: "Picture paying for coffee every morning",
    draw: (S) => S.chapter("PART 2", "INTEREST", { color: C.slateDk }) + S.put(counter(900), 1180, G, 1, { at: 0.5 }) + B(S, { pose: "push", face: "smile", item: coin(26) }, 620, 1.05, { at: 0.7 }) },
  { at: "for nine months", tag: "FOR 9 MONTHS",
    draw: (S) => S.put(calendar(12, 4, { title: "THIS YEAR", cw: 110, head: C.slateDk, cellClass: S.id("m") }), 960, 900, 1, { anim: "pop" }) +
      S.js(`tl.fromTo(Array.from(document.querySelectorAll(".${S.id("m")}")).slice(0, 9), { attr: { fill: "${C.paper}" } }, { attr: { fill: "${C.terra}" }, duration: 0.08, stagger: 0.08, ease: "none" }, 0.2);`) },
  { at: "and never getting a single cup", tag: "...AND NO COFFEE",
    draw: (S) => S.put(counter(900), 1180, G, 1, { anim: "none" }) + B(S, { pose: "hold", face: "sad", item: coffee({ steam: false, empty: true }), itemScale: 0.55 }, 620, 1.05) + S.put(txt(0, 0, "EMPTY", 70, C.red, { font: "bold", rot: -8 }), 960, 560, 1, { anim: "slam", at: "cup" }) },
  { at: "That's roughly what credit card interest looks like", tag: "CREDIT CARD INTEREST", tagColor: "slate",
    draw: (S) => S.put(card({ mouth: true, label: "CREDIT" }), 960, 600, 1.7, { anim: "grow" }) +
      [0, 1, 2].map((i) => S.put(coin(26), 640 + i * 90, 820 - i * 40, 1, { anim: "slideL", at: S.t("interest") + i * 0.18 })).join("") },
  { at: "Average credit card interest rates", tag: "OVER 20% A YEAR", tagColor: "red",
    draw: (S) => S.put(gauge({ needleId: S.id("needle") }), 960, 800, 1.6, { anim: "pop" }) +
      S.js(`tl.fromTo("#${S.id("needle")}", { rotation: -90, svgOrigin: "0 0" }, { rotation: 62, duration: 1.0, ease: "back.out(1.5)" }, ${S.t("above")});`) +
      S.put(txt(0, 0, "20%+", 120, C.red, { font: "bold", extra: `stroke="${C.ink}" stroke-width="5" paint-order="stroke"` }), 960, 880, 1, { anim: "grow", at: "20" }) },
  { at: "Carry a $6", tag: "$6,000 AT 22%",
    draw: (S) => S.put(card({ label: "BALANCE" }), 760, 560, 1.4, { anim: "pop" }) +
      S.put(priceTag("$6,000", { size: 46, rot: -6 }), 1180, 470, 1, { anim: "drop", at: "6" }) + S.put(priceTag("22%", { size: 46, rot: 10, color: C.red, ink: C.white }), 1180, 670, 1, { anim: "drop", at: "22" }) },
  { at: "and you're paying about $1",
    draw: (S) => S.put(card({ mouth: true }), 600, 600, 1.2, { anim: "none" }) +
      S.receipt({ x: 1050, y: 220, title: "CARD STATEMENT", lines: [["BALANCE", "$6,000"], ["APR", "22%"]], total: ["INTEREST/YR", "$1,300"], count: [0, 1320], at: 0.05, printDur: 0.7 }) },
  { at: "in interest alone", tag: "INTEREST. ALONE.", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, 700, 1.05) + S.put(bucket("$1,300", { color: C.red, leak: true, fill: true }), 1300, 820, 1.2, { anim: "pop" }) },
  { at: "That's around 264 coffees",
    draw: (S) => {
      let cups = "";
      for (let i = 0; i < 264; i++) cups += `<g class="${S.id("c")}" transform="translate(${(i % 24) * 52} ${Math.floor(i / 24) * 52})">${at(0, 0, 0.22, coffee({ steam: false }))}</g>`;
      return S.put(cups, 380, 330, 1, { anim: "none" }) + S.js(`tl.fromTo(".${S.id("c")}", { opacity: 0, scale: 0, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: 0.12, stagger: { amount: 1.0 }, ease: "back.out(2)" }, 0.15);`) +
        S.put(`<rect x="-200" y="-90" width="400" height="180" rx="20" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>` + S.countText(0, 6, 0, 264, { at: 0.15, size: 120, prefix: "", d: 1.0, chime: true }), 960, 940, 1, { anim: "grow" });
    } },
  { at: "Roughly nine months of them", tag: "9 MONTHS OF COFFEE",
    draw: (S) => {
      let cups = "";
      for (let i = 0; i < 264; i++) cups += `<g class="${S.id("c")}" transform="translate(${(i % 24) * 52} ${Math.floor(i / 24) * 52})">${at(0, 0, 0.22, coffee({ steam: false }))}</g>`;
      return S.put(cups, 380, 330, 1, { anim: "none" }) + S.put(`<path d="M -20 -70 L 1260 -70 L 1260 560 L -20 560 Z" fill="none" stroke="${C.red}" stroke-width="10" stroke-dasharray="30 20"/>`, 380, 330, 1, { anim: "fade", at: "nine" });
    } },
  { at: "Gone.", tag: "GONE.", tagColor: "ink",
    draw: (S) => {
      let cups = "";
      for (let i = 0; i < 264; i++) cups += `<g class="${S.id("c")}" transform="translate(${(i % 24) * 52} ${Math.floor(i / 24) * 52})">${at(0, 0, 0.22, coffee({ steam: false }))}</g>`;
      return S.put(cups, 380, 330, 1, { anim: "none" }) + S.js(`tl.to(".${S.id("c")}", { opacity: 0, scale: 0, y: -30, transformOrigin: "50% 50%", duration: 0.25, stagger: { amount: 0.4, from: "random" }, ease: "power2.in" }, 0.15);`) + S.sfx("whoosh", 0.15, 0.3, 0.6);
    } },
  { at: "With nothing to show for it", tag: "NOTHING TO SHOW FOR IT",
    draw: (S) => B(S, { pose: "shrug", face: "sad" }, 960, 1.15) + S.put(`<path d="M -60 -14 L 60 14 M -60 14 L 60 -14" stroke="${C.grey}" stroke-width="6"/>`, 760, 760, 1, { anim: "fade" }) },
  { at: "And your brain has a favorite phrase", tag: "ITS FAVORITE PHRASE",
    draw: (S) => BR(S, { face: "grin", pose: "mega", item: `<path d="M 0 -20 L 120 -70 L 120 70 L 0 20 Z" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>` }, 760, 1.1) +
      S.put(speedLines(5, 160), 1180, 560, 1, { anim: "fade", at: "phrase" }) },
  { at: "Just pay the minimum",
    draw: (S) => BR(S, { face: "sly", pose: "point" }, 560, 1) +
      S.put(bubble("JUST PAY THE|MINIMUM 😎", { size: 50, w: 520, h: 170, dx: 120, dy: -160 }), 820, 520, 1, { anim: "grow", at: 0.1 }) +
      S.put(letter(["CARD BILL", "-", "BALANCE $6,000", "MIN. DUE $120"], { size: 32, w: 340, h: 300 }), 1450, 900, 1, { anim: "pop", at: "minimum" }) },
  { at: "It feels responsible", tag: "FEELS RESPONSIBLE",
    draw: (S) => BR(S, { face: "happy", pose: "down", front: `<ellipse cx="0" cy="-330" rx="80" ry="18" fill="none" stroke="${C.gold}" stroke-width="10"/>` }, 960, 1.15) + S.put(sparkles(5, 200), 960, 600, 1, { anim: "grow", at: "responsible" }) },
  { at: "It's actually the most expensive habit", tag: "THE MOST EXPENSIVE HABIT", tagColor: "red", tagSize: 52,
    draw: (S) => S.put(trophy("MOST", { size: 34 }), 960, G, 1.6, { anim: "drop" }) + [[640, 520], [1280, 470], [700, 760], [1250, 760]].map(([x, y], i) => S.put(priceTag("$$$", { size: 34, rot: i * 20 - 20 }), x, y, 1, { anim: "pop", at: S.t("expensive") + i * 0.12 })).join("") },
  { at: "Now here's the one most people never notice", tag: "THE ONE NOBODY NOTICES", tagColor: "slate",
    draw: (S) => S.put(ghost(bean({ pose: "down", face: "smug", noShadow: true })), 960, G, 1.2, { anim: "fade", d: 0.8 }) + S.put(magnifier(), 1350, 560, 1, { anim: "pop", at: "never" }) },
  { at: "It doesn't take money from you",
    draw: (S) => B(S, { pose: "hold", face: "neutral", item: wallet(), itemScale: 0.8 }, 760, 1.1) + S.put(check(1.6), 1250, 560, 1, { anim: "grow", at: "take" }) + S.put(txt(0, 0, "WALLET: FULL", 56, C.ink, { font: "bold" }), 1250, 720, 1, { at: "money" }) },
  { at: "It takes the money you were about to have", tag: "IT TAKES YOUR FUTURE MONEY", tagColor: "terra", tagSize: 50,
    draw: (S) => B(S, { pose: "stop", face: "worried" }, 520, 1) +
      S.put(flyingBill(), 1500, 620, 0.9, { anim: "slideR", id: "fb" }) + S.js(`tl.to("#${S.id("fb")}-i", { x: -500, duration: 1.0, ease: "power1.in" }, 0.6); tl.to("#${S.id("fb")}-i", { y: -500, opacity: 0, duration: 0.5, ease: "power2.in" }, ${S.t("about")});`) },

  /* ================= PART 3 ================= */
  { at: "You get a raise!",
    draw: (S) => S.chapter("PART 3", "LIFESTYLE CREEP", { color: C.oliveDk }) + B(S, { pose: "cheer", face: "joy", item: letter(["RAISE!", "+$5,000"], { w: 200, h: 180, size: 30 }), itemScale: 0.8 }, 960, 1.1, { at: 0.5 }) },
  { at: "Congratulations!", tag: "YOU EARNED IT!", tagColor: "mustard",
    draw: (S) => B(S, { pose: "cheer", face: "joy" }, 960, 1.15) + S.put(confetti(40, 1500, 700, 7), 960, 760, 1, { anim: "drop" }) + S.sfx("chime", 0.2, 0.3) },
  { at: "Then, slowly", tag: "THEN, SLOWLY...",
    draw: (S) => S.put(snail(), 600, G, 1.2, { anim: "slideL", id: "sn" }) + S.js(`tl.to("#${S.id("sn")}-i", { x: 420, duration: ${S.dur.toFixed(2)}, ease: "none" }, 0.4);`) },
  { at: "quietly", tag: "QUIETLY...",
    draw: (S) => B(S, { pose: "heart", face: "smug", front: `<path d="M -4 -240 L -4 -200" stroke="${C.ink}" stroke-width="10" stroke-linecap="round"/>` }, 960, 1.1) + S.put(txt(0, 0, "shhh", 70, C.ink), 1250, 480, 1, { anim: "fade", at: 0.5 }) },
  { at: "everything upgrades", tag: "EVERYTHING UPGRADES", tagColor: "terra",
    draw: (S) => [[house({ color: C.olive }), 0.6], [car({ color: C.slateDk }), 0.6], [phone(["NEW"], { size: 34, w: 140, h: 240 }), 1], [coffee({ label: "XL" }), 1]].map(([svg, s], i) => S.put(svg, 450 + i * 340, G, s, { anim: "pop", at: 0.1 + i * 0.12 }) + S.put(arrow(110, C.olive, 50), 450 + i * 340, 560, 1, { rot: -90, anim: "rise", at: S.t("upgrades") + i * 0.1 })).join("") },
  { at: "A slightly bigger place", tag: "A BIGGER PLACE",
    draw: (S) => S.put(house({ color: C.olive }), 700, G, 0.7, { anim: "pop" }) + S.put(arrow(150, C.ink, 40), 960, 760, 1, { anim: "wipe", at: "bigger" }) + S.put(house({ color: C.terra }), 1350, G, 1.25, { anim: "grow", at: "place" }) },
  { at: "a nicer car", tag: "A NICER CAR",
    draw: (S) => S.put(car({ color: C.olive, used: true }), 600, 880, 0.7, { anim: "pop" }) + S.put(arrow(150, C.ink, 40), 920, 760, 1, { anim: "wipe", at: "nicer" }) + S.put(car({ color: C.red, shiny: true }), 1380, 880, 1.15, { anim: "grow", at: "car" }) },
  { at: "More takeout because", tag: "\"I'M BUSY NOW\"",
    draw: (S) => B(S, { pose: "hold", face: "worried", item: laptop([], {}), itemScale: 0.4 }, 700, 1.05) +
      [0, 1, 2, 3, 4].map((i) => S.put(`<path d="M -70 0 L -90 -120 L 90 -120 L 70 0 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><path d="M -90 -120 L -60 -150 L 60 -150 L 90 -120" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><path d="M -40 -150 Q 0 -200 40 -150" fill="none" stroke="${C.ink}" stroke-width="5"/>` + txt(0, -60, "TO GO", 30, C.terra, { font: "bold" }), 1250 + (i % 3) * 190, G - Math.floor(i / 3) * 150, 0.9, { anim: "drop", at: 0.2 + i * 0.25 })).join("") },
  { at: "A year later", tag: "A YEAR LATER: YOU EARN MORE", tagColor: "olive", tagSize: 50,
    draw: (S) => S.put(calendar(28, 7, { title: "+1 YEAR", cw: 52, head: C.oliveDk }), 620, 900, 1, { anim: "pop" }) + S.put(letter(["PAYCHECK", "-", "+$5,000/YR"], { size: 38 }), 1300, 900, 1, { anim: "rise", at: "earn" }) },
  { at: "But your savings look exactly the same", tag: "SAVINGS: EXACTLY THE SAME", tagColor: "red", tagSize: 52,
    draw: (S) => S.put(laptop(["SAVINGS", "$412", "(same as last year)"], { size: 40 }), 760, 880, 1.2, { anim: "pop" }) + S.put(piggy(), 1450, G, 1, { anim: "pop", at: "same" }) + B(S, { pose: "down", face: "sad", noShadow: true }, 1450, 0.0001, { anim: "none" }) },
  { at: "This is why so many people with good salaries", tag: "GOOD SALARY. STILL BROKE.", tagColor: "ink", tagSize: 52,
    draw: (S) => B(S, { pose: "hold", face: "sad", tie: true, item: wallet({ open: false }), itemScale: 0.7 }, 900, 1.1) +
      S.put(`<path d="M 0 0 q -30 -30 -10 -50 q 20 10 10 50 M 0 0 q 30 -30 10 -50 q -20 10 -10 50" fill="${C.grey}" stroke="${C.ink}" stroke-width="3"/>`, 900, 690, 1, { anim: "rise", at: "broke", d: 1.0 }) },
  { at: "Your income went up", tag: "INCOME ↑",
    draw: (S) => S.put(axes(1000, 520), 480, 900, 1, { anim: "fade" }) + S.put(chartLine([[0, -60], [250, -120], [500, -220], [750, -330], [1000, -440]], C.olive, 14, S.id("l1")), 480, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("l1")}", { attr: { "stroke-dasharray": "0 2000" } }, { attr: { "stroke-dasharray": "1200 2000" }, duration: 1.0, ease: "power2.out" }, 0.2);`) + S.put(txt(0, 0, "INCOME", 50, C.oliveDk, { font: "bold" }), 1530, 430, 1, { anim: "fade", at: 0.9 }) },
  { at: "But so did your idea of normal", tag: "SO DID 'NORMAL'", tagColor: "terra",
    draw: (S) => S.put(axes(1000, 520), 480, 900, 1, { anim: "none" }) + S.put(chartLine([[0, -60], [250, -120], [500, -220], [750, -330], [1000, -440]], C.olive, 14), 480, 900, 1, { anim: "none" }) + S.put(txt(0, 0, "INCOME", 50, C.oliveDk, { font: "bold" }), 1530, 430, 1, { anim: "none" }) +
      S.put(chartLine([[0, -40], [250, -100], [500, -200], [750, -310], [1000, -420]], C.terra, 14, S.id("l2")), 480, 900, 1, { anim: "none" }) +
      S.js(`tl.fromTo("#${S.id("l2")}", { attr: { "stroke-dasharray": "0 2000" } }, { attr: { "stroke-dasharray": "1200 2000" }, duration: 1.0, ease: "power2.out" }, ${S.t("normal", -0.5)});`) + S.put(txt(0, 0, "SPENDING", 50, C.terra, { font: "bold" }), 1560, 520, 1, { anim: "fade", at: "normal" }) },
  { at: "Your brain adjusts to every upgrade", tag: "BORED IN MONTHS",
    draw: (S) => S.put(car({ color: C.red }), 1250, 880, 1.1, { anim: "none" }) + BR(S, { face: "yawn", pose: "down" }, 600, 1.05) + S.put(txt(0, 0, "meh.", 80, C.ink), 640, 460, 1, { anim: "grow", at: "months" }) },
  { at: "And then, it wants the next one", tag: "IT WANTS THE NEXT ONE", tagColor: "red",
    draw: (S) => BR(S, { face: "love", pose: "reach" }, 560, 1.05) + S.put(car({ color: C.gold, shiny: true, label: "2027" }), 1300, 880, 1.2, { anim: "slideR", at: "next" }) },
  { at: "Here's a simple fix", tag: "A SIMPLE FIX", tagColor: "olive",
    draw: (S) => PC(S, { screen: "FIX", pose: "up", item: `<path d="M -10 0 L 10 0 L 8 -80 L 26 -100 L 14 -120 L 0 -100 L -14 -120 L -26 -100 L -8 -80 Z" fill="${C.grey}" stroke="${C.ink}" stroke-width="4"/>` }, 960, 1.15) },
  { at: "The next time you get a raise", tag: "SAVE HALF THE RAISE", tagColor: "olive",
    draw: (S) => S.put(coin(110, "$"), 960, 480, 1, { anim: "grow", id: "big" }) +
      S.put(piggy({ label: "SAVE" }), 620, G, 1.1, { anim: "pop", at: "save" }) + B(S, { pose: "cheer", face: "happy", label: "" }, 1350, 0.95, { at: "save" }) +
      S.js(`tl.to("#${S.id("big")}", { opacity: 0, duration: 0.15 }, ${S.t("half")}); `) +
      S.put(coin(70, "½"), 960, 480, 1, { anim: "none", id: "h1" }) + S.put(coin(70, "½"), 960, 480, 1, { anim: "none", id: "h2" }) +
      S.js(`tl.fromTo("#${S.id("h1")}", { opacity: 0, x: 0, y: 0 }, { opacity: 1, x: -340, y: 280, duration: 0.6, ease: "power2.inOut" }, ${S.t("half")}); tl.fromTo("#${S.id("h2")}", { opacity: 0, x: 0, y: 0 }, { opacity: 1, x: 300, y: 140, duration: 0.6, ease: "power2.inOut" }, ${S.t("half")});`) },
  { at: "before you get used to it", tag: "BEFORE YOU GET USED TO IT", tagSize: 52,
    draw: (S) => S.put(clock({ handId: S.id("hand") }), 960, 560, 1.5, { anim: "grow" }) + S.js(`tl.fromTo("#${S.id("hand")}", { rotation: 0, svgOrigin: "0 0" }, { rotation: 360, duration: ${Math.max(1, S.dur - 0.4).toFixed(2)}, ease: "none" }, 0.2);`) },
  { at: "You'll still feel richer", tag: "YOU STILL FEEL RICHER", tagColor: "mustard",
    draw: (S) => B(S, { pose: "hold", face: "joy", item: coin(60, "½") }, 960, 1.15) + S.put(sparkles(5, 230), 960, 580, 1, { anim: "grow", at: "richer" }) },
  { at: "and your future self will actually be richer", tag: "FUTURE YOU IS RICHER", tagColor: "olive",
    draw: (S) => B(S, { pose: "down", face: "smile" }, 560, 0.9) + S.put(arrow(220, C.olive, 50), 840, 700, 1, { anim: "wipe", at: "future" }) +
      B(S, { pose: "carry", face: "joy", old: true, item: moneyBag("$$$", { size: 54 }), itemScale: 0.75 }, 1300, 1.1, { at: "self" }) },
  { at: "And speaking of free money",
    draw: (S) => S.chapter("PART 4", "FREE MONEY", { color: C.oliveDk }) + S.put(gift("$", C.olive), 960, G, 1.2, { anim: "drop", at: 0.5 }) },
  { at: "this last one is the most painful", tag: "THE MOST PAINFUL ONE", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "wince" }, 960, 1.15) },
  { at: "because you could fix it this week", tag: "FIXABLE THIS WEEK", tagColor: "olive",
    draw: (S) => S.put(calendar(7, 7, { title: "THIS WEEK", cw: 120, head: C.olive }), 960, 760, 1.1, { anim: "pop" }) +
      S.put(`<ellipse rx="80" ry="70" fill="none" stroke="${C.red}" stroke-width="10"/>`, 957, 669, 1.1, { anim: "grow", at: "week" }) },
  { at: "Many US employers offer", tag: "THE 401(K) MATCH", tagColor: "slate",
    draw: (S) => S.put(building({ label: "YOUR JOB" }), 620, G, 1, { anim: "rise" }) + S.put(gift("MATCH", C.terra), 1250, G, 1.2, { anim: "drop", at: "401k" }) },
  { at: "If you put in a few percent", tag: "YOU PUT IN A FEW %",
    draw: (S) => S.put(jar("401(K)", 0.25, { fillId: S.id("fill") }), 1150, G, 1.3, { anim: "pop" }) + B(S, { pose: "push", face: "smile", item: coin(26) }, 620, 1.0) +
      [0, 1].map((i) => S.put(coin(26), 1150, 420, 1, { anim: "drop", at: S.t("pay") - 0.5 + i * 0.25, d: 0.5 })).join("") },
  { at: "they add money on top", tag: "THEY ADD MORE ON TOP", tagColor: "olive",
    draw: (S) => S.put(jar("401(K)", 0.5, { fillId: S.id("fill") }), 1150, G, 1.3, { anim: "none" }) +
      S.put(`<path d="M 0 0 L 280 0" stroke="${C.slateDk}" stroke-width="70" stroke-linecap="round"/><path d="M 0 0 L 280 0" stroke="${C.ink}" stroke-width="4" fill="none"/>` + coin(30), 1360, 360, 1, { anim: "slideR" }) +
      [0, 1, 2].map((i) => S.put(coin(26), 1150 + (i - 1) * 50, 440, 1, { anim: "drop", at: S.t("top") - 0.2 + i * 0.15, d: 0.5 })).join("") },
  { at: "With a dollar -for -dollar match", tag: "DOLLAR-FOR-DOLLAR",
    draw: (S) => S.put(bill({ label: "$1" }), 700, 560, 1.4, { anim: "pop" }) + S.put(txt(0, 0, "+", 140, C.ink, { font: "bold" }), 960, 570, 1, { anim: "grow", at: "for" }) + S.put(bill({ label: "$1" }), 1220, 560, 1.4, { anim: "pop", at: "match" }) },
  { at: "every dollar you put in instantly becomes two", tag: "$1 → $2 INSTANTLY", tagColor: "olive",
    draw: (S) => S.put(bill({ label: "$1" }), 760, 560, 1.4, { anim: "pop" }) + S.put(arrow(160, C.ink, 46), 960, 560, 1, { anim: "wipe", at: "instantly" }) +
      S.put(bill({ label: "$1" }) + at(30, 30, 1, bill({ label: "$1" })), 1360, 540, 1.4, { anim: "grow", at: "two" }) + S.put(sparkles(5, 200), 1380, 560, 1, { anim: "grow", at: "two" }) + S.sfx("chime", S.t("two"), 0.3) },
  { at: "No investment you'll ever find", tag: "AN INSTANT +100%", tagColor: "mustard",
    draw: (S) => PC(S, { screen: "+100%", pose: "point", mouth: "o" }, 620, 1.05) + S.put(axes(700, 400), 1050, 860, 1, { anim: "fade" }) +
      S.put(chartLine([[0, -40], [140, -70], [280, -50], [420, -110], [560, -90], [700, -150]], C.slate, 8), 1050, 860, 1, { anim: "fade", at: 0.4 }) +
      S.put(chartLine([[0, -40], [10, -380], [700, -380]], C.olive, 12), 1050, 860, 1, { anim: "wipe", at: "reliably" }) },
  { at: "And yet, plenty of people", tag: "MANY DON'T PUT IN ENOUGH", tagSize: 52,
    draw: (S) => S.put(jar("401(K)", 0.15), 760, G, 1.3, { anim: "pop" }) + S.put(gift("MATCH", C.terra), 1300, G, 1.0, { anim: "pop", at: "match" }) + S.put(txt(0, 0, "UNCLAIMED", 50, C.red, { font: "bold", rot: -10 }), 1300, 640, 1, { anim: "slam", at: "match" }) },
  { at: "They're turning down part of their own pay", tag: "TURNING DOWN YOUR OWN PAY", tagColor: "red", tagSize: 50,
    draw: (S) => B(S, { pose: "stop", face: "neutral", look: 10 }, 700, 1.05) + S.put(moneyBag("$"), 1250, G, 1.2, { anim: "slideR" }) + S.put(bubble("no thanks", { size: 44, w: 270, h: 100, dx: 60, dy: -120 }), 760, 480, 1, { anim: "grow", at: "down" }) },
  { at: "while feeling guilty about a latte", tag: "...BUT GUILTY ABOUT A LATTE", tagSize: 50,
    draw: (S) => S.put(moneyBag("$"), 1450, G, 0.9, { anim: "none" }) + B(S, { pose: "cheeks", face: "worried" }, 760, 1.05) + S.put(coffee(), 1080, G, 0.7, { anim: "pop", at: "latte" }) },
  { at: "Check your benefits page this week", tag: "CHECK YOUR BENEFITS PAGE", tagColor: "olive", tagSize: 52,
    draw: (S) => S.put(phone(["BENEFITS", "401(K)", "MATCH: 5%", "YOU: 2%"], { size: 26, head: C.oliveDk, glow: true }), 960, 940, 1.6, { anim: "rise" }) + S.put(check(1.2), 1240, 540, 1, { anim: "grow", at: "week" }) },
  { at: "That's the number I said", tag: "THE NUMBER ON YOUR PHONE", tagColor: "mustard", tagSize: 52,
    draw: (S) => S.put(phone(["", "1 NUMBER", "UNLOCKED"], { size: 28, head: C.slateDk, glow: true }), 760, 900, 1.3, { anim: "pop" }) + S.put(envelope("#1", { open: true, size: 70, w: 320, h: 210 }), 1350, 820, 1, { anim: "pop", at: "phone" }) + S.sfx("chime", S.t("phone"), 0.25) },

  /* ================= PART 4 ================= */
  { at: "So does the coffee not matter",
    draw: (S) => S.chapter("", "THE TWIST", { color: C.terra }) + S.put(coffee(), 960, G, 1.4, { anim: "pop", at: 0.6, id: "cup" }) + S.js(`tl.fromTo("#${S.id("cup")}-i", { scaleX: 1 }, { scaleX: -1, duration: 0.6, ease: "power2.inOut", transformOrigin: "50% 50%" }, 1.4);`) },
  { at: "Here's the honest answer", tag: "THE HONEST ANSWER",
    draw: (S) => B(S, { pose: "heart", face: "smile" }, 960, 1.15) },
  { at: "The coffee isn't the problem", tag: "COFFEE ≠ THE PROBLEM", tagColor: "olive",
    draw: (S) => S.put(coffee(), 760, G, 1.4, { anim: "pop" }) + S.put(check(1.8), 1220, 600, 1, { anim: "grow", at: "problem" }) },
  { at: "but it can be a symptom", tag: "IT CAN BE A SYMPTOM", tagColor: "terra",
    draw: (S) => S.put(coffee(), 1150, G, 1.2, { anim: "none" }) + PC(S, { screen: "HMM", pose: "point", mouth: "flat", item: `<path d="M 0 0 Q 40 60 0 110" fill="none" stroke="${C.ink}" stroke-width="6"/><circle cx="0" cy="116" r="16" fill="${C.grey}" stroke="${C.ink}" stroke-width="4"/>` }, 700, 1.05) +
      S.put(txt(0, 0, "!", 160, C.red, { font: "bold" }), 1150, 520, 1, { anim: "grow", at: "symptom" }) },
  { at: "If you buy coffee on autopilot", tag: "AUTOPILOT",
    draw: (S) => S.put(conveyor(1300), 960, 960, 1) + S.put(bean({ pose: "sip", face: "sleep", item: coffee(), itemScale: 0.5 }), 500, 930, 0.9, { anim: "pop", id: "rider" }) + S.js(`tl.to("#${S.id("rider")}", { x: 700, duration: ${S.dur.toFixed(2)}, ease: "none" }, 0.2);`) },
  { at: "you're probably spending on autopilot everywhere", tag: "...EVERYWHERE", tagColor: "terra",
    draw: (S) => S.put(conveyor(1300), 960, 960, 1) +
      [gift("", C.slate), cart({ full: true }), coffee(), phone(["$"], { w: 140, h: 240 }), gift("", C.mustard)].map((svg, i) => S.put(svg, 380 + i * 280, 930, 0.6, { anim: "pop", at: 0.1 + i * 0.15, id: `it${i}` })).join("") +
      S.js(`tl.to("[id^='${S.id("it")}']", { x: 300, duration: ${S.dur.toFixed(2)}, ease: "none" }, 0.2);`) },
  { at: "Subscriptions you forgot about", tag: "FORGOTTEN SUBSCRIPTIONS", tagColor: "slate", tagSize: 52,
    draw: (S) => [["▶", C.red], ["♪", C.olive], ["✚", C.slateDk], ["☁", C.slate], ["★", C.mustard], ["◆", C.terra]].map(([g2, col], i) =>
      S.put(appIcon(col, g2) + `<path d="M 30 -60 q 40 -40 70 0 M 50 -60 l 10 -26 M 80 -60 l 10 -22" fill="none" stroke="${C.grey}" stroke-width="3"/>`, 560 + (i % 3) * 260, 420 + Math.floor(i / 3) * 260, 1.3, { anim: "pop", at: 0.1 + i * 0.12 })).join("") + S.put(txt(0, 0, "$9.99/mo each", 52, C.red, { font: "bold" }), 1500, 560, 1, { anim: "fade", at: "about" }) },
  { at: "fees you never check", tag: "FEES YOU NEVER CHECK",
    draw: (S) => S.receipt({ x: 680, y: 210, w: 560, title: "BANK STATEMENT", lines: [["SERVICE FEE", "$12.00"], ["ATM FEE", "$3.50"], ["LATE FEE", "$35.00"], ["FX FEE", "$4.20"]], at: 0.05, printDur: 0.8 }) +
      S.put(magnifier(), 1450, 560, 1.1, { anim: "pop", at: "never" }) },
  { at: "apps that charge you every single month", tag: "EVERY. SINGLE. MONTH.", tagColor: "red",
    draw: (S) => S.put(phone(["", "-$14.99", "-$9.99", "-$19.99"], { size: 36, head: C.red }), 760, 940, 1.4, { anim: "rise" }) +
      [0, 1, 2].map((i) => S.put(coin(28), 1000, 520, 1, { anim: "none", id: `c${i}` })).join("") +
      S.js([0, 1, 2].map((i) => `tl.fromTo("#${S.id(`c${i}`)}", { opacity: 0, x: 0, y: 0 }, { opacity: 1, x: 600, y: ${-100 + i * 90}, duration: 0.6, ease: "power2.in" }, ${(S.t("charge") + i * 0.3).toFixed(3)});`).join(" ")) },
  { at: "So keep the coffee", tag: "KEEP THE COFFEE ☕", tagColor: "olive",
    draw: (S) => B(S, { pose: "hold", face: "joy", item: coffee(), itemScale: 0.6 }, 960, 1.15) + S.put(heart(1.4), 1180, 480, 1, { anim: "grow", at: "coffee" }) },
  { at: "just choose it on purpose", tag: "CHOOSE IT ON PURPOSE", tagColor: "mustard",
    draw: (S) => [0, 1, 2].map((i) => S.put(coffee({ label: ["S", "M", "L"][i] }), 760 + i * 220, G, 0.8 + i * 0.1, { anim: "pop", at: 0.1 + i * 0.1 })).join("") + S.put(check(1.2), 980, 560, 1, { anim: "grow", at: "purpose" }) + B(S, { pose: "point", face: "determined", look: 10 }, 420, 0.9) },
  { at: "Spend freely on what you love", tag: "SPEND ON WHAT YOU LOVE", tagColor: "red",
    draw: (S) => S.put(heart(5.5), 960, 560, 1, { anim: "grow" }) + [0, 1, 2, 3].map((i) => S.put(coin(26), 760 + i * 130, 300, 1, { anim: "drop", at: S.t("love") - 0.3 + i * 0.12 })).join("") },
  { at: "and cut hard on what you don't even notice", tag: "CUT WHAT YOU DON'T NOTICE", tagColor: "terra", tagSize: 52,
    draw: (S) => [0, 1, 2].map((i) => S.put(ghost(appIcon(C.slate, "$")), 760 + i * 230, 560, 1.2, { anim: "fade" })).join("") + S.put(scissors(), 1500, 560, 1.3, { anim: "slideR", at: "cut", id: "sc" }) +
      S.js(`tl.to("#${S.id("sc")}-i", { x: -760, duration: 0.8, ease: "power2.inOut" }, ${S.t("hard")});`) + S.sfx("whoosh", S.t("hard"), 0.25, 0.6) },
  { at: "Here are three moves",
    draw: (S) => S.chapter("", "YOUR PLAN", { color: C.oliveDk }) + S.put(cards3(), 960, G, 1, { anim: "rise", at: 0.6 }) },
  { at: "and none of them involve giving up coffee", tag: "COFFEE STAYS ✓", tagColor: "olive",
    draw: (S) => S.put(cards3(), 960, G, 1, { anim: "none" }) + S.put(coffee(), 1600, G, 0.8, { anim: "pop", at: "coffee" }) + S.put(check(0.9), 1600, 640, 1, { anim: "grow", at: "coffee" }) },
  { at: "One, look at your three biggest bills", tag: "#1  YOUR 3 BIGGEST BILLS", tagColor: "mustard", tagSize: 52,
    draw: (S) => S.put(cards3(["1", "2", "3"], [`${at(0, -60, 0.4, house())}${txt(0, -240, "BIG 3", 44, C.ink, { font: "bold" })}`]), 960, G, 1, { anim: "none" }) + S.put(magnifier(), 660, 500, 0.8, { anim: "pop", at: "biggest" }) },
  { at: "housing, car, food",
    draw: (S) => [["housing", house({ color: C.terra }), 0.8], ["car", car({ color: C.slateDk }), 0.7], ["food", cart({ full: true }), 1.1]].map(([w, svg, s], i) =>
      S.put(svg, 520 + i * 450, G, s, { anim: "pop", at: w }) + S.put(txt(0, 0, w.toUpperCase(), 52, C.ink, { font: "bold" }), 520 + i * 450, 470, 1, { anim: "fade", at: w })).join("") },
  { at: "Find a 10 % cut", tag: "CUT 10% FROM ONE", tagColor: "olive",
    draw: (S) => S.put(car({ color: C.slateDk }), 960, 880, 1.2, { anim: "none" }) + S.put(scissors(), 1450, 560, 1.1, { anim: "slideR" }) +
      S.put(txt(0, 0, "−10%", 140, C.olive, { font: "bold", extra: `stroke="${C.ink}" stroke-width="5" paint-order="stroke"` }), 960, 460, 1, { anim: "slam", at: "10" }) },
  { at: "Two, list every debt", tag: "#2  LIST DEBTS OVER 10%", tagColor: "mustard", tagSize: 52,
    draw: (S) => S.put(clipboard([["CREDIT CARD", "22%", C.red], ["STORE CARD", "27%", C.red], ["CAR LOAN", "7%"], ["STUDENT LOAN", "5%"]]), 960, 960, 1.15, { anim: "rise" }) +
      [0, 1].map((i) => S.put(`<ellipse rx="120" ry="40" fill="none" stroke="${C.red}" stroke-width="7"/>`, 1110, 560 + i * 74, 1.15, { anim: "grow", at: S.t("10") + i * 0.2 })).join("") },
  { at: "That's your enemy", tag: "THE REAL ENEMY", tagColor: "red",
    draw: (S) => S.put(ring(), 960, G, 0.9, { anim: "none" }) + B(S, { pose: "cheer", face: "determined", item: `<circle r="34" fill="${C.red}" stroke="${C.ink}" stroke-width="4"/>` }, 700, 0.95) +
      S.put(card({ mouth: true, label: "22%" }), 1220, 640, 1.1, { anim: "pop" }) + S.put(bubble("not me!", { size: 40, w: 220, h: 90, dy: -110 }), 1700, 700, 1, { anim: "grow", at: "barista" }) + S.put(coffee(), 1700, G, 0.5, { anim: "pop", at: "barista" }) },
  { at: "Three, make sure you're getting", tag: "#3  GET THE FULL MATCH", tagColor: "mustard",
    draw: (S) => S.put(jar("401(K)", 0.2, { fillId: S.id("j") }), 960, G, 1.4, { anim: "pop" }) +
      S.js(`tl.fromTo("#${S.id("j")}", { scaleY: 0.25, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 1.0, ease: "power2.out" }, ${S.t("match", -0.3)});`) + S.put(txt(0, 0, "FULL", 80, C.olive, { font: "bold", rot: -8 }), 1300, 560, 1, { anim: "slam", at: "match" }) },
  { at: "and set your savings to go out automatically", tag: "AUTOMATE IT ON PAYDAY", tagColor: "olive",
    draw: (S) => S.put(letter(["PAYDAY", "-", "$$$"], { size: 40, w: 240, h: 240 }), 520, 880, 1, { anim: "pop" }) +
      S.put(`<circle r="70" fill="${C.grey}" stroke="${C.ink}" stroke-width="5"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="-14" y="-96" width="28" height="30" fill="${C.grey}" stroke="${C.ink}" stroke-width="4" transform="rotate(${i * 45})"/>`).join("") + `<circle r="24" fill="${C.paper}" stroke="${C.ink}" stroke-width="5"/>`, 960, 620, 1, { anim: "grow", at: "automatically", id: "gear" }) +
      S.js(`tl.to("#${S.id("gear")}-i", { rotation: 360, transformOrigin: "50% 50%", duration: 2.0, ease: "none" }, ${S.t("automatically")});`) +
      S.put(piggy({ label: "SAVE" }), 1450, G, 1.1, { anim: "pop", at: "payday" }) + S.put(arrow(140, C.olive, 40), 700, 700, 1, { anim: "wipe", at: "automatically" }) + S.put(arrow(140, C.olive, 40), 1080, 700, 1, { anim: "wipe", at: "payday" }) },
  { at: "before your brain can spend it", tag: "BEFORE YOUR BRAIN CAN SPEND IT", tagSize: 48,
    draw: (S) => S.put(piggy({ label: "SAVED" }), 1300, G, 1.2, { anim: "none" }) + BR(S, { face: "foiled", pose: "reach" }, 620, 1.05) + S.put(stampSvg("TOO LATE", C.olive, 60, -8), 1300, 600, 1, { anim: "slam", at: "spend" }) },
  { at: "So here's the truth", tag: "THE TRUTH",
    draw: (S) => B(S, { pose: "hold", face: "content", item: coffee(), itemScale: 0.55 }, 960, 1.15) },
  { at: "Your coffee was never what was keeping you broke",
    draw: (S) => S.put(coffee(), 960, G, 1.6, { anim: "pop" }) + S.put(stampSvg("NOT GUILTY", C.olive, 70, -10), 960, 560, 1, { anim: "slam", at: "broke" }) + S.sfx("impact-bass-1", S.t("broke") + 0.18, 0.35) },
  { at: "The quiet stuff was", tag: "THE QUIET STUFF",
    draw: (S) => {
      const items = [["car", car({ color: C.red }), "CAR PAYMENT", 0.55], ["interest", card({ mouth: true }), "INTEREST", 0.75], ["raise", letter(["RAISE", "-"], { w: 200, h: 220 }), "LOST RAISE", 0.8], ["free", gift("MATCH", C.terra), "UNCLAIMED", 0.8]];
      return S.put(`<rect x="-760" y="-560" width="1520" height="560" fill="${C.paper2}"/>` + [1, 2, 3, 4].map((i) => `<path d="M -760 ${-110 * i} L 760 ${-110 * i}" stroke="${C.grey}" stroke-width="4"/>`).join(""), 960, G, 1, { anim: "fade" }) +
        items.map(([w, svg, lab, s], i) => S.put(svg + `<rect x="-130" y="30" width="260" height="56" fill="${C.ink}"/>` + txt(0, 58, lab, 30, C.white, { font: "bold" }), 450 + i * 340, 840, s * 1.1, { anim: "pop", at: S.t(w === "free" ? "free" : w), id: `q${i}` })).join("");
    } },
  { at: "Fix those and you can enjoy every cup", tag: "ENJOY EVERY CUP", tagColor: "olive",
    draw: (S) => S.put(sun(), 1500, 360, 1, { anim: "rise" }) + B(S, { pose: "sip", face: "content", item: coffee(), itemScale: 0.55 }, 820, 1.15) +
      S.put(laptop(["SAVINGS", "", ""], { size: 40 }), 1350, 880, 0.9, { anim: "pop", at: "enjoy" }) + S.put(S.countText(0, 0, 412, 48600, { at: S.t("enjoy"), size: 64, color: C.olive, d: 1.6 }), 1350, 1003 - 250, 0.9, { anim: "none" }) },
  { at: "And if you've ever wondered why", tag: "EARNING MORE...",
    draw: (S) => S.put(treadmill(), 960, G - 30, 1) + B(S, { pose: "cheer", face: "worried" }, 930, 1, { anim: "pop" }) },
  { at: "you still never feel rich", tag: "...STILL NEVER FEEL RICH?", tagColor: "red", tagSize: 54,
    draw: (S) => S.put(treadmill(), 960, G - 30, 1, { anim: "none" }) + B(S, { pose: "shrug", face: "sad" }, 930, 1, { anim: "none" }) + S.put(txt(0, 0, "?", 200, C.mustard, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` }), 1280, 460, 1, { anim: "grow", at: "rich" }) },
  { at: "that's a whole different trick", tag: "A WHOLE DIFFERENT TRICK", tagColor: "red", tagSize: 54,
    draw: (S) => S.put(magicHat(), 1300, G, 1) + BR(S, { face: "grin", pose: "point" }, 700, 1.1) },
  { at: "Watch this one next", push: 1.0,
    draw: (S) => S.put(`<rect x="-440" y="-250" width="880" height="500" rx="18" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="8"/>` +
      at(-220, 230, 0.6, bean({ pose: "shrug", face: "sad", noShadow: true })) + at(220, 230, 0.6, brain({ face: "sly", noShadow: true })) +
      `<rect x="-420" y="-230" width="840" height="120" fill="${C.ink}" opacity="0.4"/>` + txt(0, -170, "WHY YOU'LL NEVER", 56, C.white, { font: "bold" }) + txt(0, -100, "FEEL RICH", 70, C.gold, { font: "bold" }) +
      `<circle r="70" fill="${C.red}" stroke="${C.ink}" stroke-width="6" cx="0" cy="40"/><path d="M -20 10 L 34 40 L -20 70 Z" fill="${C.white}"/>`, 960, 520, 1, { anim: "grow" }) +
      S.put(at(-70, 0, 0.32, bean({ face: "happy", noShadow: true })) + at(10, 0, 0.26, brain({ face: "grin", noShadow: true })) + txt(70, -60, "MONEY BRAIN", 64, C.ink, { font: "bold", anchor: "start" }), 760, 960, 1, { anim: "rise", at: 0.6 }) },
];
