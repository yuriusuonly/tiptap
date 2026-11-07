/**
 * Android root layout: file-based bottom tabs with the shared React Native tab
 * bar. Web resolves `_layout.js` instead. Home is the root `index` route;
 * Profile is the `android/features/profile/profile-screen` feature route
 * (there is no `profile.android.js` at the root, so web `/profile` stays
 * unmatched and renders `+not-found.js`).
 * @module src/app/_layout.android
 */
import {Tabs} from "expo-router";
import {AppTabBar} from "./android/components/app-tab-bar";
import {Root} from "../shared/components/root";

export default function RootLayout() {
  return (
    <Root>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{headerShown: false, animation: "none"}}
      >
        <Tabs.Screen name="index" options={{title: "Home"}} />
        <Tabs.Screen
          name="android/features/profile/profile-screen"
          options={{title: "Profile"}}
        />
      </Tabs>
    </Root>
  );
}
