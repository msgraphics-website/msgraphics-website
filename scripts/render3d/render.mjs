// Renders the 3D illustrations in public/images from scripts/render3d/scenes.js.
// One-time setup (not needed to build the site):  npm i --no-save three@0.169.0 playwright && npx playwright install chromium
// (Set CHROME_PATH to use an existing Chrome/Chromium instead.)
// Run:  node scripts/render3d/render.mjs            (all images)
//       node scripts/render3d/render.mjs shop-front (only files whose name matches)
// It renders every image listed in src/data/content/*.json that has a "label", so a real photo you add is never overwritten
// unless its file name matches the filter you pass. Remove the "label" from an entry once it holds a real photo.
import fs from 'fs'; import path from 'path'; import http from 'http';
import { chromium } from 'playwright';
import sharp from 'sharp';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const cdir = path.join(root, 'src/data/content');
const content = fs.readdirSync(cdir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(cdir, f), 'utf8')));
const ACC = ['#E6007E', '#00A0E3', '#FFC20E', '#E6007E'];
function hash(s) { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return h >>> 0; }
function pick(src, label) {
  const f = path.basename(src); const L = label.toLowerCase();
  if (/hero/.test(f)) return ["hero"];
  if (/founder|portrait/.test(f)) return ["portrait"];
  if (/about-team|team/.test(f)) return ["team"];
  if (/unit-entrance/.test(f)) return ["entrance"];
  if (/dispatch/.test(f)) return ["dispatch"];
  if (/fabrication/.test(f)) return ["workshop"];
  if (/offset/.test(f)) return ["offset"];
  if (/cutting|cnc|laser/.test(f)) return ["cutter"];
  if (/lamination/.test(f)) return ["laminator"];
  if (/large-format|uv-printer|digital-press|printing-floor|flex-vinyl/.test(f)) return ["printer"];
  if (/shop-front-before/.test(f)) return ["shopfront", { state: "before", sign: "glow" }];
  if (/shop-front-after|glow/.test(f)) return ["shopfront", { sign: "glow" }];
  if (/led/.test(f)) return ["shopfront", { sign: "led" }];
  if (/acp/.test(f)) return ["shopfront", { sign: "acp" }];
  if (/shutter/.test(f)) return ["shopfront", { sign: "shutter" }];
  if (/store-interior-before/.test(f)) return ["interior", { variant: "plain" }];
  if (/window/.test(f)) return ["interior", { variant: "window" }];
  if (/gondola/.test(f)) return ["interior", { variant: "gondola" }];
  if (/counter/.test(f)) return ["counter"];
  if (/instore|in-store|store-interior/.test(f)) return ["interior", { variant: "standee" }];
  if (/office/.test(f) || /office/.test(L)) return ["office"];
  if (/hoarding/.test(f) || /hoarding/.test(L)) return ["hoarding"];
  if (/kiosk/.test(f)) return ["kiosk"];
  if (/vehicle/.test(f) || /vehicle/.test(L)) return ["vehicle"];
  if (/site-branding/.test(f)) return ["site"];
  if (/stall|exhibition/.test(f) || /exhibition/.test(L)) return ["stall"];
  if (/rwa|canopy|activation/.test(f)) return ["activation"];
  if (/events|stage/.test(f)) return ["stage"];
  if (/signage/.test(f)) return ["shopfront", { sign: "acp" }];
  if (/packaging/.test(f)) return ["packaging"];
  if (/gift|tshirt|mug/.test(f) || /gift/.test(L)) return ["gifts"];
  if (/identity/.test(f)) return ["identity"];
  if (/outdoor/.test(f)) return ["hoarding"];
  if (/corporate/.test(f)) return ["office"];
  return ["printitems"];
}
const found = new Map();
(function walk(n) { if (Array.isArray(n)) return n.forEach(walk); if (n && typeof n === 'object') { if (typeof n.src === 'string' && /^\/images\/.*\.(svg|webp)$/.test(n.src) && n.label) found.set(n.src.replace(/\.\w+$/, ''), n.label); Object.values(n).forEach(walk); } })(content);
const cycle = ["interior", "shopfront", "hoarding", "stage", "printitems", "stall", "vehicle", "counter", "activation"];
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const jobs = [];
for (const [base, label] of found) {
  if (only && !only.test(base)) continue;
  const h = hash(base + '.svg');
  let [scene, opts = {}] = pick(base, label);
  const CASE = { 'case-1-photo-1': ['interior', { variant: 'standee' }], 'case-1-photo-2': ['counter'], 'case-1-photo-3': ['interior', { variant: 'gondola' }],
    'case-2-photo-1': ['shopfront', { sign: 'acp' }], 'case-2-photo-2': ['hoarding'],
    'case-3-photo-1': ['stall'], 'case-3-photo-2': ['stage'], 'case-3-photo-3': ['activation'], 'case-3-photo-4': ['vehicle'],
    'work-instore-1': ['interior', { variant: 'standee' }], 'work-instore-2': ['interior', { variant: 'window' }], 'work-instore-3': ['interior', { variant: 'gondola' }],
    'work-signage-1': ['shopfront', { sign: 'glow' }], 'work-signage-2': ['shopfront', { sign: 'led' }] };
  const k = path.basename(base); if (CASE[k]) [scene, opts] = [CASE[k][0], CASE[k][1] || {}];
  const portrait = scene === 'portrait';
  jobs.push({ base, scene, opts: { acc: ACC[h % ACC.length], ...opts }, W: portrait ? 1200 : 1600, H: portrait ? 1466 : 1200, seed: h, portrait });
}
const types = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.html': 'text/html', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const f = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.goto(`http://localhost:${port}/scripts/render3d/page.html`); await page.waitForFunction('window.ready', null, { timeout: 60000 });
for (const j of jobs) {
  const url = await page.evaluate(([n, o, W, H, s]) => window.render(n, o, W, H, s), [j.scene, j.opts, j.W, j.H, j.seed]);
  const out = path.join(root, 'public', j.base + '.webp');
  await sharp(Buffer.from(url.split(',')[1], 'base64')).resize(j.portrait ? 900 : 1200, j.portrait ? 1100 : 900).webp({ quality: 80, effort: 6 }).toFile(out);
  console.log('rendered', path.relative(root, out));
}
await browser.close(); server.close();
