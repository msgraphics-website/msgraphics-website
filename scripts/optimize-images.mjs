// Converts every .jpg / .jpeg / .png photo in /public/images to a compressed .webp
// (max 1920px wide, quality 78). The original is kept; update the "src" in
// src/data/content/ to the new .webp name.
// Run:  npm run optimize-images
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const dir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../public/images");
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f) && !f.startsWith("og-"));
if (!files.length) console.log("No .jpg/.png files found in public/images.");
for (const f of files) {
  const out = path.join(dir, f.replace(/\.(jpe?g|png)$/i, ".webp"));
  const info = await sharp(path.join(dir, f)).rotate().resize({ width: 1920, withoutEnlargement: true }).webp({ quality: 78 }).toFile(out);
  console.log(`${f} → ${path.basename(out)} (${Math.round(info.size / 1024)} KB)`);
}
