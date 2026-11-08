/**
 * Metro configuration with Nativewind and SVG-to-component support. The dev
 * server port comes from `.env` (EXPO_PUBLIC_LANDING_PAGE_PORT) so the web
 * landing always runs on the same port the app opens it on.
 * @module metro.config
 */
import fs from "node:fs";
import {createRequire} from "node:module";
import path from "node:path";

// These packages expose CommonJS subpaths without an `exports` map, which
// Node's ESM resolver cannot load directly. Bridge them through `require`.
const require = createRequire(import.meta.url);
const {getDefaultConfig} = require("expo/metro-config");
const {withNativeWind} = require("nativewind/metro");

// Read the landing page port from `.env` (the single source of truth) and
// serve the web bundle on that port. Throws when it is not defined.
const envText = fs.readFileSync(path.join(import.meta.dirname, ".env"), "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    })
);

const webPort = env.EXPO_PUBLIC_LANDING_PAGE_PORT;

if (!webPort) {
  throw new Error(
    "Missing EXPO_PUBLIC_LANDING_PAGE_PORT in `.env` at the workspace root."
  );
}

process.env.EXPO_PUBLIC_LANDING_PAGE_PORT = webPort;

const config = getDefaultConfig(import.meta.dirname);
config.server.port = Number(webPort);

// Load `.svg` files as React components through `react-native-svg-transformer`
// so icons can be rendered with `react-native-svg` on every platform.
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

export default withNativeWind(config, {input: "./src/stylesheets/global.css"});
