/**
 * Monetization gate shown when a free fact is saved. Two options mirror the
 * Flutter app: spend a gem (server-authoritative) or watch a rewarded ad.
 * Gems from ads are credited by AdMob's server-to-server callback, never by
 * this screen; after an ad we simply refresh the authoritative state.
 * @module src/screens/android/fact/monetize-screen
 */
import {useState} from "react";
import {Pressable, Text, View} from "react-native";
import Animated from "react-native-reanimated";
import BookmarkIcon from "../../../assets/icons/bookmark.svg";
import LogoIcon from "../../../assets/icons/icon.svg";
import {fadeInDown, fadeInUp, SharedAxis} from "../../../components/animations";
import {CircularProgress} from "../../../components/circular-progress";
import {Icon} from "../../../components/icon";
import {recordTestReward} from "../../../services/api/entitlements";
import {showRewardedAd} from "../../../services/ads/rewarded-ad";
import {useAuthStore} from "../../../store/auth-store";
import {useContentStore} from "../../../store/content-store";
import {useEntitlementStore} from "../../../store/entitlement-store";
import {closeMonetize, openFact, useFactStore} from "../../../store/fact-store";
import {showToast} from "../../../store/toast-store";

function Option({icon, title, subtitle, badge, busy, disabled, onPress, delay}) {
  return (
    <Animated.View entering={fadeInUp(delay)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        disabled={busy || disabled}
        onPress={onPress}
        className={`flex-row items-center gap-4 rounded-[20px] border border-line bg-surface p-5 ${
          busy || disabled ? "opacity-60" : ""
        }`}
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-raised">
          {busy ? <CircularProgress /> : <Icon as={icon} size={28} />}
        </View>
        <View className="flex-1">
          <Text className="text-[17px] font-semibold text-ink">{title}</Text>
          <Text className="mt-1 text-[13px] leading-[18px] text-muted">{subtitle}</Text>
        </View>
        {badge ? <Text className="text-[14px] font-semibold text-accent">{badge}</Text> : null}
      </Pressable>
    </Animated.View>
  );
}

export function MonetizeScreen() {
  const fact = useFactStore((state) => state.fact);
  const {user} = useAuthStore();
  const {gems, spendGem, sync} = useEntitlementStore();
  const markRewarded = useContentStore((state) => state.markRewarded);
  const [busy, setBusy] = useState(false);

  if (!fact) return null;

  const unlock = () => {
    const unlockedFact = {...fact, rewarded: true};
    markRewarded(fact.title);
    openFact(unlockedFact);
    closeMonetize();
    showToast("Fact unlocked");
  };

  const onUseGem = async () => {
    if (busy) return;
    if (gems < 1) {
      showToast("Not enough gems. Watch an ad to earn one.");
      return;
    }
    setBusy(true);
    try {
      if (await spendGem(fact.title)) unlock();
      else showToast("Not enough gems. Watch an ad to earn one.");
    } finally {
      setBusy(false);
    }
  };

  const onWatchAd = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const earned = await showRewardedAd();
      if (!earned) {
        showToast("Ad not completed. Please try again.");
        return;
      }
      await recordTestReward();
      await sync(user?.uid);
      unlock();
    } catch {
      showToast("Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SharedAxis className="absolute inset-0 bg-background" direction="vertical">
      <View className="flex-row items-center justify-between px-4 pb-2 pt-4">
        <Text className="text-[20px] font-bold text-ink">Unlock this fact</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          disabled={busy}
          onPress={closeMonetize}
          className="h-10 w-10 items-center justify-center rounded-full bg-raised"
        >
          <Text className="text-[18px] text-muted">✕</Text>
        </Pressable>
      </View>

      <View className="flex-1 justify-center gap-4 px-4 pb-20">
        <Animated.View entering={fadeInDown()} className="items-center gap-3 pb-4">
          <Icon as={LogoIcon} size={56} />
          <Text className="text-center text-[15px] leading-6 text-muted">
            Save this fact for offline reading. Spend a gem or watch a short ad to unlock it.
          </Text>
        </Animated.View>

        <Option
          icon={BookmarkIcon}
          title="Use 1 gem"
          subtitle="Spend a gem to save this fact instantly"
          badge={`${gems} gems`}
          busy={busy}
          disabled={gems < 1}
          onPress={onUseGem}
          delay={100}
        />
        <Option
          icon={LogoIcon}
          title="Watch an ad"
          subtitle="Earn a gem and unlock this fact"
          busy={busy}
          onPress={onWatchAd}
          delay={180}
        />
      </View>
    </SharedAxis>
  );
}

export default MonetizeScreen;
