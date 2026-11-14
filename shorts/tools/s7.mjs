// Short 7 — "The Tip Screen Is Designed to Make You Tip More"
import { C, txt, bean, brain, stampSvg, cross, check, sparkles, arrow, magnifier, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { tipScreen, taxi, tipJar } from "./props-b2.mjs";

export const CAPFIX = { "20,": "20%,", "25,": "25%,", "30.": "30%." };
const HOOK = (S, a = "none") => S.put(tipScreen(["20%", "25%", "30%"], { hi: 1 }), CX, 1200, 1.15, { anim: a }) + S.put(stampSvg("TRICK", C.red, 64, -12), 760, 560, 1, { anim: a });

export const BEATS = [
  { at: "That tip screen was designed", tag: "THE TIP SCREEN IS A TRICK", tagColor: "red", tagSize: 60,
    draw: (S) => HOOK(S) + S.sfx("impact-bass-1", 0.3, 0.25) },
  { at: "Look at the buttons", tag: "20% · 25% · 30%",
    draw: (S) => S.put(tipScreen(["20%", "25%", "30%"]), 380, 1200, 1.05, { anim: "rise" }) + [["20", 0], ["25", 1], ["30", 2]].map(([w, i]) => S.put(arrow(110, C.red, 40), 720, 1200 - 560 * 1.05 + (162 + i * 100) * 1.05, 1, { rot: 180, anim: "wipe", at: w })).join("") },
  { at: "Your brain treats the middle one", tag: "THE MIDDLE ONE FEELS NORMAL", tagColor: "olive",
    draw: (S) => S.put(tipScreen(["20%", "25%", "30%"], { hi: 1 }), 360, 1200, 1.0, { anim: "none" }) + BR(S, { face: "happy", pose: "point" }, 760, 0.75, { at: "middle" }) + S.put(check(1), 360, 860, 1, { anim: "grow", at: "normal" }) },
  { at: "and the custom button is tiny", tag: "\"CUSTOM\" IS TINY ON PURPOSE", tagColor: "red", tagSize: 54,
    draw: (S) => S.put(tipScreen(["20%", "25%", "30%"], { hi: 1 }), CX, 1200, 1.15, { anim: "none" }) + S.put(magnifier(), CX + 230, 1080, 1.5, { anim: "pop", at: "tiny" }) },
  { at: "Psychologists call these defaults", tag: "THESE ARE DEFAULTS", tagColor: "slate",
    draw: (S) => PC(S, { screen: "DEFAULT", pose: "point", mouth: "o" }, 260, 0.95) + S.put(stampSvg("DEFAULT", C.slateDk, 60, -10), 640, 760, 1, { anim: "slam", at: "defaults" }) + S.sfx("impact-bass-1", S.t("defaults") + 0.15, 0.25) },
  { at: "Whatever's offered first", tag: "WHAT'S OFFERED FEELS RIGHT", tagColor: "olive",
    draw: (S) => BR(S, { face: "love", pose: "hug" }, 280, 0.9) + S.put(tipScreen(["20%", "25%", "30%"], { hi: 1 }), 660, 1200, 0.85, { anim: "pop" }) + S.put(check(1.2), 660, 620, 1, { anim: "grow", at: "right" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "Researchers studied millions", tag: "MILLIONS OF NYC TAXI RIDES", tagColor: "slate",
    draw: (S) => S.put(taxi(), CX, 1200, 1.5, { anim: "slideL" }) + S.put(txt(0, 0, "13,000,000+ RIDES", 56, C.ink, { font: "bold" }), CX, 600, 1, { anim: "fade", at: "taxi" }) },
  { at: "When the screen suggested higher", tag: "HIGHER BUTTONS → HIGHER TIPS", tagColor: "olive",
    draw: (S) => S.put(tipScreen(["15%", "20%", "25%"], { custom: false }), 250, 900, 0.62, { anim: "pop" }) + S.put(tipScreen(["20%", "25%", "30%"], { custom: false }), 690, 900, 0.62, { anim: "pop", at: "higher" }) +
      S.put(tipJar(0.35), 250, 1230, 0.8, { anim: "rise", at: "tipped" }) + S.put(tipJar(0.75), 690, 1230, 0.8, { anim: "rise", at: "more" }) },
  { at: "Same rides, different buttons", tag: "SAME RIDES. DIFFERENT BUTTONS.", tagSize: 54,
    draw: (S) => S.put(taxi(), 215, 1200, 0.68, { anim: "pop" }) + S.put(big("=", C.ink, 120), CX, 1110, 1, { anim: "grow", at: "Same" }) + S.put(taxi(), 735, 1200, 0.68, { anim: "pop" }) + S.put(txt(0, 0, "≠ BUTTONS", 70, C.red, { font: "bold" }), CX, 640, 1, { anim: "slam", at: "different" }) },
  { at: "So here's the rule", tag: "THE RULE", tagColor: "olive",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, CX, 1.1) },
  { at: "Decide your tip before", tag: "DECIDE BEFORE IT TURNS AROUND", tagColor: "olive", tagSize: 54,
    draw: (S) => B(S, { pose: "hold", face: "determined" }, 260, 0.9) + S.put(sticky(["MY TIP:", "_____"], { w: 380 }), 660, 760, 1, { anim: "drop", at: "tip" }) },
  { at: "Then tap Custom", tag: "THEN TAP CUSTOM", tagColor: "olive",
    draw: (S) => S.put(tipScreen(["20%", "25%", "30%"], { bigCustom: true }), CX, 1200, 1.15, { anim: "none" }) + S.put(`<ellipse rx="110" ry="50" fill="none" stroke="${C.olive}" stroke-width="10"/>`, CX + 160, 1078, 1, { anim: "grow", at: "Custom" }) + S.sfx("click", S.t("Custom") + 0.1, 0.4) },
  { at: "What's the wildest place", tag: "WHERE WAS THE WILDEST ONE?", tagColor: "mustard", tagSize: 56,
    draw: (S) => S.put(sticky(["WILDEST PLACE", "YOU GOT A", "TIP SCREEN?"]), CX, 760, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "shrug" }, 260, 0.75, { at: "comments" }) },
  { at: "Because the next time", tag: "THE TIP SCREEN IS A TRICK", tagColor: "red", tagSize: 60, tagAt: "turns",
    draw: (S) => HOOK(S, "pop") },
];
