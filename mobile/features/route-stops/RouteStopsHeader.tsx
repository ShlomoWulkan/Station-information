import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { commonStrings, stationStrings } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

interface Props {
  lineNumber: string;
}

export function RouteStopsHeader({ lineNumber }: Props) {
  const { font, c } = useA11y();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel={commonStrings.close}
      >
        <Text style={[styles.closeText, { fontSize: font(16) }]}>✕</Text>
      </TouchableOpacity>

      <View style={styles.center}>
        <View style={[styles.badge, { minWidth: font(40), height: font(32) }]}>
          <Text style={[styles.number, { fontSize: font(16) }]}>{lineNumber}</Text>
        </View>
        <Text style={[styles.title, { fontSize: font(17), color: c.text }]}>
          {stationStrings.routeStopsTitle}
        </Text>
      </View>

      {/* מאזן את כפתור הסגירה כדי שהכותרת תישאר ממורכזת */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.text, fontWeight: '700' },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  number: { color: colors.onAccent, fontWeight: '900' },
  title: { fontWeight: '800' },
  spacer: { width: 32 },
});
