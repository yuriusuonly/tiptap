/**
 * Android bottom sheet: instant show/hide (no entrance/exit transition) with
 * expandable/collapsible behavior driven by dragging/swiping the handle or the
 * sheet content (drag up to expand, drag down from top to collapse/dismiss).
 * Drag settles to snap points on release (interactive behavior). Content is
 * scrollable.
 * @module src/components/bottom-sheet
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
  // Track content scroll so downward drags at the top collapse/expand the sheet.
  const scrollYRef = useRef(0);

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
      scrollYRef.current = 0;
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
        onStartShouldSetPanResponder: () => false,
        // Use capture so the sheet can claim expand/collapse drags before a child
        // ScrollView takes over (only in cases where scrolling shouldn't win).
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          const isVertical = Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
          if (!isVertical) return false;
          const draggingDown = gesture.dy > 0;
          // Forgiving top check (scroll throttle/rounding can leave a sub-pixel offset).
          const atTop = scrollYRef.current <= 2;
          const canExpand = offsetRef.current > 0;
          // When partially open, the sheet owns vertical drags (drag up expands,
          // drag down collapses/dismisses) so page swipes stay reliable. When fully
          // expanded, only a downward drag from the top scroll position collapses;
          // otherwise content scrolls normally.
          if (canExpand) return true;
          if (draggingDown && atTop) return true;
          return false;
        },
        onMoveShouldSetPanResponder: () => false,
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
          {...panResponder.panHandlers}
          style={{height: expandedHeight, transform: [{translateY}]}}
          className="w-full overflow-hidden rounded-t-[28px] border-t border-line bg-surface"
        >
          <View
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
            scrollEventThrottle={16}
            onScroll={(event) => {
              scrollYRef.current = event.nativeEvent.contentOffset.y;
            }}
            onScrollEndDrag={(event) => {
              scrollYRef.current = event.nativeEvent.contentOffset.y;
            }}
            onMomentumScrollEnd={(event) => {
              scrollYRef.current = event.nativeEvent.contentOffset.y;
            }}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default BottomSheet;
