import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerTintColor: Colors.light.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="bot/[id]" 
        options={{ 
          title: '',
          headerTransparent: true,
        }} 
      />
      <Stack.Screen 
        name="bot/chat/[id]" 
        options={{ 
          headerShown: false,
        }} 
      />
    </Stack>
  );
}
