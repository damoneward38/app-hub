import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { Crown, Calendar, CheckCircle, XCircle, Lock, CreditCard } from "lucide-react-native";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/lib/trpc";
import { router } from "expo-router";

export default function SubscriptionScreen() {
  const { user } = useAuth();

  const subscriptionQuery = trpc.subscriptions.getStatus.useQuery(undefined, {
    enabled: !!user,
  });

  const cancelMutation = trpc.subscriptions.cancel.useMutation({
    onSuccess: () => {
      subscriptionQuery.refetch();
      Alert.alert("Cancelled", "Your subscription has been cancelled");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to cancel subscription");
    },
  });

  const paypalCheckout = trpc.subscriptions.createPayPalCheckout.useMutation();

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    if (!user) {
      Alert.alert("Login Required", "Please login to subscribe", [
        { text: "Cancel", style: "cancel" },
        { text: "Go to Login", onPress: () => router.push("/(tabs)/profile" as any) },
      ]);
      return;
    }
    try {
      const checkout = await paypalCheckout.mutateAsync({ plan });
      await Linking.openURL(checkout.approvalUrl);
    } catch {
      Alert.alert("PayPal Unavailable", "Checkout could not be started. Please try again later.");
    }
  };

  const handleCancel = () => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to cancel your subscription?",
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Cancel Subscription",
          style: "destructive",
          onPress: () => cancelMutation.mutate(),
        },
      ]
    );
  };



  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.iconCircleLarge}>
            <Lock size={48} color="#ff4444" />
          </View>
          <Text style={styles.titleLarge}>Login Required</Text>
          <Text style={styles.subtitleLarge}>
            Please login to manage your subscription
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push("/(tabs)/profile" as any)}
          >
            <Text style={styles.primaryButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const subscription = subscriptionQuery.data;
  const hasActiveSubscription = subscription?.hasSubscription;

  if (subscriptionQuery.isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1DB954" />
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconCircleLarge}>
            <Crown size={48} color="#FFD700" />
          </View>
          <Text style={styles.titleLarge}>Premium Subscription</Text>
          <Text style={styles.subtitleLarge}>
            {hasActiveSubscription 
              ? "You have access to all premium features"
              : "Unlock all bot features"}
          </Text>
        </View>

        {hasActiveSubscription ? (
          <View style={styles.card}>
            <View style={styles.activeHeader}>
              <CheckCircle size={32} color="#1DB954" />
              <View style={styles.flex1}>
                <Text style={styles.activeTitle}>Active Subscription</Text>
                <Text style={styles.activePlan}>
                  {subscription.plan === 'monthly' ? 'Monthly Plan' : 'Yearly Plan'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Calendar size={20} color="#1DB954" />
              <View style={styles.flex1}>
                <Text style={styles.label}>Started</Text>
                <Text style={styles.value}>
                  {subscription.startedAt 
                    ? new Date(subscription.startedAt).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
            </View>

            <View style={styles.row}>
              <Calendar size={20} color="#1DB954" />
              <View style={styles.flex1}>
                <Text style={styles.label}>Renews On</Text>
                <Text style={styles.value}>
                  {subscription.expiresAt 
                    ? new Date(subscription.expiresAt).toLocaleDateString()
                    : 'N/A'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <ActivityIndicator color="#ff4444" />
              ) : (
                <>
                  <XCircle size={20} color="#ff4444" />
                  <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.featuresTitle}>Premium Features:</Text>
              <View style={styles.feature}>
                <CheckCircle size={20} color="#1DB954" />
                <Text style={styles.featureText}>🎉 Hype Bot - Social hype generation</Text>
              </View>
              <View style={styles.feature}>
                <CheckCircle size={20} color="#1DB954" />
                <Text style={styles.featureText}>📝 Content Bot - Content creation</Text>
              </View>
              <View style={styles.feature}>
                <CheckCircle size={20} color="#1DB954" />
                <Text style={styles.featureText}>🎨 Art Bot - Artwork generation</Text>
              </View>
              <View style={styles.feature}>
                <CheckCircle size={20} color="#1DB954" />
                <Text style={styles.featureText}>🔄 Duplicate Bot - Duplicate checker</Text>
              </View>
              <View style={styles.feature}>
                <CheckCircle size={20} color="#1DB954" />
                <Text style={styles.featureText}>🌟 Fresh Content Bot - Fresh ideas</Text>
              </View>
              <View style={styles.feature}>
                <CheckCircle size={20} color="#1DB954" />
                <Text style={styles.featureText}>🤖 AI Brain Bot - Marketing strategy</Text>
              </View>
            </View>

            <View style={styles.pricingContainer}>
              <View style={styles.pricingCard}>
                <Text style={styles.planLabel}>Monthly</Text>
                <Text style={styles.priceText}>$79.99</Text>
                <Text style={styles.priceSubtext}>per month</Text>
                <TouchableOpacity
                  style={styles.subscribeButton}
                  onPress={() => handleSubscribe("monthly")}
                >
                  <CreditCard size={20} color="#000" />
                  <Text style={styles.subscribeButtonText}>Subscribe Monthly</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.pricingCard}>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>Save $260</Text>
                </View>
                <Text style={styles.planLabel}>Yearly</Text>
                <Text style={styles.priceText}>$700</Text>
                <Text style={styles.priceSubtext}>per year</Text>
                <TouchableOpacity
                  style={styles.subscribeButtonYearly}
                  onPress={() => handleSubscribe("yearly")}
                >
                  <CreditCard size={20} color="#000" />
                  <Text style={styles.subscribeButtonTextYearly}>Subscribe Yearly</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.disclaimer}>
              Your subscription will automatically renew unless cancelled before the renewal date.
            </Text>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    paddingTop: 20,
  },
  iconCircleLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 215, 0, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  titleLarge: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitleLarge: {
    fontSize: 15,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  activeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 20,
  },
  flex1: {
    flex: 1,
  },
  activeTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  activePlan: {
    fontSize: 15,
    color: "#1DB954",
    fontWeight: "600" as const,
  },
  divider: {
    height: 1,
    backgroundColor: "#282828",
    marginVertical: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  cancelButton: {
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.3)",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#ff4444",
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#1DB954",
    marginBottom: 20,
  },
  feature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  featureText: {
    fontSize: 15,
    color: "#b3b3b3",
    flex: 1,
  },
  pricingContainer: {
    gap: 16,
    marginBottom: 16,
  },
  pricingCard: {
    backgroundColor: "#1a1a1a",
    borderWidth: 1,
    borderColor: "#282828",
    borderRadius: 16,
    padding: 24,
    position: "relative" as const,
  },
  saveBadge: {
    position: "absolute" as const,
    top: 12,
    right: 12,
    backgroundColor: "#1DB954",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  saveBadgeText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: "#000",
  },
  planLabel: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#1DB954",
    marginBottom: 12,
    textAlign: "center" as const,
  },
  priceText: {
    fontSize: 42,
    fontWeight: "800" as const,
    color: "#fff",
    textAlign: "center" as const,
    marginBottom: 4,
  },
  priceSubtext: {
    fontSize: 15,
    color: "#999",
    textAlign: "center" as const,
    marginBottom: 20,
  },
  subscribeButton: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
  subscribeButtonYearly: {
    backgroundColor: "#FFD700",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  subscribeButtonTextYearly: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },
  disclaimer: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: "#1DB954",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#000",
  },

});
