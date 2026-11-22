/**
 * Styled pressable button primitive with variants, sizes, and loading/disabled states.
 * Uses Nativewind semantic tokens. For async actions, pass `loading` to show a
 * themed circular indicator and disable interaction.
 * @module src/components/button
 */
import {Text} from "./text";
import {ActivityIndicator, Pressable, View} from "react-native";
import {useResolvedTheme} from "../store/theme-store";

const VARIANTS = {
  primary: {
    container: "bg-accent",
    text: "text-background font-semibold",
    indicator: "background",
  },
  secondary: {
    container: "border border-line bg-surface",
    text: "text-ink font-medium",
    indicator: "ink",
  },
  ghost: {
    container: "",
    text: "text-accent font-medium",
    indicator: "accent",
  },
  danger: {
    container: "border border-line bg-surface",
    text: "text-cyan font-medium",
    indicator: "danger",
  },
};

const SIZES = {
  sm: {container: "px-3 py-2 rounded-lg", text: "text-[13px] leading-[18px]"},
  md: {container: "px-4 py-3 rounded-xl", text: "text-[15px] leading-[22px]"},
  lg: {container: "px-5 py-4 rounded-xl", text: "text-[16px] leading-6"},
};

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/**
 * @param {object} props
 * @param {keyof typeof VARIANTS} [props.variant="secondary"]
 * @param {keyof typeof SIZES} [props.size="md"]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {string} [props.textClassName]
 * @param {import("react").ReactNode} [props.children]
 * @param {import("react").ReactNode} [props.left]
 */
export function Button({
  variant = "secondary",
  size = "md",
  loading = false,
  disabled = false,
  className,
  textClassName,
  children,
  left,
  accessibilityRole = "button",
  ...props
}) {
  const {palette} = useResolvedTheme();
  const v = VARIANTS[variant] ?? VARIANTS.secondary;
  const s = SIZES[size] ?? SIZES.md;
  const isDisabled = disabled || loading;
  const indicatorColor =
    v.indicator === "background"
      ? palette.background
      : v.indicator === "accent"
        ? palette.accent
        : v.indicator === "danger"
          ? palette.danger
          : palette.textPrimary;

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      disabled={isDisabled}
      className={cx(
        "flex-row items-center justify-center gap-2",
        s.container,
        v.container,
        isDisabled && "opacity-60",
        className
      )}
      {...props}
    >
      {loading ? <ActivityIndicator size="small" color={indicatorColor} /> : left}
      {typeof children === "string" ? (
        <Text className={cx(s.text, v.text, textClassName)}>{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export {VARIANTS as buttonVariants, SIZES as buttonSizes};
export default Button;
