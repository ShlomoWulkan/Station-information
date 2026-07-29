import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  lineCol: { width: 28, alignItems: 'center' },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.cardBorder,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    marginTop: 14,
  },
  dotCurrent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  vertLine: { flex: 1, width: 2, backgroundColor: 'rgba(255,255,255,0.1)', minHeight: 30 },
  vertLineCurrent: { backgroundColor: colors.accent },
  content: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: 2,
    borderRadius: radius.sm,
  },
  contentCurrent: { backgroundColor: 'rgba(96,165,250,0.08)' },
  name: { fontWeight: '700', color: 'rgba(255,255,255,0.75)', textAlign: 'right' },
  nameCurrent: { color: '#ffffff' },
  code: { marginTop: 2, textAlign: 'right' },
  hereBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 12,
    marginLeft: spacing.sm,
  },
  hereText: { color: colors.onAccent, fontWeight: '900' },
});
