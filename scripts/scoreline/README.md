# Scoreline Hero

`src/data/scoreline-matches.json` is the server-side match database. It contains 200 curated men's senior fixtures: 100 club and 100 international, with 40 played before 2000 and 160 from 2000 onward. Only official competitions are included. The nine competitions are the European Cup/Champions League, Premier League, La Liga, Bundesliga, FA Cup, UEFA Cup/Europa League, World Cup, European Championship and Copa América.

The score to predict includes extra time and excludes penalty shoot-outs. Home/away means the order displayed on the board, including neutral-venue finals. Historical West Germany and Yugoslavia use period-appropriate display names.

## Data provenance

Each match stores source links for review. International scores and scoring events were selected from [martj42/international_results](https://github.com/martj42/international_results). Modern club results, venues and scoring events were checked against ESPN match records and its public scoreboard data. Older European finals and five early-2000s fixtures use UEFA, Manchester United and Liverpool records. The three curation files preserve the selected fixtures and original short fact clues. Hints are written separately from result explanations.

Notable references:

- [UEFA historical seasons](https://www.uefa.com/uefachampionsleague/history/)
- [UEFA 1960 final archive](https://www.uefa.com/uefachampionsleague/match/61542/)
- [UEFA 2000 final report](https://www.uefa.com/uefachampionsleague/news/0250-0c50f0fdc7d5-05a4f8a460bd-1000--1999-2000-madrid-on-top-of-spain-and-europe/)
- [UEFA 2001 final archive](https://www.uefa.com/uefachampionsleague/match/67752--bayern-vs-valencia/)
- [UEFA Liverpool–Alavés archive](https://www.uefa.com/uefaeuropaleague/match/67741/)
- [Liverpool's 2001 FA Cup account](https://www.liverpoolfc.com/news/first-team/185092-on-this-day-owen-wins-the-fa-cup)

Team artwork is stored locally under `public/img/scoreline`. Club crests were normalized from existing project assets and ESPN's team logo CDN. National flags came from FlagCDN; the Yugoslav flag is a local SVG. The eight new competition banners are independently generated illustrations, alongside the existing Champions League banner. Shared display frames preserve emblem proportions.

## Rules

- Ten unique matches per round: five club, five international; two classics, eight modern fixtures. Every round includes domestic club football, continental club football, World Cup, Euro and Copa América matches. Selection favors unseen fixtures and varied decades.
- One prediction per match. Only an exact result scores points.
- A correct prediction starts at 10 points. Hint 1 costs 1, hint 2 costs 2, hint 3 costs 4. Costs add together; all hints leave 3 points. Hints may be unlocked independently and are only charged once.
- Three skips per round; each skipped match consumes a slot and scores zero.
- The final review includes all ten results and source links. A completed round awards its point total as XP once in the browser profile. Only a perfect ten counts as a won round in the existing profile statistics.

## Implementation

The database is imported by the server engine, never the client component. `/api/scoreline` returns only the current public match and explicitly unlocked hints. It grades predictions, signs resumable progress and returns resolved scores after submission. Signed tokens carry match IDs and progress, not future answers. Browser storage remembers the active round and recent fixtures. Saved rounds expire after seven days.

Set `SCORELINE_SESSION_SECRET` to a stable server-only secret in production so saved rounds remain valid across server instances and deployments. Local development can use the generated `.env.local` value. If unset, an ephemeral development key is used. This is a casual trivia game; signed progress is not a transactional anti-cheat ledger and does not prevent replaying previously issued tokens.

## Verification and maintenance

Run `npm run test:scoreline` and `npx tsc --noEmit`. The tests check all 200 records, asset availability, hint constraints, 500 sampled round distributions, skip limits, scoring, completion, public response boundaries, and token integrity.

For source refreshes, run `python scripts/scoreline/fetch-source-data.py`, then `python scripts/scoreline/build-dataset.py`. Raw source files are cached in the ignored `tmp/scoreline` directory. The build fails if a selected scorer tally disagrees with its match score. Re-check the curation facts and historical display names when editing selections. Commit the resulting JSON and local assets, not raw download caches.
