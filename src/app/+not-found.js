/**
 * Web 404 route.
 * @module src/app/+not-found
 */
import Head from "expo-router/head";
import {Link} from "expo-router";
import {Pressable, Text, View} from "react-native";

export default () => {
  return (
    <>
      <Head>
        <title>404 — TipTap</title>
      </Head>
      <View className="flex-1 items-center justify-center bg-canvas p-6">
        <Text className="mb-2 text-[13px] font-bold leading-[18px] tracking-[2px] text-accent">
          404
        </Text>
        <Text className="text-center text-[28px] font-bold leading-[34px] text-ink">
          Page not found
        </Text>
        <Text className="mt-2 text-center text-base leading-6 text-muted">
          The page you are looking for does not exist or has moved.
        </Text>
        <Link href="/" asChild>
          <Pressable className="mt-6 rounded-full border border-line bg-raised px-6 py-3">
            <Text className="text-base font-semibold leading-6 text-ink">Back to TipTap</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
};
