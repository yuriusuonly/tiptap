/**
 * Zustand theme store with AsyncStorage persistence and resolved palette helpers.
 * Tracks `updatedAt` (ms epoch, 0 = never explicitly set) so Firestore
 * preference sync can apply last-write-wins without an import-time async read.
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
    (set, get) => ({
      themeMode: "auto",
      updatedAt: 0,
      setThemeMode: (themeMode) => {
        if (themeMode === get().themeMode) return;
        set({themeMode, updatedAt: Date.now()});
      },
      // Apply a remote preference only when it is newer (last-write-wins).
      // Returns true when applied, false when the remote value is stale.
      applyRemoteTheme: ({themeMode, updatedAt}) => {
        if (typeof updatedAt !== "number" || Number.isNaN(updatedAt)) return false;
        if (updatedAt <= get().updatedAt) return false;
        set({themeMode, updatedAt});
        return true;
      },
    }),
    {
      name: "tiptap.theme-mode",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({themeMode: state.themeMode, updatedAt: state.updatedAt}),
      // Static rendering has no window/localStorage. Rehydrate in an effect
      // after the app mounts (see src/shared/components/root.js).
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
