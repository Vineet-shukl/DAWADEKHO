import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Fuse from 'fuse.js';
import { createMatcher, normaliseStrength } from '../match.js';

const ja = JSON.parse(fs.readFileSync('data/jan_aushadhi.json', 'utf8'));
const br = JSON.parse(fs.readFileSync('data/brands.json', 'utf8'));
const m = createMatcher(ja, br, Fuse);

test('normalises strength', () => {
  assert.equal(normaliseStrength('650 MG'), '650mg');
  assert.equal(normaliseStrength('0.5 g'), '500mg');
});

for (const q of ['dolo 650', 'dolo65o', 'Dolo-650', 'DOLO650']) {
  test(`typo: ${q}`, () => assert.equal(m.search(q)?.brand?.brand, 'Dolo 650'));
}

test('brand → generic with same salts and strength', () => {
  const r = m.search('dolo 650');
  assert.deepEqual(r.generic.salts, ['paracetamol']);
  assert.equal(normaliseStrength(r.generic.strength), '650mg');
});

test('unknown returns null', () => assert.equal(m.search('zzqxv'), null));

test('lookup by salt and strength (photo path)', () => {
  const r = m.bySalt(['Paracetamol'], '650 mg');
  assert.ok(r?.generic);
});

test('wrong strength does not match', () =>
  assert.equal(m.bySalt(['paracetamol'], '9999mg'), null));

test('salt and common name find the generic', () => {
  assert.equal(m.search('paracetamol')?.generic.salts[0], 'paracetamol');
  assert.equal(m.search('pcm')?.generic.salts[0], 'paracetamol');
  assert.equal(m.search('acetaminophen 650')?.generic.strength, '650mg');
  assert.equal(m.bySalt(['Acetaminophen'], '650 mg')?.generic.salts[0], 'paracetamol');
});

test('live prefix guess prefers the name being typed', () => {
  const top = m.suggest('dol', 4).map((h) => h.label);
  assert.equal(top[0], 'Dolo 650');
  assert.ok(top.includes('Dolo 500'));
  assert.equal(m.suggest('pan', 1)[0].label, 'Pan 40');
});
