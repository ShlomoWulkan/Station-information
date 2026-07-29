import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useFocusEffect } from 'expo-router';

interface Options {
  intervalMs: number;
  enabled?: boolean;
}

/**
 * מרענן נתונים כל עוד המסך בפוקוס והאפליקציה בחזית.
 *
 * שלושה טריגרים, וכל אחד מהם נחוץ:
 *  - interval — הנתון מזדקן גם כשלא נוגעים במסך.
 *  - חזרה מרקע — טלפון בכיס חוזר עם נתון בן שעה. בלי זה, המסך מציג זמנים
 *    שעבר זמנם ברגע שמוציאים את הטלפון, שזה בדיוק הרגע שמסתכלים בו.
 *  - חזרה לפוקוס — ניווט הלוך-חזור לא צריך להשאיר נתון ישן.
 *
 * הטיימר נעצר ברקע ומחוץ לפוקוס, כדי לא לרוקן סוללה ולא להציף את השרת.
 */
export function useAutoRefresh(refresh: () => void, { intervalMs, enabled = true }: Options) {
  // ב-ref כדי שהמנוי לא ייבנה מחדש בכל רינדור של הקורא.
  const refreshRef = useRef(refresh);
  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  // הפוקוס הראשון הוא ה-mount, שבו הקורא כבר טוען בעצמו.
  const isFirstFocus = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      let timer: ReturnType<typeof setInterval> | null = null;

      const start = () => {
        if (timer === null) timer = setInterval(() => refreshRef.current(), intervalMs);
      };
      const stop = () => {
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      };

      if (isFirstFocus.current) {
        isFirstFocus.current = false;
      } else {
        refreshRef.current();
      }
      start();

      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          refreshRef.current();
          start();
        } else {
          stop();
        }
      });

      return () => {
        stop();
        sub.remove();
      };
    }, [enabled, intervalMs]),
  );
}
