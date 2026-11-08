/**
 * Root-owned confirmation dialog store. Drives a single active confirm dialog
 * rendered by `ConfirmDialogHost` (root-level, beneath toasts). `confirm()`
 * returns a promise that resolves `true` on confirm, `false` on cancel/dismiss.
 * @module src/store/confirm-dialog-store
 */
import {create} from "zustand";

export const useConfirmDialogStore = create((set, get) => ({
  dialog: null, // { title, message, cancelLabel, confirmLabel, destructive, resolve } | null
  confirm: (options = {}) =>
    new Promise((resolve) => {
      const current = get().dialog;
      if (current?.resolve) {
        // Only one dialog at a time; resolve any stale one as cancelled.
        current.resolve(false);
      }
      set({
        dialog: {
          title: options.title ?? "",
          message: options.message,
          cancelLabel: options.cancelLabel ?? "Cancel",
          confirmLabel: options.confirmLabel ?? "Confirm",
          destructive: !!options.destructive,
          resolve,
        },
      });
    }),
  close: (result) => {
    const {dialog} = get();
    if (!dialog) return;
    set({dialog: null});
    dialog.resolve?.(!!result);
  },
}));

export const confirm = (options) => useConfirmDialogStore.getState().confirm(options);
