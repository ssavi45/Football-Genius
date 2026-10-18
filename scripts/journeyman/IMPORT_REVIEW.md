# Gameplay integration review — 18 October 2026

The 300 canonical identities are now projected into `src/data/transfer-players.json` by `npm run build:journeyman`. The source candidate is retained. The game receives only records whose derived `puzzleEligible` is true, while all identities remain searchable.

**269 question records are enabled; 31 short careers are withheld.** All 50 records previously blocked by appearance metadata or crest defects are enabled after targeted corrections. This does not certify the entire collection as 100% factually correct. The original supplied evidence used generic homepages; the nine corrected career records now have supporting page URLs in `career-corrections.json`. See `CORRECTIONS.md` for the changes.

The import gates require at least three stints, no identical full-trail ambiguity, valid qualifying-stint metadata, and authentic correctly identified crests with local 180px WebP files matching their recorded hashes. A documented unavailable historical crest uses text, never a fabricated or unrelated emblem. Active players and ongoing careers qualify: retirement and `careerComplete: true` are not required. The final pill reads CURRENT CLUB for active players and LAST CLUB otherwise. These filters cannot prove every remaining historical fact.

## Findings that contradict the original report

- The canonical file explicitly sets `careerComplete: false` for 93 records, including all listed active players. This flag is informational and no longer withholds questions; it does not establish that every flagged player is missing a club. Specific omissions found below remain research issues, separate from the player's active status.
- Morata's Galatasaray spell was not fictional: the [club's 6 February 2025 record](https://www.galatasaray.org/haber/futbol/turkiye-kupasi/alvaro-morata-burada-evimde-hissediyorum/57171) reports his first official goal.
- Félix's Milan spell was not fictional: [Milan's 10 February 2025 report](https://www.acmilan.com/en/news/articles/press-conference/2025-02-10/joao-felix-in-love-with-san-siro) confirms his debut and goal.
- The original catalog labeled 27 assets “Authentic Procedural Club Shield”. These generated substitutes have been replaced by sourced artwork, except Esteghlal Ardabil: no reliable crest was found and that club now displays its name as text. ROK Air Force uses its service's institutional emblem, identified as such in provenance.
- Nine original assets had identity collisions: Bastia/Real Sociedad, Chester City/Manchester City, Espanyol/Feyenoord, Almería/Palmeiras, Venezia/León, Cortuluá/Independiente Medellín, Cerezo Osaka/Queens Park, Dundee/Dundee United, and Cruz Azul/UNAM Pumas. All nine now have replacement crests. Historical rejection reasons remain in `import-review.json`; resolutions are tied to the new exact asset hashes, so an old incorrect asset cannot silently pass again.
- Ten supplied stints across nine players had contradictory qualifying-appearance metadata. Research distinguishes unused registrations from actual playing spells; corrected orders, returns, nullable unknown appearance totals and supporting URLs are retained in `career-corrections.json`.

`IMPORT_REPORT.json` lists every player, eligibility decision and exact withholding reason, and every blocked badge. Reasons overlap; do not add the separate category counts to infer the number of withheld identities.

## Gameplay behavior

- The server supplies a fresh ten-player deck, avoiding server/client random-render mismatches.
- A round normally contains four careers of 3–5 stints, four of 6–8, and two of 9+; sparse groups are filled from the remaining pool without duplicating identities.
- A new round avoids the previous round's identities when at least ten alternatives exist.
- Ordered club returns remain intact, including Beckham's loans and returns, Henry's Arsenal return, and Kroos's Bayern return.
- Active and retired players can appear as questions. Short careers and other withheld identities remain in autocomplete. Free-text guesses continue to work independently of search membership.
- The shared navigation, card sizing, row centering and automatic long-trail scrolling are preserved.

## Checks and reproducibility

```text
node scripts/journeyman/correct-badges.cjs  # restore pinned researched crest replacements
node scripts/journeyman/correct-careers.cjs # restore explicit researched career corrections
npm run build:journeyman       # rebuild derived eligibility and runtime export
node scripts/journeyman/build-search-directory.cjs
npm run validate:journeyman    # check runtime/export, actual asset bytes and release configuration
npm run test:journeyman        # gameplay, search, pool isolation and deck distribution
npx tsc --noEmit --incremental false
python scripts/journeyman/validate-dataset.py
```

The full-candidate Python audit intentionally returns a nonzero exit while supporting factual evidence, invalid stints and invalid assets remain unresolved. Ongoing careers are not an audit failure. It supersedes the earlier “12/12 VERIFIED_CANDIDATE” report; this does not mean the gated runtime checks fail.

## Releasing additional records

Provide player/stint-specific supporting page URLs, corrected appearance metadata, and authentic correctly identified badges. Correct known trail omissions as part of factual maintenance; ongoing career status itself does not block gameplay. Do not merely flip `hasVerifiedAppearance` booleans. Resolve the documented identity blocks, update both catalog and asset hashes, rebuild, and review the actual eligibility changes before enabling the remaining questions.

The canonical generator's default “verified” booleans and hardcoded timestamps are not proof of research. Do not rerun it as a substitute for correcting its research inputs and recording evidence.
