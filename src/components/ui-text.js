/**
 * Styled text primitive wrapping React Native `Text` with design-system variants.
 * Uses Nativewind semantic color/typography tokens; accepts `className` to extend.
 * @module src/components/ui-text
 */
import {Text} from "react-native";

const VARIANTS = {
  display: "text-[32px] font-bold leading-[38px] text-ink",
  h1: "text-[28px] font-bold leading-[34px] text-ink",
  h2: "text-[22px] font-semibold leading-[28px] text-ink",
  title: "text-[17px] font-semibold leading-[24px] text-ink",
  body: "text-[15px] leading-[22px] text-muted",
  bodyInk: "text-[15px] leading-[22px] text-ink",
  caption: "text-[13px] leading-[18px] text-muted",
  label: "text-[14px] font-medium leading-5 text-ink",
  muted: "text-[14px] leading-5 text-muted",
  faint: "text-[12px] leading-[17px] text-faint",
  accent: "text-[14px] font-medium leading-5 text-accent",
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * @param {object} props
 * @param {keyof typeof VARIANTS} [props.variant="body"]
 * @param {string} [props.className]
 */
export function AppText({variant = "body", className, ...props}) {
  const base = VARIANTS[variant] ?? VARIANTS.body;
  return <Text className={cx(base, className)} {...props} />;
}

export {VARIANTS as textVariants};
export default AppText;
