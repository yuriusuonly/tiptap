/**
 * Centralized loading/error handling for async UI regions. Renders a loading
 * row (spinner + message) while `isLoading`, an error block (message +
 * optional retry/dismiss) when `error` is set, and `children` otherwise.
 * Owns the loading/error presentation so callers only describe state.
 * @module src/shared/components/state-view
 */
import {ActivityIndicator, Pressable, Text, View} from "react-native";
import {useResolvedTheme} from "../store/theme-store";

export function StateView({isLoading, loadingText = "Loading…", error, onRetry, onDismiss, children}) {
  const {palette} = useResolvedTheme();

  if (isLoading) {
    return (
      <View className="flex-row items-center gap-3 py-3">
        <ActivityIndicator size="small" color={palette.accent} />
        <Text className="text-[14px] text-muted">{loadingText}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="py-1">
        <Text className="text-[14px] leading-[20px] text-cyan">{error}</Text>
        {onRetry || onDismiss ? (
          <View className="mt-2 flex-row gap-5">
            {onRetry ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Retry" onPress={onRetry}>
                <Text className="py-1 text-[14px] font-semibold text-accent">Retry</Text>
              </Pressable>
            ) : null}
            {onDismiss ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Dismiss" onPress={onDismiss}>
                <Text className="py-1 text-[14px] text-muted">Dismiss</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  }

  return children;
}

export default StateView;
