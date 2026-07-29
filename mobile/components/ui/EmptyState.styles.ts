import { StyleSheet } from 'react-native';
import { spacing } from '@/constants/theme';

export const styles = StyleSheet.create({
  wrapLarge: { alignItems: 'center', marginTop: 80, gap: spacing.sm },
  wrapInline: { marginTop: spacing.xl },
  icon: { fontSize: 48 },
  title: { fontWeight: '700', textAlign: 'center' },
  inlineTitle: { textAlign: 'center' },
  subtitle: { textAlign: 'center' },
});
