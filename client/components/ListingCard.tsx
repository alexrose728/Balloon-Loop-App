import React from "react";
import { StyleSheet, Pressable, View, ViewStyle } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useListing } from "@/hooks/useListings";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { Listing } from "@/types/listing";
import type { ExploreStackParamList } from "@/navigation/ExploreStackNavigator";

interface ListingCardProps {
  listing: Listing;
  compact?: boolean;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ListingCard({
  listing,
  compact = false,
  style,
}: ListingCardProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<ExploreStackParamList>>();
  const { theme } = useTheme();
  const { favorites, toggleFavorite } = useListing();
  const isFavorite = favorites.includes(listing.id);

  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const handlePress = () => {
    navigation.navigate("ListingDetail", { listingId: listing.id });
  };

  const handleFavorite = () => {
    heartScale.value = withSpring(1.3, { damping: 10 }, () => {
      heartScale.value = withSpring(1, { damping: 10 });
    });
    toggleFavorite(listing.id);
  };

  if (compact) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withSpring(0.98, { damping: 15 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 15 });
        }}
        style={[
          styles.compactCard,
          { backgroundColor: theme.backgroundDefault },
          animatedStyle,
          style,
        ]}
      >
        <Image
          source={{ uri: listing.images[0] }}
          style={styles.compactImage}
          contentFit="cover"
        />
        <View style={styles.compactContent}>
          <ThemedText type="small" numberOfLines={2} style={{ fontWeight: "600" }}>
            {listing.title}
          </ThemedText>
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, marginTop: 2 }}
            numberOfLines={1}
          >
            {listing.eventType}
          </ThemedText>
        </View>
        <Pressable onPress={handleFavorite} style={styles.compactHeart}>
          <Feather
            name="heart"
            size={16}
            color={isFavorite ? theme.primary : theme.textSecondary}
          />
        </Pressable>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.98, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      style={[
        styles.card,
        { backgroundColor: theme.backgroundDefault },
        animatedStyle,
        style,
      ]}
    >
      <Image
        source={{ uri: listing.images[0] }}
        style={styles.image}
        contentFit="cover"
      />
      <AnimatedPressable
        onPress={handleFavorite}
        style={[
          styles.favoriteButton,
          { backgroundColor: theme.backgroundRoot },
          heartAnimatedStyle,
        ]}
      >
        <Feather
          name="heart"
          size={18}
          color={isFavorite ? theme.primary : theme.textSecondary}
        />
      </AnimatedPressable>
      <View style={styles.content}>
        <ThemedText type="h3" numberOfLines={1}>
          {listing.title}
        </ThemedText>
        <View style={styles.metaRow}>
          <View style={[styles.badge, { backgroundColor: theme.primaryLight }]}>
            <ThemedText
              type="caption"
              style={{ color: theme.primaryDark, fontWeight: "600" }}
            >
              {listing.eventType}
            </ThemedText>
          </View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            by {listing.creatorName}
          </ThemedText>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    aspectRatio: 4 / 3,
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    padding: Spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  compactCard: {
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  compactImage: {
    width: "100%",
    aspectRatio: 1,
  },
  compactContent: {
    padding: Spacing.sm,
  },
  compactHeart: {
    position: "absolute",
    top: Spacing.xs,
    right: Spacing.xs,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
});
