# 08 — Anchored comments

## What's required

- On `/documents/[id]`, anyone with access (owner, Can edit, Can view) can select text, leave a comment, and see comments in a right-hand panel.
- One table, added in `db/schema.ts` and created with `npm run db:generate` then `npm run db:migrate`:
  - `document_comments`: `id`, `document_id` (FK to `documents`, cascade on delete), `author_id` (FK to `users`, cascade on delete), `body`, `quote`, `resolved_at` (nullable), `created_at`.
- Highlighting uses a ProseMirror decoration plugin that finds the quote in the current editor doc. Commenting does not change TipTap `content` JSON, so viewers do not need write access to the body.
- Clicking a comment in the sidebar focuses its highlight when the quote still exists. If the quoted text was edited away, the sidebar still shows the quote and the comment is treated as detached (no highlight).
- Resolve and delete: comment author or document owner. No editing the body after create. No threads, replies, suggestion mode, or real-time sync.
- Validation: body trimmed 1–2000 characters; quote trimmed 1–500 characters.
- The formatting toolbar stays edit-only. A Comment control is available whenever there is a non-empty text selection (including viewers).
- The README notes that shared users, including viewers, can comment on selections.

## Decisions

- Decorations plus a quote snapshot, not TipTap marks stored in `content`. That keeps view-only body rules and avoids autosave fights.
- Orphan quotes are acceptable. No re-anchoring beyond first-match decoration.
- Create/resolve/delete go through server actions that check `getDocumentAccess`. Mutations revalidate the document path; there is no live presence.

## Passing criteria

- [x] Owner, editor, and viewer can add a comment on a selection; it appears in the sidebar after save and after refresh.
- [x] Highlight appears when the quote still exists; editing the quoted text away leaves a sidebar entry without a highlight.
- [x] Author or owner can resolve and delete; other shared users cannot.
- [x] Creating a comment does not require or perform a body autosave; a viewer still cannot change title or body via autosave.
- [x] `npm run db:migrate` applies `document_comments`.
- [x] `npm run typecheck` and `npm run build` pass.
- [x] The README mentions commenting.
