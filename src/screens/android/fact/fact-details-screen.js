/**
 * Animated fact detail overlay (equivalent to Flutter's pushed fact route).
 * Uses a shared-axis entrance and staggered fades for title and body. The
 * bookmark action is gated: premium or previously rewarded facts can be saved
 * directly, otherwise the monetization overlay is opened.
 * @module src/screens/android/fact/fact-details-screen
 */
import {Text} from "../../../components/text";
import {Pressable, View} from "react-native";
import Animated from "react-native-reanimated";
import BackIcon from "../../../assets/icons/arrow-back.svg";
import BookmarkIcon from "../../../assets/icons/bookmark.svg";
import CloseIcon from "../../../assets/icons/close.svg";
import {fadeInDown, fadeInUp, SharedAxis} from "../../../components/animations";
import {Icon} from "../../../components/icon";
import {useAuthStore} from "../../../store/auth-store";
import {useEntitlementStore} from "../../../store/entitlement-store";
import {closeFact, openMonetize, useFactStore} from "../../../store/fact-store";
import {showToast} from "../../../store/toast-store";

export function FactDetailsScreen() {
  const fact = useFactStore((state) => state.fact);
  const {premium, bookmarks, toggleBookmark} = useEntitlementStore();
  const {user} = useAuthStore();

  if (!fact) return null;
  const unlocked = premium || !!fact.rewarded;
  const isBookmarked = bookmarks.includes(fact.slug);

  const onBookmark = () => {
    if (!unlocked) {
      openMonetize();
      return;
    }
    if (!user?.uid) {
      showToast("Sign in to save facts.");
      return;
    }
    toggleBookmark(user.uid, fact.slug);
  };

  return (
    <SharedAxis className="absolute inset-0 bg-background">
      <View className="flex-row items-center justify-between px-2 pb-2 pt-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={closeFact}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <Icon as={BackIcon} size={24} accessibilityLabel="Back" />
        </Pressable>
        <Text className="text-[16px] font-semibold text-muted">Fact</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isBookmarked ? "Remove bookmark" : "Save fact"}
          onPress={onBookmark}
          className="h-11 w-11 items-center justify-center rounded-full"
        >
          <Icon
            as={BookmarkIcon}
            size={24}
            color={isBookmarked ? "#25F4EE" : undefined}
            accessibilityLabel={isBookmarked ? "Bookmarked" : "Save fact"}
          />
        </Pressable>
      </View>

      <Animated.ScrollView
        className="flex-1"
        contentContainerClassName="grow items-center justify-center px-6 pb-24 pt-4"
      >
        <Animated.Text
          entering={fadeInDown(120)}
          className="mb-6 text-center text-[26px] font-bold leading-[34px] text-ink mobile:text-[30px] mobile:leading-[38px]"
        >
          {fact.title}
        </Animated.Text>
        <Animated.Text
          entering={fadeInUp(260)}
          className="text-center text-[16px] leading-7 text-muted mobile:text-[18px] mobile:leading-8"
        >
          {fact.body}
        </Animated.Text>
      </Animated.ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close fact"
        onPress={closeFact}
        className="absolute bottom-8 left-1/2 h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent"
      >
        <Icon as={CloseIcon} size={24} color="#0A0A0A" accessibilityLabel="Close fact" />
      </Pressable>
    </SharedAxis>
  );
}

export default FactDetailsScreen;
