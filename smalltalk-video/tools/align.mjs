// Word timing for a generated voiceover. voice/voiceover.py --words gives the script's words and
// each take's exact start/end (a take = one paragraph). Inside a take the voice leaves a clear pause
// between sentences, so the take is cut at its silences into sentences; Whisper then times the words
// of each sentence on that short clip alone (long clips make it skip or invent whole lines).
//   node tools/align.mjs assets/voiceover.mp3 est-words.json   -> timing/words.json, timing/heard.json
import { pipeline, env } from "@huggingface/transformers";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const [audioPath, estPath] = process.argv.slice(2);
const audio = join(root, audioPath);
env.allowRemoteModels = false;
env.localModelPath = join(root, "node_modules/sts-whisper-base/models/");
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base", { dtype: "q8" });

const est = JSON.parse(readFileSync(estPath, "utf8")).words;
const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']/gu, "");

// speech runs between silences of at least `min` seconds, inside [from, to]
function speechRuns(from, to, min) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-ss", String(from), "-t", String(to - from), "-i", audio,
    "-af", `silencedetect=n=-38dB:d=${min}`, "-f", "null", "-"], { encoding: "utf8" });
  const runs = [];
  let start = 0;
  for (const m of r.stderr.matchAll(/silence_(start|end): ([\d.]+)/g)) {
    const t = +m[2];
    if (m[1] === "start") { if (t - start > 0.08) runs.push([from + start, from + t]); }
    else start = t;
  }
  if (to - from - start > 0.08) runs.push([from + start, to]);
  return runs;
}

async function hear(a, b) {
  const raw = execFileSync("ffmpeg", ["-v", "error", "-ss", String(a), "-t", String(b - a), "-i", audio,
    "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  const out = await asr(new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4), { language: "english", task: "transcribe", return_timestamps: "word" });
  return { text: out.text.trim(), words: out.chunks.map((c) => ({ n: norm(c.text), start: a + c.timestamp[0], end: a + (c.timestamp[1] ?? c.timestamp[0] + 0.3) })) };
}

// longest common subsequence of two token lists -> matched index pairs
function lcs(a, b) {
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--)
    d[i][j] = a[i] && a[i] === b[j] ? d[i + 1][j + 1] + 1 : Math.max(d[i + 1][j], d[i][j + 1]);
  const pairs = [];
  for (let i = 0, j = 0; i < m && j < n;) {
    if (a[i] && a[i] === b[j]) { pairs.push([i, j]); i++; j++; }
    else if (d[i + 1][j] >= d[i][j + 1]) i++; else j++;
  }
  return pairs;
}

const takes = [...new Set(est.map((w) => w.take))];
const heardAll = [];
let hit = 0;
for (const k of takes) {
  const ws = est.filter((w) => w.take === k);
  const t0 = Math.max(0, ws[0].take_start - 0.1), t1 = ws[0].take_end + 0.15;
  // cut the take into clips of at most ~11 s, only inside pauses, so no word is ever split
  const runs = speechRuns(t0, t1, 0.12);
  const clips = [];
  let a = runs[0]?.[0] ?? t0;
  for (let i = 0; i < runs.length; i++) {
    const next = runs[i + 1];
    if (!next || next[1] - a > 11) { clips.push([Math.max(t0, a - 0.06), Math.min(t1, runs[i][1] + 0.06)]); if (next) a = next[0]; }
  }
  const heard = [], texts = [];
  for (const [ca, cb] of clips) { const h = await hear(ca, cb); heard.push(...h.words); texts.push({ start: +ca.toFixed(2), end: +cb.toFixed(2), heard: h.text }); }
  const pairs = lcs(ws.map((w) => norm(w.text)), heard.map((h) => h.n));
  ws.forEach((w) => (w.start = w.end = null));
  for (const [i, j] of pairs) { ws[i].start = heard[j].start; ws[i].end = heard[j].end; hit++; }
  const sa = runs[0]?.[0] ?? t0, sb = runs.at(-1)?.[1] ?? t1;
  ws.forEach((w, i) => {
    if (w.start != null) return;
    let p = i - 1; while (p >= 0 && ws[p].start == null) p--;
    let q = i + 1; while (q < ws.length && ws[q].start == null) q++;
    const lo = p >= 0 ? ws[p].end : sa, hi = q < ws.length ? ws[q].start : sb;
    // share the gap by letter count
    const span = ws.slice(p + 1, q), tot = span.reduce((n, x) => n + x.text.length + 1, 0);
    let acc = lo;
    span.forEach((x) => { const d = (hi - lo) * (x.text.length + 1) / tot; x.start = acc; x.end = acc + d; acc += d; });
  });
  let prev = 0;
  for (const w of ws) { w.start = +Math.max(prev, w.start).toFixed(3); w.end = +Math.max(w.start + 0.05, w.end).toFixed(3); prev = w.start; }
  heardAll.push({ take: k, script: ws.map((w) => w.text).join(" "), clips: texts, heard: texts.map((t) => t.heard).join(" ") });
}
const words = est.map(({ text, start, end }) => ({ text, start, end }));
writeFileSync(join(root, "timing/heard.json"), JSON.stringify(heardAll, null, 1));
writeFileSync(join(root, "timing/words.json"), JSON.stringify({ source: "tts takes + whisper on pause-cut clips, LCS-matched", words }, null, 0));
console.log(`${hit}/${words.length} words timed by Whisper -> timing/words.json`);
