import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StationRow } from '@/components/StationRow';
import { colors, spacing } from '@/constants/theme';
import { useFavorites } from '@/store/favoritesStore';

export default function FavoritesScreen() {
  const { favorites } = useFavorites();

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>⭐ מועדפים</Text>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {favorites.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyIcon}>⭐</Text>
              <Text style={styles.emptyText}>עדיין אין תחנות מועדפות</Text>
              <Text style={styles.emptySub}>לחץ על ☆ ליד תחנה כדי לשמור אותה</Text>
            </View>
          ) : (
            favorites.map(s => (
              <StationRow key={s.id} station={s} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  title: { fontSize: 22, fontWeight: '900', color: colors.text, textAlign: 'right', paddingTop: spacing.lg, marginBottom: spacing.lg },
  list: { flex: 1 },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: spacing.sm },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  emptySub: { color: colors.textSub, fontSize: 13, textAlign: 'center' },
});
