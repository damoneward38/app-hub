import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Component, ErrorInfo, ReactNode, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, ActivityIndicator, StyleSheet, Text, Platform, TouchableOpacity } from "react-native";

import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider, useAuth } from "@/lib/auth-context";

console.log('🚀 App starting...');
console.log('📱 Platform:', Platform.OS);
console.log('🌍 Environment:', __DEV__ ? 'Development' : 'Production');
console.log('✅ TRPC Provider is configured');

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        const errorMessage = error?.message || '';
        
        if (errorMessage.includes('Backend') || 
            errorMessage.includes('timeout') ||
            errorMessage.includes('Network')) {
          console.log('🚫 Not retrying due to connection issue');
          return false;
        }
        
        return failureCount < 1;
      },
      retryDelay: 500,
      refetchOnWindowFocus: false,
      staleTime: 30000,
      gcTime: 300000,
      networkMode: 'always',
    },
    mutations: {
      retry: false,
      networkMode: 'always',
    },
  },
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      console.error('🔴 Error Boundary Active');
      console.error('🔴 Error:', this.state.error?.message);
      console.error('🔴 Stack:', this.state.error?.stack);
      
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{this.state.error?.message || 'Unknown error'}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              this.setState({ hasError: false, error: null });
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

function RootLayoutNav() {
  const authContext = useAuth();
  const [forceRender, setForceRender] = useState(false);
  const isLoading = authContext?.isLoading ?? false;

  useEffect(() => {
    console.log('🏠 RootLayoutNav mounted');
    console.log('⏳ Auth loading:', isLoading);
    console.log('🔍 Auth context exists:', !!authContext);
    
    const timer = setTimeout(() => {
      console.log('⏰ Force render timeout - loading took > 3s');
      setForceRender(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, authContext]);

  useEffect(() => {
    if (!isLoading) {
      console.log('✅ Auth loaded, rendering main app');
    }
  }, [isLoading]);

  if (isLoading && !forceRender) {
    console.log('⏳ Showing loading screen...');
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading...</Text>
        <Text style={styles.loadingSubtext}>Starting app...</Text>
      </View>
    );
  }

  console.log('✅ Rendering Stack Navigator');
  console.log('🗺️ Routes available: (tabs)');
  console.log('🗺️ Platform:', Platform.OS);
  
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    console.log('🎯 RootLayout mounted');
    const init = async () => {
      try {
        console.log('💤 Hiding splash screen...');
        await SplashScreen.hideAsync();
        console.log('✅ Splash hidden');
        setAppReady(true);
      } catch (error) {
        console.error('❌ Splash hide error:', error);
        setAppReady(true);
      }
    };

    init();
  }, []);

  if (!appReady) {
    console.log('⏳ App not ready yet...');
    return null;
  }

  console.log('🎨 Rendering app providers...');
  console.log('🔍 Environment check:');
  console.log('  - API URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'NOT SET');
  console.log('  - Supabase URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
  console.log('  - Supabase Key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <AuthProvider>
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </AuthProvider>
        </trpc.Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
  loadingSubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  errorTitle: {
    color: '#ff4444',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#1DB954',
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
