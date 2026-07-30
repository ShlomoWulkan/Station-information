import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { mapStrings } from '@/constants/strings';
import { colors, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

interface Props {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * חזרה למיקום המשתמש.
 *
 * showsMyLocationButton של react-native-maps קיים באנדרואיד בלבד והוא מכובה,
 * ולכן בלי הכפתור הזה אין שום דרך לחזור למיקום אחרי שגוללים. כפתור ולא מרכוז
 * אוטומטי בכל חזרה למסך: מרכוז כפוי מוחק למשתמש את המקום שאליו גלל.
 */
export function RecenterButton({ onPress, disabled = false }: Props) {
  const { font } = useA11y();

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={mapStrings.recenter}
      accessibilityState={{ disabled }}
    >
      <Text style={{ fontSize: font(20) }}>◎</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 56,
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  disabled: { opacity: 0.5 },
});
