import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: {
    backgroundColor: colors.surfaceRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.accentBorder,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    maxHeight: '85%',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  closeText: { color: colors.text, fontSize: 15, fontWeight: '700' },
  title: { flex: 1, fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'right' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSub,
    textAlign: 'right',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  resetBtn: {
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  resetText: { color: colors.error, fontSize: 13, fontWeight: '700' },
});
