import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Star } from 'lucide-react-native';
import { Bot } from '@/types/bot';
import Colors from '@/constants/colors';

interface BotCardProps {
  bot: Bot;
  onPress: () => void;
  variant?: 'default' | 'featured' | 'compact';
}

export default function BotCard({ bot, onPress, variant = 'default' }: BotCardProps) {
  if (variant === 'featured') {
    return (
      <Pressable 
        style={({ pressed }) => [
          styles.featuredCard,
          { backgroundColor: bot.gradient[0] },
          pressed && styles.pressed
        ]}
        onPress={onPress}
        testID={`bot-card-${bot.id}`}
      >
        <View style={styles.featuredContent}>
          <Text style={styles.featuredIcon}>{bot.icon}</Text>
          <View style={styles.featuredInfo}>
            <Text style={styles.featuredName}>{bot.name}</Text>
            <Text style={styles.featuredTagline} numberOfLines={2}>{bot.tagline}</Text>
            <View style={styles.featuredMeta}>
              <View style={styles.ratingBadge}>
                <Star size={12} color="#FFF" fill="#FFF" />
                <Text style={styles.ratingTextWhite}>{bot.rating}</Text>
              </View>
              <Text style={styles.usersTextWhite}>{bot.users} users</Text>
            </View>
          </View>
        </View>
        {bot.isNew && (
          <View style={styles.newBadgeFeatured}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}
      </Pressable>
    );
  }

  if (variant === 'compact') {
    return (
      <Pressable 
        style={({ pressed }) => [styles.compactCard, pressed && styles.pressed]}
        onPress={onPress}
        testID={`bot-card-${bot.id}`}
      >
        <View style={[styles.compactIcon, { backgroundColor: bot.gradient[0] + '20' }]}>
          <Text style={styles.iconText}>{bot.icon}</Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName}>{bot.name}</Text>
          <Text style={styles.compactCategory}>{bot.category}</Text>
        </View>
        <View style={styles.compactRating}>
          <Star size={12} color="#FFB800" fill="#FFB800" />
          <Text style={styles.ratingText}>{bot.rating}</Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable 
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      testID={`bot-card-${bot.id}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: bot.gradient[0] + '15' }]}>
        <Text style={styles.iconTextLarge}>{bot.icon}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{bot.name}</Text>
          {bot.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>
        <Text style={styles.tagline} numberOfLines={2}>{bot.tagline}</Text>
        <View style={styles.meta}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{bot.category}</Text>
          </View>
          <View style={styles.rating}>
            <Star size={14} color="#FFB800" fill="#FFB800" />
            <Text style={styles.ratingText}>{bot.rating}</Text>
          </View>
          <Text style={styles.usersText}>{bot.users}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconTextLarge: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  tagline: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: Colors.light.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '500' as const,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  ratingText: {
    fontSize: 13,
    color: Colors.light.text,
    marginLeft: 4,
    fontWeight: '500' as const,
  },
  usersText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  newBadge: {
    backgroundColor: Colors.light.accent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  newBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '700' as const,
  },
  featuredCard: {
    width: 260,
    borderRadius: 20,
    padding: 20,
    marginRight: 14,
    minHeight: 160,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featuredIcon: {
    fontSize: 40,
    marginRight: 14,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFF',
    marginBottom: 4,
  },
  featuredTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  ratingTextWhite: {
    fontSize: 12,
    color: '#FFF',
    marginLeft: 4,
    fontWeight: '600' as const,
  },
  usersTextWhite: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  newBadgeFeatured: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  compactCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  compactCategory: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  compactRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
