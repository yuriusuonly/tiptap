/**
 * Android Profile tab content: centered preferences surface.
 * Owns the overlay snackbar state for account action failures and renders
 * it above the tab bar (absolute, bottom-anchored within this flex-1 root).
 * @module src/android/screens/profile/profile-screen
 */
import {useState} from "react";
import {View} from "react-native";
import {Snackbar} from "../../../shared/components/snackbar";
import {AccountSection} from "./account-section";
import {ProfilePreferences} from "./profile-preferences";

export function ProfileScreen() {
  const [snackbar, setSnackbar] = useState(null);

  return (
    <View className="relative flex-1 bg-background px-4 pt-6 mobile:px-5 mobile:pt-8 tablet:px-8 tablet:pt-12 desktop:px-12 desktop:pt-16">
      <View className="w-full max-w-[560px] self-center tablet:max-w-[640px] desktop:max-w-[720px]">
        <AccountSection onActionFailed={setSnackbar} />
        <View className="mt-4 mobile:mt-5 tablet:mt-6 desktop:mt-8">
          <ProfilePreferences />
        </View>
      </View>
      <Snackbar
        visible={!!snackbar}
        message={snackbar}
        onDismiss={() => setSnackbar(null)}
        className="absolute inset-x-4 bottom-4 tablet:right-auto tablet:left-4 tablet:max-w-[568px] tablet:min-w-[288px]"
      />
    </View>
  );
}

export default ProfileScreen;
