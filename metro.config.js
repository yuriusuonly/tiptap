import {createRequire} from "node:module";

// These packages expose CommonJS subpaths without an `exports` map, which
// Node's ESM resolver cannot load directly. Bridge them through `require`.
const require = createRequire(import.meta.url);
const {getDefaultConfig} = require("expo/metro-config");
const {withNativeWind} = require("nativewind/metro");

const config = getDefaultConfig(import.meta.dirname);

// Load `.svg` files as React components through `react-native-svg-transformer`
// so icons can be rendered with `react-native-svg` on every platform.
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

export default withNativeWind(config, {input: "./src/styles/global.css"});
