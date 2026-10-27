// Stickman engine: draws hand-drawn style stickman scenes as SVG for a given time t.
// A scene file calls Stick.run(scene) where scene = { duration, draw(t) -> svg string }.
// Deterministic: the same t always produces the same frame, so the renderer can
// step frame by frame and export an MP4.

(function () {
  const W = 1920, H = 1080;

  // ---------- timing helpers ----------
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (p) => p * p * (3 - 2 * p);
  // eased 0..1 progress of t through [a, b]
  const seg = (t, a, b) => smooth(clamp((t - a) / (b - a)));
  const lerp = (a, b, p) => a + (b - a) * p;
  // 1 inside [a, b] with soft fades at both edges
  const window_ = (t, a, b, f = 0.2) => Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));

  // seeded random so shapes (hair, scribbles) are stable between frames
  function rng(seed) {
    let s = seed >>> 0;
    return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  }

  // ---------- palette (matches the channel style) ----------
  const C = {
    paper: '#F3EAD7',
    ink: '#1B1B1B',
    red: '#D2382E',
    blue: '#2F6DB5',
    hair: '#6B4226',
    hairDark: '#3B2A1E',
    pants: '#454545',
  };

  // ---------- shared SVG defs: paper grain + hand-drawn "boil" wobble ----------
  function defs(t) {
    const seed = 1 + (Math.floor(t * 8) % 3); // line boil at 8 fps
    return `
    <defs>
      <filter id="grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 0.16 0"/>
      </filter>
      <filter id="mottle" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.006" numOctaves="3" seed="3" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.22 0"/>
      </filter>
      <filter id="boil" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${seed}" result="w"/>
        <feDisplacementMap in="SourceGraphic" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
    </defs>`;
  }

  function paper() {
    return `<rect width="${W}" height="${H}" fill="${C.paper}"/>
      <rect width="${W}" height="${H}" filter="url(#mottle)"/>
      <rect width="${W}" height="${H}" filter="url(#grain)"/>`;
  }

  // ---------- the stickman ----------
  // o: { x, y (feet), s (scale), shirt, hair: 'short'|'long', lookX, lookY,
  //      mouth: 'flat'|'frown'|'o'|'tight', angry 0..1, blink 0..1,
  //      armL/armR: [upper, lower] angles in radians (0 = hanging down, + = outward),
  //      shoulders: lift in px }
  function stickman(o) {
    const s = o.s || 1;
    const lift = o.shoulders || 0;
    const headY = -450 + lift * 0.4, headR = 92;
    const shY = -332 + lift;
    const lookX = (o.lookX || 0) * 14, lookY = (o.lookY || 0) * 10;
    const r = rng(o.seed || 11);
    let g = '';

    // long hair sits behind the head
    if (o.hair === 'long') {
      g += `<path d="M ${-headR - 8} ${headY - 10} C ${-headR - 30} ${headY + 80}, ${-headR - 10} ${headY + 130}, ${-headR + 20} ${headY + 150}
                     L ${headR - 20} ${headY + 150} C ${headR + 10} ${headY + 130}, ${headR + 30} ${headY + 80}, ${headR + 8} ${headY - 10} Z"
            fill="${C.hairDark}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`;
    }

    // legs (outlined pants) + shoes
    for (const side of [-1, 1]) {
      const hx = side * 20, fx = side * 30;
      g += `<line x1="${hx}" y1="-205" x2="${fx}" y2="-18" stroke="${C.ink}" stroke-width="44" stroke-linecap="round"/>
            <line x1="${hx}" y1="-205" x2="${fx}" y2="-18" stroke="${C.pants}" stroke-width="32" stroke-linecap="round"/>
            <ellipse cx="${fx + side * 10}" cy="-6" rx="34" ry="14" fill="${C.ink}"/>`;
    }

    // shirt
    g += `<path d="M -50 ${shY} Q 0 ${shY - 14} 50 ${shY} L 58 ${shY + 50} L 44 ${shY + 40} L 44 -195 L -44 -195 L -44 ${shY + 40} L -58 ${shY + 50} Z"
          fill="${o.shirt}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`;

    // arms + blob hands
    for (const [side, arm] of [[-1, o.armL || [0.22, 0.08]], [1, o.armR || [0.22, 0.08]]]) {
      const sx = side * 48, sy = shY + 22;
      const ex = sx + side * Math.sin(arm[0]) * 78, ey = sy + Math.cos(arm[0]) * 78;
      const a2 = arm[0] + arm[1];
      const hx = ex + side * Math.sin(a2) * 72, hy = ey + Math.cos(a2) * 72;
      g += `<polyline points="${sx},${sy} ${ex},${ey} ${hx},${hy}" fill="none" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="${hx}" cy="${hy}" r="15" fill="#fff" stroke="${C.ink}" stroke-width="6"/>`;
    }

    // neck + head
    g += `<line x1="0" y1="${headY + headR - 4}" x2="0" y2="${shY - 4}" stroke="${C.ink}" stroke-width="7"/>
          <circle cx="0" cy="${headY}" r="${headR}" fill="#fff" stroke="${C.ink}" stroke-width="9"/>`;

    // messy hair cap: jagged outer edge, fringe across the forehead
    let pts = [];
    for (let i = 0; i <= 30; i++) {
      const a = (-196 + (i / 30) * 212) * Math.PI / 180;
      const R = headR + (i % 2 ? 4 : 13 + r() * 12);
      pts.push([Math.cos(a) * R, headY + Math.sin(a) * R]);
    }
    for (let i = 0; i <= 14; i++) {
      const x = headR - 4 - (i / 14) * (2 * headR - 8);
      const y = headY - 42 + (i % 2 ? -8 : 6 + r() * 6) + Math.abs(x) * 0.3;
      pts.push([x, y]);
    }
    g += `<path d="M ${pts.map((p) => p.join(' ')).join(' L ')} Z" fill="${o.hair === 'long' ? C.hairDark : C.hair}"
          stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>`;

    // eyes (always visible) with blink
    const eyeRy = 8 * (1 - (o.blink || 0) * 0.9);
    for (const side of [-1, 1]) {
      g += `<ellipse cx="${side * 28 + lookX}" cy="${headY + 2 + lookY}" rx="8" ry="${eyeRy}" fill="${C.ink}"/>`;
    }
    // brows when tense
    const ang = o.angry || 0;
    if (ang > 0.01) {
      for (const side of [-1, 1]) {
        const bx = side * 28 + lookX;
        g += `<line x1="${bx - side * 14}" y1="${headY - 22 + 10 * ang}" x2="${bx + side * 14}" y2="${headY - 26}"
              stroke="${C.ink}" stroke-width="6" stroke-linecap="round" opacity="${ang}"/>`;
      }
    }
    // mouth
    const my = headY + 44, mx = lookX * 0.6;
    const m = o.mouth || 'flat';
    if (m === 'flat') g += `<line x1="${mx - 12}" y1="${my}" x2="${mx + 12}" y2="${my}" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
    if (m === 'tight') g += `<line x1="${mx - 18}" y1="${my}" x2="${mx + 18}" y2="${my - 2}" stroke="${C.ink}" stroke-width="6" stroke-linecap="round"/>`;
    if (m === 'frown') g += `<path d="M ${mx - 16} ${my + 6} Q ${mx} ${my - 8} ${mx + 16} ${my + 6}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/>`;
    if (m === 'o') g += `<ellipse cx="${mx}" cy="${my}" rx="8" ry="11" fill="${C.ink}"/>`;

    return `<g transform="translate(${o.x} ${o.y}) scale(${s * (o.flip ? -1 : 1)} ${s})">${g}</g>`;
  }

  // ---------- handwritten caption with word colours + write-on reveal ----------
  // parts: [[text, colour], ...]; p: reveal 0..1; alpha: opacity; underline colour optional
  let clipId = 0;
  function caption(parts, p, alpha, opts = {}) {
    const y = opts.y || 170, size = opts.size || 104;
    const id = 'cap' + (clipId++);
    const spans = parts.map(([txt, col]) => `<tspan fill="${col || C.ink}">${txt}</tspan>`).join('');
    let out = `<clipPath id="${id}"><rect x="0" y="0" width="${W * p}" height="${H}"/></clipPath>
      <g opacity="${alpha}" clip-path="url(#${id})">
        <text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Patrick Hand" font-size="${size}"
              letter-spacing="3">${spans}</text>`;
    if (opts.underline) {
      const u = opts.underlineP == null ? p : opts.underlineP;
      const w = opts.underlineW || 620;
      out += `<path d="M ${W / 2 - w / 2} ${y + 34} C ${W / 2 - w / 4} ${y + 22}, ${W / 2 + w / 4} ${y + 46}, ${W / 2 + w / 2} ${y + 28}"
              fill="none" stroke="${opts.underline}" stroke-width="10" stroke-linecap="round"
              pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - u}"/>`;
    }
    return out + '</g>';
  }

  // a path that draws itself on as p goes 0..1
  function drawOn(d, p, stroke, width = 8, extra = '') {
    return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"
            pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - clamp(p)}" ${extra}/>`;
  }

  // ---------- frame assembly ----------
  function frame(t, scene) {
    clipId = 0;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
      ${defs(t)}${paper()}${scene.draw(t)}</svg>`;
  }

  function run(scene) {
    const root = document.getElementById('stage');
    const render = (t) => { root.innerHTML = frame(t, scene); };
    window.SCENE = { duration: scene.duration, fps: scene.fps || 30, renderAt: render };
    // live preview unless the exporter is driving frames
    if (!/[?&]export/.test(location.search)) {
      document.fonts.ready.then(() => {
        const start = performance.now();
        const tick = (now) => {
          render(((now - start) / 1000) % scene.duration);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }
  }

  window.Stick = { W, H, C, clamp, smooth, seg, lerp, win: window_, rng, stickman, caption, drawOn, run };
})();
