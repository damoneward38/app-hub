import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>({
  abortOnUnmount: true,
});

let customBackendUrl: string | null = null;

export const setCustomBackendUrl = async (url: string | null) => {
  customBackendUrl = url;
  if (url) {
    await AsyncStorage.setItem('@custom_backend_url', url);
  } else {
    await AsyncStorage.removeItem('@custom_backend_url');
  }
};

export const loadCustomBackendUrl = async () => {
  customBackendUrl = await AsyncStorage.getItem('@custom_backend_url');
};

export const getBackendBaseUrl = () => {
  if (customBackendUrl) {
    const url = customBackendUrl.startsWith('http') ? customBackendUrl : `http://${customBackendUrl}`;
    console.log('🔍 Custom Backend URL:', url);
    return url;
  }
  
  const apiUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL || 'dev-3koub86hyi90hie4821hw.rorktest.dev';
  const url = apiUrl.startsWith('http') ? apiUrl : `https://${apiUrl}`;
  
  console.log('🔍 Backend URL:', url);
  console.log('🔍 Full endpoint will be:', `${url}/api/trpc`);

  return url;
};

loadCustomBackendUrl();

export const checkBackendHealth = async (): Promise<{ ok: boolean; message: string; timestamp?: string }> => {
  const baseUrl = getBackendBaseUrl();
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[${timestamp}] 🏥 Checking backend health:`, baseUrl);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(baseUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`[${timestamp}] ✅ Backend is healthy:`, data);
      return { ok: true, message: 'Backend is running', timestamp: data.timestamp };
    } else {
      console.error(`[${timestamp}] ❌ Backend returned ${response.status}`);
      return { ok: false, message: `Backend returned ${response.status} ${response.statusText}` };
    }
  } catch (error: any) {
    console.error(`[${timestamp}] ❌ Backend health check failed:`, error);
    
    if (error.name === 'AbortError') {
      return { ok: false, message: 'Backend timeout - server may be down' };
    }
    
    return { ok: false, message: `Backend unreachable: ${error.message}` };
  }
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBackendBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const token = await AsyncStorage.getItem('@auth_token');
        console.log('🔑 Auth token:', token ? 'Present' : 'None');
        return token ? { authorization: `Bearer ${token}` } : {};
      },
      async fetch(url, options) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] 🌐 tRPC Request:`, url);
        console.log(`[${timestamp}] 🔧 Backend URL:`, getBackendBaseUrl());
        
        try {
          const healthCheckUrl = `${getBackendBaseUrl()}/`;
          console.log(`[${timestamp}] 🏥 Testing health check:`, healthCheckUrl);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.error(`[${timestamp}] ⏰ Request timeout after 30s`);
            controller.abort();
          }, 30000);
          
          const res = await fetch(url, {
            ...options,
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          console.log(`[${timestamp}] ✅ Response status:`, res.status);
          console.log(`[${timestamp}] 📊 Response OK:`, res.ok);
          
          const contentType = res.headers.get('content-type') || '';
          console.log(`[${timestamp}] 📄 Content-Type:`, contentType);
          
          if (!contentType.includes('application/json')) {
            const text = await res.text();
            console.error(`[${timestamp}] ❌ Expected JSON but got:`, contentType);
            console.error(`[${timestamp}] ❌ Response preview:`, text.substring(0, 500));
            console.error(`[${timestamp}] ❌ Full URL:`, url);
            
            if (contentType.includes('text/html') || text.startsWith('<')) {
              throw new Error('BACKEND_NOT_RUNNING: Backend server is not responding. The server may be down or the URL is incorrect.');
            }
            
            throw new Error(`INVALID_RESPONSE: Backend returned ${res.status} ${res.statusText}`);
          }
          
          if (!res.ok) {
            const text = await res.text();
            console.error(`[${timestamp}] ❌ Backend error:`, text.substring(0, 500));
            throw new Error(`BACKEND_ERROR_${res.status}: ${res.statusText}`);
          }
          
          return res;
        } catch (err: any) {
          console.error(`[${timestamp}] ❌❌❌ FETCH FAILED ❌❌❌`);
          console.error(`[${timestamp}] ❌ Error type:`, err?.name);
          console.error(`[${timestamp}] ❌ Error message:`, err?.message);
          console.error(`[${timestamp}] ❌ Error code:`, err?.code);
          console.error(`[${timestamp}] ❌ Attempted URL:`, url);
          console.error(`[${timestamp}] ❌ Backend base:`, getBackendBaseUrl());
          console.error(`[${timestamp}] ❌ Stack:`, err?.stack?.substring(0, 300));
          
          if (err.name === 'AbortError') {
            throw new Error('TIMEOUT: Backend request timed out after 30 seconds. Server may be down or overloaded.');
          }
          
          if (err.message?.includes('BACKEND_')) {
            throw err;
          }
          
          if (err.message?.includes('Network request failed') || err.message?.includes('Load failed')) {
            throw new Error('NETWORK_FAILED: Cannot connect to backend server. The server may be offline or unreachable.');
          }
          
          throw new Error(`CONNECTION_ERROR: ${err?.message || 'Unknown network error'}`);
        }
      },
    }),
  ],
});

console.log('✅ tRPC client initialized');
