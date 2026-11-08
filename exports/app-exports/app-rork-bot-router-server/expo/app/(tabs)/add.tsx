import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Music2, User, Calendar, Send, Lock, Crown } from "lucide-react-native";
import { router } from "expo-router";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/lib/auth-context";

export default function AddReleaseScreen() {
  const { user } = useAuth();
  const [artist, setArtist] = useState("");
  const [track, setTrack] = useState("");
  const [timestamp, setTimestamp] = useState("now");
  const utils = trpc.useUtils();

  const subscriptionQuery = trpc.subscriptions.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const createMutation = trpc.releases.create.useMutation({
    onSuccess: async () => {
      console.log('✅ Release created, invalidating queries...');
      await utils.releases.getAll.invalidate();
      console.log('✅ Query cache invalidated');
      setArtist("");
      setTrack("");
      setTimestamp("now");
      Alert.alert("Success!", "Release added and all bots triggered!", [
        {
          text: "View Releases",
          onPress: () => router.push("/"),
        },
        {
          text: "Add Another",
          style: "cancel",
        },
      ]);
    },
    onError: (error) => {
      if (error.message.includes('logged in') || error.message.includes('subscription')) {
        Alert.alert(
          "Authentication Required",
          error.message,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go to Profile", onPress: () => router.push("/(tabs)/profile" as any) },
          ]
        );
      } else {
        Alert.alert("Error", error.message);
      }
    },
  });

  const handleSubmit = () => {
    if (!artist.trim() || !track.trim()) {
      Alert.alert("Missing Info", "Please fill in both artist and track name");
      return;
    }

    createMutation.mutate({
      artist: artist.trim(),
      track: track.trim(),
      timestamp: timestamp.trim() || "now",
    });
  };

  const isValid = artist.trim() && track.trim();
  const hasActiveSubscription = subscriptionQuery.data?.hasSubscription;

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.authRequired}>
          <View style={styles.lockCircle}>
            <Lock size={40} color="#ff4444" />
          </View>
          <Text style={styles.authTitle}>Login Required</Text>
          <Text style={styles.authMessage}>
            You need to be logged in to submit releases
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/(tabs)/profile" as any)}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (user && !subscriptionQuery.isLoading && !hasActiveSubscription) {
    return (
      <View style={styles.container}>
        <View style={styles.authRequired}>
          <View style={[styles.lockCircle, styles.premiumCircle]}>
            <Crown size={40} color="#FFD700" />
          </View>
          <Text style={styles.authTitle}>Premium Required</Text>
          <Text style={styles.authMessage}>
            You need an active subscription to submit releases and trigger bots
          </Text>
          <TouchableOpacity
            style={[styles.loginButton, styles.premiumButton]}
            onPress={() => router.push("/(tabs)/subscription" as any)}
          >
            <Crown size={20} color="#000" />
            <Text style={styles.loginButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Music2 size={40} color="#1DB954" />
          </View>
          <Text style={styles.title}>Add New Release</Text>
          <Text style={styles.subtitle}>
            Submit a release event to trigger all marketing bots
          </Text>
        </View>

        <View style={styles.form}>
          {hasActiveSubscription && (
            <View style={styles.subscriptionBanner}>
              <Crown size={20} color="#FFD700" />
              <Text style={styles.subscriptionText}>Premium Active</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <User size={20} color="#1DB954" />
              <Text style={styles.inputLabel}>Artist Name</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter artist name"
              placeholderTextColor="#666"
              value={artist}
              onChangeText={setArtist}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Music2 size={20} color="#1DB954" />
              <Text style={styles.inputLabel}>Track Name</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter track name"
              placeholderTextColor="#666"
              value={track}
              onChangeText={setTrack}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Calendar size={20} color="#1DB954" />
              <Text style={styles.inputLabel}>Timestamp</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="now"
              placeholderTextColor="#666"
              value={timestamp}
              onChangeText={setTimestamp}
            />
          </View>

          <View style={styles.botsInfo}>
            <Text style={styles.botsTitle}>Triggered Bots:</Text>
            <Text style={styles.botItem}>🎉 Hype Bot - Social hype generation</Text>
            <Text style={styles.botItem}>📝 Content Bot - Content creation</Text>
            <Text style={styles.botItem}>🎨 Art Bot - Artwork generation</Text>
            <Text style={styles.botItem}>🔄 Duplicate Bot - Duplicate checker</Text>
            <Text style={styles.botItem}>🌟 Fresh Content Bot - Fresh ideas</Text>
            <Text style={styles.botItem}>🤖 AI Brain Bot - Marketing strategy</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValid || createMutation.isPending) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Send size={20} color="#000" />
                <Text style={styles.submitButtonText}>Submit Release</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    lineHeight: 22,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 10,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
  botsInfo: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 12,
    padding: 20,
    gap: 12,
    marginTop: 8,
  },
  botsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1DB954",
    marginBottom: 4,
  },
  botItem: {
    fontSize: 14,
    color: "#b3b3b3",
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#333",
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },
  authRequired: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  lockCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
  },
  authMessage: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  premiumCircle: {
    backgroundColor: "rgba(255, 215, 0, 0.1)",
  },
  premiumButton: {
    backgroundColor: "#FFD700",
    flexDirection: "row",
    gap: 8,
  },
  subscriptionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.3)",
    borderRadius: 12,
    padding: 12,
  },
  subscriptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFD700",
  },
});
