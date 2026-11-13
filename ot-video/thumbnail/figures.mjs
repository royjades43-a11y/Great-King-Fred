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
