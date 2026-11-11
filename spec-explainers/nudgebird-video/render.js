// Usage:
//   node render.js stills <outDir> t1 t2 ...        -> PNG stills at given times
//   node render.js video <out.mp4> <startFrame> <endFrame> [fps]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--disable-gpu-vsync'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e.message); process.exit(1); });
  await page.goto('file://' + path.join(__dirname, 'index.html'));
  await page.evaluate(async () => {
    for (const w of [500, 600, 650, 700, 800, 900]) await document.fonts.load(`${w} 40px "Inter Display"`);
  });
  const clip = { x: 0, y: 0, width: 1920, height: 1080 };

  if (mode === 'stills') {
    fs.mkdirSync(out, { recursive: true });
    for (const ts of rest) {
      await page.evaluate(t => draw(t), parseFloat(ts));
      await page.screenshot({ path: path.join(out, `t${ts}.png`), clip });
    }
  } else {
    const start = parseInt(rest[0]), end = parseInt(rest[1]), fps = parseInt(rest[2] || '30');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = start; f < end; f++) {
      await page.evaluate(t => draw(t), f / fps);
      const buf = await page.screenshot({ type: 'jpeg', quality: 93, clip });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`${out}: frame ${f}/${end}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
  }
  await browser.close();
})();
