# Design System

Tokens and layout rules that keep the web and Android UI consistent. Color, spacing, radius, and typography tokens live in [`src/shared/constants/colors.js`](src/shared/constants/colors.js); responsive breakpoints and per-class layout tokens live in [`src/shared/constants/layout.js`](src/shared/constants/layout.js). SVG icons (including the logo) live in [`src/shared/assets/icons/`](src/shared/assets/icons/).

## Brand

- **Name:** TipTap (single source of truth: `EXPO_PUBLIC_APP_NAME` in `.env`, read via `src/shared/constants/configuration.js`)
- **Logo:** `src/shared/assets/icons/icon.svg` — master SVG (title bar + paragraph lines on a feed card, on a dark gray rounded square). Render via `src/shared/components/icon.js`: `<Icon as={LogoIcon} size={...} accessibilityLabel="TipTap logo" />` where `LogoIcon` is imported directly from `src/shared/assets/icons/icon.svg`. Derive `src/shared/assets/images/icon.png` from `icon.svg` for launcher/favicon use.
- **Brand accents:** cyan (`#25F4EE`) primary + red (`#FE2C55`) secondary on a neutral gray base.

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#0A0A0A` | App/page background (dark gray) |
| `surface` | `#171717` | Cards, panels (gray) |
| `surfaceRaised` | `#262626` | Elevated surfaces (gray) |
| `border` | `#383838` | Dividers, outlines (gray) |
| `textPrimary` | `#FFFFFF` | Primary text |
| `textSecondary` | `#A3A3A3` | Secondary text (gray) |
| `textMuted` | `#737373` | Disabled/muted text (gray) |
| `accent` | `#25F4EE` | Primary action / brand accent (cyan) |
| `accentCyan` | `#FE2C55` | Secondary accent (red) |
| `success` | `#22C55E` | Success |
| `warning` | `#F59E0B` | Warning |
| `danger` | `#EF4444` | Error/destructive |

Always import tokens from `src/shared/constants/colors.js`; do not hard-code hex values in screens.

## Typography

| Token | Size / Line-height | Weight |
| --- | --- | --- |
| `display` | 32 / 38 | 700 |
| `h1` | 28 / 34 | 700 |
| `h2` | 22 / 28 | 600 |
| `body` | 16 / 24 | 400 |
| `caption` | 13 / 18 | 400 |

Use the system font (React Native default) for cross-platform consistency.

### Landing hero

- Title weight `800`, with per-class size, line-height, and letter-spacing.
- Description and eyebrow scale with the active layout class.
- The eyebrow uses `600` weight and class-specific letter-spacing (`1 → 1.2`).

| Class | Title (size / line-height) | Description | Logo card / logo |
| --- | --- | --- | --- |
| Wearable | 32 / 36 | 15 / 22 | 232 / 132 |
| Mobile | 40 / 44 | 16 / 24 | 300 / 168 |
| Tablet | 52 / 56 | 17 / 26 | 360 / 210 |
| Desktop | 64 / 66 | 18 / 28 | 380 / 260 |

## Spacing

Scale (px): `4, 8, 12, 16, 24, 32, 48, 64` (`xs → xxxxl`). Prefer the scale over arbitrary values.

## Radius

`sm: 8`, `md: 12`, `lg: 20`, `xl: 32`, `pill: 999`.

## Layout

Four responsive layout classes are shared by Web and Android. Breakpoints are minimum viewport widths (CSS px on Web, dp on Android):

| Class | Reference viewport | Width rule |
| --- | --- | --- |
| Wearable (low) | 320 × 480 | `< 480` (default) |
| Mobile (SD) | 480 × 720 | `>= 480` and `< 720` |
| Tablet (HD) | 720 × 1280 | `>= 720` and `< 1280` |
| Desktop (FHD) | 1280 × 1920 | `>= 1280` |

- **Max content width:** `1920px` / `1920dp` (`contentMaxWidth: 1920`). Content is centered and never exceeds this cap on either platform.
- **Source of truth:** `src/shared/constants/layout.js` exports `breakpoints`, `contentMaxWidth`, `getLayoutClass(width)`, and the per-class `responsiveLayout` tokens (gutters, vertical padding, title/description type, logo sizes, home copy, profile card width). `src/shared/hooks/use-responsive-layout.js` exposes the active `layoutClass`, `tokens`, and class flags using `useWindowDimensions`.
- **Static rendering:** the web export has no viewport. Call `useResponsiveLayout({enabled: mounted})` so the server HTML and the first client render use the `wearable` class; an effect flips `mounted` after hydration.
- **Consistency:** breakpoints, the 1920px cap, and the per-class spacing/type scale are shared. The rendering layer is native React Native + Nativewind on both Web and Android.
- **Wearable scope:** “Wearable” means the app stays usable on 320×480-sized viewports. A dedicated Wear OS target (round UI, separate app) is out of scope unless explicitly added.

### Web landing page

Implemented in `src/web/screens/landing/landing-screen.js` (route: `src/app/index.js`).

- Single centered page capped at `1280px` on desktop (web); shared content cap is `1920px` (`contentMaxWidth`) on other screens.
- Gutter: `16` wearable, `20` mobile, `32` tablet, `48` desktop; vertical padding `24 / 32 / 48 / 64`.
- **Wearable, Mobile, and Tablet:** stacked single column (eyebrow, title, description, meta, then logo), centered. Wearable/mobile use compact type and logo sizes; tablet uses a comfortable scale.
- **Desktop (`>= 1280`):** two-column row of equal `flex-1` panes with a `64px` gap, each pane centered (`items-center justify-center`); title/description/meta are centered within their pane, logo card is centered within its pane, and the row is capped at `1280px` and centered on the page.
- Hero copy: “Create. Share. Repeat.” plus a short product description.
- Logo pane uses `surface` with a border, per-class radius, and a cyan halo behind the logo.
- Responsive classes use Tailwind screen variants (`mobile:`, `tablet:`, `desktop:`) with no inline style objects. The only computed value is the SVG logo `size` from layout tokens; the `mounted` guard keeps static HTML and the first client render identical.

### Android app

`src/app/_layout.android.js` renders a custom React Native tab bar driven by internal `home`/`profile` state (`index` via `Slot`, Profile via direct import of `src/android/screens/profile/profile-screen.js`). First-time installs see the onboarding flow (`src/android/screens/onboarding/onboarding-screen.js`) — three pages with Skip/Next and dots — before the tabs. UI lives in `src/android/screens`. `src/app/` holds only the six root route files, so web `/profile` is unmatched and falls through to `+not-found.js`.

- Bottom navigation is a React Native tab bar (`src/android/components/app-tab-bar.js`) with **Home** and **Profile** tabs (label + SVG icon each). No `@expo/ui`/Jetpack Compose, no XML/VectorDrawable icons.
- `Pressable` tab items are the only touch targets; the icon wrapper and selection indicator use `pointerEvents="none"` so taps are never intercepted or propagated.
- Icons are SVG files in `src/shared/assets/icons/`, rendered with `react-native-svg`. Use `src/shared/components/icon.js` (`as`, `size`, `accessibilityLabel`; `color` for `currentColor`) for all icons including the brand logo (`icon.svg`).
- Selected tab uses the `accent` color with a translucent accent indicator. State changes are plain color/layout changes — no animations or transitions.
- Home and Profile content is centered and capped at `1920dp`, using the same per-class gutters as Web (`16 / 20 / 32 / 48`).
- **Home** scales with the class: title `24 / 30` → `30 / 36` → `36 / 42` → `44 / 52`; subtitle `14 / 20` → `16 / 24` → `18 / 26` → `20 / 30`; copy width caps at `480 / 560 / 640 / 880`.
- **Profile → Preferences:** a `PREFERENCES` subheader sits above a rounded surface card. The card is centered with a per-class max width (`560 / 560 / 640 / 720`) and compact padding on wearable/mobile. The **Theme** row expands inline (no dropdown animation) with **Auto**, **Light**, and **Dark** options.
- `Auto` follows the system color scheme; the selected mode switches the CSS variables between light and dark values (matching `src/shared/constants/colors.js`).
- The choice is stored in the Zustand theme store (`src/shared/store/theme-store.js`) and persisted to AsyncStorage, so it survives app restarts.
- **Onboarding** (first install only): three intro pages with eyebrow, title, body copy, text-line mock, dot indicators, and Skip/Next (“Get started” on the last page). Horizontal swipe works too (a `PanResponder` in `onboarding-screen.js`: left advances, right goes back, 50dp threshold, no animation), and dots stay in sync. Completion is stored in the Zustand onboarding store (`src/shared/store/onboarding-store.js`) and persisted to AsyncStorage; while rehydration is pending the Android layout shows a blank background, never the onboarding flash. The Profile tab also offers a **More** section with an **About TipTap** row that opens the web landing page in the external browser. The URL is composed from `EXPO_PUBLIC_LANDING_PAGE_SCHEME` / `_HOST` / `_PORT` in `.env` (dev: `http://localhost:8081`) via `src/shared/constants/configuration.js` — the single composer — and Metro serves the web bundle on that same port from the same `.env` (`metro.config.js`), with no fallback values.

### Styling and state

- All screens use **Nativewind** utility classes. Semantic colors resolve through CSS variables declared for `:root` (light) and `.dark:root` (dark) in `src/shared/stylesheets/global.css`; `tailwind.config.js` maps them to utilities such as `bg-background`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, and `text-accent`. The responsive `mobile` / `tablet` / `desktop` screens plus `max-w-content` map to `src/shared/constants/layout.js`.
- Do not use inline `style` objects for presentation. The theme store syncs the resolved scheme to Nativewind's `dark` class through `Root`.
- Global state lives in `src/shared/store/` (Zustand). Persisted stores skip hydration during static rendering and rehydrate in `src/shared/components/root.js`.

### Not found

- Web 404 route (`src/app/+not-found.js`, implemented in `src/web/screens/not-found/not-found-screen.js`): centered message, accent `404`, and a “Back to TipTap” link. All unmatched web routes render it, including Android-only URLs like `/profile`.

## Consistency checklist

- Shared tokens, responsive breakpoints (480 / 720 / 1280), 1920px max content width, accent colors, and logo across platforms.
- Keep the same vocabulary and tone; screen-specific copy is expected (marketing landing vs. app tabs).
- Use React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`) styled with Nativewind classes so `react-native-web` matches native output.
- Platform-specific shells (web split layout vs. Android bottom tabs) are allowed; the visual language and responsive scale are shared.
