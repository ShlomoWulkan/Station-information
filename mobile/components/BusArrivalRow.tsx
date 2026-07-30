import { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { stationStrings } from '@/constants/strings';
import { useA11y } from '@/hooks/useA11y';
import { useNow } from '@/hooks/useNow';
import type { BusArrival } from '@/types';
import { styles } from './BusArrivalRow.styles';

interface Props {
  arrival: BusArrival;
  currentStationCode?: string;
  /** מתי הנתון התקבל, כדי לגזור כמה זמן עבר מאז. null לפני הטעינה הראשונה. */
  receivedAt: number | null;
}

const MINUTE_MS = 60_000;

export const BusArrivalRow = memo(function BusArrivalRow({
  arrival,
  currentStationCode,
  receivedAt,
}: Props) {
  const { lineNumber, destination, minutesUntilArrival } = arrival;
  const { font, c } = useA11y();

  // נגזר מהשעון ולא מוחזק ב-state: הגרסה הקודמת העתיקה prop ל-state ועדכנה
  // אותו מתוך effect, מה שגורם לרינדורים מדורגים ולסטייה מהנתון האמיתי.
  const now = useNow({ intervalMs: MINUTE_MS });
  const elapsed = receivedAt === null ? 0 : Math.floor((now - receivedAt) / MINUTE_MS);
  const minutes = Math.max(0, minutesUntilArrival - elapsed);
  const isNow = minutes <= 1;

  const timeLabel = isNow ? stationStrings.now : stationStrings.minutesShort(minutes);

  return (
    <View style={[styles.row, { paddingVertical: font(8) }]}>
      <View style={[styles.lineBadge, { minWidth: font(36), height: font(28) }]}>
        <Text style={[styles.lineNum, { fontSize: font(13) }]}>{lineNumber}</Text>
      </View>

      <TouchableOpacity
        style={styles.routeBtn}
        onPress={() =>
          router.push({
            pathname: '/route/[lineNumber]',
            params: { lineNumber, stationCode: currentStationCode ?? '' },
          })
        }
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={stationStrings.routeStopsTitle}
      >
        <Text style={[styles.routeBtnIcon, { fontSize: font(14) }]}>🚏</Text>
      </TouchableOpacity>

      <Text
        style={[styles.destination, { fontSize: font(13), color: c.text }]}
        numberOfLines={1}
      >
        {destination}
      </Text>

      <View
        style={[
          styles.timeBadge,
          { borderColor: c.cardBorder, paddingHorizontal: font(10), paddingVertical: font(4) },
          isNow && styles.timeBadgeNow,
        ]}
      >
        <Text style={[styles.timeText, { fontSize: font(12) }, isNow && styles.timeTextNow]}>
          {timeLabel}
        </Text>
      </View>
    </View>
  );
});
