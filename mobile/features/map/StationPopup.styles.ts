import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 56,
    left: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  closeText: { color: colors.textSub },
  popup: {
    position: 'absolute',
    bottom: 32,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(0,20,60,0.97)',
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  info: { flex: 1, alignItems: 'flex-end' },
  name: { fontWeight: '800', color: colors.text },
  code: { color: 'rgba(180,210,255,0.8)', marginTop: 2 },
  hint: { color: 'rgba(96,165,250,0.7)', marginTop: 4 },
  arrow: { color: colors.accent, fontWeight: '700' },
});
