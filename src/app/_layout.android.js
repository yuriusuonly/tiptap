/**
 * Android root layout. `src/app/` holds only the root route files; Home and
 * Profile are internal tabs (state), not file-based routes. Home renders via
 * the `index` route (`Slot` -> `index.android.js`), Profile renders the
 * feature screen directly. First-time installs see the onboarding flow (three
 * pages) before the tabs. Web resolves `_layout.js` instead.
 * @module src/app/_layout.android
 */
import {Slot} from "expo-router";
import {useState} from "react";
import {View} from "react-native";
import {AppTabBar} from "../components/tab-bar";
import {OnboardingScreen} from "../screens/android/onboarding/onboarding-screen";
import {ProfileScreen} from "../screens/android/profile/profile-screen";
import {Root} from "../components/root";
import {useOnboardingStore} from "../store/onboarding-store";

export default function RootLayout() {
  const [tab, setTab] = useState("home");
  const hasSeenOnboarding = useOnboardingStore((state) => state.hasSeenOnboarding);
  const hydrated = useOnboardingStore((state) => state.hydrated);

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
        {tab === "home" ? <Slot /> : <ProfileScreen />}
        <AppTabBar selected={tab} onSelect={setTab} />
      </View>
    </Root>
  );
}
