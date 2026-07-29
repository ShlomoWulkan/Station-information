import { useEffect, useState } from 'react';

interface Options {
  intervalMs: number;
  enabled?: boolean;
}

/**
 * מאלץ רינדור מחדש במרווחים קבועים.
 *
 * לתצוגות שנגזרות מהשעון הנוכחי ("עודכן לפני 12 שניות") — הנתון לא משתנה, רק
 * מה שמחשבים ממנו. מחזיר את מספר הפעימות למי שצריך לתלות בו.
 */
export function useTicker({ intervalMs, enabled = true }: Options): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => setTick((n) => n + 1), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, enabled]);

  return tick;
}
