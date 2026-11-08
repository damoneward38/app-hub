import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LogIn, LogOut, User, Shield, CheckCircle, Trash2 } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, isLoading, signIn, signUp, signOut, loginAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const utils = trpc.useUtils();
  const clearReleasesMutation = trpc.admin.clearReleases.useMutation({
    onSuccess: () => {
      utils.releases.getAll.invalidate();
      Alert.alert("Success", "All releases have been cleared");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to clear releases");
    },
  });

  const handleAuth = async () => {
    if (isAdminLogin) {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Error", "Please enter both email and passcode");
        return;
      }
      setIsLoggingIn(true);
      try {
        await loginAdmin(email.trim(), password.trim());
        setEmail("");
        setPassword("");
        Alert.alert("Success!", "Logged in as Admin");
      } catch {
        Alert.alert("Error", "Invalid admin credentials");
      } finally {
        setIsLoggingIn(false);
      }
    } else {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Error", "Please enter email and password");
        return;
      }
      setIsLoggingIn(true);
      try {
        const { error } = isSignUp 
          ? await signUp(email.trim(), password.trim())
          : await signIn(email.trim(), password.trim());
        
        if (error) {
          Alert.alert("Error", error.message);
        } else {
          setEmail("");
          setPassword("");
          Alert.alert(
            "Success!", 
            isSignUp 
              ? "Account created! Please check your email to verify."
              : "Logged in successfully"
          );
        }
      } catch {
        Alert.alert("Error", "Authentication failed");
      } finally {
        setIsLoggingIn(false);
      }
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            Alert.alert("Success", "Logged out successfully");
          } catch {
            Alert.alert("Error", "Failed to logout");
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (!user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <LogIn size={40} color="#1DB954" />
          </View>
          <Text style={styles.title}>{isSignUp ? "Create Account" : "Login Required"}</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? "Sign up to submit releases" : "Sign in to submit releases"}
          </Text>
        </View>

        <View style={styles.form}>
          {!isAdminLogin && (
            <View style={styles.authToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, !isSignUp && styles.toggleButtonActive]}
                onPress={() => setIsSignUp(false)}
              >
                <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>Sign In</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, isSignUp && styles.toggleButtonActive]}
                onPress={() => setIsSignUp(true)}
              >
                <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={styles.adminToggleLink}
            onPress={() => setIsAdminLogin(!isAdminLogin)}
          >
            <Shield size={16} color="#1DB954" />
            <Text style={styles.adminToggleText}>
              {isAdminLogin ? "Back to regular login" : "Admin login"}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isAdminLogin ? "Admin Email" : "Email"}</Text>
            <TextInput
              style={styles.input}
              placeholder={isAdminLogin ? "Enter admin email" : "Enter your email"}
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{isAdminLogin ? "Admin Passcode" : "Password"}</Text>
            <TextInput
              style={styles.input}
              placeholder={isAdminLogin ? "Enter admin passcode" : "Enter your password"}
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
            />
            {!isAdminLogin && isSignUp && (
              <Text style={styles.hint}>
                Password must be at least 6 characters
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!email.trim() || !password.trim() || isLoggingIn) && styles.buttonDisabled,
            ]}
            onPress={handleAuth}
            disabled={!email.trim() || !password.trim() || isLoggingIn}
          >
            {isLoggingIn ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <LogIn size={20} color="#000" />
                <Text style={styles.buttonText}>
                  {isAdminLogin ? "Admin Login" : isSignUp ? "Sign Up" : "Sign In"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <User size={40} color="#1DB954" />
        </View>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Your account information</Text>
      </View>

      <View style={styles.infoCard}>
        {user.name && (
          <>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <User size={20} color="#1DB954" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
            </View>
            <View style={styles.divider} />
          </>
        )}
        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <User size={20} color="#1DB954" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <View style={styles.infoIcon}>
            <CheckCircle size={20} color="#1DB954" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Subscription</Text>
            <View style={styles.subscriptionRow}>
              <Text style={[styles.infoValue, user.hasSubscription ? styles.activeStatus : styles.inactiveStatus]}>
                {user.hasSubscription ? "Active" : "Inactive"}
              </Text>
              {!user.hasSubscription && (
                <TouchableOpacity
                  style={styles.upgradeButton}
                  onPress={() => router.push("/(tabs)/subscription" as any)}
                >
                  <Text style={styles.upgradeButtonText}>Upgrade</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {user.isAdmin && (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Shield size={20} color="#FFD700" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={[styles.infoValue, styles.adminBadge]}>Admin</Text>
              </View>
            </View>
          </>
        )}
      </View>

      {user.isAdmin && (
        <View style={styles.adminSection}>
          <View style={styles.adminHeader}>
            <Shield size={24} color="#FFD700" />
            <Text style={styles.adminTitle}>Admin Controls</Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.adminButton,
              clearReleasesMutation.isPending && styles.adminButtonDisabled,
            ]}
            onPress={async () => {
              Alert.alert(
                "Clear All Releases",
                "Are you sure you want to delete all releases? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Clear All",
                    style: "destructive",
                    onPress: async () => {
                      clearReleasesMutation.mutate({});
                    },
                  },
                ]
              );
            }}
            disabled={clearReleasesMutation.isPending}
          >
            {clearReleasesMutation.isPending ? (
              <ActivityIndicator color="#ff4444" size="small" />
            ) : (
              <>
                <Trash2 size={20} color="#ff4444" />
                <Text style={styles.adminButtonText}>Clear All Releases</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <LogOut size={20} color="#ff4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.permissions}>
        <Text style={styles.permissionsTitle}>Your Permissions:</Text>
        <Text style={styles.permissionItem}>✅ View releases</Text>
        <Text style={styles.permissionItem}>✅ Submit new releases</Text>
        {user.isAdmin && <Text style={styles.permissionItem}>✅ Clear all releases (Admin)</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  input: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#fff",
  },
  hint: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  button: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonDisabled: {
    backgroundColor: "#333",
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  infoCard: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(29, 185, 84, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  activeStatus: {
    color: "#1DB954",
  },
  inactiveStatus: {
    color: "#ff4444",
  },
  subscriptionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  upgradeButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#000",
  },
  adminBadge: {
    color: "#FFD700",
  },
  divider: {
    height: 1,
    backgroundColor: "#282828",
  },
  logoutButton: {
    marginTop: 24,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ff4444",
  },
  permissions: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 12,
    gap: 12,
  },
  permissionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1DB954",
    marginBottom: 4,
  },
  permissionItem: {
    fontSize: 14,
    color: "#b3b3b3",
    lineHeight: 20,
  },
  authToggle: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  adminToggleLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
  },
  adminToggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1DB954",
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#1DB954",
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  toggleTextActive: {
    color: "#000",
  },
  adminSection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: "rgba(255, 215, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
    borderRadius: 12,
    gap: 16,
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFD700",
  },
  adminButton: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  adminButtonDisabled: {
    opacity: 0.5,
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ff4444",
  },
});
