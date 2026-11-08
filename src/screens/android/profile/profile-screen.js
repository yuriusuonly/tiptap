/**
 * Android Profile page: shows the header (user display name when signed in) and
 * a centered avatar with a Settings badge that reveals account/preferences in a
 * root-owned bottom sheet. When stacked over Discover (`onClose` provided), a
 * leading navigation icon button pops it from the stack.
 * @module src/screens/android/profile/profile-screen
 */
import {useEffect, useState} from "react";
import {Image, Pressable, Text, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg";
import LogoIcon from "../../../assets/icons/icon.svg";
import SettingsIcon from "../../../assets/icons/settings.svg";
import {openBottomSheet} from "../../../components/bottom-sheet";
import {Icon} from "../../../components/icon";
import {APP_NAME} from "../../../constants/configuration";
import {useAuthStore} from "../../../store/auth-store";
import {useResolvedTheme} from "../../../store/theme-store";
import {AccountSection} from "./account-section";
import {MoreSection} from "./more-section";
import {PreferencesSection} from "./preferences-section";

export function ProfileScreen({onClose} = {}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const insets = useSafeAreaInsets();
  const {status, user} = useAuthStore();
  const {palette} = useResolvedTheme();

  useEffect(() => {
    setPhotoFailed(false);
  }, [user?.uid]);

  const showUserPhoto = status === "signedIn" && !!user?.photoURL && !photoFailed;
  const avatarInitial = (user?.displayName ?? user?.email ?? "?").charAt(0).toUpperCase();
  const title = status === "signedIn" && user?.displayName ? user.displayName : APP_NAME;

  return (
    <View
      style={{paddingTop: insets.top}}
      className="flex-1 bg-background"
    >
      <View className="flex-row items-center px-2 pb-2 pt-1 mobile:px-3 tablet:px-6 desktop:px-10">
        {onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={onClose}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full"
          >
            <Icon as={ArrowBackIcon} size={24} color={palette.text} accessibilityLabel="Back" />
          </Pressable>
        ) : (
          <View className="h-10 w-10" />
        )}
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          className="flex-1 text-center text-[20px] font-bold leading-[28px] text-ink mobile:text-[22px] mobile:leading-[30px] tablet:text-[24px] tablet:leading-[32px]"
        >
          {title}
        </Text>
        <View className="h-10 w-10" />
      </View>

      <View className="w-full items-center px-4 mobile:px-5 tablet:px-8 desktop:px-12">
        <View className="mt-6 items-center mobile:mt-8 tablet:mt-10">
          <View className="relative">
            <View className="h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
              {showUserPhoto ? (
                <>
                  <Text className="text-[34px] font-semibold text-accent">
                    {avatarInitial}
                  </Text>
                  <Image
                    source={{uri: user.photoURL}}
                    onError={() => setPhotoFailed(true)}
                    accessibilityLabel={`${user.displayName ?? "Account"} profile photo`}
                    className="absolute inset-0 h-[100px] w-[100px]"
                  />
                </>
              ) : (
                <Icon as={LogoIcon} size={56} accessibilityLabel={`${APP_NAME} logo`} />
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Settings"
              onPress={() =>
                openBottomSheet(() => (
                  <>
                    <AccountSection />
                    <View className="mt-4 mobile:mt-5 tablet:mt-6 desktop:mt-8">
                      <PreferencesSection />
                    </View>
                    <MoreSection />
                  </>
                ))
              }
              className="absolute bottom-0 right-0 h-10 w-10 items-center justify-center rounded-full border-2 border-line bg-raised mobile:h-11 mobile:w-11"
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
    </View>
  );
}

export default ProfileScreen;
