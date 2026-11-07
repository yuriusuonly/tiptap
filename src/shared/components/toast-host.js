/**
 * Root-owned toast host. Renders queued toast messages one at a time in its
 * own transparent Modal so it stays fixed and layers above stacked layouts and
 * other Modals (e.g. bottom sheets). No entrance/exit animations.
 * @module src/shared/components/toast-host
 */
import {Modal, View} from "react-native";
import {useToastStore} from "../store/toast-store";
import {Toast} from "./toast";

export function ToastHost() {
  const current = useToastStore((state) => state.current);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const hideToast = useToastStore((state) => state.hideToast);
  const visible = !!current;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={hideToast}>
      <View pointerEvents="box-none" className="flex-1">
        <Toast
          key={current.id}
          visible
          message={current.message}
          durationMs={current.durationMs}
          onDismiss={dismissToast}
          className="absolute bottom-4 left-1/2 w-[calc(100%-32px)] max-w-[568px] -translate-x-1/2"
        />
      </View>
    </Modal>
  );
}

export default ToastHost;
