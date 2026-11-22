/**
 * Styled text primitives using the same Google Fonts **Outfit** family and
 * Material 3 text scale as the Flutter app. All text in the app should use
 * these components (or `AnimatedText` from `components/animations`) instead of
 * React Native's raw `Text`, so the font is applied consistently.
 * @module src/components/text
 */
import {Text as NativeText} from "react-native";
/** Font names registered by `useFonts` in `src/components/root.js`. */
const FAMILIES = {
  100: "Outfit_100Thin",
  200: "Outfit_200ExtraLight",
  300: "Outfit_300Light",
  400: "Outfit_400Regular",
  500: "Outfit_500Medium",
  600: "Outfit_600SemiBold",
  700: "Outfit_700Bold",
  800: "Outfit_800ExtraBold",
  900: "Outfit_900Black",
};

/** Infer the Outfit weight from Nativewind classes used across the app. */
function familyFromClassName(className) {
  if (/\bfont-(black|900)\b/.test(className)) return FAMILIES[900];
  if (/\bfont-(extrabold|800)\b/.test(className)) return FAMILIES[800];
  if (/\bfont-(bold|700)\b/.test(className)) return FAMILIES[700];
  if (/\bfont-(semibold|600)\b/.test(className)) return FAMILIES[600];
  if (/\bfont-(medium|500)\b/.test(className)) return FAMILIES[500];
  if (/\bfont-(light|300)\b/.test(className)) return FAMILIES[300];
  return FAMILIES[400];
}

/**
 * React Native `Text` with the Outfit family applied.
 * Accepts the same props, including Nativewind `className`.
 */
export function Text({className = "", style, ...props}) {
  const fontFamily = familyFromClassName(className);
  return <NativeText className={className} style={[{fontFamily}, style]} {...props} />;
}

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
  return <Text className={cx(VARIANTS[variant] ?? VARIANTS.body, className)} {...props} />;
}

export {VARIANTS as textVariants, FAMILIES as outfitFamilies};
export default AppText;
