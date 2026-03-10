import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/constants/theme';

export default function SearchNumberScreen() {
  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>🔢 חיפוש לפי מספר תחנה</Text>
        <Text style={styles.sub}>הקלד מספר תחנה לצפייה בזמני הגעה</Text>
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
