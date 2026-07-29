import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

interface Props {
  /** טקסט מתחת לספינר. מושמט בטעינות קצרות בתוך רשימה. */
  label?: string;
  /** ממורכז על כל המסך במקום בראש הרשימה. */
  fullScreen?: boolean;
}

export function LoadingState({ label, fullScreen = false }: Props) {
  const { font, c } = useA11y();

  return (
    <View style={fullScreen ? styles.center : styles.inline}>
      <ActivityIndicator color={colors.accent} size={fullScreen ? 'large' : 'small'} />
      {label && (
        <Text style={[styles.label, { fontSize: font(14), color: c.textSub }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  inline: { marginTop: spacing.xl },
  label: { marginTop: spacing.sm },
});
