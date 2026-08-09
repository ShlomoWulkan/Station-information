import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { commonStrings } from '@/constants/strings';
import { colors } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

/**
 * שורת ניווט תחתונה למסכים שמחוץ ל-(tabs).
 *
 * הסדר כאן הוא סדר הקריאה: ב-RTL הראשון נרנדר בקצה הימני. חייב להישאר זהה
 * לסדר ב-(tabs)/_layout, אחרת הניווט התחתון קופץ בין מסכים.
 */
const ITEMS = [
  { emoji: '🏠', label: commonStrings.nav.home, go: () => router.dismissAll() },
  { emoji: '⭐', label: commonStrings.nav.favorites, go: () => router.navigate('/(tabs)/favorites') },
  { emoji: '🗺️', label: commonStrings.nav.map, go: () => router.navigate('/(tabs)/map') },
  { emoji: '⚙️', label: commonStrings.nav.settings, go: () => router.navigate('/(tabs)/settings') },
] as const;

export function BottomNav() {
  const insets = useSafeAreaInsets();
  const { font, c } = useA11y();

  return (
    <View
      style={[styles.bar, { paddingBottom: insets.bottom + 4, height: font(52) + insets.bottom }]}
    >
      {ITEMS.map(({ emoji, label, go }) => (
        <TouchableOpacity
          key={label}
          style={styles.item}
          onPress={go}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Text style={{ fontSize: font(20) }}>{emoji}</Text>
          <Text style={[styles.label, { fontSize: font(10), color: c.tabInactive }]}>{label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    borderTopColor: colors.tabBarBorder,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2 },
  label: { fontWeight: '700' },
});
