/**
 * Web / non-Android stub for Firestore user storage.
 * Firestore user data is Android-only in this project; the web landing stays
 * static with no Firebase SDK. Metro resolves `user-firestore.android.js` on
 * Android instead.
 * @module src/services/firebase/user-firestore
 */

function unsupported() {
  throw new Error("Firestore user storage is only available on Android.");
}

export async function upsertUserProfile() {
  return unsupported();
}

export async function getUserPreferences() {
  return unsupported();
}

export async function setUserPreferences() {
  return unsupported();
}
