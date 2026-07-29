import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { commonStrings, stationStrings } from '@/constants/strings';
import { useA11y } from '@/hooks/useA11y';
import { useFavorites } from '@/store/favoritesStore';
import type { Station } from '@/types';
import { styles } from './StationHeader.styles';

interface Props {
  station: Station;
}

export function StationHeader({ station }: Props) {
  const { font, c } = useA11y();

  // סלקטור ממוקד — מנוי לכל ה-store היה מרנדר כל שורה בכל רשימה על כל שינוי.
  const isFavorite = useFavorites((s) => s.favorites.some((f) => f.id === station.id));
  const add = useFavorites((s) => s.add);
  const remove = useFavorites((s) => s.remove);

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.closeBtn}
        accessibilityRole="button"
        accessibilityLabel={commonStrings.close}
      >
        <Text style={[styles.closeText, { fontSize: font(16) }]}>✕</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.name, { fontSize: font(18), color: c.text }]}>{station.name}</Text>
        <Text style={[styles.code, { fontSize: font(12), color: c.textSub }]}>
          {commonStrings.stationLabel(station.code)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => (isFavorite ? remove(station.id) : add(station))}
        style={styles.favBtn}
        accessibilityRole="button"
        accessibilityLabel={
          isFavorite ? stationStrings.removeFavorite : stationStrings.addFavorite
        }
        accessibilityState={{ selected: isFavorite }}
      >
        <Text style={{ fontSize: font(24) }}>{isFavorite ? '⭐' : '☆'}</Text>
      </TouchableOpacity>
    </View>
  );
}
