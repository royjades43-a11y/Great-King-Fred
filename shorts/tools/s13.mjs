// Short 13 — "The $1.10 Question" (built with VIRAL.md's playbook)
import { C, txt, bean, brain, priceTag, stampSvg, cross, check, sparkles, arrow, bubble, clock, phone, G, CX, B, BR, PC, big, sticky } from "./common.mjs";
import { bigReceipt } from "./props-b2.mjs";

export const CAPFIX = { "$1": "", ".10.": "$1.10.", ".10": "$1.10", ".00": "$1.00", ".20.": "$1.20.", ".05.": "$1.05." };
const K = `stroke="${C.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
const eyes = (x, y, s = 1, look = 0) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-22" cy="0" rx="14" ry="17" fill="${C.white}" ${K}/><ellipse cx="22" cy="0" rx="14" ry="17" fill="${C.white}" ${K}/><circle cx="${-22 + look}" cy="3" r="7" fill="${C.ink}"/><circle cx="${22 + look}" cy="3" r="7" fill="${C.ink}"/></g>`;
// a baseball bat character standing on its knob
function bat(o = {}) {
  const h = o.h || 620;
  return `<path d="M -26 -10 L -48 ${-h} Q 0 ${-h - 70} 48 ${-h} L 26 -10 Z" fill="${C.wood}" ${K}/><ellipse cx="0" cy="-6" rx="40" ry="16" fill="${C.woodDk}" ${K}/>
    <path d="M -30 -110 L 30 -110 M -32 -150 L 32 -150" stroke="${C.ink}" stroke-width="5"/>${eyes(0, -h + 120, 1, o.look || 0)}
    <path d="M -20 ${-h + 175} Q 0 ${-h + 190} 22 ${-h + 172}" fill="none" ${K}/>${o.tag ? `<g transform="translate(60 ${-h + 260}) rotate(10)"><path d="M 0 0 L 30 -36 L 190 -36 L 190 36 L 30 36 Z" fill="${C.gold}" ${K}/><circle cx="26" cy="0" r="9" fill="${C.paper}" ${K}/>${txt(110, 4, o.tag, 40, C.ink, { font: "bold" })}</g>` : ""}`;
}
// a baseball character sitting on (0,0)
function ball(o = {}) {
  const r = o.r || 110;
  return `<circle cx="0" cy="${-r}" r="${r}" fill="${C.white}" ${K}/><path d="M ${-r * 0.75} ${-r * 1.65} Q ${-r * 0.35} ${-r} ${-r * 0.75} ${-r * 0.35} M ${r * 0.75} ${-r * 1.65} Q ${r * 0.35} ${-r} ${r * 0.75} ${-r * 0.35}" fill="none" stroke="${C.red}" stroke-width="6"/>
    ${eyes(0, -r * 1.15, r / 110, o.look || 0)}${o.mouth === "smug" ? `<path d="M -26 ${-r * 0.75} Q 6 ${-r * 0.6} 30 ${-r * 0.82}" fill="none" ${K}/>` : `<path d="M -20 ${-r * 0.72} Q 0 ${-r * 0.58} 20 ${-r * 0.72}" fill="none" ${K}/>`}
    ${o.label ? `<g transform="translate(0 ${-r * 2.3})"><rect x="-120" y="-50" width="240" height="100" rx="14" fill="${o.labelCol || C.white}" ${K}/>${txt(0, 4, o.label, o.labelSize || 54, o.labelInk || C.ink, { font: "bold" })}</g><path d="M 0 ${-r * 2.3 + 50} L 0 ${-r * 2}" ${K}/>` : ""}`;
}
const totalTag = () => `<path d="M -330 0 L -290 -60 L 330 -60 L 330 60 L -290 60 Z" fill="${C.gold}" ${K}/><circle cx="-282" cy="0" r="14" fill="${C.paper}" ${K}/>${txt(30, 6, "$1.10 TOTAL", 70, C.ink, { font: "bold" })}`;
const HOOK = (S, a = "none") => S.put(totalTag(), CX, 1180, 1, { anim: a }) + S.put(bat({ h: 560 }), 250, 1120, 1.0, { anim: a, rot: -4 }) + S.put(ball({ r: 140, label: "HOW MUCH?", labelSize: 40, mouth: "smug" }), 620, 1120, 1, { anim: a });
const pennant = (t) => `<path d="M 0 0 L 0 -60 L 260 -30 Z" fill="${C.red}" ${K}/><path d="M 0 -70 L 0 120" ${K}/>${txt(100, -28, t, 26, C.white, { font: "bold" })}`;

export const BEATS = [
  { at: "A bat and a ball", tag: "MOST PEOPLE GET THIS WRONG", tagColor: "red", tagSize: 60,
    draw: (S) => HOOK(S) + S.sfx("pop", 0.15, 0.3, 0.5) },
  { at: "The bat costs", tag: "THE BAT COSTS $1 MORE", tagColor: "mustard",
    draw: (S) => S.put(bat({ tag: "+$1.00" }), 300, 1220, 1.05, { anim: "grow", d: 0.5 }) + S.put(ball(), 680, 1220, 0.9, { anim: "none" }) },
  { at: "How much is the ball", tag: "HOW MUCH IS THE BALL?", tagColor: "red", tagSize: 64,
    draw: (S) => S.put(ball({ label: "?", labelSize: 110, labelCol: C.red, labelInk: C.white, look: -6 }), CX, 1220, 1.5, { anim: "pop" }) + S.put(clock(), 780, 620, 0.8, { anim: "grow", at: "ball" }) + S.sfx("impact-bass-1", S.t("ball") + 0.1, 0.3) },
  { at: "Lock in your answer", tag: "LOCK IN YOUR ANSWER", tagColor: "mustard",
    draw: (S) => ["3", "2", "1"].map((n, i) => S.put(big(n, [C.olive, C.mustard, C.red][i], 240), 190 + i * 280, 820, 1, { anim: "slam", at: 0.05 + i * 0.28 }) + S.sfx("click", 0.05 + i * 0.28, 0.3)).join("") },
  { at: "Type it in the comments", tag: "TYPE IT IN THE COMMENTS 👇", tagColor: "mustard", tagSize: 58,
    draw: (S) => S.put(sticky(["THE BALL", "COSTS ____ ?"]), CX, 800, 1, { anim: "drop" }) + BR(S, { face: "sly", pose: "point" }, 230, 0.7, { at: "before" }) },
  { at: "10 cents", tag: "10 CENTS?", tagColor: "white", tagSize: 72,
    draw: (S) => S.put(ball({ label: "10¢", labelSize: 70, labelCol: C.gold }), 330, 1220, 1.25, { anim: "pop" }) + BR(S, { face: "grin", pose: "point" }, 720, 0.85, { at: "everyone" }) + S.put(check(1), 720, 640, 1, { anim: "grow", at: "everyone" }) },
  { at: "And it's wrong", tag: "...AND IT'S WRONG", tagColor: "red", tagSize: 72,
    draw: (S) => S.put(ball({ label: "10¢", labelSize: 70, labelCol: C.gold }), CX, 1220, 1.25, { anim: "none" }) + S.put(stampSvg("WRONG", C.red, 120, -12), CX, 760, 1, { anim: "slam", at: "wrong" }) + S.shake(S.t("wrong") + 0.2, 14) + S.sfx("impact-bass-1", S.t("wrong") + 0.15, 0.45) },
  { at: "If the ball is 10 cents", tag: "IF THE BALL WERE 10¢...",
    draw: (S) => S.put(bigReceipt([["BALL  10¢", C.ink, 56], ["BAT  $1.10", C.ink, 56], ["TOTAL $1.20", C.red, 70]], { w: 600, title: "CHECK" }), CX, 1230, 1.1, { anim: "rise" }) + S.put(cross(1.3), 780, 640, 1, { anim: "grow", at: "Together" }) + S.sfx("impact-bass-1", S.t("Together") + 0.2, 0.25) },
  { at: "The ball is 5 cents", tag: "THE BALL IS 5¢", tagColor: "olive", tagSize: 72,
    draw: (S) => S.put(bigReceipt([["BALL  5¢", C.oliveDk, 56], ["BAT  $1.05", C.ink, 56], ["TOTAL $1.10", C.oliveDk, 70]], { w: 600, title: "CHECK" }), CX, 1230, 1.1, { anim: "rise" }) + S.put(check(1.4), 780, 640, 1, { anim: "grow", at: "Total" }) + S.sfx("chime", S.t("Total") + 0.3, 0.35) + S.put(sparkles(6, 220), 780, 640, 1, { anim: "grow", at: "Total" }) },
  { at: "And don't feel bad", tag: "DON'T FEEL BAD", tagColor: "olive",
    draw: (S) => S.put(ball({ label: "5¢", labelSize: 70, labelCol: C.olive, mouth: "smug" }), 300, 1220, 1.1, { anim: "pop" }) + B(S, { pose: "shrug", face: "smile" }, 700, 0.9) },
  { at: "More than half the students", tag: "HALF OF HARVARD, MIT & PRINCETON STUDENTS GOT IT WRONG", tagColor: "red", tagSize: 42,
    draw: (S) => [["Harvard", "HARVARD"], ["MIT", "MIT"], ["Princeton", "PRINCETON"]].map(([w, t], i) => S.put(pennant(t), 120 + i * 260, 760 + (i % 2) * 60, 1, { anim: "drop", at: w }) + S.put(txt(0, 0, "10¢", 64, C.red, { font: "bold" }), 220 + i * 260, 1040 + (i % 2) * 60, 1, { anim: "slam", at: w })).join("") },
  { at: "Here's why it matters", tag: "HERE'S WHY IT MATTERS", tagColor: "slate",
    draw: (S) => PC(S, { screen: "WHY?", pose: "point", mouth: "o" }, CX, 1.15) },
  { at: "That fast, confident answer", tag: "THAT FAST, CONFIDENT VOICE...", tagColor: "red",
    draw: (S) => BR(S, { face: "shout", pose: "mega" }, 260, 1) + S.put(txt(0, 0, "10¢!", 120, C.red, { font: "bold" }), 680, 760, 1, { anim: "slam", at: "answer" }) },
  { at: "It's the same voice in your head", tag: "...IS THE ONE THAT SPENDS YOUR MONEY", tagColor: "red", tagSize: 48,
    draw: (S) => BR(S, { face: "shout", pose: "mega" }, 230, 0.9) + [["five", "ONLY $5!"], ["sale", "ON SALE!"], ["Zero", "0% INTEREST!"]].map(([w, t], i) => S.put(bubble(t, { size: 46, w: 380, h: 120, dx: -120, dy: 0 }), 640, 700 + i * 170, 1, { anim: "grow", at: w })).join("") },
  { at: "So when a money decision", tag: "FEELS OBVIOUS? DO THE MATH ONCE.", tagColor: "olive", tagSize: 52,
    draw: (S) => PC(S, { screen: "$1.10", pose: "up", mouth: "smile" }, 260, 1) + S.put(stampSvg("DO THE MATH ONCE", C.oliveDk, 50, -8), 620, 760, 1, { anim: "slam", at: "math" }) + S.sfx("impact-bass-1", S.t("math") + 0.2, 0.25) },
  { at: "Now send this to the smartest", tag: "SEND THIS TO THE SMARTEST PERSON YOU KNOW", tagColor: "mustard", tagSize: 46,
    draw: (S) => S.put(phone(["SHARE", "", "↗"], { size: 44, w: 300, h: 520, head: C.olive }), 300, 1220, 1, { anim: "pop" }) + B(S, { pose: "cheer", face: "smug" }, 700, 0.95, { at: "smartest" }) },
  { at: "and ask them", tag: "MOST PEOPLE GET THIS WRONG", tagColor: "red", tagSize: 60, tagAt: "ask",
    draw: (S) => HOOK(S, "pop") },
];
