/**
 * Generic, cross-platform SVG icon wrapper.
 * Renders SVGs imported via react-native-svg-transformer from src/shared/assets/icons/*.svg.
 * Reusable for all icons (tintable `fill="currentColor"` icons and full-color assets).
 * @module src/shared/components/icon
 */

export function Icon({
  as: SvgComponent,
  size = 24,
  width,
  height,
  color,
  accessibilityLabel,
  accessible,
  style,
  ...rest
}) {
  if (!SvgComponent) return null;

  return (
    <SvgComponent
      width={width ?? size}
      height={height ?? size}
      accessibilityLabel={accessibilityLabel}
      style={style}
      {...(color != null ? {color} : {})}
      {...(accessible !== undefined ? {accessible} : {})}
      {...rest}
    />
  );
}

export default Icon;
