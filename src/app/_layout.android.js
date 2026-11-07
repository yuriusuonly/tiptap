/**
 * Android root layout: file-based bottom tabs with the shared React Native tab
 * bar. Web resolves `_layout.js` instead.
 * @module src/app/_layout.android
 */
import {Tabs} from "expo-router";
import {AppTabBar} from "../android/components/app-tab-bar";
import {AppProviders} from "../shared/providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{headerShown: false, animation: "none"}}
      >
        <Tabs.Screen name="index" options={{title: "Home"}} />
        <Tabs.Screen name="profile" options={{title: "Profile"}} />
      </Tabs>
    </AppProviders>
  );
}
