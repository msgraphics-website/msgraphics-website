// 3D scenes for the website images, rendered with three.js.
// Each scene is a small "diorama" on a rounded slab, in the brand palette.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const C = { navy: '#14213D', navy2: '#22345E', mag: '#E6007E', yel: '#FFC20E', cyan: '#00A0E3', paper: '#F7F5F0', white: '#FFFFFF', grey: '#C9C4B8', dark: '#1A2133', steel: '#8C93A3', wood: '#9A6B43', glass: '#BFE3F2', skin: '#C98B5E', skin2: '#8D5A3B', road: '#6E7380', grass: '#9DBA7A', sand: '#E4DACA', wall: '#EFE9DD' };

// ---------- helpers ----------
const mats = new Map();
function mat(color, o = {}) {
  const k = color + JSON.stringify(o);
  if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.55, metalness: o.metal ?? 0, transparent: !!o.opacity, opacity: o.opacity ?? 1, emissive: o.emissive ?? '#000', emissiveIntensity: o.ei ?? 0 }));
  return mats.get(k);
}
function add(parent, mesh, x = 0, y = 0, z = 0, ry = 0) { mesh.position.set(x, y, z); mesh.rotation.y = ry; mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh; }
// box sitting on y (bottom at y)
function box(p, w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
  const r = o.r ?? Math.min(w, h, d) * 0.08;
  const g = r > 0.001 ? new RoundedBoxGeometry(w, h, d, 3, Math.min(r, Math.min(w, h, d) / 2 - 0.001)) : new THREE.BoxGeometry(w, h, d);
  const m = o.map ? faceMats(color, o.map, o.face ?? 'front', o) : mat(color, o);
  return add(p, new THREE.Mesh(g, m), x, y + h / 2, z, o.ry ?? 0);
}
function faceMats(color, map, face, o) {
  const base = mat(color, o);
  const tex = new THREE.MeshStandardMaterial({ map, roughness: 0.45, emissive: o.glow ? '#ffffff' : '#000', emissiveMap: o.glow ? map : null, emissiveIntensity: o.glow ? 0.55 : 0 });
  const idx = { right: 0, left: 1, top: 2, bottom: 3, front: 4, back: 5 }[face];
  return Array.from({ length: 6 }, (_, i) => (i === idx ? tex : base));
}
// flat textured panel (for posters on walls etc.)
function panel(p, w, h, map, x, y, z, ry = 0, glow = false) {
  const m = new THREE.MeshStandardMaterial({ map, roughness: 0.5, emissive: glow ? '#fff' : '#000', emissiveMap: glow ? map : null, emissiveIntensity: glow ? 0.5 : 0 });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  return add(p, mesh, x, y, z, ry);
}
function cyl(p, rt, rb, h, color, x = 0, y = 0, z = 0, o = {}) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg ?? 32), mat(color, o));
  if (o.rx) mesh.rotation.x = o.rx;
  if (o.rz) mesh.rotation.z = o.rz;
  return add(p, mesh, x, y + (o.center ? 0 : h / 2), z, o.ry ?? 0);
}
function sphere(p, r, color, x, y, z, o = {}) { return add(p, new THREE.Mesh(new THREE.SphereGeometry(r, 32, 16), mat(color, o)), x, y, z); }
function person(p, x, z, shirt = C.navy, skin = C.skin, ry = 0, s = 1, pose = 'stand') {
  const g = new THREE.Group();
  box(g, 0.16, 0.8, 0.18, C.dark, -0.11, 0, 0, { r: 0.07 });
  box(g, 0.16, 0.8, 0.18, C.dark, 0.11, 0, 0, { r: 0.07 });
  box(g, 0.5, 0.75, 0.3, shirt, 0, 0.75, 0, { r: 0.13 });
  const armL = box(g, 0.13, 0.62, 0.14, shirt, -0.33, 0.85, 0, { r: 0.06 });
  const armR = box(g, 0.13, 0.62, 0.14, shirt, 0.33, 0.85, 0, { r: 0.06 });
  if (pose === 'reach') { armR.rotation.z = 2.6; armR.position.set(0.42, 1.65, 0); }
  if (pose === 'hold') { armL.rotation.x = -1.2; armR.rotation.x = -1.2; armL.position.set(-0.33, 1.25, 0.25); armR.position.set(0.33, 1.25, 0.25); }
  sphere(g, 0.2, skin, 0, 1.75, 0);
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.21, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat(C.dark));
  add(g, hair, 0, 1.78, -0.01);
  g.position.set(x, 0, z); g.rotation.y = ry; g.scale.setScalar(s);
  p.add(g); return g;
}
function slab(p, w = 10, d = 10, color = C.sand) { return box(p, w, 0.5, d, color, 0, -0.5, 0, { r: 0.22 }); }
function plant(p, x, z, s = 1) { cyl(p, 0.22 * s, 0.17 * s, 0.4 * s, '#B5651D', x, 0, z); sphere(p, 0.38 * s, '#4E9A5B', x, 0.75 * s, z); }
function tree(p, x, z, s = 1) { cyl(p, 0.08 * s, 0.1 * s, 1 * s, '#7B5638', x, 0, z); sphere(p, 0.6 * s, '#5FA36B', x, 1.4 * s, z); sphere(p, 0.42 * s, '#6FB27A', x + 0.3 * s, 1.75 * s, z + 0.1 * s); }
function lamp(p, x, z) { cyl(p, 0.05, 0.07, 3.2, C.steel, x, 0, z, { metal: 0.6, rough: 0.3 }); box(p, 0.5, 0.08, 0.16, C.steel, x + 0.2, 3.15, z, { metal: 0.6 }); }

// ---------- textures (2D artwork printed on signs, posters, screens) ----------
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const FONT = '"Poppins", "Arial Black", Arial, sans-serif';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); }
function mark(g, x, y, s, bg, fg = '#fff') {
  g.fillStyle = bg; rr(g, x, y, s, s, s * 0.2);
  g.fillStyle = fg; g.font = `800 ${s * 0.42}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('MS', x + s / 2, y + s * 0.42);
  [C.cyan, C.mag, C.yel, fg].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(x + s * (0.26 + i * 0.16), y + s * 0.77, s * 0.055, 0, 7); g.fill(); });
}
// write text shrunk to fit maxW
function fit(g, txt, x, y, size, maxW, weight = 800) {
  let s = size; g.font = `${weight} ${s}px ${FONT}`;
  const m = g.measureText(txt).width; if (m > maxW) { s = s * maxW / m; g.font = `${weight} ${s}px ${FONT}`; }
  g.fillText(txt, x, y); return s;
}
// Generic ad artwork. kind: 'ad' | 'sign' | 'offer' | 'brand'. Lays out for wide or tall canvases.
export function art(kind, acc, { w = 1024, h = 512, text } = {}) {
  return canvasTex(w, h, (g) => {
    const dark = kind === 'sign' || kind === 'brand';
    const tall = h > w * 0.9;
    g.fillStyle = dark ? C.navy : acc; g.fillRect(0, 0, w, h);
    g.textBaseline = 'alphabetic';
    if (dark) {
      const label = text ?? (kind === 'sign' ? 'YOUR STORE' : 'MS GRAPHICS');
      if (tall) {
        const s = w * 0.5; mark(g, (w - s) / 2, h * 0.12, s, kind === 'sign' ? acc : '#fff', kind === 'sign' ? '#fff' : C.navy);
        g.textAlign = 'center'; g.fillStyle = '#fff';
        if (label) fit(g, label, w / 2, h * 0.12 + s + h * 0.16, w * 0.16, w * 0.84);
        g.fillStyle = C.mag; fit(g, 'PRINT · BRANDING · EVENTS', w / 2, h * 0.12 + s + h * 0.26, w * 0.06, w * 0.84, 600);
        g.fillStyle = C.yel; rr(g, w * 0.3, h * 0.88, w * 0.4, h * 0.025, h * 0.0125);
        return;
      }
      const s = h * 0.7; mark(g, h * 0.12, h * 0.15, s, kind === 'sign' ? acc : '#fff', kind === 'sign' ? '#fff' : C.navy);
      const x = h * 0.12 + s + h * 0.22, maxW = w - x - h * 0.2;
      g.textAlign = 'left'; g.fillStyle = '#fff';
      if (label) fit(g, label, x, h * 0.56, h * 0.34, maxW);
      g.fillStyle = kind === 'sign' ? C.yel : C.mag;
      fit(g, 'PRINT · BRANDING · EVENTS', x, h * 0.8, h * 0.13, maxW, 600);
      return;
    }
    const big = text ?? (kind === 'offer' ? 'SALE' : 'NEW');
    const sub = kind === 'offer' ? 'UP TO 50% OFF' : 'LAUNCH OFFER';
    g.textAlign = 'left';
    if (tall) {
      g.fillStyle = C.navy; g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0); g.lineTo(w, h * 0.42); g.lineTo(0, h * 0.52); g.fill();
      g.fillStyle = '#fff'; fit(g, big, w * 0.08, h * 0.22, w * 0.3, w * 0.84);
      g.fillStyle = C.yel; fit(g, sub, w * 0.08, h * 0.33, w * 0.11, w * 0.84, 700);
      g.fillStyle = C.yel; g.beginPath(); g.arc(w * 0.5, h * 0.7, w * 0.3, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(w * 0.5, h * 0.7, w * 0.17, 0, 7); g.fill();
      [C.cyan, C.mag, C.yel, '#fff'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(w * 0.12 + i * w * 0.08, h * 0.93, w * 0.025, 0, 7); g.fill(); });
      return;
    }
    g.fillStyle = C.navy; g.beginPath(); g.moveTo(0, 0); g.lineTo(w * 0.58, 0); g.lineTo(w * 0.46, h); g.lineTo(0, h); g.fill();
    g.fillStyle = '#fff'; fit(g, big, w * 0.06, h * 0.44, h * 0.26, w * 0.4);
    g.fillStyle = C.yel; fit(g, sub, w * 0.06, h * 0.62, h * 0.11, w * 0.36, 700);
    g.fillStyle = 'rgba(255,255,255,.55)'; rr(g, w * 0.06, h * 0.72, w * 0.22, h * 0.05, h * 0.025);
    const r = Math.min(h * 0.3, w * 0.18);
    g.fillStyle = C.yel; g.beginPath(); g.arc(w * 0.76, h * 0.5, r, 0, 7); g.fill();
    g.fillStyle = '#fff'; g.beginPath(); g.arc(w * 0.76, h * 0.5, r * 0.6, 0, 7); g.fill();
    [C.cyan, C.mag, C.yel, '#fff'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(w * 0.07 + i * h * 0.08, h * 0.88, h * 0.025, 0, 7); g.fill(); });
  });
}
function screen(acc) { return canvasTex(512, 320, (g, w, h) => { g.fillStyle = '#0E1526'; g.fillRect(0, 0, w, h); g.fillStyle = acc; rr(g, 30, 30, 200, 120, 10); g.fillStyle = '#3B4A6B'; for (let i = 0; i < 4; i++) rr(g, 260, 40 + i * 30, 200 - i * 30, 14, 7); g.fillStyle = C.cyan; rr(g, 30, 180, 450, 100, 10); }); }

// ---------- scenes ----------
export const scenes = {
  shopfront(root, { acc, state = 'after', sign = 'glow' }) {
    const before = state === 'before';
    slab(root, 12, 9, C.sand);
    box(root, 12, 0.08, 2.4, '#D5CBB8', 0, 0, 3, { r: 0.02 });
    const wallC = before ? '#CFC9BD' : C.wall;
    box(root, 9, 4.6, 0.5, wallC, 0, 0, -1.2, { r: 0.05 });
    box(root, 2.4, 6, 3, '#D9D2C4', -5.6, 0, -1.6); box(root, 2.4, 5.2, 3, '#CEC6B6', 5.6, 0, -1.6);
    // windows + door
    box(root, 3, 2.4, 0.12, before ? '#9FB3BB' : C.glass, -2.6, 0.4, -0.9, { opacity: 0.85, rough: 0.1, metal: 0.2 });
    box(root, 3, 2.4, 0.12, before ? '#9FB3BB' : C.glass, 2.6, 0.4, -0.9, { opacity: 0.85, rough: 0.1, metal: 0.2 });
    box(root, 1.6, 3, 0.14, before ? '#7E786C' : C.navy2, 0, 0, -0.9);
    if (!before) {
      panel(root, 1.4, 1.9, art('offer', acc, { w: 512, h: 700 }), -3.3, 1.6, -0.82);
      panel(root, 1.2, 1.2, art('ad', C.cyan, { w: 512, h: 512 }), 2.4, 1.5, -0.82);
      plant(root, -1.2, 0.3); plant(root, 1.2, 0.3);
    }
    // sign
    if (sign === 'shutter') {
      box(root, 8.6, 0.9, 0.4, C.navy, 0, 3.6, -0.75, { map: art('sign', acc, { w: 2048, h: 220 }), face: 'front' });
      for (let i = 0; i < 14; i++) box(root, 8.4, 0.16, 0.06, '#C8C2B5', 0, 0.1 + i * 0.24, -0.6, { r: 0.02, metal: 0.3 });
      panel(root, 5, 2.6, art('offer', acc), 0, 1.75, -0.52);
    } else if (before) {
      box(root, 8.4, 1.1, 0.25, '#BDB6A8', 0, 3.3, -0.8, { r: 0.03 });
    } else if (sign === 'led') {
      box(root, 8.6, 1.3, 0.3, C.dark, 0, 3.2, -0.85);
      'STORE'.split('').forEach((ch, i) => { const t = canvasTex(256, 256, (g) => { g.fillStyle = i % 2 ? acc : '#fff'; g.font = `800 220px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 128, 138); }); const m = new THREE.MeshStandardMaterial({ map: t, transparent: true, emissive: '#fff', emissiveMap: t, emissiveIntensity: 0.8 }); add(root, new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), m), -2.4 + i * 1.2, 3.85, -0.68); });
    } else {
      box(root, 8.6, 1.3, 0.4, sign === 'acp' ? C.navy : acc, 0, 3.15, -0.75, { map: art(sign === 'acp' ? 'sign' : 'brand', acc, { w: 2048, h: 310, text: sign === 'acp' ? 'YOUR STORE' : 'YOUR BRAND' }), face: 'front', glow: sign === 'glow' });
    }
    box(root, 9.4, 0.25, 0.8, before ? '#A9A293' : C.navy, 0, 4.6, -1.0);
    lamp(root, 5.2, 2.6); tree(root, -5.2, 2.6, 0.9);
    return { target: [0, 2, 0], dist: 21, el: 0.32, az: 0.55 };
  },
  hero(root, { acc }) {
    const v = scenes.shopfront(root, { acc, sign: 'glow' });
    // ladder + installer
    const lg = new THREE.Group();
    box(lg, 0.1, 4.4, 0.1, C.steel, -0.35, 0, 0, { metal: 0.6, r: 0.02 }); box(lg, 0.1, 4.4, 0.1, C.steel, 0.35, 0, 0, { metal: 0.6, r: 0.02 });
    for (let i = 0; i < 9; i++) box(lg, 0.7, 0.06, 0.08, C.steel, 0, 0.35 + i * 0.45, 0, { metal: 0.6, r: 0.02 });
    lg.position.set(3.4, 0, 0.3); lg.rotation.x = -0.18; root.add(lg);
    person(root, 3.4, 0.05, C.mag, C.skin2, Math.PI, 0.9, 'reach').position.y = 2.3;
    person(root, 1.6, 1.8, C.navy, C.skin, -0.5, 0.95);
    box(root, 0.7, 0.5, 0.5, C.yel, 2.3, 0, 2.1, { r: 0.05 });
    return { ...v, dist: 19, az: 0.62 };
  },
  interior(root, { acc, variant = 'standee', R }) {
    const plain = variant === 'plain';
    slab(root, 11, 9, '#E3DACB');
    box(root, 11, 4.2, 0.3, C.wall, 0, 0, -4.3); box(root, 0.3, 4.2, 8.6, '#E7E0D2', -5.35, 0, 0);
    const prodCols = plain ? ['#B9B3A6', '#A8A296', '#C7C1B4', '#9E988C'] : [C.cyan, C.mag, C.yel, C.navy, '#fff'];
    for (let s = 0; s < 3; s++) {
      const x = -3.2 + s * 3.2;
      box(root, 2.8, 3, 0.8, '#F4F0E8', x, 0, -3.7, { r: 0.04 });
      for (let j = 0; j < 4; j++) {
        if (!plain) box(root, 2.8, 0.14, 0.05, j === 0 ? acc : acc, x, 0.25 + j * 0.7, -3.28, { r: 0.01 });
        for (let k = 0; k < 6; k++) box(root, 0.3, 0.45, 0.3, prodCols[Math.floor(R() * prodCols.length)], x - 1.1 + k * 0.44, 0.38 + j * 0.7, -3.6, { r: 0.05 });
      }
    }
    if (!plain && variant !== 'gondola') {
      for (let i = 0; i < 3; i++) { const x = -3 + i * 3; cyl(root, 0.01, 0.01, 0.8, C.grey, x, 3.4, -1.2); box(root, 1, 0.75, 0.05, i % 2 ? C.yel : acc, x, 2.65, -1.2, { r: 0.04, map: art('offer', i % 2 ? C.yel : acc, { w: 400, h: 300, text: i % 2 ? 'NEW' : 'SALE' }), face: 'front' }); }
    }
    if (variant === 'standee' || variant === 'plain') {
      if (!plain) { box(root, 1.2, 2.4, 0.06, acc, 3.6, 0.15, 0.6, { map: art('offer', acc, { w: 400, h: 800 }), face: 'front', ry: -0.4 }); box(root, 0.8, 0.15, 0.5, C.dark, 3.6, 0, 0.6, { ry: -0.4 }); }
    }
    if (variant === 'gondola') {
      box(root, 3.6, 2.2, 1.4, C.navy, 0, 0, 0.4, { r: 0.06 });
      box(root, 3.6, 0.6, 1.4, acc, 0, 2.2, 0.4, { map: art('brand', acc, { text: 'BRAND' }), face: 'front', r: 0.06 });
      for (let j = 0; j < 3; j++) for (let k = 0; k < 7; k++) box(root, 0.36, 0.42, 0.36, [C.yel, C.cyan, C.mag][k % 3], -1.45 + k * 0.48, 0.25 + j * 0.65, 1.15, { r: 0.05 });
    }
    if (variant === 'window') {
      box(root, 7, 3.4, 0.12, C.glass, 0, 0.2, 2.6, { opacity: 0.55, rough: 0.05, metal: 0.1 });
      panel(root, 3, 2.4, art('offer', acc, { w: 800, h: 640 }), -1.7, 1.9, 2.68);
      panel(root, 2.2, 2.2, art('ad', C.cyan, { w: 600, h: 600 }), 1.9, 1.9, 2.68);
    }
    person(root, -1.5, 1.2, C.cyan, C.skin, 0.4); person(root, 1.4, 2, plain ? C.grey : C.mag, C.skin2, -0.6, 0.95);
    return { target: [0, 1.6, 0], dist: 20, el: 0.36, az: 0.5 };
  },
  counter(root, { acc }) {
    slab(root, 10, 8, '#E3DACB'); box(root, 10, 4, 0.3, C.wall, 0, 0, -3.8);
    box(root, 5.4, 1.6, 1.4, C.navy, 0, 0, 0, { map: art('offer', acc, { w: 1200, h: 360 }), face: 'front', r: 0.06 });
    box(root, 5.8, 0.12, 1.6, '#2D3E66', 0, 1.6, 0, { r: 0.04 });
    box(root, 1.6, 1.1, 0.5, C.white, -1.2, 1.72, -0.2, { map: art('ad', acc, { w: 600, h: 400 }), face: 'front', r: 0.05 });
    box(root, 0.9, 1.5, 0.4, C.cyan, 1.4, 1.72, -0.2, { r: 0.06 }); box(root, 0.6, 0.4, 0.5, C.dark, 0.3, 1.72, 0, { r: 0.05 });
    box(root, 0.8, 0.5, 0.06, C.yel, 2.3, 1.72, 0.2, { map: art('offer', C.yel, { w: 400, h: 250, text: 'NEW' }), face: 'front', ry: -0.3 });
    panel(root, 4, 2, art('brand', acc), 0, 2.9, -3.64);
    person(root, 0.5, -1.6, C.mag, C.skin2, 0); person(root, -2.5, 2.4, C.navy, C.skin, 2.6);
    return { target: [0, 1.4, 0], dist: 16, el: 0.3, az: 0.5 };
  },
  hoarding(root, { acc }) {
    slab(root, 13, 9, C.grass); box(root, 13, 0.06, 2.6, C.road, 0, 0, 2.4, { r: 0 });
    for (let i = 0; i < 5; i++) box(root, 1.2, 0.02, 0.15, '#fff', -5 + i * 2.5, 0.06, 2.4, { r: 0 });
    cyl(root, 0.18, 0.22, 4.2, C.steel, -2.2, 0, -1.2, { metal: 0.5, rough: 0.35 }); cyl(root, 0.18, 0.22, 4.2, C.steel, 2.2, 0, -1.2, { metal: 0.5, rough: 0.35 });
    box(root, 9, 3.6, 0.35, '#3B4150', 0, 4, -1.2, { map: art('ad', acc, { w: 1600, h: 640, text: 'BIG LAUNCH' }), face: 'front', r: 0.04 });
    box(root, 8.6, 0.12, 0.8, C.steel, 0, 3.85, -0.8, { metal: 0.6, r: 0.02 });
    for (let i = 0; i < 4; i++) cyl(root, 0.03, 0.03, 0.5, C.steel, -3 + i * 2, 3.95, -0.55, { rx: 0.6, metal: 0.6 });
    tree(root, -5.3, -2.5, 1.1); tree(root, 5.2, -2.8, 1.2); tree(root, 4.6, -3.5, 0.9);
    box(root, 1.6, 0.7, 0.8, C.yel, -3.5, 0.1, 2.3, { r: 0.2 }); box(root, 1.0, 0.45, 0.7, C.glass, -3.4, 0.8, 2.3, { r: 0.15, opacity: 0.8 });
    return { target: [0, 3, 0], dist: 23, el: 0.24, az: 0.45 };
  },
  kiosk(root, { acc }) {
    slab(root, 13, 8, '#CFC8BA'); box(root, 13, 0.06, 3, C.road, 0, 0, 1.6, { r: 0 }); box(root, 13, 0.2, 0.3, '#B3AB9B', 0, 0, 0, { r: 0.05 });
    for (let i = 0; i < 4; i++) { const x = -4.5 + i * 3; cyl(root, 0.07, 0.09, 4.4, C.steel, x, 0, -0.8, { metal: 0.6, rough: 0.3 }); box(root, 0.8, 0.08, 0.2, C.steel, x + 0.3, 4.35, -0.8, { metal: 0.6 }); box(root, 1.0, 1.7, 0.1, i % 2 ? C.navy : acc, x, 2, -0.65, { map: art(i % 2 ? 'sign' : 'offer', i % 2 ? C.cyan : acc, { w: 400, h: 700, text: i % 2 ? 'NEW' : 'SALE' }), face: 'front', r: 0.03 }); }
    tree(root, 5.5, -2.8, 1); tree(root, -5.6, -2.6, 0.9);
    return { target: [0, 2.2, 0], dist: 19, el: 0.28, az: 0.45 };
  },
  vehicle(root, { acc }) {
    slab(root, 11, 8, C.road); for (let i = 0; i < 4; i++) box(root, 1.2, 0.02, 0.15, '#fff', -4 + i * 2.7, 0, 2.8, { r: 0 });
    const v = new THREE.Group();
    // cargo box (rear) with wrap on both sides, cab at the front (-x)
    box(v, 2.9, 1.9, 1.7, C.white, 0.55, 0.55, 0, { r: 0.08 });
    box(v, 2.7, 1.5, 0.02, C.white, 0.55, 0.75, 0.86, { r: 0, map: art('offer', acc, { w: 900, h: 500, text: 'SALE' }), face: 'front' });
    box(v, 2.7, 1.5, 0.02, C.white, 0.55, 0.75, -0.86, { r: 0, map: art('brand', acc, { w: 900, h: 500, text: 'BRAND' }), face: 'back' });
    box(v, 1.25, 1.25, 1.66, acc, -1.45, 0.55, 0, { r: 0.18 });
    box(v, 0.06, 0.55, 1.4, C.glass, -2.07, 1.15, 0, { r: 0.02, opacity: 0.85, rough: 0.1, metal: 0.3 });
    box(v, 0.7, 0.45, 0.04, C.glass, -1.5, 1.2, 0.84, { r: 0.02, opacity: 0.85, rough: 0.1 });
    box(v, 4.3, 0.28, 1.72, C.dark, -0.15, 0.32, 0, { r: 0.08 });
    box(v, 0.1, 0.12, 0.3, '#FFF3C4', -2.1, 0.75, 0.6, { r: 0.03, emissive: '#FFF3C4', ei: 0.6 }); box(v, 0.1, 0.12, 0.3, '#FFF3C4', -2.1, 0.75, -0.6, { r: 0.03, emissive: '#FFF3C4', ei: 0.6 });
    [[-1.35, 0.8], [-1.35, -0.8], [1.25, 0.8], [1.25, -0.8]].forEach(([x, z]) => cyl(v, 0.36, 0.36, 0.24, '#222', x, 0.36, z, { rx: Math.PI / 2, center: true }));
    v.position.set(0, 0, 0.6); v.rotation.y = 0.25; root.add(v);
    box(root, 11, 3, 0.4, '#D9D2C4', 0, 0, -3.6, { r: 0.05 }); panel(root, 3, 1.8, art('ad', C.cyan), -2.5, 1.6, -3.38); tree(root, 3.5, -2.8);
    return { target: [0, 1.1, 0], dist: 14, el: 0.3, az: 0.6 };
  },
  site(root, { acc }) {
    slab(root, 13, 9, '#C9B99C');
    box(root, 3, 7, 3, '#B9B3A6', 2.5, 0, -2.8, { r: 0.02 }); for (let i = 0; i < 6; i++) box(root, 3.1, 0.12, 3.1, '#9E988C', 2.5, 1 + i * 1.1, -2.8, { r: 0.01 });
    cyl(root, 0.1, 0.1, 9, C.yel, -3.5, 0, -3.5, { metal: 0.3 }); box(root, 6, 0.25, 0.25, C.yel, -1.5, 8.8, -3.5, { r: 0.02 }); cyl(root, 0.01, 0.01, 3, C.dark, 1, 6, -3.5);
    for (let i = 0; i < 4; i++) box(root, 2.9, 2.4, 0.12, i % 2 ? C.navy : acc, -4.5 + i * 3, 0, 0.6, { map: art(i % 2 ? 'brand' : 'ad', acc, { w: 700, h: 580, text: i % 2 ? 'YOUR HOMES' : 'NOW BOOKING' }), face: 'front', r: 0.02 });
    person(root, -3, 2.3, C.yel, C.skin2, 0.3, 0.95);
    return { target: [0, 2.5, -0.5], dist: 23, el: 0.28, az: 0.5 };
  },
  stage(root, { acc }) {
    slab(root, 13, 10, '#2A3046');
    box(root, 10, 0.8, 3.6, C.dark, 0, 0, -1.8, { r: 0.05 }); box(root, 10.02, 0.12, 3.62, acc, 0, 0.7, -1.8, { r: 0.02 });
    box(root, 9.6, 4.4, 0.25, C.navy, 0, 0.8, -3.5, { map: art('brand', acc, { w: 1600, h: 740, text: 'DEALER MEET' }), face: 'front', glow: true, r: 0.03 });
    box(root, 0.2, 6.2, 0.2, C.steel, -5.2, 0, -3.5, { metal: 0.6 }); box(root, 0.2, 6.2, 0.2, C.steel, 5.2, 0, -3.5, { metal: 0.6 }); box(root, 10.6, 0.25, 0.25, C.steel, 0, 6.1, -3.2, { metal: 0.6 });
    for (let i = 0; i < 6; i++) { cyl(root, 0.15, 0.2, 0.35, C.dark, -4 + i * 1.6, 5.75, -3.0); }
    box(root, 0.9, 1.2, 0.6, acc, 0, 0.8, -1, { r: 0.08 });
    person(root, 0, -1.6, C.navy, C.skin, 0, 1).position.y = 0.8;
    for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) { const x = -4.2 + i * 1.4, z = 1.6 + r * 1.3; box(root, 0.7, 0.5, 0.6, '#3C4566', x, 0, z, { r: 0.08 }); box(root, 0.7, 0.7, 0.12, '#3C4566', x, 0.5, z + 0.25, { r: 0.05 }); }
    return { target: [0, 2.2, -0.5], dist: 22, el: 0.3, az: 0.35, env: 0.35, dark: true };
  },
  stall(root, { acc }) {
    slab(root, 11, 9, '#DDD5C7'); box(root, 6.4, 0.12, 5.4, '#B9AE98', 0, 0, 0, { r: 0.03 });
    box(root, 6.4, 3.2, 0.2, C.white, 0, 0.12, -2.6, { map: art('ad', acc, { w: 1200, h: 600, text: 'EXPO' }), face: 'front', r: 0.02 });
    box(root, 0.2, 3.2, 5.2, acc, -3.1, 0.12, 0, { r: 0.02 }); box(root, 6.6, 0.7, 0.3, C.navy, 0, 3.3, -2.5, { map: art('brand', acc, { w: 1400, h: 150 }), face: 'front', r: 0.03 });
    box(root, 2.6, 1.1, 0.9, C.navy, 0.6, 0.12, 0.9, { map: art('brand', acc, { w: 900, h: 380, text: 'BRAND' }), face: 'front', r: 0.06 }); box(root, 2.7, 0.1, 1, C.white, 0.6, 1.22, 0.9, { r: 0.03 });
    box(root, 0.8, 1.2, 0.8, C.white, -2.2, 0.12, 1.4, { r: 0.05 }); box(root, 0.5, 0.5, 0.5, C.cyan, -2.2, 1.32, 1.4, { r: 0.08 });
    plant(root, 2.7, -2); person(root, 0.6, -0.3, C.mag, C.skin2, 0); person(root, 2.4, 2.6, C.navy, C.skin, 2.8); person(root, 1.4, 3.2, C.cyan, C.skin, 3.2, 0.95);
    return { target: [0, 1.6, 0], dist: 17, el: 0.34, az: 0.55 };
  },
  activation(root, { acc }) {
    slab(root, 12, 9, C.grass); box(root, 7, 0.06, 6, '#D7CFBF', 0, 0, 0.3, { r: 0.02 });
    for (const [x, z] of [[-1.6, -1.6], [1.6, -1.6], [-1.6, 1.6], [1.6, 1.6]]) cyl(root, 0.05, 0.05, 2.6, C.steel, x, 0, z, { metal: 0.6 });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2.6, 1, 4), mat(acc)); roof.rotation.y = Math.PI / 4; add(root, roof, 0, 3.1, 0);
    box(root, 3.4, 0.35, 3.4, C.navy, 0, 2.45, 0, { r: 0.03 });
    box(root, 2.4, 1.0, 0.8, C.navy, 0, 0, 0.6, { map: art('brand', acc, { w: 800, h: 330, text: 'BRAND' }), face: 'front', r: 0.05 }); box(root, 2.5, 0.08, 0.9, C.white, 0, 1, 0.6, { r: 0.03 });
    box(root, 0.9, 2, 0.06, acc, 2.6, 0.12, 1.2, { map: art('offer', acc, { w: 400, h: 880 }), face: 'front', ry: -0.3 });
    person(root, 0, -0.4, acc, C.skin2, 0); person(root, -1.2, 2.6, C.yel, C.skin, 2.8); person(root, -0.3, 3, C.navy, C.skin2, 3.2, 0.9); person(root, 1.2, 2.8, C.cyan, C.skin, 3.5, 0.75);
    box(root, 2.5, 4, 2.5, '#E3DCCD', -4.4, 0, -3.2, { r: 0.04 }); box(root, 2.5, 5.2, 2.5, '#D9D1C1', 4.4, 0, -3.3, { r: 0.04 }); tree(root, -4.6, 2.6);
    return { target: [0, 1.5, 0], dist: 17, el: 0.34, az: 0.55 };
  },
  printer(root, { acc }) {
    slab(root, 11, 8, '#D8D2C6');
    box(root, 7.6, 1.2, 1.5, '#3A4152', 0, 1.6, 0, { r: 0.18 }); box(root, 7.6, 0.25, 1.52, '#4B5468', 0, 2.8, 0, { r: 0.1 });
    box(root, 1.4, 0.5, 0.2, C.dark, 2.6, 2.3, 0.7, { map: screen(C.cyan), face: 'front', r: 0.03 });
    box(root, 0.25, 1.6, 0.8, '#3A4152', -3.4, 0, 0, { r: 0.06 }); box(root, 0.25, 1.6, 0.8, '#3A4152', 3.4, 0, 0, { r: 0.06 });
    cyl(root, 0.3, 0.3, 7, C.white, 0, 1.25, -0.9, { rz: Math.PI / 2, center: true });
    const pg = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 2.4), new THREE.MeshStandardMaterial({ map: art('ad', acc, { w: 1600, h: 580, text: 'NEW' }), side: THREE.DoubleSide, roughness: 0.4 }));
    pg.rotation.x = -1.1; add(pg.parent ?? root, pg, 0, 0.75, 1.3);
    person(root, 3.8, 1.8, C.navy, C.skin2, -0.7);
    box(root, 1.2, 0.9, 0.9, '#C99A5B', -4.1, 0, 2.2, { r: 0.04 });
    return { target: [0, 1.4, 0.4], dist: 15, el: 0.3, az: 0.5 };
  },
  offset(root, { acc }) {
    slab(root, 12, 8, '#D8D2C6');
    for (let i = 0; i < 4; i++) { const x = -3.6 + i * 2.2; box(root, 2, 2.6, 2.2, '#3E4A62', x, 0, 0, { r: 0.12 }); cyl(root, 0.42, 0.42, 1.8, [C.cyan, C.mag, C.yel, '#222'][i], x, 2.75, 0, { rx: Math.PI / 2, center: true }); box(root, 1.6, 0.3, 0.08, [C.cyan, C.mag, C.yel, '#222'][i], x, 1.7, 1.12, { r: 0.04 }); }
    box(root, 1.6, 1, 1.6, '#4F5D79', 5.2, 0, 0, { r: 0.08 }); for (let i = 0; i < 8; i++) box(root, 1.3, 0.04, 1.2, '#fff', 5.2, 1 + i * 0.05, 0, { r: 0 });
    box(root, 1.2, 0.5, 0.2, C.dark, -4.8, 2.4, 1.2, { map: screen(acc), face: 'front', r: 0.03 });
    person(root, -5, 2.2, C.cyan, C.skin, 0.6);
    return { target: [0.4, 1.4, 0], dist: 17, el: 0.3, az: 0.5 };
  },
  cutter(root, { acc }) {
    slab(root, 10, 8, '#D8D2C6');
    box(root, 6, 1, 3.4, '#3A4152', 0, 0.9, 0, { r: 0.1 }); for (const x of [-2.7, 2.7]) for (const z of [-1.4, 1.4]) box(root, 0.2, 0.9, 0.2, '#2C3240', x, 0, z, { r: 0.04 });
    box(root, 5.6, 0.05, 3, '#E9EEF2', 0, 1.9, 0, { r: 0 });
    box(root, 6, 0.25, 0.4, '#4B5468', 0, 2.3, -0.2, { r: 0.06 }); box(root, 0.5, 0.6, 0.6, C.dark, 0.6, 1.95, -0.2, { r: 0.08 });
    const cut = (sh, x, z) => { const m = new THREE.Mesh(sh, mat(acc)); m.rotation.x = -Math.PI / 2; add(root, m, x, 1.96, z); };
    cut(new THREE.RingGeometry(0.4, 0.5, 40), -1.5, 0.6); cut(new THREE.RingGeometry(0.3, 0.38, 6), 1.8, 0.7);
    box(root, 1.0, 0.04, 0.7, C.yel, -0.2, 1.93, 0.8, { r: 0 });
    person(root, 3.8, 1.2, C.mag, C.skin2, -1);
    return { target: [0, 1.5, 0], dist: 13, el: 0.38, az: 0.5 };
  },
  laminator(root, { acc }) {
    slab(root, 10, 7, '#D8D2C6');
    box(root, 3.4, 1.6, 1.8, '#3E4A62', 0, 0.9, 0, { r: 0.18 }); box(root, 0.3, 0.9, 1.4, '#2C3549', -1.4, 0, 0); box(root, 0.3, 0.9, 1.4, '#2C3549', 1.4, 0, 0);
    cyl(root, 0.25, 0.25, 3.0, '#9AA3B5', 0, 1.6, 1.0, { rz: Math.PI / 2, center: true, metal: 0.6, rough: 0.3 });
    box(root, 3, 0.03, 2, '#fff', 0, 1.55, 2.0, { r: 0, map: art('ad', acc, { w: 900, h: 600 }), face: 'top' });
    box(root, 3, 0.03, 1.6, '#fff', 0, 1.3, -1.8, { r: 0, map: art('offer', acc, { w: 900, h: 500 }), face: 'top' });
    box(root, 0.7, 0.3, 0.1, C.yel, 1, 2.1, 0.92, { r: 0.03 });
    person(root, -2.8, 1.4, C.navy, C.skin, 0.8);
    return { target: [0, 1.3, 0.2], dist: 12, el: 0.36, az: 0.5 };
  },
  workshop(root, { acc }) {
    slab(root, 11, 8, '#CDC3B2'); box(root, 11, 4, 0.3, '#DCD5C8', 0, 0, -3.8);
    box(root, 6, 0.2, 2, C.wood, -0.5, 1.2, -0.5, { r: 0.04 }); for (const x of [-3.2, 2.2]) for (const z of [-1.3, 0.3]) box(root, 0.2, 1.2, 0.2, '#5E452C', x, 0, z, { r: 0.03 });
    // frame being built
    for (const [w, h, x, y] of [[3, 0.12, 0, 0], [3, 0.12, 0, 1.6], [0.12, 1.7, -1.45, 0], [0.12, 1.7, 1.45, 0]]) box(root, w, h, 0.12, C.steel, -0.8 + x, 1.4 + y, -0.6, { metal: 0.6, r: 0.02 });
    box(root, 1.6, 0.9, 0.12, acc, 1.6, 1.4, -0.3, { r: 0.04, ry: -0.3 });
    for (let i = 0; i < 7; i++) box(root, 0.15, 0.6 + (i % 3) * 0.25, 0.1, [C.steel, C.navy, acc][i % 3], -4 + i * 0.6, 2.2, -3.55, { r: 0.03 });
    box(root, 2.4, 1.6, 0.1, C.navy, 3.2, 1.8, -3.55, { map: art('sign', acc, { w: 900, h: 600, text: 'SIGN' }), face: 'front', glow: true });
    person(root, 2.5, 0.9, C.navy, C.skin2, -0.6); person(root, -2.4, 1.2, acc, C.skin, 0.4);
    cyl(root, 0.35, 0.35, 0.6, C.dark, 4.2, 0, 1.8); sphere(root, 0.2, acc, -3.8, 1.55, -0.8);
    return { target: [0, 1.6, -0.6], dist: 15, el: 0.32, az: 0.5 };
  },
  dispatch(root, { acc }) {
    slab(root, 11, 8, '#D6CCBA');
    const bx = [[-3.4, 0, 0], [-2.2, 0, 0], [-1, 0, 0], [-2.8, 0.9, 0], [-1.6, 0.9, 0], [-2.2, 1.8, 0], [-3.4, 0, -1.2], [-2.2, 0, -1.2]];
    for (const [x, y, z] of bx) { box(root, 1.1, 0.88, 1.1, '#C99A5B', x, y, z, { r: 0.03 }); box(root, 0.25, 0.01, 1.11, '#E8DCC2', x, y + 0.88, z, { r: 0 }); }
    for (let i = 0; i < 5; i++) cyl(root, 0.24, 0.24, 2.4, [acc, C.navy, C.cyan, C.yel, C.white][i], 1.4 + i * 0.55, 0, -0.6 + (i % 2) * 0.2);
    box(root, 2.6, 0.12, 1.4, C.steel, 2.4, 0.25, 1.8, { metal: 0.5 }); cyl(root, 0.12, 0.12, 0.1, '#222', 1.4, 0.12, 1.3, { rx: Math.PI / 2, center: true }); cyl(root, 0.12, 0.12, 0.1, '#222', 3.4, 0.12, 2.3, { rx: Math.PI / 2, center: true });
    box(root, 0.9, 0.7, 0.9, '#C99A5B', 2.1, 0.37, 1.8, { r: 0.03 }); person(root, 3.8, 1.6, acc, C.skin, -0.9);
    return { target: [0, 1.2, 0], dist: 14, el: 0.34, az: 0.5 };
  },
  entrance(root, { acc }) {
    slab(root, 12, 9, C.sand);
    box(root, 9, 5.4, 4, C.wall, 0, 0, -2.4, { r: 0.05 });
    box(root, 7.6, 1.3, 0.3, C.navy, 0, 3.6, -0.3, { map: art('brand', acc, { w: 1600, h: 280, text: 'M.S. GRAPHICS STUDIO' }), face: 'front', glow: true, r: 0.04 });
    box(root, 2, 2.9, 0.15, C.glass, 0, 0, -0.35, { opacity: 0.8, rough: 0.05 }); box(root, 2.2, 0.15, 0.4, C.navy, 0, 2.9, -0.3);
    box(root, 2.2, 1.8, 0.12, C.glass, -3, 1, -0.35, { opacity: 0.8, rough: 0.05 }); box(root, 2.2, 1.8, 0.12, C.glass, 3, 1, -0.35, { opacity: 0.8, rough: 0.05 });
    box(root, 3, 0.2, 1.4, '#BDB4A3', 0, 0, 0.6, { r: 0.03 }); plant(root, -1.6, 0.6); plant(root, 1.6, 0.6);
    person(root, 2.8, 2.4, C.navy, C.skin, 2.8); box(root, 1.8, 0.8, 1, C.mag, -3.6, 0.1, 2.6, { r: 0.25 });
    return { target: [0, 2.3, -0.5], dist: 19, el: 0.28, az: 0.5 };
  },
  office(root, { acc }) {
    slab(root, 11, 8, '#DDD7CC'); box(root, 11, 4.2, 0.3, C.white, 0, 0, -3.8); box(root, 0.3, 4.2, 7.6, '#F1EEE8', -5.35, 0, 0);
    panel(root, 9, 3, art('brand', acc, { w: 1800, h: 600, text: 'WE BUILD BRANDS' }), 0.3, 2.4, -3.64);
    panel(root, 5, 3, canvasTex(1000, 600, (g, w, h) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, h); g.fillStyle = acc; g.beginPath(); g.moveTo(0, h); g.bezierCurveTo(w * 0.3, h * 0.2, w * 0.6, h * 0.9, w, h * 0.3); g.lineTo(w, h); g.fill(); [C.cyan, C.mag, C.yel, C.navy].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(80 + i * 60, 90, 22, 0, 7); g.fill(); }); }), -5.18, 2.2, 0, Math.PI / 2);
    for (const x of [-2.2, 1.8]) { box(root, 3, 0.1, 1.4, C.wood, x, 1.2, -0.6, { r: 0.03 }); box(root, 0.1, 1.2, 1.2, '#5E452C', x - 1.4, 0, -0.6); box(root, 0.1, 1.2, 1.2, '#5E452C', x + 1.4, 0, -0.6); box(root, 1, 0.65, 0.06, C.dark, x, 1.3, -1, { map: screen(acc), face: 'front', r: 0.02 }); box(root, 0.7, 0.9, 0.7, C.navy, x, 0, 0.6, { r: 0.12 }); }
    person(root, -2.2, 0.8, C.cyan, C.skin, Math.PI, 0.95); plant(root, 4.4, -2.8, 1.2);
    return { target: [0, 1.7, -0.5], dist: 16, el: 0.3, az: 0.5 };
  },
  printitems(root, { acc }) {
    slab(root, 9, 7, '#CDBFA9');
    const sheet = (w, d, x, z, ry, map, y = 0) => box(root, w, 0.03, d, '#fff', x, y, z, { r: 0, map, face: 'top', ry });
    sheet(2.4, 3.3, -1.8, 0, 0.25, art('ad', acc, { w: 600, h: 820 }));
    sheet(2.2, 3.0, 0.6, -0.4, -0.15, art('brand', acc, { w: 600, h: 820 }));
    for (let i = 0; i < 6; i++) sheet(1.6, 0.95, 2.6, 1.4, 0.4, art('brand', acc, { w: 560, h: 330 }), i * 0.03);
    sheet(1.6, 0.95, 2.2, -1.6, -0.5, art('sign', acc, { w: 560, h: 330, text: 'NAME' }));
    cyl(root, 0.06, 0.06, 2, C.navy, -0.4, 0.06, 2.2, { rz: Math.PI / 2, ry: 0.5, center: true });
    cyl(root, 0.35, 0.3, 0.8, C.white, 3.3, 0, -1.8); sphere(root, 0.12, C.yel, -3.3, 0.12, -2.4);
    return { target: [0.2, 0.2, 0], dist: 11, el: 0.75, az: 0.4 };
  },
  packaging(root, { acc }) {
    slab(root, 10, 7, '#D9CFBD');
    box(root, 2, 1.6, 2, acc, -2.4, 0, 0, { map: art('brand', acc, { w: 600, h: 480, text: 'BRAND' }), face: 'front', r: 0.04 });
    box(root, 1.2, 1, 1.2, C.navy, -0.6, 0, 1, { map: art('offer', acc, { w: 400, h: 330, text: 'NEW' }), face: 'front', r: 0.04 });
    box(root, 1.6, 2.2, 0.7, C.navy, 1.6, 0, -0.2, { map: art('brand', acc, { w: 500, h: 700, text: 'BAG' }), face: 'front', r: 0.06 });
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 12, 32, Math.PI), mat(C.navy)); add(root, handle, 1.6, 2.2, -0.2);
    for (let i = 0; i < 3; i++) { cyl(root, 0.3, 0.3, 0.9, [C.white, C.yel, C.cyan][i], 3.2 + i * 0.4, 0, 1.4 - i * 0.6); }
    return { target: [0.2, 1, 0], dist: 12, el: 0.35, az: 0.5 };
  },
  gifts(root, { acc }) {
    slab(root, 10, 7, '#D9CFBD');
    // t-shirt (folded)
    box(root, 2.2, 0.35, 2.6, C.navy, -2.4, 0, 0, { r: 0.12 }); box(root, 0.8, 0.02, 0.8, acc, -2.4, 0.35, 0.1, { r: 0, map: art('brand', acc, { w: 300, h: 300, text: '' }), face: 'top' });
    // mug
    cyl(root, 0.55, 0.55, 1.2, C.white, 0, 0, 0.5, { rough: 0.3 }); const h = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.07, 12, 24), mat(C.white, { rough: 0.3 })); add(root, h, 0.62, 0.6, 0.5); h.rotation.y = Math.PI / 2;
    box(root, 0.7, 0.5, 0.02, acc, 0, 0.35, 1.06, { r: 0 });
    // diary + bottle + box
    box(root, 1.5, 0.3, 2.1, acc, 1.9, 0, -0.3, { r: 0.06 }); box(root, 1.52, 0.31, 0.12, C.dark, 1.3, 0, -0.3, { r: 0.03 });
    cyl(root, 0.28, 0.28, 1.8, C.steel, 3.3, 0, 1.2, { metal: 0.7, rough: 0.25 }); cyl(root, 0.2, 0.25, 0.25, C.dark, 3.3, 1.8, 1.2);
    box(root, 2, 1, 1.4, C.navy, -0.6, 0, -2.2, { map: art('brand', acc, { w: 700, h: 350, text: 'GIFTS' }), face: 'front', r: 0.05 });
    return { target: [0, 0.7, 0], dist: 12, el: 0.42, az: 0.5 };
  },
  identity(root, { acc }) {
    slab(root, 9, 7, '#E3DDD2');
    box(root, 3.2, 0.05, 4.2, '#fff', -1.6, 0, 0, { r: 0, map: canvasTex(640, 840, (g, w, hh) => { g.fillStyle = '#fff'; g.fillRect(0, 0, w, hh); mark(g, w * 0.25, hh * 0.18, w * 0.5, C.navy); g.fillStyle = C.navy; g.font = `800 52px ${FONT}`; g.textAlign = 'center'; g.fillText('MS GRAPHICS', w / 2, hh * 0.68); g.fillStyle = C.mag; g.font = `600 26px ${FONT}`; g.fillText('PRINT · BRANDING · EVENTS', w / 2, hh * 0.75); }), face: 'top', ry: 0.1 });
    [C.navy, C.mag, C.yel, C.cyan].forEach((c, i) => box(root, 2.2, 0.08 + i * 0.001, 0.9, c, 2, i * 0.09, -1.6 + i * 1.05, { r: 0.02, ry: -0.15 }));
    cyl(root, 0.05, 0.05, 2.2, C.dark, 0.6, 0.06, 2.4, { rz: Math.PI / 2, ry: 0.4, center: true });
    return { target: [0.2, 0.2, 0], dist: 10, el: 0.8, az: 0.35 };
  },
  portrait(root, { acc }) {
    slab(root, 7, 6, '#D8CFBF'); box(root, 7, 5, 0.3, C.wall, 0, 0, -2.6);
    panel(root, 4.4, 2.1, art('brand', acc, { w: 1400, h: 660, text: 'M.S. GRAPHICS' }), 0, 2.9, -2.44);
    box(root, 3.2, 0.12, 1.3, C.wood, 0, 1.0, 0.2, { r: 0.04 }); box(root, 0.12, 1.0, 1.2, '#7B5638', -1.45, 0, 0.2, { r: 0.03 }); box(root, 0.12, 1.0, 1.2, '#7B5638', 1.45, 0, 0.2, { r: 0.03 });
    box(root, 0.9, 0.04, 0.6, C.dark, -0.8, 1.12, 0.3, { r: 0.01 }); box(root, 0.9, 0.55, 0.04, C.dark, -0.8, 1.14, 0.05, { r: 0.01, map: screen(acc), face: 'front', ry: 0.1 });
    box(root, 0.5, 0.06, 0.7, '#fff', 0.7, 1.12, 0.35, { r: 0.01, ry: 0.2 }); cyl(root, 0.1, 0.09, 0.22, acc, 1.1, 1.12, 0.1);
    person(root, 0.2, -0.9, C.navy, C.skin, 0, 1.25);
    plant(root, -2.7, -1.8, 1.3); plant(root, 2.7, -1.8, 1);
    return { target: [0, 2.2, -0.6], dist: 11, el: 0.16, az: 0.2, portrait: true };
  },
  team(root, { acc }) {
    slab(root, 12, 8, '#E3DACB'); box(root, 12, 4.4, 0.3, C.wall, 0, 0, -3.6);
    panel(root, 8, 1.6, art('brand', acc, { w: 1600, h: 320, text: 'M.S. GRAPHICS STUDIO' }), 0, 3.2, -3.44);
    const shirts = [C.navy, C.mag, C.cyan, C.navy, C.yel, C.mag, C.navy, C.cyan];
    shirts.forEach((s, i) => person(root, -4.2 + i * 1.2, (i % 2) * 0.9 - 0.4, s, i % 2 ? C.skin2 : C.skin, (i - 3.5) * -0.06, 1));
    plant(root, 5.2, -2.6, 1.2);
    return { target: [0, 1.5, -0.6], dist: 16, el: 0.18, az: 0.25 };
  },
};

export function renderScene(name, opts, W, H) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  const root = new THREE.Group(); scene.add(root);
  const v = scenes[name](root, opts);
  const bg = v.dark ? ['#1B2235', '#0E1424'] : ['#F4F1EA', '#DCD6CA'];
  scene.background = canvasTex(64, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, bg[0]); gr.addColorStop(1, bg[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = v.env ?? 0.55;
  scene.add(new THREE.HemisphereLight('#ffffff', '#b8a98f', v.dark ? 0.6 : 0.9));
  const sun = new THREE.DirectionalLight('#fff7ea', v.dark ? 1.6 : 2.4);
  sun.position.set(-8, 14, 9); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.camera.left = -12; sun.shadow.camera.right = 12; sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12; sun.shadow.radius = 6; sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.02;
  scene.add(sun);
  const fill = new THREE.DirectionalLight('#dfe9ff', 0.5); fill.position.set(10, 6, 4); scene.add(fill);
  const cam = new THREE.PerspectiveCamera(v.portrait ? 32 : 28, W / H, 0.1, 200);
  const [tx, ty, tz] = v.target; const d = v.dist, el = v.el, az = v.az;
  cam.position.set(tx + d * Math.cos(el) * Math.sin(az), ty + d * Math.sin(el), tz + d * Math.cos(el) * Math.cos(az));
  cam.lookAt(tx, ty, tz);
  renderer.render(scene, cam);
  const url = renderer.domElement.toDataURL('image/png');
  pm.dispose(); renderer.dispose(); renderer.forceContextLoss();
  return url;
}
