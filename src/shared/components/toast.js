/**
 * Presentational toast: plain semi-transparent, inverse-surface, circular
 * (pill) corners, title-sized text, centered at the bottom edge. Renders when
 * `visible` (positioned by the caller via `className`/`style`); auto-dismiss
 * timing is owned by the root toast host. Non-interactive (no pointer events).
 * Nativewind `className` + semantic tokens.
 * @module src/shared/components/toast
 */
import {Text, View} from "react-native";

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

export default Toast;
