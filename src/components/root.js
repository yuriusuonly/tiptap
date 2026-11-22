/**
 * Root-level component for all platforms: global styles, theme hydration,
 * Nativewind color-scheme sync, document title, and status bar. Used by both
 * platform layouts.
 * @module src/components/root
 */
import Head from "expo-router/head";
import {StatusBar} from "expo-status-bar";
import {colorScheme} from "nativewind";
import {useEffect} from "react";
import {Platform, View} from "react-native";
import {
  Outfit_100Thin,
  Outfit_200ExtraLight,
  Outfit_300Light,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black,
  useFonts,
} from "@expo-google-fonts/outfit";
import {configureGoogleSignIn, subscribeAuthState} from "../services/firebase/google-auth";
import {configureAds} from "../services/ads/rewarded-ad";
import {APP_NAME} from "../constants/configuration";
import {useAuthStore} from "../store/auth-store";
import {useEntitlementStore} from "../store/entitlement-store";
import {useOnboardingStore} from "../store/onboarding-store";
import {startPreferenceSync, syncOnSignIn, usePreferencesSyncStore} from "../store/preferences-sync-store";
import {useResolvedTheme, useThemeStore} from "../store/theme-store";
import {BottomSheetHost} from "./bottom-sheet";
import {ConfirmDialogHost} from "./confirm-dialog";
import {ToastHost} from "./toast";
import "../stylesheets/global.css";

export function Root({children}) {
  const {themeMode, scheme, isLight} = useResolvedTheme();
  // Same font as the Flutter app: Google Fonts Outfit. On web we do not block
  // static rendering on font loading; native waits to avoid a fallback flash.
  const [fontsLoaded, fontsError] = useFonts({
    Outfit_100Thin,
    Outfit_200ExtraLight,
    Outfit_300Light,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  useEffect(() => {
    // Persisted state is rehydrated after mount so static web rendering never
    // touches localStorage during the server pass.
    useThemeStore.persist.rehydrate();
    useOnboardingStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    // Android only: bootstrap Google Sign-In + Firebase auth state and route
    // preference sync through the stores. Web never calls the Firebase
    // services (this effect returns early), keeping the landing static.
    if (Platform.OS !== "android") return;
    configureGoogleSignIn();
    void configureAds();
    const stopSyncWatching = startPreferenceSync();
    const unsubscribe = subscribeAuthState((user) => {
      useAuthStore.getState().setAuthUser(user);
      // Entitlements are always refreshed from the server on auth changes.
      void useEntitlementStore.getState().sync(user?.uid);
      if (user) {
        void syncOnSignIn(user);
      } else {
        usePreferencesSyncStore.getState().setSyncStatus("signedOut");
      }
    });
    return () => {
      stopSyncWatching();
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Nativewind switches class-based dark mode through colorScheme. On native,
    // "system" preserves live system changes; on web, resolve the system scheme
    // ourselves because class-based dark mode needs an explicit class.
    const value =
      Platform.OS === "web" ? (themeMode === "auto" ? scheme : themeMode) : themeMode;
    colorScheme.set(value === "auto" ? "system" : value);
  }, [themeMode, scheme]);

  if (Platform.OS !== "web" && !fontsLoaded && !fontsError) {
    return <View className="flex-1 bg-background" />;
  }

  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
      </Head>
      <StatusBar style={isLight ? "dark" : "light"} />
      {children}
      {/* Stack (top→bottom): toast (ToastHost/system) > dialog > sheet > page */}
      <BottomSheetHost />
      <ConfirmDialogHost />
      <ToastHost />
    </>
  );
}

export default Root;
