/**
 * Web landing page with a responsive hero layout. Styling is entirely
 * Nativewind/Tailwind; only the responsive logo size comes from layout tokens.
 * @module src/app/web/features/landing/landing-screen
 */
import Head from "expo-router/head";
import {useEffect, useState} from "react";
import {ScrollView, Text, View} from "react-native";
import LogoIcon from "../../../../shared/assets/icons/icon.svg";
import Icon from "../../../../shared/components/icon";
import {useResponsiveLayout} from "../../../../shared/hooks/use-responsive-layout";

const TITLE = "Create.\nShare.\nRepeat.";
const DESCRIPTION =
  "Tiptap is a TikTok-style feed powered by AI. Generate short videos, remix ideas, and discover what everyone is watching next.";

export function LandingScreen() {
  // Static export renders without a viewport, so start on the smallest layout
  // (matching the server HTML) and switch after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {tokens} = useResponsiveLayout({enabled: mounted});

  return (
    <View className="flex-1 overflow-hidden bg-background">
      <Head>
        <title>Tiptap — AI video, reimagined</title>
      </Head>

      <View
        pointerEvents="none"
        className="absolute left-[-90px] top-[-100px] h-[220px] w-[220px] rounded-full bg-cyan opacity-[0.14] mobile:left-[-120px] mobile:top-[-140px] mobile:h-[280px] mobile:w-[280px] mobile:opacity-[0.15] tablet:left-[-150px] tablet:top-[-180px] tablet:h-[360px] tablet:w-[360px] tablet:opacity-[0.16] desktop:left-[-160px] desktop:top-[-240px] desktop:h-[520px] desktop:w-[520px] desktop:opacity-[0.16]"
      />
      <View
        pointerEvents="none"
        className="absolute bottom-[-120px] right-[-100px] h-[260px] w-[260px] rounded-full bg-accent opacity-[0.14] mobile:bottom-[-160px] mobile:right-[-140px] mobile:h-[320px] mobile:w-[320px] mobile:opacity-[0.15] tablet:bottom-[-200px] tablet:right-[-160px] tablet:h-[420px] tablet:w-[420px] tablet:opacity-[0.16] desktop:bottom-[-280px] desktop:right-[-200px] desktop:h-[560px] desktop:w-[560px] desktop:opacity-[0.16]"
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="grow items-center justify-center px-4 py-6 mobile:px-5 mobile:py-8 tablet:px-8 tablet:py-12 desktop:px-12 desktop:py-16"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-[1280px] self-center">
          <View className="w-full flex-col items-center gap-6 mobile:gap-8 tablet:gap-10 desktop:flex-row desktop:items-stretch desktop:justify-center desktop:gap-16">
            <View className="w-full items-center justify-center desktop:flex-1">
              <View className="mb-6 flex-row items-center gap-2 rounded-full border border-line bg-surface px-3 py-1">
                <View className="h-1.5 w-1.5 rounded-full bg-accent" />
                <Text className="text-[11px] font-semibold leading-4 tracking-[1px] text-muted mobile:text-[12px] mobile:leading-[17px] mobile:tracking-[1.1px] tablet:text-[12px] tablet:leading-[18px] tablet:tracking-[1.2px] desktop:text-[13px] desktop:leading-[18px]">
                  AI VIDEO, REIMAGINED
                </Text>
              </View>

              <Text className="text-center text-[32px] font-extrabold leading-[36px] tracking-[-0.8px] text-ink mobile:text-[40px] mobile:leading-[44px] mobile:tracking-[-1.2px] tablet:text-[52px] tablet:leading-[56px] tablet:tracking-[-1.4px] desktop:text-[64px] desktop:leading-[66px] desktop:tracking-[-1.5px]">
                {TITLE}
              </Text>

              <Text className="mt-6 max-w-[300px] text-center text-[15px] leading-[22px] text-muted mobile:max-w-[420px] mobile:text-[16px] mobile:leading-6 tablet:max-w-[520px] tablet:text-[17px] tablet:leading-[26px] desktop:max-w-[460px] desktop:text-[18px] desktop:leading-7">
                {DESCRIPTION}
              </Text>

              <View className="mt-8 flex-row flex-wrap items-center justify-center gap-2">
                <Text className="text-[13px] font-medium leading-[18px] text-faint">Android</Text>
                <View className="h-[3px] w-[3px] rounded-full bg-faint" />
                <Text className="text-[13px] font-medium leading-[18px] text-faint">Web</Text>
                <View className="h-[3px] w-[3px] rounded-full bg-faint" />
                <Text className="text-[13px] font-medium leading-[18px] text-faint">
                  Early preview
                </Text>
              </View>
            </View>

            <View className="w-full items-center justify-center desktop:flex-1">
              <View className="h-[232px] w-[232px] items-center justify-center gap-3 overflow-hidden rounded-[24px] border border-line bg-surface p-4 shadow-[0_30px_80px_rgba(0,0,0,0.45)] mobile:h-[300px] mobile:w-[300px] mobile:gap-4 mobile:rounded-[28px] mobile:p-5 tablet:h-[360px] tablet:w-[360px] tablet:gap-5 tablet:rounded-[32px] tablet:p-6 desktop:h-[380px] desktop:w-[380px] desktop:gap-6 desktop:p-8">
                <View
                  pointerEvents="none"
                  className="absolute h-[160px] w-[160px] rounded-full bg-purple opacity-[0.22] mobile:h-[200px] mobile:w-[200px] tablet:h-[240px] tablet:w-[240px] desktop:h-[220px] desktop:w-[220px]"
                />
                <Icon as={LogoIcon} size={tokens.logoSize} accessibilityLabel="Tiptap logo" />
                <Text className="text-center text-[13px] font-semibold uppercase leading-[18px] tracking-[1.4px] text-faint">
                  Short video. Infinite ideas.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default LandingScreen;
