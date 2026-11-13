// Hand-built ink figures for thumbnails (SVG). Bold black outlines, card fill, red accents.
const INK = "#000", CARD = "#F1F5EF", RED = "#B00E1B";

// a bone: black outline stroke under a card-coloured stroke, so it reads as an outlined bone
const bone = (d, w = 30) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + 14}" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${CARD}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const knob = (x, y, r = 24) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${CARD}" stroke="${INK}" stroke-width="7"/>`;

export function skeleton() {
  let ribs = "";
  for (let i = 0; i < 6; i++) {
    const y = 445 + i * 44, w = 150 - i * 12, d = 60 - i * 4;
    ribs += bone(`M410 ${y} C ${410 - w * 0.5} ${y - 22} ${410 - w} ${y - 4} ${410 - w + 6} ${y + d}`, 16);
    ribs += bone(`M410 ${y} C ${410 + w * 0.5} ${y - 22} ${410 + w} ${y - 4} ${410 + w - 6} ${y + d}`, 16);
  }
  let spine = "";
  for (let y = 330; y <= 720; y += 30) spine += `<rect x="392" y="${y}" width="36" height="24" rx="9" fill="${CARD}" stroke="${INK}" stroke-width="6"/>`;
  let teeth = "";
  for (let x = 362; x <= 458; x += 19) teeth += `<path d="M${x} 270 L${x} 302" stroke="${INK}" stroke-width="5"/>`;
  // cobweb from the skull to the shoulder
  let web = "";
  const cx = 250, cy = 250;
  for (let a = -10; a <= 100; a += 22) {
    const r = (a * Math.PI) / 180;
    web += `<path d="M${cx} ${cy} L${cx - Math.cos(r) * 150} ${cy - Math.sin(r) * 150}" stroke="${INK}" stroke-width="3" opacity="0.7"/>`;
  }
  for (const R of [45, 85, 125]) {
    let d = "";
    for (let a = -10; a <= 100; a += 22) {
      const r = (a * Math.PI) / 180, x = cx - Math.cos(r) * R, y = cy - Math.sin(r) * R;
      d += (d ? ` Q ${cx - Math.cos(r - 0.19) * R * 0.88} ${cy - Math.sin(r - 0.19) * R * 0.88} ` : "M") + `${x} ${y}`;
    }
    web += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3" opacity="0.7"/>`;
  }
  return `<svg viewBox="0 0 820 1000" xmlns="http://www.w3.org/2000/svg">
  ${web}
  ${spine}
  ${bone("M262 405 C330 380 490 380 558 405", 20)}
  ${ribs}
  <path d="M325 760 C320 700 500 700 495 760 C495 815 440 820 410 795 C380 820 325 815 325 760 Z" fill="${CARD}" stroke="${INK}" stroke-width="10"/>
  <circle cx="370" cy="765" r="16" fill="${INK}"/><circle cx="450" cy="765" r="16" fill="${INK}"/>
  ${bone("M262 410 L225 615", 30)}${bone("M558 410 L600 615", 30)}
  ${bone("M225 615 L360 570", 26)}${bone("M600 615 L462 570", 26)}
  ${knob(262, 410)}${knob(558, 410)}${knob(225, 615, 22)}${knob(600, 615, 22)}
  <g transform="rotate(-8 410 560)">
    <rect x="352" y="455" width="116" height="200" rx="18" fill="${INK}"/>
    <rect x="364" y="476" width="92" height="150" rx="6" fill="#FFFFFF"/>
    <rect x="364" y="476" width="92" height="150" rx="6" fill="${RED}" opacity="0.12"/>
    <rect x="372" y="496" width="66" height="34" rx="12" fill="#E4E4E4"/><text x="380" y="522" font-family="M" font-weight="800" font-size="24" fill="${INK}">ok.</text>
  </g>
  ${bone("M352 560 L332 545 M352 575 L330 572 M352 590 L334 598", 9)}
  ${bone("M468 560 L488 545 M468 575 L490 572 M468 590 L486 598", 9)}
  <g transform="rotate(14 410 220)">
    <path d="M300 160 C300 40 520 40 520 160 C520 215 505 240 490 252 L490 292 C490 312 470 322 450 322 L370 322 C350 322 330 312 330 292 L330 252 C315 240 300 215 300 160 Z" fill="${CARD}" stroke="${INK}" stroke-width="12"/>
    <ellipse cx="366" cy="182" rx="32" ry="36" fill="${INK}"/><ellipse cx="456" cy="182" rx="32" ry="36" fill="${INK}"/>
    <circle cx="374" cy="194" r="7" fill="${CARD}"/><circle cx="448" cy="194" r="7" fill="${CARD}"/>
    <path d="M411 222 L395 256 L427 256 Z" fill="${INK}"/>
    <path d="M345 286 L475 286" stroke="${INK}" stroke-width="6"/>${teeth}
  </g>
  <path d="M520 655 L520 760" stroke="${INK}" stroke-width="3"/>
  <ellipse cx="520" cy="772" rx="11" ry="14" fill="${INK}"/>
  <path d="M509 766 L492 758 M509 776 L492 784 M531 766 L548 758 M531 776 L548 784" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
</svg>`;
}

export function scribbleHead() {
  // a tangled thought: a deterministic loop of summed sines inside the skull area
  let d = "", d2 = "";
  for (let i = 0; i <= 900; i++) {
    const t = i / 900 * Math.PI * 22;
    const x = 470 + 120 * Math.sin(t * 1.0) * Math.cos(t * 0.13) + 40 * Math.sin(t * 2.7);
    const y = 400 + 100 * Math.cos(t * 1.17) * Math.sin(t * 0.21 + 1) + 35 * Math.cos(t * 3.1);
    d += (i ? " L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    if (i % 3 === 0) d2 += (d2 ? " L" : "M") + (x + 6 * Math.sin(t * 5)).toFixed(1) + " " + (y + 6 * Math.cos(t * 4)).toFixed(1);
  }
  return `<svg viewBox="0 0 860 940" xmlns="http://www.w3.org/2000/svg">
  <path d="M250 900 L250 720 C190 660 165 575 175 480 C190 300 320 165 485 165 C650 165 740 290 728 420 L770 520 L734 542 L744 584 L728 604 L736 646 C728 690 686 700 646 690 L606 684 L606 900 Z"
    fill="${CARD}" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/>
  <path d="${d2}" fill="none" stroke="${INK}" stroke-width="3.5" opacity="0.8"/>
  <path d="${d}" fill="none" stroke="${RED}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M590 300 C640 210 700 160 790 90" fill="none" stroke="${RED}" stroke-width="6" stroke-linecap="round"/>
  <path d="M640 430 C650 420 668 420 676 434" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
</svg>`;
}

export function ghost() {
  return `<svg viewBox="0 0 800 900" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="420" cy="868" rx="230" ry="26" fill="${INK}" opacity="0.18"/>
  <path d="M215 820 C215 520 230 190 420 190 C610 190 625 520 625 820 C600 790 580 790 560 830 C535 795 505 795 485 840 C460 800 430 800 410 838 C385 800 352 800 332 836 C305 795 270 792 250 830 C238 812 228 808 215 820 Z"
    fill="${CARD}" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/>
  <path d="M290 460 C300 560 300 680 290 790 M545 470 C540 580 545 690 555 790" fill="none" stroke="${INK}" stroke-width="5" opacity="0.25"/>
  <ellipse cx="355" cy="390" rx="40" ry="62" fill="${INK}"/><ellipse cx="490" cy="390" rx="40" ry="62" fill="${INK}"/>
  <ellipse cx="366" cy="372" rx="11" ry="16" fill="${CARD}"/><ellipse cx="500" cy="372" rx="11" ry="16" fill="${CARD}"/>
  <ellipse cx="425" cy="510" rx="26" ry="34" fill="${INK}"/>
  <path d="M235 560 C170 600 150 660 180 700" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <path d="M605 560 C670 590 700 560 720 520" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
</svg>`;
}
