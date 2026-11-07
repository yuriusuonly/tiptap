/**
 * Centralized app configuration composed from EXPO_PUBLIC_ environment values
 * (see `.env` at the workspace root). This module is the single source of
 * truth for app-level configuration; Metro reads the same values from the
 * same `.env` (see `metro.config.js`).
 * @module src/shared/constants/configuration
 */

const appName = process.env.EXPO_PUBLIC_APP_NAME;
const appVersion = process.env.EXPO_PUBLIC_APP_VERSION;
const appDescription = process.env.EXPO_PUBLIC_APP_DESCRIPTION;
const landingPageScheme = process.env.EXPO_PUBLIC_LANDING_PAGE_SCHEME;
const landingPageHost = process.env.EXPO_PUBLIC_LANDING_PAGE_HOST;
const landingPagePort = process.env.EXPO_PUBLIC_LANDING_PAGE_PORT;

if (
  !appName ||
  !appVersion ||
  !appDescription ||
  !landingPageScheme ||
  !landingPageHost ||
  !landingPagePort
) {
  throw new Error(
    "Missing app configuration in `.env` at the workspace root. Define " +
      "EXPO_PUBLIC_APP_NAME, EXPO_PUBLIC_APP_VERSION, EXPO_PUBLIC_APP_DESCRIPTION, " +
      "EXPO_PUBLIC_LANDING_PAGE_SCHEME, EXPO_PUBLIC_LANDING_PAGE_HOST, and " +
      "EXPO_PUBLIC_LANDING_PAGE_PORT."
  );
}

/** App display name, e.g. "TipTap". */
export const APP_NAME = appName;

/** App version, e.g. "1.0.0". */
export const APP_VERSION = appVersion;

/** App description used in document meta tags. */
export const APP_DESCRIPTION = appDescription;

/**
 * Landing page (web) URL. Development builds point at the local web dev
 * server (localhost).
 */
export const LANDING_PAGE_URL =
  `${landingPageScheme}://${landingPageHost}:${landingPagePort}`;
