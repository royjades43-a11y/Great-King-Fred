// Copies npm-installed libraries and fonts into assets/ so the video never loads from a CDN.
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const nm = (p) => join(root, "node_modules", p);
const copy = (from, to) => {
  mkdirSync(join(root, to, ".."), { recursive: true });
  copyFileSync(nm(from), join(root, to));
};
copy("gsap/dist/gsap.min.js", "assets/vendor/gsap.min.js");
for (const w of [600, 800]) copy(`@fontsource/montserrat/files/montserrat-latin-${w}-normal.woff2`, `assets/fonts/montserrat-${w}.woff2`);
copy("@fontsource/anton/files/anton-latin-400-normal.woff2", "assets/fonts/anton-400.woff2");
console.log("vendored gsap + fonts into assets/");
