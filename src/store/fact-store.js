/**
 * Overlay navigation state for fact details, monetization and subscription.
 * These are internal overlays (like the Flutter app's pushed routes) so the
 * `src/app/` directory keeps only the root route files.
 * @module src/store/fact-store
 */
import {create} from "zustand";

export const useFactStore = create((set) => ({
  fact: null,
  monetize: false,
  subscription: false,

  openFact: (fact) => set({fact, monetize: false, subscription: false}),
  closeFact: () => set({fact: null, monetize: false, subscription: false}),
  openMonetize: () => set({monetize: true, subscription: false}),
  closeMonetize: () => set({monetize: false}),
  openSubscription: () => set({subscription: true}),
  closeSubscription: () => set({subscription: false}),
}));

/** Close the topmost overlay. Returns true when something was closed. */
export function closeTopOverlay() {
  const state = useFactStore.getState();
  if (state.subscription) {
    state.closeSubscription();
    return true;
  }
  if (state.monetize) {
    state.closeMonetize();
    return true;
  }
  if (state.fact) {
    state.closeFact();
    return true;
  }
  return false;
}
