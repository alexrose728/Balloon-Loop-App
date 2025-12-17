import React, { useState } from "react";
import { View, StyleSheet, TextInput, Modal, Pressable, ActivityIndicator, Alert, Platform } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";

WebBrowser.maybeCompleteAuthSession();

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AuthModal({ visible, onClose }: AuthModalProps) {
  const { theme } = useTheme();
  const { login, signup, socialLogin } = useAuth();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<"apple" | "google" | null>(null);

  const handleAppleSignIn = async () => {
    try {
      setIsSocialLoading("apple");
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      
      const fullName = credential.fullName 
        ? `${credential.fullName.givenName || ""} ${credential.fullName.familyName || ""}`.trim()
        : undefined;
      
      const result = await socialLogin("apple", {
        email: credential.email || undefined,
        name: fullName || undefined,
        providerId: credential.user,
        identityToken: credential.identityToken || undefined,
      });
      
      if (result.success) {
        onClose();
      } else {
        Alert.alert("Error", result.error || "Apple sign-in failed");
      }
    } catch (error: any) {
      if (error.code !== "ERR_REQUEST_CANCELED") {
        Alert.alert("Error", "Apple sign-in failed. Please try again.");
      }
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSocialLoading("google");
      
      const redirectUri = AuthSession.makeRedirectUri();
      const state = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        Math.random().toString()
      );
      
      Alert.alert(
        "Google Sign-In", 
        "Google Sign-In requires additional setup with OAuth credentials. Please use Apple Sign-In (iOS) or username/password for now."
      );
    } catch (error) {
      Alert.alert("Error", "Google sign-in is not available at this time.");
    } finally {
      setIsSocialLoading(null);
    }
  };

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

            <View style={styles.socialButtons}>
              {Platform.OS === "ios" ? (
                <AppleAuthentication.AppleAuthenticationButton
                  buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                  buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                  cornerRadius={BorderRadius.md}
                  style={styles.appleButton}
                  onPress={handleAppleSignIn}
                />
              ) : null}
              
              <Pressable 
                style={[styles.googleButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                onPress={handleGoogleSignIn}
                disabled={isSocialLoading === "google"}
              >
                {isSocialLoading === "google" ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <>
                    <View style={styles.googleIcon}>
                      <ThemedText style={{ fontSize: 18, fontWeight: "bold" }}>G</ThemedText>
                    </View>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      Continue with Google
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginHorizontal: Spacing.md }}>
                or
              </ThemedText>
              <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            </View>

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
  socialButtons: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  appleButton: {
    width: "100%",
    height: 50,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4285F4",
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
});
