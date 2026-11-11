# 03 — Documents

## What's required

- A signed-in user can create, rename, list, open, save, and reopen their own documents. Sharing is not part of this feature.
- One table, added in `db/schema.ts` and created with `npm run db:generate` then `npm run db:migrate`:
  - `documents`: `id`, `owner_id` (FK to `users`, cascade on delete), `title`, `content`, `created_at`, `updated_at`.
- `/` is the document list for the current user only. It shows each title and when it was last updated. An empty list says there are no documents yet. A signed-out visitor is still sent to `/login`.
- From `/`, the user can create a document. Creation uses title `Untitled` and empty `content`, then opens that document.
- `/documents/[id]` opens one document. It shows the title, a text area for the body, and a Save control. A signed-out visitor is sent to `/login`.
- Rename changes the title on that page. Save writes the current title and body and updates `updated_at`. After a refresh, the same title and body are shown.
- Server-side checks:
  - Every document query is scoped to the signed-in user as `owner_id`.
  - Opening or saving a document the user does not own returns a not-found response. It does not reveal that the document exists.
  - Title is required after trim, at most 200 characters. An empty or too-long title shows an error on the page and does not write.
- Logout remains available from `/` and from the document page.
- The README notes that a signed-in user keeps a personal document list, and that sharing comes later.

## Decisions

- Body content is plain text in a `<textarea>`. TipTap and formatting land in the Editor feature.
- Save is an explicit button. Autosave lands in the Editor feature.
- There is no delete, archive, search, folders, or trash in this feature.
- Ownership alone controls access for now. View and edit grants come in Sharing.
- `content` is a Postgres `text` column. The Editor feature may change how rich text is stored; this feature only needs round-trip plain text.

## Passing criteria

- [x] Creating a document from `/` opens `/documents/[id]` with title `Untitled` and an empty body.
- [x] `/` lists only the current user’s documents, newest `updated_at` first.
- [x] A second seeded user does not see the first user’s documents on `/`.
- [x] Renaming and saving, then refreshing, keeps the new title and body.
- [x] An empty or over-200-character title is rejected with an on-page error and no database write.
- [x] Opening another user’s document id shows not found and does not expose the document.
- [x] A signed-out visit to `/` or `/documents/[id]` goes to `/login`.
- [x] `npm run db:migrate` applies the `documents` table.
- [x] `npm run typecheck` and `npm run build` pass.
- [x] The README says documents are personal until sharing is added.
