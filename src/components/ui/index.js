/**
 * Expo UI component adapters.
 *
 * These wrap `@expo/ui` universal components in `Host` so they can be dropped
 * into React Native layouts. `Host` is given the same #607D8B seed color the
 * Flutter app passes to `ColorScheme.fromSeed`, so Jetpack Compose (Android),
 * SwiftUI (iOS) and web all render the same Material 3 palette.
 *
 * Expo UI owns interactive/native controls (buttons, text, cards). Animated
 * content stays in React Native/Reanimated and can be embedded inside a Host
 * as a React Native child.
 * @module src/components/ui
 */
import {
  Button as ExpoButton,
  Column as ExpoColumn,
  Host,
  Text as ExpoText,
} from "@expo/ui";
import {SEED_COLOR, typography} from "../../constants/material-theme";
import {useResolvedTheme} from "../../store/theme-store";
import {FAMILIES} from "../text";

/** Host configured with the Flutter app's Material 3 seed and color scheme. */
export function UIHost({children, matchContents = true, style, colorScheme: forcedScheme}) {
  const {scheme} = useResolvedTheme();
  return (
    <Host
      seedColor={SEED_COLOR}
      colorScheme={forcedScheme ?? scheme}
      matchContents={matchContents}
      style={style}
    >
      {children}
    </Host>
  );
}

const WEIGHT_FAMILY = {
  normal: FAMILIES[400],
  bold: FAMILIES[700],
  100: FAMILIES[100],
  200: FAMILIES[200],
  300: FAMILIES[300],
  400: FAMILIES[400],
  500: FAMILIES[500],
  600: FAMILIES[600],
  700: FAMILIES[700],
  800: FAMILIES[800],
  900: FAMILIES[900],
};

/** Map a Flutter text-theme role to Expo UI's textStyle shape. */
export function uiTextStyle(role = "bodyMedium", overrides = {}) {
  const spec = typography[role] ?? typography.bodyMedium;
  const weight = String(overrides.weight ?? spec.weight);
  const style = {
    fontFamily: overrides.fontFamily ?? WEIGHT_FAMILY[weight] ?? FAMILIES[400],
    fontSize: overrides.fontSize ?? spec.fontSize,
    lineHeight: overrides.lineHeight ?? spec.lineHeight,
    fontWeight: weight,
  };
  for (const key of ["color", "textAlign", "letterSpacing"]) {
    if (overrides[key] != null) style[key] = overrides[key];
  }
  return style;
}

/** Native Material 3 text using the Outfit font and the resolved M3 colors. */
export function NativeText({
  role = "bodyMedium",
  color = "ink",
  weight,
  textAlign,
  children,
  style,
  ...rest
}) {
  const {palette} = useResolvedTheme();
  const textStyle = uiTextStyle(role, {
    weight,
    textAlign,
    color: palette[color] ?? color,
  });
  return (
    <UIHost matchContents>
      <ExpoText textStyle={textStyle} style={style} {...rest}>
        {children}
      </ExpoText>
    </UIHost>
  );
}

/** Native Material 3 button (filled / outlined / text). */
export function NativeButton({
  label,
  onPress,
  variant = "filled",
  disabled = false,
  accessibilityLabel,
  style,
}) {
  return (
    <UIHost matchContents>
      <ExpoButton
        label={label}
        variant={variant}
        onPress={onPress}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel ?? label}
        style={style}
      />
    </UIHost>
  );
}

/** Native Material 3 card surface (Flutter's elevation-0 Card). */
export function NativeCard({children, spacing = 8, alignment = "start", style}) {
  const {palette} = useResolvedTheme();
  return (
    <UIHost matchContents style={style}>
      <ExpoColumn
        spacing={spacing}
        alignment={alignment}
        style={{
          backgroundColor: palette.surfaceContainerLow,
          borderRadius: 12,
          padding: 16,
        }}
      >
        {children}
      </ExpoColumn>
    </UIHost>
  );
}

export {Host, ExpoButton as Button, ExpoColumn as Column, ExpoText as Text};
