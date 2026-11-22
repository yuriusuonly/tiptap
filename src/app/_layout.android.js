/**
 * Android root layout. `src/app/` holds only the root route files. Discover
 * renders via the `index` route (`Slot` -> `index.android.js`); Profile and the
 * fact/monetization/subscription overlays are stacked over it using internal
 * state (no extra file-based routes). First-time installs see the login gate.
 * Web resolves `_layout.js` instead.
 * @module src/app/_layout.android
 */
import {Slot} from "expo-router";
import {useEffect} from "react";
import {BackHandler, View} from "react-native";
import {Root} from "../components/root";
import {FactDetailsScreen} from "../screens/android/fact/fact-details-screen";
import {MonetizeScreen} from "../screens/android/fact/monetize-screen";
import {SubscriptionScreen} from "../screens/android/profile/subscription-screen";
import {OnboardingScreen} from "../screens/android/onboarding/onboarding-screen";
import {ProfileScreen} from "../screens/android/profile/profile-screen";
import {closeProfile, useAndroidOverlayStore} from "../store/android-overlay-store";
import {closeTopOverlay, useFactStore} from "../store/fact-store";
import {useOnboardingStore} from "../store/onboarding-store";

export default function RootLayout() {
  const profileOpen = useAndroidOverlayStore((state) => state.profileOpen);
  const fact = useFactStore((state) => state.fact);
  const monetize = useFactStore((state) => state.monetize);
  const subscription = useFactStore((state) => state.subscription);
  const hasSeenOnboarding = useOnboardingStore((state) => state.hasSeenOnboarding);
  const hydrated = useOnboardingStore((state) => state.hydrated);

  useEffect(() => {
    const onBack = () => {
      if (closeTopOverlay()) return true;
      if (profileOpen) {
        closeProfile();
        return true;
      }
      return false;
    };
    const backSubscription = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => backSubscription.remove();
  }, [profileOpen]);

  if (!hydrated) {
    return (
      <Root>
        <View className="flex-1 bg-background" />
      </Root>
    );
  }

  if (!hasSeenOnboarding) {
    return (
      <Root>
        <OnboardingScreen />
      </Root>
    );
  }

  return (
    <Root>
      <View className="flex-1">
        <Slot />
        {profileOpen ? (
          <View className="absolute inset-0">
            <ProfileScreen onClose={closeProfile} />
          </View>
        ) : null}
        {fact ? (
          <View className="absolute inset-0">
            <FactDetailsScreen />
          </View>
        ) : null}
        {monetize ? (
          <View className="absolute inset-0">
            <MonetizeScreen />
          </View>
        ) : null}
        {subscription ? (
          <View className="absolute inset-0">
            <SubscriptionScreen />
          </View>
        ) : null}
      </View>
    </Root>
  );
}
