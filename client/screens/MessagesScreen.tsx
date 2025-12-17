import React from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Conversation {
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function MessagesScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user, isLoggedIn } = useAuth();

  const { data: conversations = [], isLoading, refetch } = useQuery<Conversation[]>({
    queryKey: ["/api/messages/conversations", user?.id],
    enabled: !!user?.id,
  });

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const renderConversation = ({ item }: { item: Conversation }) => (
    <Pressable
      style={[styles.conversationItem, { borderBottomColor: theme.border }]}
      onPress={() =>
        navigation.navigate("Conversation", {
          listingId: item.listingId,
          receiverId: item.otherUserId,
          listingTitle: item.listingTitle,
          receiverName: item.otherUserName,
        })
      }
    >
      <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
        {item.listingImage ? (
          <Image source={{ uri: item.listingImage }} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <Feather name="message-circle" size={24} color={theme.textSecondary} />
        )}
      </View>
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <ThemedText type="body" style={{ fontWeight: "600", flex: 1 }} numberOfLines={1}>
            {item.otherUserName}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {formatTime(item.lastMessageTime)}
          </ThemedText>
        </View>
        <ThemedText type="small" style={{ color: theme.primary, marginBottom: 2 }} numberOfLines={1}>
          {item.listingTitle}
        </ThemedText>
        <View style={styles.messageRow}>
          <ThemedText
            type="small"
            style={[
              styles.lastMessage,
              { color: item.unreadCount > 0 ? theme.text : theme.textSecondary },
              item.unreadCount > 0 && { fontWeight: "600" },
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </ThemedText>
          {item.unreadCount > 0 ? (
            <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
              <ThemedText type="small" style={styles.unreadCount}>
                {item.unreadCount}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );

  if (!isLoggedIn) {
    return (
      <ThemedView style={[styles.container, styles.centerContent]}>
        <Feather name="message-circle" size={48} color={theme.textSecondary} />
        <ThemedText type="h3" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
          Sign in to see messages
        </ThemedText>
        <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: "center" }}>
          Log in to view and send messages about balloon arches
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <ThemedText type="h1">Messages</ThemedText>
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => `${item.listingId}-${item.otherUserId}`}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + 100 },
        ]}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={theme.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
              No messages yet
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.sm, textAlign: "center" }}>
              Contact a lister from a balloon arch listing to start a conversation
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  list: {
    paddingHorizontal: Spacing.lg,
  },
  conversationItem: {
    flexDirection: "row",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    overflow: "hidden",
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastMessage: {
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  unreadCount: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
});
