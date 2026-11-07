/**
 * Android root layout. `src/app/` holds only the root route files; Home and
 * Profile are internal tabs (state), not file-based routes. Home renders via
 * the `index` route (`Slot` -> `index.android.js`), Profile renders the
 * feature screen directly. Web resolves `_layout.js` instead.
 * @module src/app/_layout.android
 */
import {Slot} from "expo-router";
import {useState} from "react";
import {View} from "react-native";
import {AppTabBar} from "../android/components/app-tab-bar";
import {ProfileScreen} from "../android/features/profile/profile-screen";
import {Root} from "../shared/components/root";

export default function RootLayout() {
  const [tab, setTab] = useState("home");

  return (
    <Root>
      <View className="flex-1">
        {tab === "home" ? <Slot /> : <ProfileScreen />}
        <AppTabBar selected={tab} onSelect={setTab} />
      </View>
    </Root>
  );
}
