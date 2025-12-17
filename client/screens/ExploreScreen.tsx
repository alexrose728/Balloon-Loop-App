import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  FlatList,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Location from "expo-location";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { ListingCard } from "@/components/ListingCard";
import {
  MapViewWrapper,
  MapMarkerWrapper,
  MapView,
} from "@/components/MapViewWrapper";
import { useListing } from "@/hooks/useListings";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, isDark } = useTheme();
  const { listings } = useListing();

  const [isMapView, setIsMapView] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null,
  );

  const mapRef = useRef<any>(null);
  const toggleScale = useSharedValue(1);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === "web") {
      setLocationPermission(false);
      setUserLocation({ latitude: 37.7749, longitude: -122.4194 });
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      setLocationPermission(true);
      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch {
        setUserLocation({ latitude: 37.7749, longitude: -122.4194 });
      }
    } else {
      setLocationPermission(false);
      setUserLocation({ latitude: 37.7749, longitude: -122.4194 });
    }
  };

  const toggleView = () => {
    toggleScale.value = withSpring(0.95, { damping: 15 });
    setTimeout(() => {
      toggleScale.value = withSpring(1, { damping: 15 });
      setIsMapView(!isMapView);
    }, 100);
  };

  const centerOnUser = async () => {
    if (userLocation && mapRef.current && Platform.OS !== "web") {
      mapRef.current.animateToRegion(
        {
          ...userLocation,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        500,
      );
    }
  };

  const toggleAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: toggleScale.value }],
  }));

  const initialRegion = userLocation
    ? {
        ...userLocation,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      }
    : {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: theme.backgroundDefault },
        ]}
      >
        <Feather name="map-pin" size={48} color={theme.primary} />
      </View>
      <ThemedText type="h3" style={styles.emptyTitle}>
        No balloon arches nearby
      </ThemedText>
      <ThemedText
        type="body"
        style={[styles.emptySubtitle, { color: theme.textSecondary }]}
      >
        Be the first to share your beautiful balloon creations with your
        community!
      </ThemedText>
    </View>
  );

  if (locationPermission === null) {
    return (
      <View
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      >
        <View style={styles.loadingContainer}>
          <ThemedText type="body">Loading location...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {isMapView ? (
        <>
          <MapViewWrapper
            mapRef={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation={locationPermission}
            showsMyLocationButton={false}
            userInterfaceStyle={isDark ? "dark" : "light"}
          >
            {listings.map((listing) => (
              <MapMarkerWrapper
                key={listing.id}
                coordinate={{
                  latitude: listing.latitude,
                  longitude: listing.longitude,
                }}
                title={listing.title}
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
            ))}
          </MapViewWrapper>

          {Platform.OS !== "web" ? (
            <Pressable
              onPress={centerOnUser}
              style={[
                styles.locationButton,
                {
                  backgroundColor: theme.backgroundRoot,
                  bottom: tabBarHeight + Spacing.xl,
                },
              ]}
            >
              <Feather name="navigation" size={20} color={theme.primary} />
            </Pressable>
          ) : null}

          {listings.length === 0 && Platform.OS !== "web" ? (
            <View
              style={[
                styles.mapEmptyOverlay,
                { top: headerHeight + Spacing.xl },
              ]}
            >
              <View
                style={[
                  styles.mapEmptyCard,
                  { backgroundColor: theme.backgroundRoot },
                ]}
              >
                <ThemedText type="body" style={{ textAlign: "center" }}>
                  No balloon arches in this area yet
                </ThemedText>
              </View>
            </View>
          ) : null}
        </>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
            paddingHorizontal: Spacing.lg,
            flexGrow: 1,
          }}
          scrollIndicatorInsets={{ bottom: insets.bottom }}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => (
            <ListingCard listing={item} style={styles.listCard} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.lg }} />}
        />
      )}

      <AnimatedPressable
        onPress={toggleView}
        style={[
          styles.toggleButton,
          {
            backgroundColor: theme.backgroundRoot,
            top: headerHeight + Spacing.lg,
            borderColor: theme.border,
          },
          toggleAnimatedStyle,
        ]}
      >
        <Feather
          name={isMapView ? "list" : "map"}
          size={20}
          color={theme.text}
        />
        <ThemedText type="small" style={styles.toggleText}>
          {isMapView ? "List" : "Map"}
        </ThemedText>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  toggleButton: {
    position: "absolute",
    right: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleText: {
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
  locationButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapEmptyOverlay: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
  },
  mapEmptyCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  listCard: {
    marginBottom: 0,
  },
  markerContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});
