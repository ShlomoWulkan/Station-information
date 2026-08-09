import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AccessibilityPanel } from '@/components/AccessibilityPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { a11yStrings } from '@/constants/strings';
import { colors } from '@/constants/theme';

function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { bottom: 80 + insets.bottom }]}
        onPress={() => setOpen(true)}
        accessibilityLabel={a11yStrings.openPanel}
        accessibilityRole="button"
        accessibilityHint={a11yStrings.openPanelHint}
      >
        <Text style={styles.icon}>♿</Text>
      </TouchableOpacity>
      <AccessibilityPanel visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

export default function RootLayout() {
  // אין כאן טעינת stores: persist middleware משחזר אותם בעצמו. קודם היו כאן
  // שלוש קריאות async לא-מנוטרות ב-useEffect עם מערך תלויות ריק.
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <ErrorBoundary>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search-location" options={{ presentation: 'modal' }} />
          <Stack.Screen name="search-number" options={{ presentation: 'modal' }} />
          <Stack.Screen name="recent" options={{ presentation: 'modal' }} />
          <Stack.Screen name="station/[code]" options={{ presentation: 'fullScreenModal' }} />
          {/* היה חסר — עבד לפי קונבנציית קבצים אבל בלי האפשרויות של אחיו. */}
          <Stack.Screen name="route/[lineNumber]" options={{ presentation: 'card' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ErrorBoundary>
      <AccessibilityButton />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    // end ולא left: ב-RTL הוא הצד השמאלי של המסך, ושם הכפתור לא מכסה את
    // תחילת השורות. `left` היה מוחלף על ידי RTL וקופץ דווקא לימין.
    end: 16,
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
  icon: { fontSize: 20 },
});
