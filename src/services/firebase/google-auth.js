/**
 * Android Google Sign-In via @react-native-google-signin/google-signin and
 * React Native Firebase Auth (@react-native-firebase/auth, modular API).
 * Google OAuth only — no email/password, no web auth.
 *
 * Native modules are loaded lazily with `require` inside each function —
 * never at module scope — so importing this module during Expo Router route
 * discovery or web static rendering (Node, no native modules) is safe.
 * All call sites are Android-guarded (Root bootstrap and the Android Profile
 * UI); web never renders or calls these functions.
 * @module src/services/firebase/google-auth
 */
import {isTestMode, requireGoogleWebClientId} from "../../shared/constants/configuration";

// eslint-disable-next-line no-undef
function mockAuth() {
  return require("../../../test/services/firebase/google-auth");
}

let configured = false;

// eslint-disable-next-line no-undef
function authSdk() {
  return require("@react-native-firebase/auth");
}

// eslint-disable-next-line no-undef
function googleSigninSdk() {
  return require("@react-native-google-signin/google-signin");
}

/**
 * Configure Google Sign-In once. Call at runtime (Root bootstrap) — never at
 * import time. Uses the type-3 web client ID from configuration.
 */
export function configureGoogleSignIn() {
  if (isTestMode) return mockAuth().configureGoogleSignIn();
  if (configured) return;
  const {GoogleSignin} = googleSigninSdk();
  GoogleSignin.configure({
    webClientId: requireGoogleWebClientId(),
    offlineAccess: false,
  });
  configured = true;
}

/**
 * @returns {Promise<{uid: string, displayName: string | null, email: string | null, photoURL: string | null}>}
 */
export async function signInWithGoogle() {
  if (isTestMode) return mockAuth().signInWithGoogle();
  const {getAuth, GoogleAuthProvider, signInWithCredential} = authSdk();
  const {GoogleSignin} = googleSigninSdk();
  await configureGoogleSignIn();
  await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
  const response = await GoogleSignin.signIn();
  if (response.type !== "success") {
    const error = new Error("Google Sign-In was cancelled.");
    error.code = "cancelled";
    throw error;
  }
  const idToken = response.data.idToken;
  if (!idToken) {
    throw new Error("Google Sign-In returned no ID token.");
  }
  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(getAuth(), credential);
  return toAuthUser(userCredential.user);
}

export async function signOutGoogle() {
  if (isTestMode) return mockAuth().signOutGoogle();
  const {getAuth} = authSdk();
  const {GoogleSignin} = googleSigninSdk();
  let authError = null;
  try {
    await getAuth().signOut();
  } catch (error) {
    authError = error;
  }
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore — Firebase sign-out above is the source of truth.
  }
  if (authError) throw authError;
}

/**
 * Delete the current Firebase Auth user. When Firebase reports the session
 * is stale (`auth/requires-recent-login`), re-authenticates with the cached
 * Google credential first, then retries the delete.
 */
export async function deleteAuthUser() {
  if (isTestMode) return mockAuth().deleteAuthUser();
  const {getAuth, GoogleAuthProvider} = authSdk();
  const {GoogleSignin} = googleSigninSdk();
  const currentUser = getAuth().currentUser;
  if (!currentUser) {
    throw new Error("No signed-in user to delete.");
  }
  try {
    await currentUser.delete();
    return;
  } catch (error) {
    if (error?.code !== "auth/requires-recent-login") throw error;
  }
  await configureGoogleSignIn();
  const silent = await GoogleSignin.signInSilently();
  const idToken = silent?.data?.idToken ?? null;
  if (!idToken) {
    throw new Error(
      "Sign-in expired. Please sign in again and retry deleting your account."
    );
  }
  await currentUser.reauthenticateWithCredential(
    GoogleAuthProvider.credential(idToken)
  );
  await currentUser.delete();
}

/**
 * Subscribe to Firebase auth state (Android).
 * @param {(user: object | null) => void} callback - Receives a plain
 *   {uid, displayName, email, photoURL} object or null.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeAuthState(callback) {
  if (isTestMode) return mockAuth().subscribeAuthState(callback);
  const {getAuth, onAuthStateChanged} = authSdk();
  return onAuthStateChanged(getAuth(), (firebaseUser) => {
    callback(firebaseUser ? toAuthUser(firebaseUser) : null);
  });
}

/**
 * @param {{uid: string, displayName?: string | null, email?: string | null, photoURL?: string | null}} user
 * @returns {{uid: string, displayName: string | null, email: string | null, photoURL: string | null}}
 */
function toAuthUser(user) {
  return {
    uid: user.uid,
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    photoURL: user.photoURL ?? null,
  };
}
