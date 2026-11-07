/**
 * Android preferences: a plain expandable theme selector (no animations) that
 * persists the chosen mode through the shared theme store, plus rows to open
 * the web landing page and contact support.
 * @module src/android/screens/profile/profile-preferences
 */
import {useState} from "react";
import {Linking, Pressable, Text, View} from "react-native";
import {APP_NAME, LANDING_PAGE_URL} from "../../../shared/constants/configuration";
import {THEME_MODES, useResolvedTheme, useThemeStore} from "../../../shared/store/theme-store";

export function ProfilePreferences() {
  const [expanded, setExpanded] = useState(false);
  const {themeMode} = useResolvedTheme();
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const currentMode = THEME_MODES.find((mode) => mode.value === themeMode) ?? THEME_MODES[0];

  const selectMode = (mode) => {
    setThemeMode(mode);
    setExpanded(false);
  };

  return (
    <View>
      <Text className="mb-1 text-[11px] font-bold uppercase tracking-[1.2px] text-muted mobile:mb-2 mobile:text-[12px] tablet:text-[12px] desktop:mb-3 desktop:text-[13px]">
        Preferences
      </Text>

      <View className="rounded-[20px] border border-line bg-surface p-2 tablet:p-3 desktop:p-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Theme"
          accessibilityState={{expanded}}
          onPress={() => setExpanded((open) => !open)}
          className="flex-row items-center justify-between gap-3 py-1"
        >
          <View className="flex-1">
            <Text className="text-[16px] text-ink">Theme</Text>
            <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">
              Light, dark, or match your system
            </Text>
          </View>
          <Text className="text-[14px] text-muted">{`${currentMode.label}  ▾`}</Text>
        </Pressable>

        {expanded ? (
          <View className="mt-2 border-t border-line pt-2">
            {THEME_MODES.map((mode) => {
              const selected = mode.value === themeMode;

              return (
                <Pressable
                  key={mode.value}
                  accessibilityRole="button"
                  accessibilityState={{selected}}
                  onPress={() => selectMode(mode.value)}
                  className={`flex-row items-center justify-between rounded-md px-2 py-2 ${
                    selected ? "bg-raised" : ""
                  }`}
                >
                  <Text
                    className={`text-[16px] ${
                      selected ? "font-semibold text-accent" : "text-ink"
                    }`}
                  >
                    {mode.label}
                  </Text>
                  {selected ? <Text className="text-[16px] text-accent">✓</Text> : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>

      <Text className="mb-1 mt-4 text-[11px] font-bold uppercase tracking-[1.2px] text-muted mobile:mb-2 mobile:mt-5 mobile:text-[12px] tablet:mt-6 tablet:text-[12px] desktop:mb-3 desktop:mt-8 desktop:text-[13px]">
        More
      </Text>

      <View className="rounded-[20px] border border-line bg-surface p-2 tablet:p-3 desktop:p-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`About ${APP_NAME}. Open the landing page.`}
          onPress={() => Linking.openURL(LANDING_PAGE_URL)}
          className="flex-row items-center justify-between gap-3 py-1"
        >
          <View className="flex-1">
            <Text className="text-[16px] text-ink">About {APP_NAME}</Text>
            <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">
              Open the landing page
            </Text>
          </View>
          <Text className="text-[14px] text-accent">↦</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Contact Support"
          onPress={() => Linking.openURL("mailto:yuriusu.dev@gmail.com")}
          className="mt-2 flex-row items-center justify-between gap-3 border-t border-line pt-2 py-1"
        >
          <View className="flex-1">
            <Text className="text-[16px] text-ink">Contact Support</Text>
            <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">
              Email support
            </Text>
          </View>
          <Text className="text-[14px] text-accent">↦</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default ProfilePreferences;
