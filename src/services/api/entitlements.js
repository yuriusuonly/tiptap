/**
 * Client for the server-authoritative premium/gems API routes.
 *
 * All entitlement reads and writes go through Expo Router API routes
 * (`src/app/api/**`). The app never decides its own premium or gem values —
 * it only displays what the server returns. Firebase ID tokens authenticate
 * every call; the server verifies them before touching Firestore.
 *
 * Native SDK modules are required lazily so importing this file during web
 * static rendering (Node) is safe.
 * @module src/services/api/entitlements
 */
import {apiUrl, isTestMode} from "../../constants/configuration";

// eslint-disable-next-line no-undef
function mockApi() {
  return require("../../../test/services/api/entitlements");
}

// eslint-disable-next-line no-undef
function authSdk() {
  return require("@react-native-firebase/auth");
}

/**
 * Retrieve the current Firebase ID token used to authenticate API calls.
 * Returns null when signed out (or in test mode, where a stub token is used).
 * @returns {Promise<string | null>}
 */
export async function getIdToken() {
  if (isTestMode) return "test-id-token";
  const {getAuth} = authSdk();
  const user = getAuth().currentUser;
  if (!user) return null;
  return user.getIdToken();
}

/**
 * @param {string} path
 * @param {{method?: string, body?: object, auth?: boolean}} options
 * @returns {Promise<object>}
 */
async function request(path, {method = "GET", body, auth = true} = {}) {
  const headers = {"Content-Type": "application/json"};
  if (auth) {
    const token = await getIdToken();
    if (!token) {
      const error = new Error("Sign in to continue.");
      error.code = "unauthenticated";
      throw error;
    }
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(apiUrl(path), {
      method,
      headers,
      ...(body == null ? {} : {body: JSON.stringify(body)}),
    });
  } catch {
    throw new Error("Unable to reach the entitlement service.");
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload?.error ?? "Entitlement request failed.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

/** @returns {Promise<{premium: boolean, gems: number, bookmarks: string[], streak: object|null, themeMode: string|null}>} */
export async function fetchEntitlements() {
  if (isTestMode) return mockApi().fetchEntitlements();
  return request("/api/state");
}

/**
 * Verify a Google Play purchase token server-side. The server is the only
 * writer of `premium`; the client never sends the desired entitlement value.
 * @param {string} purchaseToken
 * @returns {Promise<{premium: boolean, expiresAt: string|null}>}
 */
export async function verifyPremiumPurchase(purchaseToken) {
  if (isTestMode) return mockApi().verifyPremiumPurchase(purchaseToken);
  if (!purchaseToken) throw new Error("Missing purchase token.");
  return request("/api/premium/verify", {
    method: "POST",
    body: {purchaseToken},
  });
}

/**
 * Spend one gem to unlock a fact. The server checks the balance, decrements it
 * atomically and records the bookmark in a single commit.
 * @param {string} factTitle
 * @returns {Promise<{gems: number, slug: string}>}
 */
export async function spendGemOnFact(factTitle) {
  if (isTestMode) return mockApi().spendGemOnFact(factTitle);
  if (!factTitle) throw new Error("Missing fact title.");
  return request("/api/gems/spend", {
    method: "POST",
    body: {factTitle},
  });
}

/**
 * Test-mode-only simulation of the AdMob server-to-server reward callback.
 * In real builds the `api/gems/reward` route is called by Google, never here.
 */
export async function recordTestReward() {
  if (!isTestMode) return;
  return mockApi().recordTestReward();
}
