import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ja = JSON.parse(fs.readFileSync(path.join(root, 'data', 'jan_aushadhi.json'), 'utf8'));
const br = JSON.parse(fs.readFileSync(path.join(root, 'data', 'brands.json'), 'utf8'));

const normaliseSalt = (s) => String(s).toLowerCase().trim();
const normaliseStrength = (s = '') =>
  String(s)
    .toLowerCase()
    .replace(/\s+/g, '')
    .split('+')
    .map((p) => {
      const g = p.match(/^([\d.]+)g$/);
      return g ? `${+g[1] * 1000}mg` : p;
    })
    .join('+');
const key = (salts, str) => salts.map(normaliseSalt).join('|') + '@' + normaliseStrength(str);

const errors = [];

if (!Array.isArray(ja) || !ja.length) errors.push('jan_aushadhi.json empty');
if (!Array.isArray(br) || !br.length) errors.push('brands.json empty');

const byKey = new Map();
for (const [i, g] of ja.entries()) {
  if (!g || typeof g !== 'object') {
    errors.push(`generic[${i}] not an object`);
    continue;
  }
  if (!Array.isArray(g.salts) || !g.salts.length) errors.push(`generic[${i}] missing salts`);
  if (!g.strength) errors.push(`generic[${i}] missing strength`);
  if (typeof g.mrp !== 'number' || Number.isNaN(g.mrp)) errors.push(`generic[${i}] bad mrp`);
  const parts = String(g.strength).split('+');
  if (Array.isArray(g.salts) && g.salts.length !== parts.length) {
    errors.push(`generic[${i}] salt count ≠ strength parts (${g.generic_name})`);
  }
  if (Array.isArray(g.salts) && g.strength) byKey.set(key(g.salts, g.strength), g);
}

for (const [i, b] of br.entries()) {
  if (!b || typeof b !== 'object') {
    errors.push(`brand[${i}] not an object`);
    continue;
  }
  if (!Array.isArray(b.salts) || !b.salts.length) errors.push(`brand[${i}] missing salts`);
  if (!b.strength) errors.push(`brand[${i}] missing strength`);
  if (typeof b.approx_mrp !== 'number' || Number.isNaN(b.approx_mrp)) {
    errors.push(`brand[${i}] bad approx_mrp`);
  }
  const parts = String(b.strength || '').split('+');
  if (Array.isArray(b.salts) && b.salts.length !== parts.length) {
    errors.push(`brand[${i}] salt count ≠ strength parts (${b.brand})`);
  }
  if (Array.isArray(b.salts) && b.strength && !byKey.has(key(b.salts, b.strength))) {
    errors.push(`brand[${i}] "${b.brand}" has no matching generic for ${b.salts.join('+')} ${b.strength}`);
  }
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`OK: ${ja.length} generics, ${br.length} brands`);
