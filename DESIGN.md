# Design System

Tokens and layout rules that keep the web and Android UI consistent. Color, spacing, radius, and typography tokens live in [`src/theme/colors.js`](src/theme/colors.js); responsive breakpoints and per-class layout tokens live in [`src/theme/layout.js`](src/theme/layout.js). SVG icons (including the logo) live in [`src/assets/icons/`](src/assets/icons/).

## Brand

- **Name:** Tiptap
- **Logo:** `src/assets/icons/icon.svg` — master SVG (gradient music note on a dark rounded square). Render via `src/components/app-logo.js` (a `react-native-svg` component mirroring the master SVG) for reliable cross-platform rendering, optionally through `src/components/icon.js`: `<Icon as={AppLogo} size={...} accessibilityLabel="Tiptap logo" />`. Derive `src/assets/images/icon.png` from `icon.svg` for launcher/favicon use.
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

Always import tokens from `src/theme/colors.js`; do not hard-code hex values in screens.

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
- **Source of truth:** `src/theme/layout.js` exports `breakpoints`, `contentMaxWidth`, `getLayoutClass(width)`, and the per-class `responsiveLayout` tokens (gutters, vertical padding, title/description type, logo sizes, home copy, profile card width). `src/hooks/use-responsive-layout.js` exposes the active `layoutClass`, `tokens`, and class flags using `useWindowDimensions`.
- **Static rendering:** the web export has no viewport. Call `useResponsiveLayout({enabled: mounted})` so the server HTML and the first client render use the `wearable` class; an effect flips `mounted` after hydration.
- **Consistency:** breakpoints, the 1920px cap, and the per-class spacing/type scale are shared. Only the rendering layer differs (Nativewind/React Native primitives on Web, Compose modifiers on Android).
- **Wearable scope:** “Wearable” means the app stays usable on 320×480-sized viewports. A dedicated Wear OS target (round UI, separate app) is out of scope unless explicitly added.

### Web landing page

Implemented in `src/app/index.web.js`.

- Single centered page capped at `1920px` (`contentMaxWidth`).
- Gutter: `16` wearable, `20` phone, `32` tablet, `48` desktop; vertical padding `24 / 32 / 48 / 64`.
- **Wearable, Phone, and Tablet:** stacked single column (eyebrow, title, description, meta, then logo), centered. Wearable/phone use compact type and logo sizes; tablet uses a comfortable scale.
- **Desktop (`>= 1080`):** two-column row — title + description in one pane, logo in the other, with a `64px` gap.
- Hero copy: “Create. Share. Repeat.” plus a short product description.
- Logo pane uses `surface` with a border, per-class radius, and a purple halo behind the logo.
- `useWindowDimensions` drives the layout class; the `mounted` guard keeps static HTML and the first client render identical.

### Android app

Implemented in `src/app/index.android.js` using `@expo/ui/jetpack-compose`.

- Bottom navigation with **Home** and **Profile** tabs (label + icon each).
- Icons are SVG files in `src/assets/icons/`, rendered with `react-native-svg` on every platform. Use the shared `src/components/icon.js` wrapper (`as`, `size`, `accessibilityLabel`; `color` for `currentColor` icons) for simple/tintable SVG imports (e.g. `home.svg`, `person.svg`). The complex gradient logo uses `src/components/app-logo.js`.
- Selected tab uses the `accent` color with a translucent accent indicator.
- Home and Profile content is centered and capped at `1920dp`, using the same per-class gutters as Web (`16 / 20 / 32 / 48`).
- **Home** scales with the class: title `24 / 30` → `30 / 36` → `36 / 42` → `44 / 52`; subtitle `14 / 20` → `16 / 24` → `18 / 26` → `20 / 30`; copy width caps at `480 / 560 / 640 / 880`.
- **Profile → Preferences:** a `PREFERENCES` subheader sits above the card; the rounded `Card` wraps a `LazyColumn` that contains only the menu items (a **Theme** row). The card is centered with a per-class max width (`560 / 560 / 640 / 720`) and compact padding on wearable/phone. The row opens an exposed dropdown (Material 3) with **Auto**, **Light**, and **Dark** options.
- `Auto` follows the system color scheme; the selected mode swaps between the dark `colors` and light `lightColors` palettes from `src/theme/colors.js`.
- The choice is stored in the Zustand `theme-store` and persisted to AsyncStorage, so it survives app restarts.

### Styling and state

- Web screens use **Nativewind** utility classes (`src/app/index.web.js`, `src/app/+not-found.js`); design tokens are mirrored in `tailwind.config.js`, and the responsive `phone` / `tablet` / `desktop` screens plus `max-w-content` map to `src/theme/layout.js`.
- Android Compose views cannot take `className`, so they use the palette tokens, responsive layout tokens, and Compose modifiers directly.
- Global state lives in `src/store/` (Zustand). Persisted stores skip hydration during static rendering and rehydrate in `src/app/_layout.js`.

### Not found

- Web 404 route (`src/app/+not-found.js`): centered message, accent `404`, and a “Back to TipTap” link.

## Consistency checklist

- Shared tokens, responsive breakpoints (480 / 720 / 1080), 1920px max content width, accent colors, and logo across platforms.
- Keep the same vocabulary and tone; screen-specific copy is expected (marketing landing vs. app tabs).
- Use React Native primitives (`View`, `Text`, `Image`, `StyleSheet`) where possible so `react-native-web` matches native output.
- Platform-specific shells (web split layout vs. Android bottom tabs) are allowed; the visual language and responsive scale are shared.
