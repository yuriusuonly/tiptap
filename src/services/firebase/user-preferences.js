/**
 * Android Firestore storage for the signed-in user's synced preferences
 * (currently the theme). Uses the React Native Firebase Firestore modular
 * API (v27). Profile documents live in `user-profile` (separate service).
 * Data shape: `users/{uid}/preferences/app`
 *   -> `{ themeMode, updatedAt (ms), updatedBy }`
 *
 * The Firestore module is loaded lazily with `require` inside each function —
 * never at module scope — so importing this module during Expo Router route
 * discovery or web static rendering (Node, no native modules) is safe.
 * Call sites are Android-guarded; web never calls these functions.
 * @module src/services/firebase/user-preferences
 */
import {isTestMode} from "../../constants/configuration";

// eslint-disable-next-line no-undef
function mockPreferences() {
  return require("../../../test/services/firebase/user-preferences");
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
 * Read the user's synced preferences, or null when no remote doc exists.
 * @param {string} uid
 * @returns {Promise<{themeMode: string, updatedAt: number} | null>}
 */
export async function getUserPreferences(uid) {
  if (isTestMode) return mockPreferences().getUserPreferences(uid);
  const {doc, getDoc} = firestoreSdk();
  const ref = doc(db(), "users", uid, "preferences", "app");
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
  if (isTestMode) return mockPreferences().setUserPreferences(uid, prefs);
  const {doc, setDoc} = firestoreSdk();
  const ref = doc(db(), "users", uid, "preferences", "app");
  await setDoc(
    ref,
    {themeMode: prefs.themeMode, updatedAt: prefs.updatedAt, updatedBy: "android"},
    {merge: true}
  );
}
