# AI workflow

## Tools

Cursor Agent was used with the repo’s feature plans under `docs/plans/`. Work stayed plan-first: write or confirm a plan, then implement only that feature.

## Where AI sped things up

- Scaffolding Next.js routes, Drizzle schema, TipTap toolbar wiring, and share/comment UI against existing styles
- Drafting feature plans (`01`–`08`) and submission docs from locked product decisions
- Generating the share-permission test that calls the same access helpers as the app

## What was changed or rejected

- Live collaboration and suggestion mode were cut early; AI proposals that drifted into those were not implemented
- Comment anchors use quote + decorations instead of mutating TipTap JSON, so viewers stay body-read-only
- Purple/generic landing aesthetics were avoided in favor of a Docs-like chrome already in the app

## How correctness was checked

- Manual flows: signup/login, create/edit/autosave, upload `.txt`/`.md`, share view vs edit, anchored comments
- `npm run typecheck`, `npm run build`, and `npm test` (share permission cases against Neon + seeded users)
- Server actions re-checked for access control rather than trusting UI-only disablement
