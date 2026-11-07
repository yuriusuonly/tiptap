/**
 * Shared toast for transient action-failure feedback, styled per Material
 * Design toast: inverse-surface token (`bg-ink`, inverse-on-surface text),
 * rounded corners (16dp), title-sized text, centered at the bottom edge.
 * Renders an overlay when `visible` (positioned by the caller via
 * `className`), auto-dismisses after `durationMs` (simple timed
 * mount/unmount — no UX animations), and can be dismissed by tapping.
 * Nativewind `className`-only; semantic theme tokens.
 * @module src/shared/components/toast
 */
import {useEffect} from "react";
import {Pressable, Text, View} from "react-native";

export function Toast({visible, message, onDismiss, durationMs = 4000, className}) {
  useEffect(() => {
    if (!visible) return undefined;
    const timer = setTimeout(() => {
      onDismiss?.();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [visible, message, durationMs, onDismiss]);

  if (!visible || !message) return null;

  return (
    <View className={className}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss message"
        onPress={onDismiss}
        className="min-h-[56px] flex-row items-center rounded-[16px] bg-ink px-5 py-3"
      >
        <Text className="text-[16px] leading-[24px] text-background">{message}</Text>
      </Pressable>
    </View>
  );
}

export default Toast;
