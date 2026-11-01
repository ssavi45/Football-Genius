# Higher or Lower on Android

The mode has four categories, an original stadium-themed Flutter lobby, stacked comparison
cards, reveal/result screens, personal records, rules and an account sheet. Home
Quick Play, featured Continue and the catalogue all open the category lobby.
Android is the release target; authenticated Flutter web and iOS are deferred.

## Data and rules

The bundled schema-v3 snapshot contains 500 players. It and factual identity
mappings were imported from `web-nextjs` at
`a84a4b90859bbee207be7c04d5e0c6b066a45f47`. No web layouts or decorative artwork
were imported. Recreate the data with:

```powershell
node scripts/higher-lower/import-mobile-data.cjs web-nextjs
flutter test test/higher_lower_engine_test.dart
```

Eligibility counts are 452 market valuations, 495 career goals, 495 career assists
and 470 players with eligible transfers. Missing statistics stay null; known zero
goals, assists and free transfers remain playable. Transfer selection chooses a
player first, then one move that stays fixed for that card. Cards never share the
same player. Values are compared as integer amounts, independently of display
rounding. Either choice wins a tie. Each correct choice earns 15 XP. A card stays
in its position and retires after its second matchup, even when it wins.

Both opening values are hidden; a retained card stays revealed. Picks lock
immediately and reveal the original pair for 1.2 seconds. Committed state is
restored without repeating celebrations or rewards. Back preserves each category's
run. The lobby uses independently generated artwork, original Flutter-rendered
metallic controls and bundled Barlow typography. Duel, reveal, loading, recovery and
result screens use the premium stadium design described in
[the game-screen redesign notes](higher-lower-duel-redesign.md). Identity images use the canonical website's optimized files, disk
caching and initials/club-label fallbacks. They never block accepting a choice.

## Persistence and API

`lib/features/games/higher_lower/` separates pure domain models/rules, data
repositories and Riverpod presentation. Native guest state is stored under the
application support directory in `higher_lower_v1/`. The run, best and total local
Higher or Lower XP are saved together using a flushed temporary file and rename.
Writes and picks are serialized; an outdated run revision cannot award twice.
Validated snapshots are cached and versions referenced by guest runs are pinned.
A refresh never replaces an existing publication version or an active pair.

Guest state and each account/category slot have separate keys. Sign-in loads
cloud state; it never uploads guest runs or XP. Account rewards belong to the
server. A queued mutation is saved before sending and retries preserve its exact
request ID and payload, including after process restart. A 409 restores server
progress without replaying the old choice. Offline account play pauses and offers
retry or separate guest practice. Controllers guard late callbacks, account
changes, navigation and reveal timers.

The existing app ID is `higher_lower`; the wire mode is `higher-lower`:

| Contract | Implementation |
| --- | --- |
| `GET /api/higher-lower/snapshot` | Validated background refresh; bundled/cached fallback |
| `POST /api/game-progress` | `resume`, `pick`, `restart`; variants `marketValue`, `goals`, `assists`, `transfer` |
| Mutation fields | `runId`, `revision`, UUID `requestId`; pick side `left` (top) or `right` (bottom) |
| Response | `{runId, revision, state}` |
| Account records | Resume the four API slots; unknown records remain unavailable |
| Supabase Auth | Google, PKCE, external browser, restored/refreshed bearer tokens |
| Supabase `profiles` | Read `id,username,avatar_url,total_xp` for the current user |

The app never accesses `game_progress` directly. Contract fixtures follow
`src/app/api/game-progress/route.ts` and `src/lib/backend/games.ts` on the source
web branch. Tests cover expired-token refresh, uncertain responses, duplicate
requests, revision conflicts, owner changes and guest/account isolation.

## Google setup still required

The previous local configuration pointed at a different Supabase project. The
ignored `config/dev.json` now uses the public project URL and client key found in
the deployed website's JavaScript. The project's public Auth settings returned
HTTP 200 and confirmed Google is enabled. No administrative credentials were
used. The deployed project reference is `bcghsiwettjrjxgzbtvu`.

In that project's Supabase Dashboard, open **Authentication → URL Configuration**
and add this exact Redirect URL:

```text
com.footballgenius.footygen://login-callback/
```

The Android manifest registers this URI and opts out of Flutter's default deep
link handler so the Supabase plugin handles callbacks. Android's intent resolver
has confirmed that the URI resolves to this app. PKCE/session handling is
implemented through Supabase Flutter. See the official
[Supabase mobile linking guide](https://supabase.com/docs/guides/auth/native-mobile-deep-linking)
and [Flutter plugin linking guidance](https://docs.flutter.dev/ui/navigation/deep-linking).

The allowlist is not configured yet, as confirmed by the project owner. Actual
Google authentication and callback completion have **not** been verified. After
adding the URI, use a dedicated Google test account to check:

1. Sign in from an already running app, then with the app cold-started by callback.
2. Resume a web streak in Android, accept a pick, then resume it on the website.
3. Retry after an uncertain response and confirm account XP is credited once.
4. Sign out and confirm existing guest category saves and local XP remain separate.

No guest data is merged into an account. Missing configuration or a cancelled
browser flow leaves guest play available.

## Run and verify

For guest-only development, no backend settings are required. To enable accounts,
copy `config/dev.example.json` to `config/dev.json` on a fresh checkout and set the
website's public Supabase settings. Never use a service-role/secret key in an app.

```powershell
flutter pub get
flutter run -d <android-device-id> --dart-define-from-file=config/dev.json
flutter analyze
flutter test
flutter build apk --debug --dart-define-from-file=config/dev.json
```

The API origin is a build-time `FOOTYGEN_API_BASE_URL`, defaulting to
`https://www.footygen.online`. A full restart/rebuild is required after configuration
changes. APK output is `build/app/outputs/flutter-apk/app-debug.apk`.

Automated coverage includes domain parity, snapshot validation and version pinning,
atomic file restoration, duplicate XP prevention, cloud serialization/recovery,
account transitions and entry-point routing. New visual baselines cover widths
320, 360, 393, 430 and 768 plus transfer, reveal, result and unavailable-account
states. Tests also exercise 2× text, reduced motion and actionable card semantics.
Image-disabled goldens intentionally show the fallback state; native screenshots
review downloaded portraits, flags and club crests.

Final automated checks on 2026-10-31: 49 Higher or Lower tests pass; static
analysis reports no issues. The full suite has 88 passing tests and the single
pre-existing Games-list golden failure described below. The final Android debug
APK builds successfully; inspection confirms the deployed website's Supabase
project and both game data files are embedded in the APK.

Physical Android verification on RMX2030 / Android 10 confirmed all four category
entries and correct picks: four independent saved streaks and exactly 60 guest XP.
An incorrect Market Value pick ended only that run without changing earned XP.
Force-stopping and cold-starting the app preserved the run IDs, revisions, bests
and XP. Native screenshots and check logs are under ignored `build/`.

The final APK was installed over the earlier debug build without clearing data.
The complete guest save summary remained unchanged (60 XP and all four run IDs,
revisions and bests). Career Goals resumed with its retained value revealed and
its challenger hidden. Android accessibility exposed both choices as enabled,
clickable buttons. The configured Google button is enabled; no real OAuth login
was attempted while redirect setup is pending.

The existing `games_list.png` comparison remains a recorded baseline failure:
3.03% / 10,389 pixels differ due to the existing shared Home button edits. Its
baseline was not changed. Live Google/cross-device acceptance remains outstanding;
the feature must not be described as fully release-accepted until those checks
pass. Store signing/publication and other game modes remain separate work.
