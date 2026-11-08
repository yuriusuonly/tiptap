/**
 * Centralized app configuration composed from EXPO_PUBLIC_ environment values
 * (see `.env` at the workspace root). This module is the single source of
 * truth for app-level configuration; Metro reads the same values from the
 * same `.env` (see `metro.config.js`).
 *
 * This module must never throw at import time: it is evaluated during static
 * web rendering (router-server) where EXPO_PUBLIC_ values may be absent.
 * Required values are validated lazily at runtime (see
 * `requireEnvironmentValue` / `requireFirebaseConfig`), not on import.
 * @module src/constants/configuration
 */

const appName = process.env.EXPO_PUBLIC_APP_NAME;
const appVersion = process.env.EXPO_PUBLIC_APP_VERSION;
const appDescription = process.env.EXPO_PUBLIC_APP_DESCRIPTION;
const appMode = process.env.EXPO_PUBLIC_APP_MODE ?? "development";
const landingPageScheme = process.env.EXPO_PUBLIC_LANDING_PAGE_SCHEME;
const landingPageHost = process.env.EXPO_PUBLIC_LANDING_PAGE_HOST;
const landingPagePort = process.env.EXPO_PUBLIC_LANDING_PAGE_PORT;

const firebaseApiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
const firebaseAuthDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
const firebaseProjectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseStorageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
const firebaseMessagingSenderId =
  process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
const firebaseAppId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/**
 * Read a required EXPO_PUBLIC_ value at runtime. Throws only when called —
 * never during module import / static rendering.
 * @param {string} name - Environment variable name.
 * @param {string|undefined} value - Current value.
 * @returns {string} The value.
 */
function requireEnvironmentValue(name, value) {
  if (!value) {
    throw new Error(
      `Missing required configuration: ${name}. ` +
        `Define ${name} in \`.env\` at the workspace root.`
    );
  }
  return value;
}

/** App display name, e.g. "TipTap". */
export const APP_NAME = appName;

/** App version, e.g. "1.0.0". */
export const APP_VERSION = appVersion;

/** App description used in document meta tags. */
export const APP_DESCRIPTION = appDescription;

/**
 * App mode: "development" (real services, local) | "production" (real
 * services, remote) | "test" (mocks served; failure states only). Defaults
 * to "development" when unset (e.g. static rendering).
 */
export const APP_MODE = appMode;

/** True in "test" mode — services serve their `test/` mock modules. */
export const isTestMode = APP_MODE === "test";

/** True in "development" mode (real services, local; same behavior as production). */
export const isDevelopmentMode = APP_MODE === "development";

/** True in "production" mode (real services, remote). */
export const isProductionMode = APP_MODE === "production";

/**
 * Landing page (web) URL. Development builds point at the local web dev
 * server (localhost). Empty string when landing env values are unavailable
 * (e.g. during static rendering before env inlining).
 */
export const LANDING_PAGE_URL =
  landingPageScheme && landingPageHost && landingPagePort
    ? `${landingPageScheme}://${landingPageHost}:${landingPagePort}`
    : "";

/**
 * Firebase client configuration (Android, via @react-native-firebase/*).
 * Values mirror `google-services.json`. Fields may be undefined during
 * static rendering; use `requireFirebaseConfig()` at runtime before
 * initializing Firebase.
 */
export const FIREBASE_CONFIG = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

/** Google OAuth web client ID (type 3) for Android Google Sign-In. */
export const GOOGLE_WEB_CLIENT_ID = googleWebClientId;

/**
 * Validate and return the Firebase configuration. Call at runtime (e.g.
 * before RNF initialization on Android) — never at import time.
 * @returns {{apiKey: string, authDomain: string, projectId: string, storageBucket: string, messagingSenderId: string, appId: string}}
 */
export function requireFirebaseConfig() {
  return {
    apiKey: requireEnvironmentValue(
      "EXPO_PUBLIC_FIREBASE_API_KEY",
      FIREBASE_CONFIG.apiKey
    ),
    authDomain: requireEnvironmentValue(
      "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
      FIREBASE_CONFIG.authDomain
    ),
    projectId: requireEnvironmentValue(
      "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
      FIREBASE_CONFIG.projectId
    ),
    storageBucket: requireEnvironmentValue(
      "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
      FIREBASE_CONFIG.storageBucket
    ),
    messagingSenderId: requireEnvironmentValue(
      "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
      FIREBASE_CONFIG.messagingSenderId
    ),
    appId: requireEnvironmentValue(
      "EXPO_PUBLIC_FIREBASE_APP_ID",
      FIREBASE_CONFIG.appId
    ),
  };
}

/**
 * Validate and return the Google web client ID for Google Sign-In.
 * Call at runtime — never at import time.
 * @returns {string} The web client ID.
 */
export function requireGoogleWebClientId() {
  return requireEnvironmentValue(
    "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID",
    GOOGLE_WEB_CLIENT_ID
  );
}
