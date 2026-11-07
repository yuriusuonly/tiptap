# Tiptap

An AI-generated, TikTok-like app built with **Expo / React Native**. Runs on **Android** and the **web** from a single codebase, with a shared design system so both platforms look and feel the same.

> Status: early preview. The web landing page and the Android bottom-tab shell are implemented. Firebase (Authentication + Firestore) is not integrated yet — content is static/mock. See [DESIGN.md](DESIGN.md) for the visual system.

## Tech stack

- **Expo SDK 57** with **Expo Router** (file-based routing, including Android tabs)
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
  app/                        # Expo Router routing layer (thin route files)
    _layout.js                # web root: shared providers + headerless Stack
    _layout.android.js        # Android root: shared providers + custom tab bar
    index.js                  # web landing route
    index.android.js          # Android Home route
    +html.js                  # web document shell
    +not-found.js             # 404 route (thin bridge to web/features/not-found)
  web/
    features/landing/         # web-only landing screen
    features/not-found/       # web-only 404 screen
  android/
    components/               # Android-only UI (React Native tab bar)
    features/home/            # Android Home tab content
    features/profile/         # Android Profile tab content + theme preference
  shared/
    components/               # cross-platform UI (icon.js, root.js)
    hooks/                    # cross-platform hooks (responsive layout)
    store/                    # Zustand stores (theme)
    constants/
      colors.js               # design tokens (dark + light palettes)
      layout.js               # responsive breakpoints, 1920px cap, per-class layout tokens
    stylesheets/global.css    # Tailwind entry + light/dark CSS variables
    assets/
      icons/icon.svg          # project logo (master source)
      icons/home.svg          # Home tab icon
      icons/person.svg        # Profile tab icon
      images/icon.png         # Android launcher icon + web favicon source (exported from icons/icon.svg)
.svgrrc.json                  # SVGR config (workspace root)
tailwind.config.js            # Nativewind/Tailwind theme (semantic CSS-variable colors)
metro.config.js               # Metro + SVG transformer + Nativewind
babel.config.js               # Babel + Nativewind
```

Layers point in one direction: `src/app` routes → `src/web` / `src/android` features → `src/shared`. Shared code never imports platform features or routes. All filenames use lower-case kebab-case; Expo Router's reserved route names (`index`, `_layout`, `+html`, `+not-found`) are the exception.

SVG assets are the source of truth. Regenerate the launcher/fav icon PNG from `src/shared/assets/icons/icon.svg` after editing the logo:

```bash
rsvg-convert -w 1024 -h 1024 -o src/shared/assets/images/icon.png src/shared/assets/icons/icon.svg
```

## Platform routes

Expo Router resolves routes by platform using file extensions:

| Extension | Loads on |
| --- | --- |
| `*.android.js` | Android only |
| `*.js` | Web and any platform without a specific route |

Routes live in **`src/app/`** — Expo Router auto-detects `src/app/` before a root `app/`, so do not create a root `app/` directory.

Shared routes use a plain `.js` sibling (`index.js` + `index.android.js`, `_layout.js` + `_layout.android.js`). `src/app/` holds only those six root files; `src/web/` and `src/android/` sit outside so their files are not routes. The Android Home/Profile tabs are internal state in `_layout.android.js` (`index` via `Slot`, Profile via direct import), not file-based routes. Web `/profile` is unmatched so it renders `+not-found.js` with a 404 status.

## Configuration

- **`app.json`** — app name/slug, Android package `dev.yuriusu.tiptap`, web `output: "static"`, and plugins (`expo-build-properties` for the Android `x86_64` build arch, `expo-router`, `expo-status-bar`). Configure native behavior here and via config plugins — do not edit generated `ios/`/`android/` directories.
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
