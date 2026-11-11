# 02 — Auth

## What's required

- Email and password signup, login, and logout. A signed-in user stays signed in after refresh.
- Two tables, added in `db/schema.ts` and created with `npm run db:generate` then `npm run db:migrate`:
  - `users`: `id`, unique `email`, `password_hash`, `created_at`. Email is stored in lowercase.
  - `sessions`: `id`, `user_id`, `token_hash`, `expires_at`.
- Pages:
  - `/signup` creates an account and signs the user in.
  - `/login` signs in an existing account.
  - `/` is the signed-in home. It shows the current email and a logout control. A signed-out visitor is sent to `/login`.
  - A signed-in visitor who opens `/login` or `/signup` is sent to `/`.
- `/api/health` stays public and does not require a session.
- Passwords are hashed with Node `scrypt` before they are stored. The database never stores the password.
- The session cookie is `httpOnly`, `SameSite=Lax`, and `Secure` in production. It holds a random token. Only the hash of that token is stored. The session lasts 14 days. Logout deletes that session and clears the cookie.
- Server-side checks:
  - Email must be a normal email address. Password must be at least 8 characters.
  - Signup with an existing email shows “An account with that email already exists.”
  - A wrong login shows “Invalid email or password.” It does not say which field was wrong.
  - The forms show these errors on the page.
- `npm run db:seed` creates three users if they are missing, and does not duplicate them when run again:
  - `ada@ajaia.test`
  - `grace@ajaia.test`
  - `lin@ajaia.test`
  - Shared password: `docs-demo-password`
- The README lists those accounts, the seed command, and that there is no email verification or password reset.

## Decisions

- Accounts live in this app’s Postgres tables. This feature does not use Neon Auth.
- Sessions are rows in Postgres, not a signed token that cannot be revoked.
- `scrypt` comes from Node, so auth does not add a native password package.
- Seed three users now. Later sharing needs an owner, a second person, and someone with no access.
- No password reset, email verification, OAuth, or rate limiting in this feature.

## Passing criteria

- [ ] Signup with a new email opens `/` showing that email.
- [ ] Signup with an existing email stays on `/signup` and shows the duplicate-email error.
- [ ] A password shorter than 8 characters is rejected on signup and login.
- [ ] Login with a seeded user opens `/` showing that email.
- [ ] A wrong password stays on `/login` and shows “Invalid email or password.”
- [ ] Refresh keeps the user signed in.
- [ ] Logout returns to `/login`, and `/` is not available until the next login.
- [ ] `/api/health` still returns `200` with no session cookie.
- [ ] `npm run db:seed` can be run twice without creating duplicate users.
- [ ] The README lists the three seeded accounts and the seed command.
