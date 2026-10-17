# Football Matrix

`/games/matrix` is an unlimited-round 3x3 puzzle. It uses the shared navbar and collapsible sidebar, defaulting to compact when no sidebar preference has been saved.

## Round flow

Select players for up to nine squares. Each identity may occupy only one square. Before submission, players can replace/remove selections, clear the draft, or leave unknown squares blank. Draft answers are neutral: no correctness counts, result icons, criterion feedback, XP or share results are revealed.

**Submit Grid** locks and evaluates the entire board, including partial or entirely blank grids. Correct cells glow green, incorrect cells glow red, and blank cells remain neutral. Clicking a submitted cell opens a review showing the row criterion and column criterion separately, including whether each was met and an explanation for missing criteria. Correct answers earn 25 XP each; a perfect 9/9 earns another 100 XP, for a maximum of 325 XP. XP and game results are recorded once from the submit action, after saving the submitted state. Reloading or reviewing a saved board awards no additional rewards.

**Play Another Round** requests a fresh randomly seeded board from a server action. Round counters and active progress are separate for Easy, Medium and Hard; there is no daily limit or midnight reset. The difficulty tabs support mouse/touch and Left/Right/Home/End keys.

- Easy: three clubs by three nations.
- Medium (default): three clubs by three stats/trophies.
- Hard: three stats/trophies by three other stats/trophies. All six criterion IDs are distinct.

The catalog has 15 clubs, 15 senior nations, all ten requested milestones and the existing evidence-backed milestones. Generation uses only criteria with eligible players. It targets at least 10 candidates per Easy cell, 3-8 for Medium, and 1-3 for Hard. These are soft overlap targets while the database awaits expansion. At least one valid candidate per cell and a full matching of nine different player identities are mandatory. Empty or unsolvable boards are never published.

A round excludes up to 200 recent criterion combinations, comparing sets rather than just header order; swapping Hard's axes also counts as the same combination. If the finite catalog is exhausted, an older combination may return, but the immediately preceding combination remains excluded. A new random seed and round ID are generated for every round. The enriched dataset version is included in every puzzle signature.

## Saved sessions

The active round is saved per profile/difficulty in `footygen_matrix_rounds_v2:{profileId}:{difficulty}`. A session contains the board, recent combination keys, and `{puzzleId, signature, answers, submitted, revision}`. Even an untouched round is saved so refreshing does not reroll it. Restoring canonicalizes the saved criteria against the catalog, checks the dataset signature, requires a solvable board, and rejects invalid/reused player IDs. Revision numbers synchronize edits, clearing, submission and subsequent rounds across tabs. Saves from the former daily/individual-guess model are not consumed by the new round model.

Browser persistence remains local to that browser/profile. It is not an authenticated server anti-cheat system or cross-device save service. A storage failure shows a notice and retains the current session in memory. The leaderboard illustration remains explicitly labelled **Preview** and links to the existing leaderboard.

## Data and evidence

`src/data/matrix-players.json` contains 500 verified identities with:

- `id`, `name`, `sourceName`, `nationality`, `nationalityFlag`, current club/retirement label, and original `sourceUrl`.
- `clubs`: Transfermarkt IDs with at least one recorded completed competitive senior first-team appearance. Loans count through actual appearances, not transfer registrations.
- `nations`: every senior full-A national team represented. Citizenship alone is never sufficient. Youth/reserve and Olympic teams are excluded.
- `honours`: verified `ucl`, `world_cup`, `ballon_dor`, and/or `copa_america` award slugs, read from source winner records. Participation and runner-up records do not qualify.
- `stats`: career goals/assists, senior caps, UCL competition goals (`CL` only, excluding qualifiers), and Premier League goals (`GB1`). Missing included match statistics remain null.

Player portraits resolve through the existing reviewed 500-player manifest, preserving aliases and content-hash cache invalidation. Criterion definitions are serializable; validation functions remain in `src/lib/matrix/engine.ts`.

The old `grid-players.json` is no longer consumed by Matrix. This avoids its incorrect World Cup claim for Dani Carvajal and its confusion between Luis Suárez and the historical Inter namesake. Both corrections are covered by the Matrix tests.

## Enriched milestone fields

All 16 canonical stat/trophy criteria now have eligible players in the connected 500-player snapshot. Numeric evidence includes `uclTitles`, `maxSeasonGoals`, `uclAllTimeRank`, `seniorCaptainAppearances`, `leagueTitles` and `topFiveLeagueClubs`, alongside career goals, assists, caps and competition goals.

- Career goals/assists cover recorded senior competitive club and full-A international appearances.
- Single-season goals use one club-season across senior competitive competitions, excluding international goals. If any included club goal row is unknown, the maximum stays null rather than turning missing goals into zeros.
- UCL goals/ranks cover the post-1992 main competition, excluding qualifiers. The top-15 registry includes all global boundary players, including identities absent from the app roster; tied totals use competition ranking. Unlisted players have null ranks and do not qualify.
- National captaincy uses explicit captain flags in recorded full-A matches. Missing flags remain unknown.
- Top-five club counts require recorded completed senior appearances in a club-season with verified top-flight league evidence. Future fixtures and unplayed registrations cannot establish eligibility.
- League titles use distinct competition/club/season awards. UCL and World Cup editions match a reviewed winner registry; calendar awards use the award year, not the season start. Winner registries and primary-source links are in `verified-records.json`.

The source history is not an independent certification of every player's complete career. Unknowns stay null. Overlap targets remain preferences: in particular, the roster does not support 10 candidates in every Easy cell. Every generated board still requires nine distinct valid answers. Team metadata may retain source crest URLs; all assets actually used by the criteria catalog and player search are checked locally. No external image request is needed for gameplay.

## Rebuild

The offline builder requires `tmp/higher-lower/source/{id}.json` and `tmp/matrix/honours/{id}.json` captures for each bundled identity. Missing/mismatched captures fail the build. Refresh source captures through the existing importer before rebuilding; the Matrix builder performs no network scraping and does not update Higher or Lower.

```powershell
scripts/higher-lower/.venv/Scripts/python.exe scripts/matrix/build-dataset.py
scripts/higher-lower/.venv/Scripts/python.exe scripts/matrix/validate-dataset.py
```

Eligibility is generated from `src/lib/matrix/criteria.ts` through `export-catalog.cjs`; there is no separate Python criterion catalog. The validator uses the actual TypeScript predicates, generator and nine-player solver, checks content versions and evidence reconciliation, decodes portrait transparency, and verifies local gameplay assets. Default simulation: 1,000 real runtime rounds per difficulty, including the 200-combination history window. Pools/intersections are cached per dataset so catalog expansion does not require full enumeration on every round request.

Generated audit artifacts live in ignored `tmp/matrix/`: `matrix-evidence.json`, `matrix-eligibility.json`, and `matrix-validation-report.json`. The report distinguishes whole-board overlap targets from per-cell targets and does not claim an exhaustive count of solvable boards. The previous Gemini report is superseded by this validator. A concise checked-in result is `dataset-validation-summary.json`.

The runtime imports `src/data/matrix-players.json` directly through `src/lib/matrix/data.ts`. No server database, migration, API key, or background fetch is required. Content-versioned signatures invalidate saved boards whose facts have changed. Existing portrait aliases and hash-based cache keys remain intact.

## Verification

```powershell
npm run test:matrix
scripts/higher-lower/.venv/Scripts/python.exe scripts/matrix/test_enrichment.py
npm run test:higher-lower
npm run test:scoreline
npx tsc --noEmit --incremental false
```

Tests cover source edition parsing, recent winner credits, title deduplication, invalid/future appearances, all 500 portraits, all 16 milestone criteria, unique-answer matching, draft privacy, editing/reuse, full/partial/blank submission, scoring, per-criterion reviews, session restoration and sharing. Browser checks cover desktop/mobile text-only criterion headers, unclipped progress cards, hidden draft results, whole-grid submission, result reviews and new rounds.
