# Higher or Lower lobby reference redesign

Implemented 2026-11-01. This update changes the category lobby presentation while
retaining the existing repositories, saved runs, scoring, authentication, sheets
and play routes. The header has no crown above “OR”.

The reference was viewed for layout/style only. No screenshot pixels, cutouts,
traced paths, extracted artwork or reference image inputs were used in generation.
All six illustrations were independently generated with the built-in imagegen
tool, then encoded as WebP without cropping. The exact final prompts, source
hashes, asset paths and encoding sizes are in
[the artwork manifest](higher-lower-lobby-art.json).

| Asset | Purpose |
| --- | --- |
| `assets/images/higher_lower/lobby_hero.webp` | Night stadium, emerald/gold arrows, football and satin |
| `assets/images/higher_lower/lobby_market.webp` | Emerald valuation chart and cloth |
| `assets/images/higher_lower/lobby_goals.webp` | Blue stadium, football and net |
| `assets/images/higher_lower/lobby_assists.webp` | Purple stadium, black/gold boot and light trail |
| `assets/images/higher_lower/lobby_transfer.webp` | Amber-lit contract and fountain pen |
| `assets/images/higher_lower/lobby_turf.webp` | Dark emerald turf background |

Trim, badges, laurels, metallic buttons and the football dock symbol are original
Flutter drawings. Text and all controls remain live widgets. Buttons preserve
48 dp hit regions while the decorative frames follow the smaller reference
proportions. The bottom dock connects Home, catalogue, categories, personal
records and the existing account sheet.

Typography uses bundled Barlow Semi Condensed Regular, Medium Italic and Black
Italic from the official [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl/barlowsemicondensed).
Its SIL Open Font License is bundled at `assets/fonts/BarlowSemiCondensed-OFL.txt`.
No runtime font download or additional Flutter dependency is needed.

The 941 × 1672 reference is reviewed at approximately 393 × 698 logical pixels.
The toolbar and trim scale with width. At 393 dp, the toolbar is 50 dp,
the section heading is 48 dp, card gaps are 8 dp and outside card margins are
11 dp. The hero uses 31% of the scroll viewport, bounded between 166 and 230 dp.
Both card rows share the remaining height, with a 140 dp minimum and a 12 dp
gap above the dock. This fills taller phones without a vacant lower section.
System status/navigation bars use the device's real insets. Text enlargement
switches to naturally scrolling, single-column cards; reduced motion uses an
immediate jump for the categories dock action.

The follow-up cleanup removes the guest/account status strip, hero explanatory
subtitle, dataset date and XP footnote from the lobby. Rules and account details
remain available through their existing sheets. Taller category cards keep their
labels and actions at the bottom, with the artwork above them.

`test/goldens/higher_lower_lobby_reference.png` uses genuine repository operations
to prepare four best streaks of one, three finished runs and one resumable run.
Production labels and scores always come from saved state. The screenshot's
record values are not hardcoded into the app.

Only lobby and unavailable-account visual baselines were intentionally updated.
The duel, transfer, reveal and result visual baselines remain unchanged. The
pre-existing Games-list golden mismatch remains outside this redesign.

The subsequent [game-screen redesign](higher-lower-duel-redesign.md) intentionally
updates those game-screen baselines while retaining this lobby's baselines.

Cleanup verification: analysis reports no issues and all 21 Higher or Lower widget
tests pass. Layout checks confirm a 12 dp scaled gap between the cards and dock
on normal phone layouts. The Android debug APK builds and was installed on the
RMX2030 test phone without clearing data. Saved runs and XP were unchanged, and
the completed native screen was reviewed at
`build/higher-lower-android-cleanup-lobby-ready.png`.
