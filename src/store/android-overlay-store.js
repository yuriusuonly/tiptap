/**
 * Android UI overlay state (e.g. Profile stacked over Discover). Kept separate
 * from routing since Android uses internal layout composition, not file-based tabs.
 * @module src/store/android-overlay-store
 */
import {create} from "zustand";

export const useAndroidOverlayStore = create((set) => ({
  profileOpen: false,
  openProfile: () => set({profileOpen: true}),
  closeProfile: () => set({profileOpen: false}),
}));

export const openProfile = () => useAndroidOverlayStore.getState().openProfile();
export const closeProfile = () => useAndroidOverlayStore.getState().closeProfile();
