import { TouchableOpacity, View, Text, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { useFavorites } from '@/store/favoritesStore';
import { colors, spacing, radius } from '@/constants/theme';
import type { Station } from '@/types';

interface Props {
  station: Station;
  onDelete?: () => void;
}

export function StationRow({ station, onDelete }: Props) {
  const { isFavorite, add, remove } = useFavorites();
  const fav = isFavorite(station.id);

  const onPress = () =>
    router.push({
      pathname: '/station/[code]',
      params: { code: station.code, name: station.name, lat: station.lat, lon: station.lon },
    });

  const toggleFav = () => (fav ? remove(station.id) : add(station));

  const confirmDelete = () =>
    Alert.alert('מחיקה', `להסיר את "${station.name}" מהחיפושים האחרונים?`, [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: onDelete },
    ]);

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {onDelete ? (
        <>
          <Text style={styles.arrow}>›</Text>
          <TouchableOpacity onPress={confirmDelete} style={styles.deleteBtn} hitSlop={8}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
          <View style={styles.infoLeft}>
            <Text style={styles.name}>{station.name}</Text>
            <Text style={styles.code}>תחנה {station.code}</Text>
          </View>
        </>
      ) : (
        <>
          <Text style={styles.arrow}>›</Text>
          <View style={styles.info}>
            <Text style={styles.name}>{station.name}</Text>
            <Text style={styles.code}>תחנה {station.code}</Text>
            {station.distance !== undefined && (
              <Text style={styles.distance}>{station.distance} מטר</Text>
            )}
          </View>
          <TouchableOpacity onPress={toggleFav} style={styles.favBtn} hitSlop={8}>
            <Text style={[styles.favIcon, fav && styles.favIconActive]}>{fav ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  arrow: { fontSize: 20, color: colors.accent, marginLeft: spacing.xs },
  info: { flex: 1, alignItems: 'flex-end' },
  name: { fontSize: 15, fontWeight: '800', color: colors.text },
  code: { fontSize: 11, color: colors.textSub, marginTop: 2 },
  distance: { fontSize: 11, color: colors.accent, marginTop: 2 },
  favBtn: { padding: spacing.xs, marginRight: spacing.xs },
  favIcon: { fontSize: 22, color: 'rgba(255,255,255,0.5)' },
  favIconActive: { color: '#facc15' },
  infoLeft: { flex: 1, alignItems: 'flex-end' },
  deleteBtn: { padding: spacing.xs, marginHorizontal: spacing.md, alignSelf: 'center' },
  deleteIcon: { fontSize: 20 },
});
