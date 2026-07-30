import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { commonStrings, errorStrings } from '@/constants/strings';
import { colors, radius, spacing } from '@/constants/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * תופס חריגות רינדור.
 *
 * בלי זה חריגה בכל קומפוננטה מותירה מסך לבן בלי הסבר ובלי דרך לצאת ממנו.
 * חייב להיות class — אין מקבילה ב-hooks.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[ErrorBoundary]', error.message, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.icon}>🚏</Text>
        <Text style={styles.message}>{errorStrings.generic}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => this.setState({ hasError: false })}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>{commonStrings.retry}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
  },
  icon: { fontSize: 44 },
  message: { color: colors.text, fontSize: 15, textAlign: 'center' },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  buttonText: { color: colors.onAccent, fontWeight: '800', fontSize: 14 },
});
