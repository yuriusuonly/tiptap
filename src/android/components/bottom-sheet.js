/**
 * Android bottom sheet: instant show/hide (no entrance/exit transition) with a
 * draggable handle for expandable/collapsible behavior. Drag settles to snap
 * points on release (interactive behavior). Content is scrollable.
 * @module src/android/components/bottom-sheet
 */
import {useCallback, useEffect, useMemo, useRef} from "react";
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import {ToastOverlay} from "../../shared/components/toast-host";

const EXPANDED_FRACTION = 0.88;
const COLLAPSED_FRACTION = 0.46;

export function BottomSheet({visible, onClose, children}) {
  const {height: windowHeight} = useWindowDimensions();
  const expandedHeight = Math.max(240, Math.round(windowHeight * EXPANDED_FRACTION));
  const collapsedHeight = Math.max(180, Math.round(windowHeight * COLLAPSED_FRACTION));
  const collapsedOffset = Math.max(0, expandedHeight - collapsedHeight);
  const dismissOffset = expandedHeight;

  const translateY = useRef(new Animated.Value(collapsedOffset)).current;
  // Track the current resting offset so drag gestures start from the right place.
  const offsetRef = useRef(collapsedOffset);

  const setOffset = useCallback(
    (value) => {
      offsetRef.current = value;
      translateY.setValue(value);
    },
    [translateY]
  );

  useEffect(() => {
    if (visible) {
      // Reveal instantly (no entrance transition).
      setOffset(collapsedOffset);
    }
  }, [visible, collapsedOffset, setOffset]);

  const settleTo = useCallback(
    (toValue, {close = false} = {}) => {
      offsetRef.current = close ? collapsedOffset : toValue;
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        tension: 120,
        friction: 20,
        overshootClamping: true,
      }).start(({finished}) => {
        if (finished && close) {
          onClose?.();
        }
      });
    },
    [translateY, collapsedOffset, onClose]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dy) > 4 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
        onPanResponderMove: (_, gesture) => {
          const next = Math.min(dismissOffset, Math.max(0, offsetRef.current + gesture.dy));
          translateY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const current = Math.min(dismissOffset, Math.max(0, offsetRef.current + gesture.dy));
          const draggingDown = gesture.dy > 0 || gesture.vy > 0.5;
          const dismissThreshold = collapsedOffset + Math.min(120, collapsedHeight * 0.35);

          if (draggingDown && (current > dismissThreshold || gesture.vy > 1.1)) {
            settleTo(dismissOffset, {close: true});
            return;
          }

          // Snap to collapsed-open or expanded (settle motion on release).
          const midpoint = collapsedOffset / 2;
          const target = current > midpoint ? collapsedOffset : 0;
          offsetRef.current = target;
          settleTo(target);
        },
        onPanResponderTerminate: () => {
          settleTo(offsetRef.current > collapsedOffset / 2 ? collapsedOffset : 0);
        },
      }),
    [translateY, dismissOffset, collapsedOffset, collapsedHeight, settleTo]
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close settings"
          onPress={onClose}
          className="absolute inset-0 bg-ink/40"
        />
        <Animated.View
          style={{height: expandedHeight, transform: [{translateY}]}}
          className="w-full overflow-hidden rounded-t-[28px] border-t border-line bg-surface"
        >
          <View
            {...panResponder.panHandlers}
            accessibilityRole="adjustable"
            accessibilityLabel="Drag to expand or collapse settings"
            className="items-center pb-2 pt-3"
          >
            <View className="h-1.5 w-10 rounded-full bg-line" />
          </View>
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-4 pb-8 mobile:px-5 tablet:px-8 desktop:px-12"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        </Animated.View>
        <ToastOverlay />
      </View>
    </Modal>
  );
}

export default BottomSheet;
