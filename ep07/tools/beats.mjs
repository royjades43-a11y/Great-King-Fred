// EP07 "Why You Spend More When You're Sad (Black Friday Knows It)" — the first episode in the new presentation style:
// three continuous sets (apartment → mall → street → apartment), a moving camera, Bean presenting with lip-sync,
// short hero words instead of sentence tags, and a progress checklist that stays on screen (CHECKLIST).
import { C, at, txt, bean, brain, calc, priceTag, clipboard, phone, card, coin, stampSvg, check, cross, sparkles, arrow, bubble, cloudThought,
  laptop, jar, treadmill, confetti, envelope, magnifier, heart, gift, clock } from "../../moneybrain/tools/kit.mjs";
import { anchor } from "../../ep05/tools/props5.mjs";
import { raincloud, accountCard } from "../../ep06/tools/props6.mjs";
import { sticky } from "../../shorts/tools/common.mjs";
import { homeSet, mallSet, streetSet, personRow, tv, sadFace, fish, panel, lever, pillBottle, hoodie, timerSign, boxPile, cartIcon, fridge, mirror, listPaper, cafe, moodChart, loopRing, loopPos } from "./props7.mjs";

export const SETS = { home: homeSet(), mall: mallSet(), street: streetSet() };
export const CHECKLIST = {
  title: "IN THIS VIDEO", from: "By the end of this video", until: "And speaking of friends",
  items: [["Why sadness spends", "Picture Bean"], ["Why the joy fades", "Now here's why next week"], ["3 Black Friday tricks", "So three tricks one goal"], ["4 moves", "Back to beam"]],
};

const G = 940;
const P = (S, x, s = 1, o = {}) => S.presenter(x, G, s, { pose: "point", ...o });                 // Bean, talking
const B = (S, o, x, s = 1, opt = {}) => S.put(bean(o), x, G, s, { idle: true, ...opt });         // Bean, acting (no lip-sync)
const BR = (S, o, x, s = 1, opt = {}) => S.put(brain(o), x, G, s, { idle: true, ...opt });
const PC = (S, o, x, s = 1, opt = {}) => S.put(calc(o), x, G, s, { idle: true, ...opt });
const big = (t, col = C.ink, size = 120) => txt(0, 0, t, size, col, { font: "bold", extra: `stroke="${C.ink}" stroke-width="6" paint-order="stroke"` });
const note = (lines, w = 560) => `<rect x="${-w / 2}" y="${-(lines.length * 54 + 60) / 2}" width="${w}" height="${lines.length * 54 + 60}" rx="10" fill="#F3D86B" stroke="${C.ink}" stroke-width="6" transform="rotate(-2)"/>${lines.map((l, i) => txt(0, -((lines.length - 1) * 54) / 2 + i * 54, l, 40, C.ink, { font: "bold" })).join("")}`;
const study = (S, lines, x, y, s = 1, at0) => S.put(clipboard(lines.map((l) => [l, ""]), { w: 560 }), x, y, s, { anim: "rise", at: at0 });
const rainOver = (S, x, y, s = 1, opt = {}) => S.put(raincloud("", { rain: true }), x, y, s, { anim: "drop", idle: true, ...opt });
const tag2 = (label, o = {}) => priceTag(label, { ...o, w: o.w || Math.round(label.length * (o.size || 40) * 0.68 + 80) });

// shared drawings for the hook (two groups on the wall)
const groupA = () => panel(420, 330) + at(0, -200, 0.8, tv(sadFace())) + at(0, -30, 1, personRow(3, C.slate)) + at(0, -300, 0.5, raincloud("", { rain: false }));
const groupB = () => panel(420, 330) + at(0, -200, 0.8, tv(fish())) + at(0, -30, 1, personRow(3, C.olive)) + `<g transform="translate(150 -290)"><circle r="34" fill="${C.gold}" stroke="${C.ink}" stroke-width="5"/></g>`;
const HOOKWALL = (S, a = "none") => S.put(groupA(), 420, 760, 1, { anim: a, id: "ga" }) + S.put(groupB(), 900, 760, 1, { anim: a, id: "gb" });

export const BEATS = [
  /* ===================== PART 1 · the apartment ===================== */
  { at: "Here's a question", set: "home", cam: [900, 560, 0.95], tag: "A QUESTION",
    draw: (S) => P(S, 1380, 1, { face: "talkSure" }) },
  { at: "One group just watched a sad", set: "home", cam: [660, 560, 1.15], tag: "A SAD MOVIE...",
    draw: (S) => S.put(groupA(), 420, 760, 1, { anim: "pop", id: "ga" }) },
  { at: "The other watched a nature", set: "home", cam: [660, 560, 1.15], tag: "...OR A NATURE SHOW",
    draw: (S) => HOOKWALL(S).replace(/<g id="[^"]*gb[^>]*>/, (m) => m) + S.js(`tl.fromTo("#${S.id("gb")}", { opacity: 0, scale: 0.6, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, 0.1);`) },
  { at: "Which group pays more", set: "home", cam: [660, 520, 1.2], tag: "WHO PAYS MORE?", tagColor: "mustard",
    draw: (S) => HOOKWALL(S) + S.put(tag2("$?", { size: 70, rot: 0, color: C.gold }), 610, 300, 1.2, { anim: "drop", id: "tg" }) + S.js(`tl.fromTo("#${S.id("tg")}-i", { rotation: -20, transformOrigin: "0% 50%" }, { rotation: 20, duration: 0.6, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0.6);`) },
  { at: "Most people guess the happy", set: "home", cam: [700, 520, 1.15], tag: "THE HAPPY ONES?",
    draw: (S) => HOOKWALL(S) + S.put(tag2("$$", { size: 70, rot: 8, color: C.gold }), 860, 300, 1.2, { anim: "slideR" }) + S.put(check(1.2), 1060, 330, 1, { anim: "grow", at: "happy" }) },
  { at: "It's the sad ones", set: "home", cam: [450, 520, 1.35], tag: "IT'S THE SAD ONES", tagColor: "red",
    draw: (S) => HOOKWALL(S) + S.put(tag2("$$$$", { size: 90, rot: -8, color: C.gold }), 250, 380, 1.15, { anim: "slam" }) + S.shake(0.3, 14) + S.sfx("impact-bass-1", 0.25, 0.45) },
  { at: "In a study published in 2004", set: "home", cam: [820, 560, 1.0], tag: "PROOF · 2004", tagColor: "slate",
    draw: (S) => HOOKWALL(S) + study(S, ["LERNER, SMALL &", "LOEWENSTEIN · 2004", "SAD CLIP → PAY MORE"], 1250, 900, 0.95) + PC(S, { screen: "2004", pose: "pointL" }, 1650, 0.85) },
  { at: "And in a follow", set: "home", cam: [820, 560, 1.0], tag: "AND EVEN MORE", tagColor: "slate",
    draw: (S) => HOOKWALL(S) + study(S, ["CRYDER ET AL. · 2008", "SAD + SELF-FOCUSED", "= PAID EVEN MORE"], 1250, 900, 0.95) + PC(S, { screen: "2008", pose: "up", mouth: "o" }, 1650, 0.85) },
  { at: "Nothing about the product changed", set: "home", cam: [1380, 660, 1.9], tag: "ONLY THE MOOD",
    draw: (S) => P(S, 1380, 1, { face: "talk", pose: "shrug" }) },
  { at: "Psychologists call this a carryover", set: "home", cam: [880, 560, 1.0], tag: "CARRYOVER EFFECT", tagColor: "slate",
    draw: (S) => S.put(raincloud("WORK", { rain: true, size: 34 }), 520, 330, 1, { anim: "drop" }) + S.put(arrow(320, C.ink, 54), 680, 400, 1, { rot: 20, anim: "wipe", at: "spills" }) + S.put(card({ label: "PAY" }), 1100, 520, 1.1, { anim: "pop", at: "decision" }) + P(S, 1450, 0.9) },
  { at: "A fight at work", set: "home", cam: [1300, 540, 1.1], tag: "A BAD MOMENT...",
    draw: (S) => P(S, 1380, 1, { face: "talkSad", pose: "shrug" }) + [["fight", laptop(["ARGH!"], { size: 50 }), 0.5], ["rainy", raincloud("", { rain: true }), 0.55], ["text", phone(["NEW TEXT", "\"we need", "to talk\""], { size: 26, head: C.red }), 0.6]].map(([w, svg, s], i) => S.put(svg, 1000 + i * 380, i === 1 ? 300 : 500, s, { anim: "pop", at: w })).join("") },
  { at: "And 20 minutes later", set: "home", cam: [1250, 600, 1.25], tag: "...AND YOU PAY MORE", tagColor: "red",
    draw: (S) => B(S, { pose: "phone", face: "sad", item: phone([""], { w: 140, h: 240 }) }, 1380, 1) + S.put(`<path d="M -70 0 Q -70 -90 0 -90 Q 70 -90 70 0" fill="none" stroke="${C.ink}" stroke-width="16"/><rect x="-90" y="-20" width="44" height="70" rx="12" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/><rect x="46" y="-20" width="44" height="70" rx="12" fill="${C.red}" stroke="${C.ink}" stroke-width="5"/>`, 1000, 520, 1.3, { anim: "pop", at: "headphones" }) + S.put(tag2("+$$", { size: 54, rot: -6, color: C.gold }), 1080, 380, 1, { anim: "drop", at: "more" }) },
  { at: "And next week, that matters", set: "home", cam: [1740, 420, 1.45], tag: "NEXT WEEK...",
    draw: (S) => S.put(`<rect x="-200" y="-90" width="400" height="180" rx="12" fill="${C.ink}" stroke="${C.gold}" stroke-width="6"/>` + txt(0, -30, "BLACK", 64, C.gold, { font: "bold" }) + txt(0, 40, "FRIDAY", 64, C.gold, { font: "bold" }), 1740, 320, 0.9, { anim: "grow", at: "Black" }) + S.sfx("riser", S.t("Black") - 0.6, 0.25, 0.8) },
  { at: "Last year, a record", set: "home", cam: [1740, 420, 1.45], tag: "A RECORD", tagColor: "red",
    draw: (S) => S.put(`<rect x="-200" y="-90" width="400" height="180" rx="12" fill="${C.ink}" stroke="${C.gold}" stroke-width="6"/>`, 1740, 320, 0.9, { anim: "none" }) + S.put(S.countText(0, 0, 0, 203000000, { at: "203", size: 44, color: C.gold, prefix: "", d: 1.4 }), 1740, 300, 1, { anim: "none" }) + S.put(txt(0, 0, "SHOPPERS", 40, C.gold, { font: "bold" }), 1740, 360, 1, { anim: "fade", at: "Americans" }) },
  { at: "And stores know exactly", set: "home", cam: [1200, 560, 1.0], tag: "...THE BAD-WEEK YOU",
    draw: (S) => B(S, { pose: "down", face: "worried" }, 1380, 1) + rainOver(S, 1380, 380, 0.8, { at: "bad" }) + S.put(`<rect x="-140" y="-70" width="280" height="140" rx="12" fill="${C.ink}" stroke="${C.gold}" stroke-width="6"/>` + txt(0, 4, "BLACK FRIDAY", 34, C.gold, { font: "bold" }), 1740, 320, 1, { anim: "pop" }) },
  { at: "By the end of this video", set: "home", cam: [880, 520, 1.0], tag: "WHAT YOU'LL LEARN", tagColor: "mustard",
    draw: (S) => [["mood", raincloud("", { rain: true }), 1.0], ["package", `<rect x="-90" y="-70" width="180" height="140" fill="#D9B07A" stroke="${C.ink}" stroke-width="6"/><path d="M -20 -70 L -20 70 M 20 -70 L 20 70" stroke="#B98C55" stroke-width="8"/>`, 1.3]].map(([w, svg, s], i) => S.put(svg, 520 + i * 480, 480, s, { anim: "pop", at: w })).join("") + P(S, 1450, 0.85) },
  { at: "So why does sadness make us spend", set: "home", cam: [1380, 640, 1.8], tag: "WHY?",
    draw: (S) => P(S, 1380, 1, { face: "talk", pose: "think" }) },
  { at: "Here's the surprising part", set: "home", cam: [860, 520, 1.05], tag: "RETAIL THERAPY IS REAL", tagColor: "olive",
    draw: (S) => S.put(panel(620, 260, C.white) + txt(0, -150, "RETAIL", 80, C.ink, { font: "bold" }) + txt(0, -60, "THERAPY", 80, C.ink, { font: "bold" }), 760, 620, 1, { anim: "pop" }) + S.put(stampSvg("REAL", C.oliveDk, 80, -10), 980, 400, 1, { anim: "slam", at: "real" }) + P(S, 1400, 0.9, { face: "talkHappy" }) },
  { at: "In 2014, researchers found", set: "home", cam: [900, 560, 1.0], tag: "IT'S ABOUT CONTROL", tagColor: "olive",
    draw: (S) => study(S, ["RICK, PEREIRA &", "BURSON · 2014", "CHOICES ↓ SADNESS"], 560, 900, 0.9) + S.put(lever(false), 1100, 520, 1.1, { anim: "pop", id: "lv", at: "control" }) + B(S, { pose: "phone", face: "neutral", item: phone([""], { w: 140, h: 240 }) }, 1450, 0.95) },
  { at: "Sadness often comes with", set: "home", cam: [1300, 560, 1.1], tag: "SADNESS = NO CONTROL", tagColor: "slate",
    draw: (S) => B(S, { pose: "down", face: "sad" }, 1380, 1) + rainOver(S, 1380, 360, 1.0) + S.put(lever(false), 1000, 520, 1.0, { anim: "pop" }) },
  { at: "Choosing what to buy", set: "home", cam: [1250, 560, 1.1], tag: "CHOOSING = CONTROL", tagColor: "olive",
    draw: (S) => B(S, { pose: "phone", face: "smile", item: phone([""], { w: 140, h: 240 }) }, 1380, 1) + S.put(raincloud("", { rain: true }), 1380, 360, 1.0, { anim: "none", id: "rc" }) + S.js(`tl.to("#${S.id("rc")}-i", { scale: 0.5, transformOrigin: "50% 50%", duration: 0.8 }, ${S.t("control")});`) +
      S.put(lever(false), 1000, 520, 1.0, { anim: "none", id: "l0" }) + S.js(`tl.set("#${S.id("l0")}", { opacity: 0 }, ${S.t("control")});`) + S.put(lever(true), 1000, 520, 1.0, { anim: "fade", at: "control", d: 0.15 }) + S.sfx("click", S.t("control"), 0.4) },
  { at: "And it only worked for sadness", set: "home", cam: [900, 560, 1.0], tag: "ONLY FOR SADNESS",
    draw: (S) => S.put(sadFace(), 700, 560, 2.4, { anim: "pop" }) + S.put(check(1.4), 700, 340, 1, { anim: "grow", at: "sadness" }) + BR(S, { face: "shout", pose: "shrug" }, 1100, 0.9, { at: "angry" }) + S.put(cross(1.2), 1100, 380, 1, { anim: "grow", at: "help" }) },
  { at: "So your brain isn't stupid", set: "home", cam: [900, 600, 1.15], tag: "A PAINKILLER...", tagColor: "olive",
    draw: (S) => BR(S, { face: "happy", pose: "hold", item: pillBottle(), itemScale: 0.55 }, 900, 1.0) + S.put(txt(0, 0, "≠ CURE", 90, C.red, { font: "bold" }), 1320, 520, 1, { anim: "slam", at: "cure" }) },
  { at: "And this one comes with an expiry", set: "home", cam: [900, 720, 2.0], tag: "IT EXPIRES", tagColor: "red",
    draw: (S) => S.put(pillBottle("RETAIL THERAPY", "EXP: BEFORE DELIVERY"), 900, 860, 1.4, { anim: "none" }) + S.put(stampSvg("EXPIRED", C.red, 44, -12), 1150, 790, 1, { anim: "slam", at: "runs" }) },

  /* ===================== PART 2 · the anticipation loop ===================== */
  { at: "Picture Bean", set: "home", cam: [950, 600, 0.95], tag: "A ROUGH MONDAY",
    draw: (S) => B(S, { pose: "phone", face: "sad", item: phone([""], { w: 140, h: 240 }) }, 920, 0.95, { anim: "rise" }) + rainOver(S, 920, 380, 0.75, { at: "rough" }) },
  { at: "He finds the perfect jacket", set: "home", cam: [1000, 600, 1.3], tag: "THE PERFECT JACKET",
    draw: (S) => B(S, { pose: "phone", face: "smile", item: phone([""], { w: 140, h: 240 }) }, 920, 0.95) + S.put(phone(["", "", ""], { w: 300, h: 480, head: C.olive }) + at(0, -200, 0.35, hoodie("", C.terra, C.white).replace(/<g transform="translate\(230[^]*$/, "")), 1250, 760, 1, { anim: "pop" }) + S.put(cartIcon("1"), 1500, 520, 0.8, { anim: "pop", at: "cart" }) + S.sfx("click", S.t("cart"), 0.4) },
  { at: "And right there, his mood lifts", set: "home", cam: [900, 470, 1.1], tag: "THE MOOD LIFTS... AT 'BUY'", tagColor: "olive", tagSize: 54,
    draw: (S) => S.put(moodChart(0.6), 380, 240, 1, { anim: "wipe", d: 1.4 }) + S.put(`<rect x="-70" y="-34" width="140" height="68" rx="34" fill="${C.olive}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, "BUY", 40, C.ink, { font: "bold" }), 900, 270, 1, { anim: "grow", at: "buy" }) + S.sfx("sparkle", S.t("buy"), 0.3) },
  { at: "Researchers have seen this pattern", set: "home", cam: [900, 470, 1.05], tag: "PROOF · 2013", tagColor: "slate",
    draw: (S) => S.put(moodChart(1), 380, 240, 1, { anim: "none" }) + study(S, ["RICHINS · 2013", "\"WHEN WANTING IS", "BETTER THAN HAVING\""], 1500, 900, 0.85) },
  { at: "The wanting felt better", set: "home", cam: [900, 470, 1.1], tag: "WANTING > HAVING", tagColor: "red",
    draw: (S) => S.put(moodChart(1), 380, 240, 1, { anim: "none" }) + S.put(txt(0, 0, "WANTING", 70, C.red, { font: "bold" }), 900, 200, 1, { anim: "slam", at: "wanting" }) + S.put(txt(0, 0, "having", 50, C.grey, { font: "bold" }), 1300, 560, 1, { anim: "fade", at: "having" }) },
  { at: "Think about the last thing", set: "home", cam: [1150, 560, 1.05], tag: "THE FUN PART",
    draw: (S) => P(S, 1450, 0.95, { face: "talkHappy" }) + [["searching", magnifier(), 0.9], ["comparing", txt(0, 0, "A vs B", 60, C.ink, { font: "bold" }), 1], ["reviews", txt(0, 0, "★★★★★", 60, C.mustard, { font: "bold" }), 1], ["picturing", cloudThought(at(0, 60, 0.3, bean({ face: "joy", noShadow: true })), 110), 1]].map(([w, svg, s], i) => S.put(svg, 480 + (i % 2) * 460, 330 + Math.floor(i / 2) * 300, s, { anim: "pop", at: w })).join("") },
  { at: "Owning it became normal", set: "home", cam: [1000, 600, 1.15], tag: "NORMAL IN A WEEK",
    draw: (S) => S.put(hoodie("OLD", C.terra, C.grey), 900, 900, 0.9, { anim: "none" }) + S.put(`<path d="M -150 -150 L -60 -60 M -150 -150 L -150 -40 M -150 -150 L -40 -150" stroke="${C.grey}" stroke-width="4" fill="none"/>`, 1080, 600, 1, { anim: "fade", at: "normal" }) + P(S, 1450, 0.9) },
  { at: "If you watched Why You'll Never Feel Rich", set: "home", cam: [950, 620, 1.05], tag: "THE HEDONIC TREADMILL", tagColor: "slate",
    draw: (S) => S.put(treadmill(), 900, G - 30, 1.2, { anim: "rise" }) + B(S, { pose: "cheer", face: "worried", sweat: true }, 860, 0.9) + S.put(`<rect x="-60" y="-50" width="120" height="100" fill="#D9B07A" stroke="${C.ink}" stroke-width="5"/>`, 1180, 860, 0.8, { anim: "slideR", at: "delivery" }) },
  { at: "Thursday, the box arrives", set: "home", cam: [2300, 640, 1.05], tag: "THURSDAY",
    draw: (S) => S.put(`<rect x="-120" y="-100" width="240" height="200" fill="#D9B07A" stroke="${C.ink}" stroke-width="6"/><path d="M -30 -100 L -30 100 M 30 -100 L 30 100" stroke="#B98C55" stroke-width="10"/>`, 2450, 840, 1, { anim: "slideR", at: "arrives" }) + S.sfx("click", S.t("arrives"), 0.5) + B(S, { pose: "down", face: "smile" }, 2050, 0.95) },
  { at: "Bean opens it", set: "home", cam: [2250, 600, 1.2], tag: "...JUST A JACKET",
    draw: (S) => B(S, { pose: "hold", face: "neutral", item: hoodie("", C.terra, C.white).replace(/<g transform="translate\(230[^]*$/, ""), itemScale: 0.35 }, 2150, 1) + S.put(bubble("meh.", { size: 50, w: 200, h: 110, dx: -60, dy: 60 }), 2350, 420, 1, { anim: "grow", at: "just" }) },
  { at: "And the bad week, still there", set: "home", cam: [2250, 600, 1.15], tag: "+ A BILL", tagColor: "red",
    draw: (S) => B(S, { pose: "down", face: "sad" }, 2150, 1) + rainOver(S, 2150, 380, 0.8) + S.put(envelope("BILL", { w: 220, h: 140 }), 2470, 935, 1, { anim: "slideR", at: "bill" }) },
  { at: "So what does Bean do", set: "home", cam: [950, 600, 1.0], tag: "HE SCROLLS AGAIN",
    draw: (S) => B(S, { pose: "phone", face: "sad", item: phone([""], { w: 140, h: 240 }) }, 920, 0.95) + rainOver(S, 920, 380, 0.75) + S.put(cartIcon("2"), 1250, 520, 0.8, { anim: "pop", at: "scrolls" }) },
  { at: "That's the loop", set: "home", cam: [860, 470, 1.15], tag: "THE LOOP", tagColor: "red",
    draw: (S) => S.put(loopRing(), 860, 470, 1, { anim: "grow" }) + [["bad", raincloud("", { rain: false })], ["buy", cartIcon()], ["better", sparkles(4, 70)], ["fades", txt(0, 0, "...", 80, C.grey, { font: "bold" })]].map(([w, svg], i) => { const [x, y] = loopPos(i); return S.put(svg, 860 + x, 470 + y + 40, 0.55, { anim: "pop", at: w }); }).join("") },
  { at: "It's not a character flaw", set: "home", cam: [1380, 660, 1.8], tag: "NOT A FLAW. JUST EXPENSIVE.", tagSize: 54,
    draw: (S) => P(S, 1380, 1, { face: "talk", pose: "shrug" }) },
  { at: "Now here's why next week", set: "home", cam: [860, 470, 1.15], tag: "IT CATCHES YOU AT THE TOP", tagColor: "red", tagSize: 54,
    draw: (S) => S.put(loopRing(), 860, 470, 1, { anim: "none" }) + S.put(`<circle r="70" fill="${C.gold}" opacity="0.6"/>`, 860, 210, 1, { anim: "grow", at: "top" }) + S.put(`<rect x="-200" y="-60" width="400" height="120" rx="12" fill="${C.ink}" stroke="${C.gold}" stroke-width="6"/>` + txt(0, 4, "BLACK FRIDAY", 48, C.gold, { font: "bold" }), 860, 210, 1, { anim: "drop", at: "top" }) },
  { at: "And it uses three tricks", set: "home", cam: [2400, 600, 1.0], tag: "3 TRICKS",
    draw: (S) => S.put(`<rect x="2300" y="380" width="300" height="560" fill="#FFF3C4"/>`, 0, 0, 1, { anim: "fade" }) + B(S, { pose: "wave", face: "neutral" }, 2200, 0.95) + S.put(txt(0, 0, "×3", 140, C.red, { font: "bold" }), 2450, 560, 1, { anim: "slam", at: "three" }) },

  /* ===================== PART 3 · the Black Friday mall ===================== */
  { at: "Trick number one", set: "mall", cam: [1050, 560, 1.0], tag: "TRICK #1: THE COUNTDOWN", tagColor: "red",
    draw: (S) => S.put(timerSign("00:10:00"), 1050, 470, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "point" }, 1300, 0.8) },
  { at: "Only two left", set: "mall", cam: [1050, 560, 1.0], tag: "\"ONLY 2 LEFT!\"", tagColor: "red",
    draw: (S) => S.put(timerSign("00:09:58"), 1050, 470, 1, { anim: "none" }) + BR(S, { face: "sly", pose: "point" }, 1300, 0.8) + S.put(tag2("ONLY 2 LEFT!", { size: 46, rot: -8, color: C.gold }), 700, 640, 1, { anim: "drop" }) },
  { at: "Urgency makes your brain skip", set: "mall", cam: [1050, 600, 1.05], tag: "URGENCY SKIPS THE QUESTION", tagSize: 52,
    draw: (S) => S.put(timerSign("00:09:51"), 1050, 470, 1, { anim: "none" }) + B(S, { pose: "phone", face: "worried", sweat: true, item: card() , itemScale: 0.4 }, 800, 0.95) +
      S.put(note(["DO I NEED THIS?"], 440), 520, 420, 1, { anim: "grow", at: "need" }) + S.put(cross(1.1), 520, 420, 1, { anim: "grow", at: "jump" }) + BR(S, { face: "shout", pose: "mega" }, 1300, 0.85, { at: "miss" }) },
  { at: "And sometimes the clock isn't even real", set: "mall", cam: [1050, 480, 1.35], tag: "SOMETIMES IT'S FAKE", tagColor: "red",
    draw: (S) => S.put(timerSign("00:00:01", S.id("tm")), 1050, 470, 1, { anim: "none" }) + S.js(`tl.set("#${S.id("tm")}", { textContent: "00:00:00" }, 0.8); tl.set("#${S.id("tm")}", { textContent: "00:10:00" }, 1.4);`) + S.shake(1.4, 10) + S.sfx("impact-bass-1", 1.35, 0.3) },
  { at: "In 2022, the Federal Trade Commission", set: "mall", cam: [1050, 560, 1.0], tag: "FTC · 2022 · DARK PATTERNS", tagColor: "slate", tagSize: 52,
    draw: (S) => study(S, ["FEDERAL TRADE", "COMMISSION · 2022", "\"DARK PATTERNS\""], 820, 920, 0.9) + PC(S, { screen: "FAKE", pose: "point", mouth: "frown" }, 1300, 0.85) + S.put(timerSign("00:10:00"), 1050, 470, 0.6, { anim: "none" }) + S.put(stampSvg("FAKE?", C.red, 40, -10), 1050, 610, 1, { anim: "slam", at: 1.6 }) },
  { at: "And low stock messages", set: "mall", cam: [1250, 700, 1.3], tag: "\"LOW STOCK\"... SURE.",
    draw: (S) => S.put(tag2("ONLY 2 LEFT!", { size: 40, rot: -6, color: C.gold }), 900, 600, 1, { anim: "none" }) + S.put(boxPile(16), 1280, 940, 1, { anim: "rise", at: "plenty" }) },
  { at: "How to beat it", set: "mall", cam: [1050, 640, 1.5], tag: "WOULD I STILL WANT IT?", tagColor: "olive",
    draw: (S) => P(S, 900, 1, { face: "talkSure", pose: "pointUp" }) + S.put(timerSign("00:10:00"), 1250, 560, 0.55, { anim: "none" }) + S.put(cross(1.2), 1250, 560, 1, { anim: "grow", at: "exist" }) },
  { at: "Trick number two", set: "mall", cam: [2550, 560, 1.0], tag: "TRICK #2: THE \"WAS\" PRICE", tagColor: "slate", camDur: 1.4,
    draw: (S) => S.put(`<rect x="-300" y="-170" width="600" height="340" rx="20" fill="${C.white}" stroke="${C.ink}" stroke-width="7"/>` + txt(0, -70, "WAS $200", 80, C.grey, { font: "bold" }) + `<path d="M -190 -66 L 190 -78" stroke="${C.red}" stroke-width="14" stroke-linecap="round"/>` + txt(0, 70, "NOW $99", 110, C.red, { font: "bold" }), 2550, 520, 1, { anim: "pop", at: "was" }) + S.sfx("whoosh", 0.1, 0.3, 0.6) },
  { at: "Remember anchoring", set: "mall", cam: [2550, 520, 1.05], tag: "ANCHORING", tagColor: "slate",
    draw: (S) => S.put(`<rect x="-300" y="-170" width="600" height="340" rx="20" fill="${C.white}" stroke="${C.ink}" stroke-width="7"/>` + txt(0, -70, "WAS $200", 80, C.grey, { font: "bold" }) + txt(0, 70, "NOW $99", 110, C.red, { font: "bold" }), 2550, 520, 1, { anim: "none" }) + S.put(anchor("$200", 40), 2170, 300, 0.55, { anim: "drop", at: "anchoring" }) },
  { at: "99 feels like a steal", set: "mall", cam: [2550, 560, 1.0], tag: "...NEXT TO A FAKE $200", tagColor: "red",
    draw: (S) => S.put(txt(0, 0, "$99", 160, C.red, { font: "bold" }), 2300, 520, 1, { anim: "slam" }) + S.put(sparkles(5, 150), 2300, 520, 1, { anim: "grow", at: "steal" }) + S.put(`<g opacity="0.55">${txt(0, 0, "$200", 120, C.grey, { font: "bold" })}</g>`, 2800, 520, 1, { anim: "fade", at: "nobody" }) + S.put(txt(0, 0, "nobody paid this", 40, C.ink), 2800, 620, 1, { anim: "fade", at: "nobody" }) },
  { at: "US rules actually say", set: "mall", cam: [2550, 600, 1.0], tag: "\"WAS\" MUST BE REAL", tagColor: "olive",
    draw: (S) => PC(S, { screen: "RULE", pose: "up", mouth: "smile" }, 2300, 0.95) + S.put(note(["\"WAS\" PRICE =", "A REAL PAST PRICE", "(16 CFR 233.1)"], 520), 2750, 520, 1, { anim: "drop", at: "real" }) },
  { at: "Ignore the crossed out number", set: "mall", cam: [2550, 560, 1.15], tag: "IGNORE THE \"WAS\"", tagColor: "olive",
    draw: (S) => S.put(`<rect x="-300" y="-170" width="600" height="340" rx="20" fill="${C.white}" stroke="${C.ink}" stroke-width="7"/>` + txt(0, -70, "WAS $200", 80, C.grey, { font: "bold" }) + txt(0, 70, "NOW $99", 110, C.red, { font: "bold" }), 2550, 520, 1, { anim: "none" }) + S.put(`<rect x="-230" y="-60" width="460" height="120" rx="10" fill="#F3D86B" stroke="${C.ink}" stroke-width="6" transform="rotate(-3)"/>`, 2550, 450, 1, { anim: "slideL", at: "completely" }) + S.put(txt(0, 0, "worth $99 TO ME?", 56, C.oliveDk, { font: "bold" }), 2550, 800, 1, { anim: "fade", at: "worth" }) },
  { at: "Trick number three", set: "mall", cam: [4050, 620, 1.0], tag: "TRICK #3: A PUZZLE", tagColor: "olive", camDur: 1.4,
    draw: (S) => S.put(hoodie("$100"), 3950, 900, 1.15, { anim: "drop", at: "puzzle" }) + S.sfx("whoosh", 0.1, 0.3, 0.6) },
  { at: "A hoodie is 30", set: "mall", cam: [4100, 620, 1.05], tag: "30% OFF + EXTRA 20%", tagColor: "mustard",
    draw: (S) => S.put(hoodie("$100"), 3950, 900, 1.15, { anim: "none", id: "h1" }) + S.js(`tl.set("#${S.id("h1")}", { opacity: 0 }, ${S.t("off") + 0.2});`) + S.put(hoodie("$70", C.slateDk, C.olive), 3950, 900, 1.15, { anim: "fade", at: "off", d: 0.2 }) + BR(S, { face: "shout", pose: "mega" }, 4450, 0.8, { at: "extra" }) + S.put(bubble("50% OFF!!", { size: 46, w: 300, h: 110, dx: -80, dy: 80 }), 4500, 420, 1, { anim: "grow", at: "20" }) },
  { at: "How much did you save in total", set: "mall", cam: [4050, 600, 1.2], tag: "LOCK IT IN 👇", tagColor: "mustard",
    draw: (S) => ["3", "2", "1"].map((n, i) => S.put(big(n, [C.olive, C.mustard, C.red][i], 170), 3800 + i * 220, 520, 1, { anim: "slam", at: S.t("Lock") - 0.6 + i * 0.3 }) + S.sfx("click", S.t("Lock") - 0.6 + i * 0.3, 0.3)).join("") + S.put(note(["YOUR ANSWER?", "COMMENT IT 👇"], 460), 4050, 760, 1, { anim: "drop", at: "total" }) },
  { at: "It's 44", set: "mall", cam: [4050, 660, 1.25], tag: "IT'S 44%", tagColor: "red",
    draw: (S) => S.put(hoodie("$56", C.slateDk, C.red), 3950, 900, 1.15, { anim: "none" }) + S.put(big("44%", C.red, 150), 4330, 540, 1, { anim: "slam", at: "44" }) + S.shake(S.t("44") + 0.2, 12) + S.sfx("impact-bass-1", S.t("44") + 0.15, 0.45) },
  { at: "The extra 20 % comes off", set: "mall", cam: [4050, 560, 1.05], tag: "OFF THE ALREADY-CUT PRICE", tagSize: 52,
    draw: (S) => [["$100", C.ink], ["$70", C.oliveDk], ["$56", C.red]].map(([t, col], i) => S.put(big(t, col, 110), 3650 + i * 420, 520, 1, { anim: "pop", at: ["100", "70", "56"][i] }) + (i ? S.put(arrow(150, C.ink, 44), 3490 + i * 420, 520, 1, { anim: "wipe", at: ["100", "70", "56"][i] }) : "")).join("") + S.put(txt(0, 0, "−30%", 50, C.ink, { font: "bold" }), 3860, 650, 1, { anim: "fade", at: "70" }) + S.put(txt(0, 0, "−20%", 50, C.ink, { font: "bold" }), 4280, 650, 1, { anim: "fade", at: "56" }) },
  { at: "30 % off plus another", set: "mall", cam: [4050, 560, 1.05], tag: "30% + 30% = 51%", tagColor: "red",
    draw: (S) => S.put(hoodie("$49", C.olive, C.red), 3950, 900, 1.0, { anim: "pop" }) + S.put(big("60%?", C.grey, 100), 4450, 380, 1, { anim: "pop", at: "60" }) + S.put(cross(1.2), 4450, 380, 1, { anim: "grow", at: "51" }) + S.put(big("51%", C.red, 130), 4450, 600, 1, { anim: "slam", at: "51" }) },
  { at: "Stores split discounts on purpose", set: "mall", cam: [4100, 560, 1.0], tag: "TWO NUMBERS FEEL BIGGER", tagSize: 54,
    draw: (S) => BR(S, { face: "sly", pose: "cheer" }, 4100, 0.95) + S.put(tag2("30% OFF", { size: 50, rot: -10, color: C.gold }), 3650, 420, 1, { anim: "drop", at: "split" }) + S.put(tag2("+20% OFF", { size: 50, rot: 8, color: C.gold }), 4350, 420, 1, { anim: "drop", at: "two" }) },
  { at: "The trick to beat it", set: "mall", cam: [4050, 600, 1.4], tag: "MULTIPLY WHAT YOU KEEP", tagColor: "olive",
    draw: (S) => PC(S, { screen: "×", pose: "point", mouth: "smile" }, 3800, 0.95) + S.put(`<rect x="-320" y="-120" width="640" height="240" rx="12" fill="#2F3B33" stroke="${C.wood}" stroke-width="16"/>`, 4250, 560, 1, { anim: "pop" }) + S.put(txt(0, 0, "0.7 × 0.8 = 0.56", 70, C.white, { font: "bold" }), 4250, 540, 1, { anim: "wipe", at: "Multiply" }) + S.put(txt(0, 0, "you pay 56%", 40, C.gold, { font: "bold" }), 4250, 620, 1, { anim: "fade", at: 2.2 }) },
  { at: "Try it on any sale this week", set: "mall", cam: [4050, 560, 1.0], tag: "DO THE MATH", tagColor: "olive",
    draw: (S) => S.put(`<rect x="-300" y="-100" width="600" height="200" rx="14" fill="${C.red}" stroke="${C.ink}" stroke-width="7"/>` + txt(0, 4, "HUGE SALE!", 80, C.white, { font: "bold" }), 4050, 480, 1, { anim: "pop", id: "hs" }) + S.js(`tl.to("#${S.id("hs")}-i", { scale: 0.5, transformOrigin: "50% 50%", duration: 0.8, ease: "power2.in" }, ${S.t("shrinks")});`) },
  { at: "So three tricks one goal", set: "mall", cam: [2700, 560, 0.55], tag: "BUY FAST, WITH A FEELING", tagColor: "red", camDur: 1.6, drift: 1.01,
    draw: (S) => B(S, { pose: "carry", face: "worried", item: `<path d="M -60 -100 L 60 -100 L 70 0 L -70 0 Z" fill="${C.terra}" stroke="${C.ink}" stroke-width="5"/>`, itemScale: 1 }, 4300, 1.4) },
  { at: "How do you enjoy Black Friday", set: "mall", cam: [5000, 640, 1.5], tag: "HOW DO YOU ENJOY IT?", tagColor: "mustard",
    draw: (S) => P(S, 5000, 1, { face: "talk", pose: "think" }) },

  /* ===================== PART 4 · the street home: four moves ===================== */
  { at: "Four moves", set: "street", cam: [2450, 560, 0.5], tag: "4 MOVES", tagColor: "olive", drift: 1.01,
    draw: (S) => B(S, { pose: "wave", face: "smile" }, 900, 1.6) },
  { at: "Move one, the mood check", set: "street", cam: [800, 540, 1.0], tag: "MOVE 1: THE MOOD CHECK", tagColor: "slate",
    draw: (S) => S.put(mirror(), 560, 940, 0.9, { anim: "pop" }) + B(S, { pose: "think", face: "thinking" }, 1000, 0.95) + S.put(note(["THE THING?"], 300), 1320, 520, 1, { anim: "grow", at: "thing" }) + S.put(note(["THE FEELING?"], 320), 1320, 680, 1, { anim: "grow", at: "feeling" }) },
  { at: "Just naming the feeling", set: "street", cam: [900, 560, 1.1], tag: "NAME IT", tagColor: "slate",
    draw: (S) => B(S, { pose: "point", face: "determined" }, 950, 0.95) + S.put(raincloud("SAD", { rain: true, size: 40 }), 1100, 560, 0.9, { anim: "none", id: "nm" }) + S.js(`tl.to("#${S.id("nm")}-i", { scale: 0.55, transformOrigin: "50% 50%", duration: 0.9 }, ${S.t("power")});`) },
  { at: "If the answer is the feeling", set: "street", cam: [900, 600, 1.2], tag: "CLOSE THE APP", tagColor: "olive",
    draw: (S) => B(S, { pose: "phone", face: "neutral", item: phone([""], { w: 140, h: 240 }) }, 900, 0.95) + S.put(cross(1.3), 1150, 560, 1, { anim: "grow", at: "close" }) },
  { at: "Move to the 24 hour cart", set: "street", cam: [1900, 600, 1.0], tag: "MOVE 2: THE 24-HOUR CART", tagColor: "red",
    draw: (S) => S.put(fridge(), 1750, 940, 0.95, { anim: "pop" }) + S.put(cartIcon("3"), 2120, 900, 0.9, { anim: "slideR", id: "ct" }) + S.js(`tl.to("#${S.id("ct")}-i", { x: -260, opacity: 0, duration: 0.7, ease: "power2.in" }, ${S.t("tomorrow")});`) + S.put(clock(), 2150, 560, 0.9, { anim: "grow", at: "decide" }) },
  { at: "And if the timer magically resets", set: "street", cam: [1900, 560, 1.1], tag: "...NOW YOU KNOW", tagColor: "red",
    draw: (S) => S.put(timerSign("00:10:00"), 1900, 680, 0.7, { anim: "pop" }) + B(S, { pose: "shrug", face: "smug" }, 1700, 0.95, { at: "know" }) },
  { at: "Move three, fun money", set: "street", cam: [3000, 600, 1.0], tag: "MOVE 3: FUN MONEY", tagColor: "olive",
    draw: (S) => S.put(jar("FUN MONEY", 0.2), 2850, 940, 1.5, { anim: "pop", id: "jr" }) + S.js(`tl.set("#${S.id("jr")}", { opacity: 0 }, ${S.t("budget") + 0.6});`) + S.put(jar("FUN MONEY", 0.85), 2850, 940, 1.5, { anim: "fade", at: "budget", d: 0.6 }) + B(S, { pose: "cheer", face: "joy" }, 3200, 0.95, { at: "guilt" }) },
  { at: "Planned fun is still fun", set: "street", cam: [3000, 560, 1.05], tag: "NO REGRET", tagColor: "olive",
    draw: (S) => S.put(confetti(30, 900, 500, 3), 3000, 600, 1, { anim: "drop" }) + B(S, { pose: "cheer", face: "joy" }, 3000, 1.0) },
  { at: "Move four, shop the list", set: "street", cam: [4100, 600, 1.0], tag: "MOVE 4: SHOP THE LIST", tagColor: "mustard",
    draw: (S) => S.put(listPaper(["winter boots", "phone charger"]), 3900, 900, 1.0, { anim: "rise" }) + B(S, { pose: "point", face: "determined" }, 4350, 0.9, { at: "Write" }) },

  /* ===================== back home: Bean, second time ===================== */
  { at: "Back to beam", set: "home", cam: [950, 600, 0.95], tag: "SAME ROUGH WEEK",
    draw: (S) => B(S, { pose: "phone", face: "sad", item: phone([""], { w: 140, h: 240 }) }, 920, 0.95) + rainOver(S, 920, 380, 0.75) },
  { at: "Black Friday arrives", set: "home", cam: [1000, 600, 1.3], tag: "$99 · WAS $200 · 10:00", tagColor: "red", tagSize: 54,
    draw: (S) => B(S, { pose: "phone", face: "worried", item: phone([""], { w: 140, h: 240 }) }, 920, 0.95) + S.put(phone(["NOW $99", "was $200", "00:09:59"], { w: 300, h: 480, size: 40, head: C.red }), 1250, 760, 1, { anim: "pop" }) },
  { at: "this time Bean checks", set: "home", cam: [1000, 560, 1.2], tag: "THIS TIME...", tagColor: "olive",
    draw: (S) => B(S, { pose: "think", face: "thinking" }, 920, 0.95) + S.put(bubble("THE JACKET?|OR THE FEELING?", { size: 36, w: 360, h: 140, dx: -60, dy: 100 }), 1120, 380, 1, { anim: "grow", at: "jacket" }) },
  { at: "He puts it in the cart and calls", set: "home", cam: [1000, 600, 1.1], tag: "CALLS A FRIEND", tagColor: "olive",
    draw: (S) => B(S, { pose: "phone", face: "smile", item: phone([""], { w: 140, h: 240 }) }, 920, 0.95) + S.put(raincloud("", { rain: true }), 920, 380, 0.75, { anim: "none", id: "rc2" }) + S.js(`tl.to("#${S.id("rc2")}-i", { scale: 0.4, opacity: 0.4, transformOrigin: "50% 50%", duration: 1.2 }, ${S.t("friend")});`) + S.put(bubble("hey! how", { size: 36, w: 220, h: 100, dx: -40, dy: 80 }), 1180, 420, 1, { anim: "grow", at: "friend" }) },
  { at: "The next day", set: "home", cam: [2300, 640, 1.05], tag: "2 THINGS. FUN MONEY.", tagColor: "olive",
    draw: (S) => S.put(`<rect x="-120" y="-100" width="240" height="200" fill="#D9B07A" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 0, "×2", 70, C.ink, { font: "bold" }), 2450, 840, 1, { anim: "slideR", at: "buys" }) + S.put(note(["FUN MONEY ✓"], 340), 2150, 420, 1, { anim: "drop", at: "fun" }) + B(S, { pose: "wave", face: "happy" }, 2050, 0.9) },
  { at: "The bad week still happened", set: "home", cam: [2300, 760, 1.4], tag: "NO BILL", tagColor: "olive",
    draw: (S) => S.put(`<rect x="-110" y="-70" width="220" height="140" fill="none" stroke="${C.grey}" stroke-width="5" stroke-dasharray="14 10"/>`, 2470, 870, 1, { anim: "fade" }) + S.put(cross(1.3), 2470, 870, 1, { anim: "grow", at: "bill" }) },
  { at: "And here's the part nobody says", set: "home", cam: [1380, 660, 1.8], tag: "THE BEST DEAL...",
    draw: (S) => P(S, 1380, 1, { face: "talkSure", pose: "pointUp" }) },
  { at: "Every dollar Bean didn't spend", set: "home", cam: [1050, 560, 1.05], tag: "...GOES TO \"CAR BREAKS\"", tagColor: "olive",
    draw: (S) => S.put(accountCard("CAR BREAKS", "+$99", C.olive), 860, 480, 1.4, { anim: "pop", at: "account" }) + [0, 1, 2].map((i) => S.put(coin(26), 1300 - i * 90, 300 + i * 40, 1, { anim: "slideR", at: 0.4 + i * 0.25 })).join("") + P(S, 1450, 0.9, { face: "talkHappy" }) },
  { at: "So here's the truth", set: "home", cam: [900, 520, 1.0], tag: "THE TRUTH",
    draw: (S) => S.put(panel(760, 200) + txt(0, -100, "SHOPPING ≠ THE ENEMY", 54, C.oliveDk, { font: "bold" }), 760, 440, 1, { anim: "pop" }) + S.put(panel(760, 200, C.white) + txt(0, -100, "SHOPPING TO FIX A FEELING", 46, C.red, { font: "bold" }), 760, 700, 1, { anim: "pop", at: "fix" }) + P(S, 1450, 0.9) },
  { at: "Your mood changes what you'll pay", set: "home", cam: [900, 520, 1.0], tag: "MOOD · PEAK · BLACK FRIDAY", tagSize: 54,
    draw: (S) => [["mood", raincloud("", { rain: false }), 0.55], ["joy", sparkles(5, 80), 1], ["Black", `<rect x="-130" y="-50" width="260" height="100" rx="10" fill="${C.ink}" stroke="${C.gold}" stroke-width="5"/>` + txt(0, 4, "BLACK FRIDAY", 30, C.gold, { font: "bold" }), 1]].map(([w, svg, s], i) => S.put(svg, 420 + i * 380, 500, s, { anim: "pop", at: w })).join("") + P(S, 1500, 0.85) },
  { at: "Check the feeling", set: "home", cam: [900, 520, 1.0], tag: "THE 4 MOVES", tagColor: "olive",
    draw: (S) => [["Check", "1 · CHECK THE FEELING"], ["wait", "2 · WAIT A DAY"], ["spend", "3 · SPEND FUN MONEY"], ["shop", "4 · SHOP THE LIST"]].map(([w, t], i) => S.put(`<rect x="-330" y="-44" width="660" height="88" rx="14" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + txt(-300, 4, t, 40, C.ink, { font: "bold", anchor: "start" }), 760, 300 + i * 120, 1, { anim: "slideL", at: w })).join("") + P(S, 1450, 0.85, { face: "talkHappy" }) },
  { at: "And speaking of friends", push: 1.0,
    draw: (S) => S.put(`<rect x="-440" y="-250" width="880" height="500" rx="18" fill="${C.slateDk}" stroke="${C.ink}" stroke-width="8"/>` +
      `<rect x="-420" y="-230" width="840" height="170" fill="${C.ink}" opacity="0.5"/>` + txt(0, -185, "WHY YOUR FRIENDS", 52, C.white, { font: "bold" }) + txt(0, -110, "DECIDE WHAT YOU SPEND", 52, C.gold, { font: "bold" }) +
      at(-120, 210, 0.42, cafe()) + at(-280, 200, 0.22, bean({ face: "happy", noShadow: true })) + at(40, 200, 0.22, bean({ face: "smile", color: C.olive, noShadow: true })) +
      `<circle r="56" fill="${C.red}" stroke="${C.ink}" stroke-width="6" cx="300" cy="130"/><path d="M 284 106 L 328 130 L 284 154 Z" fill="${C.white}"/>`, 960, 500, 1, { anim: "grow", at: 0.05 }) +
      S.put(at(-70, 0, 0.32, bean({ face: "happy", noShadow: true })) + at(10, 0, 0.26, brain({ face: "grin", noShadow: true })) + `<text x="70" y="-60" font-family="Archivo Black" font-size="64" fill="${C.ink}" dominant-baseline="middle">PESA<tspan fill="${C.terra}">BRAIN</tspan></text>`, 760, 960, 1, { anim: "rise", at: 0.3 }) },
];

/* ---------- inserts: extra camera moves inside long passages ---------- */
const INSERTS = {
  "By the end of this video": [
    { at: "the three Black Friday tricks", set: "home", cam: [700, 560, 1.25], tag: "3 TRICKS · 1 PLAN", tagColor: "mustard",
      draw: (S) => S.put(txt(0, 0, "×3", 160, C.red, { font: "bold" }), 600, 500, 1, { anim: "slam" }) + S.put(check(1.8), 900, 520, 1, { anim: "grow", at: "plan" }) },
  ],
  "In 2014, researchers found": [
    { at: "not because of the stuff", set: "home", cam: [1100, 500, 1.5], tag: "NOT THE STUFF. CONTROL.", tagColor: "olive",
      draw: (S) => S.put(lever(false), 1100, 520, 1.1, { anim: "none" }) + S.put(lever(true), 1100, 520, 1.1, { anim: "fade", at: "control", d: 0.15 }) + S.sfx("click", S.t("control"), 0.4) },
  ],
  "Researchers have seen this pattern": [
    { at: "felt their happiest before", set: "home", cam: [900, 380, 1.4], tag: "HAPPIEST BEFORE BUYING", tagColor: "red",
      draw: (S) => S.put(moodChart(1), 380, 240, 1, { anim: "none" }) + S.put(`<circle r="46" fill="none" stroke="${C.olive}" stroke-width="10"/>`, 900, 300, 1, { anim: "grow", at: "happiest" }) + S.put(txt(0, 0, "less happy after", 40, C.grey, { font: "bold" }), 1200, 520, 1, { anim: "fade", at: "less" }) },
  ],
  "Think about the last thing": [
    { at: "That was the fun part", set: "home", cam: [1450, 660, 1.9], tag: "THAT WAS THE FUN PART",
      draw: (S) => P(S, 1450, 0.95, { face: "talkHappy", pose: "pointUp" }) },
  ],
  "That's the loop": [
    { at: "Feel bad plus a bill", set: "home", cam: [860, 470, 1.5], tag: "...PLUS A BILL", tagColor: "red",
      draw: (S) => S.put(loopRing(), 860, 470, 1, { anim: "none" }) + [raincloud("", { rain: false }), cartIcon(), sparkles(4, 70), txt(0, 0, "...", 80, C.grey, { font: "bold" }), envelope("BILL", { w: 150, h: 100 })].map((svg, i) => { const [x, y] = loopPos(i); return S.put(svg, 860 + x, 470 + y + 40, 0.55, { anim: "none" }); }).join("") + S.put(`<circle r="80" fill="none" stroke="${C.red}" stroke-width="10"/>`, 860 + loopPos(4)[0], 470 + loopPos(4)[1] + 10, 1, { anim: "grow", at: "bill" }) },
  ],
  "It's not a character flaw": [
    { at: "But it's an expensive one", set: "home", cam: [1150, 560, 1.0], tag: "AN EXPENSIVE ONE", tagColor: "red",
      draw: (S) => P(S, 1380, 1, { face: "talkSad", pose: "shrug" }) + [0, 1, 2, 3, 4].map((i) => S.put(coin(28), 700 + i * 110, 300 + (i % 2) * 60, 1, { anim: "drop", at: 0.2 + i * 0.15 })).join("") },
  ],
  "Now here's why next week": [
    { at: "At the exact moment", set: "home", cam: [860, 260, 1.7], tag: "WHEN WANTING PEAKS", tagColor: "red",
      draw: (S) => S.put(loopRing(), 860, 470, 1, { anim: "none" }) + S.put(`<rect x="-200" y="-60" width="400" height="120" rx="12" fill="${C.ink}" stroke="${C.gold}" stroke-width="6"/>` + txt(0, 4, "BLACK FRIDAY", 48, C.gold, { font: "bold" }), 860, 210, 1, { anim: "none" }) + S.put(sparkles(6, 220), 860, 210, 1, { anim: "grow", at: "wanting" }) },
  ],
  "In 2022, the Federal Trade Commission": [
    { at: "And it called out fake", set: "mall", cam: [1050, 470, 1.4], tag: "TIMERS THAT RESET", tagColor: "red",
      draw: (S) => S.put(timerSign("00:00:01", S.id("tm")), 1050, 470, 1, { anim: "none" }) + S.js(`tl.set("#${S.id("tm")}", { textContent: "00:00:00" }, ${S.t("reset") - 0.4}); tl.set("#${S.id("tm")}", { textContent: "00:10:00" }, ${S.t("reset") + 0.2});`) + S.shake(S.t("reset") + 0.2, 10) },
  ],
  "US rules actually say": [
    { at: "The fact that regulators", set: "mall", cam: [2300, 660, 1.8], tag: "THAT TELLS YOU EVERYTHING",
      draw: (S) => P(S, 2300, 1, { face: "talkSmug", pose: "pointUp" }) },
  ],
  "The trick to beat it": [
    { at: "70 % times 80", set: "mall", cam: [4250, 560, 1.7], tag: "YOU PAY 56%", tagColor: "olive",
      draw: (S) => S.put(`<rect x="-320" y="-120" width="640" height="240" rx="12" fill="#2F3B33" stroke="${C.wood}" stroke-width="16"/>`, 4250, 560, 1, { anim: "none" }) + S.put(txt(0, 0, "0.7 × 0.8 = 0.56", 70, C.white, { font: "bold" }), 4250, 540, 1, { anim: "none" }) + S.put(`<path d="M -60 0 L 60 0" stroke="${C.gold}" stroke-width="10"/>`, 4420, 585, 1, { anim: "wipe", at: "56" }) },
  ],
  "If the answer is the feeling": [
    { at: "Remember the relief came from control", set: "street", cam: [800, 560, 1.3], tag: "CONTROL, NOT STUFF", tagColor: "olive",
      draw: (S) => S.put(lever(true), 800, 640, 1.2, { anim: "pop" }) + S.put(cartIcon(), 1150, 560, 0.7, { anim: "pop", at: "stuff" }) },
    { at: "Tidy one room", set: "street", cam: [800, 520, 1.05], tag: "FREE WAYS TO FEEL IN CONTROL", tagColor: "olive", tagSize: 52,
      draw: (S) => [["Tidy", "TIDY 1 ROOM"], ["task", "1 SMALL TASK"], ["walk", "A WALK"], ["call", "CALL SOMEONE"]].map(([w, t], i) => S.put(`<rect x="-200" y="-44" width="400" height="88" rx="44" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>` + txt(0, 4, t, 36, C.ink, { font: "bold" }), 560 + (i % 2) * 480, 520 + Math.floor(i / 2) * 130, 1, { anim: "pop", at: w })).join("") + B(S, { pose: "cheer", face: "happy" }, 1250, 0.8) },
  ],
  "Move four, shop the list": [
    { at: "If it's on the list", set: "street", cam: [4100, 560, 1.3], tag: "ON THE LIST + ON SALE = WIN", tagColor: "olive", tagSize: 52,
      draw: (S) => S.put(listPaper(["winter boots", "phone charger"]), 3900, 900, 1.0, { anim: "none" }) + S.put(tag2("WIN", { size: 60, rot: -8, color: C.gold }), 4300, 480, 1, { anim: "slam", at: "win" }) + S.sfx("chime", S.t("win"), 0.3) },
    { at: "If it's not on the list", set: "street", cam: [4250, 600, 1.3], tag: "A TRICK WITH A DISCOUNT", tagColor: "red",
      draw: (S) => S.put(tag2("70% OFF!", { size: 50, rot: 6, color: C.gold }), 4250, 520, 1.2, { anim: "pop" }) + S.put(stampSvg("TRICK", C.red, 80, -10), 4250, 560, 1, { anim: "slam", at: "trick" }) + S.sfx("impact-bass-1", S.t("trick") + 0.15, 0.3) },
  ],
};
const BASE = BEATS.splice(0);
for (const b of BASE) { BEATS.push(b); for (const x of INSERTS[b.at] || []) BEATS.push(x); delete INSERTS[b.at]; }
