import { View, Text, TouchableOpacity } from 'react-native';
import { commonStrings, mapStrings } from '@/constants/strings';
import { useA11y } from '@/hooks/useA11y';
import type { LocatedStation } from '@/types';
import { styles } from './StationPopup.styles';

interface Props {
  station: LocatedStation;
  onOpen: (station: LocatedStation) => void;
  onDismiss: () => void;
}

export function StationPopup({ station, onOpen, onDismiss }: Props) {
  const { font } = useA11y();

  return (
    <>
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel={mapStrings.closePopup}
      >
        <Text style={[styles.closeText, { fontSize: font(14) }]}>✕</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.popup}
        onPress={() => onOpen(station)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`${station.name}. ${mapStrings.tapForArrivals}`}
      >
        <Text style={[styles.arrow, { fontSize: font(22) }]}>›</Text>
        <View style={styles.info}>
          <Text style={[styles.name, { fontSize: font(16) }]}>{station.name}</Text>
          <Text style={[styles.code, { fontSize: font(12) }]}>
            {commonStrings.stationLabel(station.code)}
          </Text>
          <Text style={[styles.hint, { fontSize: font(11) }]}>{mapStrings.tapForArrivals}</Text>
        </View>
        <Text style={{ fontSize: font(30) }}>🚌</Text>
      </TouchableOpacity>
    </>
  );
}
