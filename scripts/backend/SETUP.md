# FootyGen backend setup

Project: `bcghsiwettjrjxgzbtvu` (`footygen`). The app's ignored `.env.local` now contains the supplied project URL and publishable key. Both required Supabase packages are already installed.

## 1. Create the database schema

Open this project's **SQL Editor**, create a new query, paste the complete contents of [`setup.sql`](./setup.sql), and run it. This file applies all seven migrations in one transaction and keeps a migration journal. Re-running the identical file preserves existing data.

It creates profiles automatically on signup; private preferences, saved games, result history and the XP ledger; public leaderboards; private Scout rooms and matchmaking; and the Higher or Lower snapshot schema. Users can edit their own display name and preferences, but cannot directly award XP, submit scored results, edit game saves, or read Scout secrets.

The file is generated from `supabase/migrations/`; regenerate it with `npm run backend:setup` after changing a migration. A changed migration that was already applied is rejected rather than silently rewriting an existing database.

## 2. Add the server key

In **Settings > API Keys > Secret keys**, copy the project's `sb_secret_...` key into the existing empty line in `.env.local`:

```dotenv
SUPABASE_SECRET_KEY=your-secret-key
```

Keep this value in the local environment file and your hosting provider's secret environment settings. Do not paste it into chat, source code, a browser setting, or any `NEXT_PUBLIC_` variable. A legacy service-role key is also supported as `SUPABASE_SERVICE_ROLE_KEY`, but the current secret key is preferred.

The public key enables sign-in and permitted reads. The server key is separately required for authoritative game saves, scoring, room storage and match rewards. A publishable key cannot create the schema or grant those server privileges.

## 3. Configure Google sign-in

In Google Cloud Console, create or select an **OAuth 2.0 Web application** client. Add this exact authorized redirect URI:

```text
https://bcghsiwettjrjxgzbtvu.supabase.co/auth/v1/callback
```

Add `http://localhost:3000` and the actual production origin as authorized JavaScript origins when needed for your Google configuration. Configure the OAuth consent screen and add test users if the Google application is still in testing.

In Supabase **Authentication > Sign In / Providers > Google**, enable Google and enter that client's ID and secret. Google credentials belong in that provider configuration; the app does not need to receive them.

In **Authentication > URL Configuration**:

- Set **Site URL** to the real production origin, or `http://localhost:3000` while developing.
- Add `http://localhost:3000/auth/callback**` to the redirect allowlist.
- If you use `127.0.0.1`, also add `http://127.0.0.1:3000/auth/callback**`.
- Add the production origin followed by `/auth/callback**` when the deployment URL is known.

These are two different callbacks: Google returns to Supabase's `/auth/v1/callback`; Supabase returns to the app's `/auth/callback`.

## 4. Restart and verify

Restart the development server after adding the secret key:

```powershell
npm run dev
```

In another terminal:

```powershell
npm run backend:check
npm run test:backend
```

`backend:check` only checks configuration and schema; it does not create test users, send email, or change scores. It reports whether Google is enabled, public ranking access works, and the server can reach the private tables.

Then test in the app:

1. Sign in with Google and confirm the profile starts with zero earned results.
2. Complete a game, reload, and check the result and XP appear once.
3. Open the same account in another browser and resume a saved game.
4. Create a Scout friend room, join from a second account/browser, and finish the match.
5. Check both the combined leaderboard and that mode's individual board.

Optional: publish the bundled, verified 500-player dataset using `npm run backend:publish`. Set `HIGHER_LOWER_USE_SUPABASE=true` after successful publication if database snapshot updates should be enabled. The bundled dataset remains available without this step.

## Data behavior

- Signed-in game actions are validated by the application server; saved state and rewards commit together with revision checks.
- Matrix has one saved board per difficulty; Higher or Lower has one saved streak per category; Scoreline and Journeyman each have a saved active run.
- Scout's Duel resumes an active signed-in account's room and sends realtime notifications only to account members. Guest duels retain their private browser session and polling fallback.
- Combined rankings use earned lifetime XP; per-mode boards use the best saved score. Scores use each mode's natural units: match points, correct Matrix cells, Journey question points, Higher or Lower streak, or Scout win (1/0).
- Guest games remain playable on the current device. Client-editable historical guest XP is not imported into ranked accounts.
- Existing player and football datasets stay in the repository as canonical server inputs. No screenshot text or invented leaderboard entries are imported.

## Deployment

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY`, and the persistent `SCORELINE_SESSION_SECRET` on the host. Use the same Scoreline secret across instances. Add the deployment origin to the Supabase redirect allowlist and Google configuration before testing production login.

Optional Gemini credentials are independent of the database connection; deterministic Scout questions work without Gemini.
