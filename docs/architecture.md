# Architecture

## Stack

- **Next.js App Router** + TypeScript + Tailwind for UI and server actions
- **TipTap** for rich text (bold, italic, underline, H1/H2, lists, page breaks)
- **Drizzle ORM** + **Neon Postgres** (Free) for persistence
- Deploy target: **Vercel Hobby**

## Main tables

| Table | Purpose |
| --- | --- |
| `users` | Email/password accounts |
| `sessions` | HttpOnly cookie sessions (hashed tokens) |
| `documents` | Title + TipTap JSON body as text, owned by a user |
| `document_shares` | Per-user `view` or `edit` grant on a document |
| `document_comments` | Anchored comments (body + quote snapshot), optional `resolved_at` |

## Request flow

1. **Auth** — signup/login validate credentials, create a session row, set a cookie. `getCurrentUser` joins session → user on each protected request.
2. **Documents** — create/list/open/save go through helpers in `lib/documents.ts`. Autosave is a server action that rejects invalid titles and users without edit access.
3. **Sharing** — owners upsert rows in `document_shares`. Open and save always call `getDocumentAccess` so view-only shares cannot write and strangers get not-found.
4. **Comments** — anyone with access can create comments; highlights are decorations from quote text, not marks in the stored TipTap JSON. Resolve/delete is author or owner.

## Explicit non-goals

No live co-editing, suggestion/track-changes mode, public links, version history, `.docx` import, folders, or offline mode.
