import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Star, Users, ChevronRight, Check, ExternalLink, Share2, Bookmark, BookmarkCheck, Volume2, VolumeX } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '@/constants/colors';
import { getBotById } from '@/mocks/bots';

const SAVED_BOTS_KEY = 'saved_bots';

export default function BotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bot = getBotById(id || '');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isSpeakingAbout, setIsSpeakingAbout] = useState<boolean>(false);

  React.useEffect(() => {
    if (!bot) return;
    AsyncStorage.getItem(SAVED_BOTS_KEY).then((data) => {
      const saved: string[] = data ? JSON.parse(data) : [];
      setIsSaved(saved.includes(bot.id));
    }).catch(() => {});
  }, [bot]);

  React.useEffect(() => {
    return () => { void Speech.stop(); };
  }, []);

  if (!bot) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Bot not found</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleLaunch = () => {
    console.log('Opening bot chat screen:', bot.id);
    router.push(`/(tabs)/(home)/bot/chat/${bot.id}`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${bot.name} - ${bot.tagline}`,
        title: bot.name,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleSave = useCallback(async () => {
    if (!bot) return;
    try {
      const data = await AsyncStorage.getItem(SAVED_BOTS_KEY);
      const saved: string[] = data ? JSON.parse(data) : [];
      let updated: string[];
      if (saved.includes(bot.id)) {
        updated = saved.filter((s) => s !== bot.id);
        setIsSaved(false);
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log('Bot removed from saved:', bot.id);
      } else {
        updated = [...saved, bot.id];
        setIsSaved(true);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log('Bot saved:', bot.id);
      }
      await AsyncStorage.setItem(SAVED_BOTS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Save bot error:', error);
      Alert.alert('Error', 'Could not save this bot. Please try again.');
    }
  }, [bot]);

  const handleSpeakAbout = useCallback(() => {
    if (!bot) return;
    if (isSpeakingAbout) {
      void Speech.stop();
      setIsSpeakingAbout(false);
      return;
    }
    void Speech.stop();
    setIsSpeakingAbout(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Speech.speak(bot.description, {
      language: 'en-US',
      rate: 0.95,
      onDone: () => setIsSpeakingAbout(false),
      onStopped: () => setIsSpeakingAbout(false),
      onError: () => setIsSpeakingAbout(false),
    });
  }, [bot, isSpeakingAbout]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[bot.gradient[0], bot.gradient[1]]}
        style={styles.headerGradient}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.heroContent}>
            <Text style={styles.heroIcon}>{bot.icon}</Text>
            <Text style={styles.heroName}>{bot.name}</Text>
            <Text style={styles.heroTagline}>{bot.tagline}</Text>
            
            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Star size={18} color="#FFF" fill="#FFF" />
                <Text style={styles.statValue}>{bot.rating}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Users size={18} color="#FFF" />
                <Text style={styles.statValue}>{bot.users}</Text>
                <Text style={styles.statLabel}>Users</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.actionButtons}>
          <Pressable 
            style={({ pressed }) => [styles.launchButton, pressed && styles.buttonPressed]}
            onPress={handleLaunch}
            testID="launch-button"
          >
            <ExternalLink size={20} color="#FFF" />
            <Text style={styles.launchButtonText}>Launch Bot</Text>
          </Pressable>
          <Pressable 
            style={({ pressed }) => [styles.shareButton, pressed && styles.buttonPressed]}
            onPress={handleShare}
          >
            <Share2 size={20} color={Colors.light.tint} />
          </Pressable>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>About</Text>
            <Pressable
              style={({ pressed }) => [
                styles.speakAboutButton,
                isSpeakingAbout && styles.speakAboutButtonActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleSpeakAbout}
              hitSlop={8}
              testID="speak-about-button"
            >
              {isSpeakingAbout ? (
                <VolumeX size={16} color={bot.gradient[0]} />
              ) : (
                <Volume2 size={16} color={Colors.light.textSecondary} />
              )}
              <Text style={[
                styles.speakAboutText,
                isSpeakingAbout && { color: bot.gradient[0] },
              ]}>
                {isSpeakingAbout ? 'Stop' : 'Listen'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.description}>{bot.description}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              isSaved && styles.saveButtonActive,
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}
            onPress={handleSave}
            testID="save-bot-button"
          >
            {isSaved ? (
              <BookmarkCheck size={18} color="#FFF" />
            ) : (
              <Bookmark size={18} color={bot.gradient[0]} />
            )}
            <Text style={[
              styles.saveButtonText,
              isSaved && styles.saveButtonTextActive,
            ]}>
              {isSaved ? 'Saved' : 'Save for Later'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{bot.category}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresList}>
            {bot.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: bot.gradient[0] + '20' }]}>
                  <Check size={14} color={bot.gradient[0]} />
                </View>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Ready to get started?</Text>
          <Text style={styles.infoText}>
            Launch {bot.name} and experience the power of AI assistance tailored to your needs.
          </Text>
          <Pressable 
            style={({ pressed }) => [
              styles.infoButton, 
              { backgroundColor: bot.gradient[0] },
              pressed && styles.buttonPressed
            ]}
            onPress={handleLaunch}
          >
            <Text style={styles.infoButtonText}>Get Started</Text>
            <ChevronRight size={18} color="#FFF" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  headerGradient: {
    paddingBottom: 30,
  },
  heroContent: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  heroIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFF',
    marginBottom: 8,
  },
  heroTagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFF',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 32,
  },
  content: {
    flex: 1,
    marginTop: -20,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  launchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  launchButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  shareButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  description: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.light.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.light.text,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
  },
  infoCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  infoButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#FFF',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonText: {
    color: '#FFF',
    fontWeight: '600' as const,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  speakAboutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  speakAboutButtonActive: {
    borderColor: Colors.light.tint,
    backgroundColor: Colors.light.surfaceAlt,
  },
  speakAboutText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  saveButtonActive: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  saveButtonTextActive: {
    color: '#FFF',
  },
});
