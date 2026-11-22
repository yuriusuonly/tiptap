/**
 * Shared motion primitives tuned to match the Flutter app's fade/shared-axis
 * transitions. Built on react-native-reanimated (plugin configured in
 * babel.config.js) so animations run on the UI thread.
 * @module src/components/animations
 */
import {useEffect} from "react";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

/** Delay in ms before a staggered entrance begins. */
export function fadeIn(delay = 0, duration = 500) {
  return FadeIn.delay(delay).duration(duration);
}

export function fadeInDown(delay = 0, duration = 500) {
  return FadeInDown.delay(delay).duration(duration);
}

export function fadeInUp(delay = 0, duration = 500) {
  return FadeInUp.delay(delay).duration(duration);
}

export function zoomIn(delay = 0, duration = 500) {
  return ZoomIn.delay(delay).duration(duration);
}

/**
 * Flutter-style shared-axis entrance: content fades while sliding in from the
 * configured direction.
 */
export function SharedAxis({direction = "horizontal", duration = 320, className, children}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [duration, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.value;
    const offset = (1 - value) * 36;
    return {
      opacity: value,
      transform: [
        {translateX: direction === "horizontal" ? offset : 0},
        {translateY: direction === "vertical" ? offset : 0},
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle} className={className}>
      {children}
    </Animated.View>
  );
}

export {Animated};
