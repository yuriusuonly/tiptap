import Head from "expo-router/head";
import {Link} from "expo-router";
import {StyleSheet, Text, View} from "react-native";
import {colors, radius, spacing, typography} from "../theme/colors";

export default () => {
  return (
    <>
      <Head>
        <title>404 — TipTap</title>
      </Head>
      <View style={styles.root}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.description}>
          The page you are looking for does not exist or has moved.
        </Text>
        <Link href="/" style={styles.link}>
          Back to TipTap
        </Link>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  code: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: "center",
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  link: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "600",
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
});
