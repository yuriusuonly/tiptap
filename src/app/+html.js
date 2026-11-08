/**
 * Web document shell for Expo Router static rendering.
 * @module src/app/+html
 */
import {ScrollViewStyleReset} from "expo-router/html";
import {APP_DESCRIPTION} from "../constants/configuration";

// Blocks painting so the persisted theme is applied before first paint.
// AsyncStorage on web uses localStorage under the same key
// ("tiptap.theme-mode"); read that entry synchronously here because the
// async rehydrate in Root only runs after hydration, which is what caused
// the white -> dark flash on reload. Runtime persistence stays AsyncStorage.
const THEME_SCRIPT = [
  "try{",
  "var raw=localStorage.getItem('tiptap.theme-mode');",
  "var mode='auto';",
  "if(raw){var parsed=JSON.parse(raw);mode=(parsed&&parsed.state&&parsed.state.themeMode)||'auto';}",
  "var dark=mode==='dark'||(mode==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);",
  "var root=document.documentElement;",
  "root.classList.toggle('dark',dark);",
  "root.style.colorScheme=dark?'dark':'light';",
  "}catch(e){}",
].join("");

// script content must not contain "</script>" — the joined string does not.
export default ({children}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="theme-color" content="#FAFAFA" media="(prefers-color-scheme: light)"/>
        <meta name="theme-color" content="#0A0A0A" media="(prefers-color-scheme: dark)"/>
        <script dangerouslySetInnerHTML={{__html: THEME_SCRIPT}} />
        <ScrollViewStyleReset />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};
