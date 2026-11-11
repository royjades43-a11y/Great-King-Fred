// Nudgebird explainer: shared canvas drawing engine.
// NB.create(canvas).draw(t) paints the frame for film time t (seconds). Pure function of t.
(function () {
  if (window.NB) return;
  window.NB = { create: function (canvas) {
// Nudgebird — spec explainer. Deterministic motion graphics: draw(t) renders frame at time t (seconds).
const W = 1920, H = 1080, DURATION = 90;
const ctx = canvas.getContext('2d');

// ---------- palette ----------
const C = {
  bg: '#0A1430', bg2: '#16285A', floor: '#0D1A3D',
  amber: '#FFB547', amberHot: '#FFE2A3', amberDeep: '#E08A1E',
  white: '#F4F1EA', teal: '#22E3C8', tealDark: '#0E9C8A', tealLight: '#A6F7EA',
  red: '#FF3B4E', redDeep: '#5E0F1C', ink: '#08101F', muted: '#6E7FA8', beak: '#FF8A3D',
  desk: '#1C2E5E', deskTop: '#24397A',
};
const AVATAR = ['#F2A65A', '#E86A92', '#7A9CFF', '#C792EA', '#5FD3A4', '#F7D26A'];
const HAIR = ['#2B1B12', '#3A2A1E', '#14141C', '#6B3E1E', '#2A2440', '#4A2A10'];

// ---------- math / easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, x) => clamp((x - a) / (b - a));
const E = {
  lin: x => x,
  outCubic: x => 1 - Math.pow(1 - x, 3),
  inCubic: x => x * x * x,
  inQuad: x => x * x,
  inOut: x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
  outBack: x => { const s = 1.70158; return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); },
  outElastic: x => x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
  outQuint: x => 1 - Math.pow(1 - x, 5),
};
const prog = (t, a, b, e = E.outCubic) => e(clamp((t - a) / (b - a)));
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hex(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
function mix(a, b, t, al = 1) { const A = hex(a), B = hex(b); return `rgba(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')},${al})`; }
function rgba(h, a) { return `rgba(${hex(h).join(',')},${a})`; }
const q = (p0, c, p1, u) => ({ x: (1 - u) * (1 - u) * p0.x + 2 * u * (1 - u) * c.x + u * u * p1.x, y: (1 - u) * (1 - u) * p0.y + 2 * u * (1 - u) * c.y + u * u * p1.y });
const qAng = (p0, c, p1, u) => { const a = q(p0, c, p1, Math.max(0, u - 0.01)), b = q(p0, c, p1, Math.min(1, u + 0.01)); return Math.atan2(b.y - a.y, b.x - a.x); };

// ---------- primitives ----------
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function circle(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function ellipse(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }
function tri(a, b, c) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.closePath(); }
function font(size, weight = 700) { const w = weight <= 550 ? 400 : weight <= 750 ? 700 : 900; return `${w} ${size}px "Inter", sans-serif`; }
function text(str, x, y, o = {}) {
  const { size = 48, weight = 700, color = C.white, align = 'center', alpha = 1, base = 'middle', spacing = 0 } = o;
  ctx.save(); ctx.globalAlpha *= alpha; ctx.font = font(size, weight); ctx.textAlign = align; ctx.textBaseline = base; ctx.fillStyle = color;
  if (spacing) ctx.letterSpacing = spacing + 'px';
  ctx.fillText(str, x, y); ctx.restore();
}

function background(glow = 0, glowColor = C.teal, cy = H * 0.45) {
  const g = ctx.createRadialGradient(W / 2, cy, 50, W / 2, H / 2, 1250);
  g.addColorStop(0, C.bg2); g.addColorStop(1, C.bg);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (glow > 0) {
    const g2 = ctx.createRadialGradient(W / 2, cy, 0, W / 2, cy, 700);
    g2.addColorStop(0, rgba(glowColor, 0.28 * glow)); g2.addColorStop(1, rgba(glowColor, 0));
    ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
  }
  // subtle dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let x = 40; x < W; x += 80) for (let y = 40; y < H; y += 80) { ctx.fillRect(x, y, 2, 2); }
}
function vignette(a = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, 500, W / 2, H / 2, 1150);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// ---------- characters ----------
function plane(x, y, ang, s = 1, o = {}) {
  const { glow = 1, desat = 0, alpha = 1, outline = 0 } = o;
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  const top = mix(C.amberHot, '#8C92A6', desat), bot = mix(C.amber, '#5C6278', desat), fold = mix(C.amberDeep, '#43485A', desat);
  if (glow > 0.01) { ctx.shadowColor = rgba(C.amber, 0.95 * glow * (1 - desat)); ctx.shadowBlur = 34 * glow; }
  tri([36, 0], [-26, -21], [-13, 0]); ctx.fillStyle = top; ctx.fill();
  tri([36, 0], [-26, 19], [-13, 0]); ctx.fillStyle = bot; ctx.fill();
  ctx.shadowBlur = 0;
  tri([36, 0], [-17, 5], [-13, 0]); ctx.fillStyle = fold; ctx.fill();
  if (outline > 0) {
    ctx.strokeStyle = rgba(C.amber, outline); ctx.lineWidth = 3;
    circle(4, 0, 52); ctx.stroke();
    ctx.strokeStyle = rgba(C.amber, outline * 0.4); circle(4, 0, 62 + 6 * Math.sin(outline * 20)); ctx.stroke();
  }
  ctx.restore();
}
function trail(pathFn, u, len, o = {}) {
  const { color = C.amber, alpha = 0.5, width = 4, steps = 16 } = o;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 0; i < steps; i++) {
    const u0 = u - len * (i / steps), u1 = u - len * ((i + 1) / steps);
    if (u1 < 0) break;
    const a = pathFn(u0), b = pathFn(u1);
    ctx.strokeStyle = rgba(color, alpha * (1 - i / steps));
    ctx.lineWidth = width * (1 - i / steps * 0.7);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.restore();
}

function bird(x, y, s, o = {}) {
  const { flap = 0, tilt = 0, squash = 1, look = [0, 0], lid = 0.3, wink = 0, brow = 1, alpha = 1, flip = false } = o;
  if (alpha <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt); ctx.globalAlpha *= alpha;
  const sx = s * (1 + (1 - squash) * 0.7) * (flip ? -1 : 1), sy = s * squash;
  ctx.scale(sx, sy);
  // soft glow
  ctx.shadowColor = rgba(C.teal, 0.55); ctx.shadowBlur = 40;
  // tail
  tri([-52, 6], [-112, -26], [-104, 22]); ctx.fillStyle = C.tealDark; ctx.fill();
  tri([-52, 14], [-108, 18], [-90, 44]); ctx.fill();
  // body
  ellipse(0, 0, 74, 62); ctx.fillStyle = C.teal; ctx.fill();
  ctx.shadowBlur = 0;
  // belly
  ellipse(16, 24, 44, 30, -0.2); ctx.fillStyle = C.tealLight; ctx.fill();
  // tuft
  ctx.fillStyle = C.teal;
  tri([-6, -56], [4, -84], [16, -54]); ctx.fill();
  tri([-22, -50], [-24, -76], [-2, -56]); ctx.fill();
  // wing
  ctx.save(); ctx.translate(-14, 2); ctx.rotate(-0.25 - flap * 1.25);
  ellipse(-26, 0, 50, 24, 0.15); ctx.fillStyle = C.tealDark; ctx.fill();
  ctx.strokeStyle = rgba('#063F38', 0.6); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-50, -4); ctx.lineTo(-10, 2); ctx.moveTo(-46, 10); ctx.lineTo(-12, 8); ctx.stroke();
  ctx.restore();
  // beak
  tri([62, -16], [104, -4], [62, 8]); ctx.fillStyle = C.beak; ctx.fill();
  tri([62, -4], [100, -2], [62, 8]); ctx.fillStyle = '#D9662A'; ctx.fill();
  // eye
  const ex = 32, ey = -20;
  circle(ex, ey, 18); ctx.fillStyle = '#FFFFFF'; ctx.fill();
  const closed = Math.max(lid, wink);
  if (closed < 0.95) {
    circle(ex + 3 + look[0] * 6, ey + 1 + look[1] * 6, 9); ctx.fillStyle = C.ink; ctx.fill();
    circle(ex + 6 + look[0] * 6, ey - 3 + look[1] * 6, 3); ctx.fillStyle = '#fff'; ctx.fill();
  }
  // eyelid
  if (closed > 0) {
    ctx.save(); circle(ex, ey, 19); ctx.clip();
    ctx.fillStyle = C.teal; ctx.fillRect(ex - 20, ey - 20, 40, 40 * closed);
    if (closed > 0.9) { ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ex, ey + 2, 12, 0.2, Math.PI - 0.2); ctx.stroke(); }
    ctx.restore();
  }
  // smug brow
  ctx.strokeStyle = '#0A6E61'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(14, -44 - brow * 2); ctx.lineTo(50, -40 + brow * 4); ctx.stroke();
  ctx.restore();
}

function avatar(x, y, i, s = 1) { // top-down person
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ellipse(0, 18, 46, 24); ctx.fillStyle = mix(AVATAR[i % 6], '#000000', 0.25); ctx.fill();
  circle(0, 0, 25); ctx.fillStyle = HAIR[i % 6]; ctx.fill();
  ctx.restore();
}

// ---------- office world ----------
const DESKS = [];
[200, 470, 740].forEach(y => [330, 750, 1170, 1590].forEach(x => DESKS.push({ x, y })));
const ROUTES = (() => {
  const r = mulberry(42), out = [];
  for (let i = 0; i < 18; i++) {
    let a = Math.floor(r() * 12), b = Math.floor(r() * 12); if (a === b) b = (b + 5) % 12;
    if ((a === 4 && b === 7)) b = 6;
    const p0 = DESKS[a], p1 = DESKS[b];
    const mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2, dx = p1.x - p0.x, dy = p1.y - p0.y, L = Math.hypot(dx, dy) || 1;
    const off = (r() > 0.5 ? 1 : -1) * (80 + r() * 140);
    out.push({ p0: { x: p0.x, y: p0.y - 20 }, p1: { x: p1.x, y: p1.y - 20 }, c: { x: mx - dy / L * off, y: my + dx / L * off }, period: 2.4 + r() * 1.6, phase: r() * 4 });
  }
  return out;
})();

function drawFloor() {
  ctx.fillStyle = C.floor; ctx.fillRect(-1200, -1200, W + 2400, H + 2400);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 2;
  for (let x = -1200; x < W + 1200; x += 140) { ctx.beginPath(); ctx.moveTo(x, -1200); ctx.lineTo(x, H + 1200); ctx.stroke(); }
  for (let y = -1200; y < H + 1200; y += 140) { ctx.beginPath(); ctx.moveTo(-1200, y); ctx.lineTo(W + 1200, y); ctx.stroke(); }
}
function drawDesks(dim = 0) {
  DESKS.forEach((d, i) => {
    ctx.save(); ctx.translate(d.x, d.y);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; rr(-108, -44, 216, 112, 18); ctx.fill();
    avatar(0, 74, i);
    ctx.fillStyle = mix(C.deskTop, C.floor, dim); rr(-108, -58, 216, 108, 18); ctx.fill();
    ctx.fillStyle = '#0E1836'; rr(-44, -38, 88, 54, 7); ctx.fill();
    ctx.fillStyle = rgba(C.teal, 0.18 * (1 - dim)); rr(-38, -33, 76, 42, 4); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; circle(76, -26, 12); ctx.fill(); // mug
    ctx.restore();
  });
}
function drawFlights(ft, o = {}) {
  const { alpha = 1, desat = 0, glow = 1 } = o;
  ROUTES.forEach(R => {
    const u = ((ft + R.phase) / R.period) % 1;
    if (u > 0.78 || u < 0) return;
    const s = u / 0.78;
    const path = v => q(R.p0, R.c, R.p1, v);
    const p = path(s), a = qAng(R.p0, R.c, R.p1, s);
    const fade = Math.min(1, s * 8, (1 - s) * 8);
    trail(path, s, 0.22, { alpha: 0.35 * alpha * fade * (1 - desat * 0.7), color: desat > 0.5 ? '#8C92A6' : C.amber });
    plane(p.x, p.y, a, 0.8, { alpha: alpha * fade, desat, glow });
  });
}
function bubble(x, y, str, a, sc = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= a;
  ctx.font = font(30, 700); const w = ctx.measureText(str).width + 44;
  ctx.fillStyle = C.white; rr(-w / 2, -32, w, 64, 32); ctx.fill();
  tri([-12, 30], [12, 30], [0, 48]); ctx.fill();
  text(str, 0, 1, { size: 30, color: C.ink, weight: 700 });
  ctx.restore();
}

// crack in the floor
const CRACK = (() => { const r = mulberry(7), pts = []; const n = 18; for (let i = 0; i <= n; i++) { const x = 700 + i * (520 / n); pts.push({ x, y: 965 + (r() - 0.5) * 30, w: Math.pow(Math.sin(i / n * Math.PI), 0.8) * (0.55 + r() * 0.7) }); } return pts; })();
function crack(open, o = {}) {
  const { seal = -1, glow = 1 } = o;
  if (open <= 0.2) return;
  const wAt = p => p.w * open * (seal >= 0 ? clamp((p.x - seal) / 60) : 1);
  ctx.save();
  ctx.beginPath();
  CRACK.forEach((p, i) => { const y = p.y - wAt(p); i ? ctx.lineTo(p.x, y) : ctx.moveTo(p.x, y); });
  for (let i = CRACK.length - 1; i >= 0; i--) { const p = CRACK[i]; ctx.lineTo(p.x, p.y + wAt(p)); }
  ctx.closePath();
  ctx.shadowColor = rgba(C.red, 0.85 * glow); ctx.shadowBlur = 40;
  ctx.fillStyle = '#020309'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = rgba(C.red, 0.9 * glow); ctx.stroke();
  ctx.shadowBlur = 0;
  // hairline branches
  ctx.strokeStyle = rgba(C.red, 0.35 * glow * clamp(open / 10)); ctx.lineWidth = 2;
  [[3, -1], [7, 1], [12, -1], [15, 1]].forEach(([i, d]) => {
    const p = CRACK[i]; if (seal >= 0 && p.x < seal) return;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + 30, p.y + d * 34); ctx.lineTo(p.x + 54, p.y + d * 44); ctx.stroke();
  });
  ctx.restore();
}

// ---------- the hero plane that stalls ----------
const PA = { x: 330, y: 450 }, PC = { x: 960, y: 180 }, PB = { x: 1590, y: 450 }, CRACKP = { x: 960, y: 965 };
const U_STALL = 0.57;
function stallState(t) {
  if (t < 9) return null;
  let u;
  if (t < 12) u = 0.42 * (t - 9) / 3;
  else u = 0.42 + (U_STALL - 0.42) * E.outCubic(clamp((t - 12) / 4));
  const desat = inv(12.5, 17, t), stall = inv(12, 15, t);
  let p = q(PA, PC, PB, u), ang = qAng(PA, PC, PB, u);
  // stutter
  p = { x: p.x, y: p.y + Math.sin(t * 38) * 5 * stall * (1 - inv(16, 18, t)) };
  ang += Math.sin(t * 9) * 0.25 * stall;
  let s = 1, alpha = 1;
  if (t >= 16) {
    const v = clamp((t - 16) / 15);
    const S = q(PA, PC, PB, U_STALL);
    const vy = E.inQuad(v) * 0.75 + v * 0.25;
    const x = lerp(S.x, CRACKP.x, E.inOut(v)) + Math.sin(v * Math.PI * 3.2) * 90 * (1 - v);
    const y = lerp(S.y, CRACKP.y - 6, vy);
    const dx = Math.cos(v * Math.PI * 3.2) * 90 * (1 - v) * Math.PI * 3.2 / 15;
    ang = lerp(ang, Math.PI / 2 * 0.55 + Math.atan2(1, dx * 0.02 + 0.0001) * 0.0 + Math.sin(v * Math.PI * 3.2) * 0.6, inv(16, 18, t));
    p = { x, y };
    s = 1 - 0.75 * inv(30.4, 31.1, t);
    alpha = 1 - inv(30.8, 31.15, t);
  }
  return { ...p, ang, desat, glow: 1 - desat * 0.85, s, alpha };
}

// ---------- captions ----------
const CAPS = [
  [0.9, 4.8, 'Every day, your team sends *hundreds* of these.'],
  [5.6, 11.6, 'Requests. Approvals. Little “can you take a look?”s.'],
  [13.0, 19.6, 'And somewhere in there… one of them *stalls.*'],
  [20.4, 23.6, 'No one dropped it on purpose. It just… *slipped.*'],
  [23.8, 29.6, 'Three days later, it’s a *problem.*'],
  [37.6, 41.2, 'Meet *Nudgebird.*'],
  [42.6, 47.0, 'Nudgebird watches the work flowing through your tools…'],
  [47.1, 51.6, '…and catches the moment something starts to *stall.*'],
  [52.3, 55.2, '*Connect* your tools in two minutes.'],
  [55.5, 58.5, 'It learns what normal looks like, and *flags* what isn’t.'],
  [58.8, 61.8, 'Then it *nudges* exactly the right person. No nagging. No blame.'],
  [62.8, 66.4, 'Loops close faster.'],
  [66.6, 71.6, 'And nobody spends their week *chasing people.*'],
  [72.6, 79.4, 'Stop babysitting tasks. Get back to the work that *matters.*'],
];
function captions(t) {
  for (const [a, b, str] of CAPS) {
    if (t < a || t > b) continue;
    const words = str.split(' ');
    ctx.save(); ctx.font = font(46, 650);
    const sp = 14, widths = words.map(w => ctx.measureText(w.replace(/\*/g, '')).width);
    const total = widths.reduce((s, w) => s + w, 0) + sp * (words.length - 1);
    let x = W / 2 - total / 2; const y = 992;
    const out = 1 - inv(b - 0.25, b, t);
    // backing
    ctx.fillStyle = `rgba(4,8,20,${0.45 * out})`; rr(W / 2 - total / 2 - 28, y - 40, total + 56, 80, 40); ctx.fill();
    words.forEach((w, i) => {
      const at = a + i * 0.075, k = prog(t, at, at + 0.28, E.outBack);
      const hi = w.includes('*');
      ctx.globalAlpha = clamp(k) * out;
      ctx.fillStyle = hi ? C.teal : C.white;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(w.replace(/\*/g, ''), x, y + (1 - k) * 22);
      x += widths[i] + sp;
    });
    ctx.restore();
  }
}
function stamp(str, x, y, t, at, o = {}) {
  const { size = 120, rot = -0.06, color = C.red, until = 999 } = o;
  if (t < at || t > until) return;
  const k = prog(t, at, at + 0.22, E.inCubic);
  const sc = lerp(2.4, 1, k), a = clamp(k * 3) * (1 - inv(until - 0.2, until, t));
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha = a;
  ctx.font = font(size, 900); const w = ctx.measureText(str).width;
  ctx.fillStyle = 'rgba(10,4,10,0.75)'; rr(-w / 2 - 30, -size * 0.62, w + 60, size * 1.24, 14); ctx.fill();
  ctx.strokeStyle = color; ctx.lineWidth = 7; rr(-w / 2 - 22, -size * 0.55, w + 44, size * 1.1, 10); ctx.stroke();
  text(str, 0, 4, { size, weight: 900, color, spacing: 2 });
  ctx.restore();
}
function flash(t, at, dur = 0.35, color = '#FFFFFF', peak = 0.85) {
  if (t < at || t > at + dur) return;
  ctx.fillStyle = rgba(color, peak * (1 - (t - at) / dur)); ctx.fillRect(0, 0, W, H);
}
function wordmark(x, y, s, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.font = font(150, 800); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  const w1 = ctx.measureText('nudge').width, w2 = ctx.measureText('bird').width, tw = w1 + w2;
  ctx.fillStyle = C.white; ctx.fillText('nudge', -tw / 2, 0);
  ctx.fillStyle = C.teal; ctx.fillText('bird', -tw / 2 + w1, 0);
  ctx.restore();
}
function cornerLogo(t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a * 0.9;
  bird(78, 66, 0.3, { flap: 0.2, lid: 0.3 });
  text('nudge', 118, 68, { size: 34, weight: 800, align: 'left' });
  ctx.font = font(34, 800); const w = ctx.measureText('nudge').width;
  text('bird', 118 + w, 68, { size: 34, weight: 800, align: 'left', color: C.teal });
  ctx.restore();
}

// ---------- tool icons (generic, no real brands) ----------
const TOOLS = ['chat', 'ticket', 'check', 'mail', 'cal'];
function toolIcon(kind, x, y, s = 1, a = 1) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.fillStyle = '#1C2E62'; rr(-48, -48, 96, 96, 24); ctx.fill();
  ctx.strokeStyle = rgba(C.teal, 0.7); ctx.lineWidth = 3; rr(-48, -48, 96, 96, 24); ctx.stroke();
  ctx.strokeStyle = C.white; ctx.fillStyle = C.white; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'chat') { rr(-26, -22, 52, 36, 10); ctx.stroke(); tri([-12, 14], [-2, 14], [-14, 26]); ctx.fill(); [-12, 0, 12].forEach(dx => { circle(dx, -4, 3.5); ctx.fill(); }); }
  if (kind === 'ticket') { ctx.beginPath(); ctx.moveTo(-28, -18); ctx.lineTo(28, -18); ctx.lineTo(28, -6); ctx.arc(28, 0, 6, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(28, 18); ctx.lineTo(-28, 18); ctx.lineTo(-28, 6); ctx.arc(-28, 0, 6, Math.PI / 2, -Math.PI / 2, true); ctx.closePath(); ctx.stroke(); ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(8, -14); ctx.lineTo(8, 14); ctx.stroke(); ctx.setLineDash([]); }
  if (kind === 'check') { rr(-24, -24, 48, 48, 10); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-3, 10); ctx.lineTo(14, -10); ctx.strokeStyle = C.teal; ctx.stroke(); }
  if (kind === 'mail') { rr(-28, -19, 56, 38, 6); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, -16); ctx.lineTo(0, 4); ctx.lineTo(26, -16); ctx.stroke(); }
  if (kind === 'cal') { rr(-26, -22, 52, 46, 8); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-26, -8); ctx.lineTo(26, -8); ctx.stroke(); [[-12, 6], [0, 6], [12, 6], [-12, 16]].forEach(([dx, dy]) => { circle(dx, dy, 3); ctx.fill(); }); ctx.beginPath(); ctx.moveTo(-12, -28); ctx.lineTo(-12, -18); ctx.moveTo(12, -28); ctx.lineTo(12, -18); ctx.stroke(); }
  ctx.restore();
}

// ---------- flow-time (lets the whole office slow down) ----------
const FT = (() => { const arr = [0]; let v = 0; for (let i = 1; i <= 9000; i++) { const t = i / 100; const r = t < 12 ? 1 : t < 14 ? lerp(1, 0.22, (t - 12) / 2) : t < 35 ? 0.22 : 1; v += r / 100; arr.push(v); } return arr; })();
const flowT = t => FT[clamp(Math.round(t * 100), 0, 9000)];

// ================= SCENES =================
function sceneIntro(t) { // 0–5
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = inv(0.2, 2.5, t); background(0.3, C.amber); ctx.globalAlpha = 1;
  // speed lines (camera follows the plane)
  const r = mulberry(3);
  const speed = prog(t, 0.3, 1.6) ;
  for (let i = 0; i < 40; i++) {
    const y = r() * H, len = 80 + r() * 260, sp = 900 + r() * 1400;
    const x = W + 300 - ((t * sp + r() * 3000) % (W + 700));
    ctx.strokeStyle = rgba(C.amber, (0.05 + r() * 0.12) * speed * inv(0.4, 1.4, t)); ctx.lineWidth = 2 + r() * 2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y); ctx.stroke();
  }
  const enter = prog(t, 0.3, 1.7, E.outQuint);
  const x = lerp(-200, 960, enter) + Math.sin(t * 1.3) * 18, y = 470 + Math.sin(t * 2.1) * 22;
  const zoomOut = prog(t, 4.45, 5.0, E.inCubic);
  plane(x + zoomOut * 300, y - zoomOut * 40, -0.06 + Math.cos(t * 2.1) * 0.08, 3.2 + zoomOut * 14, { glow: 1.4 });
  vignette(0.6);
  flash(t, 4.82, 0.4, C.amberHot, 0.9);
}

function officeCamera(t) {
  const sp = stallState(Math.max(t, 9)) || { x: 960, y: 520 };
  let c = { x: 960, y: 520, z: 1.06 - 0.06 * inv(5, 12, t) };
  const L = (A, B, k) => ({ x: lerp(A.x, B.x, k), y: lerp(A.y, B.y, k), z: lerp(A.z, B.z, k) });
  c = L(c, { x: sp.x, y: sp.y + 40, z: 1.75 }, prog(t, 12, 15, E.inOut));
  c = L(c, { x: lerp(sp.x, CRACKP.x, 0.45), y: lerp(sp.y, CRACKP.y, 0.45), z: 1.4 }, prog(t, 19.5, 23, E.inOut));
  c = L(c, { x: 960, y: 880, z: 1.75 }, prog(t, 29, 30.9, E.inOut));
  // shake on the gulp
  const sh = (1 - inv(31.1, 31.9, t)) * (t > 31.1 ? 1 : 0);
  c.x += Math.sin(t * 90) * 14 * sh; c.y += Math.cos(t * 77) * 10 * sh;
  return c;
}
function applyCam(c) { ctx.translate(W / 2, H / 2); ctx.scale(c.z, c.z); ctx.translate(-c.x, -c.y); }

function crackOpen(t) {
  let o = 22 * prog(t, 20, 23.5);
  if (t > 30.6) { o = t < 31.0 ? lerp(22, 70, prog(t, 30.6, 31.0)) : lerp(70, 14, prog(t, 31.0, 31.6, E.outElastic)); }
  return o;
}

function sceneOffice(t) { // 5–35
  const ft = flowT(t);
  const focus = inv(12, 15, t); // others fade as we focus
  ctx.save();
  applyCam(officeCamera(t));
  drawFloor();
  crack(crackOpen(t));
  drawDesks(focus * 0.4);
  drawFlights(ft, { alpha: 1 - focus * 0.7, desat: focus * 0.7, glow: 1 - focus * 0.7 });
  const s = stallState(t);
  if (s) {
    if (t < 16) trail(v => q(PA, PC, PB, v), Math.min(U_STALL, (s && t < 12) ? 0.42 * (t - 9) / 3 : U_STALL), 0.2, { alpha: 0.45 * (1 - s.desat) });
    // spotlight on the hero plane
    if (t > 12) { const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 160); g.addColorStop(0, `rgba(255,226,163,${0.16 * focus * s.alpha})`); g.addColorStop(1, 'rgba(255,226,163,0)'); ctx.fillStyle = g; ctx.fillRect(s.x - 160, s.y - 160, 320, 320); }
    plane(s.x, s.y, s.ang, (1.05 + 0.45 * focus) * s.s, { glow: Math.max(s.glow, 0.35), desat: s.desat * 0.85, alpha: s.alpha });
  }
  // gulp splash
  if (t > 31.0 && t < 31.8) {
    const k = inv(31.0, 31.8, t);
    for (let i = 0; i < 10; i++) { const a = -Math.PI * (0.1 + 0.8 * i / 9); circle(960 + Math.cos(a) * 140 * k, 960 + Math.sin(a) * 90 * k, 6 * (1 - k)); ctx.fillStyle = rgba(C.red, 1 - k); ctx.fill(); }
  }
  // bubbles
  [[1, 'Approve?', 6.0], [6, 'Review pls', 7.1], [9, 'Who owns this?', 8.2], [3, 'Quick q?', 9.3], [10, 'Sign-off?', 10.2]].forEach(([d, str, at]) => {
    const a = prog(t, at, at + 0.3, E.outBack), out = 1 - inv(at + 2.0, at + 2.3, t);
    if (t > at) bubble(DESKS[d].x, DESKS[d].y - 100, str, clamp(a) * out * (1 - focus), 0.6 + 0.4 * a);
  });
  ctx.restore();

  // desaturation overlay during the stall
  ctx.fillStyle = `rgba(5,8,18,${0.25 * inv(13, 16, t) + 0.3 * inv(23.6, 24.2, t) * (1 - inv(29.2, 30, t))})`; ctx.fillRect(0, 0, W, H);

  // consequence inserts
  insertCalendar(t, 330, 300); stamp('MISSED.', 330, 520, t, 24.5, { size: 84, rot: -0.07, until: 29.6 });
  insertFace(t, 1590, 300); stamp('ESCALATED.', 1590, 520, t, 26.0, { size: 84, rot: 0.05, until: 29.6 });
  insertMoney(t, 1590, 720);
  stamp('AWKWARD.', 960, 800, t, 27.6, { size: 130, rot: -0.04, until: 29.6 });
  vignette(0.5 + 0.2 * focus);
  flash(t, 5.0, 0.3, C.amberHot, 0.5);
}
function cardPop(t, at) { return prog(t, at, at + 0.35, E.outBack) * (1 - inv(29.2, 29.6, t)); }
function insertCalendar(t, x, y) {
  const k = cardPop(t, 23.9); if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.rotate(-0.04);
  ctx.fillStyle = C.white; rr(-110, -120, 220, 240, 22); ctx.fill();
  ctx.fillStyle = C.red; rr(-110, -120, 220, 70, 22); ctx.fill(); ctx.fillRect(-110, -70, 220, 20);
  const days = [['MON', 12], ['TUE', 13], ['WED', 14], ['THU', 15]];
  const idx = Math.min(3, Math.floor(clamp((t - 24.0) / 0.55) * 3.99));
  const flip = ((t - 24.0) / 0.55 * 3.99) % 1, fs = t > 24 && t < 24.55 ? Math.abs(Math.cos(flip * Math.PI)) : 1;
  ctx.save(); ctx.scale(1, fs);
  text(days[idx][0], 0, -82, { size: 40, weight: 800 });
  text(String(days[idx][1]), 0, 30, { size: 110, weight: 900, color: C.ink });
  ctx.restore();
  ctx.restore();
}
function insertFace(t, x, y) {
  const k = cardPop(t, 25.3); if (k <= 0.01) return;
  const m = inv(25.5, 26.4, t);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  if (m > 0.8) ctx.translate(Math.sin(t * 70) * 4, 0);
  circle(0, 0, 112); ctx.fillStyle = mix('#FFD34D', '#FF5A4E', m); ctx.fill();
  ctx.fillStyle = C.ink;
  circle(-38, -24, 13); ctx.fill(); circle(38, -24, 13); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 10; ctx.lineCap = 'round';
  // brows
  const b = m * 0.5;
  ctx.beginPath(); ctx.moveTo(-62, -56 + b * 10); ctx.lineTo(-18, -50 + b * 34); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(62, -56 + b * 10); ctx.lineTo(18, -50 + b * 34); ctx.stroke();
  // mouth: smile -> frown
  const curve = lerp(36, -30, m);
  ctx.beginPath(); ctx.moveTo(-46, 44); ctx.quadraticCurveTo(0, 44 + curve, 46, 44); ctx.stroke();
  // steam
  if (m > 0.9) { ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; [-1, 1].forEach(d => { const o = (t * 3) % 1; ctx.globalAlpha = 1 - o; ctx.beginPath(); ctx.moveTo(d * 120, -80 - o * 40); ctx.quadraticCurveTo(d * 140, -100 - o * 40, d * 125, -120 - o * 40); ctx.stroke(); }); }
  ctx.restore();
}
function insertMoney(t, x, y) {
  const k = cardPop(t, 26.9); if (k <= 0.01) return;
  const fl = (Math.sin(t * 47) > -0.2 ? 1 : 0.35);
  ctx.save(); ctx.translate(x, y); ctx.scale(k * 0.9, k * 0.9); ctx.globalAlpha = fl;
  ctx.shadowColor = C.red; ctx.shadowBlur = 40;
  circle(0, 0, 80); ctx.fillStyle = C.redDeep; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = C.red; ctx.stroke(); ctx.shadowBlur = 0;
  text('−$', 0, 6, { size: 80, weight: 900, color: C.red });
  ctx.restore();
}

function sceneReveal(t) { // 35–42
  if (t < 35.7) { // freeze-frame + whip pan
    ctx.save();
    const k = inv(35.25, 35.7, t, E.inCubic);
    const shift = -E.inCubic(k) * 1400;
    for (let i = 0; i < (k > 0 ? 4 : 1); i++) {
      ctx.save(); ctx.globalAlpha = i === 0 ? 1 : 0.35; ctx.translate(shift + i * 90 * k, 0); sceneOffice(34.99); ctx.restore();
    }
    ctx.restore();
    const g = inv(35, 35.2, t);
    ctx.save(); ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = `rgba(128,128,128,${g})`; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.fillStyle = `rgba(0,0,0,${0.4 * g})`; ctx.fillRect(0, 0, W, H);
    // streaks
    const r = mulberry(11);
    for (let i = 0; i < 30; i++) { ctx.fillStyle = rgba(C.teal, 0.25 * k * r()); ctx.fillRect(0, r() * H, W, 2 + r() * 6); }
    return;
  }
  background(prog(t, 35.7, 37.5), C.teal);
  const r = mulberry(13);
  for (let i = 0; i < 30; i++) { ctx.fillStyle = rgba(C.teal, 0.2 * (1 - inv(35.7, 36.2, t)) * r()); ctx.fillRect(0, r() * H, W, 2 + r() * 6); }
  // bird drops in
  const drop = prog(t, 35.9, 36.5, E.inCubic);
  let by = lerp(-250, 500, drop), squash = 1;
  if (t > 36.5) squash = lerp(0.62, 1, prog(t, 36.5, 37.2, E.outElastic));
  // feather shake
  const shake = t > 37.3 && t < 38.0 ? Math.sin((t - 37.3) * 55) * 0.18 * (1 - inv(37.3, 38.0, t)) : 0;
  const lookCam = prog(t, 38.1, 38.3);
  const move = prog(t, 40.4, 41.3, E.inOut);
  const bx = lerp(960, 78, move), byy = lerp(by, 66, move), bs = lerp(1.6, 0.3, move);
  // landing dust
  if (t > 36.5 && t < 37.4) { const k = inv(36.5, 37.4, t); for (let i = 0; i < 8; i++) { const a = Math.PI + Math.PI * i / 7; circle(960 + Math.cos(a) * 170 * k, 600 + Math.sin(a) * 30 * k + 10, 10 * (1 - k)); ctx.fillStyle = rgba(C.tealLight, 0.6 * (1 - k)); ctx.fill(); } }
  // feathers
  if (t > 37.3 && t < 38.8) { const k = inv(37.3, 38.8, t); const rr2 = mulberry(5); for (let i = 0; i < 7; i++) { const a = rr2() * Math.PI * 2; ctx.save(); ctx.translate(960 + Math.cos(a) * 160 * k, 470 + Math.sin(a) * 90 * k + k * k * 120); ctx.rotate(a + k * 5); ellipse(0, 0, 16, 6); ctx.fillStyle = rgba(C.teal, 1 - k); ctx.fill(); ctx.restore(); } }
  bird(bx, byy, bs, { squash, tilt: shake, flap: t < 36.5 ? (Math.sin(t * 40) + 1) / 2 : 0.1, look: [lerp(0.6, -0.3, lookCam), lerp(0.4, 0, lookCam)], lid: lerp(0, 0.35, lookCam), brow: lookCam });
  // wordmark flash
  const wm = prog(t, 38.7, 39.1, E.outBack);
  const wx = lerp(960, 118 + 155, move), wy = lerp(780, 68, move), ws = lerp(1, 0.227, move);
  if (t > 38.7 && move < 1) wordmark(wx, wy, ws * (0.7 + 0.3 * wm), clamp(wm));
  flash(t, 38.7, 0.3, C.teal, 0.35);
  if (move >= 1) cornerLogo(t, 1);
  vignette(0.5);
}

function sceneRewind(t) { // 42–52
  if (t >= 49.3) return sceneOrbit(t);
  let ft, st;
  if (t < 44.5) { const k = inv(42, 44.5, t, E.inOut); st = lerp(31.0, 15.6, E.inOut(k)); ft = flowT(31) - (t - 42) * 2.5; }
  else { st = 15.6 + (t - 44.5); ft = flowT(31) - 6.25 + (t - 44.5) * (t < 47.2 ? 0.3 : 1); }
  const tapT = 47.2;
  const Q = stallState(15.6 + (tapT - 44.5));
  ctx.save();
  const zoom = prog(t, 44.5, 46.6, E.inOut);
  const cam = { x: lerp(980, Q.x + 60, zoom * 0.6), y: lerp(560, Q.y + 80, zoom * 0.6), z: lerp(1.2, 1.5, zoom) };
  applyCam(cam);
  drawFloor();
  crack(t < 44.5 ? 14 : 14);
  drawDesks(0.3);
  const fixed = t > tapT;
  drawFlights(ft, { alpha: 0.55 + (fixed ? 0.45 * inv(tapT, 48.4, t) : 0), desat: fixed ? 0.6 * (1 - inv(tapT, 48.4, t)) : 0.6, glow: 0.5 });
  if (!fixed) {
    const s = stallState(Math.min(st, 30.5));
    plane(s.x, s.y, s.ang, 1.05, { glow: s.glow, desat: s.desat });
  } else {
    const k = prog(t, tapT + 0.15, 49.0, E.inOut);
    const P1 = { x: 1590, y: 450 }, Cc = { x: Q.x + 360, y: Q.y - 160 };
    const path = v => q(Q, Cc, P1, v);
    const p = path(k);
    trail(path, k, 0.3, { alpha: 0.7, width: 6 });
    const g = inv(tapT, tapT + 0.4, t);
    plane(p.x, p.y, qAng(Q, Cc, P1, Math.max(0.01, k)), 1.05 + 0.3 * (1 - inv(tapT, tapT + 0.6, t)) * g, { glow: 0.3 + 1.2 * g, desat: (1 - g) * 0.9 });
    // tap burst
    const bk = inv(tapT, tapT + 0.6, t);
    if (bk < 1) {
      ctx.strokeStyle = rgba(C.teal, 1 - bk); ctx.lineWidth = 8 * (1 - bk); circle(Q.x, Q.y, 20 + 140 * E.outCubic(bk)); ctx.stroke();
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; const r1 = 40 + 120 * E.outCubic(bk); ctx.strokeStyle = rgba(C.amberHot, 1 - bk); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(Q.x + Math.cos(a) * r1 * 0.6, Q.y + Math.sin(a) * r1 * 0.6); ctx.lineTo(Q.x + Math.cos(a) * r1, Q.y + Math.sin(a) * r1); ctx.stroke(); }
    }
  }
  // bird swoop
  if (t > 46.4) {
    let bx, by, tilt;
    if (t < tapT) { const k = prog(t, 46.4, tapT, E.inCubic); const S0 = { x: Q.x + 900, y: Q.y - 500 }, Sc = { x: Q.x + 300, y: Q.y + 250 }, S1 = { x: Q.x + 70, y: Q.y - 40 }; const p = q(S0, Sc, S1, k); bx = p.x; by = p.y; tilt = -0.5 * (1 - k); }
    else { const k = prog(t, tapT, 48.6, E.outCubic); bx = lerp(Q.x + 70, Q.x + 210, k); by = lerp(Q.y - 40, Q.y - 170, k) + Math.sin(t * 6) * 8; tilt = lerp(-0.35, 0, k); }
    const peck = t > tapT - 0.08 && t < tapT + 0.2 ? Math.sin(inv(tapT - 0.08, tapT + 0.2, t) * Math.PI) * 0.5 : 0;
    bird(bx, by, 0.75, { flip: true, flap: (Math.sin(t * 30) + 1) / 2, tilt: tilt - peck, lid: 0.35, look: [-0.6, 0.5] });
  }
  ctx.restore();
  // VHS rewind overlay
  if (t < 44.6) {
    const r = mulberry(Math.floor(t * 24));
    ctx.fillStyle = 'rgba(30,60,120,0.18)'; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) { const y = r() * H; ctx.fillStyle = `rgba(255,255,255,${0.04 + r() * 0.08})`; ctx.fillRect(0, y, W, 2 + r() * 10); }
    if (Math.floor(t * 3) % 2 === 0) text('◀◀  REWIND', 150, 150, { size: 46, weight: 800, align: 'left', color: C.white, alpha: 0.9 });
  }
  flash(t, tapT, 0.25, C.teal, 0.3);
  cornerLogo(t, 1);
  vignette(0.45);
}
function sceneOrbit(t) { // 49.3–52
  background(1, C.teal);
  const k = prog(t, 49.3, 49.9, E.outBack);
  const bx = 960, by = 470 + Math.sin(t * 3) * 10;
  // connection lines
  TOOLS.forEach((kind, i) => {
    const a = t * 0.9 + i / TOOLS.length * Math.PI * 2;
    const x = 960 + Math.cos(a) * 470, y = 480 + Math.sin(a) * 210;
    const ap = prog(t, 49.4 + i * 0.15, 49.8 + i * 0.15, E.outBack);
    ctx.save(); ctx.setLineDash([8, 12]); ctx.lineDashOffset = -t * 60; ctx.strokeStyle = rgba(C.teal, 0.45 * clamp(ap)); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
    const pulse = ((t * 1.2 + i * 0.2) % 1);
    circle(lerp(x, bx, pulse), lerp(y, by, pulse), 7); ctx.fillStyle = rgba(C.amber, clamp(ap) * (1 - pulse)); ctx.fill();
    toolIcon(kind, x, y, 1.1 * clamp(ap, 0, 1.2), clamp(ap));
  });
  bird(bx, by, 1.3 * k, { flap: (Math.sin(t * 24) + 1) / 2, lid: 0.3, look: [0.1, 0] });
  cornerLogo(t, 1);
  vignette(0.45);
  flash(t, 49.3, 0.25, C.teal, 0.3);
}

function panel(cx, cy, at, t, label, num, active) {
  const k = prog(t, at, at + 0.55, E.outBack);
  if (k <= 0) return null;
  const y = cy + (1 - k) * 260, a = clamp(k);
  ctx.save(); ctx.globalAlpha = a * (active ? 1 : 0.5);
  ctx.fillStyle = 'rgba(20,36,80,0.85)'; rr(cx - 270, y - 330, 540, 660, 36); ctx.fill();
  ctx.strokeStyle = rgba(C.teal, active ? 0.8 : 0.25); ctx.lineWidth = 3; rr(cx - 270, y - 330, 540, 660, 36); ctx.stroke();
  circle(cx - 200, y + 250, 34); ctx.fillStyle = active ? C.teal : '#2A3F7A'; ctx.fill();
  text(String(num), cx - 200, y + 252, { size: 40, weight: 900, color: C.ink });
  text(label, cx - 148, y + 252, { size: 60, weight: 800, align: 'left' });
  ctx.restore();
  return { y, a: a * (active ? 1 : 0.5) };
}
function sceneSteps(t) { // 52–62
  background(0.6, C.teal);
  const X = [400, 960, 1520], Y = 470;
  // 1 Connect
  const p1 = panel(X[0], Y, 52.0, t, 'Connect', 1, t < 55.3);
  if (p1) {
    ctx.save(); ctx.globalAlpha = p1.a;
    const by = p1.y - 170;
    [[-150, 30], [0, 70], [150, 30]].forEach(([dx, dy], i) => {
      const ix = X[0] + dx, iy = by + 200 + dy;
      const c = prog(t, 52.5 + i * 0.35, 53.4 + i * 0.35);
      ctx.strokeStyle = rgba(C.teal, 0.9); ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let s = 0; s <= 20 * c; s++) { const u = s / 20; const px = lerp(X[0], ix, u), py = lerp(by + 30, iy - 50, u) + Math.sin(u * Math.PI) * 30; s ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
      ctx.stroke();
      toolIcon(['chat', 'ticket', 'mail'][i], ix, iy, 0.9, 1);
      if (c >= 1) { const g = 1 - inv(53.4 + i * 0.35, 53.9 + i * 0.35, t); circle(ix, iy - 50, 10 + 20 * (1 - g)); ctx.fillStyle = rgba(C.teal, g); ctx.fill(); }
    });
    bird(X[0], by - 10, 0.8, { flap: (Math.sin(t * 20) + 1) / 2 * 0.4, lid: 0.3 });
    ctx.restore();
  }
  // 2 Detect
  const p2 = panel(X[1], Y, 55.3, t, 'Detect', 2, t >= 55.3 && t < 58.6);
  if (p2) {
    ctx.save(); ctx.globalAlpha = p2.a;
    const rows = [[-140, -170], [60, -110], [-90, -10], [130, 50]];
    const beam = lerp(X[1] - 240, X[1] + 240, prog(t, 55.8, 57.6, E.inOut));
    rows.forEach(([dx, dy], i) => {
      const x = X[1] + dx, y = p2.y + dy + Math.sin(t * 2 + i) * 6;
      const bad = i === 2, hit = bad && beam > x;
      plane(x, y, bad ? 0.5 + Math.sin(t * 8) * 0.2 : -0.1, 0.9, { glow: bad ? 0.2 : 0.8, desat: bad ? 0.8 : 0, outline: hit ? 0.5 + 0.5 * Math.sin(t * 10) : 0 });
      if (hit) { const k = prog(t, 56.8, 57.1, E.outBack); bubble(x + 10, y - 90, 'stalled · 2 days', clamp(k), k); }
    });
    if (t > 55.8 && t < 57.9) {
      const g = ctx.createLinearGradient(beam - 60, 0, beam + 6, 0); g.addColorStop(0, rgba(C.teal, 0)); g.addColorStop(1, rgba(C.teal, 0.5));
      ctx.fillStyle = g; ctx.fillRect(beam - 60, p2.y - 300, 66, 470);
      ctx.fillStyle = C.teal; ctx.fillRect(beam, p2.y - 300, 4, 470);
    }
    ctx.restore();
  }
  // 3 Nudge
  const p3 = panel(X[2], Y, 58.6, t, 'Nudge', 3, t >= 58.6);
  if (p3) {
    ctx.save(); ctx.globalAlpha = p3.a;
    const ax = X[2] - 150, ay = p3.y + 90;
    circle(ax, ay - 40, 46); ctx.fillStyle = AVATAR[2]; ctx.fill();
    ctx.beginPath(); ctx.arc(ax, ay - 52, 46, Math.PI, 0); ctx.fillStyle = HAIR[2]; ctx.fill();
    ellipse(ax, ay + 60, 70, 46); ctx.fillStyle = '#3D5BB8'; ctx.fill();
    const bk = prog(t, 59.1, 59.5, E.outBack);
    if (bk > 0) {
      ctx.save(); ctx.translate(X[2] + 60, p3.y - 140); ctx.scale(bk, bk);
      ctx.fillStyle = C.white; rr(-225, -110, 450, 220, 26); ctx.fill();
      tri([-185, 100], [-145, 100], [-215, 150]); ctx.fill();
      bird(-175, -66, 0.22, { lid: 0.3 });
      text('Nudgebird', -145, -66, { size: 24, weight: 800, color: C.tealDark, align: 'left' });
      text('Hey! The Q3 budget approval', -195, -18, { size: 24, weight: 600, color: C.ink, align: 'left' });
      text('has waited 2 days. Take a look?', -195, 16, { size: 24, weight: 600, color: C.ink, align: 'left' });
      const press = t > 60.5 && t < 60.75 ? 0.92 : 1;
      ctx.save(); ctx.translate(100, 66); ctx.scale(press, press);
      ctx.fillStyle = t > 60.6 ? C.tealDark : C.teal; rr(-70, -24, 140, 48, 24); ctx.fill();
      text('Open', 0, 1, { size: 26, weight: 800, color: C.ink });
      ctx.restore();
      // cursor
      const ck = prog(t, 59.7, 60.5, E.inOut);
      const cx2 = lerp(260, 112, ck), cy2 = lerp(230, 78, ck);
      ctx.fillStyle = C.white; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(cx2, cy2 + 44); ctx.lineTo(cx2 + 12, cy2 + 33); ctx.lineTo(cx2 + 30, cy2 + 32); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    // plane takes off
    if (t > 60.7) {
      const k = prog(t, 60.7, 61.9, E.inCubic);
      const P0 = { x: X[2] + 160, y: p3.y - 80 }, Pc = { x: X[2] + 250, y: p3.y + 160 }, P1 = { x: X[2] + 600, y: p3.y - 500 };
      const path = v => q(P0, Pc, P1, v);
      trail(path, k, 0.35, { width: 6, alpha: 0.7 });
      const p = path(k); plane(p.x, p.y, qAng(P0, Pc, P1, Math.max(0.02, k)), 1.1, { glow: 1.3 });
    }
    ctx.restore();
  }
  cornerLogo(t, 1);
  vignette(0.45);
}

function sceneHealthy(t) { // 62–72
  const ft = t * 1.0;
  ctx.save();
  const z = lerp(1.15, 0.98, prog(t, 62, 66, E.inOut));
  applyCam({ x: 960, y: lerp(700, 560, prog(t, 62, 66, E.inOut)), z });
  drawFloor();
  const seal = lerp(660, 1260, prog(t, 64.3, 66.0, E.inOut));
  crack(14, { seal: t > 64.3 ? seal : -1 });
  if (t > 64.3 && t < 66.2) { // zipper sparks
    for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.4; const r2 = 20 + ((t * 300 + i * 30) % 50); circle(seal + Math.cos(a) * r2, 965 + Math.sin(a) * r2, 4); ctx.fillStyle = rgba(C.teal, 0.9); ctx.fill(); }
    circle(seal, 965, 14); ctx.fillStyle = C.tealLight; ctx.fill();
  }
  if (t > 66.0 && t < 66.8) { const k = inv(66.0, 66.8, t); ctx.strokeStyle = rgba(C.teal, 1 - k); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(700 - k * 100, 965); ctx.lineTo(1220 + k * 100, 965); ctx.stroke(); }
  drawDesks(0);
  drawFlights(ft, { alpha: 1, glow: 1.1 });
  ctx.restore();
  flash(t, 62.0, 0.3, C.teal, 0.3);
  // stat cards
  const d = prog(t, 66.6, 67.2);
  ctx.fillStyle = `rgba(5,9,22,${0.6 * d})`; ctx.fillRect(0, 0, W, H);
  const card = (x, at, big, sub1, sub2) => {
    const k = prog(t, at, at + 0.5, E.outBack); if (k <= 0) return;
    ctx.save(); ctx.translate(x, 470 + (1 - k) * 120); ctx.globalAlpha = clamp(k);
    ctx.fillStyle = 'rgba(22,40,90,0.95)'; rr(-280, -170, 560, 340, 34); ctx.fill();
    ctx.strokeStyle = rgba(C.teal, 0.7); ctx.lineWidth = 3; rr(-280, -170, 560, 340, 34); ctx.stroke();
    text(big(prog(t, at, at + 1.6)), 0, -40, { size: 140, weight: 900, color: C.teal });
    text(sub1, 0, 70, { size: 36, weight: 700 }); text(sub2, 0, 115, { size: 30, weight: 500, color: C.muted });
    ctx.restore();
  };
  card(640, 66.9, k => `${Math.round(40 * k)}%`, 'faster follow-through', 'on stalled tasks');
  card(1280, 67.4, k => `${Math.round(6 * k)} hrs`, 'saved per manager', 'every week');
  if (t > 67.6) text('Illustrative figures for a spec concept', 960, 700, { size: 24, weight: 500, color: C.muted, alpha: prog(t, 67.6, 68.2) });
  cornerLogo(t, 1);
  vignette(0.45);
}

function sceneRelax(t) { // 72–80
  // wall
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#182A5E'); g.addColorStop(1, '#0E1B42'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // window with planes going by
  ctx.save(); rr(160, 150, 560, 380, 20); ctx.fillStyle = '#2B4A9A'; ctx.fill(); ctx.clip();
  const sg = ctx.createLinearGradient(0, 150, 0, 530); sg.addColorStop(0, '#5C86E8'); sg.addColorStop(1, '#F2B880'); ctx.fillStyle = sg; ctx.fillRect(160, 150, 560, 380);
  for (let i = 0; i < 4; i++) { const x = 100 + ((t * 160 + i * 190) % 760), y = 230 + i * 70 + Math.sin(t + i) * 10; plane(x, y, -0.1, 0.55, { glow: 0.6 }); }
  ctx.restore();
  ctx.strokeStyle = '#0B1532'; ctx.lineWidth = 14; rr(160, 150, 560, 380, 20); ctx.stroke(); ctx.beginPath(); ctx.moveTo(440, 150); ctx.lineTo(440, 530); ctx.stroke();
  // floor
  ctx.fillStyle = '#0A1430'; ctx.fillRect(0, 880, W, 200);
  // desk
  ctx.fillStyle = '#2C4486'; rr(820, 690, 860, 34, 10); ctx.fill();
  ctx.fillStyle = '#1D2F63'; ctx.fillRect(860, 724, 26, 160); ctx.fillRect(1614, 724, 26, 160);
  // monitor
  const mx = 1300;
  ctx.fillStyle = '#0E1836'; ctx.fillRect(mx - 14, 600, 28, 90); rr(mx - 80, 676, 160, 18, 6); ctx.fill();
  rr(mx - 230, 380, 460, 260, 20); ctx.fill();
  ctx.fillStyle = '#13224A'; rr(mx - 214, 396, 428, 228, 12); ctx.fill();
  ['Q3 budget sign-off', 'Vendor contract', 'Launch checklist', 'Hiring plan'].forEach((s, i) => {
    const y = 436 + i * 50, ck = prog(t, 72.8 + i * 0.8, 73.1 + i * 0.8, E.outBack);
    ctx.strokeStyle = rgba(C.teal, 0.8); ctx.lineWidth = 3; rr(mx - 190, y - 15, 30, 30, 7); ctx.stroke();
    if (ck > 0) { ctx.save(); ctx.translate(mx - 175, y); ctx.scale(ck, ck); ctx.strokeStyle = C.teal; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-2, 7); ctx.lineTo(9, -8); ctx.stroke(); ctx.restore(); }
    text(s, mx - 145, y + 1, { size: 26, weight: 600, align: 'left', color: ck > 0.5 ? C.white : C.muted });
  });
  // mug
  ctx.fillStyle = '#E86A92'; rr(1540, 630, 56, 62, 8); ctx.fill(); ctx.strokeStyle = '#E86A92'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(1600, 660, 16, -1.2, 1.2); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 4; for (let i = 0; i < 2; i++) { const o = (t * 0.7 + i * 0.5) % 1; ctx.globalAlpha = 1 - o; ctx.beginPath(); ctx.moveTo(1556 + i * 22, 620 - o * 50); ctx.quadraticCurveTo(1566 + i * 22, 600 - o * 50, 1556 + i * 22, 580 - o * 50); ctx.stroke(); } ctx.globalAlpha = 1;
  // plant
  ctx.fillStyle = '#C46A3A'; rr(880, 620, 70, 70, 10); ctx.fill(); ctx.fillStyle = '#3FBF8A'; [[-24, -60, -0.4], [0, -80, 0], [24, -60, 0.4]].forEach(([dx, dy, r]) => { ellipse(915 + dx, 620 + dy / 1.4, 16, 42, r); ctx.fill(); });
  // manager + chair
  const lean = prog(t, 72.6, 74.0, E.outBack);
  const hipX = 1010, hipY = 700;
  ctx.fillStyle = '#0E1836'; ctx.fillRect(hipX - 10, 760, 20, 100); rr(hipX - 80, 852, 160, 16, 8); ctx.fill();
  rr(hipX - 70, 740, 150, 26, 10); ctx.fill();
  ctx.save(); ctx.translate(hipX - 50, 750); ctx.rotate(-0.35 * lean); ctx.fillStyle = '#0E1836'; rr(-26, -230, 30, 240, 12); ctx.fill(); ctx.restore();
  // legs
  ctx.strokeStyle = '#2A3A6E'; ctx.lineWidth = 36; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hipX, 735); ctx.lineTo(hipX + 130, 745); ctx.lineTo(hipX + 140 + lean * 40, 860); ctx.stroke();
  // torso
  ctx.save(); ctx.translate(hipX - 20, 735); ctx.rotate(0.1 - 0.42 * lean);
  ctx.fillStyle = '#3D5BB8'; rr(-34, -170, 76, 180, 34); ctx.fill();
  // head
  const hx = 4, hy = -222;
  circle(hx, hy, 44); ctx.fillStyle = AVATAR[0]; ctx.fill();
  ctx.beginPath(); ctx.arc(hx - 4, hy - 8, 46, Math.PI * 0.9, Math.PI * 1.9); ctx.fillStyle = HAIR[0]; ctx.fill();
  // face (facing right)
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.lineCap = 'round';
  const eyesClosed = lean > 0.6;
  if (eyesClosed) { ctx.beginPath(); ctx.arc(hx + 24, hy - 4, 7, 0.2, Math.PI - 0.2); ctx.stroke(); } else { circle(hx + 24, hy - 6, 5); ctx.fillStyle = C.ink; ctx.fill(); }
  ctx.beginPath(); ctx.arc(hx + 22, hy + 14, 12, 0.2, Math.PI * 0.75); ctx.stroke();
  // arms: behind head when leaning
  ctx.strokeStyle = '#3D5BB8'; ctx.lineWidth = 26;
  ctx.beginPath(); ctx.moveTo(4, -150);
  if (lean > 0.3) { ctx.lineTo(lerp(70, -50, lean), lerp(-90, -200, lean)); ctx.lineTo(lerp(140, -30, lean), lerp(-40, -250, lean)); }
  else { ctx.lineTo(70, -90); ctx.lineTo(140, -40); }
  ctx.stroke();
  ctx.restore();
  // bird lands on monitor
  let bx, by, flap = 0.1, tilt = 0;
  if (t < 75.4) { const k = prog(t, 74.4, 75.4, E.outCubic); bx = lerp(2100, mx + 80, k); by = lerp(160, 318, k); flap = (Math.sin(t * 30) + 1) / 2; tilt = -0.2 * (1 - k); }
  else { bx = mx + 80; by = 318 + Math.sin(t * 2) * 2; }
  const blink = (t % 3.1) > 2.95 ? 1 : 0.3;
  const sq = t > 75.4 ? lerp(0.7, 1, prog(t, 75.4, 75.9, E.outElastic)) : 1;
  bird(bx, by, 0.6, { flip: true, flap, tilt, lid: blink, squash: sq, look: [-0.5, 0.2] });
  if (t > 76.8 && t < 78.4) bubble(bx - 40, by - 110, 'All clear ✓', prog(t, 76.8, 77.1, E.outBack) * (1 - inv(78.1, 78.4, t)));
  cornerLogo(t, 1);
  vignette(0.45);
  flash(t, 72.0, 0.25, '#FFFFFF', 0.25);
}

function sceneOutro(t) { // 80–90
  background(1, C.teal, 400);
  const cx = 960, cy = 400;
  // planes converge into a ring
  const N = 18;
  for (let i = 0; i < N; i++) {
    const at = 80.9 + i * 0.07, k = prog(t, at, at + 1.3, E.inOut);
    if (k <= 0) continue;
    const a = i / N * Math.PI * 2 + (t - 82) * 0.25;
    const r0 = mulberry(i + 99); const sa = r0() * Math.PI * 2;
    const S = { x: cx + Math.cos(sa) * 1300, y: cy + Math.sin(sa) * 900 };
    const T = { x: cx + Math.cos(a) * 270, y: cy + Math.sin(a) * 270 };
    const x = lerp(S.x, T.x, k), y = lerp(S.y, T.y, k);
    const ang = k < 1 ? Math.atan2(T.y - S.y, T.x - S.x) * (1 - k) + (a + Math.PI / 2) * k : a + Math.PI / 2;
    plane(x, y, ang, 0.75, { glow: 0.9 });
  }
  const bk = prog(t, 80.0, 81.2, E.outCubic);
  const bx = lerp(-200, cx, bk), by = lerp(600, cy, bk) + Math.sin(t * 2.5) * 6;
  const wink = t > 88.0 && t < 88.6 ? Math.sin(inv(88.0, 88.6, t) * Math.PI) : 0;
  bird(bx, by, 1.25, { flap: t < 81.4 ? (Math.sin(t * 28) + 1) / 2 : 0.15 + 0.1 * Math.sin(t * 3), lid: 0.3, wink, look: [0.1, 0.1], brow: 1 + wink });
  if (wink > 0.5) { const k = inv(88.15, 88.6, t); [[1, -1], [1.3, 0], [1, 1]].forEach(([dx, dy]) => { ctx.strokeStyle = rgba(C.amberHot, 1 - k); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(bx + 90 + dx * 30, by - 40 + dy * 24); ctx.lineTo(bx + 90 + dx * 60, by - 40 + dy * 48); ctx.stroke(); }); }
  const wm = prog(t, 83.6, 84.2, E.outBack);
  wordmark(960, 770, 0.75 * (0.8 + 0.2 * wm), clamp(wm));
  const tg = prog(t, 84.8, 85.4);
  text('Nothing falls through the cracks.', 960, 870 + (1 - tg) * 20, { size: 50, weight: 600, alpha: tg });
  const ct = prog(t, 86.2, 86.7, E.outBack);
  if (ct > 0) {
    ctx.save(); ctx.translate(960, 965); ctx.scale(ct, ct);
    ctx.fillStyle = C.teal; rr(-230, -36, 460, 72, 36); ctx.fill();
    text('Start free at nudgebird.io', 0, 2, { size: 32, weight: 800, color: C.ink });
    ctx.restore();
  }
  text('Spec concept · Nudgebird is a fictional product', 960, 1050, { size: 20, weight: 500, color: C.muted, alpha: prog(t, 86.5, 87) });
  vignette(0.45);
  flash(t, 80.0, 0.3, C.teal, 0.3);
  ctx.fillStyle = `rgba(0,0,0,${inv(89.2, 90, t)})`; ctx.fillRect(0, 0, W, H);
}

function draw(t) {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none';
  if (t < 5) sceneIntro(t);
  else if (t < 35) sceneOffice(t);
  else if (t < 42) sceneReveal(t);
  else if (t < 52) sceneRewind(t);
  else if (t < 62) sceneSteps(t);
  else if (t < 72) sceneHealthy(t);
  else if (t < 80) sceneRelax(t);
  else sceneOutro(t);
  ctx.globalAlpha = 1; ctx.filter = 'none';
  ctx.restore();
}

  return { draw: draw };
  } };
})();
