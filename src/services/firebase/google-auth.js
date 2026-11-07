/**
 * Android Google Sign-In via @react-native-google-signin/google-signin and
 * React Native Firebase Auth (@react-native-firebase/auth, modular API v27).
 * Google OAuth only — no email/password, no web auth.
 *
 * Native modules are loaded lazily with `require` inside each function —
 * never at module scope — so importing this module during Expo Router route
 * discovery or web static rendering (Node, no native modules) is safe.
 * All call sites are Android-guarded (Root bootstrap and the Android Profile
 * UI); web never renders or calls these functions.
 * @module src/services/firebase/google-auth
 */
import {requireGoogleWebClientId} from "../../shared/constants/configuration";

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
  const {getAuth} = authSdk();
  const {GoogleSignin} = googleSigninSdk();
  try {
    await getAuth().signOut();
  } catch {
    // Ignore — still attempt Google Sign-In sign-out below.
  }
  try {
    await GoogleSignin.signOut();
  } catch {
    // Ignore — Firebase sign-out above is the source of truth.
  }
}

/**
 * Subscribe to Firebase auth state (Android).
 * @param {(user: object | null) => void} callback - Receives a plain
 *   {uid, displayName, email, photoURL} object or null.
 * @returns {() => void} Unsubscribe function.
 */
export function subscribeAuthState(callback) {
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
