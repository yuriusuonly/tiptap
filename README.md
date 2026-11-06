# Tiptap

An AI-generated, TikTok-like app built with **Expo / React Native**. Runs on **Android** and the **web** from a single codebase, with a shared design system so both platforms look and feel the same.

> Status: early preview. The web landing page and the Android bottom-tab shell are implemented. Firebase (Authentication + Firestore) is not integrated yet — content is static/mock. See [DESIGN.md](DESIGN.md) for the visual system.

## Tech stack

- **Expo SDK 57** with **Expo Router** (file-based routing)
- **React Native 0.86** / **React 19**
- **`@expo/ui` (Jetpack Compose)** for the Android navigation shell
- **`react-native-svg`** for the shared logo
- **Vanilla JavaScript** (JSX in `.js` files — no TypeScript)
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
| `npm run expo:start` | Start the dev server (`expo start --clear`) |
| `npm run expo:install` | Install an SDK-compatible package (`expo install`) |
| `npm run expo:export` | Export static web build to `build/web` |
| `npm run expo:serve` | Serve the exported web build |
| `npm run eas:build:development` | Build a local Android APK (`build/android/app.apk`) |
| `npm run eas:build:production` | Build a production Android App Bundle via EAS |
| `npm run adb:install` | Install the built APK on a connected device |

### Common Expo commands

```bash
npx expo install <package>   # add an Expo/RN dependency (SDK-compatible)
npx expo lint                # lint (ESLint not configured yet)
npx expo-doctor              # diagnose dependency/config issues
npx expo install --fix       # fix incompatible package versions
```

## Project structure

```
src/
  app/                  # Expo Router routes — every file is a screen
    _layout.js          # root navigator (Stack)
    index.js            # platform-less fallback (required by static web rendering)
    index.web.js        # web landing page
    index.android.js    # Android bottom-tab app
    +html.js            # web document shell
    +not-found.js       # 404 route
  assets/
    svg/icon.svg        # project logo
    android/home.xml    # Android vector icon (Home tab)
    android/person.xml  # Android vector icon (Profile tab)
  components/
    logo.js             # shared logo component (react-native-svg)
  theme/
    colors.js           # shared design tokens
```

Non-route code (components, hooks, utilities, theme) lives **outside** `src/app/`. All filenames use lower-case kebab-case; Expo Router's reserved route names (`index`, `_layout`, `+html`, `+not-found`) are the exception.

## Platform-specific routes

Expo Router resolves routes by platform using file extensions:

| Extension | Loads on |
| --- | --- |
| `*.web.js` | Web only |
| `*.android.js` | Android only |
| `*.js` | Shared across platforms |

Routes live in **`src/app/`** — Expo Router auto-detects `src/app/` before a root `app/`, so do not create a root `app/` directory.

Expo Router's static web renderer requires a platform-less fallback next to a platform route, so `src/app/index.js` re-exports `index.web.js`. Keep that file.

## Configuration

- **`app.json`** — app name/slug, Android package `dev.yuriusu.tiptap`, web `output: "static"`, and plugins (`expo-build-properties` for the Android `x86_64` build arch, `expo-router`, `expo-status-bar`). Configure native behavior here and via config plugins — do not edit generated `ios/`/`android/` directories.
- **`eas.json`** — EAS build profiles: `development` (APK, internal distribution) and `production` (AAB, auto-increment).

## Building for Android

```bash
# Local development APK
npm run eas:build:development
npm run adb:install

# Cloud production build
npm run eas:build:production
```

Adding a library with native code requires a development build (`npx expo run:android` or `eas build --profile development`); it will not work in Expo Go.

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) — workflow, conventions, and commit rules
- [DESIGN.md](DESIGN.md) — design tokens, colors, typography, and layout rules
- [AGENTS.md](AGENTS.md) — instructions for AI/automation agents working in this repo

## Notes

- Expo APIs change between SDK releases. Always check the versioned docs for SDK 57: <https://docs.expo.dev/versions/v57.0.0/>.
- This project uses npm (there is no `bun.lock`).
