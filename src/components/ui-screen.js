/**
 * Screen container primitives with semantic background and optional safe-area/scroll.
 * Use for consistent page roots across Android and web.
 * @module src/components/ui-screen
 */
import {ScrollView, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Non-scrolling screen root.
 * @param {object} props
 * @param {boolean} [props.safe=false] - Wrap in SafeAreaView.
 * @param {import("react-native").Edge[]} [props.edges]
 * @param {string} [props.className]
 */
export function Screen({safe = false, edges, className, children, ...props}) {
  const Component = safe ? SafeAreaView : View;
  const safeProps = safe && edges ? {edges} : {};
  return (
    <Component className={cx("flex-1 bg-background", className)} {...safeProps} {...props}>
      {children}
    </Component>
  );
}

/**
 * Scrolling screen root with a flex-grow content container.
 * @param {object} props
 * @param {boolean} [props.safe=false]
 * @param {import("react-native").Edge[]} [props.edges]
 * @param {string} [props.className] - Applied to ScrollView.
 * @param {string} [props.contentClassName] - Applied to content container.
 */
export function ScrollScreen({
  safe = false,
  edges,
  className,
  contentClassName,
  contentContainerClassName,
  children,
  ...props
}) {
  const content = (
    <ScrollView
      className={cx("flex-1 bg-background", className)}
      contentContainerClassName={cx("grow", contentClassName ?? contentContainerClassName)}
      {...props}
    >
      {children}
    </ScrollView>
  );

  if (!safe) return content;
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-background">
      {content}
    </SafeAreaView>
  );
}

export default Screen;
