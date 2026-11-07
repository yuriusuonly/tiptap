# Design System

Tokens and layout rules that keep the web and Android UI consistent. Color, spacing, radius, and typography tokens live in [`src/shared/constants/colors.js`](src/shared/constants/colors.js); responsive breakpoints and per-class layout tokens live in [`src/shared/constants/layout.js`](src/shared/constants/layout.js). SVG icons (including the logo) live in [`src/shared/assets/icons/`](src/shared/assets/icons/).

## Brand

- **Name:** Tiptap
- **Logo:** `src/shared/assets/icons/icon.svg` — master SVG (gradient music note on a dark rounded square). Render via `src/shared/components/app-logo.js` (a `react-native-svg` component mirroring the master SVG) for reliable cross-platform rendering, optionally through `src/shared/components/icon.js`: `<Icon as={AppLogo} size={...} accessibilityLabel="Tiptap logo" />`. Derive `src/shared/assets/images/icon.png` from `icon.svg` for launcher/favicon use.
- **Brand gradient:** cyan → purple → red (`#25F4EE → #7C4DFF → #FE2C55`), matching the SVG.

## Colors

| Token | Value | Use |
| --- | --- | --- |
| `background` | `#0B0B0F` | App/page background |
| `surface` | `#15151B` | Cards, panels |
| `surfaceRaised` | `#1D1D25` | Elevated surfaces |
| `border` | `#26262F` | Dividers, outlines |
| `textPrimary` | `#FFFFFF` | Primary text |
| `textSecondary` | `#A1A1AA` | Secondary text |
| `textMuted` | `#6B6B76` | Disabled/muted text |
| `accent` | `#FE2C55` | Primary action / brand accent |
| `accentCyan` | `#25F4EE` | Secondary accent |
| `accentPurple` | `#7C4DFF` | Tertiary accent |
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
| Phone | 40 / 44 | 16 / 24 | 300 / 168 |
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
| Wearable (low) | 320 × 480 | `< 480` |
| Phone (SD) | 480 × 720 | `>= 480` and `< 720` |
| Tablet (HD) | 720 × 1280 | `>= 720` and `< 1080` |
| Desktop (FHD) | 1080 × 1920 | `>= 1080` |

- **Max content width:** `1920px` / `1920dp` (`contentMaxWidth: 1920`). Content is centered and never exceeds this cap on either platform.
- **Source of truth:** `src/shared/constants/layout.js` exports `breakpoints`, `contentMaxWidth`, `getLayoutClass(width)`, and the per-class `responsiveLayout` tokens (gutters, vertical padding, title/description type, logo sizes, home copy, profile card width). `src/shared/hooks/use-responsive-layout.js` exposes the active `layoutClass`, `tokens`, and class flags using `useWindowDimensions`.
- **Static rendering:** the web export has no viewport. Call `useResponsiveLayout({enabled: mounted})` so the server HTML and the first client render use the `wearable` class; an effect flips `mounted` after hydration.
- **Consistency:** breakpoints, the 1920px cap, and the per-class spacing/type scale are shared. The rendering layer is native React Native + Nativewind on both Web and Android.
- **Wearable scope:** “Wearable” means the app stays usable on 320×480-sized viewports. A dedicated Wear OS target (round UI, separate app) is out of scope unless explicitly added.

### Web landing page

Implemented in `src/web/screens/landing/landing-screen.js` (route: `src/app/index.js`).

- Single centered page capped at `1920px` (`contentMaxWidth`).
- Gutter: `16` wearable, `20` phone, `32` tablet, `48` desktop; vertical padding `24 / 32 / 48 / 64`.
- **Wearable, Phone, and Tablet:** stacked single column (eyebrow, title, description, meta, then logo), centered. Wearable/phone use compact type and logo sizes; tablet uses a comfortable scale.
- **Desktop (`>= 1080`):** two-column row — title + description in one pane, logo in the other, with a `64px` gap.
- Hero copy: “Create. Share. Repeat.” plus a short product description.
- Logo pane uses `surface` with a border, per-class radius, and a purple halo behind the logo.
- Responsive classes use Tailwind screen variants (`phone:`, `tablet:`, `desktop:`) with no inline style objects. The only computed value is the SVG logo `size` from layout tokens; the `mounted` guard keeps static HTML and the first client render identical.

### Android app

Implemented with file-based routes: `src/app/_layout.android.js` renders Expo Router `Tabs`, `src/app/index.android.js` is Home, and `src/app/profile.android.js` is Profile. UI lives in `src/android/screens`.

- Bottom navigation is a React Native tab bar (`src/android/components/app-tab-bar.js`) with **Home** and **Profile** tabs (label + SVG icon each). No `@expo/ui`/Jetpack Compose, no XML/VectorDrawable icons.
- `Pressable` tab items are the only touch targets; the icon wrapper and selection indicator use `pointerEvents="none"` so taps are never intercepted or propagated.
- Icons are SVG files in `src/shared/assets/icons/`, rendered with `react-native-svg`. Use `src/shared/components/icon.js` (`as`, `size`, `accessibilityLabel`; `color` for `currentColor`). The complex gradient logo uses `src/shared/components/app-logo.js`.
- Selected tab uses the `accent` color with a translucent accent indicator. State changes are plain color/layout changes — no animations or transitions.
- Home and Profile content is centered and capped at `1920dp`, using the same per-class gutters as Web (`16 / 20 / 32 / 48`).
- **Home** scales with the class: title `24 / 30` → `30 / 36` → `36 / 42` → `44 / 52`; subtitle `14 / 20` → `16 / 24` → `18 / 26` → `20 / 30`; copy width caps at `480 / 560 / 640 / 880`.
- **Profile → Preferences:** a `PREFERENCES` subheader sits above a rounded surface card. The card is centered with a per-class max width (`560 / 560 / 640 / 720`) and compact padding on wearable/phone. The **Theme** row expands inline (no dropdown animation) with **Auto**, **Light**, and **Dark** options.
- `Auto` follows the system color scheme; the selected mode switches the CSS variables between light and dark values (matching `src/shared/constants/colors.js`).
- The choice is stored in the Zustand theme store (`src/shared/store/theme-store.js`) and persisted to AsyncStorage, so it survives app restarts.

### Styling and state

- All screens use **Nativewind** utility classes. Semantic colors resolve through CSS variables declared for `:root` (light) and `.dark:root` (dark) in `src/shared/stylesheets/global.css`; `tailwind.config.js` maps them to utilities such as `bg-background`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, and `text-accent`. The responsive `phone` / `tablet` / `desktop` screens plus `max-w-content` map to `src/shared/constants/layout.js`.
- Do not use inline `style` objects for presentation. The theme store syncs the resolved scheme to Nativewind's `dark` class through `AppProviders`.
- Global state lives in `src/shared/store/` (Zustand). Persisted stores skip hydration during static rendering and rehydrate in `src/shared/components/app-providers.js`.

### Not found

- Web 404 route (`src/app/+not-found.js`): centered message, accent `404`, and a “Back to TipTap” link.

## Consistency checklist

- Shared tokens, responsive breakpoints (480 / 720 / 1080), 1920px max content width, accent colors, and logo across platforms.
- Keep the same vocabulary and tone; screen-specific copy is expected (marketing landing vs. app tabs).
- Use React Native primitives (`View`, `Text`, `Pressable`, `ScrollView`) styled with Nativewind classes so `react-native-web` matches native output.
- Platform-specific shells (web split layout vs. Android bottom tabs) are allowed; the visual language and responsive scale are shared.
