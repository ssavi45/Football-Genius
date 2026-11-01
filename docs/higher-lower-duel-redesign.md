# Higher or Lower game-screen reference redesign

Implemented 2026-11-01 for all four categories. The reference composition is
841 × 1870 pixels, reviewed at 393 × 874 logical pixels with real system insets.
Gameplay, reveal, loading, connection recovery and results share the stadium
shell, bundled Barlow typography, metallic labels and existing five-action dock.
The guest/account status strip is omitted. The category lobby's visual baselines
are unchanged.

The three backgrounds were independently generated with the built-in `image_gen`
tool. No reference image was supplied to generation, and no screenshot pixels,
extracted objects or traced paths entered the implementation. Exact prompts,
source hashes, dimensions and final asset paths are recorded in
[the artwork manifest](higher-lower-duel-art.json). The final WebP assets are:

- `assets/images/higher_lower/duel_stadium.webp`
- `assets/images/higher_lower/duel_emerald.webp`
- `assets/images/higher_lower/duel_purple.webp`

Together these assets add 798,256 bytes. Packaging only downsizes proportionally
and encodes WebP; see `scripts/higher-lower/prepare-duel-art.py`. The emerald and
purple textures contain no landmarks. Score shields, chamfered neon frames,
gold rules, touch indicators and the VS separator are Flutter widgets/drawing.
Existing lobby laurels, metallic text, turf and football dock symbol are reused.

## Layout and behavior

At 393 dp width, the stadium/header is 156 dp, the scoreboard is 64 dp, each
choice has 10 dp outside margins and a 184 dp minimum height, and VS is 42 dp.
The instruction has a 34 dp minimum content height plus 5 dp vertical padding.
Cards share remaining height, leaving 12 dp above the dock. The content width is
capped at 560 dp on tablets. Short screens and enlarged text scroll; full names
wrap. Card height measures the actual inherited text style and text scale.

The top card stays emerald and the bottom card stays purple. Left-edge portraits
are bottom-aligned with a lower fade; download and prefetch sizes account for the
larger portrait area and device pixel density. Missing portraits show gold
initials. Identity-image fit, alignment and placeholder parameters retain their
previous defaults for existing callers.

The first name token is white; remaining tokens are larger gold text. Mononyms
are gold. Club labels, nationality flags, retired identities and fixed transfer
origin/destination/date come from the existing run. The entire card is one
accessible choice, including its hidden/revealed value and transfer description.

Back and the football dock button pause presentation and return to the lobby.
When returning from a lobby-initiated push, they pop that route so the lobby's
awaited selection action completes and unlocks. Home and catalogue retain their
existing routes; records now use a shared sheet that refreshes after gameplay,
and account/help content is unchanged. Unknown loading/error scores use em dashes rather than fabricated
zeroes.

The existing controller, domain models, API payloads, scoring, authentication and
storage formats are unchanged. Choice locking, durable cloud retry IDs, original
pair reveals for 1.2 seconds, retained physical positions, ties, +15 XP and
separate guest/account saves continue to use the existing implementations.

## Visual fixtures and verification

The deterministic reference golden uses the bundled dataset's Raphaël Guerreiro
and Ousmane Dembélé. Production selection is unchanged. Portraits, flags and
Dembélé's club crest were downloaded separately from the reviewed canonical
media mappings, independently of the reference screenshot. Their URLs and hashes
are recorded in `test/fixtures/higher_lower/provenance.json`; the reproducible
fetch script is `scripts/higher-lower/fetch-duel-test-fixtures.py`.

Reviewed renders include normal gameplay with photos, reveal, final result,
transfer details, loading and account recovery. Fallback-image baselines remain
covered. Layout tests cover widths 320, 360, 393, 430 and 768, 320 × 568 short
screens, 2× text, reduced motion, long names, retired identities and mononyms.
New interaction checks cover every dock action and guest recovery after an
account connection failure. Existing tests recheck rotation, ties, known zeros,
double taps, restoration, request serialization and account isolation.

Static analysis reports no issues. All 57 Higher or Lower tests pass, including
unchanged lobby goldens. The full app suite has 96 passes and the single recorded
Games-list golden failure described below. Repeat with:

```powershell
flutter analyze
flutter test test/higher_lower_engine_test.dart test/higher_lower_repository_test.dart test/higher_lower_controller_test.dart test/higher_lower_widgets_test.dart
flutter test
flutter build apk --debug --dart-define-from-file=config/dev.json
```

The final debug APK builds successfully and was installed over the existing app
on the RMX2030 / Android 10 phone without clearing data. Native review confirmed
downloaded portraits, club crests and flags in Goals, Assists and Transfer,
restored retained values, two actionable accessible choices, records/account
sheets, category switching and Back/football navigation. The dense transfer
layout scrolls on this device's shorter viewport with its three-button system
navigation bar. A cold start restored the saved runs. The complete guest document
remained byte-for-byte identical throughout the update and navigation checks:
120 XP, all four run IDs, revisions, comparisons and bests were preserved.
Evidence is in the ignored `build/hl-duel-native-save-check.log`,
`build/higher-lower-android-duel-final.png` and
`build/higher-lower-android-duel-transfer-final.png`.

Only intentional game-screen goldens were updated. The pre-existing Games-list
golden mismatch remains separate: 3.03% / 10,389 pixels. Its baseline was not
changed. Native OAuth/cross-device acceptance remains pending the project's
Supabase redirect allowlist and interactive test login, as documented in
[the mode setup notes](higher-lower-mobile.md).
