# Development audit

Audited on 2026-10-31 on Windows. This covers the local Flutter app, configuration,
assets, tests and available toolchains. Remote Supabase schema, authentication,
Row Level Security and production infrastructure were not accessed or assessed.
Existing Home UI edits and golden images were preserved.

Follow-up: Higher or Lower and its account foundations have since been
implemented. Physical Android gameplay and durable guest restoration are now
verified. The local Supabase settings were corrected to match the deployed web
project; the Android OAuth redirect still needs dashboard configuration and a
live test login. See [Higher or Lower mobile](higher-lower-mobile.md) for current
implementation and acceptance evidence. The findings below record the initial
audit baseline.

## Environment

| Component | Result |
| --- | --- |
| Flutter / Dart | Installed: Flutter 3.47.1 stable / Dart 3.13.1; compatible with the app |
| Dependencies | `flutter pub get` succeeds; package versions preserved, lockfile Flutter minimum updated to 3.47.1 |
| Java / Android | Microsoft JDK 17.0.20.1, SDK platform 37.0, build-tools 36.0.0, NDK 28.2.13676358 |
| SDK command-line tools | Updated from 12.0 to compatible 22.0; old tools preserved in `cmdline-tools/12.0` |
| Android licenses | The pending license is `microxr-sysimage-license`; normal Android debug builds succeed without it |
| Android runtime target | Created `Football_Genius_API_37_Preview`, a Pixel 7 using the installed Android 37.1 preview / 16 KB image; boot and APK install succeeded, but app-launch validation did not complete |
| Web | Chrome and Edge detected |
| Windows desktop | Visual Studio C++ build workload is missing; native Windows builds are not ready |
| iOS | Runner exists; requires macOS/Xcode and was not validated on Windows |
| Editor | Dart and Flutter extensions installed in VS Code; workspace launch profiles and tasks added |

Android tools 23.0 were evaluated but their SDK Manager wrapper no longer
implements `--licenses`, which Flutter 3.47 uses. The unused 23.0 download was
removed, and 22.0 was verified with JDK 17. A Flutter upgrade should recheck this
compatibility. See [Android SDK Manager documentation](https://developer.android.com/tools/sdkmanager).

The XR license remains for user review through `flutter doctor --android-licenses`;
it is not required for the tested phone APK build. Windows desktop compilation
requires the [Desktop development with C++ workload](https://docs.flutter.dev/platform-integration/windows/setup).

## Setup fixes completed

- Added an explicit Flutter minimum to `pubspec.yaml` and replaced the starter
  package description.
- Added shared launch profiles for a selected device, Chrome, and optional local
  backend configuration, plus dependency/analyzer/test/build tasks.
- Replaced hardcoded Supabase deployment values with build-time configuration.
  Preserved this machine's existing public URL/anon key in ignored
  `config/dev.json`; `config/dev.example.json` is safe to share. Startup without
  backend values now skips Supabase initialization. A regression test covers it.
- Added `android.permission.INTERNET` to the main manifest. Previously only
  debug/profile manifests supplied it, so release builds could not reach Supabase
  or fetch fonts. See [Flutter's manifest guidance](https://docs.flutter.dev/deployment/android#review-the-app-manifest).
- Ignored local backend config, Python environments, visual-test failures and
  browser-tool artifacts; made the shared editor configuration trackable.
- Replaced the starter README with run, build, platform and configuration steps.
- Configured a reusable Android emulator without another system-image download.
  Its data lives in ignored `.local/android/avd/` on D:; C: had only about 7.6 GB
  free at setup time. The image is a preview, so also test on stable Android
  before release. Launch it with
  `flutter emulators --launch Football_Genius_API_37_Preview`.

The previous Supabase key is a public client/anon key, not a service-role secret.
Build-time configuration still ships inside the application. Data access must be
protected by server-side policies; see [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

## Findings remaining

| Priority | Finding and impact | Location / next action |
| --- | --- | --- |
| Medium | The installed Android preview image took about 252 seconds to boot. APK installation succeeded and the app process started, but the activity wait timed out and the emulator then disconnected. No successful rendered native screen was captured. The cause was not established. | Native runtime is still unverified. Use a physical phone or a stable Android image for follow-up; this host has about 7.3 GiB RAM. Both APK compilation and web compilation succeed. |
| Medium | One existing Games-list golden fails: 3.03% (10,389 pixels) differ. Visual inspection shows the shared Play now button geometry changed with the in-progress Home edits. The grid and Home comparisons pass. | `test/games_redesign_test.dart:106`, `lib/features/home/presentation/home_style.dart:124`. Review the intended shared-button design before updating the baseline. Failure images are in `test/failures/`. |
| Medium | Asset loading/parsing errors are swallowed and converted to an empty catalogue. `getDailyMatch()` then indexes element zero even when the catalogue is empty, producing a range error. Session initialization has no error state or retry path. | `lib/features/games/scoreline/data/datasources/scoreline_local_datasource.dart:34`, `lib/features/games/scoreline/data/repositories/scoreline_repository_impl.dart:34`, `lib/features/games/scoreline/presentation/controllers/scoreline_controller.dart:20`. Surface a recoverable failure and handle empty data. |
| Medium | Scoreline progress survives navigation in the same process, but is never saved. App termination or a full restart discards rounds, hints and score, even though the last-played game ID persists. | `scoreline_controller.dart`, `lib/features/games/common/presentation/controllers/games_controller.dart:128`. Persist a versioned session if Continue should survive app restarts. |
| Medium | Release signing uses the template debug signing key. | `android/app/build.gradle.kts:36`. Configure production signing before distribution. |
| Low | Scoreline exit callbacks unconditionally pop. A direct web/deep-link entry with no previous route can fail to exit. This is a code-review finding; browser deep-link behavior was not exercised. | `lib/features/games/scoreline/presentation/screens/scoreline_screen.dart:82`. Check `context.canPop()` and fall back to Home. |
| Low | Orbitron and Kanit are requested through Google Fonts but only Outfit is bundled. First use may require network access; typography can differ on a fresh offline install. | `lib/core/theme/app_text_styles.dart:13`, Scoreline widgets, `assets/fonts/`. Bundle the remaining required fonts for deterministic offline rendering. |
| Low | Asynchronous session initialization and last-played restoration have no cancellation/version guard. A delayed load can overwrite newer state or write after a provider is disposed. This is a code-review concern, not a failure observed in the suite. | `scoreline_controller.dart:20`, `games_controller.dart:136`. Guard asynchronous writes and add delayed-repository/storage coverage. |

Only Home, Games and Scoreline routes are registered. The other seven game modes,
Rank/Profile and authentication are placeholders. These are implementation gaps,
not toolchain failures. Dependencies resolve, but 19 packages report newer versions
outside current constraints. No major dependency upgrades were applied; this was
not a package vulnerability scan.

The existing design notes also record a narrow-screen Scoreline overflow. Current
responsive coverage mostly exercises Home/catalogue; expand real-game viewport
coverage before treating all screens as phone-ready.

## Validation

- Static analysis: no issues.
- Full suite: 39 pass, 1 pre-existing visual comparison fails; no golden baselines
  were regenerated. The offline-bootstrap test is included in the passing count.
- Dataset: 200 matches, no duplicate IDs, all 99 distinct referenced images exist.
- Editor/example JSON parses successfully; local backend config and failure
  artifacts are ignored by Git.
- `flutter build apk --debug --no-pub`: succeeds with SDK command-line tools 22.0.
  Output: `build/app/outputs/flutter-apk/app-debug.apk`.
- `flutter build web --no-pub --dart-define-from-file=config/dev.json`: succeeds,
  including its WebAssembly compatibility dry run. Output: `build/web/`.
- Emulator: WHPX check succeeds, Flutter detects the AVD, Android reaches
  `sys.boot_completed=1`, and `adb install -r` reports `Success`. Activity launch
  times out and the emulator disconnects; native rendering/touch behavior is not
  verified. The smoke-test emulator is no longer running. The idle Gradle daemon
  used by the builds was stopped to release resources.

Audit logs are kept in the ignored `build/` directory. Native Windows compilation,
iOS builds, remote backend behavior and store release readiness remain unverified.
