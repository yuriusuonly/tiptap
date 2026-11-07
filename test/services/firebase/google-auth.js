/**
 * Mock fork of `src/services/firebase/google-auth.js` for `test` app mode.
 * Mirrors its exported names/signatures/return shapes with predictable,
 * failure-only results (no success states) after a fixed delay, so
 * per-action progress and failure states render deterministically.
 * No native modules are loaded. Loaded lazily by the real service only
 * when `isTestMode` (see `src/services/firebase/google-auth.js`).
 * @module test/services/firebase/google-auth
 */

const MOCK_DELAY_MS = 1200;

export const MOCK_AUTH_ERRORS = {
  signIn: {code: "auth/mock-failed", message: "Mock sign-in failed (test mode)"},
  signOut: {code: "auth/mock-failed", message: "Mock sign-out failed (test mode)"},
  delete: {code: "auth/mock-failed", message: "Mock account deletion failed (test mode)"},
};

function mockError(key) {
  const {code, message} = MOCK_AUTH_ERRORS[key];
  const error = new Error(message);
  error.code = code;
  return error;
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

export function configureGoogleSignIn() {
  // No-op in mock mode.
}

export async function signInWithGoogle() {
  await delay();
  throw mockError("signIn");
}

export async function signOutGoogle() {
  await delay();
  throw mockError("signOut");
}

export async function deleteAuthUser() {
  await delay();
  throw mockError("delete");
}

/**
 * Predictably emits `null` (signed out) so the Account card renders its
 * signed-out state; sign-in/out/delete then fail via the mock actions.
 * @param {(user: object | null) => void} callback
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeAuthState(callback) {
  callback(null);
  return () => {};
}
