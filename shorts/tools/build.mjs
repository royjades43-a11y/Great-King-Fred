// PESABRAIN Shorts builder (1080x1920, YouTube-Shorts-safe layout). Usage: node tools/build.mjs 1
// Reads the word-level transcript (tools/words.json) and the beat list (tools/beats.mjs),
// starts every beat on the word it names, and writes one HyperFrames scene per beat
// (compositions/bNNN.html) plus index.html with the four voiceover parts and sound effects.
//   node tools/build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { C, at } from "../../moneybrain/tools/kit.mjs";
import { existsSync, cpSync } from "node:fs";
import { execSync } from "node:child_process";
const N = process.argv[2] || "1";
const { BEATS, CAPFIX = {}, META = {} } = await import(`./s${N}.mjs`);

const SH = join(dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = join(SH, `s${N}`);
mkdirSync(join(ROOT, "assets"), { recursive: true });
for (const d of ["fonts", "sfx", "vendor"]) if (!existsSync(join(ROOT, "assets", d))) cpSync(join(SH, "../ep04/assets", d), join(ROOT, "assets", d), { recursive: true });
mkdirSync(join(ROOT, "assets/audio"), { recursive: true });
cpSync(join(SH, `audio/short${N}.mp3`), join(ROOT, "assets/audio/voiceover.mp3"));
for (const f of ["package.json", "hyperframes.json", "CLAUDE.md"]) if (!existsSync(join(ROOT, f))) cpSync(join(SH, "../ep04", f), join(ROOT, f));
const WORDS = { voiceover: JSON.parse(readFileSync(join(SH, "words.json"), "utf8"))[`short${N}`] };
const VO_DUR = WORDS.voiceover.at(-1).e;
const PARTS = [{ id: "voiceover", file: "assets/audio/voiceover.mp3", dur: +(+execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${join(SH, `audio/short${N}.mp3`)}"`).toString()).toFixed(3) }];
const GAP = 0, TAIL = 0.05, LEAD = 0.08, BOIL = 0.125;
let off = 0;
for (const p of PARTS) { p.off = off; off += p.dur + GAP; }
const TOTAL = +(off - GAP + TAIL).toFixed(2);

// ---------- word lookup ----------
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const ALL = []; // global word list with absolute times
for (const p of PARTS) for (const w of WORDS[p.id]) { const n = norm(w.w); if (n) ALL.push({ n, s: +(p.off + w.s).toFixed(3), e: +(p.off + w.e).toFixed(3), part: p.id }); }
function find(phrase, from = 0) {
  const toks = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = from; i < ALL.length; i++) {
    let ok = true;
    for (let k = 0; k < toks.length; k++) if (!ALL[i + k] || ALL[i + k].n !== toks[k]) { ok = false; break; }
    if (ok) return i;
  }
  throw new Error(`phrase not found after word ${from}: "${phrase}"`);
}

// ---------- resolve beat start times ----------
let cursor = 0;
const scenes = BEATS.map((b, i) => {
  const wi = find(b.at, cursor);
  cursor = wi + 1;
  return { ...b, n: i, wi, start: i === 0 ? 0 : +(ALL[wi].s - LEAD).toFixed(3) };
});
scenes.forEach((s, i) => { s.end = i < scenes.length - 1 ? scenes[i + 1].start : TOTAL; s.dur = +(s.end - s.start).toFixed(3); });

// ---------- scene context handed to each beat ----------
const ANIMS = {
  pop: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0, scale: 0.55, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: ${d || 0.32}, ease: "back.out(2.2)" }, ${t});`,
  grow: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: ${d || 0.35}, ease: "back.out(2.6)" }, ${t});`,
  drop: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0, y: -420 }, { opacity: 1, y: 0, duration: ${d || 0.6}, ease: "bounce.out" }, ${t});`,
  rise: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0, y: 160 }, { opacity: 1, y: 0, duration: ${d || 0.45}, ease: "power3.out" }, ${t});`,
  slideL: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0, x: -520 }, { opacity: 1, x: 0, duration: ${d || 0.5}, ease: "power3.out" }, ${t});`,
  slideR: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0, x: 520 }, { opacity: 1, x: 0, duration: ${d || 0.5}, ease: "power3.out" }, ${t});`,
  fade: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0 }, { opacity: 1, duration: ${d || 0.35}, ease: "none" }, ${t});`,
  slam: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0, scale: 2.4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: ${d || 0.22}, ease: "power4.in" }, ${t});`,
  wipe: (sel, t, d) => `tl.fromTo("${sel}", { opacity: 0, scaleX: 0, transformOrigin: "0% 50%" }, { opacity: 1, scaleX: 1, duration: ${d || 0.6}, ease: "power2.inOut" }, ${t});`,
  none: () => "",
};
const SFX = [];

function makeCtx(sc) {
  const p = `b${String(sc.n).padStart(3, "0")}`;
  const js = [], html = [];
  let k = 0, autoT = 0.12;
  const S = {
    p, dur: sc.dur,
    id: (name) => `${p}-${name}`,
    // local time (s) when `phrase` is spoken inside this scene
    t(phrase, nudge = 0) {
      const wi = find(phrase, sc.wi);
      const loc = ALL[wi].s - sc.start + nudge;
      if (loc > sc.dur + 0.01) { if (process.env.STRICT === "list") { console.log(`LATE ${p} [${sc.at}] "${phrase}"`); return 0.35; } throw new Error(`${p}: "${phrase}" is after the scene ends`); }
      return +Math.max(0, loc).toFixed(3);
    },
    // place an animated group. opts: { at: seconds | phrase, anim, rot, idle, id, d }
    put(svg, x, y, s = 1, o = {}) {
      const id = o.id ? `${p}-${o.id}` : `${p}-e${k++}`;
      let t = o.at === undefined ? autoT : typeof o.at === "string" ? S.t(o.at) : o.at;
      if (o.at === undefined) autoT += 0.14;
      t = +Math.min(t, Math.max(0, sc.dur - 0.35)).toFixed(3);
      js.push(ANIMS[o.anim || "pop"](`#${id}`, t, o.d));
      if (o.idle) {
        const per = o.idle === true ? 0.9 : o.idle;
        const reps = Math.max(0, Math.floor((sc.dur - t - 0.4) / per) - 1);
        if (reps > 0) js.push(`tl.fromTo("#${id}-i", { y: 0 }, { y: -8, duration: ${per / 2}, ease: "sine.inOut", yoyo: true, repeat: ${reps * 2 - 1} }, ${(t + 0.35).toFixed(3)});`);
      }
      return `<g transform="translate(${x} ${y}) rotate(${o.rot || 0}) scale(${s})"><g id="${id}"><g id="${id}-i">${svg}</g></g></g>`;
    },
    raw: (svg) => svg,
    js: (code) => { js.push(code); return ""; },
    sfx: (name, t, vol = 0.35, d = 1.2) => { SFX.push({ name, t: +(sc.start + t).toFixed(3), vol, d }); return ""; },
    // a receipt that prints out of a slot; its last line counts up
    receipt(o) {
      const t = typeof o.at === "string" ? S.t(o.at) : o.at ?? 0.25;
      const lines = (o.lines || []).map(([a, b]) => `<div class="rl"><span>${a}</span><span>${b}</span></div>`).join("");
      const fmt = o.fmt || "money";
      html.push(`<div class="rcpt-wrap" style="left:${o.x ?? 1250}px; top:${o.y ?? 250}px; width:${o.w || 520}px">
        <div class="rcpt-slot"></div><div class="rcpt-clip"><div id="${p}-rc" class="rcpt">
        ${o.title ? `<div class="rt">${o.title}</div>` : ""}${lines}
        ${o.total ? `<div class="rtot"><span>${o.total[0]}</span><span id="${p}-rn">${o.total[1]}</span></div>` : ""}
        ${o.foot ? `<div class="rf">${o.foot}</div>` : ""}</div></div></div>`);
      js.push(`tl.fromTo("#${p}-rc", { yPercent: -101 }, { yPercent: 0, duration: ${o.printDur || 0.9}, ease: "steps(${o.steps || 9})" }, ${t});`);
      S.sfx("typing", t, 0.22, Math.min(1.4, o.printDur || 0.9));
      if (o.count) {
        const [from, to] = o.count, ct = t + (o.printDur || 0.9) - 0.1;
        js.push(`(() => { const el = document.querySelector("#${p}-rn"); const o = { v: ${from} };
          const f = (v) => ${fmt === "money" ? `"${o.prefix ?? "$"}" + Math.round(v).toLocaleString("en-US") + "${o.suffix || ""}"` : `Math.round(v) + "${o.suffix || ""}"`};
          el.textContent = f(${to});
          tl.fromTo(o, { v: ${from} }, { v: ${to}, duration: ${o.countDur || 1.1}, ease: "power2.out", onUpdate: () => { el.textContent = f(o.v); } }, ${ct.toFixed(3)});
          tl.set(o, { v: ${from}, onUpdate: () => { el.textContent = f(o.v); } }, 0); })();`);
        S.sfx("chime", ct + (o.countDur || 1.1) - 0.2, 0.3, 1.6);
      }
      return "";
    },
    // a counting number drawn in SVG (use inside put); returns <text>
    countText(x, y, from, to, o = {}) {
      const id = `${p}-ct${k++}`;
      const t = typeof o.at === "string" ? S.t(o.at) : o.at ?? 0.3;
      const pre = o.prefix ?? "$", suf = o.suffix || "";
      js.push(`(() => { const el = document.querySelector("#${id}"); const o = { v: ${from} }; const f = (v) => "${pre}" + Math.round(v).toLocaleString("en-US") + "${suf}";
        tl.fromTo(o, { v: ${from} }, { v: ${to}, duration: ${o.d || 1.2}, ease: "power2.out", onUpdate: () => { el.textContent = f(o.v); } }, ${t});
        tl.set(o, { v: ${from}, onUpdate: () => { el.textContent = f(o.v); } }, 0); })();`);
      if (o.chime !== false) S.sfx("chime", t + (o.d || 1.2) - 0.25, 0.3, 1.6);
      return `<text id="${id}" x="${x}" y="${y}" font-family="Archivo Black" font-size="${o.size || 150}" fill="${o.color || C.ink}" text-anchor="middle" dominant-baseline="middle"${o.stroke ? ` stroke="${C.ink}" stroke-width="6" paint-order="stroke"` : ""}>${pre}${to.toLocaleString("en-US")}${suf}</text>`;
    },
    shake(t, amp = 14) { js.push(`tl.fromTo("#${p}-cam", { x: 0 }, { x: ${amp}, duration: 0.05, ease: "none", yoyo: true, repeat: 5, immediateRender: false }, ${t}); tl.set("#${p}-cam", { x: 0 }, ${(t + 0.31).toFixed(3)});`); return ""; },
    // rubber-stamped chapter card
    chapter(num, title, o = {}) {
      const t = o.at ?? 0.05;
      html.push(`<div class="chap-wrap"><div id="${p}-chap" class="chap" style="color:${o.color || C.red}; border-color:${o.color || C.red}">${num ? `<small>${num}</small>` : ""}${title}</div></div>`);
      js.push(`tl.fromTo("#${p}-chap", { opacity: 0, scale: 2.6, rotation: -8, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, rotation: -6, duration: 0.24, ease: "power4.in" }, ${t});`);
      S.sfx("impact-bass-1", t + 0.2, 0.45, 1.6);
      S.shake(t + 0.24, 12);
      return "";
    },
  };
  return { S, js, html };
}

// ---------- write scenes ----------
mkdirSync(join(ROOT, "compositions"), { recursive: true });
for (const f of readdirSync(join(ROOT, "compositions"))) if (/^b\d{3}\.html$/.test(f)) unlinkSync(join(ROOT, "compositions", f));

const TAGCOL = { white: [C.white, C.ink], mustard: [C.mustard, C.ink], terra: [C.terra, C.white], olive: [C.olive, C.ink], slate: [C.slateDk, C.white], red: [C.red, C.white], ink: [C.ink, C.white] };

for (const sc of scenes) {
  const { S, js, html } = makeCtx(sc);
  const svg = sc.draw ? sc.draw(S) : "";
  const p = S.p;
  const boils = Array.from({ length: Math.ceil(sc.dur / BOIL) }, (_, i) => `[${(i * BOIL).toFixed(3)},${(i % 4) + 1}]`).join(",");
  const [tagBg, tagInk] = TAGCOL[sc.tagColor || "white"];
  const tagAt = sc.tagAt === undefined ? 0.04 : typeof sc.tagAt === "string" ? S.t(sc.tagAt) : sc.tagAt;
  if (sc.tag) S.sfx("pop", tagAt + 0.05, 0.14, 0.5);
  const tagHtml = sc.tag
    ? `<div class="tag-wrap" style="top:${sc.tagY ?? 250}px"><div id="${p}-tag" class="tag" style="background:${tagBg}; color:${tagInk}; font-size:${sc.tagSize || (sc.tag.length > 22 ? 52 : 64)}px">${sc.tag}</div></div>`
    : "";
  if (sc.tag && sc.n > 0) js.unshift(`tl.fromTo("#${p}-tag", { opacity: 0, rotation: -16, transformOrigin: "34px 50%" }, { opacity: 1, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.45)" }, ${tagAt});`);
  if (sc.tag && sc.n === 0) js.unshift(`tl.fromTo("#${p}-tag", { rotation: -3, transformOrigin: "34px 50%" }, { rotation: 0, duration: 0.6, ease: "sine.inOut" }, 0.3);`);
  const file = `<template>
  <style>
    @font-face { font-family: "Patrick Hand"; src: url("assets/fonts/PatrickHand.woff2") format("woff2"); font-display: block; }
    #root { position: absolute; inset: 0; overflow: hidden; }
    #${p}-cam { position: absolute; inset: 0; }
    #${p}-cam > svg { position: absolute; inset: 0; width: 100%; height: 100%; }
    .tag-wrap { position: absolute; left: 48px; width: 852px; text-align: center; }
    .tag { display: inline-block; position: relative; font-family: "Archivo Black"; letter-spacing: 0.01em; line-height: 1;
      padding: 20px 44px 20px 76px; border: 5px solid ${C.ink}; border-radius: 10px 18px 18px 10px;
      box-shadow: 8px 8px 0 rgba(35,31,28,0.18); }
    .tag::before { content: ""; position: absolute; left: 30px; top: 50%; width: 16px; height: 16px; margin-top: -8px; border-radius: 50%; background: ${C.paper}; border: 4px solid ${C.ink}; }
    .tag::after { content: ""; position: absolute; left: 36px; bottom: 50%; width: 4px; height: 90px; background: ${C.ink}; transform-origin: 50% 100%; transform: rotate(-28deg); margin-bottom: 8px; }
    .rcpt-wrap { position: absolute; }
    .rcpt-slot { height: 22px; background: ${C.ink}; border-radius: 11px; margin: 0 -18px; position: relative; z-index: 2; }
    .rcpt-clip { overflow: hidden; margin-top: -8px; }
    .rcpt { background: ${C.white}; border: 4px solid ${C.ink}; border-top: none; padding: 26px 30px 40px; font-family: "Space Mono"; font-weight: 700; color: ${C.ink};
      clip-path: polygon(0 0, 100% 0, 100% 100%, 95% 97%, 90% 100%, 85% 97%, 80% 100%, 75% 97%, 70% 100%, 65% 97%, 60% 100%, 55% 97%, 50% 100%, 45% 97%, 40% 100%, 35% 97%, 30% 100%, 25% 97%, 20% 100%, 15% 97%, 10% 100%, 5% 97%, 0 100%); }
    .rt { text-align: center; font-family: "Archivo Black"; font-size: 34px; border-bottom: 3px dashed ${C.ink}; padding-bottom: 12px; margin-bottom: 14px; }
    .rl { display: flex; justify-content: space-between; font-size: 30px; line-height: 1.5; }
    .rtot { display: flex; justify-content: space-between; align-items: baseline; border-top: 3px dashed ${C.ink}; margin-top: 14px; padding-top: 14px; font-size: 34px; }
    .rtot span:last-child { font-family: "Archivo Black"; font-size: 60px; color: ${C.red}; }
    .rf { text-align: center; font-size: 22px; margin-top: 12px; opacity: 0.7; }
    .chap-wrap { position: absolute; left: 0; right: 0; top: 70px; text-align: center; }
    .chap { display: inline-block; font-family: "Archivo Black"; font-size: 78px; line-height: 1.05; padding: 18px 46px 22px; border: 10px double; border-radius: 14px; background: rgba(244,235,213,0.6); }
    .chap small { display: block; font-size: 34px; letter-spacing: 0.2em; }
  </style>
  <div id="root" data-composition-id="${p}" data-width="1080" data-height="1920">
    <!-- ${sc.at} -->
    <div id="${p}-cam" data-layout-allow-overflow>
      <svg viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
        <defs><filter id="${p}-rough" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence id="${p}-turb" type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="1"/>
          <feDisplacementMap in="SourceGraphic" scale="4.5" xChannelSelector="R" yChannelSelector="G"/></filter></defs>
        <g filter="url(#${p}-rough)">
${svg}
        </g>
      </svg>
      ${html.join("\n")}
    </div>
    ${tagHtml}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    tl.fromTo("#${p}-cam", { scale: 1 }, { scale: ${sc.push ?? 1.03}, duration: ${sc.dur}, ease: "none", transformOrigin: "50% 60%" }, 0);
    ${js.join("\n    ")}
    [${boils}].forEach(([t, s]) => tl.set("#${p}-turb", { attr: { seed: s } }, t));
    window.__timelines["${p}"] = tl;
  </script>
</template>
`;
  writeFileSync(join(ROOT, "compositions", `${p}.html`), file);
  sc.p = p;
}

// ---------- captions: 1-3 words at a time, the spoken word in mustard ----------
{
  const raw = WORDS.voiceover;
  const groups = [];
  let g = [];
  raw.forEach((w, i) => {
    let t = (CAPFIX[i] ?? CAPFIX[`${w.w}@${Math.round(w.s)}`] ?? CAPFIX[w.w] ?? w.w).replace(/^[,.]+/, "").toUpperCase();
    if (!t) return;
    g.push({ t, s: w.s, i });
    const len = g.map((x) => x.t).join(" ").length;
    if (g.length >= 3 || /[.,?!…]$/.test(w.w) || len > 13) { groups.push(g); g = []; }
  });
  if (g.length) groups.push(g);
  let html = "", js = "";
  groups.forEach((grp, k) => {
    const start = Math.max(0, grp[0].s - 0.05), end = k < groups.length - 1 ? Math.max(0, groups[k + 1][0].s - 0.05) : TOTAL;
    html += `<div id="cg${k}" class="cg">${grp.map((x, j) => `<span id="cw${k}_${j}">${x.t}</span>`).join(" ")}</div>`;
    js += `tl.set("#cg${k}", { opacity: 1 }, ${start.toFixed(3)}); tl.set("#cg${k}", { opacity: 0 }, ${end.toFixed(3)});\n`;
    js += `tl.fromTo("#cg${k}", { scale: 0.86 }, { scale: 1, duration: 0.12, ease: "back.out(3)" }, ${start.toFixed(3)});\n`;
    grp.forEach((x, j) => { js += `tl.set("#cw${k}_${j}", { color: "${C.mustard}" }, ${Math.max(0, x.s - 0.03).toFixed(3)}); ${j < grp.length - 1 ? `tl.set("#cw${k}_${j}", { color: "#FFFFFF" }, ${Math.max(0, grp[j + 1].s - 0.03).toFixed(3)});` : ""}\n`; });
  });
  writeFileSync(join(ROOT, "compositions", "captions.html"), `<template>
  <style>
    #root { position: absolute; inset: 0; pointer-events: none; }
    .cg { position: absolute; left: 48px; width: 852px; top: 1290px; text-align: center; opacity: 0; transform-origin: 50% 50%;
      font-family: "Archivo Black"; font-size: 70px; line-height: 1.05; color: #FFFFFF; letter-spacing: 0.01em;
      -webkit-text-stroke: 14px ${C.ink}; paint-order: stroke fill; }
  </style>
  <div id="root" data-composition-id="captions" data-width="1080" data-height="1920">${html}</div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js}
    window.__timelines["captions"] = tl;
  </script>
</template>
`);
}

// ---------- index.html ----------
const ruleLines = Array.from({ length: 40 }, (_, i) => (i + 1) * 48).map((y) => `<path d="M 0 ${y} L 1080 ${y}" stroke="${C.rule}" stroke-width="2"/>`).join("") + `<path d="M 0 1240 L 1080 1240" stroke="#B9AD8C" stroke-width="5"/>`;
const hosts = scenes.map((s) => `      <div id="${s.p}" class="clip" data-composition-id="${s.p}" data-composition-src="compositions/${s.p}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="1" data-track-kind="graphics" data-width="1080" data-height="1920"></div>`).join("\n");
const vo = PARTS.map((p) => `      <audio id="vo-${p.id}" class="clip" src="${p.file}" data-start="${p.off.toFixed(3)}" data-duration="${p.dur}" data-track-index="2" data-volume="1"></audio>`).join("\n");
const SFXFILE = { whooshBig: "whoosh.mp3", sparkle: "sparkle.mp3", riser: "riser.mp3", pop: "pop.mp3", typing: "typing.mp3", chime: "chime.mp3", "impact-bass-1": "impact-bass-1.mp3", whoosh: "whoosh-short.mp3", click: "click-soft.mp3" };
SFX.sort((a, b) => a.t - b.t);
const laneEnd = [];
const sfx = SFX.map((x, i) => {
  let lane = laneEnd.findIndex((e) => e <= x.t);
  if (lane < 0) { lane = laneEnd.length; laneEnd.push(0); }
  laneEnd[lane] = x.t + x.d;
  return `      <audio id="sfx${String(i).padStart(3, "0")}" class="clip" src="assets/sfx/${SFXFILE[x.name]}" data-start="${x.t}" data-duration="${x.d}" data-track-index="${3 + lane}" data-volume="${x.vol}"></audio>`;
}).join("\n");

writeFileSync(join(ROOT, "index.html"), `<!doctype html>
<html lang="en" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="assets/vendor/gsap-3.15.0.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 1080px; height: 1920px; overflow: hidden; background: ${C.paper}; }
      #root { position: relative; width: 100%; height: 100%; }
      #paper { position: absolute; inset: 0; }
    </style>
  </head>
  <body>
    <!-- PESABRAIN — "401(k), IRA or Roth?". Generated by tools/build.mjs from tools/beats.mjs + tools/words.json -->
    <div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="1080" data-height="1920">
      <svg id="paper" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
        <rect width="1080" height="1920" fill="${C.paper}"/>${ruleLines}
        <path d="M 70 0 L 70 1920 M 78 0 L 78 1920" stroke="${C.margin}" stroke-width="3"/>
      </svg>
${hosts}
      <div id="captions" class="clip" data-composition-id="captions" data-composition-src="compositions/captions.html" data-start="0" data-duration="${TOTAL}" data-track-index="9" data-track-kind="captions" data-width="1080" data-height="1920" style="z-index: 50"></div>
${vo}
${sfx}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);

// a beat sheet for humans
const sheet = ["# Beat sheet", "", `${scenes.length} scenes, ${TOTAL}s. Each scene starts on the word it names.`, "", "| # | Start | Len | Tag | Starts on |", "|---|---|---|---|---|",
  ...scenes.map((s) => `| ${s.n} | ${s.start.toFixed(2)} | ${s.dur.toFixed(2)} | ${s.tag || (s.chapterTitle ? "▣ " + s.chapterTitle : "")} | ${s.at} |`)].join("\n");
writeFileSync(join(ROOT, "BEATS.md"), sheet + "\n");
const lens = scenes.map((s) => s.dur);
console.log(`built ${scenes.length} scenes, ${TOTAL}s, ${SFX.length} sfx; scene length min ${Math.min(...lens).toFixed(2)} avg ${(TOTAL / scenes.length).toFixed(2)} max ${Math.max(...lens).toFixed(2)}`);
