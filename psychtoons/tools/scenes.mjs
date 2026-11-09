// One entry per 2.5 s idea: the voiceover line, the 1–3 word title, the drawing and its motion.
// `p` is the scene's id prefix; every animated group is pop(`${p}-name`, `${p}-pop`, ...).
import {
  C, K, K3, g, pop, txt, man, cloud, ruler, armchair, books, door, blockArrow, thinArrow,
  heart, star, clockIcon, calIcon, phoneIcon, hourglass, frame, envelope, plant, wall, bands, shadow,
} from "./draw.mjs";

// standard pop-in: scale up from the bottom of the group with a little overshoot
const popIn = (sel, at, stagger = 0) =>
  `tl.fromTo(${JSON.stringify(sel)}, { opacity: 0, scale: 0.6, transformOrigin: "50% 100%" }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(2)", stagger: ${stagger} }, ${at});`;

export const SCENES = [
  /* 1 */ {
    id: "s01",
    title: "SHORTER YEARS",
    line: "Every year seems to go by faster than the last.",
    bg: () => wall(960, C.olive),
    body: (p) => `
      ${pop(`${p}-real`, `${p}-pop`, ruler(420, 370, 1080, 130, "REAL YEARS", 64))}
      ${pop(`${p}-felt`, `${p}-pop`, ruler(760, 215, 400, 110, "FELT YEARS", 52))}
      ${pop(`${p}-man`, `${p}-pop`, man({
        shirt: C.olive, face: "puzzled", arms: "out", hair: "tuft",
        behindArms: `<path d="M -112 -176 C -90 -90 -50 -250 -4 -160 C 40 -80 80 -250 112 -176" fill="none" stroke="${C.ink}" stroke-width="20" stroke-linecap="round"/>
          <path d="M -112 -176 C -90 -90 -50 -250 -4 -160 C 40 -80 80 -250 112 -176" fill="none" stroke="#E2B57A" stroke-width="12" stroke-linecap="round" stroke-dasharray="2 14"/>
          <path d="M -112 -176 C -90 -90 -50 -250 -4 -160 C 40 -80 80 -250 112 -176" fill="none" stroke="#E2B57A" stroke-width="9" stroke-linecap="round"/>`,
      }), 960, 985, 0.85)}
      ${pop(`${p}-think`, `${p}-pop`, cloud(1150, 640, 95, 75, 1030, 680, txt(1150, 644, "?", 96)))}
    `,
    anim: (p) => `
      ${popIn(`#${p}-real`, 0.15)}
      tl.fromTo("#${p}-felt", { opacity: 0, scaleX: 2.7, transformOrigin: "50% 50%" }, { opacity: 1, scaleX: 1, duration: 0.7, ease: "power3.inOut" }, 0.35);
      ${popIn(`#${p}-man`, 0.55)}
      ${popIn(`#${p}-think`, 1.0)}
      tl.fromTo("#${p}-think", { rotation: -4, transformOrigin: "50% 100%" }, { rotation: 4, immediateRender: false, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 3 }, 1.3);
    `,
  },

  /* 2 */ {
    id: "s02",
    title: "FEEL SETTLED",
    line: "You finally feel settled, like you've arrived.",
    bg: () => bands([[0, 230, C.paper], [230, 400, C.slate], [400, 540, C.paper], [540, 1080, C.olive]]) +
      // winding road: ink strokes first, then the cream fill on top
      [["M 180 1100 C 420 960 560 900 800 800", 200], ["M 800 800 C 1000 720 900 660 1180 620", 110], ["M 1180 620 C 1400 580 1300 560 1520 530 C 1640 512 1600 500 1760 490", 46]]
        .map(([d, w]) => `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w + 10}" stroke-linecap="round"/>`).join("") +
      [["M 180 1100 C 420 960 560 900 800 800", 200], ["M 800 800 C 1000 720 900 660 1180 620", 110], ["M 1180 620 C 1400 580 1300 560 1520 530 C 1640 512 1600 500 1760 490", 46]]
        .map(([d, w]) => `<path d="${d}" fill="none" stroke="#F3E9D1" stroke-width="${w}" stroke-linecap="round"/>`).join(""),
    body: (p) => {
      const stones = [[700, 990, 1.0], [1000, 800, 0.62], [860, 760, 0.5], [1180, 690, 0.42], [1060, 650, 0.36], [1330, 610, 0.3], [1260, 580, 0.26], [1470, 560, 0.22], [1580, 530, 0.19], [1660, 510, 0.16], [1740, 496, 0.13]];
      const stone = `<path d="M -40 0 L -40 -70 Q -40 -112 0 -112 Q 40 -112 40 -70 L 40 0 Z" fill="${C.stone}" ${K}/>
        <path d="M -52 0 l 10 -14 l 4 14 M 44 0 l 8 -12 l 4 12" fill="none" ${K3}/>
        <path d="M 52 -40 L 52 -230" fill="none" ${K}/>
        <path d="M 52 -230 L 150 -224 L 136 -196 L 150 -168 L 52 -172 Z" fill="${C.mustard}" ${K}/>`;
      return `
        ${stones.map(([x, y, s], i) => pop(`${p}-st${i}`, `${p}-stone`, stone, x, y, s)).join("")}
        ${pop(`${p}-man`, `${p}-pop`, man({ shirt: C.terra, face: "smile", arms: "shrug", hair: "tuft" }), 430, 960, 0.95)}
        ${pop(`${p}-think`, `${p}-pop`, cloud(560, 390, 140, 100, 470, 520, g(armchair(0.55), "translate(560 450)")))}
      `;
    },
    anim: (p) => `
      ${popIn(`#${p}-man`, 0.1)}
      ${popIn(`.${p}-stone`, 0.3, 0.07)}
      ${popIn(`#${p}-think`, 1.05)}
    `,
  },

  /* 3 */ {
    id: "s03",
    title: "MOVING OUT",
    line: "So you move out and build a life of your own.",
    bg: () => wall(960, C.paper2) +
      `<rect x="200" y="380" width="250" height="14" fill="${C.wood}" ${K}/>` + books(214, 380) +
      g(armchair(1.15), "translate(330 960)") +
      `<rect x="600" y="760" width="230" height="200" fill="${C.wood}" ${K}/><path d="M 600 860 L 830 860" ${K}/>` + books(612, 860, [C.olive, C.slate, C.terra, C.mustard]) +
      door(1520, 330, 240, 630),
    body: (p) => `
      ${pop(`${p}-arrow`, `${p}-pop`, blockArrow(1300, 380, 180, C.terra, 60))}
      ${pop(`${p}-dad`, `${p}-fam`, man({ shirt: C.terra, face: "sad", hair: "grandpa", arms: "reach" }), 1200, 960, 0.78)}
      ${pop(`${p}-mom`, `${p}-fam`, man({ shirt: C.olive, face: "sad", hair: "granny", arms: "down" }), 1420, 960, 0.78)}
      ${pop(`${p}-kid`, `${p}-fam`, man({ shirt: C.slateDk, face: "sad", hair: "kid", arms: "down" }), 1310, 960, 0.55)}
      ${pop(`${p}-man`, `${p}-pop`, man({
        shirt: C.mustard, face: "neutral", arms: "hold", hair: "quiff", look: -10,
        inHand: `<path d="M -110 -300 L -10 -310 L 0 -170 L -96 -160 Z" fill="${C.white}" ${K}/>`,
      }), 980, 960, 1.05)}
    `,
    anim: (p) => `
      ${popIn(`#${p}-man`, 0.1)}
      ${popIn(`.${p}-fam`, 0.35, 0.1)}
      tl.fromTo("#${p}-arrow", { opacity: 0, x: -120 }, { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }, 0.9);
      tl.to("#${p}-arrow", { x: 24, duration: 0.35, ease: "sine.inOut", yoyo: true, repeat: 1 }, 1.5);
    `,
  },

  /* 4 */ {
    id: "s04",
    title: "QUIETLY",
    line: "And the years drift by, quietly.",
    titleColor: C.ink,
    bg: () => bands([[0, 300, "#A9BCC5"], [300, 410, C.paper], [410, 560, C.olive], [560, 900, "#7F9BAE"], [900, 1080, C.olive]]) +
      `<path d="M 0 560 L 1920 560 M 0 900 L 1920 900" ${K}/>`,
    body: (p) => {
      const waves = [620, 700, 780, 850].map((y, i) =>
        `<path d="M ${-200 + i * 70} ${y} C ${200} ${y - 12} ${500} ${y + 12} ${900 + i * 40} ${y} C ${1200} ${y - 10} ${1500} ${y + 10} ${2100} ${y}" fill="none" stroke="#5F7C90" stroke-width="3"/>`).join("");
      const sitter = `
        <path d="M -40 -258 Q 0 -266 40 -258 L 52 -150 L -52 -150 Z" fill="${C.oliveDk}" ${K}/>
        <path d="M -6 -256 L 6 -256 L 10 -200 L 0 -186 L -10 -200 Z" fill="${C.ink}"/>
        <path d="M -24 -258 L 0 -236 L 24 -258" fill="none" ${K3}/>
        <path d="M 30 -160 L 150 -200 L 230 -150" fill="none" stroke="${C.ink}" stroke-width="30" stroke-linecap="round"/>
        <path d="M 30 -160 L 150 -200 L 230 -150" fill="none" stroke="${C.oliveDk}" stroke-width="22" stroke-linecap="round"/>
        <g transform="translate(-6 -330) rotate(-14)">
          <circle r="72" fill="url(#HEAD)" ${K}/>
          <path d="M -14 -70 Q -12 -98 4 -80 M 0 -72 Q 10 -100 22 -76" fill="none" ${K3}/>
          <path d="M -32 -4 Q -22 6 -12 -4 M 12 -4 Q 22 6 32 -4" fill="none" ${K3}/>
          <path d="M -14 26 Q 2 38 18 24" fill="none" ${K3}/>
        </g>
        <path d="M -38 -245 Q -110 -300 -70 -360 M 38 -245 Q 100 -310 50 -372" fill="none" ${K}/>`;
      const boat = `
        <path d="M -270 -40 L 270 -80 Q 262 20 180 50 L -190 50 Q -262 24 -270 -40 Z" fill="${C.terra}" ${K}/>
        <path d="M -262 -30 L 264 -68" fill="none" ${K3}/>
        <path d="M -230 10 Q 0 22 230 -6" fill="none" stroke="#8F4F31" stroke-width="3"/>
        <rect x="150" y="-82" width="90" height="22" fill="${C.mustard}" ${K3}/>`;
      return `
        <g id="${p}-waves">${waves}</g>
        ${pop(`${p}-note`, `${p}-pop`, `<rect x="-110" y="-34" width="220" height="68" fill="#F7F1E2" ${K3}/>${txt(0, 4, "SO SMOOTH", 38)}`, 640, 830, 1, -6)}
        ${[[1220, 700], [540, 660], [1380, 820]].map(([x, y], i) => pop(`${p}-leaf${i}`, `${p}-leaf`, `<path d="M -16 0 Q 0 -14 16 0 Q 0 14 -16 0 Z" fill="${C.terra}" ${K3}/>`, x, y, 1, i * 40)).join("")}
        ${pop(`${p}-boat`, `${p}-pop`, g(sitter, "translate(-60 40)") + boat, 960, 720, 0.95)}
      `;
    },
    anim: (p) => `
      ${popIn(`#${p}-boat`, 0.1)}
      ${popIn(`#${p}-note`, 0.5)}
      ${popIn(`.${p}-leaf`, 0.6, 0.12)}
      tl.fromTo("#${p}-boat", { y: 0, rotation: 0, transformOrigin: "50% 100%" }, { y: 10, rotation: 1.2, immediateRender: false, duration: 0.55, ease: "sine.inOut", yoyo: true, repeat: 3 }, 0.4);
      tl.fromTo("#${p}-waves", { x: 0 }, { x: -60, duration: 2.5, ease: "none" }, 0);
      tl.fromTo(".${p}-leaf", { x: 0 }, { x: -70, duration: 2.0, ease: "none" }, 0.5);
      tl.fromTo("#${p}-note", { x: 0, rotation: 0, transformOrigin: "50% 100%" }, { x: -40, rotation: 3, immediateRender: false, duration: 2.0, ease: "sine.inOut" }, 0.5);
    `,
  },

  /* 5 */ {
    id: "s05",
    title: "THE MATH",
    line: "But here's the math nobody does.",
    titleOnBoard: true,
    bg: () => `<rect width="1920" height="1080" fill="${C.paper}"/>
      <circle cx="120" cy="230" r="300" fill="${C.olive}" opacity="0.8"/>
      <circle cx="1820" cy="150" r="260" fill="${C.mustard}" opacity="0.8"/>
      <circle cx="160" cy="1000" r="300" fill="${C.terra}" opacity="0.85"/>
      <circle cx="1820" cy="980" r="280" fill="${C.mustard}" opacity="0.7"/>
      <ellipse cx="900" cy="1100" rx="330" ry="200" fill="${C.slate}" opacity="0.9"/>
      <rect x="0" y="960" width="1920" height="120" fill="${C.paper2}" opacity="0.7"/>
      <path d="M -10 960 L 1930 960" ${K3}/>`,
    body: (p) => `
      ${pop(`${p}-board`, `${p}-pop`, `
        <rect x="330" y="170" width="1140" height="660" fill="${C.wood}" ${K}/>
        <rect x="360" y="200" width="1080" height="600" fill="${C.board}" ${K3}/>
        <rect x="500" y="820" width="800" height="22" fill="${C.wood}" ${K3}/>
        <rect x="760" y="806" width="60" height="14" rx="4" fill="${C.white}" ${K3}/>
        <path d="M 600 340 L 1200 340" stroke="#EDE8DC" stroke-width="5" stroke-linecap="round"/>`)}
      <defs><clipPath id="${p}-eqclip"><rect id="${p}-eqrect" x="420" y="400" width="0" height="180"/></clipPath></defs>
      <g clip-path="url(#${p}-eqclip)">${txt(880, 492, "VISITS × YEARS = ?", 120, "#F3EFE6")}</g>
      ${pop(`${p}-doodle`, `${p}-pop`, `
        ${[[-60, 0.7], [0, 0.5], [60, 0.75]].map(([x, s]) => `
          <g transform="translate(${x} 0) scale(${s})" fill="none" stroke="#F3EFE6" stroke-width="4" stroke-linecap="round">
            <circle cx="0" cy="-130" r="24"/><path d="M 0 -106 L 0 -40 M 0 -40 L -16 0 M 0 -40 L 16 0 M -30 -86 L 30 -86"/></g>`).join("")}
        <path d="M -52 -78 L 56 -78" stroke="#F3EFE6" stroke-width="4"/>
        ${[[-30, -180], [10, -200], [44, -176]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M 0 8 C -16 -4 -12 -16 0 -9 C 12 -16 16 -4 0 8 Z" fill="none" stroke="#F3EFE6" stroke-width="3"/>`).join("")}`, 1260, 760, 1)}
      ${pop(`${p}-man`, `${p}-pop`, man({
        coat: "#E7E1CF", face: "thinking", arms: "chin", look: -6,
        inHand: `<rect x="58" y="-160" width="34" height="12" rx="4" fill="${C.white}" ${K3} transform="rotate(-30 66 -138)"/>`,
      }), 1600, 1000, 0.95)}
    `,
    anim: (p) => `
      ${popIn(`#${p}-board`, 0.0)}
      tl.fromTo("#${p}-eqrect", { attr: { width: 0 } }, { attr: { width: 960 }, duration: 0.9, ease: "power1.inOut" }, 0.55);
      ${popIn(`#${p}-man`, 0.3)}
      ${popIn(`#${p}-doodle`, 1.5)}
    `,
  },

  /* 6 */ {
    id: "s06",
    title: "TWICE A YEAR",
    line: "Say you see your parents twice a year.",
    bg: () => wall(900, C.wood, { planks: true }),
    body: (p) => {
      const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      let tiles = "";
      months.forEach((m, i) => {
        const cx = 330 + (i % 4) * 250, cy = 290 + Math.floor(i / 4) * 190;
        let dots = "";
        for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++)
          dots += `<rect x="${cx - 90 + c * 37}" y="${cy + 6 + r * 30}" width="28" height="22" fill="${C.paper2}" ${K3}/>`;
        tiles += pop(`${p}-m${i}`, `${p}-tile`, `
          <rect x="${cx - 104}" y="${cy - 60}" width="208" height="170" fill="${C.white}" ${K}/>
          <rect x="${cx - 104}" y="${cy - 60}" width="208" height="54" fill="${i % 2 ? C.olive : C.slate}" ${K3}/>
          ${txt(cx, cy - 30, m, 40)}${dots}`);
      });
      return `
        <rect x="190" y="200" width="1000" height="600" fill="${C.paper2}" ${K} opacity="0.0"/>
        ${tiles}
        ${pop(`${p}-h1`, `${p}-heart`, `<circle r="52" fill="none" stroke="${C.terra}" stroke-width="7"/>` + heart(0, 4, 1.05, C.terra), 330 + 1 * 250, 290 + 1 * 190 + 50)}
        ${pop(`${p}-h2`, `${p}-heart`, `<circle r="52" fill="none" stroke="${C.terra}" stroke-width="7"/>` + heart(0, 4, 1.05, C.terra), 330 + 3 * 250, 290 + 2 * 190 + 50)}
        ${pop(`${p}-man`, `${p}-pop`, man({ shirt: C.slateDk, face: "smile", arms: "pointL", hair: "tuft", look: -8 }), 1500, 920, 1.0)}
        ${pop(`${p}-tag`, `${p}-pop`, txt(1500, 380, "×2", 120, C.terra))}
      `;
    },
    anim: (p) => `
      ${popIn(`.${p}-tile`, 0.05, 0.04)}
      ${popIn(`#${p}-man`, 0.3)}
      tl.fromTo(".${p}-heart", { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(3)", stagger: 0.35 }, 1.0);
      ${popIn(`#${p}-tag`, 1.6)}
    `,
  },

  /* 7 */ {
    id: "s07",
    title: "ABOUT 40 LEFT",
    line: "With twenty years left, that's about forty visits.",
    bg: () => wall(900, C.olive),
    body: (p) => {
      let hearts = "";
      for (let i = 0; i < 40; i++) {
        const x = 330 + (i % 10) * 96, y = 330 + Math.floor(i / 10) * 110;
        hearts += pop(`${p}-v${i}`, `${p}-v`, heart(0, 0, 1.0, i % 3 === 0 ? C.terra : i % 3 === 1 ? C.mustard : C.olive), x, y);
      }
      return `
        <rect x="250" y="250" width="1000" height="490" fill="${C.white}" ${K}/>
        <circle cx="750" cy="250" r="9" fill="${C.slateDk}" ${K3}/>
        ${hearts}
        ${txt(750, 790, "20 YEARS  ×  2 VISITS  =  40", 56)}
        ${pop(`${p}-man`, `${p}-pop`, man({ shirt: C.mustard, face: "shocked", arms: "cheeks", hair: "tuft" }), 1540, 920, 1.0)}
      `;
    },
    anim: (p) => `
      tl.fromTo(".${p}-v", { opacity: 0, scale: 0, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.18, ease: "back.out(3)", stagger: 0.03 }, 0.15);
      ${popIn(`#${p}-man`, 1.25)}
      tl.fromTo("#${p}-man", { x: 0 }, { x: 6, duration: 0.06, ease: "none", yoyo: true, repeat: 7 }, 1.6);
    `,
  },

  /* 8 */ {
    id: "s08",
    title: "ALREADY SPENT",
    line: "Most of your time with them is already behind you.",
    bg: () => wall(940, C.paper2),
    body: (p) => {
      let cells = "";
      const cols = 8, rows = 5;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const x = 560 + c * 100, y = 300 + r * 100;
          const left = i >= 34;
          cells += `<rect id="${p}-c${i}" class="${left ? `${p}-left` : `${p}-used`}" x="${x}" y="${y}" width="100" height="100" fill="${C.paper2}" ${K3}/>`;
        }
      return `
        <rect x="540" y="210" width="840" height="610" fill="${C.paper2}" ${K}/>
        <rect x="540" y="210" width="840" height="80" fill="${C.olive}" ${K}/>
        ${txt(960, 252, "OUR VISITS", 48)}
        ${cells}
        ${pop(`${p}-few`, `${p}-pop`, txt(1580, 340, "FEW LEFT", 52) + thinArrow(1520, 370, 1260, 720, -80))}
        ${door(1580, 430, 200, 510, { open: true })}
        ${pop(`${p}-chg`, `${p}-pop`, `<rect x="1590" y="560" width="70" height="200" fill="${C.wood}"/>` + txt(1626, 660, "CHANGE", 40, C.ink, "middle", `transform="rotate(90 1626 660)"`))}
        ${pop(`${p}-man`, `${p}-pop`, man({ shirt: C.olive, face: "worried", arms: "cheeks", hair: "quiff", sweat: true }), 330, 960, 1.0)}
      `;
    },
    anim: (p) => `
      ${popIn(`#${p}-man`, 0.1)}
      tl.fromTo(".${p}-used", { attr: { fill: "${C.paper2}" } }, { attr: { fill: "${C.terra}" }, duration: 0.1, ease: "none", stagger: 0.028 }, 0.25);
      ${popIn(`#${p}-few`, 1.35)}
      ${popIn(`#${p}-chg`, 1.6)}
      tl.fromTo(".${p}-left", { attr: { fill: "${C.paper2}" } }, { attr: { fill: "#FFF6DD" }, duration: 0.25, ease: "sine.inOut", yoyo: true, repeat: 1 }, 1.5);
    `,
  },

  /* 9 */ {
    id: "s09",
    title: "WASTED TIME",
    line: "Waiting for the 'right moment' just pours it away.",
    bg: () => wall(1000, C.paper2, { line: false }),
    body: (p) => {
      let grains = "";
      for (let i = 0; i < 14; i++) grains += `<circle class="${p}-grain" cx="${1222 + (i % 3) * 6}" cy="590" r="4" fill="#B8925A"/>`;
      const brain = `
        <path d="M -40 -10 L -50 120 M 40 -10 L 52 120" fill="none" ${K}/>
        <ellipse cx="-56" cy="124" rx="20" ry="8" fill="${C.brain}" ${K3}/><ellipse cx="58" cy="124" rx="20" ry="8" fill="${C.brain}" ${K3}/>
        <path d="M -110 -60 Q -130 -160 -40 -170 Q 0 -210 50 -170 Q 140 -160 120 -60 Q 130 10 40 10 Q 0 30 -40 10 Q -130 10 -110 -60 Z" fill="${C.brain}" ${K}/>
        <path d="M -80 -110 q 20 -20 40 0 q 20 20 40 0 M -70 -40 q 30 -24 60 0 M 30 -130 q 30 -10 50 20 M 40 -50 q 20 -24 50 -6" fill="none" ${K3}/>
        <circle cx="-30" cy="-80" r="6" fill="${C.ink}"/><circle cx="20" cy="-82" r="6" fill="${C.ink}"/>
        <path d="M -40 -50 Q -6 -30 30 -54" fill="none" ${K3}/>
        <path d="M -100 -60 Q -150 -110 -120 -170 M 100 -60 Q 150 -110 120 -170" fill="none" ${K}/>`;
      return `
        ${pop(`${p}-man`, `${p}-pop`, man({ shirt: C.olive, face: "sad", arms: "write", legs: "none", noShadow: true }), 520, 905, 1.0)}
        <path d="M 160 760 L 1500 760 L 1560 830 L 100 830 Z" fill="${C.wood}" ${K}/>
        <path d="M 120 830 L 120 1000 M 1540 830 L 1540 1000" ${K}/>
        <path d="M 300 790 C 600 780 900 800 1300 785" fill="none" stroke="${C.woodDk}" stroke-width="3"/>
        <path d="M 360 760 L 520 740 L 680 760 L 520 778 Z" fill="${C.white}" ${K}/><path d="M 520 742 L 520 776" ${K3}/>
        ${books(200, 760, [C.terra, C.slateDk])}
        <rect x="760" y="700" width="160" height="60" fill="${C.white}" ${K3} transform="rotate(-4 840 730)"/>
        <rect x="700" y="770" width="190" height="40" fill="${C.white}" ${K3} transform="rotate(8 790 790)"/>
        ${txt(790, 790, "PERMISSION", 28, C.ink, "middle", `transform="rotate(8 790 790)"`)}<path d="M 712 772 L 880 812 M 712 808 L 880 772" stroke="${C.ink}" stroke-width="4" transform="rotate(8 790 790)"/>
        ${pop(`${p}-bucket`, `${p}-pop`, `<path d="M -110 -160 L 110 -160 L 90 0 L -90 0 Z" fill="${C.mustard}" ${K}/><ellipse cx="0" cy="-160" rx="110" ry="18" fill="#B8925A" ${K3}/>` + `<rect x="-80" y="-100" width="160" height="50" fill="${C.paper}" ${K3}/>` + txt(0, -74, "WASTED", 40), 1230, 780)}
        ${grains}
        ${pop(`${p}-brain`, `${p}-pop`, brain, 1480, 640, 0.95)}
        ${pop(`${p}-glass`, `${p}-pop`, hourglass(0.8), 1290, 480, 1, 0)}
        ${pop(`${p}-say`, `${p}-pop`, `<path d="M -140 -50 Q -150 -90 -100 -90 L 120 -90 Q 160 -90 150 -50 L 150 -10 Q 150 30 110 30 L -20 30 L -60 70 L -50 30 L -100 30 Q -140 30 -140 -10 Z" fill="${C.white}" ${K}/>` + txt(4, -26, "NOT YET...", 46), 1560, 300)}
      `;
    },
    anim: (p) => `
      ${popIn(`#${p}-man`, 0.05)}
      ${popIn(`#${p}-bucket`, 0.2)}
      ${popIn(`#${p}-brain`, 0.35)}
      tl.fromTo("#${p}-glass", { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.28, ease: "back.out(2)" }, 0.45);
      tl.fromTo("#${p}-glass", { rotation: 0, transformOrigin: "50% 50%" }, { rotation: -125, immediateRender: false, duration: 0.5, ease: "power2.inOut" }, 0.7);
      tl.fromTo(".${p}-grain", { opacity: 0, y: -40 }, { opacity: 1, y: 70, duration: 0.45, ease: "power1.in", stagger: { each: 0.08, repeat: 1 } }, 1.15);
      ${popIn(`#${p}-say`, 1.0)}
    `,
  },

  /* 10 */ {
    id: "s10",
    title: "SMALL CHOICES",
    line: "The fix isn't a big gesture. It's small choices.",
    bg: () => wall(900, C.wood, { planks: true }),
    body: (p) => {
      const icons = [clockIcon(0, -70, 42), heart(0, -66, 1.2, C.terra), calIcon(0, -70, 86), star(0, -72, 48), phoneIcon(0, -70, 1.3)];
      const cards = icons.map((ic, i) => pop(`${p}-k${i}`, `${p}-card`, `
        <path d="M -78 0 L -70 -150 L 70 -150 L 78 0 Z" fill="${C.paper2}" ${K}/>
        <path d="M -70 -150 L -84 4 M 70 -150 L 84 4" fill="none" ${K3}/>${ic}`, 520 + i * 200, 690)).join("");
      return `
        <path d="M 360 690 L 1480 690 L 1520 750 L 320 750 Z" fill="${C.wood}" ${K}/>
        <path d="M 370 750 L 370 960 M 1470 750 L 1470 960" stroke="${C.ink}" stroke-width="14" stroke-linecap="round"/>
        <path d="M 370 750 L 370 960 M 1470 750 L 1470 960" stroke="${C.woodDk}" stroke-width="8" stroke-linecap="round"/>
        ${shadow(920, 970, 620, 24)}
        ${cards}
        ${pop(`${p}-few`, `${p}-pop`, txt(1320, 300, "JUST ONE", 46) + `<path d="M 1320 332 L 1320 400" ${K}/>` + blockArrow(1280, 430, 80, C.slateDk, 40).replace("<path", `<path transform="rotate(90 1320 430)"`))}
        ${pop(`${p}-man`, `${p}-pop`, man({ shirt: C.mustard, face: "smile", arms: "reach", hair: "tuft", look: -6, tilt: -8 }), 1650, 950, 1.0)}
      `;
    },
    anim: (p) => `
      ${popIn(`.${p}-card`, 0.1, 0.08)}
      ${popIn(`#${p}-man`, 0.3)}
      ${popIn(`#${p}-few`, 0.9)}
      tl.fromTo("#${p}-k4", { y: 0, rotation: 0, transformOrigin: "50% 100%" }, { y: -90, rotation: -8, duration: 0.45, ease: "back.out(2)" }, 1.4);
    `,
  },

  /* 11 */ {
    id: "s11",
    title: "ONE NUMBER",
    line: "Like one number you keep meaning to call.",
    bg: () => wall(960, C.wood, { planks: true }) +
      `<path d="M 0 120 L 0 1080" ${K}/><rect x="0" y="560" width="300" height="20" fill="${C.wood}" ${K}/>` + plant(150, 560, 0.9),
    body: (p) => {
      const couple = g(man({ shirt: "#D8CBB0", face: "smile", hair: "granny", arms: "down", noShadow: true }), "translate(800 760) scale(0.62)") +
        g(man({ shirt: "#D8CBB0", face: "smile", hair: "grandpa", arms: "down", noShadow: true }), "translate(980 760) scale(0.62)");
      return `
        ${pop(`${p}-frame`, `${p}-pop`, frame(640, 280, 520, 540, couple))}
        ${pop(`${p}-q`, `${p}-pop`, txt(1280, 560, "?", 220, C.mustard, "middle", `stroke="${C.ink}" stroke-width="5" paint-order="stroke"`))}
        ${pop(`${p}-env`, `${p}-pop`, envelope(1380, 450, 320, 220, "ONE NUMBER"))}
        ${pop(`${p}-man`, `${p}-pop`, man({ shirt: C.slateDk, face: "neutral", arms: "point", hair: "tuft", look: 8 }), 400, 1010, 1.0)}
      `;
    },
    anim: (p) => `
      ${popIn(`#${p}-man`, 0.05)}
      ${popIn(`#${p}-frame`, 0.25)}
      ${popIn(`#${p}-q`, 0.75)}
      tl.fromTo("#${p}-env", { opacity: 0, x: 160, rotation: 10, transformOrigin: "50% 50%" }, { opacity: 1, x: 0, rotation: 0, duration: 0.5, ease: "back.out(1.6)" }, 1.05);
    `,
  },

  /* 12 */ {
    id: "s12",
    title: "CALL TONIGHT",
    line: "Call them tonight. The years are shorter than they feel.",
    bg: () => wall(900, C.olive) + ``,
    body: (p) => {
      let hearts = "";
      for (let i = 0; i < 6; i++) hearts += pop(`${p}-h${i}`, `${p}-heart`, heart(0, 0, 0.7 + (i % 3) * 0.15, i % 2 ? C.terra : C.mustard), 700 + i * 100, 470 - (i % 2) * 60);
      const handset = `<rect x="-96" y="-366" width="36" height="66" rx="8" fill="${C.ink}" transform="rotate(-12 -78 -333)"/>`;
      return `
        <path d="M 560 520 C 760 380 1160 640 1400 480" fill="none" stroke="${C.ink}" stroke-width="5" stroke-dasharray="4 22" stroke-linecap="round"/>
        ${hearts}
        ${pop(`${p}-man`, `${p}-pop`, man({ shirt: C.terra, face: "happy", arms: "phone", hair: "tuft", inHand: handset }), 420, 920, 1.0)}
        ${pop(`${p}-mom`, `${p}-pop`, man({ shirt: C.olive, face: "happy", hair: "granny", arms: "phone", inHand: handset }), 1430, 920, 0.85)}
        ${pop(`${p}-dad`, `${p}-pop`, man({ shirt: C.slateDk, face: "smile", hair: "grandpa", arms: "wave" }), 1660, 920, 0.85)}
      `;
    },
    anim: (p) => `
      ${popIn(`#${p}-man`, 0.05)}
      ${popIn(`#${p}-mom`, 0.3)}
      ${popIn(`#${p}-dad`, 0.4)}
      tl.fromTo(".${p}-heart", { opacity: 0, scale: 0, y: 30, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "back.out(3)", stagger: 0.12 }, 0.8);
      tl.to(".${p}-heart", { y: -26, duration: 0.6, ease: "sine.inOut", stagger: 0.12 }, 1.5);
    `,
  },
];
