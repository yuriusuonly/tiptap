/**
 * Root-owned toast host. Owns the queue timer (one message at a time, each
 * respecting its timeout) and renders a non-blocking overlay in the root tree.
 * Export `ToastOverlay` for embedding inside other Modals (e.g. bottom sheets)
 * so the toast layers above them; `ToastOverlay` is presentational (no timer)
 * so it is safe to render in multiple layers.
 * @module src/shared/components/toast-host
 */
import {useEffect} from "react";
import {View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useToastStore} from "../store/toast-store";
import {Toast} from "./toast";

function ToastView({current}) {
  const insets = useSafeAreaInsets();

  if (!current) return null;

  return (
    <Toast
      key={current.id}
      visible
      message={current.message}
      className="absolute left-1/2 w-[calc(100%-32px)] max-w-[568px] -translate-x-1/2"
      style={{bottom: insets.bottom + 16}}
    />
  );
}

/** Presentational overlay (no timer). Embed inside Modals to layer above them. */
export function ToastOverlay() {
  const current = useToastStore((state) => state.current);
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <ToastView current={current} />
    </View>
  );
}

/** Singleton root host: manages queue timing and renders a non-blocking overlay. */
export function ToastHost() {
  const current = useToastStore((state) => state.current);
  const dismissToast = useToastStore((state) => state.dismissToast);

  useEffect(() => {
    if (!current) return undefined;
    const timer = setTimeout(() => {
      dismissToast();
    }, current.durationMs);
    return () => clearTimeout(timer);
  }, [current, dismissToast]);

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <ToastView current={current} />
    </View>
  );
}

export default ToastHost;
