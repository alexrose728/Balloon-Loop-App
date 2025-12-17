import React, { useState, useMemo } from "react";
import { View, StyleSheet, TextInput, Pressable, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ListingCard } from "@/components/ListingCard";
import { useListing } from "@/hooks/useListings";

const EVENT_TYPES = [
  "Birthday",
  "Wedding",
  "Corporate",
  "Baby Shower",
  "Graduation",
  "Anniversary",
];

const COLORS = [
  { name: "Pink", color: "#FF6B9D" },
  { name: "Blue", color: "#4A90D9" },
  { name: "Gold", color: "#FFD700" },
  { name: "White", color: "#FFFFFF" },
  { name: "Purple", color: "#9B59B6" },
  { name: "Green", color: "#2ECC71" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FilterChip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : "transparent",
          borderColor: selected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      {color ? (
        <View
          style={[
            styles.colorDot,
            {
              backgroundColor: color,
              borderColor: color === "#FFFFFF" ? theme.border : "transparent",
              borderWidth: color === "#FFFFFF" ? 1 : 0,
            },
          ]}
        />
      ) : null}
      <ThemedText
        type="small"
        style={[
          styles.chipText,
          { color: selected ? "#FFFFFF" : theme.text },
        ]}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { listings } = useListing();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(true);

  const toggleEventType = (type: string) => {
    setSelectedEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName],
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedEventTypes([]);
    setSelectedColors([]);
  };

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedEventTypes.length > 0 ||
    selectedColors.length > 0;

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        searchQuery.length === 0 ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesEventType =
        selectedEventTypes.length === 0 ||
        selectedEventTypes.includes(listing.eventType);

      const matchesColor =
        selectedColors.length === 0 ||
        listing.colors.some((c) => selectedColors.includes(c));

      return matchesSearch && matchesEventType && matchesColor;
    });
  }, [listings, searchQuery, selectedEventTypes, selectedColors]);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View
        style={[styles.searchBar, { backgroundColor: theme.backgroundDefault }]}
      >
        <Feather
          name="search"
          size={20}
          color={theme.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search balloon arches..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 ? (
          <Pressable onPress={() => setSearchQuery("")}>
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        onPress={() => setShowFilters(!showFilters)}
        style={styles.filterToggle}
      >
        <Feather
          name={showFilters ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.textSecondary}
        />
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
        >
          {showFilters ? "Hide Filters" : "Show Filters"}
        </ThemedText>
      </Pressable>

      {showFilters ? (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <ThemedText type="small" style={styles.filterLabel}>
              Event Type
            </ThemedText>
            <View style={styles.chipsRow}>
              {EVENT_TYPES.map((type) => (
                <FilterChip
                  key={type}
                  label={type}
                  selected={selectedEventTypes.includes(type)}
                  onPress={() => toggleEventType(type)}
                />
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <ThemedText type="small" style={styles.filterLabel}>
              Colors
            </ThemedText>
            <View style={styles.chipsRow}>
              {COLORS.map((c) => (
                <FilterChip
                  key={c.name}
                  label={c.name}
                  color={c.color}
                  selected={selectedColors.includes(c.name)}
                  onPress={() => toggleColor(c.name)}
                />
              ))}
            </View>
          </View>

          {hasActiveFilters ? (
            <Pressable onPress={clearFilters} style={styles.clearButton}>
              <Feather name="x" size={16} color={theme.primary} />
              <ThemedText
                type="small"
                style={{ color: theme.primary, marginLeft: Spacing.xs }}
              >
                Clear all filters
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : null}

      <View style={styles.resultsHeader}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          {filteredListings.length}{" "}
          {filteredListings.length === 1 ? "Result" : "Results"}
        </ThemedText>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="search" size={48} color={theme.textSecondary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No results found
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        Try adjusting your filters or search terms
      </ThemedText>
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      ListHeaderComponent={renderHeader}
      data={filteredListings}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ListingCard listing={item} style={styles.listCard} />
      )}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
      ListEmptyComponent={renderEmptyState}
      keyboardShouldPersistTaps="handled"
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    marginBottom: Spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.lg,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  filterToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
  },
  filtersContainer: {
    marginTop: Spacing.sm,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  chipText: {
    fontWeight: "500",
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
  clearButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
  resultsHeader: {
    marginTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["3xl"],
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
  listCard: {
    marginBottom: 0,
  },
});
