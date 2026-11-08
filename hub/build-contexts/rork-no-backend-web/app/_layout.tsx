import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/contexts/AuthContext";

const isResizeObserverNoise = (value: unknown): boolean => {
  if (typeof value === 'string') {
    return value.includes('ResizeObserver loop') || value.includes('ResizeObserver loop completed with undelivered notifications');
  }

  if (value && typeof value === 'object' && 'message' in value) {
    const message = (value as { message?: unknown }).message;
    return typeof message === 'string' && isResizeObserverNoise(message);
  }

  return false;
};

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  const webWindow = window as Window & {
    __resizeObserverNoiseHandlerInstalled?: boolean;
  };

  if (!webWindow.__resizeObserverNoiseHandlerInstalled) {
    webWindow.__resizeObserverNoiseHandlerInstalled = true;

    const originalError = webWindow.onerror;
    webWindow.onerror = (message, source, lineno, colno, error) => {
      if (isResizeObserverNoise(message) || isResizeObserverNoise(error)) {
        return true;
      }

      return originalError?.call(webWindow, message, source, lineno, colno, error) ?? false;
    };

    webWindow.addEventListener(
      'error',
      (event: ErrorEvent) => {
        if (isResizeObserverNoise(event.message) || isResizeObserverNoise(event.error)) {
          event.stopImmediatePropagation();
          event.preventDefault();
        }
      },
      true,
    );

    webWindow.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      if (isResizeObserverNoise(event.reason)) {
        event.preventDefault();
      }
    });
  }
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="signup" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    console.log('App loaded - Bot Promotion Platform');
    void SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </GestureHandlerRootView>
      </AuthProvider>
    </QueryClientProvider>
  );
}
