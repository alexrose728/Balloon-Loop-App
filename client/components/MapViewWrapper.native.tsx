import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Feather } from "@expo/vector-icons";
import { Spacing, BorderRadius } from "@/constants/theme";
import MapView, { Marker } from "react-native-maps";

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

function MapFallback({ style }: { style?: any }) {
  const { theme } = useTheme();
  
  return (
    <View style={[styles.fallbackContainer, style, { backgroundColor: theme.backgroundSecondary }]}>
      <Feather name="map" size={48} color={theme.textSecondary} />
      <ThemedText type="body" style={[styles.fallbackText, { color: theme.text }]}>
        Map View
      </ThemedText>
      <ThemedText type="caption" style={[styles.fallbackSubtext, { color: theme.textSecondary }]}>
        Scan the QR code with Expo Go to view the interactive map
      </ThemedText>
      <ThemedText type="caption" style={[styles.fallbackSubtext, { color: theme.textSecondary, marginTop: Spacing.sm }]}>
        Use List View to browse all listings
      </ThemedText>
    </View>
  );
}

export function MapViewWrapper({
  style,
  initialRegion,
  showsUserLocation,
  showsMyLocationButton,
  scrollEnabled = true,
  zoomEnabled = true,
  userInterfaceStyle,
  mapRef,
  children,
}: MapViewWrapperProps) {
  return (
    <ErrorBoundaryMap fallback={<MapFallback style={style} />}>
      <MapView
        ref={mapRef}
        style={style}
        initialRegion={initialRegion}
        showsUserLocation={showsUserLocation}
        showsMyLocationButton={showsMyLocationButton}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
        userInterfaceStyle={userInterfaceStyle}
      >
        {children}
      </MapView>
    </ErrorBoundaryMap>
  );
}

export function MapMarkerWrapper({
  coordinate,
  title,
  children,
}: {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <Marker coordinate={coordinate} title={title}>
      {children}
    </Marker>
  );
}

class ErrorBoundaryMap extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.log("Map error caught:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export { MapView, Marker };

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
  },
  fallbackText: {
    marginTop: Spacing.md,
    textAlign: "center",
  },
  fallbackSubtext: {
    marginTop: Spacing.xs,
    textAlign: "center",
  },
});
