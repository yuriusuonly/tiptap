/**
 * Web root layout: shared providers plus a headerless stack for the landing and
 * fallback routes. Android resolves `_layout.android.js` instead.
 * @module src/app/_layout
 */
import {Stack} from "expo-router";
import {Root} from "../components/root";

export default function RootLayout() {
  return (
    <Root>
      <Stack screenOptions={{headerShown: false, animation: "none"}} />
    </Root>
  );
}
