import React, { useState } from "react";
import { View, StyleSheet, TextInput, Modal, Pressable, ActivityIndicator, Alert } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthModal({ visible, onClose }: AuthModalProps) {
  const { theme } = useTheme();
  const { login, signup } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setIsLoading(true);
    
    const result = isLogin 
      ? await login(username.trim(), password)
      : await signup(username.trim(), password);
    
    setIsLoading(false);
    
    if (result.success) {
      setUsername("");
      setPassword("");
      onClose();
    } else {
      Alert.alert("Error", result.error || "Something went wrong");
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable 
          style={[styles.container, { backgroundColor: theme.backgroundDefault }]}
          onPress={(e) => e.stopPropagation()}
        >
          <KeyboardAwareScrollViewCompat
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <ThemedText type="h2" style={styles.title}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </ThemedText>
              <Pressable onPress={onClose} hitSlop={10}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            
            <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
              {isLogin 
                ? "Sign in to save your favorites and create listings"
                : "Join Balloon Loop to share your balloon creations"
              }
            </ThemedText>

            <View style={styles.form}>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Feather name="user" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Username"
                  placeholderTextColor={theme.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Feather name="lock" size={20} color={theme.textSecondary} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Password (min 6 characters)"
                  placeholderTextColor={theme.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <Button
                onPress={handleSubmit}
                disabled={isLoading}
                style={styles.button}
              >
                {isLoading ? <ActivityIndicator color="#FFFFFF" /> : (isLogin ? "Sign In" : "Create Account")}
              </Button>
            </View>

            <Pressable onPress={toggleMode} style={styles.toggleContainer}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.primary, fontWeight: "600" }}>
                {isLogin ? "Sign Up" : "Sign In"}
              </ThemedText>
            </Pressable>
          </KeyboardAwareScrollViewCompat>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing["2xl"],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 24,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  form: {
    gap: Spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  button: {
    marginTop: Spacing.sm,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
});
