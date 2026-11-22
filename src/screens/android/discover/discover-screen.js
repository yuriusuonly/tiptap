/**
 * Android Discover page: a vertical, paged feed of fact summaries with
 * Flutter-style fade entrances, pull-to-refresh and on-demand loading near the
 * end of the list. Tapping a fact records a streak activity and opens the
 * animated detail overlay.
 * @module src/screens/android/discover/discover-screen
 */
import {useCallback, useEffect, useState} from "react";
import {FlatList, Image, Pressable, RefreshControl, Share, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import Animated from "react-native-reanimated";
import Svg, {Defs, LinearGradient, Rect, Stop} from "react-native-svg";
import BookmarkIcon from "../../../assets/icons/bookmark.svg";
import LogoIcon from "../../../assets/icons/icon.svg";
import ShareIcon from "../../../assets/icons/share.svg";
import {fadeInDown, fadeInUp} from "../../../components/animations";
import {CircularProgress} from "../../../components/circular-progress";
import {Icon} from "../../../components/icon";
import {APP_NAME} from "../../../constants/configuration";
import {openProfile} from "../../../store/android-overlay-store";
import {useAuthStore} from "../../../store/auth-store";
import {useContentStore} from "../../../store/content-store";
import {useEntitlementStore} from "../../../store/entitlement-store";
import {openFact} from "../../../store/fact-store";
import {showToast} from "../../../store/toast-store";

/** Full-cover background graphic for the Discover page. */
function DiscoverBackground() {
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id="discoverBase" x1="0" y1="0" x2="0.6" y2="1">
            <Stop offset="0" stopColor="#0b1020" />
            <Stop offset="0.55" stopColor="#121826" />
            <Stop offset="1" stopColor="#0a0a12" />
          </LinearGradient>
          <LinearGradient id="discoverCyan" x1="0" y1="0.2" x2="1" y2="0.8">
            <Stop offset="0" stopColor="#25F4EE" stopOpacity="0.22" />
            <Stop offset="1" stopColor="#25F4EE" stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="discoverMagenta" x1="1" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FE2C55" stopOpacity="0.18" />
            <Stop offset="1" stopColor="#FE2C55" stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#discoverBase)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#discoverCyan)" />
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#discoverMagenta)" />
      </Svg>
    </View>
  );
}

function ActionButton({icon, label, onPress}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      className="h-10 w-10 items-center justify-center"
    >
      <Icon as={icon} size={26} color="#FFFFFF" accessibilityLabel={label} />
    </Pressable>
  );
}

function FactCard({fact, onOpen}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open fact: ${fact.title}`}
      onPress={onOpen}
      className="h-full w-full items-center justify-center px-6"
    >
      <Animated.View entering={fadeInUp()} className="max-w-[720px] items-center">
        <Text className="mb-6 text-center text-[24px] font-bold leading-[32px] text-white mobile:text-[28px] mobile:leading-[36px] tablet:text-[34px] tablet:leading-[44px]">
          {fact.title}
        </Text>
        <Text className="text-center text-[16px] leading-7 text-white/85 mobile:text-[18px] mobile:leading-8">
          {fact.summary}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function DiscoverScreen() {
  const {user} = useAuthStore();
  const {facts, loading, refreshing, error, loadMore, refresh} = useContentStore();
  const {bookmarks, recordActivity} = useEntitlementStore();
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [user?.uid]);

  useEffect(() => {
    loadMore(bookmarks);
    // Initial load only; later loads are driven by scrolling and pull-to-refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEndReached = useCallback(() => {
    loadMore(bookmarks);
  }, [bookmarks, loadMore]);

  const onRefresh = useCallback(() => {
    refresh(bookmarks);
  }, [bookmarks, refresh]);

  const openCurrentFact = useCallback(
    (fact) => {
      recordActivity(user?.uid);
      openFact(fact);
    },
    [recordActivity, user?.uid]
  );

  const share = async () => {
    try {
      await Share.share({message: `${APP_NAME} — tap. learn. impress.`});
    } catch {
      showToast("Something went wrong");
    }
  };

  const showUserPhoto = !!user?.photoURL && !photoFailed;

  return (
    <View className="flex-1 bg-[#0b1020]">
      <DiscoverBackground />
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="border-b border-white/10 px-4 pb-3 pt-2">
          <Animated.Text entering={fadeInDown()} className="text-[20px] font-bold text-white mobile:text-[24px]">
            {APP_NAME}
          </Animated.Text>
        </View>

        {facts.length === 0 && loading ? (
          <View className="flex-1 items-center justify-center">
            <CircularProgress />
          </View>
        ) : (
          <FlatList
            data={facts}
            keyExtractor={(fact) => fact.slug}
            pagingEnabled
            vertical
            showsVerticalScrollIndicator={false}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
            }
            renderItem={({item}) => (
              <View className="h-full w-full">
                <FactCard fact={item} onOpen={() => openCurrentFact(item)} />
              </View>
            )}
            ListFooterComponent={
              loading && facts.length > 0 ? (
                <View className="h-24 items-center justify-center">
                  <CircularProgress />
                </View>
              ) : null
            }
          />
        )}
        {error ? <Text className="px-4 py-2 text-center text-[13px] text-white/60">{error}</Text> : null}
      </SafeAreaView>

      <View pointerEvents="box-none" className="absolute bottom-6 right-4 items-end gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile and bookmarks"
          onPress={openProfile}
          className="h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10"
        >
          {showUserPhoto ? (
            <Image
              source={{uri: user.photoURL}}
              onError={() => setPhotoFailed(true)}
              className="h-14 w-14 rounded-full"
            />
          ) : (
            <Icon as={LogoIcon} size={32} accessibilityLabel={`${APP_NAME} logo`} />
          )}
        </Pressable>
        <ActionButton icon={BookmarkIcon} label="Bookmarks" onPress={openProfile} />
        <ActionButton icon={ShareIcon} label="Share" onPress={share} />
      </View>
    </View>
  );
}

export default DiscoverScreen;
