/**
 * Server-authoritative premium/gems state.
 *
 * Premium and gems are only ever set from API responses — never derived from
 * local purchase state or edited optimistically. Local toggles of bookmarks
 * and streak are allowed because those are normal user preferences, not
 * entitlements.
 * @module src/store/entitlement-store
 */
import {create} from "zustand";
import {
  fetchEntitlements,
  spendGemOnFact,
} from "../services/api/entitlements";
import {addBookmark, removeBookmark} from "../services/firebase/bookmarks";
import {EMPTY_STREAK, getStreak, nextStreak, setStreak} from "../services/firebase/streak";

export const useEntitlementStore = create((set, get) => ({
  premium: false,
  gems: 3,
  bookmarks: [],
  streak: {...EMPTY_STREAK},
  loading: false,
  error: null,

  /** Refresh all authoritative values from the API and Firestore. */
  sync: async (uid) => {
    if (!uid) {
      set({premium: false, gems: 3, bookmarks: [], streak: {...EMPTY_STREAK}});
      return;
    }
    set({loading: true, error: null});
    try {
      const state = await fetchEntitlements();
      const streak = await getStreak(uid).catch(() => ({...EMPTY_STREAK}));
      set({
        premium: !!state.premium,
        gems: typeof state.gems === "number" ? Math.max(0, state.gems) : 0,
        bookmarks: Array.isArray(state.bookmarks) ? state.bookmarks : [],
        streak,
      });
    } catch (error) {
      set({error: error?.message ?? "Unable to sync account."});
    } finally {
      set({loading: false});
    }
  },

  /** Apply an API response (e.g. after verifying a purchase). */
  applyServerState: (payload) => {
    if (!payload) return;
    set((state) => ({
      premium: typeof payload.premium === "boolean" ? payload.premium : state.premium,
      gems: typeof payload.gems === "number" ? Math.max(0, payload.gems) : state.gems,
      bookmarks: Array.isArray(payload.bookmarks) ? payload.bookmarks : state.bookmarks,
    }));
  },

  /** Spend a gem through the server; returns true when the fact was unlocked. */
  spendGem: async (factTitle) => {
    try {
      const result = await spendGemOnFact(factTitle);
      set((state) => ({
        gems: Math.max(0, result.gems),
        bookmarks: state.bookmarks.includes(result.slug)
          ? state.bookmarks
          : [...state.bookmarks, result.slug],
      }));
      return true;
    } catch (error) {
      set({error: error?.message ?? "Unable to spend gem."});
      return false;
    }
  },

  /** Toggle a bookmark locally and in Firestore (premium/rewarded users). */
  toggleBookmark: async (uid, slug) => {
    if (!uid || !slug) return;
    const bookmarks = get().bookmarks;
    const removing = bookmarks.includes(slug);
    set({bookmarks: removing ? bookmarks.filter((item) => item !== slug) : [slug, ...bookmarks]});
    try {
      if (removing) await removeBookmark(uid, slug);
      else await addBookmark(uid, slug);
    } catch {
      // Revert the optimistic change; Firestore writes report through the UI.
      set({bookmarks});
    }
  },

  recordActivity: async (uid) => {
    if (!uid) return;
    const updated = nextStreak(get().streak);
    set({streak: updated});
    try {
      await setStreak(uid, updated);
    } catch {
      // Keep the local value; the next sync reconciles it.
    }
  },
}));
