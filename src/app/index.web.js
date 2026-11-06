import Head from "expo-router/head";
import {useEffect, useState} from "react";
import {ScrollView, StyleSheet, Text, View, useWindowDimensions} from "react-native";
import Logo from "../components/logo";
import {colors, layout, radius, spacing, typography} from "../theme/colors";

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
    <View style={styles.root}>
      <Head>
        <title>Tiptap — AI video, reimagined</title>
      </Head>

      <View pointerEvents="none" style={[styles.glow, styles.glowCyan, isDesktop && styles.glowCyanDesktop]} />
      <View pointerEvents="none" style={[styles.glow, styles.glowAccent, isDesktop && styles.glowAccentDesktop]} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {paddingHorizontal: gutter, paddingVertical: isDesktop ? spacing.xxxxl : spacing.xxxl},
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.content, {maxWidth: layout.maxWidth}]}>
          <View style={[styles.row, isDesktop ? styles.rowDesktop : styles.rowMobile]}>
            <View style={[styles.copyPane, isDesktop ? styles.copyPaneDesktop : styles.copyPaneMobile]}>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowLabel}>AI VIDEO, REIMAGINED</Text>
              </View>

              <Text style={[styles.title, isDesktop ? styles.titleDesktop : styles.titleMobile]}>{TITLE}</Text>

              <Text style={[styles.description, isDesktop ? styles.descriptionDesktop : styles.descriptionMobile]}>
                {DESCRIPTION}
              </Text>

              <View style={styles.metaRow}>
                <Text style={styles.metaText}>Android</Text>
                <View style={styles.metaDot} />
                <Text style={styles.metaText}>Web</Text>
                <View style={styles.metaDot} />
                <Text style={styles.metaText}>Early preview</Text>
              </View>
            </View>

            <View style={[styles.logoPane, isDesktop ? styles.logoPaneDesktop : styles.logoPaneMobile]}>
              <View pointerEvents="none" style={styles.logoHalo} />
              <Logo size={logoSize} />
              <Text style={styles.logoCaption}>Short video. Infinite ideas.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
  },
  row: {
    width: "100%",
  },
  rowDesktop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 64,
  },
  rowMobile: {
    flexDirection: "column",
    alignItems: "center",
    gap: 40,
  },
  copyPane: {
    width: "100%",
  },
  copyPaneDesktop: {
    flex: 1,
    maxWidth: 560,
    alignItems: "flex-start",
  },
  copyPaneMobile: {
    alignItems: "center",
  },
  eyebrow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginBottom: spacing.xl,
  },
  eyebrowDot: {
    width: 6,
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  eyebrowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: "600",
    letterSpacing: 1.2,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: "800",
    letterSpacing: -1.5,
  },
  titleDesktop: {
    fontSize: 64,
    lineHeight: 66,
  },
  titleMobile: {
    fontSize: 40,
    lineHeight: 42,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xl,
    maxWidth: 460,
  },
  descriptionDesktop: {
    fontSize: 18,
    lineHeight: 28,
  },
  descriptionMobile: {
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  metaText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "500",
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.textMuted,
  },
  logoPane: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: "hidden",
    boxShadow: "0 30px 80px rgba(0, 0, 0, 0.45)",
  },
  logoPaneDesktop: {
    width: 380,
    height: 380,
    padding: spacing.xxl,
    gap: spacing.xl,
  },
  logoPaneMobile: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 1,
    padding: spacing.xl,
    gap: spacing.lg,
  },
  logoHalo: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: radius.pill,
    backgroundColor: colors.accentPurple,
    opacity: 0.22,
  },
  logoCaption: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    textAlign: "center",
  },
  glow: {
    position: "absolute",
    borderRadius: radius.pill,
    opacity: 0.16,
  },
  glowCyan: {
    width: 320,
    height: 320,
    top: -140,
    left: -120,
    backgroundColor: colors.accentCyan,
  },
  glowCyanDesktop: {
    width: 520,
    height: 520,
    top: -240,
    left: -160,
  },
  glowAccent: {
    width: 360,
    height: 360,
    bottom: -180,
    right: -140,
    backgroundColor: colors.accent,
  },
  glowAccentDesktop: {
    width: 560,
    height: 560,
    bottom: -280,
    right: -200,
  },
});
