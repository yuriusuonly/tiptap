/**
 * Shared color, spacing, radius, and typography tokens for web and Android.
 * Color scheme: neutral gray base (dark/light), cyan primary accent,
 * red secondary accent. See DESIGN.md for the full system.
 * @module src/shared/constants/colors
 */

export const colors = {
  // Backgrounds (gray)
  background: "#0A0A0A",
  surface: "#171717",
  surfaceRaised: "#262626",

  // Borders / dividers (gray)
  border: "#383838",

  // Text (gray)
  textPrimary: "#FFFFFF",
  textSecondary: "#A3A3A3",
  textMuted: "#737373",

  // Brand accents (flipped: cyan is primary, red is secondary)
  accent: "#25F4EE",
  accentCyan: "#FE2C55",

  // Status
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};

// Light-mode counterpart to `colors`. Keep the same keys so screens can swap
// palettes without branching on individual tokens.
export const lightColors = {
  // Backgrounds (gray)
  background: "#FAFAFA",
  surface: "#FFFFFF",
  surfaceRaised: "#F5F5F5",

  // Borders / dividers (gray)
  border: "#E5E5E5",

  // Text (gray)
  textPrimary: "#0A0A0A",
  textSecondary: "#525252",
  textMuted: "#A3A3A3",

  // Brand accents (flipped: cyan is primary, red is secondary)
  accent: "#0FB5B0",
  accentCyan: "#FE2C55",

  // Status
  success: "#16A34A",
  warning: "#D97706",
  danger: "#DC2626",
};

export const themes = {
  dark: colors,
  light: lightColors,
};

export const gradients = {
  // UI brand accent gradient (cyan -> red). The logo SVG asset
  // (src/shared/assets/icons/icon.svg) retains its own internal gradient.
  brand: ["#25F4EE", "#FE2C55"],
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  xxxxl: 64,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 32,
  pill: 999,
};

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: "700" },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: "700" },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
};

// Responsive breakpoints, content width, and per-class layout tokens live in
// `src/shared/constants/layout.js` so they can be shared by Web and Android.
