import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginStart: spacing.sm,
  },
  closeText: { color: colors.text, fontWeight: '700' },
  // בלי alignItems: הילדים נמתחים והיישור האוטומטי מצמיד לתחילת הכיוון.
  info: { flex: 1 },
  name: { fontWeight: '800' },
  code: { marginTop: 2 },
  favBtn: { padding: spacing.xs },
});
