# Flutter Home redesign

Home and Game Modes share a warm-white, navy, teal and gold browsing theme and
the same dock. Active games retain the dark theme. `home_style.dart` centralizes tokens and
artwork; the existing Home widgets own the header, stats, featured card, Quick
Play, Scout's Duel and bottom navigation.

## Behavior and layout

- The featured card still watches `lastPlayedGameProvider`. Continue resumes the
  existing Scoreline controller; it does not create or reset a round.
- Per the follow-up request, Home hides round/points/progress information and the
  match strip is a static, decorative Real Madrid 2–1 Barcelona preview. It is
  independent of the real session and never reads the hidden match result.
- Other modes retain their titles, artwork, Continue and snackbar actions.
  Quick Play still updates stored last played; Bootroom remains the third card.
- Header and Home navigation stay fixed. Content scrolls normally, with the
  Scout's Duel CTA reachable above navigation. The composition caps at 520 dp.
- Tall phones distribute spare height across the featured artwork, Quick Play
  tiles and Scout's Duel banner. Smaller phones and larger text still scroll.
- Home displays only the FootyGen lettering from the approved blue lockup through
  a Flutter clip, without altering or repainting the source asset. Quick Play has
  no decorative heading underline.
- The logo mask preserves the full italic F. Featured text starts lower with
  wider gaps, Higher or Lower uses two title lines, and the static match preview
  uses an angled navy score panel with original cream/gold brush artwork around
  native club crests and score. The header wordmark is 8% smaller.
- Above 1.3x text, stats stack, Quick Play uses two columns, and banners grow.
  Featured content can also grow below that threshold to prevent overlap.
- System bars use Home's light style; native safe areas handle status and bottom
  navigation insets. No imitation OS status or gesture bar is drawn.
- Stats retain the previous display values. No backend or game logic was added.

## Assets and provenance

Seven illustrations were independently generated with the built-in image-generation
tool from written composition briefs on 2026-10-27. The reference screenshot was
not supplied to image generation or used to extract, trace or crop artwork.
`assets/images/home/provenance.json` records the full prompts, original source
locations, dimensions and SHA-256 hashes. Local WebPs total about 577 KiB.
The transparent `assets/images/home/scorecard-frame.webp` uses an original written
brief for torn ivory paper, gold brush strokes and an empty navy center; the full
prompt is recorded in the provenance manifest. It contains no baked-in scores or
crests, and was not extracted from the user's reference.

`scripts/home/prepare_art.py` resizes **generated originals**, not reference
screenshots. It needs Pillow and the original source paths in the manifest; it
is a one-time asset-preparation utility, not an app/build dependency.

The approved blue logo is copied unchanged from
`web-nextjs:public/branding/footygen-logo.webp` into
`assets/images/branding/footygen_blue.webp`. The existing original
`scoreline_hero_logo.png` and Madrid/Barcelona club crests are reused. All labels,
scores, progress bars, badges and buttons remain native Flutter widgets.

Outfit's original variable TTF and license come from the official Google Fonts
repository (`ofl/outfit`). `assets/fonts/Outfit-OFL.txt` contains the SIL Open Font
License. Home uses the bundled family. Static weights 400–900 are bundled under
Google Fonts' expected filenames so existing `GoogleFonts.outfit` consumers can
also resolve them offline. `scripts/home/prepare_fonts.py` reproduces these files
using fontTools; Python is not an app dependency.

## Run and verify

```powershell
flutter pub get
flutter run
flutter analyze
flutter test
flutter build apk --debug
```

`test/home_redesign_test.dart` uses a deterministic real-match fixture and bundled
fonts/artwork. `test/goldens/home_light.png` and `home_light_scrolled.png` cover
the 393 × 698 logical-pixel reference proportions, without OS-rendered status or
gesture-bar content. `home_light_tall.png` checks the 393 × 873 tall-phone layout.
Intentional visual updates can regenerate them with:

```powershell
flutter test test/home_redesign_test.dart --update-goldens
```

Coverage includes widths 320, 360, 393, 430 and 768 (centered 520 dp composition),
2x text, tall safe areas, hidden progress, static preview, viewport fill, fixed header, reachable
Scout CTA, artwork fallbacks, persisted selection, Games navigation, Scoreline
resume, dark game theme and restored light system-bar configuration.

Verification completed: `flutter analyze` reported no issues, all 29 tests passed,
and `flutter build apk --debug` produced
`build/app/outputs/flutter-apk/app-debug.apk`. Golden images were rendered and
inspected locally. An Android device appeared briefly but disconnected before
device checks, so physical-device touch feel, OS bar appearance and navigation-mode
differences still require an Android device check. A separate pre-existing
Scoreline layout overflow at narrow phone widths was observed while testing
navigation; the unchanged game-screen UI is outside this Home redesign.

## Game Modes catalogue

The catalogue reuses `HomeBottomNavBar`, the bundled Outfit family, light theme
and system-bar configuration. Its top navbar has been removed, so the page begins
with Game Modes beneath the system safe area. Its grid/list switch, category
filters, last-played persistence, Scoreline launch and other modes' snackbar
callbacks remain in place. The grid uses larger artwork, white information
panels, soft shadows and gold arrows; list mode uses wide art and gold Play now
controls. Duration badges and play controls sit on the lower edge of the artwork,
freeing the old footer space for a taller banner within the compact card height.
Grid cards use 190 dp base rows. Above
1.3x text, cards use a natural-height single column. The dock remains fixed, and
content scrolls within a centered 520 dp maximum width.

`game_mode_tile.dart` shares artwork and card content across both layouts. Three
original website WebPs were reused unchanged for Matrix, Journeyman and Tunnel
Talk; `assets/images/game-modes/provenance.json` records their branch paths and
hashes. Other catalogue artwork comes from the existing Home assets.

`test/games_redesign_test.dart` covers rendered grid/list goldens, phone widths,
large text, filters, stored selection and dock navigation. It adds ten tests to
the existing suite (39 tests now pass; analyzer reports no issues). Rendered previews are `test/goldens/games_grid.png` and
`test/goldens/games_list.png`.
