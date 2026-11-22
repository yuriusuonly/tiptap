/**
 * Google Play subscription verification. The purchase token is always checked
 * against the Play Developer API with a service-account token; entitlement is
 * never derived from client input.
 * @module server/play
 */
import { getServerConfig } from './config.js';
import { getGoogleAccessToken, PLAY_SCOPE } from './google-auth.js';

// subscriptionsV2 enum names (short and fully qualified) plus the numeric
// values used by older responses: ACTIVE = 2, IN_GRACE_PERIOD = 4.
const ACTIVE_STATES = new Set([
  'ACTIVE',
  'IN_GRACE_PERIOD',
  'SUBSCRIPTION_STATE_ACTIVE',
  'SUBSCRIPTION_STATE_IN_GRACE_PERIOD',
  '2',
  '4',
  2,
  4,
]);

function isActiveState(state) {
  if (typeof state === 'number' || typeof state === 'string') {
    return ACTIVE_STATES.has(state) || ACTIVE_STATES.has(String(state).replace(/^SUBSCRIPTION_STATE_/, ''));
  }
  return false;
}

function toIsoExpiry(item) {
  const raw = item?.expiryTime ?? item?.expiryTimeMillis;
  if (typeof raw === 'number' && Number.isFinite(raw)) return new Date(raw).toISOString();
  if (typeof raw !== 'string') return null;
  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null;
}

/**
 * Verify a subscription purchase token with Play Androidpublisher v3.
 * Missing/invalid/permission-denied purchases are reported inactive, never as
 * an error that could grant access by accident.
 * @param {string} purchaseToken
 * @returns {Promise<{active: boolean, productId: string|null, expiresAt: string|null}>}
 */
export async function verifyPremiumPurchase(purchaseToken) {
  const inactive = { active: false, productId: null, expiresAt: null };
  if (typeof purchaseToken !== 'string' || !purchaseToken.trim()) return inactive;

  const { serviceAccount, playPackageName, premiumProductId } = getServerConfig();
  const accessToken = await getGoogleAccessToken([PLAY_SCOPE]);
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(playPackageName)}/purchases/subscriptionsv2/${encodeURIComponent(purchaseToken.trim())}`;

  let response;
  try {
    response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  } catch {
    return inactive;
  }
  // 400/403/404/410 all mean "do not grant": bad token, no permission, not
  // found, or no longer available. Do not log the token or response details.
  if ([400, 403, 404, 410].includes(response.status)) return inactive;
  if (!response.ok) throw new Error(`Play purchase verification failed (${response.status})`);

  const purchase = await response.json();
  const item = Array.isArray(purchase?.lineItems) ? purchase.lineItems[0] : null;
  const productId = typeof item?.productId === 'string'
    ? item.productId
    : (typeof purchase?.productId === 'string' ? purchase.productId : null);
  const expiresAt = toIsoExpiry(item);

  if (productId && productId !== premiumProductId) {
    return { active: false, productId, expiresAt };
  }
  const notExpired = !expiresAt || Date.parse(expiresAt) > Date.now();
  return {
    active: isActiveState(purchase?.subscriptionState) && notExpired,
    productId,
    expiresAt,
  };
}
