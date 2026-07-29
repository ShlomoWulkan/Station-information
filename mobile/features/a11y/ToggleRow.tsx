import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

interface Props {
  title: string;
  subtitle: string;
  value: boolean;
  onChange: () => void;
}

/** שורת מתג בפאנל הנגישות. הטקסט מימין למתג — סדר RTL. */
export function ToggleRow({ title, subtitle, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,255,255,0.1)', true: colors.accent }}
        thumbColor="#fff"
        accessibilityLabel={title}
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
      />
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  info: { flex: 1, alignItems: 'flex-end' },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 12, color: colors.textSub, marginTop: 2 },
});
