# Hackfest notes (from uploaded screenshots + MLH PS3)

Sources in-repo: `gdgsrmcem.tech_hackfest_ps.png`, `Screenshot 2026-10-21 110356.png`, `Screenshot 2026-10-21 110459.png`.  
Official PS3: [MLH — The Prescription You Cannot Read](https://www.mlh.com/events/hacktoberfest-hack-day-lucknow-x-shri-ramswaroop-memorial-college-of-engineering-management/challenges/01a15a05-737e-d39d-46dc-e8c94cfb1f0b).

---

## Mandatory tracks / tools (must show in the demo)

| Track | What the flyer says | How DawaDekho hits it |
|---|---|---|
| **Best Use of Gemma 4** | Lightweight open-weights multimodal model via **Gemini API**. Use **text + images**; focused tool; rapid prototype. CTA: *Build with Gemma 4*. | Photo of **printed** strip/box → Gemma 4 returns search keys only (`brand`, `salts`, `strength`, `mrp_printed`). Never invents prices or salts. |
| **DigitalOcean — Best Open-Source AI Project** | Original project where **open-source / open-weight AI** is an important part of how it works. Build with DigitalOcean. Prize: Hacktoberfest 2026 Winner DEV Badge & MLH Swag Bag. | Static site + Function on **DigitalOcean**; Gemma is the open-weights multimodal piece; MIT repo. |

Both tracks must be **visibly used** on demo day (live DO URL + live strip read).

---

## Problem Statement 3 — The Prescription You Cannot Read

**Job:** Turn a brand name into what the patient needs: *what molecule is this, and what should it cost?*

### Minimum working build (judges expect this)

1. Enter a **brand** or **molecule**.
2. Return **generic name**, **strength**, indicative **generic vs branded** price.
3. Make the saving the headline: **`₹240 → ₹28`**.
4. **Fuzzy search** — misspellings, missing strengths, half-read words.
5. **Clear disclaimer** and mean it: price/molecule info only — **not** medical advice; confirm with doctor/pharmacist. Never push a substitution decision.

### Stretch (after MVP works)

- Photograph the **prescription strip or box** and read the name  
- Whole prescription + total saving  
- Nearest Jan Aushadhi Kendra  
- Printable counter sheet  
- Pill identifier by imprint  

### Tools and traps (do not ignore)

| Note | Implication |
|---|---|
| Bundle Jan Aushadhi (and optionally NPPA) as CSV/JSON | **~200 common drugs done well** > 20,000 scraped badly |
| **Fuzzy matching is the technical core** | Plain `includes()` fails on real input |
| **Do not generate drug info with an LLM** | Hallucinated dosage = harm. Lookup shipped data; if missing, say so |
| **Handwriting OCR is a trap** | If photo: **printed strips/boxes only**; **typed path always works** |

---

## Alignment check vs our docs

| PS3 / track note | In `PRD.md` / plan? |
|---|---|
| Savings headline | Yes — M4 |
| Fuzzy typed search | Yes — M1, Task A2 |
| Disclaimer | Yes — M6, UX-COPY |
| Dataset-only facts / no LLM invent | Yes — golden rule §5 |
| Printed strip photo (not handwriting) | Yes — M2; handwriting = won’t-have |
| Typed fallback when AI fails | Yes — Flow D |
| Find Kendra | Yes — M7 (stretch in PS; must-have for us) |
| Gemma 4 multimodal via Gemini API | Yes — Task C |
| DigitalOcean host + Function | Yes — Task F |
| Honest README on Gemma limits | Yes — open-source checklist |

**Gap to watch at build time:** stretch items S1 (whole Rx list) and printable sheet are still optional; don’t block MVP.

---

## Demo-day checklist (from these notes)

- [ ] Typed “Dolo 650” / typo → `₹… → ₹…` + disclaimer  
- [ ] Photo of printed strip → confirm → same result  
- [ ] Unknown drug → honest no-match (no guess)  
- [ ] Live DigitalOcean URL  
- [ ] README credits Gemma 4, Gemini API, DigitalOcean, data sources  
- [ ] Section: what Gemma does / where it fails  
