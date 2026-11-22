/**
 * Discover feed store. Content is loaded on demand from Firestore; de-duplication
 * and the loading guard live outside React state so rebuilds never trigger
 * duplicate queries.
 * @module src/store/content-store
 */
import {create} from "zustand";
import {fetchFeed} from "../services/firebase/content";

const seenTitles = new Set();
const MAX_SEEN = 500;

export const useContentStore = create((set, get) => ({
  facts: [],
  loading: false,
  error: null,
  refreshing: false,

  loadMore: async (skipTitles = []) => {
    if (get().loading) return;
    set({loading: true, error: null});
    try {
      const batch = await fetchFeed({limit: 5, skipTitles});
      const currentTitles = new Set(get().facts.map((fact) => fact.title));
      const fresh = batch.filter(
        (fact) => !seenTitles.has(fact.title) && !currentTitles.has(fact.title)
      );
      fresh.forEach((fact) => seenTitles.add(fact.title));
      if (seenTitles.size > MAX_SEEN) {
        const stillShown = new Set(get().facts.map((fact) => fact.title));
        [...seenTitles].forEach((title) => {
          if (!stillShown.has(title)) seenTitles.delete(title);
        });
      }
      if (fresh.length) set({facts: [...get().facts, ...fresh]});
    } catch (error) {
      set({error: error?.message ?? "Unable to load facts."});
    } finally {
      set({loading: false});
    }
  },

  refresh: async (skipTitles = []) => {
    seenTitles.clear();
    set({facts: [], error: null, refreshing: true});
    try {
      const batch = await fetchFeed({limit: 5, skipTitles});
      batch.forEach((fact) => seenTitles.add(fact.title));
      set({facts: batch});
    } catch (error) {
      set({error: error?.message ?? "Unable to refresh facts."});
    } finally {
      set({refreshing: false});
    }
  },

  markRewarded: (title) =>
    set({
      facts: get().facts.map((fact) =>
        fact.title === title ? {...fact, rewarded: true} : fact
      ),
    }),
}));
