# Design System

Tokens and layout rules that keep the web and Android UI consistent. The source of truth for tokens is [`src/theme/colors.js`](src/theme/colors.js); the logo is [`src/assets/svg/icon.svg`](src/assets/svg/icon.svg).

## Brand

- **Name:** Tiptap
- **Logo:** `src/assets/svg/icon.svg` — a gradient music note on a dark rounded square. Render via the shared `src/components/logo.js` (pass `size`).
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

- Title: `64 / 66`, weight `800`, letter-spacing `-1.5` on desktop; `40 / 42` on mobile.
- Description: `18 / 28` on desktop; body `16 / 24` on mobile.
- The eyebrow uses the `caption` token with `600` weight and letter-spacing `1.2`.

## Spacing

Scale (px): `4, 8, 12, 16, 24, 32, 48, 64` (`xs → xxxxl`). Prefer the scale over arbitrary values.

## Radius

`sm: 8`, `md: 12`, `lg: 20`, `xl: 32`, `pill: 999`.

## Layout

### Web landing page

Implemented in `src/app/index.web.js`.

- Single main page, centered.
- **Max width: `1080px`** (`layout.maxWidth`).
- Gutter: `24px` desktop, `16px` mobile (`layout.gutter` / `layout.gutterMobile`).
- **Desktop (≥ `900px`):** two-column row — title + description in one pane, logo in the other.
- **Mobile (< `900px`):** single column, two rows — title + description, then logo.
- Uses `useWindowDimensions` for the breakpoint.
- Static rendering has no viewport, so the responsive layout is applied after mount (a `mounted` flag) to keep the server HTML and first client render identical.
- Hero copy: “Create. Share. Repeat.” plus a short product description.
- Logo pane uses `surface` with a border, `32px` radius, and a purple halo behind the logo.

### Android app

Implemented in `src/app/index.android.js` using `@expo/ui/jetpack-compose`.

- Bottom navigation with **Home** and **Profile** tabs (label + icon each).
- Icons are XML vector drawables in `src/assets/android/`.
- Selected tab uses the `accent` color with a translucent accent indicator.
- **Profile → Preferences:** a rounded `Card` wraps a `LazyColumn` with a `PREFERENCES` subheader and a **Theme** row. The row opens an exposed dropdown (Material 3) with **Auto**, **Light**, and **Dark** options.
- `Auto` follows the system color scheme; the selected mode swaps between the dark `colors` and light `lightColors` palettes from `src/theme/colors.js`.
- The choice is stored in the Zustand `theme-store` and persisted to AsyncStorage, so it survives app restarts.

### Styling and state

- Web screens use **Nativewind** utility classes (`src/app/index.web.js`, `src/app/+not-found.js`); design tokens are mirrored in `tailwind.config.js`.
- Android Compose views cannot take `className`, so they use the palette tokens and Compose modifiers directly.
- Global state lives in `src/store/` (Zustand). Persisted stores skip hydration during static rendering and rehydrate in `src/app/_layout.js`.

### Not found

- Web 404 route (`src/app/+not-found.js`): centered message, accent `404`, and a “Back to TipTap” link.

## Consistency checklist

- Shared tokens, accent colors, and logo across platforms.
- Keep the same vocabulary and tone; screen-specific copy is expected (marketing landing vs. app tabs).
- Use React Native primitives (`View`, `Text`, `Image`, `StyleSheet`) where possible so `react-native-web` matches native output.
- Platform-specific shells (web split layout vs. Android bottom tabs) are allowed; the visual language is shared.
