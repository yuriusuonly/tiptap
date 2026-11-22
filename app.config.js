/**
 * Expo app config (replaces app.json). The app name and EAS project ID come
 * from `.env` (the single source of truth), read here at config-eval time in
 * Node. All other values mirror the previous static config.
 * @module app.config
 */
import fs from "node:fs";
import path from "node:path";

const envText = fs.readFileSync(path.join(import.meta.dirname, ".env"), "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    })
);

if (!env.EXPO_PUBLIC_APP_NAME || !env.EXPO_PUBLIC_EAS_PROJECT_ID) {
  throw new Error(
    "Missing EXPO_PUBLIC_APP_NAME or EXPO_PUBLIC_EAS_PROJECT_ID in `.env` " +
      "at the workspace root."
  );
}

// Origin used by native production builds for relative `fetch('/api/...')`.
// `process.env` wins when Expo has already inflated `.env`, with a fallback for
// direct config evaluation (EAS, scripts). Undefined is a no-op for the plugin.
const apiOrigin =
  process.env.EXPO_PUBLIC_API_ORIGIN || env.EXPO_PUBLIC_API_ORIGIN || undefined;
const admobAndroidAppId =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
  env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ||
  undefined;

/**
 * Expo Router API routes (`src/app/api/**+api.js`) require `web.output:
 * "server"` on SDK 57 — the CLI skips API-route exports in `static` mode.
 * `origin` lets native production builds resolve relative `/api/...` fetches
 * to the deployed server.
 */
const routerOptions = {
  sitemap: false,
  ...(apiOrigin ? { origin: apiOrigin } : {}),
};

export default {
  name: env.EXPO_PUBLIC_APP_NAME,
  slug: "tiptap",
  scheme: "tiptap",
  icon: "./src/assets/images/icon.png",
  userInterfaceStyle: "automatic",
  android: {
    package: "dev.yuriusu.tiptap",
    icon: "./src/assets/images/icon.png",
    googleServicesFile: "./google-services.json",
  },
  ios: {
    bundleIdentifier: "dev.yuriusu.tiptap",
  },
  web: {
    bundler: "metro",
    // Required for Expo Router API routes on SDK 57.
    output: "server",
    favicon: "./src/assets/images/icon.png",
  },
  plugins: [
    [
      "expo-build-properties",
      {
        android: {
          buildArchs: ["x86_64"],
        },
      },
    ],
    ["expo-router", routerOptions],
    "expo-status-bar",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@react-native-firebase/messaging",
    "@react-native-google-signin/google-signin",
    // Missing androidAppId during static rendering only produces a warning.
    ["react-native-google-mobile-ads", { androidAppId: admobAndroidAppId }],
    "expo-iap",
  ],
  extra: {
    eas: {
      projectId: env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
};
