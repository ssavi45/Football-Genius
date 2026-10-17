You are building the verified production dataset for Football Genius's Football Matrix game. Act as a football data researcher and data engineer. Produce auditable data and executable validation, not a memory-based list of plausible statistics.

1. OBJECTIVE AND INPUTS

The existing Next.js game already works. Your task is dataset enrichment and expansion, not a redesign or a change to gameplay.

Start from the supplied project files:
- src/data/matrix-players.json
- src/lib/matrix/criteria.ts
- src/lib/matrix/types.ts
- src/lib/matrix/engine.ts
- src/lib/matrix/generator.ts
- src/lib/matrix/data.ts
- public/img/higher-lower/asset-sources.json
- public/img/higher-lower/club-badges.json
- scripts/matrix/build-dataset.py
- scripts/matrix/README.md

Preserve the existing 500 player identities and their stable IDs. Audit the existing facts rather than assuming every imported fact is correct. Correct errors with an evidence-backed change log. Include active and retired male senior players, across positions and eras.

Do not cap the resulting roster at 500. Add verified players where they improve useful club/nation and milestone intersections. Expand based on evidence and coverage, not an arbitrary total or a requirement to make every intersection nonempty. Report the actual final roster size.

Use web research and code execution/file tools if available. Research full primary-source records; search-result snippets and model recollection are not sufficient evidence. If your environment cannot browse, fetch files, or run validation, state that limitation. Do not claim that an unexecuted script ran, an image was downloaded, or a dataset was verified.

2. GAME RULES THE DATA MUST SUPPORT

Football Matrix is an unlimited-round 3x3 puzzle, not a daily grid.
- Easy: three club rows and three nation columns.
- Medium: three club rows and three stat/trophy columns.
- Hard: three stat/trophy rows and three other stat/trophy columns.
- All six criterion IDs in one board must be distinct.
- Avoid redundant thresholds on the same statistic within one axis.
- A valid board requires at least one eligible player in every cell AND a complete assignment of nine DISTINCT player identities to the nine cells.
- The player can draft/edit answers, leave blanks, and submit the entire board once. Results and XP are revealed only after submission.
- A player can occupy only one cell per round.

Difficulty overlap targets:
- Easy: preferably at least 10 valid players per cell.
- Medium: preferably 3-8 per cell.
- Hard: preferably 1-3 per cell.

These overlap ranges are board-selection targets, not permission to fabricate or suppress facts. Some real intersections are empty; some are much larger than the target. Report them truthfully. Do not remove valid players or change eligibility rules to force target counts. The generator must skip impossible boards.

3. FIXED IDENTIFIERS: 15 CLUB CRITERIA

Use these exact Transfermarkt club IDs as strings:
418 = Real Madrid
131 = Barcelona
27 = Bayern Munich
31 = Liverpool
11 = Arsenal
631 = Chelsea
506 = Juventus
281 = Manchester City
16 = Borussia Dortmund
46 = Inter Milan
583 = Paris Saint-Germain
5 = AC Milan
13 = Atletico Madrid
148 = Tottenham Hotspur
610 = Ajax

Do not replace these identifiers with names, UEFA IDs, FIFA IDs, EA IDs, or invented slugs.

The clubs[] field must contain ALL verified senior clubs in a player's career, not only these 15. The teams dictionary must contain every referenced team.

4. FIXED IDENTIFIERS: 15 NATION CRITERIA

Use these exact senior national-team IDs as strings:
3439 = Brazil
3437 = Argentina
3377 = France
3262 = Germany
3375 = Spain
3376 = Italy
3299 = England
3300 = Portugal
3379 = Netherlands
3449 = Uruguay
3382 = Belgium
3556 = Croatia
3575 = Morocco
3499 = Senegal
3444 = Nigeria

The nations[] field must contain ALL senior full-A national teams actually represented, including other countries and historical teams where applicable. Preserve their real provider IDs. Do not silently merge historical countries into successor states.

Nationality/citizenship, birthplace, ancestry, eligibility and youth-team representation do not establish a senior national-team appearance.

A player who actually represented two senior national teams can qualify for both. The display nationality and flag do not replace this eligibility record.

5. ALL 16 SUPPORTED STAT/TROPHY CRITERIA

Implement the data needed by these exact definitions:

Criterion ID | Runtime test
career-goals-400 | stats.goals >= 400
ucl-titles-3 | stats.uclTitles >= 3
world_cup | honours contains "world_cup"
ballon_dor | honours contains "ballon_dor"
season-goals-50 | stats.maxSeasonGoals >= 50
ucl-top-15 | 1 <= stats.uclAllTimeRank <= 15
national-captain | stats.seniorCaptainAppearances >= 1
league-titles-5 | stats.leagueTitles >= 5
top-five-clubs-3 | stats.topFiveLeagueClubs >= 3
career-assists-200 | stats.assists >= 200
ucl | honours contains "ucl"
copa-america | honours contains "copa_america"
career-goals-100 | stats.goals >= 100
senior-caps-100 | stats.caps >= 100
pl-goals-100 | stats.plGoals >= 100
ucl-goals-50 | stats.uclGoals >= 50

Do not change thresholds or rename runtime keys. Null or missing numerical values never qualify. Zero qualifies only where a criterion actually permits zero.

6. EXACT RUNTIME DATA SHAPE

Produce UTF-8 JSON with the existing top-level structure:

{
  "version": "matrix-<real-content-hash>",
  "updatedAt": "<actual ISO-8601 UTC timestamp>",
  "source": {
    "name": "<accurate description of sources actually used>",
    "adapter": "<actual adapter/version, only if used>",
    "url": "<actual source or adapter URL>"
  },
  "teams": {
    "<provider team ID as string>": {
      "name": "<verified display name>",
      "badge": "<verified existing image URL or verified local asset path, or null>",
      "national": false
    }
  },
  "players": [
    {
      "id": "<existing stable ID, or unique lowercase ASCII letters/underscores for a new player>",
      "name": "<preferred display name>",
      "sourceName": "<source's exact player name>",
      "nationality": "<display nationality>",
      "nationalityFlag": "<verified existing /img/country/...png path>",
      "club": "<verified current club name, Retired, or null>",
      "clubs": ["<senior club ID>"],
      "nations": ["<senior full-A team ID>"],
      "honours": ["<verified supported honour slug>"],
      "stats": {
        "goals": null,
        "assists": null,
        "caps": null,
        "uclGoals": null,
        "plGoals": null,
        "uclTitles": null,
        "maxSeasonGoals": null,
        "uclAllTimeRank": null,
        "seniorCaptainAppearances": null,
        "leagueTitles": null,
        "topFiveLeagueClubs": null
      },
      "sourceUrl": "<verified canonical player profile URL>"
    }
  ]
}

This is a schema template, not a populated example. Do not output it as completed work or retain placeholder text in the final dataset.

Additional research, event-level evidence, coverage flags, source timestamps, aliases and image metadata belong in sidecar files. Keep the gameplay export compact and compatible.

Each numeric field is a nonnegative integer or null; uclAllTimeRank is a positive integer or null. Never use strings such as "400+", "-", "unknown", "N/A", or "15th" for numerical fields.

Keep zero distinct from unknown. Arrays contain unique canonical IDs/slugs. Names can contain accents; preserve correct Unicode.

Maintain these existing player-to-portrait aliases:
van_dijk -> vandijk
silva -> bernardo
joao_neves -> joaoneves

Do not change an existing player's ID to match a portrait filename.

7. CLUB AND NATION ELIGIBILITY

A club qualifies only after at least one official competitive senior first-team appearance.
Include qualifying loans.
Exclude youth/academy/reserve/B-team-only records, registrations without an appearance, unused bench appearances, trials, testimonial games and club friendlies.
A transfer history alone does not prove club eligibility.
A club's first team remains eligible even if it played in a lower division; this is separate from the top-five-league-club milestone.
Only appearances completed at or before the snapshot cutoff count.

For national teams, require at least one recognized senior full-A international appearance.
Recognized senior international friendlies count.
Exclude youth, U21/U23, Olympic, B-team, testimonial and unofficial exhibition appearances.
Do not create a nation[] entry from a passport or an unused call-up.

Record source completeness separately. An unlisted team means "not verified in this dataset"; do not pretend an incomplete history proves the player never appeared there.

8. STATISTIC DEFINITIONS

Freeze one documented definition for each field. Do not silently mix provider scopes across players.

goals:
Official competitive senior first-team club goals PLUS recognized senior full-A international goals for every nation represented.
Include goals in extra time and ordinary in-match penalties.
Exclude penalty-shootout kicks, youth/reserve/Olympic goals, club friendlies, testimonials, unofficial exhibitions, own goals credited against the player, future fixtures, and duplicates.
Never substitute club-only goals for career goals.

assists:
Use the same career scope as goals: official senior club competition plus senior full-A internationals.
Choose and document one assist-crediting convention; do not mix standard assists with fantasy assists, penalties won, hockey assists, or unverified reconstructed historical totals.
A provider's missing assist field is not a verified zero.
If an exact career total cannot be substantiated, use null and explain coverage gaps.
Store a verified lower bound in the evidence sidecar if useful, but do not silently publish it as an exact career total.

caps:
Recognized senior full-A appearances summed across every represented senior national team, with a per-nation breakdown in evidence.
Exclude youth and Olympic appearances.

uclGoals:
For this export, use UEFA Champions League main-competition goals from the 1992/93 competition onward.
Exclude qualifying/play-off rounds outside the main competition, Europa League, Conference League, Super Cups and the pre-1992 European Cup.
Record the exact included source competition IDs and round filters. Do not assume a provider's "all-time" label uses this scope.

plGoals:
English Premier League league goals from its 1992/93 inception onward.
Exclude domestic cups, Europe, Championship and the pre-1992 English First Division.

uclTitles and honours.ucl:
Individually credited UEFA Champions League winner titles under the same post-1992 competition scope.
Count distinct winning editions, not duplicate source rows.
Do not confuse European Cup predecessor titles, other European competitions, finalist appearances or participation with this honour.
The player need not have played in the final if the applicable official eligibility/medal policy credits them.
Do not infer title credit merely because their club won while they were contracted there.

leagueTitles:
Individually credited senior domestic TOP-FLIGHT league championships across all countries, not just the five major European leagues.
Exclude lower divisions, youth/reserve leagues, domestic cups, league cups, super cups and continental titles.
Count each officially awarded top-flight championship edition once.
Where a league has split-season titles or championship playoffs, follow and document its official championship structure; do not count one championship's regular season and final stage twice.

maxSeasonGoals:
The maximum verified official senior CLUB goal total in one club's recognized season, summed across all competitive competitions for that club and season.
Do not combine multiple years, different season calendars, international goals or club friendlies.
Do not silently combine two clubs' seasons after a transfer.
Evidence must identify club, season label, season boundaries, competition breakdown and total.
A single high-scoring match or a calendar-year total is not sufficient.

uclAllTimeRank:
A GLOBAL rank using the same Champions League main-competition scope as uclGoals, frozen at the snapshot cutoff.
Never rank only the supplied roster.
Use a verified global scoring table that includes all players above and tied at the qualifying cutoff, including players absent from our roster.
Use competition ranking: rank = 1 + number of players globally with strictly more goals. Tied players share a rank; more than 15 identities may legitimately qualify.
Document the tie rule, table URL, snapshot date and competition scope.
Do not mix a European Cup-plus-Champions-League ranking with post-1992 goals.
If the required scoped ranking cannot be verified, use null and report why.
Players outside the verified table may have null rank; do not manufacture exact lower positions.

seniorCaptainAppearances:
The exact verified number of senior full-A national-team matches in which the player captained the team.
Exclude club captaincy, youth/Olympic captaincy, being a deputy captain without actually captaining a match, or reputation as a team leader.
Document in-match armband handovers only when reliable match evidence establishes captaincy.
If you can prove a captain appearance but cannot establish the exact career count, keep the runtime count null and provide the confirmed match evidence plus a verifiedMinimum in the sidecar. Do not disguise "at least one" as an exact total of one.
Clearly flag these cases for a possible evidence-based compatibility adapter during integration.

topFiveLeagueClubs:
Count distinct senior first-team clubs for which the player made an official competitive appearance during a season when that club competed in England, Spain, Germany, Italy or France's domestic top flight.
Count clubs, not countries. Three different qualifying clubs from the same country can qualify.
This is not limited to the 15 catalog clubs.
Loans count when an official senior appearance occurred.
Each club counts once, even across repeated spells.
A cup appearance can establish an appearance for a club that was in the relevant top flight that season; record that league-season evidence.
Do not infer eligibility from where the club plays today, its reputation, registration, a youth spell or a lower-division-only season.

9. TROPHIES AND HONOURS

Only publish these runtime honour slugs:
ucl
world_cup
ballon_dor
copa_america

world_cup means the senior men's FIFA World Cup, not youth, U17/U20, Club World Cup, Olympics or qualifying.
copa_america means the senior national-team Copa America.
ballon_dor means the senior men's Ballon d'Or, not a youth award, nomination, shortlist, Silver Ball or a different player award.

Use documented individual winner credit and the competition's actual squad/medal rules. A qualifying winning-squad member is not automatically excluded because they did not play in the final. A player on the runner-up team does not qualify.

For team trophies, store the winning edition/season and team in evidence.
For Ballon d'Or, store each winning award year.
Deduplicate by competition + edition/year + team where applicable.
Derive honours membership from evidence, not from a player's fame, nationality or association with a successful club.

10. SOURCES, IDENTITIES AND UNKNOWN VALUES

Preferred evidence:
- Official competition organizers and their records: UEFA, FIFA, domestic leagues and confederations.
- Official national federations and clubs for appearances, captaincy, honours and retirement.
- Transfermarkt or other documented statistical providers for identity resolution and structured records, with explicit scope and coverage checks.
- Secondary sources only as corroboration or clearly labelled fallback.

The project has used felipeall/transfermarkt-api. If you use it, inspect the actual available package and version rather than assuming endpoint names or current support. It is an unofficial adapter, not an official Transfermarkt public REST API. Do not invent responses, IDs or achievement fields.

Resolve each player by stable provider ID plus full name, birth date and career identity where possible. Do not join records on surname alone. Keep a cross-provider ID map.
Do not confuse EA portrait IDs with Transfermarkt player IDs.
Distinguish namesakes, including the modern Luis Suarez from the historical Inter player of the same name.

For every non-null milestone or honour, provide the exact supporting URL/record, fetchedAt, effective asOf date, scope and verification method.
Label an authoritative aggregated total as an aggregate; do not fabricate a per-match breakdown to make it appear reconstructed.
Where complete match-level data are available, deduplicate match IDs and reconcile component sums.
Where sources disagree, document the discrepancy, choose a consistent defensible source/scope or use null.
Never fill values by interpolation, LLM memory, a career reputation or an expected difficulty distribution.

Set SNAPSHOT_AS_OF to an explicit actual UTC research cutoff. Do not invent current statistics beyond what your sources establish or adopt an existing file's timestamp as proof of freshness.
Keep event date, source effective date and retrieval timestamp distinct.
Do not mark a player retired solely because they have no current club.
Use club = "Retired" only with verified retirement; an active unattached player's club can be null.

Respect source access restrictions. Cache records, throttle requests, handle pagination and bounded retries, and report blocks or unavailable pages rather than bypassing them.

11. TRANSPARENT PORTRAITS AND OTHER ASSETS

The current Matrix loader does not trust a player.photoUrl as an alternative to the asset manifest. It resolves portraits using:
public/img/higher-lower/asset-sources.json
public/img/higher-lower/players/<portrait-key>.png

Every player included in a runtime-ready export needs a matching verified manifest entry and real local file. Merely adding a remote image URL to a player record will not make a new player work.

Preserve all existing verified portrait keys and files. Supply a mergeable manifest delta for new players, not a replacement that deletes unrelated entries.

A portrait entry follows the existing format:
{
  "name": "<portrait key>",
  "id": "<actual numeric EA/FUT provider ID>",
  "url": "<verified exact HTTPS PNG asset URL>",
  "sourcePage": "<verified identity/profile page>",
  "identitySource": "<page proving the image's player identity>",
  "identitySourceName": "<verified full player name>",
  "width": "<actual integer pixel width>",
  "height": "<actual integer pixel height>",
  "alpha": true,
  "sha256": "<actual SHA-256 of the final PNG bytes>"
}

The quoted placeholders above describe types; output real numbers for id/width/height.

The current portrait downloader permits these exact asset hosts:
ratings-images-prod.pulse.ea.com
game-assets.fut.gg

Inspect the supplied manifest for existing verified assets. Discover new URLs through verified provider records; do not guess an asset URL from a Transfermarkt ID or fabricate a working URL pattern.
A historical season's portrait can be used for a retired player when identity and framing are verified.
If no suitable asset exists on an accepted host, list the unresolved portrait or an alternative source separately. Do not claim an incompatible host is already supported.

Requirements:
- Actual photographic transparent headshot, correct real person.
- Head/shoulders framing, full head/hair visible, no rectangular match-photo background.
- Prefer at least 256x256; the current importer requires at least 120x120. Preserve genuine available resolution; do not upscale a low-resolution image and call it high resolution.
- PNG with real transparency: decoded alpha must contain transparent pixels and meaningful opaque subject pixels. An alpha channel whose values are all 255 is not a transparent cutout.
- No AI-generated substitute likeness, wrong namesake, black rectangle, circular crop, silhouette, jersey-only image or generic placeholder.
- Identity verification plus visual review; automated alpha checks alone are insufficient.
- Verify PNG signature, dimensions, file size and actual byte hash.
- The existing downloader rejects assets above 2,000,000 bytes; report any transformation/source changes explicitly.
- If a portrait is transformed, distinguish original-source hash from final-file hash and supply a reproducible normalization step. The final manifest hash must match the bytes saved locally.
- Source and image usage terms/provenance must be recorded.

For club crests, reuse the existing club-badges manifest. For national flags, verify the existing /img/country/ files and exact names. Do not claim a local file exists unless it was checked or actually delivered. Additional historical team metadata must use correct identities.

Matrix criteria use text-only labels. Do not add criterion icons or generated artwork as part of this dataset task.

12. EVIDENCE AND COVERAGE SIDECARS

Provide machine-readable evidence keyed by stable player ID, with:
- Cross-provider identity mapping and birth date.
- Verified senior club appearance records: club ID, official competition/season, appearances, supporting source.
- Senior nation appearance breakdown.
- Honour editions/years and credited team.
- Per-stat values, scopes, source references, asOf/fetchedAt, status and method.
- Career club/international components when available.
- Per-season scoring evidence for maxSeasonGoals.
- Global ranking table/snapshot and tie rules.
- Captaincy match evidence and completeness status.
- Distinct qualifying top-five clubs and their league/season evidence.
- Missing/conflicting sources and documented limitations.

Use honest statuses such as verified, partial, unknown and conflicting.
Do not turn a partial verified lower bound into an exact numerical total.
Do not treat absent evidence as a known false fact without a complete supporting record.

Also export a pair-eligibility index containing exact candidate IDs and counts for:
- All 15 x 15 club/nation pairs.
- All 15 x 16 club/milestone pairs.
- Every pair of distinct milestones.
- Each criterion's standalone eligible population.

This index must be computed from the exported player data using the same predicates as the game, not manually estimated.

Report structurally impossible or unsupported pairs. Do not manufacture players to fill them.

13. VALIDATION AND QUALITY GATES

Deliver executable validation covering:
- Strict JSON parsing and schema/type validation.
- Unique stable player IDs and resolved provider identities.
- Preservation of existing identities, with explicit corrections/removals if necessary.
- clubs/nations ID existence and correct team national boolean.
- No duplicated IDs/slugs/appearance events/title editions.
- Numeric domains, actual null handling and verified zeros.
- Career club + international reconciliation when a complete comparable breakdown exists.
- Global rather than roster-local UCL ranking with consistent competition scope.
- Evidence-backed winners and milestone thresholds.
- Appropriate current-club/retirement labels.
- Every runtime player has a valid local, identity-reviewed transparent portrait and matching manifest hash.
- Every referenced local crest/flag file exists.
- All 16 criteria have coverage/unknown counts; no fabricated nonzero population.
- Individual cell candidate pools and nine-distinct-player matching.
- Correct Easy/Medium/Hard axis rules.
- No repeated combination counted as new merely because headers were reordered.

Exercise at least 1,000 round seeds per difficulty if feasible. Record actual tested counts, unique criterion combinations, minimum/median/maximum candidate counts, overlap-target hit rates and solver failures.
If fewer distinct valid combinations exist, report the actual number found. Distinguish exact enumeration counts from sampled counts or lower bounds.
Do not claim infinite unique grids from a finite catalog.
Never publish a board with an empty cell or no full nine-player matching.

An unavailable fact or portrait is a reported limitation, not something to hide by setting a value to zero or choosing an unrelated image.

14. DELIVERABLES

Return files, not only a prose claim that the work is complete:
1) matrix-players.json: compact gameplay export in the exact compatible structure.
2) matrix-evidence.json: field-level provenance and detailed evidence.
3) matrix-eligibility.json: computed candidate IDs/counts for the required pairs.
4) matrix-validation-report.json: real executed checks, roster size, criterion coverage, missing data, conflicts and tested-board results.
5) matrix-portrait-manifest-delta.json: mergeable new/changed portrait entries, preserving existing entries.
6) New verified portrait PNG files when your environment can fetch and deliver them.
7) Reproducible enrichment, asset-fetch and validation code with pinned dependencies and instructions.
8) matrix-change-log.md: additions, corrected facts, scope decisions, unresolved evidence/portraits and integration notes.

If unresolved facts or assets prevent a fully runtime-ready export, label the dataset CANDIDATE rather than falsely describing it as production-ready. Preserve the researched facts and list exact blockers.

Keep the Higher or Lower snapshot, player/profile tables, game mechanics, criterion thresholds and existing icon assets unchanged. Do not overwrite other game modes' datasets.
The existing build-dataset.py does not populate the six newly required milestone fields. Extend the Matrix enrichment/rebuild pipeline so a later rebuild preserves them from verified evidence, rather than supplying a one-off JSON file that the old script immediately strips.

Compute a real deterministic version hash from canonical gameplay content, excluding volatile retrieval timestamps from that hash. Include teams and eligibility-affecting fields. Do not invent a hash or timestamp.

Do not dump thousands of records into one chat response. Work in verified, resumable batches and produce downloadable files/artifacts when supported. If files cannot be produced, provide numbered validated chunks with a deterministic merge/validation script and state the limitation; do not use "...", ellipses or omitted-record placeholders in JSON.

Finish with a concise factual summary:
- Actual total players, retained/new/corrected.
- Per-criterion eligible counts and unknown counts.
- Number of verified portrait files and unresolved assets.
- Number of tested and distinct solvable boards per difficulty.
- Whether overlap targets were met, with actual measurements.
- Snapshot cutoff and oldest relevant verification dates.
- Exact remaining blockers.
- Whether the files are runtime-ready or only candidates.

Do not say "complete", "verified" or "ready" unless the delivered artifacts and executed checks support that statement.

