/**
 * Web root layout: root providers plus a headerless stack for the landing and
 * fallback routes. Android resolves `_layout.android.js` instead.
 * @module src/app/_layout
 */
import {Stack} from "expo-router";
import {AppProviders} from "../providers/app-providers";

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{headerShown: false, animation: "none"}} />
    </AppProviders>
  );
}
