import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { Search, Sparkles } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { bots, featuredBots, categories, getBotById } from '@/mocks/bots';
import BotCard from '@/components/BotCard';
import CategoryChip from '@/components/CategoryChip';
import SectionHeader from '@/components/SectionHeader';

export default function HomeScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(category ?? 'All');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const filteredBots = bots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || bot.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBotPress = useCallback((botId: string) => {
    console.log('Opening bot details from home screen:', botId);
    router.push(`/(tabs)/(home)/bot/${botId}`);
  }, [router]);

  React.useEffect(() => {
    if (!category) {
      return;
    }

    console.log('Applying category filter from route params:', category);
    setSelectedCategory(category);
  }, [category]);

  React.useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const openBotId = new URLSearchParams(window.location.search).get('openBot');
    if (!openBotId) {
      return;
    }

    // Strip the param first so a refresh doesn't re-trigger the navigation.
    window.history.replaceState({}, '', window.location.pathname);

    if (!getBotById(openBotId)) {
      console.log('openBot link references unknown bot, ignoring', openBotId);
      return;
    }

    console.log('Navigating to chat from openBot link', openBotId);
    router.replace(`/(tabs)/(home)/bot/chat/${openBotId}`);
  }, [router]);


  const handleRefresh = useCallback(async () => {
    console.log('Refreshing home screen data');
    setIsRefreshing(true);

    try {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 700);
      });
      console.log('Home screen refresh complete');
    } catch (error) {
      console.error('Home screen refresh failed:', error);
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
              testID="home-refresh-control"
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Discover Bots</Text>
              <Sparkles size={24} color={Colors.light.tint} />
            </View>
            <Text style={styles.subtitle}>
              Find the perfect AI assistant for your needs
            </Text>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search bots..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="search-input"
            />
          </View>

          <View style={styles.categoriesSection}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContent}
            >
              <CategoryChip
                label="All"
                isActive={selectedCategory === 'All'}
                onPress={() => setSelectedCategory('All')}
              />
              {categories.map(category => (
                <CategoryChip
                  key={category.id}
                  label={category.name}
                  isActive={selectedCategory === category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  color={category.color}
                />
              ))}
            </ScrollView>
          </View>

          {selectedCategory === 'All' && searchQuery === '' && (
            <View style={styles.featuredSection}>
              <SectionHeader title="Featured" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.featuredList}
                testID="featured-bots-scroll"
              >
                {featuredBots.map((item) => (
                  <BotCard
                    key={item.id}
                    bot={item}
                    variant="featured"
                    onPress={() => handleBotPress(item.id)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.allBotsSection}>
            <SectionHeader 
              title={selectedCategory === 'All' ? 'All Bots' : selectedCategory} 
            />
            <View style={styles.botsList}>
              {filteredBots.length > 0 ? (
                filteredBots.map(bot => (
                  <BotCard 
                    key={bot.id} 
                    bot={bot} 
                    onPress={() => handleBotPress(bot.id)} 
                  />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text style={styles.emptyTitle}>No bots found</Text>
                  <Text style={styles.emptyText}>
                    Try adjusting your search or filter
                  </Text>
                </View>
              )}
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
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    marginHorizontal: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: Colors.light.text,
  },
  categoriesSection: {
    marginTop: 20,
  },
  categoriesContent: {
    paddingHorizontal: 20,
  },
  featuredSection: {
    marginTop: 28,
  },
  featuredList: {
    paddingHorizontal: 20,
  },
  allBotsSection: {
    marginTop: 28,
  },
  botsList: {
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
