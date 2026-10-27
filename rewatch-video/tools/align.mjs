// Word timing for a generated voiceover: voice/voiceover.py --words gives the script's words with each
// take's exact start/end (a take = one paragraph). Whisper then times the words inside each take,
// run on that take alone so it can't skip or drift over a long file.
//   node tools/align.mjs assets/voiceover.mp3 estimated-words.json   -> timing/words.json
import { pipeline, env } from "@huggingface/transformers";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const [audioPath, estPath] = process.argv.slice(2);
env.allowRemoteModels = false;
env.localModelPath = join(root, "node_modules/sts-whisper-base/models/");
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base", { dtype: "q8" });

const est = JSON.parse(readFileSync(estPath, "utf8")).words;
const norm = (s) => s.toLowerCase().replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']/gu, "");
const takes = [...new Set(est.map((w) => w.take))];
let hit = 0;
const heardAll = [];
for (const k of takes) {
  const ws = est.filter((w) => w.take === k);
  const from = Math.max(0, ws[0].take_start - 0.2), to = ws[0].take_end + 0.2;
  // transcribe in short overlapping windows: whisper drops whole sentences when it stitches long chunks
  const heard = [], texts = [];
  const WIN = 20, HOP = 16;
  for (let w0 = from; w0 < to; w0 += HOP) {
    const len = Math.min(WIN, to - w0);
    const raw = execFileSync("ffmpeg", ["-v", "error", "-ss", String(w0), "-t", String(len), "-i", join(root, audioPath),
      "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
    const out = await asr(new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4), { language: "english", task: "transcribe", return_timestamps: "word" });
    const lo = w0 === from ? -1 : w0 + (WIN - HOP) / 2, hi = w0 + len >= to ? 1e9 : w0 + WIN - (WIN - HOP) / 2;
    for (const c of out.chunks) {
      const st = w0 + c.timestamp[0];
      if (st < lo || st >= hi) continue;
      heard.push({ n: norm(c.text), text: c.text.trim(), start: st, end: w0 + (c.timestamp[1] ?? c.timestamp[0] + 0.3) });
    }
  }
  heardAll.push({ take: k, start: from, script: ws.map((w) => w.text).join(" "), heard: heard.map((h) => h.text).join(" "), words: heard });
  let j = 0;
  for (const w of ws) {
    const n = norm(w.text);
    for (let i = j; i < Math.min(j + 6, heard.length); i++)
      if (n && heard[i].n === n) { w.start = +heard[i].start.toFixed(3); w.end = +heard[i].end.toFixed(3); j = i + 1; hit++; break; }
  }
}
const words = est.map(({ text, start, end }) => ({ text, start, end }));
writeFileSync(join(root, "timing/heard.json"), JSON.stringify(heardAll, null, 1));
writeFileSync(join(root, "timing/words.json"), JSON.stringify({ source: "tts takes + per-take whisper", words }, null, 0));
console.log(`${hit}/${words.length} words timed by Whisper (rest estimated inside exact take windows) -> timing/words.json`);
