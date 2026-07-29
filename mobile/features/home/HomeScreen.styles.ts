import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: spacing.lg,
  },
  title: { fontWeight: '900', letterSpacing: -0.5, textAlign: 'right' },
  tagline: { marginTop: 3, textAlign: 'right' },
  busIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#1d4ed8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginTop: spacing.lg,
    marginBottom: 4,
    opacity: 0.5,
  },
  list: { flex: 1 },
  listContent: { gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.lg },
});
