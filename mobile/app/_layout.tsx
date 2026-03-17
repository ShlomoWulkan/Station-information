import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFavorites } from '@/store/favoritesStore';
import { useRecent } from '@/store/recentStore';

export default function RootLayout() {
  const loadFavorites = useFavorites(s => s.load);
  const loadRecent = useRecent(s => s.load);

  useEffect(() => {
    loadFavorites();
    loadRecent();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#00050f' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search-location" options={{ presentation: 'modal' }} />
        <Stack.Screen name="search-number" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recent" options={{ presentation: 'modal' }} />
        <Stack.Screen name="station/[code]" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaProvider>
  );
}
