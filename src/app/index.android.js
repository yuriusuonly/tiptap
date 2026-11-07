import {useState} from "react";
import {StyleSheet} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {
  Box,
  Card,
  Column,
  DropdownMenuItem,
  ExposedDropdownMenu,
  ExposedDropdownMenuBox,
  Host,
  Icon,
  LazyColumn,
  ListItem,
  NavigationBar,
  NavigationBarItem,
  Text,
} from "@expo/ui/jetpack-compose";
import {
  clip,
  fillMaxSize,
  fillMaxWidth,
  menuAnchor,
  paddingAll,
  Shapes,
} from "@expo/ui/jetpack-compose/modifiers";
import {radius, spacing} from "../theme/colors";
import {THEME_MODES, useResolvedTheme, useThemeStore} from "../store/theme-store";

const TABS = {
  home: {
    label: "Home",
    title: "Home",
    subtitle: "Your AI-powered feed is warming up.",
    icon: require("../assets/icons/home.xml"),
  },
  profile: {
    label: "Profile",
    title: "Profile",
    subtitle: "Your creations and drafts will live here.",
    icon: require("../assets/icons/person.xml"),
  },
};

export default function IndexAndroid() {
  const [selectedTab, setSelectedTab] = useState("home");
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const {themeMode, palette, scheme} = useResolvedTheme();
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const activeTab = TABS[selectedTab];

  const tabColors = {
    selectedIconColor: palette.accent,
    selectedTextColor: palette.accent,
    selectedIndicatorColor: "#33FE2C55",
    unselectedIconColor: palette.textMuted,
    unselectedTextColor: palette.textMuted,
  };

  return (
    <SafeAreaView style={[styles.root, {backgroundColor: palette.background}]} edges={["top"]}>
      <Host style={styles.contentHost} colorScheme={scheme}>
        {selectedTab === "profile" ? (
          <ProfilePreferences
            palette={palette}
            themeMode={themeMode}
            scheme={scheme}
            expanded={themeMenuOpen}
            onExpandedChange={setThemeMenuOpen}
            onSelectTheme={(mode) => {
              setThemeMode(mode);
              setThemeMenuOpen(false);
            }}
          />
        ) : (
          <Box modifiers={[fillMaxSize()]} contentAlignment="center">
            <Column horizontalAlignment="center" verticalArrangement={{spacedBy: 8}}>
              <Text
                color={palette.textPrimary}
                style={{fontSize: 30, fontWeight: "800", letterSpacing: -0.5}}
              >
                {activeTab.title}
              </Text>
              <Text
                color={palette.textSecondary}
                style={{fontSize: 16, lineHeight: 24, textAlign: "center"}}
              >
                {activeTab.subtitle}
              </Text>
            </Column>
          </Box>
        )}
      </Host>

      <Host style={styles.navHost} matchContents={{vertical: true}} colorScheme={scheme}>
        <NavigationBar
          containerColor={palette.surface}
          contentColor={palette.textMuted}
          tonalElevation={0}
        >
          {Object.entries(TABS).map(([key, tab]) => (
            <NavigationBarItem
              key={key}
              selected={selectedTab === key}
              onClick={() => setSelectedTab(key)}
              colors={tabColors}
            >
              <NavigationBarItem.Icon>
                <Icon
                  source={tab.icon}
                  size={24}
                  tint={selectedTab === key ? palette.accent : palette.textMuted}
                  contentDescription={tab.label}
                />
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

function ProfilePreferences({
  palette,
  themeMode,
  scheme,
  expanded,
  onExpandedChange,
  onSelectTheme,
}) {
  const currentMode =
    THEME_MODES.find((mode) => mode.value === themeMode) ?? THEME_MODES[0];

  return (
    <Box
      modifiers={[fillMaxSize(), paddingAll(spacing.lg)]}
      contentAlignment="topCenter"
    >
      <Column
        modifiers={[fillMaxWidth()]}
        verticalArrangement={{spacedBy: spacing.sm}}
      >
        <Text
          color={palette.textMuted}
          style={{fontSize: 12, fontWeight: "700", letterSpacing: 1.2}}
        >
          PREFERENCES
        </Text>

        <Card
          colors={{containerColor: palette.surface, contentColor: palette.textPrimary}}
          elevation={0}
          border={{width: 1, color: palette.border}}
          modifiers={[fillMaxWidth(), clip(Shapes.RoundedCorner(radius.lg))]}
        >
          <LazyColumn
            contentPadding={{
              start: spacing.sm,
              top: spacing.sm,
              end: spacing.sm,
              bottom: spacing.sm,
            }}
          >
            <ExposedDropdownMenuBox
              expanded={expanded}
              onExpandedChange={onExpandedChange}
              modifiers={[fillMaxWidth()]}
            >
              <ListItem modifiers={[fillMaxWidth(), menuAnchor("primaryNotEditable")]}>
                <ListItem.HeadlineContent>
                  <Text color={palette.textPrimary} style={{fontSize: 16}}>
                    Theme
                  </Text>
                </ListItem.HeadlineContent>
                <ListItem.SupportingContent>
                  <Text color={palette.textMuted} style={{fontSize: 13}}>
                    Light, dark, or match your system
                  </Text>
                </ListItem.SupportingContent>
                <ListItem.TrailingContent>
                  <Text color={palette.textSecondary} style={{fontSize: 14}}>
                    {`${currentMode.label}  ▾`}
                  </Text>
                </ListItem.TrailingContent>
              </ListItem>

              <ExposedDropdownMenu
                key={`theme-menu-${scheme}`}
                expanded={expanded}
                onDismissRequest={() => onExpandedChange(false)}
                containerColor={palette.surfaceRaised}
              >
                {THEME_MODES.map((mode) => (
                  <DropdownMenuItem
                    key={mode.value}
                    onClick={() => onSelectTheme(mode.value)}
                    elementColors={{textColor: palette.textPrimary}}
                  >
                    <DropdownMenuItem.Text>
                      <Text color={palette.textPrimary}>{mode.label}</Text>
                    </DropdownMenuItem.Text>
                  </DropdownMenuItem>
                ))}
              </ExposedDropdownMenu>
            </ExposedDropdownMenuBox>
          </LazyColumn>
        </Card>
      </Column>
    </Box>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  contentHost: {
    flex: 1,
    width: "100%",
  },
  navHost: {
    width: "100%",
  },
});
