/**
 * Shared snackbar for transient action-failure feedback, styled per
 * Material Design: inverse-surface token (`bg-ink`, inverse-on-surface
 * text), min height 48, 4dp corner radius, uppercase accent action
 * ("DISMISS"), min/max width 288/568. Renders an overlay bar when
 * `visible` (positioned by the caller via `className`), auto-dismisses
 * after `durationMs` (simple timed mount/unmount — no UX animations).
 * Nativewind `className`-only; semantic theme tokens.
 * @module src/shared/components/snackbar
 */
import {useEffect} from "react";
import {Pressable, Text, View} from "react-native";

export function Snackbar({visible, message, onDismiss, durationMs = 4000, className}) {
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
      <View className="min-h-[48px] flex-row items-center gap-3 rounded-[4px] bg-ink px-4 py-2">
        <Text className="flex-1 text-[14px] leading-[20px] text-background">{message}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
          onPress={onDismiss}
        >
          <Text className="py-1 text-[14px] font-semibold uppercase tracking-[0.5px] text-accent">
            Dismiss
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default Snackbar;
