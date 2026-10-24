# FootyGen — verified 300-player Journeyman dataset

Copy everything below into Gemini together with the project files it requests.

---

You are the football data researcher and data engineer for FootyGen. Build a production candidate dataset containing the complete chronological senior club careers of exactly 300 famous real footballers, active and retired, across football history. Accuracy, identity resolution, complete trails, and auditable evidence take priority over filling a quota quickly.

Do actual research. Do not generate plausible careers from memory. Do not state “100% verified”, “all checks passed”, or “runtime ready” unless the attached evidence and executed validators support those specific claims. No model can establish infallibility by assertion. Treat an unresolved fact as a blocker, not permission to guess. If fewer than 300 records can be verified, deliver that honest count and a blocker list; do not invent records to reach 300.

## 1. Read the actual project first

Inspect these files before proposing schema changes:

- `src/data/transfer-players.json` — current career question pool, 20 records when this prompt was written.
- `src/lib/journeyman.ts` — current types, matching, scoring and state transitions.
- `src/components/dashboard/JourneymanGame.tsx` — timeline, search, club image lookup and question selection.
- `src/components/dashboard/JourneymanWidgets.tsx`.
- `src/app/games/journeyman/journeyman.css`.
- `src/data/journeyman-search-players.json` — broader autocomplete directory, currently 529 identities.
- `scripts/journeyman/build-search-directory.cjs`.
- `scripts/journeyman/journeyman.test.cjs`.
- `scripts/higher-lower/roster.json`, `src/data/higher-lower-snapshot.json`, and `src/data/matrix-players.json` — identity/source references, NOT trusted chronological career records.
- `public/img/journeyman/clubs/`, `public/img/journeyman/ASSETS.md`, and existing badge source manifests.

If you cannot access a file, request it or explicitly identify what is missing. If browsing, downloads, or code execution are unavailable, disclose that and do not claim to have used them. Do not treat the previous Gemini report, the existing mock datasets, an API's successful HTTP response, or another model's output as independent verification.

This is a dataset task. Preserve the existing UI, responsive behavior, automatic scrolling, card sizing, navigation, and gameplay. Do not overwrite the live question pool or change the game engine during research. Stage the proposed replacement for review and describe any required integration adjustments.

## 2. Scope and player selection

- Exactly 300 distinct, real, famous men's senior association-football identities, matching this project's existing scope.
- Include active stars and retired/historical legends, multiple eras and continents, and all positions. Avoid making the roster predominantly current forwards from European leagues.
- Preserve the existing 20 player identities where possible, but audit and correct their careers. Do not preserve incorrect facts for compatibility.
- Include important one-club and two-club legends in the complete 300-player collection. Never invent extra clubs, split uninterrupted tenures, include youth teams, or manufacture loans to make a short career more interesting.
- Explain the selection method and list all 300 selected identities before final export. “Most famous” is editorial selection, not a measurable claim that your ranking is objectively definitive.
- Reuse stable player IDs and verified provider IDs already in this project when they identify the SAME person. A matching surname, nickname, display name, image filename, or legacy short ID alone is not sufficient identity proof.
- In particular, separate Cristiano Ronaldo from Ronaldo Nazário; Alexis Sánchez from Davinson Sánchez; and other namesakes. Validate full name plus birth date and provider identity when available.

## 3. Snapshot and time rules

Set one actual research cutoff, `snapshotAsOf`, in ISO 8601 UTC, and a separate `generatedAt` timestamp. Research as of that cutoff; it must not be in the future relative to your actual execution time.

- An announced future transfer is not an appearance and must not create a trail entry.
- Distinguish last club actually represented from a club the player has signed for but has not yet played for.
- Retired and deceased players retain the final real club in their trail. Never substitute “Retired”, a retirement badge, a national team, or an honorary club as the final stop.
- Use `active`, `retired`, `deceased`, or `unknown` status only when supported. Do not infer retirement from being out of contract.
- Record the observation date and publication/effective date where relevant. Reject future-dated evidence that is inconsistent with the cutoff.

## 4. Exact definition of a qualifying career trail

The timeline describes clubs for which the player actually made at least one official senior first-team competitive appearance, in chronological playing order. It is NOT a direct copy of transfer registrations, a deduplicated club membership list, or a youth-to-senior biography.

Include:

1. Every qualifying permanent senior first-team playing stint.
2. Every loan with at least one qualifying appearance, even if brief or in a lower division.
3. A later return to a former club as a separate step when the player actually appeared for that club again after appearing elsewhere.
4. Lower-division, non-European, early-career and late-career clubs under the same rules as major clubs.

Exclude:

- Academies, youth teams, U21/U23-only participation and reserve/B-team-only appearances. A B team in a senior league does not automatically qualify as that club's first team.
- Registration-only returns to a parent club with no subsequent competitive first-team appearance.
- Trials, training stints, testimonials, charity matches, exhibition guest appearances, friendlies-only affiliations, legends teams, management/coaching appointments, national teams, futsal, beach soccer and indoor soccer.
- Transfers announced but not yet followed by a qualifying appearance at the cutoff.

Loan/return examples below describe abstract rules, not claims about named players:

- A plays → B loan plays → A returns and plays → C plays = `[A, B, A, C]`.
- A plays → B loan plays → administrative return to A with no appearance → C plays = `[A, B, C]`.
- Loan at B becomes permanent without an intervening playing stint elsewhere = ONE continuous B entry.
- A transfer fee update, contract renewal, registration correction, or loan extension is not a new playing stint.

Do not globally deduplicate club IDs. Repeated non-adjacent clubs are meaningful. Merge adjacent entries representing an uninterrupted stint. Resolve actual appearance dates and chronology when registration dates overlap. For obscure historical guest/wartime affiliations, document whether the official first-team competitive rule is met; do not silently mix conventions.

Review apparent youth-only and administrative-return entries in the current seed data, including the Kroos and Sancho records. Existing entries are audit candidates, not evidence.

## 5. Research and evidence requirements

For each player, cross-check at least two genuinely independent reputable sources, using an official club, league, federation, competition archive, or authoritative historical record whenever available. A Transfermarkt scraper and Transfermarkt itself count as ONE underlying source.

Useful sources include official player biographies, official loan/transfer announcements, senior appearance logs, federation/league records, competition archives, and reputable historical statistical archives. Transfermarkt, its API wrappers and equivalent providers can be discovery tools and supporting sources; do not assume their transfer lists prove actual senior appearances.

- Read full supporting pages/records. Search snippets, generated summaries, guesses and uncited recollection are not evidence.
- Support EVERY included stint's club identity, chronological position and qualifying appearance. A transfer announcement alone is insufficient proof of an appearance.
- Verify completeness against full-career records, not only the visible big clubs or the last five transfers.
- Capture evidence for exclusions that could otherwise look like missing clubs, especially youth stops, unused loans and administrative returns.
- Retain conflicts and their resolution. Use a third independent source when the first two disagree materially.
- Do not equate `null` with zero. If the exact appearance total is unknown but a qualifying appearance is independently proven, use `seniorCompetitiveAppearances: null`, `hasVerifiedAppearance: true`, and cite the appearance evidence.
- Never fabricate exact dates from year-only sources. Preserve date precision (`day`, `month`, `year`, or `unknown`) and raw source text. Do not insert January 1 or June 30 as guessed boundaries.
- Preserve URLs, titles, access dates, publisher, the specific fact each source supports, and short evidence notes. Do not manufacture links or claim pages were accessed when they were not.

## 6. Data files and exact schemas

Create `src/data/journeyman-careers.json` as the reviewed-candidate canonical collection:

```typescript
interface JourneymanDataset {
  schemaVersion: 1;
  version: string;                  // content-derived version/hash
  snapshotAsOf: string;             // ISO UTC research cutoff
  generatedAt: string;
  scope: string;                    // explicit qualifying appearance policy
  players: CareerPlayer[];          // exactly 300 after verification
}
interface CareerPlayer {
  id: string;                       // stable identity, never array index
  name: string;                     // recognizable, correctly accented display name
  fullName: string | null;
  aliases: string[];                // verified names, nicknames and spellings
  dateOfBirth: string | null;       // YYYY-MM-DD only if verified
  nationality: string[];
  status: 'active' | 'retired' | 'deceased' | 'unknown';
  providerIds: Record<string, string>;
  verifiedAt: string;
  sourceIds: string[];
  careerComplete: boolean; // Informational only; false must not exclude active/ongoing careers from gameplay.
  puzzleEligible: boolean;
  ineligibleReason: string | null;
  ambiguityGroup: string | null;
  clubs: CareerStint[];             // chronological PLAYING stints
}
interface CareerStint {
  order: number;                    // contiguous, 1-based
  clubId: string;                   // stable key in club catalog
  label: string;
  logo: string;                     // e.g. img/journeyman/clubs/<clubId>.webp
  from: string | null;
  to: string | null;
  fromPrecision: 'day' | 'month' | 'year' | 'unknown';
  toPrecision: 'day' | 'month' | 'year' | 'unknown';
  rawDateText: string | null;
  stintType: 'permanent' | 'loan' | 'unknown';
  seniorCompetitiveAppearances: number | null;
  hasVerifiedAppearance: boolean;
  sourceIds: string[];
}
```

Use partial dates only at the declared precision, e.g. `2008` with `year` or `2008-07` with `month`. An unknown end date can be `null` for a qualifying ongoing stint. For a player who has left their last represented club, do not falsely mark that stint ongoing.

Also create:

1. `src/data/journeyman-clubs.json`: stable club ID → canonical name, display name, country, provider IDs, local badge path and badge provenance. Unrelated clubs with similar names must remain separate.
2. `tmp/journeyman/transfer-players.candidate.json`: an ARRAY of exactly 300 records compatible with the existing renderer: `{ id, name, aliases, clubs: [{ label, logo }], puzzleEligible }`. Preserve chronology and repeated club steps exactly. Rich research data stays in the canonical file/evidence, not in the client export.
3. `tmp/journeyman/career-evidence.json`: player/stint-level provenance, excluded affiliations, discrepancies and conflict resolutions, joined through stable source IDs.
4. `tmp/journeyman/validation-report.json`: actual validation results and blocking issues.
5. `scripts/journeyman/build-dataset.py` (or a documented project-compatible equivalent): reproducible enrichment/normalization/export pipeline.
6. `scripts/journeyman/validate-dataset.py` (or equivalent): executable release gates.
7. `scripts/journeyman/DATASET_REVIEW.md`: human-readable audit, selection rationale, corrections, short-career cases, ambiguity groups and integration notes.

Do not overwrite `src/data/transfer-players.json` until the candidate is reviewed and connected separately. Do not edit unrelated Matrix/Higher-or-Lower facts to make this task easier.

## 7. Short careers and ambiguous puzzles

All 300 complete careers belong in the collection and search, regardless of puzzle eligibility.

The current game reveals the first and last clubs from the start. Therefore careers with fewer than three qualifying stints have no hidden intermediate club. Mark them `puzzleEligible: false` with reason `fewer-than-three-stints` for the current game, rather than inventing affiliations. Report their actual count separately from the 300 total.

Calculate a full-trail fingerprint using ordered club IDs, including repeated steps. Dates do not disambiguate puzzles because dates are not currently shown on the cards. If multiple people share the entire visible trail, report all identities in an ambiguity group. Mark those questions ineligible until integration can accept every valid identity or supply an additional visible clue. Do not make a legitimate player “wrong” solely because the target happened to be a namesake or another player with the same trail.

Supply explicit integration notes that the question deck must filter on eligibility, while autocomplete must NOT filter on it. The legacy array currently has 20 entries and the existing test asserts that count; this is a seed-data check, not a rule that the expanded game must remain at 20. Do not claim the candidate is already connected or that 300 records means 300 unambiguous playable questions.

## 8. Search and answer identity rules

The user must be able to type and submit ANY remembered player name without selecting a suggestion. Missing autocomplete membership is not an invalid submission, and the suggestions must not disclose whether a player is in the question pool.

- Preserve the broader existing search directory and include all 300 canonical identities, even short-career legends and puzzle-ineligible players. Do not reduce autocomplete to the 300 questions.
- Keep the typed-name fallback in the current UI. An entirely unlisted name can still be submitted and evaluated against the target's valid names.
- Include verified full names, common football names, accented/unaccented variants and well-known established nicknames. Do not invent aliases or treat a common first name/surname as a globally unique identity.
- Preserve separate IDs for namesakes. Do not merge unrelated players because a legacy ID, shirt number, surname or image filename matches.
- The current matcher uses Unicode NFKD, removes combining marks, lowercases, and ignores non-letter/non-number characters while preserving non-Latin letters. Ensure aliases remain compatible with that normalization.
- Correctness depends on matching a valid target identity/alias, not search-directory membership. Do not mark an unrelated player correct simply because they exist in the directory.
- Document normalized alias collisions. Ambiguous suggestions should offer distinguishable full identities; do not silently resolve “Ronaldo” to the wrong player.
- Update the search-directory build inputs/proposed output so the new verified identities can be merged after review, retaining current identities and their aliases.

## 9. Club crest assets: mandatory production requirements

Use real, independently sourced club crests. Do not generate approximate emblems, extract them from screenshots, reuse an unrelated club's badge, or silently replace missing crests with generic shields.

- Reuse an existing local badge only after verifying it represents the correct club identity.
- Use an official club/league/federation asset when available, or a documented reliable badge provider. Resolve the real provider club ID; do not guess URLs from a name.
- Distinguish clubs with similar names, B teams, re-founded clubs, and historical name changes. Record the canonical identity behind the display label.
- Use one recognizable verified badge per club consistently across a career, unless historical versioning is explicitly supported. For defunct clubs, use a documented authentic emblem.
- Final path: `public/img/journeyman/clubs/<clubId>.webp`, using stable safe filenames. Runtime `logo` paths have no leading slash because the UI normalizes them into this directory.
- Decode actual image bytes and verify format. Normalize transparency, trim transparent padding, fit the visible artwork inside a 164 × 164 box without distortion, then center it on a TRANSPARENT 180 × 180 canvas. All final canvases must be identical in dimensions.
- Preserve aspect ratio and alpha; do not stretch narrow/tall crests or add a white matte. Match the existing `object-fit: contain` rendering. Use WebP quality about 88–92 or lossless where needed for crisp lettering. Never compress to illegibility just to meet a byte quota.
- Prefer source artwork at least 180 pixels tall/wide or an authentic vector source. Do not upscale a tiny icon and call it high quality. Report a source-quality blocker instead.
- Record club ID, original source URL, publisher, access date, original/final dimensions and formats, final byte size, SHA-256, and any usage/license information actually supplied by the source in `public/img/journeyman/asset-sources.json`.
- Detect 404s, HTML error pages masquerading as images, corrupt files, duplicate placeholder hashes, white backgrounds and wrong-club images. Actual visual review is required; an alpha channel alone is not proof of a good cutout or correct identity.
- Player portraits are not required for this timeline UI. Do not add recognizable player headshots to an unrevealed question, which would expose the answer. Existing search/avatar assets can remain untouched.

## 10. Executable validation and release gates

Run real scripts and attach machine-readable results. At minimum validate:

1. Exactly 300 unique canonical player IDs, with independently resolved identities; no invented or duplicate people.
2. Every player has a complete senior first-team competitive trail at the cutoff or is explicitly blocked. Every included stint has qualifying appearance evidence.
3. Full chronology, contiguous order values, valid club references, correctly repeated returns, no consecutive duplicate continuous stints, and no youth-only or zero-appearance registration steps.
4. No unsupported future transfers, guessed dates, negative counts, broken references, or `null` values converted into facts.
5. Every source ID resolves to real supporting evidence; at least two independent career sources per player; conflicts and exclusions are recorded.
6. All aliases normalize consistently; normalized collisions and identical-trail ambiguity groups are reported.
7. Every referenced crest exists, decodes, has the expected 180 × 180 canvas and transparency, matches its recorded hash, and has been checked against the actual club.
8. Candidate runtime export preserves the canonical club order and repetitions exactly and matches the current `JourneyPlayer` shape.
9. Search retains the wider directory, finds `Pele`/`Pelé` independently of question eligibility, distinguishes Ronaldo identities, and still permits an unlisted typed name.
10. Ten-question rounds can select ten distinct eligible identities. Report the eligible count and verify that short/ambiguous careers are excluded without disappearing from search.
11. Test source cases across one-club careers, two-club careers, unused loans, played loans, actual returns, administrative returns, loan-to-permanent conversions, early small clubs, non-European moves, retired/deceased players and namesakes.
12. Run the project's relevant existing checks. Report the exact commands, executed output summaries and exit codes. Do not modify existing data-dependent tests to hide a regression or pretend candidate integration already occurred.

Report totals: verified complete players, blocked players, playable questions, short careers, ambiguous trails, total qualifying stints, distinct clubs, loan stints, repeated returns, corrected seed records, search identities, downloaded/reused/missing badges, and oldest/newest verification dates.

## 11. Final handoff

Deliver the actual files, not only a success report or snippets with ellipses. Include the 300-name roster, every complete record, evidence, image files/manifests, scripts, validation report and review notes. Use staged batches if necessary; finish with one merged validated export. Keep stable identities and references consistent across batches.

State the actual completion status: VERIFIED_CANDIDATE only if all required evidence/data/asset gates passed; otherwise PARTIAL/BLOCKED with specific remaining issues. Clearly separate the 300 complete career records from the subset suitable for the current puzzle rules. Do not claim the live game has been updated unless integration was separately authorized and actually verified.
