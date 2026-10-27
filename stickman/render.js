#!/usr/bin/env node
// Render a stickman scene to MP4.
//   node stickman/render.js stickman/scenes/quiet-opening.html [out.mp4] [--still 3.5]
// Steps the scene frame by frame (deterministic), pipes PNGs into ffmpeg.

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const args = process.argv.slice(2);
  const stillIdx = args.indexOf('--still');
  const still = stillIdx >= 0 ? parseFloat(args.splice(stillIdx, 2)[1]) : null;
  const [scenePath, outArg] = args;
  if (!scenePath) throw new Error('usage: render.js <scene.html> [out.mp4] [--still seconds]');
  const out = outArg || scenePath.replace(/\.html$/, still != null ? `-${still}s.png` : '.mp4');

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.resolve(scenePath) + '?export');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.SCENE);
  const { duration, fps } = await page.evaluate(() => ({ duration: SCENE.duration, fps: SCENE.fps }));
  const stage = await page.$('#stage');

  if (still != null) {
    await page.evaluate((t) => SCENE.renderAt(t), still);
    await stage.screenshot({ path: out });
    await browser.close();
    console.log('wrote', out);
    return;
  }

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', out],
    { stdio: ['pipe', 'inherit', 'inherit'] });

  const frames = Math.round(duration * fps);
  for (let i = 0; i < frames; i++) {
    await page.evaluate((t) => SCENE.renderAt(t), i / fps);
    const buf = await stage.screenshot({ type: 'png' });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (i % fps === 0) process.stdout.write(`\r${i}/${frames} frames`);
  }
  ff.stdin.end();
  await new Promise((r, j) => ff.on('close', (c) => (c ? j(new Error('ffmpeg ' + c)) : r())));
  await browser.close();
  console.log(`\nwrote ${out}`);
})();
