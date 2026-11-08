/**
 * Indeterminate progress indicator styled as a rotating arc spinner
 * (TikTok-like), themed with the app's accent design token. Layout uses
 * Nativewind `className`. Supports inline use and a labeled block.
 * Uses RN Animated (no Reanimated babel plugin required).
 * @module src/components/circular-progress
 */
import {useEffect, useRef} from "react";
import {Animated, Easing, Text, View} from "react-native";
import Svg, {Circle} from "react-native-svg";
import {useResolvedTheme} from "../store/theme-store";

const SIZES = {
  small: 20,
  large: 36,
};

function resolveSize(size) {
  if (typeof size === "number") return size;
  return SIZES[size] ?? SIZES.small;
}

function Spinner({size, color, trackColor}) {
  const rotation = useRef(new Animated.Value(0)).current;
  const px = resolveSize(size);
  const strokeWidth = Math.max(2, Math.round(px * 0.1));
  const radius = (px - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // ~75% arc with a gap, rounded caps (TikTok-style indeterminate ring).
  const arcLength = circumference * 0.72;
  const gapLength = circumference - arcLength;

  useEffect(() => {
    rotation.setValue(0);
    const loop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View style={{width: px, height: px, transform: [{rotate: spin}]}}>
      <Svg width={px} height={px} viewBox={`0 0 ${px} ${px}`}>
        <Circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={px / 2}
          cy={px / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          strokeDashoffset={arcLength * 0.15}
          rotation={-90}
          origin={`${px / 2}, ${px / 2}`}
        />
      </Svg>
    </Animated.View>
  );
}

export function CircularProgress({size = "small", label, className, color}) {
  const {palette} = useResolvedTheme();
  const accent = color ?? palette.accent;
  // Subtle track using the border token for contrast in both themes.
  const track = palette.border;
  const indicator = <Spinner size={size} color={accent} trackColor={track} />;

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

export {CircularProgress as IndeterminateProgress};
export default CircularProgress;
