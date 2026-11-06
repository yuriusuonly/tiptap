// Expo Router's static web renderer requires a platform-less fallback for
// `index.web.js`. The web client still resolves `index.web.js`; Android
// resolves `index.android.js`.
export {default} from "./index.web";
