/**
 * Ephemeral toast store for root-owned, app-wide transient messages. Messages
 * are queued and shown one at a time, each respecting its own timeout before
 * the next is displayed. Rendered by the root toast host so it stays fixed
 * above any stacked layout/modal.
 * @module src/store/toast-store
 */
import {create} from "zustand";

/** Android Toast.LENGTH_SHORT equivalent. */
export const TOAST_DURATION_SHORT = 2000;
/** Android Toast.LENGTH_LONG equivalent. */
export const TOAST_DURATION_LONG = 3500;

const DEFAULT_DURATION_MS = TOAST_DURATION_SHORT;
let nextId = 0;

export const useToastStore = create((set, get) => ({
  current: null, // { id, message, durationMs } | null
  queue: [],
  showToast: (message, options = {}) => {
    if (!message) return;
    const item = {
      id: ++nextId,
      message,
      durationMs: options.durationMs ?? DEFAULT_DURATION_MS,
    };
    set((state) => {
      if (!state.current) {
        return {current: item};
      }
      return {queue: [...state.queue, item]};
    });
  },
  dismissToast: () =>
    set((state) => {
      if (state.queue.length === 0) {
        return {current: null};
      }
      const [next, ...rest] = state.queue;
      return {current: next, queue: rest};
    }),
  hideToast: () => set({current: null, queue: []}),
}));

export const showToast = (message, options) =>
  useToastStore.getState().showToast(message, options);
export const hideToast = () => useToastStore.getState().hideToast();
