# Contributing

Thanks for contributing to **Tiptap** — an AI-generated, TikTok-like app built with Expo/React Native for Android and the web. This document covers the conventions and workflow to follow.

## Prerequisites

- **Node.js** (LTS) and **npm** — this repo uses npm (`package-lock.json`), not Bun or Yarn.
- **Expo CLI** via `npx` (no global install required).
- For Android builds: Android SDK / `adb`, or an **EAS** account for cloud builds.

## Setup

```bash
npm install
npx expo start        # then press w (web) or a (Android)
```

Use `npx expo install <package>` — never `npm install <package>` — when adding Expo or React Native dependencies so versions stay SDK-compatible.

## Project structure

```
src/
  app/                    # Expo Router routes (every file is a screen)
    _layout.js            # root navigator
    index.js              # platform-less fallback (required by static web rendering)
    index.web.js          # web landing page
    index.android.js      # Android bottom-tab app
    +html.js              # web document shell
    +not-found.js         # 404 route
  assets/
    svg/icon.svg          # project logo
    android/home.xml      # Android vector icon (Home tab)
    android/person.xml    # Android vector icon (Profile tab)
  components/
    logo.js               # shared logo component
  store/
    theme-store.js        # Zustand theme store (persisted with AsyncStorage)
  styles/
    global.css            # Tailwind entry imported by src/app/_layout.js
  theme/
    colors.js             # shared design tokens (dark + light palettes)
tailwind.config.js        # Nativewind/Tailwind theme (mirrors design tokens)
```

Keep non-route code (components, hooks, utilities, theme) **outside** `src/app/`.

## Conventions

### File naming

- All files and directories use **lower-case kebab-case**: `logo.js`, `home.xml`, `index.web.js`.
- Expo Router reserves a few route file names — use them as-is: `index`, `_layout`, `+html`, `+not-found`, `+middleware`.
- Platform suffixes stay lower-case and come last: `index.web.js`, `index.android.js`.
- JavaScript identifiers (components, exports) stay PascalCase — e.g. `export default function Logo()` in `logo.js`. Only the **filename** is kebab-case.

### Routing (Expo Router)

- Routes live in `src/app/`. Expo Router auto-detects `src/app/` before a root `app/` — do not create a root `app/`.
- Split platform-specific routes with file extensions:
  - `*.web.js` — web only
  - `*.android.js` — Android only
  - `*.js` — shared across platforms
- `_layout.js` (or `_layout.<platform>.js`) files define navigators.
- Static web rendering needs a platform-less fallback next to a platform route. `src/app/index.js` re-exports `index.web.js` for this reason — keep it.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.

### Language & styling

- **Vanilla JavaScript only** — JSX in `.js` files. No TypeScript, no `.ts`/`.tsx`, no `tsconfig.json`.
- Style React Native components with **Nativewind** `className` utilities (Tailwind v3). Config lives in `tailwind.config.js`; `src/styles/global.css` is imported in `src/app/_layout.js`.
- `@expo/ui/jetpack-compose` components are Compose-native and do not accept `className` — style them with `src/theme/colors.js` tokens, `StyleSheet`, and Compose modifiers.
- The Android shell uses `@expo/ui/jetpack-compose`; the web shell uses React Native Web. Keep vocabulary, colors, and layout rules shared.
- Global state lives in **Zustand** stores under `src/store/`. Persist with AsyncStorage (`skipHydration: true` + `rehydrate()` in an effect) so static web rendering stays `window`-free.
- The logo renders through `react-native-svg` in `src/components/logo.js` so it looks identical on web and Android.
- Use the shared design tokens in `src/theme/colors.js` instead of hard-coded values. See `DESIGN.md`.

### Expo & native code

- Check the versioned Expo docs for SDK 57 (`https://docs.expo.dev/versions/v57.0.0/`) before using an Expo/EAS/RN API — APIs change between SDK releases.
- `ios/` and `android/` are generated (Continuous Native Generation). **Never create or edit them by hand** — configure native behavior in `app.json` and config plugins.
- Adding a library with native code requires a development build (`npx expo run:android` or `eas build --profile development`); Expo Go will not include it.

### Firebase

Firebase (Authentication + Firestore) is **not integrated yet**. Keep features static/mock until it is added.

## Verification

Run lint before declaring work done:

```bash
npx expo lint
```

> `expo lint` is not configured yet (no ESLint dependency). Set it up first if you need it; otherwise verify manually and keep the code consistent with existing style.

Until lint is configured, verify both bundles compile:

```bash
npx expo export --platform web       # static web build + route rendering
npx expo export --platform android   # Android JS bundle + XML assets
```

## Commit & PR conventions

Commits use a **bracketed type prefix** followed by a short, imperative summary:

```
(feature) add web landing page and Android tab shell
(chore) configure ESLint
(fix) keep desktop layout after hydration
(refactor) extract shared logo component
(style) restyle the 404 page
```

| Prefix | Use for |
| --- | --- |
| `(feature)` | Newly added features |
| `(chore)` | Configuration, cleanups, upgrades, dependency bumps |
| `(fix)` | Bug fixes and hot fixes |
| `(refactor)` | Code refactors and optimizations |
| `(style)` | UI/UX changes |
| `(format)` | Code formatting, lint fixes, and whitespace-only changes |

- Keep the subject line short and imperative; add a body when the change needs context.
- `(style)` means **UI/UX**; use `(format)` for code formatting such as Prettier or lint autofixes.
- Keep PRs focused and small; describe the change and how it was verified (platforms tested: web / Android).
- Reference related issues in the PR description.

## Don't

- Don't add TypeScript.
- Don't use PascalCase filenames or spaces in filenames — use lower-case kebab-case.
- Don't run `npm install <expo-or-rn-package>` directly (use `npx expo install`).
- Don't create a root `app/` directory.
- Don't hand-edit generated native directories.
- Don't commit secrets or `.env*.local` files.
