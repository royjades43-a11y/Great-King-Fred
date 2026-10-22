// Word-level timestamps for a voiceover, fully offline: Whisper base (ONNX, installed from npm as
// sts-whisper-base) run by transformers.js. Writes timing/words.json for tools/build.mjs.
//   npm run transcribe -- assets/voiceover.mp3
import { pipeline, env } from "@huggingface/transformers";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const input = process.argv[2] ?? "assets/voiceover.mp3";
env.allowRemoteModels = false;
env.localModelPath = join(root, "node_modules/sts-whisper-base/models/");

// decode to 16 kHz mono float PCM with ffmpeg
const raw = execFileSync("ffmpeg", ["-v", "error", "-i", join(root, input), "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], { maxBuffer: 1 << 30 });
const audio = new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);

const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base", { dtype: "q8" });
const out = await asr(audio, { language: "english", task: "transcribe", chunk_length_s: 30, stride_length_s: 5, return_timestamps: "word" });
const words = out.chunks.map((c) => ({ text: c.text.trim(), start: c.timestamp[0], end: c.timestamp[1] ?? c.timestamp[0] + 0.3 }));
writeFileSync(join(root, "timing/words.json"), JSON.stringify({ source: "whisper-base (local)", words }, null, 0));
console.log(`${words.length} words, ${(audio.length / 16000).toFixed(1)} s → timing/words.json`);
