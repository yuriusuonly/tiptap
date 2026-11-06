import Svg, {Defs, Ellipse, G, LinearGradient, Path, Rect, Stop} from "react-native-svg";

// Shared logo used by web and Android. Pass `size` to scale.
// Paths mirror src/assets/svg/icon.svg so both stay visually identical.
export const logoGradientId = "tiptap-gradient";

export const Logo = ({size = 96, style, ...rest}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      accessibilityLabel="Tiptap logo"
      style={style}
      {...rest}
    >
      <Defs>
        <LinearGradient id={logoGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#25F4EE" />
          <Stop offset="55%" stopColor="#7C4DFF" />
          <Stop offset="100%" stopColor="#FE2C55" />
        </LinearGradient>
      </Defs>
      <Rect width={512} height={512} rx={120} fill="#0B0B0F" />
      <G fill={`url(#${logoGradientId})`}>
        <Ellipse
          cx={188}
          cy={366}
          rx={62}
          ry={50}
          transform="rotate(-20 188 366)"
        />
        <Rect x={236} y={118} width={30} height={248} rx={15} />
        <Path d="M266 118 C350 132 396 190 380 286 C372 218 330 172 266 164 Z" />
      </G>
    </Svg>
  );
};

export default Logo;
