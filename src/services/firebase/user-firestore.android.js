/**
 * Android Firestore storage for the signed-in user's profile and preferences.
 * Uses the React Native Firebase Firestore modular API (v27).
 * Data shape:
 *   users/{uid}                 -> profile (owner-only)
 *   users/{uid}/preferences/app -> { themeMode, updatedAt (ms), updatedBy }
 * Metro resolves this file on Android; the `.js` sibling is the web stub.
 * @module src/services/firebase/user-firestore
 */
import {doc, FieldValue, getDoc, getFirestore, setDoc} from "@react-native-firebase/firestore";

const firestore = getFirestore();

/**
 * Create or update the user's profile document (merge). Preserves `createdAt`
 * on subsequent sign-ins.
 * @param {{uid: string, displayName?: string | null, email?: string | null, photoURL?: string | null}} user
 */
export async function upsertUserProfile(user) {
  const ref = doc(firestore, "users", user.uid);
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
 * Read the user's synced preferences, or null when no remote doc exists.
 * @param {string} uid
 * @returns {Promise<{themeMode: string, updatedAt: number} | null>}
 */
export async function getUserPreferences(uid) {
  const ref = doc(firestore, "users", uid, "preferences", "app");
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (!data || typeof data.themeMode !== "string") return null;
  const updatedAt = typeof data.updatedAt === "number" ? data.updatedAt : 0;
  return {themeMode: data.themeMode, updatedAt};
}

/**
 * Write the user's synced preferences (merge), for last-write-wins sync.
 * @param {string} uid
 * @param {{themeMode: string, updatedAt: number}} prefs
 */
export async function setUserPreferences(uid, prefs) {
  const ref = doc(firestore, "users", uid, "preferences", "app");
  await setDoc(
    ref,
    {themeMode: prefs.themeMode, updatedAt: prefs.updatedAt, updatedBy: "android"},
    {merge: true}
  );
}
