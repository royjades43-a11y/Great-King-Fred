// Short 2 — "Why Cards Make You Spend More"
import { C, at, txt, bean, brain, card, wallet, bill, envelope, clipboard, stampSvg, cross, check, sparkles, arrow, G, CX, B, BR, PC, big, sticky, btn } from "./common.mjs";

export const CAPFIX = { "fund": "fun", "pain@41": "paying", "hurt,": "hurt…", "MIT,": "M.I.T.," };
const hand = (item = "") => `<path d="M -120 40 Q -140 -40 -60 -60 L 60 -60 Q 110 -60 110 -20 L 110 40 Z" fill="${C.bean}" stroke="${C.ink}" stroke-width="6"/>
  <path d="M -60 -60 L -60 -110 Q -40 -130 -20 -110 L -20 -60 M -20 -60 L -20 -120 Q 0 -140 20 -120 L 20 -60" fill="${C.bean}" stroke="${C.ink}" stroke-width="6"/>${item}`;
const paddle = (label, col) => `<path d="M 0 0 L 0 220" stroke="${C.woodDk}" stroke-width="22" stroke-linecap="round"/><circle r="110" fill="${col}" stroke="${C.ink}" stroke-width="7"/>${txt(0, 6, label, 46, C.white, { font: "bold" })}`;
const HOOK = (S, a = "none") => S.put(card({ mouth: true, label: "CREDIT" }), 300, 700, 1.25, { anim: a }) + S.put(wallet({ open: true }), 700, 760, 1.3, { anim: a }) +
  S.put(`<path d="M -40 -40 Q -20 -60 0 -40 M 20 -40 Q 40 -60 60 -40" fill="none" stroke="${C.ink}" stroke-width="5"/>` + txt(10, 20, "ouch", 40, C.ink), 700, 560, 1, { anim: a }) + B(S, { pose: "shrug", face: "thinking" }, CX, 0.75, { anim: a });

export const BEATS = [
  { at: "You spend more with a card", tag: "CARDS MAKE YOU SPEND MORE", tagColor: "red",
    draw: (S) => HOOK(S) + S.put(stampSvg("PROVEN", C.oliveDk, 64, -10), 470, 520, 1, { anim: "slam", at: "research" }) + S.sfx("impact-bass-1", S.t("research") + 0.15, 0.3) },
  { at: "When you pay with cash", tag: "CASH: YOU FEEL IT",
    draw: (S) => S.put(wallet({ open: true }), 320, 1150, 1.6, { anim: "pop" }) + S.put(txt(0, 0, "OUCH!", 90, C.red, { font: "bold", rot: -8 }), 700, 620, 1, { anim: "slam", at: "feel" }) +
      S.put(bill(), 320, 880, 1.3, { anim: "none", id: "fly" }) + S.js(`tl.to("#${S.id("fly")}-i", { x: 300, y: -260, rotation: 30, opacity: 0, duration: 0.8, ease: "power2.in" }, ${S.t("leaves")});`) },
  { at: "Psychologists call that the pain of paying", tag: "THE PAIN OF PAYING", tagColor: "slate",
    draw: (S) => PC(S, { screen: "OUCH", pose: "point", mouth: "o" }, 250, 0.95) + S.put(big("PAIN", C.red, 140), 650, 620, 1, { anim: "grow", at: "pain" }) + S.put(txt(0, 0, "of paying", 70, C.ink), 650, 760, 1, { anim: "fade", at: "paying" }) },
  { at: "A card removes the pain", tag: "A CARD REMOVES THE PAIN", tagColor: "red",
    draw: (S) => S.put(card({ label: "TAP" }), CX, 680, 1.6, { anim: "pop" }) + S.put(sparkles(5, 220), CX, 680, 1, { anim: "grow", at: "Tap" }) + S.put(check(1.4), 720, 450, 1, { anim: "grow", at: "done" }) + S.sfx("chime", S.t("Tap"), 0.25) +
      BR(S, { face: "happy", pose: "cheer" }, 230, 0.7, { at: "nothing" }) },
  { at: "But here's the crazy part", tag: "BUT HERE'S THE CRAZY PART", tagColor: "red",
    draw: (S) => B(S, { pose: "cheeks", face: "shocked" }, CX, 1.15, { anim: "drop" }) + S.put(big("!", C.red, 220), 760, 640, 1, { anim: "grow", at: "crazy" }) + S.sfx("impact-bass-1", S.t("crazy"), 0.3) },
  { at: "In a study at MIT", tag: "AN M.I.T. STUDY", tagColor: "slate",
    draw: (S) => S.put(clipboard([["PRELEC &", ""], ["SIMESTER, 2001", ""], ["TICKET AUCTION", ""]], { w: 600 }), CX, 1100, 1.05, { anim: "rise" }) + S.put(`<rect x="-140" y="-80" width="280" height="160" rx="12" fill="${C.terra}" stroke="${C.ink}" stroke-width="6"/><path d="M 60 -80 L 60 80" stroke="${C.white}" stroke-width="5" stroke-dasharray="10 10"/>` + txt(-30, 4, "TICKET", 40, C.white, { font: "bold" }), CX, 520, 1, { anim: "drop", at: "tickets" }) },
  { at: "offered up to twice as much", tag: "CARD BIDS: UP TO 2×", tagColor: "red",
    draw: (S) => S.put(paddle("CASH", C.olive), 260, 900, 0.9, { anim: "rise" }) + S.put(paddle("CARD", C.red), 680, 900, 0.9, { anim: "rise", at: "credit" }) +
      S.put(big("$", C.oliveDk, 110), 260, 620, 1, { anim: "pop" }) + S.put(big("$$", C.red, 150), 680, 540, 1, { anim: "slam", at: "twice" }) },
  { at: "Same tickets", tag: "SAME TICKETS. DOUBLE THE PRICE.", tagColor: "ink",
    draw: (S) => [["tickets", "SAME TICKETS"], ["people", "SAME PEOPLE"]].map(([w, t], i) => S.put(btn(t, C.white), CX, 560 + i * 170, 1, { anim: "pop", at: w })).join("") + S.put(stampSvg("2× PRICE", C.red, 80, -8), CX, 960, 1, { anim: "slam", at: "double" }) + S.sfx("impact-bass-1", S.t("double") + 0.15, 0.3) },
  { at: "So here's the trick", tag: "THE FIX: FEEL IT AGAIN", tagColor: "olive",
    draw: (S) => S.put(envelope("FUN MONEY", { seal: true, w: 520, h: 320, size: 52 }), CX, 900, 1, { anim: "drop", at: "fund" }) + [0, 1, 2].map((i) => S.put(bill(), 330 + i * 140, 560, 0.8, { anim: "drop", at: S.t("cash") + i * 0.15 })).join("") },
  { at: "or a debit card with a set weekly amount", tag: "OR A WEEKLY DEBIT LIMIT",
    draw: (S) => S.put(card({ label: "DEBIT", color: C.olive }), CX, 640, 1.5, { anim: "pop" }) + S.put(txt(0, 0, "$100 / WEEK", 80, C.oliveDk, { font: "bold" }), CX, 900, 1, { anim: "fade", at: "weekly" }) + B(S, { pose: "heart", face: "content" }, 760, 0.6, { at: "feel" }) },
  { at: "Be honest", tag: "BE HONEST...", tagColor: "mustard",
    draw: (S) => S.put(sticky(["DO YOU SPEND", "MORE WITH A CARD?"]), CX, 620, 1, { anim: "drop" }) + S.put(btn("YES", C.red, C.white), 300, 960, 1, { anim: "pop", at: "Yes" }) + S.put(btn("NO", C.olive), 640, 960, 1, { anim: "pop", at: "no" }) },
  { at: "because when pain", tag: "CARDS MAKE YOU SPEND MORE", tagColor: "red", tagAt: "doesn't",
    draw: (S) => HOOK(S, "pop") },
];
