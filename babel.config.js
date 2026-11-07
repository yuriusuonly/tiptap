/**
 * Babel configuration for Expo and Nativewind.
 * @module babel.config
 */
export default function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", {jsxImportSource: "nativewind"}],
      "nativewind/babel",
    ],
  };
}
