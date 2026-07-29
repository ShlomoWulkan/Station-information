import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  switch: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 3,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  btn: { flex: 1, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center' },
  btnActive: { backgroundColor: colors.accent },
  text: { fontWeight: '700', color: colors.textSub },
  textActive: { color: colors.onAccent },
});
