/**
 * Android bottom tab bar built from React Native primitives and SVG icons.
 * Pressables are the only touch targets; icons and the selection indicator are
 * non-interactive so taps always reach the tab item. Tabs are internal state
 * (see `src/app/_layout.android.js`), not file-based routes: `src/app/` holds
 * only the root route files.
 * @module src/components/tab-bar
 */
import {Pressable, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import HomeIcon from "../assets/icons/home.svg";
import PersonIcon from "../assets/icons/person.svg";
import Icon from "./icon";
import {useResolvedTheme} from "../store/theme-store";

const TABS = [
  {id: "home", title: "Discover", icon: HomeIcon},
  {id: "profile", title: "Profile", icon: PersonIcon},
];

export function AppTabBar({selected, onSelect}) {
  const {palette} = useResolvedTheme();

  return (
    <SafeAreaView
      edges={["bottom"]}
      className="w-full flex-row border-t border-line bg-surface"
    >
      {TABS.map((tab) => {
        const isFocused = selected === tab.id;
        const TabIcon = tab.icon;

        const onPress = () => {
          onSelect(tab.id);
        };

        return (
          <Pressable
            key={tab.id}
            accessibilityRole="tab"
            accessibilityState={{selected: isFocused}}
            accessibilityLabel={tab.title}
            onPress={onPress}
            className="flex-1 items-center justify-center gap-1 py-2"
          >
            <View
              pointerEvents="none"
              className={`h-8 w-12 items-center justify-center rounded-full ${
                isFocused ? "bg-accent/15" : ""
              }`}
            >
              <Icon
                as={TabIcon}
                size={24}
                color={isFocused ? palette.accent : palette.textMuted}
                pointerEvents="none"
              />
            </View>
            <Text
              pointerEvents="none"
              className={`text-[11px] font-medium leading-4 ${
                isFocused ? "text-accent" : "text-muted"
              }`}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </SafeAreaView>
  );
}

export default AppTabBar;
