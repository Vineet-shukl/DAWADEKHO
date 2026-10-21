# Contributing to DawaDekho

## Add a medicine

1. Add a generic to `data/jan_aushadhi.json` with `salts` (lowercase), `strength` (`mg` / `mcg` / `%`, `+` joined), numeric `mrp`, and matching salt count.
2. Optionally add a brand to `data/brands.json` whose `salts` + `strength` already exist in the generics file. Set `approx_mrp` and aliases.
3. Run:
   ```bash
   npm run validate
   npm test
   ```
4. Never invent prices. Prefer official Jan Aushadhi / pack MRP sources.

## Code style

- No framework — vanilla ES modules.
- Drug facts only from JSON; Gemma output is a search key only.
- Copy changes go in `UX-COPY.md` and `i18n.js` together.
- Visual tokens stay in `DESIGN-SYSTEM.md` / `style.css`.

## PR checklist

- [ ] `npm test` and `npm run validate` pass
- [ ] Disclaimer still visible on results
- [ ] No LLM-generated drug facts on screen
- [ ] Hindi + English strings updated if UI text changed
