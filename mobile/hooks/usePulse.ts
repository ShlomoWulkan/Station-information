import { useEffect, useState } from 'react';
import { Animated } from 'react-native';
import { useAccessibility } from '@/store/accessibilityStore';

interface Options {
  enabled?: boolean;
  minOpacity?: number;
  durationMs?: number;
}

/**
 * אנימציית הבהוב חוזרת, כבויה כשהמשתמש ביקש הפחתת תנועה.
 *
 * שומר את ה-CompositeAnimation ב-ref כי `value.stopAnimation()` לא עוצר את
 * ה-loop עצמו — רק את הצעד הנוכחי, וההבהוב ממשיך אחרי unmount.
 */
export function usePulse({
  enabled = true,
  minOpacity = 0.3,
  durationMs = 750,
}: Options = {}): Animated.Value {
  const reduceMotion = useAccessibility((s) => s.reduceMotion);
  // useState עם initializer ולא useRef().current: קריאת ref בזמן רינדור אינה
  // חוקית, ו-initializer מבטיח שה-Value נוצר פעם אחת בלבד.
  const [opacity] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!enabled || reduceMotion) {
      opacity.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: minOpacity,
          duration: durationMs,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, { toValue: 1, duration: durationMs, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [enabled, reduceMotion, minOpacity, durationMs, opacity]);

  return opacity;
}
