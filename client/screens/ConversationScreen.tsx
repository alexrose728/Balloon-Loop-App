import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Message } from "@shared/schema";

type ConversationScreenRouteProp = RouteProp<RootStackParamList, "Conversation">;

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<ConversationScreenRouteProp>();
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const { listingId, receiverId, listingTitle, receiverName } = route.params;
  const [messageText, setMessageText] = useState("");

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages", user?.id, listingId, receiverId],
    enabled: !!user?.id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        senderId: user?.id,
        receiverId,
        listingId,
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/messages", user?.id, listingId, receiverId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/conversations", user?.id] });
      setMessageText("");
    },
  });

  const handleSend = () => {
    if (messageText.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?.id;

    return (
      <View
        style={[
          styles.messageBubble,
          isMyMessage
            ? [styles.myMessage, { backgroundColor: theme.primary }]
            : [styles.theirMessage, { backgroundColor: theme.backgroundSecondary }],
        ]}
      >
        <ThemedText
          type="body"
          style={[
            styles.messageText,
            { color: isMyMessage ? "#FFFFFF" : theme.text },
          ]}
        >
          {item.content}
        </ThemedText>
        <ThemedText
          type="small"
          style={[
            styles.messageTime,
            { color: isMyMessage ? "rgba(255,255,255,0.7)" : theme.textSecondary },
          ]}
        >
          {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </ThemedText>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: theme.backgroundRoot }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          <ThemedText type="body" style={{ fontWeight: "600" }} numberOfLines={1}>
            {receiverName}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={1}>
            {listingTitle}
          </ThemedText>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.messagesList,
          { paddingBottom: Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="message-circle" size={48} color={theme.textSecondary} />
            <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.md, textAlign: "center" }}>
              Start the conversation by sending a message about this balloon arch
            </ThemedText>
          </View>
        }
      />

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.sm, backgroundColor: theme.backgroundRoot, borderTopColor: theme.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
          placeholder="Type a message..."
          placeholderTextColor={theme.textSecondary}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <Pressable
          onPress={handleSend}
          disabled={!messageText.trim() || sendMessageMutation.isPending}
          style={[
            styles.sendButton,
            { backgroundColor: messageText.trim() ? theme.primary : theme.backgroundSecondary },
          ]}
        >
          <Feather name="send" size={20} color={messageText.trim() ? "#FFFFFF" : theme.textSecondary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  messagesList: {
    padding: Spacing.lg,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: 16,
    marginBottom: Spacing.sm,
  },
  myMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: 20,
  },
  messageTime: {
    marginTop: 4,
    fontSize: 11,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
