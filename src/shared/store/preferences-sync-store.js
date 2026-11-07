/**
 * Zustand preferences-sync coordinator (Android, Firestore-backed).
 * Syncs the current preferences (theme) between AsyncStorage (local source of
 * truth for UI) and Firestore `users/{uid}/preferences/app` using
 * last-write-wins on `updatedAt` (ms). Web is a no-op: the Firestore service
 * resolves to the web stub, so `syncOnSignIn` must only run on Android.
 * @module src/shared/store/preferences-sync-store
 */
import {create} from "zustand";
import {getUserPreferences, setUserPreferences, upsertUserProfile} from "../../services/firebase/user-firestore";
import {useAuthStore} from "./auth-store";
import {useThemeStore} from "./theme-store";

const pushDebounceMs = 500;
let applyingRemote = false;
let pushTimer = null;
let themeUnsubscribe = null;
let subscribing = false;

export const usePreferencesSyncStore = create((set) => ({
  syncStatus: "signedOut", // "signedOut" | "syncing" | "synced" | "error"
  syncError: null,
  setSyncStatus: (syncStatus, syncError = null) => set({syncStatus, syncError}),
}));

/**
 * One-shot reconciliation after sign-in.
 * - Records/updates the user profile in Firestore.
 * - Last-write-wins: remote newer -> apply locally; local newer or missing
 *   remote -> push local.
 */
export async function syncOnSignIn(user) {
  if (!user) return;
  const sync = usePreferencesSyncStore.getState();
  sync.setSyncStatus("syncing");
  try {
    await upsertUserProfile(user);
    const remote = await getUserPreferences(user.uid);
    const local = useThemeStore.getState();
    const localUpdatedAt = local.updatedAt;
    if (remote && remote.updatedAt > localUpdatedAt) {
      applyingRemote = true;
      try {
        local.applyRemoteTheme(remote);
      } finally {
        applyingRemote = false;
      }
    } else {
      await pushLocalPreferencesNow(user.uid, true);
    }
    usePreferencesSyncStore.getState().setSyncStatus("synced");
  } catch (error) {
    usePreferencesSyncStore
      .getState()
      .setSyncStatus("error", error?.message ?? "Preference sync failed.");
  }
}

/**
 * Push the current local theme to Firestore immediately.
 * @param {string} uid
 * @param {boolean} forceFreshTimestamp - when first syncing with no local
 *   timestamp yet, stamp `Date.now()` instead of 0.
 */
export async function pushLocalPreferencesNow(uid, forceFreshTimestamp = false) {
  const {themeMode, updatedAt} = useThemeStore.getState();
  const stamped = forceFreshTimestamp && !updatedAt ? Date.now() : updatedAt;
  await setUserPreferences(uid, {themeMode, updatedAt: stamped});
}

/**
 * Schedule a debounced push of the current local theme (user-driven change).
 */
function schedulePush() {
  if (applyingRemote) return;
  const user = useAuthStore.getState().user;
  if (!user) return;
  if (pushTimer) clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    pushTimer = null;
    pushLocalPreferencesNow(user.uid).catch((error) => {
      usePreferencesSyncStore
        .getState()
        .setSyncStatus("error", error?.message ?? "Preference sync failed.");
    });
  }, pushDebounceMs);
}

/**
 * Start watching local theme changes and pushing them while signed in.
 * Call once from Root (Android). Returns an unsubscribe function.
 */
export function startPreferenceSync() {
  if (subscribing) return () => {};
  subscribing = true;
  themeUnsubscribe = useThemeStore.subscribe((state, prev) => {
    if (state.themeMode !== prev.themeMode || state.updatedAt !== prev.updatedAt) {
      schedulePush();
    }
  });
  return () => {
    if (themeUnsubscribe) themeUnsubscribe();
    themeUnsubscribe = null;
    subscribing = false;
    if (pushTimer) {
      clearTimeout(pushTimer);
      pushTimer = null;
    }
  };
}
