# DawaDekho

**Dawa dekho, daam dekho.** See the medicine. See the price. Before you pay.

Free, open-source web app for Hackfest Lucknow PS3 — *The Prescription You Cannot Read*. Type a brand (or photograph a **printed** strip) and see the Jan Aushadhi generic with the same salt and strength, with the saving as the headline: **₹240 → ₹28**.

**Live URL:** *(set after DigitalOcean deploy)* `https://REPLACE.ondigitalocean.app/`

---

## Problem (PS3)

Patients pay branded MRP at the counter because they don’t know the molecule or the Jan Aushadhi price. DawaDekho makes that cost visible **before** they pay — with fuzzy search, honest no-match, and a hard medical disclaimer.

## How it works

```
Browser (static site, DigitalOcean App Platform)
 ├─ index.html · style.css · app.js · i18n.js
 ├─ match.js  ── Fuse.js fuzzy search over bundled JSON
 ├─ data/jan_aushadhi.json · data/brands.json
 └─ photo ──► POST /api/read-strip
                 │
     DigitalOcean Function (Node 18)
                 │  env: GEMINI_API_KEY (never in the browser)
                 ▼
     Gemini API → gemma-4-26b-a4b-it (image → search keys only)
```

All **facts** (salts, strengths, prices) come from shipped JSON. Gemma’s output is only a **search key**.

## What Gemma does, and where it fails

| Gemma 4 **may** | Gemma 4 **must never** |
|---|---|
| Read **printed** text on a strip or box | Invent a drug name, salt, price, or alternative |
| Return structured `{brand, salts, strength, mrp_printed}` | Give dosage, side-effect, or medical advice |
| Return null / `readable: false` when unsure | Fill gaps with guesses |

**Fails on:** handwriting, blurry photos, glare, unusual packs, rate limits. Typed search always works offline after first load. Confirm step lets the user fix any field before lookup.

## Data

- Curated snapshot (~220 generics, ~60 brands) inspired by the official PMBI Jan Aushadhi list.
- **Snapshot date:** 2026-10-21 (see `data/` and UI source line).
- Indicative demo MRPs — verify on your strip. Prefer strip-printed MRP when photo path is used.
- 200 well-curated drugs beat a bad scrape of 20,000 (PS3 guidance).

## Run locally

```bash
npm install
npm test
npm run validate
npx --yes serve -l 8080 .
# or: python -m http.server 8080
```

Open `http://localhost:8080`. Typed search works without an API key. Photo needs `CONFIG.API_URL` in `config.js` pointing at a deployed Function.

## Deploy to DigitalOcean (free)

1. **Function:** install `doctl`, then:
   ```bash
   doctl serverless install
   doctl serverless connect
   cd functions
   GEMINI_API_KEY=... ALLOWED_ORIGIN=https://YOUR_APP.ondigitalocean.app doctl serverless deploy .
   doctl sls fn get api/read-strip --url
   ```
2. Put that URL in `config.js` → `API_URL`.
3. **Static site:** App Platform → create from this GitHub repo → Static Site → build empty, output `/`.
4. Replace `REPLACE.ondigitalocean.app` in `index.html`, `robots.txt`, `sitemap.xml`, `llms.txt`, and README.

## Tests

```bash
npm test                 # fuzzy matcher
npm run validate         # data integrity
```

## Credits

- **Gemma 4** (open-weights multimodal) via **Gemini API**
- **DigitalOcean** App Platform + Functions
- **Fuse.js** fuzzy search
- **Google Fonts** — Mukta, IBM Plex Mono
- **PMBI / Jan Aushadhi** public product list (curated snapshot)
- AI coding assistants used while building this repo

## Disclaimer

Information only. Confirm with your doctor or pharmacist before switching medicines. Not medical advice.

## Licence

MIT — see [LICENSE](./LICENSE).
