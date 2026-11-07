/**
 * Zustand theme store with AsyncStorage persistence and resolved palette helpers.
 * @module src/shared/store/theme-store
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {useColorScheme} from "react-native";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";
import {themes} from "../constants/colors";

export const THEME_MODES = [
  {value: "auto", label: "Auto"},
  {value: "light", label: "Light"},
  {value: "dark", label: "Dark"},
];

export const useThemeStore = create(
  persist(
    (set) => ({
      themeMode: "auto",
      setThemeMode: (themeMode) => set({themeMode}),
    }),
    {
      name: "tiptap.theme-mode",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({themeMode: state.themeMode}),
      // Static rendering has no window/localStorage. Rehydrate in an effect
      // after the app mounts (see src/shared/components/app-providers.js).
      skipHydration: true,
    }
  )
);

/**
 * Resolves the user's theme choice against the system scheme and returns the
 * matching palette.
 */
export function useResolvedTheme() {
  const themeMode = useThemeStore((state) => state.themeMode);
  const systemScheme = useColorScheme();

  const scheme =
    themeMode === "auto" ? (systemScheme === "light" ? "light" : "dark") : themeMode;

  return {
    themeMode,
    scheme,
    isLight: scheme === "light",
    palette: themes[scheme] ?? themes.dark,
  };
}
