/**
 * Styled surface/container primitives (card, raised, outlined) using semantic tokens.
 * Accept `className` to extend; wrap React Native `View`.
 * @module src/components/ui-surface
 */
import {View} from "react-native";

const VARIANTS = {
  plain: "",
  surface: "bg-surface",
  raised: "bg-raised",
  card: "rounded-xl border border-line bg-surface",
  outlined: "rounded-xl border border-line",
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * @param {object} props
 * @param {keyof typeof VARIANTS} [props.variant="plain"]
 * @param {string} [props.className]
 */
export function Surface({variant = "plain", className, ...props}) {
  const base = VARIANTS[variant] ?? VARIANTS.plain;
  return <View className={cx(base, className)} {...props} />;
}

export function Card({className, ...props}) {
  return <Surface variant="card" className={className} {...props} />;
}

export {VARIANTS as surfaceVariants};
export default Surface;
