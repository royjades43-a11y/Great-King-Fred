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

const HEART = (s = 1, x = 0, y = 0) => `M${x} ${y + 190 * s} C${x - 150 * s} ${y + 90 * s} ${x - 220 * s} ${y + 10 * s} ${x - 220 * s} ${y - 80 * s} C${x - 220 * s} ${y - 150 * s} ${x - 170 * s} ${y - 190 * s} ${x - 110 * s} ${y - 190 * s} C${x - 60 * s} ${y - 190 * s} ${x - 20 * s} ${y - 160 * s} ${x} ${y - 120 * s} C${x + 20 * s} ${y - 160 * s} ${x + 60 * s} ${y - 190 * s} ${x + 110 * s} ${y - 190 * s} C${x + 170 * s} ${y - 190 * s} ${x + 220 * s} ${y - 150 * s} ${x + 220 * s} ${y - 80 * s} C${x + 220 * s} ${y + 10 * s} ${x + 150 * s} ${y + 90 * s} ${x} ${y + 190 * s} Z`;

// 11 · a puppet on red strings, forcing a smile
export function marionette() {
  const S = (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${RED}" stroke-width="4"/>`;
  const limb = (d) => bone(d, 30);
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  ${S(230, 62, 225, 430)}${S(570, 62, 590, 420)}${S(400, 150, 400, 228)}${S(300, 62, 340, 800)}${S(500, 62, 470, 790)}
  <rect x="210" y="46" width="380" height="32" rx="12" fill="${CARD}" stroke="${INK}" stroke-width="9"/>
  <rect x="383" y="10" width="34" height="150" rx="12" fill="${CARD}" stroke="${INK}" stroke-width="9"/>
  ${limb("M360 640 L340 800 L330 935")}${limb("M440 640 L470 790 L485 935")}
  <ellipse cx="318" cy="945" rx="42" ry="20" fill="${INK}"/><ellipse cx="500" cy="945" rx="42" ry="20" fill="${INK}"/>
  ${limb("M335 455 L262 525 L225 430")}${limb("M465 455 L545 512 L590 420")}
  <rect x="318" y="420" width="164" height="230" rx="44" fill="${CARD}" stroke="${INK}" stroke-width="12"/>
  <path d="M330 520 L470 520" stroke="${RED}" stroke-width="10"/>
  ${knob(262, 525, 18)}${knob(545, 512, 18)}${knob(340, 800, 18)}${knob(470, 790, 18)}
  <circle cx="225" cy="430" r="26" fill="${CARD}" stroke="${INK}" stroke-width="8"/><circle cx="590" cy="420" r="26" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
  <rect x="385" y="395" width="30" height="40" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
  <circle cx="400" cy="320" r="100" fill="${CARD}" stroke="${INK}" stroke-width="12"/>
  <path d="M336 282 L382 264 M464 282 L418 264" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="365" cy="310" rx="12" ry="16" fill="${INK}"/><ellipse cx="435" cy="310" rx="12" ry="16" fill="${INK}"/>
  <path d="M335 345 C360 410 440 410 465 345 Z" fill="${INK}"/>
  <path d="M352 352 L448 352 L440 366 L360 366 Z" fill="#FFFFFF"/>
  <path d="M512 250 C500 275 498 290 512 298 C526 290 524 275 512 250 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="5"/>
</svg>`;
}

// 10 · a heart on a fishhook, stitched up from the last time
export function hookedHeart() {
  let stitches = "";
  for (let i = 0; i < 5; i++) { const x = 330 + i * 32, y = 430 + i * 30; stitches += `<path d="M${x - 14} ${y + 16} L${x + 14} ${y - 16}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`; }
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <path d="M400 0 L400 330" stroke="${INK}" stroke-width="5"/>
  <path d="M400 330 L400 700" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
  <path d="${HEART(1.25, 400, 500)}" fill="${RED}" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>
  <path d="M318 448 C360 470 420 540 472 560" fill="none" stroke="${INK}" stroke-width="5" stroke-dasharray="2 0"/>
  ${stitches}
  <path d="M400 700 C400 860 210 870 205 700" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
  <path d="M205 700 L205 640 L245 690" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
  <ellipse cx="300" cy="360" rx="34" ry="18" fill="#FFFFFF" opacity="0.5" transform="rotate(-30 300 360)"/>
  <circle cx="400" cy="330" r="16" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
</svg>`;
}

// 09 · a heart skydiving, parachute still in the pack
export function fallingHeart() {
  let lines = "";
  for (const [x, l] of [[250, 170], [330, 240], [420, 200], [500, 150]]) lines += `<path d="M${x} ${40} L${x} ${40 + l}" stroke="${INK}" stroke-width="8" stroke-linecap="round" opacity="0.55"/>`;
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  ${lines}
  <g transform="rotate(-14 400 560)">
    <rect x="300" y="235" width="200" height="120" rx="26" fill="${CARD}" stroke="${INK}" stroke-width="10"/>
    <path d="M330 275 L470 275" stroke="${INK}" stroke-width="6"/>
    <path d="M480 340 C540 380 560 430 540 470" fill="none" stroke="${RED}" stroke-width="6"/><circle cx="540" cy="475" r="13" fill="${RED}" stroke="${INK}" stroke-width="5"/>
    <path d="M215 560 C150 520 120 470 130 420" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M585 560 C650 520 680 470 670 420" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="M330 760 C310 820 290 860 250 880 M470 760 C490 820 520 850 560 860" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
    <path d="${HEART(1.3, 400, 600)}" fill="${RED}" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>
    <path d="M330 560 C345 540 365 540 380 560 M420 560 C435 540 455 540 470 560" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="400" cy="635" rx="34" ry="40" fill="${INK}"/>
    <ellipse cx="315" cy="610" rx="24" ry="13" fill="#FFFFFF" opacity="0.35"/><ellipse cx="485" cy="610" rx="24" ry="13" fill="#FFFFFF" opacity="0.35"/>
  </g>
  <path d="M600 900 C600 860 640 845 670 865 C690 830 750 840 750 880 C780 885 780 920 750 922 L610 922 C585 920 585 900 600 900 Z" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
</svg>`;
}

// 08 · a nervous phone, a thumb hovering over Send
export function nervousPhone() {
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <rect x="190" y="80" width="420" height="820" rx="60" fill="${INK}"/>
  <rect x="216" y="130" width="368" height="700" rx="18" fill="#FFFFFF"/>
  <rect x="350" y="98" width="100" height="14" rx="7" fill="#333"/>
  <path d="M290 348 L350 326 M510 348 L450 326" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  <circle cx="330" cy="390" r="22" fill="${INK}"/><circle cx="470" cy="390" r="22" fill="${INK}"/>
  <path d="M320 500 C345 480 370 520 400 500 C430 480 455 520 480 500" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  <path d="M560 260 C545 290 543 308 560 318 C577 308 575 290 560 260 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="6"/>
  <path d="M248 300 C238 322 237 336 248 343 C259 336 258 322 248 300 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="6"/>
  <rect x="236" y="600" width="230" height="70" rx="35" fill="#E6E9E4" stroke="${INK}" stroke-width="5"/>
  <circle cx="300" cy="635" r="11" fill="${INK}"/><circle cx="350" cy="635" r="11" fill="${INK}"/><circle cx="400" cy="635" r="11" fill="${INK}"/>
  <rect x="440" y="740" width="124" height="60" rx="30" fill="${RED}"/>
  <text x="502" y="781" text-anchor="middle" font-family="M" font-weight="800" font-size="30" fill="#FFFFFF">Send</text>
  <path d="M800 980 L640 840 C610 812 618 770 655 772 C680 774 690 790 705 805 L800 880 Z" fill="#F3D9C4" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
  <path d="M640 800 C650 790 668 792 674 806" fill="none" stroke="${INK}" stroke-width="6"/>
  <path d="M600 770 L580 750 M610 740 L600 712 M640 735 L645 705" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
</svg>`;
}

// 07 · two skeletons holding hands: still together
export function skeletonCouple() {
  const torso = (cx, tilt, side) => {
    let ribs = "", spine = "";
    for (let i = 0; i < 5; i++) {
      const y = 445 + i * 44, w = 130 - i * 12, d = 55 - i * 4;
      ribs += bone(`M${cx} ${y} C ${cx - w * 0.5} ${y - 22} ${cx - w} ${y - 4} ${cx - w + 6} ${y + d}`, 14);
      ribs += bone(`M${cx} ${y} C ${cx + w * 0.5} ${y - 22} ${cx + w} ${y - 4} ${cx + w - 6} ${y + d}`, 14);
    }
    for (let y = 330; y <= 690; y += 30) spine += `<rect x="${cx - 16}" y="${y}" width="32" height="22" rx="8" fill="${CARD}" stroke="${INK}" stroke-width="6"/>`;
    const o = -side, i = side; // outer and inner directions
    let teeth = "";
    for (let x = cx - 48; x <= cx + 48; x += 19) teeth += `<path d="M${x} 270 L${x} 300" stroke="${INK}" stroke-width="5"/>`;
    return `${spine}${bone(`M${cx - 135} 405 C${cx - 70} 385 ${cx + 70} 385 ${cx + 135} 405`, 18)}${ribs}
      <path d="M${cx - 80} 730 C${cx - 85} 680 ${cx + 85} 680 ${cx + 80} 730 C${cx + 80} 780 ${cx + 30} 785 ${cx} 762 C${cx - 30} 785 ${cx - 80} 780 ${cx - 80} 730 Z" fill="${CARD}" stroke="${INK}" stroke-width="10"/>
      ${bone(`M${cx + o * 135} 410 L${cx + o * 165} 610 L${cx + o * 140} 760`, 26)}
      ${bone(`M${cx + i * 135} 410 L${cx + i * 160} 610 L${550 - side * 10} 690`, 26)}
      ${knob(cx + o * 135, 410, 22)}${knob(cx + i * 135, 410, 22)}${knob(cx + o * 165, 610, 20)}${knob(cx + i * 160, 610, 20)}
      <g transform="rotate(${tilt} ${cx} 220)">
        <path d="M${cx - 110} 160 C${cx - 110} 40 ${cx + 110} 40 ${cx + 110} 160 C${cx + 110} 215 ${cx + 95} 240 ${cx + 80} 252 L${cx + 80} 292 C${cx + 80} 312 ${cx + 60} 322 ${cx + 40} 322 L${cx - 40} 322 C${cx - 60} 322 ${cx - 80} 312 ${cx - 80} 292 L${cx - 80} 252 C${cx - 95} 240 ${cx - 110} 215 ${cx - 110} 160 Z" fill="${CARD}" stroke="${INK}" stroke-width="12"/>
        <ellipse cx="${cx - 44}" cy="182" rx="30" ry="34" fill="${INK}"/><ellipse cx="${cx + 46}" cy="182" rx="30" ry="34" fill="${INK}"/>
        <path d="M${cx + 1} 222 L${cx - 15} 256 L${cx + 17} 256 Z" fill="${INK}"/>
        <path d="M${cx - 65} 286 L${cx + 65} 286" stroke="${INK}" stroke-width="6"/>${teeth}
      </g>`;
  };
  return `<svg viewBox="0 0 1100 1000" xmlns="http://www.w3.org/2000/svg">
  ${torso(300, 12, 1)}
  ${torso(800, -12, -1)}
  <circle cx="550" cy="690" r="34" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
  <path d="${HEART(0.42, 550, 130)}" fill="${RED}" stroke="${INK}" stroke-width="9"/>
</svg>`;
}

// 06 · up to the nose in water, thumbs up, ignoring the lifebuoy right beside them
export function imFine() {
  const wave = (y, a = 26) => `M-1400 ${y} C -1330 ${y - a} -1270 ${y + a} -1200 ${y} S -1070 ${y - a} -1000 ${y} S -870 ${y + a} -800 ${y} S -670 ${y - a} -600 ${y} S -470 ${y + a} -400 ${y} S -270 ${y - a} -200 ${y} S -70 ${y + a} 0 ${y} C 70 ${y - a} 130 ${y + a} 200 ${y} S 330 ${y - a} 400 ${y} S 530 ${y + a} 600 ${y} S 730 ${y - a} 800 ${y} S 930 ${y + a} 1000 ${y}`;
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wf" gradientUnits="userSpaceOnUse" x1="0" x2="1000" y1="0" y2="0"><stop offset="0" stop-color="#DCE6D8" stop-opacity="0"/><stop offset="0.16" stop-color="#DCE6D8"/><stop offset="1" stop-color="#DCE6D8"/></linearGradient>
    <linearGradient id="ws" gradientUnits="userSpaceOnUse" x1="0" x2="1000" y1="0" y2="0"><stop offset="0" stop-color="${INK}" stop-opacity="0"/><stop offset="0.16" stop-color="${INK}"/><stop offset="1" stop-color="${INK}"/></linearGradient>
    <linearGradient id="wv" x1="0" x2="0" y1="0" y2="1"><stop offset="0.6" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <mask id="wm"><rect x="0" y="0" width="800" height="1000" fill="url(#wv)"/></mask>
  </defs>
  <circle cx="420" cy="520" r="150" fill="${CARD}" stroke="${INK}" stroke-width="13"/>
  <path d="M335 432 L392 412 M505 432 L448 412" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
  <circle cx="372" cy="476" r="25" fill="${INK}"/><circle cx="468" cy="476" r="25" fill="${INK}"/>
  <circle cx="380" cy="467" r="8" fill="${CARD}"/><circle cx="476" cy="467" r="8" fill="${CARD}"/>
  <path d="M585 380 C571 410 569 428 585 437 C601 428 599 410 585 380 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="6"/>
  <path d="M640 640 C650 540 664 420 672 300" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
  <rect x="632" y="226" width="92" height="78" rx="24" fill="${CARD}" stroke="${INK}" stroke-width="10"/>
  <path d="M652 230 C648 192 654 150 674 144 C694 140 698 168 688 230" fill="${CARD}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
  <path d="M662 252 L716 252 M662 276 L716 276" stroke="${INK}" stroke-width="5"/>
  <g>
    <path d="${wave(570)} L1000 1200 L-1400 1200 Z" fill="#DCE6D8"/>
    <path d="${wave(680, 18)}" fill="none" stroke="${INK}" stroke-width="5" opacity="0.35"/>
    <path d="${wave(790, 14)}" fill="none" stroke="${INK}" stroke-width="5" opacity="0.25"/>
  </g>
  <path d="${wave(570)}" fill="none" stroke="${INK}" stroke-width="11"/>
  <circle cx="318" cy="552" r="11" fill="none" stroke="${INK}" stroke-width="4"/><circle cx="290" cy="524" r="7" fill="none" stroke="${INK}" stroke-width="4"/>
  <g transform="rotate(-12 175 590)">
    <circle cx="175" cy="590" r="72" fill="none" stroke="${INK}" stroke-width="60"/>
    <circle cx="175" cy="590" r="72" fill="none" stroke="#FFFFFF" stroke-width="44"/>
    <circle cx="175" cy="590" r="72" fill="none" stroke="${RED}" stroke-width="44" stroke-dasharray="56.5 56.5"/>
  </g>
</svg>`;
}

// Short 04 · a sneaky doorway swallowing someone's thought
export function sneakyDoor() {
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <path d="M60 960 L740 960" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <rect x="200" y="120" width="400" height="840" fill="#2A2F29"/>
  <path d="M170 960 L170 100 L630 100 L630 960" fill="none" stroke="${INK}" stroke-width="26" stroke-linejoin="round"/>
  <path d="M190 110 L360 170 L360 900 L190 950 Z" fill="${CARD}" stroke="${INK}" stroke-width="16" stroke-linejoin="round"/>
  <rect x="318" y="520" width="20" height="56" rx="10" fill="${RED}"/>
  <ellipse cx="240" cy="360" rx="20" ry="28" fill="${INK}"/><ellipse cx="310" cy="380" rx="20" ry="28" fill="${INK}"/>
  <circle cx="248" cy="352" r="6" fill="${CARD}"/><circle cx="318" cy="372" r="6" fill="${CARD}"/>
  <path d="M215 318 L262 330 M290 336 L336 352" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <path d="M222 450 C250 490 300 500 340 470" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
  <g transform="translate(720 640)">
    <path d="M-150 30 Q-176 26 -172 2 Q-176 -24 -146 -26 Q-140 -54 -104 -50 Q-80 -68 -54 -50 Q-20 -54 -16 -24 Q6 -12 -6 14 Q0 42 -30 42 Q-42 62 -74 52 Q-100 66 -120 48 Q-148 54 -150 30 Z"
      transform="scale(1.6)" fill="#FFFFFF" stroke="${INK}" stroke-width="7"/>
    <path d="M-160 50 L-150 100 L-130 90 L-150 140" fill="none" stroke="${INK}" stroke-width="0"/>
    <g transform="translate(-140 -10)">
      <path d="M-34 -30 L34 -30 L28 34 Q26 44 16 44 L-16 44 Q-26 44 -28 34 Z" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
      <path d="M34 -14 C56 -14 56 22 30 22" fill="none" stroke="${INK}" stroke-width="8"/>
      <path d="M-14 -46 C-20 -60 -6 -66 -12 -80 M8 -46 C2 -60 16 -66 10 -80" fill="none" stroke="${RED}" stroke-width="6" stroke-linecap="round"/>
    </g>
  </g>
  <circle cx="110" cy="760" r="20" fill="#FFFFFF" stroke="${INK}" stroke-width="6"/>
  <circle cx="60" cy="820" r="12" fill="#FFFFFF" stroke="${INK}" stroke-width="6"/>
</svg>`;
}

// Short 05 · a cheeky tickle robot with a feather
export function tickleRobot() {
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="380" cy="955" rx="230" ry="24" fill="${INK}" opacity="0.18"/>
  <path d="M380 150 L380 90" stroke="${INK}" stroke-width="14" stroke-linecap="round"/>
  <circle cx="380" cy="76" r="22" fill="${RED}" stroke="${INK}" stroke-width="9"/>
  <rect x="230" y="150" width="300" height="230" rx="46" fill="${CARD}" stroke="${INK}" stroke-width="14"/>
  <rect x="268" y="196" width="224" height="130" rx="30" fill="#2A2F29"/>
  <path d="M300 270 C312 238 344 238 356 270 M404 270 C416 238 448 238 460 270" fill="none" stroke="${CARD}" stroke-width="12" stroke-linecap="round"/>
  <path d="M330 300 C360 324 400 324 430 300" fill="none" stroke="${RED}" stroke-width="10" stroke-linecap="round"/>
  <rect x="350" y="380" width="60" height="34" fill="${CARD}" stroke="${INK}" stroke-width="10"/>
  <rect x="210" y="414" width="340" height="380" rx="40" fill="${CARD}" stroke="${INK}" stroke-width="14"/>
  <circle cx="300" cy="500" r="22" fill="${RED}" stroke="${INK}" stroke-width="7"/>
  <path d="M260 600 L500 600 M260 650 L450 650 M260 700 L480 700" stroke="${INK}" stroke-width="8" stroke-linecap="round" opacity="0.6"/>
  <path d="M215 470 C150 500 120 560 130 640" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
  <circle cx="132" cy="652" r="24" fill="${CARD}" stroke="${INK}" stroke-width="9"/>
  <path d="M545 470 C620 450 660 380 650 300" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/>
  <circle cx="650" cy="290" r="24" fill="${CARD}" stroke="${INK}" stroke-width="9"/>
  <g transform="rotate(28 660 230)">
    <path d="M660 300 L660 40" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
    <path d="M660 60 C620 90 610 160 620 230 C640 210 652 170 660 140 C668 170 680 210 700 230 C710 160 700 90 660 60 Z" fill="${RED}" stroke="${INK}" stroke-width="7"/>
    <path d="M660 100 L630 130 M660 140 L628 175 M660 100 L690 130 M660 140 L692 175" stroke="${INK}" stroke-width="4" opacity="0.6"/>
  </g>
  <rect x="250" y="794" width="90" height="120" rx="20" fill="${CARD}" stroke="${INK}" stroke-width="12"/>
  <rect x="420" y="794" width="90" height="120" rx="20" fill="${CARD}" stroke="${INK}" stroke-width="12"/>
  <path d="M230 920 L360 920 M400 920 L530 920" stroke="${INK}" stroke-width="18" stroke-linecap="round"/>
  <path d="M600 520 L640 500 M610 560 L656 560 M600 600 L640 620" stroke="${RED}" stroke-width="8" stroke-linecap="round"/>
</svg>`;
}

// Short 06 · a cheeky polar bear peeking out of a thought bubble
export function peekingBear() {
  const W = "#FFFFFF";
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <circle cx="250" cy="250" r="56" fill="${W}" stroke="${INK}" stroke-width="12"/><circle cx="250" cy="250" r="26" fill="#E8D9D2"/>
  <circle cx="550" cy="250" r="56" fill="${W}" stroke="${INK}" stroke-width="12"/><circle cx="550" cy="250" r="26" fill="#E8D9D2"/>
  <ellipse cx="400" cy="420" rx="230" ry="210" fill="${W}" stroke="${INK}" stroke-width="14"/>
  <ellipse cx="320" cy="390" rx="22" ry="30" fill="${INK}"/><ellipse cx="480" cy="390" rx="22" ry="30" fill="${INK}"/>
  <circle cx="328" cy="378" r="8" fill="${W}"/><circle cx="488" cy="378" r="8" fill="${W}"/>
  <path d="M292 336 C310 322 332 320 348 330 M452 318 C470 304 494 306 510 318" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <ellipse cx="400" cy="490" rx="84" ry="62" fill="#F4F0EA" stroke="${INK}" stroke-width="9"/>
  <ellipse cx="400" cy="465" rx="32" ry="22" fill="${INK}"/>
  <path d="M368 515 C392 532 420 530 446 504" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
  <path d="M90 700 C40 690 30 620 80 600 C70 540 140 510 190 540 C220 480 320 480 350 540 C380 500 470 500 490 550 C540 510 640 520 650 580 C720 570 760 640 720 690 C760 740 700 800 640 780 C610 840 500 840 470 800 C430 850 330 850 300 800 C250 840 150 830 140 780 C80 790 50 740 90 700 Z" fill="${CARD}" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>
  <ellipse cx="290" cy="600" rx="62" ry="40" fill="${W}" stroke="${INK}" stroke-width="12"/>
  <ellipse cx="510" cy="600" rx="62" ry="40" fill="${W}" stroke="${INK}" stroke-width="12"/>
  <circle cx="266" cy="588" r="8" fill="#E8D9D2"/><circle cx="290" cy="580" r="8" fill="#E8D9D2"/><circle cx="314" cy="588" r="8" fill="#E8D9D2"/><ellipse cx="290" cy="610" rx="16" ry="11" fill="#E8D9D2"/><circle cx="486" cy="588" r="8" fill="#E8D9D2"/><circle cx="510" cy="580" r="8" fill="#E8D9D2"/><circle cx="534" cy="588" r="8" fill="#E8D9D2"/><ellipse cx="510" cy="610" rx="16" ry="11" fill="#E8D9D2"/>
  <circle cx="170" cy="880" r="30" fill="${CARD}" stroke="${INK}" stroke-width="10"/>
  <circle cx="120" cy="950" r="18" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
</svg>`;
}

// Video 13 · A: someone chatting with a tiny copy of themselves sitting on their shoulder
export function shoulderTalk() {
  const eye = (x, y, r, dx) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/><circle cx="${x + dx}" cy="${y - r * 0.35}" r="${r * 0.32}" fill="${CARD}"/>`;
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <path d="M110 1000 C110 790 160 668 290 646 L660 646 C780 668 810 790 810 1000 Z" fill="${CARD}" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/>
  <path d="M410 646 C430 700 520 700 540 646" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <circle cx="480" cy="430" r="170" fill="${CARD}" stroke="${INK}" stroke-width="13"/>
  <path d="M372 338 L428 322 M500 326 L556 336" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  ${eye(402, 392, 26, -9)}${eye(524, 394, 26, -9)}
  <path d="M392 488 C410 470 470 470 486 488 C482 540 400 542 392 488 Z" fill="${INK}"/>
  <path d="M408 516 C424 504 452 504 468 516 C452 530 424 530 408 516 Z" fill="${RED}"/>
  <g transform="translate(216 652) scale(1.35) translate(-216 -652)">
  <path d="M196 652 L182 744 M238 652 L250 744" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
  <path d="M168 652 C168 590 182 562 216 560 C250 562 266 590 266 652 Z" fill="${CARD}" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
  <path d="M252 590 C282 572 300 548 304 516" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="306" cy="508" r="13" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
  <path d="M180 596 C160 612 156 632 168 646" fill="none" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="216" cy="500" r="62" fill="${CARD}" stroke="${INK}" stroke-width="10"/>
  <path d="M186 460 L210 456 M232 458 L254 466" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  ${eye(206, 486, 11, 4)}${eye(244, 490, 11, 4)}
  <path d="M214 520 C226 512 246 514 252 524 C246 542 220 540 214 520 Z" fill="${INK}"/>
</g>
</svg>`;
}

// Video 13 · B: a head in profile opened up like a room: an empty armchair and a switched-off microphone
export function quietRoomHead() {
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <path d="M560 1000 L560 790 C690 730 750 600 740 440 C728 240 585 110 400 110 C225 110 112 236 100 390 C96 448 86 482 62 528 C52 550 64 566 92 568 L108 570 C102 602 108 620 124 632 C108 648 114 668 130 676 C124 722 142 752 192 756 C244 760 292 752 300 796 L300 1000 Z" fill="${CARD}" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/>
  <path d="M168 408 C180 396 200 396 210 408" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <path d="M148 386 L196 374" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
  <rect x="252" y="214" width="440" height="350" rx="34" fill="#DCE6D8" stroke="${INK}" stroke-width="11"/>
  <path d="M262 492 L682 492" stroke="${INK}" stroke-width="7"/>
  <rect x="300" y="262" width="96" height="70" rx="6" fill="none" stroke="${INK}" stroke-width="6" opacity="0.55"/>
  <path d="M318 316 L340 292 L356 306 L370 288 L384 316" fill="none" stroke="${INK}" stroke-width="5" opacity="0.55" stroke-linejoin="round"/>
  <path d="M428 474 C424 400 430 360 470 356 L524 356 C564 360 570 400 566 474 Z" fill="${CARD}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
  <rect x="412" y="442" width="170" height="40" rx="18" fill="${CARD}" stroke="${INK}" stroke-width="9"/>
  <rect x="402" y="414" width="36" height="72" rx="18" fill="${CARD}" stroke="${INK}" stroke-width="9"/>
  <rect x="556" y="414" width="36" height="72" rx="18" fill="${CARD}" stroke="${INK}" stroke-width="9"/>
  <path d="M424 486 L418 506 M570 486 L576 506" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
  <path d="M640 492 L640 352 M616 492 L664 492" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <rect x="620" y="290" width="40" height="66" rx="20" fill="${CARD}" stroke="${INK}" stroke-width="8"/>
  <path d="M626 312 L654 312 M626 328 L654 328" stroke="${INK}" stroke-width="4"/>
  <path d="M600 284 L682 380" stroke="${RED}" stroke-width="13" stroke-linecap="round"/>
  <path d="M640 492 C620 520 560 516 520 520" fill="none" stroke="${INK}" stroke-width="5"/>
</svg>`;
}

// Video 13 · C: a nervous person pointing at a confident reflection in a mirror
export function mirrorPep() {
  const person = (s) => `
    <path d="M${s.x - 190} 1000 C${s.x - 190} 800 ${s.x - 150} 700 ${s.x - 60} 680 L${s.x + 60} 680 C${s.x + 150} 700 ${s.x + 190} 800 ${s.x + 190} 1000 Z" fill="${CARD}" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
    <circle cx="${s.x}" cy="510" r="140" fill="${CARD}" stroke="${INK}" stroke-width="12"/>
    ${s.face}
    <path d="M${s.x - 120} 740 C${s.x - 190} 720 ${s.x - 240} 680 ${s.x - 290} 640" fill="none" stroke="${INK}" stroke-width="24" stroke-linecap="round"/>
    <circle cx="${s.x - 300}" cy="632" r="24" fill="${CARD}" stroke="${INK}" stroke-width="10"/>
    <path d="M${s.x - 314} 622 L${s.x - 366} 590" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>`;
  const nervous = `
    <path d="M598 470 L640 454 M712 454 L752 470" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="624" cy="500" r="18" fill="${INK}"/><circle cx="726" cy="500" r="18" fill="${INK}"/>
    <path d="M630 582 C650 570 664 590 680 578 C696 566 708 586 724 576" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/>
    <path d="M790 420 C778 448 776 466 790 474 C804 466 802 448 790 420 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="6"/>`;
  const confident = `
    <path d="M592 446 L640 432 M710 432 L758 446" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M604 498 C614 482 640 482 648 498 M702 498 C712 482 738 482 746 498" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M614 556 C640 606 714 606 740 556 Z" fill="${INK}"/>`;
  return `<svg viewBox="0 0 900 1000" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="mir"><ellipse cx="260" cy="470" rx="196" ry="300"/></clipPath></defs>
  <path d="M150 760 L110 1000 M370 760 L410 1000" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  <ellipse cx="260" cy="470" rx="196" ry="300" fill="#C9D8C4"/>
  <g clip-path="url(#mir)"><g transform="translate(260 120) scale(-0.62 0.62) translate(-680 0)">${person({ x: 680, face: confident })}</g>
    <path d="M120 300 L230 190 M140 360 L280 220" stroke="#FFFFFF" stroke-width="14" stroke-linecap="round" opacity="0.6"/></g>
  <ellipse cx="260" cy="470" rx="196" ry="300" fill="none" stroke="${INK}" stroke-width="30"/>
  <ellipse cx="260" cy="470" rx="196" ry="300" fill="none" stroke="${CARD}" stroke-width="14"/>
  ${person({ x: 680, face: nervous })}
</svg>`;
}

// Video 14 · A: someone hiding inside a "TO DO" box, only the eyes peeking out
export function todoBox() {
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <circle cx="400" cy="440" r="150" fill="${CARD}" stroke="${INK}" stroke-width="13"/>
  <path d="M330 392 L380 374 M470 374 L520 392" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  <ellipse cx="352" cy="430" rx="22" ry="27" fill="${INK}"/><ellipse cx="448" cy="430" rx="22" ry="27" fill="${INK}"/>
  <circle cx="345" cy="420" r="7" fill="${CARD}"/><circle cx="441" cy="420" r="7" fill="${CARD}"/>
  <path d="M560 330 C546 362 544 382 560 392 C576 382 574 362 560 330 Z" fill="#FFFFFF" stroke="${INK}" stroke-width="7"/>
  <path d="M120 470 L680 470 L680 960 L120 960 Z" fill="#D9C7A3" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/>
  <path d="M120 470 L40 560 M680 470 L760 560" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
  <path d="M120 470 L40 560 L60 580 L140 492 Z M680 470 L760 560 L740 580 L660 492 Z" fill="#CBB58C" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
  <path d="M292 470 C292 448 316 444 322 466 M478 466 C484 444 508 448 508 470" fill="${CARD}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
  <g transform="rotate(-6 400 700)"><rect x="220" y="620" width="360" height="150" rx="14" fill="none" stroke="${RED}" stroke-width="12"/>
  <text x="400" y="730" text-anchor="middle" font-family="M" font-weight="800" font-size="104" fill="${RED}">TO DO</text></g>
  <path d="M170 900 L630 900" stroke="${INK}" stroke-width="6" opacity="0.35"/>
</svg>`;
}

// Video 14 · B: future you, older and fed up, holding the ketchup-and-soy-sauce drink
export function futureYou() {
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <path d="M150 1000 C150 800 200 690 320 670 L520 670 C640 690 690 800 690 1000 Z" fill="${CARD}" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/>
  <path d="M250 330 C230 200 330 140 420 150 C520 140 600 200 590 330 C620 300 640 250 610 200 C640 150 560 90 480 110 C440 70 360 80 330 120 C250 110 200 190 230 240 C200 270 220 320 250 330 Z" fill="#E3E3E3" stroke="${INK}" stroke-width="11" stroke-linejoin="round"/>
  <circle cx="420" cy="430" r="170" fill="${CARD}" stroke="${INK}" stroke-width="13"/>
  <circle cx="356" cy="440" r="44" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="486" cy="440" r="44" fill="none" stroke="${INK}" stroke-width="10"/>
  <path d="M400 440 L442 440" stroke="${INK}" stroke-width="10"/>
  <path d="M322 402 L392 418 M450 418 L520 402" stroke="${INK}" stroke-width="13" stroke-linecap="round"/>
  <circle cx="362" cy="448" r="12" fill="${INK}"/><circle cx="480" cy="448" r="12" fill="${INK}"/>
  <path d="M364 540 C392 518 450 518 478 540" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
  <path d="M290 500 L306 510 M550 500 L534 510 M386 340 L456 340" stroke="${INK}" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
  <path d="M460 650 L700 650 L670 950 L490 950 Z" fill="#6B4A2E"/>
  <path d="M440 560 L720 560 L680 960 L480 960 Z" fill="none" stroke="${INK}" stroke-width="13" stroke-linejoin="round"/>
  <path d="M452 650 L708 650" stroke="${INK}" stroke-width="7"/>
  <path d="M640 530 C620 500 660 480 640 450 M700 530 C680 500 720 480 700 450" fill="none" stroke="#6B8F3E" stroke-width="9" stroke-linecap="round"/>
  <path d="M440 760 C400 760 380 800 410 830 L470 830" fill="${CARD}" stroke="${INK}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

// Video 14 · C: a wall calendar where every day is Monday, and someone asleep under it
export function allMondays() {
  let cells = "";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
    const x = 150 + c * 135, y = 250 + r * 95;
    cells += `<rect x="${x}" y="${y}" width="125" height="85" rx="8" fill="#FFFFFF" stroke="${INK}" stroke-width="5"/>`
      + `<text x="${x + 62}" y="${y + 58}" text-anchor="middle" font-family="M" font-weight="800" font-size="34" fill="${RED}">MON</text>`;
  }
  return `<svg viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <rect x="120" y="140" width="600" height="520" rx="22" fill="${CARD}" stroke="${INK}" stroke-width="13"/>
  <rect x="120" y="140" width="600" height="90" rx="22" fill="${RED}" stroke="${INK}" stroke-width="13"/>
  <path d="M230 110 L230 175 M610 110 L610 175" stroke="${INK}" stroke-width="16" stroke-linecap="round"/>
  ${cells}
  <path d="M40 980 L40 820 Q40 790 70 790 L760 790 Q790 790 790 820 L790 980" fill="${CARD}" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
  <ellipse cx="200" cy="790" rx="120" ry="46" fill="#FFFFFF" stroke="${INK}" stroke-width="10"/>
  <circle cx="230" cy="730" r="80" fill="${CARD}" stroke="${INK}" stroke-width="12"/>
  <path d="M196 728 C206 738 220 738 228 728 M250 722 C260 732 274 732 282 722" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  <path d="M232 770 C240 764 250 764 256 770" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>
  <path d="M260 810 C360 760 560 760 790 800 L790 900 L260 900 Z" fill="#DCE6D8" stroke="${INK}" stroke-width="12" stroke-linejoin="round"/>
  <path d="M330 690 L370 690 L330 730 L370 730 M390 640 L420 640 L390 670 L420 670" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}
