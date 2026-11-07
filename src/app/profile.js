/**
 * Web fallback for the Android-only Profile route. Expo Router requires a
 * platform-less sibling for `profile.android.js`; web visitors are sent home.
 * @module src/app/profile
 */
import {Redirect} from "expo-router";

export default function ProfileRoute() {
  return <Redirect href="/" />;
}
