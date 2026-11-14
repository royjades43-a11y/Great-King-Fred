// Short 9 — "You're Paying for Subscriptions You Forgot"
import { C, txt, bean, priceTag, clipboard, stampSvg, cross, check, gift, magnifier, calendar, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { personIcon } from "../../ep03/tools/props3.mjs";
import { subsPhone, ghostSub } from "./props-b2.mjs";

export const CAPFIX = { "1": "1,000", ",000": "", "42": "42%", "%": "" };
const HOOK = (S, a = "none") => S.put(subsPhone(), CX - 60, 1240, 0.95, { anim: a }) + S.put(big("$?", C.red, 150), 770, 640, 1, { anim: a });
const bankLines = () => `<rect x="-320" y="-460" width="640" height="460" rx="16" fill="${C.white}" stroke="${C.ink}" stroke-width="6"/>${txt(0, -410, "BANK APP", 40, C.ink, { font: "bold" })}` +
  ["STREAMING  $15", "MUSIC  $11", "CLOUD  $3", "FITNESS APP  $13", "NEWS  $9"].map((t, i) => txt(-280, -330 + i * 70, t, 36, C.ink, { font: "mono", anchor: "start" }) + txt(220, -330 + i * 70, "↻", 40, C.red, { font: "bold" })).join("");

export const BEATS = [
  { at: "Guess how much you spend", tag: "YOU'RE OFF BY $133", tagColor: "red", tagSize: 66,
    draw: (S) => HOOK(S) },
  { at: "Got a number", tag: "GOT A NUMBER?", tagColor: "mustard",
    draw: (S) => B(S, { pose: "think", face: "thinking" }, 280, 0.9) + S.put(sticky(["MY GUESS:", "$____"], { w: 360 }), 680, 760, 1, { anim: "drop", at: "number" }) },
  { at: "In a survey of", tag: "A SURVEY OF 1,000 AMERICANS", tagColor: "slate",
    draw: (S) => [...Array(12)].map((_, i) => S.put(personIcon(C.slate), 130 + (i % 4) * 230, 700 + Math.floor(i / 4) * 210, 1.3, { anim: "pop", at: 0.1 + i * 0.05 })).join("") },
  { at: "people guessed", tag: "THEIR GUESS: $86 A MONTH", tagColor: "slate",
    draw: (S) => B(S, { pose: "hold", face: "smile" }, 280, 0.9) + S.put(sticky(["GUESS:", "$86"], { w: 340 }), 680, 760, 1, { anim: "drop", at: "86" }) },
  { at: "The real average", tag: "THE REAL AVERAGE", tagColor: "red",
    draw: (S) => S.put(big("$219", C.red, 230), CX, 760, 1, { anim: "slam", at: "219" }) + B(S, { pose: "cheeks", face: "shocked" }, CX, 0.75, { at: "219" }) + S.sfx("impact-bass-1", S.t("219") + 0.15, 0.3) },
  { at: "That's", tag: "$133 A MONTH THEY DIDN'T KNOW", tagColor: "red", tagSize: 54,
    draw: (S) => S.put(`<rect x="-380" y="-50" width="${760 * 86 / 219}" height="100" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/><rect x="${-380 + 760 * 86 / 219}" y="-50" width="${760 * 133 / 219}" height="100" fill="${C.red}" stroke="${C.ink}" stroke-width="6"/>` +
      txt(-380 + 380 * 86 / 219, 4, "$86", 44, C.ink, { font: "bold" }) + txt(-380 + 760 * 86 / 219 + 380 * 133 / 219, 4, "+$133 ?!", 48, C.white, { font: "bold" }), CX, 820, 1, { anim: "wipe" }) + S.put(txt(0, 0, "= $219", 70, C.ink, { font: "bold" }), CX, 1000, 1, { anim: "fade", at: "know" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "said they'd forgotten", tag: "42% FORGOT ONE THEY STILL PAY", tagColor: "red", tagSize: 54,
    draw: (S) => [...Array(10)].map((_, i) => S.put(personIcon(i < 4 ? C.red : C.grey), 110 + (i % 5) * 180, 900 + Math.floor(i / 5) * 230, 1.1, { anim: "pop", at: 0.05 + i * 0.05 })).join("") + S.put(ghostSub("$9/mo"), CX, 640, 1, { anim: "fade", at: "paying" }) },
  { at: "Free trials are built", tag: "FREE TRIALS ARE BUILT FOR THIS", tagColor: "mustard", tagSize: 56,
    draw: (S) => S.put(gift("FREE", C.olive), CX, 1200, 1.6, { anim: "pop" }) + S.put(stampSvg("TRIAL", C.red, 60, -10), CX, 720, 1, { anim: "slam", at: "built" }) },
  { at: "You sign up for free", tag: "...THEN THE PAYMENT STARTS", tagColor: "red",
    draw: (S) => S.put(calendar(30, 6, { title: "30 DAYS", cw: 90, head: C.olive }), 540, 1200, 1, { anim: "pop" }) + S.put(priceTag("$14.99", { size: 54, rot: -8, color: C.red, w: 290 }), 470, 560, 1, { anim: "drop", at: "payment" }) + BR(S, { face: "yawn", pose: "down" }, 160, 0.6, { at: "stopped" }) },
  { at: "So here's the rule", tag: "THE RULE: ONCE A MONTH", tagColor: "olive",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, CX, 1.1) },
  { at: "search your bank app", tag: "FIND EVERY RECURRING CHARGE", tagColor: "olive", tagSize: 56,
    draw: (S) => S.put(bankLines(), CX, 1200, 1, { anim: "rise" }) + S.put(magnifier(), 720, 980, 1.3, { anim: "pop", at: "recurring" }) },
  { at: "Cancel anything", tag: "WOULDN'T SIGN UP TODAY? CANCEL.", tagColor: "red", tagSize: 52,
    draw: (S) => S.put(bankLines(), CX, 1200, 1, { anim: "none" }) + [0, 2, 4].map((i, k) => S.put(`<path d="M -300 0 L 300 0" stroke="${C.red}" stroke-width="10" stroke-linecap="round"/>`, CX - 20, 1200 - 330 + i * 70 - 460 + 460, 1, { anim: "wipe", at: S.t("Cancel") + 0.3 + k * 0.35 })).join("") },
  { at: "How many did you find", tag: "HOW MANY DID YOU FIND?", tagColor: "mustard",
    draw: (S) => S.put(sticky(["HOW MANY", "DID YOU FIND?"]), CX, 760, 1, { anim: "drop" }) + B(S, { pose: "phone", face: "smile" }, 260, 0.7, { at: "number" }) },
  { at: "Because right now", tag: "YOU'RE OFF BY $133", tagColor: "red", tagSize: 66, tagAt: "guess",
    draw: (S) => HOOK(S, "pop") },
];
