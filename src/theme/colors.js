// Shared design tokens for web and Android. See DESIGN.md for the full system.

export const colors = {
  // Backgrounds
  background: "#0B0B0F",
  surface: "#15151B",
  surfaceRaised: "#1D1D25",

  // Borders / dividers
  border: "#26262F",

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textMuted: "#6B6B76",

  // Brand accents
  accent: "#FE2C55",
  accentCyan: "#25F4EE",
  accentPurple: "#7C4DFF",

  // Status
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
};

// Light-mode counterpart to `colors`. Keep the same keys so screens can swap
// palettes without branching on individual tokens.
export const lightColors = {
  // Backgrounds
  background: "#F7F7FA",
  surface: "#FFFFFF",
  surfaceRaised: "#F0F0F4",

  // Borders / dividers
  border: "#E4E4EA",

  // Text
  textPrimary: "#0B0B0F",
  textSecondary: "#52525B",
  textMuted: "#8A8A94",

  // Brand accents
  accent: "#FE2C55",
  accentCyan: "#0FB5B0",
  accentPurple: "#7C4DFF",

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
  // Matches the gradient in src/assets/svg/icon.svg
  brand: ["#25F4EE", "#7C4DFF", "#FE2C55"],
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

export const layout = {
  maxWidth: 1080,
  desktopBreakpoint: 900,
  gutter: 24,
  gutterMobile: 16,
};
