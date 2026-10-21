# DawaDekho — Usability Test Plan

> **Tagline:** Dawa dekho, daam dekho. See the medicine. See the price. Before you pay.  
> **Aligned to:** `PRD.md`, `UX-COPY.md`, `DESIGN-SYSTEM.md`  
> **Audience for testing:** first-time users on a small Android phone, at a pharmacy counter, Hindi or English.

| | |
|---|---|
| **Product** | DawaDekho (MVP demo) |
| **Method** | Moderated, in-person (preferred) + optional remote moderated |
| **Protocol** | Concurrent think-aloud |
| **Sessions** | 5–8 per primary segment · ~25–35 min each |
| **Pilot** | 1 session before live testing |
| **Owner** | Richa / UX lead |

---

## 1. Objectives

Validate that a first-time user can discover a cheaper Jan Aushadhi option **before they pay**, without training, on a weak network and a low-end phone.

### Research questions

1. Can a first-time user complete a typed lookup (brand → salt/strength → savings) with **no instructions**?
2. Does the photo → confirm → result flow feel trustworthy, and do people **edit** wrong fields before accepting?
3. Is the savings headline (`₹X → ₹Y · you save ₹Z`) understood as **information, not medical advice**?
4. Do Hindi-first users (esp. Ramesh-like) succeed with big type, one-tap CTAs, and the language toggle?
5. When there is no match or AI fails, do users understand the honest fallback and switch to typed search?

---

## 2. Methodology

| Choice | Decision | Why |
|---|---|---|
| Moderated vs unmoderated | **Moderated** | Need probes on trust, disclaimer, and “approx” labels |
| Remote vs in-person | **In-person preferred** (pharmacy-like setup); remote OK for Pooja segment | Matches PRD design target: standing at a counter, small phone |
| Protocol | **Think-aloud** | Surfaces confusion on salts, MRP, and Kendra CTA |
| Prototype under test | Live URL or local static build of MVP flows A–D | Photo path needs internet; typed path should work offline after first load |
| Device | Participant’s phone where possible; else ₹8k-class Android (Chrome) | Matches PRD non-functional target |
| Language | Half of Ramesh segment start in **Hindi**; rest choose freely | Tests `lang` toggle + Devanagari readability |

**Out of scope for this test:** dosage advice, handwriting OCR, login, payments, live store map (PRD won’t-haves).

---

## 3. Participants

### Segments (from PRD personas)

| Segment | Persona | n | Must-have criteria |
|---|---|---|---|
| **A — Primary** | **Ramesh, ~55–70** — monthly refills, low digital confidence, prefers Hindi | 5–6 | Owns/uses a basic smartphone; buys branded meds; little/no pharmacy-app experience |
| **B — Primary** | **Pooja, ~22–35** — buys for parents, smartphone-savvy, hurried | 5–6 | Comfortable with camera apps; has paid for a parent’s prescription in last 6 months |
| **C — Secondary** | Chemist / Kendra staff | 2–3 (optional) | Works retail pharmacy; asked about generics at least weekly |

**Exclude:** people who helped build DawaDekho; UX researchers; anyone who cannot consent to screen recording.

### Recruitment

- Friends-of-friends near a chemist or campus demo; offer tea/snack or small voucher.
- Screen with 4 questions: age band, who they buy medicine for, Hindi comfort, last time they compared brand vs generic.
- Schedule 10-minute buffer between sessions for notes.

### Sample size rationale

5–8 per primary segment is enough to surface ~85% of repeated usability issues for an MVP demo (Krug / Nielsen). Secondary chemist sessions are exploratory only.

---

## 4. Tasks

Each task maps to a PRD flow and persona job. Success = user reaches the defined end state **without moderator hints**. Soft fail = needs one nudge. Hard fail = cannot complete or abandons.

| ID | Persona focus | Scenario (read aloud) | Success criteria | Target time |
|---|---|---|---|---|
| **T1** | Ramesh / Pooja | “You’re at the counter with **Dolo 650**. Find whether a cheaper same-salt option exists by **typing** the name.” | Opens type path → finds Dolo 650 (typo OK) → sees Jan Aushadhi result + savings + disclaimer | ≤ 60 s (PRD typed < 1 s for result after submit; task includes orientation) |
| **T2** | Ramesh | “You usually mistype. Search with **`dolo65o`** (or similar).” | Still lands on correct brand/salt/strength or clear alternatives | ≤ 45 s |
| **T3** | Pooja | “Take / upload a **photo of a printed strip**. Confirm what’s read, then see the cheaper option.” | Camera/upload → confirm card → edits if needed → result with savings; or clear typed fallback on AI fail | ≤ 90 s when AI works (PRD photo < 8 s for read; task includes confirm) |
| **T4** | Both | “You don’t trust the brand price. Fix the **MRP** on the confirm screen to what your strip says, then continue.” | Edits MRP → savings update using strip MRP; “approx” only when list price used | ≤ 45 s |
| **T5** | Both | “Search something **not** in the list (e.g. nonsense brand).” | Sees honest no-match (`Not in our list` / Hindi copy); **no invented** drug or price | ≤ 30 s |
| **T6** | Ramesh | “Switch the app to **Hindi**, then check another medicine from the example chips.” | Toggle remembered; Hindi strings readable; chip → result | ≤ 60 s |
| **T7** | Both | “You want to know **where to buy** the cheaper medicine.” | Finds Kendra link and/or Sugam app CTA; understands it’s external | ≤ 30 s |
| **T8** *(if offline demo available)* | Ramesh | “Phone shows offline. Try **typing** a medicine name.” | Offline banner; typed search still works; photo path explains it needs net | ≤ 45 s |

**Optional chemist task (C):** “A customer asks if there’s a generic for Pantoprazole 40 mg. Look it up by salt/name as fast as you can.” Success: correct strength match in ≤ 20 s.

### Task order

Warm-up free explore (1 min) → **T1 → T2 → T5 → T6 → T7 → T3 → T4** → (T8 if ready). Put photo after typed success so low-confidence users aren’t blocked early.

---

## 5. Metrics

### Behavioural

| Metric | Definition | MVP target |
|---|---|---|
| **Task success rate** | % complete without hint | ≥ 80% on T1, T5, T6; ≥ 70% on T3 |
| **Time on task** | Start (scenario end) → success state | Meet task targets above |
| **Error rate** | Wrong taps, abandoned fields, ignored confirm edits | Note per task; flag if > 2 critical errors / session |
| **Hint rate** | Moderator interventions | ≤ 1 soft hint on T1 for Ramesh segment |
| **False-trust incidents** | User states they would switch **without** checking pharmacist/doctor | Count; any incident → copy/disclaimer review |

### Attitudinal (post-task / post-session)

| Metric | Instrument | Target |
|---|---|---|
| **SEQ** | “Overall, this task was…” 1 (very difficult) – 7 (very easy) | Median ≥ 5 on T1 |
| **Trust** | “I trust the prices shown” 1–5 | Median ≥ 4; probe “approx” and disclaimer |
| **SUS** | 10-item System Usability Scale (end of session) | ≥ 68 (average) for demo; aspire ≥ 75 |
| **One-liner** | “In your own words, what does this app do?” | Mentions cheaper / Jan Aushadhi / same salt — not “prescribes” or “cures” |

### Product metrics (demo-day alignment from PRD)

| PRD goal | How this test contributes |
|---|---|
| Judge completes lookup with **no instructions** | T1 success with zero hints |
| Typed < 1 s / photo < 8 s | Stopwatch from submit/upload to first result UI |
| 0 invented facts | T5 + observation that all prices come from UI dataset labels |
| Hindi / big type usable | T6 + Ramesh qualitative notes |

---

## 6. Facilitation guide

### Setup (before participant arrives)

- [ ] Charge phone; clear app data / private window; set language to English **or** Hindi per schedule.
- [ ] Preload typed data (first load) if testing offline path.
- [ ] Have physical strip(s) or clear photos for T3/T4 (printed side, flat, lit).
- [ ] Start screen + voice recording (with consent); open observation notes template.
- [ ] Hide unrelated tabs/notifications.

### Introduction script (~2 min)

> Thanks for helping. We’re testing **DawaDekho**, a website that helps people see if a medicine has a cheaper Jan Aushadhi option with the **same salt and strength**. We’re testing the site, not you. There are no wrong answers.  
> Please think out loud — say what you’re looking at and what you expect to happen.  
> I may not answer “how do I…?” questions during tasks; if you’re stuck, do what you would in a real shop.  
> We’ll record the screen and your voice if you agree. You can stop anytime.  
> Questions before we start?

Collect consent. Ask them to set phone brightness as they normally would outdoors/indoors.

### Task delivery

- Read the scenario **once** from the task table. Do not demonstrate.
- Start timer when they begin interacting.
- If silent > 15 s: “What are you thinking right now?”
- Allowed neutral prompts only: “What would you do next?” / “What does that mean to you?”
- **Do not** explain salt, Jan Aushadhi, or where the CTA is unless scoring a soft fail after 90 s stuck.

### Probing (after each task or at natural pauses)

- “What does this number mean to you?” (point at savings)
- “Would you change your medicine based on this? Why / why not?”
- “Did you notice the disclaimer? What is it asking you to do?”
- On confirm card: “What would you do if the brand name looked wrong?”
- On no-match: “What would you do at the real counter now?”

### Debrief (~5 min)

1. SUS questionnaire.  
2. Trust + SEQ for T1 and T3.  
3. “What was hardest?” / “What would you tell a parent about this?”  
4. Language preference and font size comfort.  
5. Thank them; optional voucher.

---

## 7. Data collection

### Record

- Screen + audio (preferred); if refused, notes only.
- Device model, OS, browser, network (Wi‑Fi / hotspot / offline).
- Start language and whether they toggled.

### Observation template (per task)

| Field | Notes |
|---|---|
| Task ID | |
| Success / soft fail / hard fail | |
| Time | |
| Errors / misclicks | |
| Quotes (verbatim) | |
| Severity (cosmetic / minor / major / blocker) | |
| Screenshot / timestamp | |

### Severity guide

| Level | Meaning |
|---|---|
| **Blocker** | Cannot complete core job (T1) or trusts invented/wrong medical action |
| **Major** | Completes only with hint; misses savings meaning; ignores confirm |
| **Minor** | Hesitation, copy nit, icon confusion; recovers alone |
| **Cosmetic** | Preference, polish |

### Note-taking framework

Tag notes: `#nav` `#trust` `#hindi` `#photo` `#nomatch` `#a11y` `#perf` `#copy`.

---

## 8. Analysis plan

1. **Same day:** clean notes; mark success rates; clip 3–5 key quotes.  
2. **Affinity:** group issues by research question and flow (type / photo / no-match / language).  
3. **Prioritise:** blockers first → major affecting Ramesh → demo-day judge path → polish.  
4. **Map to product docs:** UX issues → `UX-COPY.md`; visual/a11y → `DESIGN-SYSTEM.md`; behaviour → `PRD.md` acceptance (M1–M9).  
5. **Report (1–2 pages):** top 5 findings, evidence, recommendation, owner.  
6. **Do not** treat chemist n=2–3 as statistically significant; use for language and speed only.

**Decision rule for demo:** If T1 success < 80% in Ramesh segment, fix home CTA / search before photo polish.

---

## 9. Pilot test checklist

Run **one** full session (ideally Ramesh-like) the day before.

**Script & timing**
- [ ] Intro + consent fits in 2 minutes.
- [ ] Full task set finishes in ≤ 35 minutes including debrief.
- [ ] Task wording is clear without explaining the product.

**Prototype**
- [ ] Typed search works with bundled data (M1, M9).
- [ ] Photo path or graceful `err.*` fallback works (M2, Flow D).
- [ ] No-match copy matches `UX-COPY.md` (M5).
- [ ] Disclaimer visible on result (M6).
- [ ] Kendra / Sugam links open (M7).
- [ ] Hindi toggle persists (M8).
- [ ] Touch targets feel ≥ 48 px; text readable at arm’s length (Design System).

**Facilitation**
- [ ] Recording works; backup notes ready.
- [ ] Moderator resists teaching during tasks.
- [ ] SEQ / SUS forms print or open cleanly on phone.

**Logistics**
- [ ] Strip props and lighting OK for camera.
- [ ] Hotspot ready if venue Wi‑Fi is weak (PRD risk).
- [ ] Recruiting confirmed for next day; 1 backup participant.

**After pilot — adjust**
- [ ] Cut or reorder tasks that blow the schedule.
- [ ] Fix broken flows before real sessions.
- [ ] Update this plan with revised timings.

---

## 10. Ethics & safety

- No medical advice during the session. Reinforce PRD golden rule and result disclaimer.
- Do not store participant strip photos after the session.
- Anonymise notes (P1, P2…). No real prescription handwriting collection (out of scope).

---

## 11. Schedule template

| When | What |
|---|---|
| T−1 day | Pilot + fix blockers |
| Day 1 | 4–5 Ramesh / mixed sessions |
| Day 2 | 4–5 Pooja (+ optional chemist) |
| Same evening | Affinity + top findings → engineering |

---

## Companion documents

- `PRD.md` — personas, flows A–D, MVP acceptance M1–M9  
- `UX-COPY.md` — strings under test (en / hi)  
- `DESIGN-SYSTEM.md` — type, targets, “honest receipt” visual rules  
- `IMPLEMENTATION-PLAN.md` — build status of flows under test  

---

*After testing: synthesize findings into prioritized UX changes, or run follow-up interviews on trust and switching behaviour.*
