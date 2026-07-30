import { View, Text, Animated } from 'react-native';
import { ARRIVALS_STALE_MS } from '@/constants/config';
import { stationStrings } from '@/constants/strings';
import { colors } from '@/constants/theme';
import { useA11y } from '@/hooks/useA11y';
import { useNow } from '@/hooks/useNow';
import { usePulse } from '@/hooks/usePulse';
import { formatAge } from '@/utils/time';
import { styles } from './LiveBadge.styles';

export type LiveState = 'live' | 'stale' | 'offline';

interface Props {
  /**
   * חותמת זמן של הנתון האחרון, או null אם עוד לא התקבל.
   *
   * התג גוזר את מצבו מכאן ולא מקבל אותו כטענה. בעבר הוא הצהיר "עדכון בזמן
   * אמת" בכל מקום שרנדר אותו, כולל מסך הבית שלא מציג נתון חי בכלל.
   */
  updatedAt: number | null;
  /** הבקשה האחרונה נכשלה. */
  failed: boolean;
}

const DOT_COLOR: Record<LiveState, string> = {
  live: colors.liveDot,
  stale: colors.warning,
  offline: colors.error,
};

/** גוזר את מצב התג מגיל הנתון, במקום להצהיר "חי" בלי קשר למציאות. */
function liveStateFor(updatedAt: number | null, failed: boolean, now: number): LiveState {
  if (failed || updatedAt === null) return 'offline';
  return now - updatedAt > ARRIVALS_STALE_MS ? 'stale' : 'live';
}

export function LiveBadge({ updatedAt, failed }: Props) {
  const { font } = useA11y();

  // הגיל המוצג זז עם הזמן גם כשהנתון עצמו לא משתנה.
  const now = useNow({ intervalMs: 10_000, enabled: updatedAt != null });

  const state = liveStateFor(updatedAt ?? null, failed, now);
  const opacity = usePulse({ enabled: state === 'live' });

  const age = updatedAt != null ? formatAge(now - updatedAt) : null;
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
