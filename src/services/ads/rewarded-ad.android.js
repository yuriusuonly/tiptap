/**
 * Android rewarded AdMob wrapper used by the monetization gate.
 *
 * The ad itself only decides whether the user watched it. Gems are NEVER
 * granted here — AdMob's server-to-server callback credits them through the
 * `api/gems/reward` route, which is the authoritative writer.
 *
 * This file is platform-specific (`.android.js`) so the native SDK is excluded
 * from the web/server bundle. Web resolves `rewarded-ad.js` instead.
 * @module src/services/ads/rewarded-ad.android
 */
import {
  AdEventType,
  MobileAds,
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";
import {
  ADMOB_REWARDED_AD_UNIT_ID,
  ADMOB_TEST_DEVICE_IDS,
  isTestMode,
} from "../../constants/configuration";

let configured = false;

/** Configure and initialize Mobile Ads once. Safe no-op in test mode. */
export async function configureAds() {
  if (isTestMode || configured) return;
  if (ADMOB_TEST_DEVICE_IDS.length) {
    await MobileAds().setRequestConfiguration({
      testDeviceIdentifiers: ADMOB_TEST_DEVICE_IDS,
    });
  }
  await MobileAds().initialize();
  configured = true;
}

/**
 * Show a rewarded ad.
 * @returns {Promise<boolean>} true only when the reward callback fired.
 */
export async function showRewardedAd() {
  if (isTestMode) return true;
  if (!ADMOB_REWARDED_AD_UNIT_ID) return false;

  const ad = RewardedAd.createForAdRequest(ADMOB_REWARDED_AD_UNIT_ID);

  return new Promise((resolve) => {
    let settled = false;
    let earned = false;
    let timeout;
    const unsubscribers = [];

    const finish = (result) => {
      if (settled) return;
      settled = true;
      if (timeout) clearTimeout(timeout);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      try {
        ad.destroy();
      } catch {
        // Already destroyed by the SDK.
      }
      resolve(result);
    };

    unsubscribers.push(
      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        earned = true;
      }),
      ad.addAdEventListener(AdEventType.LOADED, () => {
        ad.show().catch(() => finish(false));
      }),
      ad.addAdEventListener(AdEventType.CLOSED, () => finish(earned)),
      ad.addAdEventListener(AdEventType.ERROR, () => finish(false))
    );

    timeout = setTimeout(() => finish(earned), 90000);
    ad.load().catch(() => finish(false));
  });
}
