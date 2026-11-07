import {createRequire} from "node:module";

// These packages expose CommonJS subpaths without an `exports` map, which
// Node's ESM resolver cannot load directly. Bridge them through `require`.
const require = createRequire(import.meta.url);
const {getDefaultConfig} = require("expo/metro-config");
const {withNativeWind} = require("nativewind/metro");

const config = getDefaultConfig(import.meta.dirname);

export default withNativeWind(config, {input: "./src/styles/global.css"});
