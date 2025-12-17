import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Share,
  Platform,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  useAnimatedScrollHandler,
  Extrapolation,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Button } from "@/components/Button";
import { MapViewWrapper, MapMarkerWrapper } from "@/components/MapViewWrapper";
import { useListing } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_HEIGHT = 300;

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ListingDetailScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "ListingDetail">>();
  const { theme, isDark } = useTheme();
  const { listings, favorites, toggleFavorite } = useListing();
  const { user, isLoggedIn } = useAuth();

  const listing = listings.find((l) => l.id === route.params.listingId);
  const isFavorite = listing ? favorites.includes(listing.id) : false;

  const scrollY = useSharedValue(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const heartScale = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - 100],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const handleShare = async () => {
    if (!listing) return;
    try {
      await Share.share({
        message: `Check out this beautiful balloon arch: ${listing.title}`,
        title: listing.title,
      });
    } catch (error) {}
  };

  const handleFavorite = () => {
    if (!listing) return;
    heartScale.value = withSpring(1.3, { damping: 10 }, () => {
      heartScale.value = withSpring(1, { damping: 10 });
    });
    toggleFavorite(listing.id);
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const openDirections = () => {
    if (!listing) return;
    const url = Platform.select({
      ios: `maps:0,0?q=${listing.latitude},${listing.longitude}`,
      android: `geo:0,0?q=${listing.latitude},${listing.longitude}`,
      default: `https://www.google.com/maps/search/?api=1&query=${listing.latitude},${listing.longitude}`,
    });
    Linking.openURL(url);
  };

  const handleContactLister = () => {
    if (!listing || !listing.creatorId) return;
    navigation.navigate("Conversation", {
      listingId: listing.id,
      receiverId: listing.creatorId,
      listingTitle: listing.title,
      receiverName: listing.creatorName,
    });
  };

  const isOwnListing = user?.id === listing?.creatorId;

  if (!listing) {
    return (
      <View
        style={[
          styles.container,
          styles.centeredContainer,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText type="body">Listing not found</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <Animated.View
        style={[
          styles.headerOverlay,
          { paddingTop: insets.top, backgroundColor: theme.backgroundRoot },
          headerAnimatedStyle,
        ]}
      >
        <ThemedText type="body" style={{ fontWeight: "600" }} numberOfLines={1}>
          {listing.title}
        </ThemedText>
      </Animated.View>

      <View style={[styles.headerButtons, { top: insets.top + Spacing.sm }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={[styles.headerButton, { backgroundColor: theme.backgroundRoot }]}
        >
          <Feather name="arrow-left" size={20} color={theme.text} />
        </Pressable>
        <View style={styles.headerRightButtons}>
          <Pressable
            onPress={handleShare}
            style={[
              styles.headerButton,
              { backgroundColor: theme.backgroundRoot },
            ]}
          >
            <Feather name="share" size={20} color={theme.text} />
          </Pressable>
          <AnimatedPressable
            onPress={handleFavorite}
            style={[
              styles.headerButton,
              { backgroundColor: theme.backgroundRoot },
              heartAnimatedStyle,
            ]}
          >
            <Feather
              name={isFavorite ? "heart" : "heart"}
              size={20}
              color={isFavorite ? theme.primary : theme.text}
              style={isFavorite ? { opacity: 1 } : { opacity: 0.7 }}
            />
          </AnimatedPressable>
        </View>
      </View>

      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      >
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
            );
            setActiveImageIndex(index);
          }}
        >
          {listing.images.map((uri, index) => (
            <Image
              key={index}
              source={{ uri }}
              style={styles.heroImage}
              contentFit="cover"
            />
          ))}
        </ScrollView>

        {listing.images.length > 1 ? (
          <View style={styles.paginationDots}>
            {listing.images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === activeImageIndex
                        ? theme.primary
                        : "rgba(255,255,255,0.5)",
                  },
                ]}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <ThemedText type="h1">{listing.title}</ThemedText>
            <View style={styles.creatorRow}>
              <View
                style={[
                  styles.creatorAvatar,
                  { backgroundColor: theme.backgroundSecondary },
                ]}
              >
                <ThemedText type="small" style={{ color: theme.primary }}>
                  {listing.creatorName.charAt(0)}
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                by {listing.creatorName}
              </ThemedText>
            </View>
          </View>

          <View style={styles.tagsRow}>
            <View
              style={[
                styles.eventBadge,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <ThemedText
                type="small"
                style={{ color: theme.primaryDark, fontWeight: "600" }}
              >
                {listing.eventType}
              </ThemedText>
            </View>
            {listing.colors.map((color) => (
              <View
                key={color}
                style={[styles.colorTag, { backgroundColor: theme.backgroundDefault }]}
              >
                <ThemedText type="small">{color}</ThemedText>
              </View>
            ))}
          </View>

          {listing.description ? (
            <View style={styles.descriptionSection}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                About
              </ThemedText>
              <ThemedText
                type="body"
                style={{ color: theme.textSecondary, lineHeight: 24 }}
              >
                {listing.description}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.mapSection}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Location
            </ThemedText>
            <View style={styles.mapContainer}>
              <MapViewWrapper
                style={styles.map}
                scrollEnabled={false}
                zoomEnabled={false}
                initialRegion={{
                  latitude: listing.latitude,
                  longitude: listing.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                userInterfaceStyle={isDark ? "dark" : "light"}
              >
                <MapMarkerWrapper
                  coordinate={{
                    latitude: listing.latitude,
                    longitude: listing.longitude,
                  }}
                >
                  <View
                    style={[
                      styles.markerContainer,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <Feather name="map-pin" size={16} color="#FFFFFF" />
                  </View>
                </MapMarkerWrapper>
              </MapViewWrapper>
            </View>
            <View style={styles.actionButtons}>
              <Button onPress={openDirections} style={styles.directionsButton}>
                Get Directions
              </Button>
              {isLoggedIn && !isOwnListing && listing.creatorId ? (
                <Button onPress={handleContactLister} style={styles.contactButton}>
                  Contact Lister
                </Button>
              ) : null}
            </View>
          </View>
        </View>
      </AnimatedScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 60,
    paddingBottom: Spacing.md,
    alignItems: "center",
  },
  headerButtons: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRightButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  paginationDots: {
    position: "absolute",
    top: IMAGE_HEIGHT - 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    padding: Spacing.lg,
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  creatorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  eventBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  colorTag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
  },
  descriptionSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  mapSection: {
    marginBottom: Spacing.xl,
  },
  mapContainer: {
    height: 180,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  directionsButton: {
  },
  contactButton: {
  },
});
