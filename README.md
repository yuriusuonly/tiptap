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
    │   ├── +html.js              # web document shell (pre-paint theme script)
    │   └── +not-found.js         # 404 route (thin bridge to web/features/not-found)
    ├── web/                      # web-only features (not routes)
    │   └── features/
    │       ├── landing/          # landing-screen.js
    │       └── not-found/        # not-found-screen.js
    ├── android/                  # Android-only UI (not routes)
    │   ├── components/           # app-tab-bar.js (React Native tab bar)
    │   └── features/
    │       ├── home/             # home-screen.js
    │       ├── onboarding/       # onboarding-screen.js (first install, 3 pages)
    │       └── profile/          # profile-screen.js, profile-preferences.js
    └── shared/                   # cross-platform code (no platform imports)
        ├── components/           # icon.js (SVG wrapper), root.js (providers)
        ├── constants/            # colors.js, layout.js, configuration.js
        ├── hooks/                # use-responsive-layout.js
        ├── store/                # theme-store.js, onboarding-store.js (Zustand)
        ├── stylesheets/global.css # Tailwind entry + light/dark CSS vars
        └── assets/
            ├── icons/            # icon.svg (logo master), home.svg, person.svg,
            │                     # theme-auto.svg, theme-dark.svg, theme-light.svg
            └── images/icon.png   # launcher icon + favicon (from icon.svg)
```

Layers point in one direction: `src/app` routes → `src/web` / `src/android` features → `src/shared`. Shared code never imports platform features or routes. All filenames use lower-case kebab-case; Expo Router's reserved route names (`index`, `_layout`, `+html`, `+not-found`) are the exception.

SVG assets are the source of truth. Regenerate the launcher/fav icon PNG from `src/shared/assets/icons/icon.svg` after editing the logo:

```bash
rsvg-convert -w 1024 -h 1024 -o src/shared/assets/images/icon.png src/shared/assets/icons/icon.svg
```

## Routing

See [CONTRIBUTING.md](CONTRIBUTING.md#routing-expo-router) and [DESIGN.md](DESIGN.md) for routing and architecture details.

## Configuration

### Environment variables (`.env`)

`.env` at the workspace root is the single source of truth for app configuration; `app.config.js` and `src/shared/constants/configuration.js` read from it (no fallback values — a missing key fails fast with a clear error). The following keys are required:

| Key | Purpose |
| --- | --- |
| `EXPO_PUBLIC_APP_NAME` | App display name — used as the app `name` in `app.config.js` and the `APP_NAME` constant |
| `EXPO_PUBLIC_APP_VERSION` | App version, exposed as the `APP_VERSION` constant |
| `EXPO_PUBLIC_APP_DESCRIPTION` | App description, exposed as the `APP_DESCRIPTION` constant (document meta tag) |
| `EXPO_PUBLIC_EAS_PROJECT_ID` | EAS project ID — used as `extra.eas.projectId` in `app.config.js` |
| `EXPO_PUBLIC_LANDING_PAGE_SCHEME` | Landing page (web) URL scheme, used in `LANDING_PAGE_URL` |
| `EXPO_PUBLIC_LANDING_PAGE_HOST` | Landing page host (development: `localhost`) |
| `EXPO_PUBLIC_LANDING_PAGE_PORT` | Landing page port — also the dev-server port Metro serves on (`metro.config.js`) |

- **`app.config.js`** — app name (from `EXPO_PUBLIC_APP_NAME`), slug, scheme, Android package `dev.yuriusu.tiptap`, web `output: "static"`, and plugins (`expo-build-properties` for the Android `x86_64` build arch, `expo-router`, `expo-status-bar`). Configure native behavior here and via config plugins — do not edit generated `ios/`/`android/` directories.
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

## Milestones

### Implemented

- [x] Web landing page (`/`) + 404 page (`+not-found`), statically rendered
- [x] Android shell: Home/Profile tabs, first-install onboarding, theme preference
- [x] Theme system: Auto/Light/Dark, persisted to AsyncStorage, pre-paint anti-flicker script
- [x] Design system: gray palette (cyan primary, red secondary), Nativewind, SVG icons
- [x] `.env`-driven configuration (`EXPO_PUBLIC_*` via `configuration.js`, `app.config.js`, Metro port)
- [x] EAS `production` profile (AAB + auto-increment) and submit config

### Not implemented

- [ ] Firebase (Authentication + Firestore) — not integrated; content is static/mock
- [ ] ESLint — not configured (`npx expo lint` is currently a no-op)
- [ ] Real content feed — Home is a static placeholder; no data layer yet
- [ ] OTA updates and iOS production profile `eas.json` — not configured
- [ ] Tests — none exist yet

### Known issues & fixes

- [x] White→dark theme flash on web reload — fixed via a pre-paint theme script
- [x] Onboarding black screen (hydrated mutation never notified React) — fixed via `setState`
- [x] Platform-only `*.android.js` fallback error — fixed by using internal tabs instead of file-based Tabs
- [x] Feature files exposed as routes — fixed by moving `src/web/` and `src/android/` outside `src/app/`
- [ ] About row opens `localhost` landing URL — needs an emulator-friendly host during development
- [ ] `react-native` is `0.86.0` while the SDK expects `0.86.3` — run `npx expo install --fix`
