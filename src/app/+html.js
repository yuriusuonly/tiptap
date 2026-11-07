/**
 * Web document shell for Expo Router static rendering.
 * @module src/app/+html
 */
import {ScrollViewStyleReset} from "expo-router/html";

export default ({children}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        <meta
          name="description"
          content="TipTap is an AI-powered, TikTok-style feed for short videos. Create, remix, and share what everyone is watching next."
        />
        <meta name="theme-color" content="#0B0B0F"/>
        <ScrollViewStyleReset />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};
