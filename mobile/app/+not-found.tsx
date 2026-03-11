import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'לא נמצא' }} />
      <View style={styles.container}>
        <Text style={styles.title}>דף זה לא קיים</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>חזור לדף הבית</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  title: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  link: { marginTop: spacing.md },
  linkText: { fontSize: 14, color: colors.accent },
});
