import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, Crown, Mic2, ShieldCheck, Sparkles, Volume2, Zap } from 'lucide-react-native';

import Colors from '@/constants/colors';

type UpgradePlan = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  badge: string;
  highlight: string;
};

type UpgradeFeature = {
  id: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
};

const plans: UpgradePlan[] = [
  {
    id: 'weekly',
    name: 'Creator',
    price: '$4.99',
    cadence: 'weekly',
    badge: 'Flexible',
    highlight: 'Best for trying premium AI voices',
  },
  {
    id: 'yearly',
    name: 'Zehav Pro',
    price: '$49.99',
    cadence: 'yearly',
    badge: 'Save 60%',
    highlight: 'Full access for builders and power users',
  },
];

const features: UpgradeFeature[] = [
  {
    id: 'spoken-ai',
    title: 'Every AI speaks',
    body: 'Voice-first replies with a real speaker flow instead of silent reading.',
    icon: Volume2,
  },
  {
    id: 'longer-memory',
    title: 'Saved conversation follow-ups',
    body: 'Keep context from important chats so your bots can continue the story.',
    icon: ShieldCheck,
  },
  {
    id: 'faster-answers',
    title: 'Priority answers',
    body: 'Higher daily limits, faster generation, and smoother premium sessions.',
    icon: Zap,
  },
  {
    id: 'voice-tools',
    title: 'Speaker tools',
    body: 'Unlock richer AI speaker controls for narration, coaching, and roleplay.',
    icon: Mic2,
  },
];

export default function UpgradesScreen() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('yearly');

  const selectedPlan = useMemo<UpgradePlan>(() => {
    return plans.find((plan) => plan.id === selectedPlanId) ?? plans[1];
  }, [selectedPlanId]);

  const handlePlanPress = useCallback((planId: string) => {
    setSelectedPlanId(planId);
    Haptics.selectionAsync().catch((error) => {
      console.log('Plan haptic unavailable:', error);
    });
  }, []);

  const handleUpgradePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch((error) => {
      console.log('Upgrade haptic unavailable:', error);
    });
    Alert.alert(
      'Upgrades ready',
      `${selectedPlan.name} is selected. Store checkout can be connected next with RevenueCat.`
    );
  }, [selectedPlan]);

  const handleRestorePress = useCallback(() => {
    Alert.alert('Restore Purchases', 'Restore purchase support will be active once subscriptions are connected.');
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#09111F', '#13223D', '#071018']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.heroCard}>
            <View style={styles.crownBadge}>
              <Crown size={22} color="#FFD166" />
              <Text style={styles.crownText}>ZEHAV UPGRADES</Text>
            </View>
            <Text style={styles.title}>Unlock the speaking AI experience.</Text>
            <Text style={styles.subtitle}>
              Upgrade to save follow-up conversations, give every AI a speaker, and remove the limits from your main chat flow.
            </Text>
            <View style={styles.sparkRow}>
              <Sparkles size={18} color="#7EF7C1" />
              <Text style={styles.sparkText}>Built for voice, memory, and faster creation</Text>
            </View>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <View key={feature.id} style={styles.featureCard}>
                  <View style={styles.featureIcon}>
                    <Icon size={20} color="#7EF7C1" />
                  </View>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureBody}>{feature.body}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.plansSection}>
            <Text style={styles.sectionTitle}>Choose your upgrade</Text>
            {plans.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <Pressable
                  key={plan.id}
                  onPress={() => handlePlanPress(plan.id)}
                  style={({ pressed }) => [
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    pressed && styles.planCardPressed,
                  ]}
                  testID={`upgrade-plan-${plan.id}`}
                >
                  <View style={styles.planLeft}>
                    <View style={[styles.radio, isSelected && styles.radioSelected]}>
                      {isSelected && <Check size={14} color="#071018" strokeWidth={3} />}
                    </View>
                    <View style={styles.planCopy}>
                      <View style={styles.planNameRow}>
                        <Text style={styles.planName}>{plan.name}</Text>
                        <Text style={styles.planBadge}>{plan.badge}</Text>
                      </View>
                      <Text style={styles.planHighlight}>{plan.highlight}</Text>
                    </View>
                  </View>
                  <View style={styles.priceBlock}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.cadence}>/{plan.cadence}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleUpgradePress}
            style={({ pressed }) => [styles.upgradeButton, pressed && styles.upgradeButtonPressed]}
            testID="upgrade-primary-button"
          >
            <LinearGradient
              colors={['#7EF7C1', '#FFD166']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.upgradeButtonGradient}
            >
              <Text style={styles.upgradeButtonText}>Show {selectedPlan.name} Upgrade</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleRestorePress} style={styles.restoreButton} testID="restore-purchases-button">
            <Text style={styles.restoreText}>Restore Purchases</Text>
          </Pressable>

          <Text style={styles.disclaimer}>
            Subscriptions are not charged yet. This screen is ready for RevenueCat checkout connection when you want live purchases.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#071018',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  orbOne: {
    position: 'absolute',
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(126, 247, 193, 0.22)',
    top: 58,
    right: -78,
  },
  orbTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 209, 102, 0.16)',
    bottom: 130,
    left: -74,
  },
  heroCard: {
    borderRadius: 34,
    padding: 24,
    minHeight: 310,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  crownBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 26,
  },
  crownText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800' as const,
    letterSpacing: 1.2,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 38,
    lineHeight: 42,
    fontWeight: '900' as const,
    letterSpacing: -1.1,
  },
  subtitle: {
    color: 'rgba(248, 250, 252, 0.76)',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 14,
  },
  sparkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  sparkText: {
    color: '#7EF7C1',
    fontSize: 13,
    fontWeight: '700' as const,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  featureCard: {
    width: '48%',
    minHeight: 158,
    borderRadius: 24,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  featureIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(126, 247, 193, 0.13)',
    marginBottom: 14,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800' as const,
    marginBottom: 7,
  },
  featureBody: {
    color: 'rgba(248, 250, 252, 0.68)',
    fontSize: 13,
    lineHeight: 18,
  },
  plansSection: {
    marginTop: 26,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900' as const,
    marginBottom: 12,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 24,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  planCardSelected: {
    backgroundColor: 'rgba(126, 247, 193, 0.12)',
    borderColor: '#7EF7C1',
  },
  planCardPressed: {
    transform: [{ scale: 0.985 }],
  },
  planLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.34)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    backgroundColor: '#7EF7C1',
    borderColor: '#7EF7C1',
  },
  planCopy: {
    flex: 1,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900' as const,
  },
  planBadge: {
    overflow: 'hidden',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 209, 102, 0.18)',
    color: '#FFD166',
    fontSize: 11,
    fontWeight: '800' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  planHighlight: {
    color: 'rgba(248, 250, 252, 0.66)',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 5,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  price: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900' as const,
  },
  cadence: {
    color: 'rgba(248, 250, 252, 0.58)',
    fontSize: 12,
    marginTop: 2,
  },
  upgradeButton: {
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#7EF7C1',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  upgradeButtonPressed: {
    transform: [{ scale: 0.985 }],
  },
  upgradeButtonGradient: {
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upgradeButtonText: {
    color: '#071018',
    fontSize: 17,
    fontWeight: '900' as const,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  restoreText: {
    color: Colors.light.tintLight,
    fontSize: 15,
    fontWeight: '800' as const,
  },
  disclaimer: {
    color: 'rgba(248, 250, 252, 0.48)',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: 10,
  },
});
