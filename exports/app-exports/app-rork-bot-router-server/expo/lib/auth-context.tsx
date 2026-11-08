import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, Session, AuthError } from '@supabase/supabase-js';
import { getBackendBaseUrl, loadCustomBackendUrl } from './trpc';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const hasValidSupabaseConfig = isValidUrl(supabaseUrl) && supabaseAnonKey.length > 20;

export const supabase = hasValidSupabaseConfig 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

interface User {
  id: string;
  name?: string;
  email?: string;
  isAdmin: boolean;
  hasSubscription: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  loginAdmin: (email: string, passcode: string) => Promise<void>;
  getToken: () => Promise<string | null>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = '@auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserWithSubscription = useCallback(async (session: Session | null, adminToken?: string) => {
    if (adminToken && adminToken.startsWith('admin.')) {
      const email = 'Admin';
      setUser({
        id: 'admin',
        name: 'Admin',
        email: email,
        isAdmin: true,
        hasSubscription: true,
      });
      return;
    }

    if (!session?.user) {
      setUser(null);
      return;
    }

    setUser({
      id: session.user.id,
      email: session.user.email,
      isAdmin: false,
      hasSubscription: false,
    });
  }, []);

  const refreshSubscriptionStatus = useCallback(async () => {
    if (!user || user.isAdmin) return;
    
    console.log('🔄 Refreshing subscription status...');
  }, [user]);

  useEffect(() => {
    console.log('🔐 Setting up auth...');
    console.log('🔐 Supabase config valid:', hasValidSupabaseConfig);
    
    const initAuth = async () => {
      const adminToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
      
      if (adminToken && adminToken.startsWith('admin.')) {
        console.log('🔐 Admin token found');
        await loadUserWithSubscription(null, adminToken);
        setIsLoading(false);
        return;
      }
      
      if (!hasValidSupabaseConfig || !supabase) {
        console.warn('⚠️ Supabase not configured, skipping auth');
        setIsLoading(false);
        return;
      }
      
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        console.log('🔐 Session loaded:', session ? 'Yes' : 'No');
        setSession(session);
        await loadUserWithSubscription(session);
        setIsLoading(false);
      });
    };
    
    initAuth();

    if (!hasValidSupabaseConfig || !supabase) {
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('🔐 Auth state changed:', _event, session ? 'Session active' : 'No session');
      setSession(session);
      await loadUserWithSubscription(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserWithSubscription]);

  const signUp = async (email: string, password: string) => {
    if (!hasValidSupabaseConfig || !supabase) {
      return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
    }
    
    console.log('📝 Signing up:', email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign up error:', error.message);
    } else {
      console.log('✅ Sign up successful');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (!hasValidSupabaseConfig || !supabase) {
      return { error: { message: 'Supabase not configured', name: 'ConfigError', status: 500 } as AuthError };
    }
    
    console.log('🔑 Signing in:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('❌ Sign in error:', error.message);
    } else {
      console.log('✅ Sign in successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('👋 Signing out...');
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setSession(null);
    
    if (hasValidSupabaseConfig && supabase) {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Sign out error:', error.message);
      } else {
        console.log('✅ Signed out');
      }
    }
  };

  const loginAdmin = async (email: string, passcode: string) => {
    await loadCustomBackendUrl();
    const response = await fetch(getBackendBaseUrl() + '/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: passcode }),
    });
    if (!response.ok) throw new Error('Admin login failed');
    const result = await response.json() as { token?: string; user?: { email?: string } };
    if (!result.token || !result.token.startsWith('admin.')) throw new Error('Admin login response invalid');
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);
    setUser({
      id: 'admin',
      name: 'Admin',
      email: result.user?.email || email,
      isAdmin: true,
      hasSubscription: true,
    });
  };


  const getToken = async () => {
    const adminToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (adminToken && adminToken.startsWith('admin.')) {
      return adminToken;
    }
    
    if (!hasValidSupabaseConfig || !supabase) {
      return null;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut, loginAdmin, getToken, refreshSubscriptionStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
