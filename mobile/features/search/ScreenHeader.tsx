import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { commonStrings } from '@/constants/strings';
import { colors, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

interface Props {
  title: string;
  /** פעולה בצד השני של הכותרת, למשל רענון. */
  action?: { icon: string; label: string; onPress: () => void; disabled?: boolean };
}

/** כותרת עם כפתור סגירה, לשלושת מסכי המודל. */
export function ScreenHeader({ title, action }: Props) {
  const { font, c } = useA11y();

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel={commonStrings.close}
      >
        <Text style={[styles.backIcon, { fontSize: font(18) }]}>✕</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { fontSize: font(18), color: c.text }]}>{title}</Text>

      {action ? (
        <TouchableOpacity
          onPress={action.onPress}
          style={styles.action}
          disabled={action.disabled}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          accessibilityState={{ disabled: action.disabled }}
        >
          <Text style={{ fontSize: font(18), opacity: action.disabled ? 0.4 : 1 }}>
            {action.icon}
          </Text>
        </TouchableOpacity>
      ) : (
        // מאזן את כפתור הסגירה כדי שהכותרת תישאר ממורכזת
        <View style={styles.spacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  back: { marginLeft: spacing.md, padding: spacing.xs },
  backIcon: { color: colors.textSub },
  title: { flex: 1, fontWeight: '800', textAlign: 'center' },
  action: { padding: spacing.xs },
  spacer: { width: 34 },
});
