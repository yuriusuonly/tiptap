/**
 * Android root layout. `src/app/` holds only the root route files. Discover
 * renders via the `index` route (`Slot` -> `index.android.js`); Profile is
 * stacked on top of Discover when opened (internal overlay state). No bottom
 * tab bar. First-time installs see the login/onboarding gate before content.
 * Web resolves `_layout.js` instead.
 * @module src/app/_layout.android
 */
import {Slot} from "expo-router";
import {useEffect} from "react";
import {BackHandler, View} from "react-native";
import {OnboardingScreen} from "../screens/android/onboarding/onboarding-screen";
import {ProfileScreen} from "../screens/android/profile/profile-screen";
import {Root} from "../components/root";
import {closeProfile, useAndroidOverlayStore} from "../store/android-overlay-store";
import {useOnboardingStore} from "../store/onboarding-store";

export default function RootLayout() {
  const profileOpen = useAndroidOverlayStore((state) => state.profileOpen);
  const hasSeenOnboarding = useOnboardingStore((state) => state.hasSeenOnboarding);
  const hydrated = useOnboardingStore((state) => state.hydrated);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const onBack = () => {
      closeProfile();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => subscription.remove();
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
      </View>
    </Root>
  );
}
