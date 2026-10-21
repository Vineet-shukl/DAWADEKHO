# DawaDekho — Implementation Plan

> **For agentic workers:** execute task-by-task with `superpowers:subagent-driven-development`. Tasks A1–D1 are independent and run **in parallel**. E and F run after them. Commit after every task with a clear message.

**Goal:** a working, deployed web app for PS3 that uses Gemma 4 (strip reading) and DigitalOcean (hosting plus Function), at ₹0.

**Architecture:** static site with no framework (HTML/CSS/vanilla JS, Fuse.js from CDN) on DigitalOcean App Platform's free static tier. One DigitalOcean Function (`doctl serverless`, free allowance) proxies photos to Gemma 4 on the Gemini API. All drug facts come from bundled JSON.

**Tech:** HTML5, CSS custom properties, ES modules, Fuse.js 7, Node 18 (`node --test`), DigitalOcean Functions, Gemini REST API, model `gemma-4-26b-a4b-it`.

**Read first:** `docs/PRD.md`, `docs/DESIGN-SYSTEM.md`, `docs/UX-COPY.md`.

---

## File map

```
dawadekho/
├─ index.html              # D2 + B
├─ style.css               # B (tokens from DESIGN-SYSTEM.md)
├─ app.js                  # B (UI, flows, state)
├─ i18n.js                 # B (strings from UX-COPY.md)
├─ match.js                # A2 (pure matching logic, no DOM)
├─ config.js               # E  (API URL)
├─ data/jan_aushadhi.json  # A1
├─ data/brands.json        # A1
├─ scripts/validate-data.mjs  # A1
├─ tests/match.test.mjs    # A2
├─ functions/              # C  (doctl serverless project)
│  ├─ project.yml
│  └─ packages/api/read-strip/index.js
├─ robots.txt · sitemap.xml · llms.txt · manifest.webmanifest · icon.svg   # D1
├─ README.md · LICENSE · CONTRIBUTING.md · .gitignore                     # D1
└─ package.json            # A2 (test script only)
```

---

## Task A1 — Data (agent: Data)

**Files:** `data/jan_aushadhi.json`, `data/brands.json`, `scripts/validate-data.mjs`

- [ ] **1.** Build `jan_aushadhi.json`: ~200 common generics from the official PMBI product list (janaushadhi.gov.in). Cover pain/fever, antacid/PPI, antibiotics, diabetes, BP, cholesterol, thyroid, antiallergic, vitamins.
```json
[{ "code": "1", "generic_name": "Aceclofenac 100mg and Paracetamol 325mg Tablets",
   "salts": ["aceclofenac","paracetamol"], "strength": "100mg+325mg",
   "form": "tablet", "unit": "10's", "mrp": 10.32,
   "group": "Analgesic/Antipyretic/Anti-Inflammatory" }]
```
Salts are lower-case and in the same order as the strengths. Strength uses `mg`, `mcg` or `%`, joined with `+`.

- [ ] **2.** Build `brands.json`: ~60 common brands whose salt **and** strength exist in step 1.
```json
[{ "brand": "Dolo 650", "aliases": ["dolo","dolo650"], "salts": ["paracetamol"],
   "strength": "650mg", "form": "tablet", "approx_mrp": 30.91,
   "note": "approx MRP, verify on strip" }]
```
- [ ] **3.** `scripts/validate-data.mjs`: fail (exit 1) if any entry lacks salts, strength or a numeric `mrp`/`approx_mrp`, if salt count ≠ strength parts, or if a brand has no generic with the same salts and strength.
- [ ] **4.** Run `node scripts/validate-data.mjs` and expect `OK: <n> generics, <m> brands`.
- [ ] **5.** Commit `data: add Jan Aushadhi snapshot and brand map`.

## Task A2 — Matching logic (agent: Data)

**Files:** `match.js`, `tests/match.test.mjs`, `package.json`

- [ ] **1.** Write the failing tests first:
```js
// tests/match.test.mjs
import test from 'node:test'; import assert from 'node:assert/strict';
import { createMatcher, normaliseStrength } from '../match.js';
import fs from 'node:fs';
const ja = JSON.parse(fs.readFileSync('data/jan_aushadhi.json'));
const br = JSON.parse(fs.readFileSync('data/brands.json'));
const m = createMatcher(ja, br);

test('normalises strength', () => {
  assert.equal(normaliseStrength('650 MG'), '650mg');
  assert.equal(normaliseStrength('0.5 g'), '500mg');
});
for (const q of ['dolo 650','dolo65o','Dolo-650','DOLO650'])
  test(`typo: ${q}`, () => assert.equal(m.search(q)?.brand?.brand, 'Dolo 650'));
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
```
- [ ] **2.** Run `node --test` and expect a FAIL (module missing).
- [ ] **3.** Implement `match.js` (pure ES module; Fuse is injected so tests run in Node):
```js
const ALIASES = { acetaminophen: 'paracetamol', pan: 'pantoprazole' };
export const normaliseSalt = s => { const k = s.toLowerCase().trim(); return ALIASES[k] || k; };
export function normaliseStrength(s = '') {
  return s.toLowerCase().replace(/\s+/g, '').split('+').map(p => {
    const g = p.match(/^([\d.]+)g$/); return g ? `${+g[1] * 1000}mg` : p;
  }).join('+');
}
const key = (salts, str) => salts.map(normaliseSalt).join('|') + '@' + normaliseStrength(str);
const clean = q => q.toLowerCase().replace(/o(?=\d)|(?<=\d)o/g, '0').replace(/[^a-z0-9]/g, '');

export function createMatcher(generics, brands, Fuse = globalThis.Fuse) {
  const byKey = new Map(generics.map(g => [key(g.salts, g.strength), g]));
  const rows = [
    ...brands.map(b => ({ kind: 'brand', b, k: [b.brand, ...b.aliases].map(clean) })),
    ...generics.map(g => ({ kind: 'generic', g, k: [clean(g.generic_name)] })),
  ];
  const fuse = new Fuse(rows, { keys: ['k'], threshold: 0.35, includeScore: true, ignoreLocation: true });
  const bySalt = (salts, strength) => {
    const g = byKey.get(key(salts, strength)); return g ? { generic: g } : null;
  };
  const search = (q, limit = 3) => {
    const hits = fuse.search(clean(q), { limit });
    if (!hits.length) return null;
    const top = hits[0].item;
    if (top.kind === 'generic') return { generic: top.g, alternatives: hits.slice(1) };
    const generic = byKey.get(key(top.b.salts, top.b.strength));
    return generic ? { brand: top.b, generic, alternatives: hits.slice(1) } : null;
  };
  return { search, bySalt };
}
export const savings = (branded, generic) => {
  const amt = Math.max(0, branded - generic);
  return { amount: +amt.toFixed(2), pct: branded ? Math.round(amt / branded * 100) : 0 };
};
```
Tests import Fuse with `import Fuse from 'fuse.js'` and pass it in. Add `fuse.js` as a devDependency and `"test": "node --test"` to `package.json`.
- [ ] **4.** Run `npm i -D fuse.js && npm test` and expect all PASS.
- [ ] **5.** Commit `feat: fuzzy brand and salt matcher with tests`.

## Task B — Frontend (agent: Frontend)

**Files:** `index.html`, `style.css`, `app.js`, `i18n.js`

- [ ] **1.** `style.css`: paste the tokens, fonts, type scale and breakpoints **exactly** from `DESIGN-SYSTEM.md` §2–5. Build the components in §6 (header, primary actions, search combobox, chips, confirm card, receipt card, states). Respect reduced motion.
- [ ] **2.** `i18n.js`: export `strings = { en: {...}, hi: {...} }` with every key from `UX-COPY.md`, plus `t(key, vars)`. Language is stored in `localStorage` inside try/catch and sets `document.documentElement.lang`.
- [ ] **3.** `index.html`: semantic layout (`header`, `main#main`, skip link). Static `<h1>`, 3-step list and "About the data" paragraph (needed for SEO). Fuse.js from `https://cdn.jsdelivr.net/npm/fuse.js@7/dist/fuse.min.js`. `<script type="module" src="app.js">`.
- [ ] **4.** `app.js`, flows from PRD §6:
  - Load both JSON files, then `createMatcher`.
  - Search: debounce 120 ms, ARIA combobox (↑↓ Enter Esc), example chips run the search.
  - Photo: `<input type="file" accept="image/*" capture="environment">`. Resize on a canvas to ≤ 1024 px JPEG (q 0.8). POST `{image: base64}` to `CONFIG.API_URL` with a 15 s `AbortController`. Show the confirm card with editable fields, then `bySalt()`, falling back to `search(brand)`.
  - Result: receipt card with savings (strip MRP or `approx_mrp` plus the "approx" tag), the Kendra link (`https://janaushadhi.gov.in/KendraDetails.aspx`), the Sugam app link and the disclaimer. The result region has `aria-live="polite"`.
  - Errors map to the `err.*` strings, and focus moves back to search.
  - Offline banner via `navigator.onLine` events.
- [ ] **5.** Manual check at 320, 375, 768 and 1280 px, and at 200% zoom: no horizontal scroll, all targets ≥ 48 px.
- [ ] **6.** Commit `feat: responsive bilingual UI with search and photo flows`.

## Task C — Gemma 4 Function (agent: Gemma)

**Files:** `functions/project.yml`, `functions/packages/api/read-strip/index.js`

- [ ] **1.** `project.yml`:
```yaml
environment:
  GEMINI_API_KEY: ${GEMINI_API_KEY}
  ALLOWED_ORIGIN: ${ALLOWED_ORIGIN}
packages:
  - name: api
    functions:
      - name: read-strip
        runtime: nodejs:18
        web: true
        limits: { timeout: 20000, memory: 256 }
```
- [ ] **2.** `index.js`:
```js
const MODEL = 'gemma-4-26b-a4b-it';
const PROMPT = `You read photos of Indian medicine strips or boxes.
Return ONLY a JSON object, no other text:
{"brand": string|null, "salts": string[], "strength": string|null,
 "form": "tablet"|"capsule"|"syrup"|"injection"|"other"|null,
 "mrp_printed": number|null, "readable": boolean}
Rules: copy only text printed in the image. If unsure, use null.
Never guess a salt or price that is not printed. Strength like "650mg" or "500mg+125mg".`;

export async function main(args) {
  const origin = process.env.ALLOWED_ORIGIN || '*';
  const headers = { 'Access-Control-Allow-Origin': origin, 'Content-Type': 'application/json' };
  const reply = (statusCode, body) => ({ statusCode, headers, body });
  if (args.__ow_method === 'options') return reply(204, '');
  const image = args.image;
  if (!image || typeof image !== 'string') return reply(400, { error: 'no_image' });
  if (image.length > 2.8e6) return reply(413, { error: 'too_big' });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;
  try {
    const r = await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(15000),
      body: JSON.stringify({ contents: [{ role: 'user', parts: [
        { inline_data: { mime_type: 'image/jpeg', data: image } }, { text: PROMPT } ] }],
        generationConfig: { temperature: 0 } })
    });
    if (r.status === 429) return reply(429, { error: 'busy' });
    if (!r.ok) return reply(502, { error: 'upstream', status: r.status });
    const j = await r.json();
    const text = j.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return reply(422, { error: 'unreadable' });
    const d = JSON.parse(m[0]);
    if (!d.readable) return reply(422, { error: 'unreadable' });
    return reply(200, {
      brand: d.brand ?? null,
      salts: Array.isArray(d.salts) ? d.salts.filter(s => typeof s === 'string') : [],
      strength: d.strength ?? null, form: d.form ?? null,
      mrp_printed: typeof d.mrp_printed === 'number' ? d.mrp_printed : null
    });
  } catch (e) {
    return reply(e.name === 'TimeoutError' ? 504 : 500, { error: e.name === 'TimeoutError' ? 'timeout' : 'generic' });
  }
}
```
- [ ] **3.** Local smoke test: `GEMINI_API_KEY=... node -e "import('./functions/packages/api/read-strip/index.js').then(async m=>console.log(await m.main({image: require('fs').readFileSync('strip.jpg').toString('base64')})))"` and expect a 200 with a salts array.
- [ ] **4.** Commit `feat: DigitalOcean Function that reads strips with Gemma 4`.

## Task D1 — Repo hygiene and SEO files (agent: Repo)

**Files:** `README.md`, `LICENSE`, `CONTRIBUTING.md`, `.gitignore`, `robots.txt`, `sitemap.xml`, `llms.txt`, `manifest.webmanifest`, `icon.svg`

- [ ] **1.** `LICENSE`: MIT, "2026 Richa and DawaDekho contributors".
- [ ] **2.** `README.md` sections: one-line pitch · screenshot · live URL · Problem (PS3) · How it works (diagram from PRD §7) · **What Gemma does, and where it fails** · Data source and snapshot date · Run locally · Deploy to DigitalOcean (free) · Tests · **Credits: every tool** (Gemma 4, Gemini API, DigitalOcean App Platform and Functions, Fuse.js, Google Fonts Mukta and IBM Plex Mono, PMBI data, AI coding assistants used) · Disclaimer · Licence.
- [ ] **3.** `CONTRIBUTING.md`: how to add a medicine (edit JSON, run the validator), code style, PR checklist.
- [ ] **4.** `.gitignore`: `node_modules/`, `.env`, `functions/.deployed/`, `*.jpg` test photos.
- [ ] **5.** SEO files exactly per `SEO-AI-VISIBILITY.md` §4.
- [ ] **6.** Commit `docs: README, licence, contributing, SEO files`.

## Task E — Integrate (lead, after A–D)

- [ ] **1.** `config.js`: `export const CONFIG = { API_URL: '<function URL>' }`.
- [ ] **2.** `<head>` and JSON-LD from `SEO-AI-VISIBILITY.md` §1–2 go into `index.html`.
- [ ] **3.** Run `python3 -m http.server 8080` and test on a phone over LAN: typed search (5 brands and 3 typos), photo (3 real strips), no-match, airplane mode.
- [ ] **4.** `npm test && node scripts/validate-data.mjs` and expect both green.
- [ ] **5.** Commit `feat: wire UI to Gemma function`.

## Task F — Deploy to DigitalOcean (free) and demo (lead)

- [ ] **1.** Function: `doctl serverless install && doctl serverless connect && cd functions && GEMINI_API_KEY=... ALLOWED_ORIGIN=https://<app>.ondigitalocean.app doctl serverless deploy .`, then copy the URL from `doctl sls fn get api/read-strip --url`.
- [ ] **2.** Static site: in App Platform, create an app from the GitHub repo, choose the **Static Site** component, leave the build command empty and set the output dir to `/`. This lands on the free tier (3 static apps).
- [ ] **3.** Put the real URLs into `config.js`, `ALLOWED_ORIGIN`, the canonical link, the sitemap and the README. Redeploy.
- [ ] **4.** Run Lighthouse on mobile: Accessibility ≥ 95, SEO ≥ 95.
- [ ] **5.** Demo script (3 min): Ramesh's story → photo of a real strip → confirm → "₹X → ₹Y" → Kendra button → show the README "where Gemma fails" section and the commit history.
- [ ] **6.** Commit `chore: production URLs` and tag `v1.0-hackfest`.

---

## Self-review
- Every PRD "must have" (M1–M9) maps to a task: M1 → A2/B · M2 → B/C · M3/M4 → A1/A2/B · M5 → A2/B · M6/M7/M8 → B · M9 → B/E.
- The golden rule is enforced in three places: the Function prompt, matching by dataset key only, and the editable confirm step.
- No placeholders remain except the real URLs and keys, which only exist after deploy.
