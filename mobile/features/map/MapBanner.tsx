import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

type Tone = 'warning' | 'info';

interface Props {
  message: string;
  /** warning לכשל, info לרמז. */
  tone?: Tone;
}

/**
 * הודעה לא-חוסמת מעל המפה.
 *
 * כשל רענון תחנות לא צריך להחליף את המפה במסך שגיאה — הסמנים הקיימים עדיין
 * שימושיים. קודם הכשל נבלע ב-catch ריק ולא הוצג בכלל.
 */
export function MapBanner({ message, tone = 'warning' }: Props) {
  const { font } = useA11y();
  const palette = tone === 'warning' ? WARNING : INFO;

  return (
    <View
      style={[styles.banner, { backgroundColor: palette.bg, borderColor: palette.border }]}
      accessibilityRole={tone === 'warning' ? 'alert' : 'text'}
    >
      <Text style={[styles.text, { fontSize: font(12), color: palette.text }]}>{message}</Text>
    </View>
  );
}

const WARNING = {
  bg: colors.warningBg,
  border: colors.warningBorder,
  text: colors.warning,
};

const INFO = {
  bg: colors.accentBg,
  border: colors.accentBorder,
  text: colors.accent,
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    right: spacing.lg + 44,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: { fontWeight: '700', textAlign: 'center' },
});
