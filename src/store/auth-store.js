/**
 * Zustand auth store (ephemeral; Firebase persists the session natively).
 * The source of truth is `subscribeAuthState` (Android) — this store mirrors
 * the latest user for UI rendering and sync coordination. No tokens or
 * credentials are stored here.
 * @module src/store/auth-store
 */
import {create} from "zustand";

export const useAuthStore = create((set) => ({
  status: "loading", // "loading" | "signedOut" | "signedIn"
  user: null, // { uid, displayName, email, photoURL } | null
  isSigningIn: false,
  error: null,
  setAuthUser: (user) =>
    set({
      status: user ? "signedIn" : "signedOut",
      user,
      error: null,
    }),
  setSigningIn: (isSigningIn) => set({isSigningIn}),
  setError: (error) => set({error}),
  clearError: () => set({error: null}),
}));
