import { useEffect, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFavorites } from '@/store/favoritesStore';
import { useRecent } from '@/store/recentStore';
import { useAccessibility } from '@/store/accessibilityStore';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { colors } from '@/constants/theme';

function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <TouchableOpacity
        style={[styles.a11yBtn, { bottom: 80 + insets.bottom }]}
        onPress={() => setOpen(true)}
        accessibilityLabel="פתח אפשרויות נגישות"
        accessibilityRole="button"
        accessibilityHint="פותח פאנל עם הגדרות נגישות"
      >
        <Text style={styles.a11yIcon}>♿</Text>
      </TouchableOpacity>
      <AccessibilityPanel visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function RootLayout() {
  const loadFavorites = useFavorites(s => s.load);
  const loadRecent = useRecent(s => s.load);
  const loadAccessibility = useAccessibility(s => s.load);

  useEffect(() => {
    loadFavorites();
    loadRecent();
    loadAccessibility();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#00050f' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="search-location" options={{ presentation: 'modal' }} />
        <Stack.Screen name="search-number" options={{ presentation: 'modal' }} />
        <Stack.Screen name="recent" options={{ presentation: 'modal' }} />
        <Stack.Screen name="station/[code]" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <AccessibilityButton />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  a11yBtn: {
    position: 'absolute',
    left: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,20,60,0.92)',
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 999,
  },
  a11yIcon: { fontSize: 20 },
});
