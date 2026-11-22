/**
 * Android Profile page: shows the header (user display name when signed in) and
 * a centered avatar with a Settings badge that reveals account/preferences in a
 * root-owned bottom sheet. When stacked over Discover (`onClose` provided), a
 * leading navigation icon button pops it from the stack.
 * @module src/screens/android/profile/profile-screen
 */
import {Text} from "../../../components/text";
import {useEffect, useState} from "react";
import {Image, Pressable, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import ArrowBackIcon from "../../../assets/icons/arrow-back.svg";
import LogoIcon from "../../../assets/icons/icon.svg";
import SettingsIcon from "../../../assets/icons/settings.svg";
import {openBottomSheet} from "../../../components/bottom-sheet";
import {Icon} from "../../../components/icon";
import {APP_NAME} from "../../../constants/configuration";
import {useAuthStore} from "../../../store/auth-store";
import {useEntitlementStore} from "../../../store/entitlement-store";
import {openSubscription} from "../../../store/fact-store";
import {useResolvedTheme} from "../../../store/theme-store";
import {AccountSection} from "./account-section";
import {MoreSection} from "./more-section";
import {PreferencesSection} from "./preferences-section";

export function ProfileScreen({onClose} = {}) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const insets = useSafeAreaInsets();
  const {status, user} = useAuthStore();
  const {premium, gems, bookmarks, streak} = useEntitlementStore();
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
      className="flex-1 bg-background pb-20"
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
            <View className="h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-line bg-surface">
              {showUserPhoto ? (
                <>
                  <Text className="text-[28px] font-semibold text-accent">
                    {avatarInitial}
                  </Text>
                  <Image
                    source={{uri: user.photoURL}}
                    onError={() => setPhotoFailed(true)}
                    accessibilityLabel={`${user.displayName ?? "Account"} profile photo`}
                    className="absolute inset-0 h-20 w-20"
                  />
                </>
              ) : (
                <Icon as={LogoIcon} size={46} accessibilityLabel={`${APP_NAME} logo`} />
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
              className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-4 border-background bg-accent"
            >
              <Icon
                as={SettingsIcon}
                size={16}
                color={palette.background}
                accessibilityLabel="Settings"
              />
            </Pressable>
          </View>
        </View>
      </View>

      <View className="mx-4 mt-6 flex-row items-center justify-around rounded-[20px] border border-line bg-surface py-4 mobile:mx-5 tablet:mx-8 desktop:mx-12">
        {[
          {value: gems, label: "Gems"},
          {value: bookmarks.length, label: "Saved"},
          {value: streak?.count ?? 0, label: "Streak"},
        ].map((stat) => (
          <View key={stat.label} className="items-center">
            <Text className="text-[22px] font-bold leading-7 text-accent">{stat.value}</Text>
            <Text className="mt-1 text-[12px] text-muted">{stat.label}</Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={premium ? "Premium active" : "Upgrade to Premium"}
        onPress={openSubscription}
        className="mx-4 mt-4 flex-row items-center justify-between rounded-[20px] border border-line bg-surface p-4 mobile:mx-5 tablet:mx-8 desktop:mx-12"
      >
        <View>
          <Text className="text-[16px] font-semibold text-ink">
            {premium ? "Premium active" : "Upgrade to Premium"}
          </Text>
          <Text className="mt-0.5 text-[13px] text-muted">
            {premium ? "Unlimited saves and no ads" : "Unlock unlimited saves"}
          </Text>
        </View>
        <Text className="text-[15px] text-accent">{premium ? "✓" : "→"}</Text>
      </Pressable>
    </View>
  );
}

export default ProfileScreen;
