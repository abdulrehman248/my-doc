# 05 — Upload

## What's required

- From `/`, a signed-in user can upload one `.txt` or `.md` file. The upload creates a new document owned by that user and opens it at `/documents/[id]`.
- The home page states that only `.txt` and `.md` are accepted (near the upload control). The README states the same limit.
- Title comes from the file name without the extension, trimmed, and capped at 200 characters. If that would be empty, use `Untitled`.
- File bytes are read as UTF-8 text. The body is stored as TipTap JSON in `documents.content`, using the same plain-text-to-paragraphs conversion already used for legacy rows (line breaks become paragraphs). Markdown is not parsed into bold/italic/headings on import; the source text is editable in TipTap afterward.
- Server-side checks:
  - The user must be signed in. Signed-out visitors cannot upload.
  - Reject any file that is not `.txt` or `.md` (case-insensitive extension). Show an on-page error and do not create a document.
  - Reject an empty file selection with an on-page error.
  - Reject a file larger than 512 KiB with an on-page error.
- No new tables. No object storage. The file is not kept as a separate blob after import.
- No `.docx`, attachments, or multi-file upload in this feature.

## Decisions

- Import is text-in, document-out. Both `.txt` and `.md` use the plain-text paragraph conversion so TipTap can open the result immediately.
- Size cap is 512 KiB so uploads stay under the default Server Actions body limit with room to spare.
- Extension is checked on the server from the file name. MIME type alone is not trusted.
- Upload lives on `/` next to **New document**. Errors stay on `/`; success redirects to the new document.

## Passing criteria

- [x] `/` has an upload control that states only `.txt` and `.md` are accepted.
- [x] Uploading a `.txt` or `.md` creates a document, opens it, and shows the file text in the editor after refresh.
- [x] The document title matches the file name without extension (or `Untitled` when that would be empty).
- [x] Uploading a non-`.txt`/`.md` file stays on `/` with an error and creates no document.
- [x] An oversize file (above 512 KiB) is rejected with an on-page error.
- [x] A signed-out user cannot upload.
- [x] `npm run typecheck` and `npm run build` pass.
- [x] The README states the `.txt` / `.md` upload limit.
