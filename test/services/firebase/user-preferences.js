/**
 * Mock fork of `src/services/firebase/user-preferences.js` for `test` app
 * mode. Mirrors its exported names/return shapes with predictable,
 * stateful alternating results: the 1st run of each call fails, the 2nd
 * succeeds, then flips (failure ↔ success), after a fixed delay — so sync
 * failure and success states render deterministically. No native modules
 * are loaded. Loaded lazily by the real service only when `isTestMode`.
 * @module test/services/firebase/user-preferences
 */

const MOCK_DELAY_MS = 1200;

let readAttempts = 0;
let writeAttempts = 0;

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

export async function getUserPreferences() {
  await delay();
  readAttempts += 1;
  if (readAttempts % 2 === 1) {
    const error = new Error("Mock preferences read failed (test mode)");
    error.code = "firestore/mock-failed";
    throw error;
  }
  return null;
}

export async function setUserPreferences() {
  await delay();
  writeAttempts += 1;
  if (writeAttempts % 2 === 1) {
    const error = new Error("Mock preferences write failed (test mode)");
    error.code = "firestore/mock-failed";
    throw error;
  }
}
