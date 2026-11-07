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
  app/                        # Expo Router routes only (thin route files)
    _layout.js                # web root: root providers + headerless Stack
    _layout.android.js        # Android root: root providers + file-based Tabs
    index.js                  # web landing route
    index.android.js          # Android Home tab route
    profile.js                # web fallback for the Android-only Profile route (redirects home)
    profile.android.js        # Android Profile tab route
    +html.js                  # web document shell
    +not-found.js             # 404 route
  screens/                    # screen bodies rendered by routes (Option B)
    landing/                  # web landing (index.js)
    home/                     # Android Home tab (index.js)
    profile/                  # Android Profile tab (index.js + private profile-preferences.js)
  components/                 # reusable UI, one named export each
    icon.js                   # generic SVG icon wrapper
    app-logo.js               # Tiptap logo (mirrors assets/icons/icon.svg)
    app-tab-bar.js            # Android React Native bottom tab bar (Android layout only)
  hooks/                      # reusable hooks (use-responsive-layout.js)
  providers/                  # root providers (global styles, theme hydration, color scheme)
  store/                      # Zustand stores (theme-store.js)
  assets/
    icons/icon.svg            # project logo (master source)
    icons/home.svg            # Home tab icon
    icons/person.svg          # Profile tab icon
    images/icon.png           # Android launcher icon + web favicon source (exported from icons/icon.svg)
  styles/global.css           # Tailwind entry + light/dark CSS variables
  theme/
    colors.js                 # design tokens (dark + light palettes)
    layout.js                 # responsive breakpoints, 1920px cap, per-class layout tokens
.svgrrc.json                  # SVGR config (workspace root)
tailwind.config.js            # Nativewind/Tailwind theme (semantic CSS-variable colors)
metro.config.js               # Metro + SVG transformer + Nativewind
babel.config.js               # Babel + Nativewind
```

Follows the Expo `expo-project-structure` skill (Option B), adapted for vanilla JS and Nativewind: `src/app` is routes-only, screens live in `screens/`, reusable UI in `components/`, and `hooks`/`providers`/`store`/`theme` sit alongside. `app -> screens/components -> hooks/store/theme`; screens and components never import from `src/app/`. `src/utils/` and `src/server/` + `src/app/api/` are reserved for when the first helper / API route lands. Non-route code lives **outside** `src/app/`. All filenames use lower-case kebab-case; Expo Router's reserved route names (`index`, `_layout`, `+html`, `+not-found`) are the exception.

SVG assets are the source of truth. Regenerate the launcher/fav icon PNG from `src/assets/icons/icon.svg` after editing the logo:

```bash
rsvg-convert -w 1024 -h 1024 -o src/assets/images/icon.png src/assets/icons/icon.svg
```

## Platform routes

Expo Router resolves routes by platform using file extensions:

| Extension | Loads on |
| --- | --- |
| `*.android.js` | Android only |
| `*.js` | Web and any platform without a specific route |

Routes live in **`src/app/`** — Expo Router auto-detects `src/app/` before a root `app/`, so do not create a root `app/` directory.

Platform routes need a plain `.js` sibling for static web rendering. The app uses `index.js` (web landing screen) + `index.android.js` (Android Home screen), `profile.js` (web redirect) + `profile.android.js` (Android Profile screen), and `_layout.js` (web stack) + `_layout.android.js` (Android tabs). Android tab navigation is file-based: `_layout.android.js` renders Expo Router `Tabs`, and each tab is its own route file that re-exports its screen from `src/screens/`.

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
