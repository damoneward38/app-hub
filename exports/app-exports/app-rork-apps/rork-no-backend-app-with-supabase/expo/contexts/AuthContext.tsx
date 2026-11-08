import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { User } from '@/types/auth';

const AUTH_STORAGE_KEY = 'bot_promo_auth';
const USERS_STORAGE_KEY = 'bot_promo_users';

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        console.log('User loaded from storage:', parsed.email);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStoredUsers = async (): Promise<Record<string, { password: string; user: User }>> => {
    try {
      const stored = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  };

  const saveStoredUsers = async (users: Record<string, { password: string; user: User }>) => {
    await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await getStoredUsers();
      const normalizedEmail = email.toLowerCase().trim();
      
      const userRecord = users[normalizedEmail];
      if (!userRecord) {
        return { success: false, error: 'No account found with this email' };
      }
      
      if (userRecord.password !== password) {
        return { success: false, error: 'Incorrect password' };
      }

      setUser(userRecord.user);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userRecord.user));
      console.log('User logged in:', userRecord.user.email);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }, []);

  const signup = useCallback(async (
    name: string, 
    email: string, 
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const users = await getStoredUsers();
      const normalizedEmail = email.toLowerCase().trim();
      
      if (users[normalizedEmail]) {
        return { success: false, error: 'An account with this email already exists' };
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email: normalizedEmail,
        name: name.trim(),
        createdAt: new Date().toISOString(),
      };

      users[normalizedEmail] = { password, user: newUser };
      await saveStoredUsers(users);
      
      setUser(newUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      console.log('User signed up:', newUser.email);
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      console.log('User logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not authenticated' };
    
    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
      
      const users = await getStoredUsers();
      if (users[user.email]) {
        users[user.email].user = updatedUser;
        await saveStoredUsers(users);
      }
      
      console.log('Profile updated');
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Failed to update profile' };
    }
  }, [user]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };
});
