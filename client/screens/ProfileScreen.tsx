import React from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { useListing } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/Button";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function MenuButton({
  icon,
  label,
  onPress,
  showChevron = true,
  color,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  color?: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      style={[
        styles.menuButton,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
      ]}
    >
      <Feather name={icon} size={20} color={color || theme.text} />
      <ThemedText
        type="body"
        style={[styles.menuLabel, color ? { color } : undefined]}
      >
        {label}
      </ThemedText>
      {showChevron ? (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      ) : null}
    </AnimatedPressable>
  );
}

type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<ProfileNavigationProp>();
  const { theme } = useTheme();
  const { listings, favorites } = useListing();
  const { user, isLoggedIn, login, logout } = useAuth();

  const myListings = listings.filter((l) => l.creatorId === user?.id);

  if (!isLoggedIn) {
    return (
      <View
        style={[
          styles.container,
          styles.centeredContainer,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <View
          style={[
            styles.avatarPlaceholder,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <Feather name="user" size={48} color={theme.textSecondary} />
        </View>
        <ThemedText type="h2" style={styles.loginTitle}>
          Welcome to Balloon Loop
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.loginSubtitle, { color: theme.textSecondary }]}
        >
          Sign in to save favorites, create listings, and connect with the
          balloon community
        </ThemedText>
        <Button onPress={login} style={styles.loginButton}>
          Sign In
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing["3xl"],
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <View style={styles.header}>
        <ThemedText type="h1">Profile</ThemedText>
      </View>

      <View style={styles.profileSection}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <ThemedText type="h1" style={{ color: theme.primary }}>
            {user?.username?.charAt(0).toUpperCase() || "?"}
          </ThemedText>
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="h3">{user?.username || "User"}</ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Member since Dec 2024
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {myListings.length}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Listings
          </ThemedText>
        </View>
        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {favorites.length}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            Favorites
          </ThemedText>
        </View>
      </View>

      <View style={styles.menuSection}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          My Account
        </ThemedText>
        <MenuButton
          icon="grid"
          label="My Listings"
          onPress={() => navigation.navigate("MyListings")}
        />
        <MenuButton
          icon="heart"
          label="Favorites"
          onPress={() => (navigation as any).navigate("Main", { screen: "Favorites" })}
        />
        <MenuButton
          icon="settings"
          label="Settings"
          onPress={() => {}}
        />
      </View>

      <View style={styles.menuSection}>
        <ThemedText
          type="small"
          style={[styles.sectionTitle, { color: theme.textSecondary }]}
        >
          Support
        </ThemedText>
        <MenuButton
          icon="help-circle"
          label="Help Center"
          onPress={() => {}}
        />
        <MenuButton
          icon="file-text"
          label="Terms of Service"
          onPress={() => {}}
        />
        <MenuButton
          icon="shield"
          label="Privacy Policy"
          onPress={() => {}}
        />
      </View>

      <Pressable
        onPress={logout}
        style={[
          styles.logoutButton,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="log-out" size={20} color={theme.error} />
        <ThemedText type="body" style={[styles.logoutText, { color: theme.error }]}>
          Sign Out
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  loginTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  loginSubtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  loginButton: {
    width: "100%",
    maxWidth: 300,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  menuSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  menuLabel: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.lg,
  },
  logoutText: {
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
});
