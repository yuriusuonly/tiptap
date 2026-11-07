/**
 * Android Profile tab content: centered preferences surface.
 * @module src/android/features/profile/profile-screen
 */
import {View} from "react-native";
import {AccountSection} from "./account-section";
import {ProfilePreferences} from "./profile-preferences";

export function ProfileScreen() {
  return (
    <View className="flex-1 bg-background px-4 pt-6 mobile:px-5 mobile:pt-8 tablet:px-8 tablet:pt-12 desktop:px-12 desktop:pt-16">
      <View className="w-full max-w-[560px] self-center tablet:max-w-[640px] desktop:max-w-[720px]">
        <AccountSection />
        <View className="mt-4 mobile:mt-5 tablet:mt-6 desktop:mt-8">
          <ProfilePreferences />
        </View>
      </View>
    </View>
  );
}

export default ProfileScreen;
