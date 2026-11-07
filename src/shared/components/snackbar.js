/**
 * Shared snackbar for transient action-failure feedback.
 * Renders an in-flow notice when `visible`, auto-dismisses after `durationMs`
 * (simple timed mount/unmount — no UX animations), and can be dismissed
 * manually. Nativewind `className`-only; semantic theme tokens.
 * @module src/shared/components/snackbar
 */
import {useEffect} from "react";
import {Pressable, Text, View} from "react-native";

export function Snackbar({visible, message, onDismiss, durationMs = 4000}) {
  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [visible, message, durationMs, onDismiss]);

  if (!visible || !message) return null;

  return (
    <View className="mt-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        onPress={onDismiss}
        className="rounded-[12px] border border-line bg-surface px-4 py-3"
      >
        <Text className="text-[14px] leading-[20px] text-ink">{message}</Text>
      </Pressable>
    </View>
  );
}

export default Snackbar;
