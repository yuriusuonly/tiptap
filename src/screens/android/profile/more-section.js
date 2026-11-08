/**
 * Android "More" section: rows to contact support and open policy/terms/about
 * URLs. Failed URL opens surface via the root-owned toast (no inlined errors).
 * @module src/screens/android/profile/more-section
 */
import {Linking, Pressable, Text, View} from "react-native";
import {LANDING_PAGE_URL} from "../../../constants/configuration";
import {showToast} from "../../../store/toast-store";
import {ACTION_FAILED_MESSAGE} from "./account-section";

export function MoreSection() {
  const openUrl = async (url) => {
    try {
      await Linking.openURL(url);
    } catch {
      showToast(ACTION_FAILED_MESSAGE);
    }
  };

  return (
    <View>
      <Text className="mb-1 mt-4 text-[11px] font-bold uppercase tracking-[1.2px] text-muted mobile:mb-2 mobile:mt-5 mobile:text-[12px] tablet:mt-6 tablet:text-[12px] desktop:mb-3 desktop:mt-8 desktop:text-[13px]">
        More
      </Text>

      <View className="rounded-[20px] border border-line bg-surface p-2 tablet:p-3 desktop:p-4">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Contact"
          onPress={() => openUrl("mailto:yuriusu.dev@gmail.com")}
          className="flex-row items-center justify-between gap-3 py-1"
        >
          <View className="flex-1">
            <Text className="text-[16px] text-ink">Contact</Text>
            <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">Email support</Text>
          </View>
          <Text className="text-[14px] text-accent">↦</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Policy"
          onPress={() => openUrl(`${LANDING_PAGE_URL}/policy`)}
          className="mt-2 flex-row items-center justify-between gap-3 border-t border-line pt-2 py-1"
        >
          <View className="flex-1">
            <Text className="text-[16px] text-ink">Policy</Text>
            <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">View policy</Text>
          </View>
          <Text className="text-[14px] text-accent">↦</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Terms of Service"
          onPress={() => openUrl(`${LANDING_PAGE_URL}/terms`)}
          className="mt-2 flex-row items-center justify-between gap-3 border-t border-line pt-2 py-1"
        >
          <View className="flex-1">
            <Text className="text-[16px] text-ink">Terms</Text>
            <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">Terms of Service</Text>
          </View>
          <Text className="text-[14px] text-accent">↦</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="About"
          onPress={() => openUrl(LANDING_PAGE_URL)}
          className="mt-2 flex-row items-center justify-between gap-3 border-t border-line pt-2 py-1"
        >
          <View className="flex-1">
            <Text className="text-[16px] text-ink">About</Text>
            <Text className="mt-0.5 text-[13px] leading-[18px] text-muted">Open the landing page</Text>
          </View>
          <Text className="text-[14px] text-accent">↦</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default MoreSection;
