/**
 * Toast component module: presentational toast plus root-owned host.
 * - `Toast`: plain semi-transparent, inverse-surface, pill corners, bottom-centered
 *   presentation (non-interactive). Renders when `visible` (caller positions/times).
 * - `ToastHost` (singleton root host): uses built-in `ToastAndroid` on Android and a
 *   custom non-blocking overlay on web; advances the queued store messages.
 * - `ToastOverlay`: web-only presentational overlay (API compatibility).
 * Nativewind `className` + semantic tokens.
 * @module src/components/toast
 */
import {useEffect} from "react";
import {Platform, Text, ToastAndroid, View} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {TOAST_DURATION_LONG, useToastStore} from "../store/toast-store";

export function Toast({visible, message, className, style}) {
  if (!visible || !message) return null;

  return (
    <View className={className} style={style} pointerEvents="none">
      <View className="min-h-[56px] flex-row items-center rounded-full bg-ink/80 px-6 py-3">
        <Text className="text-[16px] leading-[24px] text-background">{message}</Text>
      </View>
    </View>
  );
}

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

export default Toast;
