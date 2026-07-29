import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginTop: spacing.xl, gap: spacing.md },
  message: { color: colors.error, textAlign: 'center' },
  retryBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  retryText: { color: colors.onAccent, fontWeight: '800' },
});
