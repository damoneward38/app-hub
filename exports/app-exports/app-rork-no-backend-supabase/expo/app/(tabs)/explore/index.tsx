import React, { useCallback, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Music, 
  Briefcase, 
  Zap, 
  GraduationCap, 
  Heart, 
  Wrench, 
  Palette, 
  Target,
  TrendingUp,
  Clock,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { categories, bots, newBots } from '@/mocks/bots';
import BotCard from '@/components/BotCard';

const iconMap: Record<string, React.ComponentType<any>> = {
  Music,
  Briefcase,
  Zap,
  GraduationCap,
  Heart,
  Wrench,
  Palette,
  Target,
};

export default function ExploreScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleCategoryPress = (categoryId: string) => {
    router.push({
      pathname: '/(tabs)/(home)',
      params: { category: categoryId },
    });
  };

  const handleBotPress = (botId: string) => {
    router.push(`/(tabs)/(home)/bot/${botId}`);
  };

  const topRatedBots = [...bots].sort((a, b) => b.rating - a.rating).slice(0, 5);

  const handleRefresh = useCallback(async () => {
    console.log('Refreshing explore screen data');
    setIsRefreshing(true);

    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 700);
      });
      console.log('Explore screen refresh complete');
    } catch (error) {
      console.error('Explore screen refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.tint}
              colors={[Colors.light.tint]}
              testID="explore-refresh-control"
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>
              Browse by category or discover trending bots
            </Text>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.map(category => {
              const IconComponent = iconMap[category.icon] || Target;
              return (
                <Pressable
                  key={category.id}
                  style={({ pressed }) => [
                    styles.categoryCard,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                  testID={`explore-category-${category.id}`}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                    <IconComponent size={24} color={category.color} />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryCount}>
                    {bots.filter(b => b.category === category.id).length} bots
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={Colors.light.tint} />
              <Text style={styles.sectionTitle}>Top Rated</Text>
            </View>
            {topRatedBots.map(bot => (
              <BotCard 
                key={bot.id}
                bot={bot} 
                variant="compact"
                onPress={() => handleBotPress(bot.id)} 
              />
            ))}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={Colors.light.accent} />
              <Text style={styles.sectionTitle}>Recently Added</Text>
            </View>
            {newBots.length > 0 ? (
              newBots.map(bot => (
                <BotCard 
                  key={bot.id}
                  bot={bot} 
                  variant="compact"
                  onPress={() => handleBotPress(bot.id)} 
                />
              ))
            ) : (
              <Text style={styles.emptyText}>No new bots yet</Text>
            )}
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Bot Marketplace</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{bots.length}</Text>
                <Text style={styles.statLabel}>Total Bots</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{categories.length}</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {(bots.reduce((sum, b) => sum + b.rating, 0) / bots.length).toFixed(1)}
                </Text>
                <Text style={styles.statLabel}>Avg Rating</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800' as const,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 6,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  statsCard: {
    margin: 20,
    marginTop: 32,
    backgroundColor: Colors.light.tint,
    borderRadius: 20,
    padding: 24,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#FFF',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
});
