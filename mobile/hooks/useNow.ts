import { useEffect, useState } from 'react';

interface Options {
  intervalMs: number;
  enabled?: boolean;
}

/**
 * חותמת הזמן הנוכחית, מתעדכנת במרווחים קבועים.
 *
 * לתצוגות שנגזרות מהשעון ("עודכן לפני 12 שניות", ספירה לאחור): הנתון עצמו לא
 * משתנה, רק מה שמחשבים ממנו. מחזיק את הזמן ב-state ולא קורא ל-Date.now() בזמן
 * רינדור, שהוא קריאה לא טהורה ויכולה להחזיר ערך אחר בכל רינדור מקרי.
 */
export function useNow({ intervalMs, enabled = true }: Options): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;

    // בלי התיישרות מיידית: היא הייתה setState סינכרוני בתוך effect, שגורם
    // לרינדור מדורג. הערך ההתחלתי כבר נכון, והפעימה הראשונה מדביקה את השאר.
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs, enabled]);

  return now;
}
