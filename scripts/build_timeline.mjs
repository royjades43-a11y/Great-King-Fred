#!/usr/bin/env node
// Turns an episode's script.json + footage/manifest.json + build/words.json into build/props.json
// for the Remotion renderer. Script words get their timing from the transcribed voiceover via
// a global alignment, so captions show the script's spelling at the voice's timing.
//
// Usage: node scripts/build_timeline.mjs episodes/<slug> [--estimate] [--no-captions]
//   --estimate   no voiceover yet: fake timings at a narrator pace (preview renders only)

import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';

const args = process.argv.slice(2);
const epDir = args.find((a) => !a.startsWith('--'));
const estimate = args.includes('--estimate');
const captions = !args.includes('--no-captions');
if (!epDir) {
  console.error('usage: node scripts/build_timeline.mjs episodes/<slug> [--estimate] [--no-captions]');
  process.exit(2);
}
const ep = path.resolve(epDir);
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(ep, p), 'utf8'));
const warnings = [];
const errors = [];

const script = readJson('script.json');
const manifest = fs.existsSync(path.join(ep, 'footage/manifest.json')) ? readJson('footage/manifest.json') : {assets: []};
const assetsById = new Map(manifest.assets.map((a) => [a.id, a]));

// ---------- tokens ----------
const norm = (s) =>
  s
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]/g, '');
const beats = script.beats;
const tokens = []; // {text, norm, beat}
beats.forEach((b, bi) => {
  if (!b.narration || !b.narration.trim()) errors.push(`beat ${b.id ?? bi} has no narration`);
  for (const t of (b.narration ?? '').split(/\s+/).filter(Boolean)) tokens.push({text: t, norm: norm(t), beat: bi});
});

// ---------- audio + word timings ----------
const audioRel = script.audio ?? 'audio/voiceover.mp3';
let duration;
let asr = [];
if (estimate) {
  let t = 0.4;
  for (const tok of tokens) {
    const d = 0.18 + 0.055 * tok.text.length + (/[.!?]$/.test(tok.text) ? 0.45 : /[,;:—]$/.test(tok.text) ? 0.2 : 0);
    tok.start = t;
    tok.end = t + d * 0.85;
    t += d;
  }
  duration = t + 1;
} else {
  const audioAbs = path.join(ep, audioRel);
  if (!fs.existsSync(audioAbs)) {
    console.error(`missing voiceover: ${audioRel}. Put the MP3 there, or use --estimate for a silent preview.`);
    process.exit(1);
  }
  duration = probeDuration(audioAbs) + 0.8;
  const wordsPath = path.join(ep, 'build/words.json');
  if (!fs.existsSync(wordsPath)) {
    console.error('missing build/words.json. Run: .venv/bin/python scripts/align_words.py ' + epDir);
    process.exit(1);
  }
  asr = JSON.parse(fs.readFileSync(wordsPath, 'utf8')).words.filter((w) => norm(w.word));
  align(tokens, asr);
}

// ---------- scenes ----------
const tokenRange = new Map(); // beat -> [first, last]
tokens.forEach((t, i) => {
  const r = tokenRange.get(t.beat);
  if (!r) tokenRange.set(t.beat, [i, i]);
  else r[1] = i;
});

const cuts = []; // {time, visual, beat}
beats.forEach((b, bi) => {
  const [first, last] = tokenRange.get(bi) ?? [null, null];
  if (first === null) return;
  const visuals = b.visuals ?? (b.visual ? [b.visual] : []);
  if (!visuals.length) errors.push(`beat ${b.id} has no visual`);
  visuals.forEach((v, vi) => {
    let at = first;
    if (vi > 0) {
      if (v.at) {
        const idx = findPhrase(first, last, v.at);
        if (idx === -1) warnings.push(`beat ${b.id}: cue phrase "${v.at}" not found in narration; splitting evenly`);
        at = idx === -1 ? first + Math.round(((last - first + 1) * vi) / visuals.length) : idx;
      } else at = first + Math.round(((last - first + 1) * vi) / visuals.length);
    }
    // Cut slightly before the word lands so the picture leads the voice.
    cuts.push({time: Math.max(0, tokens[at].start - 0.25), visual: v, beat: b});
  });
});
cuts.sort((a, b) => a.time - b.time);
if (cuts.length) cuts[0].time = 0;

const resolveAsset = (id, where) => {
  const a = assetsById.get(id);
  if (!a) {
    errors.push(`${where}: unknown asset "${id}" (not in footage/manifest.json)`);
    return null;
  }
  if (!fs.existsSync(path.join(ep, a.file))) errors.push(`${where}: file missing for ${id}: ${a.file}`);
  const ref = {id: a.id, file: a.file, type: a.type};
  if (a.duration) ref.duration = a.duration;
  if (a.trim_in) ref.trimIn = a.trim_in;
  if (a.focus) ref.focus = a.focus;
  if (a.width) ref.width = a.width;
  if (a.height) ref.height = a.height;
  if (a.fit) ref.fit = a.fit;
  return ref;
};

const scenes = cuts.map((c, i) => {
  const start = c.time;
  const end = i + 1 < cuts.length ? cuts[i + 1].time : duration;
  const v = c.visual;
  const where = `beat ${c.beat.id}`;
  const base = {start: round(start), end: round(end)};
  switch (v.kind) {
    case 'footage': {
      const assets = (v.assets ?? []).map((id) => resolveAsset(id, where)).filter(Boolean);
      if (!assets.length) errors.push(`${where}: footage visual with no usable assets`);
      // Videos shorter than their slot loop; flag big gaps so the editor adds more shots.
      const slot = (end - start) / Math.max(1, assets.length);
      for (const a of assets) if (a.type === 'video' && a.duration && a.duration - (a.trimIn ?? 0) < slot * 0.6)
        warnings.push(`${where}: clip ${a.id} (${a.duration.toFixed(1)}s) is short for a ${slot.toFixed(1)}s slot and will loop; consider adding another shot`);
      return {kind: 'footage', ...base, assets, ...(v.label ? {label: v.label} : {})};
    }
    case 'evidence': {
      const items = (v.items ?? [])
        .map((it) => ({asset: resolveAsset(it.asset, where), note: it.note}))
        .filter((it) => it.asset);
      for (const it of items) if (it.asset.type !== 'image') errors.push(`${where}: evidence board items must be images (${it.asset.id})`);
      if (items.length > 4) warnings.push(`${where}: evidence board shows at most 4 items`);
      return {kind: 'evidence', ...base, items, ...(v.heading ? {heading: v.heading} : {}), ...(v.links ? {links: v.links} : {})};
    }
    case 'title':
      return {kind: 'title', ...base, text: v.text, ...(v.subtext ? {subtext: v.subtext} : {}), ...(v.background ? {background: resolveAsset(v.background, where)} : {})};
    case 'document':
      return {
        kind: 'document',
        ...base,
        source: v.source,
        quote: v.quote,
        ...(v.highlight ? {highlight: v.highlight} : {}),
        ...(v.background ? {background: resolveAsset(v.background, where)} : {}),
      };
    default:
      errors.push(`${where}: unknown visual kind "${v.kind}"`);
      return {kind: 'title', ...base, text: ''};
  }
});

for (const s of scenes) if (s.end - s.start > 20) warnings.push(`scene at ${fmt(s.start)} holds for ${(s.end - s.start).toFixed(0)}s; split it with more visuals`);

// ---------- outputs ----------
const props = {
  title: script.title,
  fps: 30,
  duration: round(duration),
  audio: estimate ? '' : audioRel,
  words: tokens.map((t) => ({text: t.text, start: round(t.start), end: round(t.end)})),
  scenes,
  captions,
};
fs.mkdirSync(path.join(ep, 'build'), {recursive: true});
fs.writeFileSync(path.join(ep, 'build/props.json'), JSON.stringify(props, null, 1));

const chapters = [];
beats.forEach((b, bi) => {
  const r = tokenRange.get(bi);
  if (b.chapter && r) chapters.push(`${fmt(bi === 0 ? 0 : tokens[r[0]].start)} ${b.chapter}`);
});
if (chapters.length && !chapters[0].startsWith('0:00')) chapters.unshift('0:00 Intro');
fs.writeFileSync(path.join(ep, 'build/chapters.txt'), chapters.join('\n') + '\n');

const matched = tokens.filter((t) => t.matched).length;
console.log(`episode:   ${script.title}`);
console.log(`duration:  ${fmt(duration)} (${estimate ? 'ESTIMATED, silent preview' : 'from voiceover'})`);
console.log(`scenes:    ${scenes.length}  (${countBy(scenes.map((s) => s.kind))})`);
if (!estimate) console.log(`alignment: ${matched}/${tokens.length} script words matched to the voiceover (${Math.round((100 * matched) / tokens.length)}%)`);
console.log(`wrote:     build/props.json, build/chapters.txt`);
for (const w of warnings) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
if (!estimate && matched / tokens.length < 0.75)
  console.log('WARN  low alignment: the voiceover may not match script.json (edited text? wrong file?)');
process.exit(errors.length ? 1 : 0);

// ---------- helpers ----------
function align(script, heard) {
  // Needleman–Wunsch over normalised tokens.
  const n = script.length;
  const m = heard.length;
  const W = m + 1;
  const score = new Int32Array((n + 1) * W);
  const back = new Uint8Array((n + 1) * W); // 1 diag, 2 up (skip script), 3 left (skip heard)
  const GAP = -1;
  for (let i = 1; i <= n; i++) (score[i * W] = i * GAP), (back[i * W] = 2);
  for (let j = 1; j <= m; j++) (score[j] = j * GAP), (back[j] = 3);
  const hn = heard.map((w) => norm(w.word));
  for (let i = 1; i <= n; i++) {
    const a = script[i - 1].norm;
    for (let j = 1; j <= m; j++) {
      const b = hn[j - 1];
      const s = a === b ? 3 : similar(a, b) ? 1 : -2;
      const d = score[(i - 1) * W + j - 1] + s;
      const u = score[(i - 1) * W + j] + GAP;
      const l = score[i * W + j - 1] + GAP;
      if (d >= u && d >= l) (score[i * W + j] = d), (back[i * W + j] = 1);
      else if (u >= l) (score[i * W + j] = u), (back[i * W + j] = 2);
      else (score[i * W + j] = l), (back[i * W + j] = 3);
    }
  }
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const k = back[i * W + j];
    if (k === 1) {
      const a = script[i - 1].norm;
      const b = hn[j - 1];
      if (a === b || similar(a, b)) {
        script[i - 1].start = heard[j - 1].start;
        script[i - 1].end = heard[j - 1].end;
        script[i - 1].matched = true;
      }
      i--, j--;
    } else if (k === 2) i--;
    else j--;
  }
  // Interpolate unmatched runs between their matched neighbours, weighted by length.
  let k = 0;
  while (k < n) {
    if (script[k].matched) {
      k++;
      continue;
    }
    let e = k;
    while (e < n && !script[e].matched) e++;
    const t0 = k > 0 ? script[k - 1].end : heard[0]?.start ?? 0;
    const t1 = e < n ? script[e].start : heard[m - 1]?.end ?? t0 + (e - k) * 0.4;
    const weights = script.slice(k, e).map((t) => Math.max(2, t.text.length));
    const total = weights.reduce((x, y) => x + y, 0);
    let t = t0;
    for (let q = k; q < e; q++) {
      const d = ((t1 - t0) * weights[q - k]) / total;
      script[q].start = t;
      script[q].end = t + d * 0.9;
      t += d;
    }
    k = e;
  }
}

function similar(a, b) {
  if (!a || !b) return false;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  const L = Math.max(a.length, b.length);
  return L >= 4 && lev(a, b) / L <= 0.34;
}

function lev(a, b) {
  const prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

function findPhrase(first, last, phrase) {
  const want = phrase.split(/\s+/).map(norm).filter(Boolean);
  for (let i = first; i <= last - want.length + 1; i++) if (want.every((w, k) => tokens[i + k].norm === w)) return i;
  return -1;
}

function probeDuration(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim();
  return parseFloat(out);
}
function round(x) {
  return Math.round(x * 1000) / 1000;
}
function fmt(s) {
  s = Math.max(0, Math.floor(s));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}
function countBy(xs) {
  const c = {};
  for (const x of xs) c[x] = (c[x] ?? 0) + 1;
  return Object.entries(c)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');
}
