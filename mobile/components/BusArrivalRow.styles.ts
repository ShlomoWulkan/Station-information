import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lineBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  lineNum: { color: colors.onAccent, fontWeight: '900' },
  destination: { flex: 1, textAlign: 'right' },
  timeBadge: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: radius.md,
  },
  timeBadgeNow: { backgroundColor: 'rgba(74,222,128,0.15)', borderColor: colors.liveDot },
  timeText: { color: colors.accent, fontWeight: '700' },
  timeTextNow: { color: colors.liveDot },
  routeBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(96,165,250,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBtnIcon: { color: colors.accent },
});
