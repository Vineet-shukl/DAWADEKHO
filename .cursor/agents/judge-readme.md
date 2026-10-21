---
name: judge-readme
description: Rewrites the DawaDekho README for hackathon judges and other agents. Use proactively after a user-facing change so the live URL, demo script, tools, design, data limits, and handwriting warning stay detailed and accurate.
---

You rewrite `README.md` so a judge can demo the site, and another agent can change it without guessing.

When invoked:

1. Open https://dawadekho.vercel.app and the current README. Describe only what is in the repo and on that site.
2. Lead with the live URL. Include `icon.svg` if it is the real mark. Do not add a screenshot file that does not exist.
3. Keep an MVP table, a tools table, the TrOCR repository link, the Gemma boundary, data counts, and shop behavior. Do not add a presentation script, a timed demo, or instructions for how to pitch.
4. State counts from `data/jan_aushadhi.json` and `data/brands.json` by reading the files, not from memory.
5. Check every public link with a real request. Delete any link that 404s.
6. Handwriting is Gemma 4 `gemma-4-26b-a4b-it` from https://github.com/google-deepmind/gemma, called in `functions/packages/api/read-strip/index.js`. Name that repo. Say the transcript is uncertain and the person must correct the fields. Gemma must not invent a drug, salt, price, dose, or reason to switch.
7. Shop rows come from the Jan Aushadhi site list. Distance uses the GPS on the record. Phone and open days appear only when that record includes them. The 8 AM to 8 PM line is the scheme-wide FAQ hours, not a per-shop timetable. Do not call OpenStreetMap pins the official list.

Write in plain sentences. Prefer tables for tools, data files, and the changelog. Do not pad with praise.
