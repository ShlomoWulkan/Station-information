import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { commonStrings, stationStrings } from '@/constants/strings';
import { useA11y } from '@/hooks/useA11y';
import type { RouteStop } from '@/types';
import { styles } from './StopRow.styles';

interface Props {
  stop: RouteStop;
  isCurrent: boolean;
  isLast: boolean;
}

/** תחנה אחת בציר המסלול, עם הקו האנכי שמחבר אותה לבאה. */
export const StopRow = memo(function StopRow({ stop, isCurrent, isLast }: Props) {
  const { font, c } = useA11y();

  const open = () =>
    router.push({
      pathname: '/station/[code]',
      params: {
        code: stop.code,
        name: stop.name,
        lat: String(stop.lat),
        lon: String(stop.lon),
      },
    });

  return (
    <TouchableOpacity
      style={styles.row}
      onPress={open}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${stop.name}, ${commonStrings.stationLabel(stop.code)}`}
    >
      <View style={styles.lineCol}>
        <View style={[styles.dot, isCurrent && styles.dotCurrent]} />
        {!isLast && <View style={[styles.vertLine, isCurrent && styles.vertLineCurrent]} />}
      </View>

      <View style={[styles.content, isCurrent && styles.contentCurrent]}>
        <Text
          style={[styles.name, { fontSize: font(14) }, isCurrent && styles.nameCurrent]}
          numberOfLines={1}
        >
          {stop.name}
        </Text>
        <Text style={[styles.code, { fontSize: font(11), color: c.textSub }]}>
          {commonStrings.stationLabel(stop.code)}
        </Text>
      </View>

      {isCurrent && (
        <View style={styles.hereBadge}>
          <Text style={[styles.hereText, { fontSize: font(11) }]}>
            {stationStrings.hereBadge}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
});
