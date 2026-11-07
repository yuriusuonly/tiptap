/**
 * Shared root providers: global styles, theme hydration, Nativewind color-scheme
 * sync, document title, and status bar. Used by both platform layouts.
 * @module src/shared/providers/app-providers
 */
import Head from "expo-router/head";
import {StatusBar} from "expo-status-bar";
import {colorScheme} from "nativewind";
import {useEffect} from "react";
import {Platform} from "react-native";
import {useResolvedTheme, useThemeStore} from "../store/theme-store";
import "../../styles/global.css";

export function AppProviders({children}) {
  const {themeMode, scheme, isLight} = useResolvedTheme();

  useEffect(() => {
    // Persisted state is rehydrated after mount so static web rendering never
    // touches localStorage during the server pass.
    useThemeStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    // Nativewind switches class-based dark mode through colorScheme. On native,
    // "system" preserves live system changes; on web, resolve the system scheme
    // ourselves because class-based dark mode needs an explicit class.
    const value =
      Platform.OS === "web" ? (themeMode === "auto" ? scheme : themeMode) : themeMode;
    colorScheme.set(value === "auto" ? "system" : value);
  }, [themeMode, scheme]);

  return (
    <>
      <Head>
        <title>TipTap</title>
      </Head>
      <StatusBar style={isLight ? "dark" : "light"} />
      {children}
    </>
  );
}

export default AppProviders;
