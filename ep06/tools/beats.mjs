// EP06 "How Much Money Should You Keep in the Bank?" — the weather episode.
// Same PesaBrain identity. This episode's devices: emergencies are storm clouds, the fund is an umbrella that grows
// level by level, a brick wall stands between Bean and the EP05 trap, a fund tank with three marks, and named accounts.
import {
  C, at, txt, bean, brain, calc, coffee, priceTag, coin, coinStack, bill, moneyBag, piggy, wallet, card, phone, envelope,
  calendar, car, jar, trophy, heart, clock, bubble, cloudThought, arrow, stampSvg, check, cross, sparkles, confetti, laptop,
  clipboard, building, gift, hourglass, sun, scissors, storm,
} from "../../moneybrain/tools/kit.mjs";
import { cushion } from "../../ep02/tools/props2.mjs";
import { hill, hillY, snowball, personIcon, hammock } from "../../ep03/tools/props3.mjs";
import { box, taxBite, trap } from "../../ep04/tools/props4.mjs";
import { anchor, statement, debtBall } from "../../ep05/tools/props5.mjs";
import { umbrella, raincloud, brickWall, repairBill, wrench, fundTank, roseGlasses, photoEnvelope, clunk, accountCard, padlock, iceCube } from "./props6.mjs";

const G = 940;
const B = (S, o, x, s = 1, opt = {}) => S.put(bean(o), x, G, s, { idle: true, ...opt });
const BR = (S, o, x, s = 1, opt = {}) => S.put(brain(o), x, G, s, { idle: true, ...opt });
const PC = (S, o, x, s = 1, opt = {}) => S.put(calc(o), x, G, s, { idle: true, ...opt });
const big = (t, col = C.ink, size = 150) => txt(0, 0, t, size, col, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` });
const pill = (t, col = C.white, size = 48) => { const w = Math.max(240, t.length * size * 0.66 + 80); return `<rect x="${-w / 2}" y="-52" width="${w}" height="104" rx="52" fill="${col}" stroke="${C.ink}" stroke-width="6"/>${txt(0, 4, t, size, C.ink, { font: "bold" })}`; };
const tag2 = (label, o = {}) => priceTag(label, { ...o, w: o.w || Math.round(label.length * (o.size || 40) * 0.68 + 80) });
// a row of 10 people, the first k highlighted
const people = (S, k, at0 = 0.2, col = C.olive) => [...Array(10)].map((_, i) => S.put(personIcon(i < k ? col : C.grey), 330 + i * 140, 800, 1.3, { anim: "pop", at: at0 + i * 0.07 })).join("");
const umbrellaBean = (S, x, size, label, opt = {}) => S.put(umbrella(label, { size, color: opt.color }), x + 20 * size, G - 60, 1, { anim: opt.anim || "pop", at: opt.at ?? 0.1 }) + B(S, { pose: "hold", face: opt.face || "content" }, x, opt.bs || 0.9);
const tooth = () => `<path d="M -60 -160 Q -80 -200 -40 -205 Q 0 -190 40 -205 Q 80 -200 60 -160 Q 50 -60 30 -10 Q 15 10 5 -40 Q 0 -60 -5 -40 Q -15 10 -30 -10 Q -50 -60 -60 -160 Z" fill="${C.white}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/>`;
const suitcase = () => `<rect x="-130" y="-170" width="260" height="170" rx="18" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="5"/><path d="M -50 -170 L -50 -200 L 50 -200 L 50 -170" fill="none" stroke="${C.ink}" stroke-width="5"/><path d="M -60 -150 L -60 -20 M 60 -150 L 60 -20" stroke="${C.ink}" stroke-width="5"/>`;
const shopBag = () => `<path d="M -110 -200 L 110 -200 L 130 0 L -130 0 Z" fill="${C.terra}" stroke="${C.ink}" stroke-width="5" stroke-linejoin="round"/><path d="M -50 -200 Q -50 -270 0 -270 Q 50 -270 50 -200" fill="none" stroke="${C.ink}" stroke-width="8"/>`;
const bar = (h, col, label, val) => `<rect x="-90" y="${-h}" width="180" height="${h}" fill="${col}" stroke="${C.ink}" stroke-width="6"/>${txt(0, -h - 44, val, 54, C.ink, { font: "bold" })}${txt(0, 44, label, 34, C.ink, { font: "bold" })}`;
const listCard = (items, w = 760) => items.map(([t], i) => `<g transform="translate(0 ${i * 120})"><rect x="${-w / 2}" y="-48" width="${w}" height="96" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>${txt(-w / 2 + 135, 4, t, 46, C.ink, { font: "bold", anchor: "start" })}</g>`).join("");

export const BEATS = [
  /* ================= HOOK ================= */
  { at: "Your car makes a noise", tag: "YOUR CAR MAKES A NOISE",
    draw: (S) => S.put(car({ color: C.slateDk }), 860, G, 1.6, { anim: "rise" }) + S.put(clunk("clunk!"), 1380, 640, 1.3, { anim: "pop", at: "noise" }) + S.shake(S.t("noise") + 0.1, 6) },
  { at: "And your stomach drops", tag: "...AND YOUR STOMACH DROPS", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked", sweat: true }, 960, 1.15) + S.put(arrow(220, C.red, 60), 1250, 540, 1, { rot: 90, anim: "wipe", at: "drops" }) + S.sfx("whoosh", S.t("drops"), 0.3, 0.6) },
  { at: "A mechanic, a clipboard", tag: "A MECHANIC. A CLIPBOARD. A NUMBER.",
    draw: (S) => S.put(wrench(), 560, 700, 1.6, { anim: "pop" }) + S.put(repairBill("$1,200"), 1160, G, 1.4, { anim: "rise", at: "clipboard" }) + S.sfx("impact-bass-1", S.t("number") + 0.6, 0.3) },
  { at: "Here's the real question", tag: "WHERE DOES $1,200 COME FROM?", tagColor: "mustard",
    draw: (S) => B(S, { pose: "shrug", face: "thinking" }, 760, 1.05) + S.put(big("$1,200", C.red, 150), 1350, 520, 1, { anim: "slam", at: "Where" }) + S.put(big("?", C.mustard, 160), 1350, 760, 1, { anim: "grow", at: "come" }) },
  { at: "For a lot of people", tag: "FOR MANY: FROM NOWHERE",
    draw: (S) => S.put(wallet({ open: true }), 960, 800, 2.2, { anim: "pop" }) + S.put(txt(0, 0, "...nothing", 64, C.ink), 960, 400, 1, { anim: "fade", at: "anywhere" }) },
  { at: "In the Federal Reserve's latest survey", tag: "FEDERAL RESERVE: A SURPRISE $400 BILL", tagColor: "slate",
    draw: (S) => S.put(clipboard([["FEDERAL RESERVE", ""], ["SURVEY OF", ""], ["HOUSEHOLDS", ""]]), 700, 940, 1.1, { anim: "rise" }) + S.put(tag2("$400 SURPRISE", { size: 48, rot: -6, color: C.gold }), 1180, 520, 1.1, { anim: "drop", at: 1.0 }) },
  { at: "only 63", tag: "ONLY 63% COULD COVER $400 IN CASH", tagColor: "red",
    draw: (S) => people(S, 6, 0.1) + S.countText(960, 460, 0, 63, { at: 0.2, size: 170, color: C.oliveDk, prefix: "", suffix: "%" }) },
  { at: "And in a 2026 survey", tag: "BANKRATE 2026", tagColor: "slate",
    draw: (S) => S.put(clipboard([["BANKRATE", ""], ["EMERGENCY SAVINGS", ""], ["REPORT, 2026", ""]]), 700, 940, 1.1, { anim: "rise" }) + S.put(tag2("$1,000 EMERGENCY", { size: 46, rot: -6, color: C.gold }), 1150, 520, 1.1, { anim: "drop", at: 1.0 }) },
  { at: "just 30", tag: "ONLY 30% WOULD PAY $1,000 FROM SAVINGS", tagColor: "red",
    draw: (S) => people(S, 3, 0.1) + S.countText(960, 460, 0, 30, { at: 0.2, size: 170, color: C.red, prefix: "", suffix: "%" }) },
  { at: "So what does everybody else do", tag: "EVERYBODY ELSE?",
    draw: (S) => B(S, { pose: "think", face: "thinking" }, 960, 1.1) },
  { at: "They swipe", tag: "THEY SWIPE", tagColor: "red",
    draw: (S) => S.put(card({ label: "22%" }), 960, 560, 1.8, { anim: "slideL" }) + S.put(sparkles(5, 260), 960, 560, 1, { anim: "grow", at: 0.3 }) + S.sfx("whoosh", 0.1, 0.3, 0.5) },
  { at: "And if you watched our last video", tag: "REMEMBER THE TRAP?",
    draw: (S) => S.put(anchor("MINIMUM", 160), 960, 220, 0.9, { anim: "drop" }) + S.put(statement(), 1450, 1000, 0.55, { anim: "slideR", at: "leads" }) },
  { at: "repair at", tag: "$1,200 AT 22%, MINIMUM PAYMENTS", tagColor: "red",
    draw: (S) => S.put(repairBill("$1,200"), 520, G, 1.0, { anim: "pop" }) + S.put(arrow(220, C.red, 54), 800, 640, 1, { anim: "wipe", at: "minimum" }) + S.put(card({ label: "22%" }), 1300, 600, 1.4, { anim: "pop", at: "22" }) },
  { at: "An emergency fund is the wall", tag: "THE WALL BETWEEN YOU AND THE TRAP", tagColor: "olive",
    draw: (S) => B(S, { pose: "cheer", face: "happy" }, 460, 0.9) + S.put(brickWall(420, 420, "FUND"), 960, G, 1, { anim: "rise", at: "wall" }) + S.put(trap(), 1450, G, 1.2, { anim: "pop", at: "trap" }) + S.sfx("impact-bass-1", S.t("wall") + 0.3, 0.3) },
  { at: "By the end of this video", tag: "1 · HOW MUCH YOURS SHOULD BE", tagColor: "mustard",
    draw: (S) => S.put(fundTank(0.5, ["$?", "", ""]), 960, 960, 1.1, { anim: "pop", at: "much" }) },
  { at: "But first, let's talk about why", tag: "WHY ALMOST NOBODY HAS ONE",
    draw: (S) => S.put(jar("FUND", 0.08), 960, G, 1.6, { anim: "pop" }) + S.put(txt(0, 0, "empty...", 56, C.ink), 1350, 560, 1, { anim: "fade", at: "nobody" }) },
  { at: "Because it's not that people are lazy", tag: "NOT LAZY...",
    draw: (S) => B(S, { pose: "down", face: "sleep" }, 760, 1) + S.put(cross(1.6), 760, 560, 1, { anim: "grow", at: "lazy" }) },
  { at: "Your brain is working against you", tag: "YOUR BRAIN IS WORKING AGAINST YOU", tagColor: "red",
    draw: (S) => BR(S, { face: "sly", pose: "hold" }, 960, 1.25) },

  /* ================= REASON #1: OPTIMISM BIAS ================= */
  { at: "The first reason", draw: (S) => S.chapter("REASON #1", "OPTIMISM BIAS") + S.put(brain({ face: "love", noShadow: true }), 960, G, 0.7, { anim: "rise", at: 0.5 }) },
  { at: "When we imagine the future", tag: "WE PICTURE THE GOOD VERSION", tagColor: "olive",
    draw: (S) => BR(S, { face: "love", pose: "hug" }, 760, 1.1) + S.put(roseGlasses(1.6), 760, G - 340, 1, { anim: "drop", at: 0.2 }) + S.put(sun(), 1380, 500, 1.3, { anim: "grow", at: "good" }) },
  { at: "Your car keeps running", tag: "CAR: FINE · JOB: SAFE · TEETH: FINE", tagColor: "olive", tagSize: 48,
    draw: (S) => [["car", car({ color: C.olive }), 0.9, 900], ["job", laptop(["JOB"], { size: 60 }), 0.8, 900], ["teeth", tooth(), 1.3, 880]].map(([w, svg, s, y], i) => S.put(svg, 440 + i * 520, y, s, { anim: "pop", at: w }) + S.put(check(1), 440 + i * 520, 420, 1, { anim: "grow", at: w })).join("") },
  { at: "Bad things happen, sure", tag: "\"BAD THINGS HAPPEN... TO OTHER PEOPLE\"",
    draw: (S) => B(S, { pose: "wave", face: "smug" }, 520, 1) + S.put(sun(), 520, 360, 0.9, { anim: "grow" }) + S.put(personIcon(C.grey), 1400, 860, 2.4, { anim: "pop", at: "other" }) + S.put(raincloud(), 1400, 420, 1, { anim: "drop", at: "other" }) },
  { at: "Emergencies aren't rare", tag: "EMERGENCIES AREN'T RARE", tagColor: "red",
    draw: (S) => [0, 1, 2].map((i) => S.put(raincloud("", { rain: true }), 480 + i * 480, 480 + (i % 2) * 80, 0.9, { anim: "drop", at: 0.15 + i * 0.25 })).join("") },
  { at: "Over a lifetime", tag: "OVER A LIFETIME: ALMOST GUARANTEED", tagColor: "red",
    draw: (S) => S.put(`<path d="M -760 0 L 760 0" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/>`, 960, 760, 1, { anim: "wipe" }) + [0, 1, 2, 3, 4].map((i) => S.put(raincloud("", { rain: false }), 340 + i * 310, 640, 0.5, { anim: "drop", at: 0.4 + i * 0.25 })).join("") + S.put(txt(0, 0, "AGE 20 → 80", 46, C.ink, { font: "bold" }), 960, 860, 1, { anim: "fade", at: "lifetime" }) },
  { at: "The car will break", tag: "THE CAR · SOMEONE SICK · A JOB ENDS",
    draw: (S) => [["car", "CAR", 0], ["sick", "SICK", 1], ["job", "JOB", 2]].map(([w, l, i]) => S.put(raincloud(l, { dark: true }), 440 + i * 520, 520, 1.1, { anim: "drop", at: w })).join("") },
  { at: "The only thing you don't know", tag: "THE ONLY UNKNOWN: THE DATE", tagColor: "mustard",
    draw: (S) => S.put(calendar(30, 6, { title: "WHEN?", cw: 66, head: C.slateDk }), 960, 930, 1.05, { anim: "pop" }) + S.put(big("?", C.mustard, 200), 1400, 480, 1, { anim: "grow", at: "date" }) },
  { at: "An emergency isn't a question of if", tag: "NOT IF. WHEN.", tagColor: "red",
    draw: (S) => S.put(big("IF", C.grey, 200), 640, 560, 1, { anim: "pop" }) + S.put(cross(2), 640, 560, 1, { anim: "grow", at: "surprise" }) + S.put(big("WHEN", C.red, 200), 1300, 560, 1, { anim: "slam", at: "when" }) + S.sfx("impact-bass-1", S.t("when") + 0.2, 0.3) },
  { at: "And there's a second reason", draw: (S) => S.chapter("REASON #2", "LAZY MONEY") + S.put(coin(40), 960, 860, 1.4, { anim: "rise", at: 0.5 }) },
  { at: "Because to your brain, an emergency", tag: "\"MONEY DOING NOTHING\"",
    draw: (S) => S.put(hammock(), 960, G, 1.1, { anim: "pop" }) + S.put(moneyBag("FUND"), 960, 820, 1.1, { anim: "drop", at: "money" }) + S.put(txt(0, 0, "z z z", 70, C.ink), 1250, 500, 1, { anim: "fade", at: "nothing" }) },
  { at: "If you've watched our Boring", tag: "INVESTED MONEY = A SNOWBALL", tagColor: "olive",
    draw: (S) => S.put(hill(), 0, 0, 1, { anim: "none" }) + S.put(bean({ pose: "push", face: "joy", noShadow: true }), 170, hillY(170) + 4, 0.55, { anim: "pop" }) + (() => { const x0 = 300, x1 = 1350, s0 = 0.5, s1 = 1.3, y0 = hillY(x0) - 100 * s0, y1 = hillY(x1) - 100 * s1; return S.put(snowball("$"), x0, y0, s0, { anim: "pop", id: "sb" }) + S.js(`tl.fromTo("#${S.id("sb")}-i", { x: 0, y: 0, scale: 1, rotation: 0, transformOrigin: "50% 50%" }, { x: ${(x1 - x0) / s0}, y: ${(y1 - y0) / s0}, scale: ${s1 / s0}, rotation: 380, duration: 1.8, ease: "power1.in" }, ${S.t("snowball") - 0.8});`); })() },
  { at: "So money just sitting in the bank", tag: "CASH IN THE BANK FEELS LAZY",
    draw: (S) => S.put(building({ label: "BANK" }), 600, G, 1, { anim: "pop" }) + S.put(coinStack(5), 1200, G, 1.4, { anim: "pop", at: "sitting" }) + S.put(txt(0, 0, "lazy money?", 60, C.red, { font: "bold" }), 1250, 540, 1, { anim: "slam", at: "Lazy" }) },
  { at: "So your brain says", tag: "\"WHY KEEP THOUSANDS SITTING THERE?\"", tagSize: 48,
    draw: (S) => BR(S, { face: "shout", pose: "mega" }, 700, 1.1) + S.put(bubble("EARNING|ALMOST NOTHING?!", { size: 44, w: 440, h: 150, dx: 160, dy: -120 }), 860, 470, 1, { anim: "grow", at: "earning" }) },
  { at: "Here's the twist", tag: "NOT AN INVESTMENT. INSURANCE.", tagColor: "olive",
    draw: (S) => S.put(chartLike(), 640, 820, 1, { anim: "pop" }) + S.put(cross(1.5), 640, 640, 1, { anim: "grow", at: "investment" }) + S.put(umbrella("INSURANCE", { size: 1.3, font: 40 }), 1350, 950, 1, { anim: "slam", at: "insurance" }) + S.sfx("impact-bass-1", S.t("insurance") + 0.2, 0.3) },
  { at: "And its return isn't the interest", tag: "ITS RETURN: WHAT IT STOPS", tagColor: "olive",
    draw: (S) => umbrellaBean(S, 760, 1.2, "FUND") + S.put(raincloud("", { dark: true }), 1450, 360, 1.0, { anim: "drop", at: "stops" }) },
  { at: "It stops a", tag: "IT STOPS: A 22% CARD BALANCE", tagColor: "olive",
    draw: (S) => S.put(card({ label: "22%", mouth: true }), 1350, 600, 1.4, { anim: "pop" }) + S.put(brickWall(220, 400), 960, G, 1, { anim: "rise", at: "becoming" }) + B(S, { pose: "stop", face: "determined" }, 520, 1) },
  { at: "It stops you from raiding", tag: "IT STOPS: RAIDING YOUR 401(K)", tagColor: "olive",
    draw: (S) => S.put(box("401(K)", { w: 340, h: 260 }), 960, G, 1.2, { anim: "pop" }) + S.put(taxBite("TAX"), 1450, 520, 0.8, { anim: "pop", at: "taxes" }) + S.put(stampSvg("STOPPED", C.oliveDk, 70, -10), 960, 640, 1, { anim: "slam", at: "penalties" }) },
  { at: "And it stops something that doesn't", tag: "...AND SOMETHING NOT ON ANY STATEMENT",
    draw: (S) => S.put(statement(), 960, 1000, 0.9, { anim: "rise" }) + S.put(big("?", C.mustard, 200), 1400, 500, 1, { anim: "grow", at: "statement" }) },
  { at: "Your brain.", tag: "YOUR BRAIN", tagColor: "red",
    draw: (S) => BR(S, { face: "meh", pose: "down" }, 960, 1.4) + S.sfx("pop", 0.1, 0.3, 0.5) },
  { at: "researchers published a study", tag: "SCIENCE, 2013", tagColor: "slate",
    draw: (S) => S.put(clipboard([["MANI, MULLAINATHAN", ""], ["SHAFIR & ZHAO", ""], ["SCIENCE, 2013", ""]]), 760, 940, 1.15, { anim: "rise" }) + PC(S, { screen: "2013", pose: "pointL" }, 1400, 0.95) },
  { at: "They found that when people", tag: "THINK ABOUT MONEY PROBLEMS → WORSE SCORES", tagColor: "red", tagSize: 46,
    draw: (S) => BR(S, { face: "foiled", pose: "shrug" }, 960, 1.1) + S.put(raincloud("$$$", { dark: true, size: 40 }), 960, 280, 0.9, { anim: "drop", at: "think" }) },
  { at: "Princeton described the size", tag: "LIKE −13 IQ POINTS · A LOST NIGHT'S SLEEP", tagColor: "red", tagSize: 44,
    draw: (S) => S.put(big("−13 IQ", C.red, 190), 960, 540, 1, { anim: "slam", at: "13" }) },
  { at: "Money worry takes up space", tag: "MONEY WORRY TAKES UP SPACE",
    draw: (S) => BR(S, { face: "meh", pose: "down" }, 760, 1.05) + S.put(cloudThought(txt(0, 0, "$?!", 80, C.red, { font: "bold" }), 170), 1250, 420, 1, { anim: "grow", at: "space" }) },
  { at: "It follows you to work", tag: "TO WORK · TO DINNER · TO BED",
    draw: (S) => [["work", 0], ["dinner", 1], ["bed", 2]].map(([w, i]) => S.put(bean({ pose: "down", face: "worried", noShadow: true }), 440 + i * 520, G, 0.75, { anim: "pop", at: w }) + S.put(raincloud("", { rain: true }), 440 + i * 520, 420, 0.6, { anim: "drop", at: w })).join("") },
  { at: "And a brain that's busy worrying", tag: "WORRIED BRAIN = WORSE DECISIONS", tagColor: "red",
    draw: (S) => BR(S, { face: "foiled", pose: "shrug" }, 760, 1.05) + S.put(raincloud("", { dark: true }), 760, 260, 0.7, { anim: "drop" }) + S.put(card(), 1350, 600, 1.1, { anim: "pop", at: "decisions" }) + S.put(cross(1.3), 1350, 600, 1, { anim: "grow", at: "money" }) },
  { at: "Now look at the other side", tag: "NOW, THE OTHER SIDE", tagColor: "olive",
    draw: (S) => S.put(sun(), 960, 560, 2, { anim: "grow" }) + S.sfx("sparkle", 0.2, 0.3) },
  { at: "Vanguard surveyed", tag: "VANGUARD 2025 · 12,000+ INVESTORS", tagColor: "slate",
    draw: (S) => [...Array(12)].map((_, i) => S.put(personIcon(C.slate), 300 + (i % 6) * 260, 640 + Math.floor(i / 6) * 240, 1.2, { anim: "pop", at: 0.1 + i * 0.06 })).join("") },
  { at: "People with at least", tag: "AT LEAST $2,000 IN EMERGENCY SAVINGS...", tagColor: "olive",
    draw: (S) => S.put(jar("$2,000", 0.6), 960, G, 1.8, { anim: "pop" }) },
  { at: "Even after accounting", tag: "EVEN AFTER INCOME AND WEALTH", tagColor: "slate",
    draw: (S) => PC(S, { screen: "STILL", pose: "up", mouth: "smile" }, 960, 1.1) },
  { at: "And people with no emergency savings said", tag: "NO CUSHION: ~7 HOURS A WEEK ON MONEY", tagColor: "red", tagSize: 46,
    draw: (S) => S.put(clock(), 700, 560, 1.6, { anim: "pop" }) + S.countText(1250, 560, 0, 7, { at: "7", size: 170, color: C.red, prefix: "", suffix: " HRS" }) + B(S, { pose: "cheeks", face: "worried", sweat: true }, 1250, 0.6) },
  { at: "People with a cushion", tag: "WITH A CUSHION: UNDER 4", tagColor: "olive",
    draw: (S) => S.put(cushion(), 700, 800, 1.3, { anim: "pop" }) + S.put(big("< 4 HRS", C.olive, 150), 1300, 540, 1, { anim: "slam", at: "Less" }) },
  { at: "So that money isn't doing nothing", tag: "IT'S BUYING SOMETHING MONEY USUALLY CAN'T", tagSize: 44,
    draw: (S) => S.put(moneyBag("FUND"), 760, G, 1.5, { anim: "pop" }) + S.put(gift("", C.olive), 1350, G, 1.3, { anim: "pop", at: "buying" }) },
  { at: "Peace of mind", tag: "PEACE OF MIND · A BRAIN THAT WORKS", tagColor: "olive",
    draw: (S) => umbrellaBean(S, 700, 1.3, "FUND", { face: "content" }) + BR(S, { face: "happy", pose: "cheer" }, 1400, 0.95, { at: "brain" }) },
  { at: "Okay, so you need one", tag: "SO... HOW MUCH?", tagColor: "mustard",
    draw: (S) => S.put(fundTank(0, ["?", "?", "?"]), 960, 960, 1.2, { anim: "pop" }) + S.put(big("?", C.mustard, 180), 1400, 480, 1, { anim: "grow", at: "much" }) },

  /* ================= HOW MUCH ================= */
  { at: "You've probably heard the classic", draw: (S) => S.chapter("HOW MUCH?", "THE NUMBER", { color: C.oliveDk }) + S.put(fundTank(0.15, ["", "", ""]), 960, 980, 0.7, { anim: "rise", at: 0.5 }) },
  { at: "Keep three to six months", tag: "THE RULE: 3–6 MONTHS OF EXPENSES", tagColor: "slate",
    draw: (S) => S.put(calendar(3, 3, { title: "3 MONTHS", cw: 120, head: C.olive }), 640, 860, 1, { anim: "pop", at: "three" }) + S.put(calendar(6, 3, { title: "6 MONTHS", cw: 120, head: C.slateDk }), 1300, 860, 1, { anim: "pop", at: "six" }) },
  { at: "But most people get one word wrong", tag: "MOST PEOPLE GET ONE WORD WRONG", tagColor: "red",
    draw: (S) => S.put(magnifierLike(), 960, 600, 1.6, { anim: "pop" }) },
  { at: "Expenses, not income", tag: "EXPENSES. NOT INCOME.",
    draw: (S) => S.put(pill("EXPENSES", C.olive, 60), 640, 560, 1.2, { anim: "slam" }) + S.put(pill("INCOME", C.white, 60), 1300, 560, 1.2, { anim: "pop", at: "income" }) + S.put(cross(1.6), 1300, 560, 1, { anim: "grow", at: "income" }) },
  { at: "And not all your expenses", tag: "ONLY WHAT KEEPS LIFE RUNNING",
    draw: (S) => B(S, { pose: "point", face: "smile" }, 640, 1) + S.put(house(), 1300, G, 1.2, { anim: "pop", at: "running" }) },
  { at: "Rent or mortgage", draw: (S) => S.receipt({ x: 600, y: 120, w: 720, title: "ESSENTIALS", lines: [["RENT / MORTGAGE", ""], ["FOOD", ""], ["UTILITIES", ""], ["INSURANCE", ""], ["TRANSPORT", ""], ["MIN. DEBT PAYMENTS", ""]], total: ["THAT'S IT", "✓"], at: 0.05, printDur: 1.6 }) },
  { at: "Not streaming, not eating out", tag: "NOT: STREAMING · EATING OUT · THE GYM",
    draw: (S) => [["streaming", laptop(["▶"], { size: 90 }), 0.7, 880], ["eating", coffee(), 1.3, 880], ["gym", dumbbell(), 1.2, 760]].map(([w, svg, s, y], i) => S.put(svg, 440 + i * 520, y, s, { anim: "pop", at: w }) + S.put(cross(1.2), 440 + i * 520, 640, 1, { anim: "grow", at: w })).join("") },
  { at: "If you lost your income tomorrow", tag: "THE FIRST THINGS YOU'D CUT", tagColor: "mustard",
    draw: (S) => S.put(scissors(), 960, 560, 2.2, { anim: "slideL", at: "cut" }) + S.put(laptop(["▶"], { size: 70 }), 520, 860, 0.6, { anim: "pop" }) + S.put(coffee(), 1420, 860, 1, { anim: "pop" }) },
  { at: "Let's do it for Bean", tag: "BEAN'S ESSENTIALS: $2,800 A MONTH", tagColor: "olive",
    draw: (S) => B(S, { pose: "hold", face: "thinking", item: clipboardMini(), itemScale: 0.6 }, 640, 1.05) + S.countText(1300, 560, 0, 2800, { at: "800", size: 150, color: C.ink }) },
  { at: "Three months is", tag: "3 MONTHS: $8,400 · 6 MONTHS: $16,800", tagColor: "slate",
    draw: (S) => S.put(jar("3 MO", 0.5), 640, G, 1.5, { anim: "pop" }) + S.countText(640, 400, 0, 8400, { at: "Three", size: 90 }) + S.put(jar("6 MO", 0.95), 1300, G, 1.9, { anim: "pop", at: "Six" }) + S.countText(1300, 300, 0, 16800, { at: "Six", size: 110, color: C.red }) },
  { at: "And this is where most people quit", tag: "WHERE MOST PEOPLE QUIT", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked", sweat: true }, 960, 1.1) },
  { at: "And your brain hates goals", tag: "YOUR BRAIN HATES IMPOSSIBLE GOALS",
    draw: (S) => BR(S, { face: "yawn", pose: "shrug" }, 960, 1.15) },
  { at: "Psychologists call this the goal", tag: "THE GOAL-GRADIENT EFFECT", tagColor: "slate",
    draw: (S) => PC(S, { screen: "GOAL", pose: "point", mouth: "o" }, 600, 1) + S.put(finishFlag(), 1350, G, 1.2, { anim: "drop", at: "gradient" }) },
  { at: "We try harder the closer", tag: "CLOSE TO THE GOAL = TRY HARDER", tagColor: "olive",
    draw: (S) => S.put(finishFlag(), 1300, G, 1.2, { anim: "pop" }) + B(S, { pose: "cheer", face: "determined", sweat: true }, 1000, 1) + S.put(`<path d="M -60 0 L -220 0 M -60 60 L -260 60 M -60 120 L -200 120" stroke="${C.ink}" stroke-width="8" stroke-linecap="round" opacity="0.5"/>`, 860, 640, 1, { anim: "fade" }) },
  { at: "And we barely try", tag: "FAR AWAY = BARELY TRY", tagColor: "red",
    draw: (S) => B(S, { pose: "down", face: "sleep" }, 360, 0.9) + S.put(finishFlag(), 1700, G, 0.4, { anim: "pop", at: "miles" }) + S.put(`<path d="M -560 0 L 560 0" stroke="${C.ink}" stroke-width="6" stroke-dasharray="20 18"/>`, 1030, G - 10, 1, { anim: "wipe", at: "miles" }) },
  { at: "So don't build one big fund", tag: "DON'T BUILD ONE BIG FUND", tagColor: "mustard",
    draw: (S) => S.put(jar("$16,800", 0.08), 960, G, 2.3, { anim: "pop" }) + S.put(cross(2), 960, 500, 1, { anim: "grow", at: "big" }) },
  { at: "Build it in three levels", tag: "BUILD IT IN 3 LEVELS", tagColor: "olive",
    draw: (S) => S.put(fundTank(0, ["LEVEL 1", "LEVEL 2", "LEVEL 3"]), 860, 1000, 1.1, { anim: "pop" }) + S.sfx("chime", S.t("levels"), 0.3) },
  { at: "Level one", tag: "LEVEL 1: $1,000", tagColor: "olive",
    draw: (S) => S.put(fundTank(0.2, ["$1,000", "", ""]), 560, 980, 1.0, { anim: "pop" }) + umbrellaBean(S, 1280, 0.9, "$1K", { face: "smile", bs: 0.8 }) },
  { at: "And it handles most", tag: "MOST OF LIFE'S SMALL DISASTERS",
    draw: (S) => umbrellaBean(S, 960, 1.1, "$1K", { face: "content" }) + [0, 1, 2].map((i) => S.put(raincloud("", { rain: true }), 600 + i * 360, 300, 0.55, { anim: "drop", at: 0.3 + i * 0.3 })).join("") },
  { at: "The car repair, the vet bill", tag: "CAR REPAIR · VET BILL · A FLIGHT HOME", tagSize: 48,
    draw: (S) => [["car", "CAR REPAIR"], ["vet", "VET BILL"], ["flight", "FLIGHT HOME"]].map(([w, l], i) => S.put(tag2(l, { size: 46, rot: i % 2 ? 8 : -6, color: [C.gold, C.white, C.gold][i] }), 330 + i * 520, 560, 1, { anim: "drop", at: w }) + S.put(check(1), 520 + i * 520, 800, 1, { anim: "grow", at: w })).join("") },
  { at: "Level two", tag: "LEVEL 2: 1 MONTH OF ESSENTIALS ($2,800)", tagColor: "olive", tagSize: 46,
    draw: (S) => S.put(fundTank(0.45, ["$1,000", "1 MONTH", ""]), 560, 980, 1.0, { anim: "pop" }) + umbrellaBean(S, 1280, 1.15, "1 MONTH", { face: "happy", bs: 0.8 }) },
  { at: "Now, a surprise doesn't just", tag: "IT DOESN'T EVEN HURT", tagColor: "olive",
    draw: (S) => umbrellaBean(S, 760, 1.2, "1 MONTH", { face: "joy" }) + S.put(raincloud("", { rain: true, dark: true }), 1400, 340, 1, { anim: "drop", at: 0.2 }) },
  { at: "Level three", tag: "LEVEL 3: 3–6 MONTHS", tagColor: "olive",
    draw: (S) => S.put(fundTank(0.95, ["$1,000", "1 MONTH", "3–6 MONTHS"]), 560, 980, 1.0, { anim: "pop" }) + umbrellaBean(S, 1300, 1.5, "3–6 MONTHS", { face: "content", bs: 0.8 }) },
  { at: "A layoff, an illness", tag: "A LAYOFF · AN ILLNESS · A FORCED MOVE", tagColor: "red", tagSize: 48,
    draw: (S) => [["layoff", "LAYOFF"], ["illness", "ILLNESS"], ["move", "MOVE"]].map(([w, l], i) => S.put(raincloud(l, { dark: true, size: 36 }), 400 + i * 560, 300 - (i % 2) * 40, 0.8, { anim: "drop", at: w })).join("") + umbrellaBean(S, 960, 1.15, "", { face: "content", bs: 0.75 }) },
  { at: "So, three or six", tag: "3 OR 6?", tagColor: "mustard",
    draw: (S) => S.put(pill("3", C.olive, 120), 640, 560, 1.6, { anim: "pop" }) + S.put(txt(0, 0, "or", 80, C.ink), 960, 560, 1, { anim: "fade" }) + S.put(pill("6", C.slate, 120), 1280, 560, 1.6, { anim: "pop", at: "six" }) },
  { at: "Lean toward three months", tag: "3 MONTHS: STEADY JOB · SECOND INCOME", tagColor: "olive", tagSize: 48,
    draw: (S) => S.put(laptop(["STEADY", "JOB"], { size: 50 }), 640, 880, 1, { anim: "pop", at: "steady" }) + S.put(bean({ pose: "wave", face: "happy", noShadow: true }), 1200, G, 0.8, { anim: "pop", at: "second" }) + S.put(bean({ pose: "wave", face: "happy", color: C.olive, noShadow: true }), 1420, G, 0.8, { anim: "pop", at: "income" }) },
  { at: "Lean towards six", tag: "6+: SELF-EMPLOYED · COMMISSION · ONE EARNER · KIDS", tagColor: "slate", tagSize: 40,
    draw: (S) => [["self", "SELF-EMPLOYED"], ["commission", "COMMISSION"], ["only", "ONE EARNER"], ["kids", "KIDS"]].map(([w, l], i) => S.put(pill(l, i % 2 ? C.white : C.slate, 46), 960, 340 + i * 150, 1, { anim: "slideL", at: w })).join("") },
  { at: "And yes, there is such a thing", tag: "TOO MUCH? YES.", tagColor: "mustard",
    draw: (S) => S.put(jar("CASH", 1), 960, G, 2.3, { anim: "pop" }) + S.put(coin(30), 900, 300, 1, { anim: "drop", at: "much" }) + S.put(coin(30), 1020, 280, 1, { anim: "drop", at: "much" }) },
  { at: "Once you're past about six months", tag: "PAST ~6 MONTHS: INFLATION NIBBLES IT", tagColor: "red",
    draw: (S) => S.put(iceCube("$"), 960, 900, 2.2, { anim: "pop", id: "ice" }) + S.js(`tl.to("#${S.id("ice")}-i", { scaleY: 0.7, transformOrigin: "50% 100%", duration: 2.5, ease: "none" }, ${S.t("loses")});`) + S.put(txt(0, 0, "INFLATION", 60, C.red, { font: "bold" }), 1450, 500, 1, { anim: "slam", at: "inflation" }) },
  { at: "That's when the extra should start", tag: "THE EXTRA → YOUR OWN SNOWBALL", tagColor: "olive",
    draw: (S) => S.put(hill(), 0, 0, 1, { anim: "none" }) + S.put(snowball("$"), 700, hillY(700) - 120, 1.2, { anim: "grow", at: "snowball" }) + S.put(coin(30), 420, 300, 1, { anim: "drop", at: "rolling" }) },
  { at: "But how much you keep", tag: "HOW MUCH = ONLY HALF THE ANSWER",
    draw: (S) => S.put(pie2(), 960, 600, 1.4, { anim: "pop" }) },
  { at: "Where you keep it matters", tag: "WHERE YOU KEEP IT MATTERS", tagColor: "red",
    draw: (S) => S.put(building({ label: "?" }), 640, G, 1, { anim: "pop" }) + S.put(jar("FUND", 0.9), 1300, G, 1.6, { anim: "pop", at: "keep" }) },

  /* ================= WHERE ================= */
  { at: "Most people keep their emergency", draw: (S) => S.chapter("WHERE?", "OUT OF SIGHT", { color: C.slateDk }) + S.put(padlock(), 960, 900, 1.3, { anim: "rise", at: 0.5 }) },
  { at: "Big mistake", tag: "IN CHECKING? BIG MISTAKE.", tagColor: "red",
    draw: (S) => S.put(phone(["CHECKING", "$4,100", "SPEND ME"], { size: 34, w: 300, h: 460, head: C.slateDk }), 960, 940, 1.2, { anim: "pop" }) + S.put(cross(1.8), 960, 560, 1, { anim: "grow", at: "mistake" }) },
  { at: "Money you can see", tag: "MONEY YOU SEE = MONEY YOU SPEND",
    draw: (S) => BR(S, { face: "love", pose: "reach" }, 640, 1.05) + S.put(coinStack(5), 1300, G, 1.4, { anim: "pop" }) + S.put(heart(), 1000, 420, 1, { anim: "grow", at: "spend" }) },
  { at: "If your emergency fund sits next", tag: "IT TURNS INTO A VACATION, A PHONE, A WEEKEND", tagSize: 42,
    draw: (S) => S.put(jar("FUND", 0.6), 960, G, 1.6, { anim: "pop" }) + [["vacation", suitcase(), 0.9], ["phone", phone([""], { w: 160, h: 280 }), 1], ["weekend", coffee(), 1.2]].map(([w, svg, s], i) => S.put(svg, [380, 1380, 1640][i], 900, i === 1 ? 0.75 : s, { anim: "pop", at: w })).join("") },
  { at: "Not all at once", tag: "A LITTLE AT A TIME", tagColor: "red",
    draw: (S) => [0.8, 0.6, 0.4, 0.2].map((l, i) => S.put(jar("", l), 440 + i * 350, G, 1.1, { anim: "pop", at: 0.1 + i * 0.4 })).join("") },
  { at: "So move it out of sight", tag: "MOVE IT OUT OF SIGHT", tagColor: "olive",
    draw: (S) => S.put(jar("FUND", 0.9), 960, G, 1.6, { anim: "none", id: "mv" }) + S.js(`tl.to("#${S.id("mv")}-i", { x: 1100, rotation: 15, duration: 0.8, ease: "power2.in" }, ${S.t("sight") - 0.2});`) + S.sfx("whoosh", S.t("sight"), 0.3, 0.5) },
  { at: "Put it in a separate high", tag: "A SEPARATE HIGH-YIELD SAVINGS · A DIFFERENT BANK", tagColor: "olive", tagSize: 40,
    draw: (S) => S.put(building({ label: "EVERYDAY" }), 520, G, 1.05, { anim: "pop" }) + S.put(building({ label: "SAVINGS" }), 1400, G, 1.05, { anim: "pop", at: "different" }) + S.put(arrow(380, C.olive, 60), 760, 600, 1, { anim: "wipe", at: "separate" }) + S.put(coin(36), 960, 540, 1, { anim: "slideL", at: "high" }) },
  { at: "Three things happen", tag: "1 · YOU DON'T SEE IT", tagColor: "olive",
    draw: (S) => S.put(phone(["MY BANK", "CHECKING", "$1,100"], { size: 34, w: 300, h: 460, head: C.slateDk }), 960, 940, 1.2, { anim: "pop" }) + S.put(txt(0, 0, "(no fund here)", 50, C.oliveDk), 1450, 560, 1, { anim: "fade", at: "see" }) },
  { at: "Moving it takes a day", tag: "2 · A DAY OR TWO = FRICTION", tagColor: "olive",
    draw: (S) => S.put(hourglass(), 700, 800, 1.6, { anim: "pop" }) + BR(S, { face: "foiled", pose: "shrug" }, 1300, 1, { at: "impulse" }) },
  { at: "And it earns interest", tag: "3 · OFTEN SEVERAL TIMES THE INTEREST", tagColor: "olive", tagSize: 48,
    draw: (S) => S.put(coinStack(1), 640, G, 1.4, { anim: "pop" }) + S.put(txt(0, 0, "typical savings", 40, C.ink, { font: "bold" }), 640, 990, 1, { anim: "fade" }) + S.put(coinStack(7), 1300, G, 1.4, { anim: "pop", at: "several" }) + S.put(txt(0, 0, "high-yield", 40, C.oliveDk, { font: "bold" }), 1300, 990, 1, { anim: "fade", at: "several" }) },
  { at: "Then give it a name", tag: "GIVE IT A NAME (NOT \"SAVINGS\")", tagColor: "mustard",
    draw: (S) => S.put(accountCard("SAVINGS", "$2,800", C.grey), 960, 560, 1.3, { anim: "pop" }) + S.put(cross(1.4), 960, 560, 1, { anim: "grow", at: "savings" }) },
  { at: "Call it emergency only", tag: "\"EMERGENCY ONLY\" · \"CAR BREAKS\" · \"DO NOT TOUCH\"", tagSize: 40,
    draw: (S) => [["emergency", "EMERGENCY ONLY"], ["car", "CAR BREAKS"], ["touch", "DO NOT TOUCH"]].map(([w, n], i) => S.put(accountCard(n, "$2,800", [C.olive, C.slateDk, C.red][i]), 960, 360 + i * 210, 1.1, { anim: "slideL", at: w })).join("") },
  { at: "That sounds silly", tag: "SILLY... BUT IT WORKS", tagColor: "olive",
    draw: (S) => B(S, { pose: "shrug", face: "smile" }, 960, 1.1) },
  { at: "Psychologists call it earmarking", tag: "EARMARKING", tagColor: "slate",
    draw: (S) => PC(S, { screen: "EARMARK", pose: "point", mouth: "o" }, 600, 1) + S.put(envelope("FUND"), 1300, 800, 1.4, { anim: "pop", at: "earmarking" }) },
  { at: "Your brain sorts money into mental buckets", tag: "MONEY WITH A JOB IS HARDER TO SPEND", tagSize: 48,
    draw: (S) => [["RENT", 0.7], ["FOOD", 0.5], ["FUN", 0.3], ["CAR", 0.9]].map(([l, v], i) => S.put(jar(l, v), 420 + i * 360, G, 1.1, { anim: "pop", at: 0.1 + i * 0.25 })).join("") + S.put(padlock(), 1500, 600, 0.8, { anim: "grow", at: "harder" }) },
  { at: "In one study in India", tag: "A STUDY IN INDIA: LABELLED ENVELOPES", tagColor: "slate",
    draw: (S) => [0, 1, 2].map((i) => S.put(photoEnvelope("SAVINGS", false), 480 + i * 480, 760, 1.1, { anim: "drop", at: 0.2 + i * 0.25 })).join("") + S.put(tag2("SAVED MORE", { size: 46, rot: -6, color: C.gold }), 960, 400, 1, { anim: "drop", at: "more" }) },
  { at: "And when the envelopes had a picture", tag: "+ A PHOTO OF THEIR KIDS = EVEN MORE", tagColor: "olive",
    draw: (S) => S.put(photoEnvelope("SAVINGS", true), 960, 800, 2, { anim: "pop" }) + S.put(heart(), 1300, 360, 1.2, { anim: "grow", at: "children" }) + S.sfx("sparkle", S.t("even"), 0.3) },
  { at: "Now, build it without feeling it", tag: "BUILD IT WITHOUT FEELING IT", tagColor: "olive",
    draw: (S) => S.put(hammock(), 960, G, 1.1, { anim: "pop" }) + S.put(bean({ pose: "down", face: "content", noShadow: true }), 960, 860, 0.7, { anim: "drop", at: 0.3 }) },
  { at: "Set up an automatic transfer", tag: "AUTO-TRANSFER ON PAYDAY", tagColor: "olive",
    draw: (S) => S.put(calendar(14, 7, { title: "PAYDAY", cw: 70, head: C.olive }), 520, 860, 1, { anim: "pop" }) + S.put(arrow(320, C.olive, 60), 900, 620, 1, { anim: "wipe", at: "transfer" }) + S.put(jar("FUND", 0.3), 1400, G, 1.4, { anim: "pop" }) },
  { at: "And when extra money shows up", tag: "REFUND? BONUS? SEND PART TO THE FUND", tagColor: "olive", tagSize: 48,
    draw: (S) => S.put(envelope("TAX REFUND"), 520, 800, 1.2, { anim: "pop", at: "refund" }) + S.put(gift("BONUS", C.slateDk), 960, 860, 1, { anim: "pop", at: "bonus" }) + S.put(jar("FUND", 0.6), 1450, G, 1.3, { anim: "pop", at: "fund" }) },
  { at: "One more rule", tag: "DECIDE WHAT COUNTS, BEFORE IT HAPPENS", tagColor: "mustard",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, 960, 1.1) },
  { at: "It has to be unexpected", tag: "UNEXPECTED · NECESSARY · URGENT", tagColor: "olive",
    draw: (S) => S.put(listCard([["UNEXPECTED"], ["NECESSARY"], ["URGENT"]]), 960, 380, 1, { anim: "pop" }) + ["unexpected", "necessary", "urgent"].map((w, i) => S.put(check(0.9), 640, 380 + i * 120, 1, { anim: "grow", at: w })).join("") },
  { at: "Christmas is not an emergency", tag: "CHRISTMAS ≠ EMERGENCY (IT COMES EVERY YEAR)", tagColor: "red", tagSize: 44,
    draw: (S) => S.put(gift("XMAS", C.red), 760, G, 1.6, { anim: "pop" }) + S.put(cross(1.8), 760, 560, 1, { anim: "grow", at: "not" }) + S.put(calendar(12, 4, { title: "EVERY YEAR", cw: 60, head: C.red }), 1400, 860, 1, { anim: "pop", at: "every" }) },
  { at: "A vacation is not an emergency", tag: "A VACATION ≠ EMERGENCY", tagColor: "red",
    draw: (S) => S.put(suitcase(), 960, 900, 2, { anim: "pop" }) + S.put(cross(1.8), 960, 560, 1, { anim: "grow", at: "not" }) },
  { at: "And when you do use the fund", tag: "USED IT? REFILL IT NEXT", tagColor: "olive",
    draw: (S) => S.put(fundTank(0.15, ["", "", ""], [0.2, 0.45, 0.95], { fillId: S.id("tk") }), 960, 980, 1.2, { anim: "pop" }) + S.js(`tl.fromTo("#${S.id("tk")}", { attr: { y: ${-560 * 0.15}, height: ${560 * 0.15 - 8} } }, { attr: { y: ${-560 * 0.9}, height: ${560 * 0.9 - 8} }, duration: 1.6, ease: "power1.inOut" }, ${S.t("refill")});`) },

  /* ================= BEAN, TWO YEARS LATER ================= */
  { at: "Let's go back to Bean", tag: "2 YEARS LATER...", tagColor: "slate",
    draw: (S) => S.put(car({ color: C.slateDk }), 860, G, 1.6, { anim: "rise" }) + S.put(clunk("clunk!"), 1380, 640, 1.3, { anim: "pop", at: "noise" }) + S.shake(S.t("noise") + 0.1, 6) },
  { at: "Same mechanic, same clipboard", tag: "SAME MECHANIC. SAME CLIPBOARD. $1,200.",
    draw: (S) => S.put(wrench(), 560, 700, 1.6, { anim: "pop" }) + S.put(repairBill("$1,200"), 1160, G, 1.4, { anim: "rise", at: "clipboard" }) },
  { at: "But this time", tag: "THIS TIME, NO STOMACH DROP", tagColor: "olive",
    draw: (S) => umbrellaBean(S, 760, 1.3, "FUND", { face: "content" }) + S.put(repairBill("$1,200"), 1400, G, 1, { anim: "pop" }) },
  { at: "Bean moves the money", tag: "FROM \"CAR BREAKS\"", tagColor: "olive",
    draw: (S) => S.put(accountCard("CAR BREAKS", "$2,800", C.slateDk), 760, 520, 1.3, { anim: "pop" }) + S.put(arrow(260, C.olive, 60), 1150, 520, 1, { anim: "wipe", at: "money" }) + S.put(repairBill("$1,200"), 1500, G, 0.9, { anim: "pop" }) + S.put(stampSvg("PAID", C.oliveDk, 60, -10), 1500, 700, 1, { anim: "slam", at: "breaks" }) },
  { at: "No card, no interest", tag: "NO CARD · NO INTEREST · NO TRAP", tagColor: "olive",
    draw: (S) => [["card", card()], ["interest", txt(0, -60, "22%", 110, C.red, { font: "bold" })], ["trap", trap()]].map(([w, svg], i) => S.put(svg, 440 + i * 520, i === 2 ? G : 640, i === 2 ? 1 : 1.1, { anim: "pop", at: w }) + S.put(cross(1.3), 440 + i * 520, 600, 1, { anim: "grow", at: w })).join("") },
  { at: "And four months later", tag: "4 MONTHS LATER: FULL AGAIN", tagColor: "olive",
    draw: (S) => S.put(calendar(4, 4, { title: "4 MONTHS", cw: 90, head: C.olive, mark: () => check(0.7) }), 600, 820, 1, { anim: "pop" }) + S.put(fundTank(0.3, ["", "", ""], [0.2, 0.45, 0.95], { fillId: S.id("tk2") }), 1300, 980, 1.1, { anim: "pop" }) + S.js(`tl.fromTo("#${S.id("tk2")}", { attr: { y: ${-560 * 0.3}, height: ${560 * 0.3 - 8} } }, { attr: { y: ${-560 * 0.6}, height: ${560 * 0.6 - 8} }, duration: 1.4, ease: "power1.inOut" }, ${S.t("full")});`) + S.sfx("chime", S.t("full") + 1, 0.3) },
  { at: "Remember what we learned", tag: "REMEMBER \"WHY YOU'LL NEVER FEEL RICH\"?", tagColor: "slate",
    draw: (S) => S.put(piggy(), 960, G, 2.4, { anim: "pop" }) },
  { at: "It's not your salary", tag: "NOT YOUR SALARY. THE MONEY IN THE BANK.", tagColor: "olive", tagSize: 46,
    draw: (S) => S.put(pill("SALARY", C.white, 56), 600, 520, 1.1, { anim: "pop" }) + S.put(cross(1.3), 600, 520, 1, { anim: "grow", at: "salary" }) + S.put(building({ label: "BANK" }), 1350, G, 1.1, { anim: "pop", at: "bank" }) },
  { at: "This is what that feels like", tag: "NOT LUXURY. CALM.", tagColor: "olive",
    draw: (S) => S.put(hammock(), 960, G, 1.1, { anim: "pop" }) + S.put(bean({ pose: "down", face: "content", noShadow: true }), 960, 860, 0.7, { anim: "drop", at: 0.2 }) + S.put(umbrella("", { size: 1.0 }), 960, 760, 1, { anim: "pop", at: "calm" }) + S.put(raincloud("", { rain: true }), 1450, 330, 0.7, { anim: "drop", at: "luxury" }) },
  { at: "So, here's your plan", tag: "YOUR PLAN", tagColor: "olive",
    draw: (S) => S.put(listCard([["1 · YOUR ESSENTIALS"], ["2 · $1,000"], ["3 · ONE MONTH"], ["4 · 3–6 MONTHS"]], 820), 960, 330, 1, { anim: "none" }) + [["monthly", 0], ["Start", 1], ["one", 2], ["three", 3]].map(([w, i]) => S.put(check(0.9), 610, 330 + i * 120, 1, { anim: "grow", at: w })).join("") },
  { at: "Keep it out of sight", tag: "OUT OF SIGHT · A NAME · AUTOMATIC", tagColor: "olive",
    draw: (S) => S.put(padlock(), 480, 860, 1.4, { anim: "pop", at: "sight" }) + S.put(accountCard("CAR BREAKS", "$2,800", C.slateDk), 960, 680, 0.9, { anim: "pop", at: "name" }) + S.put(calendar(12, 4, { title: "AUTO", cw: 60, head: C.olive, mark: () => check(0.5) }), 1450, 860, 1, { anim: "pop", at: "automate" }) },
  { at: "Because the emergency is coming", tag: "THE EMERGENCY IS COMING", tagColor: "red",
    draw: (S) => S.put(raincloud("", { dark: true }), 1700, 370, 1.2, { anim: "none", id: "st" }) + S.js(`tl.fromTo("#${S.id("st")}-i", { x: 300 }, { x: -500, duration: 2.4, ease: "power1.out" }, 0);`) + umbrellaBean(S, 600, 1.3, "FUND", { face: "determined" }) },
  { at: "You just get to decide", tag: "A DISASTER... OR JUST A TUESDAY", tagColor: "mustard",
    draw: (S) => S.put(calendarPage("TUESDAY"), 1350, 860, 1.2, { anim: "pop", at: "Tuesday" }) + umbrellaBean(S, 560, 1.3, "FUND", { face: "smug" }) + S.put(raincloud("", { rain: true }), 1000, 320, 0.8, { anim: "drop", at: "disaster" }) },
  { at: "And speaking of bad days", tag: "NEXT: WHY WE SHOP TO FIX A BAD MOOD", tagColor: "mustard", tagSize: 48,
    draw: (S) => B(S, { pose: "down", face: "sad" }, 600, 1) + S.put(raincloud("", { rain: true }), 600, 330, 0.7, { anim: "drop" }) + S.put(shopBag(), 1300, G, 1.3, { anim: "pop", at: "buying" }) + S.put(heart(), 1300, 520, 1, { anim: "grow", at: "buying" }) },
  { at: "And why does that feeling disappear", tag: "...AND WHY THE FEELING VANISHES", tagColor: "red",
    draw: (S) => S.put(box("PACKAGE", { w: 340, h: 260 }), 960, G, 1.2, { anim: "drop", at: "package" }) + S.put(heart(), 960, 420, 1.2, { anim: "none", id: "hf" }) + S.js(`tl.to("#${S.id("hf")}-i", { opacity: 0, y: -80, duration: 1.2 }, ${S.t("disappear")});`) + B(S, { pose: "shrug", face: "sad" }, 1500, 0.9) },
  { at: "That's the next video", push: 1.0,
    draw: (S) => S.put(`<rect x="-440" y="-250" width="880" height="500" rx="18" fill="${C.terra}" stroke="${C.ink}" stroke-width="8"/>` +
      `<rect x="-420" y="-230" width="840" height="170" fill="${C.ink}" opacity="0.55"/>` + txt(0, -185, "WHY WE SHOP", 56, C.white, { font: "bold" }) + txt(0, -110, "WHEN WE'RE SAD", 56, C.gold, { font: "bold" }) +
      at(-180, 200, 0.75, shopBag()) + `<circle r="56" fill="${C.red}" stroke="${C.ink}" stroke-width="6" cx="280" cy="130"/><path d="M 264 106 L 308 130 L 264 154 Z" fill="${C.white}"/>`, 960, 500, 1, { anim: "grow", at: 0.05 }) +
      S.put(at(-70, 0, 0.32, bean({ face: "happy", noShadow: true })) + at(10, 0, 0.26, brain({ face: "grin", noShadow: true })) + `<text x="70" y="-60" font-family="Archivo Black" font-size="64" fill="${C.ink}" dominant-baseline="middle">PESA<tspan fill="${C.terra}">BRAIN</tspan></text>`, 760, 960, 1, { anim: "rise", at: 0.3 }) },
];

function chartLike() {
  return `<rect x="-200" y="-260" width="400" height="260" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/><path d="M -170 -40 L -80 -100 L 0 -80 L 80 -170 L 170 -220" fill="none" stroke="${C.olive}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>${txt(0, 40, "INVESTMENT", 40, C.ink, { font: "bold" })}`;
}
function magnifierLike() {
  return `<circle cx="-30" cy="-30" r="120" fill="${C.white}" fill-opacity="0.6" stroke="${C.ink}" stroke-width="10"/><path d="M 60 60 L 170 170" stroke="${C.wood}" stroke-width="36" stroke-linecap="round"/><path d="M 60 60 L 170 170" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>${txt(-30, -24, "1 WORD", 46, C.red, { font: "bold" })}`;
}
function house() {
  return `<path d="M -180 -260 L 0 -400 L 180 -260 Z" fill="${C.terra}" stroke="${C.ink}" stroke-width="6" stroke-linejoin="round"/><rect x="-150" y="-260" width="300" height="260" fill="${C.paper2}" stroke="${C.ink}" stroke-width="6"/><rect x="-40" y="-130" width="80" height="130" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/><rect x="60" y="-220" width="60" height="60" fill="${C.slate}" stroke="${C.ink}" stroke-width="5"/>`;
}
function dumbbell() {
  return `<rect x="-120" y="-16" width="240" height="32" rx="10" fill="${C.grey}" stroke="${C.ink}" stroke-width="5"/>${[-1, 1].map((s) => `<rect x="${s * 120 - 30}" y="-70" width="60" height="140" rx="12" fill="${C.ink}"/>`).join("")}<path d="M -160 -90 l 10 -14 M 160 -90 l -10 -14" stroke="${C.grey}" stroke-width="6"/>`;
}
function clipboardMini() {
  return `<rect x="-60" y="-160" width="120" height="160" rx="8" fill="${C.wood}" stroke="${C.ink}" stroke-width="5"/><rect x="-46" y="-140" width="92" height="124" fill="${C.white}" stroke="${C.ink}" stroke-width="3"/>`;
}
function finishFlag() {
  return `<path d="M 0 0 L 0 -320" stroke="${C.ink}" stroke-width="12" stroke-linecap="round"/><rect x="0" y="-320" width="180" height="120" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>${[0, 1, 2].map((r) => [0, 1, 2, 3, 4, 5].map((c) => (r + c) % 2 ? "" : `<rect x="${c * 30}" y="${-320 + r * 40}" width="30" height="40" fill="${C.ink}"/>`).join("")).join("")}`;
}
function pie2() {
  return `<circle r="200" fill="${C.white}" stroke="${C.ink}" stroke-width="8"/><path d="M 0 0 L 0 -200 A 200 200 0 0 1 0 200 Z" fill="${C.mustard}" stroke="${C.ink}" stroke-width="6"/>${txt(100, 0, "HOW", 34, C.ink, { font: "bold" })}${txt(100, 40, "MUCH", 34, C.ink, { font: "bold" })}${txt(-100, 10, "WHERE?", 38, C.red, { font: "bold" })}`;
}
function calendarPage(day) {
  return `<rect x="-200" y="-320" width="400" height="320" rx="16" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/><rect x="-200" y="-320" width="400" height="90" rx="16" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>${txt(0, -272, day, 54, C.white, { font: "bold" })}${txt(0, -120, "just a", 50, C.ink)}${txt(0, -60, "regular day", 50, C.ink)}`;
}

const INSERTS = {
  "Your car makes a noise": [
    { at: "just a small", tag: "SMALL. NEW. WASN'T THERE YESTERDAY.", draw: (S) => S.put(car({ color: C.slateDk }), 960, G, 2.1, { anim: "none" }) + S.put(big("?", C.mustard, 160), 1500, 420, 1, { anim: "grow", at: "new" }) + S.put(clunk("tk... tk..."), 1500, 700, 1, { anim: "pop", at: "yesterday" }) },
  ],
  "only 63": [
    { at: "with cash or its", tag: "...WITH CASH OR ITS EQUIVALENT", tagColor: "slate", draw: (S) => S.put(bill(), 640, 560, 2.2, { anim: "pop" }) + S.put(card({ label: "PAID" }), 1300, 560, 1.4, { anim: "pop", at: "equivalent" }) },
  ],
  "repair at": [
    { at: "becomes a trap", tag: "A TRAP THAT FOLLOWS YOU FOR YEARS", tagColor: "red", draw: (S) => B(S, { pose: "cheeks", face: "worried", sweat: true }, 1300, 1) + S.put(debtBall("$1,200"), 520, 700, 1.4, { anim: "slideL" }) + S.put(calendar(28, 7, { title: "YEARS", cw: 44, head: C.red }), 900, 520, 0.7, { anim: "pop", at: "years" }) },
  ],
  "By the end of this video": [
    { at: "where to keep it", tag: "2 · WHERE YOUR BRAIN CAN'T TOUCH IT", tagColor: "mustard", draw: (S) => S.put(padlock(), 760, 880, 2, { anim: "pop" }) + BR(S, { face: "foiled", pose: "reach" }, 1350, 0.95, { at: "touch" }) },
    { at: "and a simple way to build", tag: "3 · BUILD IT WITHOUT FEELING POORER", tagColor: "mustard", draw: (S) => S.put(calendar(12, 4, { title: "AUTO", cw: 80, head: C.olive, mark: () => check(0.6) }), 760, 880, 1.1, { anim: "pop" }) + B(S, { pose: "wave", face: "happy" }, 1350, 1, { at: "poorer" }) },
  ],
  "They found that when people": [
    { at: "they did worse on tests", tag: "WORSE ON THINKING & SELF-CONTROL", tagColor: "red", draw: (S) => S.put(clipboard([["THINKING", "↓"], ["SELF-CONTROL", "↓"]], { w: 560 }), 960, 960, 1.3, { anim: "pop" }) },
  ],
  "Princeton described the size": [
    { at: "or a full night's", tag: "...OR A FULL NIGHT'S SLEEP", tagColor: "red", draw: (S) => B(S, { pose: "down", face: "sleep" }, 960, 1.15) + S.put(txt(0, 0, "z z z", 80, C.ink), 1250, 420, 1, { anim: "fade" }) },
  ],
  "People with at least": [
    { at: "higher financial", tag: "21% HIGHER WELL-BEING", tagColor: "olive", draw: (S) => S.put(bar(300, C.grey, "NO SAVINGS", "100"), 760, 880, 1, { anim: "rise" }) + S.put(bar(363, C.olive, "$2,000+", "121"), 1160, 880, 1, { anim: "rise", at: 0.4 }) + S.put(tag2("+21%", { size: 70, rot: -8, color: C.gold }), 1420, 420, 1, { anim: "drop", at: 0.8 }) },
  ],
  "Okay, so you need one": [
    { at: "And it's probably not the number", tag: "PROBABLY NOT THE NUMBER YOU'VE HEARD", tagColor: "red", draw: (S) => BR(S, { face: "sly", pose: "point" }, 960, 1.1) },
  ],
  "And this is where most people quit": [
    { at: "is a terrifying number", tag: "A TERRIFYING NUMBER", tagColor: "red", draw: (S) => S.put(big("$16,800", C.red, 230), 960, 560, 1, { anim: "slam" }) + S.shake(0.3, 10) + S.sfx("impact-bass-1", 0.2, 0.3) },
  ],
  "Where you keep it matters": [
    { at: "the moment you build it", tag: "YOUR BRAIN WILL LOOK FOR REASONS TO SPEND IT", tagColor: "red", tagSize: 44, draw: (S) => S.put(jar("FUND", 0.9), 1300, G, 1.6, { anim: "pop" }) + BR(S, { face: "love", pose: "reach" }, 640, 1.05) + S.put(bubble("JUST THIS|ONCE...", { size: 44, w: 360, h: 150, dx: 160, dy: -120 }), 760, 420, 1, { anim: "grow", at: "spend" }) },
  ],
  "Set up an automatic transfer": [
    { at: "even $50", tag: "EVEN $50 A PAYCHECK", tagColor: "olive", draw: (S) => S.put(tag2("$50", { size: 110, rot: -8, color: C.gold }), 760, 560, 1, { anim: "drop" }) + S.put(jar("FUND", 0.35), 1350, G, 1.6, { anim: "pop" }) + S.put(coin(36), 1350, 360, 1, { anim: "drop", at: 0.6 }) },
  ],
};
const BASE = BEATS.splice(0);
for (const b of BASE) { BEATS.push(b); for (const x of INSERTS[b.at] || []) BEATS.push(x); delete INSERTS[b.at]; }
