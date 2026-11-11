# 06 — Sharing

## What's required

- An owner can grant another existing user access to a document as **Can view** or **Can edit**. There are no public links and no live co-editing.
- One table, added in `db/schema.ts` and created with `npm run db:generate` then `npm run db:migrate`:
  - `document_shares`: `id`, `document_id` (FK to `documents`, cascade on delete), `user_id` (FK to `users`, cascade on delete), `role` (`view` or `edit`), `created_at`. Unique on (`document_id`, `user_id`).
- `/` shows two lists for the signed-in user:
  - **Owned** — documents they own (same create / upload behavior as today).
  - **Shared with me** — documents shared with them, each showing the owner email and whether access is view or edit.
- On `/documents/[id]` for the owner:
  - A share form: recipient email + role (Can view / Can edit) + submit.
  - A list of current shares with role and a way to change the role or remove access.
- Access rules, enforced on the server for every open and save:
  - Owner: full access (read, edit title/body, manage shares).
  - **Can edit**: read and edit title/body. Cannot manage shares.
  - **Can view**: read only. Editor and title are not editable; autosave must not write.
  - Anyone else: not found (same response whether the document is missing or private).
- Share form validation:
  - Email must identify an existing user. Unknown email shows an on-page error and creates no share.
  - Cannot share with yourself.
  - Sharing again with the same user updates that user’s role instead of inserting a duplicate.
- README explains owned vs shared lists, view vs edit, and that reviewers can log in as the seeded users to try sharing.

## Decisions

- Share by account email only. No invite links, no email sending.
- `role` is stored as text constrained to `view` | `edit` in application code (and a DB check if easy with Drizzle).
- Viewers get a read-only TipTap surface; there is no separate “preview” route.
- Document open/save helpers move from “owner only” to “owner or share grant,” with role checked before writes and before share management.
- No real-time presence, conflict handling, or activity feed.

## Passing criteria

- [x] Owner can share a document with a seeded user as Can view or Can edit.
- [x] Recipient sees the document under **Shared with me**, not under **Owned**.
- [x] Can edit can change title/body and those changes persist after refresh.
- [x] Can view can open the document but cannot change title or body (UI read-only and server rejects writes).
- [x] A user with no grant gets not found for that document id.
- [x] Owner can change a share’s role and can remove a share; the recipient’s access updates accordingly.
- [x] Sharing with an unknown email or with yourself shows an on-page error.
- [x] `npm run db:migrate` applies `document_shares`.
- [x] `npm run typecheck` and `npm run build` pass.
- [x] The README documents sharing with the seeded accounts.
