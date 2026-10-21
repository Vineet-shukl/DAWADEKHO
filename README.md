# DawaDekho

**Dawa dekho, daam dekho.** See the medicine. See the price. Before you pay.

Hackfest Lucknow, problem 3, *The Prescription You Cannot Read*. A patient is handed a brand name, stands at the counter, and pays what they are told. The same salt and strength is often sold as a Jan Aushadhi generic for much less. DawaDekho shows that gap before the bill is paid.

**Live webpage:** [https://dawadekho.vercel.app](https://dawadekho.vercel.app)

Open that URL on a phone. The repository mark below is the header icon. The live page is the full design: white background, dark text (`#1C1917`), rust buttons (`#9A3412`), a peach mascot, and a savings figure in IBM Plex Mono.

![DawaDekho mark](icon.svg)

| | |
|---|---|
| Event | GDG on Campus SRMCEM x MLH, Hackfest Lucknow, 21 Oct 2026 |
| Tracks | Gemma 4 (Gemini API) and Vercel |
| Languages | English and Hindi, toggle in the header, remembered on the device |
| Licence | MIT |
| Repo | https://github.com/Vineet-shukl/DAWADEKHO |

## Three-minute demo

Tell it as one person at the counter.

1. Ramesh has a strip that says Dolo 650. He cannot tell the molecule, so he cannot ask for the cheaper pack.
2. On the live site, type `dolo65o`. The list updates on each letter. The line says the name it thinks he means. Gemma checks that guess against the medicine file. A confident match opens the receipt without a search button.
3. The receipt is the product. Branded MRP on one row, Jan Aushadhi price on the next, then the saving. Example shape: a branded strip versus a generic pack of the same salt and strength.
4. The form sits next to a symbol (tablet, capsule, liquid, powder, injection, inhaler, or cream). One sentence under it restates only the salt, strength, and pack.
5. Tap **Show shops near me**. Allow location. Shops named Jan Aushadhi appear with a straight-line distance. Tap a row. Google Maps opens that pin.
6. Switch to Hindi. The same receipt is still there.
7. If you have a printed strip, photograph it, fix any field on the confirm card, then show the cheaper option.

## Doctor handwriting on a report

The reader is **Gemma 4**, model `gemma-4-26b-a4b-it`, from Google DeepMind.

| | |
|---|---|
| Model repository | https://github.com/google-deepmind/gemma |
| Model card | https://ai.google.dev/gemma/docs/core/model_card_4 |
| How this app calls it | Gemini API, model id `gemma-4-26b-a4b-it` |
| Code in this repo | `functions/packages/api/read-strip/index.js`, served at `/api/read-strip` |
| This project | https://github.com/Vineet-shukl/DAWADEKHO |

A photo of a handwritten prescription is sent to that function. Gemma copies only words it can see, sets `handwriting: true`, and keeps confidence at or below 0.4. The confirm card then asks the person to fix the brand, salt, strength, and MRP. The lookup still uses `data/jan_aushadhi.json`. Gemma does not invent a drug name or a price. If the writing is too messy, the page says it could not be read and offers typing instead.

There is no second OCR library. Printed strips use the same Gemma call with `handwriting: false`.

## What is on the screen

**Home.** Two jobs: photograph a strip, or type a name. The search box is already open. Example chips are Dolo 650, Pan 40, and Crocin. No login. Photos are not stored.

**While typing.** Fuse.js ranks names that start with the letters first, then close spellings. You do not tap Search. After a short pause, Gemma 4 looks at the typed text and the local list and may move the best real name to the top. If that name is not in `data/`, it is not shown.

**Receipt.** Branded price, Jan Aushadhi price, saving, pack, drug code, disclaimer, official Kendra list, and the official Sugam app. If the brand price came from our list and not from a strip photo, it is marked approximate.

**Confirm card.** After a photo, every field is editable: brand, salt, strength, printed MRP. Handwriting shows an extra warning. Nothing is looked up until the person continues.

**No match.** The page says the medicine is not in the list. It does not invent a salt or a price.

**Shops.** A list, not a bare link. Each row is a real OpenStreetMap place, a distance, and a maps link. The official state-and-district locator stays on the page because the map is not the full government list.

## Tools, and why each one is here

| Tool | Where it runs | What the judge can see |
|---|---|---|
| Gemma 4 `gemma-4-26b-a4b-it` | Vercel function `/api/read-strip` | Photo reading, spelling check, one clarity sentence |
| Gemini API | Server only. `GEMINI_API_KEY` is not in the browser | The model host |
| Vercel | https://dawadekho.vercel.app | Static site plus `/api/read-strip` and `/api/stores` |
| Fuse.js 7 | Browser, over bundled JSON | Typos such as `dolo65o` still find Dolo 650 |
| Motion | Browser, from jsDelivr | Suggestions and the receipt ease in. The React package `framer-motion` is not used, because the page is HTML, CSS, and JavaScript |
| OpenStreetMap Nominatim | `/api/stores` | Shop name, coordinates, distance |
| Google Maps | Opens in a new tab | Directions to the tapped shop |
| Mukta, IBM Plex Mono | Google Fonts | Hindi and Latin on one line, prices in tabular figures |
| Web Speech API | The phone browser | Speak a name, hear the saving |

Another agent should read, in this order: `PRD.md`, `HACKFEST-NOTES.md`, `DESIGN-SYSTEM.md`, `UX-COPY.md`, then `README.md`.

## Gemma 4 boundary

Gemma output is a search key. The number on the receipt comes from `data/jan_aushadhi.json` or from an MRP the person typed after a photo.

| Gemma may | Gemma must not |
|---|---|
| Read printed text on a strip or box | Invent a brand, salt, price, or alternative |
| Transcribe handwriting it can actually see, with low confidence | Treat a messy scribble as certain |
| Re-check its own JSON for up to 3 passes | Give a dose, a side effect, or a reason to switch |
| Pick a name from the local suggestion list | Add a medicine that is not in that list |
| Rewrite form, salt, strength, and pack into one sentence | Say what illness the medicine treats |

Printed strips are the path to trust. Handwriting is extra, and the confirm card is mandatory. If the photo is unreadable, the page says so and moves focus back to typing. Typed search still works after the first load if the phone is offline.

## Data

| File | Count | Role |
|---|---|---|
| `data/jan_aushadhi.json` | 518 generics | Salt, strength, form, pack, indicative MRP, drug code |
| `data/brands.json` | 192 brands | Brand, aliases, salt, strength, approximate branded MRP |

Snapshot date on the page: 2026-10-21.

The public Jan Aushadhi product API (`/api/v1/website/getAllProductForWeb`) returned HTTP 500 that day, so this is not a live scrape of all 2,000-plus products. Prices are a curated snapshot. The receipt says to confirm the MRP on the pack.

Two rows were aligned to the public product PDF (file last modified 7 Oct 2026):

- Paracetamol 650 mg tablets, 15s, ₹8.03
- Aceclofenac 100 mg and Paracetamol 325 mg tablets, 10s, ₹8

A brand price that is not read off a strip is labeled approximate. `npm run validate` fails the build data if a brand has no generic with the same salt and strength.

## Shops

1. The person taps **Show shops near me** and allows location.
2. `/api/stores` asks Nominatim for places named Jan Aushadhi inside a box around that point.
3. The page sorts them by straight-line distance and shows up to 8 within 25 km.
4. A tap opens `https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>`.

Checked links:

- Official Kendra locator: https://janaushadhi.gov.in/KendraDetails.aspx
- Official Sugam app: https://play.google.com/store/apps/details?id=in.gov.pmbjp

The old id `com.janaushadhi.sugam` is a 404 and is not used. There is no `og.png`. The social card does not point at a missing image.

## Design

Built for a first visit on a small Android phone, in sun, in Hindi or English.

- White page, dark text. White letters only on the rust buttons, where the contrast holds.
- Touch targets at least 48 px. Body text 18 px.
- One job on the home screen: photo or name, then the saving.
- Mascot floats while idle, tilts while Gemma is checking, and pops when a result is ready. Motion is off when the phone asks for reduced motion.
- Form icons are inline SVG, not photos of real packs.

## For another agent

- Do not put `GEMINI_API_KEY` in the browser or in git. It lives in `.env` locally and in Vercel env in production.
- Do not add a shop, a price, or a salt that you did not read from `data/` or from a source you just fetched.
- If a government API fails, say so in the UI. Do not fill the gap with invented rows.
- Copy for the screen is in `UX-COPY.md` and `i18n.js` together.
- After a visible change, update this README. The project agent `.cursor/agents/judge-readme.md` is the checklist.

## Run and test

```bash
npm install
npm test
npm run validate
npx --yes serve -l 8080 .
npm run api
```

http://localhost:8080 serves the page. `npm run api` is the photo and voice function on port 8787. It reads `GEMINI_API_KEY` from `.env`.

```bash
npm test          # matcher, including dolo65o and live prefix guesses
npm run validate  # every brand has a matching generic
```

Deploy:

```bash
npx vercel --prod
```

`GEMINI_API_KEY` must already be set on the Vercel project.

## Updates in this build

| Change | What a judge notices |
|---|---|
| Fuzzy matcher and tests | `dolo65o` resolves to Dolo 650 |
| Hindi and English UI | Header toggle, large type, two actions |
| Gemma photo function | Confirm card, then a dataset lookup |
| Multi-pass check | Gemma re-reads its own JSON before the card |
| Live spelling | Suggestions while typing, then a Gemma check |
| Soft white layout and mascot | Replaces the earlier hard orange blocks |
| Motion | List and receipt enter with a short ease |
| Form symbols and clarity line | Tablet, capsule, liquid, and the rest, plus one factual sentence |
| Larger list | 222 generics and 62 brands became 518 and 192 |
| Verified links | Dead Sugam URL removed. Official locator and real Play Store id kept |
| Nearby shops | Distance list. Tap opens that location |
| Handwriting | Uncertain transcript only. Person must correct the fields |

## Disclaimer

Information only. Confirm with a doctor or pharmacist before changing a medicine. This is not medical advice.

## Licence

MIT. See [LICENSE](LICENSE).
