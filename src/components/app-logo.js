/**
 * Cross-platform TipTap logo rendered with react-native-svg primitives.
 * Geometry/gradient mirror src/assets/icons/icon.svg (master asset) for reliable
 * rendering across web and Android (the direct SVG transform of complex gradients
 * can fail in some web dev/runtime paths).
 * @module src/components/app-logo
 */
import Svg, {Defs, Ellipse, G, LinearGradient, Path, Rect, Stop} from "react-native-svg";

export function AppLogo({
  size = 96,
  width,
  height,
  accessibilityLabel = "Tiptap logo",
  accessible,
  style,
  ...rest
}) {
  return (
    <Svg
      width={width ?? size}
      height={height ?? size}
      viewBox="0 0 512 512"
      accessibilityLabel={accessibilityLabel}
      style={style}
      {...(accessible !== undefined ? {accessible} : {})}
      {...rest}
    >
      <Defs>
        <LinearGradient id="tiptap-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#25F4EE" />
          <Stop offset="55%" stopColor="#7C4DFF" />
          <Stop offset="100%" stopColor="#FE2C55" />
        </LinearGradient>
      </Defs>
      <Rect width={512} height={512} rx={120} fill="#0B0B0F" />
      <G fill="url(#tiptap-gradient)">
        <Ellipse cx={188} cy={366} rx={62} ry={50} transform="rotate(-20 188 366)" />
        <Rect x={236} y={118} width={30} height={248} rx={15} />
        <Path d="M266 118 C350 132 396 190 380 286 C372 218 330 172 266 164 Z" />
      </G>
    </Svg>
  );
}

export default AppLogo;
