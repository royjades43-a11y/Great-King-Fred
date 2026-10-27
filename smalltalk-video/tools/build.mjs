// Generates index.html + compositions/*.html from script/script.json, theme.json and
// timing/words.json. Every element is timed off the spoken word it is cued to, minus
// theme.lead seconds, so the picture arrives just before the voice names it.
//
//   node tools/build.mjs            build
//   node tools/build.mjs --cues     also print the cue sheet (element → word → time)
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { stickSvg, POSES, MOUTHS } from "./stick.mjs";
import { iconSvg } from "./icons.mjs";

const root = new URL("..", import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(join(root, p), "utf8"));
const theme = read("theme.json");
const script = read("script/script.json");
const LEAD = theme.lead ?? 0.25;
const W = 1920, H = 1080;

// ---------- words + alignment ----------
const rawWords = (() => {
  const j = read("timing/words.json");
  const list = Array.isArray(j) ? j : j.words ?? (j.segments ?? []).flatMap((s) => s.words ?? []);
  return list.map((w) => ({ text: String(w.text ?? w.word).trim(), start: +w.start, end: +w.end })).filter((w) => w.text);
})();
const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']/gu, "");
const heard = rawWords.map((w) => ({ ...w, n: norm(w.text) })).filter((w) => w.n);

// all script tokens in order, each tagged with its beat
const tokens = [];
const beats = new Map();
for (const scene of script.scenes)
  for (const beat of scene.beats) {
    const first = tokens.length;
    for (const w of beat.say.split(/\s+/).filter(Boolean)) if (norm(w)) tokens.push({ n: norm(w), beat: beat.id });
    beats.set(beat.id, { ...beat, scene: scene.id, first, last: tokens.length - 1 });
  }

const similar = (a, b) => a === b || (a.length > 3 && b.length > 3 && (a.startsWith(b) || b.startsWith(a)));
// greedy forward alignment with a small look-ahead; unmatched tokens are interpolated
let j = 0;
for (const tok of tokens) {
  for (let k = j; k < Math.min(j + 8, heard.length); k++)
    if (similar(tok.n, heard[k].n)) { tok.start = heard[k].start; tok.end = heard[k].end; j = k + 1; break; }
}
const matched = tokens.filter((t) => t.start != null).length;
tokens.forEach((t, i) => {
  if (t.start != null) return;
  let a = i - 1; while (a >= 0 && tokens[a].start == null) a--;
  let b = i + 1; while (b < tokens.length && tokens[b].start == null) b++;
  const t0 = a >= 0 ? tokens[a].end : 0, t1 = b < tokens.length ? tokens[b].start : t0 + 0.4 * (b - a);
  const f = (i - a) / (b - a);
  t.start = t0 + (t1 - t0) * f; t.end = t.start + 0.2; t.guessed = true;
});

// "beat:word", "beat:word#2", "beat:start", "beat:end", "beat" → token
function cueToken(cue) {
  const [bid, sel = "start"] = cue.split(":");
  const b = beats.get(bid);
  if (!b) throw new Error(`unknown beat in cue "${cue}"`);
  if (sel === "start") return tokens[b.first];
  if (sel === "end") return { ...tokens[b.last], start: tokens[b.last].end };
  const [word, nth = "1"] = sel.split("#");
  let seen = 0;
  for (let i = b.first; i <= b.last; i++)
    if (similar(tokens[i].n, norm(word)) && ++seen === +nth) return { ...tokens[i], index: i };
  throw new Error(`word "${word}" not in beat ${bid}: "${b.say}"`);
}
const spoken = (cue) => cueToken(cue).start;

// ---------- scene windows (global seconds) ----------
const scenes = script.scenes.map((s) => ({ ...s, start: 0, end: 0 }));
scenes.forEach((s, i) => {
  s.start = i === 0 ? 0 : spoken(`${s.beats[0].id}:start`) - LEAD - 0.2;
});
const voEnd = tokens.at(-1).end;
scenes.forEach((s, i) => (s.end = i < scenes.length - 1 ? scenes[i + 1].start : voEnd + (s.tail ?? 2)));
const total = +scenes.at(-1).end.toFixed(3);

// ---------- text helpers ----------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// "*a b* c" → [{w:"a",acc:true},{w:"b",acc:true},{w:"c"}]
function parseWords(text) {
  const out = [];
  text.split(/(\*[^*]+\*|![^!\s][^!]*!)/).forEach((seg) => {
    const acc = seg.startsWith("*") ? "acc" : seg.startsWith("!") && seg.length > 2 ? "alm" : "";
    const plain = seg.replace(/^[*!]|[*!]$/g, "");
    plain.split(/\s+/).filter(Boolean).forEach((w, i) => {
      // punctuation glued to the end of an emphasised run ("*wrong*.") stays on that word, in ink
      const glued = i === 0 && !/^\s/.test(plain) && !acc;
      if (glued && !/[\p{L}\p{N}]/u.test(w) && out.length) out.at(-1).tail = (out.at(-1).tail ?? "") + w;
      else out.push({ w, acc });
    });
  });
  return out;
}
const color = (c) => (c ? `var(--${c})` : "var(--ink)");

// ---------- markup per element type ----------
function boxStyle(x, y) {
  const bw = 2 * Math.min(x, W - x), bh = 2 * Math.min(y, H - y);
  return `position:absolute;left:${x - bw / 2}px;top:${y - bh / 2}px;width:${bw}px;height:${bh}px;`;
}

function textMarkup(el, pid) {
  const ws = parseWords(el.text);
  const spans = ws
    .map((w, i) => `<span id="${pid}-w${i}" class="w${w.acc ? " " + w.acc : ""}">${esc(w.w)}${w.tail ? `<span class="tail">${esc(w.tail)}</span>` : ""}</span>`)
    .join(" ");
  return `<div class="txt${el.hero ? " hero" : ""}" style="font-size:${el.size ?? 72}px;font-weight:${el.weight ?? 800};color:${color(el.color)}">${spans}</div>`;
}

function markup(el, pid) {
  switch (el.t) {
    case "text": return textMarkup(el, pid);
    case "chapter":
      return `<div class="chap"><div class="chap-num">${esc(el.num)}</div><div class="chap-rule"></div>${textMarkup({ ...el, size: 76 }, pid)}</div>`;
    case "stick": return stickSvg(pid, el);
    case "icon":
      return `<div class="ico" style="width:${el.size}px;height:${el.size}px;color:${color(el.color)}">${iconSvg(el.name)}</div>`;
    case "bubble":
      return `<div class="ico bub" style="width:${el.size * 1.4}px;height:${el.size}px">${iconSvg("bubble")}<div class="bub-t" style="font-size:${el.fontSize ?? 70}px">${esc(el.text)}</div></div>`;
    case "card":
      return `<div class="card"><div class="card-k">${esc(el.kicker)}</div><div class="card-t">${esc(el.text)}</div><div class="card-s">${esc(el.sub)}</div></div>`;
    case "bar":
      return `<div class="barw" style="height:${2 * Math.min(el.y, H - el.y)}px"><div class="bar" style="width:${el.w}px;height:${el.h}px;background:${color(el.color)};bottom:50%;margin-left:${-el.w / 2}px"></div>${el.label ? `<div class="bar-l" style="top:calc(50% + 14px)">${esc(el.label)}</div>` : ""}</div>`;
    case "strike": return `<div class="strike" style="width:${el.w}px"></div>`;
    case "stamp": return `<div class="stamp" style="font-size:${el.size}px">${esc(el.text)}</div>`;
    case "meter":
      return `<div class="meter" style="height:${el.h}px"><div class="meter-fill"></div><div class="meter-mark" style="bottom:${el.mark * 100}%"><span>offended</span></div></div>`;
    case "slot":
      return `<div class="slot"><svg class="slot-box" viewBox="0 0 440 300"><rect x="6" y="6" width="428" height="288" rx="28" pathLength="1"/></svg><div class="slot-n">${esc(el.n)}</div><div class="slot-t">${textMarkup({ ...el, size: 50 }, pid)}</div></div>`;
    case "balance": return `<div class="ico" style="width:${el.size}px;height:${el.size * 0.7}px">${iconSvg("balance", pid, el.labels)}</div>`;
    default: throw new Error(`unknown element type ${el.t}`);
  }
}

// ---------- per-word cue times for text ----------
function wordTimes(el, sceneStart) {
  const ws = parseWords(el.text);
  const base = cueToken(el.at);
  const beat = beats.get(el.at.split(":")[0]);
  // search the cue's own sentence (words said before the cue land with it), never far past it
  let idx = beat.first;
  const stop = Math.min(beat.last + 1, tokens.length); // only the cue's own sentence
  let prev = base.start;
  return ws.map((w) => {
    const n = norm(w.w);
    for (let k = idx; k < stop; k++)
      if (n && similar(tokens[k].n, n)) { idx = k + 1; prev = tokens[k].start; return +(prev - LEAD - sceneStart).toFixed(3); }
    prev += 0.1; // a word the voice doesn't say lands just after the one before it
    return +(prev - LEAD - sceneStart).toFixed(3);
  });
}

// ---------- build one scene ----------
const cueSheet = [];
function buildScene(s, si) {
  const local = (g) => +(g - s.start).toFixed(3);
  const sceneLen = +(s.end - s.start).toFixed(3);
  const els = [];
  s.elements.forEach((el, ei) => {
    const pid = `${s.id}-${el.id}`;
    let tIn = el.startAtZero && si === 0 ? 0 : local(spoken(el.at) - LEAD + (el.delay ?? 0));
    tIn = Math.max(0, tIn);
    let tOut = el.out
      ? local(spoken(el.out.includes(":") ? el.out : `${el.out}:start`) - LEAD) - 0.24
      : sceneLen - 0.34 - 0.025 * (s.elements.length - ei);
    // a line needs time to be read (~0.5 s + 0.3 s a word): if its own cue leaves too little, it
    // arrives earlier, but never before its sentence starts (words still land as they are spoken)
    if (el.t === "text") {
      const need = Math.min(0.5 + 0.3 * parseWords(el.text).length, 2.6);
      const sentenceIn = local(spoken(`${el.at.split(":")[0]}:start`) - LEAD);
      if (tOut - tIn < need) tIn = Math.max(0, Math.min(tIn, Math.max(sentenceIn, tOut - need)));
    }
    tOut = Math.max(tOut, tIn + (el.t === "strike" ? 0.3 : 0.6));
    const outDur = ["slam", "pop", "blur", "draw"].includes(el.from) ? 0.25 : 0.3;
    const end = Math.min(sceneLen, tOut + outDur + 0.04);
    cueSheet.push(`${s.id.padEnd(6)} ${el.id.padEnd(6)} ${el.t.padEnd(8)} cue ${el.at.padEnd(18)} spoken ${(local(spoken(el.at)) + s.start).toFixed(2).padStart(7)}s  in ${(tIn + s.start).toFixed(2).padStart(7)}s  out ${(tOut + s.start).toFixed(2).padStart(7)}s`);
    const a = { id: pid, t: el.t, from: el.from ?? "pop", exit: el.exit ?? null, in: tIn, out: tOut, outDur };
    if (el.t === "text" || el.t === "chapter") a.words = el.perWord ?? theme.perWord ? wordTimes(el, s.start) : null;
    if (el.t === "slot") a.fill = local(spoken(el.fill) - LEAD);
    if (el.t === "stick") {
      a.poses = el.poses.map(([p, c]) => [p, Math.max(tIn, local(spoken(c) - LEAD))]);
      a.mouth = (el.mouth ?? []).map(([m, c]) => [m, Math.max(tIn, local(spoken(c) - LEAD))]);
    }
    if (el.t === "balance") a.tilt = el.tilt.map(([d, c]) => [d, Math.max(tIn, local(spoken(c) - LEAD))]);
    els.push({ a, html: `<div id="${pid}" class="clip el" data-start="${tIn}" data-duration="${+(end - tIn).toFixed(3)}" data-track-index="${ei + 1}" style="${boxStyle(el.x, el.y)}z-index:${el.t === "strike" ? 50 : ei + 2}"${["strike", "stamp", "icon", "bubble"].includes(el.t) ? " data-layout-allow-overlap" : el.t === "meter" ? " data-layout-allow-overflow" : ""}${el.t === "strike" ? " data-layout-allow-occlusion" : ""}><div id="${pid}-in" class="in">${markup(el, pid)}</div></div>` });
  });

  const html = `<template>
  <style>
${sceneCss()}
  </style>
  <div id="root" data-composition-id="${s.id}" data-width="${W}" data-height="${H}">
${els.map((e) => "    " + e.html).join("\n")}
  </div>
  <script>
    (function () {
      const ELS = ${JSON.stringify(els.map((e) => e.a))};
      const POSES = ${JSON.stringify(POSES)};
      const MOUTHS = ${JSON.stringify(MOUTHS)};
${RUNTIME}
      window.__timelines = window.__timelines || {};
      window.__timelines["${s.id}"] = tl;
    })();
  </script>
</template>
`;
  writeFileSync(join(root, "compositions", `${s.id}.html`), html);
  return { id: s.id, start: +s.start.toFixed(3), duration: sceneLen };
}

const face = (fam, files) => (files ?? []).map((f) => `@font-face { font-family: "${fam}"; font-weight: ${f.weight}; font-style: normal; src: url("${f.src}") format("woff2"); }`);
const fontFace = [...face(theme.font, theme.fontFiles), ...face(theme.display, theme.displayFiles)].join("\n    ");
const display = theme.display ? `"${theme.display}", ` : "";
function sceneCss() {
  return `    ${fontFace}
    #root { position: absolute; inset: 0; font-family: "${theme.font}", sans-serif; }
    .el { display: flex; align-items: center; justify-content: center; pointer-events: none; }
    .in { position: relative; display: flex; align-items: center; justify-content: center; }
    .txt { white-space: nowrap; letter-spacing: -0.03em; line-height: 1.05; text-align: center; text-shadow: 0 4px 0 var(--shadow-soft), 0 10px 18px var(--shadow-soft); }
    .txt .w { display: inline-block; }
    .acc { color: var(--accent); }
    .alm { color: var(--alarm); }
    .tail { color: var(--ink); }
    .chap { display: flex; flex-direction: column; align-items: center; gap: 18px; }
    .chap-num { font-family: ${display}sans-serif; font-size: 240px; font-weight: ${theme.displayWeight ?? 400}; letter-spacing: -0.04em; line-height: 0.9; color: var(--ink); text-shadow: 0 8px 0 var(--shadow-soft), 0 18px 30px var(--shadow); }
    .chap-rule { width: 120px; height: 10px; border-radius: 5px; background: var(--accent); box-shadow: 0 6px 10px var(--shadow-soft); }
    .hero { font-family: ${display}sans-serif; font-weight: ${theme.displayWeight ?? 400} !important; letter-spacing: -0.03em; text-transform: uppercase; word-spacing: 0.12em; }
    .ico svg { width: 100%; height: 100%; overflow: visible; filter: drop-shadow(0 6px 0 var(--shadow-soft)) drop-shadow(0 12px 14px var(--shadow-soft)); }
    .ico .s { fill: none; stroke: currentColor; stroke-width: 10; stroke-linecap: round; stroke-linejoin: round; }
    .ico .f { fill: currentColor; stroke: none; }
    .ico .a2 { stroke: var(--accent2); }
    .ico .acc-s { stroke: var(--accent); }
    .ico .alm-s { stroke: var(--alarm); }
    .ico .alm-f { fill: var(--alarm); stroke: none; }
    .ico .card-f { fill: var(--card); }
    .ico .t { font-family: "${theme.font}", sans-serif; font-weight: 800; font-size: 34px; fill: var(--ink); text-anchor: middle; }
    .bub { position: relative; color: var(--ink); }
    .bub-t { position: absolute; inset: 0 0 18% 0; display: flex; align-items: center; justify-content: center; font-size: 70px; font-weight: 800; color: var(--ink); letter-spacing: 0.04em; }
    .card { background: var(--card); border: 6px solid var(--ink); border-radius: 26px; padding: 26px 44px 30px; display: flex; flex-direction: column; gap: 6px; min-width: 520px; box-shadow: 0 10px 0 var(--shadow-soft), 0 24px 40px var(--shadow); }
    .card .txt, .card div { text-shadow: none; }
    .card-k { font-size: 30px; font-weight: 800; color: var(--accent); letter-spacing: 0.12em; }
    .card-t { font-size: 54px; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
    .card-s { font-size: 36px; font-weight: 600; color: var(--muted); }
    .barw { position: relative; width: 1px; }
    .bar { position: absolute; left: 50%; border-radius: 14px 14px 0 0; transform-origin: 50% 100%; }
    .bar-l { position: absolute; left: 0; width: 400px; margin-left: -200px; text-align: center; font-size: 36px; font-weight: 800; color: var(--ink); }
    .strike { height: 12px; border-radius: 6px; background: var(--alarm); transform-origin: 0% 50%; box-shadow: 0 5px 8px var(--shadow); }
    .stamp { border: 10px solid var(--alarm); color: var(--alarm); background: rgba(241, 245, 239, 0.55); border-radius: 18px; padding: 10px 34px; font-weight: 800; letter-spacing: 0.08em; box-shadow: 0 8px 0 var(--shadow-soft), 0 18px 26px var(--shadow); }
    .meter { position: relative; width: 74px; border: 8px solid var(--ink); border-radius: 37px; overflow: visible; }
    .meter-fill { position: absolute; left: 8px; right: 8px; bottom: 8px; top: 8px; border-radius: 26px; background: var(--muted); opacity: 0.35; transform-origin: 50% 100%; }
    .meter-mark { position: absolute; left: -26px; width: 110px; height: 10px; border-radius: 5px; background: var(--alarm); }
    .meter-mark span { position: absolute; left: 130px; top: -18px; font-size: 32px; font-weight: 800; color: var(--alarm); white-space: nowrap; }
    .slot { position: relative; width: 440px; height: 300px; }
    .slot-box { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
    .slot-box rect { fill: var(--card); stroke: var(--ink); stroke-width: 8; }
    .slot-n { position: absolute; left: 50%; top: -38px; width: 76px; height: 76px; margin-left: -38px; border-radius: 38px; background: var(--ink); color: var(--paper); font-size: 40px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
    .slot-t { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; }
    .slot-t .txt { white-space: normal; width: 360px; line-height: 1.1; }
    .stick { overflow: visible; filter: drop-shadow(0 6px 0 var(--shadow-soft)) drop-shadow(8px 14px 12px var(--shadow-soft)); }
    .stick .s { fill: none; stroke: var(--ink); stroke-width: 11; stroke-linecap: round; stroke-linejoin: round; }
    .stick .face { fill: var(--paper); }
    .stick .ground { fill: var(--shadow); stroke: none; }
    .stick .f { fill: var(--ink); }
    .stick .bow { fill: var(--accent); stroke: none; }
    .stick .tat { fill: var(--accent); stroke: none; }`;
}

// The in-composition animation runtime: reads ELS and writes every tween onto one paused
// timeline. Entrances arrive slow on long-tailed eases; exits leave ~45% faster, back out.
const RUNTIME = `
      const tl = gsap.timeline({ paused: true });
      const OFF = { left: [-280, 0], right: [280, 0], top: [0, -220], bottom: [0, 220] };
      const OPP = { left: "left", right: "right", top: "top", bottom: "bottom" };
      const q = (s) => document.getElementById(s);
      ELS.forEach((e) => {
        const inner = "#" + e.id + "-in";
        // ---- entrance ----
        if (OFF[e.from]) {
          const [x, y] = OFF[e.from];
          tl.fromTo(inner, { x, y, opacity: 0, filter: "blur(14px)" },
            { x: 0, y: 0, opacity: 1, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, e.in);
        } else if (e.from === "slam") {
          tl.fromTo(inner, { scale: 1.9, opacity: 0, filter: "blur(10px)", rotation: e.t === "stamp" ? -8 : 0 },
            { scale: 1, opacity: 1, filter: "blur(0px)", rotation: e.t === "stamp" ? -8 : 0, duration: 0.36, ease: "power4.out" }, e.in);
        } else if (e.from === "blur") {
          tl.fromTo(inner, { opacity: 0, filter: "blur(18px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, e.in);
        } else if (e.from === "none") {
          tl.set(inner, { opacity: 1 }, 0);
        } else if (e.from === "draw") {
          tl.fromTo(inner, { opacity: 0 }, { opacity: 1, duration: 0.12 }, e.in);
        } else {
          tl.fromTo(inner, { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.7)" }, e.in);
        }
        // draw-on strokes / growing shapes
        if (e.from === "draw") {
          const paths = q(e.id).querySelectorAll("[pathLength]");
          if (paths.length) tl.fromTo(paths, { strokeDasharray: 1, strokeDashoffset: 1 },
            { strokeDasharray: 1, strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut", stagger: 0.08 }, e.in);
        }
        if (e.t === "bar") tl.fromTo("#" + e.id + " .bar", { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "expo.out" }, e.in);
        if (e.t === "meter") {
          tl.fromTo("#" + e.id + " .meter-fill", { scaleY: 0 }, { scaleY: 1, duration: 0.6, ease: "expo.out" }, e.in);
          tl.fromTo("#" + e.id + " .meter-mark", { opacity: 0, scaleX: 0.2 }, { opacity: 1, scaleX: 1, duration: 0.4, ease: "back.out(2)" }, e.in + 0.45);
        }
        if (e.t === "strike") tl.fromTo(inner + " .strike", { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, e.in);
        if (e.t === "slot") {
          tl.fromTo("#" + e.id + " rect", { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDasharray: 1, strokeDashoffset: 0, duration: 0.6, ease: "power2.inOut" }, e.in);
          tl.fromTo("#" + e.id + " .slot-t", { opacity: 0, filter: "blur(8px)", y: 20 }, { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.4, ease: "power4.out" }, e.fill);
        }
        // per-word reveal: each word lands on its own spoken word
        if (e.words) e.words.forEach((t, i) => {
          tl.fromTo("#" + e.id + "-w" + i, { opacity: 0, filter: "blur(6px)" }, { opacity: 1, filter: "blur(0px)", duration: 0.16, ease: "power2.out" }, Math.max(e.in, t));
        });
        // ---- stickman acting ----
        if (e.poses) {
          const joints = ["aLu", "aLl", "aRu", "aRl", "hd"];
          let prev = POSES[e.poses[0][0]];
          joints.forEach((j) => tl.set("#" + e.id + "-" + j, { rotation: prev[j] || 0, svgOrigin: POSES._org[j] }, 0));
          tl.set("#" + e.id + "-hd", { y: prev.hy || 0 }, 0);
          e.poses.slice(1).forEach(([name, t]) => {
            const p = POSES[name];
            joints.forEach((j, k) => tl.fromTo("#" + e.id + "-" + j, { rotation: prev[j] || 0, svgOrigin: POSES._org[j] },
              { rotation: p[j] || 0, svgOrigin: POSES._org[j], duration: 0.42, ease: "back.out(1.3)" }, t + (j === "hd" ? 0 : 0.04 + k * 0.025)));
            tl.fromTo("#" + e.id + "-hd", { y: prev.hy || 0 }, { y: p.hy || 0, duration: 0.42, ease: "power3.out" }, t);
            prev = p;
          });
          // a blink every ~3.1 s while on screen: life, not a loop on a title
          for (let b = e.in + 1.3; b < e.out - 0.3; b += 3.1)
            tl.fromTo("#" + e.id + " .eye", { scaleY: 1, svgOrigin: "150 80" }, { scaleY: 0.1, svgOrigin: "150 80", duration: 0.06, yoyo: true, repeat: 1 }, b);
        }
        if (e.mouth) {
          let cur = null;
          MOUTHS.forEach((m) => tl.set("#" + e.id + "-m-" + m, { opacity: m === (e.mouth[0] || [])[0] ? 1 : 0 }, 0));
          e.mouth.forEach(([m, t], i) => {
            if (i === 0) { cur = m; return; }
            tl.fromTo("#" + e.id + "-m-" + cur, { opacity: 1 }, { opacity: 0, duration: 0.06 }, t);
            tl.fromTo("#" + e.id + "-m-" + m, { opacity: 0 }, { opacity: 1, duration: 0.06 }, t);
            cur = m;
          });
        }
        if (e.tilt) {
          let prev = e.tilt[0][0];
          tl.set("#" + e.id + "-beam", { rotation: prev, svgOrigin: "300 120" }, 0);
          tl.set("#" + e.id + "-panL", { rotation: -prev, svgOrigin: "90 120" }, 0);
          tl.set("#" + e.id + "-panR", { rotation: -prev, svgOrigin: "510 120" }, 0);
          e.tilt.slice(1).forEach(([d, t]) => {
            tl.fromTo("#" + e.id + "-beam", { rotation: prev, svgOrigin: "300 120" }, { rotation: d, svgOrigin: "300 120", duration: 0.7, ease: "back.out(1.6)" }, t);
            tl.fromTo("#" + e.id + "-panL", { rotation: -prev, svgOrigin: "90 120" }, { rotation: -d, svgOrigin: "90 120", duration: 0.7, ease: "back.out(1.6)" }, t);
            tl.fromTo("#" + e.id + "-panR", { rotation: -prev, svgOrigin: "510 120" }, { rotation: -d, svgOrigin: "510 120", duration: 0.7, ease: "back.out(1.6)" }, t);
            prev = d;
          });
        }
        // ---- exit: back out the way it came, faster than it arrived ----
        const ex = e.exit || OPP[e.from];
        if (ex && OFF[ex]) {
          const [x, y] = OFF[ex];
          tl.fromTo(inner, { x: 0, y: 0, opacity: 1, filter: "blur(0px)" },
            { x: x * 0.8, y: y * 0.8, opacity: 0, filter: "blur(12px)", duration: e.outDur, ease: "power3.in", immediateRender: false }, e.out);
        } else {
          const r = e.t === "stamp" ? -8 : 0;
          tl.fromTo(inner, { scale: 1, opacity: 1, filter: "blur(0px)", rotation: r },
            { scale: 0.86, opacity: 0, filter: "blur(10px)", rotation: r, duration: e.outDur, ease: "power3.in", immediateRender: false }, e.out);
        }
      });`;

// ---------- write everything ----------
mkdirSync(join(root, "compositions"), { recursive: true });
const built = scenes.map(buildScene);

const vars = ["paper", "ink", "muted", "accent", "accent2", "alarm", "card"];
const shadowVars = `--shadow: ${theme.shadow ?? "rgba(0,0,0,0.3)"}; --shadow-soft: ${theme.shadowSoft ?? "rgba(0,0,0,0.18)"};`;
const index = `<!doctype html>
<html lang="en" data-composition-variables='${JSON.stringify(vars.map((v) => ({ id: v, type: "color", label: v, default: theme[v] })))}'>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <title>${esc(script.title)}</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <style>
      :root { ${vars.map((v) => `--${v}: ${theme[v]};`).join(" ")} ${shadowVars} }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--paper); }
      #paper { position: absolute; inset: 0; background: var(--paper); }
      ${fontFace}
    </style>
  </head>
  <body>
    <!-- GENERATED by tools/build.mjs from script/script.json + timing/words.json. Edit those, then npm run build. -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="${total}" data-width="${W}" data-height="${H}">
      <div id="paper"></div>
${built.map((b, i) => `      <div id="${b.id}" data-composition-id="${b.id}" data-composition-src="compositions/${b.id}.html" data-start="${b.start}" data-duration="${b.duration}" data-track-index="${i % 2 === 0 ? 1 : 2}" data-track-kind="graphics" data-width="${W}" data-height="${H}"></div>`).join("\n")}
      <audio id="vo" class="clip" src="${theme.voiceover ?? "assets/voiceover.wav"}" data-start="0" data-track-index="3" data-volume="1"></audio>
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
writeFileSync(join(root, "index.html"), index);
writeFileSync(join(root, "timing/cues.txt"), cueSheet.join("\n") + "\n");
console.log(`built ${built.length} scenes, ${total}s; words heard ${heard.length}, script tokens ${tokens.length}, aligned ${matched}`);
if (process.argv.includes("--cues")) console.log(cueSheet.join("\n"));
