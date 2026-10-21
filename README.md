# DawaDekho

**Dawa dekho, daam dekho.** See the medicine. See the price. Before you pay.

A free Hindi and English site for Hackfest Lucknow problem 3, *The Prescription You Cannot Read*. Type a name, say it, or photograph a strip or a handwritten line. The page shows the Jan Aushadhi generic with the same salt and strength, and the saving.

**Live site:** https://dawadekho.vercel.app

The mark in the header is `icon.svg`.

![DawaDekho mark](icon.svg)

Open the live site for the full layout. The page is white, with dark text, a coral button, and a small mascot.

## What a judge should try

1. Type `dolo65o`. Suggestions appear while you type. A close match opens without a search tap.
2. Type `Pan 40`. The receipt shows branded MRP, Jan Aushadhi price, and the saving.
3. Tap **Show shops near me** and allow location. Shops are listed with distance. A tap opens that pin in Google Maps.
4. Photograph a printed strip. Correct any field, then see the cheaper option.
5. Switch **हिं** in the header.

## Tools used

| Tool | Role |
|---|---|
| Gemma 4 `gemma-4-26b-a4b-it` | Reads a photo, checks a misspelling against our list, and rewrites the form, salt, and pack into one sentence. It does not invent a price. |
| Gemini API | Hosts Gemma. The key stays in the Vercel function, not in the browser. |
| Vercel | Hosts the site and `/api/read-strip` and `/api/stores`. |
| Fuse.js | Fuzzy match on the bundled medicine list. |
| Motion | Entrance motion for suggestions and the receipt. Same engine family as Framer Motion. The page is plain HTML, so the React package is not used. |
| OpenStreetMap Nominatim | Nearby places named Jan Aushadhi, with coordinates. |
| Google Maps | Opens the chosen shop. |
| Mukta and IBM Plex Mono | Hindi and English type, and the prices. |
| Browser speech | Mic and read-aloud. Gemma then checks the spoken words. |

## How a photo is read

Gemma looks at the image and returns only a search key: brand, salt, strength, form, and printed MRP. The app then looks that key up in `data/jan_aushadhi.json`. If the name is not in the file, the page says so and does not guess a price.

Printed strips are the reliable path. Handwriting is attempted because a prescription is often handwritten. The model must copy only words it can see, mark the result as handwriting, and keep confidence low. The confirm card asks the person to fix every field. A messy photo returns "we could not read that" and points back to typing.

Gemma must not invent a drug, a salt, a price, a dose, or a reason to switch medicines.

## Data and shops

- 518 generics and 192 brands in the repo snapshot dated 2026-10-21.
- The live Jan Aushadhi product API returned an error that day, so prices are a curated snapshot. The page says to confirm the MRP on the pack.
- Two prices were taken from the public product PDF: Paracetamol 650 mg is ₹8.03 for 15 tablets, and Aceclofenac 100 mg with Paracetamol 325 mg is ₹8 for 10 tablets.
- Shops are OpenStreetMap places named Jan Aushadhi within about 25 km. Distance is straight-line. This is not the full government list.
- Official locator, checked: https://janaushadhi.gov.in/KendraDetails.aspx
- Official Sugam app, checked: https://play.google.com/store/apps/details?id=in.gov.pmbjp

## What changed

- Fuzzy search, Hindi and English, photo confirm, and a savings receipt.
- Gemma re-reads its own photo JSON, then checks a typed misspelling against the medicine list.
- Soft layout, mascot, white page, dark text, and Motion entrances.
- Form symbols for tablet, capsule, liquid, powder, injection, inhaler, and cream, plus a one-sentence clarity line from the listed facts.
- Medicine list grew from 222 generics and 62 brands to 518 and 192.
- Dead Sugam link removed. Nearby shops list distance and open the map pin.
- Handwriting photos are read only as an uncertain transcript the person must correct.

## Run locally

```bash
npm install
npm test
npm run validate
npx --yes serve -l 8080 .
npm run api
```

Typed search works at http://localhost:8080 without a key. Photo and voice need `GEMINI_API_KEY` in `.env` and `npm run api` on port 8787.

## Tests

```bash
npm test
npm run validate
```

## Disclaimer

Information only. Confirm with a doctor or pharmacist before changing a medicine. Not medical advice.

## Licence

MIT. See [LICENSE](./LICENSE).
