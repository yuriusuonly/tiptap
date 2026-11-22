/**
 * Premium subscription screen. Product data and purchases come from
 * `expo-iap`, but entitlement is granted ONLY by the server API route after it
 * verifies the purchase token with the Google Play Developer API.
 * @module src/screens/android/profile/subscription-screen
 */
import {useEffect, useState} from "react";
import {Pressable, View} from "react-native";
import {finishTransaction, useIAP} from "expo-iap";
import Animated from "react-native-reanimated";
import CloseIcon from "../../../assets/icons/close.svg";
import LogoIcon from "../../../assets/icons/icon.svg";
import {fadeInDown, fadeInUp, SharedAxis} from "../../../components/animations";
import {CircularProgress} from "../../../components/circular-progress";
import {Icon} from "../../../components/icon";
import {NativeButton, NativeText} from "../../../components/ui";
import {Text} from "../../../components/text";
import {PREMIUM_PRODUCT_ID} from "../../../constants/configuration";
import {verifyPremiumPurchase} from "../../../services/api/entitlements";
import {useAuthStore} from "../../../store/auth-store";
import {useEntitlementStore} from "../../../store/entitlement-store";
import {closeSubscription} from "../../../store/fact-store";
import {showToast} from "../../../store/toast-store";

export function SubscriptionScreen() {
  const {user} = useAuthStore();
  const {applyServerState} = useEntitlementStore();
  const [verifying, setVerifying] = useState(false);

  const iap = useIAP({
    onPurchaseSuccess: async (purchase) => {
      const token = purchase?.purchaseToken ?? purchase?.purchaseTokenAndroid;
      if (!token) {
        showToast("Missing purchase token");
        return;
      }
      setVerifying(true);
      try {
        const result = await verifyPremiumPurchase(token);
        applyServerState(result);
        await finishTransaction({purchase, isConsumable: false});
        showToast("Premium activated");
        closeSubscription();
      } catch {
        showToast("Could not verify purchase");
      } finally {
        setVerifying(false);
      }
    },
    onPurchaseError: () => showToast("Purchase cancelled or failed"),
    onError: () => showToast("Unable to load subscription plans"),
  });

  useEffect(() => {
    if (!iap.connected) return;
    iap.fetchProducts({skus: [PREMIUM_PRODUCT_ID], type: "subs"}).catch(() => {});
  }, [iap.connected]);

  const product = (iap.subscriptions ?? []).find((item) => item.id === PREMIUM_PRODUCT_ID);
  const offers = product?.subscriptionOffers ?? [];
  const busy = verifying || iap.loading || !iap.connected;

  const buy = (offer) => {
    const offerToken = offer?.offerTokenAndroid;
    if (!offerToken) {
      showToast("This plan is unavailable");
      return;
    }
    iap.requestPurchase({
      type: "subs",
      request: {
        google: {
          skus: [PREMIUM_PRODUCT_ID],
          subscriptionOffers: [{sku: PREMIUM_PRODUCT_ID, offerToken}],
        },
      },
    });
  };

  return (
    <SharedAxis className="absolute inset-0 bg-background" direction="vertical">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="text-[20px] font-bold text-ink">Premium</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={closeSubscription}
          className="h-10 w-10 items-center justify-center rounded-full bg-raised"
        >
          <Icon as={CloseIcon} size={20} />
        </Pressable>
      </View>

      <Animated.ScrollView contentContainerClassName="grow items-center px-5 pb-20 pt-6">
        <Animated.View entering={fadeInDown()} className="items-center gap-3">
          <Icon as={LogoIcon} size={56} />
          <Text className="text-center text-[24px] font-bold text-ink">Upgrade to Premium</Text>
          <Text className="text-center text-[14px] leading-6 text-muted">
            Unlimited saves, synced across devices, and no ads.
          </Text>
        </Animated.View>

        <View className="mt-8 w-full gap-3">
          {!iap.connected || iap.loading ? (
            <CircularProgress label="Loading plans…" />
          ) : offers.length === 0 ? (
            <Text className="text-center text-[15px] text-muted">
              Unable to load subscription plans.
            </Text>
          ) : (
            offers.map((offer, index) => (
              <Animated.View key={offer.id ?? index} entering={fadeInUp(100 + index * 80)}>
                <View className="flex-row items-center justify-between rounded-[20px] border border-line bg-surface p-5">
                  <View>
                    <NativeText role="titleMedium" weight="600">
                      {offer.basePlanIdAndroid === "monthly-premium-subscription"
                        ? "Monthly"
                        : "Annual"}
                    </NativeText>
                    <NativeText role="bodySmall" color="muted">
                      {offer.displayPrice}
                    </NativeText>
                  </View>
                  <NativeButton
                    label="Buy"
                    variant="filled"
                    disabled={busy}
                    onPress={() => buy(offer)}
                    accessibilityLabel={`Buy ${offer.displayPrice}`}
                  />
                </View>
              </Animated.View>
            ))
          )}
        </View>
      </Animated.ScrollView>
    </SharedAxis>
  );
}

export default SubscriptionScreen;
