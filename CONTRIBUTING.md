# Contributing to AVE Forum

## Ways to contribute without writing code

- **Content.** Teaching material, a de-identified case, an ECG, a paper for the
  Research Spotlight, or a podcast guest. Open an issue with the `content` label.
- **Country representation.** Register on the site and say you want to represent
  your country.
- **Corrections.** Clinical or factual errors are the highest-priority issues.
  Open one with the `correction` label and cite a source.

## Ways to contribute code

1. Open an issue first describing the change.
2. Branch from `main`: `feat/short-description` or `fix/short-description`.
3. Keep pull requests small and focused on one thing.
4. Run the checks before pushing:

```bash
node scripts/check-links.mjs
for f in assets/js/*.js; do node --input-type=module --check < "$f"; done
```

5. Open a pull request. CI runs the same checks.

## House rules for the codebase

- **No build step.** Plain ES modules, plain CSS. If a change needs a bundler,
  discuss it in an issue first.
- **Content goes in `content.js`**, never inline in `app.js`.
- **Colours and type come from the CSS variables** in `ave.css`. No new hex values
  in component rules.
- **Escape everything from the database** with `esc()` before it reaches the DOM.
- **Never commit a `service_role` key**, a `.env` file, or any credential. CI checks
  for this, but check yourself first.
- **Row-level security stays on** for every table. If a query needs RLS relaxed,
  the query is wrong.

## Clinical content standards

- Nothing claimed without a reference.
- No patient-identifiable information, in any form, in any file.
- Guidance must state what equipment and staffing it assumes.
- Where evidence is weak or contested, say so rather than smoothing it over.
