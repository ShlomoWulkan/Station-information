import { View, Text, TouchableOpacity } from 'react-native';
import { stationStrings } from '@/constants/strings';
import { useA11y } from '@/hooks/useA11y';
import { styles } from './StationTabs.styles';

export type StationTab = 'arrivals' | 'routes';

interface Props {
  active: StationTab;
  onChange: (tab: StationTab) => void;
}

/** קווים מימין, זמני הגעה משמאל — סדר RTL. */
const TABS: { key: StationTab; label: string }[] = [
  { key: 'routes', label: stationStrings.tabs.routes },
  { key: 'arrivals', label: stationStrings.tabs.arrivals },
];

export function StationTabs({ active, onChange }: Props) {
  const { font } = useA11y();

  return (
    <View style={styles.switch} accessibilityRole="tablist">
      {TABS.map(({ key, label }) => {
        const selected = active === key;
        return (
          <TouchableOpacity
            key={key}
            style={[styles.btn, selected && styles.btnActive]}
            onPress={() => onChange(key)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text
              style={[styles.text, { fontSize: font(13) }, selected && styles.textActive]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
