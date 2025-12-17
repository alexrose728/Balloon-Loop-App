import React, { useState } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Button } from "@/components/Button";
import { useListing } from "@/hooks/useListings";
import { useAuth } from "@/hooks/useAuth";

const EVENT_TYPES = [
  "Birthday",
  "Wedding",
  "Corporate",
  "Baby Shower",
  "Graduation",
  "Anniversary",
  "Other",
];

const COLORS = [
  { name: "Pink", color: "#FF6B9D" },
  { name: "Blue", color: "#4A90D9" },
  { name: "Gold", color: "#FFD700" },
  { name: "White", color: "#FFFFFF" },
  { name: "Purple", color: "#9B59B6" },
  { name: "Green", color: "#2ECC71" },
  { name: "Red", color: "#E74C3C" },
  { name: "Silver", color: "#BDC3C7" },
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function SelectableChip({
  label,
  selected,
  onPress,
  color,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  color?: string;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15 });
      }}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primary : "transparent",
          borderColor: selected ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      {color ? (
        <View
          style={[
            styles.colorDot,
            {
              backgroundColor: color,
              borderColor: color === "#FFFFFF" ? theme.border : "transparent",
              borderWidth: color === "#FFFFFF" ? 1 : 0,
            },
          ]}
        />
      ) : null}
      <ThemedText
        type="small"
        style={{ color: selected ? "#FFFFFF" : theme.text, fontWeight: "500" }}
      >
        {label}
      </ThemedText>
    </AnimatedPressable>
  );
}

export default function CreateListingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { addListing } = useListing();
  const { user } = useAuth();

  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const isValid = title.length > 0 && images.length > 0 && eventType.length > 0;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - images.length,
    });

    if (!result.canceled) {
      setImages((prev) => [
        ...prev,
        ...result.assets.map((asset) => asset.uri).slice(0, 5 - prev.length),
      ]);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName],
    );
  };

  const handleSubmit = () => {
    if (!isValid) return;

    addListing({
      title,
      description,
      eventType,
      colors: selectedColors,
      images,
      creatorId: user?.id || "guest",
      creatorName: user?.name || "Guest",
      latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    });

    Alert.alert("Success", "Your balloon arch has been posted!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const handleCancel = () => {
    if (title || description || images.length > 0) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to discard them?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Pressable onPress={handleCancel} style={styles.headerButton}>
          <ThemedText type="body">Cancel</ThemedText>
        </Pressable>
        <ThemedText type="h4">New Listing</ThemedText>
        <Pressable
          onPress={handleSubmit}
          disabled={!isValid}
          style={styles.headerButton}
        >
          <ThemedText
            type="body"
            style={{
              color: isValid ? theme.primary : theme.textDisabled,
              fontWeight: "600",
            }}
          >
            Post
          </ThemedText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Photos (up to 5)
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesRow}
          >
            {images.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <Image source={{ uri }} style={styles.image} />
                <Pressable
                  onPress={() => removeImage(index)}
                  style={[
                    styles.removeImageButton,
                    { backgroundColor: theme.error },
                  ]}
                >
                  <Feather name="x" size={14} color="#FFFFFF" />
                </Pressable>
                {index === 0 ? (
                  <View
                    style={[
                      styles.coverBadge,
                      { backgroundColor: theme.primary },
                    ]}
                  >
                    <ThemedText
                      type="caption"
                      style={{ color: "#FFFFFF", fontWeight: "600" }}
                    >
                      Cover
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            ))}
            {images.length < 5 ? (
              <Pressable
                onPress={pickImage}
                style={[
                  styles.addImageButton,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <Feather name="plus" size={24} color={theme.textSecondary} />
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
                >
                  Add Photo
                </ThemedText>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Title
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
              },
            ]}
            placeholder="Give your balloon arch a name"
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Description
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
              },
            ]}
            placeholder="Tell us about this balloon arch..."
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            maxLength={500}
          />
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Event Type
          </ThemedText>
          <View style={styles.chipsRow}>
            {EVENT_TYPES.map((type) => (
              <SelectableChip
                key={type}
                label={type}
                selected={eventType === type}
                onPress={() => setEventType(type)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="small" style={styles.sectionLabel}>
            Colors Used
          </ThemedText>
          <View style={styles.chipsRow}>
            {COLORS.map((c) => (
              <SelectableChip
                key={c.name}
                label={c.name}
                color={c.color}
                selected={selectedColors.includes(c.name)}
                onPress={() => toggleColor(c.name)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: Spacing.md,
  },
  headerButton: {
    minWidth: 60,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  imagesRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.sm,
  },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  coverBadge: {
    position: "absolute",
    bottom: Spacing.xs,
    left: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.xs,
  },
});
