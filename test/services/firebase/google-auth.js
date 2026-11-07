/**
 * Mock fork of `src/services/firebase/google-auth.js` for `test` app mode.
 * Mirrors its exported names/signatures/return shapes with predictable,
 * stateful alternating results: the 1st run of each action fails, the 2nd
 * succeeds, then flips (failure ↔ success), after a fixed delay so
 * per-action circular progress is observable. Auth state (signed-out
 * start) is held in a module-level emitter (`subscribeAuthState`), and
 * successful sign-in/sign-out transitions emit the new state immediately —
 * so the Account card renders each state predictably. No native modules
 * are loaded. Loaded lazily by the real service only when `isTestMode`
 * (see `src/services/firebase/google-auth.js`).
 * @module test/services/firebase/google-auth
 */

const MOCK_DELAY_MS = 1200;

export const MOCK_TEST_USER = {
  uid: "test-uid",
  displayName: "Test User",
  email: "test@example.com",
  photoURL: null,
};

export const MOCK_AUTH_ERRORS = {
  signIn: {code: "auth/mock-failed", message: "Mock sign-in failed (test mode)"},
  signOut: {code: "auth/mock-failed", message: "Mock sign-out failed (test mode)"},
  delete: {code: "auth/mock-failed", message: "Mock account deletion failed (test mode)"},
};

let currentUser = null;
let signInAttempts = 0;
let signOutAttempts = 0;
let deleteAttempts = 0;
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

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

// Track subscriptions so a listener can be registered at any time and
// receive the latest state (immediately + on transitions).

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
  deleteAttempts += 1;
  if (deleteAttempts % 2 === 1) {
    throw mockError("delete");
  }
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
