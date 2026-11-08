/**
 * Android Discover page: full-cover background with an app bar/title and
 * AI-generated content (title + paragraphs). Shows icon actions (Profile,
 * Bookmark, Share) in a bottom-right vertical layout.
 * @module src/screens/android/discover/discover-screen
 */
import {useEffect, useState} from "react";
import {Image, Pressable, ScrollView, Text, View} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import Svg, {Defs, LinearGradient, Rect, Stop} from "react-native-svg";
import BookmarkIcon from "../../../assets/icons/bookmark.svg";
import PersonIcon from "../../../assets/icons/person.svg";
import ShareIcon from "../../../assets/icons/share.svg";
import {Icon} from "../../../components/icon";
import {openProfile} from "../../../store/android-overlay-store";
import {useAuthStore} from "../../../store/auth-store";

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

export function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const {status, user} = useAuthStore();
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    setPhotoFailed(false);
  }, [user?.uid]);

  const showUserPhoto = status === "signedIn" && !!user?.photoURL && !photoFailed;

  return (
    <View className="flex-1 bg-[#0b1020]">
      <DiscoverBackground />
      <SafeAreaView edges={["top"]} className="flex-1">
        {/* App bar + title (AI-generated content title) */}
        <View
          accessibilityRole="header"
          className="border-b border-white/10 px-4 pb-3 pt-2 mobile:px-5 tablet:px-8 desktop:px-12"
        >
          <Text className="text-[22px] font-bold leading-[28px] text-white mobile:text-[26px] mobile:leading-[32px] tablet:text-[30px] tablet:leading-[38px]">
            Ideas That Find You at the Right Moment
          </Text>
        </View>

        {/* Content text in paragraph(s) */}
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-28 pt-4 mobile:px-5 tablet:px-8 desktop:px-12"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-[15px] leading-7 text-white/85 mobile:text-[16px] mobile:leading-7 tablet:text-[18px] tablet:leading-8">
            Great reading doesn’t always start with a search. Sometimes the most useful ideas
            surface when your interests, timing, and curiosity line up—turning a quick glance
            into something worth keeping.
          </Text>
          <Text className="mt-4 text-[15px] leading-7 text-white/85 mobile:text-[16px] mobile:leading-7 tablet:text-[18px] tablet:leading-8">
            This space will bring together AI-generated highlights shaped around what matters to
            you: clear titles, focused summaries, and content that’s easy to explore at your own
            pace. As your feed learns, each page becomes a starting point for deeper reading.
          </Text>
          <Text className="mt-4 text-[15px] leading-7 text-white/85 mobile:text-[16px] mobile:leading-7 tablet:text-[18px] tablet:leading-8">
            For now, consider this a preview of what’s ahead—a calm place where new perspectives
            can arrive, one story at a time.
          </Text>
        </ScrollView>
      </SafeAreaView>

      {/* Action buttons (bottom-right) */}
      <View
        pointerEvents="box-none"
        style={{bottom: insets.bottom + 16, right: 16}}
        className="absolute items-end gap-3"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile"
          onPress={openProfile}
          hitSlop={8}
          className="h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10"
        >
          {showUserPhoto ? (
            <Image
              source={{uri: user.photoURL}}
              onError={() => setPhotoFailed(true)}
              accessibilityLabel={`${user.displayName ?? "Account"} profile photo`}
              className="h-10 w-10 rounded-full"
            />
          ) : (
            <Icon as={PersonIcon} size={22} color="#FFFFFF" accessibilityLabel="Profile" />
          )}
        </Pressable>
        <ActionButton icon={BookmarkIcon} label="Bookmark" onPress={() => {}} />
        <ActionButton icon={ShareIcon} label="Share" onPress={() => {}} />
      </View>
    </View>
  );
}

export default DiscoverScreen;
