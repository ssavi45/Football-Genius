# Scout's Duel

The `/games/scouts-duel` page supports AI matches, random matchmaking, and six-character friend rooms. The server owns secret selection, answers, deadlines, shots, and results. Both clients receive the same ordered 24-player board, with exactly 2 goalkeepers, 7 defenders, 7 midfielders, and 8 forwards. Every board has at least four continents, at most five active players per club, and at most seven per current league.

## Local development

Run `npm run dev`. Without a service-role key, development uses atomic JSON files in the ignored `tmp/scouts-duel/` directory. This works across browser sessions on one development host; it is not a production or multi-host persistence option. The lobby reports an unavailable service in production when the private store has not been configured.

Open two separate browser profiles or an incognito window to test a friend room. Tabs sharing the same cookie represent the same scout. Reloading restores the current room from localStorage and its HTTP-only session cookie. A stale cookie or changed dataset returns the user to the lobby.

## Production setup

1. Apply `supabase/migrations/202610180001_scouts_duel.sql` to the existing project, which must already have `public.profiles` and Supabase Auth. This implementation does **not** apply it automatically.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the same project. Set `SUPABASE_SERVICE_ROLE_KEY` only in the server environment; never prefix it with `NEXT_PUBLIC_`. Optional `SUPABASE_URL` must point to that same project.
3. Run behind HTTPS so the secure, HTTP-only, SameSite session cookie works. Keep API and game pages on the same origin.
4. Deploy the Node.js routes. Realtime publishes only `scout_duel_signals` (opaque room UUID and revision). Clients then fetch their filtered view; a one-second poll also provides recovery if Realtime is unavailable.

The private room and reward tables have RLS enabled and no browser roles have read/write permission. Mutations use an optimistic compare-and-swap RPC. Matchmaking serializes queue selection and insertion in a database transaction; assistance settings must match. Two sessions for the same authenticated account cannot duel each other.

Authenticated wins earn 200 XP through an idempotent server ledger; losses and draws award zero. The client refreshes the profile after collection. Guest progress remains local to the browser. Existing profile write policies used by other modes are outside this migration; this mode does not make the entire site's XP economy tamper-proof.

Add an operational retention job before a public launch. Finished private rooms can be deleted after the chosen retention period once their rewards are settled, deleting corresponding `scout_duel_rewards` first; signals cascade with rooms. No scheduled cleanup or external migrations have been executed here. Polling, per-process rate limiting, and request-driven deadline advancement suit the initial implementation; a high-volume deployment should use distributed rate limiting and a scheduled authoritative timer worker. Waiting queues expire for matching after 60 seconds without a heartbeat.

## Questions and AI

Position, region/nation, current club/league, active status, age, awards, and footedness questions resolve against the server's normalized snapshot. Historical club questions appear only when the whole board has history data. The answer is never supplied by either human player.

Custom questions first use a restricted parser. Unsupported or compound questions are rejected without consuming a turn. In AI mode only, optional server variables `GEMINI_API_KEY` and `SCOUT_GEMINI_MODEL` enable Gemini to translate wording to a catalog question. Configure an explicit model available to your account. The user confirms the canonical wording; Gemini receives neither the secret nor the roster, and cannot generate a YES/NO result. Online and friend rooms use deterministic parsing only. Teammate questions are currently unsupported because verified shared-match records are not available.

The bot itself is a local information-splitting policy and needs no external model key. Rookie chooses random useful questions, Tactician usually chooses an even split, and World Class chooses the best split. Its decision function receives candidates and public evidence, never the hidden player. This is not an unconfigured Gemini service presented as a live model opponent.

## Rule choices

- Select a secret within 30 seconds; otherwise the server picks an actual board player.
- Turns last 45 seconds, or 60 in a host-configured friend room. A timeout consumes the turn.
- Manual elimination is reversible and available while either scout plays; it does not consume a turn. Auto-assist follows verified answers instead.
- Shots are unlimited. A miss eliminates that suspect, passes the turn, and blocks shooting on the next own turn. A correct shot wins; the obsolete hardcore option is ignored.
- There is no turn cap or forced final shootout. Questions and timeouts keep alternating turns until a correct shot, resignation, or disconnect forfeit decides the match. Rooms saved in the former final-shootout phase resume normal play with secrets still hidden.
- Multiplayer heartbeats missing for eight seconds pause the deadline for a further 45 seconds. Reconnection restores the saved time. Failure to reconnect forfeits; both absent produces an abandoned draw.

## Dataset coverage and factual limits

`src/data/scouts-duel-players.json` supplies 150 identities. `src/lib/scouts-duel/data.ts` joins existing Higher or Lower and Journeyman snapshots to reuse local portraits, DOBs, current club/league, and career histories. `src/data/scouts-duel-corrections.json` records targeted factual fixes and source links. Each room locks a hash of its normalized roster; a changed dataset requires a new room.

Scout's Duel uses its own transparent 256×256 WebP portraits, mapped by `src/data/scouts-duel-portraits.json`. `public/img/scouts-duel/portrait-sources.json` records source URLs, player identity checks, dimensions, and hashes. Run `node scripts/scouts-duel/build-portraits.cjs` to rebuild them from reviewed local cutouts and sourced replacements for the former full-photo fallbacks. Portrait-only presentation changes are applied after the room's dataset hash is calculated, so they do not reset an active duel.

This is a **partial factual audit**, not an independently verified 150-player release. The normalized snapshot currently has 5 unknown ages and 60 missing club histories. A question requiring an unknown field is removed for that entire board instead of turning unknown into NO. Remaining inherited footedness, honours, current-team and historical facts still need a complete source audit before promising factual accuracy. Structural tests and deterministic answers cannot establish that an inherited fact is true. Data is evaluated as of the snapshot date, not a live football feed.

## Verification

```sh
npm run test:scouts-duel
npm run validate:scouts-duel
npx tsc --noEmit --incremental false
```

The dataset validator writes an ignored report to `tmp/scouts-duel/validation-report.json`. Tests cover 1,000 board seeds, secret privacy, server truth evaluation, assistance/manual deduction, shot penalties, entropy decisions, timeouts, reconnects, and matches continuing beyond the former turn cap.

With the local development server running:

```sh
npm run test:scouts-duel:api
```

The API smoke test uses separate cookie sessions and real HTTP requests to verify friend rooms, shared boards, secret filtering, duplicate requests, invalid queries, shots/results, access control, simultaneous matchmaking, and incompatible-rule queues. It creates local test rooms. Set `SCOUT_TEST_URL` for another loopback port. Production Supabase RPCs and optional Gemini calls require their external configuration and are not covered by the local file-store run.
