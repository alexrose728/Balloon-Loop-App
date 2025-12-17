import React from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
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

export { MapView, Marker };
