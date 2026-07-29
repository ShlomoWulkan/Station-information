import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

interface Props {
  message: string;
}

/**
 * הודעת כשל לא-חוסמת מעל המפה.
 *
 * כשל רענון תחנות לא צריך להחליף את המפה במסך שגיאה — הסמנים הקיימים עדיין
 * שימושיים. קודם הכשל נבלע ב-catch ריק ולא הוצג בכלל.
 */
export function MapErrorBanner({ message }: Props) {
  const { font } = useA11y();

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={[styles.text, { fontSize: font(12) }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    right: spacing.lg + 44,
    backgroundColor: colors.warningBg,
    borderColor: colors.warningBorder,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: { color: colors.warning, fontWeight: '700', textAlign: 'center' },
});
