/**
 * Android Firestore storage for the signed-in user's profile document only.
 * Uses the React Native Firebase Firestore modular API (v27).
 * Data shape: `users/{uid}` (owner-only). Preferences live in
 * `user-preferences` (separate service).
 * Metro resolves this file on Android; the `.js` sibling is the web stub.
 * @module src/services/firebase/user-profile
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
