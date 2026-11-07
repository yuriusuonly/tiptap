/**
 * Android Home tab content: responsive centered intro copy.
 * @module src/android/screens/home/home-screen
 */
import {Text, View} from "react-native";

export function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background px-4 phone:px-5 tablet:px-8 desktop:px-12">
      <View className="w-full max-w-[480px] items-center gap-2 phone:max-w-[560px] tablet:max-w-[640px] desktop:max-w-[880px]">
        <Text className="text-center text-[24px] font-extrabold leading-[30px] tracking-[-0.5px] text-ink phone:text-[30px] phone:leading-[36px] tablet:text-[36px] tablet:leading-[42px] desktop:text-[44px] desktop:leading-[52px]">
          Home
        </Text>
        <Text className="text-center text-[14px] leading-5 text-muted phone:text-[16px] phone:leading-6 tablet:text-[18px] tablet:leading-[26px] desktop:text-[20px] desktop:leading-[30px]">
          Your AI-powered feed is warming up.
        </Text>
      </View>
    </View>
  );
}

export default HomeScreen;
