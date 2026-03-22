import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import type { BusArrival } from '@/types';
import { colors, spacing, radius } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';

interface Props {
  arrival: BusArrival;
  currentStationCode?: string;
}

export function BusArrivalRow({ arrival, currentStationCode }: Props) {
  const { lineNumber, destination, minutesUntilArrival, isRealTime } = arrival;
  const [minutes, setMinutes] = useState(minutesUntilArrival);
  const { font, c } = useA11y();

  useEffect(() => {
    setMinutes(minutesUntilArrival);
    const timer = setInterval(() => setMinutes(m => Math.max(0, m - 1)), 60_000);
    return () => clearInterval(timer);
  }, [minutesUntilArrival]);

  const isNow = minutes <= 1;
  const badgeSize = font(28);

  return (
    <View style={[styles.row, { paddingVertical: font(8) }]}>
      <View style={[styles.lineBadge, { minWidth: font(36), height: badgeSize }]}>
        <Text style={[styles.lineNum, { fontSize: font(13) }]}>{lineNumber}</Text>
      </View>
      <TouchableOpacity
        style={styles.routeBtn}
        onPress={() => router.push({ pathname: '/route/[lineNumber]', params: { lineNumber, stationCode: currentStationCode ?? '' } })}
        activeOpacity={0.7}
      >
        <Text style={styles.routeBtnIcon}>⬡</Text>
      </TouchableOpacity>
      <Text style={[styles.dest, { fontSize: font(13), color: c.text }]} numberOfLines={1}>{destination}</Text>
      {isRealTime && <View style={styles.liveDot} />}
      <View style={[styles.timeBadge, isNow && styles.timeBadgeNow, { borderColor: c.cardBorder, paddingHorizontal: font(10), paddingVertical: font(4) }]}>
        <Text style={[styles.timeText, isNow && styles.timeTextNow, { fontSize: font(12) }]}>
          {isNow ? 'עכשיו' : `${minutes} דק'`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  lineBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    minWidth: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  lineNum: { color: '#000d28', fontSize: 13, fontWeight: '900' },
  dest: { flex: 1, color: colors.text, fontSize: 13, textAlign: 'right' },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: colors.liveDot,
  },
  timeBadge: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  timeBadgeNow: { backgroundColor: 'rgba(74,222,128,0.15)', borderColor: colors.liveDot },
  timeText: { color: colors.accent, fontSize: 12, fontWeight: '700' },
  timeTextNow: { color: colors.liveDot },
  routeBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(96,165,250,0.12)',
    borderWidth: 1, borderColor: 'rgba(96,165,250,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  routeBtnIcon: { fontSize: 14, color: colors.accent },
});
