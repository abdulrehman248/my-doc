# 07 — Submission quality

## What's required

- One automated test of share permissions. It proves, without a browser:
  - An unrelated user cannot open a private document.
  - A **Can view** user cannot update that document.
  - A **Can edit** user can update that document.
  - The owner can still update it.
  The test runs with `npm test` against the Neon database using seeded users (or users created inside the test and cleaned up). It must not require a paid service beyond the existing free Neon project.
- A short validation and error-handling pass over the product paths already built (auth, documents, upload, sharing). Fix only clear gaps: missing on-page errors, unsafe messages, or server checks that do not match the UI. Do not add new product features.
- Deploy the app to Vercel Hobby with the Neon `DATABASE_URL` (and pooled URL if the deploy guide needs it). The live URL goes in `SUBMISSION.md` and the README. The user owns the Vercel project login and env vars if the agent cannot complete deploy from this machine.
- Documentation files (committed in the repo):
  - `README.md` — local setup, seed accounts, upload limits, sharing, and the live URL once known.
  - `docs/architecture.md` — stack, main tables, request flow for auth/docs/sharing, and explicit non-goals.
  - `docs/ai-workflow.md` — how AI was used (plans in `docs/plans/`, feature-by-feature build, what was checked by hand).
  - `SUBMISSION.md` — what works, what was cut, live URL, seeded credentials, walkthrough video note, and what the next 2–4 hours would add if anything is unfinished.
  - `WALKTHROUGH_VIDEO_URL.txt` — one line for the video URL. Placeholder text is fine until the user records and uploads the video; the repo does not create the video or the Google Drive folder.
- `npm run typecheck`, `npm run build`, and `npm test` pass.

## Decisions

- Test runner is Node’s built-in test runner (`node --test`) plus a small script under `scripts/` or `tests/`, so no new paid or heavy test framework is required.
- The permission test calls the same document access helpers used by the app (`getDocumentAccess`, `updateEditableDocument`), not HTTP scraping.
- Deploy target stays Vercel Hobby. Neon Free stays the database. No paid add-ons.
- Architecture and AI notes stay short and specific to this repo. They do not restate the full initial plan.

## Passing criteria

- [x] `npm test` fails if a view-only or unrelated user can write, and passes on the four permission cases above.
- [x] Auth, upload, and share error paths still show clear on-page errors; no secrets in error text.
- [x] `docs/architecture.md`, `docs/ai-workflow.md`, `SUBMISSION.md`, and `WALKTHROUGH_VIDEO_URL.txt` exist.
- [x] README includes setup, seeds, upload, sharing, and the live URL (or a clear “pending deploy” note only if deploy is blocked on the user).
- [x] App is deployed on Vercel Hobby, or `SUBMISSION.md` states exactly what the user must do to finish deploy.
- [x] `npm run typecheck` and `npm run build` pass.
