// EP04 "401(k), IRA or Roth?" — the moving-day episode.
// Same PesaBrain identity. This episode's devices: cardboard account boxes stamped TAX LATER / TAX NOW,
// storage-unit doors, the farmer taxing seeds vs. the harvest, the 5-step staircase that lights up step by step,
// the old-401(k) letter Impulse wants to cash out, and the IRA cash pile gathering cobwebs.
import {
  C, at, txt, bean, brain, calc, coffee, priceTag, coin, coinStack, bill, moneyBag, piggy, wallet, card, phone, envelope,
  letter, calendar, house, car, cart, jar, magnifier, trophy, star, heart, bulb, clock, bubble, cloudThought, arrow, chartLine, axes,
  stampSvg, check, cross, sparkles, confetti, laptop, clipboard, building, gift, hourglass, speedLines, ghost, sun,
} from "../../moneybrain/tools/kit.mjs";
import { cushion, anvil } from "../../ep02/tools/props2.mjs";
import { hill, hillY, snowball, toggle, personIcon, stopSign, pie, rocket, moonCoin, hammock, companyBlock, ingredientJar } from "../../ep03/tools/props3.mjs";
import { box, storageDoor, staircase, strawHat, seedBag, harvest, taxBite, truck, cashPile, buyButton, trap, gauge2, bigLetters } from "./props4.mjs";

const G = 940;
const B = (S, o, x, s = 1, opt = {}) => S.put(bean(o), x, G, s, { idle: true, ...opt });
const BR = (S, o, x, s = 1, opt = {}) => S.put(brain(o), x, G, s, { idle: true, ...opt });
const PC = (S, o, x, s = 1, opt = {}) => S.put(calc(o), x, G, s, { idle: true, ...opt });
const big = (t, col = C.ink, size = 150) => txt(0, 0, t, size, col, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` });
const farmer = (o = {}) => bean({ pose: "point", face: "happy", front: at(4, -368, 0.8, strawHat()), ...o });
const STEPS = ["MATCH", "PROTECT", "ROTH IRA", "401(K)", "BROKERAGE"];
const hillScene = (S) => S.put(`<g transform="scale(1)">${hill()}</g>`, 0, 0, 1, { anim: "none" });
const TRAD = (o = {}) => box("TRADITIONAL", { stamp: "TAX LATER", stampCol: C.red, ...o });
const ROTH = (o = {}) => box("ROTH", { stamp: "TAX NOW", stampCol: C.oliveDk, ...o });
// the staircase: lit steps, with the newest step popping on `at`
function stairs(S, lit, atNew = 0.3, opt = {}) {
  return S.put(staircase(5, lit - 1, STEPS, { skip: lit > 0 ? [lit - 1] : [] }), 560, G, opt.s || 0.95, { anim: "none" }) +
    (lit > 0 ? S.put(`<rect x="${(lit - 1) * 230}" y="${-lit * 110}" width="230" height="${lit * 110}" fill="${[C.olive, C.olive, C.olive, C.mustard, C.slate][lit - 1]}" stroke="${C.ink}" stroke-width="5"/>` +
      txt((lit - 1) * 230 + 32, -lit * 110 + 24, String(lit), 28, C.white, { font: "bold" }) + txt((lit - 1) * 230 + 115, -lit * 110 + 90, STEPS[lit - 1], 24, C.ink, { font: "bold" }), 560, G, opt.s || 0.95, { anim: "grow", at: atNew }) : "") +
    (lit > 0 ? S.put(bean({ pose: "cheer", face: "joy", noShadow: true }), 560 + ((lit - 1) * 230 + 115) * (opt.s || 0.95), G - lit * 110 * (opt.s || 0.95), 0.55, { anim: "drop", at: atNew + 0.2, idle: true }) : "") +
    S.sfx("pop", atNew, 0.25, 0.5);
}
function roll(S, label, x0, x1, s0, s1, at0, dur, id = "sb") {
  const y0 = hillY(x0) - 100 * s0, y1 = hillY(x1) - 100 * s1;
  return S.put(snowball(label), x0, y0, s0, { anim: "pop", id, at: Math.max(0, at0 - 0.25) }) +
    S.js(`tl.fromTo("#${S.id(id)}-i", { x: 0, y: 0, scale: 1, rotation: 0, transformOrigin: "50% 50%" }, { x: ${(x1 - x0) / s0}, y: ${(y1 - y0) / s0}, scale: ${s1 / s0}, rotation: ${Math.round((x1 - x0) / 3)}, duration: ${dur}, ease: "power1.in" }, ${at0});`);
}

export const BEATS = [
  /* ================= HOOK ================= */
  { at: "Here's a strange way to lose money", tag: "A STRANGE WAY TO LOSE MONEY", tagColor: "red",
    draw: (S) => B(S, { pose: "carry", face: "worried", item: box("", { w: 160, h: 110 }), itemScale: 0.8 }, 760, 1.05) +
      [0, 1, 2].map((i) => S.put(coin(26), 760 + i * 40, 820, 1, { anim: "none", id: `c${i}` })).join("") +
      S.js([0, 1, 2].map((i) => `tl.fromTo("#${S.id(`c${i}`)}-i", { y: 0, opacity: 0 }, { y: 180, opacity: 1, duration: 0.5, ease: "power2.in" }, ${(S.t("lose") + i * 0.2).toFixed(2)});`).join(" ")) },
  { at: "Not by spending it", tag: "NOT SPENDING. NOT BAD INVESTING.",
    draw: (S) => S.put(cart({ full: true }), 640, G, 1.2, { anim: "pop" }) + S.put(cross(1.6), 640, 640, 1, { anim: "grow", at: "spending" }) +
      S.put(`<rect x="-160" y="-170" width="320" height="170" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + chartLine([[-130, -150], [-60, -110], [0, -130], [60, -60], [130, -30]], C.red, 8), 1280, 900, 1, { anim: "pop", at: "investing" }) + S.put(cross(1.6), 1280, 640, 1, { anim: "grow", at: "badly" }) },
  { at: "just by putting it in the wrong box", tag: "...JUST THE WRONG BOX", tagColor: "red",
    draw: (S) => S.put(box("OOPS", { open: true }), 1250, G, 1.2, { anim: "pop" }) + B(S, { pose: "push", face: "neutral", item: snowball("$"), itemScale: 0.45 }, 620, 1, { anim: "slideL" }) + S.put(taxBite(), 1250, 520, 1, { anim: "grow", at: "box" }) + S.sfx("impact-bass-1", S.t("box") + 0.1, 0.25) },
  { at: "401K, IRA, Roth", tag: "SO MANY BOXES...",
    draw: (S) => [["401(K)", 0.1], ["IRA", "IRA"], ["ROTH IRA", "Roth IRA"], ["ROTH 401(K)", "Roth 401K"]].map(([l, w], i) => S.put(box(l, { w: 300, h: 230 }), 400 + i * 380, G, 0.95, { anim: "drop", at: w })).join("") },
  { at: "They sound like passwords", tag: "...LIKE ROBOT PASSWORDS",
    draw: (S) => PC(S, { screen: "BEEP", pose: "point", mouth: "flat" }, 560, 1) + S.put(laptop(["PASSWORD:", "R0TH-401K-IRA!"], { size: 44 }), 1250, 880, 1.2, { anim: "pop", at: "passwords" }) },
  { at: "And when your brain sees a confusing choice", tag: "A CONFUSING CHOICE...",
    draw: (S) => BR(S, { face: "foiled", pose: "shrug" }, 960, 1.1) + ["?", "?", "?"].map((q, i) => S.put(big(q, C.mustard, 110), 700 + i * 260, 360 - (i % 2) * 60, 1, { anim: "grow", at: S.t("confusing") + i * 0.15 })).join("") },
  { at: "it does the one thing", tag: "...SO IT DOES NOTHING", tagColor: "slate",
    draw: (S) => S.put(hammock(), 960, G, 1, { anim: "pop" }) + S.put(brain({ face: "yawn", pose: "down", noShadow: true }), 960, 830, 0.65, { anim: "drop", at: "safest" }) + S.put(txt(0, 0, "zzz", 70, C.grey, { font: "bold" }), 1200, 520, 1, { anim: "fade", at: "nothing" }) },
  { at: "Psychologists call this choice overload", tag: "CHOICE OVERLOAD", tagColor: "slate",
    draw: (S) => B(S, { pose: "cheeks", face: "worried" }, 960, 1) + Array.from({ length: 12 }, (_, i) => S.put(box(`FUND ${String.fromCharCode(65 + i)}`, { w: 170, h: 120 }), 960 + Math.cos(i / 12 * Math.PI * 2) * 560, 600 + Math.sin(i / 12 * Math.PI * 2) * 280, 0.8, { anim: "grow", at: S.t("overload") - 0.3 + i * 0.05 })).join("") },
  { at: "Researchers looking at real retirement plans", tag: "MORE FUNDS = FEWER SIGN-UPS", tagColor: "slate",
    draw: (S) => S.put(axes(900, 460), 520, 880, 1, { anim: "fade" }) + [[420, "10"], [360, "20"], [300, "30"], [240, "40"], [190, "50"]].map(([h, l], i) => S.put(`<rect x="-60" y="${-h}" width="120" height="${h}" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 34, `${l} FUNDS`, 26, C.ink, { font: "bold" }), 640 + i * 170, 880, 1, { anim: "rise", at: S.t("every") + i * 0.2 })).join("") + S.put(txt(0, 0, "SIGNED UP", 34, C.ink, { font: "bold" }), 600, 380, 1, { anim: "fade" }) },
  { at: "More choices, less saving", tag: "MORE CHOICES. LESS SAVING.", tagColor: "red",
    draw: (S) => S.put(big("CHOICES ↑", C.mustard, 120), 960, 420, 1, { anim: "slam", at: "choices" }) + S.put(big("SAVING ↓", C.red, 120), 960, 640, 1, { anim: "slam", at: "saving" }) + S.sfx("impact-bass-1", S.t("saving") + 0.2, 0.25) },
  { at: "And doing nothing is not free", tag: "DOING NOTHING ISN'T FREE",
    draw: (S) => S.put(hourglass(), 760, 820, 1.6, { anim: "pop" }) + S.put(priceTag("$$$", { size: 54, rot: 10, color: C.red, ink: C.white }), 1150, 520, 1.1, { anim: "drop", at: "free" }) },
  { at: "Remember the snowball from the last video", tag: "REMEMBER THE SNOWBALL?", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(snowball("$"), 300, hillY(300) - 80, 0.8, { anim: "grow", at: "snowball" }) + S.put(calendar(12, 4, { title: "EVERY YEAR", cw: 60, head: C.red, mark: () => cross(0.5) }), 1200, 560, 1, { anim: "pop", at: "year" }) },
  { at: "So today, we're going to make this simple", tag: "LET'S MAKE IT SIMPLE", tagColor: "olive",
    draw: (S) => B(S, { pose: "pointUp", face: "happy" }, 960, 1.1) },
  { at: "In the last video, we built the snowball", tag: "TODAY: WHERE IT LIVES", tagColor: "olive",
    draw: (S) => [["401(K)", C.mustard], ["IRA", C.olive], ["ROTH", C.terra]].map(([l, col], i) => S.put(storageDoor(l, { col }), 760 + i * 380, G, 0.9, { anim: "pop", at: S.t("Today") + i * 0.15 })).join("") +
      S.put(bean({ pose: "push", face: "determined", noShadow: true, item: snowball("$"), itemScale: 0.4 }), 300, G, 0.8, { anim: "slideL", idle: true }) },
  { at: "Because the box you choose", tag: "SAME GROWTH...",
    draw: (S) => [0, 1].map((i) => S.put(box(i ? "BOX B" : "BOX A", { open: true }), 700 + i * 520, G, 1.05, { anim: "pop", at: 0.1 + i * 0.15 }) + S.put(snowball("$"), 700 + i * 520, 560, 0.8, { anim: "grow", at: "grows" })).join("") },
  { at: "It changes how much of it you get to keep", tag: "...DIFFERENT TAXES", tagColor: "red",
    draw: (S) => S.put(snowball("$", { size: 100 }), 760, 600, 1.6, { anim: "none" }) + S.put(taxBite(), 1250, 560, 1.3, { anim: "slideR", at: "taxes" }) + S.put(txt(0, 0, "KEEP", 60, C.oliveDk, { font: "bold" }), 760, 840, 1, { anim: "fade", at: "keep" }) },
  { at: "By the end of this video", tag: "A SIMPLE ORDER", tagColor: "mustard",
    draw: (S) => S.put(staircase(3, 0, ["", "", ""]), 660, G, 1.1, { anim: "none" }) + [["one", 0], ["two", 1], ["three", 2]].map(([w, i]) => S.put(`<rect x="${i * 230}" y="${-(i + 1) * 110}" width="230" height="${(i + 1) * 110}" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(i * 230 + 115, -(i + 1) * 110 + 55, `STEP ${i + 1}`, 34, C.ink, { font: "bold" }), 660, G, 1.1, { anim: "grow", at: w })).join("") },
  { at: "And step one is literally free money", tag: "STEP 1 = FREE MONEY", tagColor: "olive",
    draw: (S) => S.put(gift("FREE $", C.olive), 760, G, 1.4, { anim: "drop" }) + S.put(sparkles(6, 260), 760, 600, 1, { anim: "grow", at: "free" }) +
      Array.from({ length: 10 }, (_, i) => S.put(personIcon(C.grey), 1150 + (i % 5) * 90, 560 + Math.floor(i / 5) * 140, 1.1, { anim: "pop", at: S.t("millions") + i * 0.05 })).join("") + S.put(txt(0, 0, "LEFT ON THE TABLE", 40, C.red, { font: "bold" }), 1330, 820, 1, { anim: "fade", at: "table" }) },

  /* ================= THE TWO DEALS ================= */
  { at: "But first, let's open the boxes", tag: "LET'S OPEN THE BOXES",
    draw: (S) => S.put(box("", { open: false }), 760, G, 1.3, { anim: "pop", id: "b1" }) + S.put(box("", { open: true }), 760, G, 1.3, { anim: "none", id: "b2" }) +
      S.js(`tl.fromTo("#${S.id("b2")}", { opacity: 0 }, { opacity: 1, duration: 0.1 }, ${S.t("open")}); tl.to("#${S.id("b1")}", { opacity: 0, duration: 0.1 }, ${S.t("open")});`) + B(S, { pose: "cheer", face: "happy" }, 1300, 1, { at: "scary" }) },
  { at: "Every one of these accounts is just a container", tag: "IT'S JUST A CONTAINER",
    draw: (S) => S.put(box("ACCOUNT", { open: true, w: 420, h: 300 }), 960, G, 1.1, { anim: "pop" }) + S.put(txt(0, 0, "(just a box)", 50, C.ink), 960, 470, 1, { anim: "fade", at: "container" }) },
  { at: "Inside it, you put the same boring stuff", tag: "SAME BORING STUFF INSIDE", tagColor: "olive",
    draw: (S) => S.put(box("ACCOUNT", { open: true, w: 420, h: 300 }), 960, G, 1.1, { anim: "none" }) +
      [["Index", "INDEX", C.mustard], ["target", "TARGET", C.olive]].map(([w, l, col], i) => S.put(ingredientJar(l, "", col), 860 + i * 200, 560, 0.7, { anim: "drop", at: w })).join("") },
  { at: "The box doesn't change what you invest in", tag: "IT ONLY CHANGES THE TAX", tagColor: "red",
    draw: (S) => S.put(box("ACCOUNT", { w: 420, h: 300 }), 960, G, 1.1, { anim: "none" }) + S.put(stampSvg("TAX", C.red, 90, -10), 960, 640, 1, { anim: "slam", at: "taxed" }) + S.sfx("impact-bass-1", S.t("taxed") + 0.2, 0.25) },
  { at: "And there are really only two tax deals", tag: "ONLY 2 TAX DEALS",
    draw: (S) => [["DEAL 1", C.mustard], ["DEAL 2", C.olive]].map(([l, col], i) => S.put(envelope(l, { seal: true, w: 380, h: 240, size: 50, color: C.white }), 700 + i * 520, 760, 1, { anim: "drop", at: S.t("two") + i * 0.2 })).join("") },
  { at: "Deal one, pay the tax later", tag: "DEAL 1: PAY TAX LATER", tagColor: "mustard",
    draw: (S) => S.put(TRAD({ w: 420, h: 300 }), 960, G, 1.1, { anim: "pop" }) + S.put(clock(), 1450, 460, 0.9, { anim: "grow", at: "later" }) },
  { at: "You put money in before tax", tag: "IN: NO TAX. OUT: TAX.", tagColor: "mustard",
    draw: (S) => S.put(coin(40), 360, 560, 1, { anim: "slideL" }) + S.put(arrow(200, C.olive, 50), 430, 560, 1, { anim: "wipe", at: "before" }) +
      S.put(snowball("$"), 960, 560, 1.1, { anim: "grow", at: "grows" }) + S.put(arrow(200, C.ink, 50), 1100, 560, 1, { anim: "wipe", at: "take" }) + S.put(taxBite(), 1500, 560, 1.1, { anim: "grow", at: "retirement" }) },
  { at: "That's called a traditional account", tag: "= TRADITIONAL", tagColor: "mustard",
    draw: (S) => S.put(TRAD({ w: 440, h: 320 }), 960, G, 1.15, { anim: "drop" }) + S.put(sparkles(5, 280), 960, 640, 1, { anim: "grow", at: "traditional" }) },
  { at: "Deal two, pay the tax now", tag: "DEAL 2: PAY TAX NOW", tagColor: "olive",
    draw: (S) => S.put(ROTH({ w: 420, h: 300 }), 960, G, 1.1, { anim: "pop" }) + S.put(taxBite(), 1450, 520, 0.8, { anim: "grow", at: "now" }) },
  { at: "You put money in after tax", tag: "IN: TAXED. OUT: $0 TAX.", tagColor: "olive",
    draw: (S) => S.put(taxBite(), 380, 420, 0.7, { anim: "pop" }) + S.put(coin(40), 380, 620, 1, { anim: "slideL" }) + S.put(arrow(200, C.olive, 50), 450, 620, 1, { anim: "wipe", at: "after" }) +
      S.put(snowball("$"), 960, 600, 1.1, { anim: "grow", at: "grows" }) + S.put(arrow(200, C.olive, 50), 1100, 600, 1, { anim: "wipe", at: "take" }) + S.put(big("$0 TAX", C.oliveDk, 100), 1550, 600, 1, { anim: "slam", at: "nothing" }) },
  { at: "Not on what you put in", tag: "NOT ON WHAT YOU PUT IN. NOT ON GROWTH.", tagColor: "olive", tagSize: 44,
    draw: (S) => S.put(coinStack(5, { label: "PUT IN" }), 700, G, 1.3, { anim: "rise" }) + S.put(check(1.2), 700, 420, 1, { anim: "grow", at: "in" }) + S.put(snowball("$"), 1250, 720, 1.4, { anim: "grow", at: "growth" }) + S.put(check(1.2), 1250, 420, 1, { anim: "grow", at: "growth" }) },
  { at: "That's a Roth", tag: "= ROTH", tagColor: "olive",
    draw: (S) => S.put(ROTH({ w: 440, h: 320 }), 960, G, 1.15, { anim: "drop" }) + S.put(sparkles(5, 280), 960, 640, 1, { anim: "grow", at: "Roth" }) },
  { at: "That's the whole secret", tag: "THE WHOLE SECRET",
    draw: (S) => S.put(TRAD(), 640, G, 1.15, { anim: "pop" }) + S.put(txt(0, 0, "TAX LATER", 56, C.mustard, { font: "bold" }), 640, 520, 1, { anim: "fade", at: "Traditional" }) +
      S.put(ROTH(), 1280, G, 1.15, { anim: "pop", at: "Roth" }) + S.put(txt(0, 0, "TAX NOW...", 56, C.oliveDk, { font: "bold" }), 1280, 470, 1, { anim: "fade", at: "Roth" }) + S.put(txt(0, 0, "...NEVER AGAIN", 48, C.oliveDk, { font: "bold" }), 1280, 540, 1, { anim: "fade", at: "never" }) },
  { at: "So which one wins?", tag: "SO WHICH ONE WINS?", tagColor: "mustard",
    draw: (S) => S.put(TRAD(), 600, G, 1, { anim: "pop" }) + S.put(ROTH(), 1320, G, 1, { anim: "pop" }) + S.put(big("VS", C.red, 110), 960, 560, 1, { anim: "slam" }) + BR(S, { face: "sly", pose: "shrug" }, 960, 0.6, { at: "tricks" }) },

  /* ================= FARMER ================= */
  { at: "Think of it like a farmer", tag: "THINK LIKE A FARMER",
    draw: (S) => S.put(`<rect x="0" y="${G - 40}" width="1920" height="140" fill="${C.woodDk}"/>` + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M ${i * 260} ${G - 20} q 60 -20 120 0" fill="none" stroke="${C.wood}" stroke-width="10"/>`).join(""), 0, 0, 1, { anim: "fade" }) +
      S.put(farmer(), 760, G, 1.1, { anim: "drop", idle: true }) + S.put(sun(), 1500, 300, 0.9, { anim: "rise" }) },
  { at: "A farmer can pay tax on the seeds", tag: "TAX THE SEEDS... OR THE HARVEST?", tagSize: 50,
    draw: (S) => S.put(seedBag(), 560, G, 1.2, { anim: "pop", at: "seeds" }) + S.put(harvest(), 1300, G, 0.85, { anim: "rise", at: "harvest" }) + S.put(big("OR", C.ink, 90), 900, 640, 1, { anim: "grow", at: "or" }) },
  { at: "The seeds are small", tag: "SMALL SEEDS. HUGE HARVEST.", tagColor: "olive",
    draw: (S) => S.put(seedBag(), 420, G, 0.6, { anim: "pop" }) + S.put(harvest("", 1), 1150, G, 1.25, { anim: "rise", at: "harvest" }) + S.put(farmer({ pose: "cheer", face: "joy" }), 760, G, 0.7, { anim: "pop", at: "huge", idle: true }) },
  { at: "A traditional account taxes the harvest", tag: "TRADITIONAL TAXES THE HARVEST", tagColor: "mustard",
    draw: (S) => S.put(harvest(), 960, G, 1.05, { anim: "none" }) + S.put(taxBite("TAX"), 1350, 460, 1.4, { anim: "slideR", at: "harvest" }) + S.put(TRAD({ w: 240, h: 180 }), 360, G, 0.9, { anim: "pop" }) + S.sfx("whoosh", S.t("harvest"), 0.25, 0.6) },
  { at: "A Roth taxes the seeds", tag: "ROTH TAXES THE SEEDS", tagColor: "olive",
    draw: (S) => S.put(seedBag(), 960, G, 1.4, { anim: "none" }) + S.put(taxBite("TAX"), 1320, 600, 0.7, { anim: "slideR", at: "seeds" }) + S.put(ROTH({ w: 240, h: 180 }), 360, G, 0.9, { anim: "pop" }) + S.put(txt(0, 0, "(much smaller bite)", 44, C.ink), 1320, 780, 1, { anim: "fade", at: "seeds" }) },
  { at: "Let's put numbers on it",
    draw: (S) => S.receipt({ x: 1060, y: 200, w: 600, title: "THE ROTH PLAN", lines: [["INVEST", "$500/MO"], ["FROM AGE", "25 → 65"], ["AVG GROWTH", "7%/YR"]], at: "500", printDur: 0.9 }) + PC(S, { screen: "$500/MO", pose: "point" }, 560, 1) },
  { at: "You put in about $240", tag: "YOU PUT IN...",
    draw: (S) => S.put(coinStack(8), 700, G, 1.4, { anim: "rise" }) + S.put(S.countText(0, 0, 0, 240000, { at: "240", size: 140, color: C.ink }), 1300, 560, 1, { anim: "grow", at: S.t("240") - 0.05 }) },
  { at: "By 65, the snowball has grown", tag: "BY 65...", tagColor: "olive",
    draw: (S) => S.put(snowball("$", { size: 110 }), 560, 640, 2.3, { anim: "grow", at: "snowball" }) + S.put(S.countText(0, 0, 0, 1300000, { at: "roughly", size: 140, color: C.olive, stroke: true }), 1320, 560, 1, { anim: "grow", at: S.t("roughly") - 0.05 }) },
  { at: "That's more than a million dollars of growth", tag: "$1M+ OF PURE GROWTH", tagColor: "olive",
    draw: (S) => S.put(`<rect x="-150" y="-180" width="300" height="180" fill="${C.slate}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -90, "$240K", 52, C.ink, { font: "bold" }) + txt(0, 40, "YOU PUT IN", 34, C.ink, { font: "bold" }), 760, 880, 1, { anim: "rise" }) +
      S.put(`<rect x="-150" y="-640" width="300" height="640" fill="${C.gold}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, -320, "$1.06M", 52, C.ink, { font: "bold" }) + txt(0, 40, "GROWTH", 34, C.ink, { font: "bold" }), 1160, 880, 1, { anim: "rise", at: "million" }) },
  { at: "And in a Roth, you never pay tax on any of it", tag: "TAX ON ALL OF IT: $0", tagColor: "olive",
    draw: (S) => S.put(snowball("$", { size: 110 }), 960, 600, 2.4, { anim: "none" }) + S.put(stampSvg("TAX-FREE", C.oliveDk, 90, -10), 960, 600, 1, { anim: "slam", at: "never" }) + S.sfx("chime", S.t("never") + 0.2, 0.3) },

  /* ================= PRESENT BIAS ================= */
  { at: "So why would anyone choose traditional?", tag: "WHY PICK TRADITIONAL?",
    draw: (S) => B(S, { pose: "think", face: "thinking" }, 760, 1.05) + S.put(TRAD(), 1300, G, 1, { anim: "pop", at: "traditional" }) },
  { at: "Because your brain loves a reward today", tag: "YOUR BRAIN LOVES 'NOW'", tagColor: "red",
    draw: (S) => BR(S, { face: "love", pose: "hug", item: gift("NOW", C.red), itemScale: 0.5 }, 960, 1.15) + S.put(sparkles(6, 260), 960, 600, 1, { anim: "grow", at: "today" }) },
  { at: "A traditional account cuts your tax bill this year", tag: "SMALLER TAX BILL. TODAY.", tagColor: "mustard",
    draw: (S) => S.put(letter(["TAX BILL", "-", "2026", "$$$$"], { w: 300, h: 340, size: 40 }), 860, 900, 1.1, { anim: "pop" }) + S.put(scissorsLocal(), 1250, 640, 1.2, { anim: "slideR", at: "cuts" }) + S.put(check(1.2), 1350, 380, 1, { anim: "grow", at: "away" }) },
  { at: "The Roth's reward shows up decades later", tag: "THE ROTH PAYS OFF... LATER",
    draw: (S) => S.put(calendar(30, 10, { title: "DECADES", cw: 54, head: C.oliveDk }), 760, 760, 1, { anim: "pop" }) + S.put(bean({ pose: "cheer", face: "joy", old: true }), 1450, G, 0.9, { anim: "pop", at: "later", idle: true }) },
  { at: "And your brain is terrible at caring about future you", tag: "\"FUTURE YOU? WHO'S THAT?\"", tagColor: "red",
    draw: (S) => BR(S, { face: "yawn", pose: "shrug" }, 700, 1.05) + S.put(ghost(bean({ pose: "wave", face: "smile", old: true, noShadow: true })), 1350, G, 0.9, { anim: "fade", at: "future" }) },
  { at: "Psychologists call it present bias", tag: "PRESENT BIAS", tagColor: "slate",
    draw: (S) => PC(S, { screen: "NOW>LATER", pose: "point", mouth: "o" }, 640, 1.05) + S.put(gift("NOW", C.red), 1250, G, 1.1, { anim: "drop", at: "bias" }) },
  { at: "A dollar today feels much bigger", tag: "$1 TODAY FEELS BIGGER", tagColor: "slate",
    draw: (S) => S.put(big("$1", C.oliveDk, 260), 700, 560, 1, { anim: "grow" }) + S.put(txt(0, 0, "TODAY", 60, C.ink, { font: "bold" }), 700, 720, 1, { anim: "fade" }) +
      S.put(big("$1", C.grey, 100), 1300, 560, 1, { anim: "grow", at: "30" }) + S.put(txt(0, 0, "IN 30 YEARS", 44, C.ink, { font: "bold" }), 1300, 680, 1, { anim: "fade", at: "30" }) },
  { at: "Even when the dollar in 30 years", tag: "EVEN THOUGH IT'S WORTH FAR MORE", tagColor: "olive",
    draw: (S) => S.put(big("$1", C.grey, 100), 700, 560, 1, { anim: "none" }) + S.put(moneyBag("$$$", { size: 60 }), 1250, G, 1.5, { anim: "grow", at: "worth" }) + S.put(arrow(260, C.olive, 60), 820, 560, 1, { anim: "wipe", at: "worth" }) },
  { at: "But here's the honest part", tag: "THE HONEST PART", tagColor: "slate",
    draw: (S) => PC(S, { screen: "HONEST", pose: "up", mouth: "smile" }, 960, 1.1) },
  { at: "Traditional isn't a trick", tag: "TRADITIONAL ISN'T A TRICK", tagColor: "mustard",
    draw: (S) => S.put(TRAD({ w: 400, h: 290 }), 960, G, 1.1, { anim: "pop" }) + S.put(check(1.6), 1350, 520, 1, { anim: "grow", at: "better" }) },
  { at: "The real question is simple", tag: "YOUR TAX RATE: NOW OR LATER?", tagColor: "slate",
    draw: (S) => S.put(gauge2(0.35, "NOW"), 760, 860, 1.3, { anim: "rise", at: "now" }) + S.put(gauge2(0.7, "LATER"), 1160, 860, 1.3, { anim: "rise", at: "later" }) + S.put(big("?", C.mustard, 140), 960, 360, 1, { anim: "grow", at: "higher" }) },
  { at: "If you're early in your career", tag: "EARLY CAREER → ROTH", tagColor: "olive",
    draw: (S) => B(S, { pose: "wave", face: "happy" }, 560, 0.9) + S.put(gauge2(0.25, "TAX NOW"), 900, 880, 1.1, { anim: "rise", at: "lower" }) + S.put(ROTH(), 1400, G, 1.1, { anim: "drop", at: "Roth" }) + S.put(check(1.2), 1400, 560, 1, { anim: "grow", at: "sense" }) },
  { at: "You pay tax while your rate is low", tag: "TAX-FREE FOREVER", tagColor: "olive",
    draw: (S) => S.put(ROTH({ open: true, w: 400, h: 280 }), 960, G, 1.1, { anim: "none" }) + S.put(snowball("$"), 960, 560, 0.6, { anim: "grow", at: "snowball", id: "sn" }) + S.js(`tl.to("#${S.id("sn")}-i", { scale: 2.2, transformOrigin: "50% 100%", duration: 1.2, ease: "power2.in" }, ${S.t("grows")});`) },
  { at: "If you're in your peak earning years", tag: "PEAK EARNINGS → TRADITIONAL", tagColor: "mustard",
    draw: (S) => B(S, { pose: "hold", face: "smug", tie: true, item: moneyBag("$"), itemScale: 0.5 }, 560, 0.9) + S.put(gauge2(0.85, "TAX NOW"), 900, 880, 1.1, { anim: "rise", at: "high" }) + S.put(TRAD(), 1400, G, 1.1, { anim: "drop", at: "traditional" }) },
  { at: "You skip tax at today's high rate", tag: "SKIP HIGH TAX NOW. PAY LOWER LATER.", tagSize: 46,
    draw: (S) => S.put(gauge2(0.85, "TODAY"), 700, 860, 1.2, { anim: "pop" }) + S.put(cross(1.2), 700, 480, 1, { anim: "grow", at: "skip" }) + S.put(arrow(220, C.ink, 50), 820, 700, 1, { anim: "wipe", at: "later" }) + S.put(gauge2(0.45, "LATER"), 1250, 860, 1.2, { anim: "pop", at: "lower" }) },
  { at: "And if you honestly don't know", tag: "NOT SURE? SPLIT IT.", tagColor: "slate",
    draw: (S) => S.put(pie([0.5, 0.5], [C.olive, C.mustard], 230), 960, 560, 1, { anim: "grow", at: "split" }) + S.put(txt(0, 0, "ROTH", 54, C.white, { font: "bold" }), 1060, 560, 1, { anim: "fade", at: "Roth" }) + S.put(txt(0, 0, "TRAD", 54, C.ink, { font: "bold" }), 850, 560, 1, { anim: "fade", at: "traditional" }) },
  { at: "That way, whatever taxes look like", tag: "COVERED EITHER WAY", tagColor: "olive",
    draw: (S) => S.put(TRAD(), 640, G, 1, { anim: "pop" }) + S.put(ROTH(), 1280, G, 1, { anim: "pop" }) + S.put(check(1.2), 640, 560, 1, { anim: "grow", at: "covered" }) + S.put(check(1.2), 1280, 560, 1, { anim: "grow", at: "either" }) },
  { at: "There's one more thing that makes the Roth IRA special", tag: "ROTH IRA BONUS", tagColor: "mustard",
    draw: (S) => S.put(ROTH({ w: 420, h: 300 }), 960, G, 1.1, { anim: "pop" }) + S.put(star(70), 1350, 460, 1, { anim: "grow", at: "special" }) + S.sfx("sparkle", S.t("special"), 0.25, 1.5) },
  { at: "The money you put in", tag: "WHAT YOU PUT IN CAN COME BACK OUT", tagColor: "olive", tagSize: 48,
    draw: (S) => S.put(ROTH({ open: true, w: 420, h: 300 }), 960, G, 1.1, { anim: "none" }) + S.put(coinStack(5, { label: "PUT IN" }), 900, 560, 0.9, { anim: "pop" }) + S.put(snowball("$"), 1060, 600, 0.6, { anim: "pop", at: "growth" }) +
      S.put(cross(0.8), 1060, 500, 1, { anim: "grow", at: "growth" }) + S.put(coinStack(5), 1500, G, 0.9, { anim: "slideR", at: "taken" }) + S.put(arrow(260, C.olive, 50), 1150, 700, 1, { anim: "wipe", at: "taken" }) },
  { at: "That flexibility helps a lot of people", tag: "SAFE ENOUGH TO START", tagColor: "olive",
    draw: (S) => S.put(cushion(), 960, G - 40, 1.2, { anim: "pop" }) + S.put(bean({ pose: "cheer", face: "joy" }), 960, G - 120, 0.85, { anim: "drop", at: "safe", idle: true }) },
  { at: "But hold on", tag: "HOLD ON...", tagColor: "red",
    draw: (S) => S.put(stopSign(), 960, G, 1.4, { anim: "drop" }) + S.sfx("impact-bass-1", 0.3, 0.25) },
  { at: "Before you pick Roth or traditional", tag: "ONE STEP BEATS BOTH", tagColor: "olive",
    draw: (S) => S.put(TRAD({ w: 220, h: 160 }), 1300, G, 0.8, { anim: "pop" }) + S.put(ROTH({ w: 220, h: 160 }), 1560, G, 0.8, { anim: "pop" }) + S.put(gift("STEP ?", C.olive), 640, G, 1.3, { anim: "drop", at: "beats" }) + S.put(sparkles(5, 220), 640, 640, 1, { anim: "grow", at: "beats" }) },
  { at: "And it's the step your brain is most likely to skip", tag: "THE STEP YOUR BRAIN SKIPS", tagColor: "red",
    draw: (S) => S.put(staircase(3, 0, ["?", "", ""]), 700, G, 1, { anim: "none" }) + S.put(brain({ face: "grin", pose: "cheer", noShadow: true }), 600, G, 0.6, { anim: "pop", id: "jmp" }) +
      S.js(`tl.to("#${S.id("jmp")}-i", { x: 520, y: -260, duration: 0.6, ease: "power2.out" }, ${S.t("skip")});`) + S.put(cross(1), 815, 760, 1, { anim: "grow", at: "skip" }) },

  /* ================= 401K vs IRA + THE ORDER ================= */
  { at: "First, the difference between a 401K and an IRA", tag: "401(K) vs IRA",
    draw: (S) => S.put(box("401(K)", { w: 340, h: 250 }), 640, G, 1.1, { anim: "pop", at: "401k" }) + S.put(big("VS", C.red, 100), 960, 760, 1, { anim: "slam", at: "and" }) + S.put(box("IRA", { w: 340, h: 250 }), 1280, G, 1.1, { anim: "pop", at: "IRA" }) },
  { at: "A 401K is the box your job gives you", tag: "401(K): FROM YOUR JOB", tagColor: "mustard",
    draw: (S) => S.put(building({ label: "YOUR JOB" }), 500, G, 1, { anim: "pop" }) + S.put(letter(["PAYCHECK", "-", "$$$"], { w: 220, h: 220, size: 34 }), 960, 880, 1, { anim: "pop", at: "paycheck" }) +
      S.put(arrow(150, C.olive, 44), 1080, 760, 1, { anim: "wipe", at: "Automatic" }) + S.put(box("401(K)", { w: 300, h: 230 }), 1480, G, 1, { anim: "drop", at: "Automatic" }) },
  { at: "An IRA is a box you open yourself", tag: "IRA: YOU OPEN IT YOURSELF", tagColor: "olive",
    draw: (S) => S.put(building({ label: "BROKERAGE" }), 1450, G, 1, { anim: "pop", at: "brokerage" }) + B(S, { pose: "hold", face: "happy", item: box("IRA", { w: 200, h: 150, open: true }), itemScale: 0.8 }, 700, 1.05) },
  { at: "It stands for individual retirement account", tag: "INDIVIDUAL RETIREMENT ACCOUNT", tagColor: "slate",
    draw: (S) => S.put(bigLetters(["I", "R", "A"], ["INDIVIDUAL", "RETIREMENT", "ACCOUNT"]), 960, 560, 1, { anim: "pop" }) + S.put(txt(0, 0, "nobody opens it for you", 50, C.red), 960, 800, 1, { anim: "fade", at: "nobody" }) },
  { at: "Both can be traditional or Roth", tag: "EITHER CAN BE TRADITIONAL OR ROTH", tagSize: 48,
    draw: (S) => [["401(K)", "TAX LATER", C.mustard], ["401(K)", "TAX NOW", C.oliveDk], ["IRA", "TAX LATER", C.mustard], ["IRA", "TAX NOW", C.oliveDk]].map(([l, st, col], i) => S.put(box(l, { stamp: st, stampCol: col, w: 280, h: 200 }), 420 + i * 360, G, 0.95, { anim: "drop", at: 0.1 + i * 0.12 })).join("") },
  { at: "And now here's the order", tag: "HERE'S THE ORDER", tagColor: "mustard",
    draw: (S) => stairs(S, 0) + S.put(bean({ pose: "pointUp", face: "determined" }), 400, G, 0.8, { anim: "pop", idle: true }) },
  { at: "Step one, get the full match", tag: "STEP 1: GET THE FULL MATCH", tagColor: "olive",
    draw: (S) => stairs(S, 1, 0.2) + S.put(gift("MATCH", C.olive), 330, G, 0.9, { anim: "drop", at: "match" }) },
  { at: "Many employers will match", tag: "YOUR EMPLOYER ADDS MONEY",
    draw: (S) => S.put(building({ label: "YOUR JOB" }), 560, G, 1, { anim: "pop" }) + S.put(gift("MATCH", C.terra), 1000, G, 1.1, { anim: "drop", at: "match" }) + S.put(box("401(K)", { open: true }), 1450, G, 1.1, { anim: "pop", at: "401k" }) + S.put(txt(0, 0, "up to a limit", 44, C.ink), 1000, 560, 1, { anim: "fade", at: "limit" }) },
  { at: "Say you earn $60",
    draw: (S) => S.receipt({ x: 1040, y: 210, w: 640, title: "THE MATCH", lines: [["SALARY", "$60,000"], ["MATCH", "100%"], ["UP TO", "5% OF PAY"]], at: 0.1, printDur: 0.9 }) + B(S, { pose: "hold", face: "smile", item: letter(["PAY"], { w: 120, h: 120, size: 30 }) }, 560, 1) },
  { at: "You put in $3", tag: "YOU: $3,000 · THEM: $3,000", tagColor: "olive",
    draw: (S) => S.put(coinStack(6, { label: "YOU $3K", size: 44 }), 700, G, 1.4, { anim: "rise" }) + S.put(coinStack(6, { label: "THEM $3K", size: 44 }), 1240, G, 1.4, { anim: "rise", at: "they" }) + S.put(big("+", C.ink, 120), 970, 720, 1, { anim: "grow", at: "they" }) },
  { at: "That's an instant 100", tag: "INSTANT +100%", tagColor: "olive",
    draw: (S) => S.put(big("+100%", C.oliveDk, 220), 960, 520, 1, { anim: "slam" }) + S.put(txt(0, 0, "before it even starts growing", 50, C.ink), 960, 720, 1, { anim: "fade", at: "growing" }) + S.sfx("chime", 0.4, 0.3) },
  { at: "No index fund, no stock", tag: "NOTHING ELSE DOES THAT",
    draw: (S) => [["index", ingredientJar("INDEX", "", C.mustard)], ["stock", `<rect x="-150" y="-170" width="300" height="170" rx="10" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + chartLine([[-120, -30], [-60, -80], [0, -50], [60, -120], [120, -140]], C.olive, 8)], ["crypto", moonCoin()]].map(([w, svg], i) => S.put(svg, 520 + i * 440, 820, 1, { anim: "pop", at: w }) + S.put(cross(1.5), 520 + i * 440, 640, 1, { anim: "grow", at: S.t(w) + 0.3 })).join("") },
  { at: "If you take only one thing from this video", tag: "NEVER LEAVE THE MATCH ON THE TABLE", tagColor: "red", tagSize: 46,
    draw: (S) => S.put(`<rect x="-400" y="-20" width="800" height="40" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/><path d="M -360 20 L -360 200 M 360 20 L 360 200" stroke="${C.ink}" stroke-width="14"/>`, 960, 760, 1, { anim: "fade" }) +
      S.put(gift("MATCH", C.olive), 960, 740, 0.9, { anim: "drop", id: "gf" }) + B(S, { pose: "point", face: "determined" }, 400, 1, { at: "Never" }) + S.js(`tl.to("#${S.id("gf")}-i", { x: -380, duration: 0.5, ease: "power2.inOut" }, ${S.t("table")});`) },
  { at: "Check your benefits page", tag: "CHECK YOUR BENEFITS PAGE", tagColor: "olive",
    draw: (S) => S.put(phone(["BENEFITS", "401(K) MATCH", "UP TO 5%", "YOU: 3%"], { size: 28, head: C.oliveDk, glow: true, w: 300, h: 560 }), 960, 930, 1.05, { anim: "rise" }) + S.put(magnifier(), 1250, 560, 0.9, { anim: "pop", at: "number" }) + S.put(check(1.2), 1350, 400, 1, { anim: "grow", at: "all" }) },
  { at: "Step two, protect the snowball", tag: "STEP 2: PROTECT THE SNOWBALL", tagColor: "olive",
    draw: (S) => stairs(S, 2, 0.2) },
  { at: "Build your cash buffer", tag: "CASH BUFFER FIRST",
    draw: (S) => S.put(snowball("$"), 960, 840, 0.9, { anim: "pop" }) + S.put(cushion(), 960, 560, 1, { anim: "pop" }) + S.put(anvil(), 960, 440, 1, { anim: "drop", at: "emergency" }) + S.put(txt(0, 0, "no raiding retirement", 44, C.oliveDk, { font: "bold" }), 1500, 720, 1, { anim: "fade", at: "raid" }) },
  { at: "And pay off high interest debt", tag: "KILL 20% DEBT", tagColor: "red",
    draw: (S) => S.put(card({ mouth: true, label: "20%" }), 1150, 600, 1.5, { anim: "pop" }) + B(S, { pose: "push", face: "determined" }, 560, 1) },
  { at: "Step three, open a Roth IRA", tag: "STEP 3: OPEN A ROTH IRA", tagColor: "olive",
    draw: (S) => stairs(S, 3, 0.2) + S.put(ROTH({ w: 220, h: 160 }), 1600, 360, 0.9, { anim: "drop", at: "Roth" }) },
  { at: "After the match, many people put their next dollars", tag: "NEXT DOLLARS → ROTH IRA", tagColor: "olive",
    draw: (S) => S.put(box("ROTH IRA", { open: true, w: 380, h: 270 }), 960, G, 1.1, { anim: "pop" }) + [0, 1, 2].map((i) => S.put(coin(26), 900 + i * 60, 400, 1, { anim: "drop", at: S.t("dollars") + i * 0.15, d: 0.5 })).join("") + S.put(gift("MATCH ✓", C.olive), 400, G, 0.8, { anim: "pop" }) },
  { at: "You choose where it lives", tag: "YOUR BOX. YOUR FUNDS. LOW FEES.", tagColor: "olive", tagSize: 50,
    draw: (S) => S.put(box("ROTH IRA", { open: true, w: 380, h: 270 }), 960, G, 1.1, { anim: "none" }) +
      S.put(ingredientJar("INDEX", "", C.mustard), 500, G, 0.8, { anim: "pop", at: "funds" }) + S.put(priceTag("LOW FEES", { size: 36, rot: -8, color: C.olive }), 1450, 600, 1, { anim: "drop", at: "fees" }) },

  /* ================= THE CASH TRAP ================= */
  { at: "But here's a trap almost nobody warns you about", tag: "THE TRAP NOBODY MENTIONS", tagColor: "red",
    draw: (S) => S.put(trap(), 960, G, 1.4, { anim: "pop" }) + B(S, { pose: "cheeks", face: "shocked" }, 1500, 0.9, { at: "trap" }) },
  { at: "When you put money into an IRA", tag: "IT LANDS AS CASH...", tagColor: "red",
    draw: (S) => S.put(box("IRA", { open: true, w: 420, h: 280 }), 960, G, 1.1, { anim: "pop" }) + S.put(cashPile(), 960, 640, 1.2, { anim: "drop", at: "cash" }) + S.put(clock(), 1450, 460, 0.8, { anim: "grow", at: "sits" }) },
  { at: "Research from Vanguard found", tag: "VANGUARD: STILL IN CASH, YEARS LATER", tagColor: "slate", tagSize: 48,
    draw: (S) => S.put(clipboard([["VANGUARD", ""], ["THE COST OF", ""], ["CASH IN IRAS", ""]]), 600, 940, 1.05, { anim: "rise" }) + S.put(box("IRA", { open: true, w: 340, h: 240 }), 1350, G, 1, { anim: "pop", at: "moved" }) + S.put(cashPile(true), 1350, 700, 1, { anim: "fade", at: "cash" }) + S.put(calendar(12, 4, { title: "YEARS LATER", cw: 48, head: C.red }), 1350, 420, 0.9, { anim: "pop", at: "years" }) },
  { at: "Not invested, not growing, just waiting", tag: "NOT INVESTED. NOT GROWING.",
    draw: (S) => S.put(cashPile(true), 960, 840, 1.6, { anim: "none" }) + S.put(txt(0, 0, "zzz", 80, C.grey, { font: "bold" }), 1250, 500, 1, { anim: "fade", at: "waiting" }) + S.put(cross(1.2), 700, 480, 1, { anim: "grow", at: "invested" }) + S.put(cross(1.2), 960, 440, 1, { anim: "grow", at: "growing" }) },
  { at: "The box was right", tag: "RIGHT BOX. STUCK SNOWBALL.", tagColor: "red",
    draw: (S) => hillScene(S) + S.put(box("IRA", { open: true, w: 260, h: 180 }), 300, hillY(300) + 10, 0.9, { anim: "pop" }) + S.put(snowball("$"), 300, hillY(300) - 180, 0.6, { anim: "drop", at: "snowball" }) + S.put(txt(0, 0, "never left", 50, C.red, { font: "bold" }), 700, 300, 1, { anim: "fade", at: "never" }) },
  { at: "So when you open your IRA, do the last step", tag: "ACTUALLY BUY THE FUND", tagColor: "olive",
    draw: (S) => S.put(cashPile(), 560, 840, 1.2, { anim: "pop" }) + S.put(buyButton("BUY"), 960, 560, 1.2, { anim: "grow", at: "buy" }) + S.put(ingredientJar("INDEX", "", C.mustard), 1400, G, 1, { anim: "drop", at: "index" }) + S.put(ingredientJar("2060", "", C.olive), 1640, G, 0.8, { anim: "drop", at: "target" }) + S.sfx("click", S.t("buy"), 0.4, 0.4) },
  { at: "Then set up automatic contributions", tag: "AUTOMATIC CONTRIBUTIONS: ON", tagColor: "olive",
    draw: (S) => S.put(toggle(true), 960, 560, 2, { anim: "grow", at: "automatic" }) + S.sfx("click", S.t("automatic"), 0.4, 0.4) + B(S, { pose: "cheer", face: "content" }, 1450, 0.85, { at: "without" }) },
  { at: "Three steps down", tag: "3 STEPS DOWN...", tagColor: "olive",
    draw: (S) => S.put(staircase(5, 3, STEPS), 560, G, 0.95, { anim: "none" }) + S.put(bean({ pose: "cheer", face: "joy", noShadow: true }), 560 + 575 * 0.95, G - 330 * 0.95, 0.55, { anim: "drop", idle: true }) },
  { at: "but there's still one more box", tag: "...AND ONE COSTLY MISTAKE", tagColor: "red",
    draw: (S) => S.put(box("?", { w: 300, h: 220 }), 640, G, 1, { anim: "pop" }) + S.put(priceTag("−$$$$", { size: 44, rot: -10, color: C.red, ink: C.white }), 1200, 420, 1, { anim: "drop", at: "thousands" }) },

  /* ================= STEPS 4-5 ================= */
  { at: "Step four, go back to your 401K", tag: "STEP 4: BACK TO YOUR 401(K)", tagColor: "mustard",
    draw: (S) => stairs(S, 4, 0.2) },
  { at: "Once you've filled your IRA for the year", tag: "IRA FULL? → MORE 401(K)",
    draw: (S) => S.put(jar("IRA", 0.95), 700, G, 1.2, { anim: "pop" }) + S.put(check(1), 700, 560, 1, { anim: "grow", at: "filled" }) + S.put(arrow(200, C.olive, 50), 900, 760, 1, { anim: "wipe", at: "more" }) + S.put(jar("401(K)", 0.3), 1350, G, 1.2, { anim: "pop", at: "401k" }) },
  { at: "Every year, the government sets a limit", tag: "RAISE IT TOWARD THE LIMIT", tagColor: "mustard",
    draw: (S) => S.put(jar("401(K)", 0.3, { fillId: S.id("f") }), 960, G, 1.5, { anim: "pop" }) + S.put(`<path d="M -150 0 L 150 0" stroke="${C.red}" stroke-width="8" stroke-dasharray="20 12"/>` + txt(240, 0, "LIMIT", 44, C.red, { font: "bold" }), 960, 520, 1, { anim: "wipe", at: "limit" }) +
      S.js(`tl.fromTo("#${S.id("f")}", { scaleY: 1, transformOrigin: "50% 100%" }, { scaleY: 2.6, duration: ${Math.max(1.5, S.dur - S.t("raise") - 0.5).toFixed(2)}, ease: "power1.inOut" }, ${S.t("raise")});`) + S.put(letter(["RAISE!", "+$"], { w: 180, h: 180, size: 32 }), 1450, 840, 1, { anim: "pop", at: "raise" }) },
  { at: "Step five, if you've done all of that", tag: "STEP 5: A REGULAR BROKERAGE", tagColor: "slate",
    draw: (S) => stairs(S, 5, 0.3) + S.put(confetti(30, 1400, 500, 5), 960, 560, 1, { anim: "drop", at: "congratulations" }) + S.sfx("chime", S.t("congratulations"), 0.3) },
  { at: "No special tax deal", tag: "SAME BORING SNOWBALL",
    draw: (S) => S.put(box("BROKERAGE", { open: true, w: 400, h: 280 }), 760, G, 1.05, { anim: "pop" }) + S.put(snowball("$"), 760, 560, 0.8, { anim: "grow", at: "snowball" }) + S.put(ingredientJar("INDEX", "", C.mustard), 1300, G, 0.9, { anim: "drop", at: "index" }) + S.put(ingredientJar("PATIENCE", "", C.terra), 1560, G, 0.9, { anim: "drop", at: "patience" }) },
  { at: "That's the whole order", tag: "THE WHOLE ORDER", tagColor: "mustard",
    draw: (S) => S.put(staircase(5, 0, STEPS, { skip: [0, 1, 2, 3, 4] }), 560, G, 0.95, { anim: "none" }) + [["Match", 0], ["protect", 1], ["Roth", 2], ["back", 3], ["everything", 4]].map(([w, i]) => S.put(`<rect x="${i * 230}" y="${-(i + 1) * 110}" width="230" height="${(i + 1) * 110}" fill="${[C.olive, C.olive, C.olive, C.mustard, C.slate][i]}" stroke="${C.ink}" stroke-width="5"/>` + txt(i * 230 + 32, -(i + 1) * 110 + 24, String(i + 1), 28, C.white, { font: "bold" }) + txt(i * 230 + 115, -(i + 1) * 110 + 90, STEPS[i], 24, C.ink, { font: "bold" }), 560, G, 0.95, { anim: "grow", at: w })).join("") },

  /* ================= THE MISTAKE ================= */
  { at: "Now, the mistake", tag: "THE MISTAKE", tagColor: "red",
    draw: (S) => S.put(truck("NEW JOB"), 1150, G, 1.1, { anim: "slideR", at: "change" }) + B(S, { pose: "wave", face: "happy" }, 460, 0.9, { at: "jobs" }) },
  { at: "You get a letter about your old 401K", tag: "YOUR OLD 401(K)",
    draw: (S) => S.put(envelope("", { open: true, w: 420, h: 260 }), 960, 900, 1, { anim: "pop" }) + S.put(letter(["OLD 401(K)", "-", "BALANCE", "$48,000"], { w: 320, h: 340, size: 40 }), 960, 680, 1, { anim: "rise", at: "old" }) + BR(S, { face: "love", pose: "reach" }, 1550, 0.85, { at: "brain" }) },
  { at: "I could just cash this out", tag: "\"I COULD JUST CASH THIS OUT\"", tagColor: "red",
    draw: (S) => BR(S, { face: "grin", pose: "hold", item: letter(["$48,000"], { w: 200, h: 140, size: 34 }), itemScale: 0.9 }, 760, 1.1) + S.put(bubble("CASH IT OUT!", { size: 50, w: 400, h: 120, dx: 160, dy: -120 }), 900, 400, 1, { anim: "grow", at: "cash" }) },
  { at: "Please don't", tag: "PLEASE DON'T.", tagColor: "red",
    draw: (S) => S.put(stopSign(), 960, G, 1.5, { anim: "drop" }) + S.sfx("impact-bass-1", 0.3, 0.3) },
  { at: "If you cash out a retirement account before age 59",
    draw: (S) => S.receipt({ x: 620, y: 170, w: 680, title: "CASHING OUT AT 40", lines: [["BALANCE", "$48,000"], ["INCOME TAX (~22%)", "−$10,560"], ["10% PENALTY", "−$4,800"]], total: ["YOU GET", "$32,640"], at: "income", printDur: 1.0 }) },
  { at: "A big chunk of your snowball can disappear", tag: "GONE IN ONE AFTERNOON", tagColor: "red",
    draw: (S) => S.put(snowball("$", { size: 110 }), 960, 600, 2.2, { anim: "none", id: "sn" }) + S.put(taxBite(), 1300, 420, 1, { anim: "slideR", at: "chunk" }) +
      S.js(`tl.to("#${S.id("sn")}-i", { scale: 0.65, transformOrigin: "50% 50%", duration: 0.9, ease: "power2.in" }, ${S.t("disappear")});`) + S.sfx("whoosh", S.t("disappear"), 0.3, 0.6) },
  { at: "And worse, you lose all the growth", tag: "...AND DECADES OF GROWTH", tagColor: "red",
    draw: (S) => S.put(ghost(snowball("$", { size: 110 })), 1150, 560, 2.6, { anim: "fade", at: "growth" }) + S.put(snowball("$"), 560, 760, 0.8, { anim: "pop" }) + S.put(txt(0, 0, "what it could have been", 44, C.grey), 1150, 920, 1, { anim: "fade", at: "decades" }) },
  { at: "Instead, roll it over", tag: "ROLL IT OVER", tagColor: "olive",
    draw: (S) => S.put(box("OLD 401(K)", { open: true, w: 320, h: 230 }), 460, G, 1, { anim: "pop" }) + S.put(box("NEW PLAN / IRA", { open: true, w: 380, h: 250 }), 1450, G, 1, { anim: "pop", at: "Move" }) +
      S.put(snowball("$"), 460, 600, 0.8, { anim: "pop", id: "sn" }) + S.js(`tl.to("#${S.id("sn")}-i", { x: 1240, y: 60, rotation: 720, duration: 1.2, ease: "power1.inOut" }, ${S.t("roll")});`) + S.sfx("whoosh", S.t("roll"), 0.3, 0.6) },
  { at: "And then, remember the trap", tag: "...AND ACTUALLY INVEST IT", tagColor: "olive",
    draw: (S) => S.put(trap(), 560, G, 1, { anim: "pop" }) + S.put(buyButton("INVEST IT"), 1250, 600, 1.2, { anim: "grow", at: "invested" }) + S.put(check(1.2), 1250, 400, 1, { anim: "grow", at: "invested" }) },

  /* ================= CLOSE ================= */
  { at: "So, let's put it all together", tag: "PUTTING IT ALL TOGETHER",
    draw: (S) => B(S, { pose: "carry", face: "content", item: box("", { w: 180, h: 130 }), itemScale: 0.9 }, 960, 1.1) },
  { at: "The boxes aren't scary", tag: "TRADITIONAL = LATER · ROTH = NOW", tagSize: 52,
    draw: (S) => S.put(TRAD(), 640, G, 1.15, { anim: "pop", at: "Traditional" }) + S.put(ROTH(), 1280, G, 1.15, { anim: "pop", at: "Roth" }) + S.put(txt(0, 0, "...and never again", 48, C.oliveDk, { font: "bold" }), 1280, 520, 1, { anim: "fade", at: "never" }) },
  { at: "And the order is simple", tag: "MATCH → PROTECT → ROTH IRA...", tagColor: "olive",
    draw: (S) => S.put(staircase(5, 0, STEPS, { skip: [0, 1, 2] }), 560, G, 0.95, { anim: "none" }) + [["get", 0], ["Protect", 1], ["Open", 2]].map(([w, i]) => S.put(`<rect x="${i * 230}" y="${-(i + 1) * 110}" width="230" height="${(i + 1) * 110}" fill="${[C.olive, C.olive, C.olive, C.mustard, C.slate][i]}" stroke="${C.ink}" stroke-width="5"/>` + txt(i * 230 + 32, -(i + 1) * 110 + 24, String(i + 1), 28, C.white, { font: "bold" }) + txt(i * 230 + 115, -(i + 1) * 110 + 90, STEPS[i], 24, C.ink, { font: "bold" }), 560, G, 0.95, { anim: "grow", at: w })).join("") },
  { at: "Your brain will want to wait", tag: "\"WAIT FOR PERFECT\"", tagColor: "red",
    draw: (S) => BR(S, { face: "sly", pose: "hold", item: magnifier(), itemScale: 0.6 }, 560, 1) + [["account", "PERFECT ACCOUNT"], ["fund", "PERFECT FUND"], ["moment", "PERFECT MOMENT"]].map(([w, t], i) => S.put(priceTag(t, { size: 34, rot: -6 + i * 6 }), 1250, 380 + i * 170, 1, { anim: "drop", at: w })).join("") },
  { at: "But a good box you start today", tag: "GOOD TODAY > PERFECT IN 5 YEARS", tagColor: "olive", tagSize: 50,
    draw: (S) => S.put(box("TODAY", { open: true }), 640, G, 1.1, { anim: "pop" }) + S.put(snowball("$"), 640, 560, 1.1, { anim: "grow", at: "today" }) + S.put(big(">", C.gold, 160), 960, 680, 1, { anim: "slam", at: "beats" }) +
      S.put(box("IN 5 YEARS", { w: 320 }), 1300, G, 1.1, { anim: "pop", at: "perfect" }) + S.put(txt(0, 0, "(empty)", 44, C.grey), 1300, 560, 1, { anim: "fade", at: "five" }) },
  { at: "Pick the box", tag: "PICK. PUT. PUSH.", tagColor: "olive",
    draw: (S) => hillScene(S) + S.put(box("ROTH IRA", { open: true, w: 260, h: 180 }), 260, hillY(260) + 10, 0.85, { anim: "pop", at: "Pick" }) + roll(S, "$", 360, 1500, 0.5, 1.5, S.t("push"), Math.max(0.9, S.dur - S.t("push") - 0.2)) + S.sfx("whoosh", S.t("push"), 0.3, 0.6) },
  { at: "And if there's something stopping you", tag: "WHAT'S STOPPING YOU?",
    draw: (S) => S.put(staircase(5, 0, STEPS), 560, G, 0.95, { anim: "none" }) + S.put(card({ mouth: true, label: "DEBT" }), 670, G - 230, 0.9, { anim: "drop", at: "one" }) + B(S, { pose: "shrug", face: "worried" }, 360, 0.75) },
  { at: "like a credit card balance that never seems to shrink", tag: "A BALANCE THAT NEVER SHRINKS", tagColor: "red",
    draw: (S) => S.put(card({ mouth: true }), 760, 600, 1.6, { anim: "pop" }) + S.put(`<rect x="-200" y="-70" width="400" height="140" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>`, 1350, 560, 1, { anim: "pop" }) +
      S.put(S.countText(0, 0, 6200, 6400, { at: "pay", size: 80, color: C.red, d: 1.4, chime: false }), 1350, 566, 1, { anim: "none" }) },
  { at: "And in the next video", push: 1.0,
    draw: (S) => S.put(`<rect x="-440" y="-250" width="880" height="500" rx="18" fill="${C.red}" stroke="${C.ink}" stroke-width="8"/>` +
      `<rect x="-420" y="-230" width="840" height="120" fill="${C.ink}" opacity="0.4"/>` + txt(0, -170, "BREAK THE", 56, C.white, { font: "bold" }) + txt(0, -100, "DEBT TRAP", 70, C.gold, { font: "bold" }) +
      at(-260, 220, 0.55, bean({ pose: "push", face: "determined", noShadow: true })) + at(80, 160, 0.9, card({ mouth: true })) +
      `<circle r="56" fill="${C.white}" stroke="${C.ink}" stroke-width="6" cx="320" cy="150"/><path d="M 304 126 L 348 150 L 304 174 Z" fill="${C.red}"/>`, 960, 500, 1, { anim: "grow", at: "break" }) +
      S.put(at(-70, 0, 0.32, bean({ face: "happy", noShadow: true })) + at(10, 0, 0.26, brain({ face: "grin", noShadow: true })) + `<text x="70" y="-60" font-family="Archivo Black" font-size="64" fill="${C.ink}" dominant-baseline="middle">PESA<tspan fill="${C.terra}">BRAIN</tspan></text>`, 760, 960, 1, { anim: "rise", at: "it" }) },
];

const LIT = (lit) => `${[0, 1, 2, 3, 4].slice(0, lit).map((i) => `<rect x="${i * 230}" y="${-(i + 1) * 110}" width="230" height="${(i + 1) * 110}" fill="${[C.olive, C.olive, C.olive, C.mustard, C.slate][i]}" stroke="${C.ink}" stroke-width="5"/>` + txt(i * 230 + 32, -(i + 1) * 110 + 24, String(i + 1), 28, C.white, { font: "bold" }) + txt(i * 230 + 115, -(i + 1) * 110 + 90, STEPS[i], 24, C.ink, { font: "bold" })).join("")}`;
const INSERTS = {
  "Researchers looking at real retirement plans": [
    { at: "fewer people signed up at all", tag: "FEWER PEOPLE SIGNED UP", tagColor: "red",
      draw: (S) => Array.from({ length: 10 }, (_, i) => S.put(personIcon(i < 6 ? C.olive : C.grey), 500 + i * 100, 640, 1.2, { anim: "pop", at: 0.05 + i * 0.04, id: `p${i}` })).join("") +
        S.js([0, 1, 2, 3].map((i) => `tl.to("#${S.id(`p${2 + i}`)}-i", { y: 200, opacity: 0, duration: 0.4, ease: "power2.in" }, ${(0.6 + i * 0.15).toFixed(2)});`).join(" ")) + S.put(box("12 FUNDS", { w: 260, h: 180 }), 1550, G, 0.9, { anim: "pop" }) },
  ],
  "Remember the snowball from the last video": [
    { at: "is a year it never gets back", tag: "A YEAR YOU NEVER GET BACK", tagColor: "red",
      draw: (S) => S.put(calendar(12, 4, { title: "THIS YEAR", cw: 80, head: C.red }), 960, 820, 1, { anim: "pop" }) + S.put(stampSvg("GONE", C.red, 90, -12), 960, 560, 1, { anim: "slam", at: "never" }) + S.sfx("impact-bass-1", S.t("never") + 0.2, 0.25) },
  ],
  "By the end of this video": [
    { at: "It works for most people", tag: "WORKS FOR MOST PEOPLE", tagColor: "olive",
      draw: (S) => Array.from({ length: 8 }, (_, i) => S.put(personIcon([C.olive, C.slate, C.terra, C.mustard][i % 4]), 560 + i * 115, 640, 1.2, { anim: "pop", at: 0.05 + i * 0.05 })).join("") },
  ],
  "Let's put numbers on it": [
    { at: "It grows at 7", tag: "7% A YEAR · 40 YEARS", tagColor: "olive",
      draw: (S) => hillScene(S) + roll(S, "$", 300, 1500, 0.4, 1.4, 0.2, Math.max(1.2, S.dur - 0.4)) },
  ],
  "A 401K is the box your job gives you": [
    { at: "exactly like we talked about last time", tag: "AUTOMATIC, LIKE LAST TIME", tagColor: "olive",
      draw: (S) => S.put(toggle(true), 760, 560, 1.8, { anim: "grow" }) + S.put(jar("401(K)", 0.5, { fillId: S.id("f") }), 1300, G, 1.2, { anim: "pop" }) + S.js(`tl.fromTo("#${S.id("f")}", { scaleY: 1, transformOrigin: "50% 100%" }, { scaleY: 1.5, duration: 1.4, ease: "none" }, 0.4);`) },
  ],
  "Say you earn $60": [
    { at: "and your employer matches dollar for dollar", tag: "DOLLAR FOR DOLLAR, UP TO 5%", tagColor: "olive",
      draw: (S) => S.put(bill({ label: "$1" }), 700, 560, 1.4, { anim: "pop" }) + S.put(big("+", C.ink, 120), 960, 570, 1, { anim: "grow", at: "dollar" }) + S.put(bill({ label: "$1" }), 1220, 560, 1.4, { anim: "pop", at: "dollar" }) + S.put(txt(0, 0, "up to 5% of your pay", 52, C.ink, { font: "bold" }), 960, 780, 1, { anim: "fade", at: "5" }) },
  ],
  "When you put money into an IRA": [
    { at: "until you choose an investment", tag: "UNTIL YOU PICK SOMETHING", tagColor: "red",
      draw: (S) => B(S, { pose: "shrug", face: "worried" }, 560, 1) + ["INDEX FUND?", "TARGET 2060?", "S&P 500?"].map((t, i) => S.put(`<rect x="-170" y="-50" width="340" height="100" rx="12" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, t, 40, C.ink, { font: "bold" }), 1250, 380 + i * 170, 1, { anim: "slideR", at: 0.1 + i * 0.15 })).join("") },
  ],
  "Every year, the government sets a limit": [
    { at: "especially every time you get a raise", tag: "EVERY RAISE → BUMP IT UP", tagColor: "mustard",
      draw: (S) => [1, 2, 3, 4, 5].map((n, i) => S.put(`<rect x="-50" y="${-60 - i * 60}" width="100" height="${60 + i * 60}" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 30, `+${n}%`, 28, C.ink, { font: "bold" }), 640 + i * 160, 880, 1, { anim: "rise", at: 0.1 + i * 0.15 })).join("") + S.put(letter(["RAISE!"], { w: 180, h: 120, size: 36 }), 1500, 640, 1, { anim: "drop" }) },
  ],
  "And the order is simple": [
    { at: "Go back and raise your 401K", tag: "...401(K) → EVERYTHING ELSE", tagColor: "mustard",
      draw: (S) => S.put(staircase(5, 3, STEPS, { skip: [3, 4] }), 560, G, 0.95, { anim: "none" }) + [["Go", 3], ["everything", 4]].map(([w, i]) => S.put(`<rect x="${i * 230}" y="${-(i + 1) * 110}" width="230" height="${(i + 1) * 110}" fill="${[C.olive, C.olive, C.olive, C.mustard, C.slate][i]}" stroke="${C.ink}" stroke-width="5"/>` + txt(i * 230 + 32, -(i + 1) * 110 + 24, String(i + 1), 28, C.white, { font: "bold" }) + txt(i * 230 + 115, -(i + 1) * 110 + 90, STEPS[i], 24, C.ink, { font: "bold" }), 560, G, 0.95, { anim: "grow", at: w })).join("") +
        S.put(bean({ pose: "cheer", face: "joy", noShadow: true }), 560 + 1035 * 0.95, G - 550 * 0.95, 0.55, { anim: "drop", at: "everything", idle: true }) + S.sfx("chime", S.t("everything"), 0.3) },
  ],
};
Object.assign(INSERTS, {
  "The money you put in": [
    { at: "without tax or penalty", tag: "NO TAX. NO PENALTY.", tagColor: "olive",
      draw: (S) => S.put(stampSvg("NO TAX", C.oliveDk, 70, -8), 760, 520, 1, { anim: "slam", at: "tax" }) + S.put(stampSvg("NO PENALTY", C.oliveDk, 70, 6), 1200, 700, 1, { anim: "slam", at: "penalty" }) },
  ],
  "And pay off high interest debt": [
    { at: "A 20 interest rate will eat your snowball", tag: "20% EATS YOUR SNOWBALL", tagColor: "red",
      draw: (S) => S.put(card({ mouth: true, label: "20%" }), 1150, 600, 1.5, { anim: "pop" }) + S.put(snowball("$"), 600, 640, 1.1, { anim: "pop", id: "sn" }) + S.js(`tl.to("#${S.id("sn")}-i", { scale: 0.45, x: 200, transformOrigin: "50% 50%", duration: 1.2, ease: "power2.in" }, ${S.t("eat")});`) },
  ],
  "but there's still one more box": [
    { at: "usually right when you change jobs", tag: "...WHEN YOU CHANGE JOBS", tagColor: "red",
      draw: (S) => S.put(truck("NEW JOB"), 1150, G, 1.1, { anim: "slideR" }) + B(S, { pose: "wave", face: "happy" }, 460, 0.9, { at: "jobs" }) },
  ],
  "Step five, if you've done all of that": [
    { at: "Open a regular brokerage account", tag: "A REGULAR BROKERAGE ACCOUNT", tagColor: "slate",
      draw: (S) => S.put(building({ label: "BROKERAGE" }), 640, G, 1, { anim: "pop" }) + S.put(box("BROKERAGE", { open: true, w: 380, h: 260 }), 1300, G, 1.1, { anim: "drop", at: "brokerage" }) },
  ],
  "like a credit card balance that never seems to shrink": [
    { at: "that's not just bad luck", tag: "NOT BAD LUCK. A TRAP.", tagColor: "red",
      draw: (S) => S.put(trap(), 960, G, 1.6, { anim: "pop", at: "trap" }) + S.put(card({ mouth: true }), 960, 700, 0.8, { anim: "drop", at: "trap" }) + BR(S, { face: "foiled", pose: "cheeks" === "x" ? "down" : "shrug" }, 1550, 0.8, { at: "brain" }) },
  ],
});
const BASE = BEATS.splice(0);
for (const b of BASE) { BEATS.push(b); for (const x of INSERTS[b.at] || []) BEATS.push(x); }

function scissorsLocal() {
  return `<circle cx="-70" cy="-30" r="30" fill="none" stroke="${C.terra}" stroke-width="14"/><circle cx="-70" cy="30" r="30" fill="none" stroke="${C.terra}" stroke-width="14"/>
  <path d="M -44 -14 L 120 40 L 110 50 L -40 0 Z M -44 14 L 120 -40 L 110 -50 L -40 0 Z" fill="${C.grey}" stroke="${C.ink}" stroke-width="3.5"/><circle cx="0" cy="0" r="8" fill="${C.ink}"/>`;
}
