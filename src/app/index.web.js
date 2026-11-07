import Head from "expo-router/head";
import {useEffect, useState} from "react";
import {ScrollView, Text, View} from "react-native";
import AppLogo from "../components/app-logo";
import Icon from "../components/icon";
import {useResponsiveLayout} from "../hooks/use-responsive-layout";
import {colors} from "../theme/colors";
import {contentMaxWidth} from "../theme/layout";

const TITLE = "Create.\nShare.\nRepeat.";
const DESCRIPTION =
  "Tiptap is a TikTok-style feed powered by AI. Generate short videos, remix ideas, and discover what everyone is watching next.";

export default function IndexWeb() {
  // Static export renders without a viewport, so start on the smallest layout
  // (matching the server HTML) and switch after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {tokens, isDesktop} = useResponsiveLayout({enabled: mounted});
  const {eyebrow, title, description, logoCard, blobs, gap} = tokens;
  const centered = !isDesktop;

  return (
    <View className="flex-1 overflow-hidden bg-canvas">
      <Head>
        <title>Tiptap — AI video, reimagined</title>
      </Head>

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: blobs.primary.size,
          height: blobs.primary.size,
          borderRadius: blobs.primary.size / 2,
          top: blobs.primary.top,
          left: blobs.primary.left,
          backgroundColor: colors.accentCyan,
          opacity: blobs.primary.opacity,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: blobs.secondary.size,
          height: blobs.secondary.size,
          borderRadius: blobs.secondary.size / 2,
          bottom: blobs.secondary.bottom,
          right: blobs.secondary.right,
          backgroundColor: colors.accent,
          opacity: blobs.secondary.opacity,
        }}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: tokens.gutter,
          paddingVertical: tokens.pagePaddingVertical,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full" style={{maxWidth: contentMaxWidth}}>
          <View
            className={`w-full ${
              isDesktop ? "flex-row items-center justify-between" : "flex-col items-center"
            }`}
            style={{gap}}
          >
            <View
              className={isDesktop ? "flex-1 items-start" : "w-full items-center"}
              style={isDesktop ? {maxWidth: 560} : undefined}
            >
              <View className="mb-6 flex-row items-center gap-2 rounded-full border border-line bg-surface px-3 py-1">
                <View className="h-1.5 w-1.5 rounded-full bg-accent" />
                <Text
                  className="font-semibold text-muted"
                  style={{
                    fontSize: eyebrow.fontSize,
                    lineHeight: eyebrow.lineHeight,
                    letterSpacing: eyebrow.letterSpacing,
                  }}
                >
                  AI VIDEO, REIMAGINED
                </Text>
              </View>

              <Text
                className={`font-extrabold text-ink ${centered ? "text-center" : ""}`}
                style={{
                  fontSize: title.fontSize,
                  lineHeight: title.lineHeight,
                  letterSpacing: title.letterSpacing,
                }}
              >
                {TITLE}
              </Text>

              <Text
                className={`mt-6 text-muted ${centered ? "text-center" : ""}`}
                style={{
                  fontSize: description.fontSize,
                  lineHeight: description.lineHeight,
                  maxWidth: description.maxWidth,
                }}
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
              className="items-center justify-center overflow-hidden border border-line bg-surface"
              style={{
                width: logoCard.size,
                height: logoCard.size,
                borderRadius: logoCard.radius,
                padding: logoCard.padding,
                gap: logoCard.gap,
                boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)",
              }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  width: tokens.haloSize,
                  height: tokens.haloSize,
                  borderRadius: tokens.haloSize / 2,
                  backgroundColor: colors.accentPurple,
                  opacity: 0.22,
                }}
              />
              <Icon as={AppLogo} size={tokens.logoSize} accessibilityLabel="Tiptap logo" />
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
