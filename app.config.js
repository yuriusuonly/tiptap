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

export default {
  name: env.EXPO_PUBLIC_APP_NAME,
  slug: "tiptap",
  scheme: "tiptap",
  icon: "./src/shared/assets/images/icon.png",
  userInterfaceStyle: "automatic",
  android: {
    package: "dev.yuriusu.tiptap",
    icon: "./src/shared/assets/images/icon.png",
    googleServicesFile: "./google-services.json",
  },
  ios: {
    bundleIdentifier: "dev.yuriusu.tiptap",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./src/shared/assets/images/icon.png",
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
    [
      "expo-router",
      {
        sitemap: false,
      },
    ],
    "expo-status-bar",
    "@react-native-firebase/app",
    "@react-native-firebase/auth",
    "@react-native-firebase/messaging",
    "@react-native-google-signin/google-signin",
  ],
  extra: {
    eas: {
      projectId: env.EXPO_PUBLIC_EAS_PROJECT_ID,
    },
  },
};
