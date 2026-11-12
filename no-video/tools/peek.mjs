import { pipeline, env } from "@huggingface/transformers";
import { execFileSync } from "node:child_process";
env.allowRemoteModels = false; env.localModelPath = new URL("../node_modules/sts-whisper-base/models/", import.meta.url).pathname;
const asr = await pipeline("automatic-speech-recognition", "Xenova/whisper-base", { dtype: "q8" });
for (let i = 2; i < process.argv.length; i += 2) {
  const raw = execFileSync("ffmpeg", ["-v","error","-ss",process.argv[i],"-t",process.argv[i+1],"-i","assets/voiceover.mp3","-ar","16000","-ac","1","-f","f32le","-"]);
  const o = await asr(new Float32Array(raw.buffer, raw.byteOffset, raw.length/4), { language: "english" });
  console.log(process.argv[i], o.text);
}
