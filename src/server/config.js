/**
 * Server-only environment configuration.
 *
 * NEVER import this module from client code: it reads secrets and is safe only
 * inside `+api.js` routes (and modules imported exclusively by them).
 *
 * Environment variables:
 * - GOOGLE_SERVICE_ACCOUNT_JSON (required): the full service-account JSON string
 *   with `client_email`, `private_key`, and `project_id`. Used for Firestore REST
 *   and Google Play Developer API access.
 * - EXPO_PUBLIC_FIREBASE_API_KEY (required for authenticated routes): the public
 *   Firebase web API key, used only to call Identity Toolkit when verifying
 *   Firebase ID tokens sent by the client.
 * - PLAY_PACKAGE_NAME (optional, default `dev.yuriusu.tiptap`): Android package
 *   name used when verifying Play subscription purchases.
 * - PREMIUM_PRODUCT_ID (optional, default `tiptap_premium_subscription`).
 * - ADMOB_S2S_SECRET (required for the reward callback): shared secret that AdMob
 *   sends in the `x-admob-secret` header.
 * - EXPO_PUBLIC_API_ORIGIN (optional): public server origin used by native
 *   production builds so relative `fetch('/api/...')` calls resolve correctly.
 * - EXPO_PUBLIC_ADMOB_ANDROID_APP_ID (optional, build time): Android AdMob app ID
 *   consumed by the `react-native-google-mobile-ads` config plugin.
 *
 * No value returned here is ever logged or included in an API response.
 * @module server/config
 */

const DEFAULT_PLAY_PACKAGE_NAME = 'dev.yuriusu.tiptap';
const DEFAULT_PREMIUM_PRODUCT_ID = 'tiptap_premium_subscription';

/**
 * Read and validate the environment needed by API routes.
 * @returns {{
 *   serviceAccount: {clientEmail: string, privateKey: string, projectId: string},
 *   firebaseApiKey: string,
 *   playPackageName: string,
 *   premiumProductId: string,
 *   admobS2sSecret: string,
 *   apiOrigin: string|null,
 *   admobAndroidAppId: string|null
 * }}
 */
export function getServerConfig() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is missing or empty');
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must be a JSON object');
  }

  for (const key of ['client_email', 'private_key', 'project_id']) {
    if (typeof parsed[key] !== 'string' || !parsed[key].trim()) {
      throw new Error(`GOOGLE_SERVICE_ACCOUNT_JSON is missing "${key}"`);
    }
  }
  if (!/-----BEGIN (?:RSA )?PRIVATE KEY-----/.test(parsed.private_key)) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON.private_key is not a PEM private key');
  }

  const optional = (name) => {
    const value = process.env[name];
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  };

  return {
    serviceAccount: {
      clientEmail: parsed.client_email.trim(),
      privateKey: parsed.private_key,
      projectId: parsed.project_id.trim(),
    },
    firebaseApiKey: optional('EXPO_PUBLIC_FIREBASE_API_KEY') || '',
    playPackageName: optional('PLAY_PACKAGE_NAME') || DEFAULT_PLAY_PACKAGE_NAME,
    premiumProductId: optional('PREMIUM_PRODUCT_ID') || DEFAULT_PREMIUM_PRODUCT_ID,
    admobS2sSecret: optional('ADMOB_S2S_SECRET') || '',
    apiOrigin: optional('EXPO_PUBLIC_API_ORIGIN'),
    admobAndroidAppId: optional('EXPO_PUBLIC_ADMOB_ANDROID_APP_ID'),
  };
}
