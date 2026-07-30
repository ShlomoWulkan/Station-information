import { useEffect, useState } from 'react';

type Listener = (now: number) => void;

interface Clock {
  now: number;
  timer: ReturnType<typeof setInterval> | null;
  listeners: Set<Listener>;
}

/**
 * שעון אחד לכל מרווח, משותף לכל הצרכנים.
 *
 * בלעדיו כל שורה יצרה setInterval משלה — בתחנה עמוסה זה 76 טיימרים שכל אחד
 * מפעיל setState כל דקה, ו-memo על השורה לא עוזר כי ה-state הוא שלה עצמה.
 */
const clocks = new Map<number, Clock>();

function clockFor(intervalMs: number): Clock {
  let clock = clocks.get(intervalMs);
  if (!clock) {
    clock = { now: Date.now(), timer: null, listeners: new Set() };
    clocks.set(intervalMs, clock);
  }
  return clock;
}

function subscribe(intervalMs: number, listener: Listener): () => void {
  const clock = clockFor(intervalMs);
  clock.listeners.add(listener);

  // המנוי הראשון מפעיל את הטיימר.
  if (clock.timer === null) {
    clock.timer = setInterval(() => {
      clock.now = Date.now();
      clock.listeners.forEach((notify) => notify(clock.now));
    }, intervalMs);
  }

  return () => {
    clock.listeners.delete(listener);
    // האחרון שיוצא מכבה, אחרת הטיימר ממשיך לרוץ על מסך שנסגר.
    if (clock.listeners.size === 0 && clock.timer !== null) {
      clearInterval(clock.timer);
      clock.timer = null;
    }
  };
}

interface Options {
  intervalMs: number;
  enabled?: boolean;
}

/**
 * חותמת הזמן הנוכחית, מתעדכנת במרווחים קבועים.
 *
 * לתצוגות שנגזרות מהשעון ("עודכן לפני 12 שניות", ספירה לאחור): הנתון עצמו לא
 * משתנה, רק מה שמחשבים ממנו. מחזיק את הזמן ב-state ולא קורא ל-Date.now() בזמן
 * רינדור, שהיא קריאה לא טהורה.
 */
export function useNow({ intervalMs, enabled = true }: Options): number {
  const [now, setNow] = useState(() => clockFor(intervalMs).now);

  useEffect(() => {
    if (!enabled) return;
    return subscribe(intervalMs, setNow);
  }, [intervalMs, enabled]);

  return now;
}

/** לבדיקות בלבד — מאפס את כל השעונים. */
export function __resetClocks(): void {
  clocks.forEach((clock) => clock.timer !== null && clearInterval(clock.timer));
  clocks.clear();
}
