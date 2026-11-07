/**
 * Root Expo Router layout: global styles, theme hydration, and the Stack navigator.
 * @module src/app/_layout
 */
import "../styles/global.css";
import Head from "expo-router/head";
import {useEffect} from "react";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";
import {useResolvedTheme, useThemeStore} from "../store/theme-store";

export default () => {
  const {isLight} = useResolvedTheme();

  useEffect(() => {
    // Hydrate the persisted theme once the app is running (skipHydration).
    useThemeStore.persist.rehydrate();
  }, []);

  return (
    <>
      <Head>
        <title>TipTap</title>
      </Head>
      <StatusBar style={isLight ? "dark" : "light"} />
      <Stack
        screenOptions={{
          title: "TipTap",
          headerShown: false
        }}
      />
    </>
  );
}
