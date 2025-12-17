import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Feather } from "@expo/vector-icons";
import { Spacing, BorderRadius } from "@/constants/theme";

interface MapViewWrapperProps {
  style?: any;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  userInterfaceStyle?: "light" | "dark";
  mapRef?: React.RefObject<any>;
  children?: React.ReactNode;
}

export function MapViewWrapper({ style }: MapViewWrapperProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.webFallback,
        style,
        { backgroundColor: theme.backgroundDefault },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <Feather name="map" size={32} color={theme.primary} />
      </View>
      <ThemedText type="body" style={styles.webText}>
        Map View
      </ThemedText>
      <ThemedText
        type="small"
        style={[styles.webSubtext, { color: theme.textSecondary }]}
      >
        Open in Expo Go to see the interactive map
      </ThemedText>
    </View>
  );
}

export function MapMarkerWrapper(_props: {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  children?: React.ReactNode;
}) {
  return null;
}

export const MapView = null;
export const Marker = null;

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  webText: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  webSubtext: {
    textAlign: "center",
  },
});
