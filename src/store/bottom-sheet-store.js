/**
 * Root-owned bottom sheet store. Drives a single active bottom sheet rendered by
 * `BottomSheetHost` (root-level). `openBottomSheet(render)` shows the sheet with
 * content produced by `render()`; `closeBottomSheet()` hides it.
 * @module src/store/bottom-sheet-store
 */
import {create} from "zustand";

export const useBottomSheetStore = create((set) => ({
  isOpen: false,
  render: null, // () => ReactNode
  openBottomSheet: (render) =>
    set({
      isOpen: true,
      render: typeof render === "function" ? render : () => render,
    }),
  closeBottomSheet: () => set({isOpen: false, render: null}),
}));

export const openBottomSheet = (render) =>
  useBottomSheetStore.getState().openBottomSheet(render);
export const closeBottomSheet = () => useBottomSheetStore.getState().closeBottomSheet();
