This is an Expo/React Native app (Expo SDK 57) targeting **Android** and **Web**. Prioritize mobile-first patterns and cross-platform consistency.

**Before implementing anything, read [README.md](README.md) `## Milestones`.** The Implemented / Not implemented / Known issues & fixes checklists are the project's state of record — check what already exists before building it. Do not re-implement work listed as implemented; check the Known issues & fixes list first so you don't reintroduce a fixed bug.

## Do not trust your training data

Expo ships breaking changes every SDK release. Before writing code that touches an Expo, EAS, or React Native API:

1. Read the `expo` version in `package.json` (currently SDK 57).
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v57.0.0/`
3. For anything else, fetch `https://docs.expo.dev/llms.txt` — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links; never answer from memory.

## Commands (npm, not Bun)

This repo uses npm (`package-lock.json`); there is no `bun.lock`. Use `npx`, not `bunx`.

```bash
npm install                            # install deps
npx expo install <package>            # ALWAYS use for Expo/RN deps — resolves SDK-compatible versions
npx expo start                        # dev server (press w = web, a = Android)
npx expo lint                         # lint (see note below)
npx expo-doctor                       # diagnose dependency/config issues
npx expo install --fix                # fix incompatible package versions
```

- `npx expo lint` is **not yet configured** (no ESLint dependency installed). Set it up before relying on it.
- Do not run `npm install <expo-or-rn-package>` directly; use `npx expo install`.

Useful npm scripts from `package.json`:

```bash
npm run start                         # expo start
npm run web                           # expo start --web
npm run android                       # native dev build on device/emulator
npm run android:release               # remote production AAB + submit (EAS)
```

## Architecture (layered, platform-separated)

- `src/app/` — **file-based routing only** (six root files: `index.js`, `index.android.js`, `_layout.js`, `_layout.android.js`, `+html.js`, `+not-found.js`). Platform screens live **outside** `src/app/` under `src/screens/web/` and `src/screens/android/` so they are not routes.
- Cross-platform modules live at the `src/` root: `src/components/`, `src/constants/`, `src/hooks/`, `src/store/`, `src/stylesheets/`, `src/assets/`.
- `src/services/` — Firebase/API/ads/IAP adapters. Keep it free of UI imports.
- `src/app/api/**` — **Expo Router API routes** (`+api.js`) are the one exception to "no feature files under `src/app/`". They implement the server-authoritative premium/gems service. `src/server/` holds their helpers (Firestore REST, Google/Play auth, HTTP utilities) and must be imported ONLY from `+api.js` files so secrets are stripped from the client bundle.
- Dependency direction: `app routes -> src/screens (web/android) -> cross-platform modules`. Cross-platform code must never import from `src/app/` or `src/screens/`. See README.md (Project structure) and CONTRIBUTING.md (Architecture).

## Routing (Expo Router)

- Routes live in **`src/app/`** (root route files plus `api/**` API routes). Never create a bare `*.android.js` route without a plain `.js` fallback sibling — it throws (`does not have a fallback sibling`). API route files may not use platform extensions.
- Android Home/Profile tabs are internal state in the Android layout (`index` via `Slot`, Profile via direct import), not file-based routes. Web `/profile` has no route and renders `+not-found.js` with a 404 status.
- Import navigation APIs (`Link`, `router`, `useLocalSearchParams`, `Redirect`) from `expo-router`. See CONTRIBUTING.md (Routing).

## File naming

- Use **lower-case kebab-case** for every file and directory (`icon.js`, `home.svg`, `index.android.js`).
- Expo Router reserved route names are the only exception: `index`, `_layout`, `+html`, `+not-found`.
- Configuration files live at the workspace root (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `.svgrrc.json`), never under `src/`.
- Keep JavaScript identifiers/components PascalCase (`Icon`); only filenames are kebab-case.

## Code conventions

- **Vanilla JavaScript only.** JSX in `.js` files. Do not introduce TypeScript, `.ts`/`.tsx`, or a `tsconfig.json`.
- The package is **ESM** (`"type": "module"`). Config files (`babel.config.js`, `metro.config.js`, `tailwind.config.js`) use `import`/`export default`. CommonJS-only package subpaths are bridged with `createRequire(import.meta.url)`.
- **SVG only — never XML icons.** SVG files under `src/assets/icons/` are imported as React components via `react-native-svg-transformer` (configured in `metro.config.js`) and rendered with `react-native-svg`. Pass a `color` prop to tint a `fill="currentColor"` icon.
- Use the shared `src/components/icon.js` wrapper to render SVG icons consistently across platforms: `<Icon as={SvgComponent} size={24} color={...} accessibilityLabel="..." />`. `src/assets/icons/*.svg` files are the source of truth for icons — import SVGs (e.g. `home.svg`/`person.svg` and the brand logo `icon.svg`) directly and render via `Icon` (pass `color` only for tintable `fill="currentColor"` icons). `src/assets/icons/icon.svg` remains the master for derived PNG assets.
- Style React Native components with **Nativewind** `className` utilities (Tailwind v3 config in `tailwind.config.js`; `src/stylesheets/global.css` is imported by `src/components/root.js`). **Do not use inline `style` objects for presentation** except where an Expo UI component requires its `style`/`textStyle` prop. Semantic colors come from CSS variables in `global.css` and switch with the `dark` class (driven by the theme store).
- The palette is an exact port of Flutter's `ColorScheme.fromSeed(seedColor: Colors.blueGrey)`: source tokens in `src/constants/material-theme.js`, aliases in `src/constants/colors.js`, CSS variables in `global.css`, Tailwind roles in `tailwind.config.js`. Keep these in sync with `main/lib/app/services/theme.dart`.
- All text uses the **Outfit** font (Google Fonts), loaded in `src/components/root.js` and applied through `src/components/text.js`. Use `Text`/`AppText` from there instead of raw React Native `Text`.
- Interactive native controls use **Expo UI** (`@expo/ui`) through `src/components/ui/`: `NativeButton`, `NativeText`, `NativeCard`. Each adapter wraps a `Host` seeded with the same #607D8B Material 3 seed. Use these for buttons and prominent text; keep Reanimated/animated content in React Native. Do not use Expo UI for navigation (see below).
- Global client state uses **Zustand** stores in `src/store/`. Persist with `zustand/middleware` + AsyncStorage and `skipHydration: true`, then call `store.persist.rehydrate()` in `src/components/root.js` so static web rendering never touches `localStorage`.
- The Android bottom navigation is a **React Native** tab bar (`src/components/app-tab-bar.js`) rendered by `src/app/_layout.android.js` with internal `home`/`profile` state. The `Pressable` tab item is the only touch target; icons and the selection indicator use `pointerEvents="none"` so taps are never intercepted or propagated. Do **not** reintroduce `@expo/ui`/Jetpack Compose navigation or VectorDrawable XML assets.
- App icons: `app.config.js` points at `src/assets/images/icon.png` (top-level and `android.icon`), which is exported from the master `src/assets/icons/icon.svg` at 1024×1024 (Expo only accepts PNG launcher icons). The web favicon is configured via `app.config.js` `web.favicon` (`./src/assets/images/icon.png`).
- The web landing is statically rendered. `useWindowDimensions()` is 0 during SSG, so gate responsive branches behind a `mounted` flag (`src/screens/web/landing/landing-screen.js`); otherwise hydration mismatches leave the mobile layout on desktop.

## Build & test

Verify changes with the checks in CONTRIBUTING.md (Verification). If a change requires device/emulator interaction (e.g. native touch behavior), verify what you can statically and via export/build, and report any runtime verification that still needs manual confirmation.

**Always commit after every implementation** — see CONTRIBUTING.md (Commit & PR conventions): small, specific commits, merging related subsequent work where possible.

## Native directories

`ios/` and `android/` are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.config.js` and config plugins. After adding a library with native code, the app needs a development build (`npx expo run:android`), not Expo Go.

## EAS

Build config is in `eas.json`: `production` → AAB + auto-increment, with `submit.production` used by `npm run android:release`. Run EAS as `npx eas-cli@latest <command>`. Docs: `https://docs.expo.dev/eas/index.md`.
