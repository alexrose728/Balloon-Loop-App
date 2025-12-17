import React from "react";
import { View, StyleSheet, FlatList, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ListingCard } from "@/components/ListingCard";
import { useListing } from "@/hooks/useListings";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP) / 2;

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { listings, favorites } = useListing();

  const favoriteListings = listings.filter((l) => favorites.includes(l.id));

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="heart" size={48} color={theme.primary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No favorites yet
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        Tap the heart icon on any balloon arch to save it here
      </ThemedText>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing["3xl"],
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={favoriteListings}
      numColumns={2}
      keyExtractor={(item) => item.id}
      columnWrapperStyle={styles.row}
      renderItem={({ item }) => (
        <ListingCard listing={item} compact style={{ width: CARD_WIDTH }} />
      )}
      ListHeaderComponent={
        <View style={styles.header}>
          <ThemedText type="h1">Favorites</ThemedText>
          {favoriteListings.length > 0 ? (
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
            >
              {favoriteListings.length} saved{" "}
              {favoriteListings.length === 1 ? "arch" : "arches"}
            </ThemedText>
          ) : null}
        </View>
      }
      ListEmptyComponent={renderEmptyState}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    textAlign: "center",
  },
});
