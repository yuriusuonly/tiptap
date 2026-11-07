/**
 * Web / non-Android stub for Firestore user-profile storage.
 * User-profile data is Android-only in this project; the web landing stays
 * static with no Firebase SDK. Metro resolves `user-profile.android.js` on
 * Android instead.
 * @module src/services/firebase/user-profile
 */

function unsupported() {
  throw new Error("Firestore user-profile storage is only available on Android.");
}

export async function upsertUserProfile() {
  return unsupported();
}
