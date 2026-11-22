/**
 * Google OAuth helpers for API routes. Signs a service-account JWT locally with
 * `node:crypto` and exchanges it for short-lived access tokens. Only ever used
 * from server modules; no credentials are returned to clients.
 * @module server/google-auth
 */
import { Buffer } from 'node:buffer';
import { createSign } from 'node:crypto';

import { getServerConfig } from './config.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const TOKEN_LIFETIME_SECONDS = 3600;
const CACHE_SKEW_MS = 60_000;

/** OAuth scopes used by the server routes. */
export const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
export const PLAY_SCOPE = 'https://www.googleapis.com/auth/androidpublisher';

const tokenCache = new Map();

/** Base64url encode a string or Buffer without third-party packages. */
function base64Url(value) {
  return Buffer.from(value).toString('base64url');
}

/**
 * Build a signed JWT assertion (RS256) for the service account.
 * @param {{clientEmail: string, privateKey: string}} account
 * @param {string[]} scopes
 * @param {number} now Unix time in seconds.
 * @returns {string}
 */
function signJwt(account, scopes, now) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: account.clientEmail,
    aud: TOKEN_URL,
    scope: scopes.join(' '),
    iat: now,
    exp: now + TOKEN_LIFETIME_SECONDS,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  return `${unsigned}.${base64Url(signer.sign(account.privateKey))}`;
}

/**
 * Get a cached Google access token for the given scope set, refreshing shortly
 * before expiry. Token responses never include the signed assertion in errors.
 * @param {string[]|string} scopes
 * @returns {Promise<string>}
 */
export async function getGoogleAccessToken(scopes) {
  const list = (Array.isArray(scopes) ? scopes : [scopes]).filter(Boolean);
  const key = [...new Set(list)].sort().join(' ');
  const nowMs = Date.now();
  const cached = tokenCache.get(key);
  if (cached && cached.expiresAt > nowMs + CACHE_SKEW_MS) return cached.token;

  const { serviceAccount } = getServerConfig();
  const assertion = signJwt(serviceAccount, [...new Set(list)], Math.floor(nowMs / 1000));

  let response;
  try {
    response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }).toString(),
    });
  } catch {
    throw new Error('Google OAuth token request failed (network error)');
  }
  if (!response.ok) {
    throw new Error(`Google OAuth token request failed (${response.status})`);
  }

  const data = await response.json();
  if (typeof data?.access_token !== 'string' || typeof data?.expires_in !== 'number') {
    throw new Error('Google OAuth token response is missing access_token or expires_in');
  }
  const token = data.access_token;
  const expiresAt = nowMs + data.expires_in * 1000;
  tokenCache.set(key, { token, expiresAt });
  return token;
}

/**
 * Verify a Firebase ID token with Identity Toolkit and return the trusted UID.
 * The UID is read from Google's response; client-supplied UIDs are never used.
 * @param {string} idToken
 * @returns {Promise<string|null>} the UID, or null for invalid/expired tokens.
 */
export async function verifyFirebaseIdToken(idToken) {
  if (typeof idToken !== 'string' || !idToken) return null;
  const { firebaseApiKey } = getServerConfig();
  if (!firebaseApiKey) throw new Error('EXPO_PUBLIC_FIREBASE_API_KEY is not configured');

  const url = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`;
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
  } catch {
    return null;
  }
  if (!response.ok) return null;

  const data = await response.json();
  const uid = data?.users?.[0]?.uid;
  return typeof uid === 'string' && uid ? uid : null;
}
