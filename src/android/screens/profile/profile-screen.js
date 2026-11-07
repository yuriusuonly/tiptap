/**
 * Android Profile tab content: centered preferences surface.
 * Owns the overlay toast state for account action failures and renders it
 * centered at the bottom edge above the tab bar.
 * @module src/android/screens/profile/profile-screen
 */
import {useState} from "react";
import {View} from "react-native";
import {Toast} from "../../../shared/components/toast";
import {AccountSection} from "./account-section";
import {ProfilePreferences} from "./profile-preferences";

export function ProfileScreen() {
  const [toast, setToast] = useState(null);

  return (
    <View className="relative flex-1 bg-background px-4 pt-6 mobile:px-5 mobile:pt-8 tablet:px-8 tablet:pt-12 desktop:px-12 desktop:pt-16">
      <View className="w-full max-w-[560px] self-center tablet:max-w-[640px] desktop:max-w-[720px]">
        <AccountSection onActionFailed={setToast} />
        <View className="mt-4 mobile:mt-5 tablet:mt-6 desktop:mt-8">
          <ProfilePreferences />
        </View>
      </View>
      <Toast
        visible={!!toast}
        message={toast}
        onDismiss={() => setToast(null)}
        className="absolute bottom-4 left-1/2 w-[calc(100%-32px)] max-w-[568px] -translate-x-1/2"
      />
    </View>
  );
}

export default ProfileScreen;
