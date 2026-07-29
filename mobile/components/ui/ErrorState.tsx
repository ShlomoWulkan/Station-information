import { View, Text, TouchableOpacity } from 'react-native';
import { commonStrings } from '@/constants/strings';
import { useA11y } from '@/hooks/useA11y';
import { styles } from './ErrorState.styles';

interface Props {
  message: string;
  /** כשמועבר, מוצג כפתור "נסה שוב". כשל קבוע כמו 404 לא צריך אותו. */
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  const { font } = useA11y();

  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={[styles.message, { fontSize: font(14) }]}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry} accessibilityRole="button">
          <Text style={[styles.retryText, { fontSize: font(13) }]}>{commonStrings.retry}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
