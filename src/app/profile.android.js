/**
 * Android-only Profile route (Profile tab). There is no web `profile.js` route:
 * web `/profile` is unmatched and renders `+not-found.js` with a 404 status.
 * @module src/app/profile.android
 */
export {default} from "../android/screens/profile/profile-screen";
