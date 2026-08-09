import { View, Text, StyleSheet } from 'react-native';
import { A11Y_STATEMENT_UPDATED } from '@/constants/config';
import { a11yStrings } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';

/** הצהרת הנגישות הנדרשת בחוק. תאריך העדכון מגיע מהקונפיג. */
export function AccessibilityStatement() {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{a11yStrings.statementBody}</Text>
      <Text style={styles.text}>{a11yStrings.statementContact}</Text>
      <Text style={styles.date}>{a11yStrings.statementUpdated(A11Y_STATEMENT_UPDATED)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  text: { fontSize: 12, color: colors.textSub, lineHeight: 18 },
  date: { fontSize: 11, color: 'rgba(180,210,255,0.3)' },
});
