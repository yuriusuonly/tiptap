/**
 * Nativewind/Tailwind configuration derived from the shared design tokens.
 * Semantic colors resolve through CSS variables defined in
 * `src/stylesheets/global.css`, so light/dark themes switch without inline styles.
 * @module tailwind.config
 */
import {createRequire} from "node:module";
import {breakpoints, contentMaxWidth} from "./src/constants/layout.js";

// `nativewind/preset` is a CommonJS subpath without an `exports` map.
const require = createRequire(import.meta.url);
const nativewindPreset = require("nativewind/preset");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [nativewindPreset],
  theme: {
    extend: {
      screens: {
        mobile: `${breakpoints.mobile}px`,
        tablet: `${breakpoints.tablet}px`,
        desktop: `${breakpoints.desktop}px`,
      },
      maxWidth: {
        content: `${contentMaxWidth}px`,
      },
      fontFamily: {
        sans: ["Outfit_400Regular", "system-ui", "sans-serif"],
      },
      colors: {
        // Material 3 roles (Flutter ColorScheme).
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
        "primary-container": "rgb(var(--color-primary-container) / <alpha-value>)",
        "on-primary-container": "rgb(var(--color-on-primary-container) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        "on-error": "rgb(var(--color-on-error) / <alpha-value>)",
        "surface-variant": "rgb(var(--color-surface-variant) / <alpha-value>)",
        // Legacy semantic aliases used across existing screens.
        background: "rgb(var(--color-background) / <alpha-value>)",
        "on-background": "rgb(var(--color-on-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        raised: "rgb(var(--color-raised) / <alpha-value>)",
        "surface-low": "rgb(var(--color-surface-low) / <alpha-value>)",
        "surface-high": "rgb(var(--color-surface-high) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        faint: "rgb(var(--color-faint) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        cyan: "rgb(var(--color-cyan) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
