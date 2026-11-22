/**
 * Confirmation dialog module (root-level): presentational `ConfirmDialog` and
 * store-driven `ConfirmDialogHost`. The host renders a stack of dialogs
 * (newest on top) and is rendered by `Root` beneath toasts so toasts remain
 * visually on top.
 * Uses Nativewind semantic tokens (no inline presentation styles).
 * @module src/components/confirm-dialog
 */
import {Text} from "./text";
import {Modal, Pressable, View} from "react-native";
import {confirm, useDialogStore} from "../store/dialog-store";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Presentational confirmation dialog.
 * @param {object} props
 * @param {boolean} props.visible
 * @param {string} props.title
 * @param {string} [props.message]
 * @param {string} [props.cancelLabel="Cancel"]
 * @param {string} [props.confirmLabel="Confirm"]
 * @param {boolean} [props.destructive]
 * @param {boolean} [props.confirmDisabled]
 * @param {() => void} props.onCancel
 * @param {() => void} props.onConfirm
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  cancelLabel = "Cancel",
  confirmLabel = "Confirm",
  destructive = false,
  confirmDisabled = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal visible={!!visible} transparent animationType="none" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-ink/40 px-6">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss dialog"
          onPress={onCancel}
          className="absolute inset-0"
        />
        <View
          accessibilityRole="alert"
          accessibilityLabel={title}
          className="w-full max-w-[360px] rounded-[20px] border border-line bg-surface p-5"
        >
          <Text className="text-[18px] font-bold leading-[24px] text-ink">{title}</Text>
          {message ? (
            <Text className="mt-2 text-[14px] leading-[20px] text-muted">{message}</Text>
          ) : null}

          <View className="mt-5 flex-row items-center justify-end gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={cancelLabel}
              onPress={onCancel}
              className="rounded-full px-4 py-2.5"
            >
              <Text className="text-[14px] font-semibold text-muted">{cancelLabel}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={confirmLabel}
              disabled={confirmDisabled}
              onPress={onConfirm}
              className={cx(
                "rounded-full px-4 py-2.5",
                destructive ? "bg-cyan/15" : "bg-accent/15",
                confirmDisabled ? "opacity-50" : ""
              )}
            >
              <Text
                className={cx(
                  "text-[14px] font-semibold",
                  destructive ? "text-cyan" : "text-accent"
                )}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Root-level host (rendered by `Root`, beneath `ToastHost`). */
export function ConfirmDialogHost() {
  const dialogs = useDialogStore((state) => state.dialogs);
  const close = useDialogStore((state) => state.close);

  if (dialogs.length === 0) return null;

  return dialogs.map((dialog) => (
    <ConfirmDialog
      key={dialog.id}
      visible
      title={dialog.title}
      message={dialog.message}
      cancelLabel={dialog.cancelLabel}
      confirmLabel={dialog.confirmLabel}
      destructive={dialog.destructive}
      onCancel={() => close(dialog.id, false)}
      onConfirm={() => close(dialog.id, true)}
    />
  ));
}

export {confirm};
export default ConfirmDialog;
