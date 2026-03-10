import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Station, BusArrival } from '@/types';
import { BusArrivalRow } from './BusArrivalRow';
import { colors, spacing, radius } from '@/constants/theme';
import { useFavorites } from '@/store/favoritesStore';

interface Props {
  station: Station;
  arrivals: BusArrival[];
}

export function StationCard({ station, arrivals }: Props) {
  const { isFavorite, add, remove } = useFavorites();
  const fav = isFavorite(station.id);

  const toggleFav = () => fav ? remove(station.id) : add(station);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.name}>{station.name}</Text>
          <Text style={styles.code}>תחנה {station.code}</Text>
          {station.distance !== undefined && (
            <Text style={styles.distance}>{station.distance} מטר</Text>
          )}
        </View>
        <TouchableOpacity onPress={toggleFav} style={styles.favBtn}>
          <Text style={styles.favIcon}>{fav ? '⭐' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      {arrivals.length === 0 ? (
        <Text style={styles.empty}>אין נסיעות קרובות</Text>
      ) : (
        arrivals.map((a, i) => <BusArrivalRow key={i} arrival={a} />)
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  headerLeft: { flex: 1 },
  name: { fontSize: 15, fontWeight: '800', color: colors.text, textAlign: 'right' },
  code: { fontSize: 11, color: colors.textSub, marginTop: 2, textAlign: 'right' },
  distance: { fontSize: 11, color: colors.accent, marginTop: 2, textAlign: 'right' },
  favBtn: { padding: spacing.xs },
  favIcon: { fontSize: 22 },
  empty: { color: colors.textSub, fontSize: 13, textAlign: 'center', paddingVertical: spacing.md },
});
