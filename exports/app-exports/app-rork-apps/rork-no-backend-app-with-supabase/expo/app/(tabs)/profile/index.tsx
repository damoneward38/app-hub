import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  LogOut,
  Settings,
  Heart,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Bot,
  MessageCircle,
} from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { getBotById } from '@/mocks/bots';
import { getAllChatSummaries, type SavedChatSummary } from '@/utils/chatHistory';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showBorder?: boolean;
  danger?: boolean;
}

const MenuItem = ({ icon, label, onPress, showBorder = true, danger = false }: MenuItemProps) => (
  <TouchableOpacity
    style={[styles.menuItem, showBorder && styles.menuItemBorder]}
    onPress={onPress}
  >
    <View style={styles.menuItemLeft}>
      {icon}
      <Text style={[styles.menuItemLabel, danger && styles.menuItemLabelDanger]}>
        {label}
      </Text>
    </View>
    <ChevronRight size={20} color={danger ? Colors.light.error : Colors.light.textSecondary} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [savedChats, setSavedChats] = useState<SavedChatSummary[]>([]);

  const loadSavedChats = useCallback(async () => {
    const summaries = await getAllChatSummaries();
    const resumable = summaries.filter((summary) => Boolean(getBotById(summary.botId)));
    setSavedChats(resumable);
  }, []);

  useEffect(() => {
    void loadSavedChats();
  }, [loadSavedChats]);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRefresh = useCallback(async () => {
    console.log('Refreshing profile screen data');
    setIsRefreshing(true);

    try {
      await loadSavedChats();
      console.log('Profile screen refresh complete');
    } catch (error) {
      console.error('Profile screen refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.guestContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.light.tint}
              colors={[Colors.light.tint]}
              testID="profile-refresh-control"
            />
          }
        >
          <View style={styles.guestCard}>
            <View style={styles.guestIconContainer}>
              <Bot size={56} color={Colors.light.tint} />
            </View>
            <Text style={styles.guestTitle}>Welcome to Bot Promo</Text>
            <Text style={styles.guestSubtitle}>
              Sign in to save your favorite bots and personalize your experience
            </Text>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.signupButton}
              onPress={() => router.push('/signup')}
            >
              <Text style={styles.signupButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.tint}
            colors={[Colors.light.tint]}
            testID="profile-refresh-control"
          />
        }
      >
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {savedChats.length > 0 && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Saved Conversations</Text>
            <View style={styles.menuCard}>
              {savedChats.map((summary, index) => {
                const chatBot = getBotById(summary.botId);
                if (!chatBot) {
                  return null;
                }

                const isLastRow = index === savedChats.length - 1;

                return (
                  <TouchableOpacity
                    key={summary.botId}
                    style={[styles.chatRow, !isLastRow && styles.menuItemBorder]}
                    onPress={() => {
                      console.log('Resuming saved conversation', { botId: summary.botId });
                      router.push(`/(tabs)/(home)/bot/chat/${summary.botId}`);
                    }}
                    testID={`resume-chat-${summary.botId}`}
                  >
                    <View style={[styles.chatAvatar, { backgroundColor: chatBot.gradient[0] }]}>
                      <Text style={styles.chatAvatarText}>{chatBot.icon}</Text>
                    </View>
                    <View style={styles.chatInfo}>
                      <Text style={styles.chatBotName}>{chatBot.name}</Text>
                      <Text style={styles.chatPreview} numberOfLines={1}>
                        {summary.lastMessageRole === 'user' ? 'You: ' : ''}
                        {summary.lastMessageText}
                      </Text>
                      <View style={styles.chatMetaRow}>
                        <MessageCircle size={12} color={Colors.light.textSecondary} />
                        <Text style={styles.chatMetaText}>
                          {summary.messageCount} message{summary.messageCount === 1 ? '' : 's'}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color={Colors.light.textSecondary} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<User size={22} color={Colors.light.tint} />}
              label="Edit Profile"
              onPress={() => console.log('Edit profile')}
            />
            <MenuItem
              icon={<Heart size={22} color={Colors.light.error} />}
              label="Favorites"
              onPress={() => console.log('Favorites')}
            />
            <MenuItem
              icon={<Bell size={22} color={Colors.light.warning} />}
              label="Notifications"
              onPress={() => console.log('Notifications')}
              showBorder={false}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<Settings size={22} color={Colors.light.textSecondary} />}
              label="Settings"
              onPress={() => console.log('Settings')}
            />
            <MenuItem
              icon={<Shield size={22} color={Colors.light.accent} />}
              label="Privacy"
              onPress={() => console.log('Privacy')}
            />
            <MenuItem
              icon={<HelpCircle size={22} color={Colors.light.tint} />}
              label="Help & Support"
              onPress={() => console.log('Help')}
              showBorder={false}
            />
          </View>
        </View>

        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <MenuItem
              icon={<LogOut size={22} color={Colors.light.error} />}
              label="Sign Out"
              onPress={handleLogout}
              showBorder={false}
              danger
            />
          </View>
        </View>

        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  guestContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  guestCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  guestIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  loginButton: {
    backgroundColor: Colors.light.tint,
    borderRadius: 14,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  signupButton: {
    backgroundColor: Colors.light.surfaceAlt,
    borderRadius: 14,
    height: 50,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.light.tint,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemLabel: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: '500' as const,
  },
  menuItemLabelDanger: {
    color: Colors.light.error,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  chatAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    fontSize: 20,
  },
  chatInfo: {
    flex: 1,
    gap: 3,
  },
  chatBotName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  chatPreview: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  chatMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  chatMetaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 8,
    marginBottom: 32,
  },
});
