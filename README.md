# TipTap

An endless scroll of AI-generated short titles and text paragraphs, built with **Expo / React Native**. Runs on **Android** and the **web** from a single codebase, with a shared design system so both platforms look and feel the same.

> Status: early preview. The web landing page, the Android bottom tabs, and first-install onboarding are implemented. Firebase (Authentication + Firestore) is not integrated yet — content is static/mock. See [DESIGN.md](DESIGN.md) for the visual system.

## Tech stack

- **Expo SDK 57** with **Expo Router** (file-based routing)
- **React Native 0.86** / **React 19**
- **React Native components** for both web and Android UI (no Compose/native UI dependency)
- **Nativewind** (Tailwind CSS v3) for styling React Native components
- **Zustand** + **AsyncStorage** for global state and persistence
- **`react-native-svg`** for all icons and the shared logo (no XML/VectorDrawable icons)
- **Vanilla JavaScript** (JSX in `.js` files — no TypeScript)
- **ESM** (`"type": "module"`) with ESM config files at the workspace root
- **npm** for dependency management

## Requirements

- Node.js (LTS) and npm
- For Android: Android SDK / `adb`, or an Expo/EAS account for cloud builds

## Getting started

```bash
npm install
npx expo start
```

Then press **`w`** to open the web app or **`a`** to launch on an Android device/emulator.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run start` | Start the Expo dev server |
| `npm run web` | Start the web app |
| `npm run android` | Build and run the native Android app locally (Expo) |
| `npm run android:release` | Build the production Android App Bundle remotely and submit it via EAS |

See [CONTRIBUTING.md](CONTRIBUTING.md) for dependency, lint, and doctor commands.

## Project structure

```
.
├── .env                          # single source of truth: EXPO_PUBLIC_* values
├── app.config.js                 # Expo app config (reads .env via Node)
├── babel.config.js               # Babel (Nativewind)
├── eas.json                      # EAS profiles (production AAB + submit)
├── metro.config.js               # Metro: SVG transformer + Nativewind + .env port
├── package.json                  # npm deps; "type": "module" (ESM)
├── tailwind.config.js            # Nativewind theme + breakpoints (from layout.js)
├── .svgrrc.json                  # SVG → React component config
└── src/
    ├── app/                      # Expo Router routing layer (thin route files)
    │   ├── _layout.js            # web root: shared Root + headerless Stack
    │   ├── _layout.android.js    # Android root: onboarding gate + custom tab bar
    │   ├── index.js              # web landing route
    │   ├── index.android.js      # Android Home route
    │   ├── policy.js             # /policy route (thin bridge)
    │   ├── terms.js              # /terms route (thin bridge)
    │   ├── +html.js              # web document shell (pre-paint theme script)
    │   └── +not-found.js         # 404 route (thin bridge)
    ├── screens/                  # platform screens (not routes)
    │   ├── android/              # home/, onboarding/, profile/
    │   └── web/                  # landing/, policy/, terms/, not-found/
    ├── components/               # icon.js, root.js, toast-host.js, app-tab-bar.js, bottom-sheet.js, ...
    ├── constants/                # colors.js, layout.js, configuration.js
    ├── hooks/                    # use-responsive-layout.js
    ├── store/                    # theme/auth/onboarding/preferences-sync/toast stores (Zustand)
    ├── services/                 # firebase/* (Android-native; web-safe lazy/test-mode)
    ├── stylesheets/global.css    # Tailwind entry + light/dark CSS vars
    └── assets/
        ├── icons/                # icon.svg (logo master), home/person/settings/theme-*.svg
        └── images/icon.png       # launcher icon + favicon (from icon.svg)
```

Layers point in one direction: `src/app` routes → `src/screens` (web/android) → cross-platform modules (`src/components`, `src/constants`, `src/hooks`, `src/store`, `src/assets`, ...). Cross-platform code never imports `src/app/` or `src/screens/`. All filenames use lower-case kebab-case; Expo Router's reserved route names (`index`, `_layout`, `+html`, `+not-found`) are the exception.

SVG assets are the source of truth. Regenerate the launcher/fav icon PNG from `src/assets/icons/icon.svg` after editing the logo:

```bash
rsvg-convert -w 1024 -h 1024 -o src/assets/images/icon.png src/assets/icons/icon.svg
```

## Routing

See [CONTRIBUTING.md](CONTRIBUTING.md#routing-expo-router) and [DESIGN.md](DESIGN.md) for routing and architecture details.

## Configuration

### Environment variables (`.env`)

`.env` at the workspace root is the single source of truth for app configuration; `app.config.js` and `src/constants/configuration.js` read from it (no fallback values — a missing key fails fast with a clear error). The following keys are required:

| Key | Purpose |
| --- | --- |
| `EXPO_PUBLIC_APP_NAME` | App display name — used as the app `name` in `app.config.js` and the `APP_NAME` constant |
| `EXPO_PUBLIC_APP_VERSION` | App version, exposed as the `APP_VERSION` constant |
| `EXPO_PUBLIC_APP_DESCRIPTION` | App description, exposed as the `APP_DESCRIPTION` constant (document meta tag) |
| `EXPO_PUBLIC_APP_MODE` | App mode: `development` (real services, local; default) / `production` (real services, remote) / `test` (mocks served; failure states only) — see `test/services/firebase/` |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project ID — used as `extra.eas.projectId` in `app.config.js` |
| `EXPO_PUBLIC_LANDING_PAGE_SCHEME` | Landing page (web) URL scheme, used in `LANDING_PAGE_URL` |
| `EXPO_PUBLIC_LANDING_PAGE_HOST` | Landing page host (development: `localhost`) |
| `EXPO_PUBLIC_LANDING_PAGE_PORT` | Landing page port — also the dev-server port Metro serves on (`metro.config.js`) |
| `EXPO_PUBLIC_API_ORIGIN` | Public origin of the deployed API-route server (required for native production builds; empty in local development) |
| `EXPO_PUBLIC_ADMOB_ANDROID_APP_ID` | AdMob Android app ID, injected through the config plugin |
| `EXPO_PUBLIC_ADMOB_REWARDED_AD_UNIT_ID` | Rewarded ad unit ID used by the monetization gate |
| `EXPO_PUBLIC_ADMOB_TEST_DEVICE_IDS` | Optional comma-separated hashed test device IDs |

Server-only variables (never exposed to the client): `GOOGLE_SERVICE_ACCOUNT_JSON`, `PLAY_PACKAGE_NAME`, `PREMIUM_PRODUCT_ID`, `ADMOB_S2S_SECRET`. See [Server-authoritative premium & gems](#server-authoritative-premium--gems).

- **`app.config.js`** — app name (from `EXPO_PUBLIC_APP_NAME`), slug, scheme, Android package `dev.yuriusu.tiptap`, web `output: "server"` (required by Expo Router API routes on SDK 57), and plugins (`expo-build-properties` for Android `x86_64`, `expo-router`, `expo-status-bar`, `react-native-google-mobile-ads`, `expo-iap`). Configure native behavior here and via config plugins — do not edit generated `ios/`/`android/` directories.
- **`tailwind.config.js`**, **`metro.config.js`**, **`babel.config.js`**, **`.svgrrc.json`** — workspace-root tooling config. Keep config files out of `src/`.
- **`eas.json`** — EAS `production` build profile (AAB, auto-increment) plus `submit.production`, used by `npm run android:release`.

## Building for Android

```bash
# Local native development build (Expo)
npm run android

# Remote production build + submit (EAS)
npm run android:release
```

Adding a library with native code requires a development build (`npx expo run:android`); it will not work in Expo Go.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) — workflow, conventions, and commit rules
- [DESIGN.md](DESIGN.md) — design tokens, colors, typography, and layout rules
- [AGENTS.md](AGENTS.md) — instructions for AI/automation agents working in this repo

## Notes

- Expo APIs change between SDK releases. Always check the versioned docs for SDK 57: <https://docs.expo.dev/versions/v57.0.0/>.
- This project uses npm (there is no `bun.lock`).

## Firebase setup (planned)

**Scope:** Firebase is used **only on Android** for Google Authentication (no email/password), Firestore (centralized AI-generated content + per-user data), and FCM push notifications. The **web landing stays as-is** (no web Firebase SDK/auth). EAS is used for builds; **Expo Hosting** serves the exported web app together with the Expo Router API routes that implement the server-authoritative premium/gems service.

### Project
- Firebase project: `yuriusu-tiptap`
- Android package: `dev.yuriusu.tiptap` (matches `app.config.js`)
- Enable in Firebase Console: **Authentication → Google**, **Cloud Firestore**, **Cloud Messaging (FCM)**, **Hosting**
- Android Google Sign-In requires SHA-1 fingerprints (debug + Play App Signing) registered for the Android app

### Local config
- Place `google-services.json` at the workspace root (`./google-services.json`). It is referenced by `app.config.js` (`android.googleServicesFile`) via CNG — **never hand-edit generated `android/`/`ios/` dirs**.
- Ensure `google-services.json` is listed in `.gitignore`.
- `.env` is the single source of truth (no fallbacks; missing keys fail fast via lazy runtime validation in `src/constants/configuration.js`, never at import time). Firebase keys:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID`
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Google OAuth web client ID (type 3, from `google-services.json`) for Android Google Sign-In

> Note: Android uses RN Firebase + `google-services.json`; the web landing does not use the Firebase JS SDK.

### Initialize & deploy (planned)
```bash
npm install                         # installs dev deps incl. firebase-tools
npm run firebase:initialize         # initialize Firebase in this project (Hosting/Firestore rules as needed)
npm run web:build                   # export web client + API-route server to dist/
npm run web:serve                   # serve the export locally (including API routes)
npm run server:deploy               # export + deploy to Expo Hosting
```

After adding Firebase native deps/plugins or `google-services.json`, rebuild the Android dev client (`npm run android`) or create a new EAS build.

> **Version constraint:** `@react-native-firebase/*` is pinned to `24.0.0` (Firebase BOM 34.10.0). Newer RNF (≥ 24.1.0: BOM ≥ 34.14.0) ships `firebase-auth` artifacts compiled with Kotlin ≥ 2.3 metadata, and RNF 27 (BOM 35.0.2) uses Kotlin 2.4 metadata — unreadable by the Kotlin 2.1.20 compiler that React Native 0.86 ships (`export-build-properties` `android.kotlinVersion` cannot bump the compiler; Expo's pika compiler plugin has no Kotlin 2.4 build). Revisit when upgrading React Native.

## Server-authoritative premium & gems

Entitlements are **not** trusted from the device. The app reads and writes them only through Expo Router API routes under `src/app/api/**`:

| Route | Purpose |
| --- | --- |
| `GET /api/state` | Authoritative `premium`, `gems`, `bookmarks`, `streak` for the authenticated user |
| `POST /api/premium/verify` | Verifies a Play purchase token with the Google Play Developer API, then writes `premium` server-side |
| `POST /api/gems/reward` | AdMob server-to-server callback; idempotent per transaction, atomically increments gems |
| `POST /api/gems/spend` | Checks the balance, decrements a gem and records the bookmark in one commit |

Every authenticated route verifies the caller's Firebase ID token server-side. The client never sends the desired `premium` or `gems` value. Server helpers live in `src/server/` and are imported only by `+api.js` files, so their secrets are stripped from the client bundle.

### Setup

1. Create a Google Cloud service account with **Firebase Firestore** and **Google Play Android Developer** access. Grant it `Firestore Data Editor` on the Firebase project and `View financial data`/`View subscriptions` in Play Console (with the Play Developer API enabled and the service account linked in Users & permissions).
2. Put the full service-account JSON in `GOOGLE_SERVICE_ACCOUNT_JSON` (server-only). Set `PLAY_PACKAGE_NAME` and `PREMIUM_PRODUCT_ID` if they differ from the defaults.
3. Set `ADMOB_S2S_SECRET` and configure the AdMob rewarded ad's **server-side verification callback** URL to `https://<your-api-origin>/api/gems/reward`, with reward amount `1`. The callback must carry the user's Firebase UID as `user_id` (set the rewarded request user ID to the UID).
4. Deploy the server with `npx expo export -p web` followed by `eas deploy` (or `npx expo serve` locally), then set `EXPO_PUBLIC_API_ORIGIN` to the deployed origin for native builds. In local development, relative `/api/...` requests work automatically.

Test mode (`EXPO_PUBLIC_APP_MODE=test`) serves local mocks for both the API client and Firestore services, including a simulated reward callback — no server or credentials required.

## Milestones

- [x] Web landing page (`/`) + 404 page (`+not-found`), statically rendered
- [x] Web legal pages: Policy (`/policy`) and Terms (`/terms`) linked from the landing and Android Profile
- [x] Android shell: Home/Profile tabs, first-install onboarding, theme preference
- [x] Theme system: Auto/Light/Dark, persisted to AsyncStorage, pre-paint anti-flicker script
- [x] Design system: gray palette (cyan primary, red secondary), Nativewind, SVG icons
- [x] `.env`-driven configuration (`EXPO_PUBLIC_*` via `configuration.js`, `app.config.js`, Metro port)
- [x] EAS `production` profile (AAB + auto-increment) and submit config
- [x] Firebase project wiring (project `yuriusu-tiptap`, Android `dev.yuriusu.tiptap`, `google-services.json` gitignored)
- [x] SSR-safe env/config foundation (no import-time throw) for Firebase keys in `.env` / `configuration.js`
- [x] Android Authentication — Google OAuth only (RN Firebase Auth + Google Sign-In; no email/password, no web auth)
- [x] Firestore — centralized AI-generated `content` feed (random token + wrap-around, paginated) and per-user `users/{uid}` data synced
- [x] Preferences sync — stored locally (AsyncStorage) and in Firestore per user when signed in
- [ ] Push notifications (FCM) — new-content heads-up on Android; FCM token registered per user/device
- [x] Server deployment — Expo Hosting serves the exported web app and the API routes (Firebase Hosting cannot run Expo Router API routes)
- [ ] Cloud Function / admin sender — trigger FCM on new `content` (planned; separate from client wiring)
- [ ] GitHub Actions workflows — auto-added by Firebase init; removed for now, revisit later
- [ ] ESLint — not configured (`npx expo lint` is currently a no-op)
- [x] Real content feed — vertical paged Discover feed with animated fact cards, on-demand Firestore loading and pull-to-refresh
- [x] Fact details, bookmarks, streak, gems and premium — mirrored from the Flutter app with Reanimated shared-axis/fade transitions
- [x] Server-to-server premium/gems via Expo Router API routes (Play Developer API verification + AdMob S2S reward callback)
- [ ] iOS production profile in `eas.json` — not configured
- [ ] Tests — none exist yet

### Known issues & fixes

- [x] White→dark theme flash on web reload — fixed via a pre-paint theme script
- [x] Onboarding black screen (hydrated mutation never notified React) — fixed via `setState`
- [x] Platform-only `*.android.js` fallback error — fixed by using internal tabs instead of file-based Tabs
- [x] Feature files exposed as routes — fixed by keeping `src/app/` to root route files and placing screens under `src/screens/` (outside `src/app/`)
- [x] `configuration.js` threw at import time in SSR contexts (e.g. router-server render) — fixed with lazy runtime validation (`requireFirebaseConfig`) instead of an import-time throw
- [ ] About row opens `localhost` landing URL — needs an emulator-friendly host during development
- [ ] `react-native` is `0.86.0` while the SDK expects `0.86.3` — run `npx expo install --fix`
