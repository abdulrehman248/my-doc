# Submission — Ajaia Docs

## What works

- Email/password auth with signup, login, logout, and seeded demo accounts
- Create, rename (via title), edit, autosave, and reopen documents
- TipTap rich text: bold, italic, underline, H1/H2, lists, page breaks
- Upload `.txt` / `.md` (max 512 KiB) into a new document
- Sharing: owner grants **Can view** or **Can edit**; owned vs shared lists; server-side enforcement
- Anchored comments on selected text (including viewers); resolve/delete by author or owner
- Automated share-permission test via `npm test`
- Local setup documented in `README.md`

## What was intentionally cut

- Live co-editing / presence
- Suggestion / track-changes mode
- Version history, public links, folders, offline mode
- `.docx` import

## Live URL

https://my-doc-app.vercel.app

## Seeded credentials

| Email | Password |
| --- | --- |
| ada@ajaia.test | docs-demo-password |
| grace@ajaia.test | docs-demo-password |
| lin@ajaia.test | docs-demo-password |

## Walkthrough video

https://www.loom.com/share/5e2a64071e4c45368a7d54320edaba9a

Also recorded in `WALKTHROUGH_VIDEO_URL.txt`. The Google Drive folder for the assignment deliverables is assembled by the submitter.

## Finish deploy (if still needed)

1. Create a Vercel Hobby project linked to this repo (or `npx vercel` from the project root while logged in).
2. Set `DATABASE_URL` to the Neon connection string (same value as local `.env.local`).
3. Run production migrations against that database if needed (`npm run db:migrate` with the production URL).
4. Run `npm run db:seed` against production so reviewers have the demo accounts.
5. Confirm `/api/health` returns ok, then paste the live URL into this file and `README.md`.

## Next 2–4 hours (if extending)

- Wire CI to run `npm test` + `npm run typecheck` on every PR
- Soften orphaned comment UX (show “text moved” when a quote no longer matches)
- Optional pooled Neon URL for serverless cold starts if Vercel latency warrants it
