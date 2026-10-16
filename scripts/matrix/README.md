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

A round excludes up to 200 recent criterion combinations, comparing sets rather than just header order; swapping Hard's axes also counts as the same combination. If the finite catalog is exhausted, an older combination may return, but the immediately preceding combination remains excluded. A new random seed and round ID are generated for every round. The dataset is unchanged by this gameplay update.

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

## Next database iteration: milestone fields

No player data was changed for the difficulty-selector/catalog update. The first ten definitions in `src/lib/matrix/criteria.ts` are the requested conditions. Existing career goals, career assists and World Cup/Ballon d'Or honours are usable now. Six definitions await additional verified numeric fields in each player's `stats`:

| Field | Meaning | Qualifying value |
| --- | --- | --- |
| `uclTitles` | Number of Champions League winner titles | at least 3 |
| `maxSeasonGoals` | Highest verified senior goal total in one season, using one documented scope across players | at least 50 |
| `uclAllTimeRank` | Verified rank in the global all-time Champions League scoring table, using consistent tie rules and snapshot date | 1 through 15 inclusive |
| `seniorCaptainAppearances` | Full-A senior national-team matches captained | at least 1 |
| `leagueTitles` | Verified senior top-flight league winner titles | at least 5 |
| `topFiveLeagueClubs` | Distinct clubs with official senior appearances while competing in England, Spain, Germany, Italy or France's top flight | at least 3 |

Use `null` or omit a field when evidence is unavailable. Never substitute 0 for unknown, rank the 500-player roster as if it were the global UCL table, derive captaincy from senior caps, or infer title counts from a winner slug. Title counts must avoid double-counting the same season; league titles exclude cups, super cups and lower divisions. Top-five club counts must use the league/season of the actual appearance, exclude youth/B teams, and count loans only when official senior appearances occurred. Store source provenance, scope and timestamps in the next data revision before enabling these fields. The existing engine supports inclusive lower and upper bounds and automatically admits newly supported catalog criteria when verified fields are populated. A fresh dataset version changes the puzzle signature so stale boards cannot be replayed against different facts.

## Rebuild

Use the existing pinned Python environment and Higher or Lower source importer. `tmp/higher-lower/source/{id}.json` must contain the original appearance captures for the bundled roster. Matrix does not change the Higher or Lower dataset.

```powershell
# Obtain missing honour captures, then build the complete Matrix dataset.
scripts/higher-lower/.venv/Scripts/python.exe scripts/matrix/build-dataset.py --fetch-honours

# Rebuild offline from the existing source and honour captures.
scripts/higher-lower/.venv/Scripts/python.exe scripts/matrix/build-dataset.py

# Explicitly refresh all honour evidence from the source.
scripts/higher-lower/.venv/Scripts/python.exe scripts/matrix/build-dataset.py --refresh-honours
```

Honour captures are stored in ignored `tmp/matrix/honours/{id}.json` with the provider player ID, source profile URL, timestamp, and raw response. The builder uses the pinned adapter's `player_achievements` records, exact winner labels, and the established throttled transport. A missing/mismatched capture fails the build before replacing the dataset. The final file is written atomically, with a deterministic content version and the actual latest source-capture timestamp. This build is separate from the hosted Higher or Lower refresh workflow; no new remote database migration is required.

## Verification

```powershell
npm run test:matrix
npm run test:higher-lower
npm run test:scoreline
npx tsc --noEmit --incremental false
```

Matrix tests cover all 500 local portraits, senior-team evidence, 36 successive rounds across three levels with no repeated combinations, catalog completeness, missing-evidence exclusion, bounded ranks, unique-answer matching, draft privacy, edits/removal/reuse, full/partial/blank submission, scoring and locks, individual criterion reviews, session restoration and answer-free sharing.

Browser checks cover desktop/mobile layouts, editable selections, hidden draft results, whole-grid submission, row/column/both mismatch review, blanks, saved progress, new rounds, difficulty isolation, keyboard controls and reward idempotency on reload. Generated artwork prompts and sources are recorded in `public/img/matrix/ASSETS.md`.
