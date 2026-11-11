# Ajaia Docs

A lightweight document editor with email-password accounts, TipTap rich text (bold, italic, underline, headings, lists), debounced autosave, `.txt` / `.md` upload, document sharing (**Can view** / **Can edit**), and anchored comments on selected text.

## Local setup

Use Node.js 22.20 or newer.

```bash
npm install
cp .env.example .env.local
```

Create a free project in the [Neon console](https://console.neon.tech). Copy the **direct** connection string into `.env.local` as `DATABASE_URL`. The app does not read a pooled string yet.

```bash
npm run db:migrate
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The database check is [http://localhost:3000/api/health](http://localhost:3000/api/health).

```bash
npm test
```

`npm test` runs share-permission checks against Neon using the seeded accounts (requires `DATABASE_URL` in `.env.local` and a prior `npm run db:seed`).

## Live URL

Pending deploy on Vercel Hobby. After deploy, replace this section with the production URL. Setup steps are in `SUBMISSION.md`.

## Upload

From the home page, upload a single `.txt` or `.md` file (max 512 KiB). The file becomes a new editable document. Other types are rejected. Markdown is imported as plain text paragraphs, not rendered formatting.

## Sharing

The home page splits documents into **Owned** and **Shared with me**. Open a document you own to share it by email with another account as **Can view** or **Can edit**. Viewers can open the document but cannot change it. Editors can edit title and body. There are no public links. Use the seeded accounts below to try sharing between users.

## Comments

Anyone with access to a document (owner, editor, or viewer) can select text and leave a comment. Open comments appear in the right-hand panel with a highlight on the quoted text when it still exists in the document. The comment author or the document owner can resolve or delete a comment. Commenting does not change the document body, so viewers stay view-only for title and content.

## Accounts

There is no email verification and no password reset. Sign up with any email, or log in with a seeded account. `npm run db:seed` creates these users and does not duplicate them if you run it again.

| Email | Password |
| --- | --- |
| ada@ajaia.test | docs-demo-password |
| grace@ajaia.test | docs-demo-password |
| lin@ajaia.test | docs-demo-password |
