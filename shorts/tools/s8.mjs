// Short 8 — "Your Gym Membership Is Lying to You"
import { C, txt, bean, priceTag, clipboard, calendar, stampSvg, cross, check, sparkles, arrow, cloudThought, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { personIcon } from "../../ep03/tools/props3.mjs";
import { gymCard, dumbbell, sofa } from "./props-b2.mjs";

export const CAPFIX = { "8": "8,000", ",000": "", "10": "10-VISIT", "-visit": "" };
const HOOK = (S, a = "none") => S.put(gymCard({ web: true }), CX, 760, 1.2, { anim: a, rot: -6 }) + S.put(dumbbell(), CX, 1180, 1.2, { anim: a }) +
  S.put(`<path d="M -200 -80 L -120 0 M -200 -80 L -200 20 M -200 -80 L -90 -80 M -200 -40 Q -150 -40 -150 -80 M -200 -10 Q -120 -10 -120 -80" fill="none" stroke="${C.grey}" stroke-width="4"/>`, CX - 30, 1150, 1.2, { anim: a });

export const BEATS = [
  { at: "Your gym membership is costing", tag: "$17 PER VISIT?", tagColor: "red", tagSize: 72,
    draw: (S) => HOOK(S) + S.sfx("impact-bass-1", 0.3, 0.25) },
  { at: "When you sign up", tag: "WHEN YOU SIGN UP...",
    draw: (S) => S.put(gymCard(), 320, 820, 0.85, { anim: "pop" }) + B(S, { pose: "cheer", face: "joy" }, 700, 0.95) },
  { at: "you're paying for the person", tag: "...YOU PAY FOR \"FUTURE YOU\"", tagColor: "mustard", tagSize: 56,
    draw: (S) => S.put(sofa(), 380, 1240, 0.8, { anim: "pop" }) + S.put(bean({ pose: "down", face: "content", noShadow: true }), 380, 1150, 0.7, { anim: "pop" }) +
      S.put(cloudThought(bean({ pose: "cheer", face: "determined", noShadow: true, color: C.olive }).replace(/^/, `<g transform="translate(0 120) scale(0.45)">`) + "</g>", 170), 640, 600, 1, { anim: "grow", at: "become" }) },
  { at: "In a study of almost", tag: "A STUDY: 7,752 GYM MEMBERS", tagColor: "slate",
    draw: (S) => [...Array(12)].map((_, i) => S.put(personIcon(C.slate), 130 + (i % 4) * 230, 700 + Math.floor(i / 4) * 210, 1.3, { anim: "pop", at: 0.1 + i * 0.05 })).join("") },
  { at: "people on a", tag: "$70 A MONTH · ~4 VISITS", tagColor: "red",
    draw: (S) => S.put(priceTag("$70 / MONTH", { size: 54, rot: -6, color: C.gold, w: 420 }), 120, 600, 1, { anim: "drop" }) + S.put(calendar(28, 7, { title: "THIS MONTH", cw: 86, head: C.red, mark: (i) => [3, 11, 17, 24].includes(i) ? check(0.6) : "" }), CX, 1220, 1, { anim: "pop", at: "four" }) },
  { at: "That's more than", tag: "MORE THAN $17 A VISIT", tagColor: "red",
    draw: (S) => S.put(big("$70 / 4", C.ink, 120), CX, 680, 1, { anim: "pop" }) + S.put(big("= $17+", C.red, 170), CX, 920, 1, { anim: "slam", at: "17" }) + S.sfx("impact-bass-1", S.t("17") + 0.15, 0.25) },
  { at: "when a 10", tag: "A 10-VISIT PASS: ~$10 EACH", tagColor: "olive",
    draw: (S) => S.put(`<rect x="-260" y="-130" width="520" height="260" rx="20" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/><path d="M 120 -130 L 120 130" stroke="${C.ink}" stroke-width="4" stroke-dasharray="14 10"/>` + txt(-70, -30, "10-VISIT", 54, C.ink, { font: "bold" }) + txt(-70, 40, "PASS", 54, C.ink, { font: "bold" }) + txt(190, 4, "$10", 50, C.white, { font: "bold" }), CX, 860, 1.1, { anim: "pop", at: "pass" }) },
  { at: "And here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "On average, they gave up", tag: "~$600 GIVEN UP", tagColor: "red",
    draw: (S) => S.countText(CX, 760, 0, 600, { at: "600", size: 200, color: C.red }) + B(S, { pose: "cheeks", face: "sad" }, CX, 0.8) },
  { at: "paying for a future self", tag: "PAYING FOR A FUTURE SELF", tagColor: "mustard",
    draw: (S) => S.put(bean({ pose: "cheer", face: "determined", noShadow: true, color: C.olive }), 640, 1240, 0.95, { anim: "fade", id: "fut" }) + S.js(`tl.to("#${S.id("fut")}-i", { opacity: 0.25, duration: 1.2 }, ${S.t("never")});`) + B(S, { pose: "shrug", face: "worried" }, 260, 0.85) },
  { at: "So here's the rule", tag: "THE RULE", tagColor: "olive",
    draw: (S) => B(S, { pose: "pointUp", face: "determined" }, CX, 1.1) },
  { at: "Divide what you pay", tag: "WHAT YOU PAY ÷ VISITS", tagColor: "olive",
    draw: (S) => PC(S, { screen: "$70÷4", pose: "point", mouth: "o" }, 280, 1) + S.put(big("$17.50", C.red, 110), 660, 760, 1, { anim: "slam", at: "go" }) },
  { at: "If it's more than a single pass", tag: "MORE THAN A PASS? SWITCH.", tagColor: "olive",
    draw: (S) => S.put(gymCard(), 280, 820, 0.75, { anim: "pop" }) + S.put(cross(1.4), 280, 820, 1, { anim: "grow", at: "switch" }) + S.put(arrow(140, C.olive, 46), 520, 820, 1, { anim: "wipe", at: "switch" }) + S.put(`<rect x="-150" y="-80" width="300" height="160" rx="16" fill="${C.olive}" stroke="${C.ink}" stroke-width="6"/>` + txt(0, 4, "PASS", 60, C.ink, { font: "bold" }), 760, 820, 0.85, { anim: "pop", at: "switch" }) },
  { at: "How many times did you go", tag: "HOW MANY TIMES LAST MONTH?", tagColor: "mustard", tagSize: 56,
    draw: (S) => S.put(sticky(["HOW MANY", "TIMES DID", "YOU GO?"]), CX, 760, 1, { anim: "drop" }) + B(S, { pose: "shrug", face: "smile" }, 260, 0.7, { at: "honest" }) },
  { at: "Because when you sign up", tag: "$17 PER VISIT?", tagColor: "red", tagSize: 72, tagAt: "sign",
    draw: (S) => HOOK(S, "pop") },
];
