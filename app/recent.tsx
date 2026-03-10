import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

export default function RecentScreen() {
  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>🕐 חיפושים אחרונים</Text>
        <Text style={styles.sub}>התחנות שחיפשת לאחרונה יופיעו כאן</Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'right' },
  sub: { fontSize: 13, color: colors.textSub, marginTop: 8, textAlign: 'right' },
});
