/**
 * Android bottom tab bar built from React Native primitives and SVG icons.
 * Pressables are the only touch targets; icons and the selection indicator are
 * non-interactive so taps always reach the tab item.
 * @module src/app/android/components/app-tab-bar
 */
import {Pressable, Text, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import HomeIcon from "../../../shared/assets/icons/home.svg";
import PersonIcon from "../../../shared/assets/icons/person.svg";
import Icon from "../../../shared/components/icon";
import {useResolvedTheme} from "../../../shared/store/theme-store";

const ICONS = {
  index: HomeIcon,
  "android/features/profile/profile-screen": PersonIcon,
};

// Only Home and Profile are tab items. Other file-based routes under src/app/
// (feature screens, components, web screens) have no entry and are skipped.
const VISIBLE_ROUTES = new Set(Object.keys(ICONS));

export function AppTabBar({state, descriptors, navigation}) {
  const {palette} = useResolvedTheme();

  return (
    <SafeAreaView
      edges={["bottom"]}
      className="w-full flex-row border-t border-line bg-surface"
    >
      {state.routes.map((route, index) => {
        if (!VISIBLE_ROUTES.has(route.name)) return null;

        const {options} = descriptors[route.key];
        const label = options.title ?? route.name;
        const isFocused = state.index === index;
        const TabIcon = ICONS[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({type: "tabLongPress", target: route.key});
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{selected: isFocused}}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            onPress={onPress}
            onLongPress={onLongPress}
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
              {label}
            </Text>
          </Pressable>
        );
      })}
    </SafeAreaView>
  );
}

export default AppTabBar;
