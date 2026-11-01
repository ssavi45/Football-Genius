# Web gameplay reference for the Flutter app

Reviewed on 2026-10-31. Source: `web-nextjs` at
`a84a4b90859bbee207be7c04d5e0c6b066a45f47`, verified against the remote branch.
The existing Flutter checkout and UI edits were preserved. Source was inspected
with `git show` and an ignored snapshot under `.local/web-reference/source/`.

The public deployment at [footygen.online](https://www.footygen.online/) was
inspected in fresh browser guest sessions. All nine catalogue/game routes opened
successfully. The five implemented modes were exercised as described below.
This does not establish that the deployment's exact commit equals the branch
commit, or validate signed-in sync, multiplayer between people, or production
reward payouts. No account was used; the single AI test room was resigned after
inspection. Screenshots and interaction records are in ignored
`.local/web-reference/live/`.

## Implemented modes

| Mode | Web behavior | Flutter status |
| --- | --- | --- |
| [Higher or Lower](https://www.footygen.online/games/higher-lower) | Pick the higher of two player values; build an unlimited streak across four available categories. | Placeholder |
| [Football Matrix](https://www.footygen.online/games/matrix) | Build an editable 3x3 player grid, then submit the entire grid for evaluation. | Placeholder |
| [The Journeyman](https://www.footygen.online/games/journeyman) | Identify a footballer from a club career trail, with limited guesses and paid reveals. | Placeholder |
| [Scoreline Hero](https://www.footygen.online/games/scoreline) | Ten historic score predictions, tiered hints, three skips and a final review. | Playable, with differences listed below |
| [Scout's Duel](https://www.footygen.online/games/scouts-duel) | A server-managed 24-player deduction duel against a bot, online opponent or friend. | Placeholder |

Pixel Pitch, Bootroom Scramble and Tunnel Talk render `GameModeComingSoon` in the
web branch and show Coming Soon on the live deployment. Catalogue marketing
labels and reward badges should not be used as the specification for game rules.
Some READMEs also lag the code: for example, Higher or Lower's README says 100
players, while the current bundled snapshot contains 500.

## Higher or Lower

- Categories available now: current market value, career goals, career assists
  and the fee of a specific displayed transfer. Caps, UCL and EA Rating are
  disabled coming-soon categories.
- Both values start hidden. Tapping either card chooses it as the higher value;
  both values reveal for about 1.2 seconds before rotation or game over.
- A correct pick adds one to the streak and awards 15 XP. Either choice is valid
  on a tie. A wrong pick ends the streak; restart hides both values again.
- Cards stay on their existing sides. Normally the higher card survives, but
  each card can appear in at most two consecutive matchups. After its second
  matchup it is replaced even if it won. Rotation never changes correctness.
- A transfer card selects one specific eligible move and retains that move and
  fee while the card remains. Sampling a player precedes sampling their transfer.
- Missing values stay null and exclude that player from the category. Known
  zero goals, assists and free transfers are valid. Market value requires an
  active player and a positive valuation. A run pins its snapshot version.
- Signed-in runs use server progress. Guests retain their personal best locally;
  the current guest streak itself is not restored as a full saved run.

Data: `src/data/higher-lower-snapshot.json` has 500 players. The live market-value
screen showed 452 eligible players at review time. Player portraits, transfer
crests and source metadata are already available in the web branch.

Source: `src/lib/higher-lower.ts`, `src/lib/higher-lower/types.ts`,
`src/components/dashboard/HigherLowerGame.tsx`.

Live checks: hidden opening values, two correct picks, reveal/rotation, and
switching to Transfer Value. The first winning card was retired after its second
matchup, as specified by the engine.

## Football Matrix

- A player must satisfy both the row and column criteria and can occupy only
  one square. Search supports names and normalized spelling.
- Draft selections can be replaced, removed or cleared. Drafts disclose no
  correctness or rewards. Blanks are allowed.
- Submit Grid locks and evaluates all nine squares together. Correct is green,
  incorrect is red, and blank remains neutral. A submitted cell opens a review
  of the two criteria separately.
- Each correct cell earns 25 XP; a perfect grid adds 100 XP: maximum 325 XP.
  Reloading a submitted grid must not award it again.
- Easy is clubs x nations; Medium is clubs x statistics/trophies; Hard uses
  statistics/trophies on both axes with six distinct criterion IDs.
- Rounds are unlimited, with separate progress by difficulty. New boards must
  have a complete solution containing nine different players. Nonempty cells
  alone do not prove solvability. Recent combinations are avoided.
- Guests restore versioned rounds locally by profile/difficulty. Signed-in
  users additionally use `/api/game-progress`; older local-only documentation
  does not describe the whole current implementation.

Data: `src/data/matrix-players.json` contains 500 identities plus recorded
club, national-team, trophy and statistic fields.

Source: `src/lib/matrix/{criteria,data,engine,generator,types}.ts`,
`src/components/dashboard/FootballMatrixGame.tsx`,
`src/components/dashboard/useMatrixRound.ts`,
`src/app/games/matrix/actions.ts`.

Live checks: selected Messi in a draft, submitted a partial board, opened its
criteria review, and reloaded. The submitted result and selected player survived;
the observed board had 0 correct, 1 incorrect and 8 blanks.

## The Journeyman

- Ten answered questions per round. The first and last club are visible;
  interior career stops are hidden. Each question allows two guesses.
- Names and aliases are normalized for accents, case and punctuation. Search
  uses a wider player directory, and a typed name can also be submitted.
- A correct answer earns up to 10 points plus 80 XP. A second incorrect guess
  ends that question with zero points and reveals the full answer.
- Reveal Next exposes the earliest hidden club; Reveal Random chooses an
  unrevealed interior stop. Prices depend on the fraction of the trail revealed
  and reveal history, use half-point steps, and leave at least 2 potential points.
  Random is no more expensive than Next from the same state. The last hidden
  stop becomes a single Final Club action.
- With H initially hidden stops, f = paid reveals / H and s = sequential reveals
  / H, the cumulative target is `10 - 8*f - 4*s*(1-f)`. Follow the engine's
  cumulative rounding and minimum deduction rather than rounding each term.
- There are at most `min(9, H)` paid reveals. Full answer disclosure after a
  resolved guess does not count as paid reveals.
- Three skips replace the current player without advancing the question or
  recording a loss. Skipping is disabled after any paid reveal. A wrong guess
  alone does not disable it. Replacement excludes the deck and discarded players
  and prefers the same trail-length difficulty band.
- New decks balance short, medium and long trails. Signed-in users resume cloud
  state; the current guest component keeps the active journey in memory.

Data: `transfer-players.json` contains 300 players, of whom 269 meet the current
question eligibility filter. `journeyman-search-players.json` contains 712 search
identities. Reuse `journeyman-profiles.json` and club assets too.

Source: `src/lib/journeyman.ts`,
`src/components/dashboard/JourneymanGame.tsx`,
`scripts/journeyman/SCORING.md`.

Live checks: paid random reveal reduced potential, disabled Skip, and preserved
two guesses; two incorrect submissions revealed the player and full trail.

## Scoreline Hero

- Ten distinct matches: five club and five international, with two classics and
  eight modern games. The generator includes domestic and continental club
  football, World Cup, Euro and Copa America and prefers unseen fixtures.
- Predict the displayed home/away score including extra time and excluding
  penalty shoot-outs. Scores range from 0 to 99; there is one prediction per match.
- Only an exact prediction scores: 10 minus independently unlocked hint costs
  of 1, 2 and 4. All three hints leave 3 points. A wrong guess scores zero.
- Three skips consume match slots, award zero and advance immediately.
- A completed round displays all ten answers and source references and awards
  its total score as XP once. Only ten correct predictions counts as a won round.
- `/api/scoreline` grades moves and returns public views plus resumable signed
  progress. Guests store the token and recent matches locally; tokens expire
  after seven days. Signed-in progress and rewards are committed on the server.

Source: `src/lib/scoreline/{engine,session,types}.ts`,
`src/app/api/scoreline/route.ts`, `src/app/games/scoreline/page.tsx`.

Live checks: hints 1 and 2 reduced potential to 7, submission revealed the answer,
Next Match advanced to question 2, and reload restored question 2.

### Existing Flutter differences

Both versions have 200 match records, but their schemas differ and **zero match
IDs overlap**. The web dataset is not a drop-in replacement for
`assets/data/scoreline_matches.json`; use a conversion layer and versioned saves.
Flutter currently shuffles its catalogue without the web generator's category
balance, reveals a skipped round before advancing, and retains its session only
in memory. Its scorer-trivia UI is absent from the current web game. Preserve
the 10-point maximum rather than inventing scorer bonus rewards during migration.

## Scout's Duel

- AI, random matchmaking and six-character friend rooms share the server engine.
  Each duel uses the same ordered board of 24 players: 2 goalkeepers, 7 defenders,
  7 midfielders and 8 forwards, drawn from a normalized 150-player roster.
- Choose a secret within 30 seconds; the server chooses one if time expires.
  Questions are Yes/No and consume a turn. Normal turns are 45 seconds; private
  rooms can use 60 seconds. Timeouts consume the turn.
- Manual elimination is reversible and costs no turn. Auto-assist optionally
  follows verified answers. Missing factual fields remove the relevant question
  for the whole board rather than treating unknown as No.
- A correct shot wins. A miss removes that suspect, passes the turn, and blocks
  shooting on the next own turn. Shots are unlimited; there is no turn cap or
  forced final shootout. Wins award 200 XP; losses/draws award zero.
- Multiplayer has heartbeat/reconnection handling and a forfeit window. The
  server owns secrets, answers, timing and rewards; clients receive filtered views.
- The bot uses information-splitting logic at Rookie, Tactician and World Class
  difficulties. Gemini is optional for translating custom question wording in
  AI mode, not for deciding Yes/No facts or operating the bot.

Source: `src/lib/scouts-duel/`, `src/components/scouts-duel/`,
`src/app/api/games/scouts-duel/`, `scripts/scouts-duel/README.md`.

Live checks: started one fresh guest Rookie AI duel, selected and locked a secret,
reached the active 24-player board, asked a preset question and saw the response.
The test room was then resigned successfully. Online/friend matchmaking, custom
Gemini questions, reconnects and victory rewards were inspected in source only.

## Reuse and Flutter implementation order

1. **Higher or Lower first.** Its comparison/rotation engine is small and the
   existing snapshot and portraits can supply a full guest-playable mode. Port
   rules as pure Dart, then add a Riverpod controller, mobile cards and persistence.
2. **Journeyman.** Reuse career/search data, club crests and profiles. Port the
   exact reveal pricing, two guesses and skip replacement rules before the UI.
3. **Matrix.** Port criteria evaluation, unique-player drafts, solvable-board
   generation and difficulty saves. The guest Next.js server action is not a
   stable REST endpoint: either port the generator or expose a JSON endpoint.
4. **Align Scoreline.** Decide whether web gameplay/data parity is intended, then
   adapt its dataset and balanced selection and add durable progress. Preserve
   existing app visuals unless a redesign is requested.
5. **Scout's Duel.** Build on shared account/API support and use the authoritative
   server, with native cookie persistence, polling/realtime and lifecycle recovery.
   Do not port private server secrets or service-role credentials into Dart.

Existing HTTP contracts are reusable candidates:

| Contract | Purpose |
| --- | --- |
| `GET /api/higher-lower/snapshot` | Validated player snapshot |
| `POST /api/game-progress` | Signed-in Matrix, Journeyman and Higher or Lower progress, revisions and rewards |
| `POST /api/scoreline` | Start/resume, hint, submit, skip and next |
| `/api/games/scouts-duel` and `/rooms/{id}` | Capabilities, room creation/join, heartbeat/view and actions |
| `POST /api/games/scouts-duel/evaluate-question` | Resolve supported custom question wording |

The server's `requestUser(request)` already supports a Supabase bearer token,
which fits native Flutter authentication. Cloud actions use run IDs, revisions
and UUID request IDs for conflict/retry handling. Scout room ownership also needs
its `scouts_duel_session` cookie, even with account authentication. Actual native
API integration remains to be tested. Use the canonical
`https://www.footygen.online` base URL to avoid host/cookie redirects.

Flutter's browser development target additionally needs a same-origin proxy or
explicit, narrow CORS/origin support; existing production routes reject foreign
browser origins. Guest rules/data can be developed locally independently of that.
The app's auth/profile screens are currently placeholders, so signed-in sync
requires those foundations first.

For parity checks, translate the relevant web engine cases into Dart tests:
ties/rotation/null statistics, Matrix uniqueness/submit/solvability, Journeyman
half-point pricing/skips, Scoreline balance/scoring, and Scout server transitions.
Reuse the web JSON and asset provenance rather than rebuilding the datasets or
scrapers. Convert web `/img/...` references into Flutter asset paths. Keep one
versioned representation for local progress and accept server reward totals for
signed-in play instead of separately awarding XP again in the app.
