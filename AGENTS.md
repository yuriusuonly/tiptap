# AGENTS

## Project
- Flutter app (`tiptap`, Dart SDK `^3.14.0`) with Firebase (core/analytics/crashlytics/auth/firestore), AdMob, and in-app purchases. UI imports use `package:material_ui/material_ui.dart` (migrated from the deprecated `package:flutter/material.dart` in Flutter 3.50).
- Entry: single `lib/main.dart` with Dart conditional import (`dart.library.js_interop`): Web → `lib/site_entry.dart` (landing page), Android/other → `lib/app_entry.dart` (app). `lib/app_entry.dart` initializes Firebase, Google Sign-In, Mobile Ads, Firestore persistence, `HydratedBloc` storage, then runs `Root` (`lib/app/shared/root.dart`). `lib/site_entry.dart` runs the site `Root` (`lib/site/root.dart`) with `usePathUrlStrategy()`.
- `site/` at repo root is the legacy landing-page clone; its code now lives in `lib/site/` and its assets (`icons/github.svg`, `icons/google_play.svg`, `images/screenshot_*.png`, `web/`) were merged into the root. Keep `site/` only as reference.

## Structure & patterns
- Feature dirs: `lib/app/discover/` (Firestore `content` feed via `ContentService`), `lib/app/profile/`, `lib/app/introduction/`. Services: `lib/app/services/` (auth/theme/ad/premium/streak/bookmark/content/first_launch/photo). Shared wiring/options: `lib/app/shared/` (`root.dart`, `firebase_options.dart`, `admob_options.dart`, `toast.dart` for Crashlytics-aware error reporting, `route_args.dart` for safe `extra` casts, `bootstrap_error_screen.dart`). Site: `lib/site/` (`home.dart`, `privacy.dart`, `terms.dart`, `root.dart`).
- State/navigation wiring is centralized in `lib/app/shared/root.dart`: app-wide services are provided via `MultiBlocProvider` and routing uses `go_router` `StatefulShellRoute` branches (`DiscoverRoute`, `ProfileRoute`) implementing `RootNavigationShellBranch`. Site has its own `Root` (`lib/site/root.dart`, `HomeRoute` + `PrivacyRoute`/`TermsRoute`).
- Conditionals: `lib/main.dart` uses `if (dart.library.js_interop)` so Web builds tree-shake Firebase/AdMob/IAP and Android builds tree-shake `flutter_web_plugins`. `pubspec.yaml` includes `flutter_web_plugins` for the site.

## Commands (verified)
- Install deps: `flutter pub get` and `npm install` (Firebase CLI/tooling).
- Analyze: `flutter analyze` (lints via `package:flutter_lints/flutter.yaml`; see `analysis_options.yaml`).
- Run/build require `.env` (gitignored) and explicit target:
  - Android debug: `flutter run --device-id=<device> --target=lib/main.dart --dart-define-from-file=.env`
  - Web debug (local): `flutter run --device-id=chrome --target=lib/main.dart --dart-define-from-file=.env --web-hostname=localhost --web-port=3000`
  - Android bundle: `flutter build appbundle --target=lib/main.dart --dart-define-from-file=.env`
  - Web (tasks use WASM): `flutter build web --target=lib/main.dart --dart-define-from-file=.env --wasm` (see `.vscode/tasks.json` for exact variants like `--pwa-strategy=none --no-source-maps`).
- Firebase deploy scripts: `npm run firebase:deploy:firestore:rules`, `npm run firebase:deploy:hosting` (hosting serves `build/web`; config in `firebase.json`).
- Generated/utility tasks (see `.vscode/tasks.json`): launcher icons, native splash, rename app.

## Gotchas
- `.env` is required for local run/build but not committed (`.gitignore`). Do not invent env keys; follow existing usage.
- `flutter_test` is commented out in `pubspec.yaml` and there is no `test/` directory; do not assume test commands work.
- `lib/app/shared/firebase_options.dart` is FlutterFire-generated config; regenerate via FlutterFire rather than hand-editing casually.
- VS Code launch/tasks (`.vscode/launch.json`, `.vscode/tasks.json`) are the repo’s canonical command presets; keep CLI guidance consistent with them.
- Firestore rules/indexes are in `firestore.rules` and `firestore.indexes.json`; hosting/auth config is in `firebase.json`.
- Always use `showSomethingWentWrong(error: e, stack: s, context: 'feature:action')` (or `reportError`) from `lib/app/shared/toast.dart` instead of bare `catch (_) {}` or `debugPrint`, so failures reach Crashlytics with context.
- Firestore sync services use a generation token to ignore stale auth-change results; keep that pattern when adding new synced services. `premium`/`gems` are client-writable today — entitlements still need server-side verification before public billing.
