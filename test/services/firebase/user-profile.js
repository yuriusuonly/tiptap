/**
 * Mock fork of `src/services/firebase/user-profile.js` for `test` app mode.
 * Mirrors its exported names/return shapes with predictable, failure-only
 * results (no success states) after a fixed delay, so sync/delete failure
 * states render deterministically. No native modules are loaded. Loaded
 * lazily by the real service only when `isTestMode`.
 * @module test/services/firebase/user-profile
 */

const MOCK_DELAY_MS = 1200;

export async function upsertUserProfile() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const error = new Error("Mock profile sync failed (test mode)");
  error.code = "firestore/mock-failed";
  throw error;
}

export async function deleteUserData() {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
  const error = new Error("Mock profile delete failed (test mode)");
  error.code = "firestore/mock-failed";
  throw error;
}
