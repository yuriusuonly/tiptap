/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
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
