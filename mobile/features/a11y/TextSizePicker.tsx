import { View, Text, TouchableOpacity } from 'react-native';
import { a11yStrings } from '@/constants/strings';
import { useAccessibility, type TextScale } from '@/store/accessibilityStore';
import { styles } from './TextSizePicker.styles';

const SIZES: { label: string; value: TextScale }[] = [
  { label: a11yStrings.sizes.normal, value: 1 },
  { label: a11yStrings.sizes.large, value: 1.2 },
  { label: a11yStrings.sizes.xlarge, value: 1.5 },
];

export function TextSizePicker() {
  const textScale = useAccessibility((s) => s.textScale);
  const setTextScale = useAccessibility((s) => s.setTextScale);

  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {SIZES.map(({ label, value }) => {
        const checked = textScale === value;
        return (
          <TouchableOpacity
            key={value}
            style={[styles.btn, checked && styles.btnActive]}
            onPress={() => void setTextScale(value)}
            accessibilityRole="radio"
            accessibilityState={{ checked }}
            accessibilityLabel={a11yStrings.textSizeLabel(label)}
          >
            {/* הכפתור מציג את הגודל שהוא מייצג — לא את הגודל הפעיל */}
            <Text style={[styles.text, { fontSize: 13 * value }, checked && styles.textActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
