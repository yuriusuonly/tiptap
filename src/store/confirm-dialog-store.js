/**
 * Root-owned confirmation dialog store. Drives a stack of confirm dialogs
 * rendered by `ConfirmDialogHost` (root-level, beneath toasts). `confirm()`
 * pushes a dialog onto the stack and returns a promise that resolves `true` on
 * confirm, `false` on cancel/dismiss.
 * @module src/store/confirm-dialog-store
 */
import {create} from "zustand";

let nextDialogId = 0;

export const useConfirmDialogStore = create((set, get) => ({
  dialogs: [], // [{ id, title, message, cancelLabel, confirmLabel, destructive, resolve }]
  confirm: (options = {}) =>
    new Promise((resolve) => {
      const id = ++nextDialogId;
      set((state) => ({
        dialogs: [
          ...state.dialogs,
          {
            id,
            title: options.title ?? "",
            message: options.message,
            cancelLabel: options.cancelLabel ?? "Cancel",
            confirmLabel: options.confirmLabel ?? "Confirm",
            destructive: !!options.destructive,
            resolve,
          },
        ],
      }));
    }),
  close: (id, result) => {
    const dialog = get().dialogs.find((item) => item.id === id);
    if (!dialog) return;
    set((state) => ({dialogs: state.dialogs.filter((item) => item.id !== id)}));
    dialog.resolve?.(!!result);
  },
}));

export const confirm = (options) => useConfirmDialogStore.getState().confirm(options);
