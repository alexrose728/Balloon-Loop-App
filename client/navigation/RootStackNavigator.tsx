import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import CreateListingScreen from "@/screens/CreateListingScreen";
import ListingDetailScreen from "@/screens/ListingDetailScreen";
import MyListingsScreen from "@/screens/MyListingsScreen";
import ConversationScreen from "@/screens/ConversationScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  CreateListing: undefined;
  ListingDetail: { listingId: string };
  MyListings: undefined;
  Conversation: {
    listingId: string;
    receiverId: string;
    listingTitle: string;
    receiverName: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateListing"
        component={CreateListingScreen}
        options={{
          presentation: "modal",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ListingDetail"
        component={ListingDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyListings"
        component={MyListingsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
