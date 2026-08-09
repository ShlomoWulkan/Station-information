import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  arrow: { color: colors.accent, marginStart: spacing.xs },
  // בלי alignItems: הילדים נמתחים והיישור האוטומטי מצמיד לתחילת הכיוון.
  info: { flex: 1 },
  name: { fontWeight: '800' },
  code: { marginTop: 2 },
  distance: { color: colors.accent, marginTop: 2 },
  iconBtn: { padding: spacing.xs, marginEnd: spacing.xs },
  favIcon: { color: 'rgba(255,255,255,0.5)' },
  favIconActive: { color: '#facc15' },
  deleteBtn: { padding: spacing.xs, marginHorizontal: spacing.md, alignSelf: 'center' },
});
