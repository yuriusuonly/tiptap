/**
 * Zustand onboarding store with AsyncStorage persistence. Tracks whether the
 * first-time-install onboarding flow has been completed. The `hydrated` flag
 * is set once rehydration finishes so callers can distinguish "unknown yet"
 * from "not seen".
 * @module src/store/onboarding-store
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import {create} from "zustand";
import {createJSONStorage, persist} from "zustand/middleware";

export const useOnboardingStore = create(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      hydrated: false,
      completeOnboarding: () => set({hasSeenOnboarding: true}),
    }),
    {
      name: "tiptap.onboarding",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({hasSeenOnboarding: state.hasSeenOnboarding}),
      // Static rendering has no window/localStorage. Rehydrate in an effect
      // after the app mounts (see src/components/root.js).
      skipHydration: true,
      onRehydrateStorage: () => () => {
        // Notify subscribers via setState — mutating the hydrated state
        // object directly would never re-render the onboarding gate.
        useOnboardingStore.setState({hydrated: true});
      },
    }
  )
);
