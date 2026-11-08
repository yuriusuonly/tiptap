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
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        raised: "rgb(var(--color-raised) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        faint: "rgb(var(--color-faint) / <alpha-value>)",
        accent: "rgb(var(--color-accent) / <alpha-value>)",
        cyan: "rgb(var(--color-cyan) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
