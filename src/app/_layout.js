import Head from "expo-router/head";
import {Stack} from "expo-router";
import {StatusBar} from "expo-status-bar";

export default () => {
  return (
    <>
      <Head>
        <title>TipTap</title>
        <meta
          name="description"
          content="Tiptap is an AI-powered, TikTok-style feed for short videos. Create, remix, and share what everyone is watching next."
        />
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
