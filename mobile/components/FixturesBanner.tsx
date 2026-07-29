import { View, Text, StyleSheet } from 'react-native';
import { USE_FIXTURES } from '@/constants/config';
import { stationStrings } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';

/**
 * מסמן שהמסך מציג נתוני דמו ולא נתוני אמת.
 *
 * מרנדר null כשהדגל כבוי, כדי שאפשר יהיה להציב אותו בלי תנאי. קיים כי נתוני
 * דמו הוצגו פעם בלי שום סימן, ואי אפשר היה להבדיל בינם לבין נתונים אמיתיים.
 */
export function FixturesBanner() {
  if (!USE_FIXTURES) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.text}>{stationStrings.fixturesWarning}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  icon: { fontSize: 13 },
  text: { color: colors.warning, fontSize: 12, fontWeight: '800' },
});
