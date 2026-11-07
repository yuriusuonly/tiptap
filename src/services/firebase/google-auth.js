/**
 * Web / non-Android stub for Google Sign-In (Android-only Firebase auth).
 * The web landing stays static with no Firebase SDK/auth, so these functions
 * are intentional no-ops that fail fast if accidentally called. Metro resolves
 * `google-auth.android.js` on Android instead.
 * @module src/services/firebase/google-auth
 */

function unsupported() {
  throw new Error("Google Sign-In is only available on Android.");
}

export function configureGoogleSignIn() {
  // No-op on web.
}

export async function signInWithGoogle() {
  return unsupported();
}

export async function signOutGoogle() {
  return unsupported();
}

/**
 * @param {(user: object | null) => void} _callback - Auth state callback.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeAuthState(_callback) {
  return () => {};
}
