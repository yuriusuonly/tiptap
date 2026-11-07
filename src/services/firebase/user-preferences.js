/**
 * Web / non-Android stub for Firestore user-preferences storage.
 * Synced preferences are Android-only in this project; the web landing stays
 * static with no Firebase SDK. Metro resolves `user-preferences.android.js`
 * on Android instead.
 * @module src/services/firebase/user-preferences
 */

function unsupported() {
  throw new Error("Firestore user-preferences storage is only available on Android.");
}

export async function getUserPreferences() {
  return unsupported();
}

export async function setUserPreferences() {
  return unsupported();
}
