/**
 * Shared mutable state for `test` app-mode mock services.
 * Coordinates outcomes that must be consistent across separate mirrored
 * service modules within a single user action (e.g. "delete account"
 * calls `user-profile.deleteUserData` then `google-auth.deleteAuthUser`
 * — both flip as one unit). No native modules. Loaded only by test mocks.
 * @module test/services/firebase/mock-state
 */

export const MOCK_DELAY_MS = 1200;

export const MOCK_TEST_USER = {
  uid: "test-uid",
  displayName: "Test User",
  email: "test@example.com",
  photoURL: null,
};

let deleteAccountAttempts = 0;
let deleteAccountShouldSucceed = false;

/**
 * Flips the delete-account outcome (1st fail, 2nd succeed, alternating)
 * and returns whether this run should succeed. Call once per delete-account
 * action (from `deleteUserData`, which runs first).
 * @returns {boolean}
 */
export function beginDeleteAccountAttempt() {
  deleteAccountAttempts += 1;
  deleteAccountShouldSucceed = deleteAccountAttempts % 2 === 0;
  return deleteAccountShouldSucceed;
}

/**
 * Returns the outcome decided by `beginDeleteAccountAttempt` for the
 * current delete-account action (used by `deleteAuthUser`, which runs
 * second) — no counter change.
 * @returns {boolean}
 */
export function isDeleteAccountSuccess() {
  return deleteAccountShouldSucceed;
}

export function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}
