<img src="images/logo_1024x1024.png" alt="TipTap" width="64px" height="64px" align="right"/>

# TipTap

**Tap. Learn. Impress.**

A cross-platform Flutter app that turns knowledge into a fast, vertical feed of short, verified facts. No fluff — just interesting science, history, nature, space, and culture in a scrollable, bookmarkable timeline.

- **Discover** — vertical, gesture-based feed of facts with detail pages and rewarded unlocks.
- **Bookmarks** — save favorites, synced to Firestore (`users/{uid}/bookmarks/{title}`, newest-first), displayed in a responsive grid on Profile.
- **Profile** — streaks, gems, theme, premium status, and settings with pull-to-refresh.
- **Welcome overlay** — first-launch introduction (`lib/app/introduction/introduction.dart`, glowing book, tap to dismiss).
- **Monetization** — rewarded AdMob ads for unlocking facts and live `in_app_purchase` premium checks via `queryPastPurchases` (not a cached flag).
- **Landing site** — Web builds serve the landing page (`lib/site/`: `home.dart`, `privacy.dart`, `terms.dart`) on Firebase Hosting; Android builds serve the app above.

## Stack

| Layer | Technology |
|---|---|
| App | Flutter, Dart `^3.11.1`, `flutter_bloc` / `hydrated_bloc`, `go_router` (`StatefulShellRoute`) |
| Backend | Firebase Core / Analytics / Crashlytics / Auth (Google Sign-In) / Firestore |
| Content | 1000 curated facts in `content.json`, seeded to the Firestore `content` collection |
| Monetization | `google_mobile_ads` (AdMob rewarded) + `in_app_purchase` |
| UX | `animate_do`, `animations` (Shared Axis), `flutter_svg`, `google_fonts`, `url_launcher`, `intl` |
| Android | Gradle `9.1.0`, AGP `9.0.1`, Kotlin `2.3.20`, `minSdk 24` |
| Hosting | Firebase Hosting serves `build/web` |

## Architecture

Single entrypoint `lib/main.dart` uses a Dart conditional import so the same `--target=lib/main.dart` works everywhere:

- `if (dart.library.js_interop)` → `lib/site_entry.dart` → `lib/site/root.dart` (landing)
- otherwise → `lib/app_entry.dart` → `lib/app/shared/root.dart` (app)

Centralized app wiring lives in `lib/app/shared/root.dart` (`Root` → `MultiBlocProvider` for all services, GoRouter shell with `DiscoverRoute` / `ProfileRoute`).

```
lib/
  main.dart               # conditional dispatcher (app vs site)
  app_entry.dart          # app bootstrap: Firebase, GoogleSignIn, MobileAds, firestore prefs, HydratedBloc
  site_entry.dart         # site bootstrap: usePathUrlStrategy() + Site Root
  app/
    discover/             # Discover feed (on-demand Firestore), fact details, monetize gate
    introduction/         # First-launch welcome overlay
    profile/              # Profile, bookmarks grid, gems, streak, subscription, settings
    services/             # ad, authentication, bookmark, content, first_launch, photo, premium, streak, theme
    shared/               # root wiring, firebase_options (FlutterFire-generated), admob_options, toast
  site/                   # landing page (home, privacy, terms, root)
content.json              # 1000 seed facts (title / body / summary)
seed.js                   # ESM seeder → Firestore `content` (Admin SDK, chunked batches)
firestore.rules           # content: public read, no client writes; users/{uid}: owner-only
```

Key behaviors:

- **Discover feed is on-demand only** — `ContentService` (plain `Cubit`, no Hydrated cache) fetches random batches from Firestore (`where(documentId >= randomToken).limit(5)` with wrap-around), shuffles, and skips already-seen + current feed + bookmarked titles. Triggers near the end of the list and on pull-to-refresh.
- **Bookmarks sync** — `BookmarkService` (Hydrated offline cache + Firestore subcollection) unions local and remote, emits newest-first, and batch-uploads missing toggles. Users who are already signed in get current Firestore state immediately.
- **Sign-out / account deletion** — gems, bookmarks, streak, and content unlocks reset to defaults; **Theme is preserved**. `users/{uid}/bookmarks` is deleted on account removal.
- **Premium gate** — `PremiumServic — gems, bookmarks, streak, and content unlocks reset to defaults; **Theme is preserved**. `users/{uid}/bookmarks` is deleted on account removal.
- **Premium gate** — `PremiumService.checkPremium()` calls live `queryPastPurchases`; Monetize/Fact check via `await checkPremium()`.

## Setup

> Still in closed testing and not yet publicly released.

Install dependencies:

```bash
flutter pub get
npm install   # Firebase CLI tooling (firebase-admin + firebase-tools)
flutter doctor
```

Create a gitignored `.env` file (never commit it). Follow existing key usage — do not invent keys:

```env
FIREBASE_SHARED_PROJECT_ID=<...>
ADMOB_ANDROID_REWARDED_AD_UNIT_ID=<...>
GOOGLE_APPLICATION_CREDENTIALS=<path/to/service-account.json>
# Plus FIREBASE_* keys used by --dart-define-from-file=.env
```

### Firebase

```bash
npm run firebase:login         # or: npx firebase login
npm run firebase:initialize    # or: npx firebase init
```

`lib/app/shared/firebase_options.dart` is FlutterFire-generated — regenerate via FlutterFire rather than hand-editing. The old `flutterfire_cli` dev dependency and `dart:run:flutterfire` task have been removed.

> `site/` at the repo root is the legacy landing-page clone. Use `lib/site/` + `lib/site_entry.dart` for the landing page; `site/` is kept only as a reference copy.

### Content (1000 facts)

`content.json` is the source of truth (1000 entries: `title`, `body`, `summary`). Seed Firestore (`content/{slug(title)}`) with:

```bash
npm run firebase:seed          # node --env-file .env seed.js
```

Docs use IDs derived from titles (slug), so re-running updates in place without duplicates. `seed.js` batches in chunks of 400 (Firestore batch limit is 500).

Deploy rules and hosting:

```bash
npm run firebase:deploy:firestore:rules
npm run firebase:deploy:hosting
```

## Run & Build

Use `.vscode/launch.json` / `.vscode/tasks.json` as canonical presets, or run manually:

```bash
flutter analyze

# Android debug → app (lib/app/)
flutter run --device-id=<device> --target=lib/main.dart --dart-define-from-file=.env

# Web debug (localhost) → landing site (lib/site/)
flutter run --device-id=chrome --target=lib/main.dart --dart-define-from-file=.env --web-hostname=localhost --web-port=3000

# Release: Android appbundle → app, Web (WASM) → landing site for Firebase Hosting
flutter build appbundle --target=lib/main.dart --dart-define-from-file=.env
flutter build web --target=lib/main.dart --dart-define-from-file=.env --wasm
```

For launcher icons and splash, place images under `images/` then:

```bash
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

## Documentation

- App Architecture — https://docs.flutter.dev/app-architecture
- UI / Navigation / Themes — https://docs.flutter.dev/ui/widgets · https://docs.flutter.dev/cookbook/design/themes
- State Management — https://docs.flutter.dev/data-and-backend/state-mgmt/intro
- Firebase — https://docs.flutter.dev/data-and-backend/firebase
- Ads — https://docs.flutter.dev/resources/ads-overview
- In-app Purchases — https://docs.flutter.dev/resources/in-app-purchases-overview
- Environment Variables — https://dart.dev/libraries/core/environment-declarations
- Deployment — https://docs.flutter.dev/deployment/android · https://docs.flutter.dev/deployment/web

## Resources

- Dart / Flutter — https://dart.dev/ · https://flutter.dev/
- Icons / Fonts — https://fonts.google.com/icons ·