/**
 * Web fallback for the rewarded ad service. The native implementation lives
 * in `rewarded-ad.android.js`; Metro resolves this file on web so the native
 * ads SDK is never pulled into the web/server bundle.
 * @module src/services/ads/rewarded-ad
 */

/** No ads on web. */
export async function configureAds() {}

/** Web never shows rewarded ads. */
export async function showRewardedAd() {
  return false;
}
