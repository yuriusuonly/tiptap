/**
 * Android Profile tab content: centered preferences surface.
 * @module src/android/screens/profile/profile-screen
 */
import {View} from "react-native";
import {ProfilePreferences} from "./profile-preferences";

export function ProfileScreen() {
  return (
    <View className="flex-1 bg-background px-4 pt-6 phone:px-5 phone:pt-8 tablet:px-8 tablet:pt-12 desktop:px-12 desktop:pt-16">
      <View className="w-full max-w-[560px] self-center tablet:max-w-[640px] desktop:max-w-[720px]">
        <ProfilePreferences />
      </View>
    </View>
  );
}

export default ProfileScreen;
