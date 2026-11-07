/**
 * Web Policy page. Plain placeholder content for now.
 * @module src/web/screens/legal/policy-screen
 */
import Head from "expo-router/head";
import {Link} from "expo-router";
import {Pressable, Text, View} from "react-native";
import {APP_NAME} from "../../../shared/constants/configuration";

export function PolicyScreen() {
  return (
    <>
      <Head>
        <title>Policy — {APP_NAME}</title>
      </Head>
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-[28px] font-bold leading-[34px] text-ink">Policy</Text>
        <Link href="/" asChild>
          <Pressable className="mt-6 rounded-full border border-line bg-raised px-6 py-3">
            <Text className="text-base font-semibold leading-6 text-ink">Back to {APP_NAME}</Text>
          </Pressable>
        </Link>
      </View>
    </>
  );
}

export default PolicyScreen;
