# Matrix enrichment integration audit

This supersedes the submitted Gemini report for `matrix-19dd9d9bbfe9`. The connected export is `matrix-1555fb79d3ae`, with 500 preserved player identities and 572 team metadata records. The actual source snapshot cutoff is **2026-10-16T15:26:04.386489Z**, not the end of that day.

## Corrections

1. Restored real PSG 2024/25 and 2025/26 Champions League credits. A registry ending in 2023/24 incorrectly deleted newer titles. Wrong-club/edition claims still fail verification.
2. Restored Spain's 2026 World Cup credits present in the captured winner records, using FIFA's edition results. A pre-2026 winner registry cannot validate an October 2026 snapshot.
3. Restored Dembele's 2025 Ballon d'Or. The provider stores season start 2024 with cyclical award year 2025; it is not a claim that he won in 2024.
4. Removed the arbitrary league-title cutoff before 2024 and deduplicated competition/club/season editions rather than calendar year alone.
5. Preserved five unknown season-goal maxima instead of manufacturing zeros. Filtered unplayed/future fixtures before discovering top-five club-seasons.
6. Replaced the separate Python criterion list and surrogate simulation with the actual 46-entry TypeScript catalog (15 clubs, 15 nations, 16 milestones), runtime generator and nine-distinct-player solver. The submitted validator omitted real game criteria and added two unused thresholds.
7. Decoded all 500 portraits to verify real transparent pixels, dimensions and manifest hashes. Checking a PNG alpha header alone cannot prove transparency.
8. Cached immutable generator intersections and candidate pools per dataset, retaining mandatory matching checks, history exclusions, seeded selection and a bounded round cache.

## Verified counts

All 16 milestone criteria are populated. Key corrected eligible counts: 63 World Cup winners, 11 Ballon d'Or winners, 25 players with at least three UCL titles, 109 with at least five league titles, 245 with at least three top-five-league clubs. Ten roster players are in the scoped global UCL top 15; ranks are not derived from the roster.

All 3,000 actual runtime simulations passed: 1,000 per difficulty, every cell nonempty, with a nine-distinct-player solution and no immediately repeated combination. Whole-board overlap hit rates were Easy 0%, Medium 5%, Hard 0%; the 500-player roster cannot consistently meet the preferred bands. This is reported explicitly rather than treating a per-cell percentage as board-level success. See `dataset-validation-summary.json` for measurements.

## Primary records

- PSG 2025: https://www.uefa.com/uefachampionsleague/news/0299-1de417608530-15b01ff7b150-1000--paris-win-champions-league-desire-doue-double-helps-secure/
- PSG 2026: https://www.uefa.com/uefachampionsleague/news/029c-1e9a2f63fe2d-ebf9ad643892-1000--champions-league-2025-26-all-the-results/
- FIFA 2026 standings: https://www.fifa.com/en/articles/final-tournament-standings
- Ballon d'Or laureates: https://www.uefa.com/ballondor/news/0292-1c27056169a7-bc88d1fdba43-1000--ballon-d-or-laureates-who-has-won-football-s-most-prestig/
- Global UCL scorer table, dated October 14, 2026: https://www.uefa.com/uefachampionsleague/news/0257-0e910cf2494a-5185150de9d4-1000--champions-league-all-time-top-scorers-cristiano-ronaldo-lionel-messi-robert-lewandowski/

## Limits

This validates the captured-record pipeline and game integration, not every historical football fact independently. Missing source match histories may undercount career statistics and honours. All gameplay portrait/criterion assets are local and verified; unused team metadata crest URLs are not a claim that every historical club crest was downloaded. Refresh the source evidence and reviewed registries before publishing later statistics.
