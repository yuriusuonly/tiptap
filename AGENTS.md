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

## Architecture (layered, platform-separated)

- `src/app/` — **routing layer** only. Route files are thin bridges that re-export a screen or define a navigator.
- `src/web/` — **web-only** screens and components (`src/web/screens/landing`).
- `src/android/` — **Android-only** screens and components (`src/android/screens`, `src/android/components`).
- `src/shared/` — cross-platform code only (`components`, `hooks`, `store`, `constants`, `stylesheets`, `assets`).
- `src/shared/constants/` — design tokens (`colors.js`, `layout.js`); `src/shared/stylesheets/global.css` is the Tailwind entry; `src/shared/assets/` holds SVGs and the derived PNG.
- `src/services/` — reserved for future integrations (Firebase/API/storage adapters). Keep it free of UI imports.
- Dependency direction: `app -> web/android screens -> shared components`. Shared code must never import from `src/app`, `src/web`, or `src/android`.

## Routing (Expo Router)

- Routes live in **`src/app/`**. Expo Router auto-detects `src/app/` before a root `app/` directory — do not create a root `app/`.
- Platform routes use extensions: `*.android.js` (Android only) with a plain `*.js` fallback. Expo Router requires the fallback for static web rendering, so every platform route has a sibling.
- `src/app/_layout.js` is the web root (headerless `Stack`); `src/app/_layout.android.js` is the Android root (`Tabs` with a custom React Native tab bar).
- `src/app/index.js` renders the web landing; `src/app/index.android.js` renders the Android Home tab.
- `src/app/profile.js` is the web fallback for the Android-only Profile route and redirects home; `src/app/profile.android.js` renders the Android Profile tab.
- Every file in `src/app/` is a screen; `_layout.js` / `_layout.<platform>.js` define navigators. Keep non-route code **outside** `src/app/`.
- Web wrappers: `src/app/+html.js` (document shell) and `src/app/+not-found.js` (404).
- Import navigation APIs (`Link`, `router`, `useLocalSearchParams`, `Redirect`) from `expo-router`.

## File naming

- Use **lower-case kebab-case** for every file and directory (`icon.js`, `home.svg`, `index.android.js`).
- Expo Router reserved route names are the only exception: `index`, `_layout`, `+html`, `+not-found`.
- Configuration files live at the workspace root (`babel.config.js`, `metro.config.js`, `tailwind.config.js`, `.svgrrc.json`), never under `src/`.
- Keep JavaScript identifiers/components PascalCase (`Icon`); only filenames are kebab-case.

## Code conventions

- **Vanilla JavaScript only.** JSX in `.js` files. Do not introduce TypeScript, `.ts`/`.tsx`, or a `tsconfig.json`.
- The package is **ESM** (`"type": "module"`). Config files (`babel.config.js`, `metro.config.js`, `tailwind.config.js`) use `import`/`export default`. CommonJS-only package subpaths are bridged with `createRequire(import.meta.url)`.
- **SVG only — never XML icons.** SVG files under `src/shared/assets/icons/` are imported as React components via `react-native-svg-transformer` (configured in `metro.config.js`) and rendered with `react-native-svg`. Pass a `color` prop to tint a `fill="currentColor"` icon.
- Use the shared `src/shared/components/icon.js` wrapper to render SVG icons consistently across platforms: `<Icon as={SvgComponent} size={24} color={...} accessibilityLabel="..." />`. `src/shared/assets/icons/*.svg` files are the source of truth for icons — import simple/tintable SVGs (e.g. `home.svg`/`person.svg`) directly and render via `Icon`. The brand logo is rendered by `src/shared/components/app-logo.js` (a `react-native-svg` component mirroring the master `src/shared/assets/icons/icon.svg`, which remains the source for derived PNG assets) for reliable cross-platform rendering of its gradient.
- Style React Native components with **Nativewind** `className` utilities (Tailwind v3 config in `tailwind.config.js`; `src/shared/stylesheets/global.css` is imported by `src/shared/components/app-providers.js`). **Do not use inline `style` objects for presentation.** Semantic colors come from CSS variables in `global.css` and switch with the `dark` class (driven by the theme store). Shared tokens still live in `src/shared/constants/colors.js` and are mirrored in the Tailwind theme.
- Responsive breakpoints and per-class layout tokens live in `src/shared/constants/layout.js`; use `src/shared/hooks/use-responsive-layout.js` (`useResponsiveLayout`) for the four classes: Wearable `<480`, Phone `480–719`, Tablet `720–1079`, Desktop `>=1080`. Content is capped at `1920px`. Prefer Tailwind screen variants (`phone:`, `tablet:`, `desktop:`); when a computed value is unavoidable (e.g. SVG `size`), use layout tokens, not ad-hoc numbers. On web, pass `{enabled: mounted}` so static rendering starts on the wearable class. See `DESIGN.md`.
- Global client state uses **Zustand** stores in `src/shared/store/`. Persist with `zustand/middleware` + AsyncStorage and `skipHydration: true`, then call `store.persist.rehydrate()` in `src/shared/components/app-providers.js` so static web rendering never touches `localStorage`.
- The Android bottom navigation is a **React Native** tab bar (`src/android/components/app-tab-bar.js`) rendered by Expo Router `Tabs`. The `Pressable` tab item is the only touch target; icons and the selection indicator use `pointerEvents="none"` so taps are never intercepted or propagated. Do **not** reintroduce `@expo/ui`/Jetpack Compose navigation or VectorDrawable XML assets.
- App icons: `app.json` points at `src/shared/assets/images/icon.png` (top-level and `android.icon`), which is exported from the master `src/shared/assets/icons/icon.svg` at 1024×1024 (Expo only accepts PNG launcher icons). The web favicon is configured via `app.json` `web.favicon` (`./src/shared/assets/images/icon.png`).
- The web landing is statically rendered. `useWindowDimensions()` is 0 during SSG, so gate responsive branches behind a `mounted` flag (`src/web/screens/landing/landing-screen.js`); otherwise hydration mismatches leave the mobile layout on desktop.

## Build & test

Verify that changes work before completing the task. When feasible, run the relevant checks (for example `npx expo export --platform web` and/or `npx expo export --platform android` to confirm bundles and assets compile). If a change requires device/emulator interaction (e.g. native touch behavior), verify what you can statically and via export/build, and report any runtime verification that still needs manual confirmation.

## Native directories

`ios/` and `android/` are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins. After adding a library with native code, the app needs a development build (`npx expo run:android`), not Expo Go.

## EAS

Build config is in `eas.json`: `production` → AAB + auto-increment, with `submit.production` used by `npm run android:release`. Run EAS as `npx eas-cli@latest <command>`. Docs: `https://docs.expo.dev/eas/index.md`.
