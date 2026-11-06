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
npm run expo:start                    # expo start --clear
npm run expo:export                   # static web export -> build/web
npm run expo:serve                    # serve build/web
npm run eas:build:development         # local Android APK -> build/android/app.apk
npm run eas:build:production          # cloud Android AAB
npm run adb:install                   # adb install -r -d the built APK
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

- Use **lower-case kebab-case** for every file and directory (`logo.js`, `home.xml`, `index.web.js`).
- Expo Router reserved route names are the only exception: `index`, `_layout`, `+html`, `+not-found`.
- Keep JavaScript identifiers/components PascalCase (`Logo`); only filenames are kebab-case.

## Code conventions

- **Vanilla JavaScript only.** JSX in `.js` files. Do not introduce TypeScript, `.ts`/`.tsx`, or a `tsconfig.json`.
- Style React Native components with **Nativewind** `className` utilities (Tailwind v3 config in `tailwind.config.js`; `global.css` is imported in `src/app/_layout.js`). Shared tokens still live in `src/theme/colors.js` and are mirrored in the Tailwind theme.
- `@expo/ui/jetpack-compose` components are Compose-native and **do not accept `className`** — keep styling those with `src/theme/colors.js` tokens, `StyleSheet`, and Compose modifiers.
- Global client state uses **Zustand** stores in `src/store/`. Persist with `zustand/middleware` + AsyncStorage and `skipHydration: true`, then call `store.persist.rehydrate()` in an effect so static web rendering never touches `localStorage`.
- The logo is `src/assets/svg/icon.svg`, rendered through `src/components/logo.js` with `react-native-svg` (works on both platforms).
- The Android shell uses `@expo/ui/jetpack-compose` (`Host` + `NavigationBar`). Compose `Icon` needs XML vector drawables (`src/assets/android/*.xml`); React Native `Image` cannot render them.
- The web landing is statically rendered. `useWindowDimensions()` is 0 during SSG, so gate responsive branches behind a `mounted` flag (`src/app/index.web.js`); otherwise hydration mismatches leave the mobile layout on desktop.

## Native directories

`ios/` and `android/` are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins. After adding a library with native code, the app needs a development build (`npx expo run:android` or `eas build --profile development`), not Expo Go.

## EAS

Build config is in `eas.json`: `development` → APK + internal distribution; `production` → AAB + auto-increment. Run EAS as `npx eas-cli@latest <command>`. Docs: `https://docs.expo.dev/eas/index.md`.
