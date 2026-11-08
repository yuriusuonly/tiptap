/**
 * Android Profile tab: default view shows the app name header and a centered
 * avatar (app logo by default, user photo when signed in) with a Settings
 * badge that reveals the account/preferences content in a draggable bottom
 * sheet (instant reveal, no entrance transition). Toasts are root-owned.
 * @module src/android/screens/profile/profile-screen
 */
import {useEffect, useState} from "react";
import {Image, Pressable, Text, View} from "react-native";
import LogoIcon from "../../../assets/icons/icon.svg";
import SettingsIcon from "../../../assets/icons/settings.svg";
import {BottomSheet} from "../../components/bottom-sheet";
import {Icon} from "../../../components/icon";
import {APP_NAME} from "../../../constants/configuration";
import {useAuthStore} from "../../../store/auth-store";
import {useResolvedTheme} from "../../../store/theme-store";
import {AccountSection} from "./account-section";
import {ProfilePreferences} from "./profile-preferences";

export function ProfileScreen() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [photoFailed, setPhotoFailed] = useState(false);
  const {status, user} = useAuthStore();
  const {palette} = useResolvedTheme();

  useEffect(() => {
    setPhotoFailed(false);
  }, [user?.uid]);

  const showUserPhoto = status === "signedIn" && !!user?.photoURL && !photoFailed;
  const avatarInitial = (user?.displayName ?? user?.email ?? "?").charAt(0).toUpperCase();

  return (
    <View className="flex-1 bg-background px-4 pt-6 mobile:px-5 mobile:pt-8 tablet:px-8 tablet:pt-10 desktop:px-12 desktop:pt-12">
      <View className="w-full items-center">
        <Text
          accessibilityRole="header"
          className="text-center text-[20px] font-bold leading-[28px] text-ink mobile:text-[22px] mobile:leading-[30px] tablet:text-[24px] tablet:leading-[32px]"
        >
          {APP_NAME}
        </Text>

        <View className="mt-8 items-center mobile:mt-10 tablet:mt-12">
          <View className="relative">
            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-line bg-surface mobile:h-32 mobile:w-32 tablet:h-36 tablet:w-36 desktop:h-40 desktop:w-40">
              {showUserPhoto ? (
                <>
                  <Text className="text-[34px] font-semibold text-accent mobile:text-[38px] tablet:text-[42px] desktop:text-[48px]">
                    {avatarInitial}
                  </Text>
                  <Image
                    source={{uri: user.photoURL}}
                    onError={() => setPhotoFailed(true)}
                    accessibilityLabel={`${user.displayName ?? "Account"} profile photo`}
                    className="absolute inset-0 h-28 w-28 mobile:h-32 mobile:w-32 tablet:h-36 tablet:w-36 desktop:h-40 desktop:w-40"
                  />
                </>
              ) : (
                <Icon as={LogoIcon} size={72} accessibilityLabel={`${APP_NAME} logo`} />
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() => setSettingsOpen(true)}
              className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border border-line bg-raised mobile:h-11 mobile:w-11"
            >
              <Icon
                as={SettingsIcon}
                size={20}
                color={palette.textSecondary}
                accessibilityLabel="Settings"
              />
            </Pressable>
          </View>
        </View>
      </View>

      <BottomSheet visible={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <AccountSection />
        <View className="mt-4 mobile:mt-5 tablet:mt-6 desktop:mt-8">
          <ProfilePreferences />
        </View>
      </BottomSheet>
    </View>
  );
}

export default ProfileScreen;
