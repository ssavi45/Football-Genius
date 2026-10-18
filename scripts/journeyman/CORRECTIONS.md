# Journeyman question-pool corrections

The runtime now enables 269 of the 300 identities. The only remaining exclusions are 31 careers with fewer than three playing stints. All 50 records previously excluded for appearance or crest defects are enabled.

## Career corrections

The reproducible record is `career-corrections.json`. Each entry has a rationale, explicit resulting club sequence, and supporting page URLs. `correct-careers.cjs` applies these overrides; the original Python dataset builder also respects them.

- **Harry Kane:** remove unused Tottenham registration before Orient; retain actual Tottenham playing returns between Orient/Millwall and Millwall/Norwich.
- **Kevin De Bruyne:** remove unused pre-Bremen Chelsea registration; keep the actual Chelsea playing spell from 2013 and add Napoli from 2025.
- **Luka Modrić:** start at Zrinjski rather than an unused Dinamo registration; retain Inter Zaprešić and Dinamo, and add Milan from 2025.
- **Nemanja Vidić:** start with the senior Spartak Subotica loan rather than Red Star's earlier youth/unused registration.
- **Kyle Walker:** start with Northampton, merge Sheffield playing continuity across registration changes, move the first Spurs playing spell to 2010, and preserve QPR/Villa returns; add Milan and Burnley in 2025.
- **Bebeto:** keep the real Vitória playing spell; state-league scoring records prove a competitive appearance. The exact all-competition total is unknown (`null`), not zero.
- **Sócrates:** keep the real 1989 Botafogo-SP return. The club's seven-match total includes a farewell friendly, so the exact competitive total is left `null`.
- **Carlos Alberto:** restore Santos after the Botafogo playing loan and keep Flamengo; avoid using a whole-career total for an individual split stint.
- **Jairzinho:** correct Portuguesa to the Venezuelan club, restore Noroeste/Fast/Nacional-AM and 9 de Octubre in order, and exclude the friendly-only 1981 Botafogo return.

## Crest corrections

`badge-corrections.json` pins source images, page URLs and source SHA-256 hashes. `correct-badges.cjs` verifies those bytes, removes only a uniform edge-connected backdrop where needed, and produces centered transparent 180×180 WebP canvases with artwork within 164×164.

41 sourced assets replace incorrect/generated crests and supply the additional clubs needed by the corrected trails. Existing historical renamings may use the same club's contemporary crest (e.g. Dallas Burn/FC Dallas, Iwuanyanwu Nationale/Heartland); this is not a claim to reproduce the exact badge from each playing year.

ROK Air Force uses the service's actual institutional emblem, not a claimed period-specific football badge. **Esteghlal Ardabil has no reliable crest located in the reviewed sources**. Its fabricated asset is removed, `logo` is explicitly `null`, and the game displays the club's name as text while preserving the playing stint. Esteghlal Tehran artwork is never substituted.

Original wrong-club blocks remain as audit history. Only the specifically resolved asset hashes clear those blocks. Regenerating an old incorrect file will fail the import check.

These targeted corrections address the 50 exclusion cases; they do not certify every historical fact in all 300 records.
