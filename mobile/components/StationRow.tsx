import { memo } from 'react';
import { TouchableOpacity, View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import { commonStrings, recentStrings, stationStrings } from '@/constants/strings';
import { useA11y } from '@/hooks/useA11y';
import { useFavorites } from '@/store/favoritesStore';
import type { Station } from '@/types';
import { styles } from './StationRow.styles';

interface Props {
  station: Station;
  /** כשמועבר, מוצג כפתור מחיקה במקום כוכב. */
  onDelete?: () => void;
}

export const StationRow = memo(function StationRow({ station, onDelete }: Props) {
  const { font, c } = useA11y();

  // סלקטור ממוקד ולא הרס של כל ה-store: קודם כל לחיצה על כוכב רינדרה מחדש
  // כל שורה בכל רשימה.
  const isFavorite = useFavorites((s) => s.favorites.some((f) => String(f.id) === station.id));
  const add = useFavorites((s) => s.add);
  const remove = useFavorites((s) => s.remove);

  const open = () =>
    router.push({
      pathname: '/station/[code]',
      params: {
        code: station.code,
        name: station.name,
        lat: station.lat === undefined ? '' : String(station.lat),
        lon: station.lon === undefined ? '' : String(station.lon),
      },
    });

  const confirmDelete = () =>
    Alert.alert(recentStrings.removeConfirmTitle, recentStrings.removeConfirmBody(station.name), [
      { text: commonStrings.cancel, style: 'cancel' },
      { text: commonStrings.delete, style: 'destructive', onPress: onDelete },
    ]);

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={open}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${station.name}, ${commonStrings.stationLabel(station.code)}`}
    >
      <Text style={[styles.arrow, { fontSize: font(20) }]}>›</Text>

      {onDelete && (
        <TouchableOpacity
          onPress={confirmDelete}
          style={styles.deleteBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={commonStrings.delete}
        >
          <Text style={{ fontSize: font(20) }}>🗑</Text>
        </TouchableOpacity>
      )}

      <View style={styles.info}>
        <Text style={[styles.name, { fontSize: font(15), color: c.text }]}>{station.name}</Text>
        <Text style={[styles.code, { fontSize: font(11), color: c.textSub }]}>
          {commonStrings.stationLabel(station.code)}
        </Text>
        {station.distance !== undefined && (
          <Text style={[styles.distance, { fontSize: font(11) }]}>
            {commonStrings.distanceMeters(station.distance)}
          </Text>
        )}
      </View>

      {!onDelete && (
        <TouchableOpacity
          onPress={() => (isFavorite ? remove(station.id) : add(station))}
          style={styles.iconBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={
            isFavorite ? stationStrings.removeFavorite : stationStrings.addFavorite
          }
          accessibilityState={{ selected: isFavorite }}
        >
          <Text
            style={[
              styles.favIcon,
              { fontSize: font(22) },
              isFavorite && styles.favIconActive,
            ]}
          >
            {isFavorite ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
});
