/**
 * Material 3 theme tokens mirrored from the Flutter app's
 * `ThemeService.lightTheme` / `darkTheme`:
 *
 *   ThemeData.from(
 *     useMaterial3: true,
 *     colorScheme: ColorScheme.fromSeed(
 *       seedColor: Colors.blueGrey,
 *       primary: Colors.blueGrey,   // #607D8B (both light and dark)
 *       onPrimary: Colors.white,
 *     ),
 *     textTheme: GoogleFonts.outfitTextTheme(base.textTheme),
 *   )
 *
 * The tonal values below are the exact `SchemeTonalSpot` output for the
 * #607D8B seed (material_color_utilities), with `primary`/`onPrimary`
 * overridden exactly as Flutter does. Keep this file in sync with
 * `main/lib/app/services/theme.dart`.
 * @module src/constants/material-theme
 */

export const SEED_COLOR = "#607D8B";

export const lightColors = {
  primary: "#607D8B",
  onPrimary: "#FFFFFF",
  primaryContainer: "#BDE9FF",
  onPrimaryContainer: "#004D64",
  secondary: "#4D616C",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#D0E6F2",
  onSecondaryContainer: "#354A53",
  tertiary: "#5D5B7D",
  onTertiary: "#FFFFFF",
  error: "#BA1A1A",
  onError: "#FFFFFF",
  errorContainer: "#FFDAD6",
  onErrorContainer: "#410002",
  surface: "#F6FAFD",
  onSurface: "#171C1F",
  surfaceVariant: "#DCE4E9",
  onSurfaceVariant: "#40484C",
  outline: "#70787D",
  outlineVariant: "#C0C8CD",
  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F0F4F8",
  surfaceContainer: "#EAEEF2",
  surfaceContainerHigh: "#E4E9EC",
  surfaceContainerHighest: "#DFE3E7",
  inverseSurface: "#2C3134",
  inverseOnSurface: "#EDF1F5",
  inversePrimary: "#8BD0EF",
};

export const darkColors = {
  primary: "#607D8B",
  onPrimary: "#FFFFFF",
  primaryContainer: "#004D64",
  onPrimaryContainer: "#BDE9FF",
  secondary: "#B4CAD6",
  onSecondary: "#1F333C",
  secondaryContainer: "#354A53",
  onSecondaryContainer: "#D0E6F2",
  tertiary: "#C6C2EA",
  onTertiary: "#2E2D4D",
  error: "#FFB4AB",
  onError: "#690005",
  errorContainer: "#93000A",
  onErrorContainer: "#FFDAD6",
  surface: "#0F1417",
  onSurface: "#DFE3E7",
  surfaceVariant: "#40484C",
  onSurfaceVariant: "#C0C8CD",
  outline: "#8A9297",
  outlineVariant: "#40484C",
  surfaceContainerLowest: "#0A0F11",
  surfaceContainerLow: "#171C1F",
  surfaceContainer: "#1B2023",
  surfaceContainerHigh: "#262B2D",
  surfaceContainerHighest: "#303538",
  inverseSurface: "#DFE3E7",
  inverseOnSurface: "#2C3134",
  inversePrimary: "#116682",
};

/**
 * Material 3 (2021) text scale that Flutter's `ThemeData.from` uses.
 * `GoogleFonts.outfitTextTheme` applies the Outfit family to every entry.
 */
export const typography = {
  displayLarge: {fontSize: 57, lineHeight: 64, weight: "400"},
  displayMedium: {fontSize: 45, lineHeight: 52, weight: "400"},
  displaySmall: {fontSize: 36, lineHeight: 44, weight: "400"},
  headlineLarge: {fontSize: 32, lineHeight: 40, weight: "400"},
  headlineMedium: {fontSize: 28, lineHeight: 36, weight: "400"},
  headlineSmall: {fontSize: 24, lineHeight: 32, weight: "400"},
  titleLarge: {fontSize: 22, lineHeight: 28, weight: "400"},
  titleMedium: {fontSize: 16, lineHeight: 24, weight: "500"},
  titleSmall: {fontSize: 14, lineHeight: 20, weight: "500"},
  bodyLarge: {fontSize: 16, lineHeight: 24, weight: "400"},
  bodyMedium: {fontSize: 14, lineHeight: 20, weight: "400"},
  bodySmall: {fontSize: 12, lineHeight: 16, weight: "400"},
  labelLarge: {fontSize: 14, lineHeight: 20, weight: "500"},
  labelMedium: {fontSize: 12, lineHeight: 16, weight: "500"},
  labelSmall: {fontSize: 11, lineHeight: 16, weight: "500"},
};

/** Animation timings used by the Flutter app (milliseconds). */
export const motion = {
  quick: 300,
  sharedAxis: 500,
  fade: 1000,
  glow: 2000,
};

/** Breakpoint used by the Flutter landing page for its desktop layout. */
export const DESKTOP_BREAKPOINT = 1000;
