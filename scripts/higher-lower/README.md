# Higher or Lower: 100-player data pipeline

The game now uses `src/data/higher-lower-snapshot.json`, a validated snapshot of exactly 100 independently resolved Transfermarkt IDs. It includes active and retired players. The old `players.json` and HTML updater remain available for other modes; this game no longer consumes those statistics.

## Categories and definitions

Only Market Value, Goals, Assists and Transfer Value are enabled. Caps, UCL and EA Rating remain visibly marked Coming soon.

- **Market Value:** latest available current Transfermarkt valuation in EUR. Only active players with a positive current valuation are eligible; retired and unvalued players are excluded. The cards use current values, not historical peaks. The source valuation date is retained as `marketValueDate`.
- **Career Goals / Career Assists:** senior first-team club totals **plus full-A international totals**, including senior international friendlies and appearances for every senior country represented. Youth, reserve and Olympic teams, club friendlies, future/live/postponed games and duplicate match IDs are excluded. Completed extra-time and penalty-shootout matches count; player goals include extra time but exclude shoot-out kicks. The snapshot stores separate `coverage.club` and `coverage.international` appearance/goal/assist counts, which must add up to each career total. Historical match coverage varies.
- **Transfer Value:** the fee of one specified completed permanent senior club move, in EUR. Each card shows its origin/destination crests, club names, date and season. A player can have multiple eligible moves, but exactly one is selected when their card appears. That move and fee remain fixed while the card remains in its original physical slot for at most two matchups. Players are sampled first, then one of their eligible transfers, so a long transfer history does not disproportionately weight that player. Loans, loan returns, internal moves, youth/reserve moves, upcoming transactions, unclassified clubs and unknown fees are excluded. Explicitly classified free transfers count as a known zero, even when the source omits the numeric fee.

Unknown statistics stay `null` and exclude the player from that category. Known zero goals, assists and free transfers remain playable; a zero market valuation means unvalued and is excluded. Missing goals or assists in even one included club or international match make that player's corresponding career total unavailable. The seed therefore need not have 100 eligible players in every category. Player/coverage timestamps and original source URLs are preserved in the snapshot. Schema version 3 requires auditable career breakdowns; older club-only publications are rejected by the game. Individual transactions remain in `transfers[]` and current market valuations are unchanged.

## Reveal and elimination rules

Every new run or category switch starts with both card values hidden as `???`. A pick reveals both values for 1.2 seconds. Correct picks earn 15 XP based on the actual higher value. Normally the higher-valued card stays in its original slot and remains revealed, while the lower card is replaced with a hidden challenger. Each card can appear in at most two consecutive matchups, counting its initial appearance: after its second matchup it is replaced even if it wins, and the other, newer card stays revealed on its existing side. This rotation never changes whether the guess was correct or the points earned. Either pick is accepted for equal values, with the same two-matchup limit. A new card, category change or restart resets its appearance counter. An incorrect pick reveals both values before the end-of-streak panel appears. Restarting hides both values again.

## Refresh locally

Requires Python 3.12 or 3.13. The adapter is pinned to `felipeall/transfermarkt-api` 5.0.0. The SDK accesses Transfermarkt directly; neither the app nor this worker relies on the project's public testing server.

```powershell
uv venv --python 3.13 scripts/higher-lower/.venv
uv pip install --python scripts/higher-lower/.venv/Scripts/python.exe -r scripts/higher-lower/requirements.txt
scripts/higher-lower/.venv/Scripts/python.exe scripts/higher-lower/sync.py
node scripts/higher-lower/cache-badges.cjs
```

On Linux/macOS, use `.venv/bin/python` in place of `.venv/Scripts/python.exe`.

`--limit 30` validates a sample without publishing it. `--resume` reuses successful source captures from the past 12 hours after an interrupted import; omit it for a fresh daily update. Captures and failure reports are stored under ignored `tmp/higher-lower/`. Replaying identical captures produces the same immutable snapshot version and payload.

The SDK's raw match data is used intentionally: its public aggregated stats service converts missing goals/assists into zeros. The pinned raw client lets our normalizer preserve unknown values. Throttling applies to every underlying request, including SDK fan-out; timeouts/transient errors have bounded retries. An upstream block stops the import rather than attempting to evade it. The importer also compares against the last snapshot: unexpectedly truncated appearance histories or substantial goal/assist decreases stop publication while allowing small retrospective corrections.

Club badges in the bundled seed, including all transfer origin/destination crests, are cached locally. A future club that is not in the local badge manifest uses its source crest URL. All 100 players have reviewed local transparent headshots with identical card framing. `node scripts/higher-lower/cache-portraits.cjs` restores and verifies the portrait collection from `public/img/higher-lower/asset-sources.json`. New player identities require a curated portrait; the game excludes uncurated identities rather than substituting rectangular match photos. See the asset provenance notes in `public/img/higher-lower/ASSETS.md`.

## Enable automatic Supabase publication

1. Apply `supabase/migrations/202610160001_higher_lower_snapshots.sql`, `supabase/migrations/202610160002_higher_lower_transfer_questions.sql`, then `supabase/migrations/202610160003_higher_lower_career_totals.sql` in order to the intended Supabase project. Apply only migrations not already applied. The third migration upgrades the publication validator to schema version 3 without altering existing immutable snapshots.
2. Configure GitHub Actions secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Keep the service key out of browser/public environment variables.
3. Run the **Update Higher or Lower dataset** workflow manually for the initial publication. It subsequently runs daily at 03:20 UTC.
4. Set `HIGHER_LOWER_USE_SUPABASE=true` for the Next.js deployment. Its existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must point to the same project.

To publish from a configured local environment:

```powershell
scripts/higher-lower/.venv/Scripts/python.exe scripts/higher-lower/sync.py --resume --publish
```

The RPC inserts an entire immutable snapshot and moves a singleton current-version pointer in one transaction. It rejects incomplete/duplicate rosters, malformed values and mutations of existing versions. Only the service role can publish; anonymous clients have read-only access. This uses separate tables and does not overwrite existing player/profile tables.

The server checks for a newer validated publication at most once per minute, retains the last successful read on errors, and falls back to the bundled snapshot after a cold start. With Supabase disabled, it uses the bundled snapshot directly. The page and `/api/higher-lower/snapshot` read through the same loader. Each running game pins its received snapshot; values do not change mid-run. Reloading obtains the latest published version.

The optional community leaderboard uses `/api/higher-lower/leaderboard`. Its server loader performs only a public anonymous profile read, with a three-second timeout, shared concurrent requests and a one-minute cache. Backend failures retain the last valid results or return an empty list, leaving the widget's labelled Preview visible. The widget validates responses and handles network errors without blocking gameplay or exposing a Supabase fetch failure in the browser runtime overlay. Authentication and XP persistence keep their existing separate flows.

**Activation status:** the initial 100-player import is complete locally. Applying the remote migration, configuring secrets and enabling the hosted schedule require access to the target Supabase/GitHub environment; those are not implied by a successful local import.

## Verification

```powershell
npm run test:higher-lower
scripts/higher-lower/.venv/Scripts/python.exe -m unittest discover -s scripts/higher-lower -p 'test_*.py'
npx tsc --noEmit --incremental false
```

## Sources and permissions

Adapter: https://github.com/felipeall/transfermarkt-api . Its MIT licence applies to its code, not a Transfermarkt data licence. The repository documents that the upstream JSON API is internal and can change or refuse requests. Confirm the applicable data usage terms for the published app. Each imported player retains its Transfermarkt profile URL.
