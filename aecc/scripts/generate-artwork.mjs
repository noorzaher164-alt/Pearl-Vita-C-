/**
 * Generates the AECC decorative artwork set.
 *
 * The brand guide rules out stock photography and cartoon science icons, and asks for
 * "fine-line chemistry diagrams, glassware, molecule rings, leaves and restrained spark
 * details matching the logo". Everything here is drawn from that vocabulary using only
 * approved palette values, so the preview build ships with no external imagery.
 *
 *   node scripts/generate-artwork.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const PALETTE = {
  plum: '#48132F',
  plumDark: '#3C0824',
  dustyRose: '#9F656B',
  berry: '#764E61',
  softRose: '#D7A7A5',
  ivory: '#FBEAE6',
  roseGold: '#CB8C78',
  mauve: '#AF949E',
  blush: '#FDF5EF',
};

/** Deterministic small PRNG so regenerating the set produces identical files. */
function rng(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ----------------------------------------------------------------- motifs -- */

/** The broken rose-gold circle from the logo, with its dotted counter-arc. */
function orbital(cx, cy, r, opacity = 0.55) {
  const dots = [];
  for (let i = 0; i < 7; i += 1) {
    const a = Math.PI * (0.62 + i * 0.055);
    const rr = 1.6 + i * 0.35;
    dots.push(
      `<circle cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" r="${rr.toFixed(1)}" fill="${PALETTE.roseGold}" opacity="${opacity}"/>`,
    );
  }
  return `
    <path d="M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${(cx + r * 0.72).toFixed(1)} ${(cy + r * 0.69).toFixed(1)}"
          fill="none" stroke="${PALETTE.roseGold}" stroke-width="1.25" opacity="${opacity}" stroke-linecap="round"/>
    ${dots.join('')}`;
}

/** The four-point spark used sparingly in the logo. */
function spark(cx, cy, size, colour = PALETTE.roseGold, opacity = 0.75) {
  const s = size;
  return `<path d="M ${cx} ${cy - s} Q ${cx + s * 0.18} ${cy - s * 0.18} ${cx + s} ${cy}
      Q ${cx + s * 0.18} ${cy + s * 0.18} ${cx} ${cy + s}
      Q ${cx - s * 0.18} ${cy + s * 0.18} ${cx - s} ${cy}
      Q ${cx - s * 0.18} ${cy - s * 0.18} ${cx} ${cy - s} Z"
      fill="${colour}" opacity="${opacity}"/>`;
}

/** A single botanical leaf, as in the branch rising from the test tube. */
function leaf(x, y, len, angle, colour, opacity) {
  const rad = (angle * Math.PI) / 180;
  const tx = x + Math.cos(rad) * len;
  const ty = y + Math.sin(rad) * len;
  const w = len * 0.34;
  const nx = Math.cos(rad + Math.PI / 2) * w;
  const ny = Math.sin(rad + Math.PI / 2) * w;
  return `
    <path d="M ${x.toFixed(1)} ${y.toFixed(1)}
             Q ${(x + (tx - x) * 0.5 + nx).toFixed(1)} ${(y + (ty - y) * 0.5 + ny).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}
             Q ${(x + (tx - x) * 0.5 - nx).toFixed(1)} ${(y + (ty - y) * 0.5 - ny).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} Z"
          fill="${colour}" opacity="${opacity}"/>
    <path d="M ${x.toFixed(1)} ${y.toFixed(1)} L ${tx.toFixed(1)} ${ty.toFixed(1)}"
          stroke="${PALETTE.berry}" stroke-width="0.7" opacity="${(opacity * 0.7).toFixed(2)}" fill="none"/>`;
}

/** The botanical branch motif. */
function branch(x, y, height, rand) {
  const parts = [
    `<path d="M ${x} ${y} C ${x - height * 0.06} ${y - height * 0.35} ${x + height * 0.08} ${y - height * 0.65} ${x + height * 0.02} ${y - height}"
           stroke="${PALETTE.berry}" stroke-width="1.1" fill="none" opacity="0.5"/>`,
  ];
  const count = 6;
  for (let i = 0; i < count; i += 1) {
    const t = 0.18 + (i / count) * 0.78;
    const ly = y - height * t;
    const lx = x + Math.sin(t * 3) * height * 0.05;
    const side = i % 2 === 0 ? 1 : -1;
    const len = height * (0.15 + rand() * 0.08);
    parts.push(
      leaf(lx, ly, len, side === 1 ? -32 - rand() * 22 : -148 + rand() * 22, PALETTE.softRose, 0.5),
    );
  }
  return parts.join('');
}

/** Fine-line test tube, outline only. */
function testTube(x, y, w, h) {
  const r = w / 2;
  return `
    <path d="M ${x} ${y} L ${x} ${y + h - r} A ${r} ${r} 0 0 0 ${x + w} ${y + h - r} L ${x + w} ${y}"
          fill="none" stroke="${PALETTE.roseGold}" stroke-width="1.4" opacity="0.6" stroke-linecap="round"/>
    <line x1="${x - 3}" y1="${y}" x2="${x + w + 3}" y2="${y}" stroke="${PALETTE.roseGold}" stroke-width="1.4" opacity="0.6" stroke-linecap="round"/>
    <path d="M ${x + 1.5} ${y + h * 0.42} L ${x + 1.5} ${y + h - r} A ${r - 1.5} ${r - 1.5} 0 0 0 ${x + w - 1.5} ${y + h - r} L ${x + w - 1.5} ${y + h * 0.42} Z"
          fill="${PALETTE.softRose}" opacity="0.34"/>`;
}

/** Fine-line conical flask, outline only. */
function flask(cx, y, h) {
  const neck = h * 0.16;
  const base = h * 0.46;
  return `
    <path d="M ${cx - neck / 2} ${y} L ${cx - neck / 2} ${y + h * 0.34} L ${cx - base} ${y + h}
             L ${cx + base} ${y + h} L ${cx + neck / 2} ${y + h * 0.34} L ${cx + neck / 2} ${y} Z"
          fill="none" stroke="${PALETTE.roseGold}" stroke-width="1.4" opacity="0.6" stroke-linejoin="round"/>
    <line x1="${cx - neck / 2 - 4}" y1="${y}" x2="${cx + neck / 2 + 4}" y2="${y}"
          stroke="${PALETTE.roseGold}" stroke-width="1.4" opacity="0.6" stroke-linecap="round"/>
    <path d="M ${cx - base * 0.72} ${y + h * 0.7} L ${cx - base} ${y + h} L ${cx + base} ${y + h} L ${cx + base * 0.72} ${y + h * 0.7} Z"
          fill="${PALETTE.softRose}" opacity="0.3"/>`;
}

/** Hexagonal molecule ring with bond stubs. */
function moleculeRing(cx, cy, r, opacity = 0.5) {
  const pts = [];
  for (let i = 0; i < 6; i += 1) {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const nodes = pts
    .map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${PALETTE.dustyRose}" opacity="${opacity + 0.15}"/>`)
    .join('');
  const stubs = pts
    .filter((_, i) => i % 2 === 0)
    .map(([x, y]) => {
      const dx = (x - cx) * 0.34;
      const dy = (y - cy) * 0.34;
      return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}" stroke="${PALETTE.mauve}" stroke-width="1.1" opacity="${opacity}"/>`;
    })
    .join('');
  return `<polygon points="${poly}" fill="none" stroke="${PALETTE.mauve}" stroke-width="1.2" opacity="${opacity}"/>${stubs}${nodes}`;
}

/** Rising bubbles, as above the test tube in the logo. */
function bubbles(x, y, rand) {
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    const bx = x + (rand() - 0.5) * 34;
    const by = y - i * 22 - rand() * 10;
    const r = 2 + rand() * 5;
    out += `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="${r.toFixed(1)}" fill="${PALETTE.softRose}" opacity="${(0.5 - i * 0.05).toFixed(2)}"/>`;
  }
  return out;
}

/* --------------------------------------------------------------- composer -- */

const MOTIFS = ['branch-tube', 'flask-ring', 'orbital-molecule', 'branch-ring', 'tube-bubbles', 'double-ring'];

function cover(seedName, { w = 1200, h = 800, motif } = {}) {
  const rand = rng(seedName);
  const chosen = motif ?? MOTIFS[Math.floor(rand() * MOTIFS.length)];
  const layers = [];

  // Warm ground — never pure white (guide §4 background rule).
  layers.push(`
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${PALETTE.blush}"/>
        <stop offset="55%" stop-color="${PALETTE.ivory}"/>
        <stop offset="100%" stop-color="#F6DED9"/>
      </linearGradient>
      <radialGradient id="v" cx="0.72" cy="0.28" r="0.85">
        <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" fill="url(#v)"/>`);

  const cx = w * (0.58 + rand() * 0.14);
  const cy = h * 0.5;
  const r = Math.min(w, h) * 0.3;

  switch (chosen) {
    case 'branch-tube':
      layers.push(orbital(cx - r * 0.15, cy, r));
      layers.push(branch(cx + r * 0.3, cy + r * 0.28, r * 1.15, rand));
      layers.push(testTube(cx + r * 0.18, cy + r * 0.2, 46, 108));
      layers.push(bubbles(cx + r * 0.7, cy - r * 0.2, rand));
      break;
    case 'flask-ring':
      layers.push(orbital(cx, cy, r));
      layers.push(flask(cx, cy - r * 0.45, r * 1.05));
      layers.push(moleculeRing(cx - r * 0.95, cy - r * 0.5, 30, 0.4));
      break;
    case 'orbital-molecule':
      layers.push(orbital(cx, cy, r));
      layers.push(moleculeRing(cx, cy, r * 0.52, 0.5));
      layers.push(moleculeRing(cx + r * 0.85, cy + r * 0.5, 24, 0.35));
      break;
    case 'branch-ring':
      layers.push(orbital(cx, cy, r));
      layers.push(branch(cx - r * 0.1, cy + r * 0.75, r * 1.3, rand));
      layers.push(moleculeRing(cx + r * 0.72, cy - r * 0.4, 28, 0.4));
      break;
    case 'tube-bubbles':
      layers.push(orbital(cx, cy, r));
      layers.push(testTube(cx - 24, cy - 20, 50, 122));
      layers.push(bubbles(cx, cy - 46, rand));
      layers.push(leaf(cx + 4, cy - 24, 62, -48, PALETTE.softRose, 0.45));
      break;
    default:
      layers.push(orbital(cx, cy, r));
      layers.push(moleculeRing(cx - r * 0.35, cy, r * 0.42, 0.45));
      layers.push(moleculeRing(cx + r * 0.42, cy + r * 0.22, r * 0.32, 0.35));
      layers.push(branch(cx + r * 0.95, cy + r * 0.8, r * 0.8, rand));
  }

  layers.push(spark(w * (0.12 + rand() * 0.1), h * (0.18 + rand() * 0.14), 13));
  layers.push(spark(w * (0.82 + rand() * 0.08), h * (0.74 + rand() * 0.12), 9, PALETTE.softRose, 0.6));

  // Hairline rule, echoing the logo's divider.
  layers.push(
    `<line x1="${w * 0.08}" y1="${h * 0.88}" x2="${w * 0.34}" y2="${h * 0.88}" stroke="${PALETTE.roseGold}" stroke-width="1" opacity="0.4"/>`,
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-hidden="true">${layers.join('')}</svg>`;
}

/** Monogram avatar in the brand palette — no photographs of students are shipped. */
function avatar(initials, seedName) {
  const rand = rng(seedName);
  const grounds = [PALETTE.plum, PALETTE.dustyRose, PALETTE.berry, PALETTE.mauve, PALETTE.roseGold];
  const ground = grounds[Math.floor(rand() * grounds.length)];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96" role="img">
    <rect width="96" height="96" rx="48" fill="${PALETTE.blush}"/>
    <circle cx="48" cy="48" r="46" fill="none" stroke="${ground}" stroke-width="1" opacity="0.35"/>
    <circle cx="48" cy="48" r="38" fill="${ground}" opacity="0.14"/>
    <text x="48" y="48" text-anchor="middle" dominant-baseline="central"
          font-family="Georgia, 'Bodoni Moda', serif" font-size="30" fill="${ground}" letter-spacing="1">${initials}</text>
  </svg>`;
}

/* ------------------------------------------------------------------- run --- */

const targets = [];

const coverNames = [
  'cover-tea',
  'cover-green',
  'cover-curie',
  'cover-soap',
  'cover-water',
  'cover-table',
  'cover-week',
  'cover-food',
  'cover-medicine',
  'cover-interview',
  'cover-buffer',
  'cover-flame',
  'issue-01',
  'issue-02',
];
for (const name of coverNames) {
  targets.push([`public/media/covers/${name}.svg`, cover(name)]);
}

const eventNames = [
  'event-titration',
  'event-exhibition',
  'event-green-week',
  'event-competition',
  'event-open-lab',
];
for (const name of eventNames) {
  targets.push([`public/media/events/${name}.svg`, cover(name, { w: 1200, h: 640 })]);
}

const projectNames = ['project-green', 'project-water', 'project-week', 'project-sustainability'];
for (const name of projectNames) {
  targets.push([`public/media/projects/${name}.svg`, cover(name, { w: 1200, h: 700 })]);
}

const albumNames = [
  'album-chemistry-week',
  'album-experiment-day',
  'album-exhibition',
  'album-competition',
  'album-meetings',
];
for (const name of albumNames) {
  targets.push([`public/media/gallery/${name}.svg`, cover(name, { w: 1000, h: 700 })]);
  for (let i = 1; i <= 6; i += 1) {
    targets.push([`public/media/gallery/${name}-${i}.svg`, cover(`${name}-${i}`, { w: 900, h: 640 })]);
  }
}

// Public hero plate
targets.push(['public/media/hero.svg', cover('aecc-hero-plate', { w: 1400, h: 900, motif: 'branch-tube' })]);
targets.push(['public/media/login.svg', cover('aecc-login-plate', { w: 1000, h: 1200, motif: 'orbital-molecule' })]);

// Monogram avatars for the seeded roster
const initialsList = [
  ['AH', 'u-001'], ['HQ', 'u-002'], ['SM', 'u-003'], ['LO', 'u-004'], ['NS', 'u-005'],
  ['JG', 'u-006'], ['RZ', 'u-007'], ['DS', 'u-008'], ['GA', 'u-009'], ['MD', 'u-010'],
  ['AF', 'u-011'], ['SB', 'u-012'], ['LS', 'u-013'], ['JH', 'u-014'], ['RA', 'u-015'],
  ['HM', 'u-016'], ['WR', 'u-017'], ['RS', 'u-018'], ['YQ', 'u-019'], ['DK', 'u-020'],
  ['SY', 'u-021'], ['TB', 'u-022'], ['AS', 'u-023'], ['BN', 'u-024'], ['NJ', 'u-025'],
  ['LH', 'u-026'], ['RM', 'u-027'], ['RS', 'u-028'], ['SK', 'u-029'], ['FR', 'u-030'],
];
for (const [initials, id] of initialsList) {
  targets.push([`public/media/avatars/${id}.svg`, avatar(initials, id)]);
}

for (const [relPath, content] of targets) {
  const full = join(ROOT, relPath);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf8');
}

console.log(`Generated ${targets.length} AECC artwork files.`);
