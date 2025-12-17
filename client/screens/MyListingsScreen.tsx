import React from "react";
import { View, StyleSheet, FlatList, Dimensions, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ListingCard } from "@/components/ListingCard";
import { useListing } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/query-client";
import { Button } from "@/components/Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = Spacing.md;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP) / 2;

export default function MyListingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { listings, refetch } = useListing();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const myListings = listings.filter((l) => l.creatorId === user?.id);

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      await apiRequest("DELETE", `/api/listings/${listingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      refetch();
    },
  });

  const handleDelete = (listingId: string) => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate(listingId),
        },
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="image" size={48} color={theme.primary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No listings yet
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        Share your balloon arch creations with the community
      </ThemedText>
      <Button
        onPress={() => (navigation as any).navigate("CreateListing")}
        style={styles.createButton}
      >
        Create Listing
      </Button>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <ThemedText type="h3">My Listings</ThemedText>
        <View style={styles.backButton} />
      </View>

      <FlatList
        contentContainerStyle={{
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={myListings}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={myListings.length > 1 ? styles.row : undefined}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <ListingCard listing={item} compact />
            <Pressable
              onPress={() => handleDelete(item.id)}
              style={[styles.deleteButton, { backgroundColor: theme.error }]}
            >
              <Feather name="trash-2" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  deleteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: Spacing.xl,
  },
  createButton: {
    minWidth: 200,
  },
});
