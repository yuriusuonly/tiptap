import {createRequire} from "node:module";

// `nativewind/preset` is a CommonJS subpath without an `exports` map.
const require = createRequire(import.meta.url);
const nativewindPreset = require("nativewind/preset");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors: {
        canvas: "#0B0B0F",
        surface: "#15151B",
        raised: "#1D1D25",
        line: "#26262F",
        ink: "#FFFFFF",
        muted: "#A1A1AA",
        faint: "#6B6B76",
        accent: "#FE2C55",
        cyan: "#25F4EE",
        purple: "#7C4DFF",
      },
    },
  },
  plugins: [],
};
