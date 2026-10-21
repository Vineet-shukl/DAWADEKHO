# DawaDekho

**Dawa dekho, daam dekho.** See the medicine. See the price. Before you pay.

Free Hindi and English web app. It turns a brand name, a spoken name, a printed strip, or a handwritten line into the Jan Aushadhi generic with the same salt and strength, and shows the saving.

**Live site:** [https://dawadekho.vercel.app](https://dawadekho.vercel.app)

![DawaDekho mark](icon.svg)

| | |
|---|---|
| Event | Hackfest Lucknow, 21 Oct 2026, problem 3 |
| Licence | MIT |
| Repo | https://github.com/Vineet-shukl/DAWADEKHO |

## MVP

These are the finished pieces of the product.

| MVP | What it does |
|---|---|
| M1 Typed search | Brand or salt, including typos. Suggestions update while typing. |
| M2 Photo | Camera or upload. Printed strip or a handwritten line. |
| M3 Generic match | Same salt and strength from the bundled Jan Aushadhi list. |
| M4 Saving | Branded price, Jan Aushadhi price, and the difference on one receipt. |
| M5 Honest miss | Unknown names say they are not in the list. No invented price. |
| M6 Disclaimer | Every result says to confirm with a doctor or pharmacist. |
| M7 Stores | Nearby places named Jan Aushadhi, with distance. A tap opens that pin. |
| M8 Hindi and English | Header toggle, remembered on the device. |
| M9 Offline typing | After the first load, typed search does not need a server. |
| M10 Handwriting | Microsoft TrOCR reads the writing. The person corrects it before lookup. |

## Handwriting

Doctor handwriting is read by **TrOCR**, Microsoft's open handwriting model.

| | |
|---|---|
| Repository | https://github.com/microsoft/unilm/tree/master/trocr |
| Checkpoint in this app | `Xenova/trocr-small-handwritten` (ONNX build of TrOCR small, fine-tuned for handwriting) |
| Code | `ocr.js` |
| What happens next | The transcript is sent with the photo to Gemma 4 in `functions/packages/api/read-strip/index.js` |

TrOCR returns text only. It does not return a price. Gemma may turn that text into a brand, salt, and strength if those words are visible. The confirm card shows the transcript and asks for a correction when the photo is handwriting. The receipt price still comes from `data/jan_aushadhi.json`, or from an MRP the person typed.

A messy page stays unread. Typing remains available.

## How the page behaves

Search is open on the home screen. Each letter refreshes the list. Fuse.js prefers names that start with what was typed. Gemma then checks that guess against the same list. A confident match opens the receipt after a short pause.

A photo is resized in the browser, read by TrOCR, then checked by Gemma. The person can edit brand, salt, strength, and printed MRP.

The receipt shows the form with a symbol (tablet, capsule, liquid, powder, injection, inhaler, cream), the pack, the drug code, and one sentence that only restates those facts.

**Show shops near me** uses the phone location. `/api/stores` asks OpenStreetMap for places named Jan Aushadhi within about 25 km and sorts them by straight-line distance. A row opens Google Maps at that latitude and longitude. This is not the full government list. The official locator remains on the page: https://janaushadhi.gov.in/KendraDetails.aspx

The Sugam app link is the real Play Store listing: https://play.google.com/store/apps/details?id=in.gov.pmbjp

## Tools

| Tool | Role |
|---|---|
| [TrOCR](https://github.com/microsoft/unilm/tree/master/trocr) | Handwriting transcript in the browser |
| Gemma 4 `gemma-4-26b-a4b-it` | Checks the transcript and the photo. Structures a search key. Writes one factual sentence. Re-reads its own JSON up to 3 times. |
| [Gemma repository](https://github.com/google-deepmind/gemma) | The model family |
| Gemini API | Hosts Gemma. The key is only on the server. |
| Vercel | Site, `/api/read-strip`, `/api/stores` |
| Fuse.js | Fuzzy search over bundled JSON |
| Motion | Short entrance motion. The page is not a React app, so `framer-motion` is not bundled. |
| OpenStreetMap Nominatim | Shop coordinates |
| Mukta, IBM Plex Mono | Hindi, English, and prices |

## Gemma boundary

| May | Must not |
|---|---|
| Read visible printed or handwritten words | Invent a brand, salt, or price |
| Prefer the image when TrOCR disagrees | Treat messy handwriting as certain |
| Pick a name that is already in the suggestion list | Add a medicine that is not in `data/` |
| Restate form, salt, strength, and pack | Give a dose, a side effect, or a reason to switch |

## Data

| File | Count |
|---|---|
| `data/jan_aushadhi.json` | 518 generics |
| `data/brands.json` | 192 brands |

Snapshot date: 2026-10-21. The public product API returned HTTP 500 that day, so prices are a curated snapshot. The page says to confirm the MRP on the pack.

Paracetamol 650 mg, 15 tablets, is ₹8.03. Aceclofenac 100 mg and Paracetamol 325 mg, 10 tablets, is ₹8. Those two rows follow the public product PDF.

`npm run validate` fails if a brand has no generic with the same salt and strength.

## Design

White page, dark text `#1C1917`, rust buttons `#9A3412`. Body text is 18 px. Targets are at least 48 px. The mascot floats, tilts while a check runs, and pops when a result is ready. Motion stops when the device asks for reduced motion.

## Run

```bash
npm install
npm test
npm run validate
npx --yes serve -l 8080 .
npm run api
```

Photo and voice need `GEMINI_API_KEY` in `.env`. The first handwriting photo also downloads the TrOCR weights in the browser.

```bash
npx vercel --prod
```

## Disclaimer

Information only. Confirm with a doctor or pharmacist before changing a medicine. Not medical advice.

## Licence

MIT. See [LICENSE](LICENSE).
