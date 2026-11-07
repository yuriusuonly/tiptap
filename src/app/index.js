/**
 * Platform-less fallback that Expo Router's static web renderer requires for
 * `index.web.js`. The web client still resolves `index.web.js`; Android
 * resolves `index.android.js`.
 * @module src/app/index
 */
export {default} from "./index.web";
