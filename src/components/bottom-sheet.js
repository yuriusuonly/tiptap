/**
 * Android bottom sheet: instant show/hide (no entrance/exit transition) with
 * expandable/collapsible behavior. When collapsed-open, the whole sheet responds
 * to vertical drags (drag up expands, drag down collapses/dismisses). When fully
 * expanded, content scrolls and dragging the handle (or dragging down from the
 * top of content) collapses the sheet. Drag settles to snap points on release.
 * @module src/components/bottom-sheet
 */
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
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

  // Snap/scroll state drive render-time gesture decisions (refs alone caused
  // missed drags and ScrollView conflicts).
  const [snap, setSnap] = useState("collapsed"); // "collapsed" | "expanded"
  const [atTop, setAtTop] = useState(true);

  const translateY = useRef(new Animated.Value(collapsedOffset)).current;
  // Resting offset for snap decisions, plus the live animated value so a drag
  // started mid-spring resumes from the actual position (no jump).
  const offsetRef = useRef(collapsedOffset);
  const currentValueRef = useRef(collapsedOffset);
  const scrollYRef = useRef(0);
  const isDraggingRef = useRef(false);

  const setOffset = useCallback(
    (value) => {
      offsetRef.current = value;
      currentValueRef.current = value;
      translateY.setValue(value);
    },
    [translateY]
  );

  useEffect(() => {
    // Track the live animated value (native driver) to resume mid-spring drags.
    const id = translateY.addListener(({value}) => {
      currentValueRef.current = value;
    });
    return () => translateY.removeListener(id);
  }, [translateY]);

  useEffect(() => {
    if (visible) {
      // Reveal instantly (no entrance transition) in the collapsed-open state.
      setOffset(collapsedOffset);
      scrollYRef.current = 0;
      setAtTop(true);
      setSnap("collapsed");
      isDraggingRef.current = false;
    }
  }, [visible, collapsedOffset, setOffset]);

  const settleTo = useCallback(
    (toValue, {close = false} = {}) => {
      const snapValue = close ? collapsedOffset : toValue;
      offsetRef.current = snapValue;
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        tension: 120,
        friction: 20,
        overshootClamping: true,
      }).start(({finished}) => {
        if (!finished) return;
        currentValueRef.current = toValue;
        offsetRef.current = snapValue;
        if (!close) {
          setSnap(snapValue === 0 ? "expanded" : "collapsed");
        }
        if (close) {
          onClose?.();
        }
      });
    },
    [translateY, collapsedOffset, onClose]
  );

  const syncAtTop = useCallback((y) => {
    const nextAtTop = y <= 2;
    scrollYRef.current = y;
    setAtTop((prev) => (prev === nextAtTop ? prev : nextAtTop));
  }, []);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        // Capture so a deliberate sheet drag wins before the ScrollView claims it.
        onMoveShouldSetPanResponderCapture: (_, gesture) => {
          const isVertical = Math.abs(gesture.dy) > 6 && Math.abs(gesture.dy) > Math.abs(gesture.dx);
          if (!isVertical) return false;
          const draggingDown = gesture.dy > 0;
          const canExpand = offsetRef.current > 0;
          // Collapsed-open: the sheet owns vertical drags (reliable expand/dismiss).
          if (canExpand) return true;
          // Fully expanded: drag down from the top of content collapses the sheet.
          if (draggingDown && scrollYRef.current <= 2) return true;
          return false;
        },
        onMoveShouldSetPanResponder: () => false,
        onPanResponderGrant: () => {
          // Resume from the actual position (handles interruption of a spring).
          isDraggingRef.current = true;
          translateY.stopAnimation((value) => {
            offsetRef.current = value;
            currentValueRef.current = value;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.min(dismissOffset, Math.max(0, offsetRef.current + gesture.dy));
          translateY.setValue(next);
          currentValueRef.current = next;
        },
        onPanResponderRelease: (_, gesture) => {
          isDraggingRef.current = false;
          const current = Math.min(dismissOffset, Math.max(0, offsetRef.current + gesture.dy));
          const draggingDown = gesture.dy > 0 || gesture.vy > 0.5;
          const dismissThreshold = collapsedOffset + Math.min(120, collapsedHeight * 0.35);

          if (draggingDown && (current > dismissThreshold || gesture.vy > 1.1)) {
            settleTo(dismissOffset, {close: true});
            return;
          }

          // Snap to collapsed-open or expanded.
          const midpoint = collapsedOffset / 2;
          const target = current > midpoint ? collapsedOffset : 0;
          offsetRef.current = target;
          settleTo(target);
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
          settleTo(offsetRef.current > collapsedOffset / 2 ? collapsedOffset : 0);
        },
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [translateY, dismissOffset, collapsedOffset, collapsedHeight, settleTo]
  );

  if (!visible) return null;

  // Collapsed-open: disable scroll so the sheet reliably owns page drags.
  // Fully expanded: keep scroll enabled (upward drags at top scroll content);
  // capture still claims deliberate downward drags from the top to collapse.
  const contentScrollEnabled = snap === "expanded";

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
            hitSlop={{top: 12, bottom: 12, left: 24, right: 24}}
            className="items-center pb-3 pt-3"
          >
            <View className="h-1.5 w-10 rounded-full bg-line" />
          </View>
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-4 pb-8 mobile:px-5 tablet:px-8 desktop:px-12"
            showsVerticalScrollIndicator={false}
            bounces={false}
            scrollEnabled={contentScrollEnabled}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="handled"
            onScroll={(event) => {
              syncAtTop(event.nativeEvent.contentOffset.y);
            }}
            onScrollEndDrag={(event) => {
              syncAtTop(event.nativeEvent.contentOffset.y);
            }}
            onMomentumScrollEnd={(event) => {
              syncAtTop(event.nativeEvent.contentOffset.y);
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
