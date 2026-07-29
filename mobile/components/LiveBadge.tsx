import { View, Text, Animated } from 'react-native';
import { ARRIVALS_STALE_MS } from '@/constants/config';
import { stationStrings } from '@/constants/strings';
import { colors } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';
import { usePulse } from '@/hooks/usePulse';
import { useTicker } from '@/hooks/useTicker';
import { formatAge } from '@/utils/time';
import { styles } from './LiveBadge.styles';

export type LiveState = 'live' | 'stale' | 'offline';

interface Props {
  /**
   * חובה. התג הזה הצהיר בעבר "עדכון בזמן אמת" בכל מקום שרנדר אותו, כולל מסכים
   * שלא הציגו נתון חי בכלל. הצהרת טריות היא טענה, ולכן היא נדרשת במפורש.
   */
  state: LiveState;
  /** חותמת זמן של הנתון האחרון. כשמועברת, הגיל מוצג לצד התג. */
  updatedAt?: number | null;
}

const DOT_COLOR: Record<LiveState, string> = {
  live: colors.liveDot,
  stale: colors.warning,
  offline: colors.error,
};

/** גוזר את מצב התג מגיל הנתון, במקום להצהיר "חי" בלי קשר למציאות. */
export function liveStateFor(updatedAt: number | null, failed: boolean): LiveState {
  if (failed || updatedAt === null) return 'offline';
  return Date.now() - updatedAt > ARRIVALS_STALE_MS ? 'stale' : 'live';
}

export function LiveBadge({ state, updatedAt }: Props) {
  const { font } = useA11y();
  const opacity = usePulse({ enabled: state === 'live' });

  // מרנדר מחדש כדי שהגיל המוצג יזוז עם הזמן.
  useTicker({ intervalMs: 10_000, enabled: updatedAt != null });

  const age = updatedAt != null ? formatAge(Date.now() - updatedAt) : null;
  const label = stationStrings.live[state];

  return (
    <View
      style={[styles.badge, state !== 'live' && styles.badgeMuted]}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={age ? `${label}. ${age}` : label}
    >
      <Animated.View style={[styles.dot, { opacity, backgroundColor: DOT_COLOR[state] }]} />
      <Text style={[styles.text, { fontSize: font(10) }]}>
        {label}
        {age ? ` · ${age}` : ''}
      </Text>
    </View>
  );
}
