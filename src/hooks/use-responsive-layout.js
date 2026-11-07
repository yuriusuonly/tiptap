import {useWindowDimensions} from "react-native";
import {getLayoutClass, responsiveLayout} from "../theme/layout";

/**
 * Returns the active responsive layout class and its tokens.
 *
 * Pass `enabled: false` during static web rendering (or before hydration) to
 * keep the server HTML and first client render on the smallest class. Callers
 * flip it on from an effect, matching the existing `mounted` guard.
 */
export function useResponsiveLayout({enabled = true} = {}) {
  const {width, height} = useWindowDimensions();
  const layoutClass = enabled ? getLayoutClass(width) : "wearable";

  return {
    width,
    height,
    layoutClass,
    tokens: responsiveLayout[layoutClass],
    isWearable: layoutClass === "wearable",
    isPhone: layoutClass === "phone",
    isTablet: layoutClass === "tablet",
    isDesktop: layoutClass === "desktop",
    isCompact: layoutClass === "wearable" || layoutClass === "phone",
  };
}

export default useResponsiveLayout;
