/**
 * Mock fork of `src/services/firebase/user-profile.js` for `test` app mode.
 * Mirrors its exported names/return shapes with predictable, stateful
 * alternating results: the 1st run of each call fails, the 2nd succeeds,
 * then flips (failure ↔ success), after a fixed delay — so sync/delete
 * failure and success states render deterministically. Delete-account
 * outcome is coordinated with `google-auth` via a hard-coded global test
 * flag (the action flips as a unit; "success" logs the fake user out
 * instead of actually deleting the fake account). No native modules are
 * loaded. Loaded lazily by the real service only when `isTestMode`.
 * @module test/services/firebase/user-profile
 */

const MOCK_DELAY_MS = 1200;

let upsertAttempts = 0;

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function getDeleteAccountState() {
  globalThis.__tiptapTestDeleteAccount ??= {attempts: 0, shouldSucceed: false};
  return globalThis.__tiptapTestDeleteAccount;
}

export async function upsertUserProfile() {
  await delay();
  upsertAttempts += 1;
  if (upsertAttempts % 2 === 1) {
    const error = new Error("Mock profile sync failed (test mode)");
    error.code = "firestore/mock-failed";
    throw error;
  }
}

export async function deleteUserData() {
  await delay();
  const state = getDeleteAccountState();
  state.attempts += 1;
  state.shouldSucceed = state.attempts % 2 === 0;
  if (!state.shouldSucceed) {
    const error = new Error("Mock profile delete failed (test mode)");
    error.code = "firestore/mock-failed";
    throw error;
  }
  // No-op: the fake account is not actually deleted; auth mock logs out.
}
