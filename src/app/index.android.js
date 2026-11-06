import {useState} from "react";
import {StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {
  Box,
  Column,
  Host,
  Icon,
  NavigationBar,
  NavigationBarItem,
  Text,
} from "@expo/ui/jetpack-compose";
import {fillMaxSize} from "@expo/ui/jetpack-compose/modifiers";
import {colors} from "../theme/colors";

const TABS = {
  home: {
    label: "Home",
    title: "Home",
    subtitle: "Your AI-powered feed is warming up.",
    icon: require("../assets/android/home.xml"),
  },
  profile: {
    label: "Profile",
    title: "Profile",
    subtitle: "Your creations and drafts will live here.",
    icon: require("../assets/android/person.xml"),
  },
};

const TAB_COLORS = {
  selectedIconColor: colors.accent,
  selectedTextColor: colors.accent,
  selectedIndicatorColor: "#33FE2C55",
  unselectedIconColor: colors.textMuted,
  unselectedTextColor: colors.textMuted,
};

export default function IndexAndroid() {
  const [selectedTab, setSelectedTab] = useState("home");
  const activeTab = TABS[selectedTab];

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <Host style={styles.contentHost}>
        <Box modifiers={[fillMaxSize()]} contentAlignment="center">
          <Column horizontalAlignment="center" verticalArrangement={{spacedBy: 8}}>
            <Text
              color={colors.textPrimary}
              style={{fontSize: 30, fontWeight: "800", letterSpacing: -0.5}}
            >
              {activeTab.title}
            </Text>
            <Text
              color={colors.textSecondary}
              style={{fontSize: 16, lineHeight: 24, textAlign: "center"}}
            >
              {activeTab.subtitle}
            </Text>
          </Column>
        </Box>
      </Host>

      <Host style={styles.navHost} matchContents={{vertical: true}}>
        <NavigationBar
          containerColor={colors.surface}
          contentColor={colors.textMuted}
          tonalElevation={0}
        >
          {Object.entries(TABS).map(([key, tab]) => (
            <NavigationBarItem
              key={key}
              selected={selectedTab === key}
              onClick={() => setSelectedTab(key)}
              colors={TAB_COLORS}
            >
              <NavigationBarItem.Icon>
                <Icon source={tab.icon} contentDescription={tab.label} />
              </NavigationBarItem.Icon>
              <NavigationBarItem.Label>
                <Text>{tab.label}</Text>
              </NavigationBarItem.Label>
            </NavigationBarItem>
          ))}
        </NavigationBar>
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentHost: {
    flex: 1,
    width: "100%",
  },
  navHost: {
    width: "100%",
  },
});
