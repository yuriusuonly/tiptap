---
name: tiptap-ui-ux
description: >-
  Builds and reviews TipTap UI/UX (screens, components, layout, theming,
  navigation/touch behavior, icons, and UX states) for Android and Web
  (Expo/React Native + Nativewind). Use when implementing or refining interface
  work in this repo to keep it consistent with DESIGN.md, AGENTS.md, and the
  responsive/theme/icon/navigation conventions.
metadata:
  author: TipTap project
  category: ProjectWorkflow
  version: "1.0.0"
---

# TipTap UI/UX

Project-specific UI/UX guardrails. Treat `DESIGN.md`, `AGENTS.md`, and
`CONTRIBUTING.md` as the source of truth — this skill is a triggerable checklist,
not a replacement.

## Before implementing

- Read `README.md` `## Milestones` and `### Known issues & fixes` (do not
  reintroduce fixed bugs). Check `DESIGN.md` for tokens/layout rules.
- Verify what you can via `npx expo export --platform web|android`; report any
  device-only verification (e.g. native touch) still needed.

## Styling & visual system

- **React Native components only** (no web-only DOM patterns in shared/native
  paths unless platform-specific). **Nativewind `className` only** for
  presentation — **no inline `style` objects** and no UX animations unless the
  project explicitly adopts them.
- Gray base with **cyan primary / red secondary**. Semantic colors come from CSS
  variables in `src/shared/stylesheets/global.css` and switch with the `dark`
  class; tokens live in `src/shared/constants/colors.js` and are mirrored in
  `tailwind.config.js`. Maintain contrast/readability in Light and Dark.

## Responsive layout (mobile-first)

- Breakpoints (`src/shared/constants/layout.js`): **wearable `<480`** (default),
  **mobile `480–719`**, **tablet `720–1279`**, **desktop `>=1280`** (`mobile:`
  variant). Web panes centered/capped.
- Web is statically rendered; `useWindowDimensions()` can be `0` during SSG.
  Gate responsive branches with `useResponsiveLayout({enabled: mounted})` (or an
  equivalent mounted guard) to avoid hydration mismatches.

## Theme & UX states

- Auto/Light/Dark persisted via Zustand + AsyncStorage
  (`src/shared/store/theme-store.js`, `skipHydration` + rehydrate in Root). Web
  pre-paint anti-flicker lives in `src/app/+html.js` — preserve it.
- Provide clear loading, empty, and error states; keep onboarding/copy clear and
  consistent with the app’s tone.

## Icons, navigation & touch

- **SVG only** (never XML icons). Source icons in `src/shared/assets/icons/`
  imported via `react-native-svg-transformer`; render with shared
  `src/shared/components/icon.js`
  (`<Icon as={Svg} size={...} color={...} accessibilityLabel="..." />`). Pass
  `color` only for tintable `fill="currentColor"` icons.
- Android Home/Profile use internal state + the RN tab bar
  (`src/android/components/app-tab-bar.js`, `src/app/_layout.android.js`) — **no
  `@expo/ui`/Jetpack Compose navigation**. `Pressable` is the only touch target;
  icons/selection indicator use `pointerEvents="none"`. Web `/profile` has no
  route and renders `+not-found` (404).

## Accessibility & quality

- Meaningful `accessibilityLabel`/roles, adequate touch target sizes, and
  platform-appropriate focus/press behavior.
- Keep Android/Web parity where intended; isolate platform-only UI under
  `src/android/` or `src/web/` and cross-platform UI under `src/shared/`.

## After changes

- Recheck README Known issues & fixes; update `README.md` Milestones when
  relevant; commit small, specific changes per `CONTRIBUTING.md` / `AGENTS.md`.
