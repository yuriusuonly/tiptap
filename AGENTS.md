This is an Expo/React Native app (Expo SDK 57) targeting **Android** and **Web**. Prioritize mobile-first patterns and cross-platform consistency. Firebase is not integrated yet — keep content static/mock.

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

## Routing (Expo Router)

- Routes live in **`src/app/`**. Expo Router auto-detects `src/app/` before a root `app/` directory — do not create a root `app/`.
- Split platform-specific routes by extension: `*.web.js` (web only), `*.android.js` (Android only), plain `*.js` (shared).
- Every file in `src/app/` is a screen; `_layout.js` / `_layout.<platform>.js` define navigators.
- Keep non-route code (components, hooks, utils, theme) **outside** `src/app/`.
- Web-only wrappers: `src/app/+html.js` (document shell) and `src/app/+not-found.js` (404).
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- UI entrypoints: `src/app/index.web.js` is the web landing page; `src/app/index.android.js` is the Android bottom-tab shell. `src/app/index.js` is a thin re-export fallback required by static web rendering — keep it.
- Expo Router static web rendering requires a platform-less sibling for a platform route: `index.web.js` needs `index.js`. Do not delete the fallback.

## File naming

- Use **lower-case kebab-case** for every file and directory (`icon.js`, `home.svg`, `index.web.js`).
- Expo Router reserved route names are the only exception: `index`, `_layout`, `+html`, `+not-found`.
- Keep JavaScript identifiers/components PascalCase (`Icon`); only filenames are kebab-case.

## Code conventions

- **Vanilla JavaScript only.** JSX in `.js` files. Do not introduce TypeScript, `.ts`/`.tsx`, or a `tsconfig.json`.
- The package is **ESM** (`"type": "module"`). Config files (`babel.config.js`, `metro.config.js`, `tailwind.config.js`) use `import`/`export default`. CommonJS-only package subpaths are bridged with `createRequire(import.meta.url)`.
- SVG files under `src/assets/icons/` are imported as React components via `react-native-svg-transformer` (configured in `metro.config.js`) and rendered with `react-native-svg`. Pass a `color` prop to tint a `fill="currentColor"` icon.
- Use the shared `src/components/icon.js` wrapper to render SVG icons consistently across platforms: `<Icon as={SvgComponent} size={24} color={...} accessibilityLabel="..." />`. `src/assets/icons/*.svg` files are the source of truth for icons — import simple/tintable SVGs (e.g. `home.svg`/`person.svg`) directly and render via `Icon`. The brand logo is rendered by `src/components/app-logo.js` (a `react-native-svg` component mirroring the master `src/assets/icons/icon.svg`, which remains the source for derived PNG assets) for reliable cross-platform rendering of its gradient.
- Style React Native components with **Nativewind** `className` utilities (Tailwind v3 config in `tailwind.config.js`; `src/styles/global.css` is imported in `src/app/_layout.js`). Shared tokens still live in `src/theme/colors.js` and are mirrored in the Tailwind theme.
- Responsive breakpoints and per-class layout tokens live in `src/theme/layout.js`; use `src/hooks/use-responsive-layout.js` (`useResponsiveLayout`) for the four classes: Wearable `<480`, Phone `480–719`, Tablet `720–1079`, Desktop `>=1080`. Content is capped at `1920px`. On web, pass `{enabled: mounted}` so static rendering starts on the wearable class. See `DESIGN.md`.
- `@expo/ui/jetpack-compose` components are Compose-native and **do not accept `className`** — keep styling those with `src/theme/colors.js` tokens, `StyleSheet`, and Compose modifiers.
- Global client state uses **Zustand** stores in `src/store/`. Persist with `zustand/middleware` + AsyncStorage and `skipHydration: true`, then call `store.persist.rehydrate()` in an effect so static web rendering never touches `localStorage`.
- Icons are SVG files in `src/assets/icons/`, rendered with `react-native-svg` on both platforms. Use `src/components/icon.js` as the shared wrapper for SVG icon components (`as`, `size`, `accessibilityLabel`; `color` for `currentColor` icons). Simple icons (e.g. `home.svg`, `person.svg`) are imported directly via `react-native-svg-transformer`; the complex gradient logo uses `src/components/app-logo.js` (mirroring `src/assets/icons/icon.svg`). The Android bottom navigation (`@expo/ui/jetpack-compose` `NavigationBarItem`) uses Compose `Icon` with derived Android VectorDrawable XML assets (`src/assets/icons/home.xml`, `person.xml`, loaded via `require`) so icons render natively in-place and do not intercept taps (hosting RN views via `RNHostView` in that slot can block clicks). Keep the SVG files as masters and update derived XMLs if the SVGs change. Pass `colorScheme` (resolved `light`/`dark`) to `Host` so the Compose `MaterialTheme` matches the app's selected theme.
- App icons: `app.json` points at `src/assets/images/icon.png` (top-level and `android.icon`), which is exported from the master `src/assets/icons/icon.svg` at 1024×1024 (Expo only accepts PNG launcher icons). The web favicon is configured via `app.json` `web.favicon` (`./src/assets/images/icon.png`).
- The web landing is statically rendered. `useWindowDimensions()` is 0 during SSG, so gate responsive branches behind a `mounted` flag (`src/app/index.web.js`); otherwise hydration mismatches leave the mobile layout on desktop.

## Build & test

Verify that changes work before completing the task. When feasible, run the relevant checks (for example `npx expo export --platform web` and/or `npx expo export --platform android` to confirm bundles and assets compile). If a change requires device/emulator interaction (e.g. native touch behavior), verify what you can statically and via export/build, and report any runtime verification that still needs manual confirmation.

## Native directories

`ios/` and `android/` are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins. After adding a library with native code, the app needs a development build (`npx expo run:android`), not Expo Go.

## EAS

Build config is in `eas.json`: `production` → AAB + auto-increment, with `submit.production` used by `npm run android:release`. Run EAS as `npx eas-cli@latest <command>`. Docs: `https://docs.expo.dev/eas/index.md`.
