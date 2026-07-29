import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { stationStrings } from '@/constants/strings';
import { useA11y } from '@/hooks/useA11y';
import type { StationRoute } from '@/types';
import { styles } from './RouteRow.styles';

interface Props {
  route: StationRoute;
  stationCode: string;
}

export function RouteRow({ route, stationCode }: Props) {
  const { font, c } = useA11y();

  const openRouteStops = () =>
    router.push({
      pathname: '/route/[lineNumber]',
      params: { lineNumber: route.lineNumber, stationCode },
    });

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={openRouteStops}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={stationStrings.routeLabel(route.lineNumber, route.destination)}
    >
      <View style={[styles.badge, { minWidth: font(44), height: font(32) }]}>
        <Text style={[styles.number, { fontSize: font(14) }]}>{route.lineNumber}</Text>
      </View>
      <Text style={[styles.destination, { fontSize: font(14), color: c.text }]}>
        {route.destination}
      </Text>
      <Text style={[styles.arrow, { fontSize: font(18) }]}>‹</Text>
    </TouchableOpacity>
  );
}
