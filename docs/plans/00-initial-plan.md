# Initial plan — Ajaia Docs

Read this file before any feature plan or code. It is the assignment context. Feature plans live next to it as `01-….md`, `02-….md`, and so on. Update **Status** when a feature is planned, started, or passed.

## Assignment

Build a lightweight document editor inspired by Google Docs for an internal productivity tool. The goal is a coherent product slice, not a full Google Docs clone.

Constraints that stay in force:

- Spend the effort on a few deep areas. A focused partial solution is better than wide, shallow coverage.
- Reviewers must not need a paid dependency or service.
- Final submission needs source code, a README with local setup, an architecture note, an AI workflow note, `SUBMISSION.md`, a live URL, seeded credentials, and a text file with the walkthrough video URL.
- The walkthrough video and the Google Drive folder are recorded and uploaded by the user. The repo only prepares the notes and the video URL file.
- If something is unfinished, state what works, what is incomplete, and what the next 2–4 hours would add.

## Locked decisions

1. Sharing means access control. There is no live co-editing, shared cursors, or conflict handling.
2. Upload accepts `.txt` and `.md` only. The file becomes a new editable document. The UI and README state that limit.
3. A share grant is either **Can view** or **Can edit**.
4. Auth is email and password, with signup, login, and logout. Seeded users exist so a reviewer can try sharing without creating accounts.
5. Stack is Next.js (App Router), TypeScript, Tailwind, Drizzle, and Neon Postgres on the Free plan. TipTap is the editor when that feature starts. The later deploy target is Vercel Hobby.
6. Neon Free and Vercel Hobby are $0 only if the plans are not upgraded. Neon limits that matter here: 1 GB storage and 100 compute-hours per project per month. Compute sleeps after 5 minutes idle.
7. The user creates the Neon project. `DATABASE_URL` stays in `.env.local`. Commit `.env.example` only.

## Explicit cuts

No version history, `.docx` import, public links, folders, offline mode, real-time collaboration, or suggestion / track-changes mode.

## Feature sequence

Each feature gets its own plan before its code. Do not implement a feature before that plan exists. Do not start the next feature until the current plan’s passing criteria are met, unless the user says to move on.

1. **Foundation** — the app runs locally and reaches Neon. No product tables.
2. **Auth** — signup, login, logout, session, seeded users.
3. **Documents** — create, rename, list, open, save, and reopen.
4. **Editor** — bold, italic, underline, headings, lists, autosave, and formatting that survives reload.
5. **Upload** — `.txt` and `.md` become a new document.
6. **Sharing** — an owner, a view or edit grant, separate owned and shared lists, and server-side enforcement.
7. **Submission quality** — one automated test of share permissions, validation and error handling, deploy, README, architecture note, AI workflow note, and `SUBMISSION.md`.
8. **Comments** — anchored comments on a text selection, sidebar list, resolve/delete, decorations from quote snapshots (stretch).

## How to write a feature plan

Path: `docs/plans/NN-short-name.md`

Use these sections, in this order:

1. **What’s required** — the concrete behavior and files for this feature.
2. **Decisions** — only choices that change the build.
3. **Passing criteria** — a checklist, and the last section in the file.

Do not repeat this initial plan inside a feature plan.

## How to continue

1. Read this file, then the latest feature plan.
2. Do only the step the user names.
3. When a feature meets its passing criteria, mark it passed in **Status** before planning the next one.
4. Keep scope inside the locked decisions. Ask the user before adding a capability that is not in the current feature plan.

## Status

- Application code: foundation, auth, documents, editor, upload, sharing, comments, and submission quality.
- Initial plan: written.
- Next step: user finishes Vercel deploy + walkthrough video URL, then packages the Google Drive submission folder.

| Feature | Plan | Implementation |
| --- | --- | --- |
| 01 Foundation | written | passed |
| 02 Auth | written | passed |
| 03 Documents | written | passed |
| 04 Editor | written | passed |
| 05 Upload | written | passed |
| 06 Sharing | written | passed |
| 07 Submission quality | written | passed |
| 08 Comments | written | passed |
