// Builds a PLACEHOLDER voiceover from script/script.json with the local Kokoro voice,
// one clip per beat, so every beat's start is known exactly. Writes:
//   assets/voiceover.wav   the joined narration
//   timing/words.json      word timings ({text,start,end}); in-beat words are estimated
// Replace both with your real voiceover + its transcript (see README) when you have it.
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const hf = process.env.HYPERFRAMES_BIN || "npx";
const hfArgs = process.env.HYPERFRAMES_BIN ? [] : ["--yes", "hyperframes@0.8.185"];
const voice = process.env.VOICE || "am_michael";
const speed = process.env.SPEED || "0.95";

const script = JSON.parse(readFileSync(join(root, "script/script.json"), "utf8"));
const work = join(root, ".work/vo");
mkdirSync(work, { recursive: true });
mkdirSync(join(root, "timing"), { recursive: true });

const SR = 24000;
const gapAfter = (say, lastInScene) => (lastInScene ? 1.1 : /[.?!]$/.test(say.trim()) ? 0.38 : 0.12);
const probe = (f) =>
  parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

const pieces = [];
const words = [];
let t = 0.5; // half a second of room before the first word
pieces.push({ silence: t });

for (const scene of script.scenes) {
  scene.beats.forEach((beat, i) => {
    const raw = join(work, `${beat.id}.raw.wav`);
    const clip = join(work, `${beat.id}.wav`);
    if (!existsSync(raw)) execFileSync(hf, [...hfArgs, "tts", beat.say, "-o", raw, "-v", voice, "-s", speed], { stdio: "ignore" });
    // trim leading/trailing silence so the beat starts on its first syllable
    execFileSync("ffmpeg", ["-y", "-v", "error", "-i", raw, "-af",
      "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
      "-ar", String(SR), "-ac", "1", clip]);
    const dur = probe(clip);
    // spread the beat's words across its length, weighted by letters (+ pause after commas)
    const toks = beat.say.split(/\s+/).filter(Boolean);
    const weight = toks.map((w) => w.replace(/[^\p{L}\p{N}']/gu, "").length + 2 + (/[,.;:?!]$/.test(w) ? 3 : 0));
    const total = weight.reduce((a, b) => a + b, 0);
    let acc = 0;
    toks.forEach((w, k) => {
      const s = t + (acc / total) * dur;
      acc += weight[k];
      words.push({ text: w, start: +s.toFixed(3), end: +(t + (acc / total) * dur).toFixed(3) });
    });
    pieces.push({ file: clip });
    t += dur;
    const g = gapAfter(beat.say, i === scene.beats.length - 1);
    pieces.push({ silence: g });
    t += g;
  });
}

// join: generate silences, concat demuxer
const list = [];
pieces.forEach((p, i) => {
  if (p.file) return list.push(`file '${p.file}'`);
  const f = join(work, `sil${i}.wav`);
  execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "lavfi", "-i", `anullsrc=r=${SR}:cl=mono`, "-t", String(p.silence), f]);
  list.push(`file '${f}'`);
});
writeFileSync(join(work, "list.txt"), list.join("\n"));
mkdirSync(join(root, "assets"), { recursive: true });
execFileSync("ffmpeg", ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", join(work, "list.txt"),
  "-af", "loudnorm=I=-16:TP=-1.5", "-ar", "48000", join(root, "assets/voiceover.wav")]);
writeFileSync(join(root, "timing/words.json"), JSON.stringify({ source: "placeholder-tts", words }, null, 1));
console.log(`voiceover ${t.toFixed(2)}s, ${words.length} words → assets/voiceover.wav, timing/words.json`);
