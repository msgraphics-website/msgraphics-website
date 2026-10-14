// Creates labelled grey placeholder images for every photo listed in
// src/data/src/data/content/*.json that does not exist yet in /public/images.
// Run:  node scripts/make-placeholders.mjs
// It never overwrites a file that already exists, so real photos are safe.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const cdir = path.join(root, 'src/data/content');
const content = fs.readdirSync(cdir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(cdir, f), 'utf8')));

const found = new Map();
(function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (node && typeof node === "object") {
    if (typeof node.src === "string" && node.src.startsWith("/images/") && node.src.endsWith(".svg") && node.label) found.set(node.src, node.label);
    Object.values(node).forEach(walk);
  }
})(content);

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
function wrap(text, max) {
  const words = text.split(" "); const lines = []; let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) { lines.push(line); line = w; } else line = (line + " " + w).trim();
  }
  if (line) lines.push(line);
  return lines;
}

let made = 0;
for (const [src, label] of found) {
  const file = path.join(root, "public", src);
  if (fs.existsSync(file)) continue;
  const portrait = /founder|portrait/.test(src);
  const wide = /hero/.test(src);
  const W = wide ? 1600 : portrait ? 900 : 1200, H = portrait ? 1100 : 900;
  const lines = wrap(label, wide ? 44 : 30);
  const fs1 = wide ? 44 : 40, lh = fs1 * 1.35;
  const y0 = H / 2 - ((lines.length - 1) * lh) / 2;
  const c = 48, m = 60; // crop mark length, margin
  const marks = [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]]
    .map(([x, y, dx, dy]) => `<path d="M${x} ${y + dy * c}V${y}H${x + dx * c}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="#E3E1DB"/>
<g fill="none" stroke="#9A988F" stroke-width="3">${marks}</g>
<g fill="#00A0E3"><circle cx="${W / 2 - 36}" cy="${y0 - 90}" r="9"/></g><circle cx="${W / 2 - 12}" cy="${y0 - 90}" r="9" fill="#E6007E"/><circle cx="${W / 2 + 12}" cy="${y0 - 90}" r="9" fill="#FFC20E"/><circle cx="${W / 2 + 36}" cy="${y0 - 90}" r="9" fill="#14213D"/>
<g font-family="Poppins, Arial, sans-serif" text-anchor="middle" fill="#55534D">
${lines.map((l, i) => `<text x="${W / 2}" y="${y0 + i * lh}" font-size="${fs1}" font-weight="600">${esc(l)}</text>`).join("\n")}
<text x="${W / 2}" y="${y0 + (lines.length - 1) * lh + 70}" font-size="24" fill="#7A786F">Replace: public${esc(src)}</text>
</g>
</svg>`;
  fs.writeFileSync(file, svg);
  made++;
}
console.log(`Placeholders created: ${made} (of ${found.size} photos listed)`);
