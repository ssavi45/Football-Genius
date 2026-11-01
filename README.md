# Football Genius

A Flutter football trivia and puzzle app. Home and the Game Modes catalogue are
implemented; Scoreline Hero uses 200 bundled historic matches. Higher or Lower
has four playable categories, durable guest saves and Google/account sync
integration. Live account acceptance awaits Supabase redirect setup and a test
login. The other six modes, leaderboard and full profile remain placeholders.

## Development setup

The verified SDK is **Flutter 3.47.1 stable / Dart 3.13.1**. Use this version when
comparing the checked-in golden images. Dependencies are pinned in `pubspec.lock`;
use `pub get` when setting up, and review dependency upgrades separately.

```powershell
flutter --version
flutter doctor -v
flutter pub get
flutter devices
flutter run -d chrome
```

The app runs without backend configuration. In VS Code or Cursor, install the
recommended Dart and Flutter extensions and choose a launch configuration from
Run and Debug. `Flutter: Chrome (offline)` works without a connected phone.
For Android, connect a phone with USB debugging enabled, select it in the device
picker and use `Flutter: selected device (offline)` or `flutter run -d <device-id>`.
Use `flutter emulators` to check for configured Android virtual devices.

This Windows machine also has `Football_Genius_API_37_Preview`, a Pixel 7 using
the already installed Android 37.1 preview image with 16 KB pages. Its data lives
under the ignored `.local/android/avd/` directory on D:. Launch it with:

```powershell
flutter emulators --launch Football_Genius_API_37_Preview
flutter devices
```

Select its Android device ID for `flutter run` or in the editor device picker.
This preview booted and accepted the debug APK during setup, but disconnected
during app launch. Its app runtime is not verified; use Chrome now, or a physical
phone/stable Android image for native runtime checks.

### Android on Windows

Install the Android SDK command-line tools, platform-tools, SDK platform,
build-tools, CMake and NDK required by Flutter. Set `ANDROID_HOME` to the SDK
directory and `JAVA_HOME` to your JDK; this checkout uses JDK 17.
Flutter maintains the ignored `android/local.properties` for this machine.
Review pending licenses with `flutter doctor --android-licenses`.

See the official [Android setup instructions](https://docs.flutter.dev/platform-integration/android/setup).
This machine uses **Android SDK Command-line Tools 22.0**. The previous 12.0 tools
misread newer SDK metadata. Version 23.0 replaces the SDK Manager interface used
by this Flutter version; keep 22.0 until verifying a Flutter/tooling upgrade.
Android documents [installing a specific tools version](https://developer.android.com/tools/sdkmanager).

### Other platforms

- Web development uses Chrome or Edge and does not need Android tooling.
- Windows desktop builds need Visual Studio or Build Tools with **Desktop
  development with C++** and a Windows SDK. VS Code alone does not supply these
  compilers. See [Windows setup](https://docs.flutter.dev/platform-integration/windows/setup).
- iOS builds need a Mac with Xcode. The iOS runner exists but cannot be validated
  on this Windows host. See [iOS setup](https://docs.flutter.dev/platform-integration/ios/setup).

## Optional backend configuration

For a new checkout, copy the example and fill in your project's public client key:

```powershell
Copy-Item config/dev.example.json config/dev.json
flutter run -d chrome --dart-define-from-file=config/dev.json
```

`SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` are read at build time. The legacy
`SUPABASE_ANON_KEY` is also supported. Both values may be omitted for offline
development. The same flag works with `flutter build apk` or `flutter build web`.
`FOOTYGEN_API_BASE_URL` defaults to `https://www.footygen.online`. Use the same
Supabase project as the deployed website for shared account progress. Higher or
Lower's Android callback setup and acceptance checks are documented in
[Higher or Lower mobile](docs/higher-lower-mobile.md).

The backend launch configuration reads `config/dev.json`, which is ignored by Git
and excluded from Flutter assets. Use a full restart after changing these values.

Client configuration is embedded in the compiled application. Use only a
publishable/anon key, never a secret or service-role key. Protect backend data
with Row Level Security; moving a client key to a local file does not make it
secret. See [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys).

## Checks and builds

```powershell
flutter analyze
flutter test
flutter build apk --debug
flutter build web
```

Equivalent tasks are available in `.vscode/tasks.json`, including `Flutter:
verify` (dependencies, analysis, then tests). The APK is written to
`build/app/outputs/flutter-apk/app-debug.apk`; the web output is in `build/web/`.
Release signing still uses the template debug key and needs production
configuration before distribution.

Golden tests compare against `test/goldens/`. Review the images in `test/failures/`
when a comparison fails; regenerate baselines only after reviewing an intentional
visual change. Do not update them simply to make a failing check green.

## Code map

- `lib/core/`: themes, routing, constants and backend configuration.
- `lib/shared/`: reusable widgets and models.
- `lib/features/home/`: Home UI and artwork styling.
- `lib/features/games/common/`: catalogue, filters and persisted last-played mode.
- `lib/features/games/scoreline/`: data, domain and Riverpod presentation layers.
- `lib/features/games/higher_lower/`: snapshot, durable saves, rules and mobile UI.
- `test/`: domain, widget, navigation, responsive layout and golden tests.
- `assets/`: bundled game data, fonts and artwork.

Python is only used by optional asset-preparation scripts, not by Flutter builds.
See [Home and catalogue design notes](docs/flutter-home.md) and the
[development audit](docs/development-audit.md) for current findings and validation.
The [web gameplay reference](docs/web-gameplay-reference.md) documents the
implemented `web-nextjs` modes, live guest-flow checks and Flutter porting details.
