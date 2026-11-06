import {ScrollViewStyleReset} from "expo-router/html";

export default ({children}) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8"/>
        <meta httpEquiv="X-UA-Compatible" content="IE=edge"/>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
        <ScrollViewStyleReset />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
};
