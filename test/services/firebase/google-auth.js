/**
 * Mock fork of `src/services/firebase/google-auth.js` for `test` app mode.
 * Mirrors its exported names/signatures/return shapes with predictable,
 * stateful alternating results: the 1st run of each action fails, the 2nd
 * succeeds, then flips (failure ↔ success), after a fixed delay so
 * per-action circular progress is observable. Auth state (signed-out
 * start) is held in a module-level emitter (`subscribeAuthState`).
 * Sign-in success emits signed-in; sign-out success and delete-account
 * success emit signed-out (delete-account logs the fake user out instead
 * of actually deleting the fake account). Delete-account outcome is
 * coordinated with `user-profile` via `mock-state` so the action flips as
 * a unit. No native modules are loaded. Loaded lazily by the real service
 * only when `isTestMode` (see `src/services/firebase/google-auth.js`).
 * @module test/services/firebase/google-auth
 */
import {MOCK_TEST_USER, delay, isDeleteAccountSuccess} from "./mock-state";

export {MOCK_TEST_USER};

export const MOCK_AUTH_ERRORS = {
  signIn: {code: "auth/mock-failed", message: "Mock sign-in failed (test mode)"},
  signOut: {code: "auth/mock-failed", message: "Mock sign-out failed (test mode)"},
  delete: {code: "auth/mock-failed", message: "Mock account deletion failed (test mode)"},
};

let currentUser = null;
let signInAttempts = 0;
let signOutAttempts = 0;
const listeners = new Set();

function emit(user) {
  for (const listener of [...listeners]) {
    listener(user);
  }
}

function mockError(key) {
  const {code, message} = MOCK_AUTH_ERRORS[key];
  const error = new Error(message);
  error.code = code;
  return error;
}

export function configureGoogleSignIn() {
  // No-op in mock mode.
}

export async function signInWithGoogle() {
  await delay();
  signInAttempts += 1;
  if (signInAttempts % 2 === 1) {
    throw mockError("signIn");
  }
  currentUser = MOCK_TEST_USER;
  emit(currentUser);
  return currentUser;
}

export async function signOutGoogle() {
  await delay();
  signOutAttempts += 1;
  if (signOutAttempts % 2 === 1) {
    throw mockError("signOut");
  }
  currentUser = null;
  emit(currentUser);
}

export async function deleteAuthUser() {
  await delay();
  if (!isDeleteAccountSuccess()) {
    throw mockError("delete");
  }
  // Log the fake user out instead of actually deleting the fake account.
  currentUser = null;
  emit(currentUser);
}

/**
 * Registers a listener and immediately emits the current mock auth state.
 * @param {(user: object | null) => void} callback
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeAuthState(callback) {
  listeners.add(callback);
  callback(currentUser);
  return () => {
    listeners.delete(callback);
  };
}
