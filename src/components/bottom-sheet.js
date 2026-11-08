/**
 * Android bottom sheet: instant show/hide (no entrance/exit transition) with
 * expandable/collapsible behavior driven by pan gestures (RNGH). Opens at 75%
 * screen height by default; drag up expands to max (88%), drag down
 * collapses/dismisses. When partially open the whole sheet responds to vertical
 * drags; when fully expanded, content scrolls and a downward drag from the top
 * of content collapses the sheet. Drag settles to snap points on release.
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
import {cssInterop} from "nativewind";
import {
  closeBottomSheet,
  openBottomSheet,
  useBottomSheetStore,
} from "../store/bottom-sheet-store";

// Enable Nativewind className styling for RNGH components used by the sheet.
cssInterop(GestureHandlerRootView, {className: "style"});
cssInterop(ScrollView, {
  className: "style",
  contentContainerClassName: "contentContainerStyle",
});

const MAX_FRACTION = 0.88;
const DEFAULT_FRACTION = 0.75;

export function BottomSheet({visible, onClose, children}) {
  const {height: windowHeight} = useWindowDimensions();
  const expandedHeight = Math.max(240, Math.round(windowHeight * MAX_FRACTION));
  const defaultHeight = Math.max(200, Math.round(windowHeight * DEFAULT_FRACTION));
  // Offset from the top of the max-height sheet frame: 0 = fully expanded (max),
  // defaultOffset = 75% visible, dismissOffset = hidden.
  const defaultOffset = Math.max(0, expandedHeight - defaultHeight);
  const dismissOffset = expandedHeight;

  // Snap/scroll state drive gesture config so the first swipe is always handled.
  const [snap, setSnap] = useState("default"); // "default" (75%) | "expanded" (max)
  const [atTop, setAtTop] = useState(true);

  // baseY = resting snap offset; dragY = live gesture translation (native).
  // Default opens expanded (full height).
  const baseY = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const translateY = useMemo(() => Animated.add(baseY, dragY), [baseY, dragY]);

  const baseYRef = useRef(0);
  const liveYRef = useRef(0);
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
      // Reveal instantly (no entrance transition) at the default (75%) height.
      setResting(defaultOffset);
      scrollYRef.current = 0;
      setAtTop(true);
      setSnap("default");
    }
  }, [visible, defaultOffset, setResting]);

  const settleTo = useCallback(
    (toValue, {close = false} = {}) => {
      const snapValue = close ? defaultOffset : toValue;
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
          setSnap(snapValue === 0 ? "expanded" : "default");
        }
        if (close) {
          onClose?.();
        }
      });
    },
    [baseY, dragY, defaultOffset, onClose]
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
        const dismissThreshold = defaultOffset + Math.min(120, defaultHeight * 0.35);

        // Commit the drag position as the new base, then settle.
        baseYRef.current = current;
        baseY.setValue(current);
        dragY.setValue(0);

        if (state === State.END && draggingDown && (current > dismissThreshold || velocityY > 1.1)) {
          settleTo(dismissOffset, {close: true});
          return;
        }

        if (state === State.END) {
          const midpoint = defaultOffset / 2;
          const target = current > midpoint ? defaultOffset : 0;
          settleTo(target);
          return;
        }

        // Cancelled/failed: snap back to the nearest resting state.
        settleTo(baseYRef.current > defaultOffset / 2 ? defaultOffset : 0);
      }
    },
    [baseY, dragY, dismissOffset, defaultOffset, defaultHeight, settleTo]
  );

  if (!visible) return null;

  const isPartiallyOpen = snap !== "expanded";
  // Partially open (default 75%): pan owns up+down drags, scroll disabled, so a
  // swipe up expands to max and a swipe down collapses/dismisses responsively.
  // Fully expanded (max) + at top: pan activates only on downward drag (to
  // collapse) and fails on upward drag (so content scrolls). Expanded + scrolled:
  // pan disabled.
  const panEnabled = isPartiallyOpen || atTop;
  const activeOffsetY = isPartiallyOpen ? [-8, 8] : [-9999, 8];
  const failOffsetY = isPartiallyOpen ? undefined : [-8, 9999];
  const contentScrollEnabled = !isPartiallyOpen;

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

/** Root-level host (rendered by `Root`, above page content and below dialogs). */
export function BottomSheetHost() {
  const isOpen = useBottomSheetStore((state) => state.isOpen);
  const render = useBottomSheetStore((state) => state.render);

  if (!isOpen) return null;

  return (
    <BottomSheet visible={isOpen} onClose={closeBottomSheet}>
      {typeof render === "function" ? render() : render}
    </BottomSheet>
  );
}

export {openBottomSheet, closeBottomSheet};
