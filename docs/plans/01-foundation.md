# 01 — Foundation

## What's required

- A Next.js App Router app in TypeScript, scaffolded at the repo root, that runs locally.
- Tailwind installed and applied to the root layout.
- Drizzle ORM connected to Neon through the Neon serverless driver, using one `DATABASE_URL` for local and deployed environments.
- Files:
  - `db/index.ts` — the database client. It fails clearly if `DATABASE_URL` is missing.
  - `db/schema.ts` — empty for now. Product tables come in later features.
  - `drizzle.config.ts` — points at the schema and a `drizzle/` migrations folder.
  - `app/page.tsx` — a plain page that shows the app is running.
  - `app/api/health/route.ts` — `GET` runs `select 1`. It returns `200 { ok: true }` when the database answers, or `503 { ok: false, error }` with a short message when it does not.
  - `.env.example` — lists `DATABASE_URL` with a placeholder.
  - `README.md` — local setup only: Node version, install, create a free Neon project, copy the direct connection string into `.env.local` as `DATABASE_URL`, migrate, run.
- Scripts in `package.json`: `dev`, `build`, `start`, `typecheck`, `db:generate`, `db:migrate`.
- `.env.local` is gitignored.

## Decisions

- The app and Drizzle migrations both read `DATABASE_URL`, the direct Neon connection string, for this feature. `DATABASE_URL_POOLED` stays in `.env.local` and is unused until deployment.
- Drizzle migrations are generated files committed under `drizzle/`. Do not use `drizzle-kit push`, so schema changes stay reviewable.
- The health route never exposes the connection string or raw driver errors.

## Passing criteria

- [x] `npm run dev` serves the running page at `http://localhost:3000`.
- [x] `GET /api/health` returns `200 { ok: true }` with a valid `DATABASE_URL` in `.env.local`.
- [x] `GET /api/health` returns `503` with a safe message when the database is unreachable.
- [x] `npm run db:migrate` completes against an empty Neon database.
- [x] `npm run typecheck` and `npm run build` pass.
- [x] `.env.example` is present, `.env.local` is gitignored, and no secret is in the repo.
- [x] Following the README alone gets a fresh machine to a running app.
