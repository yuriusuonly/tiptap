/**
 * Android Firestore storage for the signed-in user's profile document only.
 * Uses the React Native Firebase Firestore modular API (v27).
 * Data shape: `users/{uid}` (owner-only). Preferences live in
 * `user-preferences` (separate service).
 *
 * The Firestore module is loaded lazily with `require` inside each function —
 * never at module scope — so importing this module during Expo Router route
 * discovery or web static rendering (Node, no native modules) is safe.
 * Call sites are Android-guarded; web never calls these functions.
 * @module src/services/firebase/user-profile
 */
import {isTestMode} from "../../constants/configuration";
import {deleteBookmarks} from "./bookmarks";

// eslint-disable-next-line no-undef
function mockProfile() {
  return require("../../../test/services/firebase/user-profile");
}

// eslint-disable-next-line no-undef
function firestoreSdk() {
  return require("@react-native-firebase/firestore");
}

// Lazily resolved at call time (Android runtime) — never at module scope.
function db() {
  return firestoreSdk().getFirestore();
}

/**
 * Create or update the user's profile document (merge). Preserves `createdAt`
 * on subsequent sign-ins.
 * @param {{uid: string, displayName?: string | null, email?: string | null, photoURL?: string | null}} user
 */
export async function upsertUserProfile(user) {
  if (isTestMode) return mockProfile().upsertUserProfile(user);
  const {doc, FieldValue, getDoc, setDoc} = firestoreSdk();
  const ref = doc(db(), "users", user.uid);
  const existing = await getDoc(ref);
  const common = {
    uid: user.uid,
    email: user.email ?? null,
    displayName: user.displayName ?? null,
    photoURL: user.photoURL ?? null,
    provider: "google",
    lastSignInAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (existing.exists()) {
    await setDoc(ref, common, {merge: true});
  } else {
    await setDoc(ref, {...common, createdAt: FieldValue.serverTimestamp()});
  }
}

/**
 * Delete the user's Firestore data: every document in
 * `users/{uid}/preferences` (e.g. `app`), then the `users/{uid}` document.
 * @param {string} uid
 */
export async function deleteUserData(uid) {
  if (isTestMode) {
    await mockProfile().deleteUserData(uid);
    return deleteBookmarks(uid);
  }
  const {collection, deleteDoc, doc, getDocs} = firestoreSdk();
  const database = db();
  const prefsSnapshot = await getDocs(
    collection(database, "users", uid, "preferences")
  );
  await Promise.all(
    prefsSnapshot.docs.map((prefsDoc) => deleteDoc(prefsDoc.ref))
  );
  // Bookmarks may be numerous; delete them in bounded batches before the user
  // document (Firestore has no server-side cascade delete).
  await deleteBookmarks(uid);
  await deleteDoc(doc(database, "users", uid));
}
