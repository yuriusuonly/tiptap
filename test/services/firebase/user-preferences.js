/**
 * Mock fork of `src/services/firebase/user-preferences.js` for `test` app
 * mode. Mirrors its exported names/return shapes with predictable,
 * failure-only results (no success states) after a fixed delay, so sync
 * failure states render deterministically. No native modules are loaded.
 * Loaded lazily by the real service only when `isTestMode`.
 * @module test/services/firebase/user-preferences
 */

const MOCK_DELAY_MS = 1200;

export async function getUserPreferences() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const error = new Error("Mock preferences read failed (test mode)");
  error.code = "firestore/mock-failed";
  throw error;
}

export async function setUserPreferences() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const error = new Error("Mock preferences write failed (test mode)");
  error.code = "firestore/mock-failed";
  throw error;
}
