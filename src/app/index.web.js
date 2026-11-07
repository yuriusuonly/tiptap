import Head from "expo-router/head";
import {useEffect, useState} from "react";
import {ScrollView, Text, View, useWindowDimensions} from "react-native";
import AppLogo from "../components/app-logo";
import Icon from "../components/icon";
import {layout, spacing} from "../theme/colors";

const TITLE = "Create.\nShare.\nRepeat.";
const DESCRIPTION =
  "Tiptap is a TikTok-style feed powered by AI. Generate short videos, remix ideas, and discover what everyone is watching next.";

export default function IndexWeb() {
  const {width} = useWindowDimensions();
  // Static export renders without a viewport, so start stacked (matching the
  // server HTML) and switch to the desktop layout after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDesktop = mounted && width >= layout.desktopBreakpoint;
  const gutter = isDesktop ? layout.gutter : layout.gutterMobile;
  const logoSize = isDesktop ? 260 : 180;

  return (
    <View className="flex-1 overflow-hidden bg-canvas">
      <Head>
        <title>Tiptap — AI video, reimagined</title>
      </Head>

      <View
        pointerEvents="none"
        className={`absolute rounded-full bg-cyan opacity-[0.16] ${
          isDesktop
            ? "-left-[160px] -top-[240px] h-[520px] w-[520px]"
            : "-left-[120px] -top-[140px] h-[320px] w-[320px]"
        }`}
      />
      <View
        pointerEvents="none"
        className={`absolute rounded-full bg-accent opacity-[0.16] ${
          isDesktop
            ? "-bottom-[280px] -right-[200px] h-[560px] w-[560px]"
            : "-bottom-[180px] -right-[140px] h-[360px] w-[360px]"
        }`}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: gutter,
          paddingVertical: isDesktop ? spacing.xxxxl : spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full" style={{maxWidth: layout.maxWidth}}>
          <View
            className={
              isDesktop
                ? "w-full flex-row items-center justify-between gap-16"
                : "w-full flex-col items-center gap-10"
            }
          >
            <View
              className={
                isDesktop ? "w-full max-w-[560px] flex-1 items-start" : "w-full items-center"
              }
            >
              <View className="mb-6 flex-row items-center gap-2 rounded-full border border-line bg-surface px-3 py-1">
                <View className="h-1.5 w-1.5 rounded-full bg-accent" />
                <Text className="text-[13px] font-semibold leading-[18px] tracking-[1.2px] text-muted">
                  AI VIDEO, REIMAGINED
                </Text>
              </View>

              <Text
                className={`font-extrabold tracking-[-1.5px] text-ink ${
                  isDesktop ? "text-[64px] leading-[66px]" : "text-center text-[40px] leading-[42px]"
                }`}
              >
                {TITLE}
              </Text>

              <Text
                className={`mt-6 max-w-[460px] text-base leading-6 text-muted ${
                  isDesktop ? "text-[18px] leading-[28px]" : "text-center"
                }`}
              >
                {DESCRIPTION}
              </Text>

              <View className="mt-8 flex-row flex-wrap items-center gap-2">
                <Text className="text-[13px] font-medium leading-[18px] text-faint">Android</Text>
                <View className="h-[3px] w-[3px] rounded-full bg-faint" />
                <Text className="text-[13px] font-medium leading-[18px] text-faint">Web</Text>
                <View className="h-[3px] w-[3px] rounded-full bg-faint" />
                <Text className="text-[13px] font-medium leading-[18px] text-faint">
                  Early preview
                </Text>
              </View>
            </View>

            <View
              className={`items-center justify-center overflow-hidden border border-line bg-surface ${
                isDesktop
                  ? "h-[380px] w-[380px] gap-6 rounded-[32px] p-8"
                  : "aspect-square w-full max-w-[320px] gap-4 rounded-[32px] p-6"
              }`}
              style={{boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)"}}
            >
              <View
                pointerEvents="none"
                className="absolute h-[220px] w-[220px] rounded-full bg-purple opacity-[0.22]"
              />
              <Icon as={AppLogo} size={logoSize} accessibilityLabel="Tiptap logo" />
              <Text className="text-center text-[13px] font-semibold uppercase leading-[18px] tracking-[1.4px] text-faint">
                Short video. Infinite ideas.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
