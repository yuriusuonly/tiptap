/**
 * Root-owned toast host. Uses the built-in ToastAndroid API on Android (native
 * behavior/positioning/fade) and a custom non-blocking overlay on web. Owns the
 * queue timer so messages display one at a time, each respecting its timeout.
 * @module src/shared/components/toast-host
 */
import {useEffect} from "react";
import {Platform, ToastAndroid, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {TOAST_DURATION_LONG, useToastStore} from "../store/toast-store";
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

/** Web-only presentational overlay (no timer). Kept for API compatibility. */
export function ToastOverlay() {
  if (Platform.OS === "android") return null;
  const current = useToastStore((state) => state.current);
  return (
    <View pointerEvents="none" className="absolute inset-0">
      <ToastView current={current} />
    </View>
  );
}

/** Singleton root host: drives native/custom toasts and advances the queue. */
export function ToastHost() {
  const current = useToastStore((state) => state.current);
  const dismissToast = useToastStore((state) => state.dismissToast);

  useEffect(() => {
    if (!current) return undefined;

    if (Platform.OS === "android" && ToastAndroid) {
      const duration =
        current.durationMs >= TOAST_DURATION_LONG
          ? ToastAndroid.LONG
          : ToastAndroid.SHORT;
      ToastAndroid.show(current.message, duration);
    }

    const timer = setTimeout(() => {
      dismissToast();
    }, current.durationMs);
    return () => clearTimeout(timer);
  }, [current, dismissToast]);

  if (Platform.OS === "android") return null;

  return (
    <View pointerEvents="none" className="absolute inset-0">
      <ToastView current={current} />
    </View>
  );
}

export default ToastHost;
