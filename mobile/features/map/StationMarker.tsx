import { memo } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { commonStrings } from '@/constants/strings';
import type { LocatedStation } from '@/types';

interface Props {
  station: LocatedStation;
  onPress: (station: LocatedStation) => void;
}

/**
 * סמן תחנה בודד.
 *
 * memo ו-tracksViewChanges=false יחד — בלעדיהם כל שינוי state במסך מצייר מחדש
 * את כל הסמנים, ובמרכז עיר יש מאות.
 */
export const StationMarker = memo(function StationMarker({ station, onPress }: Props) {
  return (
    <Marker
      coordinate={{ latitude: station.lat, longitude: station.lon }}
      tracksViewChanges={false}
      onPress={() => onPress(station)}
      accessibilityLabel={`${station.name}, ${commonStrings.stationLabel(station.code)}`}
    >
      <Text style={styles.pin}>🚌</Text>
    </Marker>
  );
});

const styles = StyleSheet.create({ pin: { fontSize: 26 } });
