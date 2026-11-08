/**
 * Shared circular progress indicator for async UI actions.
 * Themed via the resolved theme palette accent color; layout is
 * Nativewind `className`-only. Supports inline use (beside action text)
 * and block use (spinner + label).
 * @module src/components/circular-progress
 */
import {ActivityIndicator, Text, View} from "react-native";
import {useResolvedTheme} from "../store/theme-store";

export function CircularProgress({size = "small", label, className}) {
  const {palette} = useResolvedTheme();
  const indicator = <ActivityIndicator size={size} color={palette.accent} />;

  if (!label) {
    return className ? <View className={className}>{indicator}</View> : indicator;
  }

  return (
    <View className={`flex-row items-center gap-3 py-3 ${className ?? ""}`}>
      {indicator}
      <Text className="text-[14px] text-muted">{label}</Text>
    </View>
  );
}

export default CircularProgress;
