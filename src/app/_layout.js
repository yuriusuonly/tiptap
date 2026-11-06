import Head from "expo-router/head";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";

export default () => {
  return (
    <>
      <Head>
        <title>TipTap</title>
      </Head>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          title: "TipTap",
          headerShown: false
        }}
      />
    </>
  );
}
