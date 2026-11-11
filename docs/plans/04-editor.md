# 04 — Editor

## What's required

- Replace the document body `<textarea>` with a TipTap editor on `/documents/[id]`.
- Toolbar controls that apply to the current selection or block:
  - Bold, italic, underline
  - Heading 1, heading 2, and normal paragraph
  - Bullet list and ordered list
- Formatting survives refresh: reload shows the same marks and blocks.
- Autosave: after the user stops typing (or changing formatting) for about one second, the current title and body are written. The page shows a short status: Saving, Saved, or an error. The explicit Save button from Documents is removed.
- Title rules from Documents stay in force. An empty or over-200-character title shows an error and does not write. A failed title validation does not wipe a previously saved body.
- Ownership and auth behavior from Documents stay in force. Only the owner can open or save. Signed-out visitors go to `/login`.
- Existing rows whose `content` is empty or plain text still open. Empty becomes an empty TipTap document. Plain text becomes a single paragraph. New saves store TipTap JSON as text in the existing `content` column.
- Dependencies: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-underline` (and whatever those packages require). No paid TipTap plan.
- The README notes rich text formatting and autosave.

## Decisions

- TipTap JSON is stored as a string in the existing `documents.content` text column. No schema migration for this feature.
- Autosave is debounced (~1s). There is no manual Save for the body. Title changes are included in the same autosave path.
- Headings mean H1 and H2 only, plus paragraph. No font-size picker, colors, links, images, tables, or collaborative cursors.
- StarterKit covers bold, italic, headings, and lists. Underline is the separate TipTap extension.
- Server actions still check the session and `owner_id` on every save.

## Passing criteria

- [x] The document page shows a TipTap editor with a toolbar, not a `<textarea>`.
- [x] Bold, italic, underline, H1, H2, bullet list, and ordered list can be applied and remain after refresh.
- [x] Editing the body triggers autosave; the UI shows Saving then Saved without a Save button.
- [x] An empty or over-200-character title shows an error and does not persist that title.
- [x] A document that already has plain-text `content` opens without crashing and can be edited and saved as TipTap JSON.
- [x] Opening another user’s document still shows not found.
- [x] `npm run typecheck` and `npm run build` pass.
- [x] The README mentions formatting and autosave.
