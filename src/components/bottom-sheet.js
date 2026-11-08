/**
 * Android bottom sheet: instant show/hide (no entrance/exit transition) with
 * expandable/collapsible behavior driven by pan gestures (RNGH). When
 * collapsed-open, the whole sheet responds to vertical drags (up expands, down
 * collapses/dismisses). When fully expanded, content scrolls; a downward drag
 * from the top of content (or on the handle) collapses the sheet. Drag settles
 * to snap points on release. Gesture handling uses react-native-gesture-handler
 * for reliable, first-swipe responsiveness.
 * @module src/components/bottom-sheet
 */
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  Animated,
  Modal,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  ScrollView,
  State,
} from "react-native-gesture-handler";

const EXPANDED_FRACTION = 0.88;
const COLLAPSED_FRACTION = 0.46;

export function BottomSheet({visible, onClose, children}) {
  const {height: windowHeight} = useWindowDimensions();
  const expandedHeight = Math.max(240, Math.round(windowHeight * EXPANDED_FRACTION));
  const collapsedHeight = Math.max(180, Math.round(windowHeight * COLLAPSED_FRACTION));
  const collapsedOffset = Math.max(0, expandedHeight - collapsedHeight);
  const dismissOffset = expandedHeight;

  // Snap/scroll state drive gesture config so the first swipe is always handled.
  const [snap, setSnap] = useState("collapsed"); // "collapsed" | "expanded"
  const [atTop, setAtTop] = useState(true);

  // baseY = resting snap offset; dragY = live gesture translation (native).
  const baseY = useRef(new Animated.Value(collapsedOffset)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const translateY = useMemo(() => Animated.add(baseY, dragY), [baseY, dragY]);

  const baseYRef = useRef(collapsedOffset);
  const liveYRef = useRef(collapsedOffset);
  const scrollYRef = useRef(0);
  const panRef = useRef(null);
  const scrollRef = useRef(null);

  const setResting = useCallback(
    (value) => {
      baseYRef.current = value;
      liveYRef.current = value;
      baseY.setValue(value);
      dragY.setValue(0);
    },
    [baseY, dragY]
  );

  useEffect(() => {
    const id = baseY.addListener(({value}) => {
      liveYRef.current = value;
    });
    return () => baseY.removeListener(id);
  }, [baseY]);

  useEffect(() => {
    if (visible) {
      // Reveal instantly (no entrance transition) in the collapsed-open state.
      setResting(collapsedOffset);
      scrollYRef.current = 0;
      setAtTop(true);
      setSnap("collapsed");
    }
  }, [visible, collapsedOffset, setResting]);

  const settleTo = useCallback(
    (toValue, {close = false} = {}) => {
      const snapValue = close ? collapsedOffset : toValue;
      // Fold any drag offset into the base before animating.
      dragY.setValue(0);
      baseY.setValue(baseYRef.current);
      baseYRef.current = snapValue;
      Animated.spring(baseY, {
        toValue,
        useNativeDriver: true,
        tension: 120,
        friction: 20,
        overshootClamping: true,
      }).start(({finished}) => {
        if (!finished) return;
        baseYRef.current = snapValue;
        liveYRef.current = toValue;
        baseY.setValue(toValue);
        if (!close) {
          setSnap(snapValue === 0 ? "expanded" : "collapsed");
        }
        if (close) {
          onClose?.();
        }
      });
    },
    [baseY, dragY, collapsedOffset, onClose]
  );

  const syncAtTop = useCallback((y) => {
    const nextAtTop = y <= 2;
    scrollYRef.current = y;
    setAtTop((prev) => (prev === nextAtTop ? prev : nextAtTop));
  }, []);

  const onGestureEvent = useMemo(
    () =>
      Animated.event([{nativeEvent: {translationY: dragY}}], {
        useNativeDriver: true,
      }),
    [dragY]
  );

  const onHandlerStateChange = useCallback(
    (event) => {
      const {state, translationY, velocityY} = event.nativeEvent;

      if (state === State.BEGAN) {
        // Stop any in-flight spring and resume from the actual position (no jump).
        baseY.stopAnimation((value) => {
          const current = typeof value === "number" ? value : liveYRef.current;
          baseYRef.current = current;
          liveYRef.current = current;
          baseY.setValue(current);
        });
        dragY.setValue(0);
      }

      if (state === State.END || state === State.CANCELLED || state === State.FAILED) {
        const current = Math.min(dismissOffset, Math.max(0, baseYRef.current + translationY));
        const draggingDown = translationY > 0 || velocityY > 0.5;
        const dismissThreshold = collapsedOffset + Math.min(120, collapsedHeight * 0.35);

        // Commit the drag position as the new base, then settle.
        baseYRef.current = current;
        baseY.setValue(current);
        dragY.setValue(0);

        if (state === State.END && draggingDown && (current > dismissThreshold || velocityY > 1.1)) {
          settleTo(dismissOffset, {close: true});
          return;
        }

        if (state === State.END) {
          const midpoint = collapsedOffset / 2;
          const target = current > midpoint ? collapsedOffset : 0;
          settleTo(target);
          return;
        }

        // Cancelled/failed: snap back to the nearest resting state.
        settleTo(baseYRef.current > collapsedOffset / 2 ? collapsedOffset : 0);
      }
    },
    [baseY, dragY, dismissOffset, collapsedOffset, collapsedHeight, settleTo]
  );

  if (!visible) return null;

  const isCollapsed = snap !== "expanded";
  // Collapsed-open: pan owns up+down drags, scroll disabled.
  // Expanded + at top: pan activates only on downward drag (collapse) and fails
  // on upward drag (so content scrolls). Expanded + scrolled: pan disabled.
  const panEnabled = isCollapsed || atTop;
  const activeOffsetY = isCollapsed ? [-8, 8] : [-9999, 8];
  const failOffsetY = isCollapsed ? undefined : [-8, 9999];
  const contentScrollEnabled = !isCollapsed;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <GestureHandlerRootView className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close settings"
          onPress={onClose}
          className="absolute inset-0 bg-ink/40"
        />
        <PanGestureHandler
          ref={panRef}
          enabled={panEnabled}
          activeOffsetY={activeOffsetY}
          failOffsetY={failOffsetY}
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          simultaneousHandlers={scrollRef}
        >
          <Animated.View
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
              ref={scrollRef}
              className="flex-1"
              contentContainerClassName="px-4 pb-8 mobile:px-5 tablet:px-8 desktop:px-12"
              showsVerticalScrollIndicator={false}
              bounces={false}
              scrollEnabled={contentScrollEnabled}
              scrollEventThrottle={16}
              keyboardShouldPersistTaps="handled"
              simultaneousHandlers={panRef}
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
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
}

export default BottomSheet;
