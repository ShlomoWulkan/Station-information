import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StationRow } from '@/components/StationRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { favoritesStrings } from '@/constants/strings';
import { colors, spacing } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';
import { useFavorites } from '@/store/favoritesStore';

export default function FavoritesScreen() {
  const favorites = useFavorites((s) => s.favorites);
  const { font, c } = useA11y();

  return (
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <Text style={[styles.title, { fontSize: font(22), color: c.text }]}>
          {favoritesStrings.title}
        </Text>

        {/* FlatList ולא ScrollView: מספר המועדפים אינו חסום. */}
        <FlatList
          data={favorites}
          keyExtractor={(station) => station.id}
          renderItem={({ item }) => <StationRow station={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="⭐"
              title={favoritesStrings.emptyTitle}
              subtitle={favoritesStrings.emptySubtitle}
            />
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: colors.bg },
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  title: {
    fontWeight: '900',
    textAlign: 'right',
    paddingTop: spacing.lg,
    marginBottom: spacing.lg,
  },
});
